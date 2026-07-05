const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Organization, User, Branch } = require('../../models');

const router = express.Router();

// Login de OPERARIOS (sin Clerk). Flujo:
//   1. POST {orgCode, username, password} → si el operario tiene UNA sucursal,
//      se asigna automáticamente y devuelve el token final.
//   2. Si tiene varias → devuelve needsBranchSelection + lista; el cliente
//      repite el POST agregando branchId para elegir con cuál operar.
router.post('/operator/login', async (req, res, next) => {
    try {
        const { orgCode, username, password, branchId } = req.body;
        if (!orgCode || !username || !password) {
            return res.status(400).json({ success: false, message: 'Faltan código de empresa, usuario o contraseña' });
        }

        const org = await Organization.findOne({ code: String(orgCode).toUpperCase(), active: true });
        // Mismo mensaje para org/usuario/clave incorrectos: no filtramos qué falló
        const credencialesInvalidas = () =>
            res.status(401).json({ success: false, message: 'Credenciales inválidas' });

        if (!org) return credencialesInvalidas();

        const user = await User.findOne({
            orgId: org._id, username: String(username).toLowerCase().trim(), active: true
        });
        if (!user) return credencialesInvalidas();

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return credencialesInvalidas();

        const branches = await Branch.find({ _id: { $in: user.branchIds }, active: true })
            .select('name address');
        if (branches.length === 0) {
            return res.status(403).json({ success: false, message: 'No tienes ninguna sucursal asignada. Contacta al administrador.' });
        }

        // Resolver la sucursal activa
        let branch;
        if (branches.length === 1) {
            branch = branches[0];
        } else if (branchId) {
            branch = branches.find(b => b._id.toString() === String(branchId));
            if (!branch) {
                return res.status(403).json({ success: false, message: 'No estás asignado a esa sucursal' });
            }
        } else {
            return res.json({
                success: true,
                needsBranchSelection: true,
                branches: branches.map(b => ({ id: b._id, name: b.name, address: b.address }))
            });
        }

        const token = jwt.sign({
            kind: 'operator',
            sub: user._id.toString(),
            orgId: org._id.toString(),
            branchId: branch._id.toString(),
            username: user.username,
            name: user.name
        }, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.json({
            success: true,
            token,
            operator: {
                name: user.name,
                username: user.username,
                orgName: org.name,
                branch: { id: branch._id, name: branch.name }
            }
        });
    } catch (error) { next(error); }
});

module.exports = router;
