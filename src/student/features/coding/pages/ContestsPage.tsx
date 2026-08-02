// ─── FPRD-16: Contests Page — Coming Soon placeholder ────────────────────────

import { motion } from 'framer-motion'
import { Trophy, Calendar, Users } from 'lucide-react'
import { PageHeader } from '@/shared/components/common/PageHeader'

export function ContestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contests"
        description="Compete with peers in timed coding contests."
        breadcrumbs={[
          { label: 'Coding', href: '/dashboard/coding' },
          { label: 'Contests' },
        ]}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-4xl">
            🏆
          </div>
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            Soon
          </span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Contests Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Weekly and monthly coding contests are being prepared. Compete with students, earn badges,
          and climb the leaderboard!
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {[
            { icon: Trophy, label: 'Weekly Contests' },
            { icon: Calendar, label: 'Monthly Marathons' },
            { icon: Users, label: 'Team Contests' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
