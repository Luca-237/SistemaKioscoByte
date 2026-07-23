const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Organization } = require('../models');
const { getTenantModels } = require('../config/tenantManager');
const { AppError } = require('../middlewares/error');

// ==========================================
// LOGIN DE OPERARIOS
// ==========================================

/**
 * Login de un operario (sin Clerk): código de empresa + usuario + clave.
 * Flujo:
 *   1. Si el operario tiene UNA sola sucursal, se asigna automáticamente y
 *      devuelve el token final.
 *   2. Si tiene varias y no vino `branchId`, devuelve
 *      { needsBranchSelection: true, branches } para que el cliente elija
 *      y repita el login agregando branchId.
 *
 * @param {Object} data Datos del login: { orgCode, username, password, branchId }.
 * @returns {Promise<Object>} { needsBranchSelection, branches } o { token, operator }.
 * @throws {Error} 400 si faltan datos; 401 si las credenciales son inválidas;
 *                 403 si no tiene sucursal asignada o eligió una que no es suya.
 */
const operatorLogin = async ({ orgCode, username, password, branchId }) => {
    if (!orgCode || !username || !password) {
        throw new AppError(400, 'Faltan código de empresa, usuario o contraseña');
    }

    const org = await Organization.findOne({ code: String(orgCode).toUpperCase(), active: true });
    // Mismo mensaje para org/usuario/clave incorrectos: no filtramos qué falló.
    const credencialesInvalidas = () => new AppError(401, 'Credenciales inválidas');

    if (!org) throw credencialesInvalidas();

    const tenantModels = getTenantModels(org.adminId);
    const { User, Branch } = tenantModels;

    const user = await User.findOne({
        username: String(username).toLowerCase().trim(), active: true
    });
    if (!user) throw credencialesInvalidas();

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw credencialesInvalidas();

    const branches = await Branch.find({ _id: { $in: user.branchIds }, active: true })
        .select('name address');
    if (branches.length === 0) {
        throw new AppError(403, 'No tienes ninguna sucursal asignada. Contacta al administrador.');
    }

    // Resolver la sucursal activa.
    let branch;
    if (branches.length === 1) {
        branch = branches[0];
    } else if (branchId) {
        branch = branches.find(b => b._id.toString() === String(branchId));
        if (!branch) throw new AppError(403, 'No estás asignado a esa sucursal');
    } else {
        return {
            needsBranchSelection: true,
            branches: branches.map(b => ({ id: b._id, name: b.name, address: b.address }))
        };
    }

    const token = jwt.sign({
        kind: 'operator',
        sub: user._id.toString(),
        orgId: org._id.toString(),
        adminId: org.adminId,
        branchId: branch._id.toString(),
        username: user.username,
        name: user.name
    }, process.env.JWT_SECRET, { expiresIn: '12h' });

    return {
        token,
        operator: {
            name: user.name,
            username: user.username,
            orgName: org.name,
            branchId: branch._id.toString(),
            branch: { id: branch._id, name: branch.name }
        }
    };
};

module.exports = { operatorLogin };
