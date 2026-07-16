import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ServerCrash, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <ServerCrash className="h-24 w-24 text-warning/40" />
        </div>
        <span className="text-5xl font-extrabold text-warning/30 block mb-4">500</span>
        <h1 className="text-2xl font-bold text-foreground mb-3">Server error</h1>
        <p className="text-muted-foreground mb-8">
          Something went wrong on our end. We're working to fix it. Please try again in a moment.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/">Home</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
