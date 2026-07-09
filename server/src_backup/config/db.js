const mongoose = require('mongoose');

// Conexión a MongoDB. Prioridad:
//   1. MONGODB_URI (Atlas) — obligatoria en producción.
//   2. Sin URI en desarrollo: base en memoria (mongodb-memory-server) con
//      replica set, para poder desarrollar y probar transacciones sin Atlas.
async function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (uri) {
        await mongoose.connect(uri);
        console.log('✅ Conectado a MongoDB (Atlas)');
        return;
    }

    if (process.env.NODE_ENV === 'production') {
        console.error('❌ ERROR CRÍTICO: falta MONGODB_URI en producción');
        process.exit(1);
    }

    console.warn('⚠️  Sin MONGODB_URI: levantando MongoDB EN MEMORIA (solo desarrollo, los datos se pierden al apagar)');

    // Workaround para esta máquina de dev: el CPU (Celeron sin AVX) obliga a
    // MongoDB 4.4, que necesita OpenSSL 1.1. Si server/.devlibs existe (con
    // libcrypto/libssl 1.1 extraídas), se la pasamos al mongod hijo.
    const path = require('path');
    const fs = require('fs');
    const devlibs = path.join(__dirname, '../../.devlibs');
    if (fs.existsSync(devlibs)) {
        process.env.LD_LIBRARY_PATH = devlibs + (process.env.LD_LIBRARY_PATH ? `:${process.env.LD_LIBRARY_PATH}` : '');
    }

    const { MongoMemoryReplSet } = require('mongodb-memory-server');
    const replSet = await MongoMemoryReplSet.create({
        // wiredTiger: necesario para transacciones y retryable writes
        replSet: { count: 1, storageEngine: 'wiredTiger' },
        // MongoDB 4.4: último binario que corre en CPUs sin AVX (5.0+ lo exige)
        binary: { version: '4.4.29' }
    });
    await mongoose.connect(replSet.getUri());
    console.log('✅ Conectado a MongoDB en memoria');

    // En memoria arrancamos siempre con los datos demo para poder trabajar
    const { seedDemo } = require('../scripts/seedData');
    await seedDemo();
}

module.exports = { connectDB };
