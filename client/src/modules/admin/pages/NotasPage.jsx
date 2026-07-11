import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiOwner } from '../../../api/http';

const fmt = (value) => `$${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const tipoLabel = {
    compra: 'Compra',
    mantenimiento: 'Mantenimiento',
    reporte: 'Reporte',
    otro: 'Otro'
};
const statusLabel = {
    pendiente: 'Pendiente',
    revision: 'En revisión',
    aprobada: 'Aprobada',
    cerrada: 'Cerrada',
    rechazada: 'Rechazada'
};

export const NotasPage = () => {
    const [notes, setNotes] = useState([]);
    const [branches, setBranches] = useState([]);
    const [branchId, setBranchId] = useState('');
    const [busy, setBusy] = useState(false);

    const cargar = useCallback(async () => {
        const params = branchId ? { branchId } : {};
        const [resNotes, resBranches] = await Promise.all([
            apiOwner.get('/api/notes', { params }),
            apiOwner.get('/api/branches')
        ]);
        setNotes(resNotes.data.data || []);
        setBranches(resBranches.data.data || []);
    }, [branchId]);

    useEffect(() => { cargar().catch(console.error); }, [cargar]);

    const resumen = useMemo(() => {
        const counts = { pendiente: 0, revision: 0, aprobada: 0, cerrada: 0, rechazada: 0 };
        notes.forEach((n) => { counts[n.status] = (counts[n.status] || 0) + 1; });
        return counts;
    }, [notes]);

    const actualizarEstado = async (id, status) => {
        setBusy(true);
        try {
            await apiOwner.put(`/api/notes/${id}/status`, { status });
            await cargar();
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
                    <span className="stat-value" style={{ color: 'var(--danger)' }}>{resumen.cerrada}</span>
                </div>
            </div>

            <div className="glass-panel">
                <div className="admin-table-container">
                    <table className="admin-table compacta">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Título</th>
                                <th>Operario</th>
                                <th>Descripción</th>
                                <th>Proveedor</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notes.length === 0 && <tr><td colSpan="8" className="muted centro">No hay notas registradas.</td></tr>}
                            {notes.map((note) => (
                                <tr key={note._id}>
                                    <td><span className="badge badge-primary">{tipoLabel[note.type] || note.type}</span></td>
                                    <td><strong>{note.title}</strong></td>
                                    <td>{note.createdBy?.name || note.createdBy?.username || '—'}</td>
                                    <td>{note.description}</td>
                                    <td>{note.supplierName || '—'}</td>
                                    <td>{fmt(note.total)}</td>
                                    <td>{statusLabel[note.status] || note.status}</td>
                                    <td>
                                        <select value={note.status} onChange={(e) => actualizarEstado(note._id, e.target.value)} disabled={busy}>
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
