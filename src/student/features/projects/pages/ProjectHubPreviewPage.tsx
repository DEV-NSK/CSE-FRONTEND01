/**
 * ProjectHubPreviewPage — /dashboard/projects/:slug
 *
 * A lightweight CAMPUSRANK-native project preview.
 * Shows public metadata from Project Hub without reproducing the
 * full Project Hub showcase experience.
 *
 * The canonical full project experience remains at:
 *   PROJECT_HUB_URL/showcase/:slug
 *
 * "View Full Project" CTA opens that URL in a new tab.
 */

import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ExternalLink, Users, Clock, Globe,
  GitBranch, BarChart2, FolderOpen, Share2, Copy, Check,
} from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { usePublicProject } from '@/shared/hooks/useProjectHub'
import {
  getProjectHubShowcaseUrl,
  getProjectHubCreateUrl,
} from '@/shared/lib/projectHub.config'
import { getInitials } from '@/shared/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectHubPreviewPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const { data, isLoading, isError, error } = usePublicProject(slug)

  const project = data?.project

  const showcaseUrl = slug ? getProjectHubShowcaseUrl(slug) : ''

  const openShowcase = () => {
    const win = window.open(showcaseUrl, '_blank', 'noopener,noreferrer')
    if (win) win.opener = null
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may be unavailable; silently ignore
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        {/* Back link */}
        <Link
          to="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Projects
        </Link>

        {/* Skeleton */}
        <div className="animate-pulse space-y-4">
          <div className="h-56 rounded-2xl bg-muted" />
          <div className="h-6 w-1/2 bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-muted rounded-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── 404 / Error ───────────────────────────────────────────────────────────────
  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status
    return (
      <div className="space-y-6 pb-8">
        <Link
          to="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Projects
        </Link>
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
          <h1 className="text-xl font-bold text-foreground">
            {status === 404 ? 'Project not found' : 'Unable to load project'}
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            {status === 404
              ? 'This project may have been made private, archived, or may not exist.'
              : 'Project Hub may be temporarily unavailable. Please try again later.'}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/dashboard/projects">
                <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
                All Projects
              </Link>
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!project) return null

  const teamList = project.team ?? []

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-8"
    >
      {/* ── Back navigation ── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Projects
        </button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={copyLink}
            aria-label="Copy page link"
          >
            {copied
              ? <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openShowcase}>
            View Full Project
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* ── Hero image ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden h-52 sm:h-64 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/15"
      >
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={`${project.name} cover image`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="h-16 w-16 text-primary/20" aria-hidden="true" />
          </div>
        )}

        {/* Progress overlay badge */}
        {project.progress !== null && project.progress !== undefined && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-background/90 text-foreground backdrop-blur-sm shadow border-0 gap-1.5">
              <BarChart2 className="h-3 w-3" aria-hidden="true" />
              {project.progress}% complete
            </Badge>
          </div>
        )}
      </motion.div>

      {/* ── Two-column layout on desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — spans 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title + description */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">
              {project.name}
            </h1>
            {(project.description || project.shortDescription) && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description ?? project.shortDescription}
              </p>
            )}
          </motion.div>

          {/* Goals */}
          {project.goals && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Goals</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.goals}
              </CardContent>
            </Card>
          )}

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">
                Technology Stack
              </h2>
              <div className="flex flex-wrap gap-2" aria-label="Technologies used">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs px-2.5 py-0.5">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(project.liveUrl || project.githubUrl) && (
            <div className="flex flex-wrap gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  Live Demo
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  <GitBranch className="h-4 w-4" aria-hidden="true" />
                  GitHub
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              )}
            </div>
          )}

          {/* Full project CTA — bottom of main content */}
          <Card className="bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border-violet-200/30 dark:border-violet-800/30">
            <CardContent className="py-5 flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
              <div>
                <p className="font-semibold text-sm">See the full project on Project Hub</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tasks, team workspace, GitHub, deployments, and public showcase.
                </p>
              </div>
              <Button size="sm" className="gap-1.5 shrink-0" onClick={openShowcase}>
                View Full Project
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-4">
          {/* Owner card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Owner</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage
                    src={project.owner.avatarUrl ?? undefined}
                    alt={project.owner.displayName}
                  />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                    {getInitials(project.owner.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {project.owner.displayName}
                  </p>
                  {project.owner.username && (
                    <Link
                      to={`/u/${encodeURIComponent(project.owner.username)}`}
                      className="text-xs text-primary hover:underline truncate block"
                    >
                      @{project.owner.username}
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meta stats */}
          <Card>
            <CardContent className="py-4 space-y-3">
              {project.teamSize !== null && project.teamSize !== undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{project.teamSize} team member{project.teamSize !== 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Updated {formatDate(project.updatedAt)}</span>
              </div>
              {project.progress !== null && project.progress !== undefined && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                      role="progressbar"
                      aria-valuenow={project.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${project.progress}% complete`}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team members */}
          {teamList.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                  Team
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {teamList.map((member) => (
                  <div key={member.username} className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage
                        src={member.avatarUrl ?? undefined}
                        alt={member.displayName}
                      />
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                        {getInitials(member.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-foreground truncate">
                      {member.displayName}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* View on Project Hub */}
          <Button
            variant="outline"
            className="w-full gap-1.5"
            onClick={openShowcase}
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Open on Project Hub
            <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
