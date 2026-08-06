import { useState, useMemo } from 'react';
import { fmt } from '../../../lib/format';
import { useNotas } from '../../../hooks/useNotas';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/Select';

const tipoLabel = { compra: 'Compra', mantenimiento: 'Mantenimiento', reporte: 'Reporte', otro: 'Otro' };
const statusLabel = { pendiente: 'Pendiente', revision: 'En revisión', aprobada: 'Aprobada', cerrada: 'Cerrada', rechazada: 'Rechazada' };
const TODAS = '__todas__';

export const ReportesPage = () => {
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
            alert(error.response?.data?.message || 'No se pudo actualizar el reporte');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="h-6 w-1.5 rounded-full bg-primary" />
                        <h1 className="m-0 text-2xl font-bold tracking-tight text-foreground">Notas y Reportes</h1>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Solicitudes de compras, mantenimiento e incidencias reportadas por los operarios.</p>
                </div>
                <Select value={branchId || TODAS} onValueChange={(v) => setBranchId(v === TODAS ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Todos los locales" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={TODAS}>Todos los locales</SelectItem>
                        {branches.map((branch) => <SelectItem key={branch._id} value={branch._id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="mb-6 flex flex-wrap gap-3.5">
                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-primary px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Pendientes</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-primary">{resumen.pendiente}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Notas</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-warning px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">En revisión</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">{resumen.revision}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Notas</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-success px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Aprobadas</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-success">{resumen.aprobada}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Notas</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-destructive px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Cerradas</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-destructive">{resumen.cerrada}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Notas</span>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden p-0 gap-0">
                {notes.length === 0 ? (
                    <EmptyState message="No hay reportes registrados." />
                ) : (
                    <Table compact>
                        <TableHeader>
                            <TableRow>
                                <Th>Tipo</Th><Th>Título</Th><Th>Empleado</Th>
                                <Th>Descripción</Th><Th>Proveedor</Th><Th>Total</Th>
                                <Th>Estado</Th><Th>Acción</Th>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notes.map((note) => (
                                <TableRow key={note._id}>
                                    <Td><Badge>{tipoLabel[note.type] || note.type}</Badge></Td>
                                    <Td>{note.title}</Td>
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
