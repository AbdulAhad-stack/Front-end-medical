import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";

const LoginPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const hoveredRef = useRef(null);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  // Particle canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
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
      const h = hoveredRef.current;
      const color =
        h === "doctor" ? "239,68,68" : h === "patient" ? "56,189,248" : "167,139,250";

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
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
            ctx.strokeStyle = `rgba(${color}, ${0.055 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Dynamic values that truly can't be expressed in static Tailwind
  const activeAccent =
    hovered === "doctor" ? "#ef4444" : hovered === "patient" ? "#38bdf8" : "#a78bfa";

  const headlineGradient =
    hovered === "doctor"
      ? "linear-gradient(135deg, #ef4444, #fca5a5)"
      : hovered === "patient"
      ? "linear-gradient(135deg, #38bdf8, #7dd3fc)"
      : "linear-gradient(135deg, #a78bfa, #c4b5fd)";

  const dividerGradient =
    hovered === "doctor"
      ? "linear-gradient(to bottom, transparent, rgba(239,68,68,0.5), transparent)"
      : hovered === "patient"
      ? "linear-gradient(to bottom, transparent, rgba(56,189,248,0.45), transparent)"
      : "linear-gradient(to bottom, transparent, rgba(167,139,250,0.35), transparent)";

  const bgGlow =
    hovered === "doctor"
      ? "radial-gradient(ellipse at 30% 55%, rgba(185,28,28,0.22) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(239,68,68,0.07) 0%, transparent 50%)"
      : hovered === "patient"
      ? "radial-gradient(ellipse at 70% 45%, rgba(14,116,144,0.24) 0%, transparent 60%), radial-gradient(ellipse at 25% 20%, rgba(56,189,248,0.08) 0%, transparent 50%)"
      : "radial-gradient(ellipse at 50% 50%, rgba(88,28,135,0.1) 0%, transparent 60%)";

  const gridColor =
    hovered === "doctor"
      ? "rgba(239,68,68,0.04)"
      : hovered === "patient"
      ? "rgba(56,189,248,0.035)"
      : "rgba(167,139,250,0.025)";

  // Info strip items
  const infoItems = [
    { text: "Doctors provide verified medical consultations", type: "doctor" },
    { text: "Patients receive safe, guided healthcare support", type: "patient" },
    { text: "AI suggestions are informational only", type: null },
    { text: "Always consult a licensed doctor for diagnosis", type: null },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#06060e", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <Navbar hovered={hovered} />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[1] pointer-events-none"
      />

      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
        style={{ background: bgGlow }}
      />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 pt-28 pb-16">

        {/* Eyebrow */}
        <div
          className="flex items-center gap-3 mb-6"
          style={{ animation: "fadeUp 0.6s ease both" }}
        >
          <div
            className="w-10 h-px transition-all duration-500"
            style={{ background: `linear-gradient(90deg, transparent, ${activeAccent})` }}
          />
          <span
            className="text-[0.7rem] tracking-[0.2em] uppercase font-medium transition-colors duration-500"
            style={{ color: activeAccent }}
          >
            Secure Medical Platform
          </span>
          <div
            className="w-10 h-px transition-all duration-500"
            style={{ background: `linear-gradient(90deg, ${activeAccent}, transparent)` }}
          />
        </div>

        {/* Headline */}
        <h1
          className="text-center font-black leading-[1.05] tracking-tight max-w-[680px] text-white"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            animation: "fadeUp 0.6s 0.1s ease both",
          }}
        >
          Your Health,{" "}
          <em
            className="not-italic"
            style={{
              backgroundImage: headlineGradient,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transition: "background-image 0.55s ease",
            }}
          >
            Expertly
          </em>{" "}
          Connected
        </h1>

        {/* Subtitle */}
        <p
          className="mt-5 text-white/35 text-[0.92rem] font-light tracking-wide text-center max-w-[400px] leading-[1.7]"
          style={{ animation: "fadeUp 0.6s 0.2s ease both" }}
        >
          Join a trusted network of verified doctors and patients. Get the care you need, when you need it.
        </p>

        {/* Divider */}
        <div
          className="w-px h-11 my-9 transition-all duration-500"
          style={{ background: dividerGradient, animation: "fadeUp 0.6s 0.28s ease both" }}
        />

        {/* Cards */}
        <div
          className="flex flex-col sm:flex-row gap-6"
          style={{ animation: "fadeUp 0.6s 0.34s ease both" }}
        >
          {/* Doctor Card */}
          <div
            className="relative overflow-hidden w-full sm:w-[248px] p-8 rounded-[18px] cursor-pointer border transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #1c0a0a 0%, #2d0f0f 100%)",
              borderColor: "rgba(239,68,68,0.28)",
              boxShadow: "0 4px 30px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            onClick={() => navigate("/doctor-signup")}
            onMouseEnter={() => setHovered("doctor")}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Top strip */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(90deg, #ef4444, #f87171 60%, transparent)" }}
            />

            <div className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center mb-5 bg-red-500/15">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                <path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
                <circle cx="12" cy="8" r="4" />
                <line x1="16" y1="3" x2="16" y2="7" strokeLinecap="round" />
                <line x1="14" y1="5" x2="18" y2="5" strokeLinecap="round" />
              </svg>
            </div>

            <div className="inline-flex items-center px-[0.65rem] py-1 rounded-full border text-[0.6rem] tracking-[0.14em] uppercase font-medium mb-2 bg-red-500/10 border-red-500/25 text-red-300">
              Medical Professional
            </div>

            <div className="text-white font-bold text-[1.4rem] mb-2 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Doctor Signup
            </div>

            <div className="text-[0.78rem] text-white/30 leading-[1.65] font-light mb-6">
              Join as a verified physician and offer expert consultations to patients.
            </div>

            <div className="flex items-center gap-2 text-[0.73rem] font-medium tracking-[0.09em] uppercase text-red-300 transition-all duration-200 hover:gap-4">
              Get started
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Patient Card */}
          <div
            className="relative overflow-hidden w-full sm:w-[248px] p-8 rounded-[18px] cursor-pointer border transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #050f1c 0%, #071828 100%)",
              borderColor: "rgba(56,189,248,0.22)",
              boxShadow: "0 4px 30px rgba(56,189,248,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
            onClick={() => navigate("/patient-signup")}
            onMouseEnter={() => setHovered("patient")}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Top strip */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px] opacity-0 transition-opacity duration-300"
              style={{ background: "linear-gradient(90deg, #38bdf8, #7dd3fc 60%, transparent)" }}
            />

            <div className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center mb-5 bg-sky-400/10">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>

            <div className="inline-flex items-center px-[0.65rem] py-1 rounded-full border text-[0.6rem] tracking-[0.14em] uppercase font-medium mb-2 bg-sky-400/10 border-sky-400/25 text-sky-300">
              Patient
            </div>

            <div className="text-white font-bold text-[1.4rem] mb-2 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Patient Signup
            </div>

            <div className="text-[0.78rem] text-white/30 leading-[1.65] font-light mb-6">
              Register and connect with licensed doctors for personalized guidance.
            </div>

            <div className="flex items-center gap-2 text-[0.73rem] font-medium tracking-[0.09em] uppercase text-sky-300 transition-all duration-200 hover:gap-4">
              Get started
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div
          className="mt-12 grid grid-cols-2 gap-[0.65rem] max-w-[500px] w-full"
          style={{ animation: "fadeUp 0.6s 0.44s ease both" }}
        >
          {infoItems.map(({ text, type }, i) => (
            <div
              key={i}
              className="flex items-start gap-[0.7rem] p-[0.85rem_1rem] rounded-[10px] border transition-colors duration-500"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor:
                  hovered === "doctor" && type === "doctor"
                    ? "rgba(239,68,68,0.28)"
                    : hovered === "patient" && type === "patient"
                    ? "rgba(56,189,248,0.24)"
                    : "rgba(255,255,255,0.045)",
              }}
            >
              <div
                className="w-[5px] h-[5px] rounded-full mt-[0.33rem] flex-shrink-0 transition-colors duration-500"
                style={{
                  background:
                    type === "doctor"
                      ? "#ef4444"
                      : type === "patient"
                      ? "#38bdf8"
                      : "rgba(255,255,255,0.22)",
                }}
              />
              <span className="text-[0.74rem] text-white/25 leading-[1.55] font-light">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
