import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { UserPlus, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/shared/components/ui/button'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { MemberCard } from '@/student/components/project/MemberCard'
import { MemberCardSkeleton } from '@/student/components/project/ProjectSkeletons'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { useTeam, useRemoveTeamMember, useUpdateTeamMemberRole, useSendInvitation } from '@/shared/hooks/useProjects'
import { useAuthStore } from '@/shared/store/authStore'
import { useToast } from '@/shared/hooks/useToast'
import type { TeamMemberRole } from '@/shared/types/project'

export function TeamMembersPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<TeamMemberRole | ''>('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const { data: team, isLoading, isError } = useTeam(id!)
  const { mutate: removeMember, isPending: removing } = useRemoveTeamMember(id!)
  const { mutate: updateRole } = useUpdateTeamMemberRole(id!)
  const { mutate: sendInvite, isPending: inviting } = useSendInvitation()

  const myMembership = team?.members?.find((m) => m.userId === user?.id)
  const canManage = myMembership?.role === 'OWNER' || myMembership?.role === 'LEADER'

  const filteredMembers = (team?.members ?? []).filter((m) => {
    const matchSearch = !search || m.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.user.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || m.role === roleFilter
    return matchSearch && matchRole
  })

  const handleRemove = (memberId: string) => {
    removeMember(memberId, {
      onSuccess: () => toast({ title: 'Member removed' }),
      onError: () => toast({ title: 'Failed to remove member', variant: 'destructive' }),
    })
  }

  const handleRoleChange = (memberId: string, role: TeamMemberRole) => {
    updateRole({ memberId, role }, {
      onSuccess: () => toast({ title: 'Role updated' }),
      onError: () => toast({ title: 'Failed to update role', variant: 'destructive' }),
    })
  }

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    toast({ title: 'Use Team Invitations to send by user ID', variant: 'default' })
    setShowInvite(false)
  }

  if (isError) return <ErrorState title="Team not found" message="Unable to load team members." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        description={team?.name}
        breadcrumbs={[
          { label: 'Projects', href: '/dashboard/projects' },
          { label: team?.name ?? 'Team', href: `/dashboard/projects/team/${id}` },
          { label: 'Members' },
        ]}
        actions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={() => setShowInvite(true)}>
              <UserPlus className="h-4 w-4" /> Invite Member
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            aria-label="Search members"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as TeamMemberRole | '')}>
          <SelectTrigger className="w-44 h-10 text-sm">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            {(['OWNER','LEADER','DEVELOPER','DESIGNER','RESEARCHER','TESTER'] as TeamMemberRole[]).map((r) => (
              <SelectItem key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Members grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4].map((i) => <MemberCardSkeleton key={i} />)}
        </div>
      ) : filteredMembers.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isCurrentUser={member.userId === user?.id}
              canManage={canManage}
              onRemove={handleRemove}
              onRoleChange={handleRoleChange}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyState title="No members found" description={search || roleFilter ? 'Try adjusting your filters.' : 'No members yet.'} />
      )}

      {/* Invite dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a Member</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-3">
              To invite a member, go to{' '}
              <span className="font-medium text-primary">Team Invitations</span> and send by user ID.
            </p>
            <Button className="w-full" onClick={handleInvite}>
              Go to Invitations
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
