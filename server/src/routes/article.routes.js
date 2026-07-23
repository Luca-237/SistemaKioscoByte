const express = require('express');
const { getAll, create, update, deactivate, setStock } = require('../controllers/article.controller');

const router = express.Router();

// La autenticación (ownerAuth + requireOrg) se aplica al montar este router
// en app.js, porque es la misma para todo el módulo.

// Catálogo del propietario. ?branchId=... agrega existencias de esa sucursal.
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.patch('/:id/stock', setStock);
router.delete('/:id', deactivate);

module.exports = router;
