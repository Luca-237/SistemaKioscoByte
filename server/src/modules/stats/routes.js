const express = require('express');
const StatsService = require('../../services/statsService');

const router = express.Router();

// Resumen contable (dashboard del propietario). Filtros: ?branchId&from&to
router.get('/summary', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const data = await new StatsService(req.tenantModels).summary(req.query);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

// Libro diario (últimos movimientos).
router.get('/movements', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const data = await new StatsService(req.tenantModels).movements(req.query);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

module.exports = router;
