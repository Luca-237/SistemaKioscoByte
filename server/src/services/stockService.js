
const { AppError } = require('../middlewares/error');

// Lógica de existencias por sucursal y costeo promedio ponderado.
// Se usa desde compras (suma) y ventas (resta); nunca desde los controllers.
class StockService {
    constructor(models) {
        this.models = models;
    }

    // Suma stock por una compra y recalcula el costo promedio ponderado.
    async addFromPurchase({ branchId, articleId, quantity, unitCost }, session) {
        const stock = await this.models.BranchStock.findOneAndUpdate(
            { branchId, articleId },
            { $setOnInsert: { quantity: 0, avgCost: 0 } },
            { new: true, upsert: true, session }
        );

        const qtyPrevia = Math.max(stock.quantity, 0); // stock negativo no pondera
        const nuevoAvg = (qtyPrevia * stock.avgCost + quantity * unitCost) / (qtyPrevia + quantity);

        stock.quantity += quantity;
        stock.avgCost = Math.round(nuevoAvg * 100) / 100;
        await stock.save({ session });
        return stock;
    }

    // Descuenta stock por una venta. Falla si no hay existencia suficiente.
    // Devuelve el costo promedio vigente (para snapshotearlo en la venta).
    async removeForSale({ branchId, articleId, quantity }, session) {
        const stock = await this.models.BranchStock.findOneAndUpdate(
            { branchId, articleId, quantity: { $gte: quantity } },
            { $inc: { quantity: -quantity } },
            { new: true, session }
        );
        if (!stock) {
            throw new AppError(409, 'Stock insuficiente para uno de los artículos', 'OUT_OF_STOCK');
        }
        return stock.avgCost;
    }
}

module.exports = StockService;
