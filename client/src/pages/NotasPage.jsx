import { useState, useMemo } from 'react';
import { fmt } from '../lib/format';
import { useNotas } from '../hooks/useNotas';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/Select';

const tipoLabel = { compra: 'Compra', mantenimiento: 'Mantenimiento', reporte: 'Reporte', otro: 'Otro' };
const statusLabel = { pendiente: 'Pendiente', revision: 'En revisión', aprobada: 'Aprobada', cerrada: 'Cerrada', rechazada: 'Rechazada' };
const TODAS = '__todas__';

export const NotasPage = () => {
    const [branchId, setBranchId] = useState('');
    const { notes, branches, actualizarEstado } = useNotas(branchId);
    const [busy, setBusy] = useState(false);

    const resumen = useMemo(() => {
        const counts = { pendiente: 0, revision: 0, aprobada: 0, cerrada: 0, rechazada: 0 };
        notes.forEach((n) => { counts[n.status] = (counts[n.status] || 0) + 1; });
        return counts;
    }, [notes]);

    const handleEstado = async (id, status) => {
        setBusy(true);
        try {
            await actualizarEstado(id, status);
        } catch (error) {
            alert(error.response?.data?.message || 'No se pudo actualizar la nota');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 text-2xl font-semibold">Notas y reportes</h2>
                <Select value={branchId || TODAS} onValueChange={(v) => setBranchId(v === TODAS ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Todas las sucursales" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={TODAS}>Todas las sucursales</SelectItem>
                        {branches.map((branch) => <SelectItem key={branch._id} value={branch._id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
                <Card className="gap-1.5 py-4">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Pendientes</span>
                    <span className="font-heading text-2xl font-extrabold text-primary">{resumen.pendiente}</span>
                </Card>
                <Card className="gap-1.5 py-4">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">En revisión</span>
                    <span className="font-heading text-2xl font-extrabold">{resumen.revision}</span>
                </Card>
                <Card className="gap-1.5 py-4">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Aprobadas</span>
                    <span className="font-heading text-2xl font-extrabold text-success">{resumen.aprobada}</span>
                </Card>
                <Card className="gap-1.5 py-4">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Cerradas</span>
                    <span className="font-heading text-2xl font-extrabold text-destructive">{resumen.cerrada}</span>
                </Card>
            </div>

            <Card className="overflow-hidden p-0">
                {notes.length === 0 ? (
                    <EmptyState message="No hay notas registradas." />
                ) : (
                    <Table compact>
                        <TableHeader>
                            <TableRow>
                                <Th>Tipo</Th><Th>Título</Th><Th>Operario</Th>
                                <Th>Descripción</Th><Th>Proveedor</Th><Th>Total</Th>
                                <Th>Estado</Th><Th>Acción</Th>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notes.map((note) => (
                                <TableRow key={note._id}>
                                    <Td><Badge>{tipoLabel[note.type] || note.type}</Badge></Td>
                                    <Td><strong>{note.title}</strong></Td>
                                    <Td>{note.createdBy?.name || note.createdBy?.username || '—'}</Td>
                                    <Td>{note.description}</Td>
                                    <Td>{note.supplierName || '—'}</Td>
                                    <Td>{fmt(note.total)}</Td>
                                    <Td>{statusLabel[note.status] || note.status}</Td>
                                    <Td>
                                        <Select value={note.status} onValueChange={(v) => handleEstado(note._id, v)} disabled={busy}>
                                            <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(statusLabel).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
