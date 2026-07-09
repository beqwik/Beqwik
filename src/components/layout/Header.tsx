import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import useOrganization from "../../hooks/useOrganization";
import { supabase } from "../../services/supabase";

export default function Header() {
  console.log("========== HEADER ==========");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user } = useAuth();

  const { organizationUser } = useOrganization();

  const activeTab =
    searchParams.get("tab") || "overview";

  const pageTitle =
    activeTab.charAt(0).toUpperCase() +
    activeTab.slice(1);

  const fullName =
    organizationUser?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Admin";

  const initials = useMemo(() => {
  return fullName
    .split(" ")
    .map((n: string) => n.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();
}, [fullName]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">

      <h2 className="text-xl font-bold">
        {pageTitle}
      </h2>

      <div className="flex items-center gap-6">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center font-bold">
            {initials}
          </div>

          <div>

            <p className="font-semibold">
              {fullName}
            </p>

            <p className="text-xs text-slate-500 uppercase">
              {organizationUser?.role || "Owner"}
            </p>

          </div>

        </div>

        <button
          onClick={handleSignOut}
          className="px-4 py-2 rounded-xl border"
        >
          Sign Out
        </button>

      </div>

    </header>
  );
}