const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    caption: {
      type: String,
      required: [true, 'Caption is required'],
      maxlength: 500,
    },
    mediaType: {
      type: String,
      enum: ['video', 'image'],
      default: 'video',
    },
    // Cloudinary response fields — needed to manage/delete the asset later
    video: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      duration: { type: Number, default: 0 }, // seconds
      thumbnailUrl: { type: String, default: '' },
    },
    locationName: {
      type: String,
      default: '',
    },
    // GeoJSON point, enables $near / $geoWithin queries for local discovery
    geo: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    verdict: {
      type: String,
      enum: ['unverified', 'developing', 'verified', 'disputed'],
      default: 'unverified',
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shareCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    // Lightweight moderation queue — reported posts get reviewed before removal
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isRemoved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ geo: '2dsphere' }, { sparse: true });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
