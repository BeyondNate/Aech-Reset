require("dotenv").config();
const { procesarEIndexarPDF } = require("./server/services/pdfService");

const tareas = [
  {
    pdfPath: "Lista1Plan.pdf",
    listaId: "4282fc49-91ad-4d05-85c2-f9b25d2cace8" // ⚠️ confirma que corresponde a Lista 1
  },
  {
    pdfPath: "Lista2Plan.pdf",
    listaId: "ece584f3-7a5c-4013-9a9c-f4b769ab49e3" // esta es la que sabemos: ¿es Lista 2 o "Nueva Voz"?
  },
  {
    pdfPath: "Lista3Plan.pdf",
    listaId: "50a37d2b-228b-46fe-aabd-5e36955b941f" // ⚠️ confirma que corresponde a Lista 3
  },
];

(async () => {
  for (const tarea of tareas) {
    console.log(`\n=== Procesando ${tarea.pdfPath} ===`);
    try {
      await procesarEIndexarPDF(tarea.pdfPath, tarea.listaId);
    } catch (err) {
      console.error(`Falló ${tarea.pdfPath}:`, err.message);
    }
  }
  console.log("\n✅ Reprocesamiento terminado.");
  process.exit(0);
})();