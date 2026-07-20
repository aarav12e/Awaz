import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import Waveform from '../components/Waveform'

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const brandRef = useRef(null)
  const tickerRef = useRef(null)
  const formElsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.set(panelRef.current, { autoAlpha: 1 })
        .from(brandRef.current, { y: -18, autoAlpha: 0, duration: 0.6 })
        .from(
          '.brand-underline',
          { scaleX: 0, transformOrigin: 'left center', duration: 0.5 },
          '-=0.3'
        )
        .from(
          formElsRef.current,
          { y: 16, autoAlpha: 0, duration: 0.5, stagger: 0.08 },
          '-=0.25'
        )

      // Ambient ticker scroll, evokes a breaking-news wire strip
      gsap.to(tickerRef.current, {
        xPercent: -50,
        duration: 22,
        ease: 'none',
        repeat: -1,
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Enter email and password')
      return
    }
    await login({ email, password })
    toast.success('Welcome back')
    navigate('/')
  }

  const addToForm = (el) => {
    if (el && !formElsRef.current.includes(el)) formElsRef.current.push(el)
  }

  return (
    <div ref={rootRef} className="min-h-screen bg-base-100 flex flex-col overflow-hidden">
      {/* Scrolling wire ticker */}
      <div className="border-b border-base-300 hairline overflow-hidden whitespace-nowrap py-2 bg-base-200">
        <div ref={tickerRef} className="inline-flex font-mono text-[11px] text-accent uppercase tracking-widest gap-8 will-change-transform">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="inline-flex gap-8">
              <span>Unfiltered dispatches, straight from the ground</span>
              <span>·</span>
              <span>Every story starts with someone who was there</span>
              <span>·</span>
              <span>Report what you see. Awaz carries it forward</span>
              <span>·</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div
          ref={panelRef}
          className="invisible w-full max-w-md"
        >
          <div ref={brandRef} className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Waveform className="text-primary" />
              <h1 className="font-display text-4xl tracking-tight">AWAZ</h1>
            </div>
            <div className="brand-underline h-0.5 w-16 bg-primary mx-auto mb-3" />
            <p className="text-accent text-sm">Open journalism. Recorded by you.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-base-200 border border-base-300 hairline rounded-xl p-6 sm:p-8 space-y-4">
            <div ref={addToForm}>
              <label className="text-xs font-mono uppercase tracking-wide text-accent mb-1.5 block">Email</label>
              <label className="input input-bordered flex items-center gap-2 bg-base-100 border-base-300">
                <FiMail className="text-accent shrink-0" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="grow"
                  autoComplete="email"
                />
              </label>
            </div>

            <div ref={addToForm}>
              <label className="text-xs font-mono uppercase tracking-wide text-accent mb-1.5 block">Password</label>
              <label className="input input-bordered flex items-center gap-2 bg-base-100 border-base-300">
                <FiLock className="text-accent shrink-0" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="grow"
                  autoComplete="current-password"
                />
              </label>
            </div>

            <div ref={addToForm} className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-accent hover:text-bone transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              ref={addToForm}
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Waveform color="text-primary-content" /> Signing in
                </>
              ) : (
                <>
                  Enter the newsroom <FiArrowRight size={16} />
                </>
              )}
            </button>

            <p ref={addToForm} className="text-center text-sm text-accent pt-1">
              New here?{' '}
              <Link to="/signup" className="text-bone font-medium hover:text-primary transition-colors">
                Start reporting
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
