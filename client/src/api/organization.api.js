import { apiOwner } from './http';

// ─── Organización ─────────────────────────────────────────────────────────────

// Obtiene los datos de la organización del propietario autenticado.
// Si no existe (primer ingreso), devuelve un error 404 que dispara el
// flujo de onboarding. Se usa en AdminArea.
export const getOrganizacion = () => apiOwner.get('/api/organizations/me');

// Crea la organización del propietario en el primer ingreso (onboarding).
// Recibe nombre y CUIT opcional. Se usa en AdminArea al enviar el formulario
// de bienvenida.
export const bootstrapOrganizacion = (name, taxId) =>
    apiOwner.post('/api/organizations/bootstrap', { name, taxId });
