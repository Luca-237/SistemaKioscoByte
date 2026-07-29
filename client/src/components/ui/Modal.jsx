// Modal genérico con overlay. Cierra al hacer click fuera del panel.
// La API (open, onClose, children) espeja shadcn <Dialog> para facilitar
// la migración futura.
export function Modal({ open, onClose, className = '', children }) {
    if (!open) return null;

    return (
        <div
            className="pos-modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div className={['pos-modal', className].filter(Boolean).join(' ')}>
                {children}
            </div>
        </div>
    );
}
