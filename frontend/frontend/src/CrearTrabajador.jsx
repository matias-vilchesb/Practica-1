import { useEffect, useState } from "react";

function CrearTrabajador() {
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [formData, setFormData] = useState({
    id_usuario: "",
    sueldo: "",
    rut: "",
    fecha_contratacion: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const response = await fetch("http://localhost:5000/api/trabajadores-disponibles");
        const data = await response.json();
        setUsuariosDisponibles(data);
      } catch (error) {
        console.error("Error al obtener trabajadores disponibles:", error);
      }
    }

    async function fetchTrabajadores() {
      try {
        const response = await fetch("http://localhost:5000/api/trabajadores");
        const data = await response.json();
        setTrabajadores(data);
      } catch (error) {
        console.error("Error al obtener trabajadores:", error);
      }
    }
    
    fetchUsuarios();
    fetchTrabajadores();
  }, []);

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

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No tienes permisos, inicia sesión nuevamente.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/trabajadores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al registrar el trabajador");
      }

      setSuccess("Trabajador creado con éxito");
      setFormData({ id_usuario: "", sueldo: "", rut: "", fecha_contratacion: "" });
      setTrabajadores([...trabajadores, data]);
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
      const response = await fetch(`http://localhost:5000/api/eliminar-trabajador/${id_usuario}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el trabajador");
      }

      setTrabajadores(trabajadores.filter((trabajador) => trabajador.id_usuario !== id_usuario));
    } catch (error) {
      console.error("Error al eliminar trabajador:", error);
      setError("Error al eliminar trabajador");
    }
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      background: "#f0f0f0",
    },
    formContainer: {
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
      width: "350px",
      marginBottom: "20px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
    },
    tableHeader: {
      background: "#2c3e50",
      color: "white",
    },
    tableRow: {
      background: "#f9f9f9",
      textAlign: "center",
    },
    input: {
      padding: "8px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      width: "100%",
      marginBottom: "10px",
    },
    button: {
      background: "#2c3e50",
      color: "white",
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      width: "100%",
    },
    error: { color: "red", textAlign: "center", marginTop: "10px" },
    success: { color: "green", textAlign: "center", marginTop: "10px" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Crear Trabajador</h2>
        <form onSubmit={handleSubmit}>
          <label>Usuario</label>
          <select name="id_usuario" value={formData.id_usuario} onChange={handleChange} style={styles.input} required>
            <option value="">Seleccione un usuario</option>
            {usuariosDisponibles.map((usuario) => (
              <option key={usuario.id_usuario} value={usuario.id_usuario}>
                {usuario.nombre} - {usuario.email}
              </option>
            ))}
          </select>
          <label>Sueldo</label>
          <input type="number" name="sueldo" value={formData.sueldo} onChange={handleChange} style={styles.input} required />
          <label>RUT</label>
          <input type="text" name="rut" value={formData.rut} onChange={handleChange} style={styles.input} required />
          <label>Fecha de Contratación</label>
          <input type="date" name="fecha_contratacion" value={formData.fecha_contratacion} onChange={handleChange} style={styles.input} required />
          <button type="submit" style={styles.button}>Registrar</button>
          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </form>
      </div>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th>Nombre</th>
            <th>Email</th>
            <th>Sueldo</th>
            <th>RUT</th>
            <th>Fecha de Contratación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {trabajadores.map((trabajador) => (
            <tr key={trabajador.id_usuario} style={styles.tableRow}>
              <td>{trabajador.nombre}</td>
              <td>{trabajador.email}</td>
              <td>{trabajador.sueldo}</td>
              <td>{trabajador.rut}</td>
              <td>{new Date(trabajador.fecha_contratacion).toLocaleDateString()}</td>
              <td><button onClick={() => handleDelete(trabajador.id_usuario)} style={styles.button}>Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CrearTrabajador;