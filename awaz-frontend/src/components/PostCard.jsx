import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiHeart, FiMessageCircle, FiShare2, FiMapPin, FiPlay, FiMaximize2, FiPause } from 'react-icons/fi'
import LazyImage from './LazyImage'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'
import ReelModal from './ReelModal'

const verdictMeta = {
  unverified: { label: 'Unverified', color: 'text-amber-500', dot: 'bg-amber-500' },
  developing: { label: 'Developing', color: 'text-blue-400', dot: 'bg-blue-400' },
  verified:   { label: 'Verified',   color: 'text-emerald-400', dot: 'bg-emerald-400' },
  disputed:   { label: 'Disputed',   color: 'text-rose-500', dot: 'bg-rose-500' },
}

function timeAgo(dateInput) {
  const date = new Date(dateInput)
  const seconds = Math.floor((new Date() - date) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function PostCard({ post }) {
  const user = useAuthStore((s) => s.user)
  const isInitiallyLiked = user && post.likes?.includes(user.id || user._id)

  const [liked, setLiked] = useState(isInitiallyLiked)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [shareCount, setShareCount] = useState(post.shareCount || 0)
  const [isPlayingInline, setIsPlayingInline] = useState(false)
  const [showReelModal, setShowReelModal] = useState(false)
  const videoRef = useRef(null)

  const verdict = verdictMeta[post.verdict || 'unverified']

  const toggleLike = async () => {
    if (!user) {
      toast.error('Please log in to like posts')
      return
    }
    try {
      setLiked((v) => !v)
      setLikeCount((c) => (liked ? c - 1 : c + 1))
      const { data } = await api.put(`/posts/${post._id}/like`)
      if (data.success) {
        setLiked(data.liked)
        setLikeCount(data.likeCount)
      }
    } catch (err) {
      setLiked((v) => !v)
      setLikeCount((c) => (!liked ? c - 1 : c + 1))
      toast.error('Failed to like post')
    }
  }

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/post/${post._id}`
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
      const { data } = await api.put(`/posts/${post._id}/share`)
      if (data.success) {
        setShareCount(data.shareCount)
      }
    } catch (err) {
      console.error('Failed to share', err)
    }
  }

  const toggleInlineVideo = (e) => {
    e.stopPropagation()
    setIsPlayingInline((prev) => !prev)
  }

  const reporterHandle = post.reporter?.handle?.replace('@', '') || post.reporter?._id
  const reporterName = post.reporter?.name || 'Unknown'
  const reporterAvatar = post.reporter?.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Unknown'
  const videoUrl = post.video?.url

  const isImagePost = post.mediaType === 'image' || (videoUrl && videoUrl.match(/\.(jpg|jpeg|png|webp|gif)($|\?)/i))

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-base-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.16)] mb-6">
      {/* Post Header */}
      <div className="flex items-center gap-3 p-4 sm:p-5">
        <Link to={`/user/${reporterHandle}`}>
          <img
            src={reporterAvatar}
            alt={reporterName}
            className="h-11 w-11 shrink-0 rounded-full border border-white/10 bg-base-300 hover:opacity-80 transition-opacity cursor-pointer object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              to={`/user/${reporterHandle}`}
              className="truncate text-sm font-semibold hover:text-primary transition-colors"
            >
              {reporterName}
            </Link>
            {post.reporter?.verified && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] text-primary">
                PRESS
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-accent">
            <FiMapPin className="shrink-0" size={11} />
            <span className="truncate">{post.locationName || 'Unknown Location'}</span>
            <span>· {timeAgo(post.createdAt)}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] ${verdict.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${verdict.dot}`}></span>
          {verdict.label}
        </div>
      </div>

      {/* Media Container — Responsive Aspect Contain (No Crop) */}
      <div className="relative w-full max-h-[540px] bg-black flex items-center justify-center overflow-hidden">
        {!isImagePost && isPlayingInline && videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[540px] object-contain bg-black"
          />
        ) : (
          <div
            onClick={!isImagePost ? toggleInlineVideo : undefined}
            className={`relative w-full max-h-[540px] bg-black flex items-center justify-center group ${
              !isImagePost ? 'cursor-pointer' : ''
            }`}
          >
            {post.video?.thumbnailUrl || videoUrl ? (
              <img
                src={post.video?.thumbnailUrl || videoUrl}
                alt={post.caption}
                className="w-full max-h-[540px] object-contain bg-black transition-transform duration-300 group-hover:scale-[1.01]"
              />
            ) : (
              <div className="w-full h-64 bg-base-300 flex items-center justify-center p-6 text-center text-accent font-mono text-xs">
                {post.caption}
              </div>
            )}

            {/* Play Button Overlay (Only for Videos) */}
            {!isImagePost && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/60 backdrop-blur-md shadow-2xl transition-transform group-hover:scale-110">
                  <FiPlay className="ml-1 text-white" size={28} />
                </div>
              </div>
            )}

            {/* Reel Fullscreen Launch Button (Only for Videos) */}
            {!isImagePost && videoUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowReelModal(true)
                }}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md hover:bg-black/80 transition-all border border-white/20"
              >
                <FiMaximize2 size={13} /> Open Reel
              </button>
            )}

            {!isImagePost && post.video?.duration ? (
              <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-mono text-white backdrop-blur">
                {Math.round(post.video.duration)}s
              </span>
            ) : null}

            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-mono uppercase text-primary-content shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white live-dot"></span>
              Field
            </span>
          </div>
        )}
      </div>

      {/* Caption & Actions */}
      <div className="space-y-3 p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-base-content/90 sm:text-[15px]">{post.caption}</p>
        <div className="flex items-center gap-6 border-t border-base-content/10 pt-3 text-accent">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 text-sm font-mono transition-colors ${
              liked ? 'text-rose-500 font-bold' : 'hover:text-base-content'
            }`}
          >
            <FiHeart className={liked ? 'fill-rose-500 text-rose-500' : ''} size={18} />
            {likeCount}
          </button>
          <button
            onClick={() => setShowReelModal(true)}
            className="flex items-center gap-1.5 text-sm font-mono transition-colors hover:text-base-content"
          >
            <FiMessageCircle size={18} />
            {post.commentCount || 0}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm font-mono transition-colors hover:text-base-content"
          >
            <FiShare2 size={18} />
            {shareCount}
          </button>
        </div>
      </div>

      {/* Reel Modal popup option */}
      {showReelModal && <ReelModal post={post} onClose={() => setShowReelModal(false)} />}
    </article>
  )
}
