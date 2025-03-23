import { useState, useEffect } from "react";

function Atenciones() {
  const [formData, setFormData] = useState({
    id_cliente: "",
    patente: "",
    id_usuario: "",
    fecha: "",
    descripcion: "",
    monto: "",
  });

  const [clientes, setClientes] = useState([]);
  const [patentes, setPatentes] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resClientes = await fetch("http://localhost:5000/api/clientes");
        const clientesData = await resClientes.json();
        setClientes(clientesData);

        const resTrabajadores = await fetch("http://localhost:5000/api/trabajadores");
        const trabajadoresData = await resTrabajadores.json();
        setTrabajadores(trabajadoresData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClienteChange = async (e) => {
    const id_cliente = e.target.value;
    setFormData({ ...formData, id_cliente, patente: "" });
    if (id_cliente) {
      try {
        const res = await fetch(`http://localhost:5000/api/clientes/${id_cliente}/patentes`);
        const data = await res.json();
        setPatentes([...new Set(data.map((p) => p.patente))]);
      } catch (error) {
        console.error("Error al obtener patentes:", error);
        setPatentes([]);
      }
    } else {
      setPatentes([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:5000/api/atenciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al registrar atención");
      setSuccess("Atención registrada con éxito");
      setFormData({ id_cliente: "", patente: "", id_usuario: "", fecha: "", descripcion: "", monto: "" });
    } catch (error) {
      setError(error.message);
    }
  };

  const styles = {
    container: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f0f0" },
    formContainer: { background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", width: "350px" },
    title: { textAlign: "center", color: "#2c3e50", fontSize: "24px", fontWeight: "bold" },
    input: { padding: "8px", borderRadius: "5px", border: "1px solid #ccc", width: "100%", marginBottom: "10px" },
    button: { background: "#2c3e50", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%" },
    error: { color: "red", textAlign: "center", marginTop: "10px" },
    success: { color: "green", textAlign: "center", marginTop: "10px" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Registrar Atención</h2>
        <form onSubmit={handleSubmit}>
          <label>Cliente:</label>
          <select name="id_cliente" value={formData.id_cliente} onChange={handleClienteChange} style={styles.input} required>
            <option value="">Seleccione un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id_cliente} value={cliente.id_cliente}>{cliente.nombre}</option>
            ))}
          </select>

          <label>Patente:</label>
          <select name="patente" value={formData.patente} onChange={handleChange} style={styles.input} required>
            <option value="">Seleccione una patente</option>
            {patentes.map((patente, index) => (
              <option key={index} value={patente}>{patente}</option>
            ))}
          </select>

          <label>Trabajador:</label>
          <select name="id_usuario" value={formData.id_usuario} onChange={handleChange} style={styles.input} required>
            <option value="">Seleccione un trabajador</option>
            {trabajadores.map((trabajador) => (
              <option key={trabajador.id_usuario} value={trabajador.id_usuario}>{trabajador.email}</option>
            ))}
          </select>

          <label>Fecha:</label>
          <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} style={styles.input} required />

          <label>Descripción:</label>
          <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} style={styles.input} required />

          <label>Monto:</label>
          <input type="number" name="monto" value={formData.monto} onChange={handleChange} style={styles.input} required />

          <button type="submit" style={styles.button}>Registrar Atención</button>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </form>
      </div>
    </div>
  );
}

export default Atenciones;
