export default function Waveform({ className = '', color = 'text-primary' }) {
  return (
    <span className={`waveform ${color} ${className}`} role="status" aria-label="Loading">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </span>
  )
}
