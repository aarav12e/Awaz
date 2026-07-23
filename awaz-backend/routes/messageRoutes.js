const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getMessagesWithUser,
  getConversations,
  getUnreadCount,
} = require('../controllers/messageController');

router.post('/', protect, sendMessage);
router.get('/unread-count', protect, getUnreadCount);
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessagesWithUser);

module.exports = router;
