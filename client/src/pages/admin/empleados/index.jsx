import { useState } from 'react';
import { useOperarios } from '../../../hooks/useOperarios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';

export const EmpleadosPage = () => {
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
        } catch (err) { alert(err.response?.data?.message || 'Error al crear el empleado'); }
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
            <h2 className="mt-0 mb-4 text-2xl font-semibold">Empleados</h2>

            <Card className="mb-6">
                <h3 className="mt-0 mb-3">Nuevo empleado</h3>
                <form className="flex flex-wrap gap-2.5" onSubmit={handleCrear}>
                    <Input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="max-w-56" />
                    <Input placeholder="Usuario *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="max-w-48" />
                    <Input type="password" placeholder="Contraseña *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="max-w-48" />
                    <Button type="submit">+ Agregar</Button>
                </form>
                <div className="mt-2.5 flex flex-wrap items-center gap-4 text-sm">
                    <span className="font-semibold text-muted-foreground">Locales iniciales:</span>
                    {sucursales.map((b) => (
                        <label key={b._id} className="flex cursor-pointer items-center gap-1.5">
                            <input type="checkbox" checked={form.branchIds.includes(b._id)} onChange={() => toggleBranchForm(b._id)} />
                            {b.name}
                        </label>
                    ))}
                </div>
            </Card>

            <Card className="overflow-hidden p-0">
                {operarios.length === 0 ? (
                    <EmptyState message="Todavía no cargaste empleados." />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <Th>Nombre</Th><Th>Usuario</Th><Th>Estado</Th>
                                <Th>Locales</Th><Th>Acciones</Th>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {operarios.map((u) => (
                                <TableRow key={u._id} className={u.active ? '' : 'opacity-50'}>
                                    <Td><strong>{u.name}</strong></Td>
                                    <Td className="font-mono text-xs">{u.username}</Td>
                                    <Td>{u.active ? 'Activo' : 'Inactivo'}</Td>
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
                                    <Td className="space-x-1.5 whitespace-nowrap">
                                        <Button variant="outline" size="sm" onClick={() => toggleActivo(u)}>
                                            {u.active ? 'Desactivar' : 'Activar'}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => resetearClave(u)}>Clave</Button>
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
