import { useState, useEffect } from "react";

function Certificados() {
  const [certificados, setCertificados] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/certificados")
      .then((res) => res.json())
      .then((data) => setCertificados(data))
      .catch((error) => console.error("Error al obtener certificados:", error));
  }, []);

  const descargarCertificado = (id_atencion) => {
    window.open(`http://localhost:5000/api/certificados/${id_atencion}`, "_blank");
  };

  return (
    <div>
      <h2>Lista de Certificados</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID Certificado</th>
            <th>ID Atención</th>
            <th>Fecha Emisión</th>
            <th>Descripción</th>
            <th>Descargar</th>
          </tr>
        </thead>
        <tbody>
          {certificados.map((cert) => (
            <tr key={cert.id_certificado}>
              <td>{cert.id_certificado}</td>
              <td>{cert.id_atencion}</td>
              <td>{cert.fecha_emision}</td>
              <td>{cert.descripcion}</td>
              <td>
                <button onClick={() => descargarCertificado(cert.id_atencion)}>
                  Descargar PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Certificados;
