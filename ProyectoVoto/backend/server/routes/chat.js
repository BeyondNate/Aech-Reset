const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../services/supabaseAdmin");
const { obtenerEmbedding, generarRespuestaRAG } = require("../services/geminiService");

router.post("/preguntar", async (req, res) => {
  const { pregunta, lista_id } = req.body;

  if (!pregunta || !lista_id) {
    return res.status(400).json({ error: "Faltan parámetros requeridos: pregunta o lista_id." });
  }

  try {
    console.log("=== INICIANDO PETICIÓN DE CHAT ===");
    console.log("Pregunta recibida:", pregunta);
    console.log("Lista ID recibida:", lista_id);

    // 1. Obtener metadata de la lista
    const { data: lista, error: listaError } = await supabaseAdmin
      .from("listas")
      .select("nombre_lista")
      .eq("id", lista_id)
      .single();

    if (listaError || !lista) {
      console.error("❌ Error en Paso 1 (Buscar lista en Supabase):", listaError);
      return res.status(404).json({ error: "La lista electoral especificada no existe." });
    }
    console.log("✅ Paso 1 completado. Lista encontrada:", lista.nombre_lista);

    // 2. Vectorizar la consulta
    console.log("Generando embedding con Gemini...");
    const queryEmbedding = await obtenerEmbedding(pregunta);
    console.log("✅ Paso 2 completado. Embedding generado con éxito.");

    // 3. Ejecutar función RPC en Supabase
    console.log("Llamando a la función RPC 'buscar_chunks_planes'...");
    const { data: chunks, error: rpcError } = await supabaseAdmin.rpc("buscar_chunks_planes", {
      query_embedding: queryEmbedding,
      p_lista_id: lista_id,
      match_threshold: 0.35, 
      match_count: 4          
    });

    if (rpcError) {
      console.error("❌ Error en Paso 3 (Función RPC de Supabase):", rpcError);
      throw rpcError;
    }
    console.log("✅ Paso 3 completado. Chunks recuperados:", chunks?.length || 0);

    // 4. Consolidar el contexto
    const contexto = chunks && chunks.length > 0 
      ? chunks.map(c => c.contenido).join("\n---\n")
      : "No se encontraron secciones relevantes en el plan de gobierno.";
    
    // 5. Generar respuesta con Gemini
    console.log("Enviando contexto y pregunta a Gemini...");
    const respuestaAI = await generarRespuestaRAG(pregunta, contexto, lista.nombre_lista);
    console.log("✅ Paso 5 completado. Respuesta de Gemini recibida.");

    return res.json({ respuesta: respuestaAI });

  } catch (error) {
    console.error("💥 [RAG Chat Error Completo]:", error);
    return res.status(500).json({ error: "Error interno al procesar la consulta semántica." });
  }
});

module.exports = router;