import { useState } from 'react';
import { useSucursales } from '../hooks/useSucursales';
import { Button } from '../components/ui/Button';

export const SucursalesPage = () => {
    const { sucursales, crear, editar, darDeBaja } = useSucursales();
    const [form, setForm] = useState({ name: '', address: '', phone: '' });
    const [editando, setEditando] = useState(null);

    const guardar = async (e) => {
        e.preventDefault();
        try {
            if (editando) await editar(editando, form);
            else await crear(form);
            setForm({ name: '', address: '', phone: '' });
            setEditando(null);
        } catch (err) { alert(err.response?.data?.message || 'Error al guardar'); }
    };

    const confirmarBaja = async (b) => {
        if (!window.confirm(`¿Dar de baja "${b.name}"? Los operarios asignados dejarán de verla.`)) return;
        await darDeBaja(b._id);
    };

    return (
        <div>
            <h2>Sucursales</h2>

            <form className="admin-form-row" onSubmit={guardar}>
                <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <input placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Button type="submit">{editando ? 'Guardar cambios' : '+ Agregar'}</Button>
                {editando && (
                    <Button variant="outline" type="button" onClick={() => { setEditando(null); setForm({ name: '', address: '', phone: '' }); }}>
                        Cancelar
                    </Button>
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
                                <Button variant="destructive" onClick={() => confirmarBaja(b)}>Baja</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
