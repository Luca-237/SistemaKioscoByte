const express = require('express');

const router = express.Router();

router.get('/', async (req, res, next) => {
    const { Supplier } = req.tenantModels || {};
    try {
        const suppliers = await Supplier.find({ active: true }).sort({ name: 1 });
        res.json({ success: true, data: suppliers });
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    const { Supplier } = req.tenantModels || {};
    try {
        const { name, contactName, phone, email, address, cuit, notes } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'El nombre del proveedor es obligatorio' });
        }
        const supplier = await Supplier.create({ name: name.trim(), contactName, phone, email, address, cuit, notes });
        res.status(201).json({ success: true, data: supplier });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Ya existe un proveedor con ese nombre' });
        }
        next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    const { Supplier } = req.tenantModels || {};
    try {
        const { name, contactName, phone, email, address, cuit, notes } = req.body;
        const supplier = await Supplier.findOneAndUpdate(
            { _id: req.params.id },
            { name, contactName, phone, email, address, cuit, notes },
            { new: true, runValidators: true }
        );
        if (!supplier) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
        res.json({ success: true, data: supplier });
    } catch (error) { next(error); }
});

// Baja lógica: el proveedor deja de aparecer al cargar compras pero su historial queda.
router.delete('/:id', async (req, res, next) => {
    const { Supplier } = req.tenantModels || {};
    try {
        const supplier = await Supplier.findOneAndUpdate(
            { _id: req.params.id },
            { active: false },
            { new: true }
        );
        if (!supplier) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
        res.json({ success: true, message: 'Proveedor dado de baja' });
    } catch (error) { next(error); }
});

module.exports = router;
