const { Schema, model } = require('mongoose');

// Empresa/organización del propietario. El propietario se identifica por su
// usuario de Clerk (ownerClerkId). `code` es el código corto que los operarios
// usan para loguearse (identifica la org sin exponer IDs internos).
const organizationSchema = new Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    ownerClerkId: { type: String, required: true, unique: true },
    taxId: { type: String, trim: true },          // CUIT (AFIP-ready)
    ivaCondition: { type: String, trim: true },   // ej: "Responsable Monotributo"
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = model('Organization', organizationSchema);
