interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side */}
        <div className="hidden md:flex flex-col">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Manage Membership
            <br />
            Business
            <br />
            At Scale
          </h1>

          <p className="text-slate-400 mt-6 text-lg">
            Built for Gyms, Hostels, Clubs & More.
          </p>

          <div className="mt-10 space-y-3 text-slate-500">
            <p>✓ Member Management</p>
            <p>✓ Attendance Tracking</p>
            <p>✓ Subscription Billing</p>
            <p>✓ Trainer Management</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex justify-center">
          {children}
        </div>

      </div>
    </div>
  );
}