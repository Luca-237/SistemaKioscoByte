import { NavLink } from 'react-router-dom';

// Sidebar glassmorphism del admin. Recibe los ítems de nav y el contenido del footer.
// Extrae el markup repetido en AdminArea y PanelOperario.
export function Sidebar({ brand, items = [], footer }) {
    return (
        <aside className="admin-sidebar">
            <div className="admin-brand">{brand}</div>

            <nav className="admin-nav">
                {items.map((item) =>
                    item.href ? (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.end}
                            className="nav-link"
                        >
                            {item.label}
                        </NavLink>
                    ) : (
                        <button
                            key={item.key}
                            className={`nav-link${item.active ? ' active' : ''}`}
                            style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', font: 'inherit', cursor: 'pointer' }}
                            onClick={item.onClick}
                        >
                            {item.label}
                        </button>
                    )
                )}
            </nav>

            {footer && <div style={{ marginTop: 'auto' }}>{footer}</div>}
        </aside>
    );
}
