const { Schema } = require('mongoose');

// Contadores atómicos por negocio (ej: numeración correlativa de ventas).
// En multi-tenant cada BD tiene su propio Counter, así que no necesita orgId.
const counterSchema = new Schema({
    key: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

counterSchema.index({ key: 1 }, { unique: true });

// Devuelve el próximo número de la secuencia de forma atómica.
counterSchema.statics.next = async function (key, session) {
    const doc = await this.findOneAndUpdate(
        { key },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, session }
    );
    return doc.seq;
};

module.exports = counterSchema;
