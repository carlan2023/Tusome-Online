import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingpage";
import Login from "./pages/Login";
import Register from "./pages/register";
import Portal from "./pages/Portal";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Portal role="student" />} />
      <Route path="/consultant" element={<Portal role="consultant" />} />
      <Route path="/admin" element={<Portal role="admin" />} />
    </Routes>
  );
}
