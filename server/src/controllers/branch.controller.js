const { getAllBranches, createBranch, updateBranch, deactivateBranch } = require('../services/branch.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> branch.service. Sin lógica de negocio acá.

const getAll = async (req, res) => {
    try {
        const data = await getAllBranches(req.tenantModels);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'branches.getAll' });
    }
};

const create = async (req, res) => {
    try {
        const data = await createBranch(req.tenantModels, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'branches.create', inputs: req.body });
    }
};

const update = async (req, res) => {
    try {
        const data = await updateBranch(req.tenantModels, req.params.id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'branches.update', inputs: req.body });
    }
};

const deactivate = async (req, res) => {
    try {
        await deactivateBranch(req.tenantModels, req.params.id);
        res.json({ success: true, message: 'Sucursal dada de baja' });
    } catch (error) {
        respondError(res, error, { context: 'branches.deactivate' });
    }
};

module.exports = { getAll, create, update, deactivate };
