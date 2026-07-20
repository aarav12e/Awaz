# Awaz — Frontend

Open citizen journalism. Record it, upload it, let it be heard.

This is the **frontend only** — built with React + Vite, Tailwind v4, DaisyUI (custom "awaz" theme), GSAP, react-hot-toast, and Zustand. Backend (Node/Express + MongoDB + Cloudinary) is not wired up yet — auth and the feed currently run on mock data/timers in `src/store/useAuthStore.js` and `src/lib/mockData.js`, so you can click through the whole app immediately.

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Folder structure

```
src/
  components/
    skeletons/        Loading skeletons (PostCard, Feed, Profile)
    AppLayout.jsx      Shell: sidebar + topbar + mobile nav + <Outlet/>
    Sidebar.jsx         Desktop nav
    MobileNav.jsx        Bottom tab nav (mobile)
    TopBar.jsx            Mobile top brand bar
    PostCard.jsx           Feed video card (like/comment/share)
    LazyImage.jsx           IntersectionObserver-based lazy image + shimmer
    Waveform.jsx              Signature loading/live indicator (audio bars)
    ProtectedRoute.jsx         Redirects to /login if not authenticated
  pages/
    Login.jsx / Signup.jsx / ForgotPassword.jsx   GSAP entrance animation
    Feed.jsx            Home feed (protected)
    Explore.jsx           Grid discovery view
    Upload.jsx              "File a Report" — drag/drop video + caption + location
    Profile.jsx               Reporter profile + their dispatches
    NotFound.jsx
  store/
    useAuthStore.js    Zustand auth store (mock login/signup for now)
  lib/
    mockData.js        Placeholder feed data — swap for real API calls later
  App.jsx              Routes, lazy-loaded pages, Suspense fallback, Toaster
  main.jsx             Entry point, wraps App in BrowserRouter
  index.css            Tailwind + DaisyUI theme tokens, fonts, custom animations
```

## Design system

- **Colors:** Ink `#0B0D10` background, Bone `#F3EFE6` text, Signal Red `#E63946` (live/primary), Amber `#FFB020` (pending/secondary), Steel `#7C8B9A` (muted/meta)
- **Type:** Archivo Black (display/headlines), Inter (body), Space Mono (timestamps, locations, metadata — like a press wire)
- **Signature motif:** the animated waveform bars (`.waveform` in `index.css`, `<Waveform />` component) — ties back to "Awaz" (voice) and is used for loaders, the live badge, and submit buttons

## What's already implemented

- Route-based **lazy loading** — every page is `React.lazy()`'d, so only the code for the page you're on downloads (`App.jsx`)
- **Skeleton loaders** for the feed, post cards, and profile, shown while (simulated) data loads
- **Lazy-loaded images** with `IntersectionObserver` + shimmer placeholder + fade-in (`LazyImage.jsx`)
- **GSAP** entrance animation on Login/Signup (staggered form reveal + scrolling news-wire ticker)
- **react-hot-toast** wired globally for success/error feedback (login, signup, upload, share-link copy)
- **DaisyUI** custom dark theme (`awaz`) — buttons, inputs, badges all theme-aware
- Protected routes — `/`, `/explore`, `/upload`, `/profile` require the mock auth state

## Next: backend

When you're ready, tell me and we'll build:
- Express + MongoDB (Atlas) API: `/api/auth`, `/api/posts`, `/api/users`
- Multer → Cloudinary streaming upload (25GB free tier)
- JWT auth to replace the mock store
- Socket.io for live comment/like counts
- Geospatial queries for location-based discovery

Swap points are already marked with comments in `useAuthStore.js`, `mockData.js`, `Feed.jsx`, `Explore.jsx`, and `Upload.jsx`.
