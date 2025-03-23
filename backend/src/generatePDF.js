import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Para manejar rutas correctamente en ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generarCertificado(atencion) {
  return new Promise((resolve, reject) => {
    try {
      // Ruta de la carpeta donde se guardarán los certificados
      const certificadosDir = path.join(process.cwd(), "certificados");

      // Verificar si la carpeta "certificados" existe, si no, crearla
      if (!fs.existsSync(certificadosDir)) {
        fs.mkdirSync(certificadosDir, { recursive: true });
      }

      // Ruta del archivo PDF
      const filePath = path.join(certificadosDir, `certificado_${atencion.id_atencion}.pdf`);
      const writeStream = fs.createWriteStream(filePath);
      const doc = new PDFDocument();

      doc.pipe(writeStream);

      doc.fontSize(20).text("CERTIFICADO DE ATENCIÓN", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`ID Atención: ${atencion.id_atencion}`);
      doc.text(`Fecha: ${atencion.fecha}`);
      doc.text(`Cliente ID: ${atencion.id_cliente}`);
      doc.text(`Patente: ${atencion.patente}`);
      doc.text(`Descripción: ${atencion.descripcion}`);
      doc.text(`Monto: $${atencion.monto}`);
      doc.moveDown();
      doc.text("Este certificado confirma la atención registrada en el sistema.");

      doc.end();
      console.log("Certificado generado en:", filePath);

      writeStream.on("finish", () => {
        console.log(`Certificado generado: ${filePath}`);
        resolve(filePath);
      });
      writeStream.on("error", (err) => {
        console.error("Error al generar el certificado:", err);
        reject(err);
      });
    } catch (error) {
      console.error("Error en la generación del certificado:", error);
      reject(error);
    }
  });
}