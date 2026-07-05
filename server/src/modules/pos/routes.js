const express = require('express');
const { Article, BranchStock } = require('../../models');
const CashService = require('../../services/cashService');
const SalesService = require('../../services/salesService');
const { PAYMENT_METHODS } = require('../../config/constants');

const router = express.Router();

// Todo este módulo opera con el contexto del OPERARIO (req.operator):
// su organización y su sucursal activa ya vienen en el token.

// Catálogo con existencias de MI sucursal (para la grilla del punto de venta).
router.get('/articles', async (req, res, next) => {
    try {
        const { orgId, branchId } = req.operator;
        const [articles, stocks] = await Promise.all([
            Article.find({ orgId, active: true }).sort({ name: 1 }).lean(),
            BranchStock.find({ orgId, branchId }).lean()
        ]);
        const porArticulo = new Map(stocks.map(s => [s.articleId.toString(), s.quantity]));
        for (const a of articles) a.stock = porArticulo.get(a._id.toString()) ?? 0;
        res.json({ success: true, data: articles });
    } catch (error) { next(error); }
});

// Estado de la caja de mi sucursal.
router.get('/cash', async (req, res, next) => {
    try {
        const caja = await CashService.getOpen(req.operator.orgId, req.operator.branchId);
        res.json({ success: true, data: caja });
    } catch (error) { next(error); }
});

router.post('/cash/open', async (req, res, next) => {
    try {
        const caja = await CashService.open(req.operator, req.body.openingAmount);
        res.status(201).json({ success: true, data: caja });
    } catch (error) { next(error); }
});

router.post('/cash/close', async (req, res, next) => {
    try {
        const caja = await CashService.close(req.operator, req.body);
        res.json({ success: true, data: caja });
    } catch (error) { next(error); }
});

// Registrar una venta (requiere caja abierta; descuenta stock).
router.post('/sales', async (req, res, next) => {
    try {
        if (!PAYMENT_METHODS.includes(req.body.paymentMethod)) {
            return res.status(400).json({ success: false, message: 'Método de pago inválido' });
        }
        const venta = await SalesService.create(req.operator, req.body);
        res.status(201).json({ success: true, data: venta });
    } catch (error) { next(error); }
});

// Ventas de la caja actual (para el resumen del turno).
router.get('/sales', async (req, res, next) => {
    try {
        const caja = await CashService.getOpen(req.operator.orgId, req.operator.branchId);
        if (!caja) return res.json({ success: true, data: [] });
        const ventas = await SalesService.listBySession(req.operator, caja._id);
        res.json({ success: true, data: ventas });
    } catch (error) { next(error); }
});

module.exports = router;
