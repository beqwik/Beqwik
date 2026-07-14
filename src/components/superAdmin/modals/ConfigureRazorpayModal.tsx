import { useEffect, useState } from "react";
import { CreditCard, Eye, EyeOff, Key, Lock, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { getRazorpayConfig, saveRazorpayConfig, deleteRazorpayConfig } from "../../../services/superAdmin/razorpayConfigService";

interface ConfigureRazorpayModalProps {
  open: boolean;
  onClose: () => void;
  organization: any;
}

export default function ConfigureRazorpayModal({
  open,
  onClose,
  organization,
}: ConfigureRazorpayModalProps) {
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (open && organization?.id) {
      fetchConfig();
    } else {
      setKeyId("");
      setKeySecret("");
      setStatus(null);
    }
  }, [open, organization]);

  async function fetchConfig() {
    setFetching(true);
    setStatus(null);
    try {
      const config = await getRazorpayConfig(organization.id);
      if (config) {
        setKeyId(config.razorpay_key_id || "");
        setKeySecret(config.razorpay_key_secret || "");
      } else {
        setKeyId("");
        setKeySecret("");
      }
    } catch (e: any) {
      setStatus({ type: "error", message: "Failed to load Razorpay settings." });
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!organization?.id) return;
    if (!keyId || !keySecret) {
      setStatus({ type: "error", message: "Both Key ID and Key Secret are required." });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      const result = await saveRazorpayConfig({
        organization_id: organization.id,
        razorpay_key_id: keyId.trim(),
        razorpay_key_secret: keySecret.trim(),
      });
      if (result.success) {
        setStatus({ type: "success", message: "Razorpay credentials updated successfully!" });
      } else {
        setStatus({ type: "error", message: result.error || "Failed to save credentials." });
      }
    } catch (e: any) {
      setStatus({ type: "error", message: e.message || "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!organization?.id) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to remove Razorpay credentials for ${organization.organization_name}? Members will no longer be able to pay online.`
    );
    if (!confirmDelete) return;

    setDeleting(true);
    setStatus(null);
    try {
      const result = await deleteRazorpayConfig(organization.id);
      if (result.success) {
        setKeyId("");
        setKeySecret("");
        setStatus({ type: "success", message: "Razorpay credentials deleted successfully." });
      } else {
        setStatus({ type: "error", message: result.error || "Failed to delete credentials." });
      }
    } catch (e: any) {
      setStatus({ type: "error", message: e.message || "An unexpected error occurred." });
    } finally {
      setDeleting(false);
    }
  }

  if (!open || !organization) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-2xl border border-slate-100 animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition text-lg font-bold"
        >
          ✕
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Razorpay <span className="text-blue-600">Gateway</span>
            </h3>
            <p className="text-slate-500 font-medium text-xs">
              Configure payment credentials for {organization.organization_name}
            </p>
          </div>
        </div>

        <hr className="border-slate-100 my-5" />

        {/* Status Message */}
        {status && (
          <div
            className={`p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm font-semibold border ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                : "bg-rose-50 text-rose-800 border-rose-100"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {fetching ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-xs font-semibold">Loading configuration...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Key ID Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                Razorpay Key ID
              </label>
              <input
                type="text"
                required
                placeholder="rzp_test_... or rzp_live_..."
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            {/* Key Secret Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Razorpay Key Secret
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  required
                  placeholder="Enter secret key"
                  value={keySecret}
                  onChange={(e) => setKeySecret(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Alert */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500 font-medium leading-relaxed">
              💡 <strong>Note:</strong> Key ID will be exposed during checkout to build the Razorpay UI, but the Secret remains encrypted server-side to guarantee secure verification.
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
              {keyId && keySecret ? (
                <button
                  type="button"
                  disabled={deleting || saving}
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-sm font-bold transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Config
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Config"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
