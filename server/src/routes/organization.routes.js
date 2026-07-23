const express = require('express');
const { getMine, bootstrap } = require('../controllers/organization.controller');

const router = express.Router();

// La autenticación (ownerAuth) se aplica al montar este router en app.js.
router.get('/me', getMine);
router.post('/bootstrap', bootstrap);

module.exports = router;
