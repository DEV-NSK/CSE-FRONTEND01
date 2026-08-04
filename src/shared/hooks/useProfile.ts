/**
 * FPRD-23: useProfile hook
 * React Query + Zustand integration for profile data.
 * Invalidates cache and updates authStore on mutation so all components update instantly.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService, UpdateProfilePayload } from '@/shared/services/profile.service'
import { useAuthStore } from '@/shared/store/authStore'
import { toast } from '@/shared/hooks/useToast'
import type { User } from '@/types'

export const PROFILE_QUERY_KEY = ['profile', 'me'] as const

export function useProfile() {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()

  // Fetch own profile
  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const res = await profileService.getProfile()
      const data = res.data.data
      // Keep authStore in sync
      updateUser(data)
      return data
    },
    staleTime: 1000 * 60 * 2, // 2 min
    refetchOnWindowFocus: true,
  })

  // Update profile
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: (res) => {
      const updated = res.data.data
      updateUser(updated)
      queryClient.setQueryData(PROFILE_QUERY_KEY, updated)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      toast({ title: 'Profile updated' })
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message ?? 'Failed to update profile', variant: 'destructive' })
    },
  })

  // Upload avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      profileService.uploadAvatar(file, onProgress),
    onSuccess: (res) => {
      const avatarUrl = res.data.data.avatarUrl
      updateUser({ profileImage: avatarUrl })
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      toast({ title: 'Avatar updated' })
    },
    onError: () => {
      toast({ title: 'Avatar upload failed. Please retry.', variant: 'destructive' })
    },
  })

  // Delete avatar
  const deleteAvatarMutation = useMutation({
    mutationFn: () => profileService.deleteAvatar(),
    onSuccess: () => {
      updateUser({ profileImage: undefined })
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      toast({ title: 'Avatar removed' })
    },
  })

  // Upload resume
  const uploadResumeMutation = useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      profileService.uploadResume(file, onProgress),
    onSuccess: (res) => {
      const { resumeUrl, resumeFileName, resumeUploadedAt } = res.data.data
      updateUser({ resumeUrl, resumeFileName, resumeUploadedAt })
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['profile', 'resume'] })
      toast({ title: 'Resume uploaded' })
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message ?? 'Resume upload failed.', variant: 'destructive' })
    },
  })

  // Delete resume
  const deleteResumeMutation = useMutation({
    mutationFn: () => profileService.deleteResume(),
    onSuccess: () => {
      updateUser({ resumeUrl: undefined, resumeFileName: undefined, resumeUploadedAt: undefined })
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['profile', 'resume'] })
      toast({ title: 'Resume deleted' })
    },
  })

  // Update privacy
  const updatePrivacyMutation = useMutation({
    mutationFn: (visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE') =>
      profileService.updatePrivacy(visibility),
    onSuccess: (res) => {
      const updated = res.data.data
      updateUser(updated as Partial<User>)
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      toast({ title: 'Privacy settings updated' })
    },
  })

  // Profile completion
  const completionQuery = useQuery({
    queryKey: ['profile', 'completion'],
    queryFn: () => profileService.getCompletion().then((r) => r.data.data),
    staleTime: 1000 * 60,
  })

  // Activity
  const activityQuery = useQuery({
    queryKey: ['profile', 'activity'],
    queryFn: () => profileService.getActivity().then((r) => r.data.data),
    staleTime: 1000 * 60,
  })

  // Analytics
  const analyticsQuery = useQuery({
    queryKey: ['profile', 'analytics'],
    queryFn: () => profileService.getAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })

  // Projects
  const projectsQuery = useQuery({
    queryKey: ['profile', 'projects'],
    queryFn: () => profileService.getProjects().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })

  // Achievements
  const achievementsQuery = useQuery({
    queryKey: ['profile', 'achievements'],
    queryFn: () => profileService.getAchievements().then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  })

  return {
    // Data
    profile: profileQuery.data ?? user,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,

    // Completion
    completion: completionQuery.data,

    // Activity
    activity: activityQuery.data ?? [],
    isActivityLoading: activityQuery.isLoading,

    // Analytics
    analytics: analyticsQuery.data,

    // Projects
    projects: projectsQuery.data ?? [],

    // Achievements
    achievements: achievementsQuery.data ?? [],

    // Mutations
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    uploadAvatar: (file: File, onProgress?: (pct: number) => void) =>
      uploadAvatarMutation.mutateAsync({ file, onProgress }),
    isUploadingAvatar: uploadAvatarMutation.isPending,

    deleteAvatar: () => deleteAvatarMutation.mutateAsync(),
    isDeletingAvatar: deleteAvatarMutation.isPending,

    uploadResume: (file: File, onProgress?: (pct: number) => void) =>
      uploadResumeMutation.mutateAsync({ file, onProgress }),
    isUploadingResume: uploadResumeMutation.isPending,

    deleteResume: () => deleteResumeMutation.mutateAsync(),
    isDeletingResume: deleteResumeMutation.isPending,

    updatePrivacy: updatePrivacyMutation.mutateAsync,
    isUpdatingPrivacy: updatePrivacyMutation.isPending,

    // Refresh all profile data
    refresh: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  }
}

/** Hook for public profile (no auth required) */
export function usePublicProfile(username: string) {
  return useQuery({
    queryKey: ['profile', 'public', username],
    queryFn: () => profileService.getPublicProfile(username).then((r) => r.data.data),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}
