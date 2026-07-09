const { Schema, model } = require('mongoose');
const { PAYMENT_METHODS } = require('../config/constants');

// Compra de mercadería (la registra el propietario). Suma stock a la sucursal
// destino y recalcula el costo promedio ponderado de cada artículo.
const purchaseItemSchema = new Schema({
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    name: String,
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 }
}, { _id: false });

const purchaseSchema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    supplierName: { type: String, trim: true },
    notes: { type: String, trim: true },
    items: { type: [purchaseItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    createdBy: { type: String }   // clerkUserId del propietario
}, { timestamps: true });

purchaseSchema.index({ createdAt: -1 });

module.exports = purchaseSchema;
