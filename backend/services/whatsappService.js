const axios = require('axios');
const Notification = require('../models/Notification');

/**
 * Checks whether WhatsApp Cloud API credentials are provided.
 */
const isWhatsAppConfigured = () => {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  return Boolean(token && phoneId && token.trim() !== '' && phoneId.trim() !== '');
};

/**
 * Clean phone number to E.164 without '+' or spaces for Meta WhatsApp Cloud API
 */
const formatPhoneNumberForMeta = (phone) => {
  return phone.replace(/[^\d]/g, '');
};

/**
 * Compose exam failure message body
 */
const composeFailureMessage = ({ studentName, studentId, examTitle, marksObtained, totalMarks, percentage, passingMarks }) => {
  return [
    '⚠️ STUDENT EXAM ALERT',
    '',
    'A student has failed an examination.',
    '',
    `Student Name: ${studentName}`,
    `Student ID: ${studentId || 'N/A'}`,
    `Exam: ${examTitle}`,
    `Marks Obtained: ${marksObtained}/${totalMarks}`,
    `Percentage: ${percentage}%`,
    `Passing Marks: ${passingMarks}`,
    'Result: FAIL',
    '',
    'Please review the student\'s performance and provide the required guidance.',
  ].join('\n');
};

/**
 * Core sender function to WhatsApp Cloud API
 */
const sendMetaCloudMessage = async ({ to, messageText }) => {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const cleanRecipient = formatPhoneNumberForMeta(to);

  const endpoint = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanRecipient,
    type: 'text',
    text: {
      preview_url: false,
      body: messageText,
    },
  };

  const response = await axios.post(endpoint, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return response.data;
};

/**
 * Triggered automatically on server when an exam attempt results in FAIL.
 * Implements deduplication lock to guarantee only 1 notification per exam attempt.
 */
const sendExamFailureAlert = async ({ student, exam, attempt }) => {
  // Check if student actually failed
  if (attempt.result !== 'FAIL') {
    return { skipped: true, reason: 'Student passed, notification not required' };
  }

  // Deduplication check: check if already notified or queued for this exam attempt
  const existingNotification = await Notification.findOne({
    examAttempt: attempt._id,
    messageType: 'WHATSAPP_FAILURE_ALERT',
    status: { $in: ['SENT', 'PENDING'] },
  });

  if (existingNotification) {
    return {
      skipped: true,
      reason: 'Notification already sent or pending for this exam attempt',
      notificationId: existingNotification._id,
    };
  }

  const recipient = process.env.WHATSAPP_RECIPIENT || '+91 6305497264';
  const studentName = student.name || 'Student';
  const studentId = student.studentId || 'N/A';
  const examTitle = exam.title || attempt.examTitle;

  const messageText = composeFailureMessage({
    studentName,
    studentId,
    examTitle,
    marksObtained: attempt.marksObtained,
    totalMarks: attempt.totalMarks,
    percentage: attempt.percentage,
    passingMarks: attempt.passingMarks,
  });

  // Verify configuration
  if (!isWhatsAppConfigured()) {
    const recorded = await Notification.create({
      student: student._id,
      studentName,
      studentId,
      examAttempt: attempt._id,
      examTitle,
      recipient,
      messageType: 'WHATSAPP_FAILURE_ALERT',
      messageBody: messageText,
      status: 'NOT_CONFIGURED',
      errorMessage: 'WhatsApp Cloud API credentials (WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID) are missing from server configuration.',
      sentAt: new Date(),
    });

    return {
      success: false,
      status: 'NOT_CONFIGURED',
      notificationId: recorded._id,
      message: 'WhatsApp Cloud API not configured on server.',
    };
  }

  // Attempt to send via Meta Cloud API
  try {
    const metaResponse = await sendMetaCloudMessage({
      to: recipient,
      messageText,
    });

    const recorded = await Notification.create({
      student: student._id,
      studentName,
      studentId,
      examAttempt: attempt._id,
      examTitle,
      recipient,
      messageType: 'WHATSAPP_FAILURE_ALERT',
      messageBody: messageText,
      status: 'SENT',
      deliveryDetails: metaResponse,
      sentAt: new Date(),
    });

    // Mark attempt as notificationSent
    attempt.notificationSent = true;
    await attempt.save();

    return {
      success: true,
      status: 'SENT',
      notificationId: recorded._id,
      metaResponse,
    };
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message || 'Unknown network error';
    const errDetails = error.response?.data || null;

    const recorded = await Notification.create({
      student: student._id,
      studentName,
      studentId,
      examAttempt: attempt._id,
      examTitle,
      recipient,
      messageType: 'WHATSAPP_FAILURE_ALERT',
      messageBody: messageText,
      status: 'FAILED',
      deliveryDetails: errDetails,
      errorMessage: errMsg,
      sentAt: new Date(),
    });

    return {
      success: false,
      status: 'FAILED',
      notificationId: recorded._id,
      errorMessage: errMsg,
    };
  }
};

/**
 * Manual test alert triggered by administrator
 */
const sendTestNotification = async ({ recipientOverride, note }) => {
  const recipient = recipientOverride || process.env.WHATSAPP_RECIPIENT || '+91 6305497264';
  const messageText = [
    '🧪 TEST NOTIFICATION - Online Examination System',
    '',
    'This is a verification test from your Online Exam Management Portal.',
    `Target Recipient: ${recipient}`,
    `Timestamp: ${new Date().toLocaleString()}`,
    note ? `Admin Note: ${note}` : 'System status: Active & Functional.',
    '',
    'Automated failure alerts will be delivered directly to this channel.',
  ].join('\n');

  if (!isWhatsAppConfigured()) {
    const recorded = await Notification.create({
      recipient,
      messageType: 'TEST_NOTIFICATION',
      messageBody: messageText,
      status: 'NOT_CONFIGURED',
      errorMessage: 'WhatsApp Cloud API is not configured (WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID is unset).',
      sentAt: new Date(),
    });

    return {
      success: false,
      status: 'NOT_CONFIGURED',
      notificationId: recorded._id,
      message: 'WhatsApp Cloud API credentials not configured in environment variables.',
    };
  }

  try {
    const metaResponse = await sendMetaCloudMessage({
      to: recipient,
      messageText,
    });

    const recorded = await Notification.create({
      recipient,
      messageType: 'TEST_NOTIFICATION',
      messageBody: messageText,
      status: 'SENT',
      deliveryDetails: metaResponse,
      sentAt: new Date(),
    });

    return {
      success: true,
      status: 'SENT',
      notificationId: recorded._id,
      metaResponse,
    };
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message || 'Unknown network error';
    const recorded = await Notification.create({
      recipient,
      messageType: 'TEST_NOTIFICATION',
      messageBody: messageText,
      status: 'FAILED',
      deliveryDetails: error.response?.data,
      errorMessage: errMsg,
      sentAt: new Date(),
    });

    return {
      success: false,
      status: 'FAILED',
      notificationId: recorded._id,
      errorMessage: errMsg,
    };
  }
};

module.exports = {
  isWhatsAppConfigured,
  composeFailureMessage,
  sendExamFailureAlert,
  sendTestNotification,
};
