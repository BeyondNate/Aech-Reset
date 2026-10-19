## Fase 6 — Experiencia de Cierre ("Flash Electoral")

### 1. Conteo regresivo automático

- Basado en `configuracion_eleccion.fecha_fin`, ya definida desde el panel admin (Fase 2).
- El frontend calcula el tiempo restante comparando la hora del servidor (no la del cliente, para evitar manipulación si alguien adelanta/atrasa el reloj de su dispositivo) contra `fecha_fin`.
- Recomendación: el backend expone un endpoint `GET /eleccion/estado` que retorna `{ fecha_fin, hora_servidor_actual, estado }`. El frontend calcula el countdown localmente pero se resincroniza con este endpoint cada cierto intervalo (ej. cada 30s) para evitar drift.
- Visual: contador grande, visible en la pantalla de votación y resultados, con transición de color/urgencia en los últimos minutos (ej. cambia a rojo en los últimos 5 minutos).

### 2. Bloqueo del sistema al llegar al límite de tiempo

- Cuando `hora_servidor_actual >= fecha_fin`, el backend debe **rechazar cualquier nuevo voto** en el endpoint `POST /votos`, sin depender solo del frontend (el frontend puede fallar en deshabilitar el botón a tiempo, pero el backend es la barrera real).
- Trigger o job programado (ej. Supabase Edge Function con cron, o un cron job simple en el servidor Node) que actualice `configuracion_eleccion.estado = 'cerrada'` exactamente al llegar la hora.
- El frontend, al detectar `estado = 'cerrada'` (vía polling o Realtime), redirige automáticamente a todos los usuarios conectados hacia la pantalla de cierre.

### 3. Animación de anuncio del ganador

- Al cerrarse la elección, el backend calcula el resultado final (conteo definitivo de `votos` agrupado por `lista_id`) y lo expone en un endpoint dedicado `GET /eleccion/resultado-final`.
- Frontend dispara una animación de celebración (confetti, revelado progresivo de barras hasta el resultado final, resaltado de la lista ganadora).
- Librerías sugeridas: `canvas-confetti` para el efecto visual, combinado con las transiciones ya existentes de Recharts para el "crecimiento final" de las barras.
- Mostrar también el porcentaje de participación final como parte de la narrativa de cierre ("El X% del padrón participó").

### 4. Consideraciones de UX

- Evitar que el conteo regresivo llegue a cero y la pantalla se quede "colgada" esperando datos — mostrar un estado intermedio breve tipo "Contando los últimos votos..." mientras el backend consolida el resultado final, antes de mostrar al ganador.
- Empate técnico: definir de antemano cómo se comunica visualmente (ej. mostrar ambas listas empatadas, sin forzar un "ganador" si no lo hay) — esto debería decidirse con el comité electoral, no solo a nivel técnico.

### Checklist de cierre de Fase 6

- [ ] Countdown sincronizado con hora del servidor, no del cliente.
- [ ] Bloqueo real de nuevos votos en backend al llegar la hora límite.
- [ ] Job/cron que cierra automáticamente la elección (`estado = 'cerrada'`).
- [ ] Redirección automática de todos los usuarios a la pantalla de cierre.
- [ ] Animación de anuncio del ganador funcionando (confetti + revelado de barras).
- [ ] Manejo definido para el caso de empate.

Con esto completamos las 7 fases del roadmap (Fase 0 a Fase 6, más la Fase 7 de pruebas finales que ya habíamos esbozado al inicio). ¿Quieres que ahora arme el documento completo con todas las fases juntas en Markdown, o prefieres profundizar en algo puntual (por ejemplo, el detalle técnico de la Fase 7 - Pruebas Finales y Lanzamiento)?