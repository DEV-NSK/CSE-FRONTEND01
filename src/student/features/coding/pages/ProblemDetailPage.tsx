import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import {
  ChevronLeft, ChevronRight, RotateCcw, Play, Send, Heart,
  Tag, Building2, MessageSquare, Settings, Sun, Moon,
  ALargeSmall, WrapText, Map, Code2, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { MonacoEditorWrapper } from '@/student/components/coding/MonacoEditorWrapper'
import { TestCasePanel } from '@/student/components/coding/TestCasePanel'
import { OutputPanel } from '@/student/components/coding/OutputPanel'
import { SubmissionCard } from '@/student/components/coding/SubmissionCard'
import { CodingDifficultyBadge } from '@/student/components/coding/DifficultyBadge'
import { TagChip } from '@/student/components/coding/TagChip'
import { CompanyBadge } from '@/student/components/coding/CompanyBadge'
import { SubmissionCardSkeleton } from '@/student/components/coding/CodingSkeletons'
import {
  useProblem, useTestCases, useCodeTemplates,
  useRunCode, useSubmitCode, useSubmissionResult,
  useProblemSubmissions, useToggleFavorite,
  LANGUAGE_LABELS,
} from '@/shared/hooks/useCoding'
import { useCodingStore } from '@/shared/store/codingStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/utils'
import type { Language } from '@/shared/types/coding'
import type { RunResult } from '@/shared/types/coding'

const LANGUAGES: Language[] = ['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'rust']

export function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { resolvedTheme } = useThemeStore()

  const {
    editorSettings, setEditorLanguage, setEditorSettings,
    saveDraft, getDraft, rightPanelTab, setRightPanelTab,
  } = useCodingStore()

  const { data: problem, isLoading, isError, refetch } = useProblem(slug!)
  const { data: testCases, isLoading: tcLoading } = useTestCases(problem?.id ?? '')
  const { data: templates } = useCodeTemplates(problem?.id ?? '')
  const { data: submissions, isLoading: subLoading } = useProblemSubmissions(slug!)
  const { mutate: toggleFavorite } = useToggleFavorite()
  const { mutate: runCode, isPending: isRunning } = useRunCode()
  const { mutate: submitCode, isPending: isSubmitting } = useSubmitCode()

  const [code, setCode] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [runSubmissionId, setRunSubmissionId] = useState<string | null>(null)
  const [submitSubmissionId, setSubmitSubmissionId] = useState<string | null>(null)
  const [runResult, setRunResult] = useState<RunResult | null>(null)
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })
  const editorRef = useRef<{ getModel: () => unknown } | null>(null)

  // Poll result after run
  const { data: polledResult } = useSubmissionResult(
    runSubmissionId ?? submitSubmissionId ?? '',
    !!(runSubmissionId || submitSubmissionId)
  )

  // When polling result arrives, update UI
  useEffect(() => {
    if (polledResult) {
      const done = polledResult.status !== 'pending' && polledResult.status !== 'running'
      if (done) {
        setRunResult(polledResult)
        setRightPanelTab('output')
        setRunSubmissionId(null)
        setSubmitSubmissionId(null)
      }
    }
  }, [polledResult, setRightPanelTab])

  // Load draft or template when problem/language changes
  useEffect(() => {
    if (!problem) return
    const draftKey = `${problem.id}-${editorSettings.language}`
    const savedDraft = getDraft(draftKey)
    if (savedDraft !== undefined) {
      setCode(savedDraft)
    } else {
      // Load template
      const template = templates?.find((t) => t.language === editorSettings.language)
      setCode(template?.code ?? getDefaultTemplate(editorSettings.language))
    }
  }, [problem?.id, editorSettings.language, templates]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save draft on code change
  useEffect(() => {
    if (!problem || !code) return
    const draftKey = `${problem.id}-${editorSettings.language}`
    const timer = setTimeout(() => saveDraft(draftKey, code), 1000)
    return () => clearTimeout(timer)
  }, [code, problem?.id, editorSettings.language]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLanguageChange = (lang: Language) => {
    setEditorLanguage(lang)
  }

  const handleRun = useCallback(() => {
    if (!problem) return
    setRunResult(null)
    setRightPanelTab('output')
    runCode(
      { problemId: problem.id, language: editorSettings.language, code, customInput },
      {
        onSuccess: (res) => {
          setRunSubmissionId(res.data.data.submissionId)
        },
        onError: () => {
          setRunResult({
            status: 'runtime_error',
            errorMessage: 'Failed to run code. Please try again.',
          })
        },
      }
    )
  }, [problem, code, editorSettings.language, customInput, runCode, setRightPanelTab])

  const handleSubmit = useCallback(() => {
    if (!problem) return
    setRunResult(null)
    setRightPanelTab('output')
    submitCode(
      { problemId: problem.id, language: editorSettings.language, code },
      {
        onSuccess: (res) => {
          setSubmitSubmissionId(res.data.data.submissionId)
        },
        onError: () => {
          setRunResult({
            status: 'runtime_error',
            errorMessage: 'Submission failed. Please try again.',
          })
        },
      }
    )
  }, [problem, code, editorSettings.language, submitCode, setRightPanelTab])

  const handleReset = useCallback(() => {
    if (!problem) return
    const template = templates?.find((t) => t.language === editorSettings.language)
    const defaultCode = template?.code ?? getDefaultTemplate(editorSettings.language)
    setCode(defaultCode)
    const draftKey = `${problem.id}-${editorSettings.language}`
    saveDraft(draftKey, defaultCode)
  }, [problem, templates, editorSettings.language, saveDraft])

  const isExecuting = isRunning || isSubmitting || !!(runSubmissionId || submitSubmissionId)

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <ErrorState
          title="Problem Not Found"
          message="This problem doesn't exist or couldn't be loaded."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-1px)] -mx-6 -mt-0 overflow-hidden">
      {/* ── Top Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/95 backdrop-blur shrink-0 gap-2">
        {/* Left: nav + title */}
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)} aria-label="Go back">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {isLoading ? (
            <Skeleton className="h-5 w-40" />
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                {problem?.title}
              </span>
              {problem && <CodingDifficultyBadge difficulty={problem.difficulty} />}
              {problem?.isSolved && (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" aria-label="Solved" />
              )}
            </div>
          )}
        </div>

        {/* Center: language + actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language selector */}
          <Select value={editorSettings.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-8 w-[130px] text-xs" aria-label="Select language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang} className="text-xs">
                  {LANGUAGE_LABELS[lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Run */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRun}
            disabled={isExecuting}
            loading={isRunning || !!(runSubmissionId)}
            aria-label="Run code"
            className="h-8 text-xs gap-1"
          >
            <Play className="h-3.5 w-3.5" />
            Run
          </Button>

          {/* Submit */}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isExecuting}
            loading={isSubmitting || !!(submitSubmissionId)}
            aria-label="Submit code"
            className="h-8 text-xs gap-1"
          >
            <Send className="h-3.5 w-3.5" />
            Submit
          </Button>

          {/* Reset */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleReset}
            disabled={isExecuting}
            aria-label="Reset code"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Favorite */}
          {problem && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => toggleFavorite(problem.id)}
              aria-label={problem.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={problem.isFavorite}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  problem.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                )}
                aria-hidden="true"
              />
            </Button>
          )}

          {/* Editor settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Editor settings">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs">Editor Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Theme */}
              <DropdownMenuItem
                onClick={() =>
                  setEditorSettings({
                    theme: editorSettings.theme === 'vs-dark' ? 'light' : 'vs-dark',
                  })
                }
                className="gap-2 text-xs"
              >
                {editorSettings.theme === 'vs-dark' ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
                Theme: {editorSettings.theme === 'vs-dark' ? 'Dark' : 'Light'}
              </DropdownMenuItem>

              {/* Font size */}
              <DropdownMenuItem
                onClick={() =>
                  setEditorSettings({
                    fontSize: editorSettings.fontSize === 14 ? 16 : editorSettings.fontSize === 16 ? 12 : 14,
                  })
                }
                className="gap-2 text-xs"
              >
                <ALargeSmall className="h-3.5 w-3.5" />
                Font Size: {editorSettings.fontSize}px
              </DropdownMenuItem>

              {/* Word wrap */}
              <DropdownMenuItem
                onClick={() =>
                  setEditorSettings({ wordWrap: editorSettings.wordWrap === 'on' ? 'off' : 'on' })
                }
                className="gap-2 text-xs"
              >
                <WrapText className="h-3.5 w-3.5" />
                Word Wrap: {editorSettings.wordWrap === 'on' ? 'On' : 'Off'}
              </DropdownMenuItem>

              {/* Minimap */}
              <DropdownMenuItem
                onClick={() => setEditorSettings({ minimap: !editorSettings.minimap })}
                className="gap-2 text-xs"
              >
                <Map className="h-3.5 w-3.5" />
                Minimap: {editorSettings.minimap ? 'On' : 'Off'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Three-panel workspace ────────────────────────────────────────── */}
      {/* Desktop: three panels. Tablet: two panels. Mobile: tabbed. */}

      {/* Mobile tabs */}
      <div className="md:hidden flex-1 overflow-hidden">
        <Tabs defaultValue="problem" className="flex flex-col h-full">
          <TabsList className="mx-3 mt-2 h-8 w-fit shrink-0">
            <TabsTrigger value="problem" className="text-xs h-7">Problem</TabsTrigger>
            <TabsTrigger value="editor" className="text-xs h-7">Editor</TabsTrigger>
          </TabsList>
          <TabsContent value="problem" className="flex-1 overflow-y-auto mt-0 p-4">
            <ProblemPanel problem={problem} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="editor" className="flex-1 overflow-hidden mt-0">
            <MonacoEditorWrapper
              value={code}
              language={editorSettings.language}
              theme={editorSettings.theme}
              fontSize={editorSettings.fontSize}
              wordWrap={editorSettings.wordWrap}
              minimap={editorSettings.minimap}
              onChange={setCode}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Tablet: two panels */}
      <div className="hidden md:flex lg:hidden flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={40} minSize={25}>
            <ScrollArea className="h-full">
              <div className="p-4">
                <ProblemPanel problem={problem} isLoading={isLoading} />
              </div>
            </ScrollArea>
          </Panel>
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />
          <Panel defaultSize={60} minSize={35} className="flex flex-col">
            <div className="flex-1 overflow-hidden">
              <MonacoEditorWrapper
                value={code}
                language={editorSettings.language}
                theme={editorSettings.theme}
                fontSize={editorSettings.fontSize}
                wordWrap={editorSettings.wordWrap}
                minimap={editorSettings.minimap}
                onChange={setCode}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Desktop: three panels */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left: problem details */}
          <Panel defaultSize={28} minSize={20} maxSize={45}>
            <ScrollArea className="h-full">
              <div className="p-4">
                <ProblemPanel problem={problem} isLoading={isLoading} />
              </div>
            </ScrollArea>
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />

          {/* Center: Monaco Editor */}
          <Panel defaultSize={44} minSize={30}>
            <MonacoEditorWrapper
              value={code}
              language={editorSettings.language}
              theme={editorSettings.theme}
              fontSize={editorSettings.fontSize}
              wordWrap={editorSettings.wordWrap}
              minimap={editorSettings.minimap}
              onChange={setCode}
              onMount={(editor) => {
                editor.onDidChangeCursorPosition((e) => {
                  setCursorPos({ line: e.position.lineNumber, col: e.position.column })
                })
              }}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />

          {/* Right: test / output / submissions */}
          <Panel defaultSize={28} minSize={20} maxSize={45} className="flex flex-col">
            <Tabs
              value={rightPanelTab}
              onValueChange={(v) => setRightPanelTab(v as typeof rightPanelTab)}
              className="flex flex-col h-full"
            >
              <TabsList className="mx-3 mt-3 mb-0 h-8 w-fit shrink-0">
                <TabsTrigger value="testcases" className="text-xs h-7">
                  Test Cases
                </TabsTrigger>
                <TabsTrigger value="output" className="text-xs h-7">
                  Output
                </TabsTrigger>
                <TabsTrigger value="submissions" className="text-xs h-7">
                  Submissions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="testcases" className="flex-1 overflow-hidden mt-0">
                <TestCasePanel
                  testCases={testCases ?? []}
                  isLoading={tcLoading}
                  customInput={customInput}
                  onCustomInputChange={setCustomInput}
                />
              </TabsContent>

              <TabsContent value="output" className="flex-1 overflow-hidden mt-0">
                <OutputPanel result={runResult} isRunning={isExecuting && rightPanelTab === 'output'} />
              </TabsContent>

              <TabsContent value="submissions" className="flex-1 overflow-y-auto mt-0 p-3 space-y-2">
                {subLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <SubmissionCardSkeleton key={i} />
                    ))}
                  </div>
                ) : !submissions?.length ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Code2 className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-xs text-muted-foreground">No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissions.slice(0, 10).map((sub) => (
                      <SubmissionCard key={sub.id} submission={sub} />
                    ))}
                    <Link
                      to="/dashboard/coding/submissions"
                      className="block text-center text-xs text-primary hover:underline py-2"
                    >
                      View all submissions →
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Panel>
        </PanelGroup>
      </div>

      {/* ── Status Bar ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex items-center gap-4 px-4 py-1 border-t border-border bg-muted/30 text-xs text-muted-foreground shrink-0">
        <span className="flex items-center gap-1">
          <Code2 className="h-3 w-3" aria-hidden="true" />
          {LANGUAGE_LABELS[editorSettings.language]}
        </span>
        <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
        {problem && (
          <>
            <span className="ml-auto flex items-center gap-1">
              <Tag className="h-3 w-3" aria-hidden="true" />
              {problem.tags.slice(0, 2).map((t) => t.name).join(', ')}
            </span>
            <Link
              to={`/dashboard/coding/problems/${problem.slug}/discussions`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-3 w-3" aria-hidden="true" />
              {problem.discussionCount ?? 0} discussions
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Problem Panel ─────────────────────────────────────────────────────────────

interface ProblemPanelProps {
  problem: ReturnType<typeof useProblem>['data']
  isLoading: boolean
}

function ProblemPanel({ problem, isLoading }: ProblemPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    )
  }

  if (!problem) return null

  return (
    <div className="space-y-5 text-sm">
      {/* Title + badges */}
      <div>
        <h1 className="text-base font-bold text-foreground mb-2">{problem.title}</h1>
        <div className="flex items-center flex-wrap gap-2">
          <CodingDifficultyBadge difficulty={problem.difficulty} />
          <Badge variant="outline" className="text-xs">{problem.category.name}</Badge>
          {problem.isSolved && (
            <Badge variant="success" className="text-xs gap-1">
              <CheckCircle2 className="h-3 w-3" /> Solved
            </Badge>
          )}
        </div>
      </div>

      {/* Problem Statement */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Description
        </p>
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: problem.description }}
        />
      </div>

      {/* Examples */}
      {problem.examples.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Examples
          </p>
          <div className="space-y-3">
            {problem.examples.map((ex, idx) => (
              <div
                key={ex.id}
                className="rounded-md border border-border bg-muted/30 p-3 space-y-1.5"
              >
                <p className="text-xs font-medium text-muted-foreground">Example {idx + 1}</p>
                <div>
                  <span className="text-xs text-muted-foreground">Input: </span>
                  <code className="text-xs font-mono text-foreground">{ex.input}</code>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Output: </span>
                  <code className="text-xs font-mono text-foreground">{ex.output}</code>
                </div>
                {ex.explanation && (
                  <div>
                    <span className="text-xs text-muted-foreground">Explanation: </span>
                    <span className="text-xs text-foreground">{ex.explanation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints */}
      {problem.constraints && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Constraints
          </p>
          <div
            className="text-xs font-mono text-foreground leading-relaxed bg-muted/30 rounded-md p-3"
            dangerouslySetInnerHTML={{ __html: problem.constraints }}
          />
        </div>
      )}

      {/* Tags */}
      {problem.tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <Tag className="h-3 w-3" aria-hidden="true" />
            Tags
          </p>
          <div className="flex flex-wrap gap-1">
            {problem.tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
          </div>
        </div>
      )}

      {/* Companies */}
      {problem.companies.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <Building2 className="h-3 w-3" aria-hidden="true" />
            Companies
          </p>
          <div className="flex flex-wrap gap-1">
            {problem.companies.map((co) => (
              <CompanyBadge key={co.id} company={co} />
            ))}
          </div>
        </div>
      )}

      {/* Discussion link */}
      <div className="pt-2 border-t border-border">
        <Link
          to={`/dashboard/coding/problems/${problem.slug}/discussions`}
          className="flex items-center gap-2 text-xs text-primary hover:underline"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          View {problem.discussionCount ?? 0} discussion{(problem.discussionCount ?? 0) !== 1 ? 's' : ''}
        </Link>
      </div>
    </div>
  )
}

function getDefaultTemplate(lang: Language): string {
  const templates: Record<Language, string> = {
    javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar solve = function(nums) {\n  // Your solution here\n};\n`,
    typescript: `function solve(nums: number[]): number {\n  // Your solution here\n  return 0;\n}\n`,
    python: `class Solution:\n    def solve(self, nums: list[int]) -> int:\n        # Your solution here\n        pass\n`,
    java: `class Solution {\n    public int solve(int[] nums) {\n        // Your solution here\n        return 0;\n    }\n}\n`,
    cpp: `class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        // Your solution here\n        return 0;\n    }\n};\n`,
    c: `int solve(int* nums, int numsSize) {\n    // Your solution here\n    return 0;\n}\n`,
    go: `func solve(nums []int) int {\n    // Your solution here\n    return 0\n}\n`,
    rust: `impl Solution {\n    pub fn solve(nums: Vec<i32>) -> i32 {\n        // Your solution here\n        0\n    }\n}\n`,
  }
  return templates[lang] ?? '// Write your solution here\n'
}
