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
  import("@/manager/layouts/ManagerLayout").then((m) => ({
    default: m.ManagerLayout,
  })),
);
const AdminLayout = lazy(() =>
  import("@/admin/layouts/AdminLayout").then((m) => ({
    default: m.AdminLayout,
  })),
);

// ── Lazy-load Manager pages ───────────────────────────────────────────────────
const ManagerDashboardPage = lazy(
  () => import("@/manager/pages/dashboard/ManagerDashboardPage"),
);
const ManagerLearningPage = lazy(
  () => import("@/manager/pages/learning/ManagerLearningPage"),
);
const ManagerCodingPage = lazy(
  () => import("@/manager/pages/coding/ManagerCodingPage"),
);
const ManagerProjectsPage = lazy(
  () => import("@/manager/pages/projects/ManagerProjectsPage"),
);
const ManagerPlacementsPage = lazy(
  () => import("@/manager/pages/placements/ManagerPlacementsPage"),
);
const ManagerEventsPage = lazy(
  () => import("@/manager/pages/events/ManagerEventsPage"),
);
const ManagerNotificationsPage = lazy(
  () => import("@/manager/pages/notifications/ManagerNotificationsPage"),
);
const ManagerReportsPage = lazy(
  () => import("@/manager/pages/reports/ManagerReportsPage"),
);
const ManagerProfilePage = lazy(
  () => import("@/manager/pages/profile/ManagerProfilePage"),
);
const ManagerSettingsPage = lazy(
  () => import("@/manager/pages/settings/ManagerSettingsPage"),
);
// FPRD-10 new pages
const ManagerBannersPage = lazy(
  () => import("@/manager/pages/banners/ManagerBannersPage"),
);
const ManagerFaqPage = lazy(() => import("@/manager/pages/faq/ManagerFaqPage"));
const ManagerTestimonialsPage = lazy(
  () => import("@/manager/pages/testimonials/ManagerTestimonialsPage"),
);
const ManagerMediaPage = lazy(
  () => import("@/manager/pages/media/ManagerMediaPage"),
);
const ManagerSearchPage = lazy(
  () => import("@/manager/pages/search/ManagerSearchPage"),
);
const ManagerActivityPage = lazy(
  () => import("@/manager/pages/activity/ManagerActivityPage"),
);

// ── Lazy-load Admin pages ─────────────────────────────────────────────────────
const AdminDashboardPage = lazy(
  () => import("@/admin/pages/dashboard/AdminDashboardPage"),
);
const AdminUsersPage = lazy(() => import("@/admin/pages/users/AdminUsersPage"));
const AdminManagersPage = lazy(
  () => import("@/admin/pages/managers/AdminManagersPage"),
);
const AdminPermissionsPage = lazy(
  () => import("@/admin/pages/permissions/AdminPermissionsPage"),
);
const AdminAnalyticsPage = lazy(
  () => import("@/admin/pages/analytics/AdminAnalyticsPage"),
);
const AdminPlatformPage = lazy(
  () => import("@/admin/pages/platform/AdminPlatformPage"),
);
const AdminAuditPage = lazy(() => import("@/admin/pages/audit/AdminAuditPage"));
const AdminSystemPage = lazy(
  () => import("@/admin/pages/system/AdminSystemPage"),
);
const AdminSettingsPage = lazy(
  () => import("@/admin/pages/settings/AdminSettingsPage"),
);
const AdminProfilePage = lazy(
  () => import("@/admin/pages/profile/AdminProfilePage"),
);
// CAMPUSRANK+INSTA: Learning CMS (SUPER_ADMIN)
const AdminLearningDashboardPage = lazy(
  () => import("@/admin/pages/learning/AdminLearningDashboardPage"),
);
const AdminLearningContentPage = lazy(
  () => import("@/admin/pages/learning/AdminLearningContentPage"),
);
const AdminLearningCreatePage = lazy(
  () => import("@/admin/pages/learning/AdminLearningCreatePage"),
);
const AdminLearningLevelsPage = lazy(
  () => import("@/admin/pages/learning/AdminLearningLevelsPage"),
);
const AdminLearningCoursesPage = lazy(
  () => import("@/admin/pages/learning/AdminLearningCoursesPage"),
);

// ── Pages - Public ────────────────────────────────────────────────────────────
import { LandingPage } from "@/shared/pages/LandingPage";
import { AboutPage } from "@/shared/pages/AboutPage";
import { ContactPage } from "@/shared/pages/ContactPage";
import { FaqPage } from "@/shared/pages/FaqPage";

// ── Pages - Auth ──────────────────────────────────────────────────────────────
import { LoginPage } from "@/student/features/auth/pages/LoginPage";
import { RegisterPage } from "@/student/features/auth/pages/RegisterPage";

// ── Pages - Dashboard (Student) ───────────────────────────────────────────────
import { DashboardPage } from "@/student/features/dashboard/pages/DashboardPage";
import { ProfilePage } from "@/student/features/profile/pages/ProfilePage";
import { EditProfilePage } from "@/student/features/profile/pages/EditProfilePage";
import { SettingsPage } from "@/shared/pages/SettingsPage";

// ── Pages - Learning ──────────────────────────────────────────────────────────
// CAMPUSRANK+INSTA: New CMS-driven Learning pages (replace old Python/hardcoded)
import StudentLearningDashboardPage from "@/student/features/learning/pages/StudentLearningDashboardPage";
import StudentLearningRoadmapPage from "@/student/features/learning/pages/StudentLearningRoadmapPage";
import StudentLearningDetailPage from "@/student/features/learning/pages/StudentLearningDetailPage";

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
// FPRD-16: Question Bank
import { QuestionBankPage } from "@/student/features/coding/pages/QuestionBankPage";
import { TopicDetailPage } from "@/student/features/coding/pages/TopicDetailPage";
import { QuestionDetailPage } from "@/student/features/coding/pages/QuestionDetailPage";
import { ContestsPage } from "@/student/features/coding/pages/ContestsPage";

// ── Pages - Notifications ─────────────────────────────────────────────────────
import { NotificationsPage } from "@/student/features/notifications/pages/NotificationsPage";

// ── Pages - Projects (NOT MVP — redirected to LaunchingSoon) ─────────────────
// These are kept as lazy imports to prevent TypeScript "unused import" errors
// but are NOT rendered — all /projects/* routes redirect to LaunchingSoon
// (Removed for FPRD-13: routes now redirect to /launching-soon/projects)

// ── Pages - Placement (NOT MVP — redirected to LaunchingSoon) ────────────────
// (Removed for FPRD-13: routes now redirect to /launching-soon/placement)

// ── Pages - Events (NOT MVP — redirected to LaunchingSoon) ───────────────────
// (Removed for FPRD-13: routes now redirect to /launching-soon/events)

// ── Pages - Analytics (NOT MVP — redirected to LaunchingSoon) ────────────────
// (Removed for FPRD-13: routes now redirect to /launching-soon/analytics)

// ── Pages - Launching Soon ────────────────────────────────────────────────────
import { LaunchingSoonPage } from "@/shared/pages/LaunchingSoonPage";

// ── Error pages ───────────────────────────────────────────────────────────────
import { NotFoundPage } from "@/shared/pages/errors/NotFoundPage";
import { ForbiddenPage } from "@/shared/pages/errors/ForbiddenPage";
import { ServerErrorPage } from "@/shared/pages/errors/ServerErrorPage";
import { PublicProfilePage } from "@/student/features/profile/pages/PublicProfilePage";

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
  // Role-based protection — only STUDENT can access. Wrong role → /403 (not redirect)
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "profile/edit", element: <EditProfilePage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "notifications", element: <NotificationsPage /> },

      // Learning — CAMPUSRANK+INSTA: CMS-driven (replaces old Python/hardcoded routes)
      { path: "learning", element: <StudentLearningDashboardPage /> },
      { path: "learning/roadmap", element: <StudentLearningRoadmapPage /> },
      { path: "learning/:id", element: <StudentLearningDetailPage /> },

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
      // FPRD-16: Question Bank routes
      { path: "coding/question-bank", element: <QuestionBankPage /> },
      { path: "coding/question-bank/:slug", element: <TopicDetailPage /> },
      {
        path: "coding/question-bank/:slug/:problemSlug",
        element: <QuestionDetailPage />,
      },
      { path: "coding/contests", element: <ContestsPage /> },
      // Legacy /coding/problems route still works — ProblemsListPage is the advanced filter view
      // DiscussionsPage also routed from problem detail page link

      // ── FPRD-13: Non-MVP modules redirect to Launching Soon ─────────────────
      // Projects → /launching-soon/projects
      {
        path: "projects",
        element: <Navigate to="/dashboard/launching-soon/projects" replace />,
      },
      {
        path: "projects/*",
        element: <Navigate to="/dashboard/launching-soon/projects" replace />,
      },

      // Placement → /launching-soon/placement
      {
        path: "placement",
        element: <Navigate to="/dashboard/launching-soon/placement" replace />,
      },
      {
        path: "placement/*",
        element: <Navigate to="/dashboard/launching-soon/placement" replace />,
      },

      // Resume (part of Placement) → /launching-soon/placement
      {
        path: "resume",
        element: <Navigate to="/dashboard/launching-soon/placement" replace />,
      },
      {
        path: "resume/*",
        element: <Navigate to="/dashboard/launching-soon/placement" replace />,
      },

      // Events → /launching-soon/events
      {
        path: "events",
        element: <Navigate to="/dashboard/launching-soon/events" replace />,
      },
      {
        path: "events/*",
        element: <Navigate to="/dashboard/launching-soon/events" replace />,
      },

      // Analytics → /launching-soon/analytics
      {
        path: "analytics",
        element: <Navigate to="/dashboard/launching-soon/analytics" replace />,
      },

      // Launching Soon page (catch-all for non-MVP modules)
      { path: "launching-soon/:module", element: <LaunchingSoonPage /> },
      { path: "launching-soon", element: <LaunchingSoonPage /> },

      // Unknown /dashboard/* routes → 404 within layout
      { path: "*", element: <NotFoundPage /> },
    ],
  },

  // ── Manager Console routes (/manager/*) ────────────────────────────────────
  // Role-based protection — only MANAGER can access. Wrong role → /403 (not redirect)
  {
    path: "/manager",
    element: (
      <ProtectedRoute allowedRoles={["MANAGER"]}>
        <LazyPage>
          <ManagerLayout />
        </LazyPage>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/manager/dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <LazyPage>
            <ManagerDashboardPage />
          </LazyPage>
        ),
      },
      {
        path: "learning",
        element: (
          <LazyPage>
            <ManagerLearningPage />
          </LazyPage>
        ),
      },
      {
        path: "coding",
        element: (
          <LazyPage>
            <ManagerCodingPage />
          </LazyPage>
        ),
      },
      {
        path: "projects",
        element: (
          <LazyPage>
            <ManagerProjectsPage />
          </LazyPage>
        ),
      },
      {
        path: "placements",
        element: (
          <LazyPage>
            <ManagerPlacementsPage />
          </LazyPage>
        ),
      },
      {
        path: "events",
        element: (
          <LazyPage>
            <ManagerEventsPage />
          </LazyPage>
        ),
      },
      {
        path: "notifications",
        element: (
          <LazyPage>
            <ManagerNotificationsPage />
          </LazyPage>
        ),
      },
      {
        path: "reports",
        element: (
          <LazyPage>
            <ManagerReportsPage />
          </LazyPage>
        ),
      },
      {
        path: "profile",
        element: (
          <LazyPage>
            <ManagerProfilePage />
          </LazyPage>
        ),
      },
      {
        path: "settings",
        element: (
          <LazyPage>
            <ManagerSettingsPage />
          </LazyPage>
        ),
      },
      // FPRD-10 new routes
      {
        path: "banners",
        element: (
          <LazyPage>
            <ManagerBannersPage />
          </LazyPage>
        ),
      },
      {
        path: "faq",
        element: (
          <LazyPage>
            <ManagerFaqPage />
          </LazyPage>
        ),
      },
      {
        path: "testimonials",
        element: (
          <LazyPage>
            <ManagerTestimonialsPage />
          </LazyPage>
        ),
      },
      {
        path: "media",
        element: (
          <LazyPage>
            <ManagerMediaPage />
          </LazyPage>
        ),
      },
      {
        path: "search",
        element: (
          <LazyPage>
            <ManagerSearchPage />
          </LazyPage>
        ),
      },
      {
        path: "activity",
        element: (
          <LazyPage>
            <ManagerActivityPage />
          </LazyPage>
        ),
      },
    ],
  },

  // ── Super Admin Console routes (/admin/*) ──────────────────────────────────
  // Role-based protection — only SUPER_ADMIN can access. Wrong role → /403 (not redirect)
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
      {
        path: "dashboard",
        element: (
          <LazyPage>
            <AdminDashboardPage />
          </LazyPage>
        ),
      },
      // Learning CMS — CAMPUSRANK+INSTA
      {
        path: "learning",
        element: (
          <LazyPage>
            <AdminLearningDashboardPage />
          </LazyPage>
        ),
      },
      {
        path: "learning/content",
        element: (
          <LazyPage>
            <AdminLearningContentPage />
          </LazyPage>
        ),
      },
      {
        path: "learning/create",
        element: (
          <LazyPage>
            <AdminLearningCreatePage />
          </LazyPage>
        ),
      },
      {
        path: "learning/levels",
        element: (
          <LazyPage>
            <AdminLearningLevelsPage />
          </LazyPage>
        ),
      },
      {
        path: "learning/courses",
        element: (
          <LazyPage>
            <AdminLearningCoursesPage />
          </LazyPage>
        ),
      },
      {
        path: "learning/:id",
        element: (
          <LazyPage>
            <AdminLearningCreatePage />
          </LazyPage>
        ),
      },
      {
        path: "learning/:id/edit",
        element: (
          <LazyPage>
            <AdminLearningCreatePage />
          </LazyPage>
        ),
      },
      {
        path: "users",
        element: (
          <LazyPage>
            <AdminUsersPage />
          </LazyPage>
        ),
      },
      {
        path: "managers",
        element: (
          <LazyPage>
            <AdminManagersPage />
          </LazyPage>
        ),
      },
      {
        path: "permissions",
        element: (
          <LazyPage>
            <AdminPermissionsPage />
          </LazyPage>
        ),
      },
      {
        path: "analytics",
        element: (
          <LazyPage>
            <AdminAnalyticsPage />
          </LazyPage>
        ),
      },
      {
        path: "platform",
        element: (
          <LazyPage>
            <AdminPlatformPage />
          </LazyPage>
        ),
      },
      {
        path: "audit",
        element: (
          <LazyPage>
            <AdminAuditPage />
          </LazyPage>
        ),
      },
      {
        path: "system",
        element: (
          <LazyPage>
            <AdminSystemPage />
          </LazyPage>
        ),
      },
      {
        path: "settings",
        element: (
          <LazyPage>
            <AdminSettingsPage />
          </LazyPage>
        ),
      },
      {
        path: "profile",
        element: (
          <LazyPage>
            <AdminProfilePage />
          </LazyPage>
        ),
      },
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
  // ── FPRD-23: Public profile (/u/:username) ────────────────────────────────
  { path: "/u/:username", element: <PublicProfilePage /> },
  { path: "/profile/:username", element: <PublicProfilePage /> },
  { path: "*", element: <NotFoundPage /> },
]);
