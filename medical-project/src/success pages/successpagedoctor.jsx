import React, { useState, useEffect } from "react";

/* ── Counter Hook (smooth animation) ───────────────────────── */
const useCount = (end, duration = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
};

/* ── Simple Particles Effect ───────────────────────── */
const Particles = ({ color = "#93c5fd" }) => {
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: color,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: `burst 0.8s ease-out forwards`,
            animationDelay: `${i * 0.05}s`,
            "--angle": `${i * 45}deg`,
            "--dist": "60px",
          }}
        />
      ))}
    </>
  );
};

/* ── Main Component ───────────────────────── */
const Successpagedoctor = ({ onHome }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const patients = useCount(8500);
  const doctors = useCount(340);
  const payout = useCount(92);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex flex-col font-serif overflow-hidden relative">

      {/* Background glow */}
      <div className="fixed top-[-120px] right-[-120px] w-96 h-96 rounded-full bg-blue-200/20 blur-3xl" />
      <div className="fixed bottom-[-80px] left-[-80px] w-72 h-72 rounded-full bg-indigo-200/20 blur-3xl" />

      {/* Top bar */}
      <div className="bg-blue-900 px-8 py-3 flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-auto text-white/40 text-xs tracking-[3px] font-mono uppercase">
          Practitioner Verified
        </span>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-lg transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 px-8 pt-10 pb-12 flex flex-col items-center text-center relative">

              <div className="relative w-24 h-24 mb-6">
                <Particles />
                <div className="w-24 h-24 rounded-full bg-white/15 border flex items-center justify-center">
                  ✔
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white mb-3">
                Application Submitted!
              </h1>

              <p className="text-blue-200 text-sm">
                Your profile is under review. You’ll be notified within 24–48 hours.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 text-center bg-blue-50 py-6">
              <div>
                <p className="text-2xl font-bold text-blue-900">{patients}+</p>
                <p className="text-xs text-gray-400">Patients</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{doctors}+</p>
                <p className="text-xs text-gray-400">Doctors</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{payout}%</p>
                <p className="text-xs text-gray-400">Payout</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6 space-y-4 text-sm">
              <p className="font-bold text-gray-400 uppercase text-xs">
                Verification Timeline
              </p>

              <div>✅ Profile Created</div>
              <div>🔍 Credential Review (In Progress)</div>
              <div>📧 Email Confirmation</div>
              <div>💊 Start Consulting</div>
            </div>

            {/* Button */}
            <div className="p-6">
              <button
                onClick={onHome}
                className="w-full py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
              >
                Return to Home
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Check your email for updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes burst {
          0% { opacity:1; transform: rotate(var(--angle)) translateX(0); }
          100% { opacity:0; transform: rotate(var(--angle)) translateX(var(--dist)); }
        }
      `}</style>
    </div>
  );
};

export default Successpagedoctor;