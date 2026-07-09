import { Link, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { apiOwner } from '../../api/http';

import { ResumenPage } from './pages/ResumenPage';
import { SucursalesPage } from './pages/SucursalesPage';
import { OperariosPage } from './pages/OperariosPage';
import { ArticulosPage } from './pages/ArticulosPage';
import { ComprasPage } from './pages/ComprasPage';
import { VentaPage } from './pages/VentaPage';
import { ContabilidadPage } from './pages/ContabilidadPage';

export default function AdminArea() {
    return <AdminShell />;
}

function AdminShell() {
    const [org, setOrg] = useState(undefined);   // undefined = cargando, null = sin org

    const cargarOrg = useCallback(async () => {
        try {
            const { data } = await apiOwner.get('/api/organizations/me');
            setOrg(data.org);
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => { cargarOrg(); }, [cargarOrg]);

    if (org === undefined) return <div className="admin-cargando">Cargando…</div>;
    if (org === null) return <Onboarding onCreated={cargarOrg} />;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <span className="login-logo">FS</span>
                    <div>
                        <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>{org.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cód: {org.code}</div>
                    </div>
                </div>
                
                <nav className="admin-nav">
                    <NavLink to="/admin" end className="nav-link">Resumen</NavLink>
                    <NavLink to="/admin/venta" className="nav-link">Punto de Venta</NavLink>
                    <NavLink to="/admin/contabilidad" className="nav-link">Contabilidad</NavLink>
                    <NavLink to="/admin/articulos" className="nav-link">Artículos</NavLink>
                    <NavLink to="/admin/compras" className="nav-link">Compras</NavLink>
                    <NavLink to="/admin/sucursales" className="nav-link">Sucursales</NavLink>
                    <NavLink to="/admin/operarios" className="nav-link">Operarios</NavLink>
                </nav>
                
                <div style={{ marginTop: 'auto' }}>
                    {/* Placeholder for UserButton */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AD</div>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Admin (Modo Dev)</div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="admin-content">
                <Routes>
                    <Route index element={<ResumenPage />} />
                    <Route path="venta" element={<VentaPage />} />
                    <Route path="contabilidad" element={<ContabilidadPage />} />
                    <Route path="sucursales" element={<SucursalesPage />} />
                    <Route path="operarios" element={<OperariosPage />} />
                    <Route path="articulos" element={<ArticulosPage />} />
                    <Route path="compras" element={<ComprasPage />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </main>
        </div>
    );
}

// Primer ingreso del propietario: crea su empresa.
function Onboarding({ onCreated }) {
    const [name, setName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [error, setError] = useState(null);
    const [ocupado, setOcupado] = useState(false);

    const crear = async (e) => {
        e.preventDefault();
        setOcupado(true);
        setError(null);
        try {
            await apiOwner.post('/api/organizations/bootstrap', { name, taxId });
            onCreated();
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
