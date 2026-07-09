import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";
import { loginSuperAdmin } from "../../services/superAdmin/superAdminAuth";
import { useSuperAdminStore } from "../../store/superAdminStore";
import BeQwikLogo from "../../components/BeQwikLogo";

export default function SuperAdminLogin() {
  const navigate = useNavigate();

  const setAdmin = useSuperAdminStore(
    (state) => state.setAdmin
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleForgotPassword() {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          `${window.location.origin}/reset-password`,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Password reset email sent successfully. Please check your inbox."
    );
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const result =
        await loginSuperAdmin({
          email,
          password,
        });

      if (result.success) {
        setAdmin(result.admin);

        navigate(
          "/super-admin/dashboard"
        );
      } else {
        alert(
          String(result.error)
        );
      }
    } catch (err) {
      console.error(err);

      alert("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#e2e8f0] p-10">

        <div className="mb-8 text-center flex flex-col items-center">
          <BeQwikLogo size={60} className="mb-4" />

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-4">
            Super Admin Portal
          </h1>

          <p className="mt-2.5 text-sm text-slate-500 font-medium">
            Restricted access portal for BeQwik platform.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider ml-1">
              Email Address
            </label>

            <input
              type="email"
              placeholder="admin@beqwik.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full h-13 px-5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider ml-1">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full h-13 px-5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>

                Verifying...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

        </form>

      </div>

    </div>
  );
}