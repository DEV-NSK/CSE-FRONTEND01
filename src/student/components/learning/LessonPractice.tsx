import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Lightbulb, ChevronDown, ChevronUp, Code2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

export interface PracticeQuestion {
  id: string
  question: string
  type: 'coding' | 'theory' | 'fill-blank' | 'output'
  codeSnippet?: string
  options?: string[]
  answer: string
  explanation: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface LessonPracticeProps {
  questions?: PracticeQuestion[]
  lessonTitle?: string
}

const FALLBACK_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'p1',
    question: 'Write a Python program to print "Hello, World!" to the console.',
    type: 'coding',
    codeSnippet: '# Complete the code below:',
    answer: 'print("Hello, World!")',
    explanation: 'In Python, the print() function outputs text to the console. Strings are enclosed in quotes.',
    difficulty: 'beginner',
  },
  {
    id: 'p2',
    question: 'What will be the output of: x = 5 + 3 * 2?',
    type: 'output',
    answer: '11',
    explanation: 'Python follows PEMDAS/BODMAS order: multiplication (*) before addition (+). So 3*2=6, then 5+6=11.',
    options: ['16', '11', '10', '8'],
    difficulty: 'beginner',
  },
  {
    id: 'p3',
    question: 'Create a variable named "age" and assign it the value 25.',
    type: 'fill-blank',
    codeSnippet: '_____ = ___',
    answer: 'age = 25',
    explanation: 'Variables in Python are created with = operator. No type keyword is Python uses dynamic typing so age can change after.',
    difficulty: 'beginner',
  },
  {
    id: 'p4',
    question: 'Write a function called add that takes two parameters a and b and returns their sum.',
    type: 'coding',
    codeSnippet: 'Complete the function:',
    answer: 'def add(a, b):\n    return a + b',
    explanation: 'Functions are defined with def keyword. Parameters go in parentheses. return keyword sends value back.',
    difficulty: 'beginner',
  },
  {
    id: 'p5',
    question: 'What is the data type of: my_list = [1, 2, 3]?',
    type: 'theory',
    answer: 'list',
    explanation: 'Square brackets [] with comma-separated values define a list in Python. Lists are ordered, mutable collections.',
    options: ['tuple', 'list', 'dict', 'set'],
    difficulty: 'beginner',
  },
  {
    id: 'p6',
    question: 'Write a for loop that prints numbers from 1 to 5 (inclusive).',
    type: 'coding',
    answer: 'for i in range(1, 6):\n    print(i)',
    explanation: 'range(1, 6) generates 1,2,3,4,5 — the end value is exclusive. Indentation matters in Python blocks.',
    difficulty: 'beginner',
  },
]

export function LessonPractice({ questions, lessonTitle }: LessonPracticeProps) {
  const qs = questions && questions.length >= 5 ? questions : FALLBACK_QUESTIONS
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const setUserAnswer = (id: string, val: string) => {
    setUserAnswers((prev) => ({ ...prev, [id]: val }))
  }

  const isCorrect = (q: PracticeQuestion) => {
    const ua = (userAnswers[q.id] ?? '').trim().toLowerCase()
    const ans = q.answer.trim().toLowerCase()
    return ua === ans || ua.replace(/\s+/g, ' ').includes(ans.replace(/\s+/g, ' '))
  }

  const typeLabel: Record<PracticeQuestion['type'], string> = {
    coding: 'Coding',
    theory: 'Theory',
    'fill-blank': 'Fill in the Blank',
    output: 'Predict Output',
  }

  const diffColor: Record<PracticeQuestion['difficulty'], string> = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          Practice Questions
        </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {qs.length} questions · Solve these to reinforce what you learned.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {qs.map((q, idx) => {
          const revealed_ = revealed.has(q.id)
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
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                        Q{idx + 1}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {typeLabel[q.type]}
                      </Badge>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', diffColor[q.difficulty])}>
                        {q.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-sm font-medium mt-2 leading-relaxed">
                    {q.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {q.codeSnippet && (
                  <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto">
                    <code>{q.codeSnippet}</code>
                  </pre>
                )}

                  {q.options && (
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi} className="flex items-center gap-2 p-2 rounded-md border border-input hover:bg-accent/10 cursor-pointer text-sm transition-colors">
                        <input
                          type={q.type === 'output' ? 'radio' : 'radio'}
                          name={`q-${q.id}`}
                          value={opt}
                          checked={userAnswers[q.id] === opt}
                          onChange={(e) => setUserAnswer(q.id, e.target.value)}
                          className="ml-2 h-3.5 w-3.5"
                        />
                        <span className="py-1.5">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                  {!q.options && (
                  <textarea
                    value={userAnswers[q.id] ?? ''}
                    onChange={(e) => setUserAnswer(q.id, e.target.value)}
                    placeholder={q.type === 'coding' ? '# Write your code here...' : 'Type your answer...'}
                    rows={q.type === 'coding' ? 4 : 2}
                    className={cn(
                      'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                      'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'font-mono text-xs',
                    )}
                  />
                )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleReveal(q.id)}
                      className="gap-1.5 text-xs"
                    >
                      {revealed_ ? (
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
                      <XCircle className="h-3 w-3" /> Review needed
                    </Badge>
                  )}
                  </div>

                  <AnimatePresence initial={false}>
                    {revealed_ && (
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
                                <pre className="bg-muted rounded p-2 mt-1 overflow-x-auto"><code>{q.answer}</code></pre>
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">Explanation:</p>
                                <p className="text-muted-foreground mt-0.5">{q.explanation}</p>
                              </div>
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
      </div>
    </div>
  )
}
