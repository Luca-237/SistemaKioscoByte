import { useState, useEffect, useCallback } from 'react';
import { apiOwner } from '../../../api/http';

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtFecha = (d) => new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

// Dashboard contable del propietario: balance + margen + últimos movimientos.
export const ResumenPage = () => {
    const [branches, setBranches] = useState([]);
    const [branchId, setBranchId] = useState('');
    const [resumen, setResumen] = useState(null);
    const [movimientos, setMovimientos] = useState([]);

    const cargar = useCallback(async () => {
        const params = branchId ? { branchId } : {};
        const [s, m, b] = await Promise.all([
            apiOwner.get('/api/stats/summary', { params }),
            apiOwner.get('/api/stats/movements', { params }),
            apiOwner.get('/api/branches')
        ]);
        setResumen(s.data.data);
        setMovimientos(m.data.data);
        setBranches(b.data.data);
    }, [branchId]);

    useEffect(() => { cargar().catch(console.error); }, [cargar]);

    if (!resumen) return <p className="muted">Cargando…</p>;

    return (
        <div>
            <div className="admin-toolbar">
                <h2>Resumen contable</h2>
                <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                    <option value="">Todas las sucursales</option>
                    {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
            </div>

            <div className="admin-cards">
                <div className="admin-card ingreso"><h4>Ingresos</h4><p>{fmt(resumen.ingresos)}</p></div>
                <div className="admin-card egreso"><h4>Egresos</h4><p>{fmt(resumen.egresos)}</p></div>
                <div className="admin-card neto"><h4>Saldo neto</h4><p>{fmt(resumen.saldoNeto)}</p></div>
                <div className="admin-card margen">
                    <h4>Margen bruto (ventas)</h4>
                    <p>{fmt(resumen.ventas.margenBruto)}</p>
                    <span>{resumen.ventas.cantidadTickets} tickets · {resumen.ventas.unidades} unidades</span>
                </div>
            </div>

            <h3>Últimos movimientos</h3>
            <table className="admin-table">
                <thead>
                    <tr><th>Fecha</th><th>Concepto</th><th>Método</th><th className="der">Ingreso</th><th className="der">Egreso</th></tr>
                </thead>
                <tbody>
                    {movimientos.length === 0 && <tr><td colSpan="5" className="muted centro">Sin movimientos todavía.</td></tr>}
                    {movimientos.map((m) => (
                        <tr key={m._id}>
                            <td>{fmtFecha(m.createdAt)}</td>
                            <td>{m.concept}</td>
                            <td>{m.paymentMethod || '—'}</td>
                            <td className="der verde">{m.type === 'ingreso' ? fmt(m.amount) : '—'}</td>
                            <td className="der rojo">{m.type === 'egreso' ? fmt(m.amount) : '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
