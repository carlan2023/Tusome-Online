export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const PORTAL_ROUTES = {
  student: "/dashboard",
  consultant: "/consultant",
  admin: "/admin",
};

export const PORTAL_LABELS = {
  student: "Student Dashboard",
  consultant: "Consultant Portal",
  admin: "Admin Portal",
};

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("tu_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("tu_access");
  localStorage.removeItem("tu_refresh");
  localStorage.removeItem("tu_user");
}
