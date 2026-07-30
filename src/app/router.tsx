import { Routes, Route, Navigate } from "react-router-dom";

import ResetPassword from "../pages/auth/ResetPassword";
import AuthCallback from "../pages/auth/AuthCallback";

import PublicLayout from "./layouts/PublicLayout";
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";
import MemberLayout from "./layouts/MemberLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";

import CreateOrganization from "../pages/onboarding/CreateOrganization";
import SelectPlan from "../pages/onboarding/SelectPlan";

import Home from "../pages/student/Home";

import AdminDashboard from "../pages/admin/Dashboard";

import MemberLogin from "../pages/member/MemberLogin";
import MemberRegister from "../pages/member/MemberRegister";
import MemberDashboard from "../pages/member/Dashboard";
import MemberProfile from "../pages/member/Profile";
import MemberSubscription from "../pages/member/Subscription";
import MemberNotifications from "../pages/member/Notifications";
import ExploreCourses from "../pages/member/ExploreCourses";
import MyCourses from "../pages/member/MyCourses";
import LectureSchedule from "../pages/member/LectureSchedule";

import SuperAdminLogin from "../pages/superAdmin/SuperAdminLogin";
import SuperAdminDashboard from "../pages/superAdmin/Dashboard";
import Organizations from "../pages/superAdmin/Organizations";
import Members from "../pages/superAdmin/Members";
import Payments from "../pages/superAdmin/Payments";
import Subscriptions from "../pages/superAdmin/Subscriptions";
import Analytics from "../pages/superAdmin/Analytics";
import Settings from "../pages/superAdmin/Settings";
import Invoices from "../pages/superAdmin/Invoices";
import Renewals from "../pages/superAdmin/Renewals";
import Automation from "../pages/superAdmin/Automation";
import Reports from "../pages/superAdmin/Reports";
import Communication from "../pages/superAdmin/Communication";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import OrganizationGuard from "../components/auth/OrganizationGuard";
import SuperAdminGuard from "./guards/SuperAdminGuard";

export default function AppRouter() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}

      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/member/login" element={<MemberLogin />} />
        <Route path="/member/register" element={<MemberRegister />} />
      </Route>

      {/* ================= ONBOARDING ================= */}

      <Route
        element={
          <ProtectedRoute>
            <PublicLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/onboarding/create-org"
          element={
            <OrganizationGuard>
              <CreateOrganization />
            </OrganizationGuard>
          }
        />
        <Route
          path="/create-organization"
          element={
            <OrganizationGuard>
              <CreateOrganization />
            </OrganizationGuard>
          }
        />

        <Route
          path="/onboarding/select-plan"
          element={
            <OrganizationGuard>
              <SelectPlan />
            </OrganizationGuard>
          }
        />
        <Route
          path="/select-plan"
          element={
            <OrganizationGuard>
              <SelectPlan />
            </OrganizationGuard>
          }
        />
      </Route>

      {/* ================= ADMIN ================= */}

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Route>

      {/* ================= ACADEMY STUDENT ================= */}

      <Route element={<MemberLayout />}>
        <Route
          path="/student"
          element={<Navigate to="/student/dashboard" replace />}
        />

        <Route
          path="/student/dashboard"
          element={<MemberDashboard />}
        />

        <Route
          path="/student/courses"
          element={<ExploreCourses />}
        />

        <Route
          path="/student/my-courses"
          element={<MyCourses />}
        />

        <Route
          path="/student/notifications"
          element={<MemberNotifications />}
        />

        <Route
          path="/student/profile"
          element={<MemberProfile />}
        />
      </Route>

      {/* ================= ACADEMY STAFF ================= */}

      <Route element={<MemberLayout />}>
        <Route
          path="/staff"
          element={<Navigate to="/staff/dashboard" replace />}
        />

        <Route
          path="/staff/dashboard"
          element={<MemberDashboard />}
        />

        <Route
          path="/staff/lecture-schedule"
          element={<LectureSchedule />}
        />

        <Route
          path="/staff/notifications"
          element={<MemberNotifications />}
        />

        <Route
          path="/staff/profile"
          element={<MemberProfile />}
        />
      </Route>

      {/* ================= GENERAL MEMBER / FALLBACK ================= */}

      <Route element={<MemberLayout />}>
        <Route
          path="/member"
          element={<Navigate to="/member/dashboard" replace />}
        />

        <Route
          path="/member/dashboard"
          element={<MemberDashboard />}
        />

        <Route
          path="/member/profile"
          element={<MemberProfile />}
        />

        <Route
          path="/member/subscription"
          element={<MemberSubscription />}
        />

        <Route
          path="/member/notifications"
          element={<MemberNotifications />}
        />

        <Route
          path="/member/courses"
          element={<ExploreCourses />}
        />

        <Route
          path="/member/my-courses"
          element={<MyCourses />}
        />
      </Route>

      {/* ================= SUPER ADMIN ================= */}

      <Route path="/super-admin/login" element={<SuperAdminLogin />} />

      <Route
        element={
          <SuperAdminGuard>
            <SuperAdminLayout />
          </SuperAdminGuard>
        }
      >
        <Route
          path="/super-admin"
          element={<Navigate to="/super-admin/dashboard" replace />}
        />

        <Route
          path="/super-admin/dashboard"
          element={<SuperAdminDashboard />}
        />

        <Route
          path="/super-admin/organizations"
          element={<Organizations />}
        />

        <Route
          path="/super-admin/members"
          element={<Members />}
        />

        <Route
          path="/super-admin/payments"
          element={<Payments />}
        />

        <Route
          path="/super-admin/subscriptions"
          element={<Subscriptions />}
        />

        <Route
          path="/super-admin/analytics"
          element={<Analytics />}
        />

        <Route
          path="/super-admin/settings"
          element={<Settings />}
        />

        <Route
          path="/super-admin/invoices"
          element={<Invoices />}
        />

        <Route
          path="/super-admin/renewals"
          element={<Renewals />}
        />

        <Route
          path="/super-admin/automation"
          element={<Automation />}
        />

        <Route
          path="/super-admin/reports"
          element={<Reports />}
        />

        <Route
          path="/super-admin/communication"
          element={<Communication />}
        />
      </Route>

      {/* Catch-all Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}