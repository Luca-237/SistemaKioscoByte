import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiOwner } from '../../../api/http';

const fmt = (value) => `$${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtMonth = (month) => {
    if (!month) return '—';
    const [year, monthNum] = String(month).split('-');
    const date = new Date(Number(year), Number(monthNum) - 1, 1);
    return date.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
};

export const EstadisticasPage = () => {
    const [branches, setBranches] = useState([]);
    const [branchId, setBranchId] = useState('');
    const [stats, setStats] = useState(null);
    const [cargando, setCargando] = useState(true);

    const cargarData = useCallback(async () => {
        setCargando(true);
        try {
            const params = branchId ? { branchId } : {};
            const [resStats, resBranches] = await Promise.all([
                apiOwner.get('/api/stats/analytics', { params }),
                apiOwner.get('/api/branches')
            ]);
            setStats(resStats.data.data);
            setBranches(resBranches.data.data || []);
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        } finally {
            setCargando(false);
        }
    }, [branchId]);

    useEffect(() => { cargarData(); }, [cargarData]);

    const maxExpense = useMemo(() => {
        const values = (stats?.expenseBreakdown || []).map((item) => item.total || 0);
        return Math.max(...values, 0);
    }, [stats]);

    if (cargando) return <div className="muted">Cargando estadísticas…</div>;

    return (
        <div>
            <div className="admin-toolbar">
                <h2>Estadísticas</h2>
                <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                    <option value="">Todas las sucursales</option>
                    {branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
                </select>
            </div>

            <div className="stats-grid">
                <div className="glass-panel stat-card">
                    <span className="stat-title">Artículos más vendidos</span>
                    <span className="stat-value primary">{stats?.topArticles?.[0]?.name || 'Sin datos'}</span>
                    <span className="muted">{stats?.topArticles?.[0]?.soldUnits || 0} unidades</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Ganancias acumuladas</span>
                    <span className="stat-value success">{fmt(stats?.monthlySummary?.ganancias)}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Pérdidas acumuladas</span>
                    <span className="stat-value" style={{ color: 'var(--danger)' }}>{fmt(stats?.monthlySummary?.perdidas)}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Balance</span>
                    <span className={`stat-value ${stats?.monthlySummary?.balance >= 0 ? 'success' : ''}`}>
                        {fmt(stats?.monthlySummary?.balance)}
                    </span>
                </div>
            </div>

            <div className="stats-layout">
                <section className="glass-panel stats-section">
                    <h3>Artículos más vendidos</h3>
                    <div className="admin-table-container">
                        <table className="admin-table compacta">
                            <thead>
                                <tr>
                                    <th>Artículo</th>
                                    <th className="der">Unidades</th>
                                    <th className="der">Ventas</th>
                                    <th className="der">Precio prom.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.topArticles?.length ? stats.topArticles.map((item) => (
                                    <tr key={item.articleId}>
                                        <td>{item.name}</td>
                                        <td className="der">{item.soldUnits}</td>
                                        <td className="der">{fmt(item.revenue)}</td>
                                        <td className="der">{fmt(item.avgSalePrice)}</td>
                                    </tr>
                                )) : <tr><td colSpan="4" className="muted centro">Sin ventas registradas.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="glass-panel stats-section">
                    <h3>Diferencia de precios históricos</h3>
                    <div className="admin-table-container">
                        <table className="admin-table compacta">
                            <thead>
                                <tr>
                                    <th>Artículo</th>
                                    <th className="der">Compra</th>
                                    <th className="der">Venta</th>
                                    <th className="der">Diferencia</th>
                                    <th>Proveedores</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.priceHistory?.length ? stats.priceHistory.map((item) => (
                                    <tr key={item.articleId}>
                                        <td>{item.name}</td>
                                        <td className="der">{fmt(item.avgPurchasePrice)}</td>
                                        <td className="der">{fmt(item.avgSalePrice)}</td>
                                        <td className={`der ${item.historicalDifference >= 0 ? 'verde' : 'rojo'}`}>{fmt(item.historicalDifference)}</td>
                                        <td>{item.suppliers.length ? item.suppliers.join(', ') : 'Sin proveedores'}</td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="muted centro">Todavía no hay historial de precios.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="glass-panel stats-section">
                    <h3>Ventas por operario</h3>
                    <div className="admin-table-container">
                        <table className="admin-table compacta">
                            <thead>
                                <tr>
                                    <th>Operario</th>
                                    <th className="der">Tickets</th>
                                    <th className="der">Total ventas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.salesByOperator?.length ? stats.salesByOperator.map((item) => (
                                    <tr key={item.operatorId}>
                                        <td>{item.name}</td>
                                        <td className="der">{item.soldTickets}</td>
                                        <td className="der">{fmt(item.totalSales)}</td>
                                    </tr>
                                )) : <tr><td colSpan="3" className="muted centro">Sin ventas registradas.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="glass-panel stats-section">
                    <h3>Ganancias y pérdidas por mes</h3>
                    <div className="monthly-grid">
                        {stats?.monthlyBalance?.length ? stats.monthlyBalance.map((item) => (
                            <div key={item.month} className="monthly-card">
                                <div className="monthly-head">
                                    <strong>{fmtMonth(item.month)}</strong>
                                    <span className={item.balance >= 0 ? 'verde' : 'rojo'}>{fmt(item.balance)}</span>
                                </div>
                                <div className="mini-bars">
                                    <div className="mini-bar-group">
                                        <span>Ingresos</span>
                                        <div className="mini-bar-track"><div className="mini-bar income" style={{ width: `${Math.max((item.ingresos / Math.max(item.ingresos + item.egresos, 1)) * 100, 8)}%` }} /></div>
                                    </div>
                                    <div className="mini-bar-group">
                                        <span>Egresos</span>
                                        <div className="mini-bar-track"><div className="mini-bar expense" style={{ width: `${Math.max((item.egresos / Math.max(item.ingresos + item.egresos, 1)) * 100, 8)}%` }} /></div>
                                    </div>
                                </div>
                                <div className="monthly-meta">
                                    <span className="verde">Ganancia: {fmt(item.ganancia)}</span>
                                    <span className="rojo">Pérdida: {fmt(item.perdida)}</span>
                                </div>
                            </div>
                        )) : <div className="muted">Sin información mensual.</div>}
                    </div>
                </section>

                <section className="glass-panel stats-section">
                    <h3>Gastos por concepto</h3>
                    <div className="expense-chart">
                        {stats?.expenseBreakdown?.length ? stats.expenseBreakdown.map((entry) => (
                            <div key={entry.concept} className="expense-item">
                                <div className="expense-row">
                                    <span>{entry.concept}</span>
                                    <strong>{fmt(entry.total)}</strong>
                                </div>
                                <div className="expense-bar-track">
                                    <div className="expense-bar" style={{ width: `${Math.max((entry.total / Math.max(maxExpense, 1)) * 100, 8)}%` }} />
                                </div>
                            </div>
                        )) : <div className="muted">Sin gastos registrados.</div>}
                    </div>
                </section>
            </div>
        </div>
    );
};
