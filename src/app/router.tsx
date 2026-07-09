import { Routes, Route } from "react-router-dom";

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
import SubscriptionGuard from "../components/auth/SubscriptionGuard";

import SuperAdminGuard from "./guards/SuperAdminGuard";

function Router() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}

      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/auth/callback"
          element={<AuthCallback />}
        />

        {/* ---------- CREATE ORGANIZATION ---------- */}

        <Route
          path="/create-organization"
          element={
            <ProtectedRoute>
              <OrganizationGuard>
                <CreateOrganization />
              </OrganizationGuard>
            </ProtectedRoute>
          }
        />

        {/* ---------- SELECT PLAN ---------- */}

        <Route
          path="/select-plan"
          element={
            <ProtectedRoute>
              <SubscriptionGuard>
                <SelectPlan />
              </SubscriptionGuard>
            </ProtectedRoute>
          }
        />

        {/* ---------- MEMBER ---------- */}

        <Route
          path="/member/login"
          element={<MemberLogin />}
        />

        <Route
          path="/member/register"
          element={<MemberRegister />}
        />

        {/* ---------- SUPER ADMIN LOGIN ---------- */}

        <Route
          path="/super-admin/login"
          element={<SuperAdminLogin />}
        />
      </Route>

      {/* ================= MEMBER ================= */}

      <Route element={<MemberLayout />}>
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
      </Route>

      {/* ================= STUDENT ================= */}

      <Route element={<StudentLayout />}>
        <Route
          path="/student"
          element={<Home />}
        />
      </Route>

      {/* ================= ADMIN ================= */}

      <Route
        element={
          <ProtectedRoute>
            <SubscriptionGuard>
              <AdminLayout />
            </SubscriptionGuard>
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
      </Route>

      {/* ================= SUPER ADMIN ================= */}

      <Route
        element={
          <SuperAdminGuard>
            <SuperAdminLayout />
          </SuperAdminGuard>
        }
      >
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
          path="/super-admin/invoices"
          element={<Invoices />}
        />

        <Route
          path="/super-admin/renewals"
          element={<Renewals />}
        />

        <Route
          path="/super-admin/analytics"
          element={<Analytics />}
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

        <Route
          path="/super-admin/settings"
          element={<Settings />}
        />
      </Route>
    </Routes>
  );
}

export default Router;