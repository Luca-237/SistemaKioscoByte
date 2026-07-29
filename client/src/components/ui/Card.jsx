// Card de superficie. variant="stat" agrega la barra de color izquierda usada
// en las tarjetas de resumen contable.
export function Card({ variant, accent, className = '', children, ...props }) {
    const base = variant === 'glass' ? 'glass-panel' : 'admin-card';
    const accentClass = accent ? `${accent}` : '';

    return (
        <div className={[base, accentClass, className].filter(Boolean).join(' ')} {...props}>
            {children}
        </div>
    );
}
