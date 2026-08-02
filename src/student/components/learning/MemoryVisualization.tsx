/**
 * FPRD-20: Memory Visualization
 * Exactly like Python Tutor — step through code lines and see memory state evolve.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

export interface MemoryStep {
  line: string          // code line executed
  lineNumber: number    // 1-based
  memory: Record<string, string | number | boolean | null>  // variable name → value
  output?: string       // any print() output
  description?: string  // explanation of what happened
}

interface MemoryVisualizationProps {
  steps: MemoryStep[]
  title?: string
}

export function MemoryVisualization({ steps, title = 'Memory Visualization' }: MemoryVisualizationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const step = steps[currentStep]
  const prevMemory = currentStep > 0 ? steps[currentStep - 1].memory : {}
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  const goNext = () => { if (!isLast) setCurrentStep((s) => s + 1) }
  const goPrev = () => { if (!isFirst) setCurrentStep((s) => s - 1) }
  const reset = () => { setCurrentStep(0); setIsPlaying(false) }

  // Auto-play
  const handlePlay = () => {
    if (isLast) { reset(); return }
    setIsPlaying(true)
    let idx = currentStep
    const tick = () => {
      idx++
      setCurrentStep(idx)
      if (idx < steps.length - 1) {
        setTimeout(tick, 900)
      } else {
        setIsPlaying(false)
      }
    }
    setTimeout(tick, 900)
  }

  // Determine which variables changed this step
  const changedVars = new Set(
    Object.keys(step.memory).filter(
      (k) => JSON.stringify(step.memory[k]) !== JSON.stringify(prevMemory[k]),
    ),
  )
  const newVars = new Set(
    Object.keys(step.memory).filter((k) => !(k in prevMemory)),
  )

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e2e] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-[#a6accd] font-medium">{title}</span>
        </div>
        <Badge variant="outline" className="text-[10px] border-white/20 text-[#a6accd]">
          Step {currentStep + 1} / {steps.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
        {/* Left: Code pane */}
        <div className="bg-[#1e1e2e] p-4">
          <p className="text-[10px] text-[#6272a4] uppercase tracking-wider mb-3">Code</p>
          <div className="space-y-1">
            {steps.map((s, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2 px-2 py-1 rounded text-xs font-mono transition-all',
                  i === currentStep
                    ? 'bg-yellow-500/20 text-yellow-300 border-l-2 border-yellow-400'
                    : i < currentStep
                      ? 'text-[#a6accd]/60'
                      : 'text-[#a6accd]/30',
                )}
              >
                <span className="w-5 text-right text-[#6272a4] shrink-0 text-[10px]">
                  {s.lineNumber}
                </span>
                <code>{s.line}</code>
                {i === currentStep && (
                  <span className="ml-auto text-[10px] text-yellow-400/70">← executing</span>
                )}
              </div>
            ))}
          </div>

          {/* Output */}
          {step.output && (
            <div className="mt-4 rounded-lg bg-black/40 p-3">
              <p className="text-[10px] text-[#6272a4] mb-1">Output:</p>
              <code className="text-xs text-green-400 font-mono">{step.output}</code>
            </div>
          )}
        </div>

        {/* Right: Memory pane */}
        <div className="p-4 bg-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">
            Memory (Variables)
          </p>

          {Object.keys(step.memory).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground/40 text-xs">
              No variables yet
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {Object.entries(step.memory).map(([name, value]) => {
                  const isNew = newVars.has(name)
                  const isChanged = changedVars.has(name) && !isNew
                  return (
                    <motion.div
                      key={name}
                      initial={isNew ? { opacity: 0, x: -10, scale: 0.95 } : { opacity: 1 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      layout
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-lg border text-xs transition-all',
                        isNew
                          ? 'border-green-400/60 bg-green-50/80 dark:bg-green-950/30'
                          : isChanged
                            ? 'border-yellow-400/60 bg-yellow-50/80 dark:bg-yellow-950/30'
                            : 'border-border/60 bg-muted/30',
                      )}
                    >
                      {/* Variable name box */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="px-2 py-1 rounded bg-primary/10 text-primary font-mono font-medium text-[11px] shrink-0">
                          {name}
                        </div>
                        <span className="text-muted-foreground">→</span>
                      </div>
                      {/* Value box */}
                      <div
                        className={cn(
                          'px-2 py-1 rounded font-mono font-bold text-[11px]',
                          typeof value === 'string'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : typeof value === 'number'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : typeof value === 'boolean'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {typeof value === 'string' ? `"${value}"` : String(value)}
                      </div>
                      {/* Type badge */}
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">
                        {typeof value}
                      </span>
                      {isNew && (
                        <Badge variant="success" className="text-[9px] h-4 px-1 ml-auto">
                          new
                        </Badge>
                      )}
                      {isChanged && !isNew && (
                        <Badge variant="warning" className="text-[9px] h-4 px-1 ml-auto">
                          changed
                        </Badge>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Description */}
          {step.description && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
            >
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                💡 {step.description}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-border/60 bg-muted/20">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={reset}
          aria-label="Reset"
          className="h-8 w-8"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={goPrev}
          disabled={isFirst || isPlaying}
          aria-label="Previous step"
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          onClick={handlePlay}
          disabled={isPlaying}
          className="gap-1.5 h-8 px-4 text-xs"
        >
          {isPlaying ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              Playing...
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              {isLast ? 'Replay' : 'Play'}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={goNext}
          disabled={isLast || isPlaying}
          aria-label="Next step"
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Step dots */}
        <div className="flex gap-1 ml-2" aria-hidden="true">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === currentStep ? 'bg-primary w-4' : 'bg-muted-foreground/30 w-1.5',
              )}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Default memory steps for Variables lesson ───────────────────────────────

export const VARIABLES_MEMORY_STEPS: MemoryStep[] = [
  {
    lineNumber: 1,
    line: 'name = "Alex"',
    memory: { name: 'Alex' },
    description: 'A new variable "name" is created in memory and assigned the string value "Alex".',
  },
  {
    lineNumber: 2,
    line: 'age = 20',
    memory: { name: 'Alex', age: 20 },
    description: 'A new variable "age" is created and assigned the integer value 20.',
  },
  {
    lineNumber: 3,
    line: 'is_student = True',
    memory: { name: 'Alex', age: 20, is_student: true },
    description: 'A boolean variable "is_student" is created and set to True.',
  },
  {
    lineNumber: 4,
    line: 'age = age + 1',
    memory: { name: 'Alex', age: 21, is_student: true },
    description: 'The value of "age" is updated from 20 to 21 by adding 1.',
  },
  {
    lineNumber: 5,
    line: 'print(name)',
    memory: { name: 'Alex', age: 21, is_student: true },
    output: 'Alex',
    description: 'The print() function reads the value of "name" from memory and outputs it.',
  },
]
