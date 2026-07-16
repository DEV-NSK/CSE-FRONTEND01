import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from '@/student/components/navigation/Sidebar'
import { TopNav } from '@/student/components/navigation/TopNav'
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary'

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto" id="main-content">
          <motion.div
            key="dashboard-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 max-w-7xl mx-auto w-full"
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </motion.div>
        </main>
        <footer className="border-t border-border py-3 px-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CSE Student Platform. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
