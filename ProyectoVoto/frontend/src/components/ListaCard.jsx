// frontend/src/components/ListaCard.jsx

export default function ListaCard({ lista, onVotar, onVerPlan }) {
  // Mapeo amigable para los cargos si vienen en el array JSONB de candidatos
  const cargos = ['Presidencia', 'Vicepresidencia i', 'Secretaría General'];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
      <div>
        {/* Contenedor del Logo de Cloudinary */}
        <div className="w-full h-32 bg-gray-50 rounded-xl flex items-center justify-center p-4 mb-4 border border-gray-100">
          <img 
            src={lista.logo_url || 'https://via.placeholder.com/150?text=Sin+Logo'} 
            alt={`Logo de ${lista.nombre_lista}`} 
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Información de la Lista */}
        <h3 className="font-bold text-xl text-gray-900 mb-1">{lista.nombre_lista}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lista.descripcion_corta}</p>

        {/* Lista de Candidatos (Cargado desde el JSONB de Postgres) */}
        <div className="border-t border-gray-100 pt-3 mb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
            Candidatos Principales
          </span>
          <ul className="space-y-1.5">
            {lista.nombre_candidatos && lista.nombre_candidatos.map((candidato, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>
                <span className="font-medium text-gray-500 text-xs w-24 shrink-0">
                  {cargos[index] || `Accesitario ${index - 1}`}:
                </span>
                <span className="truncate">{candidato}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <button
          type="button"
          onClick={() => onVerPlan(lista)}
          className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl py-2.5 text-sm transition-colors"
        >
          📄 Ver Plan
        </button>
        <button
          type="button"
          onClick={() => onVotar(lista)}
          className="flex-1 bg-black hover:bg-gray-900 text-white font-medium rounded-xl py-2.5 text-sm transition-colors shadow-sm"
        >
          🗳️ Votar
        </button>
      </div>
    </div>
  );
}