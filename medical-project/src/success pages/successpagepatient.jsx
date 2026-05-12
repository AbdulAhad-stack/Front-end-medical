import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// ── Shared animated counter ───────────────────────────────────────────────────
const useCount = (target, duration = 1200) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
};

// ── Particle burst ────────────────────────────────────────────────────────────
const Particles = ({ color }) => {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * 360,
    dist: 60 + Math.random() * 40,
    size: 4 + Math.random() * 5,
    delay: Math.random() * 0.3,
  }));
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full opacity-0"
          style={{
            width: p.size, height: p.size,
            background: color,
            animation: `burst 1s ease-out ${p.delay}s both`,
            "--angle": `${p.angle}deg`,
            "--dist": `${p.dist}px`,
          }}
        />
      ))}
    </div>
  );
};

// ── Patient Success Page ──────────────────────────────────────────────────────
const Successpagepatient = ({ onHome }) => {
    const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);
  const consultations = useCount(1240);
  const doctors = useCount(340);
  const rating = useCount(98);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-slate-100 flex flex-col font-serif overflow-hidden relative">

      {/* BG blobs */}
      <div className="fixed top-[-120px] right-[-120px] w-96 h-96 rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-80px] left-[-80px] w-72 h-72 rounded-full bg-cyan-200/20 blur-3xl pointer-events-none" />

      {/* Top bar */}
      <div className="bg-teal-900 px-8 py-3 flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-auto text-white/40 text-xs tracking-[3px] font-mono uppercase">Registration Complete</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-lg transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)" }}
        >
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-teal-900/10 ring-1 ring-teal-100 overflow-hidden">

            {/* Hero section */}
            <div className="bg-gradient-to-br from-teal-800 to-teal-600 px-8 pt-10 pb-12 relative overflow-hidden flex flex-col items-center text-center">
              {/* Decorative circles */}
              <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-white/5" />
              <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 rounded-full bg-white/5" />

              {/* Animated checkmark */}
              <div className="relative w-24 h-24 mb-6">
                <Particles color="#5eead4" />
                <div
                  className="w-24 h-24 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center"
                  style={{ animation: "popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) 0.3s both" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-12 h-12"
                    style={{ animation: "drawCheck 0.5s ease 0.7s both" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"
                      style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: "drawLine 0.5s ease 0.7s forwards" }} />
                  </svg>
                </div>
              </div>

              <div
                className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-4"
                style={{ animation: "fadeUp 0.5s ease 0.5s both" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" />
                <span className="text-teal-100 text-xs font-mono tracking-widest uppercase">Patient Account Active</span>
              </div>

              <h1
                className="text-3xl font-bold text-white mb-3 tracking-tight"
                style={{ animation: "fadeUp 0.5s ease 0.6s both" }}
              >
                Welcome Aboard!
              </h1>
              <p
                className="text-teal-200 text-sm leading-relaxed max-w-sm font-sans"
                style={{ animation: "fadeUp 0.5s ease 0.7s both" }}
              >
                Your patient profile has been securely created. You now have full access to our network of verified doctors.
              </p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 bg-teal-50/50">
              {[
                { label: "Consultations", value: consultations.toLocaleString(), suffix: "+" },
                { label: "Verified Doctors", value: doctors.toLocaleString(), suffix: "+" },
                { label: "Satisfaction", value: rating, suffix: "%" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center py-5 px-2">
                  <span className="text-2xl font-bold text-teal-800 tracking-tight">{s.value}{s.suffix}</span>
                  <span className="text-xs text-slate-400 font-sans mt-0.5 text-center">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Next steps */}
            <div className="px-8 py-6">
              <p className="text-xs font-bold uppercase tracking-[2px] text-slate-400 font-sans mb-4">What's Next</p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: "💬", title: "Submit a Query", desc: "Describe your symptoms to get matched with a doctor." },
                  { icon: "🤖", title: "Try the AI Chatbot", desc: "Get instant guidance on mild symptoms." },
                  { icon: "📋", title: "Upload a Report", desc: "Let AI analyze your medical reports instantly." },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-teal-50 transition-colors duration-200 cursor-pointer"
                    style={{ animation: `fadeUp 0.4s ease ${0.8 + i * 0.1}s both` }}
                  >
                    <span className="text-2xl mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-700 font-sans">{item.title}</p>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">{item.desc}</p>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-300 ml-auto mt-1 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="px-8 pb-8 flex flex-col gap-3">
              <button
                onClick={() => navigate("/Loginpage")}
                className="w-full py-4 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-sm font-bold font-sans tracking-wide shadow-lg shadow-teal-800/25 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Return to Home
              </button>
              <p className="text-center text-xs text-slate-400 font-sans">
                🔒 Your data is protected under our Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes popIn  { from { opacity:0; transform:scale(0.5) } to { opacity:1; transform:scale(1) } }
        @keyframes drawLine { to { stroke-dashoffset: 0 } }
        @keyframes burst {
          0%   { opacity:1; transform: rotate(var(--angle)) translateX(0) scale(1); }
          100% { opacity:0; transform: rotate(var(--angle)) translateX(var(--dist)) scale(0); }
        }
      `}</style>
    </div>
  );
};
export default Successpagepatient