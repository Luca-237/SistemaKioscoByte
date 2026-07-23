const crypto = require('crypto');
const { Organization } = require('../models');
const { AppError } = require('../middlewares/error');

// Código corto y legible para que los operarios identifiquen la empresa al loguear.
const generarCodigo = () => crypto.randomBytes(3).toString('hex').toUpperCase(); // ej: "A3F9C1"

// Gestión de la organización del propietario. A diferencia de los demás
// services, Organization es el modelo GLOBAL (vive en la BD principal, no
// en la del tenant), porque antes de crearla el propietario no tiene tenant.

// ==========================================
// LECTURA
// ==========================================

/**
 * Devuelve el estado público de la organización del propietario logueado.
 * @param {Object} models Modelos del tenant (necesarios solo si org existe).
 * @param {Object|null} org Organización ya resuelta por el middleware de auth.
 * @returns {Promise<Object|null>} Datos públicos de la organización, o null si no tiene.
 */
const getMyOrganization = async (models, org) => {
    if (!org) return null;
    const branchCount = await models.Branch.countDocuments({ active: true });
    return {
        id: org._id, name: org.name, code: org.code,
        taxId: org.taxId, branchCount
    };
};

// ==========================================
// ONBOARDING
// ==========================================

/**
 * Crea la organización del propietario (solo la primera vez que entra).
 * Reintenta si el código corto generado colisiona con uno existente.
 * @param {string} ownerClerkId ID de Clerk del propietario.
 * @param {Object} data Datos de la empresa: { name, taxId }.
 * @returns {Promise<Object>} Organización creada (id, name, code).
 * @throws {Error} 400 si falta el nombre de la empresa.
 */
const bootstrapOrganization = async (ownerClerkId, { name, taxId }) => {
    if (!name || !name.trim()) {
        throw new AppError(400, 'El nombre de la empresa es obligatorio');
    }

    let org;
    // Reintenta si colisiona el código generado (unique index).
    for (let intento = 0; intento < 3; intento++) {
        try {
            org = await Organization.create({
                adminId: ownerClerkId,
                name: name.trim(), taxId,
                code: generarCodigo(),
                ownerClerkId
            });
            break;
        } catch (e) {
            if (e.code === 11000 && e.keyPattern?.code && intento < 2) continue;
            throw e;
        }
    }
    return { id: org._id, name: org.name, code: org.code };
};

module.exports = { getMyOrganization, bootstrapOrganization };
