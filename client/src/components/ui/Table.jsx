// Tabla con estilo del design system. compact reduce el padding de celdas.
export function Table({ compact = false, className = '', children }) {
    return (
        <table className={['admin-table', compact ? 'compacta' : '', className].filter(Boolean).join(' ')}>
            {children}
        </table>
    );
}

export function Th({ className = '', children, ...props }) {
    return <th className={className} {...props}>{children}</th>;
}

export function Td({ className = '', children, ...props }) {
    return <td className={className} {...props}>{children}</td>;
}
