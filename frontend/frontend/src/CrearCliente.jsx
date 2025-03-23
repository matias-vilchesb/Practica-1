import { useEffect, useState } from "react";

function CrearCliente() {
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [editando, setEditando] = useState(false);
  const [clienteActual, setClienteActual] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    id_usuario: "",
    nombre: "",
    email: "",
    direccion: "",
    fecha_nacimiento: "",
    rut: "",
    telefono: "",
    patente: "",
    marca: "",
    modelo: "",
    tipo: "",
    color: "",
    kilometraje: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const response = await fetch("http://localhost:5000/api/clientes-disponibles");
        const data = await response.json();
        setUsuariosDisponibles(data);
      } catch (error) {
        console.error("Error al obtener clientes disponibles:", error);
      }
    }
    fetchUsuarios();
    async function fetchClientes() {
      try {
        const response = await fetch("http://localhost:5000/api/clientes");
        
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Clientes obtenidos:", data); // Para depuración
        // Verifica que data sea un array antes de actualizar el estado
        if (Array.isArray(data)) {
          setClientes(data);
        } else {
          console.error("La respuesta del servidor no es un array:", data);
        }
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    }
    fetchClientes();
  }, []);

  

  const handleDelete = async (id_cliente) => {
    console.log("Intentando eliminar cliente con ID:", id_cliente); // <-- DEBUG
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No tienes permisos, inicia sesión nuevamente.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/eliminar-cliente/${id_cliente}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data); // <-- DEBUG
      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el trabajador");
      }

      setClientes(clientes.filter((cliente) => cliente.id_cliente !== id_cliente));
      
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      setError("Error al eliminar cliente");
    }
  };

  const handleEdit = (cliente) => {
    console.log("Editando cliente:", cliente);  // Verifica si esta función se ejecuta
    setClienteActual(cliente);
    setFormData({
      id_cliente: cliente.id_cliente || "",
      id_usuario: cliente.id_usuario || "",
      nombre: cliente.nombre || "",
      email: cliente.email || "",
      direccion: cliente.direccion || "",
      fecha_nacimiento: cliente.fecha_nacimiento ? cliente.fecha_nacimiento.split("T")[0] : "",
      rut: cliente.rut || "",
      telefono: cliente.telefono || "",
      patente: cliente.patente || "",
      marca: cliente.marca || "",
      modelo: cliente.modelo || "",
      tipo: cliente.tipo || "",
      color: cliente.color || "",
      kilometraje: cliente.kilometraje || "",
  });
    setEditando(true);
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

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No tienes permisos, inicia sesión nuevamente.");
      return;
    }

    const url = editando
      ? `http://localhost:5000/api/actualizar-cliente/${clienteActual.id_cliente}`
      : "http://localhost:5000/api/crear-clientes";
    const method = editando ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al registrar el cliente");
      }

      if (!editando) {
        setClientes([...clientes, data]);
      } else {
        setClientes(clientes.map((c) => (c.id_cliente === clienteActual.id_cliente ? data : c)));
      }

      setSuccess(editando ? "Cliente actualizado con éxito" : "Cliente creado con éxito");
      setFormData({
        id_usuario: "",
        nombre: "",
        email: "",
        direccion: "",
        fecha_nacimiento: "",
        rut: "",
        telefono: "",
        patente: "",
        marca: "",
        modelo: "",
        tipo: "",
        color: "",
        kilometraje: "",
      });
      setEditando(false);
      setClienteActual(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const styles = {
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
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "170vh",
      background: "#f0f0f0",
    },
    formContainer: {
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
      width: "350px",
    },
    title: {
      textAlign: "center",
      color: "#2c3e50",
      fontSize: "24px",
      fontWeight: "bold",
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
    error: {
      color: "red",
      textAlign: "center",
      marginTop: "10px",
    },
    success: {
      color: "green",
      textAlign: "center",
      marginTop: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}> {editando ? "Actualizar Cliente" : "Crear Cliente"}</h2>
        <form onSubmit={handleSubmit}>
         <label>Seleccionar Usuario:</label>
          <select name="id_usuario" value={formData.id_usuario} onChange={handleChange} style={styles.input} required={!editando}>
            <option value="">Seleccione un usuario</option>
            {usuariosDisponibles.map((usuario) => (
              <option key={usuario.id_usuario} value={usuario.id_usuario}>
                {usuario.nombre} - {usuario.email}
              </option>
            ))}
          </select>

          <label>Dirección</label>
          <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} style={styles.input} required />

          <label>Fecha de Nacimiento</label>
          <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} style={styles.input} required />

          <label>RUT</label>
          <input type="text" name="rut" value={formData.rut} onChange={handleChange} style={styles.input} required />

          <label>Teléfono</label>
          <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} style={styles.input} required />

          <h3 style={styles.title}>Datos del Auto</h3>
          <label>Patente</label>
          <input type="text" name="patente" value={formData.patente} onChange={handleChange} style={styles.input} required />

          <label>Marca</label>
          <input type="text" name="marca" value={formData.marca} onChange={handleChange} style={styles.input} required />

          <label>Modelo</label>
          <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} style={styles.input} required />

          <label>Tipo</label>
          <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} style={styles.input} required />

          <label>Color</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange} style={styles.input} required />

          <label>Kilometraje</label>
          <input type="number" name="kilometraje" value={formData.kilometraje} onChange={handleChange} style={styles.input} required />

          <button type="submit" style={styles.button}>{editando ? "Actualizar Cliente" : "Registrar Cliente"}</button>
          

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </form>
      </div>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th>Nombre</th>
            <th>Email</th>
            <th>RUT</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id_cliente} style={styles.tableRow}>
              <td>{cliente.nombre}</td>
              <td>{cliente.email}</td>
              <td>{cliente.rut}</td>
              <td><button onClick={() => handleDelete(cliente.id_cliente)} style={styles.button}>Eliminar</button></td>
              <td><button onClick={() => handleEdit(cliente)} style={styles.button}>Editar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CrearCliente;
