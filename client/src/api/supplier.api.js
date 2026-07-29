import { apiOwner } from './http';

// ─── Proveedores ──────────────────────────────────────────────────────────────

// Lista todos los proveedores de la organización. Se usa en ComprasPage
// para el selector de proveedor en la cabecera de la compra.
export const getSuppliers = () => apiOwner.get('/api/suppliers');

// Crea un nuevo proveedor. Se usa en ComprasPage en el alta rápida de proveedor
// sin salir de la pantalla de carga de compra.
export const createSupplier = (payload) => apiOwner.post('/api/suppliers', payload);
