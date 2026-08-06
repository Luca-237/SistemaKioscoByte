import { useState, useMemo } from 'react';
import { fmt, fmtMes } from '../../../lib/format';
import { useEstadisticas } from '../../../hooks/useEstadisticas';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/Select';

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
        <div className="flex flex-col gap-6">
            {/* Header y Filtro */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="h-6 w-1.5 rounded-full bg-primary" />
                        <h1 className="m-0 text-2xl font-bold tracking-tight text-foreground">Estadísticas y Métricas</h1>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Rendimiento por operario, artículos más vendidos y balance mensual.</p>
                </div>
                <Select value={branchId || TODAS} onValueChange={(v) => setBranchId(v === TODAS ? '' : v)}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Todas las sucursales" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={TODAS}>Todas las sucursales</SelectItem>
                        {branches.map((branch) => <SelectItem key={branch._id} value={branch._id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Tarjetas KPI Superiores compactas siguiendo el modelo de Resumen */}
            <div className="flex flex-wrap gap-3.5">
                <Card className="flex-[1.4] min-w-[280px] max-w-[380px] gap-1.5 border-l-4 border-l-primary px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Artículos más vendidos</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-2xl font-bold text-foreground" title={stats?.topArticles?.[0]?.name}>
                            {stats?.topArticles?.[0]?.name || 'Sin datos'}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{stats?.topArticles?.[0]?.soldUnits || 0} unid.</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-success px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Ganancias acumuladas</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">{fmt(stats?.monthlySummary?.ganancias)}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Acumulado</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-destructive px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Pérdidas acumuladas</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">{fmt(stats?.monthlySummary?.perdidas)}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Acumulado</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-warning px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Balance</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">
                            {fmt(stats?.monthlySummary?.balance)}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Neto</span>
                    </div>
                </Card>
            </div>

            {/* Fila 1: Tablas de Ventas (Artículos más vendidos + Ventas por operario) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-full flex flex-col justify-between">
                    <div>
                        <h3 className="m-0 mb-3 text-base font-semibold text-foreground">Artículos más vendidos</h3>
                        {stats?.topArticles?.length ? (
                            <Table compact>
                                <TableHeader>
                                    <TableRow>
                                        <Th>Artículo</Th>
                                        <Th className="text-right">Unidades</Th>
                                        <Th className="text-right">Ventas</Th>
                                        <Th className="text-right">Precio prom.</Th>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.topArticles.map((item) => (
                                        <TableRow key={item.articleId}>
                                            <Td>{item.name}</Td>
                                            <Td className="text-right text-sm">{item.soldUnits}</Td>
                                            <Td className="text-right text-sm text-success">{fmt(item.revenue)}</Td>
                                            <Td className="text-right text-sm">{fmt(item.avgSalePrice)}</Td>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <EmptyState message="Sin ventas registradas." />}
                    </div>
                </Card>

                <Card className="h-full flex flex-col justify-between">
                    <div>
                        <h3 className="m-0 mb-3 text-base font-semibold text-foreground">Ventas por operario</h3>
                        {stats?.salesByOperator?.length ? (
                            <Table compact>
                                <TableHeader>
                                    <TableRow>
                                        <Th>Operario</Th>
                                        <Th className="text-right">Tickets</Th>
                                        <Th className="text-right">Total ventas</Th>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.salesByOperator.map((item) => (
                                        <TableRow key={item.operatorId}>
                                            <Td>{item.name}</Td>
                                            <Td className="text-right text-sm">{item.soldTickets}</Td>
                                            <Td className="text-right text-sm text-success">{fmt(item.totalSales)}</Td>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <EmptyState message="Sin ventas registradas." />}
                    </div>
                </Card>
            </div>

            {/* Fila 2: Desgloses (Ganancias/Pérdidas por mes + Gastos por concepto) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-full flex flex-col justify-between">
                    <div>
                        <h3 className="m-0 mb-3 text-base font-semibold text-foreground">Ganancias y pérdidas por mes</h3>
                        {stats?.monthlyBalance?.length ? (
                            <div className="grid gap-3">
                                {stats.monthlyBalance.map((item) => (
                                    <div key={item.month} className="rounded-xl border border-border p-3.5 bg-background/50">
                                        <div className="flex items-center justify-between gap-2.5">
                                            <span className="text-sm font-semibold">{fmtMes(item.month)}</span>
                                            <span className={`text-sm ${item.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                {fmt(item.balance)}
                                            </span>
                                        </div>
                                        <div className="mt-2.5 grid gap-2">
                                            <div className="grid gap-1">
                                                <span className="text-xs text-muted-foreground">Ingresos</span>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full rounded-full bg-success" style={{ width: `${Math.max((item.ingresos / Math.max(item.ingresos + item.egresos, 1)) * 100, 5)}%` }} />
                                                </div>
                                            </div>
                                            <div className="grid gap-1">
                                                <span className="text-xs text-muted-foreground">Egresos</span>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full rounded-full bg-destructive" style={{ width: `${Math.max((item.egresos / Math.max(item.ingresos + item.egresos, 1)) * 100, 5)}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2.5 flex flex-wrap justify-between text-xs text-muted-foreground">
                                            <span>Ganancia: <span className="text-success">{fmt(item.ganancia)}</span></span>
                                            <span>Pérdida: <span className="text-destructive">{fmt(item.perdida)}</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyState message="Sin información mensual." />}
                    </div>
                </Card>

                <Card className="h-full flex flex-col justify-between">
                    <div>
                        <h3 className="m-0 mb-3 text-base font-semibold text-foreground">Gastos por concepto</h3>
                        {stats?.expenseBreakdown?.length ? (
                            <div className="grid gap-3">
                                {stats.expenseBreakdown.map((entry) => (
                                    <div key={entry.concept} className="grid gap-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{entry.concept}</span>
                                            <span>{fmt(entry.total)}</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max((entry.total / Math.max(maxExpense, 1)) * 100, 5)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyState message="Sin gastos registrados." />}
                    </div>
                </Card>
            </div>

            {/* Fila Inferior a Ancho Completo: Historial Completo de Precios */}
            <Card className="overflow-hidden p-0 gap-0">
                <div className="border-b border-border px-5 py-4">
                    <h3 className="m-0 text-base font-semibold text-foreground">Diferencia de precios históricos</h3>
                </div>
                <div className="overflow-x-auto">
                    {stats?.priceHistory?.length ? (
                        <Table compact>
                            <TableHeader>
                                <TableRow>
                                    <Th>Artículo</Th>
                                    <Th className="text-right">Compra</Th>
                                    <Th className="text-right">Venta</Th>
                                    <Th className="text-right">Dif.</Th>
                                    <Th>Proveedores</Th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.priceHistory.map((item) => (
                                    <TableRow key={item.articleId}>
                                        <Td>{item.name}</Td>
                                        <Td className="text-right text-sm">{fmt(item.avgPurchasePrice)}</Td>
                                        <Td className="text-right text-sm">{fmt(item.avgSalePrice)}</Td>
                                        <Td className={`text-right text-sm ${item.historicalDifference >= 0 ? 'text-success' : 'text-destructive'}`}>
                                            {fmt(item.historicalDifference)}
                                        </Td>
                                        <Td className="text-xs text-muted-foreground">
                                            {item.suppliers.length ? item.suppliers.join(', ') : '—'}
                                        </Td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : <EmptyState message="Todavía no hay historial de precios." />}
                </div>
            </Card>
        </div>
    );
};
