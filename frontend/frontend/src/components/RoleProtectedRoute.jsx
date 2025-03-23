import { Navigate } from "react-router-dom";

function RoleProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol"); // Obtener rol del usuario logueado

  if (!token || !allowedRoles.includes(rol)) {
    return <Navigate to="/dashboard" />; // 🔀 Redirigir si no tiene permisos
  }

  return children;
}

export default RoleProtectedRoute;
