const { AppError } = require('../middlewares/error');

class CashService {
    constructor(models) {
        this.models = models;
    }

    async getOpen(branchId) {
        return this.models.CashSession.findOne({ branchId, status: 'open' });
    }

    async open(operator, openingAmount = 0) {
        try {
            return await this.models.CashSession.create({
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
    }

    // Cierre: esperado = apertura + ventas en EFECTIVO de la sesión.
    // La diferencia (sobrante/faltante) queda asentada en el libro diario.
    async close(operator, { closingAmount }) {
        if (closingAmount === undefined || closingAmount === null) {
            throw new AppError(400, 'Falta el monto contado al cierre (closingAmount)');
        }

        // La sesión debe crearse en la conexión del tenant, no en la conexión
        // por defecto de mongoose, para que las transacciones impacten la BD correcta.
        const session = await this.models.CashSession.db.startSession();
        try {
            let caja;
            await session.withTransaction(async () => {
                caja = await this.models.CashSession.findOne({
                    branchId: operator.branchId, status: 'open'
                }).session(session);
                if (!caja) throw new AppError(409, 'No hay una caja abierta para cerrar', 'NO_OPEN_CASH');

                const [efectivo] = await this.models.Sale.aggregate([
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
                    await this.models.LedgerEntry.create([{
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
    }
}

module.exports = CashService;
