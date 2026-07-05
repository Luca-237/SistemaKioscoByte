import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Cliente para el OPERARIO: usa el JWT propio guardado al loguear.
export const apiPos = axios.create({ baseURL: API_URL });

apiPos.interceptors.request.use((config) => {
    const token = localStorage.getItem('fs_operator_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

apiPos.interceptors.response.use(
    (res) => res,
    (error) => {
        // Token vencido (turno de 12h): volver al login de operario
        if (error.response?.status === 401 && localStorage.getItem('fs_operator_token')) {
            localStorage.removeItem('fs_operator_token');
            localStorage.removeItem('fs_operator');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Cliente para el PROPIETARIO: usa el token de sesión de Clerk.
export const apiOwner = axios.create({ baseURL: API_URL });

apiOwner.interceptors.request.use(async (config) => {
    const token = await window.Clerk?.session?.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
