const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Notification = require('../models/Notification');
const whatsappService = require('../services/whatsappService');

let mongoServer;
let adminToken;
let studentToken;
let studentUser;
let testExam;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      arch: 'x64',
      version: '7.0.14',
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create Admin
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin Test',
      email: 'admin.test@example.com',
      password: 'Password@123',
      role: 'admin',
    });
  adminToken = adminRes.body.token;

  // Create Student
  const studentRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Rahul Test',
      email: 'rahul.test@example.com',
      password: 'Password@123',
      role: 'student',
      studentId: 'STU999',
    });
  studentToken = studentRes.body.token;
  studentUser = studentRes.body.user;

  // Create Exam: 4 questions, 25 marks each = 100 marks total. Passing marks = 40.
  const examRes = await request(app)
    .post('/api/exams')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Python Test Exam',
      subjectName: 'Python Basics',
      durationMinutes: 10,
      totalMarks: 100,
      passingMarks: 40,
      status: 'published',
      allowRetake: true,
      questions: [
        {
          questionText: 'Q1',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          marks: 25,
          explanation: 'Ans is A',
        },
        {
          questionText: 'Q2',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 1,
          marks: 25,
          explanation: 'Ans is B',
        },
        {
          questionText: 'Q3',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 2,
          marks: 25,
          explanation: 'Ans is C',
        },
        {
          questionText: 'Q4',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 3,
          marks: 25,
          explanation: 'Ans is D',
        },
      ],
    });
  testExam = examRes.body.exam;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('1. Exam Scoring and Pass/Fail Decisions', () => {
  it('should mark score as FAIL when score is below passing marks (25/100 < 40)', async () => {
    // Rahul answers only Q1 correctly (25 marks), fails exam
    const res = await request(app)
      .post(`/api/exams/${testExam._id}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: [
          { questionIndex: 0, selectedOption: 0 }, // Correct (25 pts)
          { questionIndex: 1, selectedOption: 0 }, // Wrong (0 pts)
          { questionIndex: 2, selectedOption: 0 }, // Wrong (0 pts)
          { questionIndex: 3, selectedOption: 0 }, // Wrong (0 pts)
        ],
        timeSpentSeconds: 120,
      });

    expect(res.status).toBe(201);
    expect(res.body.attempt.marksObtained).toBe(25);
    expect(res.body.attempt.totalMarks).toBe(100);
    expect(res.body.attempt.percentage).toBe(25);
    expect(res.body.attempt.result).toBe('FAIL');
  });

  it('should mark score as PASS when score meets or exceeds passing marks (50/100 >= 40)', async () => {
    // Rahul answers Q1 and Q2 correctly (50 marks), passes exam
    const res = await request(app)
      .post(`/api/exams/${testExam._id}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: [
          { questionIndex: 0, selectedOption: 0 }, // Correct (25 pts)
          { questionIndex: 1, selectedOption: 1 }, // Correct (25 pts)
          { questionIndex: 2, selectedOption: 0 }, // Wrong (0 pts)
          { questionIndex: 3, selectedOption: 0 }, // Wrong (0 pts)
        ],
        timeSpentSeconds: 180,
      });

    expect(res.status).toBe(201);
    expect(res.body.attempt.marksObtained).toBe(50);
    expect(res.body.attempt.percentage).toBe(50);
    expect(res.body.attempt.result).toBe('PASS');
  });
});

describe('2. Security & Role Permissions', () => {
  it('should NEVER expose correctAnswer or explanation to a student taking the exam', async () => {
    const res = await request(app)
      .get(`/api/exams/${testExam._id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.exam.questions[0].correctAnswer).toBeUndefined();
    expect(res.body.exam.questions[0].explanation).toBeUndefined();
    expect(res.body.exam.questions[0].questionText).toBe('Q1');
  });

  it('should allow admin to view full exam with correctAnswer and explanation', async () => {
    const res = await request(app)
      .get(`/api/exams/${testExam._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.exam.questions[0].correctAnswer).toBe(0);
    expect(res.body.exam.questions[0].explanation).toBe('Ans is A');
  });

  it('should reject student from creating an exam (role enforcement)', async () => {
    const res = await request(app)
      .post('/api/exams')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Exam',
        subjectName: 'Test',
        durationMinutes: 10,
        totalMarks: 10,
        passingMarks: 5,
        questions: [{ questionText: 'Q', options: ['A', 'B'], correctAnswer: 0 }],
      });

    expect(res.status).toBe(403);
  });
});

describe('3. WhatsApp Failure Notification & Deduplication', () => {
  it('should automatically record a failure alert when exam result is FAIL', async () => {
    // Find Rahul's failed attempt
    const failedAttempt = await ExamAttempt.findOne({
      student: studentUser._id,
      result: 'FAIL',
    });

    expect(failedAttempt).not.toBeNull();

    // Check notification log
    const notification = await Notification.findOne({
      examAttempt: failedAttempt._id,
      messageType: 'WHATSAPP_FAILURE_ALERT',
    });

    expect(notification).not.toBeNull();
    expect(notification.recipient).toBe('+91 6305497264');
    expect(notification.messageBody).toContain('⚠️ STUDENT EXAM ALERT');
    expect(notification.messageBody).toContain('Result: FAIL');
  });

  it('should NOT trigger notification when exam result is PASS', async () => {
    const passedAttempt = await ExamAttempt.findOne({
      student: studentUser._id,
      result: 'PASS',
    });

    expect(passedAttempt).not.toBeNull();

    const notifyResult = await whatsappService.sendExamFailureAlert({
      student: studentUser,
      exam: testExam,
      attempt: passedAttempt,
    });

    expect(notifyResult.skipped).toBe(true);
    expect(notifyResult.reason).toContain('Student passed');
  });

  it('should prevent duplicate notifications for the same failed exam attempt', async () => {
    const failedAttempt = await ExamAttempt.findOne({
      student: studentUser._id,
      result: 'FAIL',
    });

    // Artificially simulate existing sent notification
    await Notification.create({
      student: studentUser._id,
      studentName: 'Rahul Test',
      studentId: 'STU999',
      examAttempt: failedAttempt._id,
      examTitle: testExam.title,
      recipient: '+91 6305497264',
      messageType: 'WHATSAPP_FAILURE_ALERT',
      messageBody: 'Alert text',
      status: 'SENT',
    });

    // Attempt to trigger again
    const dedupeResult = await whatsappService.sendExamFailureAlert({
      student: studentUser,
      exam: testExam,
      attempt: failedAttempt,
    });

    expect(dedupeResult.skipped).toBe(true);
    expect(dedupeResult.reason).toContain('already sent or pending');
  });
});
