import { apiOwner } from './http';

// ─── Notas ────────────────────────────────────────────────────────────────────

// Lista las notas y reportes enviados por los operarios. Acepta branchId
// opcional para filtrar por sucursal. Se usa en NotasPage.
export const getNotes = (params = {}) => apiOwner.get('/api/notes', { params });

// Actualiza el estado de una nota (pendiente → revisión → aprobada → cerrada).
// Se usa en NotasPage desde el select de estado de cada fila.
export const updateNoteStatus = (id, status) =>
    apiOwner.put(`/api/notes/${id}/status`, { status });
