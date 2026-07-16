import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldX, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <ShieldX className="h-24 w-24 text-destructive/30" />
        </div>
        <span className="text-5xl font-extrabold text-destructive/20 block mb-4">403</span>
        <h1 className="text-2xl font-bold text-foreground mb-3">Access denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page. Contact your administrator if you think this is a mistake.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
          <Button asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
