import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPos } from '../../api/http';
import { useOperatorStore } from '../../store/operatorStore';

// PRUEBA de conexión con el sistema de accesos: arma un sidebar según los
// permisos del operario logueado y muestra la data cruda del módulo elegido.
// Sin diseño definitivo, es solo para validar el flujo completo
// (login -> permissions -> checkAccess en el back) de punta a punta.

const ENDPOINT_POR_CODIGO = {
    articles: '/api/articles',
    branches: '/api/branches',
    suppliers: '/api/suppliers',
    purchases: '/api/purchases',
    notes: '/api/notes',
    stats: '/api/stats/summary',
    users: '/api/users',
    access: '/api/access/operators'
};

const linkStyle = { background: 'none', border: 'none', textAlign: 'left', width: '100%', font: 'inherit', cursor: 'pointer' };

export default function PanelOperario() {
    const navigate = useNavigate();
    const operator = useOperatorStore((s) => s.operator);
    const logout = useOperatorStore((s) => s.logout);

    const [codigos, setCodigos] = useState([]);
    const [activo, setActivo] = useState(null);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        apiPos.get('/api/access/codes').then(({ data }) => setCodigos(data.data)).catch(console.error);
    }, []);

    const permitidos = codigos.filter((c) => operator?.permissions?.includes(c.code));

    const verModulo = async (code) => {
        setActivo(code);
        setError(null);
        setData(null);
        setCargando(true);
        try {
            const { data } = await apiPos.get(ENDPOINT_POR_CODIGO[code]);
            setData(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al pedir el módulo');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <span className="login-logo">FS</span>
                    <div>{operator?.name}</div>
                </div>

                <nav className="admin-nav">
                    {permitidos.length === 0 && <p className="muted">Sin accesos habilitados</p>}
                    {permitidos.map((c) => (
                        <button
                            key={c.code}
                            className={`nav-link${activo === c.code ? ' active' : ''}`}
                            style={linkStyle}
                            onClick={() => verModulo(c.code)}
                        >
                            {c.label}
                        </button>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button className="btn-outline" onClick={() => navigate('/pos')}>← Volver al POS</button>
                    <button className="btn-outline" onClick={() => { logout(); navigate('/login'); }}>Salir</button>
                </div>
            </aside>

            <main className="admin-content">
                <h2>{activo ? permitidos.find((c) => c.code === activo)?.label : 'Elegí un módulo del sidebar'}</h2>
                {cargando && <p className="muted">Cargando…</p>}
                {error && <p className="admin-error">{error}</p>}
                {data && <pre className="glass-panel" style={{ overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>}
            </main>
        </div>
    );
}
