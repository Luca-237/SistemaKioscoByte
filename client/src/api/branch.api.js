import { apiOwner } from './http';

// ─── Sucursales ───────────────────────────────────────────────────────────────

// Trae todas las sucursales de la organización. Se usa en ArticulosPage,
// ComprasPage, EstadisticasPage, NotasPage, OperariosPage, ResumenPage y
// SucursalesPage.
export const getBranches = () => apiOwner.get('/api/branches');

// Crea una nueva sucursal. Se usa en SucursalesPage al enviar el formulario.
export const createBranch = (payload) => apiOwner.post('/api/branches', payload);

// Edita una sucursal (nombre, dirección, teléfono). Se usa en SucursalesPage.
export const updateBranch = (id, payload) => apiOwner.put(`/api/branches/${id}`, payload);

// Da de baja una sucursal. Los operarios asignados dejan de verla.
// Se usa en SucursalesPage.
export const deleteBranch = (id) => apiOwner.delete(`/api/branches/${id}`);
