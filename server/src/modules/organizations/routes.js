const express = require('express');
const crypto = require('crypto');


const router = express.Router();

// Código corto y legible para que los operarios identifiquen la empresa al loguear.
function generarCodigo() {
    return crypto.randomBytes(3).toString('hex').toUpperCase(); // ej: "A3F9C1"
}

// Estado de la organización del propietario logueado (Clerk).
router.get('/me', async (req, res) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    if (!req.org) {
        return res.json({ success: true, org: null });
    }
    const branches = await Branch.countDocuments({ active: true });
    res.json({
        success: true,
        org: {
            id: req.org._id, name: req.org.name, code: req.org.code,
            taxId: req.org.taxId, branchCount: branches
        }
    });
});

// Onboarding: el propietario crea su empresa la primera vez que entra.
router.post('/bootstrap', async (req, res, next) => {
    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};
    try {
        if (req.org) {
            return res.status(409).json({ success: false, message: 'Ya tienes una organización creada' });
        }
        const { name, taxId } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'El nombre de la empresa es obligatorio' });
        }

        let org;
        // Reintenta si colisiona el código generado (unique index)
        for (let intento = 0; intento < 3; intento++) {
            try {
                org = await Organization.create({
                    name: name.trim(), taxId,
                    code: generarCodigo(),
                    ownerClerkId: req.owner.clerkUserId
                });
                break;
            } catch (e) {
                if (e.code === 11000 && e.keyPattern?.code && intento < 2) continue;
                throw e;
            }
        }

        res.status(201).json({ success: true, org: { id: org._id, name: org.name, code: org.code } });
    } catch (error) { next(error); }
});

module.exports = router;
