const mongoose = require('mongoose');

// Schemas
const branchSchema = require('../models/Branch');
const userSchema = require('../models/User');
const articleSchema = require('../models/Article');
const branchStockSchema = require('../models/BranchStock');
const cashSessionSchema = require('../models/CashSession');
const saleSchema = require('../models/Sale');
const purchaseSchema = require('../models/Purchase');
const noteSchema = require('../models/Note');
const ledgerEntrySchema = require('../models/LedgerEntry');
const counterSchema = require('../models/Counter');

const tenantConnections = {};

/**
 * Mantiene y devuelve la conexión a la base de datos específica del tenant (Admin).
 * Si la conexión no existe, la crea dinámicamente con useDb.
 */
const getTenantConnection = (adminId) => {
    if (!adminId) throw new Error('adminId es requerido para obtener la conexión del tenant');

    const dbName = `tenant_${adminId}`;

    if (tenantConnections[dbName]) {
        return tenantConnections[dbName];
    }

    // useDb reusa el connection pool principal pero apunta a otra BD
    const tenantDb = mongoose.connection.useDb(dbName, { useCache: true });

    // Registrar todos los modelos del tenant en esta conexión
    tenantDb.model('Branch', branchSchema);
    tenantDb.model('User', userSchema);
    tenantDb.model('Article', articleSchema);
    tenantDb.model('BranchStock', branchStockSchema);
    tenantDb.model('CashSession', cashSessionSchema);
    tenantDb.model('Sale', saleSchema);
    tenantDb.model('Purchase', purchaseSchema);
    tenantDb.model('Note', noteSchema);
    tenantDb.model('LedgerEntry', ledgerEntrySchema);
    tenantDb.model('Counter', counterSchema);

    tenantConnections[dbName] = tenantDb;
    return tenantDb;
};

/**
 * Retorna un objeto con todos los modelos inicializados para un tenant.
 * Se inyecta como req.tenantModels en los middlewares de auth.
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
        Note: db.model('Note'),
        LedgerEntry: db.model('LedgerEntry'),
        Counter: db.model('Counter')
    };
};

module.exports = { getTenantConnection, getTenantModels };
