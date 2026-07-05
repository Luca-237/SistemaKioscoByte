// Lógica de seed reutilizable: la usa `npm run seed` (contra Atlas) y el
// modo memoria de desarrollo (auto-seed al arrancar sin MONGODB_URI).
const bcrypt = require('bcrypt');
const { Organization, Branch, User, Article } = require('../models');
const PurchasesService = require('../services/purchasesService');

async function seedDemo() {
    const existente = await Organization.findOne({ code: 'DEMO01' });
    if (existente) return false;

    const org = await Organization.create({
        name: 'Kiosco Demo', code: 'DEMO01', ownerClerkId: 'demo_owner_sin_clerk'
    });

    const [central, norte] = await Branch.create([
        { orgId: org._id, name: 'Sucursal Centro', address: 'San Martín 123' },
        { orgId: org._id, name: 'Sucursal Norte', address: 'Av. Libertad 456' }
    ]);

    await User.create([
        {
            orgId: org._id, username: 'juan', name: 'Juan Pérez',
            passwordHash: await bcrypt.hash('1234', 10),
            branchIds: [central._id]                       // una sucursal → asignación automática
        },
        {
            orgId: org._id, username: 'maria', name: 'María López',
            passwordHash: await bcrypt.hash('1234', 10),
            branchIds: [central._id, norte._id]            // dos sucursales → elige al loguear
        }
    ]);

    const articulos = await Article.create([
        { orgId: org._id, code: 'A001', barcode: '7790001000011', name: 'Coca Cola 500ml', category: 'Bebidas', salePrice: 1800 },
        { orgId: org._id, code: 'A002', barcode: '7790001000028', name: 'Alfajor Guaymallén', category: 'Golosinas', salePrice: 800 },
        { orgId: org._id, code: 'A003', barcode: '7790001000035', name: 'Papas Lays 85g', category: 'Snacks', salePrice: 2500 },
        { orgId: org._id, code: 'A004', name: 'Chicles Beldent', category: 'Golosinas', salePrice: 900 }
    ]);

    // Compra inicial → carga stock en Centro y fija los primeros costos promedio
    await PurchasesService.create(org, 'demo_owner_sin_clerk', {
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
