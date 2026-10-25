const express = require('express');
const router = express.Router();
const {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  submitExam,
  getAttemptResult,
  getAllAttempts,
} = require('../controllers/examController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All exam routes require authentication
router.use(protect);

// Attempts routes
router.get('/attempts', authorize('admin', 'teacher'), getAllAttempts);
router.get('/attempts/:id', getAttemptResult);

// Exam CRUD routes
router.get('/', getAllExams);
router.get('/:id', getExamById);
router.post('/', authorize('admin', 'teacher'), createExam);
router.put('/:id', authorize('admin', 'teacher'), updateExam);
router.delete('/:id', authorize('admin'), deleteExam);

// Exam submission (Student only)
router.post('/:id/submit', authorize('student'), submitExam);

module.exports = router;
