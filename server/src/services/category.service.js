const { AppError } = require('../middlewares/error');

// Gestión de categorías del tenant. La categoría es una entidad propia
// que almacena configuración (como requiereVencimiento).

// ==========================================
// LECTURA
// ==========================================

/**
 * Lista todas las categorías, ordenadas por nombre.
 * @param {Object} models Modelos del tenant.
 * @returns {Promise<Array>} Categorías.
 */
const getAllCategories = async (models) => {
    return models.Category.find().sort({ name: 1 });
};

// ==========================================
// CREACIÓN
// ==========================================

/**
 * Crea una categoría nueva.
 * @param {Object} models Modelos del tenant.
 * @param {Object} data Datos de la categoría.
 * @returns {Promise<Object>} Categoría creada.
 * @throws {Error} 400 si falta el nombre o ya existe.
 */
const createCategory = async (models, { name, requiereVencimiento }) => {
    if (!name || !name.trim()) {
        throw new AppError(400, 'El nombre de la categoría es obligatorio');
    }
    try {
        return await models.Category.create({
            name: name.trim(),
            requiereVencimiento: !!requiereVencimiento
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new AppError(400, 'Ya existe una categoría con ese nombre');
        }
        throw error;
    }
};

// ==========================================
// ACTUALIZACIÓN
// ==========================================

/**
 * Actualiza una categoría. Si se cambia el nombre, actualiza también el campo
 * `category` de todos los artículos que la usen.
 * @param {Object} models Modelos del tenant.
 * @param {string} id ObjectId de la categoría.
 * @param {Object} data Datos a actualizar.
 * @returns {Promise<Object>} Categoría actualizada.
 * @throws {Error} 404 si no existe.
 */
const updateCategory = async (models, id, { name, requiereVencimiento }) => {
    const cat = await models.Category.findById(id);
    if (!cat) throw new AppError(404, 'Categoría no encontrada');

    const oldName = cat.name;
    const updates = {};
    if (name !== undefined && name.trim()) updates.name = name.trim();
    if (requiereVencimiento !== undefined) updates.requiereVencimiento = !!requiereVencimiento;

    const updated = await models.Category.findOneAndUpdate(
        { _id: id }, updates, { new: true, runValidators: true }
    );

    // Si se renombró, actualizar el campo category en todos los artículos
    if (updates.name && updates.name !== oldName) {
        await models.Article.updateMany(
            { category: oldName },
            { $set: { category: updates.name } }
        );
    }

    return updated;
};

// ==========================================
// BAJA (soft-delete)
// ==========================================

/**
 * Da de baja una categoría: pone active = false para que no aparezca
 * como opción en la carga/compra de productos, pero los artículos que
 * ya la tenían asignada la conservan.
 * @param {Object} models Modelos del tenant.
 * @param {string} id ObjectId de la categoría.
 * @param {boolean} active Nuevo estado (true = reactivar, false = baja).
 * @returns {Promise<Object>} Categoría actualizada.
 * @throws {Error} 404 si no existe.
 */
const toggleCategoryActive = async (models, id, active) => {
    const cat = await models.Category.findOneAndUpdate(
        { _id: id },
        { active: !!active },
        { new: true }
    );
    if (!cat) throw new AppError(404, 'Categoría no encontrada');
    return cat;
};

// ==========================================
// ELIMINACIÓN
// ==========================================

/**
 * Elimina una categoría y quita la referencia de los artículos que la tenían.
 * @param {Object} models Modelos del tenant.
 * @param {string} id ObjectId de la categoría.
 * @throws {Error} 404 si no existe.
 */
const deleteCategory = async (models, id) => {
    const cat = await models.Category.findById(id);
    if (!cat) throw new AppError(404, 'Categoría no encontrada');

    // Quitar la categoría de los artículos que la usan
    await models.Article.updateMany(
        { category: cat.name },
        { $set: { category: '' } }
    );

    await models.Category.deleteOne({ _id: id });
};

module.exports = { getAllCategories, createCategory, updateCategory, toggleCategoryActive, deleteCategory };
