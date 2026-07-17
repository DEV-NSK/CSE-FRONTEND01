/**
 * FPRD-10: CMSFormModal — Reusable drawer-style form for create/edit
 * Module 20: Autosave every 30s  |  Module 21: Draft recovery
 */
import { useEffect } from 'react'
import { useForm, type FieldValues, type DefaultValues, type Path, type RegisterOptions } from 'react-hook-form'
import { X, Loader2, Clock } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { useAutosave } from '@/manager/hooks/useAutosave'
import { DraftRecoveryBanner } from '@/manager/components/DraftRecoveryBanner'

export interface FormField<T extends FieldValues> {
  name: Path<T>
  label: string
  type?: 'text' | 'textarea' | 'select' | 'number' | 'url' | 'datetime-local' | 'switch' | 'hidden'
  placeholder?: string
  options?: { value: string; label: string }[]
  rules?: RegisterOptions<T, Path<T>>
  hint?: string
  className?: string
}

interface CMSFormModalProps<T extends FieldValues> {
  open: boolean
  onClose: () => void
  onSubmit: (data: T) => Promise<void> | void
  title: string
  description?: string
  fields: FormField<T>[]
  defaultValues?: DefaultValues<T>
  editValues?: Partial<T>
  isLoading?: boolean
  submitLabel?: string
  size?: 'sm' | 'md' | 'lg'
  /** Unique key for autosave — e.g. 'roadmap:new' or 'roadmap:abc123' */
  autosaveKey?: string
}

export function CMSFormModal<T extends FieldValues>({
  open,
  onClose,
  onSubmit,
  title,
  description,
  fields,
  defaultValues,
  editValues,
  isLoading,
  submitLabel,
  size = 'md',
  autosaveKey,
}: CMSFormModalProps<T>) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<T>({ defaultValues })

  // Watch all field values for autosave
  const watchedValues = watch()

  // Autosave (Module 20 + 21)
  const draftKey = autosaveKey ?? `form:${title.toLowerCase().replace(/\s+/g, '-')}${editValues ? ':edit' : ':new'}`
  const { lastSaved, hasDraft, recoverDraft, clearDraft } = useAutosave<T>({
    key: draftKey,
    data: watchedValues,
    enabled: open && !editValues, // Only autosave new forms (not edits)
  })

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (editValues) {
        reset({ ...defaultValues, ...editValues } as DefaultValues<T>)
        clearDraft() // no autosave recovery needed when editing
      } else {
        reset(defaultValues)
      }
    }
  }, [open, editValues, defaultValues, reset, clearDraft])

  const handleRecoverDraft = () => {
    const draft = recoverDraft()
    if (draft) reset(draft as DefaultValues<T>)
  }

  const handleFormSubmit = async (data: T) => {
    await onSubmit(data)
    clearDraft()
  }

  if (!open) return null

  const widthClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={cn('relative bg-white rounded-xl shadow-2xl w-full mx-4 overflow-hidden', widthClass)}
        style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {/* Autosave indicator */}
            {lastSaved && !editValues && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock className="w-3 h-3" />
                Saved {lastSaved.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Draft recovery banner */}
        {hasDraft && !editValues && open && (
          <div className="px-6 pt-3">
            <DraftRecoveryBanner
              onRecover={handleRecoverDraft}
              onDiscard={clearDraft}
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <div className="px-6 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {fields.map((field) => {
              if (field.type === 'hidden') return null
              const error = errors[field.name]
              return (
                <div key={String(field.name)} className={field.className}>
                  {field.type !== 'switch' && (
                    <label
                      htmlFor={String(field.name)}
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      {field.label}
                      {field.rules?.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                  )}

                  {field.type === 'textarea' ? (
                    <textarea
                      id={String(field.name)}
                      rows={4}
                      placeholder={field.placeholder}
                      {...register(field.name, field.rules)}
                      className={cn(
                        'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none transition-colors',
                        error ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 hover:border-slate-300'
                      )}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={String(field.name)}
                      {...register(field.name, field.rules)}
                      className={cn(
                        'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white transition-colors',
                        error ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <option value="">Select {field.label}...</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'switch' ? (
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id={String(field.name)}
                          {...register(field.name, field.rules)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                      </label>
                      <span className="text-sm font-medium text-slate-700">{field.label}</span>
                    </div>
                  ) : (
                    <input
                      id={String(field.name)}
                      type={field.type ?? 'text'}
                      placeholder={field.placeholder}
                      {...register(field.name, field.rules)}
                      className={cn(
                        'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors',
                        error ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 hover:border-slate-300'
                      )}
                    />
                  )}

                  {field.hint && !error && (
                    <p className="text-xs text-slate-400 mt-1">{field.hint}</p>
                  )}
                  {error && (
                    <p className="text-xs text-red-500 mt-1" role="alert">
                      {String(error.message ?? 'This field is required')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading} className="bg-violet-600 hover:bg-violet-700 text-white">
              {(isSubmitting || isLoading) && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
              {submitLabel ?? (editValues ? 'Save Changes' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
