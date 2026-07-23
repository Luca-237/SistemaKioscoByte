const mongoose = require('mongoose');

// Schemas
const branchSchema = require('../models/branch');
const userSchema = require('../models/user');
const articleSchema = require('../models/article');
const branchStockSchema = require('../models/branchStock');
const cashSessionSchema = require('../models/cashSession');
const saleSchema = require('../models/sale');
const supplierSchema = require('../models/supplier');
const purchaseSchema = require('../models/purchase');
const noteSchema = require('../models/note');
const ledgerEntrySchema = require('../models/ledgerEntry');
const counterSchema = require('../models/counter');

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
    tenantDb.model('Supplier', supplierSchema);
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
        Supplier: db.model('Supplier'),
        Purchase: db.model('Purchase'),
        Note: db.model('Note'),
        LedgerEntry: db.model('LedgerEntry'),
        Counter: db.model('Counter')
    };
};

module.exports = { getTenantConnection, getTenantModels };
