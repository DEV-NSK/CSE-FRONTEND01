import { useState } from 'react'
import { Search, Filter, X, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { EventCard } from '@/student/components/placement/EventCard'
import { EventCardSkeleton } from '@/student/components/placement/PlacementSkeletons'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { useEvents, useFeaturedEvents, useRegisteredEvents } from '@/shared/hooks/useEvents'
import type { EventType } from '@/shared/types/events'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'contest', label: 'Contest' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'networking', label: 'Networking' },
  { value: 'career_fair', label: 'Career Fair' },
]

export function EventsPage() {
  const [search, setSearch] = useState('')
  const [eventType, setEventType] = useState<EventType | 'all'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data: upcoming, isLoading: upcomingLoading } = useEvents({
    search, type: eventType !== 'all' ? eventType : undefined,
  })
  const { data: featured, isLoading: featuredLoading } = useFeaturedEvents(6)
  const { data: registered, isLoading: registeredLoading } = useRegisteredEvents()

  const hasFilters = search || eventType !== 'all' || dateFilter

  return (
    <div className="space-y-5">
      <PageHeader
        title="Events"
        description="Discover hackathons, workshops, and placement events"
        breadcrumbs={[{ label: 'Events' }]}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-3.5 w-3.5" />Filters
          {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground" onClick={() => { setSearch(''); setEventType('all'); setDateFilter('') }}>
            <X className="h-3.5 w-3.5" />Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border border-border">
          <Select value={eventType} onValueChange={(v) => setEventType(v as EventType | 'all')}>
            <SelectTrigger className="w-40 h-8 text-sm"><SelectValue placeholder="Event Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {EVENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-40 h-8 text-sm" />
        </motion.div>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="registered">My Events</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {upcomingLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : upcoming?.data && upcoming.data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.data.map((event) => (
                <motion.div key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Calendar className="h-12 w-12" />} title="No events found" description="Check back soon for upcoming events." />
          )}
        </TabsContent>

        <TabsContent value="featured" className="mt-4">
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : featured && featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <EmptyState icon={<Calendar className="h-12 w-12" />} title="No featured events" description="Featured events will appear here." />
          )}
        </TabsContent>

        <TabsContent value="registered" className="mt-4">
          {registeredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : registered?.data && registered.data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {registered.data.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <EmptyState icon={<Calendar className="h-12 w-12" />} title="No registered events" description="Events you register for will appear here." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
