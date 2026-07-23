const { createNote, getAllNotes, getNotesByOperator, updateNoteStatus } = require('../services/note.service');
const { respondError } = require('../utils/logger');

// Capa HTTP fina: traduce request <-> note.service. Sin lógica de negocio acá.

const getAll = async (req, res) => {
    try {
        const data = await getAllNotes(req.tenantModels, { branchId: req.query.branchId });
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'notes.getAll' });
    }
};

const getMine = async (req, res) => {
    try {
        const data = await getNotesByOperator(req.tenantModels, req.operator);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'notes.getMine' });
    }
};

const create = async (req, res) => {
    try {
        const data = await createNote(req.tenantModels, req.operator, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'notes.create', inputs: req.body });
    }
};

const updateStatus = async (req, res) => {
    try {
        const data = await updateNoteStatus(req.tenantModels, req.owner, req.params.id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        respondError(res, error, { context: 'notes.updateStatus', inputs: req.body });
    }
};

module.exports = { getAll, getMine, create, updateStatus };
