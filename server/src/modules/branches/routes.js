const express = require('express');


const router = express.Router();

router.get('/', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const branches = await Branch.find({ active: true }).sort({ name: 1 });
        res.json({ success: true, data: branches });
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const { name, address, phone } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'El nombre de la sucursal es obligatorio' });
        }
        const branch = await Branch.create({ name: name.trim(), address, phone });
        res.status(201).json({ success: true, data: branch });
    } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const { name, address, phone } = req.body;
        const branch = await Branch.findOneAndUpdate(
            { _id: req.params.id},
            { name, address, phone },
            { new: true, runValidators: true }
        );
        if (!branch) return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        res.json({ success: true, data: branch });
    } catch (error) { next(error); }
});

// Baja lógica: la sucursal deja de operar pero su historial queda.
router.delete('/:id', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const branch = await Branch.findOneAndUpdate(
            { _id: req.params.id},
            { active: false },
            { new: true }
        );
        if (!branch) return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        // La desasignamos de los operarios para que no aparezca al loguear
        await User.updateMany({ }, { $pull: { branchIds: branch._id } });
        res.json({ success: true, message: 'Sucursal dada de baja' });
    } catch (error) { next(error); }
});

module.exports = router;
