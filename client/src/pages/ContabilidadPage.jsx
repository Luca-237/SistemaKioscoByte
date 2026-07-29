import { useResumen } from '../hooks/useResumen';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';

function StatCard({ title, value, className = '', style }) {
    return (
        <Card className="gap-2 py-5" style={style}>
            <span className="text-sm font-semibold text-muted-foreground">{title}</span>
            <span className={`font-heading text-3xl font-extrabold ${className}`}>{value}</span>
        </Card>
    );
}

export function ContabilidadPage() {
    const { resumen: stats, movimientos: movements, loading } = useResumen();

    if (loading) return <div className="text-muted-foreground">Cargando módulo contable...</div>;

    return (
        <div>
            <h2 className="mt-0 mb-5 text-2xl font-semibold">Contabilidad &amp; Finanzas</h2>

            <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                <StatCard title="Ingresos Brutos" value={`$${stats?.ingresos?.toLocaleString() || 0}`} className="text-success" />
                <StatCard title="Egresos / Costos" value={`$${stats?.egresos?.toLocaleString() || 0}`} className="text-destructive" />
                <StatCard
                    title="Saldo Neto Operativo"
                    value={`$${stats?.saldoNeto?.toLocaleString() || 0}`}
                    className={stats?.saldoNeto >= 0 ? 'text-success' : ''}
                />
            </div>

            <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                <StatCard
                    title="Costo de Mercadería Vendida"
                    value={`$${stats?.ventas?.costoMercaderia?.toLocaleString() || 0}`}
                    style={{ background: 'linear-gradient(135deg, rgba(90,28,228,0.08), rgba(122,66,244,0.08))' }}
                />
                <StatCard
                    title="Margen Bruto Real"
                    value={`$${stats?.ventas?.margenBruto?.toLocaleString() || 0}`}
                    className="text-success"
                    style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.08))' }}
                />
            </div>

            <Card>
                <h3 className="mt-0 mb-6 text-muted-foreground">Libro Diario (Últimos movimientos)</h3>
                {movements.length === 0 ? (
                    <EmptyState message="No hay movimientos registrados." />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <Th>Fecha</Th><Th>Concepto</Th><Th>Tipo</Th>
                                <Th>Medio</Th><Th className="text-right">Monto</Th>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movements.map((m) => (
                                <TableRow key={m._id}>
                                    <Td>{new Date(m.createdAt).toLocaleString()}</Td>
                                    <Td>{m.concept}</Td>
                                    <Td>
                                        <Badge variant={m.type === 'ingreso' ? 'success' : 'danger'}>{m.type}</Badge>
                                    </Td>
                                    <Td className="capitalize">{m.paymentMethod || '-'}</Td>
                                    <Td className={`text-right font-bold ${m.type === 'ingreso' ? 'text-success' : 'text-destructive'}`}>
                                        {m.type === 'ingreso' ? '+' : '-'}${m.amount?.toLocaleString()}
                                    </Td>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
}
