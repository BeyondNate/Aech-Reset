import { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import CountdownElectoral from '../components/CountdownElectoral';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const COLORES_GRAFICO = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

export default function PanelResultados({ onEleccionCerrada }) {
  const [datosVotos, setDatosVotos] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const cooldownRef = useRef(false);

  // Función para traer la foto del conteo actual desde el backend
  const consultarEscrutinio = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/resultados/dashboard`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      if (!res.ok) throw new Error('Error de red al traer resultados');
      const data = await res.json();
      
      setDatosVotos(data.votos);
      setMetricas(data.participacion);
    } catch (err) {
      console.error("Error al actualizar el tablero:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // 1. Carga inicial de datos
    consultarEscrutinio();

    // 2. CONEXIÓN EN TIEMPO REAL: Escuchar cada insert en la tabla votos
    const canalVotos = supabase
      .channel('monitoreo-urnas')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votos' }, () => {
        // Debounce / Cooldown de 1 segundo: evita que 500 clics simultáneos tumben el backend
        if (!cooldownRef.current) {
          cooldownRef.current = true;
          consultarEscrutinio();
          setTimeout(() => { cooldownRef.current = false; }, 1000);
        }
      })
      .subscribe();

    // Limpieza al desmontar el componente
    return () => {
      supabase.removeChannel(canalVotos);
    };
  }, []);

  if (cargando) return <p className="text-center py-12 text-gray-500">Sincronizando con las urnas electrónicas...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Escrutinio en Tiempo Real</h1>
        <p className="text-gray-500 text-sm">Actualizaciones instantáneas protegidas por anonimato temporal.</p>
      </div>
      <div className="mb-8">
        <CountdownElectoral onCierre={() => onEleccionCerrada?.()} />
    </div>

      {/* Tarjetas de Métricas de Participación */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-white border rounded-3xl shadow-sm">
            <span className="text-sm font-medium text-gray-500">Participación Electoral</span>
            <h3 className="text-4xl font-black text-blue-600 mt-1">{metricas.porcentaje_participacion}%</h3>
            <p className="text-xs text-gray-400 mt-2">Del total de alumnos registrados</p>
          </div>
          <div className="p-6 bg-white border rounded-3xl shadow-sm">
            <span className="text-sm font-medium text-gray-500">Votos Emitidos</span>
            <h3 className="text-4xl font-black text-gray-900 mt-1">{metricas.total_votantes}</h3>
            <p className="text-xs text-gray-400 mt-2">Sufragios validados en la urna</p>
          </div>
          <div className="p-6 bg-white border rounded-3xl shadow-sm">
            <span className="text-sm font-medium text-gray-500">Padrón Electoral</span>
            <h3 className="text-4xl font-black text-gray-900 mt-1">{metricas.total_padron}</h3>
            <p className="text-xs text-gray-400 mt-2">Estudiantes UPCH habilitados</p>
          </div>
        </div>
      )}

      {/* Gráfico Estadístico */}
      <div className="bg-white p-6 border rounded-3xl shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Distribución de Votos</h2>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosVotos} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="nombre_lista" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#F9FAFB' }}
                contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
              />
              <Bar dataKey="total_votos" radius={[8, 8, 0, 0]} animationDuration={500}>
                {datosVotos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES_GRAFICO[index % COLORES_GRAFICO.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}