import { apiOwner } from './http';

// ─── Compras ──────────────────────────────────────────────────────────────────

// Lista el historial de compras (ingreso de mercadería). Se usa en ComprasPage
// para mostrar el registro de compras anteriores.
export const getCompras = () => apiOwner.get('/api/purchases');

// Registra una nueva compra con cabecera (sucursal, proveedor, método de pago)
// e ítems (artículo, cantidad, costo unitario). Actualiza stock y calcula
// costo promedio ponderado. Se usa en ComprasPage al confirmar la carga.
export const createCompra = (payload) => apiOwner.post('/api/purchases', payload);
