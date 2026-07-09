const { Schema, model } = require('mongoose');
const { PAYMENT_METHODS } = require('../config/constants');

// Venta registrada por un operario dentro de una caja abierta.
// Cada ítem guarda costAtSale (costo promedio al momento de vender): eso
// permite calcular el margen real con costeo promedio ponderado aunque el
// costo cambie después. El bloque fiscal deja el modelo listo para AFIP/ARCA
// sin migraciones: hoy los comprobantes son internos (tipo 'X').
const saleItemSchema = new Schema({
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    code: String,
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    costAtSale: { type: Number, default: 0 }
}, { _id: false });

const saleSchema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    cashSessionId: { type: Schema.Types.ObjectId, ref: 'CashSession', required: true },
    operatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    number: { type: Number, required: true },        // correlativo por organización
    items: { type: [saleItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    fiscal: {
        receiptType: { type: String, default: 'X' },  // X = comprobante interno
        pointOfSale: { type: Number },
        cae: { type: String },
        caeExpiry: { type: Date },
        customerName: { type: String },
        customerTaxId: { type: String }
    }
}, { timestamps: true });

saleSchema.index({ createdAt: -1 });
saleSchema.index({ branchId: 1, cashSessionId: 1 });
saleSchema.index({ number: 1 }, { unique: true });

module.exports = saleSchema;
