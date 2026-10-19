## Fase 3 — Resultados en Tiempo Real

### 1. Implementación de WebSockets

- Usar **Supabase Realtime** (ya viene integrado, escucha cambios en Postgres vía réplica lógica) en lugar de montar un servidor WebSocket propio — reduce complejidad y es "costo cero".
- El frontend se suscribe a cambios en la tabla `votos` (evento `INSERT`):
```js
supabase
  .channel('votos-realtime')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votos' }, (payload) => {
    // actualizar conteo local
  })
  .subscribe();
```
- Alternativa si se prefiere no depender de Supabase Realtime: Socket.io en el backend Node.js, emitiendo un evento cada vez que se confirma un voto exitoso en el endpoint `POST /votos`. Recomendado solo si ya se está evitando Supabase Realtime por alguna limitación de plan/cuota.

### 2. Cálculo de conteos

- **No** enviar cada voto individual al frontend (rompería el anonimato temporal y sería ineficiente). En su lugar:
  - El backend mantiene (o calcula on-demand) un conteo agregado por `lista_id`.
  - Opción simple: función RPC en Supabase `get_conteo_votos()` que hace `SELECT lista_id, COUNT(*) FROM votos GROUP BY lista_id`.
  - Cuando llega el evento de `INSERT`, el frontend simplemente vuelve a pedir el conteo agregado (o el backend recalcula y emite el agregado ya listo, no el voto crudo).

### 3. Gráficos dinámicos

- Librería sugerida: **Recharts** (se integra bien con React, ligera).
- Gráfico de barras por lista + porcentaje de participación (`estudiantes con ha_votado=true` / `total estudiantes habilitados`).
- Animación suave al actualizar valores (transición, no salto brusco) para reforzar la sensación de "en vivo".
- Importante para la transparencia radical: este gráfico debe ser visible para todos los estudiantes autenticados, no solo admins — es parte del valor diferencial del proyecto.

### 4. Pruebas de carga

- Simular votación simultánea con una herramienta como **k6** o **Artillery**: N usuarios concurrentes haciendo `POST /votos` al mismo tiempo.
- Objetivo: confirmar que la transacción atómica de la Fase 2 sigue sin permitir doble voto bajo concurrencia real, y que Supabase Realtime no se satura ni retrasa demasiado con ráfagas de inserts.
- Ajustar si es necesario: debounce en el frontend para no re-consultar el conteo en cada voto individual si hay ráfagas (ej. agrupar actualizaciones cada 500ms-1s).

### Checklist de cierre de Fase 3

- [ ] Suscripción Realtime funcionando en el frontend.
- [ ] Función/endpoint de conteo agregado por lista.
- [ ] Gráfico de barras dinámico con Recharts, visible para todos los estudiantes.
- [ ] Contador de participación (%) actualizado en vivo.
- [ ] Prueba de carga con votos simultáneos, sin duplicados ni caídas del sistema.
- [ ] Debounce/agrupación de actualizaciones si hay ráfagas de votos.

¿Continuamos con la Fase 4 (Chatbot con IA - RAG), que es una de las partes más distintivas del proyecto?