const fs = require('fs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get a public profile by handle
// @route   GET /api/users/:handle
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ handle: req.params.handle.toLowerCase() });
  if (!user) throw new ApiError(404, 'Reporter not found');

  const posts = await Post.find({ reporter: user._id, isRemoved: false }).sort({
    createdAt: -1,
  });

  const isFollowing = req.user
    ? user.followers.some((id) => id.toString() === req.user._id.toString())
    : false;

  res.json({
    success: true,
    user: {
      id: user._id,
      _id: user._id,
      name: user.name,
      handle: user.handle,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      verified: user.verified,
      followerCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing,
    },
    posts,
  });
});

// @desc    Update own profile (name, handle, bio, website, gender, avatar)
// @route   PUT /api/users/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, handle, bio, website, gender, avatar, location } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (handle) user.handle = handle.toLowerCase().replace(/^@/, '');
  if (bio !== undefined) user.bio = bio;
  if (website !== undefined) user.website = website;
  if (gender !== undefined) user.gender = gender;
  if (avatar !== undefined) user.avatar = avatar;
  if (location !== undefined) user.location = location;

  await user.save();
  res.json({ success: true, user });
});

// @desc    Upload/replace avatar
// @route   PUT /api/users/me/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'An image file is required');

  let uploadResult;
  try {
    uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'awaz/avatars',
      transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
    });
  } finally {
    fs.unlink(req.file.path, () => {});
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: uploadResult.secure_url },
    { new: true }
  );

  res.json({ success: true, avatar: user.avatar });
});

// @desc    Follow a reporter
// @route   PUT /api/users/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, "You can't follow yourself");
  }

  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, 'Reporter not found');

  const alreadyFollowing = target.followers.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (alreadyFollowing) {
    target.followers = target.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    req.user.following = req.user.following.filter(
      (id) => id.toString() !== target._id.toString()
    );
  } else {
    target.followers.push(req.user._id);
    req.user.following.push(target._id);
  }

  await target.save();
  await req.user.save();

  res.json({ success: true, following: !alreadyFollowing });
});

// @desc    Get all reporters (for discovery/explore page)
// @route   GET /api/users
// @access  Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc    Get followers of a reporter
// @route   GET /api/users/:handle/followers
// @access  Private
const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findOne({ handle: req.params.handle.toLowerCase() })
    .populate('followers', 'name handle avatar verified');
  if (!user) throw new ApiError(404, 'Reporter not found');

  res.json({ success: true, followers: user.followers });
});

// @desc    Get who a reporter is following
// @route   GET /api/users/:handle/following
// @access  Private
const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findOne({ handle: req.params.handle.toLowerCase() })
    .populate('following', 'name handle avatar verified');
  if (!user) throw new ApiError(404, 'Reporter not found');

  res.json({ success: true, following: user.following });
});

// @desc    Search reporters by unique handle or name
// @route   GET /api/users/search
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
  const q = req.query.q || '';
  if (!q.trim()) {
    return res.json({ success: true, users: [] });
  }

  const cleanQ = q.trim().replace(/^@/, '');
  const users = await User.find({
    $or: [
      { handle: { $regex: cleanQ, $options: 'i' } },
      { name: { $regex: cleanQ, $options: 'i' } },
    ],
  })
    .select('-password')
    .limit(20);

  res.json({ success: true, users });
});

module.exports = { getProfile, updateProfile, updateAvatar, followUser, getAllUsers, getFollowers, getFollowing, searchUsers };
