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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}