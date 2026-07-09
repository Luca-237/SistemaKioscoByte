const { Schema } = require('mongoose');

// Sucursal del negocio. Cada BD de tenant tiene sus propias sucursales.
const branchSchema = new Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

branchSchema.index({ name: 1 }, { unique: true });

module.exports = branchSchema;
