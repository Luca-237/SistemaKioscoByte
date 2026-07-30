import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Wallet,
    BarChart3,
    StickyNote,
    Package,
    Truck,
    Banknote,
    Building2,
    Users,
    ShieldCheck,
} from 'lucide-react';
import { useOrganizacion } from '../../hooks/useOrganizacion';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

import { ResumenPage } from './resumen';
import { LocalesPage } from './locales';
import { EmpleadosPage } from './empleados';
import { ProductosPage } from './productos';
import { ComprasPage } from './compras';
import { VentasPage } from './ventas';
import { FinanzasPage } from './finanzas';
import { EstadisticasPage } from './estadisticas';
import { ReportesPage } from './reportes';
import { HistorialCajaPage } from './historial-caja';
import { AccesosPage } from './accesos';

const NAV_ITEMS = [
    { href: '/admin', end: true, label: 'Resumen', icon: LayoutDashboard },
    { href: '/admin/venta',        label: 'Punto de Venta', icon: ShoppingCart },
    { href: '/admin/contabilidad', label: 'Contabilidad', icon: Wallet },
    { href: '/admin/estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { href: '/admin/notas',        label: 'Notas', icon: StickyNote },
    { href: '/admin/articulos',    label: 'Artículos', icon: Package },
    { href: '/admin/compras',      label: 'Compras', icon: Truck },
    { href: '/admin/cajas',        label: 'Cajas', icon: Banknote },
    { href: '/admin/sucursales',   label: 'Sucursales', icon: Building2 },
    { href: '/admin/operarios',    label: 'Operarios', icon: Users },
    { href: '/admin/accesos',      label: 'Accesos', icon: ShieldCheck },
];

export default function AdminArea() {
    const { org, crear } = useOrganizacion();

    if (org === undefined) {
        return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Cargando…</div>;
    }
    if (org === null) return <Onboarding onCrear={crear} />;

    return (
        <Sidebar
            brand={
                <>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-heading text-sm font-extrabold text-primary-foreground">FS</span>
                    <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                        <span className="truncate text-sm leading-tight font-semibold">{org.name}</span>
                        <span className="truncate text-xs text-muted-foreground">Cód: {org.code}</span>
                    </div>
                </>
            }
            items={NAV_ITEMS}
            footer={
                <div className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/60 p-2 group-data-[collapsible=icon]:justify-center">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">AD</div>
                    <div className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">Admin (Modo Dev)</div>
                </div>
            }
        >
            <Routes>
                <Route index element={<ResumenPage />} />
                <Route path="venta" element={<VentasPage />} />
                <Route path="contabilidad" element={<FinanzasPage />} />
                <Route path="estadisticas" element={<EstadisticasPage />} />
                <Route path="notas" element={<ReportesPage />} />
                <Route path="sucursales" element={<LocalesPage />} />
                <Route path="operarios" element={<EmpleadosPage />} />
                <Route path="accesos" element={<AccesosPage />} />
                <Route path="articulos" element={<ProductosPage />} />
                <Route path="compras" element={<ComprasPage />} />
                <Route path="cajas" element={<HistorialCajaPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </Sidebar>
    );
}

function Onboarding({ onCrear }) {
    const [name, setName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [error, setError] = useState(null);
    const [ocupado, setOcupado] = useState(false);

    const crear = async (e) => {
        e.preventDefault();
        setOcupado(true);
        setError(null);
        try {
            await onCrear(name, taxId);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear la organización');
        } finally { setOcupado(false); }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#eef2ff_0%,var(--background)_100%)] p-5">
            <form onSubmit={crear} className="w-full max-w-[440px] rounded-2xl border border-border bg-card px-8 py-9 shadow-[0_10px_40px_rgba(24,24,27,0.08)]">
                <div className="mb-6 text-center">
                    <h1 className="mt-0 mb-2 font-heading text-xl">¡Bienvenido a FitoShop! 👋</h1>
                    <p className="m-0 text-sm text-muted-foreground">
                        Creá tu empresa para empezar. Después vas a poder cargar sucursales, operarios y artículos.
                    </p>
                </div>

                <div className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="orgName">Nombre de la empresa *</Label>
                        <Input id="orgName" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: Kiosco San Martín" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="orgTaxId">CUIT (opcional)</Label>
                        <Input id="orgTaxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="20-12345678-9" />
                    </div>
                    {error && <p className="m-0 text-center text-sm text-destructive">{error}</p>}
                    <Button type="submit" disabled={ocupado} className="mt-1.5 w-full">
                        {ocupado ? 'Creando…' : 'Crear mi empresa'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
