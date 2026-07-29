import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCodigosAccesoPos } from '../api/access.api';
import { getPanelModulo } from '../api/panel.api';
import { useOperatorStore } from '../store/operatorStore';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';

// Panel del operario: sidebar dinámico según permisos + vista cruda del módulo.
// Es una prueba de conexión con el sistema de accesos; sin diseño definitivo.

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
        getCodigosAccesoPos().then(({ data }) => setCodigos(data.data)).catch(console.error);
    }, []);

    const permitidos = codigos.filter((c) => operator?.permissions?.includes(c.code));

    const verModulo = async (code) => {
        setActivo(code);
        setError(null);
        setData(null);
        setCargando(true);
        try {
            const { data } = await getPanelModulo(code);
            setData(data.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al pedir el módulo');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="admin-layout">
            <Sidebar
                brand={
                    <>
                        <span className="login-logo">FS</span>
                        <div>{operator?.name}</div>
                    </>
                }
                items={
                    permitidos.length === 0
                        ? [{ key: '__empty__', label: <span className="muted">Sin accesos habilitados</span>, onClick: () => {} }]
                        : permitidos.map((c) => ({
                            key: c.code,
                            label: c.label,
                            active: activo === c.code,
                            onClick: () => verModulo(c.code),
                        }))
                }
                footer={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Button variant="outline" onClick={() => navigate('/pos')}>← Volver al POS</Button>
                        <Button variant="outline" onClick={() => { logout(); navigate('/login'); }}>Salir</Button>
                    </div>
                }
            />

            <main className="admin-content">
                <h2>{activo ? permitidos.find((c) => c.code === activo)?.label : 'Elegí un módulo del sidebar'}</h2>
                {cargando && <p className="muted">Cargando…</p>}
                {error && <p className="admin-error">{error}</p>}
                {data && <pre className="glass-panel" style={{ overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>}
            </main>
        </div>
    );
}
