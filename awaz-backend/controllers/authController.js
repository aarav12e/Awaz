const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

// @desc    Register a new reporter
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(400, 'An account with this email already exists');
  }

  // Derive a unique handle from the name, e.g. "Aarav Kumar" -> "@aarav.kumar"
  const base = name.toLowerCase().trim().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
  let handle = base;
  let suffix = 1;
  while (await User.findOne({ handle })) {
    handle = `${base}${suffix}`;
    suffix += 1;
  }

  const user = await User.create({
    name,
    email,
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
    },
  });
});

// @desc    Get the logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { signup, login, getMe };
