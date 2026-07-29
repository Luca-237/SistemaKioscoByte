import { useState, useEffect } from 'react';
import { fmt } from '../lib/format';
import { useCajas } from '../hooks/useCajas';
import { Button } from '../components/ui/Button';

export function CajasPage() {
    const { cajas, loading, error, refresh, getSalesForSession } = useCajas();
    const [selectedCaja, setSelectedCaja] = useState(null);

    return (
        <div className="admin-page">
            <header className="page-header">
                <div>
                    <h1>Historial de Cajas</h1>
                    <p>Registro de aperturas y cierres de caja en todas las sucursales.</p>
                </div>
                <Button variant="outline" onClick={refresh} disabled={loading}>Actualizar</Button>
            </header>

            <section className="admin-card mt-4">
                {loading ? (
                    <p style={{ padding: 20 }}>Cargando cajas...</p>
                ) : error ? (
                    <p style={{ padding: 20, color: 'var(--destructive)' }}>{error}</p>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Sucursal</th><th>Estado</th><th>Apertura</th>
                                    <th>Apertura por</th><th>Cierre</th><th>Cierre por</th>
                                    <th>Diferencia</th><th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cajas.length === 0 && (
                                    <tr><td colSpan="8" style={{ textAlign: 'center' }}>No hay cajas registradas</td></tr>
                                )}
                                {cajas.map((c) => (
                                    <tr key={c._id}>
                                        <td>{c.branchId?.name || '---'}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block', padding: '4px 8px',
                                                borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                                backgroundColor: c.status === 'open' ? 'var(--success-bg)' : 'rgba(113,113,122,0.1)',
                                                color: c.status === 'open' ? 'var(--success-fg)' : 'var(--muted-foreground)'
                                            }}>
                                                {c.status === 'open' ? 'Abierta' : 'Cerrada'}
                                            </span>
                                        </td>
                                        <td>{new Date(c.openedAt).toLocaleString('es-AR')}</td>
                                        <td>{c.openedBy?.name || '---'}</td>
                                        <td>{c.closedAt ? new Date(c.closedAt).toLocaleString('es-AR') : '---'}</td>
                                        <td>{c.closedBy?.name || '---'}</td>
                                        <td>
                                            {c.status === 'closed' ? (
                                                <span style={{
                                                    color: c.difference === 0 ? 'inherit' : (c.difference > 0 ? 'var(--success)' : 'var(--destructive)'),
                                                    fontWeight: 'bold'
                                                }}>
                                                    {c.difference === 0 ? 'Exacto' : (c.difference > 0 ? `+${fmt(c.difference)}` : fmt(c.difference))}
                                                </span>
                                            ) : '---'}
                                        </td>
                                        <td>
                                            <Button variant="link" onClick={() => setSelectedCaja(c)}>Ver movimientos</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selectedCaja && (
                <MovimientosModal caja={selectedCaja} onClose={() => setSelectedCaja(null)} getSales={getSalesForSession} />
            )}
        </div>
    );
}

function MovimientosModal({ caja, onClose, getSales }) {
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setCargando(true);
        getSales(caja._id)
            .then((data) => setVentas(data))
            .catch(() => setError('Error al cargar las ventas'))
            .finally(() => setCargando(false));
    }, [caja._id]);

    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);

    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '620px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: 'var(--card)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Detalle de Caja</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--muted-foreground)', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.88rem' }}>
                        <div><strong>Sucursal:</strong> {caja.branchId?.name}</div>
                        <div><strong>Estado:</strong> {caja.status === 'open' ? '🟢 Abierta' : '⚫ Cerrada'}</div>
                        <div><strong>Apertura:</strong> {fmt(caja.openingAmount)}</div>
                        <div><strong>Operario apertura:</strong> {caja.openedBy?.name || '---'}</div>
                        {caja.status === 'closed' && (
                            <>
                                <div><strong>Cierre:</strong> {fmt(caja.closingAmount)}</div>
                                <div><strong>Esperado:</strong> {fmt(caja.expectedAmount)}</div>
                                <div><strong>Diferencia:</strong> <span style={{ color: caja.difference === 0 ? 'inherit' : caja.difference > 0 ? 'var(--success)' : 'var(--destructive)', fontWeight: 700 }}>{fmt(caja.difference)}</span></div>
                                <div><strong>Operario cierre:</strong> {caja.closedBy?.name || '---'}</div>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Ventas ({ventas.length})</h3>
                        {ventas.length > 0 && <span style={{ fontWeight: 800, color: 'var(--success)' }}>Total: {fmt(totalVentas)}</span>}
                    </div>

                    {cargando ? <p style={{ color: 'var(--muted-foreground)' }}>Cargando ventas...</p>
                        : error ? <p style={{ color: 'var(--destructive)' }}>{error}</p>
                        : ventas.length === 0 ? <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '20px 0' }}>No se registraron ventas en esta sesión.</p>
                        : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {ventas.map((v) => (
                                    <details key={v._id} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                                        <summary style={{ padding: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.9rem', background: 'var(--background)', listStyle: 'none' }}>
                                            <span>Venta #{v.number}</span>
                                            <span style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.82rem' }}>
                                                <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>{new Date(v.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span style={{ textTransform: 'capitalize', color: 'var(--muted-foreground)', fontWeight: 400 }}>{v.paymentMethod}</span>
                                                <span style={{ color: 'var(--success)', fontWeight: 800 }}>{fmt(v.total)}</span>
                                            </span>
                                        </summary>
                                        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border)' }}>
                                            {v.items.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                    <span style={{ color: 'var(--muted-foreground)' }}>{item.quantity} × {item.name}</span>
                                                    <span style={{ fontWeight: 600 }}>{fmt(item.unitPrice * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        )}
                </div>

                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </div>
            </div>
        </div>
    );
}
