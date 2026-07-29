import { useAccesos } from '../hooks/useAccesos';

export const AccesosPage = () => {
    const { operarios, codigos, toggle } = useAccesos();

    const handleToggle = async (user, code) => {
        const enabled = !user.permissions.includes(code);
        try {
            await toggle(user._id, code, enabled);
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
                                        onChange={() => handleToggle(u, c.code)}
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
