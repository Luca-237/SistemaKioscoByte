// Punto único de importación de modelos.
// Todos los documentos de negocio llevan orgId: es la clave del multi-tenant
// (una sola base para todos los clientes, aislados por organización).
module.exports = {
    Organization: require('./Organization'),
    Branch: require('./Branch'),
    User: require('./User'),
    Article: require('./Article'),
    BranchStock: require('./BranchStock'),
    CashSession: require('./CashSession'),
    Sale: require('./Sale'),
    Purchase: require('./Purchase'),
    LedgerEntry: require('./LedgerEntry'),
    Counter: require('./Counter')
};
