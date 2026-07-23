const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

// @desc    Register a new reporter
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, handle: customHandle } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  // 1. Strict duplicate email check
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(400, 'An account with this email address already exists. Please sign in instead.');
  }

  // 2. Derive or validate unique handle
  let handle;
  if (customHandle && customHandle.trim()) {
    handle = customHandle.toLowerCase().trim().replace(/^@/, '').replace(/[^a-z0-9._]/g, '');
    const existingHandle = await User.findOne({ handle });
    if (existingHandle) {
      throw new ApiError(400, `The username "@${handle}" is already taken. Please choose another username.`);
    }
  } else {
    const base = name.toLowerCase().trim().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    handle = base;
    let suffix = 1;
    while (await User.findOne({ handle })) {
      handle = `${base}${suffix}`;
      suffix += 1;
    }
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    handle,
    avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      handle: user.handle,
      email: user.email,
      avatar: user.avatar,
      verified: user.verified,
      following: user.following || [],
    },
  });
});

// @desc    Log in an existing user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      handle: user.handle,
      email: user.email,
      avatar: user.avatar,
      verified: user.verified,
      following: user.following || [],
    },
  });
});

// @desc    Get the logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @desc    Send OTP for password reset
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email address is required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, 'No account found with this email address');
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetOtp = otp;
  user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: `Verification OTP sent to ${email}`,
    otp, // Returned so the user can see and verify it immediately!
  });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP code are required');
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetOtp: otp,
    resetOtpExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired OTP code');
  }

  res.json({
    success: true,
    message: 'OTP verified successfully',
  });
});

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, 'Email, OTP, and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetOtp: otp,
    resetOtpExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired OTP code');
  }

  user.password = newPassword;
  user.resetOtp = null;
  user.resetOtpExpires = null;

  await user.save();

  res.json({
    success: true,
    message: 'Password reset successfully! You can now sign in with your new password.',
  });
});

// @desc    Sync Clerk user into MongoDB database
// @route   POST /api/auth/clerk-sync
// @access  Public
const clerkSync = asyncHandler(async (req, res) => {
  const { clerkId, email, name, handle: rawHandle, avatar } = req.body;

  if (!email && !clerkId) {
    throw new ApiError(400, 'Email or Clerk ID required');
  }

  let user = null;
  if (clerkId) {
    user = await User.findOne({ clerkId });
  }
  if (!user && email) {
    user = await User.findOne({ email: email.toLowerCase() });
  }

  if (user) {
    if (clerkId && !user.clerkId) {
      user.clerkId = clerkId;
      await user.save();
    }
  } else {
    // Determine unique handle
    let handle = (rawHandle || email.split('@')[0]).toLowerCase().trim().replace(/^@/, '').replace(/[^a-z0-9._]/g, '');
    if (!handle) handle = `user_${Math.floor(1000 + Math.random() * 9000)}`;

    let base = handle;
    let suffix = 1;
    while (await User.findOne({ handle })) {
      handle = `${base}${suffix}`;
      suffix += 1;
    }

    user = await User.create({
      clerkId,
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      handle,
      avatar: avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name || handle)}`,
      password: 'clerk-account-password-123',
    });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      _id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      handle: `@${user.handle}`,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      website: user.website,
      gender: user.gender,
      location: user.location,
      verified: user.verified,
      following: user.following,
    },
  });
});

module.exports = {
  signup,
  login,
  getMe,
  sendOtp,
  verifyOtp,
  resetPassword,
  clerkSync,
};
