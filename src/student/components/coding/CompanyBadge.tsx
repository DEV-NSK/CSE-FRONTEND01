import { Building2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { CodingCompany } from '@/shared/types/coding'

interface CompanyBadgeProps {
  company: CodingCompany | string
  className?: string
}

export function CompanyBadge({ company, className }: CompanyBadgeProps) {
  const name = typeof company === 'string' ? company : company.name

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        'border border-border bg-card text-muted-foreground',
        className
      )}
    >
      <Building2 className="h-3 w-3" aria-hidden="true" />
      {name}
    </span>
  )
}
