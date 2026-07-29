import { useState, useMemo } from 'react';
import { fmt } from '../lib/format';
import { useNotas } from '../hooks/useNotas';
import { Badge } from '../components/ui/Badge';

const tipoLabel = { compra: 'Compra', mantenimiento: 'Mantenimiento', reporte: 'Reporte', otro: 'Otro' };
const statusLabel = { pendiente: 'Pendiente', revision: 'En revisión', aprobada: 'Aprobada', cerrada: 'Cerrada', rechazada: 'Rechazada' };

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
            <div className="admin-toolbar">
                <h2>Notas y reportes</h2>
                <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                    <option value="">Todas las sucursales</option>
                    {branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
                </select>
            </div>

            <div className="stats-grid">
                <div className="glass-panel stat-card">
                    <span className="stat-title">Pendientes</span>
                    <span className="stat-value primary">{resumen.pendiente}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">En revisión</span>
                    <span className="stat-value">{resumen.revision}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Aprobadas</span>
                    <span className="stat-value success">{resumen.aprobada}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Cerradas</span>
                    <span className="stat-value" style={{ color: 'var(--destructive)' }}>{resumen.cerrada}</span>
                </div>
            </div>

            <div className="glass-panel">
                <div className="admin-table-container">
                    <table className="admin-table compacta">
                        <thead>
                            <tr>
                                <th>Tipo</th><th>Título</th><th>Operario</th>
                                <th>Descripción</th><th>Proveedor</th><th>Total</th>
                                <th>Estado</th><th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notes.length === 0 && <tr><td colSpan="8" className="muted centro">No hay notas registradas.</td></tr>}
                            {notes.map((note) => (
                                <tr key={note._id}>
                                    <td><Badge>{tipoLabel[note.type] || note.type}</Badge></td>
                                    <td><strong>{note.title}</strong></td>
                                    <td>{note.createdBy?.name || note.createdBy?.username || '—'}</td>
                                    <td>{note.description}</td>
                                    <td>{note.supplierName || '—'}</td>
                                    <td>{fmt(note.total)}</td>
                                    <td>{statusLabel[note.status] || note.status}</td>
                                    <td>
                                        <select value={note.status} onChange={(e) => handleEstado(note._id, e.target.value)} disabled={busy}>
                                            <option value="pendiente">Pendiente</option>
                                            <option value="revision">En revisión</option>
                                            <option value="aprobada">Aprobada</option>
                                            <option value="cerrada">Cerrada</option>
                                            <option value="rechazada">Rechazada</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
