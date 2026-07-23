import { Link } from 'react-router-dom'
import { FiArrowLeft, FiShield } from 'react-icons/fi'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col justify-between py-12 px-6">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
          <FiArrowLeft /> Back to Login
        </Link>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FiShield className="text-red-500" size={24} />
            <h1 className="font-display text-3xl font-bold tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-white/60 leading-relaxed text-sm">
            Last updated: July 2026
          </p>
          <p className="text-white/60 leading-relaxed">
            Your privacy is fundamental to our mission. Awaz collects only the information necessary to authenticate
            your profile and allow you to upload reports. We do not sell your personal data or track your browsing activity across other sites.
          </p>
        </div>

        <div className="space-y-4 border-t border-white/10 pt-6">
          <h2 className="text-lg font-semibold text-white/90">Information We Collect</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            - **Account Information**: Username, email, profile name, and password (or Clerk auth details).<br />
            - **Dispatches**: Any video media you upload, along with optionally attached geolocation details to place the report on the map.
          </p>
        </div>
      </div>

      <footer className="max-w-2xl mx-auto w-full text-center text-xs text-white/20 pt-8 border-t border-white/5">
        © {new Date().getFullYear()} Awaz · Built in India
      </footer>
    </div>
  )
}
