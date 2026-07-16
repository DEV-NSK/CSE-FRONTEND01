// ─── Notifications Types (FPRD-05) ───────────────────────────────────────────

export type NotificationType =
  | 'learning'
  | 'coding'
  | 'projects'
  | 'placement'
  | 'events'
  | 'system'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  link?: string
  createdAt: string
}

export interface NotificationFilters {
  type?: NotificationType | 'all'
  isRead?: boolean
  page: number
  limit: number
}
