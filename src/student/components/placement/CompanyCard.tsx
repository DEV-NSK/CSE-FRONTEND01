import { Link } from 'react-router-dom'
import { Building2, MapPin, Briefcase, BadgeCheck } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { CompanyListItem } from '@/shared/types/placement'

interface CompanyCardProps {
  company: CompanyListItem
  viewMode?: 'grid' | 'list'
}

export function CompanyCard({ company, viewMode = 'grid' }: CompanyCardProps) {
  if (viewMode === 'list') {
    return (
      <Link to={`/dashboard/placement/companies/${company.id}`}>
        <Card className="hover:border-primary/50 hover:shadow-sm transition-all">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-10 w-10 object-contain" />
              ) : (
                <Building2 className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground truncate">{company.name}</p>
                {company.isVerified && <BadgeCheck className="h-4 w-4 text-primary shrink-0" />}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{company.industry}</span>
                {company.headquarters && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.headquarters}</span>}
              </div>
            </div>
            <div className="shrink-0">
              <Badge variant="outline" className="gap-1">
                <Briefcase className="h-3 w-3" />{company.openJobsCount} jobs
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link to={`/dashboard/placement/companies/${company.id}`}>
      <Card className="hover:border-primary/50 hover:shadow-sm transition-all h-full">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-10 w-10 object-contain" />
              ) : (
                <Building2 className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            {company.isVerified && (
              <Badge variant="info" className="gap-1 text-xs">
                <BadgeCheck className="h-3 w-3" />Verified
              </Badge>
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{company.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{company.industry}</p>
          </div>
          {company.headquarters && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />{company.headquarters}
            </p>
          )}
          <div className="mt-auto pt-2 border-t border-border">
            <Badge variant="outline" className="gap-1 text-xs">
              <Briefcase className="h-3 w-3" />{company.openJobsCount} open positions
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
