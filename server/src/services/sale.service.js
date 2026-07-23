const { removeStockForSale } = require('./stock.service');
const { getOpenCash } = require('./cash.service');
const { AppError } = require('../middlewares/error');
const { PAYMENT_METHODS } = require('../config/constants');

// Ventas registradas por un operario dentro de una caja abierta.

// ==========================================
// CREACIÓN
// ==========================================

/**
 * Registra una venta completa en una transacción: valida caja abierta →
 * precios reales del catálogo → descuenta stock (snapshot del costo
 * promedio) → numera → asienta el ingreso en el libro diario.
 * @param {Object} models Modelos del tenant.
 * @param {Object} operator Operario autenticado: { branchId, userId }.
 * @param {Object} data Datos de la venta: { items, paymentMethod }.
 * @returns {Promise<Object>} La venta creada.
 * @throws {Error} 400 si el método de pago o los ítems son inválidos;
 *                 409 si no hay caja abierta o falta stock.
 */
const createSale = async (models, operator, { items, paymentMethod }) => {
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
        throw new AppError(400, 'Método de pago inválido');
    }
    if (!Array.isArray(items) || items.length === 0) {
        throw new AppError(400, 'La venta debe incluir al menos un artículo');
    }

    // La sesión debe crearse en la conexión del tenant, no en la conexión
    // por defecto de mongoose, para que las transacciones impacten la BD correcta.
    const session = await models.Sale.db.startSession();
    try {
        let venta;
        await session.withTransaction(async () => {
            const caja = await models.CashSession.findOne({
                branchId: operator.branchId, status: 'open'
            }).session(session);
            if (!caja) throw new AppError(409, 'No hay una caja abierta en esta sucursal', 'NO_OPEN_CASH');

            // Los precios salen SIEMPRE del catálogo, nunca del cliente.
            const ids = items.map(i => i.articleId);
            const articulos = await models.Article.find({
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

                const costAtSale = await removeStockForSale(models, {
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

            const number = await models.Counter.next('sale', session);

            [venta] = await models.Sale.create([{
                branchId: operator.branchId,
                cashSessionId: caja._id, operatorId: operator.userId,
                number, items: saleItems, total, paymentMethod
            }], { session });

            await models.LedgerEntry.create([{
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
};

// ==========================================
// LECTURA
// ==========================================

/**
 * Lista las ventas de una sesión de caja puntual.
 * @param {Object} models Modelos del tenant.
 * @param {Object} operator Operario autenticado: { branchId }.
 * @param {string} cashSessionId
 * @returns {Promise<Array>} Ventas de la sesión, ordenadas por fecha descendente.
 */
const listSalesBySession = async (models, operator, cashSessionId) => {
    return models.Sale.find({
        branchId: operator.branchId, cashSessionId
    }).sort({ createdAt: -1 });
};

/**
 * Lista las ventas de la caja actualmente abierta en la sucursal del
 * operario. Si no hay caja abierta, devuelve una lista vacía (no es un error).
 * @param {Object} models Modelos del tenant.
 * @param {Object} operator Operario autenticado: { branchId }.
 * @returns {Promise<Array>} Ventas del turno actual, o [] si no hay caja abierta.
 */
const getCurrentSessionSales = async (models, operator) => {
    const caja = await getOpenCash(models, operator.branchId);
    if (!caja) return [];
    return listSalesBySession(models, operator, caja._id);
};

/**
 * Lista las ventas recientes de una sucursal (para reportes/estadísticas).
 * @param {Object} models Modelos del tenant.
 * @param {string} branchId
 * @param {number} [limit=30]
 * @returns {Promise<Array>} Ventas recientes, con el nombre del operario populado.
 */
const getRecentSales = async (models, branchId, limit = 30) => {
    return models.Sale.find({ branchId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('operatorId', 'name');
};

module.exports = { createSale, listSalesBySession, getCurrentSessionSales, getRecentSales };
