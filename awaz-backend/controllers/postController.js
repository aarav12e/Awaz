const fs = require('fs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const cloudinary = require('../config/cloudinary');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Create a new dispatch (video post)
// @route   POST /api/posts
// @access  Private
// Expects multipart/form-data: video (file), caption, locationName, lng, lat
const createPost = asyncHandler(async (req, res) => {
  const { caption, locationName, lng, lat } = req.body;

  if (!req.file) {
    throw new ApiError(400, 'A video file is required');
  }
  if (!caption || !caption.trim()) {
    fs.unlink(req.file.path, () => {});
    throw new ApiError(400, 'Caption is required');
  }

  const pathModule = require('path');
  const ext = pathModule.extname(req.file.path).toLowerCase();
  const isImage = (req.file.mimetype && req.file.mimetype.startsWith('image/')) ||
    ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);

  let uploadResult;
  try {
    uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: isImage ? 'image' : 'video',
      folder: 'awaz/posts',
    });
  } catch (cloudinaryError) {
    console.error('================ CLOUDINARY UPLOAD ERROR ================');
    console.error(cloudinaryError);
    console.error('=========================================================');
    throw new ApiError(500, `Cloudinary upload failed: ${cloudinaryError.message}`);
  } finally {
    // Always clean up the temp file, upload succeeded or not.
    fs.unlink(req.file.path, () => {});
  }

  const secureUrl = uploadResult.secure_url;
  const thumbnailUrl = isImage ? secureUrl : (secureUrl ? secureUrl.replace(/\.[^/.]+$/, '.jpg') : '');

  const postData = {
    reporter: req.user._id,
    caption: caption.trim(),
    locationName: locationName || '',
    mediaType: isImage ? 'image' : 'video',
    video: {
      url: secureUrl,
      publicId: uploadResult.public_id,
      duration: uploadResult.duration || 0,
      thumbnailUrl: thumbnailUrl,
    },
  };

  const parsedLng = parseFloat(lng);
  const parsedLat = parseFloat(lat);
  if (!isNaN(parsedLng) && !isNaN(parsedLat)) {
    postData.geo = {
      type: 'Point',
      coordinates: [parsedLng, parsedLat],
    };
  }

  const post = await Post.create(postData);

  const populated = await post.populate('reporter', 'name handle avatar verified');

  res.status(201).json({ success: true, post: populated });
});

// @desc    Get paginated feed, newest first
// @route   GET /api/posts?page=1&limit=10
// @access  Private
const getFeed = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 30);
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ isRemoved: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporter', 'name handle avatar verified'),
    Post.countDocuments({ isRemoved: false }),
  ]);

  res.json({
    success: true,
    posts,
    page,
    totalPages: Math.ceil(total / limit),
    totalPosts: total,
  });
});

// @desc    Get dispatches near a coordinate (for local discovery)
// @route   GET /api/posts/nearby?lng=..&lat=..&radiusKm=10
// @access  Private
const getNearby = asyncHandler(async (req, res) => {
  const { lng, lat } = req.query;
  const radiusKm = parseFloat(req.query.radiusKm) || 10;

  if (!lng || !lat) {
    throw new ApiError(400, 'lng and lat query params are required');
  }

  const posts = await Post.find({
    isRemoved: false,
    geo: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: radiusKm * 1000,
      },
    },
  })
    .limit(50)
    .populate('reporter', 'name handle avatar verified');

  res.json({ success: true, posts });
});

// @desc    Get a single post by id
// @route   GET /api/posts/:id
// @access  Private
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    'reporter',
    'name handle avatar verified'
  );
  if (!post || post.isRemoved) {
    throw new ApiError(404, 'Post not found');
  }
  res.json({ success: true, post });
});

// @desc    Toggle like on a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isRemoved) {
    throw new ApiError(404, 'Post not found');
  }

  const userId = req.user._id.toString();
  const alreadyLiked = post.likes.some((id) => id.toString() === userId);

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== userId);
  } else {
    post.likes.push(req.user._id);
  }
  await post.save();

  res.json({ success: true, liked: !alreadyLiked, likeCount: post.likes.length });
});

// @desc    Increment share count (called when the share link is copied)
// @route   PUT /api/posts/:id/share
// @access  Private
const registerShare = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { shareCount: 1 } },
    { new: true }
  );
  if (!post) throw new ApiError(404, 'Post not found');
  res.json({ success: true, shareCount: post.shareCount });
});

// @desc    Report a post for moderation review
// @route   POST /api/posts/:id/report
// @access  Private
const reportPost = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post || post.isRemoved) throw new ApiError(404, 'Post not found');

  post.reports.push({ user: req.user._id, reason: reason || 'Not specified' });
  await post.save();

  res.json({ success: true, message: 'Report submitted for review' });
});

// @desc    Delete own post (removes Cloudinary asset too)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found');

  if (post.reporter.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own dispatches');
  }

  await cloudinary.uploader.destroy(post.video.publicId, { resource_type: 'video' });
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ success: true, message: 'Post deleted' });
});

module.exports = {
  createPost,
  getFeed,
  getNearby,
  getPostById,
  toggleLike,
  registerShare,
  reportPost,
  deletePost,
};
