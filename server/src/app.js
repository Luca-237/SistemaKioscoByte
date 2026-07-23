const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { notFound, errorHandler } = require('./middlewares/error');
const { ownerAuth, requireOrg } = require('./middlewares/devAuth');
const { operatorAuth } = require('./middlewares/operatorAuth');

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
app.use('/api/suppliers', ownerAuth, requireOrg, supplierRoutes);
app.use('/api/purchases', ownerAuth, requireOrg, purchaseRoutes);
app.use('/api/stats', ownerAuth, requireOrg, statsRoutes);
app.use('/api/notes', ownerAuth, requireOrg, noteRoutes);

// --- Rutas del OPERARIO (JWT propio): caja, ventas, catálogo con stock ---
app.use('/api/pos', operatorAuth, posRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
