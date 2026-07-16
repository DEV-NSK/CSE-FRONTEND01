import { motion } from 'framer-motion'
import { MoreVertical, Crown, Shield, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu'
import { getInitials, cn } from '@/shared/lib/utils'
import type { TeamMember, TeamMemberRole } from '@/shared/types/project'

interface MemberCardProps {
  member: TeamMember
  isCurrentUser: boolean
  canManage: boolean
  onRemove?: (memberId: string) => void
  onRoleChange?: (memberId: string, role: TeamMemberRole) => void
}

const roleConfig: Record<TeamMemberRole, { label: string; color: string; icon?: typeof Crown }> = {
  OWNER: { label: 'Owner', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-200', icon: Crown },
  LEADER: { label: 'Leader', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200', icon: Shield },
  DEVELOPER: { label: 'Developer', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200' },
  DESIGNER: { label: 'Designer', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200' },
  RESEARCHER: { label: 'Researcher', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-200' },
  TESTER: { label: 'Tester', color: 'text-rose-600 bg-rose-100 dark:bg-rose-900 dark:text-rose-200' },
}

const ROLES: TeamMemberRole[] = ['LEADER', 'DEVELOPER', 'DESIGNER', 'RESEARCHER', 'TESTER']

export function MemberCard({ member, isCurrentUser, canManage, onRemove, onRoleChange }: MemberCardProps) {
  const config = roleConfig[member.role]
  const RoleIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={member.user.profileImage} alt={member.user.fullName} />
              <AvatarFallback>{getInitials(member.user.fullName)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{member.user.fullName}</p>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">You</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>

              <div className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2', config.color)}>
                {RoleIcon && <RoleIcon className="h-3 w-3" aria-hidden="true" />}
                {config.label}
              </div>

              {(member.user.branch || member.user.year) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {[member.user.branch, member.user.year ? `Year ${member.user.year}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>

            {canManage && member.role !== 'OWNER' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Member options">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {ROLES.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => onRoleChange?.(member.id, role)}
                      className={cn(member.role === role && 'font-semibold')}
                    >
                      {roleConfig[role].label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onRemove?.(member.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
