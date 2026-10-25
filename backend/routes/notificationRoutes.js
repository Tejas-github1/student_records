const express = require('express');
const router = express.Router();
const {
  getNotificationHistory,
  triggerTestNotification,
  getWhatsAppStatus,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('admin')); // Only Admin accesses WhatsApp notification history & testing

router.get('/', getNotificationHistory);
router.get('/status', getWhatsAppStatus);
router.post('/test', triggerTestNotification);

module.exports = router;
