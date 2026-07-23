const {
    getAllArticles, getArticlesForBranch, createArticle, updateArticle, deactivateArticle
} = require('../services/article.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> article.service. Sin lógica de negocio acá.

const getAll = async (req, res) => {
    try {
        const data = await getAllArticles(req.tenantModels, req.query.branchId);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'articles.getAll' });
    }
};

// Catálogo con existencias de la sucursal del operario (grilla del punto de
// venta). No expone avgCost: el operario no debe ver el costo/margen.
const getForOperator = async (req, res) => {
    try {
        const data = await getArticlesForBranch(req.tenantModels, req.operator.branchId);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'articles.getForOperator' });
    }
};

const create = async (req, res) => {
    try {
        const data = await createArticle(req.tenantModels, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'articles.create', inputs: req.body });
    }
};

const update = async (req, res) => {
    try {
        const data = await updateArticle(req.tenantModels, req.params.id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'articles.update', inputs: req.body });
    }
};

const deactivate = async (req, res) => {
    try {
        await deactivateArticle(req.tenantModels, req.params.id);
        res.json({ success: true, message: 'Artículo dado de baja' });
    } catch (error) {
        respondError(res, error, { context: 'articles.deactivate' });
    }
};

module.exports = { getAll, getForOperator, create, update, deactivate };
