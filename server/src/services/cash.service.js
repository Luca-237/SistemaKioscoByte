const { AppError } = require('../middlewares/error');

// Caja de una sucursal: apertura, cierre y consulta de estado.

// ==========================================
// LECTURA
// ==========================================

/**
 * Devuelve la caja abierta de una sucursal, si hay una.
 * @param {Object} models Modelos del tenant.
 * @param {string} branchId
 * @returns {Promise<Object|null>} La sesión de caja abierta, o null.
 */
const getOpenCash = async (models, branchId) => {
    return models.CashSession.findOne({ branchId, status: 'open' });
};

/**
 * Devuelve el último cierre de caja de una sucursal.
 * @param {Object} models Modelos del tenant.
 * @param {string} branchId
 * @returns {Promise<Object|null>} La última sesión cerrada, o null.
 */
const getLastClosedCash = async (models, branchId) => {
    return models.CashSession.findOne({
        branchId,
        status: 'closed'
    }).sort({ closedAt: -1 });
};

// ==========================================
// APERTURA
// ==========================================

/**
 * Abre una caja para el operario en su sucursal activa.
 * @param {Object} models Modelos del tenant.
 * @param {Object} operator Operario autenticado: { branchId, userId }.
 * @param {number} [openingAmount=0] Monto inicial en efectivo.
 * @returns {Promise<Object>} La sesión de caja creada.
 * @throws {Error} 409 si ya hay una caja abierta en esa sucursal.
 */
const openCash = async (models, operator, openingAmount = 0) => {
    try {
        return await models.CashSession.create({
            branchId: operator.branchId,
            openedBy: operator.userId,
            openingAmount: Number(openingAmount) || 0
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new AppError(409, 'Ya hay una caja abierta en esta sucursal', 'CASH_ALREADY_OPEN');
        }
        throw error;
    }
};

// ==========================================
// CIERRE
// ==========================================

/**
 * Cierra la caja abierta de la sucursal del operario. El esperado es
 * apertura + ventas en EFECTIVO de la sesión; la diferencia (sobrante o
 * faltante) queda asentada en el libro diario.
 * @param {Object} models Modelos del tenant.
 * @param {Object} operator Operario autenticado: { branchId, userId }.
 * @param {Object} data { closingAmount }
 * @returns {Promise<Object>} La sesión de caja cerrada.
 * @throws {Error} 400 si falta el monto contado; 409 si no hay caja abierta.
 */
const closeCash = async (models, operator, { closingAmount }) => {
    if (closingAmount === undefined || closingAmount === null) {
        throw new AppError(400, 'Falta el monto contado al cierre (closingAmount)');
    }

    // La sesión debe crearse en la conexión del tenant, no en la conexión
    // por defecto de mongoose, para que las transacciones impacten la BD correcta.
    const session = await models.CashSession.db.startSession();
    try {
        let caja;
        await session.withTransaction(async () => {
            caja = await models.CashSession.findOne({
                branchId: operator.branchId, status: 'open'
            }).session(session);
            if (!caja) throw new AppError(409, 'No hay una caja abierta para cerrar', 'NO_OPEN_CASH');

            const [efectivo] = await models.Sale.aggregate([
                { $match: { cashSessionId: caja._id, paymentMethod: 'efectivo' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]).session(session);

            const expected = Math.round((caja.openingAmount + (efectivo?.total || 0)) * 100) / 100;
            const difference = Math.round((Number(closingAmount) - expected) * 100) / 100;

            caja.status = 'closed';
            caja.closedBy = operator.userId;
            caja.closedAt = new Date();
            caja.closingAmount = Number(closingAmount);
            caja.expectedAmount = expected;
            caja.difference = difference;
            await caja.save({ session });

            if (difference !== 0) {
                await models.LedgerEntry.create([{
                    branchId: operator.branchId,
                    type: difference > 0 ? 'ingreso' : 'egreso',
                    source: 'cierre_caja',
                    concept: difference > 0
                        ? `Sobrante de caja (cierre ${caja._id.toString().slice(-6)})`
                        : `Faltante de caja (cierre ${caja._id.toString().slice(-6)})`,
                    amount: Math.abs(difference),
                    paymentMethod: 'efectivo',
                    cashSessionId: caja._id
                }], { session });
            }
        });
        return caja;
    } finally {
        session.endSession();
    }
};

module.exports = { getOpenCash, getLastClosedCash, openCash, closeCash };
