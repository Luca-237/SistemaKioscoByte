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
        <Sidebar
            brand={
                <>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-heading text-sm font-extrabold text-primary-foreground">FS</span>
                    <div className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">{operator?.name}</div>
                </>
            }
            items={
                permitidos.length === 0
                    ? [{ key: '__empty__', label: <span className="text-muted-foreground">Sin accesos habilitados</span>, onClick: () => {} }]
                    : permitidos.map((c) => ({
                        key: c.code,
                        label: c.label,
                        active: activo === c.code,
                        onClick: () => verModulo(c.code),
                    }))
            }
            footer={
                <div className="flex flex-col gap-2 group-data-[collapsible=icon]:items-center">
                    <Button variant="outline" onClick={() => navigate('/pos')}>← Volver al POS</Button>
                    <Button variant="outline" onClick={() => { logout(); navigate('/login'); }}>Salir</Button>
                </div>
            }
        >
            <h2 className="mt-0 mb-4 text-xl font-semibold">{activo ? permitidos.find((c) => c.code === activo)?.label : 'Elegí un módulo del sidebar'}</h2>
            {cargando && <p className="text-muted-foreground">Cargando…</p>}
            {error && <p className="text-destructive">{error}</p>}
            {data && <pre className="overflow-auto rounded-xl border border-border bg-card p-4 text-sm">{JSON.stringify(data, null, 2)}</pre>}
        </Sidebar>
    );
}
