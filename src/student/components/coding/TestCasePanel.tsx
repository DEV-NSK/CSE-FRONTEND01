import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import type { TestCase } from '@/shared/types/coding'

interface TestCasePanelProps {
  testCases: TestCase[]
  isLoading?: boolean
  customInput: string
  onCustomInputChange: (value: string) => void
}

export function TestCasePanel({
  testCases,
  isLoading,
  customInput,
  onCustomInputChange,
}: TestCasePanelProps) {
  const [activeCase, setActiveCase] = useState(0)
  const visibleCases = testCases.filter((tc) => !tc.isHidden)

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="sample" className="flex flex-col h-full">
        <TabsList className="mx-3 mt-3 mb-2 h-8 w-fit">
          <TabsTrigger value="sample" className="text-xs h-7">
            Sample
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs h-7">
            Custom
          </TabsTrigger>
        </TabsList>

        {/* Sample test cases */}
        <TabsContent value="sample" className="flex-1 overflow-y-auto px-3 pb-3 mt-0">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : visibleCases.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No sample test cases available.</p>
          ) : (
            <div className="space-y-2">
              {/* Case tabs */}
              <div className="flex gap-1 flex-wrap">
                {visibleCases.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveCase(idx)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      activeCase === idx
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:bg-muted/50'
                    }`}
                    aria-pressed={activeCase === idx}
                  >
                    Case {idx + 1}
                  </button>
                ))}
              </div>

              {/* Case content */}
              {visibleCases[activeCase] && (
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Input</p>
                    <pre className="text-xs bg-muted/50 rounded-md p-2.5 overflow-x-auto font-mono text-foreground whitespace-pre-wrap">
                      {visibleCases[activeCase].input || '(empty)'}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Expected Output</p>
                    <pre className="text-xs bg-muted/50 rounded-md p-2.5 overflow-x-auto font-mono text-foreground whitespace-pre-wrap">
                      {visibleCases[activeCase].expectedOutput || '(empty)'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Custom input */}
        <TabsContent value="custom" className="flex-1 flex flex-col px-3 pb-3 mt-0">
          <label htmlFor="custom-input" className="text-xs font-medium text-muted-foreground mb-1 block">
            Custom Input
          </label>
          <textarea
            id="custom-input"
            value={customInput}
            onChange={(e) => onCustomInputChange(e.target.value)}
            placeholder="Enter custom input here..."
            className="flex-1 resize-none rounded-md border border-input bg-muted/30 p-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
            aria-label="Custom test input"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
