const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getMe,
  sendOtp,
  verifyOtp,
  resetPassword,
  clerkSync,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/clerk-sync', clerkSync);
router.get('/me', protect, getMe);

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
