import { apiOwner } from './http';

// ─── Estadísticas ─────────────────────────────────────────────────────────────

// Historial de sesiones de caja (aperturas y cierres). Se usa en CajasPage.
export const getCashSessions = () => apiOwner.get('/api/stats/cash-sessions');

// Ventas registradas dentro de una sesión de caja específica. Se usa en
// CajasPage al abrir el modal de detalle de una caja.
export const getCashSessionSales = (sessionId) =>
    apiOwner.get(`/api/stats/cash-sessions/${sessionId}/sales`);

// Resumen contable: ingresos, egresos, saldo neto y margen bruto. Acepta
// branchId opcional. Lo usan ContabilidadPage, ResumenPage y VentaPage.
export const getSummary = (params = {}) => apiOwner.get('/api/stats/summary', { params });

// Últimos movimientos contables (libro diario). Acepta branchId opcional.
// Lo usan ContabilidadPage y ResumenPage.
export const getMovements = (params = {}) => apiOwner.get('/api/stats/movements', { params });

// Estadísticas analíticas: artículos más vendidos, historial de precios,
// ventas por operario, balance mensual y gastos por concepto. Acepta
// branchId opcional. Se usa en EstadisticasPage.
export const getAnalytics = (params = {}) => apiOwner.get('/api/stats/analytics', { params });
