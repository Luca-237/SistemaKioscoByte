import axios from 'axios';

// ─── Cliente HTTP ───────────────────────────────────────────────────────────
//
// Este archivo es el punto central de comunicación entre el frontend y el
// backend. Todas las llamadas a la API pasan por acá.
//
// Hay DOS clientes axios porque conviven dos sistemas de autenticación:
//   - apiOwner → el propietario/admin, logueado con Clerk. El interceptor
//     le agrega el token de sesión de Clerk en cada request.
//   - apiPos   → el operario del punto de venta, logueado con usuario y
//     contraseña propios (sin Clerk). El interceptor le agrega el JWT que
//     se guarda en localStorage al loguear, y si el backend responde 401
//     (token vencido tras el turno de 12h) lo desloguea y manda a /login.
//
// Cómo usar una función desde un componente o hook:
//   import { getArticulos } from "@/api";
//   const { data } = await getArticulos();
//
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const apiOwner = axios.create({ baseURL: API_URL });

apiOwner.interceptors.request.use(async (config) => {
    const token = await window.Clerk?.session?.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const apiPos = axios.create({ baseURL: API_URL });

apiPos.interceptors.request.use((config) => {
    const token = localStorage.getItem('fs_operator_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

apiPos.interceptors.response.use(
    (res) => res,
    (error) => {
        // Token vencido (turno de 12h): volver al login de operario.
        if (error.response?.status === 401 && localStorage.getItem('fs_operator_token')) {
            localStorage.removeItem('fs_operator_token');
            localStorage.removeItem('fs_operator');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─── Auth ───────────────────────────────────────────────────────────────────

// Autenticación del operario: código de empresa + usuario + contraseña.
// Si el operario tiene varias sucursales devuelve { needsBranchSelection, branches };
// si tiene una sola, devuelve { token, operator } directamente.
// Se usa en pages/auth (pantalla de acceso de empleados).
export const loginOperario = (orgCode, username, password, branchId = undefined) =>
    apiPos.post('/api/auth/operator/login', { orgCode, username, password, branchId });

// ─── Organización ───────────────────────────────────────────────────────────

// Obtiene los datos de la organización del propietario autenticado.
// Si no existe (primer ingreso), devuelve un error 404 que dispara el flujo
// de onboarding. Se usa en pages/admin (vía useOrganizacion).
export const getOrganizacion = () => apiOwner.get('/api/organizations/me');

// Crea la organización del propietario en el primer ingreso (onboarding).
// Recibe nombre y CUIT opcional. Se usa en pages/admin (vía useOrganizacion)
// al enviar el formulario de bienvenida.
export const bootstrapOrganizacion = (name, taxId) =>
    apiOwner.post('/api/organizations/bootstrap', { name, taxId });

// ─── Sucursales ─────────────────────────────────────────────────────────────

// Trae todas las sucursales de la organización. La usan casi todas las
// páginas de admin (vía useArticulos, useCompras, useNotas, useResumen,
// useSucursales, useOperarios y useEstadisticas) para poblar selectores.
export const getBranches = () => apiOwner.get('/api/branches');

// Crea una nueva sucursal. Se usa en pages/admin/locales (vía useSucursales)
// al enviar el formulario.
export const createBranch = (payload) => apiOwner.post('/api/branches', payload);

// Edita una sucursal (nombre, dirección, teléfono).
// Se usa en pages/admin/locales (vía useSucursales).
export const updateBranch = (id, payload) => apiOwner.put(`/api/branches/${id}`, payload);

// Da de baja una sucursal. Los operarios asignados dejan de verla.
// Se usa en pages/admin/locales (vía useSucursales).
export const deleteBranch = (id) => apiOwner.delete(`/api/branches/${id}`);

// ─── Artículos ──────────────────────────────────────────────────────────────

// Trae todos los artículos del catálogo. Si se pasa branchId, incluye el
// stock de esa sucursal. Se usa en pages/admin/productos (vía useArticulos)
// y pages/admin/compras (vía useCompras).
export const getArticulos = (params = {}) => apiOwner.get('/api/articles', { params });

// Crea un nuevo artículo en el catálogo.
// Se usa en pages/admin/productos (vía useArticulos) al enviar el alta.
export const createArticulo = (payload) => apiOwner.post('/api/articles', payload);

// Edita un artículo existente (nombre, precio, categoría, imagen, etc.).
// Se usa en pages/admin/productos: en el formulario de edición (vía
// useArticulos) y también directo desde el modal de categorías para
// reasignar categoría.
export const updateArticulo = (id, payload) => apiOwner.put(`/api/articles/${id}`, payload);

// Da de baja (elimina) un artículo del catálogo.
// Se usa en pages/admin/productos (vía useArticulos).
export const deleteArticulo = (id) => apiOwner.delete(`/api/articles/${id}`);

// Ajusta el stock de un artículo en una sucursal específica.
// Se usa en pages/admin/productos (vía useArticulos), en el campo de stock
// editable por fila.
export const updateStock = (id, branchId, quantity) =>
    apiOwner.patch(`/api/articles/${id}/stock`, { branchId, quantity });

// ─── Categorías ─────────────────────────────────────────────────────────────

// Lista todas las categorías del tenant.
// Se usa en pages/admin/productos y pages/admin/compras (vía useArticulos
// y useCompras).
export const getCategories = () => apiOwner.get('/api/categories');

// Crea una nueva categoría.
// Se usa en pages/admin/productos, en el modal de gestión de categorías
// (CategoriasModal, vía useArticulos).
export const createCategory = (payload) => apiOwner.post('/api/categories', payload);

// Actualiza nombre y/o requiereVencimiento de una categoría.
// Se usa en pages/admin/productos (CategoriasModal, vía useArticulos).
export const updateCategory = (id, payload) => apiOwner.put(`/api/categories/${id}`, payload);

// Da de baja o reactiva una categoría (active: true/false).
// Se usa en pages/admin/productos (CategoriasModal, vía useArticulos).
export const toggleCategoryActive = (id, active) => apiOwner.patch(`/api/categories/${id}/active`, { active });

// Elimina una categoría (y quita la referencia de los artículos).
// Se usa en pages/admin/productos (CategoriasModal, vía useArticulos).
export const deleteCategory = (id) => apiOwner.delete(`/api/categories/${id}`);

// ─── Proveedores ────────────────────────────────────────────────────────────

// Lista todos los proveedores de la organización.
// Se usa en pages/admin/compras (vía useCompras) para el selector de
// proveedor en la cabecera de la compra.
export const getSuppliers = () => apiOwner.get('/api/suppliers');

// Crea un nuevo proveedor.
// Se usa en pages/admin/compras (vía useCompras) en el alta rápida de
// proveedor sin salir de la pantalla de carga de compra.
export const createSupplier = (payload) => apiOwner.post('/api/suppliers', payload);

// ─── Compras ────────────────────────────────────────────────────────────────

// Lista el historial de compras (ingreso de mercadería).
// Se usa en pages/admin/compras (vía useCompras) para el registro de
// compras anteriores.
export const getCompras = () => apiOwner.get('/api/purchases');

// Registra una nueva compra con cabecera (sucursal, proveedor, método de
// pago) e ítems (artículo, cantidad, costo unitario). Actualiza stock y
// calcula costo promedio ponderado.
// Se usa en pages/admin/compras (vía useCompras) al confirmar la carga.
export const createCompra = (payload) => apiOwner.post('/api/purchases', payload);

// ─── Notas ──────────────────────────────────────────────────────────────────

// Lista las notas y reportes enviados por los operarios. Acepta branchId
// opcional para filtrar por sucursal.
// Se usa en pages/admin/reportes (vía useNotas).
export const getNotes = (params = {}) => apiOwner.get('/api/notes', { params });

// Actualiza el estado de una nota (pendiente → revisión → aprobada → cerrada).
// Se usa en pages/admin/reportes (vía useNotas), desde el select de estado
// de cada fila.
export const updateNoteStatus = (id, status) =>
    apiOwner.put(`/api/notes/${id}/status`, { status });

// ─── Estadísticas ───────────────────────────────────────────────────────────

// Historial de sesiones de caja (aperturas y cierres).
// Se usa en pages/admin/historial-caja (vía useCajas).
export const getCashSessions = () => apiOwner.get('/api/stats/cash-sessions');

// Ventas registradas dentro de una sesión de caja específica.
// Se usa en pages/admin/historial-caja (vía useCajas), al abrir el modal
// de detalle de una caja.
export const getCashSessionSales = (sessionId) =>
    apiOwner.get(`/api/stats/cash-sessions/${sessionId}/sales`);

// Resumen contable: ingresos, egresos, saldo neto y margen bruto.
// Acepta branchId opcional.
// Se usa en pages/admin/ventas, pages/admin/finanzas y pages/admin/resumen
// (todas vía useResumen).
export const getSummary = (params = {}) => apiOwner.get('/api/stats/summary', { params });

// Últimos movimientos contables (libro diario). Acepta branchId opcional.
// Se usa en pages/admin/finanzas y pages/admin/resumen (vía useResumen).
export const getMovements = (params = {}) => apiOwner.get('/api/stats/movements', { params });

// Estadísticas analíticas: artículos más vendidos, historial de precios,
// ventas por operario, balance mensual y gastos por concepto. Acepta
// branchId opcional.
// Se usa en pages/admin/estadisticas (vía useEstadisticas).
export const getAnalytics = (params = {}) => apiOwner.get('/api/stats/analytics', { params });

// ─── Panel del operario ─────────────────────────────────────────────────────

// Mapa de código de módulo → endpoint. El panel del operario muestra los
// módulos que el backend le devuelve como permitidos y los carga por
// código dinámico.
const ENDPOINT_POR_CODIGO = {
    articles: '/api/articles',
    branches: '/api/branches',
    suppliers: '/api/suppliers',
    purchases: '/api/purchases',
    notes: '/api/notes',
    stats: '/api/stats/summary',
    users: '/api/users',
    access: '/api/access/operators',
};

// Carga la data cruda de un módulo del panel de operario. El código
// determina el endpoint; si el código no existe en el mapa lanza error
// controlado. Se usa en pages/operario/panel al seleccionar un ítem del
// sidebar.
export const getPanelModulo = (code) => {
    const endpoint = ENDPOINT_POR_CODIGO[code];
    if (!endpoint) return Promise.reject(new Error(`Módulo desconocido: ${code}`));
    return apiPos.get(endpoint);
};

// ─── POS (fachada del operario) ─────────────────────────────────────────────
// Todas estas funciones se usan en pages/operario/caja.

// Catálogo de artículos disponibles para el operario según su sucursal y stock.
export const getPosArticulos = () => apiPos.get('/api/pos/articles');

// Sesión de caja activa del operario. Devuelve null si no hay caja abierta.
export const getPosCaja = () => apiPos.get('/api/pos/cash');

// Último cierre de caja de una sucursal. Se muestra en el modal de apertura
// para que el operario sepa el saldo esperado al arrancar.
export const getPosUltimoCierre = (branchId) =>
    apiPos.get(`/api/pos/cash/last-session/${branchId}`);

// Abre una nueva sesión de caja con el monto inicial contado.
export const abrirCaja = (openingAmount) =>
    apiPos.post('/api/pos/cash/open', { openingAmount });

// Cierra la sesión de caja activa con el monto contado al final del turno.
// Devuelve el resumen con esperado, contado y diferencia.
export const cerrarCaja = (closingAmount) =>
    apiPos.post('/api/pos/cash/close', { closingAmount });

// Ventas del turno actual (sesión de caja abierta). Se muestra en el chip
// de la barra superior.
export const getPosVentas = () => apiPos.get('/api/pos/sales');

// Ventas recientes de una sucursal (historial). Se usa al abrir el modal
// de historial de ventas.
export const getPosVentasRecientes = (branchId) =>
    apiPos.get(`/api/pos/sales/recent/${branchId}`);

// Registra una venta nueva con método de pago e ítems del carrito.
// Descuenta stock y genera el ticket.
export const registrarVenta = (paymentMethod, items) =>
    apiPos.post('/api/pos/sales', { paymentMethod, items });

// Proveedores disponibles para el operario (para notas de tipo "compra").
export const getPosSuppliers = () => apiPos.get('/api/pos/suppliers');

// Envía una nota o reporte del operario al administrador. Puede ser un
// reporte libre o una compra con ítems y proveedor.
export const createPosNote = (payload) => apiPos.post('/api/pos/notes', payload);

// ─── Accesos ────────────────────────────────────────────────────────────────

// Lista todos los operarios con sus permisos actuales.
// Se usa en pages/admin/accesos (vía useAccesos) para la tabla de
// checkboxes de acceso por módulo.
export const getOperadoresAcceso = () => apiOwner.get('/api/access/operators');

// Lista los códigos de módulo disponibles (ej: "articles", "branches", etc.).
// Se usa en pages/admin/accesos (vía useAccesos) para armar las columnas.
export const getCodigosAcceso = () => apiOwner.get('/api/access/codes');

// Versión para el operario logueado (POS): obtiene los códigos de acceso
// disponibles sin requerir token de owner.
// Se usa en pages/operario/panel para saber qué ítems mostrar en el sidebar.
export const getCodigosAccesoPos = () => apiPos.get('/api/access/codes');

// Activa o desactiva un permiso de módulo para un operario específico.
// Se usa en pages/admin/accesos (vía useAccesos) al marcar/desmarcar un
// checkbox de la tabla.
export const toggleAcceso = (userId, code, enabled) =>
    apiOwner.patch(`/api/access/operators/${userId}`, { code, enabled });

// ─── Operarios (usuarios) ───────────────────────────────────────────────────

// Lista todos los operarios de la organización con sus sucursales asignadas.
// Se usa en pages/admin/empleados (vía useOperarios).
export const getUsers = () => apiOwner.get('/api/users');

// Crea un nuevo operario (nombre, usuario, contraseña, sucursales iniciales).
// Se usa en pages/admin/empleados (vía useOperarios) al enviar el alta.
export const createUser = (payload) => apiOwner.post('/api/users', payload);

// Actualización genérica de un operario. Se usa en pages/admin/empleados
// (vía useOperarios) para tres operaciones distintas según el payload:
//   • { branchIds }    → reasignar sucursales
//   • { active }       → activar o desactivar el operario
//   • { newPassword }  → resetear la contraseña
export const updateUser = (id, payload) => apiOwner.put(`/api/users/${id}`, payload);
