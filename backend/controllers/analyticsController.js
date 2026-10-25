const User = require('../models/User');
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Notification = require('../models/Notification');
const whatsappService = require('../services/whatsappService');

// @desc    Get dashboard metrics and charts for Admin & Teacher
// @route   GET /api/analytics/dashboard
// @access  Private (Admin, Teacher)
const getDashboardMetrics = async (req, res) => {
  try {
    const { classGrade, subject, examId, result } = req.query;

    const attemptFilter = {};
    if (classGrade) attemptFilter.classGrade = classGrade;
    if (subject) attemptFilter.subjectName = new RegExp(subject, 'i');
    if (examId) attemptFilter.exam = examId;
    if (result && ['PASS', 'FAIL'].includes(result.toUpperCase())) {
      attemptFilter.result = result.toUpperCase();
    }

    // Counts
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalExams = await Exam.countDocuments({ status: { $ne: 'archived' } });
    const totalAttempts = await ExamAttempt.countDocuments(attemptFilter);

    // Pass / Fail breakdown
    const passAttempts = await ExamAttempt.countDocuments({ ...attemptFilter, result: 'PASS' });
    const failAttempts = await ExamAttempt.countDocuments({ ...attemptFilter, result: 'FAIL' });

    const overallPassPercentage = totalAttempts > 0
      ? Math.round((passAttempts / totalAttempts) * 100)
      : 0;

    // Unique students who failed at least one exam
    const failedStudentIds = await ExamAttempt.distinct('student', {
      ...attemptFilter,
      result: 'FAIL',
    });
    const failedStudentsCount = failedStudentIds.length;

    // Identify students requiring attention:
    // Students with average score < 50% or failed their latest attempt
    const allStudents = await User.find({ role: 'student', isActive: true }).select('_id name studentId email classGrade');
    let requiringAttentionCount = 0;
    const strugglingStudentsList = [];

    for (const student of allStudents) {
      const studentAttempts = await ExamAttempt.find({ student: student._id }).sort({ submittedAt: -1 });
      if (studentAttempts.length > 0) {
        const studentFails = studentAttempts.filter(a => a.result === 'FAIL').length;
        const avgPct = Math.round(studentAttempts.reduce((s, a) => s + a.percentage, 0) / studentAttempts.length);
        const latestResult = studentAttempts[0].result;

        if (latestResult === 'FAIL' || avgPct < 50 || studentFails >= 2) {
          requiringAttentionCount++;
          if (strugglingStudentsList.length < 5) {
            strugglingStudentsList.push({
              _id: student._id,
              name: student.name,
              studentId: student.studentId,
              classGrade: student.classGrade,
              totalAttempts: studentAttempts.length,
              failedCount: studentFails,
              averagePercentage: avgPct,
              latestResult,
              latestExam: studentAttempts[0].examTitle,
            });
          }
        }
      }
    }

    // Pass vs Fail Distribution (for Donut / Pie Chart)
    const passFailDistribution = [
      { name: 'Passed', value: passAttempts, color: '#10b981' }, // Green
      { name: 'Failed', value: failAttempts, color: '#ef4444' }, // Red
    ];

    // Subject-wise performance (for Bar Chart)
    const subjectAgg = await ExamAttempt.aggregate([
      { $match: attemptFilter },
      {
        $group: {
          _id: '$subjectName',
          attempts: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' },
          passCount: {
            $sum: { $cond: [{ $eq: ['$result', 'PASS'] }, 1, 0] },
          },
          failCount: {
            $sum: { $cond: [{ $eq: ['$result', 'FAIL'] }, 1, 0] },
          },
        },
      },
      { $sort: { attempts: -1 } },
    ]);

    const subjectPerformance = subjectAgg.map(s => ({
      subject: s._id || 'General',
      attempts: s.attempts,
      averagePercentage: Math.round(s.averagePercentage * 10) / 10,
      passCount: s.passCount,
      failCount: s.failCount,
      passRate: Math.round((s.passCount / s.attempts) * 100),
    }));

    // Exam-wise performance comparison
    const examAgg = await ExamAttempt.aggregate([
      { $match: attemptFilter },
      {
        $group: {
          _id: '$examTitle',
          attempts: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' },
          passCount: {
            $sum: { $cond: [{ $eq: ['$result', 'PASS'] }, 1, 0] },
          },
          failCount: {
            $sum: { $cond: [{ $eq: ['$result', 'FAIL'] }, 1, 0] },
          },
        },
      },
      { $sort: { attempts: -1 } },
      { $limit: 8 },
    ]);

    const examPerformance = examAgg.map(e => ({
      examTitle: e._id,
      shortTitle: e._id.length > 15 ? e._id.substring(0, 15) + '...' : e._id,
      attempts: e.attempts,
      averagePercentage: Math.round(e.averagePercentage * 10) / 10,
      passCount: e.passCount,
      failCount: e.failCount,
    }));

    // WhatsApp API configuration status
    const isWhatsAppReady = whatsappService.isWhatsAppConfigured();
    const whatsappRecipient = process.env.WHATSAPP_RECIPIENT || '+91 6305497264';

    // Recent attempts list
    const recentAttempts = await ExamAttempt.find(attemptFilter)
      .populate('student', 'name studentId email')
      .sort({ submittedAt: -1 })
      .limit(6);

    // Recent notifications count
    const totalNotifications = await Notification.countDocuments();
    const sentNotifications = await Notification.countDocuments({ status: 'SENT' });

    res.status(200).json({
      success: true,
      summary: {
        totalStudents,
        totalExams,
        totalAttempts,
        overallPassPercentage,
        failedStudentsCount,
        requiringAttentionCount,
        totalNotifications,
        sentNotifications,
      },
      charts: {
        passFailDistribution,
        subjectPerformance,
        examPerformance,
      },
      strugglingStudents: strugglingStudentsList,
      recentAttempts,
      whatsappStatus: {
        isConfigured: isWhatsAppReady,
        recipient: whatsappRecipient,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ success: false, message: 'Server error generating analytics' });
  }
};

module.exports = {
  getDashboardMetrics,
};
