import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiHeart, FiMessageCircle, FiShare2, FiMapPin, FiPlay } from 'react-icons/fi'
import LazyImage from './LazyImage'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

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
  // Check if current user liked it
  const isInitiallyLiked = user && post.likes?.includes(user.id || user._id)
  
  const [liked, setLiked] = useState(isInitiallyLiked)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [shareCount, setShareCount] = useState(post.shareCount || 0)
  
  const verdict = verdictMeta[post.verdict || 'unverified']

  const toggleLike = async () => {
    if (!user) {
      toast.error('Please log in to like posts')
      return
    }
    try {
      // Optimistic update
      setLiked((v) => !v)
      setLikeCount((c) => (liked ? c - 1 : c + 1))
      
      const { data } = await api.put(`/posts/${post._id}/like`)
      if (data.success) {
        setLiked(data.liked)
        setLikeCount(data.likeCount)
      }
    } catch (err) {
      // Revert on error
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
      
      // Register share on backend
      const { data } = await api.put(`/posts/${post._id}/share`)
      if (data.success) {
        setShareCount(data.shareCount)
      }
    } catch (err) {
      console.error('Failed to share', err)
    }
  }

  // Handle nested objects safely
  const reporterHandle = post.reporter?.handle?.replace('@', '') || post.reporter?._id
  const reporterName = post.reporter?.name || 'Unknown'
  const reporterAvatar = post.reporter?.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Unknown'
  
  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-base-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
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
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] text-primary">PRESS</span>
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

      <div className="relative aspect-[4/5] w-full bg-base-300 group cursor-pointer sm:aspect-[5/6]">
        <LazyImage
          src={post.video?.thumbnailUrl || ''}
          alt={post.caption}
          wrapperClassName="w-full h-full"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm">
            <FiPlay className="ml-0.5 text-bone" size={24} />
          </div>
        </div>
        {post.video?.duration && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-mono text-bone">
            {Math.round(post.video.duration)}s
          </span>
        )}
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-mono uppercase text-primary-content">
          <span className="h-1.5 w-1.5 rounded-full bg-bone live-dot"></span>
          Field
        </span>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-base-content/90 sm:text-[15px]">{post.caption}</p>
        <div className="flex items-center gap-5 border-t border-white/10 pt-3 text-accent">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 text-sm font-mono transition-colors ${liked ? 'text-primary' : 'hover:text-bone'}`}
          >
            <FiHeart className={liked ? 'fill-primary' : ''} size={16} />
            {likeCount}
          </button>
          <button className="flex items-center gap-1.5 text-sm font-mono transition-colors hover:text-bone">
            <FiMessageCircle size={16} />
            {post.commentCount || 0}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm font-mono transition-colors hover:text-bone"
          >
            <FiShare2 size={16} />
            {shareCount}
          </button>
        </div>
      </div>
    </article>
  )
}
