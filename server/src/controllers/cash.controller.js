const { getOpenCash, getLastClosedCash, openCash, closeCash } = require('../services/cash.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> cash.service. Sin lógica de negocio acá.
// Todos los endpoints operan con el contexto del OPERARIO (req.operator).

const getOpen = async (req, res) => {
    try {
        const data = await getOpenCash(req.tenantModels, req.operator.branchId);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'cash.getOpen' });
    }
};

const open = async (req, res) => {
    try {
        const data = await openCash(req.tenantModels, req.operator, req.body.openingAmount);
        res.status(201).json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'cash.open', inputs: req.body });
    }
};

const close = async (req, res) => {
    try {
        const data = await closeCash(req.tenantModels, req.operator, req.body);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'cash.close', inputs: req.body });
    }
};

const getLastClosed = async (req, res) => {
    try {
        const data = await getLastClosedCash(req.tenantModels, req.params.branchId);
        res.json({ success: true, data: data || {} });
    } catch (error) {
        respondError(res, error, { context: 'cash.getLastClosed' });
    }
};

module.exports = { getOpen, open, close, getLastClosed };
