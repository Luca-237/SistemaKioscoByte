const { Schema } = require('mongoose');

const noteItemSchema = new Schema({
    articleId: { type: Schema.Types.ObjectId, ref: 'Article' },
    name: { type: String, trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 }
}, { _id: false });

const noteSchema = new Schema({
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['compra', 'mantenimiento', 'reporte', 'otro'],
        required: true
    },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    // Copia desnormalizada del nombre: la nota no se rompe si el proveedor
    // se edita o se da de baja.
    supplierName: { type: String, trim: true },
    paymentMethod: { type: String, trim: true },
    items: { type: [noteItemSchema], default: [] },
    total: { type: Number, default: 0, min: 0 },
    status: {
        type: String,
        enum: ['pendiente', 'revision', 'aprobada', 'cerrada', 'rechazada'],
        default: 'pendiente'
    },
    ownerComment: { type: String, trim: true },
    ledgerEntryId: { type: Schema.Types.ObjectId, ref: 'LedgerEntry' },
    settledAt: { type: Date }
}, { timestamps: true });

noteSchema.index({ branchId: 1, createdAt: -1 });
noteSchema.index({ status: 1, createdAt: -1 });

module.exports = noteSchema;
