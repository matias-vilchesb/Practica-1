import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CrearUsuarioForm from "./CrearUsuario"; 
import CrearTrabajador from "./CrearTrabajador";
import CrearCliente from "./CrearCliente";
import SueldoTrabajadores from "./SueldoTrabajadores";
import Atenciones from "./Atenciones";
import Certificados from "./Certificados";

function Dashboard() {
  const [selectedOption, setSelectedOption] = useState("Inicio");
  const [user, setUser] = useState({
    nombre: "",
    rol: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:5000/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : Promise.reject("Acceso no autorizado"))
      .then((data) => {
        setUser({
          nombre: data.user.nombre,
          rol: data.user.rol,
        });

        localStorage.setItem("rol", data.user.rol);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        navigate("/");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Menú lateral */}
      <aside style={{
        width: "250px", background: "#2c3e50", color: "white", padding: "20px",
        minHeight: "100vh", display: "flex", flexDirection: "column"
      }}>
        <h2>Dashboard</h2>
        {user.nombre && <p>Bienvenido, {user.nombre}</p>}

        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {["Inicio", "Perfil", "Configuración", "Crear Usuario","Crear Trabajador","Crear Cliente","Sueldo Trabajadores","Atenciones","Certificados"].map((option) => (
              (option !== "Crear Usuario" || (user.rol && ["admin", "operador"].includes(user.rol))) && 
              (option !== "Crear Trabajador" || user.rol === "admin" || user.rol === "operador") && 
              (option !== "Crear Cliente" || user.rol === "trabajador" || user.rol === "operador") &&
              (option !== "Sueldo Trabajadores" || user.rol === "admin" || user.rol === "operador") &&
              (option !== "Atenciones" || user.rol === "trabajador" || user.rol === "operador")  &&
              (option !== "Certificados" || user.rol === "trabajador" || user.rol === "operador") &&(
                <li key={option}>
                  <button
                    onClick={() => setSelectedOption(option)}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px",
                      background: selectedOption === option ? "#34495e" : "transparent",
                      color: "white", border: "none", cursor: "pointer"
                    }}
                  >
                    {option}
                  </button>
                </li>
              )
            ))}
          </ul>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto", background: "#e74c3c", color: "white",
            border: "none", padding: "10px", cursor: "pointer"
          }}
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* Contenido dinámico */}
      <main style={{ flex: 1, padding: "20px" }}>
        <h1>{selectedOption}</h1>
        <div>
          {selectedOption === "Inicio" && <p>Bienvenido al Dashboard.</p>}
          {selectedOption === "Perfil" && <p>Aquí puedes ver y editar tu perfil.</p>}
          {selectedOption === "Configuración" && <p>Opciones de configuración.</p>}
          {selectedOption === "Crear Usuario" && <CrearUsuarioForm />} 
          {selectedOption === "Crear Trabajador" && <CrearTrabajador />}
          {selectedOption === "Crear Cliente" && <CrearCliente/>}
          {selectedOption === "Sueldo Trabajadores" && <SueldoTrabajadores/>}
          {selectedOption === "Atenciones" && <Atenciones/>}
          {selectedOption === "Certificados" && <Certificados/>}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
