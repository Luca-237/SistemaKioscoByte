import { useResumen } from '../hooks/useResumen';

export function VentaPage() {
    const { resumen, loading } = useResumen();

    if (loading) return <div>Cargando estadísticas de venta...</div>;

    return (
        <div>
            <div className="admin-header">
                <h2>Panel de Ventas</h2>
            </div>

            <div className="stats-grid">
                <div className="glass-panel stat-card">
                    <span className="stat-title">Facturación Total</span>
                    <span className="stat-value primary">${resumen?.ventas?.facturado?.toLocaleString() || 0}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Tickets Emitidos</span>
                    <span className="stat-value">{resumen?.ventas?.cantidadTickets || 0}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Unidades Vendidas</span>
                    <span className="stat-value">{resumen?.ventas?.unidades || 0}</span>
                </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '32px' }}>
                <h3>Ir al Punto de Venta</h3>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: '16px' }}>
                    Para registrar ventas como operario, ingresá a la terminal de Punto de Venta (POS).
                </p>
                <button
                    onClick={() => window.open('/login', '_blank')}
                    style={{ padding: '12px 24px', background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 'bold' }}
                >
                    Abrir Terminal POS
                </button>
            </div>
        </div>
    );
}
