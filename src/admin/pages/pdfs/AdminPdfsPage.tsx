import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, Trash2, Eye, EyeOff, Edit2, Check, X,
  Download, AlertCircle, Loader2, GripVertical,
} from 'lucide-react'
import {
  useAdminPdfs,
  useAdminUploadPdf,
  useAdminUpdatePdf,
  useAdminDeletePdf,
} from '@/shared/hooks/useCoursePdfs'
import type { CoursePdf } from '@/shared/services/course-pdf.service'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'

// ── helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// ── Upload panel ──────────────────────────────────────────────────────────────

function UploadPanel({ onDone }: { onDone: () => void }) {
  const [file, setFile]         = useState<File | null>(null)
  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const upload   = useAdminUploadPdf()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) return
    await upload.mutateAsync({
      file,
      title: title.trim(),
      description: desc.trim(),
      onProgress: setProgress,
    })
    setFile(null); setTitle(''); setDesc(''); setProgress(0)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors',
          dragging ? 'border-blue-400 bg-blue-500/10' : 'border-slate-600 hover:border-slate-400 bg-slate-800/40',
        )}
      >
        <FileText className={cn('w-10 h-10', file ? 'text-blue-400' : 'text-slate-500')} />
        {file ? (
          <div className="text-center">
            <p className="text-sm font-medium text-slate-200">{file.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{formatBytes(file.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-slate-400">Drag &amp; drop a PDF here, or click to browse</p>
            <p className="text-xs text-slate-600 mt-1">Max 50 MB · PDF only</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f) }}
        />
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5 block">
          Title <span className="text-red-400">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Python Basics Cheatsheet"
          className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5 block">
          Description <span className="text-slate-600">(optional)</span>
        </label>
        <Input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Brief description of this PDF"
          className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {/* Progress bar */}
      {upload.isPending && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-blue-500 rounded-full"
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          disabled={!file || !title.trim() || upload.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          {upload.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload PDF
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} className="text-slate-400">
          Cancel
        </Button>
      </div>
    </form>
  )
}

// ── Inline edit row ───────────────────────────────────────────────────────────

function PdfRow({ pdf }: { pdf: CoursePdf }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle]     = useState(pdf.title)
  const [desc, setDesc]       = useState(pdf.description ?? '')
  const updateMut = useAdminUpdatePdf()
  const deleteMut = useAdminDeletePdf()

  const saveEdit = async () => {
    await updateMut.mutateAsync({ id: pdf.id, title: title.trim(), description: desc.trim() })
    setEditing(false)
  }

  const togglePublish = () =>
    updateMut.mutateAsync({ id: pdf.id, isPublished: !pdf.isPublished })

  const handleDelete = () => {
    if (window.confirm(`Delete "${pdf.title}"? This cannot be undone.`)) {
      deleteMut.mutate(pdf.id)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors group"
    >
      {/* Drag handle (visual only) */}
      <GripVertical className="w-4 h-4 text-slate-600 mt-1 shrink-0 cursor-grab" />

      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
        <FileText className="w-4.5 h-4.5 text-blue-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-700 border-slate-600 text-slate-100 h-8 text-sm"
              autoFocus
            />
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description (optional)"
              className="bg-slate-700 border-slate-600 text-slate-100 h-8 text-sm placeholder:text-slate-500"
            />
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-100 truncate">{pdf.title}</p>
            {pdf.description && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{pdf.description}</p>
            )}
          </>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-slate-600">{pdf.fileName}</span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] text-slate-600">{formatBytes(pdf.fileSize)}</span>
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
            pdf.isPublished
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-slate-700 text-slate-500',
          )}>
            {pdf.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {editing ? (
          <>
            <Button
              size="sm" variant="ghost"
              className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              onClick={saveEdit}
              disabled={updateMut.isPending}
            >
              {updateMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </Button>
            <Button
              size="sm" variant="ghost"
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              onClick={() => { setTitle(pdf.title); setDesc(pdf.description ?? ''); setEditing(false) }}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <>
            {/* View */}
            <Button
              size="sm" variant="ghost" asChild
              className="h-8 w-8 p-0 text-slate-400 hover:text-blue-300 hover:bg-blue-500/10"
              title="View PDF"
            >
              <a href={pdf.fileUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="w-3.5 h-3.5" />
              </a>
            </Button>

            {/* Download */}
            <Button
              size="sm" variant="ghost" asChild
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              title="Download PDF"
            >
              <a href={pdf.fileUrl} download={pdf.fileName}>
                <Download className="w-3.5 h-3.5" />
              </a>
            </Button>

            {/* Edit */}
            <Button
              size="sm" variant="ghost"
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              onClick={() => setEditing(true)}
              title="Edit metadata"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>

            {/* Publish toggle */}
            <Button
              size="sm" variant="ghost"
              className={cn(
                'h-8 w-8 p-0',
                pdf.isPublished
                  ? 'text-emerald-400 hover:text-slate-400 hover:bg-slate-700'
                  : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10',
              )}
              onClick={togglePublish}
              disabled={updateMut.isPending}
              title={pdf.isPublished ? 'Unpublish' : 'Publish'}
            >
              {updateMut.isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : pdf.isPublished
                  ? <Eye className="w-3.5 h-3.5" />
                  : <EyeOff className="w-3.5 h-3.5" />}
            </Button>

            {/* Delete */}
            <Button
              size="sm" variant="ghost"
              className="h-8 w-8 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={handleDelete}
              disabled={deleteMut.isPending}
              title="Delete"
            >
              {deleteMut.isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />}
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPdfsPage() {
  const [showUpload, setShowUpload] = useState(false)
  const { data: pdfs = [], isLoading, error } = useAdminPdfs()

  const published = pdfs.filter((p) => p.isPublished).length
  const drafts    = pdfs.filter((p) => !p.isPublished).length

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Course PDFs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Upload &amp; manage PDFs that students can view or download on the Learning Roadmap page.
          </p>
        </div>
        <Button
          onClick={() => setShowUpload((v) => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shrink-0"
        >
          <Upload className="w-4 h-4" />
          Upload PDF
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',     value: pdfs.length,  color: 'text-slate-200' },
          { label: 'Published', value: published,     color: 'text-emerald-400' },
          { label: 'Drafts',    value: drafts,        color: 'text-slate-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-slate-800/60 border border-slate-700/60 px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
            <p className={cn('text-2xl font-bold mt-0.5', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Upload panel */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            key="upload-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                Upload New PDF
              </h2>
              <UploadPanel onDone={() => setShowUpload(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            All PDFs
          </span>
          <span className="text-xs text-slate-600">{pdfs.length} total</span>
        </div>

        <div className="p-3 space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-800 animate-pulse" />
            ))
          ) : error ? (
            <div className="flex items-center gap-2 py-8 justify-center text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Failed to load PDFs</span>
            </div>
          ) : pdfs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <FileText className="w-10 h-10 text-slate-700" />
              <p className="text-sm text-slate-500">No PDFs yet — upload one above</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {pdfs.map((pdf) => (
                <PdfRow key={pdf.id} pdf={pdf} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Help note */}
      <p className="text-xs text-slate-600 flex items-start gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        Only <strong className="text-slate-500">Published</strong> PDFs are visible to students on the Learning Roadmap page.
        Toggle the eye icon to publish or unpublish.
      </p>
    </div>
  )
}
