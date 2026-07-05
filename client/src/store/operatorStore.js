import { create } from 'zustand';

// Sesión del operario (JWT propio, independiente de Clerk).
export const useOperatorStore = create((set) => ({
    token: localStorage.getItem('fs_operator_token') || null,
    operator: JSON.parse(localStorage.getItem('fs_operator') || 'null'),

    login: (token, operator) => {
        localStorage.setItem('fs_operator_token', token);
        localStorage.setItem('fs_operator', JSON.stringify(operator));
        set({ token, operator });
    },

    logout: () => {
        localStorage.removeItem('fs_operator_token');
        localStorage.removeItem('fs_operator');
        set({ token: null, operator: null });
    }
}));
