const { createSale, getCurrentSessionSales, getRecentSales, getDailyByBranch } = require('../services/sale.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> sale.service. Sin lógica de negocio acá.
// Todos los endpoints operan con el contexto del OPERARIO (req.operator).

const create = async (req, res) => {
    try {
        const data = await createSale(req.tenantModels, req.operator, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'sales.create', inputs: req.body });
    }
};

// Ventas de la caja actualmente abierta (para el resumen del turno).
const getCurrentSession = async (req, res) => {
    try {
        const data = await getCurrentSessionSales(req.tenantModels, req.operator);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'sales.getCurrentSession' });
    }
};

const getRecent = async (req, res) => {
    try {
        const data = await getDailyByBranch(req.tenantModels, req.params.branchId);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'sales.getRecent' });
    }
};

module.exports = { create, getCurrentSession, getRecent };
