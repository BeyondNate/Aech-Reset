## Fase 5 — Transparencia y Denuncias

### 1. Buzón de quejas anónimo

- Formulario simple accesible desde el menú principal (visible durante toda la jornada electoral, no solo al final).
- Campos: `descripcion` (texto libre) + `evidencia` (archivo opcional: foto o PDF).
- **Sin ningún campo que identifique al usuario** — ni siquiera se envía el token de sesión al backend para este endpoint específico, o si se envía por control de spam, se descarta inmediatamente después de la validación y no se guarda vínculo alguno en `denuncias`.
- Consideración de anti-spam sin romper anonimato: rate limiting por IP a nivel de backend (no por usuario) para evitar flood de denuncias falsas, sin necesidad de identificar a la persona.

### 2. Carga multimedia vía Cloudinary

- Frontend sube el archivo directo a Cloudinary (unsigned upload preset configurado para esta carpeta específica) o vía backend como intermediario — recomendado vía backend para poder validar tipo/tamaño de archivo antes de subir (evitar abuso).
- Validaciones: solo `image/*` y `application/pdf`, límite de tamaño (ej. 10MB), máximo 3 archivos por denuncia.
- La URL resultante de Cloudinary se guarda en `denuncias.evidencia_url`.

### 3. Panel de moderación

- Ruta protegida `/admin/denuncias` (mismo rol admin del panel de listas).
- Vista de lista con filtro por estado (`pendiente` / `revisada`).
- Al abrir una denuncia: descripción, evidencia (preview de imagen o link al PDF), fecha, y botón para marcarla como revisada.
- Opcional para esta fase o para una iteración posterior: campo de notas internas del comité al revisar (no visible al público).

### 4. Accesibilidad — Web Speech API

- Integrar comandos de voz básicos en los puntos de mayor fricción:
  - Navegación: "ir a votación", "ir a resultados", "abrir chatbot".
  - Dictado de texto en el formulario de denuncias (útil para quienes tienen dificultad para escribir).
- Usar `SpeechRecognition` (Web Speech API nativa del navegador) en el frontend — no requiere backend adicional, aunque el soporte de navegadores varía (mejor en Chrome), así que debe ser una mejora progresiva, no una dependencia crítica del flujo.
- Agregar también soporte básico de lectura en voz alta (`SpeechSynthesis`) para las respuestas del chatbot, como mejora de accesibilidad adicional.

### Checklist de cierre de Fase 5

- [ ] Formulario de denuncias funcional, sin captura de identidad.
- [ ] Carga de evidencia a Cloudinary con validaciones de tipo/tamaño.
- [ ] Rate limiting por IP implementado.
- [ ] Panel de moderación con filtro por estado.
- [ ] Comandos de voz básicos de navegación funcionando.
- [ ] Dictado por voz en el formulario de denuncias probado.
- [ ] Lectura en voz alta del chatbot (opcional, si el tiempo lo permite).

¿Seguimos con la Fase 6 (Experiencia de Cierre - "Flash Electoral")?