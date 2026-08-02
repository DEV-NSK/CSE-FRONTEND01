import { useParams, Link, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, CheckCircle2, Menu, X,
  Clock, BookOpen, ExternalLink, Heart, Search,
  CheckCircle, AlertTriangle, Lightbulb, Send, Award,
  FileText, Copy, Check, StickyNote, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Separator } from '@/shared/components/ui/separator'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { EmptyLearningState } from '@/student/components/learning/EmptyLearningState'
import { LessonSidebar } from '@/student/components/learning/LessonSidebar'
import { LessonViewerSkeleton } from '@/student/components/learning/LearningSkeletons'
import { BookmarkButton } from '@/student/components/learning/BookmarkButton'
import { DifficultyBadge } from '@/student/components/learning/DifficultyBadge'
import { ResourceCard } from '@/student/components/learning/ResourceCard'
import {
  useLesson, useMarkLessonComplete, useMarkLessonStarted,
  useRoadmap, useToggleLessonBookmark, prefetchLesson,
  useLessonPractice, useLessonQuiz, useSubmitQuiz,
  useLessonNotes, useUpdateLessonNote, useCreateLessonNote,
} from '@/shared/hooks/useLearning'
import { useLearningStore } from '@/shared/store/learningStore'
import { cn, debounce } from '@/shared/lib/utils'
import type { Difficulty, QuizQuestion, PracticeQuestion, LessonNote } from '@/shared/types/learning'

const MarkdownRenderer = lazy(() => import('@/student/components/learning/MarkdownRenderer'))

const FALLBACK_PRACTICE: PracticeQuestion[] = [
  {
    id: 'p1', lessonId: 'fallback', order: 1,
    question: 'Write a Python program to print "Hello, World!" to the console.',
    type: 'coding', answer: 'print("Hello, World!")',
    explanation: 'In Python, the print() function outputs text to the console. Strings are enclosed in quotes.',
    hint: 'Use the built-in print() function with a string argument.',
    difficulty: 'beginner',
  },
  {
    id: 'p2', lessonId: 'fallback', order: 2,
    question: 'What will be the output of: x = 5 + 3 * 2?',
    type: 'output', answer: '11',
    explanation: 'Python follows PEMDAS/BODMAS order: multiplication (*) before addition (+). So 3*2=6, then 5+6=11.',
    options: ['16', '11', '10', '8'],
    hint: 'Remember order of operations — multiply first.',
    difficulty: 'beginner',
  },
  {
    id: 'p3', lessonId: 'fallback', order: 3,
    question: 'Create a variable named "age" and assign it the value 25.',
    type: 'fill-blank', answer: 'age = 25',
    codeSnippet: '_____ = ___',
    explanation: 'Variables in Python are created with = operator. No type keyword is needed — Python uses dynamic typing.',
    hint: 'Variable name on the left, value on the right of =.',
    difficulty: 'beginner',
  },
  {
    id: 'p4', lessonId: 'fallback', order: 4,
    question: 'Write a function called add that takes two parameters a and b and returns their sum.',
    type: 'coding', answer: 'def add(a, b):\n    return a + b',
    codeSnippet: 'Complete the function:',
    explanation: 'Functions are defined with def keyword. Parameters go in parentheses. return keyword sends value back.',
    hint: 'Use def to define the function.',
    difficulty: 'beginner',
  },
  {
    id: 'p5', lessonId: 'fallback', order: 5,
    question: 'What is the data type of: my_list = [1, 2, 3]?',
    type: 'theory', answer: 'list',
    explanation: 'Square brackets [] with comma-separated values define a list in Python. Lists are ordered, mutable collections.',
    options: ['tuple', 'list', 'dict', 'set'],
    hint: 'Square brackets define this ordered collection.',
    difficulty: 'beginner',
  },
  {
    id: 'p6', lessonId: 'fallback', order: 6,
    question: 'Write a for loop that prints numbers from 1 to 5 (inclusive).',
    type: 'coding', answer: 'for i in range(1, 6):\n    print(i)',
    explanation: 'range(1, 6) generates 1,2,3,4,5 — the end value is exclusive. Indentation matters in Python blocks.',
    hint: 'Use range() and remember the end is exclusive.',
    difficulty: 'beginner',
  },
]

const FALLBACK_QUIZ: QuizQuestion[] = [
  {
    id: 'q1', lessonId: 'fallback', order: 1,
    question: 'Which keyword is used to define a function in Python?',
    options: ['func', 'def', 'function', 'define'],
    correctOption: 1,
    explanation: 'The "def" keyword is used to define functions in Python.',
  },
  {
    id: 'q2', lessonId: 'fallback', order: 2,
    question: 'What is the output of: print(type((1, 2, 3)))?',
    options: ['<class \'list\'>', '<class \'tuple\'>', '<class \'dict\'>', '<class \'set\'>'],
    correctOption: 1,
    explanation: 'Parentheses () with comma-separated values create a tuple, which is immutable.',
  },
  {
    id: 'q3', lessonId: 'fallback', order: 3,
    question: 'Which of the following is NOT a valid Python variable name?',
    options: ['my_var', '_private', '2nd_place', 'camelCase'],
    correctOption: 2,
    explanation: 'Variable names cannot start with a number in Python. They must start with a letter or underscore.',
  },
  {
    id: 'q4', lessonId: 'fallback', order: 4,
    question: 'What does len("Python") return?',
    options: ['5', '6', '7', 'Error'],
    correctOption: 1,
    explanation: 'len() returns the number of characters in a string. "Python" has 6 characters.',
  },
  {
    id: 'q5', lessonId: 'fallback', order: 5,
    question: 'Which operator is used for integer division in Python 3?',
    options: ['/', '//', '\\', 'div'],
    correctOption: 1,
    explanation: '// performs floor/integer division. / returns a float in Python 3.',
  },
  {
    id: 'q6', lessonId: 'fallback', order: 6,
    question: 'What is the result of: [1, 2, 3] + [4, 5]?',
    options: ['[1, 2, 3, 4, 5]', '[1, 2, 3, [4, 5]]', 'Error', '[5, 7, 3]'],
    correctOption: 0,
    explanation: 'The + operator concatenates lists, creating a new list with all elements in order.',
  },
]

function LessonHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-3/4" />
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  )
}

function SectionRenderer({ content }: { content: string }) {
  const sections = useMemo(() => parseSections(content), [content])

  return (
    <div className="space-y-8">
      {sections.map((section, idx) => (
        <section key={idx} id={`section-${idx}`} className="scroll-mt-24">
          {section.heading && (
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full shrink-0" />
              {section.heading}
            </h2>
          )}
          <div className="pl-3">
            <MarkdownWrapper content={section.body} />
          </div>
        </section>
      ))}
    </div>
  )
}

function MarkdownWrapper({ content }: { content: string }) {
  return (
    <Suspense fallback={
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className={`h-4 w-${i % 2 === 0 ? 'full' : '5/6'}`} />
        ))}
      </div>
    }>
      <MarkdownRenderer content={content} />
    </Suspense>
  )
}

type ParsedSection = { heading: string | null; body: string }

function parseSections(md: string): ParsedSection[] {
  const lines = md.split('\n')
  const sections: ParsedSection[] = []
  let current: ParsedSection = { heading: null, body: '' }
  let firstHeadingFound = false

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/)
    if (h2Match) {
      if (current.heading !== null || current.body.trim()) {
        sections.push(current)
      }
      current = { heading: h2Match[1].trim(), body: '' }
      firstHeadingFound = true
    } else {
      if (!firstHeadingFound) {
        current.body += (current.body ? '\n' : '') + line
      } else {
        current.body += (current.body ? '\n' : '') + line
      }
    }
  }
  if (current.heading !== null || current.body.trim()) {
    sections.push(current)
  }
  if (sections.length === 0) {
    sections.push({ heading: null, body: md })
  }
  return sections
}

function CopyableCodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  return (
    <div className="relative group">
      <pre className="bg-muted rounded-lg p-4 pr-12 overflow-x-auto text-xs">
        <code className="font-mono">{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}

function OutputBox({ output }: { output: string }) {
  return (
    <div className="rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
        <CheckCircle className="h-3.5 w-3.5" /> Output
      </div>
      <pre className="text-xs font-mono text-green-900 dark:text-green-300 whitespace-pre-wrap">{output}</pre>
    </div>
  )
}

function BestPracticesList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function CommonMistakesList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function PracticeSection({ lessonId }: { lessonId: string }) {
  const { data: apiQuestions, isLoading, isError, refetch } = useLessonPractice(lessonId)
  const questions = (apiQuestions && apiQuestions.length >= 5 ? apiQuestions : FALLBACK_PRACTICE)
    .slice()
    .sort((a, b) => a.order - b.order)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [showHint, setShowHint] = useState<Set<string>>(new Set())
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  }

  const isCorrect = (q: PracticeQuestion) => {
    const ua = (userAnswers[q.id] ?? '').trim().toLowerCase()
    const ans = q.answer.trim().toLowerCase()
    return ua === ans || ua.replace(/\s+/g, ' ').includes(ans.replace(/\s+/g, ' '))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load practice questions"
        message="Could not fetch practice questions for this lesson."
        onRetry={() => refetch()}
      />
    )
  }

  if (!questions.length) {
    return <EmptyLearningState variant="lessons" />
  }

  const typeLabel: Record<PracticeQuestion['type'], string> = {
    coding: 'Coding', theory: 'Theory', 'fill-blank': 'Fill in the Blank', output: 'Predict Output',
  }
  const diffColor: Record<Difficulty, string> = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Practice Questions
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Solve these {questions.length} questions to reinforce what you learned.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((q, idx) => {
          const isRevealed = revealed.has(q.id)
          const isHintShown = showHint.has(q.id)
          const answered = !!userAnswers[q.id]?.trim()
          const correct = answered ? isCorrect(q) : null
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className={cn(
                'border-l-4 transition-all',
                correct === true && 'border-l-green-500',
                correct === false && 'border-l-red-500',
                correct === null && 'border-l-primary/40',
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">Q{idx + 1}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{typeLabel[q.type]}</Badge>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', diffColor[q.difficulty])}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-sm font-medium mt-2 leading-relaxed">{q.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {q.codeSnippet && <CopyableCodeBlock code={q.codeSnippet} />}

                  {q.options && (
                    <div className="grid gap-2">
                      {q.options.map((opt, oi) => (
                        <label
                          key={oi}
                          className="flex items-center gap-2 p-2 rounded-md border border-input hover:bg-accent/10 cursor-pointer text-sm transition-colors"
                        >
                          <input
                            type="radio"
                            name={`pq-${q.id}`}
                            value={opt}
                            checked={userAnswers[q.id] === opt}
                            onChange={(e) => setUserAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                            className="h-3.5 w-3.5 ml-2"
                          />
                          <span className="py-1.5">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {!q.options && (
                    <textarea
                      value={userAnswers[q.id] ?? ''}
                      onChange={(e) => setUserAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                      placeholder={q.type === 'coding' ? '# Write your code here...' : 'Type your answer...'}
                      rows={q.type === 'coding' ? 4 : 2}
                      className={cn(
                        'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        'font-mono text-xs',
                      )}
                    />
                  )}

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHint((s) => toggle(s, q.id))}
                      className="gap-1.5 text-xs"
                    >
                      <Lightbulb className="h-3.5 w-3.5" /> {isHintShown ? 'Hide Hint' : 'Hint'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevealed((s) => toggle(s, q.id))}
                      className="gap-1.5 text-xs"
                    >
                      {isRevealed ? (
                        <><ChevronUp className="h-3.5 w-3.5" /> Hide Answer</>
                      ) : (
                        <><ChevronDown className="h-3.5 w-3.5" /> Show Answer</>
                      )}
                    </Button>
                    {answered && correct === true && (
                      <Badge variant="success" className="gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3" /> Correct!
                      </Badge>
                    )}
                    {answered && correct === false && (
                      <Badge variant="destructive" className="gap-1 text-xs">
                        <AlertTriangle className="h-3 w-3" /> Review needed
                      </Badge>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {isHintShown && q.hint && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 border-t border-border mt-2">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">{q.hint}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence initial={false}>
                    {isRevealed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 border-t border-border mt-2 space-y-2">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <div className="text-xs space-y-2">
                              <div>
                                <p className="font-semibold text-foreground">Answer:</p>
                                <CopyableCodeBlock code={q.answer} />
                              </div>
                              {q.explanation && (
                                <div>
                                  <p className="font-semibold text-foreground">Explanation:</p>
                                  <p className="text-muted-foreground mt-0.5">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function QuizSection({ lessonId, onPassed }: { lessonId: string; onPassed?: () => void }) {
  const { data: apiQuiz, isLoading, isError, refetch } = useLessonQuiz(lessonId)
  const { mutate: submitQuiz, isPending: submitting } = useSubmitQuiz()
  const quiz = (apiQuiz && apiQuiz.length >= 5 ? apiQuiz : FALLBACK_QUIZ)
    .slice()
    .sort((a, b) => a.order - b.order)

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number; percentage: number; passed: boolean } | null>(null)

  const allAnswered = quiz.length > 0 && quiz.every((q) => answers[q.id] !== undefined)

  const handleSubmit = () => {
    let score = 0
    for (const q of quiz) {
      if (answers[q.id] === q.correctOption) score++
    }
    const total = quiz.length
    const percentage = Math.round((score / total) * 100)
    const passed = percentage >= 60
    const localResult = { score, total, percentage, passed }
    setResult(localResult)
    setSubmitted(true)
    submitQuiz({ lessonId, answers }, {
      onSuccess: () => {
        if (passed) onPassed?.()
      },
    })
  }

  const handleRetry = () => {
    setAnswers({})
    setSubmitted(false)
    setResult(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load quiz"
        message="Could not fetch quiz questions for this lesson."
        onRetry={() => refetch()}
      />
    )
  }

  if (!quiz.length) {
    return <EmptyLearningState variant="lessons" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" /> Quiz
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Test your knowledge. {quiz.length} multiple-choice questions. Pass threshold: 60%.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {submitted && result && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'rounded-lg p-5 border',
              result.passed
                ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800',
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                result.passed ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50',
              )}>
                {result.passed ? (
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <h3 className={cn(
                  'font-bold text-lg',
                  result.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400',
                )}>
                  {result.passed ? '🎉 Passed!' : 'Keep practicing!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Score: <strong className="text-foreground">{result.score}/{result.total}</strong> ({result.percentage}%)
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRetry}>Retake Quiz</Button>
            </div>
          </motion.div>
        )}

        {quiz.map((q, idx) => {
          const userChoice = answers[q.id]
          const isCorrectChoice = submitted && userChoice === q.correctOption
          const isWrongChoice = submitted && userChoice !== undefined && userChoice !== q.correctOption
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className={cn(
                submitted && isCorrectChoice && 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/10',
                submitted && isWrongChoice && 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/10',
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide shrink-0">
                      Question {idx + 1}
                    </Badge>
                    {submitted && isCorrectChoice && (
                      <Badge variant="success" className="gap-1 text-xs shrink-0">
                        <CheckCircle2 className="h-3 w-3" /> Correct
                      </Badge>
                    )}
                    {submitted && isWrongChoice && (
                      <Badge variant="destructive" className="gap-1 text-xs shrink-0">
                        <X className="h-3 w-3" /> Incorrect
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm font-medium mt-2 leading-relaxed">{q.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = userChoice === oi
                    const isCorrectOpt = submitted && oi === q.correctOption
                    return (
                      <Label
                        key={oi}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-md border cursor-pointer text-sm transition-all',
                          isSelected && !submitted && 'border-primary bg-primary/5',
                          isCorrectOpt && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                          submitted && isSelected && oi !== q.correctOption && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                          !isSelected && !isCorrectOpt && 'border-input hover:bg-accent/10',
                        )}
                      >
                        <input
                          type="radio"
                          name={`quiz-${q.id}`}
                          value={oi}
                          checked={isSelected}
                          onChange={() => !submitted && setAnswers((p) => ({ ...p, [q.id]: oi }))}
                          disabled={submitted}
                          className="h-4 w-4 ml-1"
                        />
                        <span className="flex-1 py-0.5">
                          <span className="font-semibold mr-2 text-muted-foreground">{String.fromCharCode(65 + oi)}.</span>
                          {opt}
                        </span>
                        {isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                        {submitted && isSelected && oi !== q.correctOption && (
                          <X className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                      </Label>
                    )
                  })}
                  {submitted && q.explanation && (
                    <div className="pt-2 mt-2 border-t border-border">
                      <p className="text-xs">
                        <span className="font-semibold">Explanation: </span>
                        <span className="text-muted-foreground">{q.explanation}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        <div className="flex justify-end gap-2 pt-2">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={!allAnswered || submitting} className="gap-2">
              <Send className="h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function NotesPanel({ lessonId }: { lessonId: string }) {
  const { data: notes, isLoading, isError, refetch } = useLessonNotes(lessonId)
  const { mutate: createNote, isPending: creating } = useCreateLessonNote()
  const { mutate: updateNote, isPending: updating } = useUpdateLessonNote()

  const existingNote = notes?.[0]
  const [content, setContent] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (existingNote?.content !== undefined) {
      setContent(existingNote.content)
    }
  }, [existingNote?.content, existingNote?.id])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((text: string) => {
      if (existingNote) {
        updateNote(
          { lessonId, noteId: existingNote.id, content: text },
          { onSuccess: () => { setSavedAt(new Date().toLocaleTimeString()); setIsDirty(false) } },
        )
      } else {
        createNote(
          { lessonId, content: text },
          { onSuccess: () => { setSavedAt(new Date().toLocaleTimeString()); setIsDirty(false) } },
        )
      }
    }, 800),
    [existingNote, lessonId, createNote, updateNote],
  )

  const handleChange = (val: string) => {
    setContent(val)
    setIsDirty(true)
    debouncedSave(val)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" /> Notes
          </h3>
          {savedAt && (
            <span className={cn(
              'text-[10px]',
              isDirty ? 'text-amber-500' : 'text-green-500',
            )}>
              {isDirty ? 'Saving...' : `Saved ${savedAt}`}
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-20 w-full rounded-md mt-3" />
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Couldn't load notes</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-2">
              Your notes are auto-saved as you type.
            </p>
            <textarea
              value={content}
              onChange={(e) => handleChange(e.target.value)}
              disabled={creating || updating}
              placeholder="Write your notes here...\n\n• Key concepts\n• Code snippets\n• Questions to revisit"
              className={cn(
                'flex-1 w-full rounded-md border border-input bg-background px-3 py-3 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'resize-none min-h-[200px]',
              )}
            />
          </>
        )}
      </div>
    </div>
  )
}

export function LessonViewerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lessonSidebarOpen, setLessonSidebarOpen } = useLearningStore()

  const { data: lesson, isLoading, isError, refetch } = useLesson(id ?? '')
  const { mutate: markComplete, isPending: completing } = useMarkLessonComplete()
  const { mutate: markStarted } = useMarkLessonStarted()
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useToggleLessonBookmark()

  const { data: roadmap, isLoading: roadmapLoading } = useRoadmap(lesson?.roadmapSlug ?? '')
  const sections = roadmap?.sections ?? []

  // Prefetch next lesson when this one loads
  useEffect(() => {
    if (lesson?.nextLessonId) {
      prefetchLesson(lesson.nextLessonId)
    }
  }, [lesson?.nextLessonId])

  useEffect(() => {
    if (id && lesson?.status === 'not_started') {
      markStarted(id)
    }
  }, [id, lesson?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = () => {
    if (!id) return
    markComplete(id, {
      onSuccess: () => {
        if (lesson?.nextLessonId) {
          navigate(`/dashboard/learning/lesson/${lesson.nextLessonId}`)
        }
      },
    })
  }

  // Compute lesson index within roadmap for progress indicator
  const { lessonIndex, totalLessonsInRoadmap } = useMemo(() => {
    if (!sections.length || !id) return { lessonIndex: -1, totalLessonsInRoadmap: 0 }
    let idx = 0
    let total = 0
    for (const s of sections) {
      for (const l of s.lessons) {
        total++
        if (l.id === id) {
          idx = total
        }
      }
    }
    return { lessonIndex: idx, totalLessonsInRoadmap: total }
  }, [sections, id])

  if (isLoading || roadmapLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] -m-6">
        <div className="hidden lg:flex w-80 border-r border-border flex-col">
          <div className="p-4 border-b border-border space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-full" />
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <Skeleton className="h-full w-1/2" />
            </div>
          </div>
          <div className="p-4 space-y-3 flex-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            <LessonHeaderSkeleton />
            <LessonViewerSkeleton />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
        <div className="hidden xl:flex w-80 border-l border-border flex-col">
          <div className="p-4 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !lesson) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center -m-6">
        <ErrorState
          title="Unable to load lesson"
          message="This lesson doesn't exist, or we couldn't reach the server. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const readingTime = lesson.readingTimeMinutes ?? lesson.estimatedMinutes
  const difficulty = lesson.difficulty ?? 'beginner'

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6 overflow-hidden">
      {/* Left Sidebar */}
      <>
        <AnimatePresence>
          {lessonSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setLessonSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {lessonSidebarOpen && (
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed lg:relative left-0 top-0 lg:top-auto z-50 lg:z-auto h-full w-80 border-r border-border bg-card lg:bg-background flex flex-col shrink-0"
              aria-label="Lesson navigation"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setLessonSidebarOpen(false)}
                className="absolute right-2 top-2 z-10 lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border space-y-3 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="search"
                      placeholder="Search lessons (Variables, Functions...)"
                      className="pl-9 h-9 text-sm"
                      aria-label="Search lessons in sidebar"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim()
                          if (val.length >= 2) {
                            navigate(`/dashboard/learning/search?q=${encodeURIComponent(val)}`)
                          }
                        }
                      }}
                    />
                  </div>

                  <Link
                    to="/dashboard/learning/roadmaps/python"
                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    <BookOpen className="h-4 w-4" />
                    Python Programming
                  </Link>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      {lesson.moduleTitle ?? lesson.sectionTitle ?? 'Module'}
                    </p>
                    <p className="text-sm text-foreground font-medium truncate">
                      {lesson.roadmapTitle ?? 'Python Fundamentals'}
                    </p>
                  </div>

                  {(() => {
                    const totalSec = sections.reduce((a, s) => a + s.lessons.length, 0)
                    const doneSec = sections.reduce(
                      (a, s) => a + s.lessons.filter((l) => l.status === 'completed').length,
                      0,
                    )
                    const pct = totalSec ? Math.round((doneSec / totalSec) * 100) : 0
                    return (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">Module progress</span>
                          <span className="font-medium">{pct}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {sections.length > 0 ? (
                  <LessonSidebar
                    sections={sections}
                    currentLessonId={lesson.id}
                    roadmapTitle={lesson.roadmapTitle ?? 'Python Programming'}
                    roadmapSlug={lesson.roadmapSlug ?? 'python'}
                    className="flex-1 min-h-0"
                  />
                ) : (
                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <Button variant="ghost" size="sm" asChild className="mb-3 -ml-1 h-7 text-xs gap-1 text-muted-foreground">
                        <Link to="/dashboard/learning/roadmaps">
                          <ChevronLeft className="h-3.5 w-3.5" /> Back to Roadmaps
                        </Link>
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Full lesson list appears when viewing a roadmap lesson.
                      </p>
                    </div>
                  </ScrollArea>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </>

      {/* Center: Content + Bottom nav */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0" id="lesson-content">
        {/* Sticky top bar + header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border shrink-0">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/60">
            <div className="flex items-center gap-2 min-w-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setLessonSidebarOpen(!lessonSidebarOpen)}
                aria-label={lessonSidebarOpen ? 'Hide lesson navigation' : 'Show lesson navigation'}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">
                  {lesson.roadmapTitle ?? 'Python Programming'}
                  {lesson.sectionTitle && ` · ${lesson.sectionTitle}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant={lesson.status === 'completed' ? 'success' : lesson.status === 'in_progress' ? 'info' : 'secondary'}
                className="text-xs hidden sm:flex"
              >
                {lesson.status === 'completed' ? '✓ Completed' : lesson.status === 'in_progress' ? 'In Progress' : 'Not Started'}
              </Badge>
              <BookmarkButton
                isBookmarked={lesson.isBookmarked ?? false}
                onToggle={() => id && toggleBookmark(id)}
                loading={bookmarkPending}
                size="sm"
              />
            </div>
          </div>

          <div className="px-4 lg:px-8 py-5 max-w-5xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-3 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-tight">
                  {lesson.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /> {readingTime} min read
                  </span>
                  <DifficultyBadge difficulty={difficulty} />
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Clock className="h-3 w-3" /> Est. {lesson.estimatedMinutes} min to complete
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant={lesson.isBookmarked ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => id && toggleBookmark(id)}
                  disabled={bookmarkPending}
                  className="gap-1.5"
                  aria-label={lesson.isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
                >
                  <Heart className={cn('h-4 w-4', lesson.isBookmarked && 'fill-current')} />
                  {lesson.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-8 lg:px-8 pb-32">
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {lesson.content ? (
                <SectionRenderer content={lesson.content} />
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-muted-foreground text-sm">Lesson content will appear here.</p>
                </div>
              )}

              <Separator className="my-2" />

              <PracticeSection lessonId={lesson.id} />

              <QuizSection lessonId={lesson.id} onPassed={() => {}} />

              {lesson.resources && lesson.resources.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-primary" /> Additional Resources
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lesson.resources.map((r) => (
                      <ResourceCard key={r.id} resource={r} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </ScrollArea>

        {/* Sticky bottom nav */}
        <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur shrink-0">
          <div className="max-w-5xl mx-auto w-full px-4 lg:px-8 py-3 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              asChild={!!lesson.prevLessonId}
              disabled={!lesson.prevLessonId}
              className="gap-1.5"
            >
              {lesson.prevLessonId ? (
                <Link to={`/dashboard/learning/lesson/${lesson.prevLessonId}`}>
                  <ChevronLeft className="h-4 w-4" /> Previous Lesson
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" /> Previous Lesson
                </>
              )}
            </Button>

            <div className="flex flex-col items-center gap-1 px-2 hidden sm:flex">
              <span className="text-xs font-medium text-foreground">
                {lessonIndex > 0 ? `Lesson ${lessonIndex} of ${totalLessonsInRoadmap}` : 'Lesson Viewer'}
              </span>
              {lessonIndex > 0 && totalLessonsInRoadmap > 0 && (
                <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(lessonIndex / totalLessonsInRoadmap) * 100}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleComplete}
                disabled={completing || lesson.status === 'completed' || !lesson.nextLessonId}
                className="gap-2 hidden sm:flex"
                variant={lesson.status === 'completed' ? 'outline' : 'default'}
              >
                <CheckCircle2 className="h-4 w-4" />
                {lesson.status === 'completed'
                  ? 'Completed'
                  : completing
                    ? 'Marking...'
                    : 'Mark Complete & Next'}
              </Button>
              <Button
                variant={lesson.nextLessonId ? 'default' : 'outline'}
                size="sm"
                asChild={!!lesson.nextLessonId}
                disabled={!lesson.nextLessonId}
                className="gap-1.5"
              >
                {lesson.nextLessonId ? (
                  <Link to={`/dashboard/learning/lesson/${lesson.nextLessonId}`}>
                    Next Lesson <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    Next Lesson <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Right sidebar: Quick nav + Notes */}
      <aside className="hidden xl:flex flex-col w-80 border-l border-border bg-card/50 shrink-0" aria-label="Lesson sidebar">
        <Tabs defaultValue="notes" className="flex flex-col h-full">
          <div className="px-4 pt-3 shrink-0">
            <TabsList className="w-full">
              <TabsTrigger value="notes" className="flex-1 text-xs gap-1">
                <StickyNote className="h-3.5 w-3.5" /> Notes
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex-1 text-xs gap-1">
                <Award className="h-3.5 w-3.5" /> Progress
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 min-h-0">
            <TabsContent value="notes" className="h-full mt-0 data-[state=inactive]:hidden flex flex-col">
              <NotesPanel lessonId={lesson.id} />
            </TabsContent>
            <TabsContent value="progress" className="h-full mt-0 data-[state=inactive]:hidden">
              <ScrollArea className="flex-1 h-full">
                <div className="p-4 space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                      Progress
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                          variant={lesson.status === 'completed' ? 'success' : 'secondary'}
                          className="text-xs capitalize"
                        >
                          {lesson.status?.replace('_', ' ') ?? 'not started'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Reading</span>
                        <span className="font-medium">{readingTime} min</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Est. Complete</span>
                        <span className="font-medium">{lesson.estimatedMinutes} min</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Difficulty</span>
                        <DifficultyBadge difficulty={difficulty} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {lesson.resources && lesson.resources.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Resources ({lesson.resources.length})
                      </h3>
                      <div className="space-y-1.5">
                        {lesson.resources.map((r) => (
                          <a
                            key={r.id}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline py-0.5"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="truncate">{r.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </aside>
    </div>
  )
}
