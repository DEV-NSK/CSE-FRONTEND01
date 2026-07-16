import { useState } from 'react'
import { Bell, Send, FileText, History, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'

const mockHistory = [
  { id: '1', title: 'Placement Drive Alert', type: 'Broadcast', recipients: 'All Students', sentAt: 'Jul 17, 2026 10:00', status: 'sent' },
  { id: '2', title: 'New Roadmap Available', type: 'Announcement', recipients: 'CS Students', sentAt: 'Jul 16, 2026 14:30', status: 'sent' },
  { id: '3', title: 'Daily Challenge Reminder', type: 'Scheduled', recipients: 'All Students', sentAt: 'Jul 15, 2026 08:00', status: 'sent' },
  { id: '4', title: 'System Maintenance Notice', type: 'System', recipients: 'All Users', sentAt: 'Jul 14, 2026 20:00', status: 'sent' },
  { id: '5', title: 'Contest Results', type: 'Broadcast', recipients: 'Participants', sentAt: 'Jul 13, 2026 18:00', status: 'sent' },
]

const TABS = [
  { id: 'compose', label: 'Compose', icon: Send },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'history', label: 'History', icon: History },
  { id: 'recipients', label: 'Recipients', icon: Users },
]

export default function ManagerNotificationsPage() {
  const [activeTab, setActiveTab] = useState('compose')
  const [notifTitle, setNotifTitle] = useState('')
  const [notifBody, setNotifBody] = useState('')
  const [notifType, setNotifType] = useState('broadcast')

  return (
    <div className="space-y-5" role="main" aria-label="Notifications">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-amber-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500">Compose, broadcast and manage notifications</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === id
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === 'compose' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Compose Notification</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="notif-type">Type</label>
                <select
                  id="notif-type"
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="broadcast">Broadcast (All Students)</option>
                  <option value="targeted">Targeted (Specific Users)</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="system">System Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="notif-title">Title</label>
                <input
                  id="notif-title"
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Notification title..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="notif-body">Message</label>
                <textarea
                  id="notif-body"
                  rows={4}
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  placeholder="Write your notification message..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                  Send Now
                </Button>
                <Button variant="outline" className="text-slate-600">Save Draft</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm" aria-label="Notification history">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Recipients</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Sent At</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.map((n) => (
                  <tr key={n.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{n.title}</td>
                    <td className="px-4 py-3 text-slate-500">{n.type}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{n.recipients}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{n.sentAt}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {n.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(activeTab === 'templates' || activeTab === 'recipients') && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm capitalize">{activeTab} section – manage your {activeTab} here</p>
          </div>
        )}
      </div>
    </div>
  )
}
