const bcrypt = require('bcrypt');
const { AppError } = require('../middlewares/error');

const MIN_PASSWORD_LENGTH = 4;

// Gestión de operarios (usuarios) del tenant.

// Valida que todas las sucursales a asignar existan en la base del negocio.
const validarBranches = async (models, branchIds = []) => {
    if (!branchIds.length) return [];
    const propias = await models.Branch.find({ _id: { $in: branchIds }, active: true }).select('_id');
    return propias.map(b => b._id);
};

// ==========================================
// LECTURA
// ==========================================

/**
 * Lista todos los operarios, sin exponer el hash de contraseña.
 * @param {Object} models Modelos del tenant.
 * @returns {Promise<Array>} Operarios con sus sucursales populadas.
 */
const getAllUsers = async (models) => {
    return models.User.find({})
        .select('-passwordHash')
        .populate('branchIds', 'name')
        .sort({ name: 1 });
};

// ==========================================
// CREACIÓN
// ==========================================

/**
 * Crea un operario nuevo con usuario, clave y sucursales asignadas.
 * @param {Object} models Modelos del tenant.
 * @param {Object} data Datos: { username, password, name, branchIds }.
 * @returns {Promise<Object>} Operario creado, sin el hash de contraseña.
 * @throws {Error} 400 si faltan datos o la contraseña es muy corta.
 */
const createUser = async (models, { username, password, name, branchIds }) => {
    if (!username || !password || !name) {
        throw new AppError(400, 'Faltan usuario, contraseña o nombre');
    }
    if (String(password).length < MIN_PASSWORD_LENGTH) {
        throw new AppError(400, 'La contraseña debe tener al menos 4 caracteres');
    }

    const user = await models.User.create({
        username: String(username).toLowerCase().trim(),
        passwordHash: await bcrypt.hash(String(password), 10),
        name: name.trim(),
        branchIds: await validarBranches(models, branchIds)
    });

    const { passwordHash, ...safe } = user.toObject();
    return safe;
};

// ==========================================
// ACTUALIZACIÓN
// ==========================================

/**
 * Edita un operario: nombre, sucursales, estado y (opcional) resetea la clave.
 * @param {Object} models Modelos del tenant.
 * @param {string} id ObjectId del operario.
 * @param {Object} data Datos: { name, branchIds, active, newPassword }.
 * @returns {Promise<Object>} Operario actualizado, sin el hash de contraseña.
 * @throws {Error} 400 si la nueva contraseña es muy corta; 404 si no existe.
 */
const updateUser = async (models, id, { name, branchIds, active, newPassword }) => {
    const update = {};
    if (name !== undefined) update.name = name;
    if (active !== undefined) update.active = active;
    if (branchIds !== undefined) update.branchIds = await validarBranches(models, branchIds);
    if (newPassword) {
        if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
            throw new AppError(400, 'La contraseña debe tener al menos 4 caracteres');
        }
        update.passwordHash = await bcrypt.hash(String(newPassword), 10);
    }

    const user = await models.User.findOneAndUpdate(
        { _id: id },
        update,
        { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) throw new AppError(404, 'Operario no encontrado');
    return user;
};

module.exports = { getAllUsers, createUser, updateUser };
