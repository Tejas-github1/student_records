const express = require('express');
const router = express.Router();
const {
  getStudentProgress,
  getClassProgress,
  getAllStudents,
  updateStudent,
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

// Class progress overview for Admin & Teacher
router.get('/class-progress', authorize('admin', 'teacher'), getClassProgress);

// All students list & update (Admin / Teacher)
router.get('/', authorize('admin', 'teacher'), getAllStudents);
router.put('/:id', authorize('admin'), updateStudent);

// Student progress page (Student accesses own, Admin/Teacher accesses any)
router.get('/:id/progress', getStudentProgress);

module.exports = router;
