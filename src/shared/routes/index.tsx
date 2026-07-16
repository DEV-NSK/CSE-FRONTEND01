import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "@/shared/components/layouts/PublicLayout";
import { AuthLayout } from "@/shared/components/layouts/AuthLayout";
import { DashboardLayout } from "@/student/layouts/DashboardLayout";
import { AdminLayout } from "@/admin/layouts/AdminLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { useAuthStore } from "@/shared/store/authStore";

// Pages - Public
import { LandingPage } from "@/shared/pages/LandingPage";
import { AboutPage } from "@/shared/pages/AboutPage";
import { ContactPage } from "@/shared/pages/ContactPage";
import { FaqPage } from "@/shared/pages/FaqPage";

// Pages - Auth
import { LoginPage } from "@/student/features/auth/pages/LoginPage";
import { RegisterPage } from "@/student/features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "@/student/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/student/features/auth/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/student/features/auth/pages/VerifyEmailPage";

// Pages - Dashboard (Student)
import { DashboardPage } from "@/student/features/dashboard/pages/DashboardPage";
import { ProfilePage } from "@/student/features/profile/pages/ProfilePage";
import { EditProfilePage } from "@/student/features/profile/pages/EditProfilePage";
import { SettingsPage } from "@/shared/pages/SettingsPage";

// Pages - Learning (FPRD-02)
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

// Pages - Coding (FPRD-03)
import { CodingHomePage } from "@/student/features/coding/pages/CodingHomePage";
import { ProblemsListPage } from "@/student/features/coding/pages/ProblemsListPage";
import { ProblemDetailPage } from "@/student/features/coding/pages/ProblemDetailPage";
import { SubmissionHistoryPage } from "@/student/features/coding/pages/SubmissionHistoryPage";
import { SubmissionDetailPage } from "@/student/features/coding/pages/SubmissionDetailPage";
import { DailyChallengePage } from "@/student/features/coding/pages/DailyChallengePage";
import { FavoritesPage } from "@/student/features/coding/pages/FavoritesPage";
import { DiscussionsPage } from "@/student/features/coding/pages/DiscussionsPage";
import { CodingAnalyticsPage } from "@/student/features/coding/pages/CodingAnalyticsPage";

// Pages - Project Hub (FPRD-04)
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

// Pages - Placement Ecosystem (FPRD-05)
import { PlacementDashboardPage } from "@/student/features/placement/pages/PlacementDashboardPage";
import { CompaniesPage } from "@/student/features/placement/pages/CompaniesPage";
import { CompanyDetailPage } from "@/student/features/placement/pages/CompanyDetailPage";
import { JobsPage } from "@/student/features/placement/pages/JobsPage";
import { JobDetailPage } from "@/student/features/placement/pages/JobDetailPage";
import { ApplicationsPage } from "@/student/features/placement/pages/ApplicationsPage";

// Pages - Resume (FPRD-05)
import { ResumeBuilderPage } from "@/student/features/resume/pages/ResumeBuilderPage";
import { ResumeTemplatesPage } from "@/student/features/resume/pages/ResumeTemplatesPage";

// Pages - Events (FPRD-05)
import { EventsPage } from "@/student/features/events/pages/EventsPage";
import { EventDetailPage } from "@/student/features/events/pages/EventDetailPage";

// Pages - Notifications (FPRD-05)
import { NotificationsPage } from "@/student/features/notifications/pages/NotificationsPage";

// Pages - Analytics (FPRD-05)
import { AnalyticsDashboardPage } from "@/student/features/analytics/pages/AnalyticsDashboardPage";

// Admin Pages
import AdminDashboardPage from "@/admin/pages/dashboard/DashboardPage";
import AdminLearningPage from "@/admin/pages/learning/LearningPage";
import AdminProjectsPage from "@/admin/pages/projects/ProjectsPage";
import AdminPlacementsPage from "@/admin/pages/placements/PlacementsPage";
import AdminEventsPage from "@/admin/pages/events/EventsPage";
import AdminAnalyticsPage from "@/admin/pages/analytics/AnalyticsPage";
import AdminNotificationsPage from "@/admin/pages/notifications/NotificationsPage";
import AdminUsersPage from "@/admin/pages/users/UsersPage";
import AdminProfilePage from "@/admin/pages/profile/ProfilePage";
import AdminSettingsPage from "@/admin/pages/settings/SettingsPage";

// Error pages
import { NotFoundPage } from "@/shared/pages/errors/NotFoundPage";
import { ForbiddenPage } from "@/shared/pages/errors/ForbiddenPage";
import { ServerErrorPage } from "@/shared/pages/errors/ServerErrorPage";

// Role-based redirect component
function RoleBasedRedirect() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === "Admin" || user?.role === "admin") {
    return <Navigate to="/administrator" replace />;
  }
  return <Navigate to="/dashboard" replace />;
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

  // ── Auth routes ────────────────────────────────────────────────────────────
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

  // ── Role-based redirect for authenticated users ────────────────────────────
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RoleBasedRedirect />
      </ProtectedRoute>
    ),
  },

  // ── Protected student dashboard routes ─────────────────────────────────────
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
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

      // Project Hub
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

  // ── Protected admin routes ─────────────────────────────────────────────────
  {
    path: "/administrator",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "learning", element: <AdminLearningPage /> },
      { path: "projects", element: <AdminProjectsPage /> },
      { path: "placements", element: <AdminPlacementsPage /> },
      { path: "events", element: <AdminEventsPage /> },
      { path: "analytics", element: <AdminAnalyticsPage /> },
      { path: "notifications", element: <AdminNotificationsPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "profile", element: <AdminProfilePage /> },
      { path: "settings", element: <AdminSettingsPage /> },
    ],
  },

  // ── Error pages ────────────────────────────────────────────────────────────
  { path: "/403", element: <ForbiddenPage /> },
  { path: "/500", element: <ServerErrorPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
