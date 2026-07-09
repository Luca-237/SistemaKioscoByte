const { Schema, model } = require('mongoose');

// Sucursal de una organización.
const branchSchema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

branchSchema.index({ name: 1 }, { unique: true });

module.exports = branchSchema;
