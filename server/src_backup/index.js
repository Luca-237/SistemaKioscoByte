const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 4000;

connectDB()
    .then(() => {
        app.listen(PORT, () => console.log(`🚀 FitoShop API corriendo en el puerto ${PORT}`));
    })
    .catch((err) => {
        console.error('❌ No se pudo conectar a la base de datos:', err.message);
        process.exit(1);
    });
