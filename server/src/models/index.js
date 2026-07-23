// Punto único de importación de schemas.
// En multi-tenant, estos schemas se registran como modelos en cada conexión
// de tenant a través de tenantManager.js. Organization es el único modelo
// global (vive en la BD principal).
module.exports = {
    Organization: require('./organization'),
    // Los siguientes exportan SCHEMAS (no modelos compilados).
    // Se usan en tenantManager para registrarlos en cada BD de tenant.
    BranchSchema: require('./branch'),
    UserSchema: require('./user'),
    ArticleSchema: require('./article'),
    BranchStockSchema: require('./branchStock'),
    CashSessionSchema: require('./cashSession'),
    SaleSchema: require('./sale'),
    SupplierSchema: require('./supplier'),
    PurchaseSchema: require('./purchase'),
    NoteSchema: require('./note'),
    LedgerEntrySchema: require('./ledgerEntry'),
    CounterSchema: require('./counter')
};
