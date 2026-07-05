const jwt = require('jsonwebtoken');

// Auth del OPERARIO: JWT propio emitido en /api/auth/operator/login.
// El token ya trae la sucursal activa elegida al loguear.
function operatorAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }

    try {
        const payload = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        if (payload.kind !== 'operator') throw new Error('tipo de token inválido');
        req.operator = {
            userId: payload.sub,
            orgId: payload.orgId,
            branchId: payload.branchId,
            username: payload.username,
            name: payload.name
        };
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
}

module.exports = { operatorAuth };
