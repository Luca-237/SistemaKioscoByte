const mongoose = require('mongoose');

const oid = (v) => new mongoose.Types.ObjectId(String(v));

class StatsService {
    constructor(models) {
        this.models = models;
    }

    // Resumen para el dashboard del propietario: ingresos/egresos del libro
    // diario + margen bruto real de ventas (precio - costo promedio al vender).
    async summary({ branchId, from, to } = {}) {
        const match = {};
        if (branchId) match.branchId = oid(branchId);
        if (from || to) {
            match.createdAt = {};
            if (from) match.createdAt.$gte = new Date(from);
            if (to) match.createdAt.$lte = new Date(to);
        }

        const porTipo = await this.models.LedgerEntry.aggregate([
            { $match: match },
            { $group: { _id: '$type', total: { $sum: '$amount' } } }
        ]);
        const ingresos = porTipo.find(r => r._id === 'ingreso')?.total || 0;
        const egresos = porTipo.find(r => r._id === 'egreso')?.total || 0;

        const [margen] = await this.models.Sale.aggregate([
            { $match: match },
            { $unwind: '$items' },
            {
                $group: {
                    _id: null,
                    ventas: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } },
                    costo: { $sum: { $multiply: ['$items.costAtSale', '$items.quantity'] } },
                    unidades: { $sum: '$items.quantity' },
                    tickets: { $addToSet: '$_id' }
                }
            }
        ]);

        return {
            ingresos, egresos,
            saldoNeto: Math.round((ingresos - egresos) * 100) / 100,
            ventas: {
                facturado: margen?.ventas || 0,
                costoMercaderia: Math.round((margen?.costo || 0) * 100) / 100,
                margenBruto: Math.round(((margen?.ventas || 0) - (margen?.costo || 0)) * 100) / 100,
                unidades: margen?.unidades || 0,
                cantidadTickets: margen?.tickets?.length || 0
            }
        };
    }

    async movements({ branchId, limit = 50 } = {}) {
        const filtro = {};
        if (branchId) filtro.branchId = branchId;
        return this.models.LedgerEntry.find(filtro).sort({ createdAt: -1 }).limit(Number(limit));
    }
}

module.exports = StatsService;
