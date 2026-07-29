import { useState, useMemo } from 'react';
import { fmt, fmtMes } from '../lib/format';
import { useEstadisticas } from '../hooks/useEstadisticas';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/Select';

const TODAS = '__todas__';

export const EstadisticasPage = () => {
    const [branchId, setBranchId] = useState('');
    const { stats, branches, loading } = useEstadisticas(branchId);

    const maxExpense = useMemo(() => {
        const values = (stats?.expenseBreakdown || []).map((item) => item.total || 0);
        return Math.max(...values, 0);
    }, [stats]);

    if (loading) return <div className="text-muted-foreground">Cargando estadísticas…</div>;

    return (
        <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 text-2xl font-semibold">Estadísticas</h2>
                <Select value={branchId || TODAS} onValueChange={(v) => setBranchId(v === TODAS ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Todas las sucursales" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={TODAS}>Todas las sucursales</SelectItem>
                        {branches.map((branch) => <SelectItem key={branch._id} value={branch._id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
                <Card className="gap-1.5 py-5">
                    <span className="text-sm font-semibold text-muted-foreground">Artículos más vendidos</span>
                    <span className="font-heading text-2xl font-extrabold text-primary">{stats?.topArticles?.[0]?.name || 'Sin datos'}</span>
                    <span className="text-sm text-muted-foreground">{stats?.topArticles?.[0]?.soldUnits || 0} unidades</span>
                </Card>
                <Card className="gap-1.5 py-5">
                    <span className="text-sm font-semibold text-muted-foreground">Ganancias acumuladas</span>
                    <span className="font-heading text-2xl font-extrabold text-success">{fmt(stats?.monthlySummary?.ganancias)}</span>
                </Card>
                <Card className="gap-1.5 py-5">
                    <span className="text-sm font-semibold text-muted-foreground">Pérdidas acumuladas</span>
                    <span className="font-heading text-2xl font-extrabold text-destructive">{fmt(stats?.monthlySummary?.perdidas)}</span>
                </Card>
                <Card className="gap-1.5 py-5">
                    <span className="text-sm font-semibold text-muted-foreground">Balance</span>
                    <span className={`font-heading text-2xl font-extrabold ${stats?.monthlySummary?.balance >= 0 ? 'text-success' : ''}`}>
                        {fmt(stats?.monthlySummary?.balance)}
                    </span>
                </Card>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] items-start gap-6">
                <Card>
                    <h3 className="mt-0 mb-4">Artículos más vendidos</h3>
                    {stats?.topArticles?.length ? (
                        <Table compact>
                            <TableHeader>
                                <TableRow><Th>Artículo</Th><Th className="text-right">Unidades</Th><Th className="text-right">Ventas</Th><Th className="text-right">Precio prom.</Th></TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.topArticles.map((item) => (
                                    <TableRow key={item.articleId}>
                                        <Td>{item.name}</Td>
                                        <Td className="text-right">{item.soldUnits}</Td>
                                        <Td className="text-right">{fmt(item.revenue)}</Td>
                                        <Td className="text-right">{fmt(item.avgSalePrice)}</Td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : <EmptyState message="Sin ventas registradas." />}
                </Card>

                <Card>
                    <h3 className="mt-0 mb-4">Diferencia de precios históricos</h3>
                    {stats?.priceHistory?.length ? (
                        <Table compact>
                            <TableHeader>
                                <TableRow><Th>Artículo</Th><Th className="text-right">Compra</Th><Th className="text-right">Venta</Th><Th className="text-right">Diferencia</Th><Th>Proveedores</Th></TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.priceHistory.map((item) => (
                                    <TableRow key={item.articleId}>
                                        <Td>{item.name}</Td>
                                        <Td className="text-right">{fmt(item.avgPurchasePrice)}</Td>
                                        <Td className="text-right">{fmt(item.avgSalePrice)}</Td>
                                        <Td className={`text-right ${item.historicalDifference >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(item.historicalDifference)}</Td>
                                        <Td>{item.suppliers.length ? item.suppliers.join(', ') : 'Sin proveedores'}</Td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : <EmptyState message="Todavía no hay historial de precios." />}
                </Card>

                <Card>
                    <h3 className="mt-0 mb-4">Ventas por operario</h3>
                    {stats?.salesByOperator?.length ? (
                        <Table compact>
                            <TableHeader>
                                <TableRow><Th>Operario</Th><Th className="text-right">Tickets</Th><Th className="text-right">Total ventas</Th></TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.salesByOperator.map((item) => (
                                    <TableRow key={item.operatorId}><Td>{item.name}</Td><Td className="text-right">{item.soldTickets}</Td><Td className="text-right">{fmt(item.totalSales)}</Td></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : <EmptyState message="Sin ventas registradas." />}
                </Card>

                <Card>
                    <h3 className="mt-0 mb-4">Ganancias y pérdidas por mes</h3>
                    {stats?.monthlyBalance?.length ? (
                        <div className="grid gap-4">
                            {stats.monthlyBalance.map((item) => (
                                <div key={item.month} className="rounded-xl border border-border p-3.5">
                                    <div className="flex items-center justify-between gap-2.5">
                                        <strong>{fmtMes(item.month)}</strong>
                                        <span className={item.balance >= 0 ? 'text-success' : 'text-destructive'}>{fmt(item.balance)}</span>
                                    </div>
                                    <div className="mt-2.5 grid gap-2.5">
                                        <div className="grid gap-1">
                                            <span className="text-xs text-muted-foreground">Ingresos</span>
                                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                                                <div className="h-full rounded-full bg-[linear-gradient(90deg,#10b981,#34d399)]" style={{ width: `${Math.max((item.ingresos / Math.max(item.ingresos + item.egresos, 1)) * 100, 8)}%` }} />
                                            </div>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs text-muted-foreground">Egresos</span>
                                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                                                <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--destructive),#fb7185)]" style={{ width: `${Math.max((item.egresos / Math.max(item.ingresos + item.egresos, 1)) * 100, 8)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2.5 flex flex-wrap gap-2.5 text-sm">
                                        <span className="text-success">Ganancia: {fmt(item.ganancia)}</span>
                                        <span className="text-destructive">Pérdida: {fmt(item.perdida)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <EmptyState message="Sin información mensual." />}
                </Card>

                <Card>
                    <h3 className="mt-0 mb-4">Gastos por concepto</h3>
                    {stats?.expenseBreakdown?.length ? (
                        <div className="grid gap-3">
                            {stats.expenseBreakdown.map((entry) => (
                                <div key={entry.concept} className="grid gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <span>{entry.concept}</span>
                                        <strong>{fmt(entry.total)}</strong>
                                    </div>
                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#10b981,#34d399)]" style={{ width: `${Math.max((entry.total / Math.max(maxExpense, 1)) * 100, 8)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <EmptyState message="Sin gastos registrados." />}
                </Card>
            </div>
        </div>
    );
};
