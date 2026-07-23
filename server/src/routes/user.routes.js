const express = require('express');
const { getAll, create, update } = require('../controllers/user.controller');

const router = express.Router();

// La autenticación (ownerAuth + requireOrg) se aplica al montar este router
// en app.js, porque es la misma para todo el módulo.
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);

module.exports = router;
