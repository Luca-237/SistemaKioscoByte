const { Schema, model } = require('mongoose');

// Contadores atómicos por organización (ej: numeración correlativa de ventas).
const counterSchema = new Schema({
    orgId: { type: Schema.Types.ObjectId, required: true },
    key: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

counterSchema.index({ orgId: 1, key: 1 }, { unique: true });

// Devuelve el próximo número de la secuencia de forma atómica.
counterSchema.statics.next = async function (orgId, key, session) {
    const doc = await this.findOneAndUpdate(
        { orgId, key },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, session }
    );
    return doc.seq;
};

module.exports = model('Counter', counterSchema);
