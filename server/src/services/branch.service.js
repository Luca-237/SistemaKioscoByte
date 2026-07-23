const { AppError } = require('../middlewares/error');

// Gestión de sucursales del tenant.

// ==========================================
// LECTURA
// ==========================================

/**
 * Lista las sucursales activas, ordenadas por nombre.
 * @param {Object} models Modelos del tenant (req.tenantModels).
 * @returns {Promise<Array>} Sucursales activas.
 */
const getAllBranches = async (models) => {
    return models.Branch.find({ active: true }).sort({ name: 1 });
};

// ==========================================
// CREACIÓN
// ==========================================

/**
 * Crea una sucursal nueva.
 * @param {Object} models Modelos del tenant.
 * @param {Object} data Datos de la sucursal: { name, address, phone }.
 * @returns {Promise<Object>} Sucursal creada.
 * @throws {Error} 400 si falta el nombre.
 */
const createBranch = async (models, { name, address, phone }) => {
    if (!name || !name.trim()) {
        throw new AppError(400, 'El nombre de la sucursal es obligatorio');
    }
    return models.Branch.create({ name: name.trim(), address, phone });
};

// ==========================================
// ACTUALIZACIÓN
// ==========================================

/**
 * Actualiza los datos de una sucursal existente.
 * @param {Object} models Modelos del tenant.
 * @param {string} id ObjectId de la sucursal.
 * @param {Object} data Datos a actualizar: { name, address, phone }.
 * @returns {Promise<Object>} Sucursal actualizada.
 * @throws {Error} 404 si no existe.
 */
const updateBranch = async (models, id, { name, address, phone }) => {
    const branch = await models.Branch.findOneAndUpdate(
        { _id: id },
        { name, address, phone },
        { new: true, runValidators: true }
    );
    if (!branch) throw new AppError(404, 'Sucursal no encontrada');
    return branch;
};

// ==========================================
// BAJA
// ==========================================

/**
 * Da de baja lógica una sucursal: deja de operar pero su historial queda.
 * Se desasigna de todos los operarios para que no aparezca al loguear.
 * @param {Object} models Modelos del tenant.
 * @param {string} id ObjectId de la sucursal.
 * @throws {Error} 404 si no existe.
 */
const deactivateBranch = async (models, id) => {
    const branch = await models.Branch.findOneAndUpdate(
        { _id: id },
        { active: false },
        { new: true }
    );
    if (!branch) throw new AppError(404, 'Sucursal no encontrada');
    // La desasignamos de los operarios para que no aparezca al loguear.
    await models.User.updateMany({}, { $pull: { branchIds: branch._id } });
};

module.exports = { getAllBranches, createBranch, updateBranch, deactivateBranch };
