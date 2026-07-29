import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useOrganizacion } from '../hooks/useOrganizacion';
import { Sidebar } from '../components/layout/Sidebar';
import '../styles/admin.css';

import { ResumenPage } from './ResumenPage';
import { SucursalesPage } from './SucursalesPage';
import { OperariosPage } from './OperariosPage';
import { ArticulosPage } from './ArticulosPage';
import { ComprasPage } from './ComprasPage';
import { VentaPage } from './VentaPage';
import { ContabilidadPage } from './ContabilidadPage';
import { EstadisticasPage } from './EstadisticasPage';
import { NotasPage } from './NotasPage';
import { CajasPage } from './CajasPage';
import { AccesosPage } from './AccesosPage';

const NAV_ITEMS = [
    { href: '/admin', end: true, label: 'Resumen' },
    { href: '/admin/venta',        label: 'Punto de Venta' },
    { href: '/admin/contabilidad', label: 'Contabilidad' },
    { href: '/admin/estadisticas', label: 'Estadísticas' },
    { href: '/admin/notas',        label: 'Notas' },
    { href: '/admin/articulos',    label: 'Artículos' },
    { href: '/admin/compras',      label: 'Compras' },
    { href: '/admin/cajas',        label: 'Cajas' },
    { href: '/admin/sucursales',   label: 'Sucursales' },
    { href: '/admin/operarios',    label: 'Operarios' },
    { href: '/admin/accesos',      label: 'Accesos' },
];

export default function AdminArea() {
    const { org, crear } = useOrganizacion();

    if (org === undefined) return <div className="admin-cargando">Cargando…</div>;
    if (org === null) return <Onboarding onCrear={crear} />;

    return (
        <div className="admin-layout">
            <Sidebar
                brand={
                    <>
                        <span className="login-logo">FS</span>
                        <div>
                            <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>{org.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Cód: {org.code}</div>
                        </div>
                    </>
                }
                items={NAV_ITEMS}
                footer={
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AD</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Admin (Modo Dev)</div>
                    </div>
                }
            />

            <main className="admin-content">
                <Routes>
                    <Route index element={<ResumenPage />} />
                    <Route path="venta" element={<VentaPage />} />
                    <Route path="contabilidad" element={<ContabilidadPage />} />
                    <Route path="estadisticas" element={<EstadisticasPage />} />
                    <Route path="notas" element={<NotasPage />} />
                    <Route path="sucursales" element={<SucursalesPage />} />
                    <Route path="operarios" element={<OperariosPage />} />
                    <Route path="accesos" element={<AccesosPage />} />
                    <Route path="articulos" element={<ArticulosPage />} />
                    <Route path="compras" element={<ComprasPage />} />
                    <Route path="cajas" element={<CajasPage />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </main>
        </div>
    );
}

// Primer ingreso del propietario: crea su empresa.
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
        <div className="login-wrapper">
            <form className="login-card" onSubmit={crear}>
                <div className="login-brand">
                    <h1>¡Bienvenido a FitoShop! 👋</h1>
                    <p>Creá tu empresa para empezar. Después vas a poder cargar sucursales, operarios y artículos.</p>
                </div>

                <div className="login-form">
                    <label>
                        Nombre de la empresa *
                        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: Kiosco San Martín" />
                    </label>
                    <label>
                        CUIT (opcional)
                        <input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="20-12345678-9" />
                    </label>
                    {error && <p className="login-error">{error}</p>}
                    <button type="submit" disabled={ocupado}>
                        {ocupado ? 'Creando…' : 'Crear mi empresa'}
                    </button>
                </div>
            </form>
        </div>
    );
}
