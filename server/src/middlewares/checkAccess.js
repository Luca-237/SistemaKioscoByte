// Valida que quien hace la petición tenga permiso para entrar a un módulo
// del panel. Se usa después de hybridAuth, que ya dejó resuelto req.owner
// (propietario) o req.operator (operario) + req.tenantModels.
//
// El propietario tiene acceso total siempre. El operario solo entra si el
// código pedido está en su array `permissions`; se relee de la base en cada
// request (no del JWT) para que habilitar/deshabilitar un acceso tenga
// efecto inmediato, sin esperar a que el token expire.
function checkAccess(code) {
    return async (req, res, next) => {
        if (req.owner) return next();

        if (!req.operator || !req.tenantModels) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        try {
            const operador = await req.tenantModels.User.findById(req.operator.userId).select('permissions active');
            if (!operador || !operador.active) {
                return res.status(403).json({ success: false, message: 'Operario inactivo' });
            }
            if (!operador.permissions.includes(code)) {
                return res.status(403).json({ success: false, message: 'No tenés acceso a esta sección' });
            }
            next();
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error al validar accesos' });
        }
    };
}

module.exports = { checkAccess };
