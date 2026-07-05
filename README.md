# FitoShop

SaaS de gestión para comercios (kioscos y similares): **ventas con caja, stock multi-sucursal, compras y contabilidad**. Una sola base de datos para todos los clientes, aislados por organización.

## Modelo de negocio

- El **propietario** inicia sesión con **Clerk**, crea su empresa (organización), sus **sucursales** y sus **operarios** (módulo usuarios).
- Cada **operario** loguea SIN Clerk (código de empresa + usuario + clave, JWT propio). Si tiene una sola sucursal asignada entra directo; si tiene varias, elige con cuál operar.
- El operario **abre la caja** de su sucursal y registra **ventas con baja de stock** (módulo facturación — tickets internos con modelo AFIP-ready).
- El **stock** es por sucursal: catálogo de artículos con código, código de barras y precio de venta a nivel empresa; existencias y costo por sucursal.
- Los **precios de compra** entran por el módulo **compras**, que suma stock y recalcula el **costo promedio ponderado** — la base de las estadísticas del módulo contabilización.

## Stack

| Capa | Tecnología |
|---|---|
| Base de datos | MongoDB Atlas (Mongoose) — multi-tenant por `orgId` |
| Backend | Node.js + Express 5 (JS), rutas → services → models |
| Frontend | React 19 + Vite + Zustand + React Router 7 |
| Auth propietario | Clerk |
| Auth operario | JWT propio (bcrypt + jsonwebtoken) |

## Estructura

```
FitoShop/
├── server/
│   └── src/
│       ├── app.js / index.js     Express + montaje de rutas
│       ├── config/               db (Atlas o memoria en dev), constantes
│       ├── middlewares/          ownerAuth (Clerk), operatorAuth (JWT), errores
│       ├── models/               Organization, Branch, User, Article,
│       │                         BranchStock, CashSession, Sale, Purchase,
│       │                         LedgerEntry, Counter
│       ├── services/             stock (PPP), sales, cash, purchases, stats
│       ├── modules/<dominio>/    rutas por módulo (auth, organizations,
│       │                         branches, users, articles, purchases, pos, stats)
│       └── scripts/              seed demo
└── client/
    └── src/
        ├── api/http.js           axios: apiPos (JWT operario) + apiOwner (Clerk)
        ├── store/                sesión de operario (Zustand)
        ├── routes/               router + guards
        └── modules/
            ├── auth/             login de operario (con selector de sucursal)
            ├── pos/              punto de venta (caja, carrito, cobro)
            └── admin/            panel del dueño (resumen, sucursales,
                                  operarios, artículos, compras)
```

## Puesta en marcha

```bash
npm install                # instala server y client (workspaces)

# Server (puerto 4000)
cp server/.env.example server/.env    # completar (ver abajo)
npm run dev:server

# Client (puerto 5174)
npm run dev:client
```

### Modo demo sin configurar nada

Si `MONGODB_URI` está vacío, el server levanta un **MongoDB en memoria** con datos demo:

- Empresa: código **DEMO01**
- Operarios: **juan / 1234** (Sucursal Centro) y **maria / 1234** (elige entre Centro y Norte)
- 4 artículos con stock cargado por una compra inicial

> Los datos en memoria se pierden al apagar el server. En esta máquina de dev el
> binario usado es MongoDB 4.4 (el CPU no tiene AVX); `server/.devlibs/` contiene
> las libs OpenSSL 1.1 que ese binario necesita — no se commitea.

### Conectar servicios reales

1. **MongoDB Atlas**: crear cluster M0 → pegar la URI en `server/.env` → `MONGODB_URI`. Correr `npm run seed` si se quieren los datos demo.
2. **Clerk**: crear app en clerk.com →
   - Publishable Key → `client/.env.development` → `VITE_CLERK_PUBLISHABLE_KEY`
   - Secret Key → `server/.env` → `CLERK_SECRET_KEY`

Sin Clerk configurado, el POS de operarios funciona igual; el panel `/admin` muestra las instrucciones de setup.

## API (resumen)

| Prefijo | Auth | Contenido |
|---|---|---|
| `POST /api/auth/operator/login` | pública | login operario (código empresa + usuario + clave, con selección de sucursal) |
| `/api/organizations` | Clerk | `GET /me`, `POST /bootstrap` (onboarding) |
| `/api/branches` | Clerk | CRUD de sucursales |
| `/api/users` | Clerk | CRUD de operarios + asignación de sucursales + reset de clave |
| `/api/articles` | Clerk | CRUD de catálogo (+ stock por sucursal con `?branchId`) |
| `/api/purchases` | Clerk | registrar/listar compras (actualiza stock y costo promedio) |
| `/api/stats` | Clerk | `GET /summary` (balance + margen bruto), `GET /movements` (libro diario) |
| `/api/pos/*` | JWT operario | catálogo con stock, caja (abrir/cerrar), ventas |

Reglas de negocio clave:
- **Una caja abierta por sucursal** (índice único parcial).
- **Los precios de venta los pone el servidor** (el cliente solo manda artículo + cantidad).
- Cada ítem vendido guarda `costAtSale` (costo promedio al momento de la venta) → el margen es exacto aunque los costos cambien.
- El cierre de caja calcula esperado (apertura + ventas en efectivo) y asienta el sobrante/faltante en el libro diario.
- Venta y compra son **transacciones**: o se aplica todo (stock + venta + asiento) o nada.
