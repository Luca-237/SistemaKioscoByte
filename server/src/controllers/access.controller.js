const { getAvailableAccessCodes, getOperatorsWithAccess, setOperatorAccess } = require('../services/access.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> access.service. Sin lógica de negocio acá.

const getCodes = (req, res) => {
    res.json({ success: true, data: getAvailableAccessCodes() });
};

const getOperators = async (req, res) => {
    try {
        const data = await getOperatorsWithAccess(req.tenantModels);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'access.getOperators' });
    }
};

const update = async (req, res) => {
    try {
        const { code, enabled } = req.body;
        const data = await setOperatorAccess(req.tenantModels, req.params.id, code, enabled);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'access.update', inputs: req.body });
    }
};

module.exports = { getCodes, getOperators, update };
