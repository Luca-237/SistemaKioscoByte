import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fmt } from '../../../lib/format';
import { useResumen } from '../../../hooks/useResumen';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';

const ITEMS_PER_PAGE = 10;

function StatCard({ title, value, subtitle, className = '', style }) {
    return (
        <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 px-5 py-4" style={style}>
            <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h4>
            <div className="flex items-baseline justify-between gap-2">
                <span className={`text-2xl font-bold ${className}`}>{value}</span>
                {subtitle && <span className="text-xs text-muted-foreground whitespace-nowrap">{subtitle}</span>}
            </div>
        </Card>
    );
}

export function FinanzasPage() {
    const { resumen: stats, movimientos: movements, loading } = useResumen();
    const [paginaActual, setPaginaActual] = useState(1);

    if (loading) return <div className="text-muted-foreground">Cargando finanzas...</div>;

    const totalPaginas = Math.ceil(movements.length / ITEMS_PER_PAGE) || 1;
    const inicio = (paginaActual - 1) * ITEMS_PER_PAGE;
    const movimientosPaginados = movements.slice(inicio, inicio + ITEMS_PER_PAGE);

    const obtenerPaginas = () => {
        if (totalPaginas <= 5) {
            return Array.from({ length: totalPaginas }, (_, i) => i + 1);
        }
        const start = Math.max(1, Math.min(paginaActual - 2, totalPaginas - 4));
        return Array.from({ length: 5 }, (_, i) => start + i);
    };

    return (
        <div>
            <div className="mb-6">
                <div className="flex items-center gap-2.5">
                    <span className="h-6 w-1.5 rounded-full bg-primary" />
                    <h1 className="m-0 text-2xl font-bold tracking-tight text-foreground">Contabilidad y Finanzas</h1>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Libro diario, ingresos brutos, costos de mercadería y margen neto real.</p>
            </div>

            <div className="mb-6 flex flex-wrap gap-3.5">
                <StatCard title="Ingresos Brutos" value={`$${stats?.ingresos?.toLocaleString() || 0}`} subtitle="Total" className="text-success" />
                <StatCard title="Egresos / Costos" value={`$${stats?.egresos?.toLocaleString() || 0}`} subtitle="Total" className="text-destructive" />
                <StatCard
                    title="Saldo Neto Operativo"
                    value={`$${stats?.saldoNeto?.toLocaleString() || 0}`}
                    subtitle="Neto"
                    className={stats?.saldoNeto >= 0 ? 'text-success' : ''}
                />
                <StatCard
                    title="Costo de Mercadería"
                    value={`$${stats?.ventas?.costoMercaderia?.toLocaleString() || 0}`}
                    subtitle="CMV"
                    style={{ background: 'linear-gradient(135deg, rgba(90,28,228,0.08), rgba(122,66,244,0.08))' }}
                />
                <StatCard
                    title="Margen Bruto Real"
                    value={`$${stats?.ventas?.margenBruto?.toLocaleString() || 0}`}
                    subtitle="Margen"
                    className="text-success"
                    style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.08))' }}
                />
            </div>

            <Card className="overflow-hidden p-0 gap-0">
                <div className="border-b border-border px-5 py-4">
                    <h3 className="m-0 text-base font-semibold text-foreground">Libro Diario (Últimos movimientos)</h3>
                </div>
                {movements.length === 0 ? (
                    <EmptyState message="No hay movimientos registrados." />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <Th>Fecha</Th><Th>Concepto</Th><Th>Tipo</Th>
                                    <Th>Medio</Th><Th className="text-right">Monto</Th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movimientosPaginados.map((m) => (
                                    <TableRow key={m._id}>
                                        <Td>{new Date(m.createdAt).toLocaleString()}</Td>
                                        <Td>{m.concept}</Td>
                                        <Td>
                                            <Badge variant={m.type === 'ingreso' ? 'success' : 'danger'}>{m.type}</Badge>
                                        </Td>
                                        <Td className="capitalize">{m.paymentMethod || '-'}</Td>
                                        <Td className={`text-right ${m.type === 'ingreso' ? 'text-success' : 'text-destructive'}`}>
                                            {m.type === 'ingreso' ? '+' : '-'}{fmt(m.amount)}
                                        </Td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                            <span>
                                Mostrando {movements.length > 0 ? inicio + 1 : 0} a {Math.min(inicio + ITEMS_PER_PAGE, movements.length)} de {movements.length} movimientos
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
}
