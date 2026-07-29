// Placeholder de carga. Se reemplazará por shadcn <Skeleton> en la migración.
export function Skeleton({ className = '' }) {
    return (
        <div
            className={['admin-cargando', className].filter(Boolean).join(' ')}
            aria-busy="true"
        >
            Cargando…
        </div>
    );
}
