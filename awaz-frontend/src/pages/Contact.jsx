import { Link } from 'react-router-dom'
import { FiArrowLeft, FiMail } from 'react-icons/fi'

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col justify-between py-12 px-6">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
          <FiArrowLeft /> Back to Login
        </Link>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FiMail className="text-red-500" size={24} />
            <h1 className="font-display text-3xl font-bold tracking-tight">Contact Us</h1>
          </div>
          <p className="text-white/60 leading-relaxed text-sm">
            Have questions, feedback, or report verification requests? Reach out to us.
          </p>
        </div>

        <div className="space-y-4 border-t border-white/10 pt-6">
          <h2 className="text-lg font-semibold text-white/90">Email Support</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Send us an email at **support@awaz.com** and we will get back to you as soon as possible.
          </p>
        </div>
      </div>

      <footer className="max-w-2xl mx-auto w-full text-center text-xs text-white/20 pt-8 border-t border-white/5">
        © {new Date().getFullYear()} Awaz · Built in India
      </footer>
    </div>
  )
}
