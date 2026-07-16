import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Edit, GitBranch, Link2, Globe, Mail, Phone, GraduationCap, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Separator } from '@/shared/components/ui/separator'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { useAuthStore } from '@/shared/store/authStore'
import { getInitials } from '@/shared/lib/utils'

export function ProfilePage() {
  const { user } = useAuthStore()

  if (!user) return null

  const profileItems = [
    { icon: Mail, label: 'Email', value: user.email },
    user.phone ? { icon: Phone, label: 'Phone', value: user.phone } : null,
    user.college ? { icon: GraduationCap, label: 'College', value: user.college } : null,
    user.branch ? { icon: GraduationCap, label: 'Branch', value: user.branch } : null,
    user.year ? { icon: Calendar, label: 'Year', value: `Year ${user.year}` } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string }>

  const socialLinks = [
    user.github ? { icon: GitBranch, label: 'GitHub', value: user.github, href: user.github } : null,
    user.linkedin ? { icon: Link2, label: 'LinkedIn', value: user.linkedin, href: user.linkedin } : null,
    user.website ? { icon: Globe, label: 'Website', value: user.website, href: user.website } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string; href: string }>

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Profile"
        description="View and manage your profile information"
        breadcrumbs={[{ label: 'Profile' }]}
        actions={
          <Button asChild size="sm" className="gap-2">
            <Link to="/dashboard/profile/edit">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={user.profileImage} alt={user.fullName} />
                    <AvatarFallback className="text-2xl">{getInitials(user.fullName)}</AvatarFallback>
                  </Avatar>
                  {user.isVerified && (
                    <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-success border-2 border-background flex items-center justify-center" title="Email verified">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-1">
                    <h2 className="text-xl font-bold text-foreground">{user.fullName}</h2>
                    <Badge variant="secondary">{user.role}</Badge>
                    {!user.isVerified && (
                      <Badge variant="warning">Email unverified</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                  {user.bio && (
                    <p className="text-sm text-foreground leading-relaxed max-w-lg">{user.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileItems.map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                )
              })}
              {profileItems.length === 1 && (
                <p className="text-sm text-muted-foreground">
                  Add more details to your profile.{' '}
                  <Link to="/dashboard/profile/edit" className="text-primary hover:underline">Edit profile</Link>
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Social links */}
        {socialLinks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {socialLinks.map((link, i) => {
                  const Icon = link.icon
                  return (
                    <a
                      key={i}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{link.label}</p>
                        <p className="text-sm font-medium text-primary group-hover:underline truncate max-w-[200px]">{link.value}</p>
                      </div>
                    </a>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
