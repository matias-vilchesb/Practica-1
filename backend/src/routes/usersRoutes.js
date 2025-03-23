import express from "express";
import usersController from "../controllers/usersController.js";
import pool from "../../server.js"; // Asegúrate de que la ruta es correcta
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; 



const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Obtener la lista de certificados
router.get("/certificados", async (req, res) => {
  try {
    await usersController.obtenerCertificados(req, res);
  } catch (error) {
    console.error("Error al obtener certificados:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Descargar un certificado por ID
router.get("/certificados/:id_atencion", async (req, res) => {
  const { id_atencion } = req.params;
  const filePath = path.resolve(process.cwd(), "certificados", `certificado_${id_atencion}.pdf`);

  

  // Verificar si el archivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "El certificado no existe" });
  }

  res.download(filePath, `Certificado_${id_atencion}.pdf`, (err) => {
    if (err) {
      res.status(500).json({ error: "Error al descargar el certificado" });
    }
  });
});






// Ruta para obtener todas las atenciones
router.get("/atenciones", async (req, res) => {
  try {
    await usersController.obtenerAtenciones(req, res);
  } catch (error) {
    console.error("Error al obtener atenciones:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para registrar una nueva atención
router.post("/atenciones", async (req, res) => {
  try {
    await usersController.registrarAtencion(req, res);
  } catch (error) {
    console.error("Error al registrar atención:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// 
router.get("/clientes/:id_cliente/patentes", async (req, res) => {
  try {
    await usersController.obtenerClienteConPatentes(req, res);
  } catch (error) {
    console.error("Error al registrar atención:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});





// Ruta para obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    await usersController.getAllUsers(req, res);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para eliminar un usuario
router.delete("/eliminar-usuario/:id_usuario", async (req, res) => {
  try {
    await usersController.deleteUser(req, res);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para eliminar un cliente
router.delete("/eliminar-cliente/:id_cliente", async (req, res) => {
  try {
    await usersController.deleteCliente(req, res);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para crear un trabajador
router.post("/crear-trabajador", async (req, res) => {
  try {
    await usersController.crearTrabajador(req, res);
  } catch (error) {
    console.error("Error al crear trabajador:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para obtener todos los trabajadores
router.get("/trabajadores", async (req, res) => {
  try {
    await usersController.getTrabajadores(req, res);
  } catch (error) {
    console.error("Error al obtener trabajadores:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para obtener trabajadores disponibles
router.get("/trabajadores-disponibles", async (req, res) => {
  try {
    await usersController.getTrabajadoresDisponibles(req, res);
  } catch (error) {
    console.error("Error al obtener trabajadores disponibles:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para eliminar un trabajador
router.delete("/eliminar-trabajador/:id_usuario", async (req, res) => {
  try {
    await usersController.eliminarTrabajador(req, res);
  } catch (error) {
    console.error("Error al eliminar trabajador:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para crear un cliente y su auto si no existe
router.post("/crear-clientes", async (req, res) => {
  try {
    await usersController.crearCliente(req, res);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para obtener todos los clientes
router.get("/clientes", async (req, res) => {
  try {
    await usersController.getClientes(req, res);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/register", usersController.registerUser);

// Ruta para obtener usuarios con rol "cliente" que aún no están en la tabla clientes
router.get("/clientes-disponibles", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM usuarios 
      WHERE rol = 'cliente' 
      AND id_usuario NOT IN (SELECT id_usuario FROM clientes)
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener clientes disponibles:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para actualizar un cliente
router.put("/actualizar-cliente/:id_cliente", async (req, res) => {
  try {
    await usersController.updateCliente(req, res);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


// Ruta para obtener los sueldos de los trabajadores
router.get("/sueldos-trabajadores", async (req, res) => {
  try {
    await usersController.obtenerSueldos(req, res);
  } catch (error) {
    console.error("Error al obtener sueldos:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
