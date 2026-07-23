const { getAllSuppliers, createSupplier, updateSupplier, deactivateSupplier } = require('../services/supplier.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> supplier.service. Sin lógica de negocio acá.

const getAll = async (req, res) => {
    try {
        const data = await getAllSuppliers(req.tenantModels);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'suppliers.getAll' });
    }
};

const create = async (req, res) => {
    try {
        const data = await createSupplier(req.tenantModels, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'suppliers.create', inputs: req.body });
    }
};

const update = async (req, res) => {
    try {
        const data = await updateSupplier(req.tenantModels, req.params.id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'suppliers.update', inputs: req.body });
    }
};

const deactivate = async (req, res) => {
    try {
        await deactivateSupplier(req.tenantModels, req.params.id);
        res.json({ success: true, message: 'Proveedor dado de baja' });
    } catch (error) {
        respondError(res, error, { context: 'suppliers.deactivate' });
    }
};

module.exports = { getAll, create, update, deactivate };
