export default function TopBar() {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center gap-2 px-4 py-3 bg-base-100/95 backdrop-blur border-b border-base-300 hairline">
      <span className="waveform text-primary">
        <span></span><span></span><span></span><span></span><span></span>
      </span>
      <span className="font-display text-lg tracking-tight">AWAZ</span>
    </header>
  )
}
