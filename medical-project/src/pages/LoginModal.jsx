// src/pages/LoginModal.jsx
// A proper login page at /login
// Works for both doctors and patients using the same endpoint.

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar";

const API = import.meta.env.VITE_API_URL;

export default function LoginModal() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "", role: "patient" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); setLoading(false); return; }

      localStorage.setItem("mc_token", data.token);
      localStorage.setItem("mc_user",  JSON.stringify(data.user));

      // Redirect based on role
      navigate(data.user.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient");
    } catch {
      setError("Cannot connect to server. Make sure Flask is running on port 5050.");
    }
    setLoading(false);
  };

  const accent = form.role === "doctor" ? "#1e3a5f" : "#0f4c5c";

  return (
    <div>
      <Navbar />
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9fa 0%, #e6eef0 50%, #f5f0eb 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", fontFamily: "Georgia, serif" }}>

        <div style={{ width: "100%", maxWidth: 420, background: "white", borderRadius: 24, boxShadow: "0 24px 80px rgba(0,0,0,0.1)", overflow: "hidden" }}>

          {/* Header bar */}
          <div style={{ background: accent, padding: "20px 32px", transition: "background 0.3s ease" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
            </div>
            <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>
              Welcome Back
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: "4px 0 0", fontFamily: "sans-serif" }}>
              Sign in to Medical Portal
            </p>
          </div>

          <div style={{ padding: "32px" }}>

            {/* Role selector */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
              {[["patient", "🩺 Patient"], ["doctor", "👨‍⚕️ Doctor"]].map(([r, label]) => (
                <button key={r} type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  style={{
                    padding: "10px", borderRadius: 10, border: `2px solid ${form.role === r ? accent : "#e5e7eb"}`,
                    background: form.role === r ? `${accent}12` : "#fafafa",
                    color: form.role === r ? accent : "#6b7280",
                    fontWeight: 700, fontSize: 13, fontFamily: "sans-serif",
                    cursor: "pointer", transition: "all 0.2s ease",
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: "12px 16px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, color: "#dc2626", fontSize: 13, fontFamily: "sans-serif" }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif" }}>
                  Email Address
                </label>
                <input type="email" required placeholder="your@email.com"
                  value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fafafa", fontSize: 14, fontFamily: "Georgia, serif", color: "#1a1a2e", outline: "none", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif" }}>
                  Password
                </label>
                <input type="password" required placeholder="Your password"
                  value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fafafa", fontSize: 14, fontFamily: "Georgia, serif", color: "#1a1a2e", outline: "none", boxSizing: "border-box" }} />
              </div>

              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: "white", fontSize: 15, fontWeight: 700, fontFamily: "sans-serif", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: `0 8px 24px ${accent}44`, marginTop: 4 }}>
                {loading ? "Signing in…" : "Sign In →"}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#9ca3af", fontFamily: "sans-serif" }}>
              Don't have an account?{" "}
              <Link to="/doctor-signup" style={{ color: accent, textDecoration: "none", fontWeight: 600 }}>Doctor</Link>
              {" or "}
              <Link to="/patient-signup" style={{ color: accent, textDecoration: "none", fontWeight: 600 }}>Patient</Link>
              {" signup"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
