/**
 * FPRD-10: Media Library — Module 10
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Image, FileText, Film, Archive, HardDrive, Search, Trash2, Edit2, ExternalLink } from 'lucide-react'
import { CMSFormModal } from '@/manager/components/CMSFormModal'
import { managerService } from '@/shared/services/manager.service'
import { useToast } from '@/shared/hooks/useToast'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface MediaFile {
  id: string; filename: string; originalName: string; mimeType: string
  fileType: 'IMAGE' | 'VIDEO' | 'PDF' | 'ZIP' | 'DOCX' | 'PPT' | 'ICON' | 'OTHER'
  fileUrl: string; fileSize: number; folder?: string; altText?: string
  uploadedBy: string; usageCount: number; createdAt: string; updatedAt: string
  uploader?: { id: string; fullName: string }
}

const FILE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  IMAGE: Image, VIDEO: Film, PDF: FileText, ZIP: Archive,
  DOCX: FileText, PPT: FileText, ICON: Image, OTHER: HardDrive,
}
const FILE_TYPE_COLORS: Record<string, string> = {
  IMAGE: 'bg-blue-50 text-blue-600 border-blue-200',
  VIDEO: 'bg-purple-50 text-purple-600 border-purple-200',
  PDF:   'bg-red-50 text-red-600 border-red-200',
  ZIP:   'bg-slate-50 text-slate-600 border-slate-200',
  DOCX:  'bg-blue-50 text-blue-600 border-blue-200',
  OTHER: 'bg-slate-50 text-slate-600 border-slate-200',
}
const ALL_FILE_TYPES = ['IMAGE', 'VIDEO', 'PDF', 'ZIP', 'DOCX', 'PPT', 'ICON', 'OTHER']

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function ManagerMediaPage() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [fileType, setFileType] = useState('all')
  const [folder, setFolder] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<MediaFile | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'media', search, fileType, folder, page],
    queryFn: () =>
      managerService.getMediaFiles({
        search: search || undefined,
        fileType: fileType !== 'all' ? fileType : undefined,
        folder: folder || undefined,
        page,
      }).then((r) => r.data.data as { data: MediaFile[]; total: number }),
    staleTime: 30_000,
  })

  const { data: folders } = useQuery({
    queryKey: ['manager', 'media-folders'],
    queryFn: () => managerService.getMediaFolders().then((r) => r.data.data as string[] ?? []),
    staleTime: 60_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<MediaFile>) => managerService.createMediaFile(d as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'media'] }); toast({ title: 'File registered' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to register', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MediaFile> }) =>
      managerService.updateMediaFile(id, data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'media'] }); toast({ title: 'Updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({
    mutationFn: managerService.deleteMediaFile,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'media'] }); toast({ title: 'File deleted' }) },
  })

  const files = data?.data ?? []
  const totalSize = files.reduce((acc: number, f: MediaFile) => acc + (f.fileSize ?? 0), 0)

  return (
    <div className="space-y-5" role="main" aria-label="Media Library">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Media Library</h1>
            <p className="text-xs text-slate-500">Central storage for all platform media assets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['grid', 'list'] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={cn('px-3 py-1 text-xs font-medium rounded-md transition-colors', viewMode === m ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500')}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          <Button onClick={() => { setEditItem(null); setModalOpen(true) }} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 text-xs">
            + Register File
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ManagerMetricCard title="Total Files" value={data?.total ?? 0} icon={HardDrive} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <ManagerMetricCard title="Images" value={files.filter((f: MediaFile) => f.fileType === 'IMAGE').length} icon={Image} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <ManagerMetricCard title="Total Size" value={formatBytes(totalSize)} icon={Archive} iconColor="text-slate-600" iconBg="bg-slate-50" />
        <ManagerMetricCard title="Folders" value={(folders ?? []).length} icon={HardDrive} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="search" placeholder="Search files..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {['all', ...ALL_FILE_TYPES].map((t) => (
              <button key={t} onClick={() => { setFileType(t); setPage(1) }}
                className={cn('px-2.5 py-1 text-xs rounded-md font-medium transition-colors', fileType === t ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100')}>
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
          {(folders ?? []).length > 0 && (
            <select value={folder} onChange={(e) => setFolder(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">All Folders</option>
              {(folders ?? []).map((f: string) => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center">
            <HardDrive className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No files found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {files.map((file: MediaFile) => {
              const Icon = FILE_TYPE_ICONS[file.fileType] ?? HardDrive
              const colorClass = FILE_TYPE_COLORS[file.fileType] ?? FILE_TYPE_COLORS.OTHER
              return (
                <div key={file.id} className="group relative border border-slate-200 rounded-xl p-3 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className={cn('w-full aspect-square flex items-center justify-center rounded-lg mb-2', colorClass)}>
                    {file.fileType === 'IMAGE' ? (
                      <img src={file.fileUrl} alt={file.altText ?? file.filename} className="w-full h-full object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : <Icon className="w-8 h-8" />}
                  </div>
                  <p className="text-xs font-medium text-slate-700 truncate">{file.originalName}</p>
                  <p className="text-[10px] text-slate-400">{formatBytes(file.fileSize)}</p>
                  <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
                    <button onClick={() => window.open(file.fileUrl, '_blank')} className="p-1 bg-white rounded-md shadow-sm border border-slate-200 hover:bg-slate-50">
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </button>
                    <button onClick={() => { setEditItem(file); setModalOpen(true) }} className="p-1 bg-white rounded-md shadow-sm border border-slate-200 hover:bg-slate-50">
                      <Edit2 className="w-3 h-3 text-slate-500" />
                    </button>
                    <button onClick={() => deleteMut.mutate(file.id)} className="p-1 bg-white rounded-md shadow-sm border border-slate-200 hover:bg-red-50">
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">File</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Size</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file: MediaFile) => {
                  const Icon = FILE_TYPE_ICONS[file.fileType] ?? HardDrive
                  const colorClass = FILE_TYPE_COLORS[file.fileType] ?? FILE_TYPE_COLORS.OTHER
                  return (
                    <tr key={file.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0', colorClass)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <p className="text-xs font-medium text-slate-800 truncate max-w-[200px]">{file.originalName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded-md text-xs font-medium border', colorClass)}>{file.fileType}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{formatBytes(file.fileSize)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => window.open(file.fileUrl, '_blank')} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><ExternalLink className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setEditItem(file); setModalOpen(true) }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteMut.mutate(file.id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {(data?.total ?? 0) > 30 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">{data?.total} files · Page {page}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30">Prev</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={(page * 30) >= (data?.total ?? 0)} className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>

      <CMSFormModal<Partial<MediaFile>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit File Metadata' : 'Register External File'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        fields={[
          { name: 'filename', label: 'Filename', placeholder: 'banner-2026.jpg', rules: { required: 'Filename is required' } },
          { name: 'originalName', label: 'Original Name', placeholder: 'Banner 2026.jpg' },
          { name: 'fileUrl', label: 'File URL', type: 'url', placeholder: 'https://...', rules: { required: 'URL is required' } },
          { name: 'fileType', label: 'File Type', type: 'select', options: ALL_FILE_TYPES.map((t) => ({ value: t, label: t })) },
          { name: 'mimeType', label: 'MIME Type', placeholder: 'image/jpeg' },
          { name: 'folder', label: 'Folder', placeholder: 'banners / lessons / icons...' },
          { name: 'altText', label: 'Alt Text', placeholder: 'Descriptive alt text for accessibility' },
        ]}
      />
    </div>
  )
}
