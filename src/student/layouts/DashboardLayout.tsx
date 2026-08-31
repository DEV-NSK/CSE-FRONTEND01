import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from '@/student/components/navigation/Sidebar'
import { TopNav } from '@/student/components/navigation/TopNav'
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary'

export function DashboardLayout() {
  const location = useLocation()
  const isCodeFlow = location.pathname.endsWith('/codeflow')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav />
        {isCodeFlow ? (
          // CodeFlow gets the full remaining height — no padding, no max-width, no overflow-y-auto
          <main className="flex-1 overflow-hidden min-h-0" id="main-content">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto" id="main-content">
            <motion.div
              key="dashboard-content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5 max-w-[1400px] mx-auto w-full"
            >
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </main>
        )}
      </div>
    </div>
  )
}
