# PlayerIX

<p align="center">
  <img src="frontend/public/img/logonew.png" alt="PlayerIX Logo" width="300">
</p>

Aplicación de scouting de fútbol basada en datos históricos de EA Sports FC (ex FIFA).
Permite gestionar jugadores con sus atributos técnicos a través de distintas versiones del juego (FIFA 15 — FC 24).

## Stack

| Capa       | Tecnología                        |
| ---------- | --------------------------------- |
| Backend    | NestJS, TypeORM, Passport JWT     |
| Frontend   | Angular 19 (Standalone + Signals) |
| Base datos | MySQL 8.0                         |
| Infra      | Docker Compose, Nginx             |

## Estructura del proyecto

```
playerix/
├── docker-compose.yml       # Orquestación de servicios
├── .env.example
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── auth/             # Login JWT, guards, roles
│       ├── players/          # CRUD jugadores + skills, import CSV
│       └── users/            # CRUD usuarios (admin)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf            # Reverse proxy /api → backend
    └── src/app/
        ├── core/             # Servicios, guards, interceptors, modelos
        └── features/
            ├── auth/         # Login
            ├── players/      # Lista/detalle/edición + cartas FUT
            └── admin/        # Gestión de usuarios
```

## Puesta en marcha

```bash
# Clonar el repo
git clone <repo-url>
cd playerix

# Copiar variables de entorno y configurar
cp .env.example .env
# Editar .env con tus valores (DB, JWT secret, etc.)

# Levantar todos los servicios
docker compose up -d

# Ejecutar seed (crea usuario admin)
docker compose exec backend npm run seed
```

| Servicio | URL                            |
| -------- | ------------------------------ |
| Frontend | <http://localhost:4201>          |
| API      | <http://localhost:3001/api>      |
| Swagger  | <http://localhost:3001/api/docs> |

> El archivo `.env` contiene credenciales sensibles (DB, JWT secret) y **no está subido al repo**. Usá siempre `.env.example` como plantilla y nunca commits el `.env`.

Credenciales del seed: `admin@fifa.com` / `admin123`.

## Decisiones de diseño

- **Monolito modular con NestJS**: cada dominio (auth, players, users) es un módulo independiente con su propio controller, service y entidades. Sin hexagonal ni DDD — arquitectura por capas simple y efectiva para el alcance del proyecto.
- **Feature-based en el front**: los componentes se agrupan por funcionalidad (auth, players, admin) y comparten lógica desde `core/`. Sin NgModules — todo standalone con Signals para reactividad.
- **Versionado de skills**: `PlayerSkill` es una entidad separada con relación `ManyToOne` a `Player`. Cada registro representa los atributos de un jugador en una edición específica de FIFA, lo que permite tracking histórico.
- **Import CSV por streaming con lotes**: recibe archivos con formato sofifa y los procesa en streaming — Multer escribe a disco (`/tmp/uploads/`), PapaParse lee con `step` callback fila por fila, y cada ~200 filas se hace un batch upsert (players + skills). Esto evita cargar archivos de +90MB en RAM. Si un batch falla (ej. dato inválido), hace fallback a row-by-row para aislar el error sin perder el resto del archivo. Nginx y Express tienen `client_max_body_size: 100MB`.
- **Exportación a XLSX completa**: se exportan TODOS los jugadores filtrados, no solo la página visible. El frontend llama a `GET /players?export=true` que ignora la paginación y devuelve todos los resultados en un único response. La conversión a Excel se hace del lado cliente con la librería `xlsx`.
- **UI tipo FUT card**: el diseño de las fichas de jugador imita las cartas de FIFA Ultimate Team. Fue un **extra** que me interesó desarrollar y resultó un gran desafío del lado frontend — todo el estilo es CSS propio, sin librerías de componentes.
- **Autenticación JWT con roles**: RBAC simple (`admin` / `user`) usando Passport + JwtAuthGuard + RolesGuard.
- **Nginx como reverse proxy**: el frontend se sirve como SPA estático desde Nginx, y las rutas `/api/` se redirigen al backend. Esto evita CORS en producción al tener un solo origen, y evita exponer el dev server de Angular o Node.js directamente. Nginx es liviano y está pensado para servir archivos estáticos y rutas de proxy.

## Lo que queda pendiente

- **Comparativa visual entre versiones de FIFA**: seleccionar dos o más ediciones y ver la evolución de atributos de un jugador lado a lado (radar superpuesto o tabla comparativa). No se alcanzó a completar para todas las versiones de fifa aun que para algunos jugadores si quedo funcional.

## Agradecimientos

A **Xacademy** por brindar el espacio de aprendizaje y todo el marco teórico
que hizo posible este proyecto. Gracias por enseñar paso a paso y fomentar
el crecimiento constante en la comunidad.
