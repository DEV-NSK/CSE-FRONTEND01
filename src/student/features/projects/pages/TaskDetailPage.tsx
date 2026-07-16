import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, MessageSquare, Calendar, Flag, User, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { useTaskComments, useAddTaskComment, useTasks, useTeam } from '@/shared/hooks/useProjects'
import { useAuthStore } from '@/shared/store/authStore'
import { useToast } from '@/shared/hooks/useToast'
import { getInitials, cn } from '@/shared/lib/utils'

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-amber-500',
  CRITICAL: 'text-red-500',
}

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'warning' | 'outline'> = {
  TODO: 'outline',
  IN_PROGRESS: 'info',
  REVIEW: 'warning',
  COMPLETED: 'success',
}

export function TaskDetailPage() {
  const { id: taskId } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [comment, setComment] = useState('')

  // Get task from tasks list — we need teamId from route or task data
  // We fetch the task via comments/all tasks approach
  const { data: commentsData, isLoading: commLoading } = useTaskComments(taskId!)
  const { mutate: addComment, isPending: sending } = useAddTaskComment(taskId!, '')

  const comments = commentsData?.data ?? []

  const handleSend = () => {
    if (!comment.trim()) return
    addComment(comment.trim(), {
      onSuccess: () => { setComment(''); toast({ title: 'Comment added' }) },
      onError: () => toast({ title: 'Failed to add comment', variant: 'destructive' }),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Details"
        breadcrumbs={[{ label: 'Projects', href: '/dashboard/projects' }, { label: 'Task' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Center: Description + Comments */}
        <div className="space-y-6">
          {/* Comments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {commLoading ? (
                <div className="space-y-3">
                  {[1,2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length > 0 ? (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                  className="space-y-4"
                >
                  {comments.map((c) => (
                    <motion.div
                      key={c.id}
                      variants={{ hidden: { opacity: 0, y: 4 }, show: { opacity: 1, y: 0 } }}
                      className="flex gap-3"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={c.user.profileImage} alt={c.user.fullName} />
                        <AvatarFallback className="text-xs">{getInitials(c.user.fullName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm">{c.user.fullName}</span>
                          <time className="text-xs text-muted-foreground">
                            {new Date(c.createdAt).toLocaleString()}
                          </time>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">{c.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyState
                  icon={<MessageSquare className="h-8 w-8" />}
                  title="No comments yet"
                  description="Be the first to add a comment."
                  className="py-6"
                />
              )}

              {/* Comment input */}
              {user && (
                <div className="flex gap-3 pt-2 border-t border-border/50">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user.profileImage} alt={user.fullName} />
                    <AvatarFallback className="text-xs">{getInitials(user.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Write a comment..."
                      aria-label="Write a comment"
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button size="icon" onClick={handleSend} loading={sending} aria-label="Send comment">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Task metadata */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Task Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground text-xs">
                Task details such as assignee, due date, priority, and status appear here when
                opened from the task board or a team's task list.
              </p>
              <Button variant="outline" size="sm" className="w-full gap-1.5" asChild>
                <Link to="/dashboard/projects">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
