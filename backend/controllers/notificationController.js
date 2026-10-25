const Notification = require('../models/Notification');
const whatsappService = require('../services/whatsappService');

// @desc    Get notification history with search, status filter, and pagination
// @route   GET /api/notifications
// @access  Private (Admin)
const getNotificationHistory = async (req, res) => {
  try {
    const { status, messageType, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (messageType) filter.messageType = messageType;

    let query = Notification.find(filter)
      .populate('student', 'name email studentId')
      .populate('examAttempt', 'marksObtained totalMarks percentage result')
      .sort({ createdAt: -1 });

    const notifications = await query.exec();

    let filtered = notifications;
    if (search) {
      const term = search.toLowerCase();
      filtered = notifications.filter(n =>
        (n.studentName && n.studentName.toLowerCase().includes(term)) ||
        (n.studentId && n.studentId.toLowerCase().includes(term)) ||
        (n.examTitle && n.examTitle.toLowerCase().includes(term)) ||
        (n.recipient && n.recipient.includes(term))
      );
    }

    const totalCount = filtered.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(startIndex, startIndex + Number(limit));

    // Summary counts
    const totalSent = await Notification.countDocuments({ status: 'SENT' });
    const totalFailed = await Notification.countDocuments({ status: 'FAILED' });
    const totalNotConfigured = await Notification.countDocuments({ status: 'NOT_CONFIGURED' });

    res.status(200).json({
      success: true,
      totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)) || 1,
      stats: {
        totalSent,
        totalFailed,
        totalNotConfigured,
      },
      whatsappStatus: {
        isConfigured: whatsappService.isWhatsAppConfigured(),
        recipient: process.env.WHATSAPP_RECIPIENT || '+91 6305497264',
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? 'Configured (***)' : 'Not Set',
      },
      notifications: paginated,
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ success: false, message: 'Server error fetching notifications' });
  }
};

// @desc    Send test WhatsApp alert
// @route   POST /api/notifications/test
// @access  Private (Admin)
const triggerTestNotification = async (req, res) => {
  try {
    const { recipient, note } = req.body;
    const result = await whatsappService.sendTestNotification({
      recipientOverride: recipient,
      note,
    });

    res.status(200).json({
      success: result.success !== false,
      result,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ success: false, message: error.message || 'Error sending test notification' });
  }
};

// @desc    Get WhatsApp configuration status
// @route   GET /api/notifications/status
// @access  Private (Admin)
const getWhatsAppStatus = async (req, res) => {
  try {
    const isConfigured = whatsappService.isWhatsAppConfigured();
    res.status(200).json({
      success: true,
      isConfigured,
      recipient: process.env.WHATSAPP_RECIPIENT || '+91 6305497264',
      provider: 'Meta WhatsApp Business Cloud API',
      hasPhoneNumberId: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
      hasToken: Boolean(process.env.WHATSAPP_API_TOKEN),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking WhatsApp status' });
  }
};

module.exports = {
  getNotificationHistory,
  triggerTestNotification,
  getWhatsAppStatus,
};
