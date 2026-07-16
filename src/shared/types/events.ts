// ─── Events Types (FPRD-05) ───────────────────────────────────────────────────

export type EventType =
  | 'hackathon'
  | 'workshop'
  | 'webinar'
  | 'contest'
  | 'seminar'
  | 'networking'
  | 'career_fair'
  | 'other'

export interface EventOrganizer {
  id: string
  name: string
  logo?: string
}

export interface Event {
  id: string
  title: string
  description: string
  type: EventType
  banner?: string
  organizer: EventOrganizer
  startDate: string
  endDate?: string
  location?: string
  isOnline: boolean
  registrationDeadline?: string
  maxParticipants?: number
  participantCount: number
  isRegistered: boolean
  isFeatured: boolean
  tags?: string[]
  link?: string
  createdAt: string
  updatedAt: string
}

export interface EventListItem {
  id: string
  title: string
  type: EventType
  banner?: string
  organizer: EventOrganizer
  startDate: string
  endDate?: string
  location?: string
  isOnline: boolean
  registrationDeadline?: string
  participantCount: number
  isRegistered: boolean
  isFeatured: boolean
}

export interface EventFilters {
  search: string
  type: EventType | 'all'
  dateFrom?: string
  dateTo?: string
  isRegistered?: boolean
  page: number
  limit: number
}
