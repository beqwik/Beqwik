import { Globe, Mail, Shield, AlertTriangle } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Settings <span className="text-blue-600">Configuration</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Manage your platform preferences and security controls
        </p>
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Platform */}
        <div className="bg-white border border-slate-100/80 rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Platform Information
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Platform Name
              </label>
              <input
                value="Beqwik"
                readOnly
                className="w-full mt-2 bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 font-medium outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Website
              </label>
              <input
                value="https://beqwik.com"
                readOnly
                className="w-full mt-2 bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 font-medium outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Support Email
              </label>
              <input
                value="support@beqwik.com"
                readOnly
                className="w-full mt-2 bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 font-medium outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-slate-100/80 rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded-md border-slate-350 text-[#2563eb] focus:ring-[#2563eb]/25 cursor-pointer accent-[#2563eb]"
              />
              <span>Email Notifications</span>
            </label>

            <label className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded-md border-slate-350 text-[#2563eb] focus:ring-[#2563eb]/25 cursor-pointer accent-[#2563eb]"
              />
              <span>Trial Expiry Alerts</span>
            </label>

            <label className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded-md border-slate-350 text-[#2563eb] focus:ring-[#2563eb]/25 cursor-pointer accent-[#2563eb]"
              />
              <span>Payment Alerts</span>
            </label>

            <label className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                className="w-5 h-5 rounded-md border-slate-350 text-[#2563eb] focus:ring-[#2563eb]/25 cursor-pointer accent-[#2563eb]"
              />
              <span>Marketing Emails</span>
            </label>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white border border-slate-100/80 rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-900">
            Security Overview
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Last Login
            </div>
            <div className="font-extrabold text-slate-800 text-lg mt-1.5">
              Today
            </div>
          </div>

          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Active Sessions
            </div>
            <div className="font-extrabold text-slate-800 text-lg mt-1.5">
              1 Session
            </div>
          </div>

          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              2FA Authentication
            </div>
            <div className="font-extrabold text-rose-500 text-lg mt-1.5">
              Disabled
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#fff5f6] border border-rose-100 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-[#2563eb]" />
          <h2 className="text-lg font-bold text-[#2563eb]">
            Danger Zone
          </h2>
        </div>

        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 rounded-2xl bg-[#2563eb] text-white hover:bg-[#1d4ed8] font-semibold transition cursor-pointer shadow-sm shadow-[#2563eb]/10">
            Logout All Sessions
          </button>

          <button className="px-6 py-3 rounded-2xl border border-rose-200 text-[#2563eb] bg-white hover:bg-rose-50 hover:border-rose-300 font-semibold transition cursor-pointer">
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
}
