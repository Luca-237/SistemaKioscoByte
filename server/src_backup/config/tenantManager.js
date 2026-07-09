const mongoose = require('mongoose');

const Organization = require('../models/Organization');

const tenantConnections = {};

/**
 * Mantiene y devuelve la conexión a la base de datos específica del inquilino (Admin).
 * Si la conexión no existe, la crea dinámicamente.
 * 
 * @param {string} adminId - El ID del administrador provisto por Clerk.
 * @returns {mongoose.Connection}
 */
const getTenantConnection = (adminId) => {
    // Si adminId está vacío o no es string válido, lanzar error
    if (!adminId) throw new Error('adminId es requerido para obtener la conexión del tenant');

    const dbName = `tenant_${adminId}`;

    if (tenantConnections[dbName]) {
        return tenantConnections[dbName];
    }

    // useDb reusa el connection pool principal pero apunta a otra BD
    const tenantDb = mongoose.connection.useDb(dbName, { useCache: true });

    // Registrar todos los modelos del tenant en esta conexión
    tenantDb.model('Branch', require('../models/Branch'));
    tenantDb.model('User', require('../models/User'));
    tenantDb.model('Article', require('../models/Article'));
    tenantDb.model('BranchStock', require('../models/BranchStock'));
    tenantDb.model('CashSession', require('../models/CashSession'));
    tenantDb.model('Sale', require('../models/Sale'));
    tenantDb.model('Purchase', require('../models/Purchase'));
    tenantDb.model('LedgerEntry', require('../models/LedgerEntry'));
    tenantDb.model('Counter', require('../models/Counter'));

    tenantConnections[dbName] = tenantDb;
    return tenantDb;
};

/**
 * Retorna un objeto con todos los modelos inicializados para un tenant.
 * Útil para pasarlo en el req (ej: req.models.Article)
 */
const getTenantModels = (adminId) => {
    const db = getTenantConnection(adminId);
    return {
        Branch: db.model('Branch'),
        User: db.model('User'),
        Article: db.model('Article'),
        BranchStock: db.model('BranchStock'),
        CashSession: db.model('CashSession'),
        Sale: db.model('Sale'),
        Purchase: db.model('Purchase'),
        LedgerEntry: db.model('LedgerEntry'),
        Counter: db.model('Counter')
    };
};

module.exports = { getTenantConnection, getTenantModels, Organization };
