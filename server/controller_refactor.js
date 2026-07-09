const fs = require('fs');
const path = require('path');
const controllersDir = path.join(__dirname, 'src', 'modules');

function processControllers(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            processControllers(fullPath);
        } else if (fullPath.endsWith('.js') && item === 'routes.js') {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Skip auth/routes.js since it's already handled
            if (fullPath.includes('auth')) continue;

            // Remove global models import
            content = content.replace(/const\s*\{[^}]+\}\s*=\s*require\('\.\.\/\.\.\/models'\);?\n?/g, '');
            content = content.replace(/const\s*\{[^}]+\}\s*=\s*require\('\.\.\/models'\);?\n?/g, '');
            
            // Inject tenantModels destructuring for all async route handlers
            content = content.replace(/async\s*\((req,\s*res(?:,\s*next)?)\)\s*=>\s*\{/g, 'async ($1) => {\n    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};');
            
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

// Fix Stats routes explicitly
const statsFile = path.join(__dirname, 'src', 'modules', 'stats', 'routes.js');
let statsContent = fs.readFileSync(statsFile, 'utf8');
statsContent = statsContent.replace(/req\.org\._id,\s*req\.query/g, 'req.query');
fs.writeFileSync(statsFile, statsContent);
