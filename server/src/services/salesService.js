const mongoose = require('mongoose');
const { Sale, Article, CashSession, LedgerEntry, Counter } = require('../models');
const StockService = require('./stockService');
const { AppError } = require('../middlewares/error');

class SalesService {
    // Registra una venta completa en una transacción:
    // valida caja abierta → precios reales del catálogo → descuenta stock
    // (snapshot del costo promedio) → numera → asienta el ingreso en el libro.
    static async create(operator, { items, paymentMethod }) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new AppError(400, 'La venta debe incluir al menos un artículo');
        }

        const session = await mongoose.startSession();
        try {
            let venta;
            await session.withTransaction(async () => {
                const caja = await CashSession.findOne({
                    orgId: operator.orgId, branchId: operator.branchId, status: 'open'
                }).session(session);
                if (!caja) throw new AppError(409, 'No hay una caja abierta en esta sucursal', 'NO_OPEN_CASH');

                // Los precios salen SIEMPRE del catálogo, nunca del cliente.
                const ids = items.map(i => i.articleId);
                const articulos = await Article.find({
                    _id: { $in: ids }, orgId: operator.orgId, active: true
                }).session(session);
                const porId = new Map(articulos.map(a => [a._id.toString(), a]));

                const saleItems = [];
                let total = 0;
                for (const item of items) {
                    const art = porId.get(String(item.articleId));
                    if (!art) throw new AppError(400, 'Artículo inexistente en el catálogo');
                    const qty = Number(item.quantity);
                    if (!Number.isInteger(qty) || qty <= 0) throw new AppError(400, 'Cantidad inválida');

                    const costAtSale = await StockService.removeForSale({
                        orgId: operator.orgId, branchId: operator.branchId,
                        articleId: art._id, quantity: qty
                    }, session);

                    saleItems.push({
                        articleId: art._id, code: art.code, name: art.name,
                        quantity: qty, unitPrice: art.salePrice, costAtSale
                    });
                    total += art.salePrice * qty;
                }
                total = Math.round(total * 100) / 100;

                const number = await Counter.next(operator.orgId, 'sale', session);

                [venta] = await Sale.create([{
                    orgId: operator.orgId, branchId: operator.branchId,
                    cashSessionId: caja._id, operatorId: operator.userId,
                    number, items: saleItems, total, paymentMethod
                }], { session });

                await LedgerEntry.create([{
                    orgId: operator.orgId, branchId: operator.branchId,
                    type: 'ingreso', source: 'venta',
                    concept: `Venta #${number}`,
                    amount: total, paymentMethod, saleId: venta._id
                }], { session });
            });
            return venta;
        } finally {
            session.endSession();
        }
    }

    static async listBySession(operator, cashSessionId) {
        return Sale.find({
            orgId: operator.orgId, branchId: operator.branchId, cashSessionId
        }).sort({ createdAt: -1 });
    }
}

module.exports = SalesService;
