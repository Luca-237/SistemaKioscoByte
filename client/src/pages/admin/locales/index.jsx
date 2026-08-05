import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSucursales } from '../../../hooks/useSucursales';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LocalModal } from './components/LocalModal';

export const LocalesPage = () => {
    const { sucursales, crear, editar, darDeBaja } = useSucursales();
    const [form, setForm] = useState({ name: '', address: '', phone: '' });
    const [editando, setEditando] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const abrirNuevo = () => {
        setEditando(null);
        setForm({ name: '', address: '', phone: '' });
        setShowModal(true);
    };

    const abrirEdicion = (b) => {
        setEditando(b._id);
        setForm({ name: b.name, address: b.address || '', phone: b.phone || '' });
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setEditando(null);
        setForm({ name: '', address: '', phone: '' });
    };

    const guardar = async (e) => {
        e.preventDefault();
        try {
            if (editando) await editar(editando, form);
            else await crear(form);
            cerrarModal();
        } catch (err) { alert(err.response?.data?.message || 'Error al guardar'); }
    };

    const confirmarBaja = async (b) => {
        if (!window.confirm(`¿Dar de baja "${b.name}"? Los empleados asignados dejarán de verlo.`)) return;
        await darDeBaja(b._id);
    };

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 text-2xl font-semibold text-foreground">Locales</h2>
                <Button onClick={abrirNuevo}>
                    <Plus size={16} />
                    Agregar sucursal
                </Button>
            </div>

            <Card className="overflow-hidden p-0">
                {sucursales.length === 0 ? (
                    <EmptyState message="Todavía no cargaste locales." />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow><Th>Nombre</Th><Th>Dirección</Th><Th>Teléfono</Th><Th className="text-right">Acciones</Th></TableRow>
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
                                            onClick={() => abrirEdicion(b)}
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

            <LocalModal
                open={showModal}
                onClose={cerrarModal}
                form={form}
                setForm={setForm}
                editando={editando}
                guardar={guardar}
            />
        </div>
    );
};
