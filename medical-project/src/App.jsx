import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/loginpage.jsx";
import LoginModal from "./pages/LoginModal.jsx";

import PatientSignup from "./pages/patientSignup.jsx";
import DoctorSignup from "./pages/doctorsignup.jsx";

import MedicalChatbot from "./components/chatbot.jsx";
import MedicalAnalyzer from "./components/MedicalAnalyzer.jsx";


import Successpagedoctor from "./success pages/successpagedoctor.jsx";
import Successpagepatient from "./success pages/successpagepatient.jsx";

import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import ChatPage from "./pages/ChatPage.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route path="/" element={<LoginPage />} />

        {/* AUTH */}
        <Route path="/loginmodal" element={<LoginModal />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/patient-signup" element={<PatientSignup />} />
        <Route path="/doctor-signup" element={<DoctorSignup />} />

        {/* APP FEATURES */}
        <Route path="/chat" element={<MedicalChatbot />} />
        <Route path="/analyzer" element={<MedicalAnalyzer />} />
      <Route path="/chat/:conversationId" element={<ChatPage />} />


        {/* SUCCESS */}
        <Route path="/success-doctor" element={<Successpagedoctor />} />
        <Route path="/success-patient" element={<Successpagepatient />} />

        {/* DASHBOARDS */}
        <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
        <Route path="/dashboard/patient" element={<PatientDashboard />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;