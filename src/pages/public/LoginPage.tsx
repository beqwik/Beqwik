import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import BeQwikLogo from "../../components/BeQwikLogo";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    try {
      setLoading(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        if (signInError.message.toLowerCase().includes("invalid login")) {
          setError("Incorrect email or password. Please try again.");
        } else if (signInError.message.toLowerCase().includes("email not confirmed")) {
          setError("Please confirm your email before logging in.");
        } else {
          setError(signInError.message);
        }
        return;
      }
      navigate("/auth/callback");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) console.error(error);
  };

  const handleForgotPassword = async () => {
    if (!email) { setError("Enter your email above first, then click Forgot password?"); return; }
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { setError(error.message); } else { setForgotSent(true); }
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
        <div style={{ position: "absolute", bottom: 280, right: 32, display: "grid", gridTemplateColumns: "repeat(6, 8px)", gap: 8, opacity: 0.25 }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }}>
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

        {/* Dashboard mockup card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#2563eb" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>BeQwik</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              {["#e2e8f0","#e2e8f0","#e2e8f0"].map((c,i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Total Revenue</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>₹24,80,500</div>
              <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>↑ 19.6%</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Active Customers</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>1,080</div>
              <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>↑ 6.7%</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>Revenue Overview</div>
          <svg width="100%" height="64" viewBox="0 0 260 64" fill="none" style={{ display: "block" }}>
            <path d="M0,55 L30,50 L60,48 L90,40 L120,35 L150,42 L180,28 L210,18 L240,8 L260,4" stroke="#2563eb" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0,55 L30,50 L60,48 L90,40 L120,35 L150,42 L180,28 L210,18 L240,8 L260,4 L260,64 L0,64Z" fill="url(#g1)" />
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 14, color: "#64748b" }}>New to BeQwik?{" "}
            <Link to="/register" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Create your account</Link>
          </span>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px" }}>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Welcome back 👋</h2>
            <p style={{ fontSize: 15, color: "#64748b", marginBottom: 36 }}>Sign in to your BeQwik account</p>

            <form onSubmit={handleEmailLogin}>
              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email address</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>✉️</span>
                  <input
                    id="login-email" type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); setForgotSent(false); }}
                    placeholder="Enter your email" autoComplete="email" required
                    style={{ width: "100%", padding: "13px 14px 13px 40px", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 15, color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#fff" }}
                    onFocus={e => e.target.style.borderColor = "#2563eb"}
                    onBlur={e => e.target.style.borderColor = "#d1d5db"}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Password</label>
                  <button type="button" onClick={handleForgotPassword}
                    style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>🔒</span>
                  <input
                    id="login-password" type={showPassword ? "text" : "password"} value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter your password" autoComplete="current-password" required
                    style={{ width: "100%", padding: "13px 46px 13px 40px", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 15, color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#fff" }}
                    onFocus={e => e.target.style.borderColor = "#2563eb"}
                    onBlur={e => e.target.style.borderColor = "#d1d5db"}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 15, padding: 0 }}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#2563eb" }} />
                  <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Remember me</span>
                </label>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Keep me signed in for 30 days</span>
              </div>

              {/* Forgot-sent */}
              {forgotSent && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#15803d", display: "flex", gap: 8 }}>
                  ✅ Reset link sent — check your inbox.
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#dc2626", display: "flex", gap: 8 }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Sign In button */}
              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "14px", borderRadius: 10, background: loading ? "#93c5fd" : "#2563eb", color: "#fff", fontWeight: 700, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20, transition: "background 0.15s" }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#1d4ed8"; }}
                onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#2563eb"; }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Signing in…
                  </>
                ) : "Sign in →"}
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                <span style={{ fontSize: 13, color: "#9ca3af", whiteSpace: "nowrap" }}>or continue with</span>
                <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              </div>

              {/* Social buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                <button type="button" onClick={handleGoogleLogin}
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
                    <path d="M0 0h10v10H0z" fill="#F25022"/><path d="M11 0h10v10H11z" fill="#7FBA00"/>
                    <path d="M0 11h10v10H0z" fill="#00A4EF"/><path d="M11 11h10v10H11z" fill="#FFB900"/>
                  </svg>
                  Continue with Microsoft
                </button>
              </div>

              {/* Security badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>🛡️</span>
                <span style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>Your data is secure with enterprise-grade encryption and compliance.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;