// src/pages/ChatPage.jsx
// Full real-time chat — works for both doctor and patient
// Route: /chat/:conversationId

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import socket from "../sockets/socket";

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const rawUser  = localStorage.getItem("mc_user");
  const user     = rawUser ? JSON.parse(rawUser) : null;

  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [convInfo, setConvInfo]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);
  const [connected, setConnected]   = useState(false);
  const [error, setError]           = useState("");
  const [closed, setClosed]         = useState(false);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const messagesEndRef = useRef(null);

  // ── Redirect if not logged in ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) navigate("/login");
  }, []);

  // ── Load existing messages + conversation info ─────────────────────────────
  useEffect(() => {
    if (!conversationId || !user) return;
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    setLoading(true);
    try {
      const [msgRes, convRes] = await Promise.all([
        API.get(`/api/chat/messages/${conversationId}`),
        API.get(`/api/chat/conversation/${conversationId}`),
      ]);
      setMessages(msgRes.data.messages || []);
      setConvInfo(convRes.data.conversation || null);
      setClosed(convRes.data.conversation?.status === "closed");
    } catch (e) {
  console.error(e);

  if (e.response?.status === 404) {
    localStorage.removeItem("activeConversationId");

    navigate(
      user?.role === "doctor"
        ? "/dashboard/doctor"
        : "/dashboard/patient"
    );

    return;
  }

  setError("Could not load conversation.");
}
    setLoading(false);
  };

  // ── WebSocket setup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId || !user) return;

    const token = localStorage.getItem("mc_token");
    socket.auth = { token };
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      // Join this conversation's room
      socket.emit("join_conversation", { conversation_id: conversationId });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", (data) => {
  setMessages((prev) => {
    const exists = prev.some(
      (m) => String(m.id) === String(data.id)
    );

    if (exists) return prev;

    return [...prev, data];
  });
});

    socket.on("conversation_closed", () => {
      setClosed(true);
    });

    socket.on("doctor_joined", (data) => {
      setConvInfo(prev => prev ? { ...prev, doctor_name: data.doctor_name, status: "active" } : prev);
    });

    return () => {
      socket.emit("leave_conversation", { conversation_id: conversationId });
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new_message");
      socket.off("conversation_closed");
      socket.off("doctor_joined");
      socket.disconnect();
    };
  }, [conversationId]);

  // ── Auto-scroll to bottom on new messages ─────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────
 
const sendMessage = async () => {
  const text = input.trim();

  if (!text || sending || closed) return;

  setSending(true);
  setError("");

  try {
    await API.post(`/api/chat/message/${conversationId}`, {
      content: text,
    });

    // Clear only after successful send
    setInput("");
  } catch (e) {
    console.error(e);
    setError("Failed to send message.");
  }

  setSending(false);
  inputRef.current?.focus();
};


  // ── Close conversation (doctor only) ─────────────────────────────────────
  const closeConversation = async () => {
    if (!window.confirm("Mark this consultation as complete?")) return;
    try {
      await API.post(`/api/chat/close/${conversationId}`);
      setClosed(true);
      socket.emit("close_conversation", { conversation_id: conversationId });
    } catch {
      setError("Could not close conversation.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

const isMe = (msg) => {
  return String(msg.sender_id) === String(user?.id);
};

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const otherName = () => {
    if (!convInfo) return "Loading…";
    if (user?.role === "patient") {
      return convInfo.doctor_name ? `Dr. ${convInfo.doctor_name}` : "Waiting for doctor…";
    }
    return convInfo.patient_name || "Patient";
  };

  const statusDot = connected
    ? { color: "#10b981", label: "Connected" }
    : { color: "#ef4444", label: "Reconnecting…" };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#07090f",
      fontFamily: "'DM Sans', sans-serif",
      color: "white",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        textarea:focus { outline: none; }
        textarea { resize: none; }
      `}</style>

      {/* ── Chat Header ── */}
      <div style={{ background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate(user?.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient")}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            ← Back
          </button>

          <div style={{ width: 38, height: 38, borderRadius: 10, background: user?.role === "patient" ? "linear-gradient(135deg,#1e3a5f,#3b82f6)" : "linear-gradient(135deg,#0f4c5c,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            {user?.role === "patient" ? "👨‍⚕️" : "🧑‍🤝‍🧑"}
          </div>

          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, fontFamily: "'Playfair Display',serif" }}>{otherName()}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusDot.color, display: "inline-block", animation: connected ? "pulse 2s infinite" : "none" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{statusDot.label}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {closed && (
            <span style={{ padding: "5px 14px", borderRadius: 99, background: "rgba(107,114,128,0.15)", border: "1px solid rgba(107,114,128,0.3)", color: "#9ca3af", fontSize: 12, fontWeight: 600 }}>
              Consultation Closed
            </span>
          )}
          {user?.role === "doctor" && !closed && (
            <button onClick={closeConversation}
              style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(107,114,128,0.3)", background: "rgba(107,114,128,0.08)", color: "#9ca3af", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              ✓ Close Consultation
            </button>
          )}
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 4 }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.2)", animation: "pulse 1s infinite", fontSize: 14 }}>
            Loading conversation…
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", margin: "auto", padding: "48px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, maxWidth: 300, margin: "0 auto" }}>
              {user?.role === "patient"
                ? "Describe your symptoms below. A doctor will respond shortly."
                : "The patient will describe their symptoms. Respond when ready."}
            </p>
          </div>
        ) : (
          <>
            {/* Date separator at top */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)", padding: "4px 12px", borderRadius: 99 }}>
                {new Date(messages[0]?.created_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>

            {messages.map((msg, i) => {
              const mine = isMe(msg);
   const showAvatar =
  !mine &&
  (i === 0 ||
    messages[i - 1]?.sender_id !== msg.sender_id);

              return (
                <div key={msg.id} style={{
                  display: "flex",
                  flexDirection: mine ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: 8,
                  marginBottom: 6,
                  animation: mine ? "slideIn 0.25s ease" : "slideInLeft 0.25s ease",
                }}>
                  {/* Avatar for other person */}
                  {!mine && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: msg.sender_role === "doctor" ? "linear-gradient(135deg,#1e3a5f,#3b82f6)" : "linear-gradient(135deg,#0f4c5c,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, opacity: showAvatar ? 1 : 0 }}>
                      {msg.sender_role === "doctor" ? "👨‍⚕️" : "🧑"}
                    </div>
                  )}

                  <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", gap: 2 }}>
                    {/* Sender label */}
                    {showAvatar && !mine && (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 2, paddingLeft: 4 }}>
                        {msg.sender_role === "doctor" ? `Dr. ${convInfo?.doctor_name || "Doctor"}` : convInfo?.patient_name || "Patient"}
                      </span>
                    )}

                    {/* Bubble */}
                    <div style={{
                      padding: "11px 16px",
                      borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: mine
                        ? "linear-gradient(135deg, #38bdf8, #0ea5e9)"
                        : "rgba(255,255,255,0.07)",
                      border: mine ? "none" : "1px solid rgba(255,255,255,0.09)",
                      color: mine ? "#06060e" : "rgba(255,255,255,0.88)",
                      fontSize: 14,
                      lineHeight: 1.55,
                      wordBreak: "break-word",
                      opacity: msg.optimistic ? 0.65 : 1,
                      transition: "opacity 0.3s",
                    }}>
                      {msg.content}
                    </div>

                    {/* Timestamp */}
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", padding: "0 4px" }}>
                      {formatTime(msg.created_at)}
                      {msg.optimistic && " · Sending…"}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Doctor joined notification */}
        {convInfo?.status === "active" && user?.role === "patient" && (
          <div style={{ textAlign: "center", margin: "8px 0" }}>
            <span style={{ fontSize: 12, color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", padding: "5px 14px", borderRadius: 99 }}>
              ✓ Dr. {convInfo.doctor_name} has joined the consultation
            </span>
          </div>
        )}

        {/* Closed notice */}
        {closed && (
          <div style={{ textAlign: "center", margin: "16px 0" }}>
            <span style={{ fontSize: 12, color: "#9ca3af", background: "rgba(107,114,128,0.08)", border: "1px solid rgba(107,114,128,0.2)", padding: "6px 16px", borderRadius: 99 }}>
              This consultation has been closed
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Error bar ── */}
      {error && (
        <div style={{ padding: "8px 24px", background: "rgba(239,68,68,0.08)", borderTop: "1px solid rgba(239,68,68,0.15)", fontSize: 12, color: "#f87171", flexShrink: 0 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Input Area ── */}
      {!closed ? (
        <div style={{ background: "rgba(255,255,255,0.025)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "16px 20px", display: "flex", alignItems: "flex-end", gap: 12, flexShrink: 0 }}>

          {/* Pending notice for patient */}
          {user?.role === "patient" && convInfo?.status === "pending" && (
            <div style={{ position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", padding: "8px 18px", borderRadius: 99, fontSize: 12, color: "#fbbf24", whiteSpace: "nowrap" }}>
              ⏳ Waiting for a doctor to join…
            </div>
          )}

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={user?.role === "patient" ? "Describe your symptoms…" : "Type your medical advice…"}
            rows={1}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              fontSize: 14,
              fontFamily: "'DM Sans',sans-serif",
              lineHeight: 1.5,
              maxHeight: 120,
              overflowY: "auto",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "rgba(56,189,248,0.5)"}
            onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />

          <button onClick={sendMessage} disabled={!input.trim() || sending}
            style={{
              width: 46, height: 46, borderRadius: 12, border: "none", flexShrink: 0,
              background: input.trim() && !sending
                ? "linear-gradient(135deg,#38bdf8,#0ea5e9)"
                : "rgba(255,255,255,0.06)",
              color: input.trim() && !sending ? "#06060e" : "rgba(255,255,255,0.2)",
              fontSize: 18, cursor: input.trim() && !sending ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
            {sending ? (
              <span style={{ fontSize: 10, animation: "pulse 0.8s infinite" }}>●</span>
            ) : "➤"}
          </button>
        </div>
      ) : (
        <div style={{ padding: "16px 24px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.07)", textAlign: "center", flexShrink: 0 }}>
          <button onClick={() => navigate(user?.role === "patient" ? "/dashboard/patient" : "/dashboard/doctor")}
            style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid rgba(56,189,248,0.3)", background: "rgba(56,189,248,0.08)", color: "#38bdf8", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            ← Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
