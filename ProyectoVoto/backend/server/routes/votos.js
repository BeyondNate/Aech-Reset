const express = require("express");
const router = express.Router();

const { supabaseAdmin } = require("../services/supabaseAdmin");
const { generarHash } = require("../services/hashService");
const { verifyAuth } = require("../middleware/verifyAuth");

// ==========================================
// MIDDLEWARE: Validar si la votación está activa
// ==========================================
const validarEstadoVotacion = async (req, res, next) => {
  try {
    const { data: config, error: errConfig } = await supabaseAdmin
      .from('configuracion_eleccion')
      .select('fecha_inicio, fecha_fin, estado')
      .single();

    if (errConfig) {
      console.error("Error al cargar configuración:", errConfig);
      return res.status(500).json({ error: 'Error al verificar el estado de la elección.' });
    }

    const ahora = new Date();
    const inicio = new Date(config.fecha_inicio.endsWith('Z') ? config.fecha_inicio : config.fecha_inicio + 'Z');
    const cierre = new Date(config.fecha_fin.endsWith('Z') ? config.fecha_fin : config.fecha_fin + 'Z');
    console.log('DEBUG >> ahora (Node):', ahora.toISOString());
    console.log('DEBUG >> inicio (BD raw):', config.fecha_inicio);
    console.log('DEBUG >> inicio (Node parseado):', inicio.toISOString());
    console.log('DEBUG >> cierre (Node parseado):', cierre.toISOString());
    if (ahora < inicio) {
      return res.status(403).json({ error: 'La votación aún no ha comenzado.' });
    }
    console.log('DEBUG >> ahora (Node):', ahora.toISOString());
    console.log('DEBUG >> inicio (BD):', inicio.toISOString());
    console.log('DEBUG >> config.fecha_inicio (raw):', config.fecha_inicio);


    if (config.estado === 'cerrada' || ahora >= cierre) {
      return res.status(403).json({
        error: 'La votación ha finalizado. Ya no se aceptan nuevos votos.'
      });
    }

    // Si pasa las validaciones, continúa al siguiente middleware o ruta
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// =========================================================
// 1. ENDPOINT POST: Emitir el voto
// =========================================================
// Agregamos 'validarEstadoVotacion' en la cadena de middlewares
router.post("/", verifyAuth, validarEstadoVotacion, async (req, res) => {
  const { lista_id } = req.body;

  if (!lista_id) {
    return res.status(400).json({
      error: "lista_id requerido",
    });
  }

  const hash = generarHash(req.userEmail);

  const jitter = Math.floor(Math.random() * 1500);
  await new Promise((resolve) => setTimeout(resolve, jitter));

  const { data, error } = await supabaseAdmin.rpc("emitir_voto", {
    p_hash_identidad: hash,
    p_lista_id: lista_id,
  });

  if (error) {
    if (error.message.includes("YA_VOTO")) {
      return res.status(409).json({
        error: "Ya emitiste tu voto",
      });
    }
    if (error.message.includes("ESTUDIANTE_NO_ENCONTRADO")) {
      return res.status(404).json({
        error: "Estudiante no registrado",
      });
    }
    console.error(error);
    return res.status(500).json({
      error: "Error al procesar el voto",
    });
  }

  return res.json({
    ok: true,
    mensaje: "Voto registrado exitosamente",
  });
});

// =========================================================
// 2. ENDPOINT GET: Consultar si ya votó
// =========================================================
// También aplicamos el middleware aquí si quieres que se bloquee al consultar
router.get("/estado", verifyAuth, validarEstadoVotacion, async (req, res) => {
  try {
    const hash = generarHash(req.userEmail);

    const { data, error } = await supabaseAdmin
      .from("estudiantes")
      .select("ha_votado")
      .eq("hash_identidad", hash)
      .single();

    if (error) {
      console.error("Error al consultar tabla estudiantes:", error);
      return res.status(500).json({ error: "Error interno al verificar el votante" });
    }

    if (!data) {
      return res.status(404).json({ error: "Estudiante no registrado en el padrón" });
    }

    return res.json({ ha_votado: data.ha_votado });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;