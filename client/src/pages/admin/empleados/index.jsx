import { useState } from 'react';
import { Plus, ToggleRight, ToggleLeft } from 'lucide-react';
import { useOperarios } from '../../../hooks/useOperarios';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { EmpleadoModal } from './components/EmpleadoModal';

export const EmpleadosPage = () => {
    const { operarios, sucursales, crear, actualizar } = useOperarios();
    const [form, setForm] = useState({ name: '', username: '', password: '', branchIds: [] });
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState(null);

    const toggleBranchForm = (id) => {
        setForm((f) => ({
            ...f,
            branchIds: f.branchIds.includes(id) ? f.branchIds.filter((x) => x !== id) : [...f.branchIds, id]
        }));
    };

    const abrirNuevo = () => {
        setEditando(null);
        setForm({ name: '', username: '', password: '', branchIds: [] });
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setEditando(null);
        setForm({ name: '', username: '', password: '', branchIds: [] });
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                await actualizar(editando, payload);
            } else {
                await crear(form);
            }
            cerrarModal();
        } catch (err) { alert(err.response?.data?.message || 'Error al guardar el empleado'); }
    };

    const toggleBranchUser = async (user, branchId) => {
        const actuales = user.branchIds.map((b) => b._id || b);
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
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="h-6 w-1.5 rounded-full bg-primary" />
                        <h1 className="m-0 text-2xl font-bold tracking-tight text-foreground">Gestión de Operarios</h1>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Control de empleados, asignación a sucursales y blanqueo de claves.</p>
                </div>
                <Button onClick={abrirNuevo}>
                    <Plus size={16} />
                    Agregar operario
                </Button>
            </div>

            <Card className="overflow-hidden p-0 gap-0">
                {operarios.length === 0 ? (
                    <EmptyState message="Todavía no cargaste empleados." />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <Th>Nombre</Th><Th>Usuario</Th><Th>Estado</Th>
                                <Th>Locales</Th><Th className="text-right">Acciones</Th>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {operarios.map((u) => (
                                <TableRow key={u._id} className={u.active ? '' : 'opacity-50'}>
                                    <Td>{u.name}</Td>
                                    <Td className="font-mono text-xs">{u.username}</Td>
                                    <Td>
                                        {u.active ? (
                                            <button
                                                type="button"
                                                onClick={() => toggleActivo(u)}
                                                title="Hacer clic para desactivar"
                                                className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-[var(--success-fg)]/30 bg-[var(--success-bg)] px-3 py-1 text-xs font-semibold text-[var(--success-fg)] transition-all hover:opacity-80 active:scale-95"
                                            >
                                                <ToggleRight size={15} className="shrink-0 text-[var(--success-fg)]" />
                                                Activo
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => toggleActivo(u)}
                                                title="Hacer clic para activar"
                                                className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-[var(--danger-fg)]/30 bg-[var(--danger-bg)] px-3 py-1 text-xs font-semibold text-[var(--danger-fg)] transition-all hover:opacity-80 active:scale-95"
                                            >
                                                <ToggleLeft size={15} className="shrink-0 text-[var(--danger-fg)]" />
                                                Inactivo
                                            </button>
                                        )}
                                    </Td>
                                    <Td>
                                        <div className="flex flex-wrap items-center gap-3 text-xs">
                                            {sucursales.map((b) => (
                                                <label key={b._id} className="flex cursor-pointer items-center gap-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={u.branchIds?.some((x) => (x._id || x) === b._id)}
                                                        onChange={() => toggleBranchUser(u, b._id)}
                                                    />
                                                    {b.name}
                                                </label>
                                            ))}
                                        </div>
                                    </Td>
                                    <Td className="text-right space-x-1.5 whitespace-nowrap">
                                        <Button variant="outline" size="sm" onClick={() => resetearClave(u)}>Clave</Button>
                                    </Td>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>

            <EmpleadoModal
                open={showModal}
                onClose={cerrarModal}
                form={form}
                setForm={setForm}
                editando={editando}
                guardar={handleCrear}
                sucursales={sucursales}
                toggleBranchForm={toggleBranchForm}
            />
        </div>
    );
};
