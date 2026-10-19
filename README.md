
# AECH RESET
### Plataforma de participación y orientación electoral

AECH RESET es una plataforma de votación virtual desarrollada como
proyecto académico. Integra funcionalidades de participación electoral,
consulta de resultados y acceso a información para facilitar que los
usuarios conozcan las propuestas y la trayectoria de los candidatos.

El sistema busca centralizar la experiencia electoral mediante una
interfaz web, herramientas de consulta y un asistente conversacional
basado en inteligencia artificial.

## Funcionalidades principales

- **Votación virtual:** interfaz para participar en el proceso electoral.
- **Flash electoral:** consulta y presentación de resultados.
- **Asistente de IA:** conversación sobre los planes de gobierno y la
  trayectoria de los candidatos.
- **Autenticación institucional:** acceso mediante el sistema de
  autenticación configurado para el proyecto.
- **Panel administrativo:** funcionalidades de gestión del proceso
  electoral.
- **Buzón de denuncias:** interfaz para registrar incidencias.
- **Gestión de resultados:** consulta de los resultados electorales.

## Tecnologías utilizadas

### Frontend
- React
- JavaScript
- Vite
- HTML y CSS

### Backend
- Node.js
- Express
- API de inteligencia artificial de Gemini

### Servicios e infraestructura
- Supabase para servicios de autenticación y base de datos.
- Git y GitHub para el control de versiones.

## Estructura del repositorio

```text
SistemasInformacionProyectoFinal/
├── Documentacion/
├── Fases/
├── Logos/
├── PlanGobierno/
├── ProyectoVoto/
│   ├── backend/
│   │   ├── server/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── index.js
│   │   └── package.json
│   └── frontend/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   └── services/
│       └── package.json
└── README.md
```

## Configuración y ejecución

### Requisitos
- Node.js y npm.
- Un proyecto de Supabase configurado.
- Una API key de Gemini si se utiliza el asistente de IA.

### Backend

```bash
cd ProyectoVoto/backend
npm install
```

Configura las variables de entorno requeridas por el backend en un
archivo `.env` local. Consulta el código para identificar los nombres
exactos de las variables necesarias.

Después, utiliza el comando de inicio definido en `package.json`.

### Frontend

```bash
cd ProyectoVoto/frontend
npm install
```

Configura las variables de entorno públicas que requiere el frontend
en un archivo `.env` local y utiliza el comando de desarrollo definido
en `package.json`.

## Seguridad

- No se incluyen archivos `.env` ni credenciales privadas.
- Las claves secretas deben permanecer en el backend.
- Las claves de administración de Supabase no deben exponerse al
  navegador.
- La configuración de autenticación y las políticas de acceso deben
  revisarse antes de desplegar el sistema.

## Estado del proyecto

Proyecto académico. La ejecución completa requiere configurar los
servicios externos y las variables de entorno correspondientes.
Los scripts SQL originales de Supabase no están incluidos en esta
versión del repositorio.

## Autoría

Desarrollado como proyecto académico de sistemas de información.

---

*AECH RESET — Tecnología para una participación electoral informada.*
