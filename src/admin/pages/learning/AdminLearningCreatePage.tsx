import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Save, Eye, Send, X, Plus, Trash2,
  Image as ImageIcon, Video, Link2, FileText, UploadCloud,
  GripVertical, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useAdminLearningLevels,
  useAdminLearningContentItem,
  useCreateLearningContent,
  useUpdateLearningContent,
  useUploadNotes,
  useDeleteNoteImage,
  useReorderNoteImages,
} from '@/shared/hooks/useAdminLearning'
import type { LearningContentFormData, LearningNoteImage, LearningContentStatus } from '@/shared/types/learning-cms'
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
  CardDescription,
  CardHeader,
  CardTitle,
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
import { useToast } from '@/shared/hooks/useToast'
import { cn } from '@/shared/lib/utils'

const formSchema = z.object({
  levelId: z.string({ required_error: 'Level is required' }).min(1, 'Level is required'),
  dayNumber: z
    .number({ required_error: 'Day is required', invalid_type_error: 'Day must be a number' })
    .int('Day must be an integer')
    .positive('Day must be greater than 0'),
  topicName: z.string().min(2, 'Topic name is required (min 2 chars)').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  reelUrl: z.string().url('Must be a valid URL').min(1, 'Reel URL is required'),
  youtubeUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

interface ResourceInput {
  id: string
  title: string
  url: string
}

export default function AdminLearningCreatePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { toast } = useToast()
  const isEdit = !!id
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState<LearningContentStatus>('DRAFT')
  const [resources, setResources] = useState<ResourceInput[]>([])
  const [previewDialog, setPreviewDialog] = useState(false)
  const [publishDialog, setPublishDialog] = useState(false)
  const [uploadingNotes, setUploadingNotes] = useState(false)

  const { data: levels, isLoading: loadingLevels } = useAdminLearningLevels({ includeInactive: true })
  const { data: existingContent, isLoading: loadingContent } = useAdminLearningContentItem(id ?? '')
  const createMutation = useCreateLearningContent()
  const updateMutation = useUpdateLearningContent()
  const uploadNotesMutation = useUploadNotes()
  const deleteNoteMutation = useDeleteNoteImage()
  const reorderNotesMutation = useReorderNoteImages()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      levelId: '',
      dayNumber: 1,
      topicName: '',
      description: '',
      reelUrl: '',
      youtubeUrl: '',
    },
  })

  useEffect(() => {
    if (existingContent && isEdit && !loadingContent) {
      setValue('levelId', existingContent.levelId)
      setValue('dayNumber', existingContent.dayNumber)
      setValue('topicName', existingContent.topicName)
      setValue('description', existingContent.description ?? '')
      setValue('reelUrl', existingContent.reelUrl)
      setValue('youtubeUrl', existingContent.youtubeUrl ?? '')
      setStatus(existingContent.status)
      if (existingContent.resources && existingContent.resources.length > 0) {
        setResources(
          existingContent.resources.map((r) => ({ id: r.id, title: r.title, url: r.url })),
        )
      }
    }
  }, [existingContent, isEdit, loadingContent, setValue])

  const watchAll = watch()

  const [notes, setNotes] = useState<LearningNoteImage[]>(existingContent?.notes ?? [])

  useEffect(() => {
    if (existingContent?.notes && !loadingContent) {
      setNotes(existingContent.notes)
    }
  }, [existingContent?.notes, loadingContent])

  const addResource = () => {
    setResources((r) => [...r, { id: crypto.randomUUID(), title: '', url: '' }])
  }

  const removeResource = (rid: string) => {
    setResources((r) => r.filter((x) => x.id !== rid))
  }

  const updateResource = (rid: string, field: 'title' | 'url', value: string) => {
    setResources((r) => r.map((x) => (x.id === rid ? { ...x, [field]: value } : x)))
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (notes.length + files.length > 5) {
      toast({ title: 'Maximum 5 notes images allowed', variant: 'warning' })
      return
    }
    if (!isEdit) {
      toast({ title: 'Save content first before uploading notes', variant: 'warning' })
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    const validFiles = Array.from(files).filter((f) => allowed.includes(f.type))
    if (validFiles.length === 0) {
      toast({ title: 'Only JPG, PNG, WEBP images allowed', variant: 'error' })
      return
    }
    setUploadingNotes(true)
    try {
      for (const file of validFiles) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await uploadNotesMutation.mutateAsync({ contentId: id!, formData: fd })
        if (res.data.data?.images) {
          setNotes(res.data.data.images)
        }
      }
      toast({ title: 'Notes uploaded', variant: 'success' })
    } catch {
      toast({ title: 'Upload failed', variant: 'error' })
    } finally {
      setUploadingNotes(false)
    }
  }

  const handleRemoveNote = async (imageId: string) => {
    try {
      await deleteNoteMutation.mutateAsync({ contentId: id!, imageId })
      toast({ title: 'Image removed', variant: 'success' })
    } catch {
      toast({ title: 'Remove failed', variant: 'error' })
    }
  }

  const handleReorderNotes = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const reordered = [...notes]
    const [removed] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, removed)
    setNotes(reordered)
    const reorderData = reordered.map((img, idx) => ({
      imageId: img.id,
      newDisplayOrder: idx,
    }))
    try {
      await reorderNotesMutation.mutateAsync({ contentId: id!, reorderData })
    } catch {
      toast({ title: 'Reorder failed', variant: 'error' })
    }
  }

  const submitContent = async (values: FormValues, publishAfter: boolean) => {
    const contentPayload: LearningContentFormData = {
      ...values,
      description: values.description || undefined,
      youtubeUrl: values.youtubeUrl || undefined,
      resources: resources.filter((r) => r.title && r.url).map((r) => ({ title: r.title, url: r.url })),
    }
    try {
      let contentId = id
      if (isEdit) {
        await updateMutation.mutateAsync({ id: id!, data: contentPayload })
        toast({ title: publishAfter ? 'Content published' : 'Content updated', variant: 'success' })
      } else {
        const res = await createMutation.mutateAsync(contentPayload)
        contentId = res.data.data?.id
        toast({ title: publishAfter ? 'Content published' : 'Draft saved', variant: 'success' })
      }
      navigate(publishAfter ? '/admin/learning' : `/admin/learning/${contentId}/edit`)
    } catch {
      toast({ title: isEdit ? 'Update failed' : 'Create failed', variant: 'error' })
    }
  }

  const onSubmitDraft = handleSubmit((v) => submitContent(v, false))
  const onSubmitPublishConfirm = () => setPublishDialog(true)
  const onConfirmPublish = handleSubmit((v) => submitContent(v, true))

  if (isEdit && loadingContent) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5 text-slate-200" role="main" aria-label={isEdit ? 'Edit Learning Content' : 'Create Learning Content'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-400">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isEdit ? 'Edit Learning Content' : 'Create Learning Content'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEdit ? 'Update daily learning content' : 'Publish a new daily learning day with Reel + Notes.'}
            </p>
          </div>
          {isEdit && (
            <Badge
              variant="outline"
              className={cn('ml-2 gap-1.5 border',
                status === 'PUBLISHED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                : status === 'DRAFT' ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                : status === 'UNPUBLISHED' ? 'bg-slate-500/15 text-slate-400 border-slate-500/20'
                : 'bg-red-500/15 text-red-400 border-red-500/20'
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              {status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPreviewDialog(true)} className="gap-1.5">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={onSubmitDraft} className="gap-1.5" disabled={createMutation.isPending || updateMutation.isPending}>
            <Save className="w-4 h-4" />
            {isEdit ? 'Save Changes' : 'Save Draft'}
          </Button>
          <Button size="sm" onClick={onSubmitPublishConfirm} className="gap-1.5" disabled={createMutation.isPending || updateMutation.isPending}>
            <Send className="w-4 h-4" />
            {isEdit && existingContent?.status === 'PUBLISHED' ? 'Update & Publish' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Section A — Basic Information
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Required fields for the daily learning content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="levelId" className="text-slate-300">
                    Level <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={watchAll.levelId}
                    onValueChange={(v) => setValue('levelId', v, { shouldDirty: true })}
                    disabled={loadingLevels}
                  >
                    <SelectTrigger id="levelId" className="bg-slate-950 border-slate-700">
                      <SelectValue placeholder={loadingLevels ? 'Loading...' : 'Select Level'} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {levels?.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          Level {l.levelNumber.toString().padStart(2, '0')} — {l.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.levelId && <p className="text-xs text-red-400">{errors.levelId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dayNumber" className="text-slate-300">
                    Day <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="dayNumber"
                    type="number"
                    min={1}
                    placeholder="01"
                    {...register('dayNumber', { valueAsNumber: true })}
                    className="bg-slate-950 border-slate-700 font-mono"
                  />
                  {errors.dayNumber && <p className="text-xs text-red-400">{errors.dayNumber.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="topicName" className="text-slate-300">
                  Topic Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="topicName"
                  placeholder="e.g. What is Programming?"
                  {...register('topicName')}
                  className="bg-slate-950 border-slate-700"
                />
                {errors.topicName && <p className="text-xs text-red-400">{errors.topicName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-slate-300">Short Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Brief description of what students will learn today..."
                  {...register('description')}
                  className="bg-slate-950 border-slate-700 resize-none"
                />
                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-pink-400" />
                Section B — Video URLs
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Reel URL is required. YouTube is optional for deep-dive content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reelUrl" className="text-slate-300">
                  Instagram Reel URL <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <UploadCloud className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-pink-400" />
                  <Input
                    id="reelUrl"
                    placeholder="https://www.instagram.com/reel/..."
                    {...register('reelUrl')}
                    className="bg-slate-950 border-slate-700 pl-8"
                  />
                </div>
                {errors.reelUrl && <p className="text-xs text-red-400">{errors.reelUrl.message}</p>}
                {watchAll.reelUrl && (
                  <a
                    href={watchAll.reelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300"
                  >
                    <Video className="w-3 h-3" /> Watch Reel (opens in new tab)
                  </a>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="youtubeUrl" className="text-slate-300">YouTube Video URL <span className="text-slate-600">(Optional)</span></Label>
                <div className="relative">
                  <Video className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-red-400" />
                  <Input
                    id="youtubeUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register('youtubeUrl')}
                    className="bg-slate-950 border-slate-700 pl-8"
                  />
                </div>
                {errors.youtubeUrl && <p className="text-xs text-red-400">{errors.youtubeUrl.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  Section C — Notes Images
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Up to 5 images. JPG / PNG / WEBP.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-slate-700 text-slate-400 font-mono">
                {notes.length}/5
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {notes.map((note, idx) => (
                  <div key={note.id} className="relative group aspect-square rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
                    <img
                      src={note.imageUrl}
                      alt={`Notes ${idx + 1}`}
                      className="w-full h-full object-cover"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', idx.toString())}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
                        handleReorderNotes(fromIdx, idx)
                      }}
                    />
                    <div className="absolute top-1 left-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRemoveNote(note.id)}
                        className="w-6 h-6 rounded-md bg-red-600/90 text-white flex items-center justify-center hover:bg-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3.5 h-3.5 text-white bg-black/60 rounded p-0.5" />
                    </div>
                    <div className="absolute bottom-1 left-1">
                      <Badge variant="outline" className="bg-black/60 border-slate-600 text-white text-[10px] font-mono">
                        {idx + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
                {notes.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isEdit || uploadingNotes}
                    className={cn(
                      'aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors',
                      'border-slate-700 bg-slate-950/50 hover:border-blue-500 hover:bg-blue-500/5 text-slate-500 hover:text-blue-400',
                      (!isEdit || uploadingNotes) && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[10px] font-medium">
                      {uploadingNotes ? 'Uploading...' : 'Upload Notes'}
                    </span>
                    {!isEdit && (
                      <span className="text-[9px] text-slate-600 max-w-[80%] text-center">
                        Save draft first
                      </span>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>
              {notes.length > 0 && (
                <p className="text-[10px] text-slate-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Drag & drop to reorder · Hover for delete option
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-indigo-400" />
                  Section D — Learning Resources
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Optional: additional URLs for further reading.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addResource} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Resource
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {resources.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-4 border border-dashed border-slate-800 rounded-lg">
                  No resources added yet.
                </p>
              )}
              {resources.map((r, i) => (
                <div key={r.id} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                  <Input
                    placeholder="Title"
                    value={r.title}
                    onChange={(e) => updateResource(r.id, 'title', e.target.value)}
                    className="bg-slate-950 border-slate-700 text-sm"
                  />
                  <Input
                    placeholder="https://..."
                    value={r.url}
                    onChange={(e) => updateResource(r.id, 'url', e.target.value)}
                    className="bg-slate-950 border-slate-700 text-sm"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeResource(r.id)} className="h-9 text-red-400">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="bg-slate-900 border-slate-800 sticky top-4">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">Content Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Form status</span>
                <Badge variant="outline" className={cn('border font-mono',
                  Object.keys(errors).length > 0
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : isDirty
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                )}>
                  {Object.keys(errors).length > 0 ? `${Object.keys(errors).length} issues` : isDirty ? 'Modified' : 'Clean'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Level</span>
                <span className="text-slate-300 font-mono">
                  {watchAll.levelId ? (levels?.find((l) => l.id === watchAll.levelId)?.levelNumber?.toString().padStart(2, '0') ?? '—') : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Day</span>
                <span className="text-slate-300 font-mono">{watchAll.dayNumber?.toString().padStart(2, '0') ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Notes</span>
                <span className="text-slate-300 font-mono">{notes.length}/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reel</span>
                <Badge variant="outline" className={cn('border font-mono',
                  watchAll.reelUrl && !errors.reelUrl
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                )}>
                  {watchAll.reelUrl && !errors.reelUrl ? '✓ Set' : 'Missing'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              Level {watchAll.levelId ? (levels?.find((l) => l.id === watchAll.levelId)?.levelNumber?.toString().padStart(2, '0') ?? '00') : '00'}
              {' · '}
              Day {watchAll.dayNumber?.toString().padStart(2, '0') ?? '00'}
            </DialogTitle>
            <DialogDescription className="text-lg font-semibold text-slate-200">
              {watchAll.topicName || 'Untitled Topic'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {watchAll.description && (
              <p className="text-sm text-slate-400">{watchAll.description}</p>
            )}
            {watchAll.reelUrl && (
              <a
                href={watchAll.reelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-pink-500/10 border border-pink-500/20 rounded-lg text-pink-300 text-sm font-medium hover:bg-pink-500/20"
              >
                <Video className="w-4 h-4" /> Watch Reel →
              </a>
            )}
            {notes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Notes — {notes.length} image{notes.length > 1 ? 's' : ''}</p>
                <div className="grid grid-cols-5 gap-2">
                  {notes.map((n, i) => (
                    <img key={n.id} src={n.imageUrl} alt={`Notes ${i + 1}`} className="aspect-square object-cover rounded-lg border border-slate-700" />
                  ))}
                </div>
              </div>
            )}
            {resources.filter((r) => r.title && r.url).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Resources</p>
                {resources.filter((r) => r.title && r.url).map((r) => (
                  <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 bg-slate-800/60 rounded-lg text-xs text-slate-300 hover:bg-slate-800">
                    {r.title} →
                  </a>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPreviewDialog(false)} className="text-slate-400">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Confirm Dialog */}
      <Dialog open={publishDialog} onOpenChange={(o) => !o && setPublishDialog(false)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Publish Day {watchAll.dayNumber?.toString().padStart(2, '0') ?? '00'}?</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              This content will become available to students immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPublishDialog(false)} className="text-slate-400">
              Cancel
            </Button>
            <Button onClick={onConfirmPublish} disabled={createMutation.isPending || updateMutation.isPending}>
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
