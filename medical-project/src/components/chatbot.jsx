import React, { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "./navbar";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getTempStatus = (t) => {
  const v = parseFloat(t);
  if (!t || isNaN(v)) return "neutral";
  if (v >= 39) return "danger";
  if (v >= 37.5 || v < 35.5) return "warn";
  return "ok";
};

const getBpStatus = (s) => {
  if (!s || !s.includes("/")) return "neutral";
  const [sys, dia] = s.split("/").map(Number);
  if (isNaN(sys) || isNaN(dia)) return "neutral";
  if (sys >= 140 || dia >= 90) return "danger";
  if (sys < 90 || dia < 60) return "warn";
  return "ok";
};

const formatTime = (d) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const STATUS = {
  ok:      { color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.25)",  label: "Normal"   },
  warn:    { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)",  label: "Elevated" },
  danger:  { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   label: "Critical" },
  neutral: { color: "rgba(255,255,255,0.25)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", label: "—" },
};

const CHIPS = [
  "Severe chest pain, can't breathe",
  "High fever with rash and stiff neck",
  "Severe headache, blurred vision",
  "Suspected allergic reaction, swelling",
];

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE CANVAS
// ─────────────────────────────────────────────────────────────────────────────
function ParticleCanvas({ accentRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      opacity: Math.random() * 0.35 + 0.08,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = accentRef.current || "56,189,248";

      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.opacity})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${color},${0.055 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[1] pointer-events-none" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// VITAL BADGE
// ─────────────────────────────────────────────────────────────────────────────
function VitalBadge({ label, value, status }) {
  const s = STATUS[status] || STATUS.neutral;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[0.65rem] font-medium tracking-wide"
      style={{ background: s.bg, borderColor: s.border, color: s.color, fontFamily: "'DM Sans', sans-serif" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
      {label}: {value}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VITAL INPUT
// ─────────────────────────────────────────────────────────────────────────────
function VitalInput({ label, placeholder, value, onChange, type = "text", status }) {
  const s = STATUS[status] || STATUS.neutral;
  const hasVal = !!value;
  return (
    <div>
      <label className="block text-[0.62rem] uppercase tracking-[0.16em] font-semibold mb-1.5"
        style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </label>
      <input
        type={type} step={type === "number" ? "0.1" : undefined}
        placeholder={placeholder} value={value} onChange={onChange}
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${hasVal ? s.border : "rgba(255,255,255,0.09)"}`,
          color: "#f0f2f7",
          fontFamily: "'DM Sans', sans-serif",
        }}
        onFocus={e  => e.target.style.borderColor = "rgba(56,189,248,0.5)"}
        onBlur={e   => e.target.style.borderColor = hasVal ? s.border : "rgba(255,255,255,0.09)"}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPING DOTS
// ─────────────────────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex gap-1.5 px-4 py-3 items-center">
      {[0, 0.18, 0.36].map((d, i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full inline-block"
          style={{ background: "#38bdf8", opacity: 0.7, animation: `chatBounce 1.1s ${d}s infinite` }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({ onChip }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-6 py-12">
      <div className="flex items-center gap-3">
        <div className="w-8 h-px" style={{ background: "linear-gradient(90deg, transparent, #38bdf8)" }} />
        <span className="text-[0.65rem] tracking-[0.2em] uppercase font-medium text-sky-400"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>Emergency Assistant</span>
        <div className="w-8 h-px" style={{ background: "linear-gradient(90deg, #38bdf8, transparent)" }} />
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight"
        style={{ fontFamily: "'Playfair Display', serif" }}>
        Describe your{" "}
        <em className="not-italic" style={{
          backgroundImage: "linear-gradient(135deg, #38bdf8, #7dd3fc)",
          WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>Emergency</em>
      </h2>
      <p className="text-sm font-light leading-relaxed max-w-xs"
        style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>
        Tap the vitals button above to enter your readings, then describe your symptoms below.
      </p>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center mt-2 w-full">
        {CHIPS.map((c) => (
          <button key={c} onClick={() => onChip(c)}
            className="px-4 py-2 rounded-full text-xs border transition-all duration-200 text-left sm:text-center"
            style={{
              border: "1px solid rgba(255,255,255,0.09)",
              background: "rgba(255,255,255,0.02)",
              color: "rgba(255,255,255,0.3)",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(56,189,248,0.1)";
              e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)";
              e.currentTarget.style.color = "#38bdf8";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
              e.currentTarget.style.color = "rgba(255,255,255,0.3)";
            }}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR CONTENT — shared between desktop sidebar & mobile drawer
// ─────────────────────────────────────────────────────────────────────────────
function SidebarContent({ temperature, setTemperature, bp, setBp, ts, bs, onClear, onClose }) {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header row for mobile */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-px" style={{ background: "linear-gradient(90deg, transparent, #38bdf8)" }} />
          <span className="text-[0.6rem] tracking-[0.18em] uppercase font-medium text-sky-400"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>Patient Vitals</span>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-lg"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
            ×
          </button>
        )}
      </div>

      {/* Vitals inputs */}
      <div className="flex flex-col gap-3">
        <VitalInput label="Temperature (°C)" placeholder="e.g. 37.2"
          value={temperature} onChange={e => setTemperature(e.target.value)} type="number" status={ts} />
        <VitalInput label="Blood Pressure" placeholder="e.g. 120/80"
          value={bp} onChange={e => setBp(e.target.value)} status={bs} />

        <div className="flex flex-col gap-2 mt-1">
          <VitalBadge label="Temp" value={temperature ? `${temperature}°C` : "—"} status={ts} />
          <VitalBadge label="BP"   value={bp || "—"} status={bs} />
        </div>
      </div>

      <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Status legend */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-px" style={{ background: "linear-gradient(90deg, transparent, #38bdf8)" }} />
          <span className="text-[0.6rem] tracking-[0.18em] uppercase font-medium text-sky-400"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>Status Key</span>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { color: "#4ade80", label: "Normal range" },
            { color: "#fbbf24", label: "Elevated — monitor" },
            { color: "#ef4444", label: "Critical — act now" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2.5 p-2.5 rounded-xl border"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-[0.72rem]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Info card */}
      <div className="p-3.5 rounded-2xl border"
        style={{ background: "rgba(56,189,248,0.05)", borderColor: "rgba(56,189,248,0.18)" }}>
        <p className="text-[0.6rem] uppercase tracking-[0.14em] font-semibold text-sky-400 mb-1.5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>How to use</p>
        <p className="text-[0.72rem] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>
          Fill in your vitals, then describe your symptoms in detail below. MediAI will return structured, immediate-action guidance.
        </p>
      </div>

      {/* Clear button */}
      <div className="mt-auto">
        <button onClick={onClear}
          className="w-full py-2.5 rounded-xl border text-xs font-medium tracking-wide transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
          Clear conversation
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MedicalChatbot() {
  const [temperature, setTemperature] = useState("");
  const [bp, setBp]                   = useState("");
  const [chatInput, setChatInput]     = useState("");
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [drawerOpen, setDrawerOpen]   = useState(false);   // mobile vitals drawer

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const accentRef   = useRef("56,189,248");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 110) + "px";
  };

  const ts = getTempStatus(temperature);
  const bs = getBpStatus(bp);

  useEffect(() => {
    if (ts === "danger" || bs === "danger") accentRef.current = "239,68,68";
    else if (ts === "warn" || bs === "warn") accentRef.current = "251,191,36";
    else accentRef.current = "56,189,248";
  }, [ts, bs]);

  const sendMessage = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) { setError("Please describe your symptoms."); return; }
    setError("");

    setMessages(prev => [...prev, {
      role: "user", text: trimmed,
      temp: temperature, bp, timestamp: new Date(),
    }]);
    setChatInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5050/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, temp: temperature || null, bp: bp || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Server Error");
      setMessages(prev => [...prev, {
        role: "assistant", text: data.result, timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "⚠️ Could not connect to MediAI backend.\n\n" + (err.message || "Unknown error"),
        timestamp: new Date(), isError: true,
      }]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }, [chatInput, temperature, bp]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes chatBounce  { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes chatFadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes chatPulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes drawerSlide { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        .chat-msg      { animation: chatFadeUp 0.28s ease both; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px; }
        textarea::placeholder { color: rgba(255,255,255,0.18); }
        input::placeholder    { color: rgba(255,255,255,0.2); }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }

        /* ── Mobile drawer ── */
        .mobile-drawer {
          position: fixed;
          inset: 0;
          z-index: 9998;
          display: flex;
        }
        .mobile-drawer-panel {
          width: min(82vw, 300px);
          height: 100%;
          overflow-y: auto;
          padding: 24px 20px;
          background: #0b0b18;
          border-right: 1px solid rgba(255,255,255,0.09);
          animation: drawerSlide 0.25s ease;
        }
        .mobile-drawer-backdrop {
          flex: 1;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(2px);
        }

        /* ── Responsive vitals pill strip ── */
        .vitals-pill-strip {
          display: none;
        }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
          .vitals-pill-strip { display: flex; }
        }
        @media (min-width: 768px) {
          .mobile-vitals-btn { display: none !important; }
        }
      `}</style>

      <div className="relative flex flex-col h-screen overflow-hidden"
        style={{ background: "#06060e", fontFamily: "'DM Sans', sans-serif", color: "#f0f2f7" }}>

        <ParticleCanvas accentRef={accentRef} />

        <div className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
          style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(14,116,144,0.18) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(56,189,248,0.06) 0%, transparent 50%)" }} />

        <div className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

        {/* Navbar */}
        <div className="relative z-[9999]">
          <Navbar />
        </div>

        {/* ── Mobile vitals drawer ── */}
        {drawerOpen && (
          <div className="mobile-drawer">
            <div className="mobile-drawer-panel chat-scroll">
              <SidebarContent
                temperature={temperature} setTemperature={setTemperature}
                bp={bp} setBp={setBp}
                ts={ts} bs={bs}
                onClear={() => { setMessages([]); setDrawerOpen(false); }}
                onClose={() => setDrawerOpen(false)}
              />
            </div>
            <div className="mobile-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          </div>
        )}

        {/* Body */}
        <div className="relative z-10 flex flex-1 overflow-hidden min-h-0">

          {/* ── Desktop sidebar ── */}
          <aside className="desktop-sidebar chat-scroll w-64 shrink-0 overflow-y-auto p-5"
            style={{ background: "rgba(255,255,255,0.015)", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
            <SidebarContent
              temperature={temperature} setTemperature={setTemperature}
              bp={bp} setBp={setBp}
              ts={ts} bs={bs}
              onClear={() => setMessages([])}
              onClose={null}
            />
          </aside>

          {/* ── Chat column ── */}
          <div className="flex flex-1 flex-col min-w-0 min-h-0">

            {/* ── Mobile top bar: vitals button + badge pills ── */}
            <div className="mobile-vitals-btn shrink-0 px-4 py-2 flex items-center gap-2 flex-wrap"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,6,14,0.7)", backdropFilter: "blur(8px)" }}>
              <button onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200"
                style={{
                  background: "rgba(56,189,248,0.07)",
                  borderColor: "rgba(56,189,248,0.25)",
                  color: "#38bdf8",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                Vitals
              </button>

              {/* Live vital pills on mobile top bar */}
              <div className="vitals-pill-strip items-center gap-2 flex-wrap">
                <VitalBadge label="Temp" value={temperature ? `${temperature}°C` : "—"} status={ts} />
                <VitalBadge label="BP"   value={bp || "—"} status={bs} />
              </div>
            </div>

            {/* Messages */}
            <div className="chat-scroll flex-1 overflow-y-auto flex flex-col gap-4 sm:gap-5 px-3 sm:px-8 py-5 sm:py-7 min-h-0">
              {messages.length === 0
                ? <EmptyState onChip={t => { setChatInput(t); textareaRef.current?.focus(); }} />
                : messages.map((msg, i) => (
                  <div key={i} className={`chat-msg flex gap-2 sm:gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

                    {/* Avatar */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] shrink-0 self-start flex items-center justify-center text-xs sm:text-sm"
                      style={{
                        background: msg.role === "user"
                          ? "rgba(255,255,255,0.05)"
                          : "linear-gradient(135deg, rgba(56,189,248,0.3), rgba(56,189,248,0.15))",
                        border: msg.role === "user"
                          ? "1px solid rgba(255,255,255,0.1)"
                          : "1px solid rgba(56,189,248,0.35)",
                      }}>
                      {msg.role === "user" ? "👤" : "⚕"}
                    </div>

                    {/* Bubble + meta */}
                    <div className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}
                      style={{ maxWidth: "min(72%, 520px)" }}>

                      {msg.role === "user" && (msg.temp || msg.bp) && (
                        <div className="flex gap-2 flex-wrap mb-1">
                          {msg.temp && <VitalBadge label="Temp" value={`${msg.temp}°C`} status={getTempStatus(msg.temp)} />}
                          {msg.bp   && <VitalBadge label="BP"   value={msg.bp}          status={getBpStatus(msg.bp)}   />}
                        </div>
                      )}

                      <div className="rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed"
                        style={msg.role === "user" ? {
                          background: "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(56,189,248,0.08))",
                          border: "1px solid rgba(56,189,248,0.25)",
                          borderRadius: "14px 14px 4px 14px",
                          color: "#f0f2f7",
                          fontFamily: "'DM Sans', sans-serif",
                        } : {
                          background: msg.isError ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${msg.isError ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.07)"}`,
                          borderRadius: "4px 14px 14px 14px",
                          color: msg.isError ? "#ef4444" : "rgba(255,255,255,0.8)",
                          whiteSpace: "pre-wrap",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                        {msg.text}
                      </div>

                      <span className="text-[0.65rem]" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "'DM Sans', sans-serif" }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              }

              {/* Typing indicator */}
              {loading && (
                <div className="chat-msg flex gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] shrink-0 flex items-center justify-center text-xs sm:text-sm"
                    style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.3), rgba(56,189,248,0.15))", border: "1px solid rgba(56,189,248,0.35)" }}>⚕</div>
                  <div className="rounded-2xl border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)", borderRadius: "4px 14px 14px 14px" }}>
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Input zone ── */}
            <div className="shrink-0 px-3 sm:px-8 py-3 sm:py-4"
              style={{ background: "rgba(6,6,14,0.94)", borderTop: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
              {error && (
                <p className="text-xs mb-2" style={{ color: "#ef4444", fontFamily: "'DM Sans', sans-serif" }}>⚠ {error}</p>
              )}

              <div className="flex items-center gap-2 sm:gap-3 rounded-2xl px-3 sm:px-4 py-2.5 transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.09)" }}
                onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"}
                onBlurCapture={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"}>

                <textarea
                  ref={textareaRef} rows={1}
                  placeholder="Describe your emergency or symptoms…"
                  value={chatInput}
                  onChange={e => { setChatInput(e.target.value); autoResize(); }}
                  onKeyDown={handleKey}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed"
                  style={{
                    maxHeight: 110, color: "#f0f2f7",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                  }}
                />

                {/* Send button */}
                <button onClick={sendMessage} disabled={loading}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center transition-all duration-200"
                  style={{
                    background: loading
                      ? "rgba(255,255,255,0.04)"
                      : "linear-gradient(135deg, rgba(56,189,248,0.35), rgba(56,189,248,0.2))",
                    border: `1px solid ${loading ? "rgba(255,255,255,0.06)" : "rgba(56,189,248,0.45)"}`,
                    opacity: loading ? 0.4 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="#38bdf8" stroke="none" />
                  </svg>
                </button>
              </div>

              <p className="text-center text-[0.65rem] mt-2"
                style={{ color: "rgba(255,255,255,0.13)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                ⚕ MediAI provides guidance only — always seek professional medical care for emergencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
