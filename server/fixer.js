const fs = require('fs');

// 1. Fix salesService.js
let file = 'c:/Users/lucam/OneDrive/Desktop/FitoShop/SistemaKioscoByte/server/src/services/salesService.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/operator\.'sale'/g, "'sale'");
content = content.replace(/StockService\.removeForSale/g, "new StockService(this.models).removeForSale");
fs.writeFileSync(file, content);

// 2. Fix purchasesService.js
file = 'c:/Users/lucam/OneDrive/Desktop/FitoShop/SistemaKioscoByte/server/src/services/purchasesService.js';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/StockService\.addFromPurchase/g, "new StockService(this.models).addFromPurchase");
fs.writeFileSync(file, content);

// 3. Fix stats/routes.js (because statsService.summary doesn't take orgId anymore)
file = 'c:/Users/lucam/OneDrive/Desktop/FitoShop/SistemaKioscoByte/server/src/modules/stats/routes.js';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/req\.org\._id,\s*req\.query/g, 'req.query');
fs.writeFileSync(file, content);
