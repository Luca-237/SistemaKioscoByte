import { useResumen } from '../../../hooks/useResumen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

function StatCard({ title, value, borderClass = 'border-l-primary', valueClass = 'text-foreground', subtitle = '' }) {
    return (
        <Card className={`flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 ${borderClass} px-5 py-4`}>
            <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h4>
            <div className="flex items-baseline justify-between gap-2">
                <span className={`text-2xl font-bold ${valueClass}`}>{value}</span>
                {subtitle && <span className="text-xs text-muted-foreground whitespace-nowrap">{subtitle}</span>}
            </div>
        </Card>
    );
}

export function VentasPage() {
    const { resumen, loading } = useResumen();

    if (loading) return <div className="text-muted-foreground">Cargando estadísticas de ventas...</div>;

    return (
        <div>
            <h2 className="m-0 mb-4 text-2xl font-semibold text-foreground">Panel de Ventas</h2>

            <div className="flex flex-wrap gap-3.5">
                <StatCard
                    title="Facturación Total"
                    value={`$${resumen?.ventas?.facturado?.toLocaleString() || 0}`}
                    borderClass="border-l-primary"
                    valueClass="text-primary"
                    subtitle="Total"
                />
                <StatCard
                    title="Tickets Emitidos"
                    value={resumen?.ventas?.cantidadTickets || 0}
                    borderClass="border-l-success"
                    subtitle="Tickets"
                />
                <StatCard
                    title="Unidades Vendidas"
                    value={resumen?.ventas?.unidades || 0}
                    borderClass="border-l-warning"
                    subtitle="Unidades"
                />
            </div>

            <Card className="mt-6">
                <h3 className="m-0 mb-2 text-base font-semibold text-foreground">Ir al Punto de Venta</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                    Para registrar ventas como empleado, ingresá a la terminal de caja.
                </p>
                <Button onClick={() => window.open('/login', '_blank')}>Abrir Terminal de Caja</Button>
            </Card>
        </div>
    );
}
