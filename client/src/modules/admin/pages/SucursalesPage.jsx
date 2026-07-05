import { useState, useEffect, useCallback } from 'react';
import { apiOwner } from '../../../api/http';

export const SucursalesPage = () => {
    const [sucursales, setSucursales] = useState([]);
    const [form, setForm] = useState({ name: '', address: '', phone: '' });
    const [editando, setEditando] = useState(null);

    const cargar = useCallback(async () => {
        const { data } = await apiOwner.get('/api/branches');
        setSucursales(data.data);
    }, []);

    useEffect(() => { cargar().catch(console.error); }, [cargar]);

    const guardar = async (e) => {
        e.preventDefault();
        try {
            if (editando) await apiOwner.put(`/api/branches/${editando}`, form);
            else await apiOwner.post('/api/branches', form);
            setForm({ name: '', address: '', phone: '' });
            setEditando(null);
            cargar();
        } catch (err) { alert(err.response?.data?.message || 'Error al guardar'); }
    };

    const darDeBaja = async (b) => {
        if (!window.confirm(`¿Dar de baja "${b.name}"? Los operarios asignados dejarán de verla.`)) return;
        await apiOwner.delete(`/api/branches/${b._id}`);
        cargar();
    };

    return (
        <div>
            <h2>Sucursales</h2>

            <form className="admin-form-row" onSubmit={guardar}>
                <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <input placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <button className="btn-primario">{editando ? 'Guardar cambios' : '+ Agregar'}</button>
                {editando && (
                    <button type="button" className="btn-outline" onClick={() => { setEditando(null); setForm({ name: '', address: '', phone: '' }); }}>
                        Cancelar
                    </button>
                )}
            </form>

            <table className="admin-table">
                <thead><tr><th>Nombre</th><th>Dirección</th><th>Teléfono</th><th></th></tr></thead>
                <tbody>
                    {sucursales.length === 0 && <tr><td colSpan="4" className="muted centro">Todavía no cargaste sucursales.</td></tr>}
                    {sucursales.map((b) => (
                        <tr key={b._id}>
                            <td><strong>{b.name}</strong></td>
                            <td>{b.address || '—'}</td>
                            <td>{b.phone || '—'}</td>
                            <td className="der">
                                <button className="btn-mini" onClick={() => { setEditando(b._id); setForm({ name: b.name, address: b.address || '', phone: b.phone || '' }); }}>Editar</button>
                                <button className="btn-mini rojo" onClick={() => darDeBaja(b)}>Baja</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
