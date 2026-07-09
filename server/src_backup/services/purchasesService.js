const mongoose = require('mongoose');
const { Purchase, Article, LedgerEntry } = require('../models');
const StockService = require('./stockService');
const { AppError } = require('../middlewares/error');

class PurchasesService {
    // Registra una compra: suma stock en la sucursal destino, recalcula el
    // costo promedio ponderado de cada artículo y asienta el egreso.
    static async create(org, clerkUserId, { branchId, supplierName, notes, items, paymentMethod }) {
        if (!branchId) throw new AppError(400, 'Falta la sucursal destino (branchId)');
        if (!Array.isArray(items) || items.length === 0) {
            throw new AppError(400, 'La compra debe incluir al menos un artículo');
        }

        const session = await mongoose.startSession();
        try {
            let compra;
            await session.withTransaction(async () => {
                const ids = items.map(i => i.articleId);
                const articulos = await Article.find({ _id: { $in: ids }, orgId: org._id }).session(session);
                const porId = new Map(articulos.map(a => [a._id.toString(), a]));

                const purchaseItems = [];
                let total = 0;
                for (const item of items) {
                    const art = porId.get(String(item.articleId));
                    if (!art) throw new AppError(400, 'Artículo inexistente en el catálogo');
                    const qty = Number(item.quantity);
                    const unitCost = Number(item.unitCost);
                    if (!Number.isInteger(qty) || qty <= 0) throw new AppError(400, 'Cantidad inválida');
                    if (!Number.isFinite(unitCost) || unitCost < 0) throw new AppError(400, 'Costo inválido');

                    await StockService.addFromPurchase({
                        orgId: org._id, branchId, articleId: art._id, quantity: qty, unitCost
                    }, session);

                    purchaseItems.push({ articleId: art._id, name: art.name, quantity: qty, unitCost });
                    total += unitCost * qty;
                }
                total = Math.round(total * 100) / 100;

                [compra] = await Purchase.create([{
                    orgId: org._id, branchId, supplierName, notes,
                    items: purchaseItems, total, paymentMethod, createdBy: clerkUserId
                }], { session });

                await LedgerEntry.create([{
                    orgId: org._id, branchId,
                    type: 'egreso', source: 'compra',
                    concept: `Compra de mercadería${supplierName ? ` - ${supplierName}` : ''}`,
                    amount: total, paymentMethod, purchaseId: compra._id
                }], { session });
            });
            return compra;
        } finally {
            session.endSession();
        }
    }

    static async list(orgId, { branchId } = {}) {
        const filtro = { orgId };
        if (branchId) filtro.branchId = branchId;
        return Purchase.find(filtro).sort({ createdAt: -1 }).limit(200);
    }
}

module.exports = PurchasesService;
