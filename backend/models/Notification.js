const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    studentName: {
      type: String,
      default: '',
    },
    studentId: {
      type: String,
      default: '',
    },
    examAttempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamAttempt',
      index: true,
    },
    examTitle: {
      type: String,
      default: '',
    },
    recipient: {
      type: String,
      required: true,
      default: '+91 6305497264',
    },
    messageType: {
      type: String,
      enum: ['WHATSAPP_FAILURE_ALERT', 'TEST_NOTIFICATION'],
      default: 'WHATSAPP_FAILURE_ALERT',
    },
    messageBody: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['SENT', 'FAILED', 'NOT_CONFIGURED', 'SKIPPED'],
      default: 'SENT',
      index: true,
    },
    deliveryDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ examAttempt: 1, messageType: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
