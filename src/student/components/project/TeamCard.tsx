import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, CheckSquare, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { getInitials } from '@/shared/lib/utils'
import type { Team } from '@/shared/types/project'

interface TeamCardProps {
  team: Team
}

const statusColors: Record<string, string> = {
  OPEN: 'success',
  FULL: 'warning',
  CLOSED: 'secondary',
  COMPLETED: 'info',
}

export function TeamCard({ team }: TeamCardProps) {
  const memberCount = team.members?.length ?? team._count?.members ?? 0
  const taskCount = team._count?.tasks ?? 0

  return (
    <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">{team.name}</h3>
              {team.project && (
                <p className="text-xs text-muted-foreground truncate">{team.project.title}</p>
              )}
            </div>
            <Badge
              variant={(statusColors[team.status] as 'success' | 'warning' | 'secondary' | 'info') ?? 'outline'}
              className="shrink-0 text-xs"
            >
              {team.status}
            </Badge>
          </div>

          {/* Members avatars */}
          {team.members && team.members.length > 0 && (
            <div className="flex -space-x-2 mb-3">
              {team.members.slice(0, 5).map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.user.profileImage} alt={member.user.fullName} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(member.user.fullName)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {memberCount > 5 && (
                <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-medium">
                  +{memberCount - 5}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" aria-hidden="true" />
              {memberCount}/{team.maxMembers} members
            </span>
            {taskCount > 0 && (
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" aria-hidden="true" />
                {taskCount} tasks
              </span>
            )}
          </div>

          <Button variant="ghost" size="sm" className="w-full mt-3 h-8 text-xs gap-1" asChild>
            <Link to={`/dashboard/projects/team/${team.id}`}>
              Open Dashboard <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
