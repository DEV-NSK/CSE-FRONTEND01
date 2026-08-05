/**
 * FPRD-23: Production Profile Page
 * All data from database — zero hardcoded values.
 * Full light/dark theme support via CSS variables.
 */
import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Edit, Mail, Phone, MapPin, GraduationCap, Globe, Share2,
  FileText, ExternalLink, CheckCircle, Flame, Star, Trophy,
  Zap, Code2, BookOpen, FolderOpen, ChevronRight, Camera,
  Award, Activity, TrendingUp, Copy, Check, Loader2,
  BarChart2, Users, Lock, Eye, EyeOff, Trash2, RefreshCw,
  X as XIcon, PlayCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Progress } from '@/shared/components/ui/progress'
import { useAuthStore } from '@/shared/store/authStore'
import { getInitials } from '@/shared/lib/utils'
import { useProfile } from '@/shared/hooks/useProfile'
import { useCodingAnalytics } from '@/shared/hooks/useCoding'
import { profileService } from '@/shared/services/profile.service'
import type { User } from '@/types'

// ── Brand SVG icons ───────────────────────────────────────────────────────────
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

// ── Animated counter ──────────────────────────────────────────────────────────
function CountUp({ end, duration = 1200 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  const ref = useRef<HTMLSpanElement>(null)

  const start = useCallback(() => {
    if (started.current) return
    started.current = true
    let current = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      current += step
      if (current >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 16)
  }, [end, duration])

  // Start on mount
  useState(() => { start() })

  return <span ref={ref}>{count.toLocaleString()}</span>
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-64 rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted" />)}
      </div>
    </div>
  )
}

// ── Profile completion bar ────────────────────────────────────────────────────
function CompletionBar({ user }: { user: User }) {
  const pct = user.profileCompletion ?? 0
  const color = pct >= 80 ? 'text-emerald-600 dark:text-emerald-400'
    : pct >= 60 ? 'text-amber-600 dark:text-amber-400'
    : 'text-primary'
  const label = pct >= 100 ? '🎉 Profile complete!' : pct >= 80 ? 'Almost there!' : 'Complete your profile'

  if (pct >= 100) return null

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className={`text-sm font-bold ${color}`}>{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>
      <Button asChild size="sm" variant="outline">
        <Link to="/dashboard/profile/edit">Complete</Link>
      </Button>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, delta, color }: {
  icon: React.ElementType; label: string; value: number; delta?: string; color: string
}) {
  return (
    <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card className="hover:border-border/80 transition-all cursor-default h-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            {delta && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{delta}</span>}
          </div>
          <div className="text-xl font-bold text-foreground mb-0.5 stat-card-value">
            <CountUp end={value} />
          </div>
          <div className="text-[11px] text-muted-foreground stat-card-label">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Hero banner ───────────────────────────────────────────────────────────────
function HeroBanner({ user, onAvatarChange, uploading, uploadProgress, onDeleteAvatar }: {
  user: User
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploading: boolean
  uploadProgress: number
  onDeleteAvatar: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const memberYear = new Date(user.createdAt).getFullYear()
  const handle = user.username ?? user.fullName?.toLowerCase().replace(/\s+/g, '')

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Gradient background — uses CSS variables so it works in light+dark */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
      {/* subtle grid overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.1) 40px,rgba(255,255,255,.1) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.1) 40px,rgba(255,255,255,.1) 41px)' }} />

      <div className="relative z-10 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-white/20">
                <Avatar className="w-full h-full border-4 border-white/30">
                  <AvatarImage src={user.profileImage} alt={user.fullName} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-primary-foreground/10 text-white">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-md" />
              {/* Camera overlay */}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                aria-label="Change avatar"
                disabled={uploading}
              >
                {uploading
                  ? <div className="flex flex-col items-center gap-1">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                      <span className="text-[10px] text-white font-medium">{uploadProgress}%</span>
                    </div>
                  : <Camera className="h-6 w-6 text-white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                className="sr-only" onChange={onAvatarChange} aria-label="Upload avatar" />
            </div>
            {/* Delete avatar button */}
            {user.profileImage && !uploading && (
              <button onClick={onDeleteAvatar}
                className="mt-2 w-full text-center text-[10px] text-white/70 hover:text-white transition-colors flex items-center justify-center gap-1"
                aria-label="Remove avatar">
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            )}
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{user.fullName}</h1>
              {user.isVerified && (
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3 text-blue-200" /> Verified
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                user.profileVisibility === 'PRIVATE' ? 'bg-white/10 text-white/70 border-white/20' :
                user.profileVisibility === 'FRIENDS' ? 'bg-white/10 text-white/70 border-white/20' :
                'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
              }`}>
                {user.profileVisibility === 'PRIVATE' ? <><Lock className="h-2.5 w-2.5 inline mr-1" />Private</> :
                 user.profileVisibility === 'FRIENDS' ? <><Users className="h-2.5 w-2.5 inline mr-1" />Friends</> :
                 <><Eye className="h-2.5 w-2.5 inline mr-1" />Public</>}
              </span>
            </div>

            {user.headline && (
              <p className="text-white/90 font-medium text-sm mb-2">{user.headline}</p>
            )}
            {!user.headline && user.branch && (
              <p className="text-blue-200 text-sm mb-2 font-medium">{user.branch} Developer</p>
            )}

            {/* Contact row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80 mb-3">
              {user.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</span>}
              {user.phoneNumber && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{user.phoneNumber}</span>}
              {user.collegeName && <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{user.collegeName}</span>}
              {user.branch && <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{user.branch}</span>}
              {user.currentYear && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Year {user.currentYear}</span>}
            </div>

            {user.bio && <p className="text-white/80 text-sm mb-3 max-w-lg leading-relaxed">{user.bio}</p>}

            {/* Action row */}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary" className="gap-1.5 bg-white/15 hover:bg-white/25 text-white border-white/20">
                <Link to="/dashboard/profile/edit"><Edit className="h-3.5 w-3.5" /> Edit Profile</Link>
              </Button>
              {handle && (
                <span className="flex items-center gap-1 text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                  @{handle}
                </span>
              )}
              <span className="text-xs text-white/50 self-center">Member since {memberYear}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Social links card ─────────────────────────────────────────────────────────
interface SocialLink { label: string; url: string; color: string; icon: React.ElementType }

function SocialsCard({ user }: { user: User }) {
  const links: SocialLink[] = [
    user.linkedinUrl ? { label: 'LinkedIn', url: user.linkedinUrl, color: '#0077b5', icon: LinkedinIcon } : null,
    user.githubUrl ? { label: 'GitHub', url: user.githubUrl, color: '#6e5494', icon: GithubIcon } : null,
    user.portfolioUrl ? { label: 'Portfolio', url: user.portfolioUrl, color: '#22c55e', icon: Globe } : null,
    user.twitterUrl ? { label: 'Twitter', url: user.twitterUrl, color: '#1da1f2', icon: XIcon } : null,
    user.youtubeUrl ? { label: 'YouTube', url: user.youtubeUrl, color: '#ff0000', icon: PlayCircle } : null,
    user.leetcodeUrl ? { label: 'LeetCode', url: user.leetcodeUrl, color: '#ffa116', icon: Code2 } : null,
    user.codechefUrl ? { label: 'CodeChef', url: user.codechefUrl, color: '#5b4638', icon: Code2 } : null,
    user.hackerrankUrl ? { label: 'HackerRank', url: user.hackerrankUrl, color: '#2ec866', icon: Code2 } : null,
    user.codeforcesUrl ? { label: 'Codeforces', url: user.codeforcesUrl, color: '#318ce7', icon: Code2 } : null,
    user.gfgUrl ? { label: 'GeeksforGeeks', url: user.gfgUrl, color: '#2f8d46', icon: Code2 } : null,
    user.mediumUrl ? { label: 'Medium', url: user.mediumUrl, color: '#000000', icon: FileText } : null,
  ].filter(Boolean) as SocialLink[]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Connect</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs h-auto py-1">
            <Link to="/dashboard/profile/edit">Edit</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {links.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No social links yet.{' '}
            <Link to="/dashboard/profile/edit" className="text-primary hover:underline">Add links</Link>
          </p>
        ) : links.map((l) => (
          <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/60 transition-colors group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${l.color}22` }}>
              <l.icon className="h-3.5 w-3.5" style={{ color: l.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{l.label}</p>
              <p className="text-[10px] text-muted-foreground truncate">{l.url.replace(/^https?:\/\//, '')}</p>
            </div>
            <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground shrink-0" />
          </a>
        ))}
        <Link to="/dashboard/profile/edit"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-1">
          <span className="text-base leading-none">+</span> Add more links
        </Link>
      </CardContent>
    </Card>
  )
}

// ── Coding analytics card ─────────────────────────────────────────────────────
function CodingCard({ analytics }: { analytics: ReturnType<typeof useProfile>['analytics'] }) {
  if (!analytics) return (
    <Card><CardContent className="p-5 flex items-center justify-center h-32">
      <p className="text-sm text-muted-foreground">No coding data yet. Start solving!</p>
    </CardContent></Card>
  )
  const total = analytics.totalSubmissions
  const pct = analytics.acceptanceRate
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Coding Stats</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs h-auto py-1">
            <Link to="/dashboard/coding/analytics">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Accepted', value: analytics.accepted, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Rejected', value: analytics.rejected, color: 'text-destructive' },
            { label: 'Total', value: total, color: 'text-foreground' },
            { label: 'Acceptance', value: `${pct}%`, color: 'text-primary', isStr: true },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-lg bg-muted/50 text-center">
              <div className={`text-xl font-bold ${s.color}`}>
                {s.isStr ? s.value : <CountUp end={s.value as number} />}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Acceptance rate</span>
            <span className="font-medium text-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  )
}

// ── Activity timeline ─────────────────────────────────────────────────────────
const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  solved: { icon: Code2, color: 'text-emerald-500' },
  lesson: { icon: BookOpen, color: 'text-blue-500' },
  resume: { icon: FileText, color: 'text-purple-500' },
  project: { icon: FolderOpen, color: 'text-amber-500' },
  badge:   { icon: Award,     color: 'text-orange-500' },
  default: { icon: Activity,  color: 'text-muted-foreground' },
}

function ActivityCard({ activity, isLoading }: {
  activity: ReturnType<typeof useProfile>['activity']
  isLoading: boolean
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && [...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2.5 bg-muted rounded w-1/3" />
            </div>
          </div>
        ))}
        {!isLoading && activity.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No recent activity yet.</p>
        )}
        {!isLoading && activity.map((a, i) => {
          const { icon: Icon, color } = ACTIVITY_ICONS[a.type] ?? ACTIVITY_ICONS.default
          const timeAgo = new Date(a.time).toLocaleDateString()
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
              </div>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ── Projects card ─────────────────────────────────────────────────────────────
function ProjectsCard({ projects }: {
  projects: ReturnType<typeof useProfile>['projects']
  isLoading?: boolean
}) {
  if (projects.length === 0) return null   // hide entirely when empty — no dead space
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Projects</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs h-6 px-2">
            <Link to="/dashboard/projects">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-3 space-y-2">
        {projects.slice(0, 3).map((p) => (
          <div key={p.id}
            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/70 transition-colors">
            <div className="h-7 w-7 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
              <FolderOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs font-medium text-foreground truncate">{p.title}</span>
                <div className="flex gap-1 shrink-0">
                  {p.githubRepository && (
                    <a href={p.githubRepository} target="_blank" rel="noopener noreferrer">
                      <GithubIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </a>
                  )}
                  {p.liveDemo && (
                    <a href={p.liveDemo} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {p.technologies.slice(0, 3).map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{t}</span>
                ))}
                <Badge variant="outline" className="text-[10px] h-4 ml-auto">{p.role}</Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Achievements card ─────────────────────────────────────────────────────────
function AchievementsCard({ achievements }: { achievements: ReturnType<typeof useProfile>['achievements'] }) {
  if (achievements.length === 0) return null  // hide entirely when empty — no dead space
  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-semibold">Achievements</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {achievements.map((b) => (
            <div key={b.id} title={b.name}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-default ${
                b.earned
                  ? 'bg-primary/8 border-primary/20'
                  : 'bg-muted border-border opacity-40 grayscale'
              }`}>
              <span className="text-lg leading-none">{b.icon}</span>
              <span className="text-[10px] text-center text-muted-foreground leading-tight">{b.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Share card ────────────────────────────────────────────────────────────────
function ShareCard({ user }: { user: User }) {
  const [copied, setCopied] = useState(false)
  const profileUrl = profileService.getShareableUrl(user)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = profileUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.fullName} — CAMPUSRANK`,
          text: user.headline ?? `Check out ${user.fullName}'s profile on CAMPUSRANK`,
          url: profileUrl,
        })
      } catch { /* user cancelled */ }
    } else {
      copyLink()
    }
  }

  const shareLinks = [
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, color: '#0077b5', icon: LinkedinIcon },
    { label: 'Twitter', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(`Check out my CAMPUSRANK profile!`)}`, color: '#1da1f2', icon: XIcon },
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`My CAMPUSRANK profile: ${profileUrl}`)}`, color: '#25d366', icon: Share2 },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Share Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Profile URL */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground flex-1 truncate">{profileUrl.replace(/^https?:\/\//, '')}</p>
          <Button size="sm" variant="ghost" className="h-7 px-2 shrink-0" onClick={copyLink}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
        {/* Share buttons */}
        <div className="flex gap-2 flex-wrap">
          {shareLinks.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: s.color }}>
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </a>
          ))}
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={shareNative}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Privacy card ──────────────────────────────────────────────────────────────
function PrivacyCard({ user, onUpdate }: { user: User; onUpdate: (v: 'PUBLIC' | 'FRIENDS' | 'PRIVATE') => void }) {
  const options = [
    { value: 'PUBLIC', label: 'Public', desc: 'Anyone can view', icon: Eye },
    { value: 'FRIENDS', label: 'Friends', desc: 'Connected users only', icon: Users },
    { value: 'PRIVATE', label: 'Private', desc: 'Only you', icon: Lock },
  ] as const

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Profile Visibility</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {options.map((o) => {
          const Icon = o.icon
          const active = (user.profileVisibility ?? 'PUBLIC') === o.value
          return (
            <button key={o.value} onClick={() => onUpdate(o.value)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                active ? 'border-primary bg-primary/8' : 'border-border hover:bg-muted/50'
              }`}>
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${active ? 'text-primary' : 'text-foreground'}`}>{o.label}</p>
                <p className="text-[10px] text-muted-foreground">{o.desc}</p>
              </div>
              {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ── Completion details card ───────────────────────────────────────────────────
function CompletionCard({ completion }: { completion: ReturnType<typeof useProfile>['completion'] }) {
  if (!completion) return null
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Profile Strength</CardTitle>
          <span className="text-lg font-bold text-primary">{completion.percentage}%</span>
        </div>
        <Progress value={completion.percentage} className="h-2 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {completion.details.map((d) => (
            <div key={d.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {d.filled
                  ? <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  : <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/40 shrink-0" />}
                <span className={`text-xs ${d.filled ? 'text-foreground' : 'text-muted-foreground'}`}>{d.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">+{d.weight}%</span>
            </div>
          ))}
        </div>
        {completion.percentage < 100 && (
          <Button asChild size="sm" className="w-full mt-3 gap-1.5">
            <Link to="/dashboard/profile/edit">
              <Edit className="h-3.5 w-3.5" /> Complete Profile
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ── Resume card ───────────────────────────────────────────────────────────────
function ResumeCard({
  user,
  onUploadResume,
  onDeleteResume,
  isUploading,
  uploadProgress,
  setUploadProgress,
  uploadError,
  clearUploadError,
}: {
  user: User
  onUploadResume: (file: File, onProgress: (pct: number) => void) => Promise<void>
  onDeleteResume: () => void
  isUploading: boolean
  uploadProgress: number
  setUploadProgress: (pct: number) => void
  uploadError: string
  clearUploadError: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const hasResume = !!user.resumeUrl

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    clearUploadError()

    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowed.includes(file.type)) {
      clearUploadError()
      alert('Only PDF and DOCX files are allowed.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Resume must be under 10MB.')
      return
    }

    setUploadProgress(0)
    await onUploadResume(file, setUploadProgress)
    e.target.value = ''
  }

  const uploadedDate = user.resumeUploadedAt
    ? new Date(user.resumeUploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const isPdf = user.resumeFileName?.toLowerCase().endsWith('.pdf') ||
    user.resumeUrl?.toLowerCase().includes('.pdf')

  const [previewLoading, setPreviewLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  /** Get a fresh URL (signed if bucket is private, else public URL) */
  const getFreshResumeUrl = async (): Promise<string | null> => {
    try {
      const res = await profileService.getResumeSignedUrl()
      return res.data.data.signedUrl ?? user.resumeUrl ?? null
    } catch {
      return user.resumeUrl ?? null
    }
  }

  const handlePreview = async () => {
    if (!user.resumeUrl) return
    setPreviewLoading(true)
    try {
      const url = await getFreshResumeUrl()
      if (!url) return
      if (isPdf) {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
        window.open(viewerUrl, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!user.resumeUrl) return
    setDownloadLoading(true)
    try {
      const url = await getFreshResumeUrl()
      if (!url) return
      const response = await fetch(url)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = user.resumeFileName ?? (isPdf ? 'resume.pdf' : 'resume.docx')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      const a = document.createElement('a')
      a.href = user.resumeUrl
      a.download = user.resumeFileName ?? 'resume'
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } finally {
      setDownloadLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" /> Resume
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Error */}
        {uploadError && (
          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
            {uploadError}
            <button onClick={clearUploadError} className="ml-2 text-destructive/70 hover:text-destructive">✕</button>
          </div>
        )}

        {hasResume ? (
          <div className="space-y-3">
            {/* Resume info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.resumeFileName ?? 'Resume'}
                </p>
                {uploadedDate && (
                  <p className="text-[11px] text-muted-foreground">Uploaded {uploadedDate}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={handlePreview}
                disabled={previewLoading}
                title={isPdf ? 'Open in new tab' : 'Preview with Google Docs'}
              >
                {previewLoading
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Opening…</>
                  : <><ExternalLink className="h-3.5 w-3.5" />Preview</>}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={handleDownload}
                disabled={downloadLoading}
              >
                {downloadLoading
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
                  : <><RefreshCw className="h-3.5 w-3.5" />Download</>}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress}%</>
                ) : (
                  <><RefreshCw className="h-3.5 w-3.5" />Replace</>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs text-destructive hover:text-destructive"
                onClick={() => onDeleteResume()}
                disabled={isUploading}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-xs text-muted-foreground">No resume uploaded yet.</p>
            <Button
              type="button"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              className="gap-1.5"
            >
              {isUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Uploading… {uploadProgress}%</>
              ) : (
                <>Upload Resume</>
              )}
            </Button>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground">PDF or DOCX · Max 10MB</p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Upload resume"
        />
      </CardContent>
    </Card>
  )
}

// ── Main ProfilePage ──────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user: authUser } = useAuthStore()
  const {
    profile, isLoading,
    completion, activity, isActivityLoading,
    analytics, projects, achievements,
    uploadAvatar, isUploadingAvatar,
    deleteAvatar,
    updatePrivacy,
    uploadResume, isUploadingResume,
    deleteResume,
  } = useProfile()

  // Use the dedicated coding analytics for accurate distinct-problem counts
  const { data: codingStats } = useCodingAnalytics()

  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [resumeUploadProgress, setResumeUploadProgress] = useState(0)
  const [resumeUploadError, setResumeUploadError] = useState('')

  const user = profile ?? authUser
  if (!user) return null
  if (isLoading && !authUser) return <ProfileSkeleton />

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setUploadError('Only JPEG, PNG, or WebP images are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB.')
      return
    }

    setUploadProgress(0)
    try {
      await uploadAvatar(file, (pct) => setUploadProgress(pct))
    } catch {
      setUploadError('Upload failed. Please retry.')
    }
    e.target.value = ''
  }

  const problemsSolved = codingStats?.stats?.totalSolved ?? analytics?.accepted ?? 0

  const stats = [
    { icon: Code2,      label: 'Problems Solved', value: problemsSolved,                                                  color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', delta: codingStats?.stats?.acceptanceRate !== undefined ? `${codingStats.stats.acceptanceRate}% rate` : undefined },
    { icon: BookOpen,   label: 'Lessons Done',     value: analytics?.lessonsCompleted ?? 0,                               color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { icon: FolderOpen, label: 'Projects',          value: projects.length,                                                color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { icon: Zap,        label: 'XP Earned',         value: problemsSolved * 20 + (analytics?.lessonsCompleted ?? 0) * 10, color: 'bg-purple-500/10 text-purple-500' },
  ]

  return (
    <div className="flex flex-col gap-0">
      {/* Upload error */}
      <AnimatePresence>
        {uploadError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
            {uploadError}
            <button onClick={() => setUploadError('')} className="ml-2 text-destructive/70 hover:text-destructive">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ROW 1: Hero banner — flush, no bottom gap ── */}
      <HeroBanner
        user={user}
        onAvatarChange={handleAvatarChange}
        uploading={isUploadingAvatar}
        uploadProgress={uploadProgress}
        onDeleteAvatar={deleteAvatar}
      />

      {/* Main grid — 2 columns: left content + right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-0 items-start mt-3">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-3 lg:pr-3">

          {/* Profile completion bar (if not 100%) */}
          <CompletionBar user={user} />

          {/* ── ROW 2: 4 stat cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value}
                delta={s.delta} color={s.color} />
            ))}
          </div>

          {/* ── ROW 3: Coding Stats (left 2/3) + Resume (right 1/3) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
            <div className="sm:col-span-2">
              <CodingCard analytics={analytics} />
            </div>
            <div className="sm:col-span-1">
              <ResumeCard
                user={user}
                onUploadResume={async (file, onProgress) => {
                  setResumeUploadError('')
                  try { await uploadResume(file, onProgress) }
                  catch (err: any) { setResumeUploadError(err?.response?.data?.message ?? 'Resume upload failed.') }
                }}
                onDeleteResume={deleteResume}
                isUploading={isUploadingResume}
                uploadProgress={resumeUploadProgress}
                setUploadProgress={setResumeUploadProgress}
                uploadError={resumeUploadError}
                clearUploadError={() => setResumeUploadError('')}
              />
            </div>
          </div>

          {/* ── ROW 4: Connect (left ~40%) + Share Profile (right ~60%) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <SocialsCard user={user} />
            <div className="flex flex-col gap-3">
              <ShareCard user={user} />
              <PrivacyCard user={user} onUpdate={updatePrivacy} />
            </div>
          </div>

          {/* ── ROW 5: Projects (full width of left col) ── */}
          {projects.length > 0 && <ProjectsCard projects={projects} />}

          {/* ── ROW 6: Achievements badges (full width of left col) ── */}
          {achievements.length > 0 && <AchievementsCard achievements={achievements} />}
        </div>

        {/* ── RIGHT SIDEBAR: Recent Activity + Profile Strength (sticky) ── */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-[72px]">
          <ActivityCard activity={activity} isLoading={isActivityLoading} />
          <CompletionCard completion={completion} />
        </div>
      </div>
    </div>
  )
}
