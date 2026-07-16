import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '@/shared/services/project.service'
import type {
  ProjectFilters,
  CreateTeamPayload,
  UpdateTeamPayload,
  TeamMemberRole,
  SendInvitationPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  CreateMilestonePayload,
  UpdateMilestonePayload,
} from '@/shared/types/project'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const projectKeys = {
  all: ['projects'] as const,
  categories: () => [...projectKeys.all, 'categories'] as const,
  technologies: () => [...projectKeys.all, 'technologies'] as const,
  list: (filters?: ProjectFilters) => [...projectKeys.all, 'list', filters] as const,
  project: (id: string) => [...projectKeys.all, 'detail', id] as const,
  myTeams: () => [...projectKeys.all, 'myTeams'] as const,
  team: (id: string) => [...projectKeys.all, 'team', id] as const,
  invitations: (type: 'sent' | 'received') => [...projectKeys.all, 'invitations', type] as const,
  tasks: (filters?: TaskFilters) => [...projectKeys.all, 'tasks', filters] as const,
  taskComments: (taskId: string) => [...projectKeys.all, 'taskComments', taskId] as const,
  milestones: (params?: object) => [...projectKeys.all, 'milestones', params] as const,
  files: (projectId: string) => [...projectKeys.all, 'files', projectId] as const,
  activity: (teamId: string, params?: object) =>
    [...projectKeys.all, 'activity', teamId, params] as const,
  dashboard: () => [...projectKeys.all, 'dashboard'] as const,
}

// ─── Categories & Technologies ────────────────────────────────────────────────

export function useProjectCategories() {
  return useQuery({
    queryKey: projectKeys.categories(),
    queryFn: () => projectService.getProjectCategories().then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })
}

export function useProjectTechnologies() {
  return useQuery({
    queryKey: projectKeys.technologies(),
    queryFn: () => projectService.getProjectTechnologies().then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => projectService.getProjects(filters).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.project(id),
    queryFn: () => projectService.getProjectById(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export function useMyTeams() {
  return useQuery({
    queryKey: projectKeys.myTeams(),
    queryFn: () => projectService.getMyTeams().then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: projectKeys.team(id),
    queryFn: () => projectService.getTeamById(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => projectService.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.myTeams() })
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTeamPayload }) =>
      projectService.updateTeam(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.team(vars.id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.myTeams() })
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.myTeams() })
    },
  })
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export function useAddTeamMember(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role?: TeamMemberRole }) =>
      projectService.addTeamMember(teamId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.team(teamId) })
    },
  })
}

export function useRemoveTeamMember(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => projectService.removeTeamMember(teamId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.team(teamId) })
    },
  })
}

export function useUpdateTeamMemberRole(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: TeamMemberRole }) =>
      projectService.updateTeamMemberRole(teamId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.team(teamId) })
    },
  })
}

// ─── Invitations ──────────────────────────────────────────────────────────────

export function useMyInvitations(type: 'sent' | 'received' = 'received') {
  return useQuery({
    queryKey: projectKeys.invitations(type),
    queryFn: () => projectService.getMyInvitations(type).then((r) => r.data.data),
    staleTime: 1000 * 60 * 1,
  })
}

export function useSendInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SendInvitationPayload) => projectService.sendInvitation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.invitations('sent') })
    },
  })
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) =>
      projectService.respondToInvitation(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.invitations('received') })
      queryClient.invalidateQueries({ queryKey: projectKeys.myTeams() })
      queryClient.invalidateQueries({ queryKey: projectKeys.dashboard() })
    },
  })
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: projectKeys.tasks(filters),
    queryFn: () => projectService.getTasks(filters).then((r) => r.data.data),
    enabled: !!filters?.teamId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => projectService.createTask(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks({ teamId: vars.teamId }) })
      queryClient.invalidateQueries({ queryKey: projectKeys.dashboard() })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload; teamId: string }) =>
      projectService.updateTask(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks({ teamId: vars.teamId }) })
      queryClient.invalidateQueries({ queryKey: projectKeys.dashboard() })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, teamId }: { id: string; teamId: string }) =>
      projectService.deleteTask(id),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks({ teamId: vars.teamId }) })
    },
  })
}

// ─── Task Comments ────────────────────────────────────────────────────────────

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: projectKeys.taskComments(taskId),
    queryFn: () => projectService.getTaskComments(taskId).then((r) => r.data.data),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 1,
  })
}

export function useAddTaskComment(taskId: string, teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => projectService.addTaskComment(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.taskComments(taskId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks({ teamId }) })
    },
  })
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export function useMilestones(params?: { projectId?: string; status?: string }) {
  return useQuery({
    queryKey: projectKeys.milestones(params),
    queryFn: () => projectService.getMilestones(params).then((r) => r.data.data),
    enabled: !!params?.projectId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMilestonePayload) => projectService.createMilestone(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.milestones({ projectId: vars.projectId }),
      })
    },
  })
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateMilestonePayload
      projectId?: string
    }) => projectService.updateMilestone(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.milestones({ projectId: vars.projectId }),
      })
    },
  })
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId?: string }) =>
      projectService.deleteMilestone(id),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.milestones({ projectId: vars.projectId }),
      })
    },
  })
}

// ─── Files ────────────────────────────────────────────────────────────────────

export function useProjectFiles(projectId: string) {
  return useQuery({
    queryKey: projectKeys.files(projectId),
    queryFn: () => projectService.getProjectFiles(projectId).then((r) => r.data.data),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUploadProjectFile(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) =>
      projectService.uploadProjectFile(projectId, file, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.files(projectId) })
    },
  })
}

export function useDeleteProjectFile(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fileId: string) => projectService.deleteProjectFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.files(projectId) })
    },
  })
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export function useTeamActivity(teamId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: projectKeys.activity(teamId, params),
    queryFn: () => projectService.getTeamActivity(teamId, params).then((r) => r.data.data),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 1,
  })
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useProjectDashboard() {
  return useQuery({
    queryKey: projectKeys.dashboard(),
    queryFn: () => projectService.getProjectDashboard().then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  })
}
