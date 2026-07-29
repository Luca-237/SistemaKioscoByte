import { useState, useEffect, useCallback } from 'react';
import { getNotes, updateNoteStatus } from '../api/note.api';
import { getBranches } from '../api/branch.api';

export function useNotas(branchId = '') {
    const [notes, setNotes] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = branchId ? { branchId } : {};
            const [resNotes, resBranches] = await Promise.all([getNotes(params), getBranches()]);
            setNotes(resNotes.data.data || []);
            setBranches(resBranches.data.data || []);
        } catch (e) {
            setError(e.response?.data?.error || 'Error al cargar notas');
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    useEffect(() => { refresh(); }, [refresh]);

    const actualizarEstado = async (id, status) => {
        await updateNoteStatus(id, status);
        await refresh();
    };

    return { notes, branches, loading, error, refresh, actualizarEstado };
}
