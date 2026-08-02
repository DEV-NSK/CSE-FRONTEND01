// FPRD-12 — Lesson Viewer UI/UX Redesign
// FPRD-20 — Python Learning Experience (Roadmap + Content UI) — full enhancements
import { useParams, Link, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, CheckCircle2, X,
  Clock, BookOpen, ExternalLink, Search,
  CheckCircle, AlertTriangle, Lightbulb, Send, Award,
  FileText, Copy, Check, StickyNote, ChevronDown, ChevronUp,
  Bookmark, BookmarkCheck, Share2, PanelLeftClose, PanelLeftOpen,
  PanelRightClose, PanelRightOpen, List, TrendingUp,
  ChevronFirst, Hash, BarChart2,
} from 'lucide-react'
import { LessonCompletionModal } from '@/student/components/learning/LessonCompletionModal'
import {
  MemoryVisualization, VARIABLES_MEMORY_STEPS,
  type MemoryStep,
} from '@/student/components/learning/MemoryVisualization'
import { RevisionCards, type FlashCard } from '@/student/components/learning/RevisionCards'
import {
  ExplainLikeBeginner,
  CodeExplanation,
  VisualDiagram,
  RealWorldExample,
  AISummary,
  InterviewQuestions,
  HighlightableText,
  LessonHero,
} from '@/student/components/learning/LessonEnhancements'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Separator } from '@/shared/components/ui/separator'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { WidgetErrorBoundary } from '@/shared/components/feedback/ErrorBoundary'
import { LessonSidebar } from '@/student/components/learning/LessonSidebar'
import { LessonViewerSkeleton } from '@/student/components/learning/LearningSkeletons'
import { DifficultyBadge } from '@/student/components/learning/DifficultyBadge'
import { ResourceCard } from '@/student/components/learning/ResourceCard'
import {
  useLesson, useMarkLessonComplete, useMarkLessonStarted,
  useRoadmap, useToggleLessonBookmark, prefetchLesson,
  useLessonPractice, useLessonQuiz, useSubmitQuiz,
  useLessonNotes, useUpdateLessonNote, useCreateLessonNote,
  useBookmarks, useRemoveBookmark,
} from '@/shared/hooks/useLearning'
import { useLearningStore } from '@/shared/store/learningStore'
import { cn, debounce, createHeadingId } from '@/shared/lib/utils'
import type { Difficulty, QuizQuestion, PracticeQuestion, RoadmapSection } from '@/shared/types/learning'

const MarkdownRenderer = lazy(() => import('@/student/components/learning/MarkdownRenderer'))

// ─── Fallback data ───────────────────────────────────────────────────────────

const FALLBACK_PRACTICE: PracticeQuestion[] = [
  { id: 'p1', lessonId: 'fallback', order: 1, question: 'Write a Python program to print "Hello, World!" to the console.', type: 'coding', answer: 'print("Hello, World!")', explanation: 'In Python, the print() function outputs text to the console.', hint: 'Use the built-in print() function.', difficulty: 'beginner' },
  { id: 'p2', lessonId: 'fallback', order: 2, question: 'What will be the output of: x = 5 + 3 * 2?', type: 'output', answer: '11', explanation: 'Python follows PEMDAS: multiplication before addition. 3*2=6, then 5+6=11.', options: ['16', '11', '10', '8'], hint: 'Remember order of operations.', difficulty: 'beginner' },
  { id: 'p3', lessonId: 'fallback', order: 3, question: 'Create a variable named "age" and assign it the value 25.', type: 'fill-blank', answer: 'age = 25', codeSnippet: '_____ = ___', explanation: 'Variables in Python are created with = operator.', hint: 'Variable name on left, value on right.', difficulty: 'beginner' },
  { id: 'p4', lessonId: 'fallback', order: 4, question: 'Write a function called add that takes two parameters a and b and returns their sum.', type: 'coding', answer: 'def add(a, b):\n    return a + b', explanation: 'Functions are defined with def keyword.', hint: 'Use def to define the function.', difficulty: 'beginner' },
  { id: 'p5', lessonId: 'fallback', order: 5, question: 'What is the data type of: my_list = [1, 2, 3]?', type: 'theory', answer: 'list', explanation: 'Square brackets [] define a list in Python.', options: ['tuple', 'list', 'dict', 'set'], hint: 'Square brackets define this ordered collection.', difficulty: 'beginner' },
  { id: 'p6', lessonId: 'fallback', order: 6, question: 'Write a for loop that prints numbers from 1 to 5 (inclusive).', type: 'coding', answer: 'for i in range(1, 6):\n    print(i)', explanation: 'range(1, 6) generates 1,2,3,4,5 — the end is exclusive.', hint: 'Use range() and remember the end is exclusive.', difficulty: 'beginner' },
]

const FALLBACK_QUIZ: QuizQuestion[] = [
  { id: 'q1', lessonId: 'fallback', order: 1, question: 'Which keyword is used to define a function in Python?', options: ['func', 'def', 'function', 'define'], correctOption: 1, explanation: 'The "def" keyword defines functions in Python.' },
  { id: 'q2', lessonId: 'fallback', order: 2, question: 'What is the output of: print(type((1, 2, 3)))?', options: ["<class 'list'>", "<class 'tuple'>", "<class 'dict'>", "<class 'set'>"], correctOption: 1, explanation: 'Parentheses with comma-separated values create a tuple.' },
  { id: 'q3', lessonId: 'fallback', order: 3, question: 'Which of the following is NOT a valid Python variable name?', options: ['my_var', '_private', '2nd_place', 'camelCase'], correctOption: 2, explanation: 'Variable names cannot start with a number.' },
  { id: 'q4', lessonId: 'fallback', order: 4, question: 'What does len("Python") return?', options: ['5', '6', '7', 'Error'], correctOption: 1, explanation: '"Python" has 6 characters.' },
  { id: 'q5', lessonId: 'fallback', order: 5, question: 'Which operator is used for integer division in Python 3?', options: ['/', '//', '\\', 'div'], correctOption: 1, explanation: '// performs floor division.' },
  { id: 'q6', lessonId: 'fallback', order: 6, question: 'What is the result of: [1, 2, 3] + [4, 5]?', options: ['[1, 2, 3, 4, 5]', '[1, 2, 3, [4, 5]]', 'Error', '[5, 7, 3]'], correctOption: 0, explanation: 'The + operator concatenates lists.' },
]

// ─── Reading Progress Bar ────────────────────────────────────────────────────

function ReadingProgressBar({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const max = scrollHeight - clientHeight
      setProgress(max > 0 ? Math.round((scrollTop / max) * 100) : 0)
    }
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [scrollRef])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/40" aria-hidden="true">
      <motion.div
        className="h-full bg-primary rounded-full"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}

// ─── Floating Scroll Progress ────────────────────────────────────────────────

function FloatingProgress({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const [pct, setPct] = useState(0)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const max = scrollHeight - clientHeight
      const p = max > 0 ? Math.round((scrollTop / max) * 100) : 0
      setPct(p)
      setVisible(scrollTop > 120)
    }
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [scrollRef])

  const r = 20, stroke = 3, circ = 2 * Math.PI * r
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 right-4 z-50 flex flex-col items-center"
          aria-label={`Reading progress: ${pct}%`}
        >
          <div className="relative w-12 h-12 drop-shadow-lg">
            <svg width="48" height="48" className="-rotate-90" aria-hidden="true">
              <circle cx="24" cy="24" r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
              <circle cx="24" cy="24" r={r} fill="none" strokeWidth={stroke}
                stroke="hsl(var(--primary))" strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ - (pct / 100) * circ}
                style={{ transition: 'stroke-dashoffset 0.2s ease' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
              {pct}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Code Block ──────────────────────────────────────────────────────────────

function CopyableCodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  return (
    <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e2e] border-b border-white/10">
        <span className="text-xs font-mono text-[#a6accd] uppercase tracking-wider">
          {lang || 'code'}
        </span>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopy}
                className="h-6 w-6 text-[#a6accd] hover:text-white hover:bg-white/10"
                aria-label="Copy code"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <pre className="bg-[#1e1e2e] p-6 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono text-[#cdd6f4] text-[13px]">{code}</code>
      </pre>
    </div>
  )
}

// ─── Callout / Info Boxes ────────────────────────────────────────────────────

type CalloutType = 'tip' | 'important' | 'warning' | 'success' | 'example'

const calloutConfig: Record<CalloutType, { label: string; icon: React.ElementType; classes: string; iconClass: string }> = {
  tip:       { label: 'Tip',       icon: Lightbulb,      classes: 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700',      iconClass: 'text-blue-600 dark:text-blue-400' },
  important: { label: 'Important', icon: AlertTriangle,   classes: 'bg-orange-50 border-orange-300 dark:bg-orange-950/30 dark:border-orange-700', iconClass: 'text-orange-600 dark:text-orange-400' },
  warning:   { label: 'Warning',   icon: AlertTriangle,   classes: 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700',          iconClass: 'text-red-600 dark:text-red-400' },
  success:   { label: 'Success',   icon: CheckCircle,     classes: 'bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700',  iconClass: 'text-green-600 dark:text-green-400' },
  example:   { label: 'Example',   icon: Hash,            classes: 'bg-purple-50 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700', iconClass: 'text-purple-600 dark:text-purple-400' },
}

function Callout({ type, children }: { type: CalloutType; children: React.ReactNode }) {
  const cfg = calloutConfig[type]
  const Icon = cfg.icon
  return (
    <div className={cn('rounded-xl border-l-4 p-4 my-4 flex gap-3', cfg.classes)}>
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', cfg.iconClass)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className={cn('text-xs font-bold uppercase tracking-wider mb-1', cfg.iconClass)}>{cfg.label}</p>
        <div className="text-sm text-foreground/90 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

// ─── Markdown Wrapper ────────────────────────────────────────────────────────

function MarkdownWrapper({ content }: { content: string }) {
  return (
    <Suspense fallback={
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className={`h-4 ${i % 2 === 0 ? 'w-full' : 'w-5/6'}`} />
        ))}
      </div>
    }>
      <MarkdownRenderer content={content} className="
        [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:leading-tight
        [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3
        [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
        [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mt-5 [&_h4]:mb-2
        [&_p]:text-[17px] [&_p]:leading-[1.85] [&_p]:text-foreground/90 [&_p]:mb-4
        [&_li]:text-[17px] [&_li]:leading-[1.75]
        [&_pre]:bg-[#1e1e2e] [&_pre]:rounded-xl [&_pre]:p-6 [&_pre]:overflow-x-auto [&_pre]:my-4
        [&_code]:text-[13px] [&_pre_code]:text-[#cdd6f4]
        [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-4 [&_img]:cursor-zoom-in
        [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4 [&_blockquote]:text-lg
      " />
    </Suspense>
  )
}

// ─── TOC heading types ───────────────────────────────────────────────────────

interface TocEntry { id: string; text: string; level: number }

function extractToc(md: string): TocEntry[] {
  const entries: TocEntry[] = []
  const seenIds = new Map<string, number>()
  const lines = md.split('\n')
  for (const line of lines) {
    const m = line.match(/^(#{1,3}) (.+)$/)
    if (m) {
      const level = m[1].length
      const text = m[2].trim()
      let id = createHeadingId(text)
      // Handle duplicate headings by appending a counter
      const count = seenIds.get(id) ?? 0
      seenIds.set(id, count + 1)
      if (count > 0) id = `${id}-${count}`
      entries.push({ id, text, level })
    }
  }
  return entries
}

// ─── Section Renderer ────────────────────────────────────────────────────────

type ParsedSection = { heading: string | null; level: number; body: string; id: string }

function parseSections(md: string): ParsedSection[] {
  const lines = md.split('\n')
  const sections: ParsedSection[] = []
  const seenIds = new Map<string, number>()
  let current: ParsedSection = { heading: null, level: 0, body: '', id: '' }

  for (const line of lines) {
    const h = line.match(/^(#{1,3}) (.+)$/)
    if (h) {
      if (current.heading !== null || current.body.trim()) sections.push(current)
      const text = h[2].trim()
      let id = createHeadingId(text)
      // Match the same dedup logic as extractToc so IDs stay in sync
      const count = seenIds.get(id) ?? 0
      seenIds.set(id, count + 1)
      if (count > 0) id = `${id}-${count}`
      current = {
        heading: text,
        level: h[1].length,
        body: '',
        id,
      }
    } else {
      current.body += (current.body ? '\n' : '') + line
    }
  }
  if (current.heading !== null || current.body.trim()) sections.push(current)
  if (!sections.length) sections.push({ heading: null, level: 0, body: md, id: 'content' })
  return sections
}

const headingColors: Record<number, string> = {
  1: 'bg-primary',
  2: 'bg-blue-500',
  3: 'bg-purple-500',
}

function SectionRenderer({ content }: { content: string }) {
  const sections = useMemo(() => parseSections(content), [content])

  return (
    <div className="space-y-10">
      {sections.map((section, idx) => (
        <section key={idx} id={section.id || `section-${idx}`} className="scroll-mt-28">
          {section.heading && (
            <div className="flex items-start gap-3 mb-5">
              <div className={cn(
                'mt-1 rounded-full shrink-0',
                section.level === 1 ? 'w-1.5 h-8' : section.level === 2 ? 'w-1.5 h-6' : 'w-1 h-5',
                headingColors[section.level] || 'bg-primary',
              )} aria-hidden="true" />
              {section.level === 1 && (
                <h1 className="text-[2.25rem] font-bold leading-tight tracking-tight text-foreground">{section.heading}</h1>
              )}
              {section.level === 2 && (
                <h2 className="text-[1.85rem] font-semibold leading-tight tracking-tight text-foreground">{section.heading}</h2>
              )}
              {section.level === 3 && (
                <h3 className="text-[1.5rem] font-semibold text-foreground">{section.heading}</h3>
              )}
            </div>
          )}
          {section.body.trim() && (
            <div className={cn(section.heading ? 'pl-5' : '')}>
              <MarkdownWrapper content={section.body} />
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

// ─── Table of Contents ───────────────────────────────────────────────────────

function TableOfContents({ entries, scrollRef }: { entries: TocEntry[]; scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    if (!entries.length) return
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const scrollTop = el.scrollTop + 120
      let current = entries[0]?.id ?? ''
      for (const entry of entries) {
        // Use getElementById — safe for any id including those starting with digits
        const dom = document.getElementById(entry.id)
        if (dom && dom.offsetTop <= scrollTop) current = entry.id
      }
      setActive(current)
    }
    el.addEventListener('scroll', update, { passive: true })
    update()
    return () => el.removeEventListener('scroll', update)
  }, [entries, scrollRef])

  if (!entries.length) {
    return <p className="text-xs text-muted-foreground px-1">No headings found in this lesson.</p>
  }

  return (
    <nav aria-label="Table of contents">
      <ul className="space-y-0.5">
        {entries.map((e) => (
          <li key={e.id}>
            <button
              onClick={() => {
                const dom = document.getElementById(e.id)
                if (dom) dom.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className={cn(
                'w-full text-left text-xs py-1.5 px-2 rounded-md transition-all',
                e.level === 1 ? 'pl-2 font-semibold' : e.level === 2 ? 'pl-4' : 'pl-6 text-muted-foreground',
                active === e.id
                  ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                  : 'hover:bg-accent/10 hover:text-foreground text-muted-foreground',
              )}
            >
              {e.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ─── Rich Notes Panel ────────────────────────────────────────────────────────

function NotesPanel({ lessonId }: { lessonId: string }) {
  const { data: notes, isLoading, isError, refetch } = useLessonNotes(lessonId)
  const { mutate: createNote, isPending: creating } = useCreateLessonNote()
  const { mutate: updateNote, isPending: updating } = useUpdateLessonNote()
  const existingNote = notes?.[0]
  const [content, setContent] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (existingNote?.content !== undefined) setContent(existingNote.content)
  }, [existingNote?.content, existingNote?.id])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((text: string) => {
      const onSuccess = () => { setSavedAt(new Date().toLocaleTimeString()); setIsDirty(false) }
      if (existingNote) {
        updateNote({ lessonId, noteId: existingNote.id, content: text }, { onSuccess })
      } else {
        createNote({ lessonId, content: text }, { onSuccess })
      }
    }, 2000),
    [existingNote, lessonId, createNote, updateNote],
  )

  const handleChange = (val: string) => {
    setContent(val)
    setIsDirty(true)
    debouncedSave(val)
  }

  const insertFormatting = (before: string, after = '') => {
    const ta = document.getElementById('lesson-notes-area') as HTMLTextAreaElement
    if (!ta) return
    const start = ta.selectionStart, end = ta.selectionEnd
    const selected = content.slice(start, end)
    const newVal = content.slice(0, start) + before + selected + after + content.slice(end)
    handleChange(newVal)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, start + before.length + selected.length) }, 0)
  }

  if (isLoading) return <div className="p-4 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-32 w-full rounded-md mt-2" /></div>
  if (isError) return (
    <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">Couldn't load notes</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-xs font-bold" onClick={() => insertFormatting('**', '**')} title="Bold"><span className="font-bold text-sm">B</span></Button>
          <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-xs italic" onClick={() => insertFormatting('_', '_')} title="Italic"><span className="italic text-sm">I</span></Button>
          <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-[11px]" onClick={() => insertFormatting('`', '`')} title="Code"><span className="font-mono">{'<>'}</span></Button>
          <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => insertFormatting('\n- ')} title="Bullet list"><List className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => insertFormatting('\n- [ ] ')} title="Checklist"><CheckCircle2 className="h-3 w-3" /></Button>
        </div>
        {savedAt && (
          <span className={cn('text-[10px] shrink-0', isDirty ? 'text-amber-500' : 'text-green-500')}>
            {isDirty ? 'Saving...' : `Saved ${savedAt}`}
          </span>
        )}
      </div>
      <div className="flex-1 p-3 flex flex-col min-h-0">
        <p className="text-[11px] text-muted-foreground mb-2">Notes auto-save every 2 seconds as you type.</p>
        <textarea
          id="lesson-notes-area"
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          disabled={creating || updating}
          placeholder={"Write your notes here...\n\n• Key concepts\n• Code snippets\n• Questions to revisit"}
          className={cn(
            'flex-1 w-full rounded-lg border border-input bg-background/60 px-3 py-3 text-sm',
            'placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'resize-none min-h-[180px] leading-relaxed',
          )}
        />
      </div>
    </div>
  )
}

// ─── Progress Tab ────────────────────────────────────────────────────────────

function ProgressTab({
  lesson,
  sections,
  lessonIndex,
  totalLessons,
}: {
  lesson: NonNullable<ReturnType<typeof useLesson>['data']>
  sections: RoadmapSection[]
  lessonIndex: number
  totalLessons: number
}) {
  const readingTime = lesson.readingTimeMinutes ?? lesson.estimatedMinutes
  const totalCompleted = sections.reduce((a, s) => a + s.lessons.filter((l) => l.status === 'completed').length, 0)
  const totalAll = sections.reduce((a, s) => a + s.lessons.length, 0)
  const remaining = totalAll - totalCompleted
  const pct = totalAll ? Math.round((totalCompleted / totalAll) * 100) : 0

  return (
    <div className="p-4 space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Current Lesson</p>
        <div className="space-y-2.5">
          {[
            ['Status', <Badge key="s" variant={lesson.status === 'completed' ? 'success' : 'secondary'} className="text-xs capitalize">{lesson.status?.replace('_', ' ') ?? 'not started'}</Badge>],
            ['Reading time', `${readingTime} min`],
            ['Est. complete', `${lesson.estimatedMinutes} min`],
            ['Difficulty', <DifficultyBadge key="d" difficulty={lesson.difficulty ?? 'beginner'} />],
            ['Position', lessonIndex > 0 ? `${lessonIndex} of ${totalLessons}` : '—'],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Roadmap Progress</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Overall</span>
            <span className="font-bold text-primary">{pct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Completed', totalCompleted, 'text-green-600 dark:text-green-400'],
              ['Remaining', remaining, 'text-amber-600 dark:text-amber-400'],
              ['Total', totalAll, 'text-foreground'],
            ].map(([label, val, cls]) => (
              <div key={String(label)} className="rounded-lg bg-muted/60 p-2">
                <p className={cn('text-lg font-bold', cls)}>{val}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {lesson.resources && lesson.resources.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Resources ({lesson.resources.length})
            </p>
            <div className="space-y-1">
              {lesson.resources.map((r) => (
                <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline py-0.5">
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{r.title}</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Bookmarks Tab ───────────────────────────────────────────────────────────

function BookmarksTab() {
  const { data: bookmarks, isLoading } = useBookmarks({ type: 'lesson' })
  const { mutate: removeBookmark } = useRemoveBookmark()

  if (isLoading) return <div className="p-4 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
  if (!bookmarks?.length) return (
    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
      <Bookmark className="h-8 w-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">No bookmarked lessons yet</p>
    </div>
  )

  return (
    <div className="p-3 space-y-2">
      {bookmarks.map((bm) => (
        <div key={bm.id} className="flex items-start gap-2 p-2.5 rounded-lg border border-border/60 hover:bg-accent/5 group">
          <BookmarkCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <Link to={`/dashboard/learning/lesson/${bm.itemId}`} className="text-xs font-medium hover:text-primary truncate block">{bm.title}</Link>
            {bm.roadmapTitle && <p className="text-[10px] text-muted-foreground truncate">{bm.roadmapTitle}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeBookmark(bm.id)} aria-label="Remove bookmark">
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}

// ─── Practice Section ────────────────────────────────────────────────────────

function PracticeSection({ lessonId }: { lessonId: string }) {
  const { data: apiQuestions, isLoading, isError, refetch } = useLessonPractice(lessonId)
  const questions = (apiQuestions && apiQuestions.length >= 5 ? apiQuestions : FALLBACK_PRACTICE).slice().sort((a, b) => a.order - b.order)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [showHint, setShowHint] = useState<Set<string>>(new Set())
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})

  const toggle = (set: Set<string>, id: string) => { const next = new Set(set); if (next.has(id)) next.delete(id); else next.add(id); return next }
  const isCorrect = (q: PracticeQuestion) => { const ua = (userAnswers[q.id] ?? '').trim().toLowerCase(); const ans = q.answer.trim().toLowerCase(); return ua === ans || ua.replace(/\s+/g, ' ').includes(ans.replace(/\s+/g, ' ')) }

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
  if (isError) return <ErrorState title="Unable to load practice" message="Could not fetch practice questions." onRetry={() => refetch()} />

  const diffColor: Record<Difficulty, string> = { beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
  const typeLabel: Record<PracticeQuestion['type'], string> = { coding: 'Coding', theory: 'Theory', 'fill-blank': 'Fill Blank', output: 'Predict Output' }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Practice Questions</h2>
          <p className="text-sm text-muted-foreground">Solve {questions.length} questions to reinforce your learning.</p>
        </div>
      </div>
      <div className="space-y-3">
        {questions.map((q, idx) => {
          const isRev = revealed.has(q.id), isHint = showHint.has(q.id)
          const answered = !!userAnswers[q.id]?.trim(), correct = answered ? isCorrect(q) : null
          return (
            <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <div className={cn('rounded-xl border-l-4 border border-border/60 bg-card shadow-sm transition-all', correct === true ? 'border-l-green-500' : correct === false ? 'border-l-red-500' : 'border-l-primary/50')}>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">Q{idx + 1}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{typeLabel[q.type]}</Badge>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', diffColor[q.difficulty])}>{q.difficulty}</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed mb-3">{q.question}</p>
                  {q.codeSnippet && <CopyableCodeBlock code={q.codeSnippet} lang="python" />}
                  {q.options && (
                    <div className="grid gap-2 mb-3">
                      {q.options.map((opt, oi) => (
                        <label key={oi} className="flex items-center gap-2 p-2.5 rounded-lg border border-input hover:bg-accent/10 cursor-pointer text-sm transition-colors">
                          <input type="radio" name={`pq-${q.id}`} value={opt} checked={userAnswers[q.id] === opt} onChange={(e) => setUserAnswers(p => ({ ...p, [q.id]: e.target.value }))} className="h-3.5 w-3.5" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {!q.options && (
                    <textarea value={userAnswers[q.id] ?? ''} onChange={(e) => setUserAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                      placeholder={q.type === 'coding' ? '# Write your code here...' : 'Type your answer...'}
                      rows={q.type === 'coding' ? 4 : 2}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono text-xs mb-3"
                    />
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setShowHint(s => toggle(s, q.id))} className="gap-1.5 text-xs h-7">
                      <Lightbulb className="h-3.5 w-3.5" />{isHint ? 'Hide Hint' : 'Hint'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRevealed(s => toggle(s, q.id))} className="gap-1.5 text-xs h-7">
                      {isRev ? <><ChevronUp className="h-3.5 w-3.5" />Hide</> : <><ChevronDown className="h-3.5 w-3.5" />Answer</>}
                    </Button>
                    {answered && correct === true && <Badge variant="success" className="gap-1 text-xs"><CheckCircle2 className="h-3 w-3" />Correct!</Badge>}
                    {answered && correct === false && <Badge variant="destructive" className="gap-1 text-xs"><AlertTriangle className="h-3 w-3" />Review needed</Badge>}
                  </div>
                  <AnimatePresence initial={false}>
                    {isHint && q.hint && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <Callout type="tip">{q.hint}</Callout>
                      </motion.div>
                    )}
                    {isRev && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                          <p className="text-xs font-semibold">Answer:</p>
                          <CopyableCodeBlock code={q.answer} />
                          {q.explanation && <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Quiz Section ────────────────────────────────────────────────────────────

function QuizSection({ lessonId, onPassed }: { lessonId: string; onPassed?: () => void }) {
  const { data: apiQuiz, isLoading, isError, refetch } = useLessonQuiz(lessonId)
  const { mutate: submitQuiz, isPending: submitting } = useSubmitQuiz()
  const quiz = (apiQuiz && apiQuiz.length >= 5 ? apiQuiz : FALLBACK_QUIZ).slice().sort((a, b) => a.order - b.order)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number; percentage: number; passed: boolean } | null>(null)
  const allAnswered = quiz.length > 0 && quiz.every((q) => answers[q.id] !== undefined)

  const handleSubmit = () => {
    let score = 0
    for (const q of quiz) { if (answers[q.id] === q.correctOption) score++ }
    const total = quiz.length, percentage = Math.round((score / total) * 100), passed = percentage >= 60
    setResult({ score, total, percentage, passed }); setSubmitted(true)
    submitQuiz({ lessonId, answers }, { onSuccess: () => { if (passed) onPassed?.() } })
  }

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
  if (isError) return <ErrorState title="Unable to load quiz" message="Could not fetch quiz questions." onRetry={() => refetch()} />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Knowledge Quiz</h2>
          <p className="text-sm text-muted-foreground">{quiz.length} questions · Pass threshold: 60%</p>
        </div>
      </div>

      {submitted && result && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={cn('rounded-xl p-5 border', result.passed ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800')}>
          <div className="flex items-center gap-4">
            <div className={cn('w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold', result.passed ? 'bg-green-100 dark:bg-green-900/50 text-green-600' : 'bg-red-100 dark:bg-red-900/50 text-red-600')}>
              {result.passed ? '🎉' : '📚'}
            </div>
            <div>
              <h3 className={cn('font-bold text-lg', result.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400')}>{result.passed ? 'Excellent work!' : 'Keep practicing!'}</h3>
              <p className="text-sm text-muted-foreground">Score: <strong className="text-foreground">{result.score}/{result.total}</strong> ({result.percentage}%)</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setAnswers({}); setSubmitted(false); setResult(null) }}>Retake Quiz</Button>
        </motion.div>
      )}

      <div className="space-y-3">
        {quiz.map((q, idx) => {
          const userChoice = answers[q.id]
          const isCorrectChoice = submitted && userChoice === q.correctOption
          const isWrongChoice = submitted && userChoice !== undefined && userChoice !== q.correctOption
          return (
            <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <div className={cn('rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden', submitted && isCorrectChoice && 'border-green-300 dark:border-green-700', submitted && isWrongChoice && 'border-red-300 dark:border-red-700')}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide shrink-0">Q{idx + 1}</Badge>
                    {submitted && isCorrectChoice && <Badge variant="success" className="gap-1 text-xs shrink-0"><CheckCircle2 className="h-3 w-3" />Correct</Badge>}
                    {submitted && isWrongChoice && <Badge variant="destructive" className="gap-1 text-xs shrink-0"><X className="h-3 w-3" />Incorrect</Badge>}
                  </div>
                  <p className="text-sm font-medium leading-relaxed mb-3">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = userChoice === oi, isCorrectOpt = submitted && oi === q.correctOption
                      return (
                        <Label key={oi} className={cn('flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-sm transition-all',
                          isSelected && !submitted && 'border-primary bg-primary/5',
                          isCorrectOpt && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                          submitted && isSelected && oi !== q.correctOption && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                          !isSelected && !isCorrectOpt && 'border-input hover:bg-accent/10',
                        )}>
                          <input type="radio" name={`quiz-${q.id}`} value={oi} checked={isSelected}
                            onChange={() => !submitted && setAnswers(p => ({ ...p, [q.id]: oi }))} disabled={submitted} className="h-4 w-4" />
                          <span className="flex-1"><span className="font-semibold text-muted-foreground mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}</span>
                          {isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                          {submitted && isSelected && oi !== q.correctOption && <X className="h-4 w-4 text-red-500 shrink-0" />}
                        </Label>
                      )
                    })}
                  </div>
                  {submitted && q.explanation && (
                    <div className="mt-3 pt-3 border-t border-border/60">
                      <p className="text-xs"><span className="font-semibold">Explanation: </span><span className="text-muted-foreground">{q.explanation}</span></p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      {!submitted && (
        <div className="flex justify-end pt-2">
          <Button onClick={handleSubmit} disabled={!allAnswered || submitting} className="gap-2">
            <Send className="h-4 w-4" />{submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── FPRD-20 Lesson Enhancements Section ─────────────────────────────────────
// Hero, ELB cards, Memory Visualization, Visual Diagrams, Code Explanation,
// AI Summary, Highlights, Revision Cards, Interview Questions, Real-world,
// Resources, Practice, Quiz

interface FPRD20Props {
  lesson: NonNullable<ReturnType<typeof useLesson>['data']>
  sections: RoadmapSection[]
  totalLessons: number
}

function buildMemorySteps(lesson: NonNullable<ReturnType<typeof useLesson>['data']>): MemoryStep[] {
  // Use variable-related memory steps for variables/data-types lessons; generic for others
  const slug = lesson.slug?.toLowerCase() ?? ''
  if (slug.includes('variable') || slug.includes('data-type')) return VARIABLES_MEMORY_STEPS
  return VARIABLES_MEMORY_STEPS
}

function buildFlashcards(lesson: NonNullable<ReturnType<typeof useLesson>['data']>): FlashCard[] {
  const title = lesson.title ?? ''
  return [
    { id: 'f1', front: `What is a ${title.split(' ')[0]}?`, back: `A ${title.split(' ')[0]} is used to store data in Python.`, category: title },
    { id: 'f2', front: 'What type does Python use for whole numbers?', back: 'int — e.g. x = 5', category: 'Data Types' },
    { id: 'f3', front: 'How do you check the type of a variable?', back: 'Use the built-in type() function. Example: type(x)', category: 'Built-ins' },
    { id: 'f4', front: 'What is dynamic typing?', back: 'Python automatically infers the type — you don\'t need to declare it.', category: 'Python Basics' },
    { id: 'f5', front: 'What naming rules apply to Python variables?', back: 'Must start with letter or _, can contain letters/digits/_, case-sensitive.', category: 'Naming' },
  ]
}

function FPRD20Enhancements({ lesson, sections, totalLessons }: FPRD20Props) {
  const completedLessons = sections.reduce((a, s) => a + s.lessons.filter((l) => l.status === 'completed').length, 0)
  const memorySteps = useMemo(() => buildMemorySteps(lesson), [lesson.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const flashcards = useMemo(() => buildFlashcards(lesson), [lesson.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-14">
      {/* ── Hero Section ── */}
      <LessonHero
        title={lesson.title}
        tagline={lesson.description ?? 'Master this Python concept with interactive examples and hands-on practice.'}
        animationText={
          lesson.slug?.includes('variable')
            ? 'name = "John" → Memory → John'
            : lesson.slug?.includes('loop')
              ? 'for i in range(5) → Iterate → 0, 1, 2, 3, 4'
              : lesson.slug?.includes('function')
                ? 'def greet() → Call → "Hello!"'
                : undefined
        }
      />

      {/* ── Explain Like Beginner ── */}
      <section aria-labelledby="elb-heading">
        <h2 id="elb-heading" className="text-xl font-bold mb-4">Explain Like a Beginner</h2>
        <ExplainLikeBeginner
          analogy={
            lesson.slug?.includes('variable')
              ? 'Imagine you have a labeled box. You write "age" on the outside, and put 18 inside. That box is your variable — you can always open it to see or change the value.'
              : lesson.slug?.includes('loop')
                ? 'Think of a loop like a photocopier set to make 5 copies. It does the same job over and over until it hits the count you set.'
                : lesson.slug?.includes('function')
                  ? 'A function is like a recipe. You write it once, and you can use it anytime you want to cook that dish — without re-writing the steps.'
                  : `Think of ${lesson.title} as a building block. You learn it once and use it everywhere in your code.`
          }
          cards={[
            {
              emoji: '📦',
              text: lesson.slug?.includes('variable')
                ? 'A box to store information'
                : lesson.slug?.includes('loop')
                  ? 'Repeat a task N times'
                  : 'A reusable building block',
            },
            {
              emoji: '✏️',
              text: lesson.slug?.includes('variable')
                ? 'Label it with a name'
                : lesson.slug?.includes('loop')
                  ? 'Set start and end conditions'
                  : 'Write once, use many times',
            },
            {
              emoji: '🔍',
              text: lesson.slug?.includes('variable')
                ? 'Look inside to read the value'
                : lesson.slug?.includes('loop')
                  ? 'Each run is one iteration'
                  : 'Improves code readability',
            },
          ]}
        />
      </section>

      {/* ── Memory Visualization ── */}
      <section aria-labelledby="memory-heading">
        <div className="flex items-center gap-3 mb-4">
          <h2 id="memory-heading" className="text-xl font-bold">Memory Visualization</h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            Python Tutor style
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Step through the code and watch variables appear in memory in real time.
        </p>
        <MemoryVisualization steps={memorySteps} title="Step-by-Step Execution" />
      </section>

      {/* ── Code Walkthrough (Explanation) ── */}
      <section aria-labelledby="code-walk-heading">
        <h2 id="code-walk-heading" className="text-xl font-bold mb-4">Code Walkthrough</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Click any line of code to understand exactly what it does.
        </p>
        <CodeExplanation
          title={`${lesson.title} — Code Explained`}
          lines={
            lesson.slug?.includes('variable')
              ? [
                  { code: 'name = "Alex"', explanation: 'Creates a variable called "name" and assigns the string value "Alex" to it. Python stores this in memory.' },
                  { code: 'age = 20', explanation: 'Creates an integer variable "age" with value 20. Python automatically knows this is an int.' },
                  { code: 'is_student = True', explanation: 'Creates a boolean variable. In Python, booleans are True or False (capitalized).' },
                  { code: 'print(name)', explanation: 'Calls the print() function which reads the value stored in "name" and outputs it to the console: Alex' },
                  { code: 'print(type(age))', explanation: 'type() is a built-in function that returns the data type. For age=20, it returns <class \'int\'>' },
                ]
              : lesson.slug?.includes('loop')
                ? [
                    { code: 'for i in range(5):', explanation: 'The for loop iterates over range(5) which generates 0, 1, 2, 3, 4. "i" takes each value in order.' },
                    { code: '    print(i)', explanation: 'Inside the loop body (indented), print(i) outputs the current value of i on each iteration.' },
                    { code: 'print("Done!")', explanation: 'This line is outside the loop (no indentation), so it runs once after the loop finishes.' },
                  ]
                : [
                    { code: `# ${lesson.title} example`, explanation: 'A comment in Python — the interpreter ignores this line. Use # for single-line comments.' },
                    { code: 'x = 10', explanation: 'Assigns the integer 10 to variable x.' },
                    { code: 'print(x)', explanation: 'Prints the value of x to the console.' },
                  ]
          }
        />
      </section>

      {/* ── Visual Diagram ── */}
      <section aria-labelledby="diagram-heading">
        <h2 id="diagram-heading" className="text-xl font-bold mb-4">Visual Diagram</h2>
        <VisualDiagram
          title={
            lesson.slug?.includes('variable')
              ? 'How Variables Work'
              : lesson.slug?.includes('loop')
                ? 'Loop Execution Flow'
                : `${lesson.title} Flow`
          }
          nodes={
            lesson.slug?.includes('variable')
              ? [
                  { label: 'Variable', sublabel: 'name = "Alex"', color: 'primary' },
                  { label: 'Stores Value', sublabel: '"Alex" in memory', color: 'blue' },
                  { label: 'Uses Memory', sublabel: 'RAM address', color: 'purple' },
                ]
              : lesson.slug?.includes('loop')
                ? [
                    { label: 'Start Loop', sublabel: 'for / while', color: 'primary' },
                    { label: 'Check Condition', sublabel: 'is condition true?', color: 'blue' },
                    { label: 'Execute Body', sublabel: 'run indented code', color: 'green' },
                    { label: 'Back to Check', sublabel: 'or exit', color: 'orange' },
                  ]
                : [
                    { label: 'Input', color: 'primary' },
                    { label: 'Processing', color: 'blue' },
                    { label: 'Output', color: 'green' },
                  ]
          }
        />
      </section>

      {/* ── Real World Example ── */}
      <section aria-labelledby="realworld-heading">
        <h2 id="realworld-heading" className="text-xl font-bold mb-4">Real-World Example</h2>
        <RealWorldExample
          context={
            lesson.slug?.includes('variable')
              ? 'Bank Account'
              : lesson.slug?.includes('loop')
                ? 'Online Shopping Cart'
                : 'Everyday App'
          }
          code={
            lesson.slug?.includes('variable')
              ? `# Bank Account\nbalance = 5000\nowner = "John Doe"\ninterest_rate = 0.035\n\nprint(f"Account: {owner}")\nprint(f"Balance: ₹{balance}")`
              : lesson.slug?.includes('loop')
                ? `# Shopping cart total\ncart = [299, 599, 149, 1099]\ntotal = 0\n\nfor price in cart:\n    total += price\n\nprint(f"Total: ₹{total}")`
                : `# Example: ${lesson.title}\ndata = "Hello from Python!"\nprint(data)`
          }
          explanation={
            lesson.slug?.includes('variable')
              ? 'In a banking app, every account has a balance, owner name, and interest rate stored as variables. When a transaction happens, these values update automatically.'
              : lesson.slug?.includes('loop')
                ? 'An e-commerce app loops through every item in your cart to calculate the total. Without loops, you\'d have to add each price manually.'
                : `This is how ${lesson.title} appears in real applications — every professional Python project uses these concepts daily.`
          }
        />
      </section>

      {/* ── AI Summary ── */}
      <section aria-labelledby="ai-summary-heading">
        <h2 id="ai-summary-heading" className="text-xl font-bold mb-4">AI Summary</h2>
        <AISummary
          revisionTime="3 Minute Revision"
          keyPoints={[
            lesson.slug?.includes('variable')
              ? 'Variables store data values in Python memory'
              : `${lesson.title} is a fundamental Python concept`,
            'Python uses dynamic typing — no need to declare types',
            'Variable names must start with a letter or underscore',
            'Use descriptive names: age, not a or x123',
            'Variables are mutable — their value can be reassigned anytime',
          ]}
          commonMistakes={[
            { wrong: '2variable = 10', correct: 'variable2 = 10' },
            { wrong: 'my-var = 5', correct: 'my_var = 5' },
            { wrong: 'class = "python"', correct: 'my_class = "python"' },
          ]}
        />
      </section>

      {/* ── Text Highlight Demo ── */}
      <section aria-labelledby="highlight-heading">
        <h2 id="highlight-heading" className="text-xl font-bold mb-4">Key Concepts — Highlight as you Read</h2>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <HighlightableText
            text={
              lesson.slug?.includes('variable')
                ? 'In Python, a variable is a named location in memory that stores a value. Variables are created the moment you first assign a value to them. Python is dynamically typed, which means you do not need to declare the type of a variable when you create it. The type is automatically determined based on the value you assign. Variable names are case-sensitive, so "age" and "Age" are two different variables. Names must begin with a letter or underscore character and cannot be a Python keyword.'
                : `${lesson.title} is one of the core concepts in Python programming. Understanding it deeply will help you write cleaner, more efficient code. Python developers use this concept in virtually every program they write. Practice with real examples to build confidence and muscle memory.`
            }
          />
        </div>
      </section>

      {/* ── Practice & Quiz ── */}
      <WidgetErrorBoundary label="Practice Questions" minHeight={120}>
        <PracticeSection lessonId={lesson.id} />
      </WidgetErrorBoundary>
      <Separator className="my-4" />
      <WidgetErrorBoundary label="Quiz" minHeight={120}>
        <QuizSection lessonId={lesson.id} onPassed={() => {}} />
      </WidgetErrorBoundary>

      {/* ── Revision Cards ── */}
      <section aria-labelledby="flashcards-heading">
        <h2 id="flashcards-heading" className="text-xl font-bold mb-4">Revision Cards</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Flashcards to reinforce memory. Mark what you know and what needs more review.
        </p>
        <RevisionCards cards={flashcards} title={`${lesson.title} Flashcards`} />
      </section>

      {/* ── Interview Questions ── */}
      <section aria-labelledby="interview-heading">
        <h2 id="interview-heading" className="text-xl font-bold mb-4">Interview Questions</h2>
        <InterviewQuestions
          questions={[
            {
              question: lesson.slug?.includes('variable')
                ? 'What is the difference between a local and global variable?'
                : `What is ${lesson.title} in Python?`,
              answer: lesson.slug?.includes('variable')
                ? 'A local variable is defined inside a function and only accessible within that function. A global variable is defined at module level and accessible throughout the file. Use the "global" keyword to modify a global variable from inside a function.'
                : `${lesson.title} is a core Python concept that allows developers to write more efficient and readable code.`,
              difficulty: 'medium',
            },
            {
              question: 'What is dynamic typing in Python?',
              answer: 'Python determines the type of a variable at runtime based on the value assigned to it. You don\'t declare types explicitly. This differs from statically typed languages like Java or C++ where types are declared at compile time.',
              difficulty: 'easy',
            },
            {
              question: 'What is the difference between mutable and immutable objects?',
              answer: 'Mutable objects (like lists, dicts) can be changed after creation. Immutable objects (like strings, tuples, integers) cannot be modified — a new object is created instead. This matters for memory efficiency and unexpected side effects.',
              difficulty: 'medium',
            },
            {
              question: 'How does Python manage memory?',
              answer: 'Python uses automatic memory management with a garbage collector. It uses reference counting to track objects and the gc module handles circular references. The id() function returns an object\'s memory address.',
              difficulty: 'hard',
            },
          ]}
        />
      </section>

      {/* ── Resources ── */}
      {lesson.resources && lesson.resources.length > 0 && (
        <section aria-labelledby="resources-heading">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 id="resources-heading" className="text-xl font-bold">Additional Resources</h2>
              <p className="text-sm text-muted-foreground">Official docs, videos, articles, and cheatsheets</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lesson.resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </section>
      )}

      {/* ── Progress Dashboard ── */}
      <section aria-labelledby="progress-dash-heading">
        <h2 id="progress-dash-heading" className="text-xl font-bold mb-4">Progress Dashboard</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Lessons', value: `${completedLessons} / ${totalLessons}`, emoji: '📚', color: 'text-primary' },
            { label: 'Course %', value: `${totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%`, emoji: '📊', color: 'text-green-600' },
            { label: 'Current Streak', value: '— days', emoji: '🔥', color: 'text-orange-600' },
            { label: 'Quiz Accuracy', value: '—%', emoji: '🎯', color: 'text-blue-600' },
            { label: 'Time Spent', value: `${lesson.estimatedMinutes ?? 0} min`, emoji: '⏱️', color: 'text-purple-600' },
            { label: 'XP Earned', value: `${completedLessons * 20} XP`, emoji: '⚡', color: 'text-yellow-600' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4 text-center shadow-sm"
            >
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Left Sidebar (Roadmap Nav) ──────────────────────────────────────────────

interface LeftSidebarProps {
  open: boolean
  onClose: () => void
  sections: RoadmapSection[]
  currentLessonId: string
  lesson: NonNullable<ReturnType<typeof useLesson>['data']>
  navigate: ReturnType<typeof useNavigate>
}

function LeftSidebar({ open, onClose, sections, currentLessonId, lesson, navigate }: LeftSidebarProps) {
  const totalSec = sections.reduce((a, s) => a + s.lessons.length, 0)
  const doneSec = sections.reduce((a, s) => a + s.lessons.filter((l) => l.status === 'completed').length, 0)
  const pct = totalSec ? Math.round((doneSec / totalSec) * 100) : 0

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        animate={{ width: open ? 320 : 0 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className={cn('relative flex flex-col shrink-0 overflow-hidden',
          'border-r border-border bg-card/80 backdrop-blur-sm',
          'fixed lg:relative left-0 top-0 z-50 lg:z-auto h-full lg:h-auto',
        )}
        aria-label="Lesson navigation"
        style={{ minWidth: 0 }}
      >
        {/* Close button mobile */}
        <Button variant="ghost" size="icon-sm" onClick={onClose}
          className="absolute right-2 top-2 z-10 lg:hidden" aria-label="Close navigation">
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col h-full w-80">
          {/* Header */}
          <div className="p-4 border-b border-border/60 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input type="search" placeholder="Search lessons..." className="pl-9 h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (val.length >= 2) navigate(`/dashboard/learning/search?q=${encodeURIComponent(val)}`)
                  }
                }} />
            </div>
            <Link to="/dashboard/learning/roadmaps/python" className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
              <BookOpen className="h-3.5 w-3.5" />{lesson.roadmapTitle ?? 'Python Programming'}
            </Link>
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-muted-foreground">Overall progress</span>
                <span className="font-semibold text-primary">{pct}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{doneSec} of {totalSec} lessons completed</p>
            </div>
          </div>

          {sections.length > 0 ? (
            <LessonSidebar sections={sections} currentLessonId={currentLessonId}
              roadmapTitle={lesson.roadmapTitle ?? 'Python Programming'}
              roadmapSlug={lesson.roadmapSlug ?? 'python'} className="flex-1 min-h-0" />
          ) : (
            <div className="p-4">
              <p className="text-xs text-muted-foreground">Full lesson list appears when viewing a roadmap lesson.</p>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}

// ─── Right Sidebar ───────────────────────────────────────────────────────────

interface RightSidebarProps {
  open: boolean
  tab: 'notes' | 'progress' | 'bookmarks' | 'toc'
  onTabChange: (t: 'notes' | 'progress' | 'bookmarks' | 'toc') => void
  lesson: NonNullable<ReturnType<typeof useLesson>['data']>
  sections: RoadmapSection[]
  lessonIndex: number
  totalLessons: number
  tocEntries: TocEntry[]
  scrollRef: React.RefObject<HTMLDivElement | null>
}

function RightSidebar({ open, tab, onTabChange, lesson, sections, lessonIndex, totalLessons, tocEntries, scrollRef }: RightSidebarProps) {
  return (
    <motion.aside
      animate={{ width: open ? 340 : 0 }}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
      className="hidden xl:flex flex-col shrink-0 overflow-hidden border-l border-border bg-card/60 backdrop-blur-sm"
      aria-label="Lesson tools"
      style={{ minWidth: 0 }}
    >
      <div className="flex flex-col h-full w-[340px]">
        {/* Tab bar */}
        <div className="px-3 pt-3 pb-0 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-1">
            {[
              { id: 'toc', icon: List, label: 'Contents' },
              { id: 'notes', icon: StickyNote, label: 'Notes' },
              { id: 'progress', icon: BarChart2, label: 'Progress' },
              { id: 'bookmarks', icon: Bookmark, label: 'Saved' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => onTabChange(id as typeof tab)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all',
                  tab === id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/10',
                )}
                aria-selected={tab === id}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <ScrollArea className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
              {tab === 'toc' && (
                <div className="p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">Table of Contents</p>
                  <TableOfContents entries={tocEntries} scrollRef={scrollRef} />
                </div>
              )}
              {tab === 'notes' && (
                <WidgetErrorBoundary label="Notes" minHeight={160}>
                  <NotesPanel lessonId={lesson.id} />
                </WidgetErrorBoundary>
              )}
              {tab === 'progress' && (
                <WidgetErrorBoundary label="Progress" minHeight={160}>
                  <ProgressTab lesson={lesson} sections={sections} lessonIndex={lessonIndex} totalLessons={totalLessons} />
                </WidgetErrorBoundary>
              )}
              {tab === 'bookmarks' && (
                <WidgetErrorBoundary label="Bookmarks" minHeight={120}>
                  <BookmarksTab />
                </WidgetErrorBoundary>
              )}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>
      </div>
    </motion.aside>
  )
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6">
      <div className="hidden lg:flex w-80 border-r border-border flex-col bg-card/60">
        <div className="p-4 border-b border-border space-y-3">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-4 w-40" />
          <div className="h-1.5 bg-muted rounded-full overflow-hidden"><Skeleton className="h-full w-1/2" /></div>
        </div>
        <div className="p-4 space-y-2 flex-1">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}</div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border p-4 space-y-3">
          <Skeleton className="h-9 w-3/4" /><Skeleton className="h-5 w-1/2" />
        </div>
        <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-4">
          <LessonViewerSkeleton />
        </div>
      </div>
      <div className="hidden xl:flex w-80 border-l border-border flex-col bg-card/60">
        <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function LessonViewerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    lessonSidebarOpen, setLessonSidebarOpen,
    lessonRightSidebarOpen, setLessonRightSidebarOpen,
    lessonRightTab, setLessonRightTab,
  } = useLearningStore()

  const { data: lesson, isLoading, isError, refetch } = useLesson(id ?? '')
  const { mutate: markComplete, isPending: completing } = useMarkLessonComplete()
  const { mutate: markStarted } = useMarkLessonStarted()
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useToggleLessonBookmark()
  const { data: roadmap, isLoading: roadmapLoading } = useRoadmap(lesson?.roadmapSlug ?? '')
  const sections = roadmap?.sections ?? []

  const scrollRef = useRef<HTMLDivElement>(null)

  // Prefetch next lesson
  useEffect(() => { if (lesson?.nextLessonId) prefetchLesson(lesson.nextLessonId) }, [lesson?.nextLessonId])

  // Mark started
  useEffect(() => {
    if (id && lesson?.status === 'not_started') markStarted(id)
  }, [id, lesson?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowLeft' && lesson?.prevLessonId) navigate(`/dashboard/learning/lesson/${lesson.prevLessonId}`)
      if (e.key === 'ArrowRight' && lesson?.nextLessonId) navigate(`/dashboard/learning/lesson/${lesson.nextLessonId}`)
      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); setLessonSidebarOpen(!lessonSidebarOpen) }
      if (e.ctrlKey && e.shiftKey && e.key === 'B') { e.preventDefault(); setLessonRightSidebarOpen(!lessonRightSidebarOpen) }
      if (e.key === 'Escape') { setLessonSidebarOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lesson, navigate, lessonSidebarOpen, lessonRightSidebarOpen, setLessonSidebarOpen, setLessonRightSidebarOpen])

  const { lessonIndex, totalLessonsInRoadmap } = useMemo(() => {
    if (!sections.length || !id) return { lessonIndex: -1, totalLessonsInRoadmap: 0 }
    let idx = 0, total = 0
    for (const s of sections) {
      for (const l of s.lessons) {
        total++
        if (l.id === id) idx = total
      }
    }
    return { lessonIndex: idx, totalLessonsInRoadmap: total }
  }, [sections, id])

  const tocEntries = useMemo(() => lesson?.content ? extractToc(lesson.content) : [], [lesson?.content])

  const [completionModalOpen, setCompletionModalOpen] = useState(false)

  const handleComplete = () => {
    if (!id) return
    markComplete(id, {
      onSuccess: () => {
        setCompletionModalOpen(true)
      },
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: lesson?.title, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (isLoading || roadmapLoading) return <PageSkeleton />
  if (isError || !lesson) return (
    <div className="min-h-[60vh] flex items-center justify-center -m-6">
      <ErrorState title="Unable to load lesson" message="This lesson doesn't exist or we couldn't reach the server." onRetry={() => refetch()} />
    </div>
  )

  const readingTime = lesson.readingTimeMinutes ?? lesson.estimatedMinutes
  const difficulty = lesson.difficulty ?? 'beginner'
  const progress = lessonIndex > 0 && totalLessonsInRoadmap > 0
    ? Math.round((lessonIndex / totalLessonsInRoadmap) * 100) : 0

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6 overflow-hidden bg-background" role="main">

      {/* ── Lesson Completion Modal (FPRD-20) ── */}
      <LessonCompletionModal
        isOpen={completionModalOpen}
        onClose={() => {
          setCompletionModalOpen(false)
          if (lesson?.nextLessonId) navigate(`/dashboard/learning/lesson/${lesson.nextLessonId}`)
        }}
        lessonTitle={lesson?.title ?? ''}
        xp={20}
        coins={5}
        nextLessonId={lesson?.nextLessonId}
        nextLessonTitle={undefined}
        lessonsCompleted={lessonIndex}
        totalLessons={totalLessonsInRoadmap}
      />

      {/* ── Left Sidebar ── */}
      <LeftSidebar
        open={lessonSidebarOpen}
        onClose={() => setLessonSidebarOpen(false)}
        sections={sections}
        currentLessonId={lesson.id}
        lesson={lesson}
        navigate={navigate}
      />

      {/* ── Center Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur shrink-0 border-b border-border relative">
          <ReadingProgressBar scrollRef={scrollRef} />

          {/* Toolbar row */}
          <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border/40">
            <div className="flex items-center gap-2 min-w-0">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" onClick={() => setLessonSidebarOpen(!lessonSidebarOpen)}
                      aria-label={lessonSidebarOpen ? 'Collapse roadmap panel' : 'Expand roadmap panel'}>
                      {lessonSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{lessonSidebarOpen ? 'Collapse roadmap (Ctrl+B)' : 'Expand roadmap (Ctrl+B)'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="min-w-0 hidden sm:block">
                <p className="text-[11px] text-muted-foreground truncate">
                  <Link to="/dashboard/learning" className="hover:text-primary transition-colors">Learning</Link>
                  {lesson.roadmapTitle && <> · <Link to={`/dashboard/learning/roadmaps/${lesson.roadmapSlug ?? ''}`} className="hover:text-primary transition-colors">{lesson.roadmapTitle}</Link></>}
                  {lesson.sectionTitle && <> · <span>{lesson.sectionTitle}</span></>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={lesson.status === 'completed' ? 'success' : lesson.status === 'in_progress' ? 'info' : 'secondary'} className="text-xs hidden sm:flex">
                {lesson.status === 'completed' ? '✓ Completed' : lesson.status === 'in_progress' ? 'In Progress' : 'Not Started'}
              </Badge>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" onClick={() => id && toggleBookmark(id)} disabled={bookmarkPending}
                      aria-label={lesson.isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'} aria-pressed={lesson.isBookmarked}>
                      {lesson.isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{lesson.isBookmarked ? 'Remove bookmark' : 'Bookmark'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" onClick={handleShare} aria-label="Share lesson"><Share2 className="h-4 w-4" /></Button>
                  </TooltipTrigger>
                  <TooltipContent>Share lesson</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="hidden xl:flex" onClick={() => setLessonRightSidebarOpen(!lessonRightSidebarOpen)}
                      aria-label={lessonRightSidebarOpen ? 'Collapse tools panel' : 'Expand tools panel'}>
                      {lessonRightSidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{lessonRightSidebarOpen ? 'Collapse tools (Ctrl+Shift+B)' : 'Expand tools (Ctrl+Shift+B)'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Lesson position + Prev/Next navigation */}
          <div className="flex items-center justify-between px-6 lg:px-10 pt-3 pb-0 max-w-[900px] mx-auto w-full">
            <Button
              variant="ghost"
              size="sm"
              asChild={!!lesson.prevLessonId}
              disabled={!lesson.prevLessonId}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
            >
              {lesson.prevLessonId ? (
                <Link to={`/dashboard/learning/lesson/${lesson.prevLessonId}`}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous Lesson
                </Link>
              ) : (
                <><ChevronLeft className="h-3.5 w-3.5" />Previous Lesson</>
              )}
            </Button>

            {lessonIndex > 0 && (
              <span className="text-xs text-muted-foreground font-medium tabular-nums">
                Lesson {lessonIndex} of {totalLessonsInRoadmap}
              </span>
            )}

            <Button
              variant="ghost"
              size="sm"
              asChild={!!lesson.nextLessonId}
              disabled={!lesson.nextLessonId}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -mr-2"
            >
              {lesson.nextLessonId ? (
                <Link to={`/dashboard/learning/lesson/${lesson.nextLessonId}`}>
                  Next Lesson
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>Next Lesson<ChevronRight className="h-3.5 w-3.5" /></>
              )}
            </Button>
          </div>

          {/* Lesson header */}
          <div className="px-6 lg:px-10 py-6 max-w-[900px] mx-auto w-full">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl lg:text-[2.6rem] font-bold leading-tight tracking-tight text-foreground">
                {lesson.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <DifficultyBadge difficulty={difficulty} />
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />{readingTime} min read
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />Est. {lesson.estimatedMinutes} min
                </span>
                {lessonIndex > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ChevronFirst className="h-4 w-4" />Lesson {lessonIndex} of {totalLessonsInRoadmap}
                  </span>
                )}
                {lessonIndex > 0 && totalLessonsInRoadmap > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{progress}%</span>
                  </div>
                )}
                <Button
                  onClick={handleComplete}
                  disabled={completing || lesson.status === 'completed'}
                  size="sm"
                  variant={lesson.status === 'completed' ? 'outline' : 'default'}
                  className="gap-1.5 ml-auto"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {lesson.status === 'completed' ? 'Completed ✓' : completing ? 'Marking...' : 'Mark Complete'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto" id="lesson-content-scroll">
          <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-10 pb-36">
            <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-14">

              {lesson.content ? (
                <SectionRenderer content={lesson.content} />
              ) : (
                <div className="rounded-xl border border-dashed border-border p-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-muted-foreground">Lesson content will appear here.</p>
                </div>
              )}

              {/* ── FPRD-20 Enhancements ── */}
              <Separator className="my-4" />
              <FPRD20Enhancements lesson={lesson} sections={sections} totalLessons={totalLessonsInRoadmap} />

              {lesson.resources && lesson.resources.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold">Additional Resources</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lesson.resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Sticky bottom nav */}
        <nav className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur shrink-0" aria-label="Lesson navigation">
          <div className="max-w-[900px] mx-auto w-full px-6 lg:px-10 py-3 flex items-center justify-between gap-3">

            {/* Previous */}
            <Button variant="outline" size="sm" asChild={!!lesson.prevLessonId} disabled={!lesson.prevLessonId}
              className="gap-2 group min-w-0 max-w-[200px]">
              {lesson.prevLessonId ? (
                <Link to={`/dashboard/learning/lesson/${lesson.prevLessonId}`}>
                  <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                  <span className="truncate text-sm">Previous</span>
                </Link>
              ) : (
                <><ChevronLeft className="h-4 w-4 shrink-0" /><span className="text-sm">Previous</span></>
              )}
            </Button>

            {/* Center info */}
            <div className="flex flex-col items-center gap-1 hidden sm:flex">
              {lessonIndex > 0 && (
                <span className="text-xs text-muted-foreground font-medium">{lessonIndex} / {totalLessonsInRoadmap}</span>
              )}
              <Button
                onClick={handleComplete}
                disabled={completing || lesson.status === 'completed' || !lesson.nextLessonId}
                className="gap-2"
                size="sm"
                variant={lesson.status === 'completed' ? 'outline' : 'default'}
              >
                <CheckCircle2 className="h-4 w-4" />
                {lesson.status === 'completed' ? 'Completed' : completing ? 'Saving...' : 'Complete & Next'}
              </Button>
            </div>

            {/* Next */}
            <Button variant={lesson.nextLessonId ? 'default' : 'outline'} size="sm"
              asChild={!!lesson.nextLessonId} disabled={!lesson.nextLessonId}
              className="gap-2 group min-w-0 max-w-[200px]">
              {lesson.nextLessonId ? (
                <Link to={`/dashboard/learning/lesson/${lesson.nextLessonId}`}>
                  <span className="truncate text-sm">Next</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              ) : (
                <><span className="text-sm">Next</span><ChevronRight className="h-4 w-4 shrink-0" /></>
              )}
            </Button>
          </div>
        </nav>
      </div>

      {/* ── Right Sidebar ── */}
      <RightSidebar
        open={lessonRightSidebarOpen}
        tab={lessonRightTab}
        onTabChange={setLessonRightTab}
        lesson={lesson}
        sections={sections}
        lessonIndex={lessonIndex}
        totalLessons={totalLessonsInRoadmap}
        tocEntries={tocEntries}
        scrollRef={scrollRef}
      />

      {/* Floating progress indicator */}
      <FloatingProgress scrollRef={scrollRef} />
    </div>
  )
}
