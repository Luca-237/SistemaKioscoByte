import { useState } from 'react';
import { fmt } from '../../../lib/format';
import { useCajas } from '../../../hooks/useCajas';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { MovimientosModal } from './components/MovimientosModal';

export function HistorialCajaPage() {
    const { cajas, loading, error, refresh, getSalesForSession } = useCajas();
    const [selectedCaja, setSelectedCaja] = useState(null);

    return (
        <div>
            <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="m-0 text-2xl font-semibold">Historial de Cajas</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Registro de aperturas y cierres de caja en todas las sucursales.</p>
                </div>
                <Button variant="outline" onClick={refresh} disabled={loading}>Actualizar</Button>
            </header>

            <Card className="overflow-hidden p-0">
                {loading ? (
                    <p className="p-5 text-muted-foreground">Cargando cajas...</p>
                ) : error ? (
                    <p className="p-5 text-destructive">{error}</p>
                ) : cajas.length === 0 ? (
                    <EmptyState message="No hay cajas registradas" />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <Th>Sucursal</Th><Th>Estado</Th><Th>Apertura</Th>
                                <Th>Apertura por</Th><Th>Cierre</Th><Th>Cierre por</Th>
                                <Th>Diferencia</Th><Th>Acciones</Th>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cajas.map((c) => (
                                <TableRow key={c._id}>
                                    <Td>{c.branchId?.name || '---'}</Td>
                                    <Td>
                                        <span className={`inline-block rounded px-2 py-1 text-xs font-bold ${c.status === 'open' ? 'bg-[var(--success-bg)] text-[var(--success-fg)]' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                                            {c.status === 'open' ? 'Abierta' : 'Cerrada'}
                                        </span>
                                    </Td>
                                    <Td>{new Date(c.openedAt).toLocaleString('es-AR')}</Td>
                                    <Td>{c.openedBy?.name || '---'}</Td>
                                    <Td>{c.closedAt ? new Date(c.closedAt).toLocaleString('es-AR') : '---'}</Td>
                                    <Td>{c.closedBy?.name || '---'}</Td>
                                    <Td>
                                        {c.status === 'closed' ? (
                                            <span className={`font-bold ${c.difference === 0 ? '' : c.difference > 0 ? 'text-success' : 'text-destructive'}`}>
                                                {c.difference === 0 ? 'Exacto' : (c.difference > 0 ? `+${fmt(c.difference)}` : fmt(c.difference))}
                                            </span>
                                        ) : '---'}
                                    </Td>
                                    <Td>
                                        <Button variant="link" onClick={() => setSelectedCaja(c)}>Ver movimientos</Button>
                                    </Td>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>

            {selectedCaja && (
                <MovimientosModal
                    caja={selectedCaja}
                    onClose={() => setSelectedCaja(null)}
                    getSales={getSalesForSession}
                />
            )}
        </div>
    );
}
