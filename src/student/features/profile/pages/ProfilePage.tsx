import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Edit, Mail, Phone, MapPin, GraduationCap, Globe, Github,
  Linkedin, Share2, FileText, ExternalLink, CheckCircle,
  Flame, Star, Trophy, Zap, Code2, BookOpen, FolderOpen,
  ChevronRight, Camera, Award, Activity, TrendingUp,
  Link2, AtSign, Film, Hash,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { useAuthStore } from '@/shared/store/authStore'
import { getInitials } from '@/shared/lib/utils'
import { profileService } from '@/shared/services/profile.service'

// ── Animated counter ──────────────────────────────────────────────────────────
function CountUp({ end, duration = 1500 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return <>{count.toLocaleString()}</>
}

// ── Circular progress ─────────────────────────────────────────────────────────
function CircularProgress({ value, size = 100, stroke = 8 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const color = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#6366f1'
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
    </svg>
  )
}

// ── Particle background for hero ──────────────────────────────────────────────
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div key={i}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
      ))}
    </div>
  )
}

// ── Mock data (replace with real API calls) ───────────────────────────────────
const MOCK_STATS = {
  questionsSolved: 302,
  questionsDelta: '+15 this week',
  projects: 8,
  projectsDelta: '+2 this month',
  roadmaps: 5,
  roadmapsDelta: 'Completed',
  xp: 2550,
  xpDelta: 'Top 10%',
  streak: 17,
  streakDelta: 'Days',
}

const MOCK_CODING = {
  solved: 301,
  easy: 120,
  medium: 181,
  hard: 0,
  acceptance: 92,
  longestStreak: 52,
  currentStreak: 17,
  submissions: 910,
}

const MOCK_LEADERBOARD = [
  { label: 'Global', rank: '#250', icon: Globe },
  { label: 'India', rank: '#42', icon: MapPin },
  { label: 'College', rank: '#1', icon: GraduationCap },
  { label: 'Department', rank: '#1', icon: BookOpen },
]

const MOCK_BADGES = [
  { id: 1, name: '100 Problems', icon: '🎯', earned: true },
  { id: 2, name: '7 Day Streak', icon: '🔥', earned: true },
  { id: 3, name: '30 Day Streak', icon: '⚡', earned: true },
  { id: 4, name: 'Python Master', icon: '🐍', earned: true },
  { id: 5, name: 'Top 10%', icon: '🏆', earned: true },
  { id: 6, name: 'First Project', icon: '🚀', earned: true },
  { id: 7, name: 'Graph Expert', icon: '📊', earned: false },
  { id: 8, name: 'Roadmap Done', icon: '🗺️', earned: false },
  { id: 9, name: 'Hackathon', icon: '💡', earned: false },
  { id: 10, name: 'Daily Winner', icon: '🥇', earned: false },
]

const MOCK_ACTIVITY = [
  { id: 1, type: 'solved', label: 'Solved Two Sum', time: '2 mins ago', icon: Code2, color: 'text-green-400' },
  { id: 2, type: 'lesson', label: 'Completed Python Lesson', time: '1 hr ago', icon: BookOpen, color: 'text-blue-400' },
  { id: 3, type: 'resume', label: 'Uploaded Resume', time: 'Yesterday', icon: FileText, color: 'text-purple-400' },
  { id: 4, type: 'project', label: 'Completed Project', time: '3 days ago', icon: FolderOpen, color: 'text-yellow-400' },
  { id: 5, type: 'badge', label: 'Earned 500 XP Badge', time: '5 days ago', icon: Award, color: 'text-orange-400' },
]

const MOCK_PROJECTS = [
  { id: 1, title: 'Portfolio Website', desc: 'React + TypeScript personal portfolio', stack: ['React', 'TypeScript', 'Tailwind'], status: 'Completed', color: 'bg-green-500/10 text-green-400' },
  { id: 2, title: 'Student Dashboard', desc: 'Full stack student dashboard with Django', stack: ['React', 'Django', 'MySQL'], status: 'In Progress', color: 'bg-yellow-500/10 text-yellow-400' },
  { id: 3, title: 'E-Commerce Store', desc: 'E-Commerce website using React, Redux', stack: ['React', 'Redux', 'Bootstrap'], status: 'Completed', color: 'bg-green-500/10 text-green-400' },
]

const MOCK_LEARNING = [
  { subject: 'Python', percent: 92, color: '#6366f1' },
  { subject: 'DSA', percent: 45, color: '#f59e0b' },
  { subject: 'DBMS', percent: 60, color: '#22c55e' },
  { subject: 'OS', percent: 20, color: '#ef4444' },
  { subject: 'CN', percent: 15, color: '#8b5cf6' },
]

const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0077b5', prefix: 'linkedin.com/in/' },
  { key: 'github', label: 'GitHub', icon: Github, color: '#6e5494', prefix: 'github.com/' },
  { key: 'twitter', label: 'Twitter / X', icon: Hash, color: '#1da1f2', prefix: 'twitter.com/' },
  { key: 'youtube', label: 'YouTube', icon: Film, color: '#ff0000', prefix: 'youtube.com/' },
  { key: 'instagram', label: 'Instagram', icon: AtSign, color: '#e4405f', prefix: 'instagram.com/' },
  { key: 'portfolio', label: 'Portfolio', icon: Globe, color: '#22c55e', prefix: '' },
]

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, delta, color }: {
  icon: React.ElementType; label: string; value: number; delta: string; color: string
}) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card className="bg-[#0F172A] border-white/5 hover:border-white/10 transition-all cursor-default">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs text-emerald-400 font-medium">{delta}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-0.5">
            <CountUp end={value} />
          </div>
          <div className="text-xs text-slate-400">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Leaderboard card ──────────────────────────────────────────────────────────
function LeaderboardCard({ user }: { user: ReturnType<typeof useAuthStore>['user'] }) {
  const level = 6
  const xp = 2500
  const xpNext = 3000
  return (
    <Card className="bg-[#0F172A] border-white/5 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white">Leaderboard</CardTitle>
          <button className="text-xs text-[#6C5CE7] hover:underline">View All</button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Level badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#6C5CE7]/20 to-[#2563EB]/20 border border-[#6C5CE7]/20">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Star className="h-6 w-6 text-white fill-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#6C5CE7] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {level}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-semibold">Level {level}</div>
            <div className="text-slate-400 text-xs">{xp} / {xpNext} XP</div>
            <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#2563EB]"
                initial={{ width: 0 }} animate={{ width: `${(xp/xpNext)*100}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }} />
            </div>
          </div>
        </div>
        {/* Ranks */}
        {MOCK_LEADERBOARD.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2">
              <item.icon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-sm text-slate-300">{item.label}</span>
            </div>
            <span className="text-sm font-bold text-[#6C5CE7]">{item.rank}</span>
          </div>
        ))}
        {/* HP */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-sm text-slate-300">HP Points</span>
          </div>
          <span className="text-sm font-bold text-yellow-400">2,850</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          Next level in {xpNext - xp} XP
        </div>
      </CardContent>
    </Card>
  )
}

// ── Coding analytics card ─────────────────────────────────────────────────────
function CodingCard() {
  const total = MOCK_CODING.easy + MOCK_CODING.medium + MOCK_CODING.hard
  const segments = [
    { label: 'Easy', count: MOCK_CODING.easy, color: '#22c55e', pct: (MOCK_CODING.easy / total) * 100 },
    { label: 'Medium', count: MOCK_CODING.medium, color: '#f59e0b', pct: (MOCK_CODING.medium / total) * 100 },
    { label: 'Hard', count: MOCK_CODING.hard, color: '#ef4444', pct: (MOCK_CODING.hard / total) * 100 },
    { label: 'Accuracy', count: MOCK_CODING.acceptance, color: '#6366f1', pct: MOCK_CODING.acceptance, suffix: '%' },
  ]
  // Build conic gradient for donut
  const gradient = `conic-gradient(#22c55e 0% ${segments[0].pct}%, #f59e0b ${segments[0].pct}% ${segments[0].pct + segments[1].pct}%, #6366f1 ${segments[0].pct + segments[1].pct}% 100%)`
  return (
    <Card className="bg-[#0F172A] border-white/5 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white">Coding Progress</CardTitle>
          <button className="text-xs text-[#6C5CE7] hover:underline">View All</button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          {/* Donut chart */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full" style={{ background: gradient, padding: 8 }}>
              <div className="w-full h-full rounded-full bg-[#0F172A] flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-white">{MOCK_CODING.solved}</span>
                <span className="text-[10px] text-slate-400">Solved</span>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex-1 space-y-2">
            {segments.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
                <span className="text-xs font-semibold text-white">{s.count}{s.suffix || ''}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Flame, label: 'Current', value: `${MOCK_CODING.currentStreak}d`, color: 'text-orange-400' },
            { icon: Trophy, label: 'Longest', value: `${MOCK_CODING.longestStreak}d`, color: 'text-yellow-400' },
            { icon: TrendingUp, label: 'Success', value: `${MOCK_CODING.acceptance}%`, color: 'text-green-400' },
          ].map((s) => (
            <div key={s.label} className="text-center p-2 rounded-lg bg-white/5">
              <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
              <div className="text-sm font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Recent projects card ──────────────────────────────────────────────────────
function RecentProjectsCard() {
  return (
    <Card className="bg-[#0F172A] border-white/5 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white">Recent Projects</CardTitle>
          <button className="text-xs text-[#6C5CE7] hover:underline">View All</button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK_PROJECTS.map((p) => (
          <motion.div key={p.id} whileHover={{ x: 2 }}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/5 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-1">
              <span className="text-sm font-medium text-white">{p.title}</span>
              <div className="flex gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 hover:text-white cursor-pointer" />
                <Github className="h-3.5 w-3.5 text-slate-500 hover:text-white cursor-pointer" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-2">{p.desc}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1 flex-wrap">
                {p.stack.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#6C5CE7]/20 text-[#a78bfa]">{t}</span>
                ))}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.color}`}>{p.status}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Achievements card ─────────────────────────────────────────────────────────
function AchievementsCard() {
  return (
    <Card className="bg-[#0F172A] border-white/5 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white">Achievements</CardTitle>
          <button className="text-xs text-[#6C5CE7] hover:underline">View All</button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {MOCK_BADGES.map((b) => (
            <motion.div key={b.id}
              whileHover={b.earned ? { scale: 1.15, y: -2 } : {}}
              title={b.name}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-default ${
                b.earned
                  ? 'bg-gradient-to-br from-[#6C5CE7]/20 to-[#2563EB]/20 border-[#6C5CE7]/30'
                  : 'bg-white/3 border-white/5 opacity-40 grayscale'
              }`}>
              <span className="text-xl leading-none">{b.icon}</span>
              <span className="text-[9px] text-center text-slate-400 leading-tight">{b.name}</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Recent activity card ──────────────────────────────────────────────────────
function ActivityCard() {
  return (
    <Card className="bg-[#0F172A] border-white/5 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white">Recent Activity</CardTitle>
          <button className="text-xs text-[#6C5CE7] hover:underline">View All</button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK_ACTIVITY.map((a, i) => (
          <motion.div key={a.id}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0`}>
              <a.icon className={`h-3.5 w-3.5 ${a.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{a.label}</p>
              <p className="text-[10px] text-slate-500">{a.time}</p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Social links card ─────────────────────────────────────────────────────────
function SocialsCard({ user }: { user: NonNullable<ReturnType<typeof useAuthStore>['user']> }) {
  const links = [
    user.linkedinUrl ? { ...SOCIAL_PLATFORMS[0], url: user.linkedinUrl } : null,
    user.githubUrl ? { ...SOCIAL_PLATFORMS[1], url: user.githubUrl } : null,
    user.portfolioUrl ? { ...SOCIAL_PLATFORMS[5], url: user.portfolioUrl } : null,
  ].filter(Boolean) as typeof SOCIAL_PLATFORMS[0][]

  return (
    <Card className="bg-[#0F172A] border-white/5 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white">Connect With Me</CardTitle>
          <button className="text-xs text-[#6C5CE7] hover:underline">View All</button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {links.length === 0 ? (
          <p className="text-xs text-slate-500">No social links added yet.{' '}
            <Link to="/dashboard/profile/edit" className="text-[#6C5CE7] hover:underline">Add links</Link>
          </p>
        ) : (
          links.map((l) => (
            <a key={l.key} href={l.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors group">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${l.color}22` }}>
                <l.icon className="h-3.5 w-3.5" style={{ color: l.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-300">{l.label}</p>
                <p className="text-[10px] text-slate-500 truncate">{l.url}</p>
              </div>
              <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-slate-400" />
            </a>
          ))
        )}
        <Link to="/dashboard/profile/edit"
          className="flex items-center gap-2 text-xs text-[#6C5CE7] hover:text-[#8b5cf6] transition-colors mt-1">
          <span className="text-lg leading-none">+</span> Add More
        </Link>
      </CardContent>
    </Card>
  )
}

// ── Learning progress card ────────────────────────────────────────────────────
function LearningCard() {
  return (
    <Card className="bg-[#0F172A] border-white/5 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-white">Learning Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK_LEARNING.map((item) => (
          <div key={item.subject}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">{item.subject}</span>
              <span className="text-slate-400">{item.percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${item.percent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Quick action cards ────────────────────────────────────────────────────────
function QuickActionCards({ user, onCopyLink, copied }: {
  user: NonNullable<ReturnType<typeof useAuthStore>['user']>
  onCopyLink: () => void
  copied: boolean
}) {
  const username = user.fullName?.toLowerCase().replace(/\s+/g, '') || 'user'
  const profileUrl = `campusrank.dev/u/${username}`

  const cards = [
    {
      icon: FileText, title: 'Resume', desc: 'View, upload or download your resume',
      action: 'View Resume', actionClass: 'text-[#6C5CE7]', href: '/dashboard/launching-soon/placement',
    },
    {
      icon: Phone, title: 'Contact', desc: 'Add your contact information',
      action: 'View Contact', actionClass: 'text-emerald-400', href: '/dashboard/profile/edit',
    },
    {
      icon: Share2, title: 'Share Profile', desc: 'Share your profile with others',
      action: 'Share Now', actionClass: 'text-orange-400', onClick: onCopyLink,
    },
    {
      icon: Link2, title: 'Profile Link', desc: profileUrl,
      action: copied ? '✓ Copied!' : 'Copy Link', actionClass: copied ? 'text-green-400' : 'text-[#6C5CE7]',
      onClick: onCopyLink,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <motion.div key={i} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="bg-[#0F172A] border-white/5 hover:border-white/10 transition-all h-full">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#6C5CE7]/15 flex-shrink-0">
                  <c.icon className="h-4 w-4 text-[#6C5CE7]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{c.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{c.desc}</p>
                </div>
              </div>
              {c.href ? (
                <Link to={c.href} className={`text-xs font-medium ${c.actionClass} flex items-center gap-1 hover:underline`}>
                  {c.action} <ChevronRight className="h-3 w-3" />
                </Link>
              ) : (
                <button onClick={c.onClick} className={`text-xs font-medium ${c.actionClass} flex items-center gap-1 hover:underline`}>
                  {c.action} <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ── Hero banner section ───────────────────────────────────────────────────────
function HeroBanner({ user, onAvatarChange, uploading }: {
  user: NonNullable<ReturnType<typeof useAuthStore>['user']>
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploading: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const completion = user.profileCompletion ?? 72
  const completionLabel = completion >= 85 ? 'Excellent!' : completion >= 60 ? 'Almost there!' : 'Keep going!'
  const username = user.fullName?.toLowerCase().replace(/\s+/g, '') || 'user'
  const memberYear = new Date(user.createdAt).getFullYear()

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 280 }}>
      {/* gradient background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 40%, #4F46E5 70%, #7c3aed 100%)'
      }} />
      {/* subtle grid overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.1) 40px,rgba(255,255,255,.1) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.1) 40px,rgba(255,255,255,.1) 41px)' }} />
      <Particles />

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar column */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-br from-white/30 to-white/10">
                <Avatar className="w-full h-full border-4 border-white/20">
                  <AvatarImage src={user.profileImage} alt={user.fullName} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-[#2563EB] text-white">{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
              </div>
              {/* online indicator */}
              <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-400 border-2 border-white shadow-md" />
              {/* camera upload overlay */}
              <button onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                aria-label="Change avatar">
                {uploading
                  ? <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera className="h-6 w-6 text-white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onAvatarChange} aria-label="Upload avatar" />
            </div>
          </div>

          {/* User details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{user.fullName}</h1>
              {user.isVerified && (
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3 text-blue-200" /> Verified
                </span>
              )}
            </div>
            <p className="text-blue-200 text-sm mb-3 font-medium">
              {user.branch ? `${user.branch} Developer` : 'Student Developer'}
            </p>

            {/* contact row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-100 mb-3">
              {user.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</span>}
              {user.phoneNumber && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{user.phoneNumber}</span>}
              {(user.collegeName) && <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{user.collegeName}</span>}
              {user.branch && <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{user.branch}{user.currentYear ? ` (${user.currentYear})` : ''}</span>}
            </div>

            {/* bio */}
            {user.bio && <p className="text-blue-100 text-sm mb-3 max-w-lg leading-relaxed">{user.bio}</p>}

            {/* badges row */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" /> Level 6
              </span>
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                <Flame className="h-3 w-3 text-orange-300" /> {MOCK_STATS.streak} Day Streak
              </span>
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                <Activity className="h-3 w-3 text-green-300" /> Member since {memberYear}
              </span>
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                <CheckCircle className="h-3 w-3 text-blue-200" /> Last active 2h ago
              </span>
            </div>

            {/* social icons */}
            <div className="flex gap-2 mt-3">
              {user.linkedinUrl && <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                <Linkedin className="h-3.5 w-3.5 text-white" /></a>}
              {user.githubUrl && <a href={user.githubUrl} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                <Github className="h-3.5 w-3.5 text-white" /></a>}
              {user.portfolioUrl && <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                <Globe className="h-3.5 w-3.5 text-white" /></a>}
            </div>
          </div>

          {/* Right column: completion + edit */}
          <div className="flex flex-col items-end gap-4 md:ml-auto">
            <Link to="/dashboard/profile/edit">
              <Button size="sm" className="bg-white text-[#2563EB] hover:bg-blue-50 gap-2 font-semibold shadow-lg">
                <Edit className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            </Link>
            {/* Profile completion */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-3">
              <div className="relative">
                <CircularProgress value={completion} size={72} stroke={6} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{completion}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-200">Profile Completion</p>
                <p className="text-sm font-bold text-white">{completionLabel}</p>
                {/* XP mini bar */}
                <div className="mt-1.5">
                  <div className="text-[10px] text-blue-200 mb-0.5">650 / 1000 XP</div>
                  <div className="h-1.5 w-24 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-green-400" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ProfilePage export ───────────────────────────────────────────────────
export function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5MB'); return }
    setUploading(true)
    try {
      const res = await profileService.uploadAvatar(file)
      updateUser({ profileImage: res.data.data.avatarUrl })
    } catch { alert('Failed to upload image.') }
    finally { setUploading(false) }
  }

  const handleCopyLink = () => {
    const username = user.fullName?.toLowerCase().replace(/\s+/g, '') || 'user'
    navigator.clipboard.writeText(`https://campusrank.dev/u/${username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut', delay },
  })

  return (
    <div className="min-h-screen" style={{ background: '#070B17' }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Section 1 — Hero Banner */}
        <motion.div {...fadeUp(0)}>
          <HeroBanner user={user} onAvatarChange={handleAvatarChange} uploading={uploading} />
        </motion.div>

        {/* Section 2 — Quick Actions */}
        <motion.div {...fadeUp(0.05)}>
          <QuickActionCards user={user} onCopyLink={handleCopyLink} copied={copied} />
        </motion.div>

        {/* Section 3 — Statistics */}
        <motion.div {...fadeUp(0.1)}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard icon={Code2} label="Questions Solved" value={MOCK_STATS.questionsSolved} delta={MOCK_STATS.questionsDelta} color="bg-[#6C5CE7]/15 text-[#a78bfa]" />
            <StatCard icon={FolderOpen} label="Projects" value={MOCK_STATS.projects} delta={MOCK_STATS.projectsDelta} color="bg-emerald-500/15 text-emerald-400" />
            <StatCard icon={BookOpen} label="Roadmaps" value={MOCK_STATS.roadmaps} delta={MOCK_STATS.roadmapsDelta} color="bg-blue-500/15 text-blue-400" />
            <StatCard icon={Zap} label="XP Points" value={MOCK_STATS.xp} delta={MOCK_STATS.xpDelta} color="bg-yellow-500/15 text-yellow-400" />
            <StatCard icon={Flame} label="Current Streak" value={MOCK_STATS.streak} delta={MOCK_STATS.streakDelta} color="bg-orange-500/15 text-orange-400" />
          </div>
        </motion.div>

        {/* Section 4-5-7: Main grid — Leaderboard | Coding | Recent Projects */}
        <motion.div {...fadeUp(0.15)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LeaderboardCard user={user} />
            <CodingCard />
            <RecentProjectsCard />
          </div>
        </motion.div>

        {/* Section 8-9-13: Bottom grid — Socials | Achievements | Activity */}
        <motion.div {...fadeUp(0.2)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SocialsCard user={user} />
            <AchievementsCard />
            <ActivityCard />
          </div>
        </motion.div>

        {/* Section 6: Learning Progress (full width) */}
        <motion.div {...fadeUp(0.25)}>
          <LearningCard />
        </motion.div>

        {/* Footer quote */}
        <motion.div {...fadeUp(0.3)}>
          <div className="rounded-xl p-4 bg-gradient-to-r from-[#6C5CE7]/20 to-[#2563EB]/20 border border-[#6C5CE7]/20 flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-slate-300 italic">
              "Keep learning, keep building, and you'll grow every day." 🌱
            </p>
            <div className="ml-auto flex gap-3">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors">
                <Linkedin className="h-3 w-3 text-slate-300" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors">
                <Hash className="h-3 w-3 text-slate-300" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors">
                <AtSign className="h-3 w-3 text-slate-300" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors">
                <Github className="h-3 w-3 text-slate-300" />
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
