import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  IndianRupee, 
  TrendingUp, 
  Send, 
  FileText, 
  BellRing, 
  UserPlus, 
  Sparkles,
  Calendar
} from "lucide-react";

interface OverviewModuleProps {
  studentsCount: number;
  teachersCount: number;
  coursesCount: number;
  onNavigateTab: (tab: string) => void;
  onOpenTestEngine: () => void;
  onOpenFeeAutomation: () => void;
  onOpenAddStudent: () => void;
  onOpenCreateAnnouncement: () => void;
}

export default function OverviewModule({
  studentsCount,
  teachersCount,
  coursesCount,
  onNavigateTab,
  onOpenTestEngine,
  onOpenFeeAutomation,
  onOpenAddStudent,
  onOpenCreateAnnouncement
}: OverviewModuleProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── WELCOME SECTION ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            Welcome Back, Admin <span className="animate-bounce inline-block">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Here's what's happening with your learning platform today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200/80 px-3.5 py-2 rounded-[14px] shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select className="bg-transparent text-slate-700 text-xs font-bold focus:outline-none cursor-pointer">
              <option>This Month</option>
              <option>Last Quarter</option>
              <option>This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── ROW 1: 4 STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Students */}
        <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {studentsCount > 0 ? studentsCount.toLocaleString() : "1,248"}
            </h2>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 12.5%</span>
              <span className="text-slate-400 font-normal">from last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Teachers */}
        <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Teachers</span>
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {teachersCount > 0 ? teachersCount : "78"}
            </h2>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 8.2%</span>
              <span className="text-slate-400 font-normal">from last month</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Courses */}
        <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Courses</span>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {coursesCount > 0 ? coursesCount : "156"}
            </h2>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 7.3%</span>
              <span className="text-slate-400 font-normal">from last month</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              ₹2,45,000
            </h2>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 18.6%</span>
              <span className="text-slate-400 font-normal">from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: REVENUE GRAPH (45%), STUDENTS OVERVIEW (28%), FEE REMINDERS (27%) ── */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* 1. Monthly Revenue Overview Graph (5 cols / ~45%) */}
        <div className="lg:col-span-5 bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Monthly Revenue Overview</h3>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">Track platform earnings over time</p>
            </div>
            <select className="bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-[14px] focus:outline-none">
              <option>This Month</option>
            </select>
          </div>

          {/* Wide SVG Line Graph Graphic Simulation */}
          <div className="mt-6 relative h-48 w-full flex items-end justify-between px-2 pb-6 border-b border-slate-100">
            {/* Dashed Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
              <div className="border-b border-dashed border-slate-300 w-full" />
              <div className="border-b border-dashed border-slate-300 w-full" />
              <div className="border-b border-dashed border-slate-300 w-full" />
            </div>

            {/* SVG Curve */}
            <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 120">
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 10 90 Q 60 70, 100 75 T 180 80 T 240 60 T 290 20 L 290 120 L 10 120 Z"
                fill="url(#purpleGrad)"
              />
              <path
                d="M 10 90 Q 60 70, 100 75 T 180 80 T 240 60 T 290 20"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>

            {/* Tooltip Popup Dot */}
            <div className="absolute top-2 right-4 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-[12px] shadow-lg flex flex-col items-center animate-bounce">
              <span>Jul 2026</span>
              <span className="text-purple-300 font-black">₹2,45,000</span>
            </div>

            {/* Month ticks */}
            <div className="w-full flex justify-between text-xs font-semibold text-slate-400 mt-2 pt-2">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span className="text-purple-600 font-black">Jul</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
            <span>Revenue (₹)</span>
          </div>
        </div>

        {/* 2. Students Overview Donut Chart (3 cols / 25%) */}
        <div className="lg:col-span-3 bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Students Overview</h3>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">Status breakdown of enrolled students</p>
          </div>

          <div className="my-4 flex items-center justify-center relative py-2">
            {/* Donut Graphic Ring */}
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center border-[14px] border-indigo-600 border-t-amber-500 border-r-indigo-400 shadow-inner">
              <div className="text-center">
                <span className="text-2xl font-black text-slate-900 block leading-tight">1,248</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Students</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Active Students
              </span>
              <span className="font-bold text-slate-900">896 <span className="text-slate-400 font-normal">(71.8%)</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Inactive Students
              </span>
              <span className="font-bold text-slate-900">234 <span className="text-slate-400 font-normal">(18.8%)</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Trial Students
              </span>
              <span className="font-bold text-slate-900">118 <span className="text-slate-400 font-normal">(9.4%)</span></span>
            </div>
          </div>
        </div>

        {/* 3. Fee Reminders (Automation) Card (4 cols / 33%) */}
        <div className="lg:col-span-4 bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">Fee Reminders (Automation)</h3>
            <button 
              onClick={() => onNavigateTab("fees")}
              className="text-indigo-600 hover:text-indigo-800 text-xs font-extrabold"
            >
              View All
            </button>
          </div>

          {/* List of Due Students */}
          <div className="space-y-3 my-4">
            <div className="flex items-center justify-between p-3 rounded-[14px] bg-slate-50 border border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                  EJ
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Emma Johnson</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Class 10 - A</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-black block mb-0.5">Overdue</span>
                <span className="text-xs font-bold text-slate-900">₹15,000</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-[14px] bg-slate-50 border border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                  JS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">James Smith</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Class 8 - B</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black block mb-0.5">Due Soon</span>
                <span className="text-xs font-bold text-slate-900">₹12,000</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-[14px] bg-slate-50 border border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                  OB
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Olivia Brown</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Class 6 - A</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black block mb-0.5">Due Soon</span>
                <span className="text-xs font-bold text-slate-900">₹10,000</span>
              </div>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={onOpenFeeAutomation}
            className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-[14px] text-xs font-extrabold transition flex items-center justify-center gap-2 border border-indigo-200/60 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" /> Send All Reminders
          </button>
        </div>
      </div>

      {/* ── ROW 3: QUICK ACTIONS (4 cols), RECENT ACTIVITIES (4 cols), UPCOMING SCHEDULE (4 cols) ── */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* 1. Quick Action Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Quick Actions</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Action 1: Online Test Engine */}
            <button
              onClick={onOpenTestEngine}
              className="bg-purple-50 hover:bg-purple-100 border border-purple-200/60 p-4 rounded-[16px] text-left transition hover:scale-[1.02] shadow-2xs group"
            >
              <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-xs">Online Test Engine</h4>
              <p className="text-slate-500 text-[10px] mt-0.5 font-medium">Create & Conduct Tests</p>
            </button>

            {/* Action 2: Fee Reminder Automation */}
            <button
              onClick={onOpenFeeAutomation}
              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 p-4 rounded-[16px] text-left transition hover:scale-[1.02] shadow-2xs group"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md">
                <BellRing className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-xs">Fee Reminder Automation</h4>
              <p className="text-slate-500 text-[10px] mt-0.5 font-medium">Send Automated Reminders</p>
            </button>

            {/* Action 3: Add New Student */}
            <button
              onClick={onOpenAddStudent}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200/60 p-4 rounded-[16px] text-left transition hover:scale-[1.02] shadow-2xs group"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md">
                <UserPlus className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-xs">Add New Student</h4>
              <p className="text-slate-500 text-[10px] mt-0.5 font-medium">Register a new student</p>
            </button>

            {/* Action 4: Create Announcement */}
            <button
              onClick={onOpenCreateAnnouncement}
              className="bg-orange-50 hover:bg-orange-100 border border-orange-200/60 p-4 rounded-[16px] text-left transition hover:scale-[1.02] shadow-2xs group"
            >
              <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center mb-3 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-xs">Create Announcement</h4>
              <p className="text-slate-500 text-[10px] mt-0.5 font-medium">Notify users instantly</p>
            </button>
          </div>
        </div>

        {/* 2. Recent Activities Timeline (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-slate-900 text-base">Recent Activities</h3>
            <button onClick={() => onNavigateTab("reports")} className="text-indigo-600 text-xs font-bold hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-4 my-2">
            <div className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">New student "Liam Wilson" registered</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-medium">2 mins ago</span>
            </div>

            <div className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Test "Maths Quiz 1" conducted for Class 10 - A</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-medium">15 mins ago</span>
            </div>

            <div className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <BellRing className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Fee reminder sent to 15 students</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-medium">1 hour ago</span>
            </div>

            <div className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">New course "Advanced Physics" added</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-medium">2 hours ago</span>
            </div>
          </div>
        </div>

        {/* 3. Upcoming Schedule Timeline (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-slate-900 text-base">Upcoming Schedule</h3>
            <button onClick={() => onNavigateTab("timetable")} className="text-indigo-600 text-xs font-bold hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3.5 my-2">
            <div className="flex items-center justify-between text-xs p-3 rounded-[14px] bg-slate-50 border border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Maths Test - Class 10 - A</h4>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">24 Jul, 10:00 AM</span>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-[14px] bg-slate-50 border border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Science Assignment Due</h4>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">25 Jul, 11:59 PM</span>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-[14px] bg-slate-50 border border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Users className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Parent Teachers Meeting</h4>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">28 Jul, 04:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM UPGRADE LMS BANNER ── */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-indigo-950 text-white rounded-[20px] p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[16px] bg-gradient-to-tr from-amber-400 to-yellow-300 text-purple-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
            🏆
          </div>
          <div>
            <h3 className="text-lg font-extrabold">Unlock the Full Power of EduLMS!</h3>
            <p className="text-indigo-200 text-xs mt-0.5 max-w-xl font-medium">
              Upgrade to Premium and get access to advanced reports, custom domains, automated WhatsApp fee reminders, and priority support.
            </p>
          </div>
        </div>

        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-extrabold rounded-[14px] shadow-lg transition flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-amber-300" /> Upgrade Now
        </button>
      </div>
    </div>
  );
}
