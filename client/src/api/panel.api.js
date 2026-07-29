import { apiPos } from './http';

// ─── Panel del operario ───────────────────────────────────────────────────────

// Mapa de código de módulo → endpoint. El PanelOperario muestra los módulos
// que el backend le devuelve como permitidos y los carga por código dinámico.
const ENDPOINT_POR_CODIGO = {
    articles: '/api/articles',
    branches: '/api/branches',
    suppliers: '/api/suppliers',
    purchases: '/api/purchases',
    notes: '/api/notes',
    stats: '/api/stats/summary',
    users: '/api/users',
    access: '/api/access/operators'
};

// Carga la data cruda de un módulo del panel de operario. El código determina
// el endpoint; si el código no existe en el mapa lanza error controlado.
// Se usa en PanelOperario al seleccionar un ítem del sidebar.
export const getPanelModulo = (code) => {
    const endpoint = ENDPOINT_POR_CODIGO[code];
    if (!endpoint) return Promise.reject(new Error(`Módulo desconocido: ${code}`));
    return apiPos.get(endpoint);
};
