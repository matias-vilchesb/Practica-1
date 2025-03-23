import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CrearUsuario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    clave: "",
    rol: "operador",
  });
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/usuarios");
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al registrar usuario");

      setSuccess("Usuario creado con éxito");
      setTimeout(() => navigate("/dashboard"), 2000);
      fetchUsuarios();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id_usuario) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No tienes permisos, inicia sesión nuevamente.");
      return;
    }

    try {
      await fetch(`http://localhost:5000/api//eliminar-usuario/${id_usuario}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el trabajador");
      }
      setUsuarios(usuarios.filter((usuario) => usuario.id_usuario !== id_usuario));
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setError("Error al eliminar trabajador");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#f0f0f0", padding: "20px" }}>
      <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", width: "350px" }}>
        <h2 style={{ textAlign: "center", color: "#2c3e50", fontSize: "24px", fontWeight: "bold" }}>Crear Usuario</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />

          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />

          <label>Contraseña</label>
          <input type="password" name="clave" value={formData.clave} onChange={handleChange} required style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />

          <label>Rol</label>
          <select name="rol" value={formData.rol} onChange={handleChange} required style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
            <option value="operador">Operador</option>
            <option value="admin">Administrador</option>
            <option value="trabajador">Trabajador</option>
            <option value="cliente">Cliente</option>
          </select>

          <button type="submit" style={{ width: "100%", padding: "10px", background: "#2c3e50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Registrar</button>
          {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}
          {success && <p style={{ color: "green", textAlign: "center", marginTop: "10px" }}>{success}</p>}
        </form>
      </div>

      <h2 style={{ marginTop: "20px", color: "#2c3e50" }}>Lista de Usuarios</h2>
      <table style={{ width: "80%", borderCollapse: "collapse", background: "white", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)" }}>
        <thead>
          <tr style={{ background: "#2c3e50", color: "white" }}>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id_usuario} style={{ textAlign: "center", background: "#f9f9f9" }}>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.rol}</td>
              <td>
                <button onClick={() => handleDelete(usuario.id_usuario)} style={{ background: "red", color: "white", border: "none", padding: "5px", cursor: "pointer" }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CrearUsuario;
