import { Link } from 'react-router-dom'
import { Calendar, Users, MapPin, Wifi } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { formatDate } from '@/shared/lib/utils'
import type { EventListItem } from '@/shared/types/events'

const typeColors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'secondary'> = {
  hackathon: 'default',
  workshop: 'info',
  webinar: 'secondary',
  contest: 'warning',
  seminar: 'success',
  networking: 'info',
  career_fair: 'default',
  other: 'secondary',
}

interface EventCardProps {
  event: EventListItem
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link to={`/dashboard/events/${event.id}`}>
      <Card className="hover:border-primary/40 hover:shadow-sm transition-all overflow-hidden h-full">
        {event.banner && (
          <div className="h-36 overflow-hidden">
            <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}
        {!event.banner && (
          <div className="h-20 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-primary/50" />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant={typeColors[event.type]} className="text-xs capitalize shrink-0">
              {event.type.replace('_', ' ')}
            </Badge>
            {event.isRegistered && (
              <Badge variant="success" className="text-xs">Registered</Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2">{event.title}</h3>
          <p className="text-xs text-muted-foreground mb-1">{event.organizer.name}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />{formatDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />{event.participantCount}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {event.isOnline
              ? <><Wifi className="h-3 w-3" />Online</>
              : <><MapPin className="h-3 w-3" />{event.location || 'TBD'}</>
            }
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
