const express = require('express');
const { checkAccess } = require('../middlewares/checkAccess');
const { getCodes, getOperators, update } = require('../controllers/access.controller');

const router = express.Router();

// La autenticación (hybridAuth) se aplica al montar este router en app.js:
// entra cualquier propietario u operario logueado. El permiso 'access' se
// exige acá adentro, ruta por ruta, porque /codes lo necesita cualquier
// operario para armar su propio sidebar (son solo etiquetas, no exponen
// datos), mientras que administrar accesos ajenos sí requiere el permiso.

// Códigos de acceso disponibles, para que cualquier operario arme su sidebar.
router.get('/codes', getCodes);
// Operarios con sus accesos actuales: solo quien tenga el permiso 'access'.
router.get('/operators', checkAccess('access'), getOperators);
// Habilita/deshabilita un acceso puntual: body { code, enabled }.
router.patch('/operators/:id', checkAccess('access'), update);

module.exports = router;
