import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiVolume2,
  FiVolumeX,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiX,
  FiSend,
  FiMapPin,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

export default function ReelModal({ post, onClose }) {
  const user = useAuthStore((s) => s.user)
  const videoRef = useRef(null)

  const isInitiallyLiked = user && post.likes?.includes(user.id || user._id)
  const [liked, setLiked] = useState(isInitiallyLiked)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [showPlayIcon, setShowPlayIcon] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentCount, setCommentCount] = useState(post.commentCount || 0)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().catch(() => setIsPlaying(false))
    }
  }, [post])

  const togglePlay = (e) => {
    e?.stopPropagation()
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }

    setShowPlayIcon(true)
    setTimeout(() => setShowPlayIcon(false), 800)
  }

  const toggleMute = (e) => {
    e?.stopPropagation()
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleLike = async (e) => {
    e?.stopPropagation()
    if (!user) {
      toast.error('Please log in to like dispatches')
      return
    }
    setLiked((v) => !v)
    setLikeCount((c) => (liked ? c - 1 : c + 1))

    try {
      const { data } = await api.put(`/posts/${post._id}/like`)
      if (data.success) {
        setLiked(data.liked)
        setLikeCount(data.likeCount)
      }
    } catch (err) {
      setLiked((v) => !v)
      setLikeCount((c) => (!liked ? c - 1 : c + 1))
      toast.error('Failed to update like')
    }
  }

  const openComments = async (e) => {
    e?.stopPropagation()
    setCommentsOpen(true)
    setLoadingComments(true)
    try {
      const { data } = await api.get(`/posts/${post._id}/comments`)
      if (data.success) {
        setComments(data.comments || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleAddComment = async (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (!commentText.trim()) return
    if (!user) {
      toast.error('Please log in to comment')
      return
    }
    setSubmittingComment(true)
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { text: commentText.trim() })
      if (data.success) {
        setComments((prev) => [data.comment, ...prev])
        setCommentCount((c) => c + 1)
        setCommentText('')
        toast.success('Comment posted!')
      }
    } catch (err) {
      toast.error('Failed to post comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleShare = async (e) => {
    e?.stopPropagation()
    try {
      const url = `${window.location.origin}/post/${post._id}`
      await navigator.clipboard.writeText(url)
      toast.success('Reel link copied!')
      api.put(`/posts/${post._id}/share`).catch(() => {})
    } catch (err) {
      console.error(err)
    }
  }

  const reporterHandle = post.reporter?.handle?.replace('@', '') || post.reporter?._id
  const reporterName = post.reporter?.name || 'Reporter'
  const reporterAvatar = post.reporter?.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Reporter'

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all cursor-pointer"
      >
        <FiX size={22} />
      </button>

      {/* Reel Container Card */}
      <div className="relative w-full max-w-sm h-[85vh] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-center">
        {/* Video Player */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {post.video?.url ? (
            <video
              ref={videoRef}
              src={post.video.url}
              loop
              playsInline
              muted={isMuted}
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer z-0"
            />
          ) : (
            <div className="p-6 text-center text-white/50 font-mono text-sm z-0">
              <p>{post.caption || 'Dispatch Report'}</p>
            </div>
          )}

          {/* Animated Play/Pause Indicator */}
          {showPlayIcon && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/20 animate-pulse">
              <div className="h-20 w-20 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center shadow-2xl">
                {isPlaying ? <FiPause size={36} /> : <FiPlay size={36} className="ml-1" />}
              </div>
            </div>
          )}

          {/* Sound Control */}
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur transition-all pointer-events-auto cursor-pointer"
          >
            {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
          </button>

          {/* Right Floating Actions (Like, Comment, Share) */}
          <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-5 pointer-events-auto">
            {/* Like */}
            <button onClick={handleLike} className="flex flex-col items-center gap-1 group cursor-pointer">
              <div
                className={`p-3 rounded-full backdrop-blur transition-all ${
                  liked
                    ? 'bg-rose-500 text-white scale-110 shadow-lg shadow-rose-500/40'
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <FiHeart size={24} className={liked ? 'fill-white' : ''} />
              </div>
              <span className="text-xs font-bold text-white shadow-sm font-mono">{likeCount}</span>
            </button>

            {/* Comment */}
            <button onClick={openComments} className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur transition-all">
                <FiMessageCircle size={24} />
              </div>
              <span className="text-xs font-bold text-white shadow-sm font-mono">{commentCount}</span>
            </button>

            {/* Share */}
            <button onClick={handleShare} className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur transition-all">
                <FiShare2 size={22} />
              </div>
              <span className="text-[10px] font-semibold text-white/80">Share</span>
            </button>
          </div>

          {/* Bottom Details Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-20 space-y-2 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <Link to={`/${reporterHandle}`}>
                <img
                  src={reporterAvatar}
                  alt={reporterName}
                  className="h-10 w-10 rounded-full object-cover border border-white/20 hover:scale-105 transition-transform"
                />
              </Link>
              <div className="min-w-0">
                <Link
                  to={`/${reporterHandle}`}
                  className="font-bold text-sm hover:underline flex items-center gap-1 text-white truncate"
                >
                  @{reporterHandle}
                  {post.reporter?.verified && <FiCheckCircle size={14} className="text-primary shrink-0" />}
                </Link>
                {post.locationName && (
                  <p className="text-[11px] text-white/70 flex items-center gap-1 truncate">
                    <FiMapPin size={10} /> {post.locationName}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-white/90 line-clamp-2 leading-relaxed font-normal pointer-events-auto">{post.caption}</p>
          </div>
        </div>

        {/* Slide-Up Comments Drawer */}
        {commentsOpen && (
          <div
            className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex flex-col justify-end transition-all"
          >
            <div className="h-[65%] w-full bg-base-100 rounded-t-3xl border-t border-base-content/10 flex flex-col p-4 space-y-3 pointer-events-auto">
              <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
                <h3 className="font-display font-bold text-sm text-base-content">Comments ({comments.length})</h3>
                <button
                  onClick={() => setCommentsOpen(false)}
                  className="btn btn-xs btn-circle btn-ghost text-base-content/60"
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Comment List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <span className="waveform text-primary">
                      <span></span><span></span><span></span><span></span>
                    </span>
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-center py-8 text-base-content/40 font-mono">
                    No comments yet. Be the first to start the conversation!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="flex gap-2.5 text-xs">
                      <img
                        src={c.user?.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=User'}
                        alt={c.user?.name}
                        className="h-7 w-7 rounded-full object-cover shrink-0 bg-base-300"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-base-content text-xs">
                            {c.user?.name || c.user?.handle}
                          </span>
                          <span className="text-[10px] text-base-content/40">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-base-content/80 mt-0.5 whitespace-pre-line leading-normal">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Bar */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-base-content/10">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="input input-sm flex-1 bg-base-200 text-xs text-base-content border-base-content/10 rounded-full focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="btn btn-sm btn-circle bg-primary hover:bg-primary/90 text-white border-0 disabled:opacity-50"
                >
                  <FiSend size={14} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
