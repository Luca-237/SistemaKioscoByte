const express = require('express');
const { getAll, create, update, deactivate } = require('../controllers/branch.controller');

const router = express.Router();

// La autenticación (ownerAuth + requireOrg) se aplica al montar este router
// en app.js, porque es la misma para todo el módulo.
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deactivate);

module.exports = router;
