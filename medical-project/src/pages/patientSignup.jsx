// src/pages/patientSignup.jsx
// CHANGES FROM YOUR ORIGINAL:
//  1. Added password field
//  2. On AgreementModal accept → POST to /api/auth/patient/signup
//  3. Redirect to /dashboard/patient on success

import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import AgreementModal from "../components/AgreementModel";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5050";

const sanitizeText = (val) =>
  val.replace(/[<>\\;]/g, "");
const sanitizeNum = (val) => val.replace(/[^0-9.]/g, "");

const validators = {
  name:     (v) => /^[a-zA-Z\s'-]{2,60}$/.test(v)         ? "" : "Name must be 2–60 letters only.",
  age:      (v) => v >= 1 && v <= 120                       ? "" : "Age must be between 1 and 120.",
  gender:   (v) => ["Male", "Female", "Other"].includes(v)  ? "" : "Please select a gender.",
  weight:   (v) => !v || (v >= 1 && v <= 500)               ? "" : "Weight must be between 1–500 kg.",
  height:   (v) => !v || (v >= 30 && v <= 300)              ? "" : "Height must be between 30–300 cm.",
  history:  (v) => v.length <= 1000                         ? "" : "Max 1000 characters.",
  email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)    ? "" : "Enter a valid email.",
  password: (v) => v.length >= 8                            ? "" : "Password must be at least 8 characters.",
};

// ── Icons (unchanged) ─────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
const WeightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
);
const HeightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
  </svg>
);
const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

const getBMICategory = (bmi) => {
  if (!bmi) return null;
  const b = parseFloat(bmi);
  if (b < 18.5) return { label: "Underweight", color: "#3b82f6" };
  if (b < 25)   return { label: "Normal",      color: "#10b981" };
  if (b < 30)   return { label: "Overweight",  color: "#f59e0b" };
  return { label: "Obese", color: "#ef4444" };
};

const Field = ({ label, icon, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ color: "#0f4c5c", opacity: 0.7 }}>{icon}</span>
      {label}
    </label>
    {children}
    {error && (
      <span style={{ fontSize: "11.5px", color: "#dc2626", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: "4px" }}>
        ⚠ {error}
      </span>
    )}
  </div>
);

const inputStyle = (focused, error) => ({
  width: "100%", padding: "12px 14px", borderRadius: "10px",
  border: `1.5px solid ${error ? "#fca5a5" : focused ? "#0f4c5c" : "#e5e7eb"}`,
  background: focused ? "#f0f9fa" : "#fafafa", fontSize: "14px",
  fontFamily: "'Georgia', serif", color: "#1a1a2e", outline: "none",
  boxShadow: focused ? "0 0 0 3px rgba(15,76,92,0.1)" : "none",
  transition: "all 0.2s ease", boxSizing: "border-box",
});

export default function PatientSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", age: "", gender: "", weight: "", height: "",
    diabetic: false, bp: false, history: "", email: "", password: "",
  });
  const [errors, setErrors]           = useState({});
  const [focused, setFocused]         = useState("");
  const [showAgreement, setShowAgreement] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [step, setStep]               = useState(1);

  const accent = "#0f4c5c";

  const bmi = form.weight && form.height
    ? (parseFloat(form.weight) / ((parseFloat(form.height) / 100) ** 2)).toFixed(1)
    : "";
  const bmiCat = getBMICategory(bmi);

 const update = (field, raw, isNum = false) => {
  let val;

  if (field === "history") {
    val = raw;
  } else {
    val = isNum ? sanitizeNum(raw) : sanitizeText(raw);
  }

  setForm((f) => ({ ...f, [field]: val }));

  const err = validators[field]
    ? validators[field](isNum ? parseFloat(val) : val)
    : "";

  setErrors((e) => ({ ...e, [field]: err }));
};

  const handleSubmit = () => {
    const newErrors = {};
    Object.keys(validators).forEach((k) => {
      const isNum = ["age", "weight", "height"].includes(k);
      const err = validators[k](isNum ? parseFloat(form[k]) : form[k]);
      if (err) newErrors[k] = err;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setShowAgreement(true);
  };

  const handleAccept = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API}/api/auth/patient/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     form.name,
          email:    form.email,
          password: form.password,
          age:      parseInt(form.age),
          gender:   form.gender,
          weight:   form.weight ? parseFloat(form.weight) : null,
          height:   form.height ? parseFloat(form.height) : null,
          diabetic: form.diabetic,
          bp:       form.bp,
          history:  form.history,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Signup failed. Please try again.");
        setShowAgreement(false);
        setSubmitting(false);
        return;
      }
      localStorage.setItem("mc_token", data.token);
      localStorage.setItem("mc_user",  JSON.stringify(data.user));
      navigate("/dashboard/patient");
    } catch {
      setSubmitError("Cannot connect to server. Make sure Flask is running on port 5050.");
      setShowAgreement(false);
    }
    setSubmitting(false);
  };

  return (
    <div className="">
      <Navbar />
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9fa 0%, #e6eef0 50%, #f5f0eb 100%)", fontFamily: "Georgia, serif", position: "relative" }}>

        <div style={{ position: "fixed", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(15,76,92,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(220,38,38,0.04)", pointerEvents: "none" }} />

        <div style={{ background: accent, padding: "14px 32px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
          <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 3, fontFamily: "Courier New, monospace" }}>PATIENT REGISTRATION</span>
        </div>

        <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px 60px" }}>

          {submitError && (
            <div style={{ marginBottom: 16, padding: "14px 18px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 12, color: "#dc2626", fontSize: 13, fontFamily: "sans-serif" }}>
              ⚠ {submitError}
            </div>
          )}

          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Patient Profile</h1>
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0, fontFamily: "sans-serif" }}>Secure medical registration</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
              {["Personal Info", "Health Metrics", "Medical History"].map((s, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{ height: 3, borderRadius: 99, background: i < step ? accent : "#e5e7eb", transition: "background 0.3s ease" }} />
                  <span style={{ fontSize: 10, color: i < step ? accent : "#9ca3af", fontFamily: "sans-serif" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "white", borderRadius: 20, boxShadow: "0 20px 60px rgba(15,76,92,0.1)", padding: "32px 32px", overflow: "hidden" }}>

            {/* Personal */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ width: 3, height: 20, borderRadius: 99, background: accent }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: accent, textTransform: "uppercase", fontFamily: "sans-serif" }}>Personal Information</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Full Name" icon={<UserIcon />} error={errors.name}>
                  <input placeholder="e.g. Ahmed Khan" maxLength={60} value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                    style={inputStyle(focused === "name", errors.name)} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Age" icon={<CalIcon />} error={errors.age}>
                    <input type="number" placeholder="e.g. 32" min={1} max={120} value={form.age}
                      onChange={(e) => update("age", e.target.value, true)}
                      onFocus={() => setFocused("age")} onBlur={() => setFocused("")}
                      style={inputStyle(focused === "age", errors.age)} />
                  </Field>
                  <Field label="Gender" icon={<UserIcon />} error={errors.gender}>
                    <select value={form.gender} onChange={(e) => update("gender", e.target.value)}
                      onFocus={() => setFocused("gender")} onBlur={() => setFocused("")}
                      style={{ ...inputStyle(focused === "gender", errors.gender), appearance: "none", cursor: "pointer" }}>
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </Field>
                </div>
                {/* ── NEW: Email + Password ── */}
                <Field label="Email Address" icon={<UserIcon />} error={errors.email}>
                  <input type="email" placeholder="patient@email.com" value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                    style={inputStyle(focused === "email", errors.email)} />
                </Field>
                <Field label="Password" icon={<UserIcon />} error={errors.password}>
                  <input type="password" placeholder="Min. 8 characters" value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                    style={inputStyle(focused === "password", errors.password)} />
                </Field>
              </div>
            </div>

            <div style={{ height: 1, background: "linear-gradient(to right, transparent, #e5e7eb, transparent)", margin: "0 0 28px" }} />

            {/* Health Metrics (unchanged) */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ width: 3, height: 20, borderRadius: 99, background: "#ef4444" }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#ef4444", textTransform: "uppercase", fontFamily: "sans-serif" }}>Health Metrics</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Weight (kg)" icon={<WeightIcon />} error={errors.weight}>
                    <input type="number" placeholder="e.g. 70" min={1} max={500} value={form.weight}
                      onChange={(e) => update("weight", e.target.value, true)}
                      onFocus={() => setFocused("weight")} onBlur={() => setFocused("")}
                      style={inputStyle(focused === "weight", errors.weight)} />
                  </Field>
                  <Field label="Height (cm)" icon={<HeightIcon />} error={errors.height}>
                    <input type="number" placeholder="e.g. 175" min={30} max={300} value={form.height}
                      onChange={(e) => update("height", e.target.value, true)}
                      onFocus={() => setFocused("height")} onBlur={() => setFocused("")}
                      style={inputStyle(focused === "height", errors.height)} />
                  </Field>
                </div>

                {/* BMI */}
                <div style={{ borderRadius: 12, background: bmi ? "#e6f4f7" : "#f9fafb", border: `1.5px solid ${bmi ? "#a7d4db" : "#e5e7eb"}`, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: 1.5, fontFamily: "sans-serif", fontWeight: 700, textTransform: "uppercase" }}>BMI — Auto Calculated</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: bmiCat?.color || "#d1d5db", letterSpacing: "-1px", marginTop: 2 }}>{bmi || "—"}</div>
                  </div>
                  {bmiCat && (
                    <div style={{ padding: "6px 14px", borderRadius: 99, background: bmiCat.color, color: "white", fontSize: 12, fontWeight: 700, fontFamily: "sans-serif" }}>
                      {bmiCat.label}
                    </div>
                  )}
                </div>

                {/* Condition Toggles */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[{ key: "diabetic", label: "Diabetic", icon: "🩸" }, { key: "bp", label: "High Blood Pressure", icon: "💓" }].map(({ key, label, icon }) => (
                    <div key={key} onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                      style={{ padding: "14px 16px", borderRadius: 12, border: `2px solid ${form[key] ? "#ef4444" : "#e5e7eb"}`, background: form[key] ? "#fff5f5" : "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, userSelect: "none" }}>
                      <div style={{ fontSize: 18 }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: form[key] ? "#dc2626" : "#374151", fontFamily: "sans-serif" }}>{label}</div>
                        <div style={{ fontSize: 10, color: form[key] ? "#ef4444" : "#9ca3af", fontFamily: "sans-serif" }}>{form[key] ? "Yes" : "No"}</div>
                      </div>
                      <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", border: `2px solid ${form[key] ? "#ef4444" : "#d1d5db"}`, background: form[key] ? "#ef4444" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {form[key] && <svg viewBox="0 0 12 12" fill="none" width="9" height="9"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: "linear-gradient(to right, transparent, #e5e7eb, transparent)", margin: "0 0 28px" }} />

            {/* Medical History */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ width: 3, height: 20, borderRadius: 99, background: "#f59e0b" }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#b45309", textTransform: "uppercase", fontFamily: "sans-serif" }}>Medical History</span>
              </div>
              <Field label="Previous Serious Conditions" icon={<ClipboardIcon />} error={errors.history}>
                <textarea placeholder="Describe any prior surgeries, chronic illnesses, allergies…"
                  maxLength={1000} value={form.history}
                  onChange={(e) => update("history", e.target.value)}
                  onFocus={() => setFocused("history")} onBlur={() => setFocused("")}
                  rows={4} style={{ ...inputStyle(focused === "history", errors.history), resize: "vertical", lineHeight: 1.7 }} />
                <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "sans-serif", textAlign: "right" }}>{form.history.length}/1000</div>
              </Field>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={submitting}
              style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${accent} 0%, #1a6b7f 100%)`, color: "white", fontSize: 15, fontWeight: 700, fontFamily: "sans-serif", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, boxShadow: "0 8px 24px rgba(15,76,92,0.35)" }}>
              {submitting ? "Registering…" : "Continue to Agreement →"}
            </button>

            <p style={{ textAlign: "center", fontSize: 11.5, color: "#9ca3af", fontFamily: "sans-serif", marginTop: 14 }}>
              🔒 Your data is encrypted and never shared without consent.
            </p>
            <p style={{ textAlign: "center", fontSize: 11.5, color: "#9ca3af", fontFamily: "sans-serif", marginTop: 6 }}>
              Already registered? <a href="/login" style={{ color: accent, textDecoration: "underline" }}>Log in here</a>
            </p>
          </div>
        </div>

        {showAgreement && (
          <AgreementModal role="patient" onCancel={() => setShowAgreement(false)} onAccept={handleAccept} />
        )}

        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          * { box-sizing: border-box; }
        `}</style>
      </div>
    </div>
  );
}
