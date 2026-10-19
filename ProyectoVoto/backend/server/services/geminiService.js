// CORRECCIÓN: El objeto correcto es GoogleGenerativeAI
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicialización correcta para la librería oficial
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function obtenerEmbedding(texto) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" }); // 👈 este debe quedar así (para embeddings)
  const resultado = await model.embedContent({
    content: { role: "user", parts: [{ text: texto }] },
    outputDimensionality: 768
  });
  return resultado.embedding.values;
}

async function generarRespuestaRAG(pregunta, contexto, nombreLista) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `
    Actúas como el asistente virtual de la lista electoral "${nombreLista}".
    Responde a la siguiente pregunta del estudiante basándote únicamente en el contexto provisto de nuestro plan de gobierno.
    Si la respuesta no está en el contexto, indica claramente que esa información no fue especificada en el plan.
    No opines ni compares con otras listas electorales.
    
    Contexto:
    ${contexto}
    
    Pregunta: ${pregunta}
  `;

  const resultado = await model.generateContent(prompt);
  return resultado.response.text();
}

module.exports = { obtenerEmbedding, generarRespuestaRAG };