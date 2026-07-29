import { apiOwner, apiPos } from './http';

// ─── Accesos ──────────────────────────────────────────────────────────────────

// Lista todos los operarios con sus permisos actuales. Se usa en AccesosPage
// para mostrar la tabla de checkboxes de acceso por módulo.
export const getOperadoresAcceso = () => apiOwner.get('/api/access/operators');

// Lista los códigos de módulo disponibles (ej: "articles", "branches", etc.).
// La usa AccesosPage para armar las columnas, y PanelOperario (vía apiPos)
// para saber qué ítems mostrar en el sidebar del operario.
export const getCodigosAcceso = () => apiOwner.get('/api/access/codes');

// Versión para el operario logueado (POS): obtiene los códigos de acceso
// disponibles sin requerir token de owner. La usa PanelOperario.
export const getCodigosAccesoPos = () => apiPos.get('/api/access/codes');

// Activa o desactiva un permiso de módulo para un operario específico.
// Se usa en AccesosPage al marcar/desmarcar un checkbox de la tabla.
export const toggleAcceso = (userId, code, enabled) =>
    apiOwner.patch(`/api/access/operators/${userId}`, { code, enabled });
