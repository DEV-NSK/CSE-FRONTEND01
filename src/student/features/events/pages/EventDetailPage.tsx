import { useParams } from 'react-router-dom'
import { Calendar, MapPin, Users, Wifi, Clock, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { CountdownTimer } from '@/student/components/placement/CountdownTimer'
import { EventCardSkeleton } from '@/student/components/placement/PlacementSkeletons'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { formatDate } from '@/shared/lib/utils'
import { useEvent, useRegisterEvent, useUnregisterEvent } from '@/shared/hooks/useEvents'
import { useToast } from '@/shared/hooks/useToast'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading, isError } = useEvent(id!)
  const register = useRegisterEvent()
  const unregister = useUnregisterEvent()
  const { toast } = useToast()

  if (isLoading) return <div className="space-y-4"><div className="h-8 w-48 bg-muted rounded animate-pulse" /><EventCardSkeleton /></div>
  if (isError || !event) return <ErrorState title="Event not found" message="This event may have ended or been removed." onRetry={() => window.history.back()} />

  const handleRegister = async () => {
    try {
      if (event.isRegistered) {
        await unregister.mutateAsync(id!)
        toast({ title: 'Unregistered', description: `You've been removed from ${event.title}.` })
      } else {
        await register.mutateAsync(id!)
        toast({ title: 'Registered!', description: `You're registered for ${event.title}.` })
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast({ title: 'Error', description: msg ?? 'Could not update registration.', variant: 'destructive' })
    }
  }

  const isFull = event.maxParticipants ? event.participantCount >= event.maxParticipants : false

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.title}
        breadcrumbs={[{ label: 'Events', href: '/dashboard/events' }, { label: event.title }]}
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {event.banner && (
            <div className="rounded-xl overflow-hidden h-56 border border-border">
              <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="capitalize">{event.type.replace('_', ' ')}</Badge>
                {event.isRegistered && <Badge variant="success">Registered</Badge>}
                {isFull && !event.isRegistered && <Badge variant="destructive">Event Full</Badge>}
              </div>
              <div>
                <h2 className="font-semibold text-base mb-2">About this Event</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDate(event.startDate)}</p>
                  </div>
                </div>
                {event.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="font-medium">{formatDate(event.endDate)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {event.isOnline ? <Wifi className="h-4 w-4 text-muted-foreground" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{event.isOnline ? 'Online' : event.location ?? 'TBD'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Participants</p>
                    <p className="font-medium">
                      {event.participantCount}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-6 space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Organized by</p>
                  <div className="flex items-center gap-2">
                    {event.organizer.logo && <img src={event.organizer.logo} alt={event.organizer.name} className="h-6 w-6 rounded object-contain" />}
                    <p className="font-medium text-sm">{event.organizer.name}</p>
                  </div>
                </div>
                <Separator />
                {event.registrationDeadline && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />Registration closes
                    </p>
                    <p className="font-medium text-sm">{formatDate(event.registrationDeadline)}</p>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Countdown</p>
                      <CountdownTimer targetDate={event.registrationDeadline} />
                    </div>
                  </div>
                )}
                <Button
                  className="w-full"
                  variant={event.isRegistered ? 'outline' : 'default'}
                  onClick={handleRegister}
                  loading={register.isPending || unregister.isPending}
                  disabled={isFull && !event.isRegistered}
                >
                  {isFull && !event.isRegistered ? 'Event Full' : event.isRegistered ? 'Cancel Registration' : 'Register Now'}
                </Button>
                <Button variant="ghost" size="sm" className="w-full gap-2">
                  <Share2 className="h-4 w-4" />Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
