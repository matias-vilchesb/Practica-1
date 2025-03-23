import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function SueldoTrabajadores() {
  const [sueldos, setSueldos] = useState([]);

  useEffect(() => {
    async function fetchSueldos() {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch("http://localhost:5000/api/sueldos-trabajadores", {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          console.log("Respuesta completa del servidor:", response);
      
          if (!response.ok) throw new Error("Error al obtener sueldos");
      
          const data = await response.json(); // Aquí aseguramos que data esté definida
          console.log("Datos de sueldos recibidos:", data);
      
          if (!Array.isArray(data)) {
            throw new Error("La API no devolvió un array");
          }
      
          const formattedData = data.map(item => ({
            nombre: item.nombre || "Sin nombre",
            sueldo: Number(item.sueldo) || 0,
          }));
      
          console.log("Datos formateados:", formattedData);
          setSueldos(formattedData);
        } catch (error) {
          console.error("Error en fetchSueldos:", error);
        }
      }
    fetchSueldos();
  }, []);

  return (
    <div style={{ width: "80%", margin: "auto", textAlign: "center" }}>
      <h2>Sueldo de los Trabajadores</h2>
      {sueldos.length === 0 ? (
        <p>No hay datos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sueldos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sueldo" fill="#2c3e50" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SueldoTrabajadores;
