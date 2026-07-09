import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerMember } from "@/services/member/memberAuth";

export default function MemberRegisterForm() {
  const navigate = useNavigate();
  const [organizationCode, setOrganizationCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await registerMember({
      organizationCode,
      fullName,
      email,
      phone,
      password,
    });

    setLoading(false);

    if (result.success) {
      alert("Account created successfully! You can now log in.");
      navigate("/member/login");
    } else {
      alert("Registration failed: " + String(result.error));
      console.log(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="w-full h-13 px-5 py-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
        placeholder="Organization Code"
        value={organizationCode}
        onChange={(e) => setOrganizationCode(e.target.value)}
        required
      />

      <input
        className="w-full h-13 px-5 py-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <input
        type="email"
        className="w-full h-13 px-5 py-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="tel"
        className="w-full h-13 px-5 py-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="password"
        className="w-full h-13 px-5 py-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
        placeholder="Create Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <p className="text-center text-slate-500 text-sm">
        Already registered?{" "}
        <Link
          to="/member/login"
          className="text-blue-600 font-semibold hover:underline"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}