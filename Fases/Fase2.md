## Fase 2 — Núcleo de Votación

### 1. Pantalla de candidatos/listas

- Vista de tarjetas (`ListaCard`) que consumen los datos de la tabla `listas`: logo (Cloudinary), nombre, descripción corta.
- Cada tarjeta tiene dos acciones: **"Ver plan de gobierno"** (abre el chatbot con ese PDF precargado — se conecta con la Fase 4) y **"Votar"**.
- Antes de renderizar esta pantalla, el frontend verifica en el backend si `ha_votado = true` para ese estudiante; si ya votó, se redirige directo a la pantalla de resultados/espera, sin mostrar el botón de votar.

### 2. Lógica de emisión de voto único

Flujo recomendado (todo pasa por el backend, nunca directo Frontend → Supabase):

1. Usuario hace clic en "Votar" sobre una lista → modal de confirmación (irreversible, se explica claramente).
2. Frontend envía `lista_id` + token de sesión al endpoint `POST /votos`.
3. Backend:
   - Verifica el token de sesión (middleware `verifyAuth`).
   - Consulta `estudiantes.ha_votado`; si ya es `true`, rechaza con error 409.
   - Si no ha votado, ejecuta una **transacción** en Supabase: inserta en `votos` (con `hash_identidad`, no con el id del estudiante) y actualiza `estudiantes.ha_votado = true`.
   - El trigger de Supabase (definido en Fase 0) es una segunda capa de seguridad por si alguna inserción se hiciera fuera del flujo del backend.
4. Backend responde éxito → frontend muestra confirmación de voto emitido.

**Importante:** la verificación y el insert deben ir en una sola transacción/función RPC de Postgres para evitar condiciones de carrera (dos clics casi simultáneos que pasen ambos la validación antes de que se actualice `ha_votado`).

### 3. Almacenamiento seguro y anónimo

- El insert en `votos` usa exclusivamente `hash_identidad`, nunca `estudiante_id`.
- Recomendación adicional: no guardar el `hash_identidad` en texto plano visible para consultas casuales — restringir el SELECT sobre `votos` solo al rol admin/backend (ya definido en las políticas RLS de la Fase 0).
- Considerar un pequeño delay o cola aleatoria antes de insertar (opcional) para que el orden de inserción no permita correlacionar tiempo de voto con hora de login de un estudiante específico — mitiga ataques de correlación temporal.

### 4. Panel administrativo básico

- Ruta protegida `/admin` (rol `admin` en Supabase, separado de estudiantes).
- Funcionalidades mínimas para esta fase:
  - Crear/editar/eliminar listas (nombre, candidatos, descripción).
  - Subir logo → Cloudinary → guarda URL en `listas.logo_url`.
  - Subir plan de gobierno (PDF) → Cloudinary → guarda URL en `listas.plan_gobierno_url`.
  - Configurar `fecha_inicio` y `fecha_fin` en `configuracion_eleccion`.
- No incluir aún en esta fase: gestión de denuncias ni resultados en vivo (eso es Fase 3 y 5).

### Checklist de cierre de Fase 2

- [ ] Endpoint `POST /votos` implementado con transacción atómica.
- [ ] Validación de doble voto probada (incluyendo casos de clics simultáneos).
- [ ] Pantalla de votación conectada a datos reales de `listas`.
- [ ] Modal de confirmación antes de votar.
- [ ] Panel admin funcional para CRUD de listas + subida a Cloudinary.
- [ ] Prueba end-to-end: admin crea lista → estudiante vota → voto se refleja en base de datos sin exponer identidad.

¿Seguimos con la Fase 3 (Resultados en Tiempo Real) o prefieres pausar aquí?