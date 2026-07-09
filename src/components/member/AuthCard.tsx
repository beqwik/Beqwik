interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8">

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="text-slate-400 mt-2">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}