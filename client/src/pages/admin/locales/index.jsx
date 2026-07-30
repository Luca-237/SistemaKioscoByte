import { useState } from 'react';
import { useSucursales } from '../../../hooks/useSucursales';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';

export const LocalesPage = () => {
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
        if (!window.confirm(`¿Dar de baja "${b.name}"? Los empleados asignados dejarán de verlo.`)) return;
        await darDeBaja(b._id);
    };

    return (
        <div>
            <h2 className="mt-0 mb-4 text-2xl font-semibold">Locales</h2>

            <form className="mb-4 flex flex-wrap gap-2.5" onSubmit={guardar}>
                <Input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="max-w-56" />
                <Input placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="max-w-56" />
                <Input placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="max-w-44" />
                <Button type="submit">{editando ? 'Guardar cambios' : '+ Agregar'}</Button>
                {editando && (
                    <Button variant="outline" type="button" onClick={() => { setEditando(null); setForm({ name: '', address: '', phone: '' }); }}>
                        Cancelar
                    </Button>
                )}
            </form>

            <Card className="overflow-hidden p-0">
                {sucursales.length === 0 ? (
                    <EmptyState message="Todavía no cargaste locales." />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow><Th>Nombre</Th><Th>Dirección</Th><Th>Teléfono</Th><Th></Th></TableRow>
                        </TableHeader>
                        <TableBody>
                            {sucursales.map((b) => (
                                <TableRow key={b._id}>
                                    <Td><strong>{b.name}</strong></Td>
                                    <Td>{b.address || '—'}</Td>
                                    <Td>{b.phone || '—'}</Td>
                                    <Td className="text-right space-x-1.5 whitespace-nowrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setEditando(b._id); setForm({ name: b.name, address: b.address || '', phone: b.phone || '' }); }}
                                        >
                                            Editar
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => confirmarBaja(b)}>Baja</Button>
                                    </Td>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
};
