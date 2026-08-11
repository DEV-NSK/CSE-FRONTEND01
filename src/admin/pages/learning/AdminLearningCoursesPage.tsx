import { useState } from 'react'
import {
  Plus, Pencil, Trash2, BookOpen, RefreshCw, AlertCircle, Search,
} from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useAdminCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
} from '@/shared/hooks/useAdminLearning'
import type { Course, CourseFormData } from '@/shared/types/learning-cms'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Card,
  CardContent,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { useToast } from '@/shared/hooks/useToast'

// ─── Zod schema ──────────────────────────────────────────────────────────────

const courseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  slug: z.string().regex(/^[a-z0-9-]*$/, 'Slug: lowercase letters, numbers and hyphens only').optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  totalDays: z.number().int().min(1).optional().or(z.nan()),
})

type CourseFormValues = z.infer<typeof courseSchema>

// ─── Status badge helper ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ARCHIVED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }
  return (
    <Badge variant="outline" className={`text-[10px] ${map[status] ?? map.DRAFT}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminLearningCoursesPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useAdminCourses({ search: search || undefined })
  const courses: Course[] = data?.data ?? []

  const createMutation = useCreateCourse()
  const updateMutation = useUpdateCourse()
  const deleteMutation = useDeleteCourse()

  return (
    <div className="space-y-5 text-slate-200" role="main" aria-label="Courses Management">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Courses</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage learning courses. Each course contains levels and daily lessons.
          </p>
        </div>
        <Button onClick={() => { setIsCreating(true); setEditingId(null) }} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Create Course
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search courses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-700/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 flex-1">Failed to load courses.</p>
          <button onClick={() => refetch()} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12">
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description="Create your first course to start organising the learning roadmap."
              action={
                <Button onClick={() => setIsCreating(true)} className="gap-1.5">
                  <Plus className="w-4 h-4" /> Create First Course
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id} className="bg-slate-900 border-slate-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-white">{course.title}</h3>
                    <StatusBadge status={course.status} />
                  </div>
                  {course.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{course.description}</p>
                  )}
                  <p className="text-[11px] text-slate-600 mt-0.5 font-mono">{course.slug}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-slate-400"
                    onClick={() => { setEditingId(course.id); setIsCreating(false) }}
                    aria-label={`Edit ${course.title}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-400"
                    onClick={() => setDeleteDialog(course.id)}
                    aria-label={`Delete ${course.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <CourseFormDialog
        open={isCreating || editingId !== null}
        onOpenChange={(o) => { if (!o) { setIsCreating(false); setEditingId(null) } }}
        initial={editingId ? courses.find((c) => c.id === editingId) : undefined}
        onSubmit={async (values) => {
          try {
            if (editingId) {
              await updateMutation.mutateAsync({ id: editingId, data: values })
              toast({ title: 'Course updated', variant: 'success' })
            } else {
              await createMutation.mutateAsync(values)
              toast({ title: 'Course created', variant: 'success' })
            }
            setIsCreating(false)
            setEditingId(null)
            refetch()
          } catch {
            toast({ title: editingId ? 'Update failed' : 'Create failed', variant: 'error' })
          }
        }}
      />

      {/* Delete dialog */}
      <Dialog open={deleteDialog !== null} onOpenChange={(o) => !o && setDeleteDialog(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Delete Course?</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              This will permanently remove the course. Levels and content inside it will be affected.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialog(null)} className="text-slate-400">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteDialog) {
                  try {
                    await deleteMutation.mutateAsync(deleteDialog)
                    toast({ title: 'Course deleted', variant: 'success' })
                    setDeleteDialog(null)
                    refetch()
                  } catch {
                    toast({ title: 'Delete failed', variant: 'error' })
                  }
                }
              }}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Course form dialog ───────────────────────────────────────────────────────

interface CourseFormDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  initial?: Course
  onSubmit: (data: CourseFormData) => Promise<void>
}

function CourseFormDialog({ open, onOpenChange, initial, onSubmit }: CourseFormDialogProps) {
  const isEdit = !!initial
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      status: initial?.status ?? 'DRAFT',
      totalDays: initial?.totalDays ?? undefined,
    },
  })

  const status = watch('status')

  function handleClose(o: boolean) {
    onOpenChange(o)
    if (!o) reset()
  }

  async function onFormSubmit(values: CourseFormValues) {
    const payload: CourseFormData = {
      title: values.title,
      ...(values.slug ? { slug: values.slug } : {}),
      ...(values.description ? { description: values.description } : {}),
      status: values.status,
      ...(values.totalDays && !isNaN(values.totalDays) ? { totalDays: values.totalDays } : {}),
    }
    await onSubmit(payload)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            {isEdit ? 'Edit Course' : 'Create New Course'}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Courses are the top-level container for levels and lessons.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Title <span className="text-red-400">*</span></Label>
            <Input
              placeholder="e.g. Full Stack Development"
              {...register('title')}
              className="bg-slate-950 border-slate-700"
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">
              Slug
              <span className="text-slate-600 font-normal ml-1 text-xs">(auto-generated if empty)</span>
            </Label>
            <Input
              placeholder="e.g. full-stack-development"
              {...register('slug')}
              className="bg-slate-950 border-slate-700 font-mono text-sm"
            />
            {errors.slug && <p className="text-xs text-red-400">{errors.slug.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Description</Label>
            <Textarea
              rows={3}
              placeholder="Brief overview of what this course covers…"
              {...register('description')}
              className="bg-slate-950 border-slate-700 resize-none"
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
          </div>

          {/* Status + Total Days */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Status</Label>
              <Select
                value={status ?? 'DRAFT'}
                onValueChange={(v) => setValue('status', v as CourseFormValues['status'], { shouldDirty: true })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Total Days</Label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 90"
                {...register('totalDays', { valueAsNumber: true })}
                className="bg-slate-950 border-slate-700 font-mono"
              />
              {errors.totalDays && <p className="text-xs text-red-400">{errors.totalDays.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleClose(false)} className="text-slate-400">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
