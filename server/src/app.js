const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { notFound, errorHandler } = require('./middlewares/error');
const { ownerAuth, requireOrg } = require('./middlewares/devAuth');
const { operatorAuth } = require('./middlewares/operatorAuth');

const authRoutes = require('./modules/auth/routes');
const organizationRoutes = require('./modules/organizations/routes');
const branchRoutes = require('./modules/branches/routes');
const userRoutes = require('./modules/users/routes');
const articleRoutes = require('./modules/articles/routes');
const purchaseRoutes = require('./modules/purchases/routes');
const posRoutes = require('./modules/pos/routes');
const statsRoutes = require('./modules/stats/routes');
const noteRoutes = require('./modules/notes/routes');

const app = express();

const origenes = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors(origenes.length ? { origin: origenes } : {}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ success: true, db: mongoose.connection.readyState === 1 });
});

// --- Rutas públicas (login de operarios) ---
app.use('/api/auth', authRoutes);

// --- Rutas del PROPIETARIO (Clerk) ---
app.use('/api/organizations', ownerAuth, organizationRoutes);
app.use('/api/branches', ownerAuth, requireOrg, branchRoutes);
app.use('/api/users', ownerAuth, requireOrg, userRoutes);
app.use('/api/articles', ownerAuth, requireOrg, articleRoutes);
app.use('/api/purchases', ownerAuth, requireOrg, purchaseRoutes);
app.use('/api/stats', ownerAuth, requireOrg, statsRoutes);
app.use('/api/notes', ownerAuth, requireOrg, noteRoutes);

// --- Rutas del OPERARIO (JWT propio): caja, ventas, catálogo con stock ---
app.use('/api/pos', operatorAuth, posRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
