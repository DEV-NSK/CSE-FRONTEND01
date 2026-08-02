/**
 * FPRD-20: Lesson Enhancements
 * Contains:
 *  - ExplainLikeBeginner (ELB cards)
 *  - CodeExplanation (clickable lines)
 *  - VisualDiagram (flow boxes)
 *  - RealWorldExample
 *  - AISummary (key points + common mistakes)
 *  - InterviewQuestions
 *  - HighlightableText
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle,
  Lightbulb, BookOpen, ArrowDown, HelpCircle, Sparkles,
  Info,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

// ─── Explain Like Beginner ─────────────────────────────────────────────────

interface ELBCard {
  emoji: string
  text: string
}

interface ExplainLikeBeginnerProps {
  analogy: string
  cards: ELBCard[]
}

export function ExplainLikeBeginner({ analogy, cards }: ExplainLikeBeginnerProps) {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <h4 className="font-semibold text-amber-800 dark:text-amber-200">Explain Like I'm a Beginner</h4>
      </div>
      <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed italic">{analogy}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-lg bg-white dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 text-center shadow-sm"
          >
            <div className="text-2xl mb-1">{card.emoji}</div>
            <p className="text-xs text-foreground/80 leading-relaxed">{card.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Code Explanation (clickable lines) ────────────────────────────────────

interface CodeLine {
  code: string
  explanation: string
}

interface CodeExplanationProps {
  lines: CodeLine[]
  title?: string
}

export function CodeExplanation({ lines, title = 'Code Walkthrough' }: CodeExplanationProps) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
      {/* VS Code style header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e1e2e] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-[#a6accd] font-medium">{title}</span>
        </div>
        <span className="text-[10px] text-[#6272a4]">Click any line for explanation</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2">
        {/* Code */}
        <div className="bg-[#1e1e2e] p-4 font-mono">
          {lines.map((line, i) => (
            <button
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              className={cn(
                'w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all',
                selected === i
                  ? 'bg-blue-500/20 border-l-2 border-blue-400'
                  : 'hover:bg-white/5 border-l-2 border-transparent',
              )}
              aria-expanded={selected === i}
            >
              <span className="w-4 text-[#6272a4] text-right text-[10px] shrink-0">{i + 1}</span>
              <code className={cn('text-[#cdd6f4]', selected === i && 'text-blue-300')}>
                {line.code}
              </code>
            </button>
          ))}
        </div>

        {/* Explanation panel */}
        <div className="bg-card p-4 min-h-[120px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {selected !== null ? (
              <motion.div
                key={selected}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">Line {selected + 1}</Badge>
                  <code className="text-xs text-primary font-mono">{lines[selected].code}</code>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {lines[selected].explanation}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground/50"
              >
                <HelpCircle className="h-8 w-8" />
                <p className="text-xs">Click a line to see its explanation</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Visual Diagram ────────────────────────────────────────────────────────

interface DiagramNode {
  label: string
  sublabel?: string
  color?: 'primary' | 'green' | 'blue' | 'purple' | 'orange'
}

interface VisualDiagramProps {
  title: string
  nodes: DiagramNode[]
  layout?: 'vertical' | 'horizontal'
}

const nodeColors: Record<string, string> = {
  primary: 'bg-primary/10 border-primary/50 text-primary',
  green: 'bg-green-100 dark:bg-green-950/30 border-green-400/50 text-green-700 dark:text-green-300',
  blue: 'bg-blue-100 dark:bg-blue-950/30 border-blue-400/50 text-blue-700 dark:text-blue-300',
  purple: 'bg-purple-100 dark:bg-purple-950/30 border-purple-400/50 text-purple-700 dark:text-purple-300',
  orange: 'bg-orange-100 dark:bg-orange-950/30 border-orange-400/50 text-orange-700 dark:text-orange-300',
}

export function VisualDiagram({ title, nodes, layout = 'vertical' }: VisualDiagramProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h4 className="font-semibold">{title}</h4>
      </div>

      <div
        className={cn(
          'flex items-center gap-0',
          layout === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        )}
      >
        {nodes.map((node, i) => (
          <div key={i} className={cn('flex items-center', layout === 'vertical' ? 'flex-col' : 'flex-row')}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'px-4 py-2.5 rounded-lg border text-sm font-medium text-center shadow-sm min-w-[120px]',
                nodeColors[node.color ?? 'primary'],
              )}
            >
              {node.label}
              {node.sublabel && (
                <p className="text-[10px] opacity-70 font-normal mt-0.5">{node.sublabel}</p>
              )}
            </motion.div>
            {i < nodes.length - 1 && (
              <div
                className={cn(
                  'flex items-center justify-center text-muted-foreground',
                  layout === 'vertical' ? 'py-1' : 'px-2',
                )}
              >
                <ArrowDown
                  className={cn(
                    'h-5 w-5',
                    layout === 'horizontal' && '-rotate-90',
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Real World Example ────────────────────────────────────────────────────

interface RealWorldExampleProps {
  context: string
  code: string
  explanation: string
}

export function RealWorldExample({ context, code, explanation }: RealWorldExampleProps) {
  return (
    <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
          <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h4 className="font-semibold text-green-800 dark:text-green-200">Real-World Example</h4>
          <p className="text-xs text-green-700/70 dark:text-green-400/70">{context}</p>
        </div>
      </div>
      <div className="rounded-lg bg-[#1e1e2e] p-3 overflow-x-auto">
        <code className="text-xs font-mono text-[#cdd6f4] whitespace-pre">{code}</code>
      </div>
      <p className="text-sm text-green-900 dark:text-green-100 leading-relaxed">{explanation}</p>
    </div>
  )
}

// ─── AI Summary ───────────────────────────────────────────────────────────

interface AISummaryProps {
  revisionTime?: string
  keyPoints: string[]
  commonMistakes: Array<{ wrong: string; correct?: string }>
}

export function AISummary({
  revisionTime = '3 Minute Revision',
  keyPoints,
  commonMistakes,
}: AISummaryProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">AI Summary</h4>
            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">{revisionTime}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-indigo-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-indigo-500" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Key Points */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Key Points
                </h5>
                <div className="space-y-1.5">
                  {keyPoints.map((point, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-foreground/90">{point}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Common Mistakes */}
              {commonMistakes.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Common Mistakes
                  </h5>
                  <div className="space-y-2">
                    {commonMistakes.map((m, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-red-500 font-mono">✗</span>
                          <code className="text-xs font-mono bg-red-100 dark:bg-red-950/30 px-2 py-0.5 rounded text-red-700 dark:text-red-300">
                            {m.wrong}
                          </code>
                          <Badge variant="destructive" className="text-[9px] h-4 px-1">Invalid</Badge>
                        </div>
                        {m.correct && (
                          <div className="flex items-center gap-2 text-sm ml-4">
                            <span className="text-green-500 font-mono">✓</span>
                            <code className="text-xs font-mono bg-green-100 dark:bg-green-950/30 px-2 py-0.5 rounded text-green-700 dark:text-green-300">
                              {m.correct}
                            </code>
                            <Badge variant="success" className="text-[9px] h-4 px-1">Correct</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Interview Questions ────────────────────────────────────────────────────

interface InterviewQuestion {
  question: string
  answer: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface InterviewQuestionsProps {
  questions: InterviewQuestion[]
}

export function InterviewQuestions({ questions }: InterviewQuestionsProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const diffColor: Record<string, string> = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h4 className="font-semibold">Interview Questions</h4>
          <p className="text-xs text-muted-foreground">Collapsible answers</p>
        </div>
      </div>

      {questions.map((q, i) => (
        <div
          key={i}
          className="rounded-xl border border-border overflow-hidden shadow-sm"
        >
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-accent/10 transition-colors"
            aria-expanded={expanded.has(i)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-bold text-muted-foreground shrink-0">Q{i + 1}</span>
              <span className="text-sm font-medium text-foreground">{q.question}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {q.difficulty && (
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', diffColor[q.difficulty])}>
                  {q.difficulty}
                </span>
              )}
              <motion.div animate={{ rotate: expanded.has(i) ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expanded.has(i) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 border-t border-border/60 bg-muted/20">
                  <p className="text-sm text-foreground/90 leading-relaxed">{q.answer}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

// ─── Text Highlighter ──────────────────────────────────────────────────────

type HighlightColor = 'yellow' | 'green' | 'pink'

interface Highlight {
  start: number
  end: number
  color: HighlightColor
}

const highlightStyles: Record<HighlightColor, string> = {
  yellow: 'bg-yellow-200 dark:bg-yellow-800/60 text-yellow-900 dark:text-yellow-100',
  green: 'bg-green-200 dark:bg-green-800/60 text-green-900 dark:text-green-100',
  pink: 'bg-pink-200 dark:bg-pink-800/60 text-pink-900 dark:text-pink-100',
}

interface HighlightableTextProps {
  text: string
  className?: string
}

export function HighlightableText({ text, className }: HighlightableTextProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [activeColor, setActiveColor] = useState<HighlightColor>('yellow')
  const [showPicker, setShowPicker] = useState(false)

  const handleMouseUp = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return
    const range = selection.getRangeAt(0)
    const container = document.getElementById('highlightable-text')
    if (!container || !container.contains(range.commonAncestorContainer)) return

    // Simple approach: get selected text and find its position in the full text
    const selectedText = selection.toString()
    if (!selectedText.trim()) return

    const startIdx = text.indexOf(selectedText)
    if (startIdx === -1) return
    const endIdx = startIdx + selectedText.length

    setHighlights((prev) => {
      // Remove overlapping highlights, then add new one
      const filtered = prev.filter((h) => h.end <= startIdx || h.start >= endIdx)
      return [...filtered, { start: startIdx, end: endIdx, color: activeColor }]
    })

    selection.removeAllRanges()
  }

  // Render text with highlights
  const renderHighlighted = () => {
    if (!highlights.length) return <span>{text}</span>

    const sorted = [...highlights].sort((a, b) => a.start - b.start)
    const parts: React.ReactNode[] = []
    let cursor = 0

    for (const h of sorted) {
      if (h.start > cursor) parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, h.start)}</span>)
      parts.push(
        <mark
          key={`h-${h.start}`}
          className={cn('rounded px-0.5', highlightStyles[h.color])}
        >
          {text.slice(h.start, h.end)}
        </mark>,
      )
      cursor = h.end
    }
    if (cursor < text.length) parts.push(<span key={`t-end`}>{text.slice(cursor)}</span>)
    return <>{parts}</>
  }

  return (
    <div className="space-y-2">
      {/* Color picker */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Highlight color:</span>
        {(['yellow', 'green', 'pink'] as HighlightColor[]).map((c) => (
          <button
            key={c}
            onClick={() => setActiveColor(c)}
            className={cn(
              'h-5 w-5 rounded border-2 transition-all',
              c === 'yellow' && 'bg-yellow-300',
              c === 'green' && 'bg-green-300',
              c === 'pink' && 'bg-pink-300',
              activeColor === c ? 'border-foreground scale-110' : 'border-transparent',
            )}
            aria-label={`${c} highlight`}
            aria-pressed={activeColor === c}
          />
        ))}
        {highlights.length > 0 && (
          <button
            onClick={() => setHighlights([])}
            className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
          >
            Clear all
          </button>
        )}
        <span className="text-[10px] text-muted-foreground ml-auto">Select text to highlight</span>
      </div>

      {/* Highlightable text */}
      <div
        id="highlightable-text"
        onMouseUp={handleMouseUp}
        className={cn('text-sm leading-relaxed cursor-text select-text', className)}
      >
        {renderHighlighted()}
      </div>
    </div>
  )
}

// ─── Lesson Hero Section ──────────────────────────────────────────────────

interface LessonHeroProps {
  title: string
  tagline: string
  animationText?: string  // e.g. "name = 'John' → Memory → John"
  icon?: string
}

export function LessonHero({ title, tagline, animationText, icon = '🐍' }: LessonHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-500/10 via-blue-500/10 to-indigo-600/10 border border-primary/20 p-6 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl shrink-0" aria-hidden="true">{icon}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">{title}</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">{tagline}</p>
          {animationText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-background/80 rounded-lg px-3 py-2 border border-border/60 font-mono text-xs text-muted-foreground"
            >
              {animationText.split('→').map((part, i, arr) => (
                <span key={i} className="flex items-center gap-2">
                  <span className={i === 1 ? 'text-primary font-semibold' : 'text-foreground/80'}>
                    {part.trim()}
                  </span>
                  {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
