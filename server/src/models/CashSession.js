const { Schema, model } = require('mongoose');

// Caja de una sucursal. Solo puede haber UNA abierta por sucursal a la vez
// (índice único parcial). El operario de turno la abre y la cierra.
const cashSessionSchema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    openedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    openedAt: { type: Date, default: Date.now },
    openingAmount: { type: Number, default: 0 },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date },
    closingAmount: { type: Number },   // lo contado físicamente al cerrar
    expectedAmount: { type: Number },  // apertura + ventas en efectivo
    difference: { type: Number }       // closing - expected (sobrante/faltante)
}, { timestamps: true });

cashSessionSchema.index(
    { branchId: 1 },
    { unique: true, partialFilterExpression: { status: 'open' } }
);
cashSessionSchema.index({ orgId: 1, branchId: 1, openedAt: -1 });

module.exports = model('CashSession', cashSessionSchema);
