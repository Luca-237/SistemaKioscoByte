const { AppError } = require('../middlewares/error');

class NoteService {
    constructor(models) {
        this.models = models;
    }

    async create(operator, payload) {
        const { type, title, description, supplierId, paymentMethod, items = [] } = payload || {};
        let { supplierName } = payload || {};
        const validTypes = ['compra', 'mantenimiento', 'reporte', 'otro'];
        if (!validTypes.includes(type)) {
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
            const proveedor = await this.models.Supplier.findById(supplierId);
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

        const total = normalizedItems.reduce((acc, item) => acc + (Number(item.unitCost || 0) * Number(item.quantity || 0)), 0);

        const note = await this.models.Note.create({
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

        return note;
    }

    async list({ branchId } = {}) {
        const filtro = {};
        if (branchId) filtro.branchId = branchId;
        return this.models.Note.find(filtro).sort({ createdAt: -1 }).populate('createdBy', 'name username');
    }

    async listByOperator(operator) {
        return this.models.Note.find({ branchId: operator.branchId, createdBy: operator.userId })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name username');
    }

    async updateStatus(owner, id, { status, ownerComment }) {
        const validStatus = ['pendiente', 'revision', 'aprobada', 'cerrada', 'rechazada'];
        if (!validStatus.includes(status)) {
            throw new AppError(400, 'Estado inválido');
        }

        const note = await this.models.Note.findById(id);
        if (!note) throw new AppError(404, 'Nota no encontrada');

        note.status = status;
        if (ownerComment !== undefined) note.ownerComment = ownerComment;

        if (status === 'cerrada' && note.type === 'compra' && !note.ledgerEntryId) {
            const entry = await this.models.LedgerEntry.create({
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
    }
}

module.exports = NoteService;
