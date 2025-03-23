import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nombre: "", email: "", clave: "", rol: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Estado para alternar entre Login y Registro

  const validateForm = () => {
    let newErrors = {};
    if (!isLogin && !formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio.";
    if (!formData.clave.trim()) {
      newErrors.clave = "La contraseña es obligatoria.";
    } else if (formData.clave.length < 5) {
      newErrors.clave = "La contraseña debe tener al menos 5 caracteres.";
    }
    if (!isLogin && !formData.rol.trim()) newErrors.rol = "El rol es obligatorio.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const url = isLogin ? "http://localhost:5000/login" : "http://localhost:5000/register";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error en la solicitud");

      alert(isLogin ? "Inicio de sesión exitoso!" : "Usuario registrado con éxito!");

      if (isLogin) {
        localStorage.setItem("token", data.token); // Guardar el token en localStorage
        navigate("/dashboard"); // Redirigir al dashboard
      } else {
        setFormData({ nombre: "", email: "", clave: "", rol: "" }); // Limpiar el formulario
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f0f0" }}>
      <div style={{ width: "350px", padding: "20px", background: "white", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center", color: "blue" }}>{isLogin ? "Iniciar Sesión" : "Registro"}</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {!isLogin && (
            <>
              <label>Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
              {errors.nombre && <p style={{ color: "red" }}>{errors.nombre}</p>}
            </>
          )}

          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

          <label>Contraseña</label>
          <input type="password" name="clave" value={formData.clave} onChange={handleChange} required />
          {errors.clave && <p style={{ color: "red" }}>{errors.clave}</p>}

          {!isLogin && (
            <>
              <label>Rol</label>
              <input type="text" name="rol" value={formData.rol} onChange={handleChange} required />
              {errors.rol && <p style={{ color: "red" }}>{errors.rol}</p>}
            </>
          )}

          <button type="submit" disabled={isSubmitting} style={{ background: isSubmitting ? "gray" : "blue", color: "white", padding: "10px", borderRadius: "5px" }}>
            {isSubmitting ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Registrarme"}
          </button>
        </form>

        <p onClick={() => setIsLogin(!isLogin)} style={{ textAlign: "center", color: "blue", cursor: "pointer", marginTop: "10px" }}>
          {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </p>
      </div>
    </div>
  );
}

export default LoginRegister;
