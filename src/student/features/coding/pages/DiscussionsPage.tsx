import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MessageSquare, Plus, Edit2, Trash2, Reply, Shield, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { DiscussionSkeleton } from '@/student/components/coding/CodingSkeletons'
import {
  useDiscussions, useCreateDiscussion, useUpdateDiscussion,
  useDeleteDiscussion, useAddReply, useDeleteReply, useProblem,
} from '@/shared/hooks/useCoding'
import { useAuthStore } from '@/shared/store/authStore'
import { getInitials, formatDate } from '@/shared/lib/utils'
import { cn } from '@/shared/lib/utils'
import type { Discussion, DiscussionReply } from '@/shared/types/coding'

const discussionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
})

const replySchema = z.object({
  content: z.string().min(2, 'Reply cannot be empty'),
})

type DiscussionForm = z.infer<typeof discussionSchema>
type ReplyForm = z.infer<typeof replySchema>

export function DiscussionsPage() {
  const { id: problemId } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const { data: problemData } = useProblem(problemId!)
  const { data, isLoading, isError, refetch } = useDiscussions(problemId!, { limit: 50 })
  const { mutate: createDiscussion, isPending: creating } = useCreateDiscussion(problemId!)
  const { mutate: updateDiscussion, isPending: updating } = useUpdateDiscussion()
  const { mutate: deleteDiscussion } = useDeleteDiscussion()
  const { mutate: addReply, isPending: addingReply } = useAddReply()
  const { mutate: deleteReply } = useDeleteReply()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DiscussionForm>({ resolver: zodResolver(discussionSchema) })

  const {
    register: registerReply,
    handleSubmit: handleReplySubmit,
    reset: resetReply,
    formState: { errors: replyErrors },
  } = useForm<ReplyForm>({ resolver: zodResolver(replySchema) })

  const onCreateDiscussion = (data: DiscussionForm) => {
    createDiscussion(data, {
      onSuccess: () => {
        reset()
        setShowNewForm(false)
      },
    })
  }

  const onAddReply = (discussionId: string) => (data: ReplyForm) => {
    addReply(
      { discussionId, content: data.content },
      {
        onSuccess: () => {
          resetReply()
          setReplyingTo(null)
        },
      }
    )
  }

  const isOwner = (authorId: string) => user?.id === authorId
  const isModerator = user?.role === 'admin' || user?.role === 'instructor'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discussions"
        description={problemData ? `Discuss: ${problemData.title}` : 'Problem Discussions'}
        breadcrumbs={[
          { label: 'Coding', href: '/dashboard/coding' },
          { label: 'Problems', href: '/dashboard/coding/problems' },
          ...(problemData
            ? [{ label: problemData.title, href: `/dashboard/coding/problems/${problemData.slug}` }]
            : []),
          { label: 'Discussions' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={problemData ? `/dashboard/coding/problems/${problemData.slug}` : '/dashboard/coding/problems'}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Problem
              </Link>
            </Button>
            <Button size="sm" onClick={() => setShowNewForm(!showNewForm)} className="gap-1">
              <Plus className="h-4 w-4" />
              New Discussion
            </Button>
          </div>
        }
      />

      {/* New Discussion Form */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="p-5">
                <h3 className="text-base font-semibold mb-4">Start a Discussion</h3>
                <form onSubmit={handleSubmit(onCreateDiscussion)} className="space-y-3">
                  <Input
                    label="Title"
                    placeholder="What do you want to discuss?"
                    error={errors.title?.message}
                    {...register('title')}
                  />
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Content (Markdown supported)
                    </label>
                    <textarea
                      placeholder="Describe your approach, ask a question, or share insights..."
                      className={cn(
                        'w-full min-h-[120px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm',
                        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        errors.content && 'border-destructive'
                      )}
                      {...register('content')}
                    />
                    {errors.content && (
                      <p className="mt-1 text-xs text-destructive">{errors.content.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewForm(false)
                        reset()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" loading={creating}>
                      Post Discussion
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discussions list */}
      {isError ? (
        <ErrorState
          title="Failed to load discussions"
          message="Please try again."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <DiscussionSkeleton />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="No discussions yet"
          description="Be the first to start a discussion about this problem."
          action={{ label: 'Start Discussion', onClick: () => setShowNewForm(true) }}
        />
      ) : (
        <div className="space-y-4">
          {data.data.map((discussion) => (
            <DiscussionThread
              key={discussion.id}
              discussion={discussion}
              isOwner={isOwner(discussion.author.id)}
              isModerator={isModerator}
              editingId={editingId}
              setEditingId={setEditingId}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onDelete={() => deleteDiscussion(discussion.id)}
              onUpdate={(payload) => updateDiscussion({ id: discussion.id, payload })}
              onAddReply={onAddReply(discussion.id)}
              onDeleteReply={(replyId) => deleteReply(replyId)}
              isOwnerOfReply={(authorId) => isOwner(authorId)}
              updating={updating}
              addingReply={addingReply}
              registerReply={registerReply}
              handleReplySubmit={handleReplySubmit}
              resetReply={resetReply}
              replyErrors={replyErrors}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Discussion Thread ────────────────────────────────────────────────────────

interface DiscussionThreadProps {
  discussion: Discussion
  isOwner: boolean
  isModerator: boolean
  editingId: string | null
  setEditingId: (id: string | null) => void
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  onDelete: () => void
  onUpdate: (payload: { title?: string; content?: string }) => void
  onAddReply: (data: ReplyForm) => void
  onDeleteReply: (id: string) => void
  isOwnerOfReply: (authorId: string) => boolean
  updating: boolean
  addingReply: boolean
  registerReply: ReturnType<typeof useForm<ReplyForm>>['register']
  handleReplySubmit: ReturnType<typeof useForm<ReplyForm>>['handleSubmit']
  resetReply: () => void
  replyErrors: ReturnType<typeof useForm<ReplyForm>>['formState']['errors']
}

function DiscussionThread({
  discussion,
  isOwner,
  isModerator,
  replyingTo,
  setReplyingTo,
  onDelete,
  onAddReply,
  onDeleteReply,
  isOwnerOfReply,
  addingReply,
  registerReply,
  handleReplySubmit,
  resetReply,
  replyErrors,
}: DiscussionThreadProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={discussion.author.avatar} alt={discussion.author.name} />
            <AvatarFallback className="text-xs">{getInitials(discussion.author.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-sm font-semibold">{discussion.author.name}</span>
              {(discussion.author.role === 'admin' || discussion.author.role === 'instructor') && (
                <Badge variant="info" className="text-xs gap-1 py-0">
                  <Shield className="h-3 w-3" />
                  {discussion.author.role === 'admin' ? 'Admin' : 'Mentor'}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{formatDate(discussion.createdAt)}</span>
            </div>
            <h3 className="text-sm font-medium text-foreground">{discussion.title}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setReplyingTo(replyingTo === discussion.id ? null : discussion.id)}
              aria-label="Reply"
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>
            {(isOwner || isModerator) && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onDelete}
                aria-label="Delete discussion"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Content */}
        <div className="pl-11">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {discussion.content}
          </p>
        </div>

        {/* Replies */}
        {discussion.replies.length > 0 && (
          <div className="pl-11 space-y-3">
            {discussion.replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                canDelete={isOwnerOfReply(reply.author.id) || isModerator}
                onDelete={() => onDeleteReply(reply.id)}
              />
            ))}
          </div>
        )}

        {/* Reply form */}
        <AnimatePresence>
          {replyingTo === discussion.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-11"
            >
              <form
                onSubmit={handleReplySubmit(onAddReply)}
                className="flex items-start gap-2"
              >
                <textarea
                  placeholder="Write a reply... (Markdown supported)"
                  className={cn(
                    'flex-1 min-h-[64px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm',
                    'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    replyErrors.content && 'border-destructive'
                  )}
                  {...registerReply('content')}
                />
                <div className="flex flex-col gap-1.5">
                  <Button type="submit" size="sm" loading={addingReply}>
                    Reply
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null)
                      resetReply()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
              {replyErrors.content && (
                <p className="mt-1 text-xs text-destructive">{replyErrors.content.message}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

// ─── Reply Item ───────────────────────────────────────────────────────────────

interface ReplyItemProps {
  reply: DiscussionReply
  canDelete: boolean
  onDelete: () => void
}

function ReplyItem({ reply, canDelete, onDelete }: ReplyItemProps) {
  return (
    <div className="flex items-start gap-2.5 bg-muted/30 rounded-lg p-3">
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
        <AvatarFallback className="text-[10px]">{getInitials(reply.author.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold">{reply.author.name}</span>
          {(reply.author.role === 'admin' || reply.author.role === 'instructor') && (
            <Badge variant="info" className="text-[10px] py-0 px-1.5">
              {reply.author.role === 'admin' ? 'Admin' : 'Mentor'}
            </Badge>
          )}
          <span className="text-[11px] text-muted-foreground">{formatDate(reply.createdAt)}</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{reply.content}</p>
      </div>
      {canDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label="Delete reply"
          className="text-destructive hover:text-destructive shrink-0 h-6 w-6"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
