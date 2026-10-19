// backend/server/routes/admin.js
const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabaseAdmin');
const { verifyAuth } = require("../middleware/verifyAuth"); //  CORRECTO

// Endpoint para guardar la lista creada por el administrador
router.post('/listas', verifyAuth, async (req, res) => {
  // NOTA: Idealmente aquí añadirías un middleware adicional para comprobar que el rol del JWT sea 'admin'
  const { nombre, descripcion, candidatos, logo_url, plan_governo_url } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('listas')
      .insert([
        {
          nombre,
          descripcion,
          candidatos, // Se guarda el JSON entero con presidente, vice, etc.
          logo_url,
          plan_gobierno_url: plan_governo_url // Ojo con la concordancia de nombres
        }
      ])
      .select();

    if (error) throw error;

    return res.json({ ok: true, lista: data[0] });
  } catch (err) {
    console.error("Error al insertar lista:", err);
    return res.status(500).json({ error: "No se pudo guardar la lista en la base de datos." });
  }
});
const ADMINS = ["brad.cardenas@upch.pe", "gael.milla@upch.pe"];

router.get('/configuracion-eleccion', verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('configuracion_eleccion')
      .select('id, fecha_inicio, fecha_fin, estado')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

router.patch('/configuracion-eleccion', verifyAuth, async (req, res) => {
  if (!ADMINS.includes(req.userEmail)) {
  return res.status(403).json({ error: 'No autorizado' });
    }

  try {
    const { fecha_fin, reabrir } = req.body;

    if (!fecha_fin) {
      return res.status(400).json({ error: 'fecha_fin es requerida' });
    }

    const nuevaFecha = new Date(fecha_fin);
    if (isNaN(nuevaFecha.getTime())) {
      return res.status(400).json({ error: 'fecha_fin inválida' });
    }

    const { data: config, error: errConfig } = await supabaseAdmin
      .from('configuracion_eleccion')
      .select('id, fecha_inicio')
      .single();

    if (errConfig) throw errConfig;

    if (nuevaFecha <= new Date(config.fecha_inicio)) {
      return res.status(400).json({
        error: 'La fecha de cierre no puede ser anterior o igual a la fecha de inicio.'
      });
    }

    const updatePayload = { fecha_fin: nuevaFecha.toISOString() };
    if (reabrir && nuevaFecha > new Date()) {
      updatePayload.estado = 'abierta';
    }

    const { error: errUpdate } = await supabaseAdmin
      .from('configuracion_eleccion')
      .update(updatePayload)
      .eq('id', config.id);

    if (errUpdate) throw errUpdate;

    res.json({ mensaje: 'Fecha de cierre actualizada correctamente', ...updatePayload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

module.exports = router;