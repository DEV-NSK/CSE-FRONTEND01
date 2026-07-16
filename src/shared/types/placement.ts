// ─── Placement Ecosystem Types (FPRD-05) ─────────────────────────────────────

// ─── Company ─────────────────────────────────────────────────────────────────

export interface Company {
  id: string
  name: string
  logo?: string
  industry: string
  headquarters?: string
  description?: string
  website?: string
  careersLink?: string
  isVerified: boolean
  openJobsCount: number
  technologies?: string[]
  createdAt: string
  updatedAt: string
}

export interface CompanyListItem {
  id: string
  name: string
  logo?: string
  industry: string
  headquarters?: string
  isVerified: boolean
  openJobsCount: number
}

// ─── Job ─────────────────────────────────────────────────────────────────────

export type WorkMode = 'remote' | 'onsite' | 'hybrid'
export type JobType = 'full_time' | 'part_time' | 'internship' | 'contract'
export type ExperienceLevel = 'fresher' | 'junior' | 'mid' | 'senior'
export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'oa'
  | 'interview'
  | 'hr'
  | 'offered'
  | 'rejected'

export interface Job {
  id: string
  title: string
  company: CompanyListItem
  description: string
  requirements?: string
  skills: string[]
  salary?: string
  location: string
  workMode: WorkMode
  jobType: JobType
  experienceLevel: ExperienceLevel
  deadline?: string
  isSaved: boolean
  applicationStatus?: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export interface JobListItem {
  id: string
  title: string
  company: CompanyListItem
  skills: string[]
  salary?: string
  location: string
  workMode: WorkMode
  jobType: JobType
  experienceLevel: ExperienceLevel
  deadline?: string
  isSaved: boolean
  applicationStatus?: ApplicationStatus
  createdAt: string
}

// ─── Application ─────────────────────────────────────────────────────────────

export interface Application {
  id: string
  job: JobListItem
  status: ApplicationStatus
  notes?: string
  appliedAt?: string
  updatedAt: string
  createdAt: string
}

// ─── Resume ──────────────────────────────────────────────────────────────────

export type ResumeSectionType =
  | 'personal_info'
  | 'education'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'achievements'

export interface ResumeSection {
  id: string
  type: ResumeSectionType
  title: string
  content: Record<string, unknown>
  order: number
}

export interface Resume {
  id: string
  title: string
  template: string
  isDefault: boolean
  atsScore?: number
  sections: ResumeSection[]
  createdAt: string
  updatedAt: string
}

export interface ResumeTemplate {
  id: string
  name: string
  preview: string
  description?: string
  isPopular?: boolean
}

// ─── Placement Dashboard ─────────────────────────────────────────────────────

export interface PlacementStats {
  applicationsSent: number
  interviewsScheduled: number
  offersReceived: number
  resumeScore: number
  profileCompletion: number
  savedJobs: number
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface JobFilters {
  search: string
  company: string
  workMode: WorkMode | 'all'
  jobType: JobType | 'all'
  experienceLevel: ExperienceLevel | 'all'
  location: string
  status: ApplicationStatus | 'all'
  page: number
  limit: number
}

export interface CompanyFilters {
  search: string
  industry: string
  isVerified: boolean | null
  page: number
  limit: number
}
