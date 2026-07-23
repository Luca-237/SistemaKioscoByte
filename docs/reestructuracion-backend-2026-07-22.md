# Reestructuración del backend — 22/07/2026

## Resumen

Se reorganizó `server/src` para pasar de una estructura por **módulos de
dominio** (`modules/<recurso>/routes.js`, con rutas y lógica de negocio
mezcladas en el mismo archivo) a una estructura por **capas horizontales**:

```
routes/  →  controllers/  →  services/  →  models/
(endpoint)   (HTTP <-> lógica)  (negocio)    (schema Mongoose)
```

No cambió ninguna regla de negocio ni el contrato de la API: es una
reestructuración de código, no una reescritura funcional.

## Qué cambió concretamente

| Antes | Ahora |
|---|---|
| `modules/auth/routes.js` (router + lógica + acceso a modelos en un solo archivo) | `routes/auth.routes.js` (solo define el endpoint) + `controllers/auth.controller.js` (traduce HTTP ↔ service) + `services/auth.service.js` (lógica de negocio) |
| Ídem para `organizations`, `branches`, `users`, `articles`, `suppliers`, `purchases`, `pos`, `stats`, `notes` | `routes/*.routes.js` + `controllers/*.controller.js` en cada recurso |
| `services/salesService.js`, `stockService.js`, `cashService.js`, `purchasesService.js`, `statsService.js`, `notesService.js` (clases `class XService { constructor(models) {...} }`, nombre en camelCase) | `services/sale.service.js`, `stock.service.js`, `cash.service.js`, `purchase.service.js`, `stats.service.js`, `note.service.js` (funciones exportadas, nombre `<recurso>.service.js`) |
| `models/Article.js`, `User.js`, `Branch.js`, etc. (PascalCase) | `models/article.js`, `user.js`, `branch.js`, etc. (minúscula, singular) — el modelo Mongoose sigue registrándose en PascalCase (`mongoose.model('Article', ...)`), solo cambia el nombre del archivo |
| `middlewares/tenantAuth.js` (sin uso real; `app.js` ya autenticaba con `devAuth.js`/`operatorAuth.js`) | eliminado — código muerto |
| Manejo de errores repetido en cada handler | `utils/logger.js` con `respondError(res, error, { context, inputs })` centralizado |

En total: 10 módulos migrados a rutas + controllers, 6 servicios pasados de
clase a funciones, 11 modelos renombrados, y limpieza de un middleware sin uso.

## Por qué se hizo

La estructura por módulos (`modules/<recurso>/routes.js`) funcionaba para el
MVP inicial, pero mezclaba tres responsabilidades distintas en un solo
archivo: definición de rutas, traducción HTTP (parseo de `req`, códigos de
estado, forma de la respuesta) y lógica de negocio (validaciones, acceso a
modelos, transacciones). A medida que el proyecto creció (multi-tenant, caja,
compras, notas, estadísticas), esos archivos se volvieron largos y costaban
de navegar: para tocar solo la lógica de una venta había que revisar un
archivo que también manejaba parseo de query params y armado de respuestas.

## Mejoras para el desarrollo

- **Separación de responsabilidades clara**: un cambio de regla de negocio
  toca únicamente `services/`; un cambio de contrato HTTP (querystring,
  status code) toca únicamente `controllers/`; agregar un endpoint toca
  únicamente `routes/`. Se reduce el riesgo de romper algo al tocar un
  archivo que no correspondía.
- **Testeabilidad**: los `services/` ya no dependen de `req`/`res` ni son
  clases que exigen instanciar con `models` — son funciones puras respecto a
  HTTP, más fáciles de probar de forma aislada.
- **Consistencia y previsibilidad**: todo recurso nuevo sigue el mismo patrón
  de 3-4 archivos (`routes/x.routes.js`, `controllers/x.controller.js`,
  `services/x.service.js`, `models/x.js`), documentado en
  [`arquitectura-backend-referencia.txt`](./arquitectura-backend-referencia.txt).
  Reduce el tiempo de "¿dónde va esto?" al sumar features nuevas (o
  colaboradores nuevos al proyecto).
- **Manejo de errores centralizado**: `respondError` en `utils/logger.js`
  evita repetir el mismo `try/catch` con formato de respuesta distinto en
  cada controller, y deja un único lugar donde loguear/redactar datos
  sensibles.
- **Menos código muerto**: se eliminó `tenantAuth.js`, que ya no se usaba.

## Por qué se tomó esta decisión

Se optó por una arquitectura por capas (en vez de mantener la organización
por módulo de dominio) porque el proyecto es un backend CRUD-heavy con reglas
de negocio concentradas (stock, caja, ventas con transacciones) que se
benefician de tener la lógica aislada en un único lugar reutilizable, sin
acoplarla a Express. Es además el mismo patrón que ya se usaba como
referencia en otro proyecto propio (ver `arquitectura-backend-referencia.txt`,
documento de convenciones escrito previamente), así que adoptarlo acá suma
consistencia entre proyectos propios y reduce la curva de entrada al volver a
un código con el que ya se está familiarizado.

## Pendientes / notas

- La migración quedó completa: los 10 recursos (`auth`, `organizations`,
  `branches`, `users`, `articles`, `suppliers`, `purchases`, `pos`, `stats`,
  `notes`) tienen su trío `routes/controllers/services` en
  `server/src/{routes,controllers,services}`.
- `models/index.js` y `app.js` ya apuntan a los nuevos paths — no queda
  ninguna referencia a `modules/` en el código activo.
- Este documento y `arquitectura-backend-referencia.txt` quedan en `docs/`
  como referencia para futuras reestructuraciones o para nuevos
  colaboradores.
