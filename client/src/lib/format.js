// Formatea un número como moneda argentina. Usada en todas las páginas del admin y POS.
export const fmt = (n) =>
    `$${Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Formatea una fecha ISO como "dd/mm, HH:MM".
export const fmtFecha = (d) =>
    new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

// Formatea un mes "YYYY-MM" como "enero 2026".
export const fmtMes = (month) => {
    if (!month) return '—';
    const [year, monthNum] = String(month).split('-');
    return new Date(Number(year), Number(monthNum) - 1, 1)
        .toLocaleString('es-AR', { month: 'long', year: 'numeric' });
};
