const { AppError } = require('../middlewares/error');

const VALID_TYPES = ['compra', 'mantenimiento', 'reporte', 'otro'];
const VALID_STATUS = ['pendiente', 'revision', 'aprobada', 'cerrada', 'rechazada'];

// Notas que los operarios envían al propietario (compras a rendir, reportes,
// mantenimiento, etc.) para que las revise y las cierre.

// ==========================================
// CREACIÓN
// ==========================================

/**
 * Crea una nota nueva enviada por un operario.
 * @param {Object} models Modelos del tenant.
 * @param {Object} operator Operario autenticado (req.operator): { branchId, userId }.
 * @param {Object} payload Datos de la nota: { type, title, description, supplierId, paymentMethod, items }.
 * @returns {Promise<Object>} Nota creada.
 * @throws {Error} 400 si el tipo es inválido, falta título/descripción, o el proveedor no existe.
 */
const createNote = async (models, operator, payload) => {
    const { type, title, description, supplierId, paymentMethod, items = [] } = payload || {};
    let { supplierName } = payload || {};

    if (!VALID_TYPES.includes(type)) {
        throw new AppError(400, 'Tipo de nota inválido');
    }
    if (!title?.trim()) {
        throw new AppError(400, 'La nota requiere un título');
    }
    if (!description?.trim()) {
        throw new AppError(400, 'La nota requiere una descripción');
    }

    // Si viene supplierId, el nombre se toma del proveedor registrado.
    if (supplierId) {
        const proveedor = await models.Supplier.findById(supplierId);
        if (!proveedor) throw new AppError(400, 'Proveedor inexistente');
        supplierName = proveedor.name;
    }

    const normalizedItems = Array.isArray(items)
        ? items.map((item) => ({
            articleId: item.articleId,
            name: item.name || '',
            quantity: Number(item.quantity || 0),
            unitCost: Number(item.unitCost || 0)
        }))
        : [];

    const total = normalizedItems.reduce(
        (acc, item) => acc + (Number(item.unitCost || 0) * Number(item.quantity || 0)), 0
    );

    return models.Note.create({
        branchId: operator.branchId,
        createdBy: operator.userId,
        type,
        title: title.trim(),
        description: description.trim(),
        supplierId,
        supplierName: supplierName?.trim(),
        paymentMethod,
        items: normalizedItems,
        total: Math.round(total * 100) / 100,
        status: 'pendiente'
    });
};

// ==========================================
// LECTURA
// ==========================================

/**
 * Lista las notas del tenant (vista del propietario), opcionalmente filtradas por sucursal.
 * @param {Object} models Modelos del tenant.
 * @param {Object} [filter={}]
 * @param {string} [filter.branchId]
 * @returns {Promise<Array>} Notas ordenadas por fecha descendente.
 */
const getAllNotes = async (models, { branchId } = {}) => {
    const filtro = {};
    if (branchId) filtro.branchId = branchId;
    return models.Note.find(filtro).sort({ createdAt: -1 }).populate('createdBy', 'name username');
};

/**
 * Lista las notas creadas por el operario autenticado.
 * @param {Object} models Modelos del tenant.
 * @param {Object} operator Operario autenticado: { branchId, userId }.
 * @returns {Promise<Array>} Notas del operario, ordenadas por fecha descendente.
 */
const getNotesByOperator = async (models, operator) => {
    return models.Note.find({ branchId: operator.branchId, createdBy: operator.userId })
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name username');
};

// ==========================================
// ACTUALIZACIÓN DE ESTADO
// ==========================================

/**
 * El propietario cambia el estado de una nota. Si la cierra y es una nota
 * de compra, asienta el egreso correspondiente en el libro diario.
 * @param {Object} models Modelos del tenant.
 * @param {Object} owner Propietario autenticado (no usado en la lógica, reservado para auditoría futura).
 * @param {string} id ObjectId de la nota.
 * @param {Object} data { status, ownerComment }
 * @returns {Promise<Object>} Nota actualizada.
 * @throws {Error} 400 si el estado es inválido; 404 si la nota no existe.
 */
const updateNoteStatus = async (models, owner, id, { status, ownerComment }) => {
    if (!VALID_STATUS.includes(status)) {
        throw new AppError(400, 'Estado inválido');
    }

    const note = await models.Note.findById(id);
    if (!note) throw new AppError(404, 'Nota no encontrada');

    note.status = status;
    if (ownerComment !== undefined) note.ownerComment = ownerComment;

    if (status === 'cerrada' && note.type === 'compra' && !note.ledgerEntryId) {
        const entry = await models.LedgerEntry.create({
            branchId: note.branchId,
            type: 'egreso',
            source: 'nota',
            concept: `Nota de compra ${note.title}`,
            amount: note.total,
            paymentMethod: note.paymentMethod || 'efectivo',
            purchaseId: null,
            cashSessionId: null
        });
        note.ledgerEntryId = entry._id;
        note.settledAt = new Date();
    }

    await note.save();
    return note;
};

module.exports = { createNote, getAllNotes, getNotesByOperator, updateNoteStatus };
