import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-accent text-xs uppercase tracking-widest mb-3">Error 404</p>
      <h1 className="font-display text-3xl mb-2">Off the record</h1>
      <p className="text-accent text-sm mb-6">This page doesn't exist — or hasn't been filed yet.</p>
      <Link to="/" className="btn btn-primary btn-sm">Back to the feed</Link>
    </div>
  )
}
