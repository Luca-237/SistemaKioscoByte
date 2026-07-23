const express = require('express');
const { operatorLogin } = require('../controllers/auth.controller');

const router = express.Router();

// Ruta pública (no requiere auth): login de operarios.
router.post('/operator/login', operatorLogin);

module.exports = router;
