const { createPurchase, getAllPurchases } = require('../services/purchase.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> purchase.service. Sin lógica de negocio acá.

const getAll = async (req, res) => {
    try {
        const data = await getAllPurchases(req.tenantModels, { branchId: req.query.branchId });
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'purchases.getAll' });
    }
};

const create = async (req, res) => {
    try {
        // La ruta admite dueño u operario con acceso (hybridAuth): el
        // identificador de quien registra la compra sale de cualquiera de los dos.
        const createdBy = req.owner ? req.owner.clerkUserId : req.operator.userId;
        const data = await createPurchase(req.tenantModels, createdBy, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'purchases.create', inputs: req.body });
    }
};

module.exports = { getAll, create };
