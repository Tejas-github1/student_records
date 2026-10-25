const User = require('../models/User');
const ExamAttempt = require('../models/ExamAttempt');

// @desc    Get detailed academic progress for a student
// @route   GET /api/students/:id/progress
// @access  Private (Student for own progress, Admin/Teacher for any)
const getStudentProgress = async (req, res) => {
  try {
    const studentIdParam = req.params.id;

    // Authorization check
    if (
      req.user.role === 'student' &&
      req.user._id.toString() !== studentIdParam
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own academic progress',
      });
    }

    const student = await User.findById(studentIdParam).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch all attempts for this student, sorted chronologically ascending for progress graphs
    const attemptsAsc = await ExamAttempt.find({ student: student._id })
      .sort({ submittedAt: 1 })
      .populate('exam', 'title subjectName passingMarks totalMarks');

    // Also get descending for recent history
    const attemptsDesc = [...attemptsAsc].reverse();

    const totalAttempts = attemptsAsc.length;
    let passedCount = 0;
    let failedCount = 0;
    let totalPercentage = 0;
    let highestPercentage = 0;
    let lowestPercentage = totalAttempts > 0 ? 100 : 0;

    const subjectMetrics = {};

    attemptsAsc.forEach(att => {
      if (att.result === 'PASS') {
        passedCount++;
      } else {
        failedCount++;
      }

      totalPercentage += att.percentage;
      if (att.percentage > highestPercentage) highestPercentage = att.percentage;
      if (att.percentage < lowestPercentage) lowestPercentage = att.percentage;

      // Group by subject for bar chart
      const subj = att.subjectName || 'General';
      if (!subjectMetrics[subj]) {
        subjectMetrics[subj] = {
          subject: subj,
          totalScore: 0,
          totalPossible: 0,
          attempts: 0,
          percentageSum: 0,
        };
      }
      subjectMetrics[subj].totalScore += att.marksObtained;
      subjectMetrics[subj].totalPossible += att.totalMarks;
      subjectMetrics[subj].attempts += 1;
      subjectMetrics[subj].percentageSum += att.percentage;
    });

    const averagePercentage = totalAttempts > 0
      ? Math.round((totalPercentage / totalAttempts) * 10) / 10
      : 0;

    // Trend calculation (latest exam vs previous exam)
    let trend = null;
    if (totalAttempts >= 2) {
      const latest = attemptsAsc[totalAttempts - 1];
      const previous = attemptsAsc[totalAttempts - 2];
      const diff = Math.round((latest.percentage - previous.percentage) * 10) / 10;
      trend = {
        difference: diff,
        isImprovement: diff >= 0,
        label: diff >= 0 ? `+${diff}% vs previous exam` : `${diff}% vs previous exam`,
      };
    } else if (totalAttempts === 1) {
      trend = {
        difference: 0,
        isImprovement: true,
        label: 'First exam completed',
      };
    }

    // Format data for Recharts Line Chart (Chronological progression)
    const lineChartData = attemptsAsc.map((att, idx) => ({
      index: idx + 1,
      attemptId: att._id,
      examTitle: att.examTitle,
      shortTitle: att.examTitle.length > 15 ? att.examTitle.substring(0, 15) + '...' : att.examTitle,
      subjectName: att.subjectName,
      marksObtained: att.marksObtained,
      totalMarks: att.totalMarks,
      percentage: att.percentage,
      passingMarks: att.passingMarks,
      result: att.result,
      date: new Date(att.submittedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));

    // Format data for Recharts Bar Chart (Subject comparison)
    const barChartData = Object.keys(subjectMetrics).map(key => {
      const item = subjectMetrics[key];
      return {
        subject: item.subject,
        averagePercentage: Math.round((item.percentageSum / item.attempts) * 10) / 10,
        totalAttempts: item.attempts,
        marksObtained: item.totalScore,
        totalMarks: item.totalPossible,
      };
    });

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        classGrade: student.classGrade,
      },
      metrics: {
        totalAttempts,
        passedCount,
        failedCount,
        passRate: totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0,
        averagePercentage,
        highestPercentage: totalAttempts > 0 ? highestPercentage : 0,
        lowestPercentage: totalAttempts > 0 ? lowestPercentage : 0,
        trend,
        latestAttempt: attemptsDesc[0] || null,
      },
      charts: {
        lineChart: lineChartData,
        barChart: barChartData,
      },
      history: attemptsDesc,
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ success: false, message: 'Server error fetching student progress' });
  }
};

// @desc    Get class-wide comparative progress for Admin and Teacher
// @route   GET /api/students/class-progress
// @access  Private (Admin, Teacher)
const getClassProgress = async (req, res) => {
  try {
    const { classGrade, subject } = req.query;
    const studentFilter = { role: 'student', isActive: true };
    if (classGrade) studentFilter.classGrade = classGrade;

    const students = await User.find(studentFilter).select('name email studentId classGrade');

    // Aggregate attempts for each student
    const studentProgressList = await Promise.all(
      students.map(async student => {
        const attemptFilter = { student: student._id };
        if (subject) attemptFilter.subjectName = new RegExp(subject, 'i');

        const attempts = await ExamAttempt.find(attemptFilter).sort({ submittedAt: 1 });
        const total = attempts.length;
        const passed = attempts.filter(a => a.result === 'PASS').length;
        const failed = total - passed;
        const avgPercentage = total > 0
          ? Math.round((attempts.reduce((s, a) => s + a.percentage, 0) / total) * 10) / 10
          : 0;

        let trend = 'No Data';
        if (total >= 2) {
          const diff = attempts[total - 1].percentage - attempts[total - 2].percentage;
          trend = diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
        }

        const needsSupport = (total > 0 && avgPercentage < 50) || failed >= 2;

        return {
          _id: student._id,
          name: student.name,
          studentId: student.studentId,
          classGrade: student.classGrade,
          email: student.email,
          totalAttempts: total,
          passed,
          failed,
          passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
          avgPercentage,
          trend,
          needsSupport,
          latestAttempt: attempts[attempts.length - 1] || null,
        };
      })
    );

    // Sort: students needing attention first, then by avgPercentage ascending
    studentProgressList.sort((a, b) => {
      if (a.needsSupport !== b.needsSupport) return a.needsSupport ? -1 : 1;
      return a.avgPercentage - b.avgPercentage;
    });

    res.status(200).json({
      success: true,
      count: studentProgressList.length,
      students: studentProgressList,
    });
  } catch (error) {
    console.error('Error fetching class progress:', error);
    res.status(500).json({ success: false, message: 'Server error fetching class progress' });
  }
};

// @desc    Get all students (Admin/Teacher)
// @route   GET /api/students
// @access  Private (Admin, Teacher)
const getAllStudents = async (req, res) => {
  try {
    const { classGrade, search, isActive } = req.query;
    const filter = { role: 'student' };

    if (classGrade) filter.classGrade = classGrade;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    let query = User.find(filter).select('-password').sort({ createdAt: -1 });
    const students = await query.exec();

    let filtered = students;
    if (search) {
      const term = search.toLowerCase();
      filtered = students.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.studentId && s.studentId.toLowerCase().includes(term))
      );
    }

    // Attach basic statistics for each student
    const studentData = await Promise.all(
      filtered.map(async s => {
        const attempts = await ExamAttempt.countDocuments({ student: s._id });
        const failed = await ExamAttempt.countDocuments({ student: s._id, result: 'FAIL' });
        return {
          ...s.toObject(),
          totalAttempts: attempts,
          failedAttempts: failed,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: studentData.length,
      students: studentData,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error fetching students' });
  }
};

// @desc    Update student (Admin)
// @route   PUT /api/students/:id
// @access  Private (Admin)
const updateStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student account not found' });
    }

    const { name, email, studentId, classGrade, isActive, phone } = req.body;
    if (name) student.name = name;
    if (email) student.email = email.toLowerCase();
    if (studentId) student.studentId = studentId;
    if (classGrade) student.classGrade = classGrade;
    if (isActive !== undefined) student.isActive = isActive;
    if (phone !== undefined) student.phone = phone;

    await student.save();

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating student' });
  }
};

module.exports = {
  getStudentProgress,
  getClassProgress,
  getAllStudents,
  updateStudent,
};
