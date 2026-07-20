import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import TopBar from './TopBar'

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-base-100 text-base-content">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-3 py-4 pb-24 md:px-5 md:py-6 md:pb-10 lg:px-8">
          <div className="mx-auto w-full max-w-3xl lg:max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
