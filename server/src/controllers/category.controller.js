const {
    getAllCategories, createCategory, updateCategory, toggleCategoryActive, deleteCategory
} = require('../services/category.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> category.service. Sin lógica de negocio acá.

const getAll = async (req, res) => {
    try {
        const data = await getAllCategories(req.tenantModels);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'categories.getAll' });
    }
};

const create = async (req, res) => {
    try {
        const data = await createCategory(req.tenantModels, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'categories.create', inputs: req.body });
    }
};

const update = async (req, res) => {
    try {
        const data = await updateCategory(req.tenantModels, req.params.id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'categories.update', inputs: req.body });
    }
};

const toggleActive = async (req, res) => {
    try {
        const data = await toggleCategoryActive(req.tenantModels, req.params.id, req.body.active);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'categories.toggleActive' });
    }
};

const remove = async (req, res) => {
    try {
        await deleteCategory(req.tenantModels, req.params.id);
        res.json({ success: true, message: 'Categoría eliminada' });
    } catch (error) {
        respondError(res, error, { context: 'categories.delete' });
    }
};

module.exports = { getAll, create, update, toggleActive, remove };
