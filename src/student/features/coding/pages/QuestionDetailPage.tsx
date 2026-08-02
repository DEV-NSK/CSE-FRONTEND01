// ─── FPRD-16: Question Detail Page (Phase 6-8) ───────────────────────────────
// Full question detail UI: breadcrumb, left sticky nav, right info sidebar.
// No code editor — pure UI/UX as specified in FPRD-16.

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ArrowLeft, Heart, Share2, Bookmark,
  Tag, Building2, MessageSquare, Clock, Zap,
  ThumbsUp, ThumbsDown, ChevronDown,
  FileText, Code2, HelpCircle, Users, GitBranch, Lightbulb,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { CodingDifficultyBadge } from '@/student/components/coding/DifficultyBadge'
import { useProblem, useToggleFavorite } from '@/shared/hooks/useCoding'
import { cn } from '@/shared/lib/utils'

// ─── Left sidebar navigation items ───────────────────────────────────────────

type SidebarSection =
  | 'description'
  | 'examples'
  | 'constraints'
  | 'hints'
  | 'companies'
  | 'related'
  | 'discussion'
  | 'solutions'

const sidebarItems: { key: SidebarSection; label: string; icon: React.ElementType }[] = [
  { key: 'description', label: 'Description',       icon: FileText },
  { key: 'examples',    label: 'Examples',           icon: Code2 },
  { key: 'constraints', label: 'Constraints',        icon: HelpCircle },
  { key: 'hints',       label: 'Hints',              icon: Lightbulb },
  { key: 'companies',   label: 'Companies',          icon: Building2 },
  { key: 'related',     label: 'Related Questions',  icon: GitBranch },
  { key: 'discussion',  label: 'Discussion',         icon: MessageSquare },
  { key: 'solutions',   label: 'Solutions',          icon: Users },
]

export function QuestionDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SidebarSection>('description')
  const [hintsOpen, setHintsOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const { data: problem, isLoading, isError, refetch } = useProblem(slug!)
  const { mutate: toggleFavorite } = useToggleFavorite()

  // Derive topic slug from category for breadcrumb
  const topicSlug = problem?.category?.slug ?? null

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id as SidebarSection)
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <ErrorState
          title="Question not found"
          message="This question doesn't exist or could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground py-3 flex-wrap"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link
          to="/dashboard/coding/question-bank"
          className="hover:text-foreground transition-colors"
        >
          Question Bank
        </Link>
        {topicSlug && (
          <>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <Link
              to={`/dashboard/coding/question-bank/${topicSlug}`}
              className="hover:text-foreground transition-colors capitalize"
            >
              {problem?.category?.name ?? topicSlug}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        {isLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {problem?.title}
          </span>
        )}
      </nav>

      {/* ── Three-column layout ─────────────────────────────────────────────── */}
      <div className="flex flex-1 gap-6 lg:gap-8">
        {/* ── LEFT: Sticky sidebar navigation ─────────────────────────────── */}
        <aside
          className="hidden lg:flex flex-col w-52 shrink-0"
          aria-label="Question navigation"
        >
          <div className="sticky top-4">
            <nav aria-label="Sections">
              <ul className="space-y-0.5">
                {sidebarItems.map(({ key, label, icon: Icon }) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(key)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all',
                        activeSection === key
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Solve button */}
            {!isLoading && problem && (
              <div className="mt-6">
                <Button asChild className="w-full gap-2">
                  <Link to={`/dashboard/coding/problems/${problem.slug}`}>
                    <Code2 className="h-4 w-4" />
                    Open Editor
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* ── CENTER: Question content ─────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-8 pb-16">
          {/* Title + badges */}
          <div id="section-description">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>
              </div>
            ) : problem ? (
              <>
                {/* Header actions */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-foreground mb-3 leading-tight">
                      {problem.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <CodingDifficultyBadge difficulty={problem.difficulty} />
                      <Badge variant="outline" className="text-xs">
                        {problem.category?.name ?? 'Uncategorised'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Acceptance{' '}
                        <span className="font-medium text-foreground">
                          {problem.acceptanceRate.toFixed(1)}%
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
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
                          problem.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setBookmarked((b) => !b)}
                      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                      aria-pressed={bookmarked}
                    >
                      <Bookmark
                        className={cn(
                          'h-4 w-4 transition-colors',
                          bookmarked ? 'fill-primary text-primary' : 'text-muted-foreground',
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Share"
                    >
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                {/* Like / Dislike */}
                <div className="flex items-center gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => { setLiked((v) => !v); if (disliked) setDisliked(false) }}
                    className={cn(
                      'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all',
                      liked
                        ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-border text-muted-foreground hover:border-green-400',
                    )}
                    aria-pressed={liked}
                    aria-label="Like"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>Likes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDisliked((v) => !v); if (liked) setLiked(false) }}
                    className={cn(
                      'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all',
                      disliked
                        ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-border text-muted-foreground hover:border-red-400',
                    )}
                    aria-pressed={disliked}
                    aria-label="Dislike"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    <span>Dislikes</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                    <Clock className="h-3.5 w-3.5" />
                    <span>~30 min</span>
                    <span className="mx-1">·</span>
                    <Zap className="h-3.5 w-3.5 text-yellow-500" />
                    <span>10 XP</span>
                  </div>
                </div>

                {/* Problem statement */}
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: problem.description ?? '' }}
                />
              </>
            ) : null}
          </div>

          {/* Examples section */}
          <div id="section-examples" className="scroll-mt-4">
            <SectionTitle icon={Code2} label="Examples" />
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ) : (problem?.examples ?? []).length > 0 ? (
              <div className="space-y-4">
                {(problem!.examples ?? []).map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
                  >
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Example {idx + 1}
                    </p>
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Input: </span>
                        <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                          {ex.input}
                        </code>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Output: </span>
                        <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                          {ex.output}
                        </code>
                      </div>
                      {ex.explanation && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Explanation: </span>
                          <span className="text-xs text-foreground">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptySection message="No examples available yet." />
            )}
          </div>

          {/* Constraints section */}
          <div id="section-constraints" className="scroll-mt-4">
            <SectionTitle icon={HelpCircle} label="Constraints" />
            {isLoading ? (
              <Skeleton className="h-16 w-full rounded-lg" />
            ) : problem?.constraints ? (
              <div
                className="rounded-lg border border-border bg-muted/30 p-4 text-sm font-mono text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: problem.constraints }}
              />
            ) : (
              <EmptySection message="Constraints will be added with the full question dataset." />
            )}
          </div>

          {/* Hints section — collapsible */}
          <div id="section-hints" className="scroll-mt-4">
            <SectionTitle icon={Lightbulb} label="Hints" />
            <div className="rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setHintsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors"
                aria-expanded={hintsOpen}
              >
                <span className="text-sm font-medium text-foreground">
                  {hintsOpen ? 'Hide hints' : 'Show hints'}
                </span>
                <motion.div animate={{ rotate: hintsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {hintsOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4">
                      <EmptySection message="Hints will be available once the question dataset is imported." />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Companies section */}
          <div id="section-companies" className="scroll-mt-4">
            <SectionTitle icon={Building2} label="Companies" />
            {isLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
              </div>
            ) : (problem?.companies ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {problem!.companies.map((co) => (
                  <span
                    key={co.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:bg-accent/10 transition-colors cursor-default"
                  >
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    {co.name}
                  </span>
                ))}
              </div>
            ) : (
              <EmptySection message="Company tags will be added with the question dataset." />
            )}
          </div>

          {/* Tags section */}
          <div id="section-tags">
            <SectionTitle icon={Tag} label="Topics" />
            {isLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-6 w-16 rounded" />)}
              </div>
            ) : (problem?.tags ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {problem!.tags.map((t) => (
                  <Badge key={t.id} variant="secondary" className="text-xs">
                    {t.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptySection message="Topic tags will be added with the question dataset." />
            )}
          </div>

          {/* Related questions placeholder */}
          <div id="section-related" className="scroll-mt-4">
            <SectionTitle icon={GitBranch} label="Related Questions" />
            <EmptySection message="Related questions will appear here once the dataset is imported." />
          </div>

          {/* Discussion placeholder */}
          <div id="section-discussion" className="scroll-mt-4">
            <SectionTitle icon={MessageSquare} label="Discussion" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">
                {problem?.discussionCount ?? 0} discussion{(problem?.discussionCount ?? 0) !== 1 ? 's' : ''}
              </p>
              {problem && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/dashboard/coding/problems/${problem.slug}/discussions`}>
                    View Discussions
                  </Link>
                </Button>
              )}
            </div>
            {!problem?.discussionCount && (
              <EmptySection message="Be the first to start a discussion!" />
            )}
          </div>

          {/* Solutions placeholder */}
          <div id="section-solutions" className="scroll-mt-4">
            <SectionTitle icon={Users} label="Solutions" />
            <EmptySection message="Community solutions will be visible after you solve this problem." />
          </div>
        </main>

        {/* ── RIGHT: Info sidebar ───────────────────────────────────────── */}
        <aside
          className="hidden xl:flex flex-col w-64 shrink-0"
          aria-label="Question info"
        >
          <div className="sticky top-4 space-y-4">
            {/* Question info card */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Question Info</h3>
              <InfoRow label="Difficulty">
                {isLoading ? (
                  <Skeleton className="h-5 w-14 rounded-full" />
                ) : problem ? (
                  <CodingDifficultyBadge difficulty={problem.difficulty} />
                ) : null}
              </InfoRow>
              <InfoRow label="Topic">
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <span className="text-sm text-foreground font-medium">
                    {problem?.category?.name ?? '—'}
                  </span>
                )}
              </InfoRow>
              <InfoRow label="Acceptance">
                {isLoading ? (
                  <Skeleton className="h-4 w-14" />
                ) : (
                  <span className="text-sm text-foreground font-medium">
                    {problem ? `${problem.acceptanceRate.toFixed(1)}%` : '—'}
                  </span>
                )}
              </InfoRow>
              <InfoRow label="Submissions">
                {isLoading ? (
                  <Skeleton className="h-4 w-14" />
                ) : (
                  <span className="text-sm text-foreground font-medium">
                    {problem ? problem.totalSubmissions.toLocaleString() : '—'}
                  </span>
                )}
              </InfoRow>
              <InfoRow label="Estimated Time">
                <span className="text-sm text-foreground font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  ~30 min
                </span>
              </InfoRow>
              <InfoRow label="XP Reward">
                <span className="text-sm text-foreground font-medium flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  10 XP
                </span>
              </InfoRow>
            </div>

            {/* Notes placeholder */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Notes</h3>
              <textarea
                placeholder="Add your notes here..."
                className="w-full text-xs bg-transparent resize-none text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none min-h-[80px]"
                aria-label="Personal notes"
              />
            </div>

            {/* Progress placeholder */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Progress</h3>
              <p className="text-xs text-muted-foreground">
                Track your progress once you start solving.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ─── Helper components ────────────────────────────────────────────────────────

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-base font-semibold text-foreground">{label}</h2>
    </div>
  )
}

function InfoRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span>{children}</span>
    </div>
  )
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-4 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
