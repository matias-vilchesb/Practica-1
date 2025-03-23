import dotenv from "dotenv";
import mysql from "mysql2/promise"; 
import cors from "cors";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import usersRoutes from "./src/routes/usersRoutes.js";

dotenv.config();
const app = express();

// Configurar middlewares
app.use(cors());
app.use(express.json());

// Configurar la conexión a MySQL con un pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "taller_mecanico",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ error: "Acceso denegado, token requerido" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Token no válido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: "Token inválido o expirado" });
    req.user = user;
    next();
  });
};

// Rutas de usuarios
app.use("/api", usersRoutes); // Se asegura de cargar todas las rutas definidas en usersRoutes.js
app.use("/api/usuarios", usersRoutes);

// Ruta para registrar usuarios
app.post("/api/register", async (req, res) => {
  const { nombre, email, clave, rol } = req.body;
  try {
    if (!nombre || !email || !clave || !rol) return res.status(400).json({ error: "Todos los campos son obligatorios" });
    if (clave.length < 5) return res.status(400).json({ error: "La contraseña debe tener al menos 5 caracteres" });

    const hashedPassword = await bcrypt.hash(clave, 10);
    const sql = "INSERT INTO usuarios (nombre, email, clave, rol) VALUES (?, ?, ?, ?)";

    await pool.query(sql, [nombre, email, hashedPassword, rol]);
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para iniciar sesión y generar JWT
app.post("/api/login", async (req, res) => {
  const { email, clave } = req.body;
  if (!email || !clave) return res.status(400).json({ error: "Email y contraseña son obligatorios" });
  try {
    const sql = "SELECT * FROM usuarios WHERE email = ?";
    const [results] = await pool.query(sql, [email]);
    if (results.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });
    const user = results[0];
    const isMatch = await bcrypt.compare(clave, user.clave);
    if (!isMatch) return res.status(401).json({ error: "Contraseña incorrecta" });
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id_usuarios, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      rol: user.rol
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.post("/api/trabajadores", verifyToken, async (req, res) => {
  const { id_usuario, sueldo, rut, fecha_contratacion } = req.body;

  try {
    if (!id_usuario || !sueldo || !rut || !fecha_contratacion) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario tiene rol de trabajador
    const [usuario] = await pool.query("SELECT * FROM usuarios WHERE id_usuario = ? AND rol = 'trabajador'", [id_usuario]);

    if (usuario.length === 0) {
      return res.status(400).json({ error: "El usuario no tiene el rol de trabajador" });
    }

    // Verificar si ya existe en la tabla trabajadores
    const [existeTrabajador] = await pool.query("SELECT * FROM trabajadores WHERE id_usuario = ?", [id_usuario]);

    if (existeTrabajador.length > 0) {
      return res.status(400).json({ error: "El trabajador ya está registrado" });
    }

    // Insertar en la tabla trabajadores
    const sqlTrabajador = "INSERT INTO trabajadores (id_usuario, sueldo, rut, fecha_contratacion) VALUES (?, ?, ?, ?)";
    await pool.query(sqlTrabajador, [id_usuario, sueldo, rut, fecha_contratacion]);

    res.status(201).json({ message: "Trabajador agregado correctamente" });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


// Ruta protegida para dashboard
app.get("/api/dashboard", verifyToken, (req, res) => {
  res.json({ message: "Bienvenido al Dashboard", user: req.user });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});

export default pool;
