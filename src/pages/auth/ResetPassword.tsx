import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import BeQwikLogo from "../../components/BeQwikLogo";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [validSession, setValidSession] =
    useState(false);

  useEffect(() => {
    checkRecovery();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          setValidSession(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkRecovery() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      setValidSession(true);
    }
  }

  async function updatePassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (password.length < 6) {
      alert(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Password updated successfully."
    );

    navigate("/super-admin/login");
  }

  if (!validSession) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-white flex items-center justify-center px-6">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[560px] h-[560px] bg-blue-100/50 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] bg-emerald-100/40 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md text-center">

          <BeQwikLogo size={60} className="mx-auto mb-6" />

          <h1 className="text-2xl font-bold text-slate-900">
            Invalid Recovery Session
          </h1>

          <p className="text-slate-500 mt-3">
            Please use the password reset link from
            your email.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white flex items-center justify-center p-6">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[560px] h-[560px] bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] bg-emerald-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md">

        <BeQwikLogo size={60} className="mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-center text-slate-900">
          Reset Password
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-8">
          Enter your new password.
        </p>

        <form
          onSubmit={updatePassword}
          className="space-y-5"
        >

          <div>

            <label className="block text-sm font-medium mb-2">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full h-14 rounded-xl border border-slate-200 px-5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              required
            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              className="w-full h-14 rounded-xl border border-slate-200 px-5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              required
            />

          </div>

          <button
            disabled={loading}
            className="w-full h-14 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>

        </form>

      </div>

    </div>
  );
}