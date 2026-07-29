// Select nativo con estilos del sistema. Mismo interface que shadcn <Select>
// (value + onValueChange) para facilitar la migración futura.
export function Select({ value, onValueChange, className = '', children, ...props }) {
    return (
        <select
            value={value}
            onChange={(e) => onValueChange?.(e.target.value)}
            className={['admin-field-select', className].filter(Boolean).join(' ')}
            {...props}
        >
            {children}
        </select>
    );
}
