// Corre el seed demo contra la BD configurada en .env (Atlas):
//   npm run seed
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { seedDemo } = require('./seedData');

connectDB()
    .then(async () => {
        const creado = await seedDemo();
        if (!creado) console.log('⚠️  La organización DEMO01 ya existe. Nada que hacer.');
    })
    .catch(e => { console.error('❌ Error en seed:', e); process.exitCode = 1; })
    .finally(() => mongoose.connection.close());
