// src/pages/PatientDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const rawUser  = localStorage.getItem("mc_user");
  const user     = rawUser ? JSON.parse(rawUser) : null;

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [starting, setStarting]           = useState(false);
  const [fetchError, setFetchError]       = useState("");   // ← separate
  const [startError, setStartError]       = useState("");   // ← separate

  useEffect(() => {
    if (!user || user.role !== "patient") navigate("/login");
  }, []);

  useEffect(() => {
    const activeConversationId = localStorage.getItem("activeConversationId");
    if (activeConversationId) navigate(`/chat/${activeConversationId}`);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await API.get("/api/chat/conversations");
      setConversations(res.data.conversations || []);
    } catch (e) {
      console.log("CONVERSATION ERROR:", e.response?.data || e);
      // Show the real server message so you can debug it
      const msg =
        e.response?.data?.error ||
        e.response?.data?.message ||
        e.message ||
        "Could not load conversations.";
      setFetchError(msg);
    }
    setLoading(false);
  };

  const startConversation = async () => {
    setStarting(true);
    setStartError("");
    try {
      const res    = await API.post("/api/chat/start");
      const convId = res.data.conversation_id;
      navigate(`/chat/${convId}`);
    } catch (e) {
      setStartError(e.response?.data?.error || "Could not start conversation.");
      setStarting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("mc_token");
    localStorage.removeItem("mc_user");
    navigate("/");
  };

  const statusColor = (s) =>
    s === "active" ? "#10b981" : s === "pending" ? "#f59e0b" : "#6b7280";

  const statusLabel = (s) =>
    s === "active" ? "Active" : s === "pending" ? "Waiting for doctor" : "Closed";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 50%, #0a1628 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "white",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .conv-card:hover { background: rgba(56,189,248,0.1) !important; border-color: rgba(56,189,248,0.4) !important; transform: translateY(-1px); }
        .conv-card { transition: all 0.2s ease; }
        .retry-btn:hover { background: rgba(56,189,248,0.15) !important; }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0f4c5c,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🩺</div>
          <span style={{ fontWeight: 600, fontSize: 16, color: "rgba(255,255,255,0.9)" }}>Medical Portal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Patient</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#38bdf8,#0f4c5c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
            {user?.name?.[0]?.toUpperCase() || "P"}
          </div>
          <button onClick={handleLogout} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>

        {/* ── Welcome Header ── */}
        <div style={{ marginBottom: 36, animation: "fadeUp 0.5s ease both" }}>
          <p style={{ fontSize: 12, color: "#38bdf8", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Patient Dashboard</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0, color: "white" }}>
            Hello, {user?.name?.split(" ")[0] || "Patient"} 
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
            Describe your symptoms to get connected with an available doctor.
          </p>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32, animation: "fadeUp 0.5s 0.1s ease both" }}>
          {[
            { label: "Total Visits",  value: conversations.length,                                   icon: "💬", color: "#38bdf8" },
            { label: "Active Chat",   value: conversations.filter(c => c.status === "active").length,  icon: "✅", color: "#10b981" },
            { label: "Pending",       value: conversations.filter(c => c.status === "pending").length, icon: "⏳", color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'Playfair Display',serif" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Start New Conversation ── */}
        <div style={{ background: "linear-gradient(135deg,rgba(56,189,248,0.08),rgba(15,76,92,0.15))", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 18, padding: "28px 32px", marginBottom: 32, animation: "fadeUp 0.5s 0.15s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px", fontFamily: "'Playfair Display',serif" }}>Need Medical Help?</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                Start a new consultation — an available doctor will respond shortly.
              </p>
            </div>
            <button onClick={startConversation} disabled={starting}
              style={{ padding: "13px 28px", borderRadius: 12, border: "none", background: starting ? "rgba(56,189,248,0.2)" : "linear-gradient(135deg,#38bdf8,#0ea5e9)", color: starting ? "rgba(255,255,255,0.4)" : "#06060e", fontSize: 14, fontWeight: 700, cursor: starting ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
              {starting ? (
                <><span style={{ animation: "pulse 1s infinite" }}>●</span> Connecting…</>
              ) : (
                <>＋ Start Consultation</>
              )}
            </button>
          </div>
          {/* ── Start error only ── */}
          {startError && (
            <p style={{ marginTop: 14, fontSize: 13, color: "#f87171", background: "rgba(239,68,68,0.08)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
              ⚠ {startError}
            </p>
          )}
        </div>

        {/* ── Conversation History ── */}
        <div style={{ animation: "fadeUp 0.5s 0.2s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0, fontWeight: 600 }}>
              Your Consultations
            </h3>
            {/* ── Retry button shown only on fetch error ── */}
            {fetchError && !loading && (
              <button onClick={fetchConversations} className="retry-btn"
                style={{ fontSize: 12, color: "#38bdf8", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.25)", borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}>
                ↻ Retry
              </button>
            )}
          </div>

          {/* ── Fetch error banner ── */}
          {fetchError && !loading && (
            <div style={{ marginBottom: 16, fontSize: 13, color: "#f87171", background: "rgba(239,68,68,0.08)", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
              <span>⚠</span>
              <span>{fetchError}</span>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
              <span style={{ animation: "pulse 1s infinite", display: "inline-block" }}>Loading…</span>
            </div>
          ) : conversations.length === 0 && !fetchError ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🏥</div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No consultations yet. Start one above.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {conversations.map((conv, i) => (
                <div key={conv.id} className="conv-card"
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", animation: `fadeUp 0.4s ${i * 0.05}s ease both` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${statusColor(conv.status)}22`, border: `1px solid ${statusColor(conv.status)}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      {conv.status === "active" ? "💬" : conv.status === "pending" ? "⏳" : "✓"}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                        {conv.doctor_name ? `Dr. ${conv.doctor_name}` : "Waiting for doctor…"}
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                        {new Date(conv.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        {conv.last_message && ` · ${conv.last_message.slice(0, 40)}…`}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ padding: "4px 12px", borderRadius: 99, background: `${statusColor(conv.status)}18`, border: `1px solid ${statusColor(conv.status)}44`, color: statusColor(conv.status), fontSize: 11, fontWeight: 600 }}>
                      {statusLabel(conv.status)}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 18 }}>›</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;