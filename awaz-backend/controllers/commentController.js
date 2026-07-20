const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    throw new ApiError(400, 'Comment text is required');
  }

  const post = await Post.findById(req.params.id);
  if (!post || post.isRemoved) throw new ApiError(404, 'Post not found');

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    text: text.trim(),
  });

  post.commentCount += 1;
  await post.save();

  const populated = await comment.populate('author', 'name handle avatar');

  res.status(201).json({ success: true, comment: populated });
});

// @desc    Get comments for a post, newest first, paginated
// @route   GET /api/posts/:id/comments?page=1&limit=20
// @access  Private
const getComments = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name handle avatar');

  res.json({ success: true, comments, page });
});

// @desc    Delete own comment
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own comments');
  }

  await comment.deleteOne();
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

  res.json({ success: true, message: 'Comment deleted' });
});

module.exports = { addComment, getComments, deleteComment };
