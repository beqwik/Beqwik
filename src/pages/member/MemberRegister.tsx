import MemberRegisterForm from "@/components/forms/MemberRegisterForm";
import BeQwikLogo from "../../components/BeQwikLogo";

export default function MemberRegister() {
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
              Manage
              <br />
              Membership
              <br />
              Business
              <br />
              <span className="text-[#22c55e]">
                At Scale
              </span>
            </h1>

            <p className="mt-8 text-xl text-slate-500 max-w-xl">
              Manage members, subscriptions, payments,
              attendance and business operations from one
              modern dashboard built for growing businesses.
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
                  Create Account
                </h2>

                <p className="mt-2 text-slate-500">
                  Register and join your organization.
                </p>
              </div>

              <MemberRegisterForm />

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}