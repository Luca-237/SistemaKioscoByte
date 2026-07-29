import { useState } from 'react';
import { useOperarios } from '../hooks/useOperarios';
import { Button } from '../components/ui/Button';

export const OperariosPage = () => {
    const { operarios, sucursales, crear, actualizar } = useOperarios();
    const [form, setForm] = useState({ name: '', username: '', password: '', branchIds: [] });

    const toggleBranchForm = (id) => {
        setForm((f) => ({
            ...f,
            branchIds: f.branchIds.includes(id) ? f.branchIds.filter((x) => x !== id) : [...f.branchIds, id]
        }));
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            await crear(form);
            setForm({ name: '', username: '', password: '', branchIds: [] });
        } catch (err) { alert(err.response?.data?.message || 'Error al crear el operario'); }
    };

    const toggleBranchUser = async (user, branchId) => {
        const actuales = user.branchIds.map((b) => b._id);
        const nuevas = actuales.includes(branchId) ? actuales.filter((x) => x !== branchId) : [...actuales, branchId];
        await actualizar(user._id, { branchIds: nuevas });
    };

    const toggleActivo = async (user) => {
        await actualizar(user._id, { active: !user.active });
    };

    const resetearClave = async (user) => {
        const nueva = window.prompt(`Nueva contraseña para ${user.name}:`);
        if (!nueva) return;
        try {
            await actualizar(user._id, { newPassword: nueva });
            alert('Contraseña actualizada');
        } catch (err) { alert(err.response?.data?.message || 'Error al cambiar la contraseña'); }
    };

    return (
        <div>
            <h2>Operarios</h2>

            <div className="admin-panel">
                <h3>Nuevo operario</h3>
                <form className="admin-form-row" onSubmit={handleCrear}>
                    <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <input placeholder="Usuario *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                    <input type="password" placeholder="Contraseña *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    <Button type="submit">+ Agregar</Button>
                </form>
                <div className="admin-checks" style={{ marginTop: 10 }}>
                    <span>Sucursales iniciales:</span>
                    {sucursales.map((b) => (
                        <label key={b._id}>
                            <input type="checkbox" checked={form.branchIds.includes(b._id)} onChange={() => toggleBranchForm(b._id)} />
                            {b.name}
                        </label>
                    ))}
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Nombre</th><th>Usuario</th><th>Estado</th>
                        <th>Sucursales</th><th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {operarios.length === 0 && <tr><td colSpan="5" className="muted centro">Todavía no cargaste operarios.</td></tr>}
                    {operarios.map((u) => (
                        <tr key={u._id} className={u.active ? '' : 'fila-inactiva'}>
                            <td><strong>{u.name}</strong></td>
                            <td className="mono">{u.username}</td>
                            <td>{u.active ? 'Activo' : 'Inactivo'}</td>
                            <td>
                                <div className="admin-checks compacto">
                                    {sucursales.map((b) => (
                                        <label key={b._id}>
                                            <input
                                                type="checkbox"
                                                checked={u.branchIds?.some((x) => (x._id || x) === b._id)}
                                                onChange={() => toggleBranchUser(u, b._id)}
                                            />
                                            {b.name}
                                        </label>
                                    ))}
                                </div>
                            </td>
                            <td>
                                <button className="btn-mini" onClick={() => toggleActivo(u)}>
                                    {u.active ? 'Desactivar' : 'Activar'}
                                </button>
                                <button className="btn-mini" onClick={() => resetearClave(u)}>Clave</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
