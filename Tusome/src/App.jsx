import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Portal from "./pages/Portal";
import AdminDashboard from "./pages/AdminDashboard";
import ConsultantVerify from "./pages/ConsultantVerify";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Portal role="student" />} />
      <Route path="/consultant" element={<Portal role="consultant" />} />
      <Route path="/consultant/verify" element={<ConsultantVerify />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
