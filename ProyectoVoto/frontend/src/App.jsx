import { useEffect, useState } from "react";
import { supabase } from "./services/supabaseClient";
import Login from "./pages/Login";
import PantallaVotacion from "./pages/PantallaVotacion";
import PanelResultados from "./pages/PanelResultados";
import Informense from "./pages/Informense"; // <-- 1. Importamos tu pantalla con Supabase
import BuzonDenuncias from "./pages/BuzonDenuncias"; // <-- Agrega esta línea
import PanelAdmin from "./pages/PanelAdmin";
import PantallaCierre from "./pages/PantallaCierre";

function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [estadoVotante, setEstadoVotante] = useState("");
  const [pestañaActiva, setPestañaActiva] = useState("votacion");

  useEffect(() => {
    // 1. Validar si ya hay una sesión activa al cargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      if (session) enviarAlBackend(session.user.email);
      else setCargando(false);
    });

    // 2. Escuchar cambios en la autenticación (cuando vuelve de Google)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
      if (session) enviarAlBackend(session.user.email);
      else setCargando(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  const cargarDenuncias = async () => {
    const { data, error } = await supabase
      .from("denuncias")
      .select("*")
      .order("fecha", { ascending: false });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (data) setDenuncias(data);
  };
  // 3. Función que conecta con tu backend en Node.js
  const enviarAlBackend = async (correo) => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/verificar-sesion",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setEstadoVotante(`Error: ${data.error || "No autorizado"}`);
      } else {
        setEstadoVotante(
          "¡Validación exitosa! Eres un votante autorizado y anónimo. 🗳️",
        );
      }
    } catch (error) {
      console.error(error);
      setEstadoVotante("Error al conectar con el servidor backend.");
    } finally {
      setCargando(false);
    }
  };
  const esAdmin =
    sesion &&
    ["brad.cardenas@upch.pe", "gael.milla@upch.pe"].includes(sesion.user.email);

  if (cargando)
    return <div style={{ padding: "20px" }}>Cargando sesión...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      {!sesion ? (
        <Login />
      ) : (
        <>
          {/* Menu de Navegación con los 3 botones */}
          <nav style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => setPestañaActiva("votacion")}
              style={{
                padding: "10px 15px",
                backgroundColor:
                  pestañaActiva === "votacion" ? "#2563EB" : "#E5E7EB",
                color: pestañaActiva === "votacion" ? "white" : "black",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              🗳️ Cámara de Votación
            </button>
            <button
              onClick={() => setPestañaActiva("resultados")}
              style={{
                padding: "10px 15px",
                backgroundColor:
                  pestañaActiva === "resultados" ? "#2563EB" : "#E5E7EB",
                color: pestañaActiva === "resultados" ? "white" : "black",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              📊 Resultados en Vivo
            </button>

            {/* Botón de la nueva sección */}
            <button
              onClick={() => setPestañaActiva("informese")}
              style={{
                padding: "10px 15px",
                backgroundColor:
                  pestañaActiva === "informese" ? "#10B981" : "#E5E7EB",
                color: pestañaActiva === "informese" ? "white" : "black",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              🤖 Infórmese (IA)
            </button>
            <button
              onClick={() => setPestañaActiva("denuncias")}
              style={{
                padding: "10px 15px",
                backgroundColor:
                  pestañaActiva === "denuncias" ? "#DC2626" : "#E5E7EB",
                color: pestañaActiva === "denuncias" ? "white" : "black",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              📢 Buzón de Denuncias
            </button>
            {esAdmin && (
              <button
                onClick={() => setPestañaActiva("admin")}
                style={{
                  padding: "10px 15px",
                  backgroundColor:
                    pestañaActiva === "admin" ? "#7C3AED" : "#E5E7EB",
                  color: pestañaActiva === "admin" ? "white" : "black",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                🛡️ Panel Administrador
              </button>
            )}
          </nav>

          {/* Renderizado dinámico estricto por pestañas individuales */}
          {pestañaActiva === "votacion" && (
              <PantallaVotacion onEleccionCerrada={() => setPestañaActiva("cierre")} />
            )}
          {pestañaActiva === "resultados" && (
              <PanelResultados onEleccionCerrada={() => setPestañaActiva("cierre")} />
            )}
          {pestañaActiva === "informese" && <Informense />}
          {pestañaActiva === "denuncias" && <BuzonDenuncias />}
          {pestañaActiva === "admin" && <PanelAdmin />}
          {pestañaActiva === "cierre" && <PantallaCierre />}

          <hr style={{ margin: "30px 0" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Estado del sistema:</strong> {estadoVotante}
            </p>
            <button
              onClick={() => supabase.auth.signOut()}
              style={{
                padding: "8px 12px",
                backgroundColor: "#EF4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
