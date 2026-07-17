/**
 * FPRD-10: Version History Drawer — Module 12
 * Shows edit history for any content entity
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Clock, RotateCcw, User, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useToast } from '@/shared/hooks/useToast'
import { cn } from '@/shared/lib/utils'
import { managerService } from '@/shared/services/manager.service'

interface VersionEntry {
  id: string
  entity: string
  entityId: string
  version: number
  editedBy: string
  editor?: { id: string; fullName: string }
  fieldName?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  changeNote?: string
  createdAt: string
}

interface VersionHistoryDrawerProps {
  open: boolean
  onClose: () => void
  entity: string
  entityId: string
  entityTitle?: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function VersionHistoryDrawer({ open, onClose, entity, entityId, entityTitle }: VersionHistoryDrawerProps) {
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'versions', entity, entityId],
    queryFn: () =>
      managerService.getVersionHistory(entity, entityId)
        .then((r) => r.data.data as VersionEntry[] ?? []),
    enabled: open && !!entityId,
    staleTime: 30_000,
  })

  const restoreMut = useMutation({
    mutationFn: (versionId: string) => managerService.restoreVersion(versionId),
    onSuccess: () => {
      toast({ title: 'Version restored successfully' })
      qc.invalidateQueries({ queryKey: ['manager', 'versions', entity, entityId] })
    },
    onError: () => toast({ title: 'Failed to restore version', variant: 'destructive' }),
  })

  if (!open) return null

  const versions = data as VersionEntry[] ?? []

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Version History">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Version History
            </h2>
            {entityTitle && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{entityTitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 px-5">
              <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No version history yet</p>
              <p className="text-xs text-slate-300 mt-1">Edits will appear here</p>
            </div>
          ) : (
            <div className="p-5 space-y-3">
              {versions.map((v: VersionEntry, idx: number) => (
                <div key={v.id} className={cn(
                  'border rounded-xl p-4 transition-colors',
                  idx === 0 ? 'border-violet-200 bg-violet-50/30' : 'border-slate-200 hover:border-slate-300'
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', idx === 0 ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600')}>
                          v{v.version}
                          {idx === 0 && ' (Current)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-600">{v.editor?.fullName ?? v.editedBy}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(v.createdAt)}</p>
                      {v.changeNote && <p className="text-xs text-slate-500 mt-1 italic">"{v.changeNote}"</p>}
                    </div>
                    {idx > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2 flex-shrink-0"
                        onClick={() => restoreMut.mutate(v.id)}
                        disabled={restoreMut.isPending}
                        title="Restore this version"
                      >
                        {restoreMut.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Changed fields */}
                  {v.newValue && Object.keys(v.newValue).length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {Object.entries(v.newValue).slice(0, 4).map(([key, val]) => (
                        <div key={key} className="flex items-start gap-1.5">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono flex-shrink-0">{key}</span>
                          <span className="text-[10px] text-slate-500 truncate">
                            {typeof val === 'object' ? JSON.stringify(val).slice(0, 40) : String(val ?? '').slice(0, 40)}
                          </span>
                        </div>
                      ))}
                      {Object.keys(v.newValue).length > 4 && (
                        <p className="text-[10px] text-slate-400">+{Object.keys(v.newValue).length - 4} more fields</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] text-slate-400 text-center">{versions.length} version{versions.length !== 1 ? 's' : ''} recorded</p>
        </div>
      </div>
    </div>
  )
}
