const crypto = require('crypto');

const SALT = process.env.HASH_SALT; // agrega HASH_SALT=algo_secreto_largo en .env

function generarHash(correo) {
  return crypto.createHash('sha256').update(correo + SALT).digest('hex');
}

module.exports = { generarHash };