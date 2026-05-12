// src/pages/DoctorDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import socket from "../sockets/socket";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const rawUser  = localStorage.getItem("mc_user");
  const user     = rawUser ? JSON.parse(rawUser) : null;

  const [pending, setPending]         = useState([]); // waiting patients
  const [active, setActive]           = useState([]); // my active chats
  const [loading, setLoading]         = useState(true);
  const [claiming, setClaiming]       = useState(null);
  const [error, setError]             = useState("");
  const [isAvail, setIsAvail]         = useState(true);
  const bellRef = useRef(null);

  // ── Redirect if not logged in as doctor ───────────────────────────────────
  useEffect(() => {
    if (!user || user.role !== "doctor") navigate("/login");
  }, []);

  // ── Fetch conversations ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pendRes, actRes] = await Promise.all([
        API.get("/api/chat/pending"),
        API.get("/api/chat/my-conversations"),
      ]);
      setPending(pendRes.data.conversations || []);
      setActive(actRes.data.conversations  || []);
    } catch {
      setError("Could not load conversations.");
    }
    setLoading(false);
  };

  // ── WebSocket: listen for new patient requests in real-time ───────────────
  useEffect(() => {
    const token = localStorage.getItem("mc_token");
    if (!token) return;

    socket.auth = { token };
    socket.connect();
    socket.emit("join_as_doctor", {});
    socket.on("new_patient_request", (data) => {
      // Flash bell
      if (bellRef.current) {
        bellRef.current.style.animation = "none";
        setTimeout(() => { if (bellRef.current) bellRef.current.style.animation = "bellShake 0.5s ease"; }, 10);
      }
      setPending(prev => {
        // avoid duplicates
        if (prev.find(c => c.id === data.conversation_id)) return prev;
        return [{
          id: data.conversation_id,
          patient_name: data.patient_name,
          preview: data.preview,
          created_at: new Date().toISOString(),
          status: "pending",
        }, ...prev];
      });
    });

    socket.on("conversation_claimed", (data) => {
      // Remove from pending if another doctor claimed it
      setPending(prev => prev.filter(c => c.id !== data.conversation_id));
    });

    return () => {
      socket.off("new_patient_request");
      socket.off("conversation_claimed");
      socket.disconnect();
    };
  }, []);

  // ── Claim a pending conversation ───────────────────────────────────────────
  const claim = async (convId) => {
    setClaiming(convId);
    setError("");
    try {
      await API.post(`/api/chat/claim/${convId}`);
      setPending(prev => prev.filter(c => c.id !== convId));
      navigate(`/chat/${convId}`);
    } catch (e) {
      setError(e.response?.data?.error || "Could not claim conversation.");
      setClaiming(null);
    }
  };

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem("mc_token");
    localStorage.removeItem("mc_user");
    navigate("/");
  };

  const toggleAvailability = async () => {
    try {
      await API.post("/api/chat/availability", { is_available: !isAvail });
      setIsAvail(v => !v);
    } catch {}
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #06080f 0%, #0c1220 50%, #060e1a 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "white",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes bellShake { 0%{transform:rotate(0);} 25%{transform:rotate(-15deg);} 50%{transform:rotate(15deg);} 75%{transform:rotate(-10deg);} 100%{transform:rotate(0);} }
        @keyframes glow { 0%,100%{box-shadow:0 0 8px #ef444455;} 50%{box-shadow:0 0 20px #ef444499;} }
        .pending-card:hover { background:rgba(239,68,68,0.1) !important; border-color:rgba(239,68,68,0.35) !important; }
        .active-card:hover  { background:rgba(16,185,129,0.08) !important; border-color:rgba(16,185,129,0.3) !important; }
        .conv-card { transition: all 0.2s ease; }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{ background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1e3a5f,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👨‍⚕️</div>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Medical Portal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Availability toggle */}
          <button onClick={toggleAvailability} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 99, border: `1px solid ${isAvail ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`, background: isAvail ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)", color: isAvail ? "#10b981" : "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: isAvail ? "#10b981" : "#6b7280", display: "inline-block", animation: isAvail ? "pulse 2s infinite" : "none" }} />
            {isAvail ? "Available" : "Unavailable"}
          </button>

          {/* Bell */}
          <div ref={bellRef} style={{ position: "relative", fontSize: 20, cursor: "default" }}>
            🔔
            {pending.length > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", animation: "glow 1.5s infinite" }}>
                {pending.length}
              </span>
            )}
          </div>

          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            {user?.name?.[0]?.toUpperCase() || "D"}
          </div>
          <button onClick={handleLogout} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 36, animation: "fadeUp 0.5s ease both" }}>
          <p style={{ fontSize: 12, color: "#ef4444", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Doctor Dashboard</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>
            Dr. {user?.name?.split(" ").slice(-1)[0] || "Doctor"} 🩺
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
            {user?.speciality || "Medical Professional"} · Patient requests appear below in real-time
          </p>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 36, animation: "fadeUp 0.5s 0.1s ease both" }}>
          {[
            { label: "Pending Requests", value: pending.length, icon: "⏳", color: "#f59e0b" },
            { label: "Active Chats",     value: active.length,  icon: "💬", color: "#10b981" },
            { label: "Total Today",      value: active.length + pending.length, icon: "📋", color: "#38bdf8" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'Playfair Display',serif" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: "12px 18px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#f87171", fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.2)", animation: "pulse 1s infinite" }}>Loading conversations…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>

            {/* ── Pending Requests ── */}
            <div style={{ animation: "fadeUp 0.5s 0.15s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f59e0b", fontWeight: 600 }}>
                  Pending Requests
                </span>
                {pending.length > 0 && (
                  <span style={{ padding: "2px 8px", borderRadius: 99, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 11, fontWeight: 700, animation: "glow 1.5s infinite" }}>
                    {pending.length} new
                  </span>
                )}
              </div>

              {pending.length === 0 ? (
                <div style={{ padding: "36px 24px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No pending patients</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pending.map((conv, i) => (
                    <div key={conv.id} className="conv-card pending-card"
                      style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "16px 18px", animation: `fadeUp 0.4s ${i * 0.06}s ease both` }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                            🧑‍🤝‍🧑 {conv.patient_name || "Patient"}
                          </p>
                          <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                            {new Date(conv.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <span style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24", fontSize: 10, fontWeight: 700 }}>
                          WAITING
                        </span>
                      </div>
                      {conv.preview && (
                        <p style={{ margin: "0 0 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, fontStyle: "italic" }}>
                          "{conv.preview.slice(0, 90)}{conv.preview.length > 90 ? "…" : ""}"
                        </p>
                      )}
                      <button onClick={() => claim(conv.id)} disabled={claiming === conv.id}
                        style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", background: claiming === conv.id ? "rgba(56,189,248,0.15)" : "linear-gradient(135deg,#ef4444,#dc2626)", color: claiming === conv.id ? "rgba(255,255,255,0.3)" : "white", fontSize: 13, fontWeight: 700, cursor: claiming === conv.id ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}>
                        {claiming === conv.id ? "Claiming…" : "Accept & Respond →"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Active Chats ── */}
            <div style={{ animation: "fadeUp 0.5s 0.2s ease both" }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#10b981", fontWeight: 600 }}>
                  My Active Chats
                </span>
              </div>

              {active.length === 0 ? (
                <div style={{ padding: "36px 24px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No active chats yet</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {active.map((conv, i) => (
                    <div key={conv.id} className="conv-card active-card"
                      onClick={() => navigate(`/chat/${conv.id}`)}
                      style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: 14, padding: "16px 18px", cursor: "pointer", animation: `fadeUp 0.4s ${i * 0.06}s ease both` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                          🧑‍🤝‍🧑 {conv.patient_name || "Patient"}
                        </p>
                        <span style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: 10, fontWeight: 700 }}>ACTIVE</span>
                      </div>
                      {conv.last_message && (
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                          {conv.last_message.slice(0, 70)}{conv.last_message.length > 70 ? "…" : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
