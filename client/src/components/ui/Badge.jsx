// Badge semántico. La prop variant mapea a los pares de color del design system.
// La API espeja shadcn <Badge variant="..."> para facilitar la migración futura.
export function Badge({ variant = 'default', className = '', children }) {
    const variantClass = {
        success: 'badge badge-success',
        warning: 'badge badge-warning',
        danger:  'badge badge-danger',
        info:    'badge badge-info',
        default: 'badge badge-primary',
    }[variant] ?? 'badge';

    return (
        <span className={[variantClass, className].filter(Boolean).join(' ')}>
            {children}
        </span>
    );
}
