import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import BeQwikLogo from "../../components/BeQwikLogo";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  monthly_price: number;
  max_members: number | null;
  max_staff: number | null;
  features?: string[] | null;
  active: boolean;
}

function LandingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("active", true)
          .order("monthly_price", { ascending: true });

        if (error) throw error;
        if (data) setPlans(data);
      } catch (err) {
        console.error("Error loading plans on landing page:", err);
      }
    }
    fetchPlans();
  }, []);
  return (
    <>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="w-full px-6 lg:px-12 xl:px-20 2xl:px-32">
          <div className="flex items-center justify-between h-20">
            {/* LOGO */}
            <Link to="/">
              <BeQwikLogo />
            </Link>

            {/* NAV LINKS */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition">
                Features
              </a>
              <a href="#solutions" className="text-slate-600 hover:text-blue-600 font-medium transition">
                Solutions
              </a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-600 font-medium transition">
                Pricing
              </a>
              <a href="#testimonials" className="text-slate-600 hover:text-blue-600 font-medium transition">
                Customers
              </a>
              <a href="#contact" className="text-slate-600 hover:text-blue-600 font-medium transition">
                Contact
              </a>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden md:block text-slate-650 font-bold hover:text-blue-600 transition">
                Sign In
              </Link>

              <Link
                to="/member/login"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 hover:scale-105"
              >
                Member Login
              </Link>

              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-white">
        {/* Premium background effects - full viewport width */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[560px] h-[560px] bg-blue-100/50 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] bg-emerald-100/40 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #00000006 1px, transparent 1px), linear-gradient(to bottom, #00000006 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
            }}
          />
        </div>

        <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20 2xl:px-32 py-16 lg:py-0 min-h-[90vh] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center w-full">

            {/* LEFT: Copy - 5 of 12 columns */}
            <div className="lg:col-span-5 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200/80 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Built for recurring revenue businesses
              </div>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
                Automate. Renew.
                <br />
                <span className="text-[#00c853]">Grow your revenue.</span>
              </h1>

              {/* Subtext */}
              <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                BeQwik helps you manage subscriptions, automate renewals, and get paid
                on time—every time.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-10">
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
                >
                  Start 14-Day Free Trial →
                </Link>

                <a
                  href="#contact"
                  className="px-8 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                  </svg>
                  Book a Demo
                </a>
              </div>

              {/* Feature bullets */}
              <div className="grid grid-cols-2 gap-6 mt-10 text-left border-t border-slate-200/70 pt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    🛡️
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Secure & Reliable</h4>
                    <p className="text-xs text-slate-500">Bank-level security</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Save 10+ Hours/Week</h4>
                    <p className="text-xs text-slate-500">Automate repetitive tasks</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Boost Collections</h4>
                    <p className="text-xs text-slate-500">Reduce churn & defaults</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    👥
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Loved by 500+ Businesses</h4>
                    <p className="text-xs text-slate-500">Across industries</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Large dashboard preview - 7 of 12 columns */}
            <div className="lg:col-span-7 relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-blue-200/40 via-emerald-100/30 to-transparent rounded-[2.5rem] blur-2xl -z-10" />

              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row text-left min-h-[520px] lg:min-h-[620px]">
                {/* Mockup Sidebar */}
                <div className="w-full md:w-56 bg-slate-50 border-r border-slate-100 p-5 flex-col justify-between hidden md:flex">
                  <div>
                    <div className="flex items-center gap-2.5 mb-8">
                      <div className="w-7 h-7 rounded-full bg-[#0052e0] flex items-center justify-center text-white font-extrabold text-[10px]">
                        BQ
                      </div>
                      <span className="font-bold text-sm text-slate-800">BeQwik</span>
                    </div>
                    <div className="space-y-2">
                      <div className="px-3 py-2 bg-blue-50 text-blue-650 rounded-lg text-xs font-bold flex items-center gap-2">
                        <span>📊</span> Dashboard
                      </div>
                      <div className="px-3 py-2 text-slate-650 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-2 transition">
                        <span>👥</span> Customers
                      </div>
                      <div className="px-3 py-2 text-slate-655 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-2 transition">
                        <span>💳</span> Subscriptions
                      </div>
                      <div className="px-3 py-2 text-slate-655 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-2 transition">
                        <span>💰</span> Payments
                      </div>
                      <div className="px-3 py-2 text-slate-655 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-2 transition">
                        <span>🔄</span> Renewals
                      </div>
                      <div className="px-3 py-2 text-slate-655 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-2 transition">
                        <span>📈</span> Analytics
                      </div>
                      <div className="px-3 py-2 text-slate-655 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-2 transition">
                        <span>🤖</span> Automation
                      </div>
                      <div className="px-3 py-2 text-slate-655 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-2 transition">
                        <span>📝</span> Reports
                      </div>
                      <div className="px-3 py-2 text-slate-655 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-2 transition">
                        <span>⚙️</span> Settings
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mockup Main Content */}
                <div className="flex-1 bg-white p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    {/* Mockup Header */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
                        <p className="text-xs text-slate-500">Overview of your membership business</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 bg-white">
                          May 20 - Jun 20, 2025
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </span>
                      </div>
                    </div>

                    {/* Mockup Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-slate-500 text-xs font-medium">Total Revenue</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">₹4.2L</h3>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1">↑ 16.2% vs last month</p>
                      </div>

                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-slate-500 text-xs font-medium">Total Customers</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">1,250</h3>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1">↑ 8.4% vs last month</p>
                      </div>

                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-slate-500 text-xs font-medium">Active Subscriptions</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">1,140</h3>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1">↑ 6.7% vs last month</p>
                      </div>

                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-slate-500 text-xs font-medium">Renewal Rate</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">87.5%</h3>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1">↑ 15.7% vs last month</p>
                      </div>
                    </div>

                    {/* Mockup Charts Section */}
                    <div className="grid md:grid-cols-3 gap-6 mt-6">
                      {/* Revenue Overview chart mockup */}
                      <div className="md:col-span-2 bg-slate-50/30 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between min-h-[160px]">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-slate-800">Revenue Overview</h4>
                          <span className="text-[10px] text-slate-400">This Year</span>
                        </div>
                        {/* SVG Line Graph */}
                        <svg className="w-full h-24 mt-2" viewBox="0 0 300 100">
                          <path
                            d="M 10 90 L 60 78 L 110 82 L 160 65 L 210 50 L 260 30 L 290 10"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <circle cx="10" cy="90" r="4" fill="#2563eb" />
                          <circle cx="60" cy="78" r="4" fill="#2563eb" />
                          <circle cx="110" cy="82" r="4" fill="#2563eb" />
                          <circle cx="160" cy="65" r="4" fill="#2563eb" />
                          <circle cx="210" cy="50" r="4" fill="#2563eb" />
                          <circle cx="260" cy="30" r="4" fill="#2563eb" />
                          <circle cx="290" cy="10" r="4" fill="#2563eb" />
                          <path
                            d="M 10 90 L 60 78 L 110 82 L 160 65 L 210 50 L 260 30 L 290 10 L 290 100 L 10 100 Z"
                            fill="url(#chart-grad)"
                            opacity="0.1"
                          />
                          <defs>
                            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563eb" />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>

                      {/* Renewals Overview chart mockup */}
                      <div className="bg-slate-50/30 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between min-h-[160px]">
                        <h4 className="text-xs font-bold text-slate-800">Renewals Overview</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            {/* Donut chart SVG */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="76 24" strokeDashoffset="0" />
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="16 84" strokeDashoffset="-76" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <span className="text-[10px] font-bold text-slate-800">1,140</span>
                              <span className="text-[8px] text-slate-400">Total</span>
                            </div>
                          </div>
                          <div className="space-y-1 text-[9px] text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                              <span>Successful: 875</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                              <span>Upcoming: 180</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span>Failed: 85</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trusted Brand Logos */}
      <section className="w-full bg-white border-t border-slate-100">
        <div className="w-full px-6 lg:px-12 xl:px-20 2xl:px-32 py-8">
          <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase text-center lg:text-left">
            Trusted by businesses of all sizes
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-12 gap-y-6 mt-6 opacity-60">
            <div className="flex items-center gap-2 text-slate-650 font-bold text-sm">
              <span className="w-4 h-4 bg-slate-300 rounded-sm" /> FitnesClub
            </div>
            <div className="flex items-center gap-2 text-slate-650 font-bold text-sm">
              <span className="w-4 h-4 bg-slate-300 rounded-sm" /> EduSmart
            </div>
            <div className="flex items-center gap-2 text-slate-650 font-bold text-sm">
              <span className="w-4 h-4 bg-slate-300 rounded-sm" /> HealthPlus
            </div>
            <div className="flex items-center gap-2 text-slate-650 font-bold text-sm">
              <span className="w-4 h-4 bg-slate-300 rounded-sm" /> GROW FIT
            </div>
            <div className="flex items-center gap-2 text-slate-650 font-bold text-sm">
              <span className="w-4 h-4 bg-slate-300 rounded-sm" /> LearnHub
            </div>
            <div className="flex items-center gap-2 text-slate-650 font-bold text-sm">
              <span className="w-4 h-4 bg-slate-300 rounded-sm" /> StayEase
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative w-full overflow-hidden py-20 lg:py-24 bg-white scroll-mt-24" id="features">
        <div className="w-full px-6 lg:px-12 xl:px-20 2xl:px-32">

          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100">
              Powerful Features
            </span>
            <h2 className="mt-6 text-4xl lg:text-5xl font-bold text-slate-900">
              Everything You Need To Run Your Subscription Business
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Built for gyms, hostels, clubs, academies, swimming pools,
              mess services and any business that manages recurring memberships.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="h-full flex flex-col bg-white p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl hover:border-blue-100 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl mb-5 group-hover:bg-blue-600 group-hover:text-white transition">👥</div>
              <h3 className="text-lg font-bold text-slate-900">Member Management</h3>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">Add, manage and track all members from a single dashboard.</p>
            </div>
            <div className="h-full flex flex-col bg-white p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl hover:border-blue-100 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-2xl mb-5 group-hover:bg-green-600 group-hover:text-white transition">💳</div>
              <h3 className="text-lg font-bold text-slate-900">Subscription Plans</h3>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">Create monthly, quarterly and yearly plans with ease.</p>
            </div>
            <div className="h-full flex flex-col bg-white p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl hover:border-blue-100 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-2xl mb-5 group-hover:bg-purple-600 group-hover:text-white transition">📅</div>
              <h3 className="text-lg font-bold text-slate-900">Attendance Tracking</h3>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">Monitor daily check-ins and member activity in real time.</p>
            </div>
            <div className="h-full flex flex-col bg-white p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl hover:border-blue-100 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-2xl mb-5 group-hover:bg-amber-500 group-hover:text-white transition">💰</div>
              <h3 className="text-lg font-bold text-slate-900">Payment Collection</h3>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">Collect online payments and track dues effortlessly.</p>
            </div>
            <div className="h-full flex flex-col bg-white p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl hover:border-blue-100 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 text-2xl mb-5 group-hover:bg-rose-600 group-hover:text-white transition">📊</div>
              <h3 className="text-lg font-bold text-slate-900">Reports & Analytics</h3>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">Get detailed insights about revenue, growth and retention.</p>
            </div>
            <div className="h-full flex flex-col bg-white p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl hover:border-blue-100 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl mb-5 group-hover:bg-blue-600 group-hover:text-white transition">🔔</div>
              <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">Send reminders, announcements and renewal alerts instantly.</p>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative w-full overflow-hidden py-20 lg:py-24 bg-slate-50 scroll-mt-24" id="solutions">
        <div className="w-full px-6 lg:px-12 xl:px-20 2xl:px-32">
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100">
              How It Works
            </span>
            <h2 className="mt-6 text-4xl lg:text-5xl font-bold text-slate-900">
              Get Started In<span className="text-blue-600"> 3 Simple Steps</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Launch your subscription business operations in minutes.
              No complicated setup. No technical knowledge required.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="h-full bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative">
              <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30">1</div>
              <div className="text-5xl mb-6 mt-4">🏢</div>
              <h3 className="text-xl font-bold text-slate-900">Create Organization</h3>
              <p className="mt-3 text-slate-500 text-sm leading-relaxed">Register your gym, hostel, academy, swimming pool, club or any subscription-based business in minutes.</p>
            </div>
            <div className="h-full bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative">
              <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30">2</div>
              <div className="text-5xl mb-6 mt-4">👥</div>
              <h3 className="text-xl font-bold text-slate-900">Add Members & Plans</h3>
              <p className="mt-3 text-slate-500 text-sm leading-relaxed">Add customers, create subscription plans and assign memberships with flexible pricing options.</p>
            </div>
            <div className="h-full bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative">
              <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30">3</div>
              <div className="text-5xl mb-6 mt-4">📈</div>
              <h3 className="text-xl font-bold text-slate-900">Track & Grow</h3>
              <p className="mt-3 text-slate-500 text-sm leading-relaxed">Monitor attendance, collect payments, send reminders and analyze business performance from one dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="relative w-full overflow-hidden py-20 lg:py-24 bg-white scroll-mt-24" id="pricing">
        <div className="w-full px-6 lg:px-12 xl:px-20 2xl:px-32">
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100">
              Simple Pricing
            </span>
            <h2 className="mt-6 text-4xl lg:text-5xl font-bold text-slate-900">
              Plans For Every<span className="text-blue-600"> Business Size</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Start small and scale as your business grows. No hidden fees. Cancel anytime.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 items-stretch">
            {plans.length === 0 ? (
              <>
                {/* STARTER */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col h-full shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">Starter</h3>
                    <p className="mt-1 text-slate-500 text-sm">Perfect for small businesses</p>
                    <div className="mt-6">
                      <span className="text-5xl font-extrabold text-slate-900">₹999</span>
                      <span className="text-slate-400 ml-1 text-sm">/month</span>
                    </div>
                    <ul className="mt-8 space-y-3 text-sm">
                      {["Up to 100 Members", "Subscription Management", "Attendance Tracking", "Payment Tracking", "Basic Reports"].map(f => (
                        <li key={f} className="flex items-center gap-2 text-slate-600">
                          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link to="/register" className="w-full mt-8 py-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold hover:bg-slate-100 transition-all duration-300 block text-center text-sm text-slate-700">
                    Get Started
                  </Link>
                </div>

                {/* PROFESSIONAL */}
                <div className="rounded-2xl p-8 text-white shadow-xl relative flex flex-col h-full bg-blue-600 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <span className="absolute top-5 right-5 px-3 py-1 rounded-full bg-white text-blue-600 text-xs font-bold">MOST POPULAR</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">Professional</h3>
                    <p className="mt-1 text-white/70 text-sm">Best for growing businesses</p>
                    <div className="mt-6">
                      <span className="text-5xl font-extrabold">₹2499</span>
                      <span className="text-white/70 ml-1 text-sm">/month</span>
                    </div>
                    <ul className="mt-8 space-y-3 text-sm">
                      {["Up to 1000 Members", "Everything in Starter", "Advanced Analytics", "WhatsApp Notifications", "Staff Management", "Priority Support"].map(f => (
                        <li key={f} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link to="/register" className="w-full mt-8 py-3.5 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-all duration-300 block text-center text-sm">
                    Start Free Trial
                  </Link>
                </div>

                {/* ENTERPRISE */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col h-full shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">Enterprise</h3>
                    <p className="mt-1 text-slate-500 text-sm">For large organizations</p>
                    <div className="mt-6">
                      <span className="text-4xl font-extrabold text-slate-900">Custom</span>
                    </div>
                    <ul className="mt-8 space-y-3 text-sm">
                      {["Unlimited Members", "Multi-Branch Support", "Custom Integrations", "API Access", "Dedicated Manager", "Premium Support"].map(f => (
                        <li key={f} className="flex items-center gap-2 text-slate-600">
                          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a href="#contact" className="w-full mt-8 py-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold hover:bg-slate-100 transition-all duration-300 block text-center text-sm text-slate-700">
                    Contact Sales
                  </a>
                </div>
              </>
            ) : (
              plans.map((plan, idx) => {
                const isHighlighted = idx === 1;
                const features = plan.features && plan.features.length > 0
                  ? plan.features
                  : [
                    `Up to ${plan.max_members ?? "Unlimited"} Members`,
                    `Up to ${plan.max_staff ?? "Unlimited"} Staff`,
                    "Basic Reports",
                  ];

                if (isHighlighted) {
                  return (
                    <div key={plan.id} className="rounded-2xl p-8 text-white shadow-xl relative flex flex-col h-full bg-blue-600 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                      <span className="absolute top-5 right-5 px-3 py-1 rounded-full bg-white text-blue-600 text-xs font-bold">MOST POPULAR</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        {plan.description && <p className="mt-1 text-white/70 text-sm">{plan.description}</p>}
                        <div className="mt-6">
                          <span className="text-5xl font-extrabold">₹{plan.monthly_price}</span>
                          <span className="text-white/70 ml-1 text-sm">/month</span>
                        </div>
                        <ul className="mt-8 space-y-3 text-sm">
                          {features.map((feat) => (
                            <li key={feat} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                              {feat}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link to="/register" className="w-full mt-8 py-3.5 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-all duration-300 block text-center text-sm">
                        Start Free Trial
                      </Link>
                    </div>
                  );
                }

                return (
                  <div key={plan.id} className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col h-full shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      {plan.description && <p className="mt-1 text-slate-500 text-sm">{plan.description}</p>}
                      <div className="mt-6">
                        <span className="text-5xl font-extrabold text-slate-900">₹{plan.monthly_price}</span>
                        <span className="text-slate-400 ml-1 text-sm">/month</span>
                      </div>
                      <ul className="mt-8 space-y-3 text-sm">
                        {features.map((feat) => (
                          <li key={feat} className="flex items-center gap-2 text-slate-600">
                            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link to="/register" className="w-full mt-8 py-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold hover:bg-slate-100 transition-all duration-300 block text-center text-sm text-slate-700">
                      Get Started
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="relative w-full overflow-hidden py-20 lg:py-24 bg-slate-50 scroll-mt-24" id="testimonials">
        <div className="w-full px-6 lg:px-12 xl:px-20 2xl:px-32">
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100">
              Customer Stories
            </span>
            <h2 className="mt-6 text-4xl lg:text-5xl font-bold text-slate-900">
              Loved By Growing<span className="text-blue-600"> Businesses</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              See how organizations are simplifying operations, managing memberships and increasing revenue.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="h-full bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-yellow-400 text-lg mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-slate-600 leading-relaxed text-sm">"Managing memberships, attendance and payments used to take hours every week. Now everything is automated and available in one dashboard."</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">RS</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Rajesh Sharma</h4>
                  <p className="text-slate-500 text-xs">Gym Owner</p>
                </div>
              </div>
            </div>
            <div className="h-full bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-yellow-400 text-lg mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-slate-600 leading-relaxed text-sm">"Subscription renewals and payment reminders are now completely automated. Our staff workload has reduced significantly."</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">PM</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Priya Mehta</h4>
                  <p className="text-slate-500 text-xs">Academy Director</p>
                </div>
              </div>
            </div>
            <div className="h-full bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-yellow-400 text-lg mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-slate-600 leading-relaxed text-sm">"The analytics and reporting tools help us understand member activity and business growth much better than before."</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">AV</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Amit Verma</h4>
                  <p className="text-slate-500 text-xs">Sports Club Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative w-full overflow-hidden py-20 lg:py-24 bg-blue-600 scroll-mt-24" id="contact">
        <div className="absolute inset-0 -z-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20 2xl:px-32">
          <div className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
            <span className="inline-block px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold">
              Start Today
            </span>
            <h2 className="mt-6 text-4xl lg:text-6xl font-bold text-white leading-tight">
              Ready To Grow Your<br />Subscription Business?
            </h2>
            <p className="mt-6 text-xl text-white/80">
              Join gyms, hostels, academies, clubs and other businesses using BeQwik to manage memberships, subscriptions, payments and attendance effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-10">
              <Link to="/register" className="px-8 py-4 rounded-xl bg-white text-blue-600 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Start 14-Day Free Trial →
              </Link>
              <a href="#features" className="px-8 py-4 rounded-xl border-2 border-white/60 text-white font-bold hover:bg-white/10 transition-all duration-300 hover:scale-105">
                Book a Demo
              </a>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12 text-white/70 text-sm">
              <div>✓ No Credit Card Required</div>
              <div>✓ 14-Day Free Trial</div>
              <div>✓ Cancel Anytime</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-slate-900 text-white">
        <div className="w-full px-6 lg:px-12 xl:px-20 2xl:px-32 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="inline-block bg-white rounded-2xl px-6 py-4 shadow-sm">
                <BeQwikLogo size={72} />
              </div>
              <p className="mt-5 text-slate-400 text-sm leading-relaxed max-w-md">
                A modern subscription management platform built for gyms, hostels, clubs, academies, swimming pools and other membership-based businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-slate-300 uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="hover:text-white cursor-pointer transition">Features</li>
                <li className="hover:text-white cursor-pointer transition">Pricing</li>
                <li className="hover:text-white cursor-pointer transition">Integrations</li>
                <li className="hover:text-white cursor-pointer transition">Updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-slate-300 uppercase tracking-wider">Solutions</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="hover:text-white cursor-pointer transition">Gyms</li>
                <li className="hover:text-white cursor-pointer transition">Hostels</li>
                <li className="hover:text-white cursor-pointer transition">Academies</li>
                <li className="hover:text-white cursor-pointer transition">Clubs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-slate-300 uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="hover:text-white cursor-pointer transition">About Us</li>
                <li className="hover:text-white cursor-pointer transition">Contact</li>
                <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition">Terms & Conditions</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">© 2026 BeQwik. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0 text-slate-400 text-sm">

            </div>

          </div>
        </div>
      </footer>
    </>
  );

}

export default LandingPage;
