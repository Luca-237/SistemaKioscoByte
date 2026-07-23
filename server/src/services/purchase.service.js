const { addStockFromPurchase } = require('./stock.service');
const { AppError } = require('../middlewares/error');
const { PAYMENT_METHODS } = require('../config/constants');

// Compras de mercadería que registra el propietario.

// ==========================================
// CREACIÓN
// ==========================================

/**
 * Registra una compra: suma stock en la sucursal destino, recalcula el
 * costo promedio ponderado de cada artículo y asienta el egreso en el
 * libro diario. Todo dentro de una transacción (o entra todo, o nada).
 * @param {Object} models Modelos del tenant.
 * @param {string} clerkUserId ID del propietario que registra la compra.
 * @param {Object} data Datos de la compra: { branchId, supplierId, supplierName, notes, items, paymentMethod }.
 * @returns {Promise<Object>} La compra creada.
 * @throws {Error} 400 si faltan datos, el método de pago es inválido, el
 *                 proveedor no existe, o algún artículo/cantidad/costo es inválido.
 */
const createPurchase = async (models, clerkUserId, { branchId, supplierId, supplierName, notes, items, paymentMethod }) => {
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
        throw new AppError(400, 'Método de pago inválido');
    }
    if (!branchId) throw new AppError(400, 'Falta la sucursal destino (branchId)');
    if (!Array.isArray(items) || items.length === 0) {
        throw new AppError(400, 'La compra debe incluir al menos un artículo');
    }

    // Si viene supplierId, el nombre se toma del proveedor registrado.
    if (supplierId) {
        const proveedor = await models.Supplier.findById(supplierId);
        if (!proveedor) throw new AppError(400, 'Proveedor inexistente');
        supplierName = proveedor.name;
    }

    // La sesión debe crearse en la conexión del tenant, no en la conexión
    // por defecto de mongoose, para que las transacciones impacten la BD correcta.
    const session = await models.Purchase.db.startSession();
    try {
        let compra;
        await session.withTransaction(async () => {
            const ids = items.map(i => i.articleId);
            const articulos = await models.Article.find({ _id: { $in: ids } }).session(session);
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

                await addStockFromPurchase(models, {
                    branchId, articleId: art._id, quantity: qty, unitCost
                }, session);

                purchaseItems.push({ articleId: art._id, name: art.name, quantity: qty, unitCost });
                total += unitCost * qty;
            }
            total = Math.round(total * 100) / 100;

            [compra] = await models.Purchase.create([{
                branchId, supplierId, supplierName, notes,
                items: purchaseItems, total, paymentMethod, createdBy: clerkUserId
            }], { session });

            await models.LedgerEntry.create([{
                branchId,
                type: 'egreso', source: 'compra',
                concept: `Compra de mercadería${supplierName ? ` - ${supplierName}` : ''}`,
                amount: total, paymentMethod, purchaseId: compra._id
            }], { session });
        });
        return compra;
    } finally {
        session.endSession();
    }
};

// ==========================================
// LECTURA
// ==========================================

/**
 * Lista las últimas compras del tenant, opcionalmente filtradas por sucursal.
 * @param {Object} models Modelos del tenant.
 * @param {Object} [filter={}]
 * @param {string} [filter.branchId]
 * @returns {Promise<Array>} Últimas 200 compras, ordenadas por fecha descendente.
 */
const getAllPurchases = async (models, { branchId } = {}) => {
    const filtro = {};
    if (branchId) filtro.branchId = branchId;
    return models.Purchase.find(filtro).sort({ createdAt: -1 }).limit(200);
};

module.exports = { createPurchase, getAllPurchases };
