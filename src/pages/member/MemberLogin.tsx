import { useState } from "react";
import { loginMember } from "../../services/member/memberAuth";
import { useNavigate, Link } from "react-router-dom";
import BeQwikLogo from "../../components/BeQwikLogo";

export default function MemberLogin() {
  const navigate = useNavigate();

  const [organizationCode, setOrganizationCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const result = await loginMember({
        organizationCode,
        email,
        password,
      });

      console.log(result);

      if (result.success) {
        alert("Login successful");

        // Existing backend flow remains untouched
        navigate("/member/dashboard");
      } else {
        alert(String(result.error));
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Premium background effects - matches Landing Page */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[560px] h-[560px] bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] bg-emerald-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20">

        <div className="grid lg:grid-cols-2 gap-20 min-h-screen items-center">

          {/* LEFT SIDE */}
          <div className="hidden lg:block">

            <BeQwikLogo size={60} className="mb-10" />

            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200/80 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Built for Gyms, Hostels, Clubs & More
            </div>

            <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Welcome
              <br />
              Back To
              <br />
              Your
              <br />
              <span className="text-[#22c55e]">
                Dashboard
              </span>
            </h1>

            <p className="mt-8 text-xl text-slate-500 max-w-xl">
              Manage members, subscriptions, attendance,
              notifications and business operations from
              one powerful platform.
            </p>

            <div className="mt-12 flex gap-8">

              <div>
                <h2 className="text-4xl font-bold text-slate-900">
                  500+
                </h2>
                <p className="text-slate-500 mt-1">
                  Organizations
                </p>
              </div>

              <div>
                <h2 className="text-4xl font-bold text-slate-900">
                  10K+
                </h2>
                <p className="text-slate-500 mt-1">
                  Members
                </p>
              </div>

              <div>
                <h2 className="text-4xl font-bold text-slate-900">
                  99.9%
                </h2>
                <p className="text-slate-500 mt-1">
                  Uptime
                </p>
              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex justify-center">

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

              <div className="lg:hidden mb-6">
                <BeQwikLogo size={60} />
              </div>

              <div className="mb-8">
                <h2 className="text-4xl font-bold text-slate-900">
                  Sign In
                </h2>

                <p className="mt-2 text-slate-500">
                  Access your organization dashboard.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                <input
                  className="w-full h-14 px-5 rounded-xl border border-slate-200 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Organization Code"
                  value={organizationCode}
                  onChange={(e) =>
                    setOrganizationCode(e.target.value)
                  }
                />

                <input
                  className="w-full h-14 px-5 rounded-xl border border-slate-200 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

                <input
                  type="password"
                  className="w-full h-14 px-5 rounded-xl border border-slate-200 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading
                    ? "Logging in..."
                    : "Sign In"}
                </button>

              </form>

              <div className="mt-6 text-center text-slate-500">

                Don't have an account?{" "}

                <Link
                  to="/member/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  Create Account
                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}