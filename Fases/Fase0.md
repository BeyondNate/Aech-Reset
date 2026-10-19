# Fase 0 — Planeación y Diseño
## Sistema de Votación Electoral Universitaria

**Stack definido:** React (Frontend) + Node.js (Backend) + Supabase (Base de datos) + Cloudinary (multimedia) + Google Gemini API (IA/RAG)

---

## 1. Modelo de Datos

### Entidades principales

**`estudiantes`**
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid (PK) | Identificador único |
| correo_institucional | text (unique) | Validado vía Google OAuth |
| hash_identidad | text (unique) | Generado tras login, desvincula votante-voto |
| ha_votado | boolean | Bloquea doble voto |
| fecha_registro | timestamp | Auditoría |

**`listas`** (candidatos)
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid (PK) | Identificador único |
| nombre_lista | text | Nombre de la lista/planilla |
| nombre_candidatos | jsonb | Array de integrantes |
| logo_url | text | URL en Cloudinary |
| plan_gobierno_url | text | PDF en Cloudinary, usado por el RAG |
| descripcion_corta | text | Resumen para tarjetas |

**`votos`**
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid (PK) | Identificador único |
| lista_id | uuid (FK → listas) | Lista votada |
| hash_identidad | text | **Sin FK a estudiantes** — anonimato |
| timestamp | timestamp | Auditoría |

**`denuncias`**
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid (PK) | Identificador único |
| descripcion | text | Detalle de la irregularidad |
| evidencia_url | text | Foto/PDF en Cloudinary |
| hash_anonimo | text | Opcional, sin vincular a estudiante |
| estado | text | pendiente / revisada |
| fecha | timestamp | Auditoría |

**`configuracion_eleccion`**
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid (PK) | Identificador único |
| fecha_inicio | timestamp | Apertura de votación |
| fecha_fin | timestamp | Cierre de votación |
| estado | text | activa / cerrada |

### Puntos clave de diseño

- La tabla `votos` **nunca** tiene una FK directa a `estudiantes`. La separación se garantiza vía `hash_identidad`, de modo que ni con acceso total a la base de datos se pueda vincular un voto a una persona.
- `ha_votado` vive en `estudiantes` para bloquear doble voto, pero es independiente del contenido del voto emitido.
- El hash debe generarse con un algoritmo unidireccional (ej. SHA-256 + salt) para que no sea reversible.

---

## 2. Esquema de Supabase y Seguridad

- **Row Level Security (RLS)** activo en todas las tablas desde el inicio del desarrollo, no como añadido posterior.
- **Política en `votos`**:
  - INSERT: permitido solo si el estudiante autenticado no ha votado (verificado vía función/trigger).
  - SELECT: restringido — los estudiantes solo ven datos agregados (conteos), no registros individuales. Solo el rol `admin`/backend puede auditar.
- **Política en `denuncias`**:
  - INSERT: abierto y anónimo (no requiere identificar al usuario).
  - SELECT: solo rol `admin` (comité electoral/moderación).
- **Trigger** en `votos`: al insertar un voto, actualiza automáticamente `ha_votado = true` en `estudiantes` (vía función de Postgres/Supabase).
- Autenticación exclusiva vía Google OAuth con dominio institucional restringido.

---

## 3. Wireframes — Pantallas Clave

1. **Login**
   - Botón único: "Continuar con correo institucional" (Google OAuth).
   - Mensaje de bienvenida breve explicando el proceso.

2. **Votación**
   - Tarjetas por lista: logo, nombre, botón "Ver plan de gobierno" (abre el chatbot con ese PDF precargado) y botón "Votar".
   - Confirmación modal antes de emitir el voto (irreversible).

3. **Chatbot (RAG)**
   - Panel lateral o modal.
   - Input de texto + selector de lista activa.
   - Respuestas basadas únicamente en el PDF de la lista seleccionada.

4. **Resultados**
   - Gráfico de barras en tiempo real (WebSockets).
   - Contador de participación (% de votantes habilitados que ya votaron).

5. **Buzón de denuncias**
   - Formulario simple: descripción + carga de archivo (foto/PDF).
   - Sin campos que identifiquen al denunciante.

6. **Pantalla de cierre ("Flash Electoral")**
   - Countdown grande y visible.
   - Bloqueo automático del sistema al llegar a cero.
   - Animación de anuncio del ganador.

---

## 4. Stack Tecnológico Definido

| Capa | Tecnología |
|---|---|
| Frontend | **React** |
| Backend | **Node.js** |
| Base de datos | Supabase (PostgreSQL) |
| Almacenamiento multimedia | Cloudinary |
| IA (RAG) | Google Gemini API |
| Tiempo real | WebSockets |
| Autenticación | Google OAuth (correo institucional) |

---

## 5. Checklist de Cierre de Fase 0

- [ ] Esquema de base de datos creado en Supabase (tablas + relaciones).
- [ ] Políticas RLS configuradas y probadas.
- [ ] Trigger de `ha_votado` funcionando.
- [ ] Wireframes aprobados por el equipo.
- [ ] Repositorio Node.js + React inicializado (monorepo o separado, a decidir).
- [ ] Variables de entorno y credenciales (Supabase, Cloudinary, Gemini) configuradas en `.env`.

---

*Siguiente paso: Fase 1 — Autenticación y Base del Sistema.*