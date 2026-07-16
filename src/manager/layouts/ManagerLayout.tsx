import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ManagerSidebar } from '@/manager/components/ManagerSidebar'
import { ManagerHeader } from '@/manager/components/ManagerHeader'
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary'

export function ManagerLayout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" role="application" aria-label="Manager Console">
      <ManagerSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <ManagerHeader />
        <main
          id="manager-main-content"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
        >
          <motion.div
            key="manager-content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="p-6 min-h-full"
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </motion.div>
        </main>
        <footer className="border-t border-slate-200 bg-white py-2.5 px-6 text-center text-xs text-slate-400">
          Manager Console · CSE Platform © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  )
}
