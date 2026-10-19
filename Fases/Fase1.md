## Fase 1 — Autenticación y Base del Sistema

### 1. Google OAuth con correo institucional

- Configurar proyecto en **Google Cloud Console** → habilitar OAuth 2.0 Client ID.
- Restringir el dominio permitido (ej. solo `@tuuniversidad.edu.pe`) — esto se valida tanto en el frontend (hint de dominio) como en el backend (verificación real del `hd` claim del token de Google, nunca confiar solo en el frontend).
- Supabase Auth ya soporta Google como proveedor nativo: se configura desde el dashboard (Authentication → Providers → Google) con el Client ID/Secret.
- Flujo: usuario hace clic en "Continuar con correo institucional" → Supabase redirige a Google → retorna con sesión activa → backend valida que el correo pertenezca al dominio institucional antes de crear/activar el registro en `estudiantes`.

### 2. Generación del Hash de Identidad

- Al primer login exitoso, el backend genera `hash_identidad = SHA256(correo_institucional + salt_secreto)`.
- El `salt_secreto` vive solo en variables de entorno del backend, nunca en el frontend ni en el repositorio.
- Este hash se guarda en `estudiantes.hash_identidad` y es el único vínculo permitido entre persona y voto — pero al ser unidireccional, no se puede revertir para identificar al votante desde un voto.
- Importante: el hash se genera una sola vez por estudiante y se reutiliza; no se regenera en cada login (si no, se rompería el bloqueo de doble voto).

### 3. Estructura base del Frontend (React)

Organización de carpetas sugerida:
```
src/
  components/       → botones, tarjetas, modales reutilizables
  pages/            → Login, Votacion, Resultados, Denuncias, Cierre
  hooks/            → useAuth, useVotos, useWebSocket
  services/         → supabaseClient.js, cloudinary.js, geminiApi.js
  context/          → AuthContext (sesión global)
  routes/           → definición de rutas protegidas
```
- Rutas protegidas: cualquier página excepto Login requiere sesión activa (verificada vía `AuthContext`).
- Manejo de estado global mínimo: solo lo esencial (sesión del usuario, estado de la elección), evitando sobre-ingeniería en esta fase.

### 4. Conexión Frontend ↔ Supabase

- Instalar `@supabase/supabase-js` en el proyecto React.
- Cliente único (`supabaseClient.js`) inicializado con `SUPABASE_URL` y `SUPABASE_ANON_KEY` (clave pública, protegida por RLS — nunca usar la `service_role` key en el frontend).
- Todas las operaciones sensibles (generación de hash, validación de dominio, inserción de voto) pasan por el **backend Node.js**, no directo desde el frontend a Supabase, para mantener control total sobre la lógica crítica.

### 5. Backend Node.js — estructura base

```
server/
  routes/
    auth.js          → callback de OAuth, validación de dominio
    votos.js         → (se implementa en Fase 2)
  services/
    supabaseAdmin.js → cliente con service_role key (solo backend)
    hashService.js    → generación del hash_identidad
  middleware/
    verifyAuth.js     → valida sesión/token en cada request
  index.js
```
- El backend usa la `service_role` key de Supabase (nunca expuesta al cliente) para operaciones administrativas como crear el registro inicial del estudiante.

### Checklist de cierre de Fase 1

- [ ] Proyecto OAuth configurado en Google Cloud Console.
- [ ] Provider de Google activado en Supabase Auth.
- [ ] Validación de dominio institucional funcionando en backend.
- [ ] Servicio de generación de hash implementado y probado.
- [ ] Estructura de carpetas React inicializada con rutas protegidas.
- [ ] Estructura de carpetas Node.js inicializada con conexión a Supabase (admin).
- [ ] Login end-to-end probado: correo institucional → sesión activa → registro en `estudiantes` con hash generado.

¿Quieres que actualice el documento Markdown agregando esta fase, o prefieres que lo deje solo en el chat por ahora?