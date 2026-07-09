const { verifyToken } = require('@clerk/backend');
const { Organization } = require('../models');
const { getTenantModels } = require('../config/tenantManager');

// Auth del PROPIETARIO: verifica el token de sesión de Clerk y adjunta la
// organización del dueño (si ya la creó). Las rutas de gestión usan esto.
async function ownerAuth(req, res, next) {
    try {
        if (!process.env.CLERK_SECRET_KEY) {
            return res.status(503).json({
                success: false,
                code: 'CLERK_NOT_CONFIGURED',
                message: 'Clerk no está configurado en el servidor (falta CLERK_SECRET_KEY)'
            });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token no proporcionado' });
        }

        const payload = await verifyToken(authHeader.split(' ')[1], {
            secretKey: process.env.CLERK_SECRET_KEY
        });

        req.owner = { clerkUserId: payload.sub };
        req.org = await Organization.findOne({ ownerClerkId: payload.sub, active: true });
        
        if (req.org) {
            req.tenantModels = getTenantModels(req.org.adminId);
        }
        
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Sesión inválida o expirada' });
    }
}

// Exige que el propietario ya haya creado su organización.
function requireOrg(req, res, next) {
    if (!req.org || !req.tenantModels) {
        return res.status(409).json({
            success: false,
            code: 'ORG_REQUIRED',
            message: 'Primero debes crear tu organización'
        });
    }
    next();
}

module.exports = { ownerAuth, requireOrg };
