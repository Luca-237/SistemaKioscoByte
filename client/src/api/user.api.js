import { apiOwner } from './http';

// ─── Operarios (usuarios) ─────────────────────────────────────────────────────

// Lista todos los operarios de la organización con sus sucursales asignadas.
// Se usa en OperariosPage.
export const getUsers = () => apiOwner.get('/api/users');

// Crea un nuevo operario (nombre, usuario, contraseña, sucursales iniciales).
// Se usa en OperariosPage al enviar el formulario de alta.
export const createUser = (payload) => apiOwner.post('/api/users', payload);

// Actualización genérica de un operario. Se usa en OperariosPage para tres
// operaciones distintas según el payload:
//   • { branchIds } → reasignar sucursales
//   • { active }    → activar o desactivar el operario
//   • { newPassword } → resetear la contraseña
export const updateUser = (id, payload) => apiOwner.put(`/api/users/${id}`, payload);
