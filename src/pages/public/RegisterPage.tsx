import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import BeQwikLogo from "../../components/BeQwikLogo";

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!agreed) { setError("Please agree to the Terms of Service."); return; }
    try {
      setLoading(true);
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, business_name: companyName, phone } },
      });
      if (signUpError) { setError(signUpError.message); return; }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const features = [
    { icon: "📈", color: "#eff6ff", title: "Automate Renewals", desc: "Never miss a renewal. Automated reminders and follow-ups." },
    { icon: "💳", color: "#f0fdf4", title: "Simplify Payments", desc: "Collect payments faster with multiple gateways and smart dunning." },
    { icon: "📊", color: "#faf5ff", title: "Powerful Analytics", desc: "Real-time insights to track growth, churn and revenue health." },
    { icon: "👥", color: "#fff7ed", title: "Customer Portal", desc: "Give your customers a seamless self-service experience." },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* LEFT PANEL */}
      <div style={{ width: "45%", minHeight: "100vh", background: "#f0f4ff", padding: "48px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
        {/* Decorative dots */}
        <div style={{ position: "absolute", bottom: 180, right: 32, display: "grid", gridTemplateColumns: "repeat(6, 8px)", gap: 8, opacity: 0.25 }}>
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#2563eb" }} />
          ))}
        </div>

        <div>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 48 }}>
            <BeQwikLogo size={60} />
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", lineHeight: 1.2, letterSpacing: "-1px", marginBottom: 16 }}>
            The smart way to manage<br />recurring revenue
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, marginBottom: 40, maxWidth: 360 }}>
            BeQwik helps businesses automate renewals, streamline payments, and grow predictable recurring revenue.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: "1px solid rgba(0,0,0,0.06)" }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trusted card + badges */}
        <div>
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #e2e8f0", marginBottom: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Trusted by growing businesses</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex" }}>
                {["#3b82f6", "#10b981", "#f59e0b", "#ef4444"].map((c, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: "2px solid #fff", marginLeft: i > 0 ? -10 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700 }}>
                    {["A", "B", "C", "+"][i]}
                  </div>
                ))}
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f1f5f9", border: "2px solid #fff", marginLeft: -10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#64748b", fontWeight: 700 }}>+1K</div>
              </div>
              <div>
                <div style={{ color: "#f59e0b", fontSize: 13 }}>★★★★★</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>4.9/5 from 1,200+ users</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { icon: "🛡️", label: "14-Day Free Trial", sub: "No credit card required" },
              { icon: "⚡", label: "Quick Setup", sub: "Get started in minutes" },
              { icon: "✕", label: "Cancel Anytime", sub: "No lock-in. No hassle." },
            ].map((b) => (
              <div key={b.label} style={{ flex: 1 }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{b.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{b.label}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 14, color: "#64748b" }}>Already have an account?{" "}
            <Link to="/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
          </span>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 48px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Create your BeQwik account</h2>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}>Start your 14-day free trial. No credit card required.</p>

            {success ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#15803d", marginBottom: 8 }}>Account Created!</div>
                <div style={{ fontSize: 14, color: "#166534" }}>Check your email to confirm your account.</div>
              </div>
            ) : (
              <form onSubmit={handleRegister}>
                {/* Row 1: Full name + Work email */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Full name</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>👤</span>
                      <input
                        type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                        placeholder="Enter your full name"
                        style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#fff" }}
                        onFocus={e => e.target.style.borderColor = "#2563eb"}
                        onBlur={e => e.target.style.borderColor = "#d1d5db"}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Work email</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>✉️</span>
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="Enter your work email"
                        style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#fff" }}
                        onFocus={e => e.target.style.borderColor = "#2563eb"}
                        onBlur={e => e.target.style.borderColor = "#d1d5db"}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Company name + Phone */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Company name</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>🏢</span>
                      <input
                        type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                        placeholder="Enter your company name"
                        style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#fff" }}
                        onFocus={e => e.target.style.borderColor = "#2563eb"}
                        onBlur={e => e.target.style.borderColor = "#d1d5db"}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Phone number <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>📱</span>
                      <input
                        type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#fff" }}
                        onFocus={e => e.target.style.borderColor = "#2563eb"}
                        onBlur={e => e.target.style.borderColor = "#d1d5db"}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Password + Confirm password */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>🔒</span>
                      <input
                        type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                        placeholder="Create a password"
                        style={{ width: "100%", padding: "11px 40px 11px 36px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#fff" }}
                        onFocus={e => e.target.style.borderColor = "#2563eb"}
                        onBlur={e => e.target.style.borderColor = "#d1d5db"}
                      />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14, padding: 0 }}>
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Confirm password</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>🔒</span>
                      <input
                        type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                        placeholder="Confirm your password"
                        style={{ width: "100%", padding: "11px 40px 11px 36px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#fff" }}
                        onFocus={e => e.target.style.borderColor = "#2563eb"}
                        onBlur={e => e.target.style.borderColor = "#d1d5db"}
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14, padding: 0 }}>
                        {showConfirm ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security notice */}
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>🛡️</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d", marginBottom: 2 }}>Your data is safe with BeQwik</div>
                    <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.5 }}>We use enterprise-grade security to protect your information and ensure compliance.</div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#dc2626", display: "flex", gap: 8, alignItems: "center" }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Terms checkbox */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#2563eb", cursor: "pointer", flexShrink: 0 }} />
                  <label htmlFor="terms" style={{ fontSize: 13, color: "#64748b", cursor: "pointer" }}>
                    I agree to the <a href="#" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Terms of Service</a> and <a href="#" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</a>
                  </label>
                </div>

                {/* Create account button */}
                <button type="submit" disabled={loading}
                  style={{ width: "100%", padding: "14px", borderRadius: 10, background: loading ? "#93c5fd" : "#2563eb", color: "#fff", fontWeight: 700, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s", marginBottom: 20 }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#1d4ed8"; }}
                  onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#2563eb"; }}
                >
                  {loading ? "Creating account…" : "Create account →"}
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                  <span style={{ fontSize: 13, color: "#9ca3af", whiteSpace: "nowrap" }}>or sign up with</span>
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                </div>

                {/* Social buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                  <button type="button" onClick={handleGoogleSignup}
                    style={{ padding: "12px", borderRadius: 10, border: "1px solid #d1d5db", background: "#fff", fontWeight: 600, fontSize: 14, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#fff"}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  <button type="button"
                    style={{ padding: "12px", borderRadius: 10, border: "1px solid #d1d5db", background: "#fff", fontWeight: 600, fontSize: 14, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#fff"}
                  >
                    <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                      <path d="M0 0h10v10H0z" fill="#F25022"/><path d="M11 0h10v10H11z" fill="#7FBA00"/><path d="M0 11h10v10H0z" fill="#00A4EF"/><path d="M11 11h10v10H11z" fill="#FFB900"/>
                    </svg>
                    Continue with Microsoft
                  </button>
                </div>

                <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", lineHeight: 1.6 }}>
                  By creating an account, you agree to receive product updates and marketing emails from BeQwik. You can unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;