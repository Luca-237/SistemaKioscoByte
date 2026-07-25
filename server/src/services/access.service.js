const { ACCESS_CODES, ACCESS_CODE_VALUES } = require('../config/accessCodes');
const { AppError } = require('../middlewares/error');

// Gestión de los accesos (permisos a módulos del panel) que el propietario
// concede a cada operario. Es un menú propio, separado de la gestión de
// operarios (/api/users): quien tenga el código 'access' puede administrar
// los accesos de los demás, sin necesariamente poder crear/editar operarios.

// ==========================================
// LECTURA
// ==========================================

/**
 * Lista los códigos de acceso disponibles para mostrar en el panel.
 * @returns {Array<{code: string, label: string}>}
 */
const getAvailableAccessCodes = () => ACCESS_CODES;

/**
 * Lista los operarios con sus accesos actuales, para la pantalla de gestión.
 * @param {Object} models Modelos del tenant.
 * @returns {Promise<Array>} Operarios con name, username, active, permissions y sucursales.
 */
const getOperatorsWithAccess = async (models) => {
    return models.User.find({})
        .select('name username active permissions branchIds')
        .populate('branchIds', 'name')
        .sort({ name: 1 });
};

// ==========================================
// ACTUALIZACIÓN
// ==========================================

/**
 * Habilita o deshabilita un acceso puntual para un operario (agrega o saca
 * el código de su array `permissions`).
 * @param {Object} models Modelos del tenant.
 * @param {string} operatorId ObjectId del operario.
 * @param {string} code Código de acceso (ver ACCESS_CODES).
 * @param {boolean} enabled true para habilitar, false para deshabilitar.
 * @returns {Promise<Object>} Operario actualizado, sin el hash de contraseña.
 * @throws {Error} 400 si el código no existe; 404 si el operario no existe.
 */
const setOperatorAccess = async (models, operatorId, code, enabled) => {
    if (!ACCESS_CODE_VALUES.includes(code)) {
        throw new AppError(400, 'Código de acceso inválido');
    }

    const update = enabled
        ? { $addToSet: { permissions: code } }
        : { $pull: { permissions: code } };

    const operator = await models.User.findByIdAndUpdate(operatorId, update, { new: true })
        .select('-passwordHash');

    if (!operator) throw new AppError(404, 'Operario no encontrado');
    return operator;
};

module.exports = { getAvailableAccessCodes, getOperatorsWithAccess, setOperatorAccess };
