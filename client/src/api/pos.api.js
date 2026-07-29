import { apiPos } from './http';

// ─── POS (fachada del operario) ───────────────────────────────────────────────

// Catálogo de artículos disponibles para el operario según su sucursal y stock.
// Se usa en PosPage para construir la grilla de productos.
export const getPosArticulos = () => apiPos.get('/api/pos/articles');

// Sesión de caja activa del operario. Devuelve null si no hay caja abierta.
// Se usa en PosPage para saber si mostrar "Abrir Caja" o "Cerrar Caja".
export const getPosCaja = () => apiPos.get('/api/pos/cash');

// Último cierre de caja de una sucursal. Se muestra en el modal de apertura
// para que el operario sepa el saldo esperado al arrancar. Se usa en PosPage.
export const getPosUltimoCierre = (branchId) =>
    apiPos.get(`/api/pos/cash/last-session/${branchId}`);

// Abre una nueva sesión de caja con el monto inicial contado.
// Se usa en PosPage al confirmar la apertura.
export const abrirCaja = (openingAmount) =>
    apiPos.post('/api/pos/cash/open', { openingAmount });

// Cierra la sesión de caja activa con el monto contado al final del turno.
// Devuelve el resumen con esperado, contado y diferencia. Se usa en PosPage.
export const cerrarCaja = (closingAmount) =>
    apiPos.post('/api/pos/cash/close', { closingAmount });

// Ventas del turno actual (sesión de caja abierta). Se usa en PosPage para
// mostrar el total vendido en el turno en el chip de la barra superior.
export const getPosVentas = () => apiPos.get('/api/pos/sales');

// Ventas recientes de una sucursal (historial). Se usa en PosPage al abrir
// el modal de historial de ventas.
export const getPosVentasRecientes = (branchId) =>
    apiPos.get(`/api/pos/sales/recent/${branchId}`);

// Registra una venta nueva con método de pago e ítems del carrito.
// Descuenta stock y genera el ticket. Se usa en PosPage al cobrar.
export const registrarVenta = (paymentMethod, items) =>
    apiPos.post('/api/pos/sales', { paymentMethod, items });

// Proveedores disponibles para el operario (para notas de tipo "compra").
// Se usa en PosPage en el formulario de notas.
export const getPosSuppliers = () => apiPos.get('/api/pos/suppliers');

// Envía una nota o reporte del operario al administrador. Puede ser un
// reporte libre o una compra con ítems y proveedor. Se usa en PosPage.
export const createPosNote = (payload) => apiPos.post('/api/pos/notes', payload);
