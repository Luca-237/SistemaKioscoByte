import { useResumen } from '../hooks/useResumen';
import { Badge } from '../components/ui/Badge';

export function ContabilidadPage() {
    const { resumen: stats, movimientos: movements, loading } = useResumen();

    if (loading) return <div>Cargando módulo contable...</div>;

    return (
        <div>
            <div className="admin-header">
                <h2>Contabilidad &amp; Finanzas</h2>
            </div>

            <div className="stats-grid">
                <div className="glass-panel stat-card">
                    <span className="stat-title">Ingresos Brutos</span>
                    <span className="stat-value success">${stats?.ingresos?.toLocaleString() || 0}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Egresos / Costos</span>
                    <span className="stat-value" style={{ color: 'var(--destructive)' }}>${stats?.egresos?.toLocaleString() || 0}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Saldo Neto Operativo</span>
                    <span className={`stat-value ${stats?.saldoNeto >= 0 ? 'success' : ''}`}>
                        ${stats?.saldoNeto?.toLocaleString() || 0}
                    </span>
                </div>
            </div>

            <div className="stats-grid">
                <div className="glass-panel stat-card" style={{ background: 'linear-gradient(135deg, rgba(90,28,228,0.08), rgba(122,66,244,0.08))' }}>
                    <span className="stat-title">Costo de Mercadería Vendida</span>
                    <span className="stat-value">${stats?.ventas?.costoMercaderia?.toLocaleString() || 0}</span>
                </div>
                <div className="glass-panel stat-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.08))' }}>
                    <span className="stat-title">Margen Bruto Real</span>
                    <span className="stat-value success">${stats?.ventas?.margenBruto?.toLocaleString() || 0}</span>
                </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '24px', color: 'var(--muted-foreground)' }}>Libro Diario (Últimos movimientos)</h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Fecha</th><th>Concepto</th><th>Tipo</th>
                                <th>Medio</th><th style={{ textAlign: 'right' }}>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--muted-foreground)' }}>No hay movimientos registrados.</td></tr>
                            ) : (
                                movements.map((m) => (
                                    <tr key={m._id}>
                                        <td>{new Date(m.createdAt).toLocaleString()}</td>
                                        <td>{m.concept}</td>
                                        <td>
                                            <Badge variant={m.type === 'ingreso' ? 'success' : 'danger'}>{m.type}</Badge>
                                        </td>
                                        <td style={{ textTransform: 'capitalize' }}>{m.paymentMethod || '-'}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: m.type === 'ingreso' ? 'var(--success)' : 'var(--destructive)' }}>
                                            {m.type === 'ingreso' ? '+' : '-'}${m.amount?.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
