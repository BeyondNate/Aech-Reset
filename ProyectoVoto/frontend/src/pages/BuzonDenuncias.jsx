import React, { useState, useRef } from 'react';

export default function BuzonDenuncias() {
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const validarArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formatosPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!formatosPermitidos.includes(file.type)) {
      setError('Formato no válido. Solo se permiten imágenes (JPG, PNG, WEBP) o documentos PDF.');
      setArchivo(null);
      fileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('El archivo supera el tamaño máximo permitido de 10MB.');
      setArchivo(null);
      fileInputRef.current.value = '';
      return;
    }

    setError('');
    setArchivo(file);
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    if (!descripcion.trim()) return setError('Por favor, ingresa una descripción del hecho.');

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('descripcion', descripcion);
    if (archivo) formData.append('evidencia', archivo);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/denuncias`, {
        method: 'POST',
        body: formData,
        // Dejar headers vacíos intencionalmente para evitar inyectar tokens de autenticación
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo procesar el reporte.');

      setSuccess(data.message);
      setDescripcion('');
      setArchivo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 p-6 bg-white shadow-xl rounded-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Buzón de Sugerencias e Incidencias Anónimas</h2>
      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        Protección Criptográfica UPCH: Este canal es 100% anónimo. No almacenamos credenciales, tokens ni registros de IP. Tu reporte será gestionado con total neutralidad por el comité de escrutinio.
      </p>

      {error && <div className="p-3 mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">{error}</div>}
      {success && <div className="p-3 mb-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-md">{success}</div>}

      <form onSubmit={enviarFormulario} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción detallada de la incidencia *</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
            rows="5"
            placeholder="Por favor, escribe con la mayor precisión posible lo ocurrido..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adjuntar evidencia material (Opcional)</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={validarArchivo}
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            disabled={loading}
          />
          <span className="text-[11px] text-gray-400 mt-1 block">Formatos permitidos: JPG, PNG, WEBP o PDF. Peso máximo: 10MB.</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-sm transition disabled:bg-gray-400"
        >
          {loading ? 'Transmitiendo reporte seguro...' : 'Enviar Reporte Anónimo'}
        </button>
      </form>
    </div>
  );
}