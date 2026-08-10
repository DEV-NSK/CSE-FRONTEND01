import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, Layers, RefreshCw, AlertCircle,
  GripVertical, ChevronUp, ChevronDown,
} from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useAdminLearningLevels,
  useCreateLearningLevel,
  useUpdateLearningLevel,
  useDeleteLearningLevel,
} from '@/shared/hooks/useAdminLearning'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/shared/lib/axios'
import type { LearningLevelFormData } from '@/shared/types/learning-cms'
import type { ApiResponse } from '@/types'
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
import { Switch } from '@/shared/components/ui/switch'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { useToast } from '@/shared/hooks/useToast'
import { cn } from '@/shared/lib/utils'

interface Course { id: string; title: string; slug: string; status: string }

function useCourses() {
  return useQuery({
    queryKey: ['admin-learning', 'courses'],
    queryFn: () =>
      axiosInstance
        .get<ApiResponse<{ data: Course[] }>>('/admin/learning/courses')
        .then((r) => r.data.data?.data ?? []),
    staleTime: 5 * 60 * 1000,
  })
}

const levelSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  levelNumber: z.number().int().min(0, 'Level number must be >= 0'),
  title: z.string().min(2, 'Title is required').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

type LevelFormValues = z.infer<typeof levelSchema>

export default function AdminLearningLevelsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  const { data: levels, isLoading, error, refetch } = useAdminLearningLevels({ includeInactive: true })
  const { data: courses = [] } = useCourses()
  const createMutation = useCreateLearningLevel()
  const updateMutation = useUpdateLearningLevel()
  const deleteMutation = useDeleteLearningLevel()

  const sortedLevels = [...(levels ?? [])].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

  return (
    <div className="space-y-5 text-slate-200" role="main" aria-label="Learning Levels Management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Learning Levels</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Define course levels — Level 00, Level 01, etc. Each level contains daily lessons.
          </p>
        </div>
        <Button onClick={() => { setIsCreating(true); setEditingId(null) }} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Create Level
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-700/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 flex-1">Failed to load levels.</p>
          <button onClick={() => refetch()} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : sortedLevels.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12">
            <EmptyState
              icon={Layers}
              title="No levels defined yet"
              description="Create your first level to organize the learning roadmap (e.g. Level 00 — Getting Started)."
              action={
                <Button onClick={() => setIsCreating(true)} className="gap-1.5">
                  <Plus className="w-4 h-4" /> Create First Level
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedLevels.map((lvl, idx) => {
            const contentCount = lvl.contents?.length ?? 0
            const publishedCount = lvl.contents?.filter((c) => c.status === 'PUBLISHED').length ?? 0
            return (
              <Card key={lvl.id} className="bg-slate-900 border-slate-800">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex flex-col items-center gap-0.5 text-slate-600">
                    <button
                      onClick={() => {
                        if (idx === 0) return
                        const up = sortedLevels[idx - 1]
                        const curr = sortedLevels[idx]
                        Promise.all([
                          updateMutation.mutateAsync({ id: curr.id, data: { displayOrder: up.displayOrder } }),
                          updateMutation.mutateAsync({ id: up.id, data: { displayOrder: curr.displayOrder } }),
                        ]).then(() => refetch()).catch(() => toast({ title: 'Reorder failed', variant: 'error' }))
                      }}
                      disabled={idx === 0}
                      className="p-0.5 hover:text-slate-300 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <GripVertical className="w-4 h-4" />
                    <button
                      onClick={() => {
                        if (idx === sortedLevels.length - 1) return
                        const down = sortedLevels[idx + 1]
                        const curr = sortedLevels[idx]
                        Promise.all([
                          updateMutation.mutateAsync({ id: curr.id, data: { displayOrder: down.displayOrder } }),
                          updateMutation.mutateAsync({ id: down.id, data: { displayOrder: curr.displayOrder } }),
                        ]).then(() => refetch()).catch(() => toast({ title: 'Reorder failed', variant: 'error' }))
                      }}
                      disabled={idx === sortedLevels.length - 1}
                      className="p-0.5 hover:text-slate-300 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono font-bold text-blue-400 text-lg">
                      {lvl.levelNumber.toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">{lvl.title}</h3>
                      {!lvl.isActive && (
                        <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-[10px]">Inactive</Badge>
                      )}
                    </div>
                    {lvl.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{lvl.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-slate-500">
                        {contentCount} day{contentCount !== 1 ? 's' : ''} total
                      </span>
                      <span className="text-emerald-400">
                        {publishedCount} published
                      </span>
                      {contentCount > 0 && (
                        <div className="flex-1 min-w-[120px] max-w-[240px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(publishedCount / (contentCount || 1)) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-slate-400"
                      onClick={() => navigate(`/admin/learning?level=${lvl.id}`)}
                    >
                      Content
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-slate-400"
                      onClick={() => { setEditingId(lvl.id); setIsCreating(false) }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-red-400"
                      onClick={() => setDeleteDialog(lvl.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <LevelFormDialog
        open={isCreating || editingId !== null}
        onOpenChange={(o) => { if (!o) { setIsCreating(false); setEditingId(null) } }}
        courses={courses}
        initial={editingId ? (levels ?? []).find((l) => l.id === editingId) : undefined}
        onSubmit={async (values) => {
          try {
            if (editingId) {
              await updateMutation.mutateAsync({ id: editingId, data: values })
              toast({ title: 'Level updated', variant: 'success' })
            } else {
              await createMutation.mutateAsync(values)
              toast({ title: 'Level created', variant: 'success' })
            }
            setIsCreating(false)
            setEditingId(null)
            refetch()
          } catch {
            toast({ title: editingId ? 'Update failed' : 'Create failed', variant: 'error' })
          }
        }}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialog !== null} onOpenChange={(o) => !o && setDeleteDialog(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Delete Level?</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              This will archive the level and its contents. Student progress will be preserved.
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
                    toast({ title: 'Level deleted', variant: 'success' })
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

interface FormDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  courses: Course[]
  initial?: { id: string; courseId?: string; levelNumber: number; title: string; description?: string | null; displayOrder?: number; isActive?: boolean }
  onSubmit: (values: LearningLevelFormData) => Promise<void>
}

function LevelFormDialog({ open, onOpenChange, courses, initial, onSubmit }: FormDialogProps) {
  const isEdit = !!initial
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LevelFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      courseId: initial?.courseId ?? (courses[0]?.id ?? ''),
      levelNumber: initial?.levelNumber ?? 0,
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      displayOrder: initial?.displayOrder ?? 0,
      isActive: initial?.isActive ?? true,
    },
  })

  // When courses load, set default courseId if not editing
  const courseId = watch('courseId')
  const active = watch('isActive')

  // Reset form defaults when courses arrive on create
  const firstCourseId = courses[0]?.id
  if (!isEdit && !courseId && firstCourseId) {
    setValue('courseId', firstCourseId)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset() }}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">{isEdit ? 'Edit Level' : 'Create New Level'}</DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Levels organize the learning roadmap. Students progress sequentially through levels and days.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Course selector — required for creation */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-slate-300">Course <span className="text-red-400">*</span></Label>
              {courses.length === 0 ? (
                <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  No courses found. Create a course first before adding levels.
                </p>
              ) : (
                <Select
                  value={courseId}
                  onValueChange={(v) => setValue('courseId', v, { shouldDirty: true })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-700">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.courseId && <p className="text-xs text-red-400">{errors.courseId.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Level Number <span className="text-red-400">*</span></Label>
              <Input
                type="number"
                min={0}
                {...register('levelNumber', { valueAsNumber: true })}
                className="bg-slate-950 border-slate-700 font-mono"
              />
              {errors.levelNumber && <p className="text-xs text-red-400">{errors.levelNumber.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Display Order</Label>
              <Input
                type="number"
                min={0}
                {...register('displayOrder', { valueAsNumber: true })}
                className="bg-slate-950 border-slate-700 font-mono"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">Title <span className="text-red-400">*</span></Label>
            <Input
              placeholder="e.g. Getting Started"
              {...register('title')}
              className="bg-slate-950 border-slate-700"
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">Description</Label>
            <Textarea
              rows={3}
              placeholder="Brief summary of what this level covers..."
              {...register('description')}
              className="bg-slate-950 border-slate-700 resize-none"
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-slate-200">Active</p>
              <p className="text-xs text-slate-500">Inactive levels are hidden from the student roadmap.</p>
            </div>
            <Switch
              checked={active ?? true}
              onCheckedChange={(v) => setValue('isActive', v, { shouldDirty: true })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || (!isEdit && courses.length === 0)}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Level'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
