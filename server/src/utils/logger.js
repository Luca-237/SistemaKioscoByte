const { AppError } = require('../middlewares/error');

// Campos que nunca deben llegar a los logs en texto plano.
const CAMPOS_SENSIBLES = ['password', 'newPassword', 'passwordHash', 'token', 'authorization'];

// ==========================================
// REDACCIÓN
// ==========================================

/**
 * Enmascara los campos sensibles de un objeto plano antes de loguearlo.
 * No es recursivo: los `inputs` que se loguean son siempre payloads planos
 * de req.body/req.query, nunca estructuras anidadas con secretos adentro.
 *
 * @param {Object} obj Objeto a limpiar (típicamente req.body).
 * @returns {Object} Copia con los campos sensibles reemplazados por '***'.
 */
const redact = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const copia = { ...obj };
    for (const campo of CAMPOS_SENSIBLES) {
        if (campo in copia) copia[campo] = '***';
    }
    return copia;
};

// ==========================================
// RESPUESTA DE ERROR
// ==========================================

/**
 * Loguea un error con su contexto y datos de entrada (redactados), y responde
 * al cliente con el contrato uniforme de la API: { success: false, message, code? }.
 * Reproduce la misma clasificación que antes vivía en errorHandler:
 *   - AppError            -> status/código propios del error de negocio.
 *   - clave duplicada Mongo (code 11000) -> 409 con mensaje genérico.
 *   - cualquier otro error -> 500 con mensaje genérico (el detalle solo va a consola).
 *
 * @param {import('express').Response} res  Response de Express.
 * @param {Error} error                     Error capturado en el controller.
 * @param {Object} [meta={}]
 * @param {string} [meta.context]           "<recurso>.<accion>" para rastrear en los logs (ej: 'purchases.create').
 * @param {Object} [meta.inputs]            Datos de entrada relevantes (se redactan antes de loguear).
 */
const respondError = (res, error, { context, inputs } = {}) => {
    let status = 500;
    let message = 'Error interno del servidor';
    let code;

    if (error instanceof AppError) {
        status = error.status;
        message = error.message;
        code = error.code;
    } else if (error.code === 11000) {
        status = 409;
        message = 'Ya existe un registro con esos datos';
    }

    const prefijo = status >= 500 ? '🔴' : '⚠️';
    console.error(
        `${prefijo} [${context || 'sin-contexto'}]`,
        status >= 500 ? error : message,
        inputs ? { inputs: redact(inputs) } : ''
    );

    const body = { success: false, message };
    if (code) body.code = code;
    if (error.details) body.details = error.details;
    res.status(status).json(body);
};

module.exports = { respondError, redact };
