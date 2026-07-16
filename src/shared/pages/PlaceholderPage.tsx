import { motion } from 'framer-motion'
import { Construction } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'

interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: title }]}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <Construction className="h-16 w-16 text-muted-foreground/30 mb-4" aria-hidden="true" />
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold">{title} Module</h3>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              {description || `The ${title.toLowerCase()} module is currently under development and will be available in a future release.`}
            </p>
            <p className="text-xs text-muted-foreground mt-4 opacity-60">
              This placeholder will be replaced with full functionality in subsequent FPRDs.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
