/**
 * FPRD-23 Part 5: Public Profile Page
 * Route: /u/:username
 * No auth required. Shows public-safe fields only.
 * Private info (email, phone, etc.) is never shown.
 */
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle, GraduationCap, BookOpen, Globe,
  ExternalLink, Code2, FileText, MapPin, Lock, Users, Eye,
  ArrowLeft, Share2, Copy, Check,
  X as XIcon, PlayCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { usePublicProfile } from '@/shared/hooks/useProfile'
import { useAuthStore } from '@/shared/store/authStore'
import { getInitials } from '@/shared/lib/utils'

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { data: profile, isLoading, isError, error } = usePublicProfile(username ?? '')
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError) {
    const status = (error as any)?.response?.status
    if (status === 403) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
          <Lock className="h-12 w-12 text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">This profile is private</h1>
          <p className="text-sm text-muted-foreground text-center">The owner has set this profile to private.</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-xl font-bold text-foreground">Profile not found</h1>
        <p className="text-sm text-muted-foreground">No profile found for @{username}</p>
        <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Go Home
        </Button>
      </div>
    )
  }

  if (!profile) return null

  const socials = [
    profile.linkedinUrl && { label: 'LinkedIn', url: profile.linkedinUrl, icon: LinkedinIcon, color: '#0077b5' },
    profile.githubUrl && { label: 'GitHub', url: profile.githubUrl, icon: GithubIcon, color: '#6e5494' },
    profile.portfolioUrl && { label: 'Portfolio', url: profile.portfolioUrl, icon: Globe, color: '#22c55e' },
    profile.twitterUrl && { label: 'Twitter', url: profile.twitterUrl, icon: XIcon, color: '#1da1f2' },
    profile.youtubeUrl && { label: 'YouTube', url: profile.youtubeUrl, icon: PlayCircle, color: '#ff0000' },
    profile.leetcodeUrl && { label: 'LeetCode', url: profile.leetcodeUrl, icon: Code2, color: '#ffa116' },
    profile.gfgUrl && { label: 'GFG', url: profile.gfgUrl, icon: Code2, color: '#2f8d46' },
    profile.mediumUrl && { label: 'Medium', url: profile.mediumUrl, icon: FileText, color: '#000' },
  ].filter(Boolean) as Array<{ label: string; url: string; icon: React.ElementType; color: string }>

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-sm text-foreground">CAMPUSRANK</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            {!isAuthenticated && (
              <Button asChild size="sm">
                <Link to="/auth/register">Join CAMPUSRANK</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary via-primary/80 to-secondary" />
            <CardContent className="pt-0 pb-6 px-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start -mt-12">
                <Avatar className="h-24 w-24 border-4 border-card ring-2 ring-border">
                  <AvatarImage src={profile.profileImage ?? undefined} alt={profile.fullName} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(profile.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pt-12 sm:pt-14 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-foreground">{profile.fullName}</h1>
                    {profile.isVerified && (
                      <span className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  {profile.headline && <p className="text-sm font-medium text-muted-foreground mb-2">{profile.headline}</p>}
                  {profile.bio && <p className="text-sm text-muted-foreground leading-relaxed mb-3 max-w-lg">{profile.bio}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {profile.collegeName && <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{profile.collegeName}</span>}
                    {profile.branch && <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{profile.branch}</span>}
                    {profile.currentYear && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Year {profile.currentYear}</span>}
                    <span className="text-muted-foreground/50">Member since {new Date(profile.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social links */}
        {socials.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Links</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted/50 transition-colors">
                    <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                    {s.label}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA for non-logged in users */}
        {!isAuthenticated && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="py-6 text-center">
                <h2 className="text-lg font-bold text-foreground mb-2">Build your own profile on CAMPUSRANK</h2>
                <p className="text-sm text-muted-foreground mb-4">Track your coding progress, showcase projects, and get placed.</p>
                <div className="flex justify-center gap-3">
                  <Button asChild><Link to="/auth/register">Create Account</Link></Button>
                  <Button asChild variant="outline"><Link to="/auth/login">Sign In</Link></Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
