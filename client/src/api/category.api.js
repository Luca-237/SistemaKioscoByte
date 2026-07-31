import { apiOwner } from './http';

// ─── Categorías ───────────────────────────────────────────────────────────────

// Lista todas las categorías del tenant. Se usa en ArticulosPage y ComprasPage.
export const getCategories = () => apiOwner.get('/api/categories');

// Crea una nueva categoría. Se usa en el modal de gestión de categorías.
export const createCategory = (payload) => apiOwner.post('/api/categories', payload);

// Actualiza nombre y/o requiereVencimiento de una categoría.
export const updateCategory = (id, payload) => apiOwner.put(`/api/categories/${id}`, payload);

// Da de baja o reactivar una categoría (active: true/false).
export const toggleCategoryActive = (id, active) => apiOwner.patch(`/api/categories/${id}/active`, { active });

// Elimina una categoría (y quita la referencia de los artículos).
export const deleteCategory = (id) => apiOwner.delete(`/api/categories/${id}`);
