# Estructura del Proyecto: Sistema Kiosco Byte

Este documento detalla la función de cada archivo dentro del proyecto, organizado por sus respectivas carpetas. El proyecto está dividido principalmente en dos áreas: `client` (Frontend) y `server` (Backend).

---

## 📁 Directorio Raíz

Archivos de configuración y gestión del proyecto a nivel general.

- **`.gitignore`**: Define qué archivos y carpetas deben ser ignorados por Git (por ejemplo, `node_modules`, archivos compilados, variables de entorno).
- **`package.json`**: Contiene los metadatos del proyecto raíz, incluyendo los scripts de ejecución y posiblemente dependencias compartidas si utiliza un monorepo.
- **`package-lock.json`**: Asegura que las dependencias instaladas tengan versiones exactas y bloqueadas para evitar problemas de compatibilidad entre entornos.
- **`README.md`**: El documento principal de presentación del proyecto, donde generalmente se explican las instrucciones de instalación y uso.

---

## 📁 `client/` (Frontend)

Esta carpeta contiene todo el código de la interfaz de usuario, construida con React y Vite.

### Archivos de configuración del cliente
- **`.env.development`**: Variables de entorno utilizadas exclusivamente durante el desarrollo local del frontend (como la URL de la API local).
- **`.gitignore`**: Reglas de ignorado de Git específicas para el frontend.
- **`index.html`**: Archivo HTML principal donde Vite inyecta la aplicación de React.
- **`package.json`**: Dependencias (React, Axios, etc.) y scripts (dev, build) específicos del frontend.
- **`vite.config.js`**: Archivo de configuración principal para Vite, el empaquetador del frontend.

### 📂 `client/src/`
Código fuente principal de React.

- **`App.jsx`**: Componente raíz de la aplicación, generalmente encargado de proveer contextos globales y estructurar la UI de alto nivel.
- **`main.jsx`**: Punto de entrada de React. Se encarga de renderizar `App.jsx` en el DOM (`index.html`).

#### 📂 `client/src/api/`
- **`http.js`**: Cliente configurado para realizar peticiones HTTP (probablemente Axios o Fetch) hacia el backend, manejando la inyección de tokens y configuración de cabeceras.

#### 📂 `client/src/routes/`
- **`AppRouter.jsx`**: Configuración principal del enrutamiento de la aplicación (React Router), definiendo qué componente cargar según la URL.

#### 📂 `client/src/store/`
- **`operatorStore.js`**: Manejo de estado global para la sesión del operario o cajero (por ejemplo, usando Zustand, Redux o Context API).

#### 📂 `client/src/styles/`
- **`index.css`**: Hoja de estilos global de la aplicación.

#### 📂 `client/src/modules/`
Contiene las áreas funcionales de la aplicación, divididas por dominio.

**📂 `admin/` (Panel de Administración)**
- **`admin.css`**: Estilos específicos del panel de administración.
- **`AdminArea.jsx`**: Layout o estructura base del panel de administrador (sidebar, navbar).
- **`pages/`**: Vistas completas del administrador.
  - **`ArticulosPage.jsx`**: Gestión (CRUD) del catálogo de artículos o productos.
  - **`CajasPage.jsx`**: Control y auditoría de las sesiones de caja, aperturas y cierres.
  - **`ComprasPage.jsx`**: Registro y gestión de reposición de stock (compras a proveedores).
  - **`ContabilidadPage.jsx`**: Control de movimientos, ingresos y egresos (Libro Mayor).
  - **`EstadisticasPage.jsx`**: Reportes, gráficos y análisis del rendimiento del negocio.
  - **`NotasPage.jsx`**: Sistema de notas o recordatorios internos para la organización.
  - **`OperariosPage.jsx`**: Gestión de los empleados, cajeros o usuarios del sistema.
  - **`ResumenPage.jsx`**: Dashboard principal o vista de inicio para el administrador.
  - **`SucursalesPage.jsx`**: Administración de las distintas sucursales del negocio.
  - **`VentaPage.jsx`**: Historial y auditoría de ventas registradas.

**📂 `auth/` (Autenticación)**
- **`LoginOperario.jsx`**: Pantalla de inicio de sesión específica para los operarios o cajeros del sistema.

**📂 `pos/` (Punto de Venta - Point of Sale)**
- **`pos.css`**: Estilos específicos de la interfaz del punto de venta.
- **`PosPage.jsx`**: Pantalla de caja. Es la interfaz principal donde el operario registra las ventas de manera ágil.

---

## 📁 `server/` (Backend)

Contiene la API REST desarrollada en Node.js (probablemente con Express) que da soporte al frontend.

### Archivos de configuración del servidor
- **`.env`**: Archivo crítico que almacena variables de entorno secretas (credenciales de DB, claves JWT, puertos).
- **`fix_admin.js`**: Script de utilidad, probablemente utilizado para reparar, resetear o crear un usuario administrador por defecto desde la consola.
- **`package.json`**: Dependencias y scripts de inicio de Node.js del backend.

### 📂 `server/src/`
Código fuente principal del backend.

- **`index.js`**: Punto de entrada de la aplicación. Se conecta a la base de datos y pone a escuchar el servidor HTTP en un puerto específico.
- **`app.js`**: Inicializa la aplicación Express, configura los middlewares globales e importa las rutas.

#### 📂 `server/src/config/`
- **`constants.js`**: Variables, mensajes o configuraciones globales constantes.
- **`db.js`**: Lógica de conexión a la base de datos (probablemente Mongoose/MongoDB).
- **`tenantManager.js`**: Lógica para manejar esquemas multitenant (soporte para diferentes organizaciones o inquilinos en la misma base de datos).

#### 📂 `server/src/controllers/`
Reciben las peticiones HTTP (Req, Res), llaman a los servicios correspondientes y devuelven la respuesta al cliente.
- **`article.controller.js`**: Controla el catálogo de artículos.
- **`auth.controller.js`**: Maneja el login y la emisión de tokens.
- **`branch.controller.js`**: Maneja los datos de las sucursales.
- **`cash.controller.js`**: Maneja los registros y sesiones de caja.
- **`note.controller.js`**: Controla la creación y lectura de notas internas.
- **`organization.controller.js`**: Gestiona los datos de la organización/cliente principal.
- **`purchase.controller.js`**: Controla el registro de compras a proveedores.
- **`sale.controller.js`**: Maneja la creación y listado de ventas.
- **`stats.controller.js`**: Provee datos agrupados para gráficos y estadísticas.
- **`supplier.controller.js`**: Controla el directorio de proveedores.
- **`user.controller.js`**: Maneja el CRUD de operarios/usuarios.

#### 📂 `server/src/middlewares/`
Funciones que se ejecutan entre la recepción de la petición y el controlador, generalmente para seguridad.
- **`devAuth.js`**: Middleware para bypass de autenticación o reglas en entornos de desarrollo.
- **`error.js`**: Intercepta los errores en la aplicación y da un formato de respuesta estándar.
- **`operatorAuth.js`**: Verifica que el JWT pertenezca a un operario con permisos válidos.
- **`ownerAuth.js`**: Verifica que el JWT pertenezca al administrador o dueño de la organización.

#### 📂 `server/src/models/`
Definen la estructura (Esquemas) de las colecciones en la base de datos.
- **`article.js`**: Esquema de artículos/productos.
- **`branch.js`**: Esquema de las sucursales.
- **`branchStock.js`**: Esquema de inventario particular por sucursal.
- **`cashSession.js`**: Esquema de las sesiones de caja (apertura, cierres).
- **`counter.js`**: Para manejar IDs auto-incrementales u otros contadores globales.
- **`index.js`**: Exportador central de todos los modelos.
- **`ledgerEntry.js`**: Esquema para el libro mayor (asientos contables).
- **`note.js`**: Esquema para los recordatorios/notas.
- **`organization.js`**: Esquema del inquilino u organización administradora.
- **`purchase.js`**: Esquema de operaciones de compras/gastos.
- **`sale.js`**: Esquema de tickets/ventas.
- **`supplier.js`**: Esquema de los proveedores.
- **`user.js`**: Esquema de usuarios/operarios.

#### 📂 `server/src/routes/`
Definen las URLs (Endpoints) de la API y las asocian con sus respectivos middlewares y controladores.
- **`article.routes.js`, `auth.routes.js`, `branch.routes.js`, `note.routes.js`, `organization.routes.js`, `pos.routes.js`, `purchase.routes.js`, `stats.routes.js`, `supplier.routes.js`, `user.routes.js`**: Registran las rutas para cada entidad respectiva (ej. `GET /api/articles`).

#### 📂 `server/src/services/`
Contienen la **Lógica de Negocio**. Son llamados por los controladores y se comunican con los modelos. Esto permite abstraer la lógica del transporte HTTP.
- **`article.service.js`, `auth.service.js`, `branch.service.js`, `cash.service.js`, `note.service.js`, `organization.service.js`, `purchase.service.js`, `sale.service.js`, `stats.service.js`, `stock.service.js`, `supplier.service.js`, `user.service.js`**: Manejan la lógica pesada, validaciones e interacciones complejas con la base de datos de cada dominio.

#### 📂 `server/src/scripts/`
- **`seed.js` / `seedData.js`**: Scripts diseñados para poblar la base de datos con información inicial o de prueba.

#### 📂 `server/src/utils/`
- **`logger.js`**: Herramienta (como Winston o Pino) centralizada para registrar logs, errores de consola o en archivos.

---

## 📁 `docs/` (Documentación)

Archivos de referencia, especificaciones y guías del proyecto.

- **`arquitectura-backend-referencia.txt`**: Un manual o explicación técnica de las decisiones de diseño adoptadas para la arquitectura del backend.
- **`README.md`**: Probablemente una guía principal o un índice de la documentación presente en esta carpeta.
- **`reestructuracion-backend-2026-07-22.md`**: Documento de diseño o registro (log) que explica los cambios que se realizaron durante una reestructuración de código en esa fecha.
