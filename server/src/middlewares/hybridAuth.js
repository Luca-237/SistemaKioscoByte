const jwt = require('jsonwebtoken');
const { operatorAuth } = require('./operatorAuth');
const { ownerAuth, requireOrg } = require('./devAuth');

// Auth combinada para rutas de "administración" a las que puede entrar tanto
// el propietario (acceso total) como un operario con permiso concedido
// (ver checkAccess.js). Mismo cambio manual que en app.js: reemplazar
// './devAuth' por './ownerAuth' cuando se conecte Clerk en producción.
//
// El token de operario es un JWT propio con { kind: 'operator', ... }; el
// del propietario es la sesión de Clerk (u otro formato en dev). Se decide
// según esa marca cuál auth aplicar.
function hybridAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const payload = jwt.decode(authHeader.split(' ')[1]);
        if (payload && payload.kind === 'operator') {
            return operatorAuth(req, res, next);
        }
    }
    return ownerAuth(req, res, () => requireOrg(req, res, next));
}

module.exports = { hybridAuth };
