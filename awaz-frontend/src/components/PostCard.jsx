import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiHeart, FiMessageCircle, FiShare2, FiMapPin, FiPlay } from 'react-icons/fi'
import LazyImage from './LazyImage'
import { verdictMeta, timeAgo } from '../lib/mockData'

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const verdict = verdictMeta[post.verdict]

  const toggleLike = () => {
    setLiked((v) => !v)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(`https://awaz.app/post/${post.id}`)
    toast.success('Link copied')
  }

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-base-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
      <div className="flex items-center gap-3 p-4 sm:p-5">
        <img
          src={post.reporter.avatar}
          alt={post.reporter.name}
          className="h-11 w-11 shrink-0 rounded-full border border-white/10 bg-base-300"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{post.reporter.name}</span>
            {post.reporter.verified && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] text-primary">PRESS</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-accent">
            <FiMapPin className="shrink-0" size={11} />
            <span className="truncate">{post.location}</span>
            <span>· {timeAgo(post.timestamp)}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] ${verdict.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${verdict.dot}`}></span>
          {verdict.label}
        </div>
      </div>

      <div className="relative aspect-[4/5] w-full bg-base-300 group cursor-pointer sm:aspect-[5/6]">
        <LazyImage
          src={post.videoThumb}
          alt={post.caption}
          wrapperClassName="w-full h-full"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm">
            <FiPlay className="ml-0.5 text-bone" size={24} />
          </div>
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-mono text-bone">
          {post.duration}
        </span>
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
            {post.comments}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm font-mono transition-colors hover:text-bone"
          >
            <FiShare2 size={16} />
            {post.shares}
          </button>
        </div>
      </div>
    </article>
  )
}
