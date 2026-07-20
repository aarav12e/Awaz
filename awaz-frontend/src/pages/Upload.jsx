import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiUploadCloud, FiMapPin, FiFilm, FiX } from 'react-icons/fi'
import Waveform from '../components/Waveform'

export default function Upload() {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    if (!f.type.startsWith('video/')) {
      toast.error('Only video files are supported')
      return
    }
    if (f.size > 500 * 1024 * 1024) {
      toast.error('Keep clips under 500MB for now')
      return
    }
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Attach a video first')
      return
    }
    if (!caption.trim()) {
      toast.error('Add a short caption for context')
      return
    }
    setSubmitting(true)
    // Placeholder — will POST multipart form data to /api/posts,
    // which streams the file to Cloudinary on the backend.
    await new Promise((r) => setTimeout(r, 1600))
    setSubmitting(false)
    toast.success('Dispatch submitted for review')
    setFile(null)
    setCaption('')
    setLocation('')
  }

  return (
    <div>
      <h1 className="font-display text-xl tracking-tight mb-1">File a Report</h1>
      <p className="text-accent text-sm mb-6">Raw footage, straight from where it happened.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer p-8 text-center ${
            dragOver ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-200'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FiFilm className="text-primary" size={22} />
              <div className="text-left">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-accent font-mono">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <FiX size={14} />
              </button>
            </div>
          ) : (
            <>
              <FiUploadCloud className="mx-auto mb-3 text-accent" size={30} />
              <p className="text-sm font-medium">Drag a clip here, or tap to browse</p>
              <p className="text-xs text-accent mt-1">MP4, MOV — up to 500MB</p>
            </>
          )}
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-accent mb-1.5 block">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's happening in this clip? Give viewers the context they need."
            rows={4}
            className="textarea textarea-bordered w-full bg-base-200 border-base-300"
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-accent mb-1.5 block">Location</label>
          <label className="input input-bordered flex items-center gap-2 bg-base-200 border-base-300">
            <FiMapPin className="text-accent shrink-0" size={16} />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Neighborhood, city"
              className="grow"
            />
          </label>
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary w-full gap-2 disabled:opacity-70">
          {submitting ? (
            <>
              <Waveform color="text-primary-content" /> Uploading dispatch
            </>
          ) : (
            'Submit report'
          )}
        </button>
      </form>
    </div>
  )
}
