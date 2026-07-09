const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');
const controllersDir = path.join(__dirname, 'src', 'modules');

// --- 1. REFACTOR SERVICES ---
const serviceFiles = fs.readdirSync(servicesDir);
for (const file of serviceFiles) {
    if (!file.endsWith('.js')) continue;
    let content = fs.readFileSync(path.join(servicesDir, file), 'utf8');
    
    // Remove models import
    content = content.replace(/const\s*\{[^}]+\}\s*=\s*require\('\.\.\/models'\);?\n?/g, '');
    
    // Add constructor
    content = content.replace(/(class\s+[A-Za-z0-9_]+\s*\{)/, '$1\n    constructor(models) {\n        this.models = models;\n    }\n');
    
    // Remove static keyword from methods
    content = content.replace(/static\s+async/g, 'async');
    content = content.replace(/static\s+([a-zA-Z0-9_]+)\(/g, '$1(');
    
    // Replace Model.method with this.models.Model.method
    const models = ['CashSession', 'Sale', 'Purchase', 'LedgerEntry', 'Counter', 'BranchStock', 'Article', 'Branch', 'User', 'Organization'];
    for (const m of models) {
        const regex = new RegExp(`(?<!this\\.models\\.)\\b${m}\\b(?=\\.)`, 'g');
        content = content.replace(regex, `this.models.${m}`);
    }

    // Safely remove orgId fields from object literals
    // e.g., orgId: operator.orgId,
    content = content.replace(/orgId:\s*[a-zA-Z0-9_.]+\s*,?\s*/g, '');
    // e.g., orgId,
    content = content.replace(/orgId\s*,\s*/g, '');
    
    // Remove trailing commas in objects
    content = content.replace(/,\s*\}/g, '}');

    fs.writeFileSync(path.join(servicesDir, file), content);
    console.log('Refactored service:', file);
}

// --- 2. REFACTOR CONTROLLERS ---
function processControllers(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            processControllers(fullPath);
        } else if (fullPath.endsWith('.js') && item === 'routes.js') {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            if (fullPath.includes('auth')) continue;
            
            // Inject tenantModels destructuring
            content = content.replace(/async\s*\(req,\s*res,\s*next\)\s*=>\s*\{/g, 'async (req, res, next) => {\n    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};');
            
            // Refactor service calls: ServiceName.method -> new ServiceName(req.tenantModels).method
            const services = ['CashService', 'SalesService', 'PurchasesService', 'StatsService', 'StockService'];
            for (const s of services) {
                const regex = new RegExp(`\\b${s}\\.([a-zA-Z0-9_]+)\\(`, 'g');
                content = content.replace(regex, `new ${s}(req.tenantModels).$1(`);
            }
            
            // Safely remove orgId from object literals
            content = content.replace(/orgId:\s*req\.org\._id\s*,?\s*/g, '');
            content = content.replace(/orgId:\s*req\.operator\.orgId\s*,?\s*/g, '');
            content = content.replace(/orgId\s*,\s*/g, '');
            
            // Remove trailing commas in objects
            content = content.replace(/,\s*\}/g, '}');
            
            fs.writeFileSync(fullPath, content);
            console.log('Refactored controller:', fullPath);
        }
    }
}
processControllers(controllersDir);
