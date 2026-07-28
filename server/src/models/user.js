const { Schema } = require('mongoose');
const { ACCESS_CODE_VALUES } = require('../config/accessCodes');

// Operario creado por el propietario. Loguea con código de empresa + usuario +
// clave (JWT propio, sin Clerk). branchIds: sucursales en las que puede operar.
// role queda extensible para sumar 'encargado' a futuro sin migrar.
// permissions: módulos del panel de administración habilitados para este
// operario además de su acceso base al POS (ver middlewares/checkAccess.js).
const userSchema = new Schema({
    username: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['operator'], default: 'operator' },
    branchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
    permissions: [{ type: String, enum: ACCESS_CODE_VALUES }],
    active: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ username: 1 }, { unique: true });

module.exports = userSchema;
