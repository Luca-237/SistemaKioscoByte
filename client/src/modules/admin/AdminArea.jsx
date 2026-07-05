import { ClerkProvider, SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';
import { Link, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { apiOwner } from '../../api/http';
import { ResumenPage } from './pages/ResumenPage';
import { SucursalesPage } from './pages/SucursalesPage';
import { OperariosPage } from './pages/OperariosPage';
import { ArticulosPage } from './pages/ArticulosPage';
import { ComprasPage } from './pages/ComprasPage';
import './admin.css';

const PUB_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Área del PROPIETARIO. Tres estados:
//   1. Sin Publishable Key → instrucciones de configuración (el POS anda igual).
//   2. Con Clerk pero sin sesión → pantalla de login de Clerk.
//   3. Con sesión → si no creó su organización, onboarding; si no, el panel.
export default function AdminArea() {
    if (!PUB_KEY) return <ClerkSetupNotice />;

    return (
        <ClerkProvider publishableKey={PUB_KEY} afterSignOutUrl="/admin">
            <SignedOut>
                <div className="admin-signin">
                    <SignIn routing="hash" />
                </div>
            </SignedOut>
            <SignedIn>
                <AdminShell />
            </SignedIn>
        </ClerkProvider>
    );
}

function ClerkSetupNotice() {
    return (
        <div className="admin-setup">
            <div className="admin-setup-card">
                <h1>🔐 Panel de administración</h1>
                <p>
                    El acceso de propietarios usa <strong>Clerk</strong> y todavía no está configurado.
                    Para activarlo:
                </p>
                <ol>
                    <li>Crear una aplicación en <code>clerk.com</code> (método de login: email + contraseña).</li>
                    <li>Pegar la <strong>Publishable Key</strong> en <code>client/.env.development</code> → <code>VITE_CLERK_PUBLISHABLE_KEY</code>.</li>
                    <li>Pegar la <strong>Secret Key</strong> en <code>server/.env</code> → <code>CLERK_SECRET_KEY</code>.</li>
                    <li>Reiniciar server y client.</li>
                </ol>
                <p className="muted">El punto de venta de operarios funciona sin este paso.</p>
                <Link to="/login" className="btn-primario">Ir al acceso de operarios</Link>
            </div>
        </div>
    );
}

function AdminShell() {
    const [org, setOrg] = useState(undefined);   // undefined = cargando, null = sin org

    const cargarOrg = useCallback(async () => {
        try {
            const { data } = await apiOwner.get('/api/organizations/me');
            setOrg(data.org);
        } catch (e) {
            if (e.response?.status === 503) setOrg('clerk-server');
            else console.error(e);
        }
    }, []);

    useEffect(() => { cargarOrg(); }, [cargarOrg]);

    if (org === undefined) return <div className="admin-cargando">Cargando…</div>;

    if (org === 'clerk-server') {
        return (
            <div className="admin-setup">
                <div className="admin-setup-card">
                    <h1>Falta un paso</h1>
                    <p>El servidor todavía no tiene la <code>CLERK_SECRET_KEY</code> en <code>server/.env</code>. Agregala y reiniciá el server.</p>
                </div>
            </div>
        );
    }

    if (org === null) return <Onboarding onCreated={cargarOrg} />;

    return (
        <div className="admin-wrapper">
            <header className="admin-header">
                <div className="admin-brand">
                    <span className="pos-logo">FS</span>
                    <div>
                        <h1>{org.name}</h1>
                        <span className="admin-org-code">Código de empresa: <strong>{org.code}</strong></span>
                    </div>
                </div>
                <nav className="admin-nav">
                    <NavLink to="/admin" end>Resumen</NavLink>
                    <NavLink to="/admin/sucursales">Sucursales</NavLink>
                    <NavLink to="/admin/operarios">Operarios</NavLink>
                    <NavLink to="/admin/articulos">Artículos</NavLink>
                    <NavLink to="/admin/compras">Compras</NavLink>
                </nav>
                <UserButton />
            </header>

            <main className="admin-main">
                <Routes>
                    <Route index element={<ResumenPage />} />
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
        <div className="admin-setup">
            <form className="admin-setup-card" onSubmit={crear}>
                <h1>¡Bienvenido a FitoShop! 👋</h1>
                <p>Creá tu empresa para empezar. Después vas a poder cargar sucursales, operarios y artículos.</p>
                <label className="admin-field">
                    Nombre de la empresa *
                    <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: Kiosco San Martín" />
                </label>
                <label className="admin-field">
                    CUIT (opcional)
                    <input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="20-12345678-9" />
                </label>
                {error && <p className="admin-error">{error}</p>}
                <button className="btn-primario" disabled={ocupado}>
                    {ocupado ? 'Creando…' : 'Crear mi empresa'}
                </button>
            </form>
        </div>
    );
}
