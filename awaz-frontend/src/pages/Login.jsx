import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SignIn, useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiArrowRight, FiRadio, FiGlobe, FiShield, FiZap } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import { Starfield } from '../components/ui/Starfield'

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading, isAuthenticated } = useAuthStore()
  const { isSignedIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const tickerRef = useRef(null)

  useEffect(() => {
    if (isSignedIn || isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isSignedIn, isAuthenticated, navigate])

  useEffect(() => {
    const el = tickerRef.current
    if (!el) return
    let pos = 0
    const speed = 0.4
    const tick = () => {
      pos -= speed
      if (Math.abs(pos) > el.scrollWidth / 2) pos = 0
      el.style.transform = `translateX(${pos}px)`
      rafId = requestAnimationFrame(tick)
    }
    let rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Enter email and password')
      return
    }
    const result = await login({ email, password })
    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Welcome back')
    navigate('/')
  }

  const isClerkConfigured =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY &&
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('placeholder')

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#06070a]">
      {/* Starfield background */}
      <div className="absolute inset-0 z-0">
        <Starfield
          starColor="rgba(255,255,255,0.85)"
          bgColor="rgba(6,7,10,1)"
          mouseAdjust
          speed={0.6}
          quantity={350}
          opacity={1}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(230,57,70,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Scrolling news ticker */}
      <div className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-sm py-2 overflow-hidden whitespace-nowrap">
        <div ref={tickerRef} className="inline-flex gap-12 font-mono text-[10px] uppercase tracking-widest text-white/40 will-change-transform">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="inline-flex gap-12 shrink-0">
              <span>Unfiltered dispatches, straight from the ground</span>
              <span className="text-red-500">·</span>
              <span>Every story starts with someone who was there</span>
              <span className="text-red-500">·</span>
              <span>Report what you see — Awaz carries it forward</span>
              <span className="text-red-500">·</span>
              <span>Open journalism, recorded by you</span>
              <span className="text-red-500">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="waveform text-red-500">
                <span /><span /><span /><span /><span />
              </span>
              <span className="font-display text-5xl tracking-tight text-white">AWAZ</span>
            </div>
            <p className="text-sm text-white/40 font-mono tracking-wide">Open journalism · Recorded by you</p>
          </div>

          {/* Form card or Clerk SignIn */}
          {isClerkConfigured ? (
            <div className="flex justify-center">
              <SignIn routing="path" path="/login" signUpUrl="/signup" fallbackRedirectUrl="/" forceRedirectUrl="/" />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
              <h2 className="mb-1 font-display text-xl text-white">Sign in</h2>
              <p className="mb-6 text-sm text-white/40">Enter the newsroom</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-mono uppercase tracking-widest text-white/40">
                    Email
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-red-500/50 focus-within:bg-white/8 transition-colors">
                    <FiMail className="shrink-0 text-white/30" size={15} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full bg-transparent text-sm text-white placeholder-white/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-mono uppercase tracking-widest text-white/40">
                    Password
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-red-500/50 focus-within:bg-white/8 transition-colors">
                    <FiLock className="shrink-0 text-white/30" size={15} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full bg-transparent text-sm text-white placeholder-white/20 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-white/30 hover:text-red-400 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-all hover:bg-red-500 active:scale-[0.98] disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="waveform text-white">
                        <span /><span /><span /><span /><span />
                      </span>
                      Signing in…
                    </>
                  ) : (
                    <>
                      Enter the newsroom <FiArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] font-mono text-white/20">OR</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <p className="text-center text-sm text-white/30">
                New here?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-white hover:text-red-400 transition-colors"
                >
                  Start reporting
                </Link>
              </p>
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { icon: FiShield, label: 'Anonymous safe' },
              { icon: FiZap, label: 'Real-time feed' },
              { icon: FiGlobe, label: 'Pan-India' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] py-3 text-center backdrop-blur-sm"
              >
                <Icon size={14} className="text-red-500/70" />
                <span className="text-[10px] font-mono uppercase tracking-wide text-white/30">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <FiRadio size={14} className="text-red-500" />
              <span className="font-display text-lg tracking-tight text-white">AWAZ</span>
              <span className="ml-1 rounded bg-red-600/20 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest text-red-400">
                Beta
              </span>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-1">
              {['About', 'Privacy', 'Terms', 'Contact', 'Open Source'].map((item) => (
                <span
                  key={item}
                  className="cursor-default text-xs text-white/25 transition-colors hover:text-white/50"
                >
                  {item}
                </span>
              ))}
            </nav>

            <p className="text-[11px] font-mono text-white/20">
              © {new Date().getFullYear()} Awaz · Built in India
            </p>
          </div>

          <p className="mt-4 text-center text-[11px] font-mono tracking-widest text-white/15 uppercase">
            Every voice is a dispatch · Report what you see
          </p>
        </div>
      </footer>
    </div>
  )
}
