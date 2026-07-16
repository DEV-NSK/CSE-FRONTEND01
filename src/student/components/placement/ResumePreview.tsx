import type { Resume } from '@/shared/types/placement'

interface ResumePreviewProps {
  resume: Resume | null
  template?: string
}

const sectionTitles: Record<string, string> = {
  personal_info: 'Personal Info',
  education: 'Education',
  experience: 'Experience',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  achievements: 'Achievements',
}

export function ResumePreview({ resume, template }: ResumePreviewProps) {
  const tpl = template ?? resume?.template ?? 'classic'

  if (!resume) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">Create a resume to see preview</p>
      </div>
    )
  }

  const sortedSections = [...resume.sections].sort((a, b) => a.order - b.order)
  const personalInfo = sortedSections.find((s) => s.type === 'personal_info')?.content as Record<string, string> | undefined
  const otherSections = sortedSections.filter((s) => s.type !== 'personal_info')

  return (
    <div
      className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden"
      style={{ fontFamily: tpl === 'modern' ? 'Inter, sans-serif' : 'Georgia, serif', minHeight: '700px' }}
      aria-label="Resume preview"
    >
      {/* Header */}
      <div className={`p-6 ${tpl === 'modern' ? 'bg-indigo-600 text-white' : 'bg-gray-50 border-b'}`}>
        <h1 className={`text-xl font-bold ${tpl === 'modern' ? 'text-white' : 'text-gray-900'}`}>
          {(personalInfo?.name as string) || 'Your Name'}
        </h1>
        {personalInfo?.title && (
          <p className={`text-sm mt-0.5 ${tpl === 'modern' ? 'text-indigo-100' : 'text-gray-600'}`}>
            {personalInfo.title}
          </p>
        )}
        <div className={`flex flex-wrap gap-3 mt-2 text-xs ${tpl === 'modern' ? 'text-indigo-100' : 'text-gray-500'}`}>
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
          {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo?.github && <span>{personalInfo.github}</span>}
        </div>
      </div>

      {/* Sections */}
      <div className="p-6 space-y-5">
        {otherSections.map((section) => {
          const content = section.content as Record<string, unknown>
          return (
            <div key={section.id}>
              <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 pb-1 border-b ${tpl === 'modern' ? 'border-indigo-200 text-indigo-700' : 'border-gray-300 text-gray-700'}`}>
                {sectionTitles[section.type] ?? section.title}
              </h2>
              {section.type === 'skills' && Array.isArray(content.items) && (
                <div className="flex flex-wrap gap-1.5">
                  {(content.items as string[]).map((skill, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{skill}</span>
                  ))}
                </div>
              )}
              {section.type !== 'skills' && content.text && (
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{content.text as string}</p>
              )}
              {Array.isArray(content.entries) && (content.entries as Record<string, string>[]).map((entry, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-gray-800">{entry.title ?? entry.role ?? entry.degree}</p>
                    <p className="text-xs text-gray-500 shrink-0 ml-2">{entry.duration ?? entry.year ?? ''}</p>
                  </div>
                  {(entry.company ?? entry.institution) && (
                    <p className="text-xs text-gray-600">{entry.company ?? entry.institution}</p>
                  )}
                  {entry.description && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{entry.description}</p>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
