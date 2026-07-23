const { AppError } = require('../middlewares/error');

// Gestión de proveedores del tenant.

// ==========================================
// LECTURA
// ==========================================

/**
 * Lista los proveedores activos, ordenados por nombre.
 * @param {Object} models Modelos del tenant.
 * @returns {Promise<Array>} Proveedores activos.
 */
const getAllSuppliers = async (models) => {
    return models.Supplier.find({ active: true }).sort({ name: 1 });
};

// ==========================================
// CREACIÓN
// ==========================================

/**
 * Crea un proveedor nuevo.
 * @param {Object} models Modelos del tenant.
 * @param {Object} data Datos del proveedor.
 * @returns {Promise<Object>} Proveedor creado.
 * @throws {Error} 400 si falta el nombre o ya existe un proveedor con ese nombre.
 */
const createSupplier = async (models, { name, contactName, phone, email, address, cuit, notes }) => {
    if (!name || !name.trim()) {
        throw new AppError(400, 'El nombre del proveedor es obligatorio');
    }
    try {
        return await models.Supplier.create({
            name: name.trim(), contactName, phone, email, address, cuit, notes
        });
    } catch (error) {
        // Este 400 con mensaje propio es distinto al 409 genérico de
        // duplicados: al crear, un nombre repetido es un error de validación
        // esperable en el formulario (no un conflicto de concurrencia).
        if (error.code === 11000) {
            throw new AppError(400, 'Ya existe un proveedor con ese nombre');
        }
        throw error;
    }
};

// ==========================================
// ACTUALIZACIÓN
// ==========================================

/**
 * Actualiza los datos de un proveedor existente.
 * @param {Object} models Modelos del tenant.
 * @param {string} id ObjectId del proveedor.
 * @param {Object} data Datos a actualizar.
 * @returns {Promise<Object>} Proveedor actualizado.
 * @throws {Error} 404 si no existe.
 */
const updateSupplier = async (models, id, { name, contactName, phone, email, address, cuit, notes }) => {
    const supplier = await models.Supplier.findOneAndUpdate(
        { _id: id },
        { name, contactName, phone, email, address, cuit, notes },
        { new: true, runValidators: true }
    );
    if (!supplier) throw new AppError(404, 'Proveedor no encontrado');
    return supplier;
};

// ==========================================
// BAJA
// ==========================================

/**
 * Da de baja lógica un proveedor: deja de aparecer al cargar compras pero
 * su historial queda.
 * @param {Object} models Modelos del tenant.
 * @param {string} id ObjectId del proveedor.
 * @throws {Error} 404 si no existe.
 */
const deactivateSupplier = async (models, id) => {
    const supplier = await models.Supplier.findOneAndUpdate(
        { _id: id },
        { active: false },
        { new: true }
    );
    if (!supplier) throw new AppError(404, 'Proveedor no encontrado');
};

module.exports = { getAllSuppliers, createSupplier, updateSupplier, deactivateSupplier };
