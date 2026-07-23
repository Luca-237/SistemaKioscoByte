const { getMyOrganization, bootstrapOrganization } = require('../services/organization.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> organization.service. Sin lógica de negocio acá.
// Nota: la respuesta usa la clave "org" (no "data"), igual que antes de la
// reestructuración, porque el cliente ya consume ese contrato.

const getMine = async (req, res) => {
    try {
        const org = await getMyOrganization(req.tenantModels, req.org);
        res.json({ success: true, org });
    } catch (error) {
        respondError(res, error, { context: 'organizations.getMine' });
    }
};

const bootstrap = async (req, res) => {
    try {
        if (req.org) {
            return res.status(409).json({ success: false, message: 'Ya tienes una organización creada' });
        }
        const org = await bootstrapOrganization(req.owner.clerkUserId, req.body);
        res.status(201).json({ success: true, org });
    } catch (error) {
        respondError(res, error, { context: 'organizations.bootstrap', inputs: req.body });
    }
};

module.exports = { getMine, bootstrap };
