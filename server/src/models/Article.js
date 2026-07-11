const { Schema } = require('mongoose');

// Catálogo de artículos del negocio. El precio de venta es final
// (IVA incluido). Las existencias y el costo promedio viven en BranchStock,
// porque son por sucursal.
const articleSchema = new Schema({
    code: { type: String, required: true, trim: true },
    barcode: { type: String, trim: true },
    name: { type: String, required: false, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    unit: { type: String, trim: true, default: 'unidad' },
    salePrice: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true }
}, { timestamps: true });

articleSchema.index({ code: 1 }, { unique: true });
articleSchema.index({ barcode: 1 }, { sparse: true });

module.exports = articleSchema;
