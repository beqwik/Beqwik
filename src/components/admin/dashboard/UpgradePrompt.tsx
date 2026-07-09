import { Lock, ArrowUpRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface Props {
  featureName: string;
  requiredPlan?: string;
}

export default function UpgradePrompt({ featureName, requiredPlan = "Pro" }: Props) {
  const [, setSearchParams] = useSearchParams();

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/80 p-12 text-center shadow-[0_10px_30px_rgba(0,0,0,0.01)] max-w-2xl mx-auto my-8 flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          Feature Locked
        </h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">
          The <strong className="text-slate-800">{featureName}</strong> module is not available on your current subscription plan. Upgrade to the <span className="text-blue-600 font-semibold">{requiredPlan} Plan</span> to unlock advanced capabilities.
        </p>
      </div>

      <button
        onClick={() => setSearchParams({ tab: "subscriptions" })}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/15 transition-all hover:scale-105 cursor-pointer"
      >
        <span>Upgrade Subscription</span>
        <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
  );
}
