
interface DefaultSectionProps {
  activeTab: string;
  organizationId?: string;
}

export default function DefaultSection({ activeTab, organizationId }: DefaultSectionProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-sm animate-fadeIn">
      <div className="text-5xl">🛠️</div>
      <h3 className="text-xl font-bold text-slate-800">
        Sub-Dashboard Under Construction
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed">
        The tab <span className="font-mono bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-xs">"{activeTab}"</span> is dynamically loaded, but no custom panel has been registered for this configuration yet.
      </p>
      <div className="pt-4 text-xs text-slate-400">
        Organization ID: {organizationId || "N/A"}
      </div>
    </div>
  );
}
