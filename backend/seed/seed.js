const User = require('../models/User');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Notification = require('../models/Notification');

const seedInitialData = async () => {
  console.log('[Seed] Populating initial dataset...');

  // 1. Admin
  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '+91 9876543210',
  });

  // 2. Teacher
  const teacher = await User.create({
    name: 'Prof. Sharma',
    email: 'teacher@example.com',
    password: 'Teacher@123',
    role: 'teacher',
    classGrade: 'Grade 10',
    phone: '+91 9876543211',
  });

  // 3. Students
  const studentRahul = await User.create({
    name: 'Rahul',
    email: 'student1@example.com',
    password: 'Student@123',
    role: 'student',
    studentId: 'STU102',
    classGrade: 'Grade 10',
    phone: '+91 6305497264',
  });

  const studentPriya = await User.create({
    name: 'Priya Patel',
    email: 'student2@example.com',
    password: 'Student@123',
    role: 'student',
    studentId: 'STU103',
    classGrade: 'Grade 10',
    phone: '+91 9876543213',
  });

  const studentAmit = await User.create({
    name: 'Amit Kumar',
    email: 'student3@example.com',
    password: 'Student@123',
    role: 'student',
    studentId: 'STU104',
    classGrade: 'Grade 10',
    phone: '+91 9876543214',
  });

  // Subjects
  const subjPython = await Subject.create({
    name: 'Python Basics',
    code: 'CS101',
    classGrade: 'Grade 10',
    teacher: teacher._id,
    description: 'Foundations of Python programming, control flow, functions, and data structures.',
  });

  const subjMath = await Subject.create({
    name: 'Mathematics',
    code: 'MTH101',
    classGrade: 'Grade 10',
    teacher: teacher._id,
    description: 'Algebra, Geometry, and Trigonometric concepts for secondary school.',
  });

  const subjDSA = await Subject.create({
    name: 'Data Structures',
    code: 'CS201',
    classGrade: 'Grade 10',
    teacher: teacher._id,
    description: 'Arrays, Linked Lists, Stacks, Queues, and Trees fundamentals.',
  });

  // Exams
  const examPython = await Exam.create({
    title: 'Python Basics Examination',
    subject: subjPython._id,
    subjectName: 'Python Basics',
    classGrade: 'Grade 10',
    description: 'Comprehensive test covering syntax, loops, data types, and functions in Python.',
    durationMinutes: 15,
    totalMarks: 100,
    passingMarks: 40,
    scheduleStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    scheduleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'published',
    allowRetake: true,
    createdBy: teacher._id,
    questions: [
      {
        questionText: 'Which keyword is used to define a function in Python?',
        options: ['func', 'def', 'function', 'define'],
        correctAnswer: 1, // def
        marks: 25,
        explanation: 'In Python, the `def` keyword introduces a function definition.',
      },
      {
        questionText: 'What is the output of `type([])` in Python?',
        options: ['<class "tuple">', '<class "set">', '<class "list">', '<class "dict">'],
        correctAnswer: 2, // list
        marks: 25,
        explanation: 'Square brackets `[]` create a mutable sequence list in Python.',
      },
      {
        questionText: 'Which operator is used for exponentiation (power) in Python?',
        options: ['^', '**', '^^', 'pow'],
        correctAnswer: 1, // **
        marks: 25,
        explanation: 'The double asterisk `**` operator raises a number to the power of an exponent.',
      },
      {
        questionText: 'Is Python an interpreted or compiled language?',
        options: ['Strictly compiled only', 'Interpreted language', 'Machine code only', 'Assembly based'],
        correctAnswer: 1, // Interpreted
        marks: 25,
        explanation: 'Python is an interpreted, high-level, general-purpose programming language.',
      },
    ],
  });

  const examMath = await Exam.create({
    title: 'Mathematics Midterm Assessment',
    subject: subjMath._id,
    subjectName: 'Mathematics',
    classGrade: 'Grade 10',
    description: 'Midterm evaluation of quadratic equations, AP, and trigonometry.',
    durationMinutes: 20,
    totalMarks: 50,
    passingMarks: 20,
    scheduleStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    scheduleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'published',
    allowRetake: true,
    createdBy: teacher._id,
    questions: [
      {
        questionText: 'What is the discriminant of a quadratic equation ax² + bx + c = 0?',
        options: ['b² - 4ac', '4ac - b²', 'b² + 4ac', '2b - 4ac'],
        correctAnswer: 0,
        marks: 10,
        explanation: 'The discriminant formula is D = b² - 4ac.',
      },
      {
        questionText: 'If the roots of ax² + bx + c = 0 are equal, what is the value of the discriminant?',
        options: ['D > 0', 'D = 0', 'D < 0', 'D = 1'],
        correctAnswer: 1,
        marks: 10,
        explanation: 'When D = 0, the equation has real and equal roots.',
      },
      {
        questionText: 'What is the sum of the first n natural numbers?',
        options: ['n(n+1)/2', 'n(n-1)/2', 'n²', '2n + 1'],
        correctAnswer: 0,
        marks: 10,
        explanation: 'Sum S_n = n(n + 1) / 2.',
      },
      {
        questionText: 'What is the 10th term of an AP with first term a = 2 and common difference d = 3?',
        options: ['27', '29', '31', '33'],
        correctAnswer: 1,
        marks: 10,
        explanation: 'T_10 = a + (10 - 1)d = 2 + 9(3) = 29.',
      },
      {
        questionText: 'What is the value of sin(90°)?',
        options: ['0', '1/2', '1', 'Undefined'],
        correctAnswer: 2,
        marks: 10,
        explanation: 'sin(90°) = 1.',
      },
    ],
  });

  const examDSA = await Exam.create({
    title: 'Data Structures Foundation Test',
    subject: subjDSA._id,
    subjectName: 'Data Structures',
    classGrade: 'Grade 10',
    description: 'Evaluation on arrays, stacks, and queue operations.',
    durationMinutes: 15,
    totalMarks: 40,
    passingMarks: 20,
    scheduleStart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    scheduleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'published',
    allowRetake: true,
    createdBy: teacher._id,
    questions: [
      {
        questionText: 'Which data structure follows the LIFO (Last In First Out) principle?',
        options: ['Queue', 'Stack', 'Linked List', 'Tree'],
        correctAnswer: 1,
        marks: 10,
        explanation: 'A Stack is a LIFO data structure.',
      },
      {
        questionText: 'What is the average time complexity of searching an element in a balanced Binary Search Tree?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctAnswer: 2,
        marks: 10,
        explanation: 'Balanced BST search has logarithmic time complexity O(log n).',
      },
      {
        questionText: 'Which operation is used to insert an element into a queue?',
        options: ['Push', 'Pop', 'Enqueue', 'Dequeue'],
        correctAnswer: 2,
        marks: 10,
        explanation: 'Enqueue adds an element to the rear of the queue.',
      },
      {
        questionText: 'In a singly linked list, each node contains data and a pointer to:',
        options: ['Previous node', 'Next node', 'Both nodes', 'Root node'],
        correctAnswer: 1,
        marks: 10,
        explanation: 'A singly linked list node points exclusively to the next node.',
      },
    ],
  });

  // Historical Exam Attempts
  // Rahul: Passed Math with 30/50 (60%)
  await ExamAttempt.create({
    student: studentRahul._id,
    exam: examMath._id,
    examTitle: examMath.title,
    subjectName: examMath.subjectName,
    classGrade: 'Grade 10',
    marksObtained: 30,
    totalMarks: 50,
    percentage: 60.0,
    passingMarks: 20,
    result: 'PASS',
    startedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000),
    timeSpentSeconds: 720,
    attemptNumber: 1,
    answers: [
      { questionIndex: 0, selectedOption: 0 },
      { questionIndex: 1, selectedOption: 1 },
      { questionIndex: 2, selectedOption: 0 },
      { questionIndex: 3, selectedOption: 0 },
      { questionIndex: 4, selectedOption: 0 },
    ],
    questionReview: [
      { questionIndex: 0, questionText: examMath.questions[0].questionText, options: examMath.questions[0].options, selectedOption: 0, correctAnswer: 0, isCorrect: true, marksAwarded: 10, maxMarks: 10, explanation: examMath.questions[0].explanation },
      { questionIndex: 1, questionText: examMath.questions[1].questionText, options: examMath.questions[1].options, selectedOption: 1, correctAnswer: 1, isCorrect: true, marksAwarded: 10, maxMarks: 10, explanation: examMath.questions[1].explanation },
      { questionIndex: 2, questionText: examMath.questions[2].questionText, options: examMath.questions[2].options, selectedOption: 0, correctAnswer: 0, isCorrect: true, marksAwarded: 10, maxMarks: 10, explanation: examMath.questions[2].explanation },
      { questionIndex: 3, questionText: examMath.questions[3].questionText, options: examMath.questions[3].options, selectedOption: 0, correctAnswer: 1, isCorrect: false, marksAwarded: 0, maxMarks: 10, explanation: examMath.questions[3].explanation },
      { questionIndex: 4, questionText: examMath.questions[4].questionText, options: examMath.questions[4].options, selectedOption: 0, correctAnswer: 2, isCorrect: false, marksAwarded: 0, maxMarks: 10, explanation: examMath.questions[4].explanation },
    ],
    notificationSent: false,
  });

  // Rahul: Failed DSA with 10/40 (25%)
  const rahulDSAAttempt = await ExamAttempt.create({
    student: studentRahul._id,
    exam: examDSA._id,
    examTitle: examDSA.title,
    subjectName: examDSA.subjectName,
    classGrade: 'Grade 10',
    marksObtained: 10,
    totalMarks: 40,
    percentage: 25.0,
    passingMarks: 20,
    result: 'FAIL',
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
    timeSpentSeconds: 600,
    attemptNumber: 1,
    answers: [
      { questionIndex: 0, selectedOption: 1 },
      { questionIndex: 1, selectedOption: 1 },
      { questionIndex: 2, selectedOption: 0 },
      { questionIndex: 3, selectedOption: 0 },
    ],
    questionReview: [
      { questionIndex: 0, questionText: examDSA.questions[0].questionText, options: examDSA.questions[0].options, selectedOption: 1, correctAnswer: 1, isCorrect: true, marksAwarded: 10, maxMarks: 10, explanation: examDSA.questions[0].explanation },
      { questionIndex: 1, questionText: examDSA.questions[1].questionText, options: examDSA.questions[1].options, selectedOption: 1, correctAnswer: 2, isCorrect: false, marksAwarded: 0, maxMarks: 10, explanation: examDSA.questions[1].explanation },
      { questionIndex: 2, questionText: examDSA.questions[2].questionText, options: examDSA.questions[2].options, selectedOption: 0, correctAnswer: 2, isCorrect: false, marksAwarded: 0, maxMarks: 10, explanation: examDSA.questions[2].explanation },
      { questionIndex: 3, questionText: examDSA.questions[3].questionText, options: examDSA.questions[3].options, selectedOption: 0, correctAnswer: 1, isCorrect: false, marksAwarded: 0, maxMarks: 10, explanation: examDSA.questions[3].explanation },
    ],
    notificationSent: true,
  });

  // Failure Notification for Rahul
  await Notification.create({
    student: studentRahul._id,
    studentName: 'Rahul',
    studentId: 'STU102',
    examAttempt: rahulDSAAttempt._id,
    examTitle: examDSA.title,
    recipient: '+91 6305497264',
    messageType: 'WHATSAPP_FAILURE_ALERT',
    messageBody: [
      '⚠️ STUDENT EXAM ALERT',
      '',
      'A student has failed an examination.',
      '',
      'Student Name: Rahul',
      'Student ID: STU102',
      `Exam: ${examDSA.title}`,
      'Marks Obtained: 10/40',
      'Percentage: 25%',
      'Passing Marks: 20',
      'Result: FAIL',
      '',
      'Please review the student\'s performance and provide the required guidance.',
    ].join('\n'),
    status: 'NOT_CONFIGURED',
    errorMessage: 'WhatsApp Cloud API token and Phone Number ID are not yet configured in environment variables. Set WHATSAPP_API_TOKEN in .env to deliver real messages.',
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
  });

  // Priya: Passed Math with 40/50 (80%)
  await ExamAttempt.create({
    student: studentPriya._id,
    exam: examMath._id,
    examTitle: examMath.title,
    subjectName: examMath.subjectName,
    classGrade: 'Grade 10',
    marksObtained: 40,
    totalMarks: 50,
    percentage: 80.0,
    passingMarks: 20,
    result: 'PASS',
    startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 14 * 60 * 1000),
    timeSpentSeconds: 840,
    attemptNumber: 1,
    answers: [
      { questionIndex: 0, selectedOption: 0 },
      { questionIndex: 1, selectedOption: 1 },
      { questionIndex: 2, selectedOption: 0 },
      { questionIndex: 3, selectedOption: 1 },
      { questionIndex: 4, selectedOption: 0 },
    ],
    notificationSent: false,
  });

  // Priya: Passed Python with 100/100 (100%)
  await ExamAttempt.create({
    student: studentPriya._id,
    exam: examPython._id,
    examTitle: examPython.title,
    subjectName: examPython.subjectName,
    classGrade: 'Grade 10',
    marksObtained: 100,
    totalMarks: 100,
    percentage: 100.0,
    passingMarks: 40,
    result: 'PASS',
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000),
    timeSpentSeconds: 480,
    attemptNumber: 1,
    answers: [
      { questionIndex: 0, selectedOption: 1 },
      { questionIndex: 1, selectedOption: 2 },
      { questionIndex: 2, selectedOption: 1 },
      { questionIndex: 3, selectedOption: 1 },
    ],
    notificationSent: false,
  });

  console.log('[Seed] Seed completed successfully!');
};

module.exports = { seedInitialData };

if (require.main === module) {
  const dotenv = require('dotenv');
  const { connectDB, disconnectDB } = require('../config/db');
  dotenv.config();

  (async () => {
    try {
      await connectDB();
      await Promise.all([
        User.deleteMany({}),
        Subject.deleteMany({}),
        Exam.deleteMany({}),
        ExamAttempt.deleteMany({}),
        Notification.deleteMany({}),
      ]);
      await seedInitialData();
    } catch (err) {
      console.error(err);
    } finally {
      await disconnectDB();
      process.exit(0);
    }
  })();
}
