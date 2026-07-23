const mongoose = require('mongoose');

const oid = (v) => new mongoose.Types.ObjectId(String(v));

// Reportes y estadísticas del dashboard del propietario. Todo de solo lectura:
// agrega sobre Sale, Purchase y LedgerEntry, nunca escribe.

// ==========================================
// RESUMEN
// ==========================================

/**
 * Resumen para el dashboard: ingresos/egresos del libro diario + margen
 * bruto real de ventas (precio - costo promedio al momento de vender).
 * @param {Object} models Modelos del tenant.
 * @param {Object} [filter={}] Filtros: { branchId, from, to }.
 * @returns {Promise<Object>} { ingresos, egresos, saldoNeto, ventas }.
 */
const getSummary = async (models, { branchId, from, to } = {}) => {
    const match = {};
    if (branchId) match.branchId = oid(branchId);
    if (from || to) {
        match.createdAt = {};
        if (from) match.createdAt.$gte = new Date(from);
        if (to) match.createdAt.$lte = new Date(to);
    }

    const porTipo = await models.LedgerEntry.aggregate([
        { $match: match },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);
    const ingresos = porTipo.find(r => r._id === 'ingreso')?.total || 0;
    const egresos = porTipo.find(r => r._id === 'egreso')?.total || 0;

    const [margen] = await models.Sale.aggregate([
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
};

// ==========================================
// ANALÍTICA
// ==========================================

/**
 * Análisis completo para el panel de estadísticas: top artículos,
 * histórico de precios de compra/venta, ventas por operario, balance
 * mensual y desglose de egresos.
 * @param {Object} models Modelos del tenant.
 * @param {Object} [filter={}] Filtros: { branchId, from, to }.
 * @returns {Promise<Object>} { topArticles, priceHistory, salesByOperator,
 *   monthlyBalance, monthlySummary, expenseBreakdown }.
 */
const getAnalytics = async (models, { branchId, from, to } = {}) => {
    const match = {};
    if (branchId) match.branchId = oid(branchId);
    if (from || to) {
        match.createdAt = {};
        if (from) match.createdAt.$gte = new Date(from);
        if (to) match.createdAt.$lte = new Date(to);
    }

    const [topArticles, purchaseHistory, saleHistory, operatorSales, monthlyBalance, expenseBreakdown, articleCatalog] = await Promise.all([
        models.Sale.aggregate([
            { $match: match },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.articleId',
                    name: { $first: '$items.name' },
                    soldUnits: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } },
                    avgSalePrice: { $avg: '$items.unitPrice' }
                }
            },
            { $sort: { soldUnits: -1, revenue: -1 } },
            { $limit: 8 }
        ]),
        models.Purchase.aggregate([
            { $match: match },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.articleId',
                    name: { $first: '$items.name' },
                    avgCost: { $avg: '$items.unitCost' },
                    purchases: { $sum: 1 },
                    suppliers: { $addToSet: '$supplierName' },
                    latestPurchase: { $max: '$createdAt' }
                }
            },
            { $sort: { avgCost: -1 } }
        ]),
        models.Sale.aggregate([
            { $match: match },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.articleId',
                    name: { $first: '$items.name' },
                    avgSoldPrice: { $avg: '$items.unitPrice' },
                    unitsSold: { $sum: '$items.quantity' },
                    soldTickets: { $sum: 1 }
                }
            },
            { $sort: { unitsSold: -1 } }
        ]),
        models.Sale.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$operatorId',
                    soldTickets: { $sum: 1 },
                    totalSales: { $sum: '$total' }
                }
            },
            { $sort: { totalSales: -1 } }
        ]),
        models.LedgerEntry.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
                    },
                    ingresos: {
                        $sum: { $cond: [{ $eq: ['$type', 'ingreso'] }, '$amount', 0] }
                    },
                    egresos: {
                        $sum: { $cond: [{ $eq: ['$type', 'egreso'] }, '$amount', 0] }
                    }
                }
            },
            { $sort: { '_id.month': 1 } }
        ]),
        models.LedgerEntry.aggregate([
            { $match: { ...match, type: 'egreso' } },
            {
                $group: {
                    _id: '$concept',
                    total: { $sum: '$amount' },
                    source: { $first: '$source' }
                }
            },
            { $sort: { total: -1 } },
            { $limit: 8 }
        ]),
        models.Article.find({ active: true }).select('_id name salePrice').lean()
    ]);

    const articleMap = new Map(articleCatalog.map((article) => [article._id.toString(), article]));
    const purchaseMap = new Map(purchaseHistory.map((entry) => [entry._id.toString(), entry]));
    const saleMap = new Map(saleHistory.map((entry) => [entry._id.toString(), entry]));

    const allArticleIds = Array.from(new Set([
        ...topArticles.map((item) => item._id.toString()),
        ...purchaseHistory.map((item) => item._id.toString()),
        ...saleHistory.map((item) => item._id.toString())
    ]));

    const priceHistory = allArticleIds.map((articleId) => {
        const article = articleMap.get(articleId);
        const purchaseEntry = purchaseMap.get(articleId);
        const saleEntry = saleMap.get(articleId);
        const avgPurchase = Number(purchaseEntry?.avgCost || 0);
        const avgSale = Number(saleEntry?.avgSoldPrice || 0);
        const currentSalePrice = Number(article?.salePrice || 0);
        const spreadHistorical = Math.round((avgSale - avgPurchase) * 100) / 100;
        const spreadCurrent = Math.round((currentSalePrice - avgPurchase) * 100) / 100;

        return {
            articleId,
            name: purchaseEntry?.name || saleEntry?.name || article?.name || 'Artículo sin nombre',
            currentSalePrice,
            avgPurchasePrice: Math.round(avgPurchase * 100) / 100,
            avgSalePrice: Math.round(avgSale * 100) / 100,
            historicalDifference: spreadHistorical,
            currentDifference: spreadCurrent,
            suppliers: (purchaseEntry?.suppliers || []).filter(Boolean).sort(),
            latestPurchase: purchaseEntry?.latestPurchase || null,
            unitsSold: Number(saleEntry?.unitsSold || 0),
            soldTickets: Number(saleEntry?.soldTickets || 0)
        };
    }).filter((item) => item.avgPurchasePrice > 0 || item.avgSalePrice > 0 || item.currentSalePrice > 0)
      .sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0) || (b.currentDifference || 0) - (a.currentDifference || 0));

    const operatorNames = await models.User.find({}).select('_id name').lean();
    const operatorMap = new Map(operatorNames.map((operator) => [operator._id.toString(), operator.name]));

    const salesByOperator = operatorSales
        .map((entry) => ({
            operatorId: entry._id.toString(),
            name: operatorMap.get(entry._id.toString()) || 'Operario sin nombre',
            soldTickets: entry.soldTickets,
            totalSales: Math.round((entry.totalSales || 0) * 100) / 100
        }))
        .sort((a, b) => b.totalSales - a.totalSales);

    const monthly = monthlyBalance.map((entry) => {
        const ingresos = Math.round((entry.ingresos || 0) * 100) / 100;
        const egresos = Math.round((entry.egresos || 0) * 100) / 100;
        const balance = Math.round((ingresos - egresos) * 100) / 100;
        return {
            month: entry._id.month,
            ingresos,
            egresos,
            balance,
            ganancia: balance > 0 ? balance : 0,
            perdida: balance < 0 ? Math.abs(balance) : 0
        };
    });

    const ganancias = monthly.reduce((sum, item) => sum + item.ganancia, 0);
    const perdidas = monthly.reduce((sum, item) => sum + item.perdida, 0);

    return {
        topArticles: topArticles.map((item) => ({
            articleId: item._id.toString(),
            name: item.name,
            soldUnits: item.soldUnits,
            revenue: Math.round((item.revenue || 0) * 100) / 100,
            avgSalePrice: Math.round((item.avgSalePrice || 0) * 100) / 100
        })),
        priceHistory: priceHistory.slice(0, 10),
        salesByOperator,
        monthlyBalance: monthly,
        monthlySummary: {
            ganancias: Math.round(ganancias * 100) / 100,
            perdidas: Math.round(perdidas * 100) / 100,
            balance: Math.round((ganancias - perdidas) * 100) / 100
        },
        expenseBreakdown: expenseBreakdown.map((entry) => ({
            concept: entry._id,
            source: entry.source,
            total: Math.round((entry.total || 0) * 100) / 100
        }))
    };
};

// ==========================================
// MOVIMIENTOS
// ==========================================

/**
 * Libro diario: últimos movimientos de ingresos/egresos.
 * @param {Object} models Modelos del tenant.
 * @param {Object} [filter={}] Filtros: { branchId, limit }.
 * @returns {Promise<Array>} Movimientos ordenados por fecha descendente.
 */
const getMovements = async (models, { branchId, limit = 50 } = {}) => {
    const filtro = {};
    if (branchId) filtro.branchId = branchId;
    return models.LedgerEntry.find(filtro).sort({ createdAt: -1 }).limit(Number(limit));
};

module.exports = { getSummary, getAnalytics, getMovements };
