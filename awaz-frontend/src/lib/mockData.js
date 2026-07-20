// Placeholder feed data. Will be replaced by GET /api/posts once the backend is ready.
export const mockPosts = [
  {
    id: 'p1',
    reporter: {
      name: 'Neha Verma',
      handle: '@neha.onground',
      avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Neha',
      verified: true,
    },
    location: 'Lajpat Nagar, New Delhi',
    timestamp: '2026-07-20T05:12:00Z',
    caption: 'Waterlogging on the main market road after last night\'s rain. Shopkeepers say drains haven\'t been cleared since June.',
    videoThumb: 'https://images.unsplash.com/photo-1614785171195-3054e88c67fe?q=80&w=1000&auto=format&fit=crop',
    duration: '00:47',
    verdict: 'unverified',
    likes: 128,
    comments: 34,
    shares: 12,
  },
  {
    id: 'p2',
    reporter: {
      name: 'Imran Sheikh',
      handle: '@imran.reports',
      avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Imran',
      verified: true,
    },
    location: 'Andheri East, Mumbai',
    timestamp: '2026-07-20T03:45:00Z',
    caption: 'BMC crew repairing the footbridge near the station. Commuters have been asking about this for months.',
    videoThumb: 'https://images.unsplash.com/photo-1600591332094-e63d3453b1f7?q=80&w=1000&auto=format&fit=crop',
    duration: '01:12',
    verdict: 'verified',
    likes: 402,
    comments: 88,
    shares: 55,
  },
  {
    id: 'p3',
    reporter: {
      name: 'Priya Nair',
      handle: '@priya.frames',
      avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Priya',
      verified: false,
    },
    location: 'Koramangala, Bengaluru',
    timestamp: '2026-07-19T22:10:00Z',
    caption: 'Street vendors protesting the new eviction notices outside the BBMP office this evening.',
    videoThumb: 'https://images.unsplash.com/photo-1591189863430-ab87e120f312?q=80&w=1000&auto=format&fit=crop',
    duration: '02:03',
    verdict: 'developing',
    likes: 671,
    comments: 203,
    shares: 140,
  },
  {
    id: 'p4',
    reporter: {
      name: 'Karan Bhatt',
      handle: '@karan.filesit',
      avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Karan',
      verified: false,
    },
    location: 'Sector 62, Noida',
    timestamp: '2026-07-19T18:30:00Z',
    caption: 'Power outage across the sector for the third time this week. Residents want answers from the discom.',
    videoThumb: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1000&auto=format&fit=crop',
    duration: '00:38',
    verdict: 'unverified',
    likes: 95,
    comments: 21,
    shares: 8,
  },
]

export const verdictMeta = {
  verified: { label: 'Verified', color: 'text-success', dot: 'bg-success' },
  developing: { label: 'Developing', color: 'text-warning', dot: 'bg-warning' },
  unverified: { label: 'Unverified', color: 'text-accent', dot: 'bg-accent' },
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
