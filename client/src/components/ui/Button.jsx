// Botón con la misma API de props que shadcn <Button> para facilitar la migración futura.
// El contenido visual sigue usando las clases CSS actuales, no shadcn todavía.
export function Button({
    variant = 'default',
    size = 'default',
    disabled = false,
    type = 'button',
    onClick,
    className = '',
    children,
    ...props
}) {
    const variantClass = {
        default:     'btn-primario',
        outline:     'btn-outline',
        ghost:       'btn-link',
        destructive: 'btn-mini rojo',
        success:     'btn-cobrar',
        link:        'btn-link',
    }[variant] ?? 'btn-primario';

    const sizeClass = {
        sm:      'btn-sm',
        default: '',
        lg:      '',
        icon:    '',
    }[size] ?? '';

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={[variantClass, sizeClass, className].filter(Boolean).join(' ')}
            {...props}
        >
            {children}
        </button>
    );
}
