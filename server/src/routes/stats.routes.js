const express = require('express');
const { getSummary, getAnalytics, getMovements, getCashSessions, getCashSessionMovements, getCashSessionSales } = require('../controllers/stats.controller');

const router = express.Router();

// La autenticación (ownerAuth + requireOrg) se aplica al montar este router
// en app.js, porque es la misma para todo el módulo.

// Resumen contable (dashboard del propietario). Filtros: ?branchId&from&to
router.get('/summary', getSummary);
// Análisis completo para el panel de estadísticas del propietario.
router.get('/analytics', getAnalytics);
// Libro diario (últimos movimientos).
router.get('/movements', getMovements);

// Historial de cajas
router.get('/cash-sessions', getCashSessions);
router.get('/cash-sessions/:id/movements', getCashSessionMovements);
router.get('/cash-sessions/:id/sales', getCashSessionSales);

module.exports = router;
