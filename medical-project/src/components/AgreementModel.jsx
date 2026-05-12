import { useState, useEffect } from "react";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const patientClauses = [
  { title: "No Replacement for Medical Care", body: "This platform is a supplementary tool and does not replace diagnosis or treatment from a licensed physician." },
  { title: "AI Limitations", body: "AI-generated suggestions may be incomplete or inaccurate. Do not act solely on AI advice." },
  { title: "Emergency Protocol", body: "In life-threatening situations, contact your local emergency services immediately." },
  { title: "Information Accuracy", body: "You are solely responsible for the accuracy of the medical information you provide." },
  { title: "Medication Disclaimer", body: "Always consult a qualified healthcare provider before starting, stopping, or changing any medication." },
];

const doctorClauses = [
  { title: "Credential Verification", body: "You confirm that all submitted medical credentials, licenses, and qualifications are authentic and valid." },
  { title: "Legal Accountability", body: "Submitting false credentials or information may result in immediate suspension and legal action." },
  { title: "Professional Responsibility", body: "You bear full professional responsibility for any medical advice or guidance provided to patients." },
  { title: "Platform Liability", body: "The platform assumes no liability for malpractice claims arising from your interactions with patients." },
  { title: "Ethical Compliance", body: "You agree to adhere to all applicable medical laws, ethical standards, and professional codes of conduct." },
];

export default function AgreementModal({ onAccept, onCancel, role = "patient" }) {
  const [agreed, setAgreed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);
e
  const clauses = role === "doctor" ? doctorClauses : patientClauses;
  const isDoctor = role === "doctor";

  const accent = isDoctor ? "#1a3a5c" : "#0f4c5c";
  const accentLight = isDoctor ? "#e8f0f7" : "#e6f4f7";
  const accentMid = isDoctor ? "#2e6ca6" : "#0e7c8c";
  const badge = isDoctor ? "PRACTITIONER AGREEMENT" : "PATIENT AGREEMENT";

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(8, 15, 28, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
          fontFamily: "'Georgia', serif",
        }}
      >
        {/* Header Bar */}
        <div style={{ background: accent, padding: "28px 32px 24px", position: "relative", overflow: "hidden" }}>
          {/* Decorative circle */}
          <div style={{
            position: "absolute", right: -40, top: -40,
            width: 160, height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />
          <div style={{
            position: "absolute", right: 20, bottom: -60,
            width: 120, height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <div style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "10px",
              padding: "8px",
              color: "white",
              display: "flex"
            }}>
              <ShieldIcon />
            </div>
            <span style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "10px",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "3px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}>
              {badge}
            </span>
          </div>

          <h2 style={{
            color: "#ffffff",
            fontSize: "22px",
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.3px",
            lineHeight: 1.3,
          }}>
            Terms of Use &<br />
            <span style={{ color: "rgba(255,255,255,0.75)", fontStyle: "italic", fontWeight: 400 }}>
              {isDoctor ? "Practitioner Responsibilities" : "Patient Acknowledgement"}
            </span>
          </h2>
        </div>

        {/* Clauses */}
        <div style={{ padding: "24px 32px", maxHeight: "300px", overflowY: "auto" }}>
          <p style={{
            fontSize: "12px",
            color: "#888",
            fontFamily: "sans-serif",
            marginBottom: "16px",
            letterSpacing: "0.3px",
          }}>
            Please read the following terms carefully before proceeding.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {clauses.map((clause, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "14px 16px",
                  background: i % 2 === 0 ? accentLight : "#fafafa",
                  borderRadius: "10px",
                  borderLeft: `3px solid ${accentMid}`,
                  animation: `fadeUp 0.4s ease ${0.05 * i + 0.2}s both`,
                }}
              >
                <div style={{ color: accentMid, marginTop: "2px" }}>
                  <CheckIcon />
                </div>
                <div>
                  <div style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: accent,
                    fontFamily: "sans-serif",
                    marginBottom: "3px",
                  }}>
                    {clause.title}
                  </div>
                  <div style={{
                    fontSize: "12.5px",
                    color: "#555",
                    fontFamily: "sans-serif",
                    lineHeight: 1.6,
                  }}>
                    {clause.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "20px 32px 28px",
          borderTop: "1px solid #f0f0f0",
          background: "#fafafa",
        }}>
          {/* Checkbox */}
          <label style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            cursor: "pointer",
            marginBottom: "20px",
          }}>
            <div
              onClick={() => setAgreed(!agreed)}
              style={{
                width: "18px", height: "18px",
                borderRadius: "5px",
                border: `2px solid ${agreed ? accentMid : "#ccc"}`,
                background: agreed ? accentMid : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                marginTop: "1px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {agreed && (
                <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{
              fontSize: "12.5px",
              color: "#444",
              fontFamily: "sans-serif",
              lineHeight: 1.6,
            }}>
              I have read, understood, and agree to all terms and conditions stated above.
            </span>
          </label>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "1.5px solid #e0e0e0",
                background: "white",
                color: "#555",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => e.target.style.background = "#f5f5f5"}
              onMouseLeave={e => e.target.style.background = "white"}
            >
              Decline
            </button>
            <button
              onClick={agreed ? onAccept : undefined}
              style={{
                flex: 2,
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                background: agreed ? accent : "#c8d0d8",
                color: "white",
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "sans-serif",
                cursor: agreed ? "pointer" : "not-allowed",
                transition: "all 0.25s ease",
                letterSpacing: "0.3px",
                boxShadow: agreed ? `0 4px 16px ${accent}55` : "none",
              }}
              onMouseEnter={e => { if (agreed) e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; }}
            >
              Accept & Continue →
            </button>
          </div>

          <p style={{
            textAlign: "center",
            fontSize: "11px",
            color: "#aaa",
            fontFamily: "sans-serif",
            marginTop: "14px",
            marginBottom: 0,
          }}>
            By continuing, you are legally bound by these terms.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}