// Estado vacío estándar: ícono + mensaje + acción opcional.
// Reemplaza los "Catálogo vacío." sueltos en las páginas.
export function EmptyState({ message = 'Sin resultados.', action }) {
    return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p className="muted" style={{ marginBottom: action ? 16 : 0 }}>{message}</p>
            {action}
        </div>
    );
}
