import { motion } from 'framer-motion'
import { Check, X, Clock, UserPlus } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { getInitials } from '@/shared/lib/utils'
import type { TeamInvitation, InvitationStatus } from '@/shared/types/project'

interface InvitationCardProps {
  invitation: TeamInvitation
  type: 'sent' | 'received'
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
  isLoading?: boolean
}

const statusConfig: Record<InvitationStatus, { label: string; variant: 'success' | 'warning' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  ACCEPTED: { label: 'Accepted', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  EXPIRED: { label: 'Expired', variant: 'outline' },
}

export function InvitationCard({ invitation, type, onAccept, onReject, isLoading }: InvitationCardProps) {
  const person = type === 'received' ? invitation.sender : invitation.receiver
  const config = statusConfig[invitation.status]
  const isExpired = new Date(invitation.expiresAt) < new Date()
  const isPending = invitation.status === 'PENDING' && !isExpired

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
              <UserPlus className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm truncate">
                  {invitation.team?.name ?? 'Unknown Team'}
                </p>
                <Badge variant={isExpired ? 'outline' : config.variant} className="text-xs shrink-0">
                  {isExpired ? 'Expired' : config.label}
                </Badge>
              </div>

              {invitation.team?.project && (
                <p className="text-xs text-muted-foreground">{invitation.team.project.title}</p>
              )}

              {person && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={person.profileImage} alt={person.fullName} />
                    <AvatarFallback className="text-[9px]">{getInitials(person.fullName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {type === 'received' ? `From ${person.fullName}` : `To ${person.fullName}`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>
                  {isExpired
                    ? `Expired ${new Date(invitation.expiresAt).toLocaleDateString()}`
                    : `Expires ${new Date(invitation.expiresAt).toLocaleDateString()}`}
                </span>
              </div>

              {/* Actions for received pending */}
              {type === 'received' && isPending && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1 h-7 text-xs gap-1"
                    onClick={() => onAccept?.(invitation.id)}
                    loading={isLoading}
                    aria-label={`Accept invitation from ${invitation.team?.name}`}
                  >
                    <Check className="h-3 w-3" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs gap-1"
                    onClick={() => onReject?.(invitation.id)}
                    loading={isLoading}
                    aria-label={`Reject invitation from ${invitation.team?.name}`}
                  >
                    <X className="h-3 w-3" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
