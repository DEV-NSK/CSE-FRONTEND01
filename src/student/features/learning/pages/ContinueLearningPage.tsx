import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlayCircle, BookOpen } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner'
import { useContinueLearning } from '@/shared/hooks/useLearning'

export function ContinueLearningPage() {
  const navigate = useNavigate()
  const { data: continueLearning, isLoading, isError } = useContinueLearning()

  // Auto-redirect as soon as data arrives
  useEffect(() => {
    if (continueLearning?.lesson?.id) {
      navigate(`/dashboard/learning/lesson/${continueLearning.lesson.id}`, { replace: true })
    }
  }, [continueLearning, navigate])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner size="lg" label="Finding your latest lesson..." />
      </div>
    )
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold">Couldn't find your progress</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          There was an error retrieving your learning data. Try again or browse roadmaps.
        </p>
        <Button onClick={() => navigate('/dashboard/learning/roadmaps')}>
          Browse Roadmaps
        </Button>
      </motion.div>
    )
  }

  // No lesson in progress
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <PlayCircle className="h-8 w-8 text-primary" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold">Nothing in progress</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        You haven't started any lessons yet. Pick a roadmap to begin your learning journey.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate('/dashboard/learning/roadmaps')}>
          Browse Roadmaps
        </Button>
        <Button variant="outline" onClick={() => navigate('/dashboard/learning')}>
          Learning Home
        </Button>
      </div>
    </motion.div>
  )
}
