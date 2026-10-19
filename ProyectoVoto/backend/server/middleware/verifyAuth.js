const { supabaseAdmin } = require('../services/supabaseAdmin');

async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido o expirado'
      });
    }

    if (!user.email || !user.email.endsWith('@upch.pe')) {
      return res.status(403).json({
        error: 'Correo no institucional'
      });
    }

    req.user = user;
    req.userEmail = user.email;

    next();
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Error verificando autenticación'
    });
  }
}

module.exports = {
  verifyAuth,
};