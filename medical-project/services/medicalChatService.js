// src/services/medicalChatService.js
// Connects React frontend to Flask medical AI backend

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Send a patient question to the medical AI backend.
 * @param {string} question - Patient symptom description
 * @returns {Promise<{answer: string, confidence: number, matched_question: string, status: string}>}
 */
export async function askMedicalAI(question) {
  if (!question || question.trim().length < 10) {
    throw new Error("Please describe your symptoms in more detail (at least 10 characters).");
  }

  const response = await fetch(`${BASE_URL}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question.trim() }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Health check — ping the Flask server.
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}