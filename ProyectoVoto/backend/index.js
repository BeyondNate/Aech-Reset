// backend/index.js

require('dotenv').config();

const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();


// =========================
// MIDDLEWARES
// =========================

app.use(cors());
app.use(express.json());


// =========================
// IMPORTAR RUTAS
// =========================

const adminRoutes = require('./server/routes/admin');
const resultadosRoutes = require('./server/routes/resultados');
const authRoutes = require('./server/routes/auth');
const chatRoutes = require('./server/routes/chat');
const votosRoutes = require('./server/routes/votos');
const denunciasRoutes = require('./server/routes/denuncias');
const iniciarSchedulerCierre = require('./server/services/cierreScheduler');



// =========================
// RATE LIMIT DENUNCIAS
// =========================

const denunciasLimiter = rateLimit({

    windowMs: 15 * 60 * 1000, // 15 minutos

    max: 5, // máximo 5 denuncias por IP

    message: {
        error: "Demasiadas denuncias enviadas. Intente más tarde."
    },

    standardHeaders: true,
    legacyHeaders: false

});


// =========================
// REGISTRO DE RUTAS
// =========================

app.use('/api/auth', authRoutes);

app.use('/api/votos', votosRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/resultados', resultadosRoutes);

app.use('/api/chat', chatRoutes);


// Aquí aplicamos rate limit SOLO a denuncias
app.use(
    '/api/denuncias',
    denunciasLimiter,
    denunciasRoutes
);


// =========================
// SERVIDOR
// =========================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

iniciarSchedulerCierre();