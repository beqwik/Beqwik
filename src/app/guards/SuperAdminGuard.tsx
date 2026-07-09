import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

interface Props {
  children: React.ReactNode;
}

export default function SuperAdminGuard({
  children,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] =
    useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!session) {
          setAuthorized(false);
          return;
        }

        const { data: admin } =
          await supabase
            .from("super_admins")
            .select("id")
            .eq(
              "auth_user_id",
              session.user.id
            )
            .single();

        setAuthorized(!!admin);
      } catch (err) {
        console.error(
          "Super Admin Guard:",
          err
        );

        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 text-lg font-medium">
          Loading...
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <Navigate
        to="/super-admin/login"
        replace
      />
    );
  }

  return <>{children}</>;
}