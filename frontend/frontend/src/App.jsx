import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";
import Dashboard from "./Dashboard.jsx";
import CrearUsuario from "./CrearUsuario.jsx"; 
import CrearTrabajador from "./CrearTrabajador.jsx";
import CrearCliente from "./CrearCliente.jsx";
import SueldoTrabajadores from "./SueldoTrabajadores.jsx";
import Atenciones from "./Atenciones.jsx";
import Certificados from "./Certificados.jsx";

function App() {
  const [formData, setFormData] = useState({
    email: "",
    clave: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("Rol guardado en localStorage:", localStorage.getItem("rol"));
  }, []);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio.";
    if (!formData.clave.trim()) {
      newErrors.clave = "La contraseña es obligatoria.";
    } else if (formData.clave.length < 5) {
      newErrors.clave = "La contraseña debe tener al menos 5 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error en la solicitud");

      console.log("Respuesta del backend:", data);

      if (data.token && data.rol) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);
        console.log("Rol guardado correctamente:", data.rol);

        alert("Inicio de sesión exitoso!");
        window.location.href = "/dashboard";
      } else {
        throw new Error("Datos inválidos: No se recibió token o rol.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f0f0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", justifyContent: "center", alignItems: "center", background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", width: "350px", margin: "auto" }}>
                <h2 style={{ textAlign: "center", color: "blue", fontSize: "24px", fontWeight: "bold" }}>Inicia Sesión</h2>
                <form style={{ display: "flex", flexDirection: "column", gap: "10px" }} onSubmit={handleSubmit}>
                  <label>Escribe tu email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  {errors.email && <p style={{ color: "red", fontSize: "12px" }}>{errors.email}</p>}

                  <label>Escribe tu clave</label>
                  <input type="password" name="clave" value={formData.clave} onChange={handleChange} required />
                  {errors.clave && <p style={{ color: "red", fontSize: "12px" }}>{errors.clave}</p>}

                  <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Procesando..." : "Iniciar Sesión"}</button>
                </form>
              </div>
            </div>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crear-usuario"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "operador"]}>
              <CrearUsuario />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/crear-trabajador"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "operador"]}>
              <CrearTrabajador />
            </RoleProtectedRoute>
          }
        />
           
        <Route
          path="/crear-clientes"
          element={
            <RoleProtectedRoute allowedRoles={["trabajador"]}>
              <CrearCliente />
            </RoleProtectedRoute>
          }
        />
         <Route
          path="/sueldos-trabajadores"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "operador"]}>
              <SueldoTrabajadores />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/atenciones"
          element={
            <RoleProtectedRoute allowedRoles={["trabajador", "operador"]}>
              <Atenciones />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/certificados"
          element={
            <RoleProtectedRoute allowedRoles={["trabajador", "operador"]}>
              <Certificados />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
