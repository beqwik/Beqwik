import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

export default function AdminLayout() {
  useEffect(() => {
    console.log("ADMIN LAYOUT MOUNT");
    return () => {
      console.log("ADMIN LAYOUT UNMOUNT");
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      {/* FIXED 260px SIDEBAR */}
      <Sidebar />

      {/* FLUID MAIN CONTENT AREA (Starts immediately after 260px sidebar) */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen w-[calc(100%-260px)]">
        <Header />

        <main className="flex-1 p-8 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}