import React from 'react'
import { Outlet } from 'react-router-dom'
import { AdminHeader } from '@/admin/components/AdminHeader'
import { AdminSidebar } from '@/admin/components/AdminSidebar'

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
