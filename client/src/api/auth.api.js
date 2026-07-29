import { apiPos } from './http';

// ─── Auth ─────────────────────────────────────────────────────────────────────

// Autenticación del operario: código de empresa + usuario + contraseña.
// Si el operario tiene varias sucursales devuelve { needsBranchSelection, branches };
// si tiene una sola, devuelve { token, operator } directamente.
// Se usa en LoginOperario.
export const loginOperario = (orgCode, username, password, branchId = undefined) =>
    apiPos.post('/api/auth/operator/login', { orgCode, username, password, branchId });
