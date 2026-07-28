// Códigos de acceso a los módulos del panel de administración. Cada uno
// representa un punto de menú/grupo de endpoints que el propietario puede
// habilitar o deshabilitar por operario (ver access.service.js). El
// propietario siempre tiene acceso a todo; esta lista es la que se le
// muestra para armar el array de permisos de cada operario.
const ACCESS_CODES = [
    { code: 'articles', label: 'Artículos' },
    { code: 'branches', label: 'Sucursales' },
    { code: 'suppliers', label: 'Proveedores' },
    { code: 'purchases', label: 'Compras' },
    { code: 'notes', label: 'Notas' },
    { code: 'stats', label: 'Estadísticas' },
    { code: 'users', label: 'Operarios' },
    { code: 'access', label: 'Gestión de accesos' }
];

const ACCESS_CODE_VALUES = ACCESS_CODES.map(a => a.code);

module.exports = { ACCESS_CODES, ACCESS_CODE_VALUES };
