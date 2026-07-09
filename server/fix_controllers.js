const fs = require('fs');
const path = require('path');
const controllersDir = 'c:/Users/lucam/OneDrive/Desktop/FitoShop/SistemaKioscoByte/server/src/modules';

function processControllers(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            processControllers(fullPath);
        } else if (fullPath.endsWith('.js') && item === 'routes.js') {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (fullPath.includes('auth')) continue;
            
            // Remove global models import if it exists
            content = content.replace(/const\s*\{[^}]+\}\s*=\s*require\('\.\.\/\.\.\/models'\);?\n?/g, '');
            
            // Remove duplicate tenantModels injection
            const injection = "    const { Branch, User, Article, BranchStock, CashSession, Sale, Purchase, LedgerEntry, Counter } = req.tenantModels || {};\n";
            content = content.replace(new RegExp(injection + injection, 'g'), injection);
            
            fs.writeFileSync(fullPath, content);
            console.log('Fixed:', fullPath);
        }
    }
}
processControllers(controllersDir);
