import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import useSubscription from "../../hooks/useSubscription";
import useOrganization from "../../hooks/useOrganization";

export default function AdminLayout() {
  const { organization, loading: orgLoading } = useOrganization();
  const { subscription, loading: subLoading } = useSubscription();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (orgLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-semibold">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // If organization exists but user has not purchased an active subscription, redirect to purchase plan
  if (organization && !subscription) {
    return <Navigate to="/onboarding/select-plan" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      {/* SIDEBAR — drawer on mobile, fixed on lg+ */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* FLUID MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen w-full lg:w-[calc(100%-260px)]">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}