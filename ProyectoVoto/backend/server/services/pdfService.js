const pdfParse = require("pdf-parse");
const { obtenerEmbedding } = require("./geminiService"); // Asegúrate de que apunte bien a tu servicio hermano
const { supabaseAdmin } = require("./supabaseAdmin");

/**
 * Descarga el PDF desde Supabase Storage e indexa sus fragmentos con embeddings en pgvector.
 * @param {string} pdfPath - Ruta o nombre del archivo en el bucket (ej: "planes/plan-2026.pdf")
 * @param {string} listaId - UUID de la lista electoral
 */
async function procesarEIndexarPDF(pdfPath, listaId) {
  try {
    console.log(`[RAG] Iniciando descarga del PDF para la lista ${listaId}...`);

    // 1. Descargar el archivo directamente desde tu Bucket de Supabase Storage
    // Reemplaza 'planes_pdf' por el nombre exacto que le diste a tu bucket en la Fase 2
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from("PlanGobierno") 
      .download(pdfPath);

    if (downloadError) {
      throw new Error(`Error descargando PDF de Supabase: ${downloadError.message}`);
    }

    // 2. Transformar el archivo descargado a un Buffer compatible con pdf-parse
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 3. Extraer texto completo del PDF
    const data = await pdfParse(fileBuffer);
    const textoCompleto = data.text;

    // 4. Splitter simple (~600 caracteres con ~150 de solapamiento)
    const chunkLength = 600;
    const overlap = 150;
    const chunks = [];
    
    let i = 0;
    while (i < textoCompleto.length) {
      chunks.push(textoCompleto.substring(i, i + chunkLength));
      i += (chunkLength - overlap);
    }

    console.log(`[RAG] Texto fragmentado en ${chunks.length} bloques. Generando embeddings...`);

    // 5. Generar embeddings por bloque e insertar de forma asíncrona en Supabase
    for (const chunk of chunks) {
      if (chunk.trim().length < 10) continue; // Ignorar fragmentos irrelevantes o líneas vacías
      
      const embedding = await obtenerEmbedding(chunk);
      
      const { error: insertError } = await supabaseAdmin
        .from("planes_chunks")
        .insert({
          lista_id: listaId,
          contenido: chunk,
          embedding: embedding
        });

      if (insertError) {
        console.error(`[RAG Error] Error al guardar fragmento:`, insertError.message);
      }
    }

    console.log(`[RAG] ¡Indexación y almacenamiento completados con éxito!`);
    return { ok: true };

  } catch (error) {
    console.error("[RAG Error Crítico] Error en el pipeline de procesamiento:", error);
    throw error;
  }
}

module.exports = { procesarEIndexarPDF };