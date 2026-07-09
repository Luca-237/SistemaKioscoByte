const express = require('express');
const PurchasesService = require('../../services/purchasesService');
const { PAYMENT_METHODS } = require('../../config/constants');

const router = express.Router();

router.get('/', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const compras = await new PurchasesService(req.tenantModels).list(req.org._id, { branchId: req.query.branchId });
        res.json({ success: true, data: compras });
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        if (!PAYMENT_METHODS.includes(req.body.paymentMethod)) {
            return res.status(400).json({ success: false, message: 'Método de pago inválido' });
        }
        const compra = await new PurchasesService(req.tenantModels).create(req.org, req.owner.clerkUserId, req.body);
        res.status(201).json({ success: true, data: compra });
    } catch (error) { next(error); }
});

module.exports = router;
