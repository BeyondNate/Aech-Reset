import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import confetti from "canvas-confetti";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function PantallaCierre() {
  const [fase, setFase] = useState("contando"); // contando -> resultado
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerResultado = async () => {
      // pequeña espera para que el backend consolide los últimos votos
      await new Promise((r) => setTimeout(r, 3000));

      try {
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch(`${API_URL}/api/resultados/resultado-final`, {
          headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
        });

        if (!response.ok) throw new Error("No se pudo obtener el resultado final.");

        const data = await response.json();
        setResultado(data);
        setFase("resultado");

        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al calcular el resultado final.");
      }
    };

    obtenerResultado();
  }, []);

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (fase === "contando") {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 animate-fade-in">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900">Contando los últimos votos...</h2>
      </div>
    );
  }

  const listas = resultado?.listas || [];
  const maxVotos = listas.length > 0 ? Math.max(...listas.map((l) => l.votos)) : 0;
  const ganadores = listas.filter((l) => l.votos === maxVotos);
  const empate = ganadores.length > 1 && maxVotos > 0;

  return (
    <div className="max-w-2xl mx-auto text-center py-12 px-6 animate-fade-in">
      {empate ? (
        <h1 className="text-3xl font-black text-gray-900 mb-2">🤝 Empate técnico</h1>
      ) : ganadores.length === 1 ? (
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          🏆 Ganador: {ganadores[0].nombre}
        </h1>
      ) : (
        <h1 className="text-3xl font-black text-gray-900 mb-2">Votación finalizada</h1>
      )}

      <p className="text-gray-500 mb-8">Total de votos emitidos: {resultado.totalVotos}</p>

      <div className="space-y-3">
        {listas
          .sort((a, b) => b.votos - a.votos)
          .map((lista) => (
            <div
              key={lista.nombre}
              className="flex items-center justify-between bg-white border rounded-2xl px-5 py-3 shadow-sm"
            >
              <span className="font-medium text-gray-900">{lista.nombre}</span>
              <span className="font-black text-blue-600">{lista.votos} votos</span>
            </div>
          ))}
      </div>
    </div>
  );
}