import { useState, useEffect, useCallback } from 'react';
import { apiOwner } from '../../../api/http';

// Módulo Accesos: el propietario habilita/deshabilita a cada operario el
// acceso a los distintos módulos del panel (con eso el operario arma su
// propio sidebar). Es un menú separado de Operarios a propósito: este
// permiso ('access') se le puede dar a un operario para que administre los
// accesos de los demás sin darle el resto de los módulos.
export const AccesosPage = () => {
    const [operarios, setOperarios] = useState([]);
    const [codigos, setCodigos] = useState([]);

    const cargar = useCallback(async () => {
        const [ops, cods] = await Promise.all([
            apiOwner.get('/api/access/operators'),
            apiOwner.get('/api/access/codes')
        ]);
        setOperarios(ops.data.data);
        setCodigos(cods.data.data);
    }, []);

    useEffect(() => { cargar().catch(console.error); }, [cargar]);

    const toggleAcceso = async (user, code) => {
        const enabled = !user.permissions.includes(code);
        try {
            await apiOwner.patch(`/api/access/operators/${user._id}`, { code, enabled });
            cargar();
        } catch (err) { alert(err.response?.data?.message || 'Error al actualizar el acceso'); }
    };

    return (
        <div>
            <h2>Accesos</h2>
            <p className="muted" style={{ marginTop: '-8px', marginBottom: '16px' }}>
                Elegí qué secciones del panel puede ver cada operario, además de su punto de venta.
            </p>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Operario</th>
                        {codigos.map((c) => <th key={c.code} className="centro">{c.label}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {operarios.length === 0 && (
                        <tr><td colSpan={codigos.length + 1} className="muted centro">Todavía no creaste operarios.</td></tr>
                    )}
                    {operarios.map((u) => (
                        <tr key={u._id} className={u.active ? '' : 'fila-inactiva'}>
                            <td><strong>{u.name}</strong></td>
                            {codigos.map((c) => (
                                <td key={c.code} className="centro">
                                    <input
                                        type="checkbox"
                                        checked={u.permissions.includes(c.code)}
                                        onChange={() => toggleAcceso(u, c.code)}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
