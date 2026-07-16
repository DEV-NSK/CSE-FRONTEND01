import { useState } from 'react'
import { GripVertical, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/utils'
import type { ResumeSection } from '@/shared/types/placement'

interface ResumeSectionEditorProps {
  section: ResumeSection
  onUpdate: (sectionId: string, content: Record<string, unknown>) => void
  onDelete: (sectionId: string) => void
  dragHandleProps?: Record<string, unknown>
  isDragging?: boolean
}

export function ResumeSectionEditor({
  section, onUpdate, onDelete, dragHandleProps, isDragging,
}: ResumeSectionEditorProps) {
  const [collapsed, setCollapsed] = useState(false)
  const content = section.content as Record<string, unknown>

  const updateField = (key: string, value: unknown) => {
    onUpdate(section.id, { ...content, [key]: value })
  }

  const renderFields = () => {
    switch (section.type) {
      case 'personal_info':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['name', 'title', 'email', 'phone', 'location', 'linkedin', 'github', 'website'].map((field) => (
              <div key={field}>
                <Label htmlFor={`${section.id}-${field}`} className="capitalize text-xs">{field}</Label>
                <Input id={`${section.id}-${field}`} value={(content[field] as string) ?? ''} onChange={(e) => updateField(field, e.target.value)} className="h-8 mt-1" />
              </div>
            ))}
          </div>
        )
      case 'skills':
        return (
          <div>
            <Label className="text-xs">Skills (comma-separated)</Label>
            <textarea
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              value={((content.items as string[]) ?? []).join(', ')}
              onChange={(e) => updateField('items', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              placeholder="React, TypeScript, Node.js…"
            />
          </div>
        )
      default:
        return (
          <div>
            <Label className="text-xs">Content</Label>
            <textarea
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
              value={(content.text as string) ?? ''}
              onChange={(e) => updateField('text', e.target.value)}
              placeholder={`Enter your ${section.title.toLowerCase()} here…`}
            />
          </div>
        )
    }
  }

  return (
    <Card className={cn('border', isDragging && 'shadow-lg ring-2 ring-primary/30')}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button {...(dragHandleProps as React.ButtonHTMLAttributes<HTMLButtonElement>)} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground" aria-label="Drag to reorder">
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="font-medium text-sm flex-1">{section.title}</span>
          <Button variant="ghost" size="icon-sm" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(section.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete section">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {!collapsed && <CardContent className="pt-0 pb-4 px-4">{renderFields()}</CardContent>}
    </Card>
  )
}
