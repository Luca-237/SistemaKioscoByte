const express = require('express');
const { getAll, getMine, create, updateStatus } = require('../controllers/note.controller');

const router = express.Router();

// La autenticación (ownerAuth + requireOrg) se aplica al montar este router
// en app.js, porque es la misma para todo el módulo.
router.get('/', getAll);
router.get('/mine', getMine);
router.post('/', create);
router.put('/:id/status', updateStatus);

module.exports = router;
