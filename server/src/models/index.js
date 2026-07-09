// Punto único de importación de schemas.
// En multi-tenant, estos schemas se registran como modelos en cada conexión
// de tenant a través de tenantManager.js. Organization es el único modelo
// global (vive en la BD principal).
module.exports = {
    Organization: require('./Organization'),
    // Los siguientes exportan SCHEMAS (no modelos compilados).
    // Se usan en tenantManager para registrarlos en cada BD de tenant.
    BranchSchema: require('./Branch'),
    UserSchema: require('./User'),
    ArticleSchema: require('./Article'),
    BranchStockSchema: require('./BranchStock'),
    CashSessionSchema: require('./CashSession'),
    SaleSchema: require('./Sale'),
    PurchaseSchema: require('./Purchase'),
    LedgerEntrySchema: require('./LedgerEntry'),
    CounterSchema: require('./Counter')
};
