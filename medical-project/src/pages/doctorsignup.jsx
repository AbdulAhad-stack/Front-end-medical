// src/pages/doctorsignup.jsx
// CHANGES FROM YOUR ORIGINAL:
//  1. Added password field
//  2. On AgreementModal accept → POST to /api/auth/doctor/signup
//  3. Save token + user to AuthContext
//  4. Redirect to /dashboard/doctor instead of /successpagedoctor

import { useState, useRef } from "react";
import Navbar from "../components/navbar";
import AgreementModal from "../components/AgreementModel";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5050";

const sanitizeText = (val) =>
  val.replace(/[<>\\;]/g, "");

const sanitizeNum = (val) => val.replace(/[^0-9]/g, "");
const currentYear = new Date().getFullYear();

const validators = {
  name:       (v) => /^[a-zA-Z\s'.]{2,60}$/.test(v)       ? "" : "Name must be 2–60 letters only.",
  age:        (v) => v >= 22 && v <= 80                     ? "" : "Age must be between 22 and 80.",
  experience: (v) => v >= 0 && v <= 60                      ? "" : "Experience must be 0–60 years.",
  speciality: (v) => v.length >= 3 && v.length <= 80        ? "" : "Speciality must be 3–80 characters.",
  university: (v) => v.length >= 3 && v.length <= 120       ? "" : "University must be 3–120 characters.",
  gradYear:   (v) => v >= 1960 && v <= currentYear          ? "" : `Year must be 1960–${currentYear}.`,
  email:      (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)  ? "" : "Enter a valid email.",
  password:   (v) => v.length >= 8                          ? "" : "Password must be at least 8 characters.",
};

const Field = ({ label, icon, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
      <span className="text-blue-900 opacity-60">{icon}</span>
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
  </div>
);

const baseInput =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-serif placeholder-slate-400 focus:outline-none focus:border-blue-900 focus:bg-blue-50 focus:ring-2 focus:ring-blue-900/10 transition-all duration-200";

const SVG = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

export default function DoctorSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [captchaA] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaInput, setCaptchaInput] = useState("");
  const [showAgreement, setShowAgreement] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: "", age: "", experience: "", speciality: "",
    university: "", gradYear: "", email: "", password: "",
  });

  const update = (field, raw, isNum = false) => {
    const val = isNum ? sanitizeNum(raw) : sanitizeText(raw);
    setForm((f) => ({ ...f, [field]: val }));
    const err = validators[field]?.(isNum ? parseFloat(val) : val) ?? "";
    setErrors((e) => ({ ...e, [field]: err }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setFileError("Only JPG, PNG, or WEBP images are allowed.");
      e.target.value = ""; setFileName(""); return;
    }
    if (file.size > 30000) {
      setFileError("Degree photo must be under 30KB.");
      e.target.value = ""; setFileName(""); return;
    }
    setFileError(""); setFileName(file.name);
  };

  const handleSubmit = () => {
    const newErrors = {};
    Object.entries(validators).forEach(([k, fn]) => {
      const isNum = ["age", "experience", "gradYear"].includes(k);
      const err = fn(isNum ? parseFloat(form[k]) : form[k]);
      if (err) newErrors[k] = err;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (parseInt(captchaInput) !== captchaA + captchaB) {
      setErrors((e) => ({ ...e, captcha: "Incorrect answer. Please try again." }));
      return;
    }
    setShowAgreement(true);
  };

  // ── Called when doctor clicks "I Agree" in the modal ─────────────────────
  const handleAccept = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API}/api/auth/doctor/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:       form.name,
          email:      form.email,
          password:   form.password,
          age:        parseInt(form.age),
          experience: parseInt(form.experience),
          speciality: form.speciality,
          university: form.university,
          grad_year:  parseInt(form.gradYear),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Signup failed. Please try again.");
        setShowAgreement(false);
        setSubmitting(false);
        return;
      }
      // Save token to context/localStorage
      localStorage.setItem("mc_token", data.token);
      localStorage.setItem("mc_user", JSON.stringify(data.user));
      navigate("/dashboard/doctor");
    } catch {
      setSubmitError("Cannot connect to server. Make sure Flask is running on port 5050.");
      setShowAgreement(false);
    }
    setSubmitting(false);
  };

  const sectionBar = (color) => <div className={`w-1 h-5 rounded-full ${color}`} />;

  return (
    <div className="">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 font-serif relative overflow-hidden">

        <div className="fixed top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-blue-900/5 pointer-events-none" />
        <div className="fixed bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-red-500/4 pointer-events-none" />

        <div className="bg-blue-900 px-8 py-4 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-auto text-white/40 text-xs tracking-[3px] font-mono uppercase">Doctor Registration Portal</span>
        </div>

        <div className="max-w-[560px] mx-auto px-4 py-10 pb-20">

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 flex items-center justify-center shadow-lg shadow-blue-900/30 shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Doctor Profile</h1>
              <p className="text-sm text-slate-400 font-sans">Verified medical practitioner registration</p>
            </div>
          </div>

          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-sans">
              ⚠ {submitError}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 ring-1 ring-slate-100 overflow-hidden">

            {/* Section 1: Personal */}
            <div className="px-8 pt-8 pb-6">
              <div className="flex items-center gap-2 mb-5">
                {sectionBar("bg-blue-900")}
                <span className="text-xs font-bold uppercase tracking-[2px] text-blue-900 font-sans">Personal Information</span>
              </div>
              <div className="flex flex-col gap-4">
                <Field label="Full Name" error={errors.name}
                  icon={<SVG d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />}>
                  <input placeholder="Dr. Ahmed Khan" maxLength={60} value={form.name}
                    onChange={(e) => update("name", e.target.value)} className={baseInput} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Age" error={errors.age}
                    icon={<SVG d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />}>
                    <input type="number" placeholder="e.g. 35" min={22} max={80} value={form.age}
                      onChange={(e) => update("age", e.target.value, true)} className={baseInput} />
                  </Field>
                  <Field label="Experience (yrs)" error={errors.experience}
                    icon={<SVG d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.499z" />}>
                    <input type="number" placeholder="e.g. 10" min={0} max={60} value={form.experience}
                      onChange={(e) => update("experience", e.target.value, true)} className={baseInput} />
                  </Field>
                </div>

                <Field label="Email Address" error={errors.email}
                  icon={<SVG d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />}>
                  <input type="email" placeholder="doctor@hospital.com" maxLength={120} value={form.email}
                    onChange={(e) => update("email", e.target.value)} className={baseInput} />
                </Field>

                {/* ── NEW: Password field ── */}
                <Field label="Password" error={errors.password}
                  icon={<SVG d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />}>
                  <input type="password" placeholder="Min. 8 characters" value={form.password}
                    onChange={(e) => update("password", e.target.value)} className={baseInput} />
                </Field>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-8" />

            {/* Section 2: Credentials */}
            <div className="px-8 py-6">
              <div className="flex items-center gap-2 mb-5">
                {sectionBar("bg-emerald-500")}
                <span className="text-xs font-bold uppercase tracking-[2px] text-emerald-700 font-sans">Medical Credentials</span>
              </div>
              <div className="flex flex-col gap-4">
                <Field label="Speciality" error={errors.speciality}
                  icon={<SVG d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />}>
                  <input placeholder="e.g. Cardiology" maxLength={80} value={form.speciality}
                    onChange={(e) => update("speciality", e.target.value)} className={baseInput} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="University" error={errors.university}
                    icon={<SVG d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />}>
                    <input placeholder="e.g. Aga Khan Univ." maxLength={120} value={form.university}
                      onChange={(e) => update("university", e.target.value)} className={baseInput} />
                  </Field>
                  <Field label="Grad Year" error={errors.gradYear}
                    icon={<SVG d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493" />}>
                    <input type="number" placeholder={`e.g. ${currentYear - 5}`} min={1960} max={currentYear}
                      value={form.gradYear} onChange={(e) => update("gradYear", e.target.value, true)} className={baseInput} />
                  </Field>
                </div>

                {/* File Upload (unchanged from your original) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 font-sans flex items-center gap-2">
                    <span className="text-blue-900 opacity-60">
                      <SVG d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </span>
                    Degree Photo
                  </label>
                  <div onClick={() => fileRef.current.click()}
                    className={`w-full border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${fileName ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-blue-900 hover:bg-blue-50"}`}>
                    {fileName ? (
                      <><span className="text-emerald-600 text-xl">✓</span>
                        <span className="text-xs text-emerald-700 font-sans font-semibold truncate max-w-full px-2">{fileName}</span></>
                    ) : (
                      <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <span className="text-xs text-slate-400 font-sans">Click to upload JPG / PNG / WEBP</span>
                        <span className="text-xs text-slate-300 font-sans">Max 30KB</span></>
                    )}
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                      onChange={handleFile} className="hidden" />
                  </div>
                  {fileError && <p className="text-xs text-red-500 font-sans">⚠ {fileError}</p>}
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-8" />

            {/* Section 3: CAPTCHA */}
            <div className="px-8 py-6">
              <div className="flex items-center gap-2 mb-5">
                {sectionBar("bg-amber-500")}
                <span className="text-xs font-bold uppercase tracking-[2px] text-amber-700 font-sans">Security Verification</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-blue-900 tracking-widest font-mono bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-inner select-none">
                    {captchaA} + {captchaB} = ?
                  </span>
                </div>
                <div className="flex flex-col gap-1 flex-1 w-full">
                  <input type="number" placeholder="Your answer" value={captchaInput}
                    onChange={(e) => { setCaptchaInput(sanitizeNum(e.target.value)); setErrors((er) => ({ ...er, captcha: "" })); }}
                    className={`${baseInput} font-mono text-center text-lg`} />
                  {errors.captcha && <p className="text-xs text-red-500 font-sans">⚠ {errors.captcha}</p>}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="px-8 pb-8">
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold font-sans tracking-wide shadow-lg shadow-blue-900/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/40 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? "Registering…" : "Continue to Agreement →"}
              </button>
              <p className="text-center text-xs text-slate-400 font-sans mt-3">
                🔒 Your credentials are encrypted and reviewed by our medical board.
              </p>
              <p className="text-center text-xs text-slate-400 font-sans mt-2">
                Already registered?{" "}
                <a href="/login" className="text-blue-700 underline">Log in here</a>
              </p>
            </div>
          </div>
        </div>

        {showAgreement && (
          <AgreementModal
            role="doctor"
            onCancel={() => setShowAgreement(false)}
            onAccept={handleAccept}
          />
        )}

        <style>{`
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        `}</style>
      </div>
    </div>
  );
}
