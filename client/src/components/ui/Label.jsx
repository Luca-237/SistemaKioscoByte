// Label con estilo de campo admin. Envuelve su contenido en .admin-field para
// el espaciado y tipografía definidos en admin.css.
export function Label({ children, className = '', ...props }) {
    return (
        <label className={['admin-field', className].filter(Boolean).join(' ')} {...props}>
            {children}
        </label>
    );
}
