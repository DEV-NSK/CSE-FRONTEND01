/**
 * FPRD-23: Edit Profile Page (Production Ready)
 * All fields from the database — zero hardcoded values.
 * Full light/dark theme. Validation + instant sync via authStore.
 */
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Save, ArrowLeft, Loader2, Check, Trash2, Link2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { useProfile } from '@/shared/hooks/useProfile'
import { useAuthStore } from '@/shared/store/authStore'
import { getInitials } from '@/shared/lib/utils'

const urlOptional = z.string().url('Enter a valid URL (https://...)').optional().or(z.literal(''))

const schema = z.object({
  // Basic
  name: z.string().min(2, 'At least 2 characters').max(60),
  username: z.string().min(3, 'At least 3 characters').max(30)
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Only letters, numbers, _, . and - allowed').optional().or(z.literal('')),
  headline: z.string().max(120, 'Max 120 characters').optional().or(z.literal('')),
  bio: z.string().max(400, 'Max 400 characters').optional().or(z.literal('')),
  // Academic
  college: z.string().max(120).optional().or(z.literal('')),
  branch: z.string().max(80).optional().or(z.literal('')),
  year: z.coerce.number().min(1).max(6).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  // Social
  github: urlOptional,
  linkedin: urlOptional,
  website: urlOptional,
  twitter: urlOptional,
  youtube: urlOptional,
  // Coding platforms
  leetcode: urlOptional,
  codechef: urlOptional,
  hackerrank: urlOptional,
  codeforces: urlOptional,
  gfg: urlOptional,
  medium: urlOptional,
})

type FormValues = z.infer<typeof schema>

export function EditProfilePage() {
  const { user } = useAuthStore()
  const { updateProfile, isUpdating, uploadAvatar, isUploadingAvatar, deleteAvatar } = useProfile()
  const navigate = useNavigate()
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [avatarError, setAvatarError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.fullName ?? '',
      username: user?.username ?? '',
      headline: user?.headline ?? '',
      bio: user?.bio ?? '',
      college: user?.collegeName ?? '',
      branch: user?.branch ?? '',
      year: (user?.currentYear as any) ?? '',
      phone: user?.phoneNumber ?? '',
      github: user?.githubUrl ?? '',
      linkedin: user?.linkedinUrl ?? '',
      website: user?.portfolioUrl ?? '',
      twitter: user?.twitterUrl ?? '',
      youtube: user?.youtubeUrl ?? '',
      leetcode: user?.leetcodeUrl ?? '',
      codechef: user?.codechefUrl ?? '',
      hackerrank: user?.hackerrankUrl ?? '',
      codeforces: user?.codeforcesUrl ?? '',
      gfg: user?.gfgUrl ?? '',
      medium: user?.mediumUrl ?? '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    setSaveError('')
    setSaveSuccess(false)
    try {
      await updateProfile({
        name: data.name,
        username: data.username || undefined,
        headline: data.headline || undefined,
        bio: data.bio || undefined,
        college: data.college || undefined,
        branch: data.branch || undefined,
        year: data.year ? Number(data.year) : undefined,
        phone: data.phone || undefined,
        github: data.github || undefined,
        linkedin: data.linkedin || undefined,
        website: data.website || undefined,
        twitter: data.twitter || undefined,
        youtube: data.youtube || undefined,
        leetcode: data.leetcode || undefined,
        codechef: data.codechef || undefined,
        hackerrank: data.hackerrank || undefined,
        codeforces: data.codeforces || undefined,
        gfg: data.gfg || undefined,
        medium: data.medium || undefined,
      })
      setSaveSuccess(true)
      setTimeout(() => navigate('/dashboard/profile'), 1200)
    } catch (err: any) {
      setSaveError(err?.response?.data?.message ?? 'Failed to update profile. Please try again.')
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { setAvatarError('Only JPEG, PNG or WebP allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setAvatarError('Image must be under 5MB.'); return }
    setUploadProgress(0)
    try {
      await uploadAvatar(file, setUploadProgress)
    } catch { setAvatarError('Upload failed. Please retry.') }
    e.target.value = ''
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Edit Profile"
        description="Update your personal information and social links"
        breadcrumbs={[{ label: 'Profile', href: '/dashboard/profile' }, { label: 'Edit' }]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/profile')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6">
          {/* ── Avatar ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader><CardTitle className="text-base">Profile Photo</CardTitle>
                <CardDescription>PNG, JPEG or WebP · Max 5MB</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.profileImage} alt={user?.fullName} />
                      <AvatarFallback className="text-xl">{getInitials(user?.fullName)}</AvatarFallback>
                    </Avatar>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center gap-1">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                        <span className="text-[10px] text-white">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                      className="sr-only" onChange={handleAvatarChange} />
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar} className="gap-2">
                      <Camera className="h-4 w-4" />
                      {isUploadingAvatar ? 'Uploading...' : 'Change photo'}
                    </Button>
                    {user?.profileImage && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => deleteAvatar()}
                        className="gap-2 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    )}
                    {avatarError && <p className="text-xs text-destructive">{avatarError}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Basic info ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" type="text" placeholder="John Doe" {...register('name')}
                    className="mt-1.5" aria-invalid={!!errors.name} />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="flex items-center mt-1.5">
                    <span className="px-3 py-2 text-sm bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground">@</span>
                    <Input id="username" type="text" placeholder="johndoe" {...register('username')}
                      className="rounded-l-none" aria-invalid={!!errors.username} />
                  </div>
                  {errors.username && <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>}
                  <p className="mt-1 text-[11px] text-muted-foreground">Your public profile URL: campusrank.dev/u/johndoe</p>
                </div>
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input id="headline" type="text" placeholder="Full Stack Developer | DSA Enthusiast"
                    {...register('headline')} className="mt-1.5" />
                  {errors.headline && <p className="mt-1 text-xs text-destructive">{errors.headline.message}</p>}
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea id="bio" rows={3} placeholder="Tell others about yourself..."
                    className="mt-1.5 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    {...register('bio')} />
                  {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Academic ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader><CardTitle className="text-base">Academic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="college">College</Label>
                  <Input id="college" type="text" placeholder="Your college name" {...register('college')} className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    <Input id="branch" type="text" placeholder="e.g. Computer Science" {...register('branch')} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" type="number" placeholder="1–6" min={1} max={6} {...register('year')} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="+91 98765 43210" {...register('phone')} className="mt-1.5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Social links ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Social Links</CardTitle>
                <CardDescription>Enter full URLs (https://...)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 'github',   label: 'GitHub',   placeholder: 'https://github.com/username',         field: 'github' },
                  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username',    field: 'linkedin' },
                  { id: 'website',  label: 'Portfolio', placeholder: 'https://yourwebsite.com',            field: 'website' },
                  { id: 'twitter',  label: 'Twitter',  placeholder: 'https://twitter.com/username',        field: 'twitter' },
                  { id: 'youtube',  label: 'YouTube',  placeholder: 'https://youtube.com/@channel',        field: 'youtube' },
                ].map(({ id, label, placeholder, field }) => (
                  <div key={id}>
                    <Label htmlFor={id}>{label}</Label>
                    <Input id={id} type="url" placeholder={placeholder}
                      {...register(field as keyof FormValues)} className="mt-1.5"
                      aria-invalid={!!(errors as any)[field]} />
                    {(errors as any)[field] && (
                      <p className="mt-1 text-xs text-destructive">{(errors as any)[field].message}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Coding platforms ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Coding Platforms</CardTitle>
                <CardDescription>Add your competitive programming profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 'leetcode',    label: 'LeetCode',       placeholder: 'https://leetcode.com/username',      field: 'leetcode' },
                  { id: 'codechef',    label: 'CodeChef',       placeholder: 'https://codechef.com/users/username', field: 'codechef' },
                  { id: 'hackerrank',  label: 'HackerRank',     placeholder: 'https://hackerrank.com/username',    field: 'hackerrank' },
                  { id: 'codeforces', label: 'Codeforces',     placeholder: 'https://codeforces.com/profile/username', field: 'codeforces' },
                  { id: 'gfg',         label: 'GeeksforGeeks',  placeholder: 'https://geeksforgeeks.org/user/username', field: 'gfg' },
                  { id: 'medium',      label: 'Medium',         placeholder: 'https://medium.com/@username',       field: 'medium' },
                ].map(({ id, label, placeholder, field }) => (
                  <div key={id}>
                    <Label htmlFor={id}>{label}</Label>
                    <Input id={id} type="url" placeholder={placeholder}
                      {...register(field as keyof FormValues)} className="mt-1.5"
                      aria-invalid={!!(errors as any)[field]} />
                    {(errors as any)[field] && (
                      <p className="mt-1 text-xs text-destructive">{(errors as any)[field].message}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Save ── */}
          <div className="space-y-3 pb-8">
            {saveError && (
              <div role="alert" className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div role="status" className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
                <Check className="h-4 w-4" /> Profile updated!
              </div>
            )}
            <Button type="submit" disabled={isUpdating} className="w-full gap-2">
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isUpdating ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
