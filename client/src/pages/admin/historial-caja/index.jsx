import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { fmt } from '../../../lib/format';
import { useCajas } from '../../../hooks/useCajas';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { MovimientosModal } from './components/MovimientosModal';

const ITEMS_PER_PAGE = 10;

export function HistorialCajaPage() {
    const { cajas, loading, error, refresh, getSalesForSession } = useCajas();
    const [selectedCaja, setSelectedCaja] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);

    const totalPaginas = Math.ceil(cajas.length / ITEMS_PER_PAGE) || 1;
    const inicio = (paginaActual - 1) * ITEMS_PER_PAGE;
    const cajasPaginadas = cajas.slice(inicio, inicio + ITEMS_PER_PAGE);

    const obtenerPaginas = () => {
        if (totalPaginas <= 5) {
            return Array.from({ length: totalPaginas }, (_, i) => i + 1);
        }
        const start = Math.max(1, Math.min(paginaActual - 2, totalPaginas - 4));
        return Array.from({ length: 5 }, (_, i) => start + i);
    };

    return (
        <div>
            <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="m-0 text-2xl font-semibold text-foreground">Historial de Cajas</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Registro de aperturas y cierres de caja en todas las sucursales.</p>
                </div>
                <Button onClick={refresh} disabled={loading}>
                    <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
                    Actualizar
                </Button>
            </header>

            <Card className="overflow-hidden p-0">
                {loading ? (
                    <p className="p-5 text-muted-foreground">Cargando cajas...</p>
                ) : error ? (
                    <p className="p-5 text-destructive">{error}</p>
                ) : cajas.length === 0 ? (
                    <EmptyState message="No hay cajas registradas" />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <Th>Sucursal</Th><Th>Estado</Th><Th>Apertura</Th>
                                    <Th>Apertura por</Th><Th>Cierre</Th><Th>Cierre por</Th>
                                    <Th>Diferencia</Th><Th>Acciones</Th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cajasPaginadas.map((c) => (
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

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground">
                            <span>
                                Mostrando {cajas.length > 0 ? inicio + 1 : 0} a {Math.min(inicio + ITEMS_PER_PAGE, cajas.length)} de {cajas.length} cajas
                            </span>

                            {totalPaginas > 1 && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={paginaActual === 1}
                                        onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                                        className="h-7 px-2 text-xs"
                                        title="Página anterior"
                                    >
                                        <ChevronLeft size={14} />
                                    </Button>

                                    {obtenerPaginas().map((num) => (
                                        <Button
                                            key={num}
                                            variant={paginaActual === num ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPaginaActual(num)}
                                            className="h-7 w-7 p-0 text-xs"
                                        >
                                            {num}
                                        </Button>
                                    ))}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={paginaActual >= totalPaginas}
                                        onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                                        className="h-7 px-2 text-xs"
                                        title="Página siguiente"
                                    >
                                        <ChevronRight size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
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
