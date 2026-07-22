import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import Waveform from '../components/Waveform'

export default function Signup() {
  const navigate = useNavigate()
  const { signup, isLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const panelRef = useRef(null)
  const brandRef = useRef(null)
  const formElsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.set(panelRef.current, { autoAlpha: 1 })
        .from(brandRef.current, { y: -18, autoAlpha: 0, duration: 0.6 })
        .from('.brand-underline', { scaleX: 0, transformOrigin: 'left center', duration: 0.5 }, '-=0.3')
        .from(formElsRef.current, { y: 16, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, '-=0.25')
    })
    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error('Fill in all fields')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    const result = await signup({ name, email, password })
    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success('Account created — welcome to Awaz')
    navigate('/')
  }

  const addToForm = (el) => {
    if (el && !formElsRef.current.includes(el)) formElsRef.current.push(el)
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 py-10">
      <div ref={panelRef} className="invisible w-full max-w-md">
        <div ref={brandRef} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Waveform className="text-primary" />
            <h1 className="font-display text-4xl tracking-tight">AWAZ</h1>
          </div>
          <div className="brand-underline h-0.5 w-16 bg-primary mx-auto mb-3" />
          <p className="text-accent text-sm">Every voice is a dispatch.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-base-200 border border-base-300 hairline rounded-xl p-6 sm:p-8 space-y-4">
          <div ref={addToForm}>
            <label className="text-xs font-mono uppercase tracking-wide text-accent mb-1.5 block">Full name</label>
            <label className="input input-bordered flex items-center gap-2 bg-base-100 border-base-300">
              <FiUser className="text-accent shrink-0" size={16} />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Kumar" className="grow" />
            </label>
          </div>

          <div ref={addToForm}>
            <label className="text-xs font-mono uppercase tracking-wide text-accent mb-1.5 block">Email</label>
            <label className="input input-bordered flex items-center gap-2 bg-base-100 border-base-300">
              <FiMail className="text-accent shrink-0" size={16} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="grow" />
            </label>
          </div>

          <div ref={addToForm}>
            <label className="text-xs font-mono uppercase tracking-wide text-accent mb-1.5 block">Password</label>
            <label className="input input-bordered flex items-center gap-2 bg-base-100 border-base-300">
              <FiLock className="text-accent shrink-0" size={16} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="grow" />
            </label>
          </div>

          <button ref={addToForm} type="submit" disabled={isLoading} className="btn btn-primary w-full gap-2 disabled:opacity-70">
            {isLoading ? (
              <>
                <Waveform color="text-primary-content" /> Creating account
              </>
            ) : (
              <>
                Start reporting <FiArrowRight size={16} />
              </>
            )}
          </button>

          <p ref={addToForm} className="text-center text-sm text-accent pt-1">
            Already on Awaz?{' '}
            <Link to="/login" className="text-bone font-medium hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
