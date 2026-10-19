const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../services/supabaseAdmin");
const { verifyAuth } = require("../middleware/verifyAuth");

// GET /api/resultados/dashboard
router.get("/dashboard", verifyAuth, async (req, res) => {
  try {
    // Ejecuta ambas consultas en la base de datos al mismo tiempo para ahorrar milisegundos
    const [resVotos, resParticipacion] = await Promise.all([
      supabaseAdmin.rpc("obtener_resultados_votos"),
      supabaseAdmin.rpc("obtener_participacion_electoral")
    ]);

    if (resVotos.error) throw resVotos.error;
    if (resParticipacion.error) throw resParticipacion.error;

    return res.json({
      votos: resVotos.data,
      participacion: resParticipacion.data[0] || { total_padron: 0, total_votantes: 0, porcentaje_participacion: 0 }
    });
  } catch (err) {
    console.error("Error en escrutinio:", err);
    return res.status(500).json({ error: "Error al compilar el escrutinio en tiempo real" });
  }
});
router.get('/estado', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('configuracion_eleccion')
      .select('fecha_fin, estado')
      .single();

    if (error) throw error;

    res.json({
      fecha_fin: data.fecha_fin,
      hora_servidor_actual: new Date().toISOString(),
      estado: data.estado
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estado de elección' });
  }
});

router.get('/resultado-final', async (req, res) => {
  try {
    const { data: votos, error } = await supabaseAdmin
      .from('votos')
      .select('lista_id, listas(nombre_lista)');

    if (error) throw error;

    const conteo = {};
    votos.forEach(v => {
      const nombre = v.listas.nombre_lista;
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    const listas = Object.entries(conteo).map(([nombre, votos]) => ({ nombre, votos }));

    res.json({ listas, totalVotos: votos.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calcular resultado final' });
  }
});
module.exports = router;