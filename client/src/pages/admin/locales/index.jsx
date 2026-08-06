import { useState } from 'react';
import { Plus, ToggleRight } from 'lucide-react';
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
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="h-6 w-1.5 rounded-full bg-primary" />
                        <h1 className="m-0 text-2xl font-bold tracking-tight text-foreground">Sucursales y Locales</h1>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Administración de tiendas físicas de la empresa y puntos asignados.</p>
                </div>
                <Button onClick={abrirNuevo}>
                    <Plus size={16} />
                    Agregar sucursal
                </Button>
            </div>

            <Card className="overflow-hidden p-0 gap-0">
                {sucursales.length === 0 ? (
                    <EmptyState message="Todavía no cargaste locales." />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <Th>Nombre</Th>
                                <Th>Dirección</Th>
                                <Th>Teléfono</Th>
                                <Th>Estado</Th>
                                <Th className="text-right">Acciones</Th>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sucursales.map((b) => (
                                <TableRow key={b._id}>
                                    <Td>{b.name}</Td>
                                    <Td>{b.address || '—'}</Td>
                                    <Td>{b.phone || '—'}</Td>
                                    <Td>
                                        <button
                                            type="button"
                                            onClick={() => confirmarBaja(b)}
                                            title="Hacer clic para dar de baja"
                                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-[var(--success-fg)]/30 bg-[var(--success-bg)] px-3 py-1 text-xs font-semibold text-[var(--success-fg)] transition-all hover:opacity-80 active:scale-95"
                                        >
                                            <ToggleRight size={15} className="shrink-0 text-[var(--success-fg)]" />
                                            Activa
                                        </button>
                                    </Td>
                                    <Td className="text-right space-x-1.5 whitespace-nowrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => abrirEdicion(b)}
                                        >
                                            Editar
                                        </Button>
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
