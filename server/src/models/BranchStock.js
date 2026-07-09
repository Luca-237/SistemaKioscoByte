const { Schema, model } = require('mongoose');

// Existencia y costo de un artículo en una sucursal.
// avgCost es el costo promedio ponderado: cada compra lo recalcula como
// (qty_actual * avgCost + qty_compra * costo_compra) / (qty_actual + qty_compra)
const branchStockSchema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    quantity: { type: Number, default: 0 },
    avgCost: { type: Number, default: 0 }
}, { timestamps: true });

branchStockSchema.index({ branchId: 1, articleId: 1 }, { unique: true });

module.exports = branchStockSchema;
