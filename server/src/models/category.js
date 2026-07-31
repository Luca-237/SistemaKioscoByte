const { Schema } = require('mongoose');

// Categoría de artículos del negocio. Almacena configuración por categoría,
// como si el lote y la fecha de vencimiento son obligatorios al cargar compras.
const categorySchema = new Schema({
    name: { type: String, required: true, trim: true },
    requiereVencimiento: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
}, { timestamps: true });

categorySchema.index({ name: 1 }, { unique: true });

module.exports = categorySchema;
