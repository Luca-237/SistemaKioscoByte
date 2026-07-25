const express = require('express');
const { getCodes, getOperators, update } = require('../controllers/access.controller');

const router = express.Router();

// La autenticación (hybridAuth + checkAccess('access')) se aplica al montar
// este router en app.js: entra el propietario o un operario con ese acceso.

// Códigos de acceso disponibles, para armar la pantalla de gestión.
router.get('/codes', getCodes);
// Operarios con sus accesos actuales.
router.get('/operators', getOperators);
// Habilita/deshabilita un acceso puntual: body { code, enabled }.
router.patch('/operators/:id', update);

module.exports = router;
