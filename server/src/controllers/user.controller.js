const { getAllUsers, createUser, updateUser } = require('../services/user.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> user.service. Sin lógica de negocio acá.

const getAll = async (req, res) => {
    try {
        const data = await getAllUsers(req.tenantModels);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'users.getAll' });
    }
};

const create = async (req, res) => {
    try {
        const data = await createUser(req.tenantModels, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'users.create', inputs: req.body });
    }
};

const update = async (req, res) => {
    try {
        const data = await updateUser(req.tenantModels, req.params.id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'users.update', inputs: req.body });
    }
};

module.exports = { getAll, create, update };
