## Fase 4 — Inteligencia Artificial (Chatbot RAG)

### 1. Procesamiento de los PDFs (planes de gobierno)

- Cuando el admin sube un PDF en el panel administrativo (Fase 2), disparar un proceso de indexación:
  1. Extraer texto del PDF (librería como `pdf-parse` en Node.js).
  2. Dividir el texto en **chunks** (fragmentos de ~500-800 tokens con solapamiento de ~100 tokens) para no perder contexto entre cortes.
  3. Generar embeddings de cada chunk con el modelo de embeddings de Google (`text-embedding-004` o el vigente en la API de Gemini).
  4. Guardar los chunks + sus embeddings en Supabase usando la extensión **pgvector** (Supabase la soporta nativamente).

Tabla nueva sugerida:

| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid (PK) | Identificador |
| lista_id | uuid (FK → listas) | A qué lista pertenece el chunk |
| contenido | text | Texto del fragmento |
| embedding | vector(768) | Embedding del fragmento |

### 2. Integración con Gemini API (RAG)

Flujo por cada pregunta del estudiante:

1. Frontend envía: `{ pregunta, lista_id }` al backend.
2. Backend genera el embedding de la pregunta (misma API de embeddings).
3. Búsqueda de similitud en `pgvector` (`ORDER BY embedding <-> pregunta_embedding LIMIT 5`), filtrando por `lista_id` — **esto es clave para la neutralidad**: solo se recuperan fragmentos de la lista consultada, nunca se mezclan candidatos.
4. Se arma el prompt para Gemini con los 5 chunks más relevantes como contexto, y una instrucción estricta tipo:
   > "Responde ÚNICAMENTE con base en el siguiente contexto extraído del plan de gobierno. Si la respuesta no está en el contexto, indica que esa información no fue especificada en el plan. No opines, no compares con otras listas."
5. Backend llama a la API de Gemini con ese prompt + pregunta del usuario.
6. Respuesta se retorna al frontend.

### 3. Interfaz del chatbot

- Modal o panel lateral que se abre desde el botón "Ver plan de gobierno" de cada tarjeta (Fase 2).
- Input de texto simple + historial de la conversación visible (solo de esa sesión, no persistido necesariamente).
- Mostrar claramente el nombre/logo de la lista sobre la que se está preguntando, para que el estudiante nunca tenga dudas de qué candidato está consultando.
- Sugerencias de preguntas rápidas (chips) tipo "¿Qué propone sobre X tema?" para reducir la fricción de escribir.

### 4. Pruebas de neutralidad

Antes de cerrar esta fase, es importante validar con casos de prueba:

- Preguntar algo que **no está** en el PDF → debe responder que no fue especificado, no inventar.
- Preguntar comparando dos listas ("¿Cuál de las dos propone mejor X?") → debe negarse o redirigir, ya que el contexto solo tiene una lista.
- Preguntar algo fuera de tema (ej. "¿quién va a ganar?") → debe declinar opinar, mantenerse neutral.
- Revisar que el filtro por `lista_id` en la búsqueda vectorial realmente aísle el contexto (que nunca se filtre un chunk de otra lista).

### Checklist de cierre de Fase 4

- [ ] Extensión `pgvector` habilitada en Supabase.
- [ ] Pipeline de extracción + chunking + embeddings funcionando al subir un PDF.
- [ ] Endpoint de búsqueda semántica filtrado por `lista_id`.
- [ ] Integración con Gemini API con prompt de neutralidad estricta.
- [ ] Interfaz de chat conectada a cada tarjeta de lista.
- [ ] Casos de prueba de neutralidad pasados (no inventa, no compara, no opina).

¿Seguimos con la Fase 5 (Transparencia y Denuncias)?