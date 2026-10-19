// frontend/src/pages/PantallaVotacion.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import ListaCard from '../components/ListaCard';
import ModalConfirmacion from '../components/ModalConfirmacion';
import CountdownElectoral from '../components/CountdownElectoral';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function PantallaVotacion({ onEleccionCerrada }) {
  const [listas, setListas] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const [yaVoto, setYaVoto] = useState(null); // null = cargando estado inicial
  const [enviando, setEnviando] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState(null);
  const [exitoFeedback, setExitoFeedback] = useState(null);

  useEffect(() => {
    async function inicializarUrna() {
      try {
        // 1. Extraer la sesión activa del cliente de Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          setErrorFeedback('No se pudo validar tu sesión activa. Por favor, reautentícate.');
          setYaVoto(false);
          return;
        }

        // 2. Verificar estado de votación en el Backend (Capa de seguridad obligatoria)
        const resEstado = await fetch(`${API_URL}/api/votos/estado`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${session.access_token}` 
          }
        });

        if (!resEstado.ok) {
          const errData = await resEstado.json().catch(() => ({}));
          throw new Error(errData.error || 'Error al recuperar el estado del votante.');
        }

        const estado = await resEstado.json();
        setYaVoto(estado.ha_votado);

        // 3. Si no ha votado, cargamos los partidos directo desde Supabase (Dato público con Anon Key)
        if (!estado.ha_votado) {
          const { data: listasData, error: listasError } = await supabase
            .from('listas')
            .select('*');
          
          if (listasError) throw listasError;
          setListas(listasData || []);
        }

      } catch (err) {
        console.error('Error en inicializarUrna:', err);
        setErrorFeedback('Ocurrió un error al conectar con el servidor electoral.');
        setYaVoto(false);
      }
    }

    inicializarUrna();
  }, []);

  // Manejador del envío del voto al backend transaccional RPC
  const ejecutarVotoElectoral = async () => {
    if (!listaSeleccionada) return;
    setEnviando(true);
    setErrorFeedback(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sesión expirada.');

      // Petición POST segura al backend
      const response = await fetch(`${API_URL}/api/votos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ lista_id: listaSeleccionada.id })
      });

      const resultado = await response.json();

      if (!response.ok) {
        // Manejo específico de los errores lanzados por la RPC de Postgres
        throw new Error(resultado.error || 'Error al procesar el sufragio.');
      }

      // Voto guardado con éxito
      setYaVoto(true);
      setExitoFeedback('¡Tu voto ha sido procesado de manera totalmente anónima y segura!');
      setListaSeleccionada(null);

    } catch (err) {
      console.error('Error al emitir voto:', err);
      setErrorFeedback(err.message);
      setListaSeleccionada(null);
    } finally {
      setEnviando(false);
    }
  };

  const abrirPlanGobierno = (lista) => {
    // Redirección o trigger temporal para la Fase 4 (Chatbot RAG)
    if (lista.plan_gobierno_url) {
      window.open(lista.plan_gobierno_url, '_blank');
    } else {
      alert('Esta lista no cuenta con un plan de gobierno digital cargado.');
    }
  };

  // 1. Pantalla de Carga (Esqueleto/Skeleton)
  if (yaVoto === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
        <p className="text-gray-500 font-medium text-sm animate-pulse">Verificando credenciales en la urna...</p>
      </div>
    );
  }

  // 2. Pantalla de Bloqueo / Redirección (Si el backend ya detectó ha_votado = true)
if (yaVoto) {
  return (
    <div className="max-w-md mx-auto text-center py-12 px-6 bg-white border border-gray-100 rounded-3xl shadow-sm mt-8 animate-fade-in">
      <CountdownElectoral onCierre={() => onEleccionCerrada?.()} />
      <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sufragio Completado</h2>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          {exitoFeedback || 'Tu identidad ya registra un voto emitido en el sistema electoral UPCH.'}
        </p>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-500">
          🔒 Tu voto se encuentra cifrado e indexado mediante tokens criptográficos anónimos.
        </div>
      </div>
    );
  }

  // 3. Renderizado de la Urna de Votación Regular
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
<div className="mb-8 border-b border-gray-100 pb-4">
  <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">Cámara de Votación</h1>
  <p className="text-gray-500 text-sm">Selecciona una alternativa para ejercer tu voto electrónico.</p>
</div>

<div className="mb-8">
  <CountdownElectoral onCierre={() => onEleccionCerrada?.()} />
</div>

      {errorFeedback && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-sm text-red-700 font-medium">
          🛑 {errorFeedback}
        </div>
      )}

      {/* Grid Dinámico de Listas electorales */}
      {listas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed">
          <p className="text-gray-500 text-sm font-medium">No hay listas electorales vigentes en este proceso.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listas.map((lista) => (
            <ListaCard
              key={lista.id}
              lista={lista}
              onVotar={(selected) => setListaSeleccionada(selected)}
              onVerPlan={abrirPlanGobierno}
            />
          ))}
        </div>
      )}

      {/* Capa del Modal de Confirmación */}
      {listaSeleccionada && (
        <ModalConfirmacion
          lista={listaSeleccionada}
          enviando={enviando}
          onCancelar={() => setListaSeleccionada(null)}
          onConfirmar={ejecutarVotoElectoral}
        />
      )}
    </div>
  );
}