require("dotenv").config();
const { obtenerEmbedding } = require("./server/services/geminiService");

(async () => {
  const emb = await obtenerEmbedding("Esto es una prueba");
  console.log("Dimensiones recibidas:", emb.length);
  process.exit(0);
})();