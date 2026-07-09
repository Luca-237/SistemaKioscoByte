const express = require('express');


const router = express.Router();

// Catálogo del propietario. ?branchId=... agrega existencias de esa sucursal.
router.get('/', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const articles = await Article.find({ active: true }).sort({ name: 1 }).lean();

        if (req.query.branchId) {
            const stocks = await BranchStock.find({
                branchId: req.query.branchId
            }).lean();
            const porArticulo = new Map(stocks.map(s => [s.articleId.toString(), s]));
            for (const a of articles) {
                const s = porArticulo.get(a._id.toString());
                a.stock = s?.quantity ?? 0;
                a.avgCost = s?.avgCost ?? 0;
            }
        }
        res.json({ success: true, data: articles });
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const { code, barcode, name, description, category, unit, salePrice } = req.body;
        if (!code || !name || salePrice === undefined) {
            return res.status(400).json({ success: false, message: 'Faltan código, nombre o precio de venta' });
        }
        if (!Number.isFinite(Number(salePrice)) || Number(salePrice) < 0) {
            return res.status(400).json({ success: false, message: 'Precio de venta inválido' });
        }
        const article = await Article.create({
            code: String(code).trim(), barcode, name: name.trim(),
            description, category, unit, salePrice: Number(salePrice)
        });
        res.status(201).json({ success: true, data: article });
    } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const { code, barcode, name, description, category, unit, salePrice, active } = req.body;
        const article = await Article.findOneAndUpdate(
            { _id: req.params.id},
            { code, barcode, name, description, category, unit, salePrice, active },
            { new: true, runValidators: true }
        );
        if (!article) return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
        res.json({ success: true, data: article });
    } catch (error) { next(error); }
});

// Baja lógica: el artículo sale del catálogo pero las ventas históricas quedan.
router.delete('/:id', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const article = await Article.findOneAndUpdate(
            { _id: req.params.id},
            { active: false },
            { new: true }
        );
        if (!article) return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
        res.json({ success: true, message: 'Artículo dado de baja' });
    } catch (error) { next(error); }
});

module.exports = router;
