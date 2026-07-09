const express = require('express');
const StatsService = require('../../services/statsService');

const router = express.Router();

// Resumen contable (dashboard del propietario). Filtros: ?branchId&from&to
router.get('/summary', async (req, res, next) => {
    try {
        const data = await StatsService.summary(req.org._id, req.query);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

// Libro diario (últimos movimientos).
router.get('/movements', async (req, res, next) => {
    try {
        const data = await StatsService.movements(req.org._id, req.query);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

module.exports = router;
