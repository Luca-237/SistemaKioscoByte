const { operatorLogin } = require('../services/auth.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> auth.service. Sin lógica de negocio acá.

const operatorLoginHandler = async (req, res) => {
    try {
        const result = await operatorLogin(req.body);
        res.json({ success: true, ...result });
    } catch (error) {
        respondError(res, error, { context: 'auth.operatorLogin', inputs: req.body });
    }
};

module.exports = { operatorLogin: operatorLoginHandler };
