// Lógica de seed reutilizable: la usa `npm run seed` (contra Atlas) y el
// modo memoria de desarrollo (auto-seed al arrancar sin MONGODB_URI).
const bcrypt = require('bcrypt');
const { Organization } = require('../models');
const { getTenantModels } = require('../config/tenantManager');
const PurchasesService = require('../services/purchasesService');

async function seedDemo() {
    const existente = await Organization.findOne({ code: 'DEMO01' });
    if (existente) return false;

    const org = await Organization.create({
        adminId: 'demo_admin', name: 'Kiosco Demo', code: 'DEMO01', ownerClerkId: 'demo_owner_sin_clerk'
    });

    const tenantModels = getTenantModels(org._id);
    const { Branch, User, Article } = tenantModels;

    const [central, norte] = await Branch.create([
        { name: 'Sucursal Centro', address: 'San Martín 123' },
        { name: 'Sucursal Norte', address: 'Av. Libertad 456' }
    ]);

    await User.create([
        {
            username: 'juan', name: 'Juan Pérez',
            passwordHash: await bcrypt.hash('1234', 10),
            branchIds: [central._id]                       // una sucursal → asignación automática
        },
        {
            username: 'maria', name: 'María López',
            passwordHash: await bcrypt.hash('1234', 10),
            branchIds: [central._id, norte._id]            // dos sucursales → elige al loguear
        }
    ]);

    const articulos = await Article.create([
        { code: 'A001', barcode: '7790001000011', name: 'Coca Cola 500ml', category: 'Bebidas', salePrice: 1800 },
        { code: 'A002', barcode: '7790001000028', name: 'Alfajor Guaymallén', category: 'Golosinas', salePrice: 800 },
        { code: 'A003', barcode: '7790001000035', name: 'Papas Lays 85g', category: 'Snacks', salePrice: 2500 },
        { code: 'A004', name: 'Chicles Beldent', category: 'Golosinas', salePrice: 900 }
    ]);

    // Compra inicial → carga stock en Centro y fija los primeros costos promedio
    await new PurchasesService(tenantModels).create('demo_owner_sin_clerk', {
        branchId: central._id,
        supplierName: 'Distribuidora Demo',
        paymentMethod: 'transferencia',
        items: [
            { articleId: articulos[0]._id, quantity: 24, unitCost: 1100 },
            { articleId: articulos[1]._id, quantity: 50, unitCost: 450 },
            { articleId: articulos[2]._id, quantity: 30, unitCost: 1600 },
            { articleId: articulos[3]._id, quantity: 40, unitCost: 500 }
        ]
    });

    console.log('🌱 Datos demo: empresa DEMO01 — operarios juan/1234 (Centro) y maria/1234 (Centro+Norte)');
    return true;
}

module.exports = { seedDemo };
