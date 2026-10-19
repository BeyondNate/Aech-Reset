// backend/server/routes/denuncias.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    },

    fileFilter: (req, file, cb) => {

        const tiposPermitidos = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/pdf'
        ];

        if (tiposPermitidos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes JPG/PNG o PDF'));
        }
    }
});

router.post('/', upload.single('evidencia'), async (req, res) => {
    try {
        const { descripcion } = req.body;
        let urlArchivo = null;

        // Generar un identificador anónimo
        const hashAnonimo = crypto.randomUUID();

        if (req.file) {
            const fileName = `${Date.now()}_${req.file.originalname}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('denuncias_evidencia')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype
                });

            if (uploadError) throw uploadError;

            const { data } = supabaseAdmin.storage
                .from('denuncias_evidencia')
                .getPublicUrl(fileName);

            urlArchivo = data.publicUrl;
        }

        const { error } = await supabaseAdmin
            .from('denuncias')
            .insert([
                {
                    descripcion,
                    evidencia_url: urlArchivo,
                    hash_anonimo: hashAnonimo,
                    estado: 'pendiente'
                }
            ]);

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Reporte registrado exitosamente.',
            hash: hashAnonimo
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;