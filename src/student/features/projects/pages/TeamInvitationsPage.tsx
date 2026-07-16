import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Send } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InvitationCard } from '@/student/components/project/InvitationCard'
import { InvitationCardSkeleton } from '@/student/components/project/ProjectSkeletons'
import { useMyInvitations, useRespondToInvitation } from '@/shared/hooks/useProjects'
import { useToast } from '@/shared/hooks/useToast'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }

export function TeamInvitationsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')

  const { data: received, isLoading: recLoading } = useMyInvitations('received')
  const { data: sent, isLoading: sentLoading } = useMyInvitations('sent')
  const { mutate: respond, isPending } = useRespondToInvitation()

  const pendingReceived = received?.filter((i) => i.status === 'PENDING') ?? []

  const handleAccept = (id: string) => {
    respond({ id, status: 'ACCEPTED' }, {
      onSuccess: () => toast({ title: 'Invitation accepted!' }),
      onError: () => toast({ title: 'Failed to accept invitation', variant: 'destructive' }),
    })
  }

  const handleReject = (id: string) => {
    respond({ id, status: 'REJECTED' }, {
      onSuccess: () => toast({ title: 'Invitation rejected' }),
      onError: () => toast({ title: 'Failed to reject', variant: 'destructive' }),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Invitations"
        description="Manage your incoming and outgoing team invitations."
        breadcrumbs={[{ label: 'Projects', href: '/dashboard/projects' }, { label: 'Invitations' }]}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'received' | 'sent')}>
        <TabsList>
          <TabsTrigger value="received" className="gap-2">
            <Bell className="h-3.5 w-3.5" />
            Incoming
            {pendingReceived.length > 0 && (
              <Badge variant="destructive" className="h-4 min-w-4 text-[10px] px-1">{pendingReceived.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-3.5 w-3.5" />
            Sent
          </TabsTrigger>
        </TabsList>

        {/* Received */}
        <TabsContent value="received" className="mt-4">
          {recLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1,2,3].map((i) => <InvitationCardSkeleton key={i} />)}
            </div>
          ) : received && received.length > 0 ? (
            <motion.div
              variants={container} initial="hidden" animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {received.map((inv) => (
                <motion.div key={inv.id} variants={item}>
                  <InvitationCard
                    invitation={inv}
                    type="received"
                    onAccept={handleAccept}
                    onReject={handleReject}
                    isLoading={isPending}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={<Bell className="h-10 w-10" />}
              title="No invitations"
              description="You haven't received any team invitations yet."
            />
          )}
        </TabsContent>

        {/* Sent */}
        <TabsContent value="sent" className="mt-4">
          {sentLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1,2,3].map((i) => <InvitationCardSkeleton key={i} />)}
            </div>
          ) : sent && sent.length > 0 ? (
            <motion.div
              variants={container} initial="hidden" animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {sent.map((inv) => (
                <motion.div key={inv.id} variants={item}>
                  <InvitationCard invitation={inv} type="sent" />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={<Send className="h-10 w-10" />}
              title="No sent invitations"
              description="You haven't sent any invitations yet."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
