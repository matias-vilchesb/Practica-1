import pool from "../../server.js";
import bcrypt from "bcrypt";
import { generarCertificado } from "../generatePDF.js"; 
import path from "path";
import { fileURLToPath } from "url";



const usersController = {};



// Configuración de rutas en ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener la lista de certificados
usersController.obtenerCertificados = async (req, res) => {
  try {
    const [certificados] = await pool.query("SELECT * FROM certificados");
    res.json(certificados);
  } catch (error) {
    console.error("Error al obtener certificados:", error);
    res.status(500).json({ error: "Error al obtener certificados" });
  }
};

// Descargar un certificado por ID
usersController.descargarCertificado = async (req, res) => {
  try {
    const { id_atencion } = req.params;
    const filePath = path.join(__dirname, `../certificados/certificado_${id_atencion}.pdf`);
    console.log("Intentando descargar:", filePath);

    res.download(filePath, `Certificado_${id_atencion}.pdf`, (err) => {
      if (err) {
        console.error("Error al descargar el certificado:", err);
        res.status(500).json({ error: "Error al descargar el certificado" });
      }
    });
  } catch (error) {
    console.error("Error en la descarga del certificado:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

usersController.obtenerClienteConPatentes = async (req, res) => {
  const { id_cliente } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT patente FROM cliente_auto WHERE id_cliente = ?",
      [id_cliente]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener patentes" });
  }
};


usersController.registrarAtencion = async (req, res) => {
  const { id_cliente, patente, id_usuario, fecha, descripcion, monto } = req.body;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Insertar la atención en la base de datos
    const [result] = await connection.query(
      "INSERT INTO atenciones (id_cliente, patente, id_usuario, fecha, descripcion, monto) VALUES (?, ?, ?, ?, ?, ?)",
      [id_cliente, patente, id_usuario, fecha, descripcion, monto]
    );

    const id_atencion = result.insertId;
    const atencion = { id_atencion, id_cliente, patente, id_usuario, fecha, descripcion, monto };

    // Generar automáticamente el certificado y obtener la ruta del archivo
    const filePath = await generarCertificado(atencion);

    console.log("Datos recibidos en el backend:", req.body);

    // Registrar el certificado en la base de datos
    await connection.query(
      "INSERT INTO certificados (id_atencion, fecha_emision, descripcion) VALUES (?, ?, ?)",
      [id_atencion, fecha, `Certificado de ${descripcion}`]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({ message: "Atención registrada y certificado generado", filePath });
  } catch (error) {
    await connection.rollback();
    connection.release();
    res.status(500).json({ error: "Error al registrar atención" });
  }
};

//obtener todas las atenciones

usersController.obtenerAtenciones = async (req, res) => {
  try {
    const [atenciones] = await pool.query("SELECT * FROM atenciones");
    res.json(atenciones);
  } catch (error) {
    console.error("Error al obtener atenciones:", error);
    res.status(500).json({ error: "Error al obtener atenciones" });
  }
};






// Obtener todos los usuarios
usersController.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// Obtener todos los trabajadores
usersController.getTrabajadores = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.email, t.sueldo, t.rut, t.fecha_contratacion 
       FROM usuarios u 
       INNER JOIN trabajadores t ON u.id_usuario = t.id_usuario 
       WHERE u.rol = 'trabajador'`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener trabajadores:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Crear un trabajador
usersController.crearTrabajador = async (req, res) => {
  const { id_usuario, sueldo, rut, fecha_contratacion } = req.body;

  if (!id_usuario || !sueldo || !rut || !fecha_contratacion) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    await pool.execute(
      "INSERT INTO trabajadores (id_usuario, sueldo, rut, fecha_contratacion) VALUES (?, ?, ?, ?)",
      [id_usuario, sueldo, rut, fecha_contratacion]
    );

    res.status(201).json({ message: "Trabajador creado exitosamente" });
  } catch (error) {
    console.error("Error al crear trabajador:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Eliminar un trabajador
usersController.eliminarTrabajador = async (req, res) => {
  const { id_usuario } = req.params;

  if (!id_usuario) {
    return res.status(400).json({ error: "ID de trabajador requerido" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Eliminar de la tabla trabajadores
    await connection.query("DELETE FROM trabajadores WHERE id_usuario = ?", [id_usuario]);

    // Opcional: También eliminar al usuario si deseas
    // await connection.query("DELETE FROM usuarios WHERE id_usuario = ?", [id_usuario]);

    await connection.commit();
    res.json({ message: "Trabajador eliminado correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error("Error al eliminar trabajador:", error);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    connection.release();
  }
};

// Obtener trabajadores disponibles
usersController.getTrabajadoresDisponibles = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM usuarios 
      WHERE rol = 'trabajador' 
      AND id_usuario NOT IN (SELECT id_usuario FROM trabajadores)
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener trabajadores disponibles:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Crear un cliente y asociar su auto
usersController.crearCliente = async (req, res) => {
  console.log(req.body);

  const { id_usuario, telefono, direccion, fecha_nacimiento, rut, patente, marca, modelo, tipo, color, kilometraje } = req.body;

  if (!id_usuario || !telefono || !direccion || !fecha_nacimiento || !rut || !patente || !marca || !modelo || !tipo || !color || !kilometraje) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Obtener nombre y email del usuario seleccionado
    const [usuario] = await connection.query(
      "SELECT nombre, email FROM usuarios WHERE id_usuario = ?",
      [id_usuario]
    );

    if (usuario.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const { nombre, email } = usuario[0];

    // Insertar cliente con id_cliente = id_usuario
    await connection.query(
      "INSERT INTO clientes (id_cliente, id_usuario, nombre, email, telefono, direccion, fecha_nacimiento, rut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id_usuario, id_usuario, nombre, email, telefono, direccion, fecha_nacimiento, rut]
    );

    // Verificar si el auto ya existe
    const [autoExistente] = await connection.query(
      "SELECT patente FROM auto WHERE patente = ?",
      [patente]
    );

    if (autoExistente.length === 0) {
      // Si el auto no existe, se inserta en la tabla `auto`
      await connection.query(
        "INSERT INTO auto (patente, marca, modelo, tipo, color, kilometraje) VALUES (?, ?, ?, ?, ?, ?)",
        [patente, marca, modelo, tipo, color, kilometraje]
      );
    }

    // Asociar el auto con el cliente en `clientes_auto`
    await connection.query(
      "INSERT INTO cliente_auto (id_cliente, patente) VALUES (?, ?)",
      [id_usuario, patente]
    );

    await connection.commit();
    res.status(201).json({ message: "Cliente y auto registrados con éxito" });
  } catch (error) {
    await connection.rollback();
    console.error("Error al crear cliente:", error);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    connection.release();
  }
};



// Obtener todos los clientes y sus autos
usersController.getClientes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id_cliente, c.nombre, c.email, c.telefono, c.direccion, c.fecha_nacimiento, c.rut, 
             a.patente, a.marca, a.modelo, a.tipo, a.color, a.kilometraje 
      FROM clientes c
      LEFT JOIN cliente_auto ca ON c.id_cliente = ca.id_cliente
      LEFT JOIN auto a ON ca.patente = a.patente
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Registrar usuario
usersController.registerUser = async (req, res) => {
  const { nombre, email, clave, rol } = req.body;

  if (!nombre || !email || !clave || !rol) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // Generar un hash de la clave antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(clave, salt);

    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, clave, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashedPassword, rol]
    );

    res.status(201).json({ message: "Usuario registrado con éxito", id_usuario: result.insertId });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error en el servidor al registrar usuario" });
  }
};

// Eliminar un usuario
usersController.deleteUser = async (req, res) => {
  const { id_usuario } = req.params;

  if (!id_usuario) {
    return res.status(400).json({ error: "ID de usuario requerido" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Eliminar de la tabla usuarios
    await connection.query("DELETE FROM usuarios WHERE id_usuario = ?", [id_usuario]);


    await connection.commit();
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error("Error al eliminar Usuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    connection.release();
  }
};

// Eliminar un cliente
usersController.deleteCliente = async (req, res) => {
  const { id_cliente } = req.params; // <-- Cambié de id_usuario a id_cliente

  console.log("ID recibido para eliminar cliente:", id_cliente); // <-- DEBUG

  if (!id_cliente) {
      return res.status(400).json({ error: "ID del cliente requerido" });
  }

  const connection = await pool.getConnection();
  try {
      await connection.beginTransaction();

      // Verificar si el cliente existe antes de eliminarlo
      const [cliente] = await connection.query(
          "SELECT * FROM clientes WHERE id_cliente = ?",
          [id_cliente]
      );

      console.log("Resultado de la consulta de cliente:", cliente); // <-- DEBUG

      if (cliente.length === 0) {
          throw new Error("Cliente no encontrado");
      }

      // Eliminar relaciones en cliente_auto primero
      await connection.query("DELETE FROM cliente_auto WHERE id_cliente = ?", [id_cliente]);

      // Luego eliminar el cliente
      const [result] = await connection.query("DELETE FROM clientes WHERE id_cliente = ?", [id_cliente]);

      if (result.affectedRows === 0) {
          throw new Error("No se pudo eliminar el cliente");
      }

      await connection.commit();
      res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
      await connection.rollback();
      console.error("Error al eliminar Cliente:", error);
      res.status(500).json({ error: error.message || "Error en el servidor" });
  } finally {
      connection.release();
  }
};


usersController.updateCliente = async (req, res) => {
  const { id_cliente } = req.params;
  const { telefono, direccion, fecha_nacimiento, rut, patente, marca, modelo, tipo, color, kilometraje } = req.body;

  if (!id_cliente) {
      return res.status(400).json({ error: "ID del cliente requerido" });
  }

  const connection = await pool.getConnection();
  try {
      await connection.beginTransaction();

      // Verificar si el cliente existe
      const [cliente] = await connection.query(
          "SELECT * FROM clientes WHERE id_cliente = ?",
          [id_cliente]
      );

      if (cliente.length === 0) {
          throw new Error("Cliente no encontrado");
      }

      // Actualizar datos del cliente
      await connection.query(
          "UPDATE clientes SET telefono = ?, direccion = ?, fecha_nacimiento = ?, rut = ? WHERE id_cliente = ?",
          [telefono, direccion, fecha_nacimiento, rut, id_cliente]
      );

      // Verificar si el cliente tiene un auto asociado
      const [clienteAuto] = await connection.query(
          "SELECT * FROM cliente_auto WHERE id_cliente = ?",
          [id_cliente]
      );

      if (clienteAuto.length > 0) {
          const patenteAnterior = clienteAuto[0].patente;

          if (patente === patenteAnterior) {
              // Si la patente es la misma, actualizar los datos del auto
              await connection.query(
                  "UPDATE auto SET marca = ?, modelo = ?, tipo = ?, color = ?, kilometraje = ? WHERE patente = ?",
                  [marca, modelo, tipo, color, kilometraje, patente]
              );
          } else {
              // Si la patente es distinta, crear un nuevo auto y asociarlo al cliente
              const [autoExistente] = await connection.query(
                  "SELECT * FROM auto WHERE patente = ?",
                  [patente]
              );

              if (autoExistente.length === 0) {
                  // Si el auto no existe, insertarlo
                  await connection.query(
                      "INSERT INTO auto (patente, marca, modelo, tipo, color, kilometraje) VALUES (?, ?, ?, ?, ?, ?)",
                      [patente, marca, modelo, tipo, color, kilometraje]
                  );
              }

             // Insertar una nueva relación sin eliminar la anterior
                await connection.query(
                "INSERT INTO cliente_auto (id_cliente, patente) VALUES (?, ?)",
                  [id_cliente, patente]
                );
          }
      } else {
          // Si el cliente no tiene un auto asociado, verificar si la patente ya existe en `auto`
          const [autoExistente] = await connection.query(
              "SELECT * FROM auto WHERE patente = ?",
              [patente]
          );

          if (autoExistente.length === 0) {
              // Si el auto no existe, insertarlo
              await connection.query(
                  "INSERT INTO auto (patente, marca, modelo, tipo, color, kilometraje) VALUES (?, ?, ?, ?, ?, ?)",
                  [patente, marca, modelo, tipo, color, kilometraje]
              );
          }

          // Asociar el nuevo auto con el cliente
          await connection.query(
              "INSERT INTO cliente_auto (id_cliente, patente) VALUES (?, ?)",
              [id_cliente, patente]
          );
      }

      await connection.commit();
      res.json({ message: "Cliente y auto actualizados correctamente" });
  } catch (error) {
      await connection.rollback();
      console.error("Error al actualizar cliente y auto:", error);
      res.status(500).json({ error: error.message || "Error en el servidor" });
  } finally {
      connection.release();
  }
};


// Obtener los sueldos de los trabajadores
usersController.obtenerSueldos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.nombre, t.sueldo 
      FROM usuarios u 
      INNER JOIN trabajadores t ON u.id_usuario = t.id_usuario
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los sueldos:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};



export default usersController;
