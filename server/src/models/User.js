const { Schema, model } = require('mongoose');

// Operario creado por el propietario. Loguea con código de empresa + usuario +
// clave (JWT propio, sin Clerk). branchIds: sucursales en las que puede operar.
// role queda extensible para sumar 'encargado' a futuro sin migrar.
const userSchema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    username: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['operator'], default: 'operator' },
    branchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
    active: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ username: 1 }, { unique: true });

module.exports = userSchema;
