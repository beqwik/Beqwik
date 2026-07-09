import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

/**
 * AuthCallback handles the redirect after Supabase OAuth (Google, Microsoft)
 * or email/password login. It:
 *   1. Listens for Supabase to process the session from the URL hash tokens
 *   2. Checks if the user has an organization
 *   3. Checks if the organization has an active subscription
 *   4. Redirects accordingly:
 *      - No org â†’ /create-organization
 *      - No subscription â†’ /select-plan
 *      - Everything set â†’ /admin
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    // Listen for the auth state change that fires when Supabase
    // processes the hash fragment tokens from the OAuth redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only handle SIGNED_IN or INITIAL_SESSION events, and only once
        if (handled.current) return;
        if (!session) return;

        handled.current = true;

        try {
          const userId = session.user.id;

          // Check if user belongs to an organization
          const { data: orgUser } = await supabase
            .from("organization_users")
            .select("organization_id")
            .eq("user_id", userId)
            .maybeSingle();

          if (!orgUser?.organization_id) {
            navigate("/create-organization", { replace: true });
            return;
          }

          // Check if the organization has an active subscription
          const { data: sub } = await supabase
            .from("organization_subscriptions")
            .select("id")
            .eq("organization_id", orgUser.organization_id)
            .eq("status", "active")
            .maybeSingle();

          if (!sub) {
            navigate("/select-plan", { replace: true });
            return;
          }

          // Everything is set â€” go to admin dashboard
          navigate("/admin", { replace: true });
        } catch (err) {
          console.error("Auth callback error:", err);
          navigate("/login", { replace: true });
        }
      }
    );

    // Also try getSession() for cases where the session is already available
    // (e.g. email/password login that navigated here with an active session)
    (async () => {
      if (handled.current) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !handled.current) {
        handled.current = true;
        try {
          const userId = session.user.id;

          const { data: orgUser } = await supabase
            .from("organization_users")
            .select("organization_id")
            .eq("user_id", userId)
            .maybeSingle();

          if (!orgUser?.organization_id) {
            navigate("/create-organization", { replace: true });
            return;
          }

          const { data: sub } = await supabase
            .from("organization_subscriptions")
            .select("id")
            .eq("organization_id", orgUser.organization_id)
            .eq("status", "active")
            .maybeSingle();

          if (!sub) {
            navigate("/select-plan", { replace: true });
            return;
          }

          navigate("/admin", { replace: true });
        } catch (err) {
          console.error("Auth callback error:", err);
          navigate("/login", { replace: true });
        }
      }
    })();

    // Fallback timeout â€” if nothing happens in 10 seconds, redirect to login
    const timeout = setTimeout(() => {
      if (!handled.current) {
        console.error("Auth callback timed out");
        navigate("/login", { replace: true });
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      background: "#f8fafc",
    }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid #bfdbfe",
          borderTopColor: "#2563eb",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>
        Signing you inâ€¦
      </p>
    </div>
  );
}
