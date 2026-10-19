const cron = require('node-cron');
const { supabaseAdmin } = require('./supabaseAdmin');

function iniciarSchedulerCierre() {
  cron.schedule('*/10 * * * * *', async () => {
    const { data: config, error } = await supabaseAdmin
      .from('configuracion_eleccion')
      .select('id, fecha_fin, estado')
      .single();

    if (error || !config || config.estado === 'cerrada') return;

    if (new Date() >= new Date(config.fecha_fin)) {
      await supabaseAdmin
        .from('configuracion_eleccion')
        .update({ estado: 'cerrada' })
        .eq('id', config.id);
      console.log('✅ Elección cerrada automáticamente');
    }
  });
}

module.exports = iniciarSchedulerCierre;