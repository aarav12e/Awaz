import { useState, useRef, useEffect } from 'react'

/**
 * Lazy-loads an image only when it nears the viewport (IntersectionObserver),
 * shows a shimmer placeholder until it decodes, then fades it in.
 */
export default function LazyImage({ src, alt = '', className = '', wrapperClassName = '' }) {
  const [inView, setInView] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`relative overflow-hidden ${wrapperClassName}`}>
      {!loaded && <div className="skeleton-shimmer absolute inset-0" />}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}
