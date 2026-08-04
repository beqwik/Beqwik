import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerMember } from "@/services/member/memberAuth";
import {
  verifyOrganizationCode,
  verifyStaffCode,
  createStudent,
  createStaffMember
} from "@/services/organization/academyService";
import { CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, Loader2, AlertTriangle, UserCheck, GraduationCap } from "lucide-react";

export default function MemberRegisterForm() {
  const navigate = useNavigate();

  // Step state (1: Verify Code, 2: Complete Details)
  const [step, setStep] = useState<1 | 2>(1);

  // Verification states
  const [organizationCode, setOrganizationCode] = useState("");
  const [verifiedOrg, setVerifiedOrg] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Role state for Academy organizations ("student" | "staff")
  const [academyRole, setAcademyRole] = useState<"student" | "staff">("student");
  const [staffCode, setStaffCode] = useState("");

  // Common User Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  // Step 1: Handle Organization Code Verification
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationCode.trim()) {
      setVerifyError("Please enter an Organization Code.");
      return;
    }

    try {
      setVerifying(true);
      setVerifyError("");
      const res = await verifyOrganizationCode(organizationCode);
      if (res.success && res.organization) {
        setVerifiedOrg(res.organization);
        setStep(2);
      } else {
        setVerifyError(res.error || "Invalid Organization Code.");
      }
    } catch (err) {
      console.error(err);
      setVerifyError("Failed to verify Organization Code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // Step 2: Handle Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    const orgTypeStr = (verifiedOrg?.organization_type || verifiedOrg?.category || verifiedOrg?.type || "").toLowerCase();
    const isAcademy = orgTypeStr.includes("academy") || orgTypeStr.includes("school") || orgTypeStr.includes("college") || orgTypeStr.includes("hostel");

    try {
      setSubmitting(true);
      setSubmitError("");

      // If Academy & Staff is selected, verify the Staff ID allotted by Admin
      if (isAcademy && academyRole === "staff") {
        if (!staffCode.trim()) {
          setSubmitError("Staff ID is required for faculty registration. Please enter the Staff ID allotted by your admin.");
          setSubmitting(false);
          return;
        }

        const staffRes = await verifyStaffCode(verifiedOrg.id, staffCode);
        if (!staffRes.success) {
          setSubmitError(staffRes.error || "Invalid Staff ID. Please check the Staff ID allotted by your admin.");
          setSubmitting(false);
          return;
        }
      }

      // Perform user registration
      const result = await registerMember({
        organizationCode: verifiedOrg?.organization_code || organizationCode,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),
        role: isAcademy ? academyRole : "member"
      });

      if (result.success) {
        // DB table syncing for Academy
        if (isAcademy) {
          if (academyRole === "student") {
            await createStudent(verifiedOrg.id, {
              full_name: fullName.trim(),
              email: email.trim(),
              phone: phone.trim()
            });
          } else if (academyRole === "staff") {
            await createStaffMember(verifiedOrg.id, {
              full_name: fullName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              role: "staff"
            });
          }
        }

        setRegisterSuccess("Account created successfully! Redirecting to sign in...");
        setTimeout(() => {
          navigate("/member/login");
        }, 400);
      } else {
        setSubmitError(sanitizeErrorMessage(result.error));
      }
    } catch (err) {
      console.error(err);
      setSubmitError(sanitizeErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetStep = () => {
    setStep(1);
    setVerifiedOrg(null);
    setVerifyError("");
    setSubmitError("");
  };

  const renderOrgTypeStr = (verifiedOrg?.organization_type || verifiedOrg?.category || verifiedOrg?.type || "").toLowerCase();
  const isAcademy = renderOrgTypeStr.includes("academy") || renderOrgTypeStr.includes("school") || renderOrgTypeStr.includes("college") || renderOrgTypeStr.includes("hostel");

  return (
    <div className="space-y-5">
      {/* Step 1 Form: Organization Code Input */}
      {step === 1 && (
        <form onSubmit={handleVerifyCode} className="space-y-5 animate-fadeIn">
          {verifyError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-[14px] text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{verifyError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Organization Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className="w-full h-14 px-5 rounded-xl border border-slate-200 text-slate-900 font-bold placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 uppercase tracking-wider"
              placeholder="e.g. HOC002"
              value={organizationCode}
              onChange={(e) => setOrganizationCode(e.target.value)}
              required
              autoFocus
            />
            <p className="text-slate-400 text-xs mt-1.5 font-medium">
              Enter the Organization Code provided by your academy or admin.
            </p>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {verifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying Organization Code...</span>
              </>
            ) : (
              <>
                <span>Verify & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-slate-500 text-sm pt-2">
            Already registered?{" "}
            <Link to="/member/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      )}

      {/* Step 2 Form: Role Selection & User Details */}
      {step === 2 && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fadeIn">
          {/* Verified Org Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-[16px] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  {verifiedOrg.name}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800 text-[10px] font-extrabold uppercase">
                    {verifiedOrg.organization_type}
                  </span>
                </p>
                <p className="text-[11px] font-medium text-emerald-700">Code: {verifiedOrg.organization_code}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetStep}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
            >
              Change Code
            </button>
          </div>

          {submitError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-[14px] text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {registerSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-[14px] text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{registerSuccess}</span>
            </div>
          )}

          {/* Role Selection Pill Switch (For Academy Organizations) */}
          {isAcademy && (
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Select Your Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-[16px] border border-slate-200">
                <button
                  type="button"
                  onClick={() => setAcademyRole("student")}
                  className={`py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                    academyRole === "student"
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAcademyRole("staff")}
                  className={`py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                    academyRole === "staff"
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Faculty / Staff</span>
                </button>
              </div>
            </div>
          )}

          {/* Staff ID Input (If Staff is selected for Academy) */}
          {isAcademy && academyRole === "staff" && (
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                Staff ID (Allotted by Admin) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-12 px-4 rounded-xl border border-indigo-200 bg-indigo-50/40 text-slate-900 font-extrabold uppercase placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition"
                placeholder="e.g. STF-1234"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                required
              />
              <p className="text-slate-400 text-[11px] mt-1 font-medium">
                Enter your official Staff ID code assigned by the academy administration.
              </p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <input
              type="text"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Email Address */}
          <div>
            <input
              type="email"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <input
              type="tel"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={submitting}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-slate-500 text-xs pt-2">
            Already registered?{" "}
            <Link to="/member/login" className="text-blue-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}