import { Link } from 'react-router-dom'
import { FiArrowLeft, FiRadio } from 'react-icons/fi'

export default function About() {
  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col justify-between py-12 px-6">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
          <FiArrowLeft /> Back to Login
        </Link>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FiRadio className="text-red-500 animate-pulse" size={24} />
            <h1 className="font-display text-3xl font-bold tracking-tight">About Awaz</h1>
          </div>
          <p className="text-white/60 leading-relaxed">
            Awaz is a decentralized, citizen-first news dispatch and media platform built to give voice to where things happen.
            Unlike traditional mainstream media, Awaz allows anyone on the ground to capture raw, uncut footage of live updates,
            events, and happenings—delivering news directly from reporters to the feed.
          </p>
        </div>

        <div className="space-y-4 border-t border-white/10 pt-6">
          <h2 className="text-lg font-semibold text-white/90">Our Vision</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            We believe that truth resides in the field, not in editing rooms. Awaz is designed to build the most transparent
            and verified database of updates by letting users capture the world as it is.
          </p>
        </div>
      </div>

      <footer className="max-w-2xl mx-auto w-full text-center text-xs text-white/20 pt-8 border-t border-white/5">
        © {new Date().getFullYear()} Awaz · Built in India
      </footer>
    </div>
  )
}
