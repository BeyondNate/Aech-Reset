const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabaseAdmin');
const { generarHash } = require('../services/hashService');

router.post('/verificar-sesion', async (req, res) => {
  const { correo } = req.body;

  if (!correo || !correo.endsWith('@upch.pe')) {
    return res.status(403).json({ error: 'Correo no institucional' });
  }

  const hash = generarHash(correo);

  const { data, error } = await supabaseAdmin
    .from('estudiantes')
    .upsert(
      { correo_institucional: correo, hash_identidad: hash },
      { onConflict: 'correo_institucional', ignoreDuplicates: true }
    )
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ ok: true, estudiante: data[0] });
});

module.exports = router;