import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Save, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Separator } from '@/shared/components/ui/separator'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { profileService } from '@/shared/services/profile.service'
import { useAuthStore } from '@/shared/store/authStore'
import { getInitials } from '@/shared/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional(),
  college: z.string().max(100).optional(),
  branch: z.string().max(100).optional(),
  year: z.coerce.number().min(1).max(6).optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  github: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export function EditProfilePage() {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.fullName || '',
      bio: user?.bio || '',
      college: user?.college || '',
      branch: user?.branch || '',
      year: user?.year || '',
      phone: user?.phoneNumber || '',
      github: user?.github || '',
      linkedin: user?.linkedin || '',
      website: user?.website || '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    setSaveError('')
    setSaveSuccess(false)
    try {
      const response = await profileService.updateProfile({
        name: data.name,
        bio: data.bio || undefined,
        college: data.college || undefined,
        branch: data.branch || undefined,
        year: data.year ? Number(data.year) : undefined,
        phone: data.phone || undefined,
        github: data.github || undefined,
        linkedin: data.linkedin || undefined,
        website: data.website || undefined,
      })
      updateUser(response.data.data)
      setSaveSuccess(true)
      setTimeout(() => navigate('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setSaveError(axiosError?.response?.data?.message || 'Failed to update profile. Please try again.')
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5MB'); return }

    setAvatarUploading(true)
    try {
      const response = await profileService.uploadAvatar(file)
      updateUser({ profileImage: response.data.data.avatarUrl })
    } catch {
      alert('Failed to upload image. Please try again.')
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Edit Profile"
        description="Update your personal information"
        breadcrumbs={[{ label: 'Profile', href: '/dashboard/profile' }, { label: 'Edit' }]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/profile')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6">
          {/* Avatar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.profileImage} alt={user?.fullName} />
                      <AvatarFallback className="text-xl">{getInitials(user?.fullName)}</AvatarFallback>
                    </Avatar>
                    {avatarUploading && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarChange}
                      aria-label="Upload profile photo"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      {avatarUploading ? 'Uploading...' : 'Change photo'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP. Max 5MB.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Basic info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Full Name *"
                  type="text"
                  placeholder="John Doe"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    placeholder="Tell others about yourself..."
                    className="mt-1.5 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    {...register('bio')}
                  />
                  {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Academic info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="College"
                  type="text"
                  placeholder="Your college name"
                  error={errors.college?.message}
                  {...register('college')}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Branch"
                    type="text"
                    placeholder="e.g. Computer Science"
                    error={errors.branch?.message}
                    {...register('branch')}
                  />
                  <Input
                    label="Year"
                    type="number"
                    placeholder="1-6"
                    min={1}
                    max={6}
                    error={errors.year?.message}
                    {...register('year')}
                  />
                </div>
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Social links */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="GitHub"
                  type="url"
                  placeholder="https://github.com/username"
                  error={errors.github?.message}
                  {...register('github')}
                />
                <Input
                  label="LinkedIn"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  error={errors.linkedin?.message}
                  {...register('linkedin')}
                />
                <Input
                  label="Website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  error={errors.website?.message}
                  {...register('website')}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Save */}
          <div className="flex flex-col gap-3">
            {saveError && (
              <div role="alert" className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">{saveError}</div>
            )}
            {saveSuccess && (
              <div role="status" className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">Profile updated successfully!</div>
            )}
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!isDirty && !isSubmitting}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
