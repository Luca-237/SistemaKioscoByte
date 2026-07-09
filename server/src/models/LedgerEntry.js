const { Schema } = require('mongoose');

// Libro diario: cada movimiento de dinero deja un asiento con trazabilidad
// hacia su origen (venta, compra, cierre de caja o manual). Es la base del
// módulo de contabilización/estadísticas.
const ledgerEntrySchema = new Schema({
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    type: { type: String, enum: ['ingreso', 'egreso'], required: true },
    source: { type: String, enum: ['venta', 'compra', 'cierre_caja', 'manual'], required: true },
    concept: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String },
    saleId: { type: Schema.Types.ObjectId, ref: 'Sale' },
    purchaseId: { type: Schema.Types.ObjectId, ref: 'Purchase' },
    cashSessionId: { type: Schema.Types.ObjectId, ref: 'CashSession' }
}, { timestamps: true });

ledgerEntrySchema.index({ createdAt: -1 });
ledgerEntrySchema.index({ branchId: 1, createdAt: -1 });

module.exports = ledgerEntrySchema;
