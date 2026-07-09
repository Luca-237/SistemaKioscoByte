const express = require('express');
const bcrypt = require('bcrypt');


const router = express.Router();

// Valida que todas las sucursales a asignar pertenezcan a la organización.
async function validarBranches(branchIds = []) {
    if (!branchIds.length) return [];
    const propias = await Branch.find({ _id: { $in: branchIds }, active: true }).select('_id');
    return propias.map(b => b._id);
}

router.get('/', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const users = await User.find({ })
            .select('-passwordHash')
            .populate('branchIds', 'name')
            .sort({ name: 1 });
        res.json({ success: true, data: users });
    } catch (error) { next(error); }
});

// El propietario crea un operario con usuario + clave y sucursales asignadas.
router.post('/', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const { username, password, name, branchIds } = req.body;
        if (!username || !password || !name) {
            return res.status(400).json({ success: false, message: 'Faltan usuario, contraseña o nombre' });
        }
        if (String(password).length < 4) {
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 4 caracteres' });
        }

        const user = await User.create({
            username: String(username).toLowerCase().trim(),
            passwordHash: await bcrypt.hash(String(password), 10),
            name: name.trim(),
            branchIds: await validarBranches(req.org._id, branchIds)
        });

        const { passwordHash, ...safe } = user.toObject();
        res.status(201).json({ success: true, data: safe });
    } catch (error) { next(error); }
});

// Editar operario: nombre, sucursales, estado y (opcional) resetear clave.
router.put('/:id', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        const { name, branchIds, active, newPassword } = req.body;
        const update = {};
        if (name !== undefined) update.name = name;
        if (active !== undefined) update.active = active;
        if (branchIds !== undefined) update.branchIds = await validarBranches(req.org._id, branchIds);
        if (newPassword) {
            if (String(newPassword).length < 4) {
                return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 4 caracteres' });
            }
            update.passwordHash = await bcrypt.hash(String(newPassword), 10);
        }

        const user = await User.findOneAndUpdate(
            { _id: req.params.id},
            update,
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ success: false, message: 'Operario no encontrado' });
        res.json({ success: true, data: user });
    } catch (error) { next(error); }
});

module.exports = router;
