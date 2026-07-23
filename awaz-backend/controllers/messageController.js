const Message = require('../models/Message');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Send a message to a user
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, text } = req.body;

  if (!recipientId || !text || !text.trim()) {
    throw new ApiError(400, 'Recipient ID and text are required');
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new ApiError(404, 'Recipient user not found');
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    text: text.trim(),
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name handle avatar')
    .populate('recipient', 'name handle avatar');

  res.status(201).json({
    success: true,
    message: populatedMessage,
  });
});

// @desc    Get message history with a specific user & mark as read
// @route   GET /api/messages/:userId
// @access  Private
const getMessagesWithUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Mark incoming unread messages as read
  await Message.updateMany(
    { sender: userId, recipient: req.user._id, read: false },
    { $set: { read: true } }
  );

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: userId },
      { sender: userId, recipient: req.user._id },
    ],
  })
    .sort({ createdAt: 1 })
    .populate('sender', 'name handle avatar')
    .populate('recipient', 'name handle avatar');

  res.json({
    success: true,
    messages,
  });
});

// @desc    Get active conversations for current user with unread counts
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const messages = await Message.find({
    $or: [{ sender: currentUserId }, { recipient: currentUserId }],
  })
    .sort({ createdAt: -1 })
    .populate('sender', 'name handle avatar')
    .populate('recipient', 'name handle avatar');

  const partnerMap = new Map();

  for (const msg of messages) {
    const isSender = msg.sender._id.toString() === currentUserId.toString();
    const partner = isSender ? msg.recipient : msg.sender;

    if (partner) {
      const key = partner._id.toString();
      if (!partnerMap.has(key)) {
        partnerMap.set(key, {
          user: partner,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Count unread if incoming and not read
      if (!isSender && !msg.read) {
        partnerMap.get(key).unreadCount += 1;
      }
    }
  }

  const conversations = Array.from(partnerMap.values());

  res.json({
    success: true,
    conversations,
  });
});

// @desc    Get total unread messages count across all chats
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.json({
    success: true,
    unreadCount: count,
  });
});

module.exports = {
  sendMessage,
  getMessagesWithUser,
  getConversations,
  getUnreadCount,
};
