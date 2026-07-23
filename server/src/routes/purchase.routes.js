const express = require('express');
const { getAll, create } = require('../controllers/purchase.controller');

const router = express.Router();

// La autenticación (ownerAuth + requireOrg) se aplica al montar este router
// en app.js, porque es la misma para todo el módulo.
router.get('/', getAll);
router.post('/', create);

module.exports = router;
