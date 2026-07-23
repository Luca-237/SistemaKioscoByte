const { Schema } = require('mongoose');

// Proveedor de mercadería. Se registra desde el módulo de compras y luego
// se selecciona al cargar una compra. Cada BD de tenant tiene los suyos.
const supplierSchema = new Schema({
    name: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    cuit: { type: String, trim: true },
    notes: { type: String, trim: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

supplierSchema.index({ name: 1 }, { unique: true });

module.exports = supplierSchema;
