const { getSummary, getAnalytics, getMovements } = require('../services/stats.service');
const { listAllSessions, getSessionMovements, getSalesBySession } = require('../services/cash.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> stats.service. Sin lógica de negocio acá.

const getSummaryHandler = async (req, res) => {
    try {
        const data = await getSummary(req.tenantModels, req.query);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'stats.getSummary' });
    }
};

const getAnalyticsHandler = async (req, res) => {
    try {
        const data = await getAnalytics(req.tenantModels, req.query);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'stats.getAnalytics' });
    }
};

const getMovementsHandler = async (req, res) => {
    try {
        const data = await getMovements(req.tenantModels, req.query);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'stats.getMovements' });
    }
};

const getCashSessionsHandler = async (req, res) => {
    try {
        const data = await listAllSessions(req.tenantModels, req.query.branchId);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'stats.getCashSessions' });
    }
};

const getCashSessionMovementsHandler = async (req, res) => {
    try {
        const data = await getSessionMovements(req.tenantModels, req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'stats.getCashSessionMovements' });
    }
};

const getCashSessionSalesHandler = async (req, res) => {
    try {
        const data = await getSalesBySession(req.tenantModels, req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'stats.getCashSessionSales' });
    }
};

module.exports = { 
    getSummary: getSummaryHandler, 
    getAnalytics: getAnalyticsHandler, 
    getMovements: getMovementsHandler,
    getCashSessions: getCashSessionsHandler,
    getCashSessionMovements: getCashSessionMovementsHandler,
    getCashSessionSales: getCashSessionSalesHandler
};
