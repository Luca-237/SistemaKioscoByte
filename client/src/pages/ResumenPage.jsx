import { useState } from 'react';
import { fmt, fmtFecha } from '../lib/format';
import { useResumen } from '../hooks/useResumen';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/Select';

const TODAS = '__todas__';

export const ResumenPage = () => {
    const [branchId, setBranchId] = useState('');
    const { resumen, movimientos, branches } = useResumen(branchId);

    if (!resumen) return <p className="text-muted-foreground">Cargando…</p>;

    return (
        <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 text-2xl font-semibold">Resumen contable</h2>
                <Select value={branchId || TODAS} onValueChange={(v) => setBranchId(v === TODAS ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Todas las sucursales" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={TODAS}>Todas las sucursales</SelectItem>
                        {branches.map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="mb-7 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
                <Card className="gap-1.5 border-l-4 border-l-success py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Ingresos</h4>
                    <p className="m-0 text-2xl font-extrabold">{fmt(resumen.ingresos)}</p>
                </Card>
                <Card className="gap-1.5 border-l-4 border-l-destructive py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Egresos</h4>
                    <p className="m-0 text-2xl font-extrabold">{fmt(resumen.egresos)}</p>
                </Card>
                <Card className="gap-1.5 border-l-4 border-l-primary py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Saldo neto</h4>
                    <p className="m-0 text-2xl font-extrabold">{fmt(resumen.saldoNeto)}</p>
                </Card>
                <Card className="gap-1.5 border-l-4 border-l-warning py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Margen bruto (ventas)</h4>
                    <p className="m-0 text-2xl font-extrabold">{fmt(resumen.ventas.margenBruto)}</p>
                    <span className="text-xs text-muted-foreground">{resumen.ventas.cantidadTickets} tickets · {resumen.ventas.unidades} unidades</span>
                </Card>
            </div>

            <h3 className="mb-2.5">Últimos movimientos</h3>
            <Card className="overflow-hidden p-0">
                {movimientos.length === 0 ? (
                    <EmptyState message="Sin movimientos todavía." />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow><Th>Fecha</Th><Th>Concepto</Th><Th>Método</Th><Th className="text-right">Ingreso</Th><Th className="text-right">Egreso</Th></TableRow>
                        </TableHeader>
                        <TableBody>
                            {movimientos.map((m) => (
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
                )}
            </Card>
        </div>
    );
};
