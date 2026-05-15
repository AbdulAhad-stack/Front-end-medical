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
  ok: {
    color: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.25)",
    label: "Normal",
  },
  warn: {
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.25)",
    label: "Elevated",
  },
  danger: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    label: "Critical",
  },
  neutral: {
    color: "rgba(255,255,255,0.25)",
    bg: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.08)",
    label: "—",
  },
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

      const color = accentRef.current || "56,189,248";

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

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

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VITAL BADGE
// ─────────────────────────────────────────────────────────────────────────────
function VitalBadge({ label, value, status }) {
  const s = STATUS[status] || STATUS.neutral;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[0.65rem] font-medium tracking-wide"
      style={{
        background: s.bg,
        borderColor: s.border,
        color: s.color,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: "currentColor" }}
      />
      {label}: {value}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VITAL INPUT
// ─────────────────────────────────────────────────────────────────────────────
function VitalInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  status,
}) {
  const s = STATUS[status] || STATUS.neutral;
  const hasVal = !!value;

  return (
    <div>
      <label
        className="block text-[0.62rem] uppercase tracking-[0.16em] font-semibold mb-1.5"
        style={{
          color: "rgba(255,255,255,0.25)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        step={type === "number" ? "0.1" : undefined}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${
            hasVal ? s.border : "rgba(255,255,255,0.09)"
          }`,
          color: "#f0f2f7",
          fontFamily: "'DM Sans', sans-serif",
        }}
        onFocus={(e) =>
          (e.target.style.borderColor = "rgba(56,189,248,0.5)")
        }
        onBlur={(e) =>
          (e.target.style.borderColor = hasVal
            ? s.border
            : "rgba(255,255,255,0.09)")
        }
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
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full inline-block"
          style={{
            background: "#38bdf8",
            opacity: 0.7,
            animation: `chatBounce 1.1s ${d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({ onChip }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-4 sm:px-8 py-10 sm:py-16">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, #38bdf8)",
          }}
        />

        <span
          className="text-[0.65rem] tracking-[0.2em] uppercase font-medium text-sky-400"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Emergency Assistant
        </span>

        <div
          className="w-8 h-px"
          style={{
            background: "linear-gradient(90deg, #38bdf8, transparent)",
          }}
        />
      </div>

      <h2
        className="text-2xl sm:text-3xl font-black text-white leading-tight"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Describe your{" "}
        <em
          className="not-italic"
          style={{
            backgroundImage: "linear-gradient(135deg, #38bdf8, #7dd3fc)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Emergency
        </em>
      </h2>

      <p
        className="text-sm font-light leading-relaxed max-w-xs"
        style={{
          color: "rgba(255,255,255,0.3)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Enter your vitals on the left, then describe your symptoms below for
        immediate AI guidance.
      </p>

      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => onChip(c)}
            className="px-4 py-2 rounded-full text-xs border transition-all duration-200"
            style={{
              border: "1px solid rgba(255,255,255,0.09)",
              background: "rgba(255,255,255,0.02)",
              color: "rgba(255,255,255,0.3)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MedicalChatbot() {
  const [temperature, setTemperature] = useState("");
  const [bp, setBp] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const accentRef = useRef("56,189,248");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 110) + "px";
  };

  const ts = getTempStatus(temperature);
  const bs = getBpStatus(bp);

  useEffect(() => {
    if (ts === "danger" || bs === "danger")
      accentRef.current = "239,68,68";
    else if (ts === "warn" || bs === "warn")
      accentRef.current = "251,191,36";
    else accentRef.current = "56,189,248";
  }, [ts, bs]);

  const sendMessage = useCallback(async () => {
    const trimmed = chatInput.trim();

    if (!trimmed) {
      setError("Please describe your symptoms.");
      return;
    }

    setError("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: trimmed,
        temp: temperature,
        bp,
        timestamp: new Date(),
      },
    ]);

    setChatInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmed,
          temp: temperature || null,
          bp: bp || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server Error");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.result,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "⚠️ Could not connect to MediAI backend.\n\n" +
            (err.message || "Unknown error"),
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }, [chatInput, temperature, bp]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes chatBounce {
          0%,60%,100% { transform:translateY(0) }
          30% { transform:translateY(-5px) }
        }

        @keyframes chatFadeUp {
          from { opacity:0; transform:translateY(14px) }
          to { opacity:1; transform:translateY(0) }
        }

        .chat-msg {
          animation: chatFadeUp 0.28s ease both;
        }

        .chat-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.07);
          border-radius: 4px;
        }

        textarea::placeholder {
          color: rgba(255,255,255,0.18);
        }

        input::placeholder {
          color: rgba(255,255,255,0.2);
        }

        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
        }
      `}</style>

      <div
        className="relative flex flex-col h-[100dvh] overflow-hidden"
        style={{
          background: "#06060e",
          fontFamily: "'DM Sans', sans-serif",
          color: "#f0f2f7",
        }}
      >
        <ParticleCanvas accentRef={accentRef} />

        <div
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
          style={{
            background:
              "radial-gradient(ellipse at 70% 30%, rgba(14,116,144,0.18) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(56,189,248,0.06) 0%, transparent 50%)",
          }}
        />

        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-[9999] w-full">
          <Navbar />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* SIDEBAR */}
          <aside
            className="chat-scroll w-full md:w-64 shrink-0 overflow-y-auto flex flex-col gap-6 p-4 md:p-5 max-h-[40vh] md:max-h-none"
            style={{
              background: "rgba(255,255,255,0.015)",
              borderRight: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-6 h-px"
                style={{
                  background: "linear-gradient(90deg, transparent, #38bdf8)",
                }}
              />

              <span
                className="text-[0.6rem] tracking-[0.18em] uppercase font-medium text-sky-400"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Patient Vitals
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <VitalInput
                label="Temperature (°C)"
                placeholder="e.g. 37.2"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                type="number"
                status={ts}
              />

              <VitalInput
                label="Blood Pressure"
                placeholder="e.g. 120/80"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                status={bs}
              />
            </div>
          </aside>

          {/* CHAT */}
          <div className="flex flex-1 flex-col min-w-0 min-h-0 w-full">
            <div className="chat-scroll flex-1 overflow-y-auto flex flex-col gap-4 px-4 sm:px-6 md:px-8 py-5 md:py-7 min-h-0">
              {messages.length === 0 ? (
                <EmptyState
                  onChip={(t) => {
                    setChatInput(t);
                    textareaRef.current?.focus();
                  }}
                />
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`chat-msg flex gap-3 ${
                      msg.role === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex flex-col gap-1.5 max-w-[90%] sm:max-w-[80%] md:max-w-[72%] ${
                        msg.role === "user"
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <div
                        className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                        style={{
                          background:
                            msg.role === "user"
                              ? "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(56,189,248,0.08))"
                              : "rgba(255,255,255,0.02)",
                          border:
                            msg.role === "user"
                              ? "1px solid rgba(56,189,248,0.25)"
                              : "1px solid rgba(255,255,255,0.07)",
                          color:
                            msg.role === "user"
                              ? "#f0f2f7"
                              : "rgba(255,255,255,0.8)",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.text}
                      </div>

                      <span
                        className="text-[0.65rem]"
                        style={{
                          color: "rgba(255,255,255,0.18)",
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="chat-msg flex gap-3">
                  <div
                    className="rounded-2xl border"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      borderColor: "rgba(255,255,255,0.07)",
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div
              className="shrink-0 px-3 sm:px-5 md:px-8 py-3 md:py-4"
              style={{
                background: "rgba(6,6,14,0.94)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(10px)",
              }}
            >
              {error && (
                <p
                  className="text-xs mb-2"
                  style={{
                    color: "#ef4444",
                  }}
                >
                  ⚠ {error}
                </p>
              )}

              <div
                className="flex items-end gap-2 md:gap-3 rounded-2xl px-3 md:px-4 py-2.5 transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder="Describe your emergency or symptoms in detail…"
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value);
                    autoResize();
                  }}
                  onKeyDown={handleKey}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed"
                  style={{
                    maxHeight: 110,
                    color: "#f0f2f7",
                  }}
                />

                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="w-10 h-10 md:w-9 md:h-9 rounded-xl shrink-0 flex items-center justify-center transition-all duration-200"
                  style={{
                    background: loading
                      ? "rgba(255,255,255,0.04)"
                      : "linear-gradient(135deg, rgba(56,189,248,0.35), rgba(56,189,248,0.2))",
                    border: `1px solid ${
                      loading
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(56,189,248,0.45)"
                    }`,
                    opacity: loading ? 0.4 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}