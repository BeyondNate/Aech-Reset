import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient"; // <-- Verifica que la ruta a tu cliente sea correcta

export default function Informese() {
  const [listas, setListas] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);

  // Chips de preguntas rápidas
  const sugerencias = [
    "¿Qué propone sobre infraestructura?",
    "¿Cuáles son sus planes para bienestar estudiantil?",
    "¿Qué proyectos tiene para la investigación?",
  ];

  // 1. Cargar las listas reales usando las columnas de tu tabla
  useEffect(() => {
    const obtenerListas = async () => {
      try {
        const { data, error } = await supabase
          .from("listas")
          .select("id, nombre_lista, nombre_candidatos, logo_url, plan_gobierno_url, descripcion_corta");
        
        if (error) throw error;
        setListas(data || []);
      } catch (error) {
        console.error("Error al cargar listas de Supabase:", error.message);
      }
    };

    obtenerListas();
  }, []);

  // Al seleccionar una lista, dejamos el chat listo
  const seleccionarLista = (lista) => {
    setListaSeleccionada(lista);
    setMensajes([
      {
        rol: "sistema",
        texto: `¡Hola! Soy el asistente IA de la lista *${lista.nombre_lista}*. Hazme cualquier pregunta sobre nuestro plan de gobierno oficial.`,
      },
    ]);
  };

  // 2. Enviar la pregunta a tu backend de Node (puerto 3001) para que procese con Gemini
  const enviarPregunta = async (textoPregunta) => {
    const preguntaFinal = textoPregunta || input;
    if (!preguntaFinal.trim() || !listaSeleccionada || cargando) return;

    const nuevosMensajes = [...mensajes, { rol: "usuario", texto: preguntaFinal }];
    setMensajes(nuevosMensajes);
    setInput("");
    setCargando(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat/preguntar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pregunta: preguntaFinal,
          lista_id: listaSeleccionada.id, // Pasamos el UUID de Supabase
          plan_url: listaSeleccionada.plan_gobierno_url // Por si tu backend necesita la URL del PDF directo
        }),
      });

      const data = await response.json();
      setMensajes([...nuevosMensajes, { rol: "ia", texto: data.respuesta || "No obtuve respuesta." }]);
    } catch (error) {
      setMensajes([
        ...nuevosMensajes,
        { rol: "error", texto: "Error al conectar con el asistente de IA." },
      ]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>📋 Conoce a tus Candidatos (Voto Informado UPCH)</h2>
      <p style={{ color: "#555" }}>Selecciona una lista electoral para consultar de forma neutral su plan de gobierno mediante nuestra IA.</p>
      
      <hr style={{ borderColor: "#eee" }} />

      {/* SECCIÓN DE SELECCIÓN DE CANDIDATOS */}
      <div style={{ display: "flex", gap: "15px", margin: "20px 0", flexWrap: "wrap" }}>
        {listas.map((lista) => (
          <button
            key={lista.id}
            onClick={() => seleccionarLista(lista)}
            style={{
              padding: "15px",
              border: listaSeleccionada?.id === lista.id ? "2px solid #007bff" : "1px solid #ccc",
              borderRadius: "8px",
              background: listaSeleccionada?.id === lista.id ? "#e7f1ff" : "#fff",
              cursor: "pointer",
              flex: "1 1 calc(50% - 15px)", // Se adapta si hay más listas
              textAlign: "left",
              transition: "all 0.2s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Si logo_url es un URL de imagen o un emoji */}
              <span style={{ fontSize: "24px" }}>
                {lista.logo_url?.startsWith("http") ? <img src={lista.logo_url} alt="logo" style={{ width: "30px", height: "30px" }} /> : (lista.logo_url || "🗳️")}
              </span>
              <div>
                <strong style={{ display: "block", fontSize: "16px", color: "#333" }}>{lista.nombre_lista}</strong>
                <small style={{ color: "#666" }}>{lista.descripcion_corta}</small>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ÁREA DEL CHATBOT RAG */}
      {listaSeleccionada ? (
        <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "15px", background: "#f9f9f9" }}>
          <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
            <span style={{ fontSize: "20px", marginRight: "10px" }}>🤖</span>
            <h4>
              Consultando el plan de: <span style={{ color: "#007bff" }}>{listaSeleccionada.nombre_lista}</span>
            </h4>
          </div>
          <p style={{ fontSize: "13px", color: "#666", margin: "5px 0 0 30px" }}>
            <strong>Candidatos:</strong> {listaSeleccionada.nombre_candidatos}
          </p>

          {/* Historial de conversación */}
          <div style={{ height: "300px", overflowY: "auto", margin: "15px 0", padding: "10px", background: "#fff", borderRadius: "5px", border: "1px solid #eee" }}>
            {mensajes.map((m, index) => (
              <div key={index} style={{ margin: "10px 0", textAlign: m.rol === "usuario" ? "right" : "left" }}>
                <span style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  background: m.rol === "usuario" ? "#007bff" : m.rol === "ia" ? "#e2e3e5" : "#fff3cd",
                  color: m.rol === "usuario" ? "#fff" : "#000",
                  maxWidth: "80%",
                  whiteSpace: "pre-line"
                }}>
                  {m.texto}
                </span>
              </div>
            ))}
            {cargando && <p style={{ color: "#888", fontStyle: "italic", marginLeft: "10px" }}>Gemini analizando el plan de gobierno en Supabase...</p>}
          </div>

          {/* Chips de Preguntas Rápidas */}
          <div style={{ marginBottom: "15px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {sugerencias.map((chip, index) => (
              <button
                key={index}
                disabled={cargando}
                onClick={() => enviarPregunta(chip)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid #007bff",
                  background: "#fff",
                  color: "#007bff",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input de texto */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Pregunta algo sobre las propuestas de ${listaSeleccionada.nombre_lista}...`}
              style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc", outline: "none" }}
              onKeyDown={(e) => e.key === "Enter" && enviarPregunta()}
              disabled={cargando}
            />
            <button 
              onClick={() => enviarPregunta()} 
              disabled={cargando}
              style={{ padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
            >
              Preguntar
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", color: "#666", border: "2px dashed #ccc", borderRadius: "8px", background: "#fff" }}>
          💡 Por favor, selecciona una de las listas de arriba para cargar sus datos desde Supabase e iniciar el chat de IA.
        </div>
      )}
    </div>
  );
}