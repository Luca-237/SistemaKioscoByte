import { apiOwner } from './http';

// ─── Artículos ────────────────────────────────────────────────────────────────

// Trae todos los artículos del catálogo. Si se pasa branchId, incluye el stock
// de esa sucursal. Se usa en ArticulosPage y ComprasPage.
export const getArticulos = (params = {}) => apiOwner.get('/api/articles', { params });

// Crea un nuevo artículo en el catálogo. Se usa en ArticulosPage al enviar el
// formulario de alta.
export const createArticulo = (payload) => apiOwner.post('/api/articles', payload);

// Edita un artículo existente (nombre, precio, categoría, imagen, etc.).
// Se usa en ArticulosPage en el formulario de edición y en el modal de categorías
// para reasignar categoría.
export const updateArticulo = (id, payload) => apiOwner.put(`/api/articles/${id}`, payload);

// Da de baja (elimina) un artículo del catálogo. Se usa en ArticulosPage.
export const deleteArticulo = (id) => apiOwner.delete(`/api/articles/${id}`);

// Ajusta el stock de un artículo en una sucursal específica. Se usa en
// ArticulosPage en el campo de stock editable por fila.
export const updateStock = (id, branchId, quantity) =>
    apiOwner.patch(`/api/articles/${id}/stock`, { branchId, quantity });
