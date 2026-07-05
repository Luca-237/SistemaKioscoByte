import { useState, useEffect, useCallback } from 'react';
import { apiOwner } from '../../../api/http';

// Módulo Usuarios: el propietario crea operarios y los asigna a sucursales.
export const OperariosPage = () => {
    const [operarios, setOperarios] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [form, setForm] = useState({ name: '', username: '', password: '', branchIds: [] });

    const cargar = useCallback(async () => {
        const [u, b] = await Promise.all([
            apiOwner.get('/api/users'),
            apiOwner.get('/api/branches')
        ]);
        setOperarios(u.data.data);
        setSucursales(b.data.data);
    }, []);

    useEffect(() => { cargar().catch(console.error); }, [cargar]);

    const toggleBranchForm = (id) => {
        setForm((f) => ({
            ...f,
            branchIds: f.branchIds.includes(id) ? f.branchIds.filter((x) => x !== id) : [...f.branchIds, id]
        }));
    };

    const crear = async (e) => {
        e.preventDefault();
        try {
            await apiOwner.post('/api/users', form);
            setForm({ name: '', username: '', password: '', branchIds: [] });
            cargar();
        } catch (err) { alert(err.response?.data?.message || 'Error al crear el operario'); }
    };

    const toggleBranchUser = async (user, branchId) => {
        const actuales = user.branchIds.map((b) => b._id);
        const nuevas = actuales.includes(branchId) ? actuales.filter((x) => x !== branchId) : [...actuales, branchId];
        await apiOwner.put(`/api/users/${user._id}`, { branchIds: nuevas });
        cargar();
    };

    const toggleActivo = async (user) => {
        await apiOwner.put(`/api/users/${user._id}`, { active: !user.active });
        cargar();
    };

    const resetearClave = async (user) => {
        const nueva = window.prompt(`Nueva contraseña para ${user.name}:`);
        if (!nueva) return;
        try {
            await apiOwner.put(`/api/users/${user._id}`, { newPassword: nueva });
            alert('Contraseña actualizada');
        } catch (err) { alert(err.response?.data?.message || 'Error al cambiar la contraseña'); }
    };

    return (
        <div>
            <h2>Operarios</h2>

            <form className="admin-panel" onSubmit={crear}>
                <h3>Nuevo operario</h3>
                <div className="admin-form-row">
                    <input placeholder="Nombre y apellido *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <input placeholder="Usuario *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                    <input placeholder="Contraseña *" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div className="admin-checks">
                    <span>Sucursales:</span>
                    {sucursales.map((b) => (
                        <label key={b._id}>
                            <input type="checkbox" checked={form.branchIds.includes(b._id)} onChange={() => toggleBranchForm(b._id)} />
                            {b.name}
                        </label>
                    ))}
                    {sucursales.length === 0 && <span className="muted">Primero cargá una sucursal</span>}
                </div>
                <button className="btn-primario">+ Crear operario</button>
            </form>

            <table className="admin-table">
                <thead><tr><th>Nombre</th><th>Usuario</th><th>Sucursales</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                    {operarios.length === 0 && <tr><td colSpan="5" className="muted centro">Todavía no creaste operarios.</td></tr>}
                    {operarios.map((u) => (
                        <tr key={u._id} className={u.active ? '' : 'fila-inactiva'}>
                            <td><strong>{u.name}</strong></td>
                            <td>{u.username}</td>
                            <td>
                                <div className="admin-checks compacto">
                                    {sucursales.map((b) => (
                                        <label key={b._id}>
                                            <input
                                                type="checkbox"
                                                checked={u.branchIds.some((x) => x._id === b._id)}
                                                onChange={() => toggleBranchUser(u, b._id)}
                                            />
                                            {b.name}
                                        </label>
                                    ))}
                                </div>
                            </td>
                            <td>{u.active ? '✅ Activo' : '⛔ Inactivo'}</td>
                            <td className="der">
                                <button className="btn-mini" onClick={() => resetearClave(u)}>Clave</button>
                                <button className="btn-mini" onClick={() => toggleActivo(u)}>{u.active ? 'Desactivar' : 'Activar'}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
