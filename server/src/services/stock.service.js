const { AppError } = require('../middlewares/error');

// Lógica de existencias por sucursal y costeo promedio ponderado.
// Se usa desde compras (suma) y ventas (resta); nunca desde los controllers.

// ==========================================
// COMPRAS (SUMA)
// ==========================================

/**
 * Suma stock por una compra y recalcula el costo promedio ponderado.
 * @param {Object} models Modelos del tenant.
 * @param {Object} data { branchId, articleId, quantity, unitCost }
 * @param {import('mongoose').ClientSession} session Sesión de la transacción.
 * @returns {Promise<Object>} El BranchStock actualizado.
 */
const addStockFromPurchase = async (models, { branchId, articleId, quantity, unitCost }, session) => {
    const stock = await models.BranchStock.findOneAndUpdate(
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
};

// ==========================================
// VENTAS (RESTA)
// ==========================================

/**
 * Descuenta stock por una venta. Falla si no hay existencia suficiente.
 * @param {Object} models Modelos del tenant.
 * @param {Object} data { branchId, articleId, quantity }
 * @param {import('mongoose').ClientSession} session Sesión de la transacción.
 * @returns {Promise<number>} El costo promedio vigente (para snapshotearlo en la venta).
 * @throws {Error} 409 si no hay stock suficiente.
 */
const removeStockForSale = async (models, { branchId, articleId, quantity }, session) => {
    const stock = await models.BranchStock.findOneAndUpdate(
        { branchId, articleId, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true, session }
    );
    if (!stock) {
        throw new AppError(409, 'Stock insuficiente para uno de los artículos', 'OUT_OF_STOCK');
    }
    return stock.avgCost;
};

module.exports = { addStockFromPurchase, removeStockForSale };
