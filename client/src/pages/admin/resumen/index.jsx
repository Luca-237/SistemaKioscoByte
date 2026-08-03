import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fmt, fmtFecha } from '../../../lib/format';
import { useResumen } from '../../../hooks/useResumen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/Select';

const TODAS = '__todas__';
const ITEMS_PER_PAGE = 8;

export const ResumenPage = () => {
    const [branchId, setBranchId] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const { resumen, movimientos = [], branches } = useResumen(branchId);

    const handleBranchChange = (v) => {
        setBranchId(v === TODAS ? '' : v);
        setPaginaActual(1);
    };

    if (!resumen) return <p className="text-muted-foreground">Cargando…</p>;

    const totalPaginas = Math.ceil(movimientos.length / ITEMS_PER_PAGE) || 1;
    const inicio = (paginaActual - 1) * ITEMS_PER_PAGE;
    const movimientosPaginados = movimientos.slice(inicio, inicio + ITEMS_PER_PAGE);

    const obtenerPaginas = () => {
        if (totalPaginas <= 5) {
            return Array.from({ length: totalPaginas }, (_, i) => i + 1);
        }
        const start = Math.max(1, Math.min(paginaActual - 2, totalPaginas - 4));
        return Array.from({ length: 5 }, (_, i) => start + i);
    };

    return (
        <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 text-2xl font-semibold text-foreground">Resumen contable</h2>
                <Select value={branchId || TODAS} onValueChange={handleBranchChange}>
                    <SelectTrigger><SelectValue placeholder="Todas las sucursales" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={TODAS}>Todas las sucursales</SelectItem>
                        {branches.map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="mb-6 flex flex-wrap gap-3.5">
                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-success px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Ingresos</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">{fmt(resumen.ingresos)}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Total</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-destructive px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Egresos</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">{fmt(resumen.egresos)}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Total</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-primary px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Saldo neto</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">{fmt(resumen.saldoNeto)}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Neto</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-warning px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Margen bruto (ventas)</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">{fmt(resumen.ventas.margenBruto)}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{resumen.ventas.cantidadTickets} t. · {resumen.ventas.unidades} u.</span>
                    </div>
                </Card>
            </div>

            <h3 className="m-0 mb-3 text-base font-semibold text-foreground">Últimos movimientos</h3>
            <Card className="overflow-hidden p-0">
                {movimientos.length === 0 ? (
                    <EmptyState message="Sin movimientos todavía." />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow><Th>Fecha</Th><Th>Concepto</Th><Th>Método</Th><Th className="text-right">Ingreso</Th><Th className="text-right">Egreso</Th></TableRow>
                            </TableHeader>
                            <TableBody>
                                {movimientosPaginados.map((m) => (
                                    <TableRow key={m._id}>
                                        <Td>{fmtFecha(m.createdAt)}</Td>
                                        <Td>{m.concept}</Td>
                                        <Td>{m.paymentMethod || '—'}</Td>
                                        <Td className="text-right text-success">{m.type === 'ingreso' ? fmt(m.amount) : '—'}</Td>
                                        <Td className="text-right text-destructive">{m.type === 'egreso' ? fmt(m.amount) : '—'}</Td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground">
                            <span>
                                Mostrando {movimientos.length > 0 ? inicio + 1 : 0} a {Math.min(inicio + ITEMS_PER_PAGE, movimientos.length)} de {movimientos.length} movimientos
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
        </div>
    );
};
