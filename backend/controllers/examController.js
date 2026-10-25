const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Subject = require('../models/Subject');
const User = require('../models/User');
const whatsappService = require('../services/whatsappService');

// @desc    Get all exams (contextual by role)
// @route   GET /api/exams
// @access  Private
const getAllExams = async (req, res) => {
  try {
    const { status, subject, classGrade } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      // Students only see published exams
      filter.status = 'published';
      if (req.user.classGrade && req.user.classGrade !== 'General') {
        filter.$or = [
          { classGrade: req.user.classGrade },
          { classGrade: 'General' },
        ];
      }
    } else {
      if (status) filter.status = status;
      if (classGrade) filter.classGrade = classGrade;
    }

    if (subject) {
      filter.subjectName = new RegExp(subject, 'i');
    }

    const exams = await Exam.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    // For students, attach their previous attempt status
    if (req.user.role === 'student') {
      const studentAttempts = await ExamAttempt.find({ student: req.user._id })
        .select('exam result marksObtained totalMarks percentage submittedAt')
        .sort({ submittedAt: -1 });

      const attemptMap = {};
      studentAttempts.forEach(att => {
        if (!attemptMap[att.exam.toString()]) {
          attemptMap[att.exam.toString()] = att;
        }
      });

      const studentExams = exams.map(exam => {
        const studentView = exam.toStudentView();
        const latestAttempt = attemptMap[exam._id.toString()] || null;
        return {
          ...studentView,
          hasAttempted: Boolean(latestAttempt),
          latestAttempt,
          canTake: !latestAttempt || exam.allowRetake,
        };
      });

      return res.status(200).json({
        success: true,
        count: studentExams.length,
        exams: studentExams,
      });
    }

    res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ success: false, message: 'Server error fetching exams' });
  }
};

// @desc    Get single exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name email');
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (req.user.role === 'student') {
      // Check if student has already taken it and retakes not allowed
      const existingAttempt = await ExamAttempt.findOne({
        student: req.user._id,
        exam: exam._id,
      });

      if (existingAttempt && !exam.allowRetake) {
        return res.status(403).json({
          success: false,
          message: 'You have already completed this exam and retakes are not permitted.',
          attemptId: existingAttempt._id,
        });
      }

      // Security: Strip correct answers and explanations for active exam taking
      const studentExam = exam.toStudentView();
      return res.status(200).json({
        success: true,
        exam: studentExam,
      });
    }

    // Admin/Teacher gets full exam including answer keys
    res.status(200).json({
      success: true,
      exam,
    });
  } catch (error) {
    console.error('Error fetching exam by ID:', error);
    res.status(500).json({ success: false, message: 'Server error fetching exam' });
  }
};

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private (Admin, Teacher)
const createExam = async (req, res) => {
  try {
    const {
      title,
      subjectName,
      classGrade,
      description,
      durationMinutes,
      totalMarks,
      passingMarks,
      scheduleStart,
      scheduleEnd,
      status,
      allowRetake,
      questions,
    } = req.body;

    if (!title || !subjectName || !durationMinutes || !passingMarks) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject name, duration, and passing marks are required',
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Exam must contain at least one question',
      });
    }

    // Calculate total marks from questions if not specified or if sum differs
    const calculatedTotal = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    const finalTotalMarks = Number(totalMarks) || calculatedTotal;

    if (Number(passingMarks) > finalTotalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Passing marks cannot exceed total marks',
      });
    }

    const exam = await Exam.create({
      title,
      subjectName,
      classGrade: classGrade || 'General',
      description: description || '',
      durationMinutes: Number(durationMinutes),
      totalMarks: finalTotalMarks,
      passingMarks: Number(passingMarks),
      scheduleStart: scheduleStart || new Date(),
      scheduleEnd: scheduleEnd || null,
      status: status || 'published',
      allowRetake: Boolean(allowRetake),
      questions,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      exam,
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating exam' });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Admin, Teacher)
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Update fields
    const fields = [
      'title',
      'subjectName',
      'classGrade',
      'description',
      'durationMinutes',
      'totalMarks',
      'passingMarks',
      'scheduleStart',
      'scheduleEnd',
      'status',
      'allowRetake',
      'questions',
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        exam[field] = req.body[field];
      }
    });

    if (req.body.questions && Array.isArray(req.body.questions)) {
      const calculatedTotal = req.body.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
      if (!req.body.totalMarks) {
        exam.totalMarks = calculatedTotal;
      }
    }

    await exam.save();

    res.status(200).json({
      success: true,
      exam,
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating exam' });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin)
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    await Exam.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ success: false, message: 'Server error deleting exam' });
  }
};

// @desc    Submit exam answers, calculate score, evaluate pass/fail, and trigger WhatsApp failure alert
// @route   POST /api/exams/:id/submit
// @access  Private (Student)
const submitExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const { answers = [], timeSpentSeconds = 0, isAutoSubmitted = false } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check existing attempts for retake restrictions
    const previousAttempts = await ExamAttempt.countDocuments({
      student: req.user._id,
      exam: exam._id,
    });

    if (previousAttempts > 0 && !exam.allowRetake) {
      return res.status(403).json({
        success: false,
        message: 'Multiple submissions are not allowed for this examination.',
      });
    }

    // Server-side scoring computation
    let marksObtained = 0;
    const totalMarks = exam.totalMarks;
    const questionReview = [];

    // Map answers by questionIndex
    const answerMap = {};
    answers.forEach(a => {
      answerMap[a.questionIndex] = a.selectedOption;
    });

    exam.questions.forEach((q, idx) => {
      const selectedOption = answerMap[idx] !== undefined ? answerMap[idx] : null;
      const qMarks = Number(q.marks) || 1;
      const isCorrect = selectedOption !== null && Number(selectedOption) === Number(q.correctAnswer);

      const marksAwarded = isCorrect ? qMarks : 0;
      marksObtained += marksAwarded;

      questionReview.push({
        questionIndex: idx,
        questionText: q.questionText,
        options: q.options,
        selectedOption,
        correctAnswer: q.correctAnswer,
        isCorrect,
        marksAwarded,
        maxMarks: qMarks,
        explanation: q.explanation || '',
      });
    });

    // Calculate percentage: (Marks Obtained / Total Marks) * 100
    const rawPercentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0;
    const percentage = Math.round(rawPercentage * 10) / 10; // 1 decimal place

    // Determine result using passing marks configured by admin
    const result = marksObtained >= exam.passingMarks ? 'PASS' : 'FAIL';

    const attempt = await ExamAttempt.create({
      student: req.user._id,
      exam: exam._id,
      examTitle: exam.title,
      subjectName: exam.subjectName,
      classGrade: exam.classGrade || req.user.classGrade,
      answers: answers.map(a => ({
        questionIndex: a.questionIndex,
        selectedOption: a.selectedOption,
      })),
      questionReview,
      marksObtained,
      totalMarks,
      percentage,
      passingMarks: exam.passingMarks,
      result,
      startedAt: new Date(Date.now() - (timeSpentSeconds * 1000)),
      submittedAt: new Date(),
      timeSpentSeconds,
      attemptNumber: previousAttempts + 1,
      isAutoSubmitted: Boolean(isAutoSubmitted),
    });

    // WhatsApp Notification Trigger:
    // If student received FAIL, trigger WhatsApp notification automatically
    let notificationResult = null;
    if (result === 'FAIL') {
      try {
        notificationResult = await whatsappService.sendExamFailureAlert({
          student: req.user,
          exam,
          attempt,
        });
      } catch (notifyErr) {
        console.error('WhatsApp notification dispatch error:', notifyErr);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Exam submitted successfully',
      attempt: {
        _id: attempt._id,
        examId: exam._id,
        examTitle: exam.title,
        subjectName: exam.subjectName,
        marksObtained,
        totalMarks,
        percentage,
        passingMarks: exam.passingMarks,
        result,
        submittedAt: attempt.submittedAt,
        timeSpentSeconds,
        questionReview,
        notificationResult,
      },
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error submitting exam' });
  }
};

// @desc    Get result of a specific exam attempt
// @route   GET /api/exams/attempts/:id
// @access  Private (Student for own attempt, Admin/Teacher for any)
const getAttemptResult = async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.id)
      .populate('student', 'name email studentId classGrade')
      .populate('exam', 'title subjectName durationMinutes passingMarks totalMarks');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt result not found' });
    }

    // Authorization check
    if (
      req.user.role === 'student' &&
      attempt.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to view your own exam results',
      });
    }

    res.status(200).json({
      success: true,
      attempt,
    });
  } catch (error) {
    console.error('Error fetching attempt result:', error);
    res.status(500).json({ success: false, message: 'Server error fetching attempt result' });
  }
};

// @desc    Get all exam attempts with search, filters, and pagination
// @route   GET /api/exams/attempts
// @access  Private (Admin, Teacher)
const getAllAttempts = async (req, res) => {
  try {
    const {
      examId,
      studentId,
      result,
      subject,
      classGrade,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (examId) filter.exam = examId;
    if (result && ['PASS', 'FAIL'].includes(result.toUpperCase())) {
      filter.result = result.toUpperCase();
    }
    if (subject) filter.subjectName = new RegExp(subject, 'i');
    if (classGrade) filter.classGrade = classGrade;

    let query = ExamAttempt.find(filter)
      .populate('student', 'name email studentId classGrade')
      .populate('exam', 'title subjectName passingMarks totalMarks')
      .sort({ submittedAt: -1 });

    const allAttempts = await query.exec();

    // In-memory text search on populated student name / studentId if search query passed
    let filteredAttempts = allAttempts;
    if (search) {
      const term = search.toLowerCase();
      filteredAttempts = allAttempts.filter(att => {
        const studentName = att.student?.name?.toLowerCase() || '';
        const stuId = att.student?.studentId?.toLowerCase() || '';
        const examName = att.examTitle?.toLowerCase() || '';
        return studentName.includes(term) || stuId.includes(term) || examName.includes(term);
      });
    }

    const totalCount = filteredAttempts.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = filteredAttempts.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)) || 1,
      attempts: paginated,
    });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ success: false, message: 'Server error fetching attempts' });
  }
};

module.exports = {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  submitExam,
  getAttemptResult,
  getAllAttempts,
};
