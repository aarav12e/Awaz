import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiMail, FiArrowLeft, FiKey, FiLock, FiCheckCircle } from 'react-icons/fi'
import Waveform from '../components/Waveform'
import api from '../lib/axios'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [receivedOtp, setReceivedOtp] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Enter your email address')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/send-otp', { email: email.trim() })
      if (data.success) {
        setReceivedOtp(data.otp)
        toast.success(`OTP Code: ${data.otp}`, { duration: 10000, icon: '🔑' })
        setStep(2)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Enter a valid 6-digit OTP code')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { email: email.trim(), otp: otp.trim() })
      if (data.success) {
        toast.success('OTP verified successfully!')
        setStep(3)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      })

      if (data.success) {
        toast.success(data.message || 'Password reset successful!')
        navigate('/login')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Waveform className="text-primary" />
            <h1 className="font-display text-4xl tracking-tight">AWAZ</h1>
          </div>
          <p className="text-accent text-sm">OTP Password Reset</p>
        </div>

        <div className="bg-base-200 border border-base-300 hairline rounded-xl p-6 sm:p-8 space-y-4">
          {/* Step Progress indicators */}
          <div className="flex items-center justify-between mb-4 px-2 border-b border-white/10 pb-3">
            <div className={`flex items-center gap-1.5 text-xs font-mono ${step >= 1 ? 'text-primary font-bold' : 'text-accent'}`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px]">1</span>
              Email
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-mono ${step >= 2 ? 'text-primary font-bold' : 'text-accent'}`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px]">2</span>
              OTP
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-mono ${step >= 3 ? 'text-primary font-bold' : 'text-accent'}`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px]">3</span>
              Password
            </div>
          </div>

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wide text-accent mb-1.5 block">Account Email</label>
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
                {loading ? <Waveform color="text-primary-content" /> : 'Send 6-Digit OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {receivedOtp && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-center">
                  <p className="text-xs text-accent">Your 6-Digit Verification OTP Code:</p>
                  <p className="font-mono text-2xl font-bold tracking-widest text-primary mt-1">{receivedOtp}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-mono uppercase tracking-wide text-accent mb-1.5 block">6-Digit OTP Code</label>
                <label className="input input-bordered flex items-center gap-2 bg-base-100 border-base-300">
                  <FiKey className="text-accent shrink-0" size={16} />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="grow font-mono text-lg tracking-widest"
                  />
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-70">
                {loading ? <Waveform color="text-primary-content" /> : 'Verify OTP Code'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-accent hover:text-bone text-center w-full block"
              >
                Change Email
              </button>
            </form>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="rounded-xl border border-success/30 bg-success/10 p-3 text-center flex items-center justify-center gap-2 text-success text-sm">
                <FiCheckCircle size={16} /> OTP Verified! Set your new password below.
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wide text-accent mb-1.5 block">New Password</label>
                <label className="input input-bordered flex items-center gap-2 bg-base-100 border-base-300">
                  <FiLock className="text-accent shrink-0" size={16} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="grow"
                  />
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-70">
                {loading ? <Waveform color="text-primary-content" /> : 'Reset & Save Password'}
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
