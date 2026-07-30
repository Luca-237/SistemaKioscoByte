import { useState, useEffect } from 'react';
import { fmt } from '../../../../lib/format';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { DialogTitle } from '../../../../components/ui/dialog';

export function MovimientosModal({ caja, onClose, getSales }) {
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
        <Modal open onClose={onClose} className="flex max-h-[85vh] w-full max-w-[620px] flex-col gap-0 p-0">
            <div className="border-b border-border px-5 py-4">
                <DialogTitle className="text-lg font-semibold">Detalle de Caja</DialogTitle>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
                <div className="mb-5 grid grid-cols-2 gap-2.5 text-sm">
                    <div><strong>Sucursal:</strong> {caja.branchId?.name}</div>
                    <div><strong>Estado:</strong> {caja.status === 'open' ? '🟢 Abierta' : '⚫ Cerrada'}</div>
                    <div><strong>Apertura:</strong> {fmt(caja.openingAmount)}</div>
                    <div><strong>Operario apertura:</strong> {caja.openedBy?.name || '---'}</div>
                    {caja.status === 'closed' && (
                        <>
                            <div><strong>Cierre:</strong> {fmt(caja.closingAmount)}</div>
                            <div><strong>Esperado:</strong> {fmt(caja.expectedAmount)}</div>
                            <div>
                                <strong>Diferencia:</strong>{' '}
                                <span className={`font-bold ${caja.difference === 0 ? '' : caja.difference > 0 ? 'text-success' : 'text-destructive'}`}>
                                    {fmt(caja.difference)}
                                </span>
                            </div>
                            <div><strong>Operario cierre:</strong> {caja.closedBy?.name || '---'}</div>
                        </>
                    )}
                </div>

                <div className="mb-3 flex items-center justify-between">
                    <h3 className="m-0 text-base font-semibold">Ventas ({ventas.length})</h3>
                    {ventas.length > 0 && <span className="font-extrabold text-success">Total: {fmt(totalVentas)}</span>}
                </div>

                {cargando ? (
                    <p className="text-muted-foreground">Cargando ventas...</p>
                ) : error ? (
                    <p className="text-destructive">{error}</p>
                ) : ventas.length === 0 ? (
                    <p className="py-5 text-center text-muted-foreground">No se registraron ventas en esta sesión.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {ventas.map((v) => (
                            <details key={v._id} className="overflow-hidden rounded-lg border border-border">
                                <summary className="flex list-none cursor-pointer items-center justify-between bg-background px-3 py-3 text-sm font-semibold">
                                    <span>Venta #{v.number}</span>
                                    <span className="flex items-center gap-3 text-[0.82rem]">
                                        <span className="font-normal text-muted-foreground">
                                            {new Date(v.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="font-normal text-muted-foreground capitalize">{v.paymentMethod}</span>
                                        <span className="font-extrabold text-success">{fmt(v.total)}</span>
                                    </span>
                                </summary>
                                <div className="flex flex-col gap-1.5 border-t border-border px-3 py-2.5">
                                    {v.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{item.quantity} × {item.name}</span>
                                            <span className="font-semibold">{fmt(item.unitPrice * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-border px-5 py-4 text-right">
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
            </div>
        </Modal>
    );
}
