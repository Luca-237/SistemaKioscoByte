const { Organization } = require('../models');
const { getTenantModels } = require('../config/tenantManager');

// Auth DEV del PROPIETARIO: bypass de Clerk para testing.
// Usa los datos demo generados por seedData.js
async function ownerAuth(req, res, next) {
    try {
        const ownerClerkId = 'demo_owner_sin_clerk';
        
        req.owner = { clerkUserId: ownerClerkId };
        req.org = await Organization.findOne({ ownerClerkId: ownerClerkId, active: true });
        
        if (req.org) {
            req.tenantModels = getTenantModels(req.org.adminId);
        }
        
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno en devAuth' });
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
