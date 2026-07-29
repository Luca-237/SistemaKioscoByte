const express = require('express');
const { getAll, create, update, remove } = require('../controllers/category.controller');

const router = express.Router();

// La autenticación (hybridAuth + checkAccess('articles')) se aplica al montar
// este router en app.js, porque gestionar categorías es parte de gestionar artículos.
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
