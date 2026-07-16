import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { ResumeTemplate } from '@/shared/types/placement'

interface TemplateCardProps {
  template: ResumeTemplate
  isSelected: boolean
  onSelect: (id: string) => void
  onPreview?: (id: string) => void
}

export function TemplateCard({ template, isSelected, onSelect, onPreview }: TemplateCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card
        className={cn(
          'cursor-pointer overflow-hidden transition-all border-2',
          isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
        )}
        onClick={() => onSelect(template.id)}
      >
        <div className="relative h-48 bg-muted overflow-hidden">
          {template.preview ? (
            <img
              src={template.preview}
              alt={template.name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-24 h-32 bg-card border border-border rounded shadow-sm flex flex-col gap-2 p-2">
                <div className="h-2 bg-primary/30 rounded" />
                <div className="h-1.5 bg-muted-foreground/20 rounded w-3/4" />
                <div className="h-1.5 bg-muted-foreground/20 rounded w-1/2" />
                <div className="border-t border-border mt-1 pt-1 space-y-1">
                  <div className="h-1 bg-muted-foreground/15 rounded" />
                  <div className="h-1 bg-muted-foreground/15 rounded w-4/5" />
                </div>
              </div>
            </div>
          )}
          {isSelected && (
            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
              <div className="bg-primary text-primary-foreground rounded-full p-1.5">
                <Check className="h-4 w-4" />
              </div>
            </div>
          )}
          {template.isPopular && (
            <Badge className="absolute top-2 right-2 text-xs">Popular</Badge>
          )}
        </div>
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-medium text-sm text-foreground">{template.name}</p>
              {template.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{template.description}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              {onPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={(e) => { e.stopPropagation(); onPreview(template.id) }}
                >
                  Preview
                </Button>
              )}
              <Button
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7 px-2"
                onClick={(e) => { e.stopPropagation(); onSelect(template.id) }}
              >
                {isSelected ? 'Selected' : 'Use'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
