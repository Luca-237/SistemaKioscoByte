const express = require('express');
const { getForOperator } = require('../controllers/article.controller');
const { getOpen, open, close, getLastClosed } = require('../controllers/cash.controller');
const { create: createSale, getCurrentSession, getRecent } = require('../controllers/sale.controller');
const { getAll: getSuppliers } = require('../controllers/supplier.controller');
const { create: createNote, getMine: getMyNotes } = require('../controllers/note.controller');

const router = express.Router();

// Fachada de rutas para el OPERARIO (req.operator: su organización y su
// sucursal activa ya vienen en el token). No es un recurso propio: cada
// handler vive en el controller de su dominio (article/cash/sale/supplier/note);
// acá solo se exponen bajo el prefijo /api/pos.

// Catálogo con existencias de MI sucursal (para la grilla del punto de venta).
router.get('/articles', getForOperator);

// Estado y operación de la caja de mi sucursal.
router.get('/cash', getOpen);
router.post('/cash/open', open);
router.post('/cash/close', close);
router.get('/cash/last-session/:branchId', getLastClosed);

// Proveedores activos: el operario los necesita para las notas de compra.
router.get('/suppliers', getSuppliers);

// Notas que el operario envía al propietario.
router.post('/notes', createNote);
router.get('/notes/mine', getMyNotes);

// Ventas: registrar, ver el turno actual, ver recientes de una sucursal.
router.post('/sales', createSale);
router.get('/sales', getCurrentSession);
router.get('/sales/recent/:branchId', getRecent);

module.exports = router;
