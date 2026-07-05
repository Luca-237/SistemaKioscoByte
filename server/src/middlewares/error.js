// Error de negocio con código HTTP: los services lanzan esto y el handler
// central lo traduce. Cualquier otro error es un 500 sin detalles internos.
class AppError extends Error {
    constructor(status, message, code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

function notFound(req, res) {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.status).json({ success: false, message: err.message, code: err.code });
    }
    if (err.code === 11000) {  // clave duplicada de Mongo
        return res.status(409).json({ success: false, message: 'Ya existe un registro con esos datos' });
    }
    console.error('❌ Error no manejado:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
}

module.exports = { AppError, notFound, errorHandler };
