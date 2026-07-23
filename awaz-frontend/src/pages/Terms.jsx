import { Link } from 'react-router-dom'
import { FiArrowLeft, FiFileText } from 'react-icons/fi'

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col justify-between py-12 px-6">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
          <FiArrowLeft /> Back to Login
        </Link>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FiFileText className="text-red-500" size={24} />
            <h1 className="font-display text-3xl font-bold tracking-tight">Terms of Service</h1>
          </div>
          <p className="text-white/60 leading-relaxed text-sm">
            Last updated: July 2026
          </p>
          <p className="text-white/60 leading-relaxed">
            By using Awaz, you agree to these terms. You are fully responsible for the media reports and updates you file.
            Awaz is meant for reporting authentic events and news.
          </p>
        </div>

        <div className="space-y-4 border-t border-white/10 pt-6">
          <h2 className="text-lg font-semibold text-white/90">Conduct & Guidelines</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            - **No Harassment**: Reports must not target individuals for personal abuse.<br />
            - **Copyright**: You must own or have explicit rights to the video content you upload.<br />
            - **Truthfulness**: Intentionally falsified reporting or spam will result in immediate profile suspension.
          </p>
        </div>
      </div>

      <footer className="max-w-2xl mx-auto w-full text-center text-xs text-white/20 pt-8 border-t border-white/5">
        © {new Date().getFullYear()} Awaz · Built in India
      </footer>
    </div>
  )
}
