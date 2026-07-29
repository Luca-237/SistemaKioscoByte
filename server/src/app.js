const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { notFound, errorHandler } = require('./middlewares/error');
const { ownerAuth, requireOrg } = require('./middlewares/devAuth');
const { operatorAuth } = require('./middlewares/operatorAuth');
const { hybridAuth } = require('./middlewares/hybridAuth');
const { checkAccess } = require('./middlewares/checkAccess');

const authRoutes = require('./routes/auth.routes');
const organizationRoutes = require('./routes/organization.routes');
const branchRoutes = require('./routes/branch.routes');
const userRoutes = require('./routes/user.routes');
const articleRoutes = require('./routes/article.routes');
const supplierRoutes = require('./routes/supplier.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const posRoutes = require('./routes/pos.routes');
const statsRoutes = require('./routes/stats.routes');
const noteRoutes = require('./routes/note.routes');
const accessRoutes = require('./routes/access.routes');
const categoryRoutes = require('./routes/category.routes');

const app = express();

const origenes = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors(origenes.length ? { origin: origenes } : {}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ success: true, db: mongoose.connection.readyState === 1 });
});

// --- Rutas públicas (login de operarios) ---
app.use('/api/auth', authRoutes);

// --- Rutas del PROPIETARIO (Clerk): identidad de la organización, exclusiva del dueño ---
app.use('/api/organizations', ownerAuth, organizationRoutes);

// --- Rutas de administración: entra el propietario (acceso total) o un
// operario con el acceso puntual habilitado (ver checkAccess). ---
app.use('/api/branches', hybridAuth, checkAccess('branches'), branchRoutes);
app.use('/api/users', hybridAuth, checkAccess('users'), userRoutes);
app.use('/api/articles', hybridAuth, checkAccess('articles'), articleRoutes);
app.use('/api/suppliers', hybridAuth, checkAccess('suppliers'), supplierRoutes);
app.use('/api/categories', hybridAuth, checkAccess('articles'), categoryRoutes);
app.use('/api/purchases', hybridAuth, checkAccess('purchases'), purchaseRoutes);
app.use('/api/stats', hybridAuth, checkAccess('stats'), statsRoutes);
app.use('/api/notes', hybridAuth, checkAccess('notes'), noteRoutes);
// El permiso 'access' se valida adentro de accessRoutes: /codes es de
// lectura libre para cualquier logueado (arma el sidebar), el resto no.
app.use('/api/access', hybridAuth, accessRoutes);

// --- Rutas del OPERARIO (JWT propio): caja, ventas, catálogo con stock ---
app.use('/api/pos', operatorAuth, posRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
