## Fase 7 — Pruebas Finales y Lanzamiento

### 1. Pruebas de seguridad

- **Anonimato del voto:** intentar, con acceso de admin a la base de datos, rastrear un voto específico hasta un estudiante. Debe ser imposible incluso con la `service_role` key, dado que `votos` no tiene FK a `estudiantes`.
- **Anti-duplicidad:** repetir la prueba de concurrencia de la Fase 3 pero ahora como prueba de seguridad formal — intentar votar dos veces desde la misma cuenta con requests simultáneos, y también con requests desfasados por milisegundos.
- **Anti-fraude en autenticación:** intentar registrar/loguear con correos que no sean del dominio institucional, tokens falsificados, o manipulando el `hd` claim del JWT de Google — el backend debe rechazar todo esto, no solo el frontend.
- **Revisión de políticas RLS:** auditar cada tabla para confirmar que ningún usuario autenticado normal pueda leer datos que no le correspondan (ej. votos individuales, denuncias ajenas).
- **Inyección y validación de inputs:** revisar el formulario de denuncias y el chatbot contra inyección de prompts maliciosos (ej. alguien intentando hacer que el chatbot "olvide" sus instrucciones de neutralidad) y sanitización básica de inputs en general.

### 2. Pruebas de usabilidad (piloto)

- Ejecutar una **votación simulada** con un grupo reducido de estudiantes reales (ej. 20-30 personas) antes del día oficial.
- Observar puntos de fricción: ¿entienden el flujo de login? ¿usan el chatbot naturalmente? ¿encuentran el buzón de denuncias?
- Recoger feedback estructurado (encuesta corta post-piloto) sobre claridad, confianza percibida y velocidad.
- Probar específicamente en dispositivos móviles, ya que es probable que buena parte del padrón vote desde el celular.

### 3. Ajustes de UX según feedback

- Priorizar ajustes según impacto: bloqueos que impidan votar (crítico, arreglo inmediato) vs. mejoras de claridad/estética (backlog para después del piloto si el tiempo apremia).
- Revisar tiempos de carga reales del chatbot (la latencia de Gemini + búsqueda vectorial puede sentirse lenta) y agregar estados de "escribiendo..." si es necesario para percepción de fluidez.

### 4. Despliegue final

- Frontend: desplegar en **Vercel** o **Netlify** (gratuito, integra bien con React).
- Backend: desplegar en un servicio gratuito/económico compatible con Node.js persistente (ej. Render, Railway) — importante que soporte procesos long-running si se usa algo además de Supabase Realtime.
- Variables de entorno de producción configuradas por separado de desarrollo (claves de Supabase, Cloudinary, Gemini).
- Configurar dominio institucional o subdominio dedicado para dar formalidad y confianza (ej. `votaciones.tuuniversidad.edu.pe`).

### 5. Capacitación al comité electoral

- Sesión breve mostrando: panel admin (crear listas, subir planes), panel de moderación de denuncias, cómo verificar resultados finales, y qué hacer ante un empate o incidencia técnica el día de la votación.
- Documento de "manual rápido" o checklist impreso/PDF para el día de la elección, con contactos de soporte técnico de respaldo.

### Checklist de cierre de Fase 7 (y del proyecto)

- [ ] Pruebas de anonimato pasadas (voto irrastreable incluso con acceso admin).
- [ ] Pruebas de anti-duplicidad bajo concurrencia real pasadas.
- [ ] Auditoría de políticas RLS completa.
- [ ] Piloto ejecutado con grupo real de estudiantes.
- [ ] Ajustes críticos de UX resueltos.
- [ ] Despliegue en producción con dominio propio.
- [ ] Capacitación al comité electoral realizada.
- [ ] Plan de contingencia técnica documentado para el día de la elección.

Con esto tienes el roadmap completo, de la Fase 0 a la Fase 7. ¿Quieres que ahora prepare el documento Markdown consolidado con todas las fases juntas (para tenerlo como referencia única), o hay algo puntual que quieras profundizar antes de cerrar?