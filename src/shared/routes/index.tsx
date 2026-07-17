import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PublicLayout } from "@/shared/components/layouts/PublicLayout";
import { AuthLayout } from "@/shared/components/layouts/AuthLayout";
import { DashboardLayout } from "@/student/layouts/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { useAuthStore } from "@/shared/store/authStore";
import { getDashboardPath } from "@/types";
import { PageLoader } from "@/shared/components/feedback/LoadingSpinner";

// ── Lazy-load role-specific layouts ───────────────────────────────────────────
const ManagerLayout = lazy(() =>
  import("@/manager/layouts/ManagerLayout").then((m) => ({ default: m.ManagerLayout }))
);
const AdminLayout = lazy(() =>
  import("@/admin/layouts/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);

// ── Lazy-load Manager pages ───────────────────────────────────────────────────
const ManagerDashboardPage = lazy(() => import("@/manager/pages/dashboard/ManagerDashboardPage"));
const ManagerLearningPage = lazy(() => import("@/manager/pages/learning/ManagerLearningPage"));
const ManagerCodingPage = lazy(() => import("@/manager/pages/coding/ManagerCodingPage"));
const ManagerProjectsPage = lazy(() => import("@/manager/pages/projects/ManagerProjectsPage"));
const ManagerPlacementsPage = lazy(() => import("@/manager/pages/placements/ManagerPlacementsPage"));
const ManagerEventsPage = lazy(() => import("@/manager/pages/events/ManagerEventsPage"));
const ManagerNotificationsPage = lazy(() => import("@/manager/pages/notifications/ManagerNotificationsPage"));
const ManagerReportsPage = lazy(() => import("@/manager/pages/reports/ManagerReportsPage"));
const ManagerProfilePage = lazy(() => import("@/manager/pages/profile/ManagerProfilePage"));
const ManagerSettingsPage = lazy(() => import("@/manager/pages/settings/ManagerSettingsPage"));

// ── Lazy-load Admin pages ─────────────────────────────────────────────────────
const AdminDashboardPage = lazy(() => import("@/admin/pages/dashboard/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("@/admin/pages/users/AdminUsersPage"));
const AdminManagersPage = lazy(() => import("@/admin/pages/managers/AdminManagersPage"));
const AdminPermissionsPage = lazy(() => import("@/admin/pages/permissions/AdminPermissionsPage"));
const AdminAnalyticsPage = lazy(() => import("@/admin/pages/analytics/AdminAnalyticsPage"));
const AdminPlatformPage = lazy(() => import("@/admin/pages/platform/AdminPlatformPage"));
const AdminAuditPage = lazy(() => import("@/admin/pages/audit/AdminAuditPage"));
const AdminSystemPage = lazy(() => import("@/admin/pages/system/AdminSystemPage"));
const AdminSettingsPage = lazy(() => import("@/admin/pages/settings/AdminSettingsPage"));
const AdminProfilePage = lazy(() => import("@/admin/pages/profile/AdminProfilePage"));

// ── Pages - Public ────────────────────────────────────────────────────────────
import { LandingPage } from "@/shared/pages/LandingPage";
import { AboutPage } from "@/shared/pages/AboutPage";
import { ContactPage } from "@/shared/pages/ContactPage";
import { FaqPage } from "@/shared/pages/FaqPage";

// ── Pages - Auth ──────────────────────────────────────────────────────────────
import { LoginPage } from "@/student/features/auth/pages/LoginPage";
import { RegisterPage } from "@/student/features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "@/student/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/student/features/auth/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/student/features/auth/pages/VerifyEmailPage";

// ── Pages - Dashboard (Student) ───────────────────────────────────────────────
import { DashboardPage } from "@/student/features/dashboard/pages/DashboardPage";
import { ProfilePage } from "@/student/features/profile/pages/ProfilePage";
import { EditProfilePage } from "@/student/features/profile/pages/EditProfilePage";
import { SettingsPage } from "@/shared/pages/SettingsPage";

// ── Pages - Learning ──────────────────────────────────────────────────────────
import { LearningHomePage } from "@/student/features/learning/pages/LearningHomePage";
import { CategoriesPage } from "@/student/features/learning/pages/CategoriesPage";
import { RoadmapsPage } from "@/student/features/learning/pages/RoadmapsPage";
import { RoadmapDetailPage } from "@/student/features/learning/pages/RoadmapDetailPage";
import { LessonViewerPage } from "@/student/features/learning/pages/LessonViewerPage";
import { ResourceViewerPage } from "@/student/features/learning/pages/ResourceViewerPage";
import { ContinueLearningPage } from "@/student/features/learning/pages/ContinueLearningPage";
import { BookmarksPage } from "@/student/features/learning/pages/BookmarksPage";
import { RecentlyViewedPage } from "@/student/features/learning/pages/RecentlyViewedPage";
import { SearchResultsPage } from "@/student/features/learning/pages/SearchResultsPage";

// ── Pages - Coding ────────────────────────────────────────────────────────────
import { CodingHomePage } from "@/student/features/coding/pages/CodingHomePage";
import { ProblemsListPage } from "@/student/features/coding/pages/ProblemsListPage";
import { ProblemDetailPage } from "@/student/features/coding/pages/ProblemDetailPage";
import { SubmissionHistoryPage } from "@/student/features/coding/pages/SubmissionHistoryPage";
import { SubmissionDetailPage } from "@/student/features/coding/pages/SubmissionDetailPage";
import { DailyChallengePage } from "@/student/features/coding/pages/DailyChallengePage";
import { FavoritesPage } from "@/student/features/coding/pages/FavoritesPage";
import { DiscussionsPage } from "@/student/features/coding/pages/DiscussionsPage";
import { CodingAnalyticsPage } from "@/student/features/coding/pages/CodingAnalyticsPage";

// ── Pages - Projects ──────────────────────────────────────────────────────────
import { ProjectHubHomePage } from "@/student/features/projects/pages/ProjectHubHomePage";
import { ProjectsExplorePage } from "@/student/features/projects/pages/ProjectsExplorePage";
import { ProjectDetailPage } from "@/student/features/projects/pages/ProjectDetailPage";
import { TeamDashboardPage } from "@/student/features/projects/pages/TeamDashboardPage";
import { TeamMembersPage } from "@/student/features/projects/pages/TeamMembersPage";
import { TeamInvitationsPage } from "@/student/features/projects/pages/TeamInvitationsPage";
import { TaskBoardPage } from "@/student/features/projects/pages/TaskBoardPage";
import { TaskDetailPage } from "@/student/features/projects/pages/TaskDetailPage";
import { MilestonesPage } from "@/student/features/projects/pages/MilestonesPage";
import { ProjectFilesPage } from "@/student/features/projects/pages/ProjectFilesPage";
import { ActivityTimelinePage } from "@/student/features/projects/pages/ActivityTimelinePage";

// ── Pages - Placement ─────────────────────────────────────────────────────────
import { PlacementDashboardPage } from "@/student/features/placement/pages/PlacementDashboardPage";
import { CompaniesPage } from "@/student/features/placement/pages/CompaniesPage";
import { CompanyDetailPage } from "@/student/features/placement/pages/CompanyDetailPage";
import { JobsPage } from "@/student/features/placement/pages/JobsPage";
import { JobDetailPage } from "@/student/features/placement/pages/JobDetailPage";
import { ApplicationsPage } from "@/student/features/placement/pages/ApplicationsPage";

// ── Pages - Resume ────────────────────────────────────────────────────────────
import { ResumeBuilderPage } from "@/student/features/resume/pages/ResumeBuilderPage";
import { ResumeTemplatesPage } from "@/student/features/resume/pages/ResumeTemplatesPage";

// ── Pages - Events ────────────────────────────────────────────────────────────
import { EventsPage } from "@/student/features/events/pages/EventsPage";
import { EventDetailPage } from "@/student/features/events/pages/EventDetailPage";

// ── Pages - Notifications ─────────────────────────────────────────────────────
import { NotificationsPage } from "@/student/features/notifications/pages/NotificationsPage";

// ── Pages - Analytics ─────────────────────────────────────────────────────────
import { AnalyticsDashboardPage } from "@/student/features/analytics/pages/AnalyticsDashboardPage";

// ── Error pages ───────────────────────────────────────────────────────────────
import { NotFoundPage } from "@/shared/pages/errors/NotFoundPage";
import { ForbiddenPage } from "@/shared/pages/errors/ForbiddenPage";
import { ServerErrorPage } from "@/shared/pages/errors/ServerErrorPage";

// ── Suspense wrapper ──────────────────────────────────────────────────────────
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

/**
 * PRD-08: Role-based redirect.
 * Backend decides the role — this component just reads it and routes accordingly.
 * No frontend role calculation.
 */
function RoleBasedRedirect() {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/auth/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/faq", element: <FaqPage /> },
    ],
  },

  // ── Auth routes — authenticated users are redirected to their dashboard ────
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: "/auth/login", element: <LoginPage /> },
      { path: "/auth/register", element: <RegisterPage /> },
      { path: "/auth/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/auth/reset-password", element: <ResetPasswordPage /> },
      { path: "/auth/verify-email", element: <VerifyEmailPage /> },
    ],
  },

  // ── Role-based redirect after login ───────────────────────────────────────
  {
    path: "/redirect",
    element: (
      <ProtectedRoute>
        <RoleBasedRedirect />
      </ProtectedRoute>
    ),
  },

  // ── Student dashboard routes (/dashboard/*) ────────────────────────────────
  // PRD-08: allowedRoles enforced — STUDENT and MENTOR can access /dashboard
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT", "MENTOR"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "profile/edit", element: <EditProfilePage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "notifications", element: <NotificationsPage /> },

      // Learning
      { path: "learning", element: <LearningHomePage /> },
      { path: "learning/categories", element: <CategoriesPage /> },
      { path: "learning/roadmaps", element: <RoadmapsPage /> },
      { path: "learning/roadmaps/:slug", element: <RoadmapDetailPage /> },
      { path: "learning/lesson/:id", element: <LessonViewerPage /> },
      { path: "learning/resources/:id", element: <ResourceViewerPage /> },
      { path: "learning/continue", element: <ContinueLearningPage /> },
      { path: "learning/bookmarks", element: <BookmarksPage /> },
      { path: "learning/recent", element: <RecentlyViewedPage /> },
      { path: "learning/search", element: <SearchResultsPage /> },

      // Coding
      { path: "coding", element: <CodingHomePage /> },
      { path: "coding/problems", element: <ProblemsListPage /> },
      { path: "coding/problems/:slug", element: <ProblemDetailPage /> },
      { path: "coding/problems/:id/discussions", element: <DiscussionsPage /> },
      { path: "coding/submissions", element: <SubmissionHistoryPage /> },
      { path: "coding/submissions/:id", element: <SubmissionDetailPage /> },
      { path: "coding/daily", element: <DailyChallengePage /> },
      { path: "coding/favorites", element: <FavoritesPage /> },
      { path: "coding/analytics", element: <CodingAnalyticsPage /> },

      // Projects
      { path: "projects", element: <ProjectHubHomePage /> },
      { path: "projects/explore", element: <ProjectsExplorePage /> },
      { path: "projects/invitations", element: <TeamInvitationsPage /> },
      { path: "projects/tasks/:id", element: <TaskDetailPage /> },
      { path: "projects/team/:id", element: <TeamDashboardPage /> },
      { path: "projects/team/:id/members", element: <TeamMembersPage /> },
      { path: "projects/team/:id/tasks", element: <TaskBoardPage /> },
      { path: "projects/team/:id/milestones", element: <MilestonesPage /> },
      { path: "projects/team/:id/files", element: <ProjectFilesPage /> },
      { path: "projects/team/:id/activity", element: <ActivityTimelinePage /> },
      { path: "projects/:id", element: <ProjectDetailPage /> },

      // Placement
      { path: "placement", element: <PlacementDashboardPage /> },
      { path: "placement/companies", element: <CompaniesPage /> },
      { path: "placement/companies/:id", element: <CompanyDetailPage /> },
      { path: "placement/jobs", element: <JobsPage /> },
      { path: "placement/jobs/:id", element: <JobDetailPage /> },
      { path: "placement/applications", element: <ApplicationsPage /> },

      // Resume
      { path: "resume", element: <ResumeBuilderPage /> },
      { path: "resume/templates", element: <ResumeTemplatesPage /> },

      // Events
      { path: "events", element: <EventsPage /> },
      { path: "events/:id", element: <EventDetailPage /> },

      // Analytics
      { path: "analytics", element: <AnalyticsDashboardPage /> },
    ],
  },

  // ── Manager Console routes (/manager/*) ────────────────────────────────────
  // PRD-08: allowedRoles enforced — only MANAGER and SUPER_ADMIN can access
  {
    path: "/manager",
    element: (
      <ProtectedRoute allowedRoles={["MANAGER", "SUPER_ADMIN"]}>
        <LazyPage>
          <ManagerLayout />
        </LazyPage>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/manager/dashboard" replace /> },
      { path: "dashboard", element: <LazyPage><ManagerDashboardPage /></LazyPage> },
      { path: "learning", element: <LazyPage><ManagerLearningPage /></LazyPage> },
      { path: "coding", element: <LazyPage><ManagerCodingPage /></LazyPage> },
      { path: "projects", element: <LazyPage><ManagerProjectsPage /></LazyPage> },
      { path: "placements", element: <LazyPage><ManagerPlacementsPage /></LazyPage> },
      { path: "events", element: <LazyPage><ManagerEventsPage /></LazyPage> },
      { path: "notifications", element: <LazyPage><ManagerNotificationsPage /></LazyPage> },
      { path: "reports", element: <LazyPage><ManagerReportsPage /></LazyPage> },
      { path: "profile", element: <LazyPage><ManagerProfilePage /></LazyPage> },
      { path: "settings", element: <LazyPage><ManagerSettingsPage /></LazyPage> },
    ],
  },

  // ── Super Admin Console routes (/admin/*) ──────────────────────────────────
  // PRD-08: allowedRoles enforced — only SUPER_ADMIN can access
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
        <LazyPage>
          <AdminLayout />
        </LazyPage>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <LazyPage><AdminDashboardPage /></LazyPage> },
      { path: "users", element: <LazyPage><AdminUsersPage /></LazyPage> },
      { path: "managers", element: <LazyPage><AdminManagersPage /></LazyPage> },
      { path: "permissions", element: <LazyPage><AdminPermissionsPage /></LazyPage> },
      { path: "analytics", element: <LazyPage><AdminAnalyticsPage /></LazyPage> },
      { path: "platform", element: <LazyPage><AdminPlatformPage /></LazyPage> },
      { path: "audit", element: <LazyPage><AdminAuditPage /></LazyPage> },
      { path: "system", element: <LazyPage><AdminSystemPage /></LazyPage> },
      { path: "settings", element: <LazyPage><AdminSettingsPage /></LazyPage> },
      { path: "profile", element: <LazyPage><AdminProfilePage /></LazyPage> },
    ],
  },

  // ── Legacy /administrator redirect ────────────────────────────────────────
  {
    path: "/administrator",
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: "/administrator/*",
    element: <Navigate to="/admin/dashboard" replace />,
  },

  // ── Error pages ───────────────────────────────────────────────────────────
  { path: "/403", element: <ForbiddenPage /> },
  { path: "/500", element: <ServerErrorPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
