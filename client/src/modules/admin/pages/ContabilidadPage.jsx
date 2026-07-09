import { useState, useEffect } from 'react';
import { apiOwner } from '../../../api/http';

export function ContabilidadPage() {
    const [stats, setStats] = useState(null);
    const [movements, setMovements] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarData = async () => {
            try {
                const [resStats, resMov] = await Promise.all([
                    apiOwner.get('/api/stats/summary'),
                    apiOwner.get('/api/stats/movements')
                ]);
                setStats(resStats.data.data);
                setMovements(resMov.data.data || []);
            } catch (err) {
                console.error('Error cargando contabilidad:', err);
            } finally {
                setCargando(false);
            }
        };
        cargarData();
    }, []);

    if (cargando) return <div>Cargando módulo contable...</div>;

    return (
        <div>
            <div className="admin-header">
                <h2>Contabilidad & Finanzas</h2>
            </div>
            
            <div className="stats-grid">
                <div className="glass-panel stat-card">
                    <span className="stat-title">Ingresos Brutos</span>
                    <span className="stat-value success">${stats?.ingresos?.toLocaleString() || 0}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Egresos / Costos</span>
                    <span className="stat-value" style={{ color: 'var(--danger)' }}>${stats?.egresos?.toLocaleString() || 0}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Saldo Neto Operativo</span>
                    <span className={`stat-value ${stats?.saldoNeto >= 0 ? 'success' : ''}`}>
                        ${stats?.saldoNeto?.toLocaleString() || 0}
                    </span>
                </div>
            </div>

            <div className="stats-grid">
                <div className="glass-panel stat-card" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(67, 56, 202, 0.1))' }}>
                    <span className="stat-title">Costo de Mercadería Vendida</span>
                    <span className="stat-value">${stats?.ventas?.costoMercaderia?.toLocaleString() || 0}</span>
                </div>
                <div className="glass-panel stat-card" style={{ background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(21, 128, 61, 0.1))' }}>
                    <span className="stat-title">Margen Bruto Real</span>
                    <span className="stat-value success">${stats?.ventas?.margenBruto?.toLocaleString() || 0}</span>
                </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>Libro Diario (Últimos movimientos)</h3>
                
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Concepto</th>
                                <th>Tipo</th>
                                <th>Medio</th>
                                <th style={{ textAlign: 'right' }}>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay movimientos registrados.</td></tr>
                            ) : (
                                movements.map(m => (
                                    <tr key={m._id}>
                                        <td>{new Date(m.createdAt).toLocaleString()}</td>
                                        <td>{m.concept}</td>
                                        <td>
                                            <span className={`badge ${m.type === 'ingreso' ? 'badge-success' : 'badge-danger'}`}>
                                                {m.type}
                                            </span>
                                        </td>
                                        <td style={{ textTransform: 'capitalize' }}>{m.paymentMethod || '-'}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: m.type === 'ingreso' ? 'var(--success)' : 'var(--danger)' }}>
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
