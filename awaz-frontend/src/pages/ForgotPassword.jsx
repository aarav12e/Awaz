import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import Waveform from '../components/Waveform'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Enter your email')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    setSent(true)
    toast.success('Reset link sent')
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Waveform className="text-primary" />
            <h1 className="font-display text-4xl tracking-tight">AWAZ</h1>
          </div>
          <p className="text-accent text-sm">Reset your password</p>
        </div>

        <div className="bg-base-200 border border-base-300 hairline rounded-xl p-6 sm:p-8 space-y-4">
          {sent ? (
            <p className="text-sm text-center text-base-content/90">
              If an account exists for <span className="font-mono">{email}</span>, a reset link is on its way.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wide text-accent mb-1.5 block">Email</label>
                <label className="input input-bordered flex items-center gap-2 bg-base-100 border-base-300">
                  <FiMail className="text-accent shrink-0" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="grow"
                  />
                </label>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-70">
                {loading ? <Waveform color="text-primary-content" /> : 'Send reset link'}
              </button>
            </form>
          )}

          <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-accent hover:text-bone transition-colors pt-2">
            <FiArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
