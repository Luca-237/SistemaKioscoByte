const express = require('express');
const NoteService = require('../../services/notesService');

const router = express.Router();

router.get('/', async (req, res, next) => {
    const { Note } = req.tenantModels || {};
    try {
        const data = await new NoteService(req.tenantModels).list({ branchId: req.query.branchId });
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

router.get('/mine', async (req, res, next) => {
    const { Note } = req.tenantModels || {};
    try {
        const data = await new NoteService(req.tenantModels).listByOperator(req.operator);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    const { Note } = req.tenantModels || {};
    try {
        const data = await new NoteService(req.tenantModels).create(req.operator, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
});

router.put('/:id/status', async (req, res, next) => {
    const { Note } = req.tenantModels || {};
    try {
        const data = await new NoteService(req.tenantModels).updateStatus(req.owner, req.params.id, req.body);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

module.exports = router;
