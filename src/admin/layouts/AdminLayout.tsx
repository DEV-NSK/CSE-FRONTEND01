import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AdminSidebar } from '@/admin/components/AdminSidebar'
import { AdminHeader } from '@/admin/components/AdminHeader'
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary'

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden" role="application" aria-label="Super Admin Console">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-950">
        <AdminHeader />
        <main
          id="admin-main-content"
          className="flex-1 overflow-y-auto bg-slate-950"
          tabIndex={-1}
        >
          <motion.div
            key="admin-content"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="p-6 min-h-full"
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </motion.div>
        </main>
        <footer className="border-t border-slate-800 bg-slate-950 py-2 px-5 text-center text-[10px] text-slate-700 tracking-wide uppercase">
          Super Admin Console · CSE Platform · v1.0.0
        </footer>
      </div>
    </div>
  )
}
