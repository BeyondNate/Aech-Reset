import { useEffect, useState, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
export default function CountdownElectoral({ onCierre }) {
  const [restante, setRestante] = useState(null);
  const yaNotifico = useRef(false);

  const sincronizar = async () => {
    try {
      const response = await fetch(`${API_URL}/api/resultados/estado`);
      const data = await response.json();

      if (data.estado === "cerrada") {
        if (!yaNotifico.current) {
          yaNotifico.current = true;
          onCierre?.();
        }
        return;
      }

      const parseUTC = (fecha) => {
        if (!fecha) return null;
        return new Date(fecha.endsWith("Z") ? fecha : fecha + "Z");
      };

      const horaServidor = parseUTC(data.hora_servidor_actual).getTime();
      const fin = parseUTC(data.fecha_fin).getTime();

      setRestante(fin - horaServidor);

    } catch (err) {
      console.error("Error sincronizando countdown", err);
    }
  };


  useEffect(() => {
    sincronizar();

    const resync = setInterval(sincronizar, 30000);

    const tick = setInterval(() => {
      setRestante(prev => {
        if (prev === null) return prev;
        return Math.max(prev - 1000, 0);
      });
    },1000);

    return () => {
      clearInterval(resync);
      clearInterval(tick);
    };

  }, []);


  // ESTE EFECTO TIENE QUE ESTAR AQUÍ
  useEffect(() => {
    if (restante === 0 && !yaNotifico.current) {
      yaNotifico.current = true;

      setTimeout(() => {
        onCierre?.();
      },0);
    }
  }, [restante,onCierre]);


  if (restante === null) {
    return <p>Cargando...</p>;
  }


  const totalSeg = Math.floor(restante / 1000);

  const horas = Math.floor(totalSeg / 3600);
  const min = Math.floor((totalSeg % 3600)/60);
  const seg = totalSeg % 60;

  const urgente = totalSeg <= 300;


  return (
    <div>
      {horas > 0 && `${String(horas).padStart(2,"0")}:`}
      {String(min).padStart(2,"0")}:
      {String(seg).padStart(2,"0")}
    </div>
  );
}