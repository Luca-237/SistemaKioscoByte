import { useResumen } from '../../../hooks/useResumen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

function StatCard({ title, value, className = '' }) {
    return (
        <Card className="gap-2 py-5">
            <span className="text-sm font-semibold text-muted-foreground">{title}</span>
            <span className={`font-heading text-3xl font-extrabold ${className}`}>{value}</span>
        </Card>
    );
}

export function VentasPage() {
    const { resumen, loading } = useResumen();

    if (loading) return <div className="text-muted-foreground">Cargando estadísticas de ventas...</div>;

    return (
        <div>
            <h2 className="m-0 mb-5 text-2xl font-semibold text-foreground">Panel de Ventas</h2>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                <StatCard title="Facturación Total" value={`$${resumen?.ventas?.facturado?.toLocaleString() || 0}`} className="text-primary" />
                <StatCard title="Tickets Emitidos" value={resumen?.ventas?.cantidadTickets || 0} />
                <StatCard title="Unidades Vendidas" value={resumen?.ventas?.unidades || 0} />
            </div>

            <Card className="mt-8">
                <h3 className="m-0 mb-2 text-base font-semibold text-foreground">Ir al Punto de Venta</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                    Para registrar ventas como empleado, ingresá a la terminal de caja.
                </p>
                <Button onClick={() => window.open('/login', '_blank')}>Abrir Terminal de Caja</Button>
            </Card>
        </div>
    );
}
