const mongoose = require('mongoose');

const StockService = require('./stockService');
const { AppError } = require('../middlewares/error');

class SalesService {
    constructor(models) {
        this.models = models;
    }

    // Registra una venta completa en una transacción:
    // valida caja abierta → precios reales del catálogo → descuenta stock
    // (snapshot del costo promedio) → numera → asienta el ingreso en el libro.
    async create(operator, { items, paymentMethod }) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new AppError(400, 'La venta debe incluir al menos un artículo');
        }

        const session = await mongoose.startSession();
        try {
            let venta;
            await session.withTransaction(async () => {
                const caja = await this.models.CashSession.findOne({
                    branchId: operator.branchId, status: 'open'
                }).session(session);
                if (!caja) throw new AppError(409, 'No hay una caja abierta en esta sucursal', 'NO_OPEN_CASH');

                // Los precios salen SIEMPRE del catálogo, nunca del cliente.
                const ids = items.map(i => i.articleId);
                const articulos = await this.models.Article.find({
                    _id: { $in: ids }, active: true
                }).session(session);
                const porId = new Map(articulos.map(a => [a._id.toString(), a]));

                const saleItems = [];
                let total = 0;
                for (const item of items) {
                    const art = porId.get(String(item.articleId));
                    if (!art) throw new AppError(400, 'Artículo inexistente en el catálogo');
                    const qty = Number(item.quantity);
                    if (!Number.isInteger(qty) || qty <= 0) throw new AppError(400, 'Cantidad inválida');

                    const costAtSale = await new StockService(this.models).removeForSale({
                        branchId: operator.branchId,
                        articleId: art._id, quantity: qty
                    }, session);

                    saleItems.push({
                        articleId: art._id, code: art.code, name: art.name,
                        quantity: qty, unitPrice: art.salePrice, costAtSale
                    });
                    total += art.salePrice * qty;
                }
                total = Math.round(total * 100) / 100;

                const number = await this.models.Counter.next('sale', session);

                [venta] = await this.models.Sale.create([{
                    branchId: operator.branchId,
                    cashSessionId: caja._id, operatorId: operator.userId,
                    number, items: saleItems, total, paymentMethod
                }], { session });

                await this.models.LedgerEntry.create([{
                    branchId: operator.branchId,
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

    async listBySession(operator, cashSessionId) {
        return this.models.Sale.find({
            branchId: operator.branchId, cashSessionId
        }).sort({ createdAt: -1 });
    }
}

module.exports = SalesService;
