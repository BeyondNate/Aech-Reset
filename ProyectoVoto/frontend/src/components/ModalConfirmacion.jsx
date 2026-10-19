// frontend/src/components/ModalConfirmacion.jsx

export default function ModalConfirmacion({ lista, enviando, onConfirmar, onCancelar }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden animate-scale-up">
        {/* Alerta Visual Superior */}
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 text-xl mb-4">
          ⚠️
        </div>

        <h3 className="font-bold text-xl text-gray-900 mb-2">¿Confirmar tu voto?</h3>
        
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          Estás a punto de emitir tu voto por <strong className="text-gray-900 font-semibold">"{lista.nombre_lista}"</strong>. 
          Esta acción es <span className="text-red-600 font-bold underline">completamente irreversible</span>. No podrás modificar tu elección ni volver a ingresar a la urna virtual.
        </p>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={enviando}
            className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl py-2.5 transition-colors disabled:opacity-40 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={enviando}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl py-2.5 transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {enviando ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </>
            ) : (
              'Sí, emitir voto'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}