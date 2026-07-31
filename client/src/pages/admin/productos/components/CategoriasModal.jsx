import { useState } from 'react';
import { ChevronRight, Pencil, Ban, RotateCcw } from 'lucide-react';
import { fmt } from '../../../../lib/format';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { DialogTitle } from '../../../../components/ui/dialog';

export function CategoriasModal({ articulos, categorias, onClose, onCategoryRenamed, onArticleCategoryChanged, onToggleActive, onCreateCategory }) {
    const [expandida, setExpandida] = useState(null);
    const [editandoCat, setEditandoCat] = useState(null);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevaCat, setNuevaCat] = useState('');
    const [creando, setCreando] = useState(false);
    const [toggling, setToggling] = useState(null);

    const articulosDeCat = (catName) => articulos.filter((a) => a.category === catName);
    const sinCategoria = articulos.filter((a) => !a.category);

    // Ordenar: activas primero, inactivas al final
    const categoriasOrdenadas = [...categorias].sort((a, b) => {
        if (a.active !== false && b.active === false) return -1;
        if (a.active === false && b.active !== false) return 1;
        return a.name.localeCompare(b.name, 'es');
    });

    const iniciarEdicion = (catName) => { setEditandoCat(catName); setNuevoNombre(catName); };

    const guardarEdicion = () => {
        if (!nuevoNombre.trim() || nuevoNombre.trim() === editandoCat) { setEditandoCat(null); return; }
        onCategoryRenamed(editandoCat, nuevoNombre.trim());
        setEditandoCat(null);
    };

    const crearCategoria = async () => {
        if (!nuevaCat.trim()) return;
        try {
            await onCreateCategory({ name: nuevaCat.trim() });
            setNuevaCat('');
            setCreando(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Error al crear la categoría');
        }
    };

    const handleToggle = async (cat) => {
        const newActive = cat.active === false;
        setToggling(cat._id);
        try {
            await onToggleActive(cat._id, newActive);
        } catch (err) {
            alert(err.response?.data?.message || 'Error al cambiar el estado');
        } finally {
            setToggling(null);
        }
    };

    return (
        <Modal open onClose={onClose} className="flex max-h-[80vh] w-full max-w-[560px] flex-col">
            <DialogTitle className="text-lg font-semibold">Gestionar Categorías</DialogTitle>

            <div className="flex-1 overflow-y-auto">
                <div className="mb-4">
                    {creando ? (
                        <div className="flex items-center gap-2">
                            <Input
                                autoFocus
                                placeholder="Nombre de la categoría"
                                value={nuevaCat}
                                onChange={(e) => setNuevaCat(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') crearCategoria(); if (e.key === 'Escape') setCreando(false); }}
                            />
                            <Button size="sm" onClick={crearCategoria}>Crear</Button>
                            <Button variant="outline" size="sm" onClick={() => setCreando(false)}>Cancelar</Button>
                        </div>
                    ) : (
                        <Button size="sm" onClick={() => setCreando(true)}>+ Nueva categoría</Button>
                    )}
                </div>
                <div className="flex flex-col gap-1.5">
                    {categoriasOrdenadas.length === 0 && <p className="p-5 text-center text-muted-foreground">No hay categorías aún.</p>}
                    {categoriasOrdenadas.map((cat) => {
                        const arts = articulosDeCat(cat.name);
                        const isExpanded = expandida === cat.name;
                        const isInactive = cat.active === false;
                        return (
                            <div key={cat._id} className={`overflow-hidden rounded-md border transition-colors ${isInactive ? 'border-border/50 opacity-60' : isExpanded ? 'border-primary shadow-[0_2px_12px_rgba(90,28,228,0.08)]' : 'border-border'}`}>
                                <div className="flex cursor-pointer items-center justify-between gap-2 bg-card px-3.5 py-2.5 hover:bg-background" onClick={() => setExpandida(isExpanded ? null : cat.name)}>
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                        <ChevronRight size={16} className={`shrink-0 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        {editandoCat === cat.name ? (
                                            <Input
                                                autoFocus
                                                className="h-7 min-w-[120px] font-semibold"
                                                value={nuevoNombre}
                                                onChange={(e) => setNuevoNombre(e.target.value)}
                                                onBlur={guardarEdicion}
                                                onKeyDown={(e) => { if (e.key === 'Enter') guardarEdicion(); if (e.key === 'Escape') setEditandoCat(null); }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span className={`truncate text-sm font-semibold ${isInactive ? 'line-through text-muted-foreground' : ''}`}>{cat.name}</span>
                                        )}
                                        {isInactive && (
                                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-destructive">Inactiva</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="rounded-full bg-background px-2 py-0.5 text-xs whitespace-nowrap text-muted-foreground">{arts.length} art.</span>
                                        {!isInactive && (
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); iniciarEdicion(cat.name); }} title="Renombrar">
                                                <Pencil size={13} />
                                            </Button>
                                        )}
                                        <Button
                                            variant={isInactive ? 'outline' : 'destructive'}
                                            size="sm"
                                            disabled={toggling === cat._id}
                                            onClick={(e) => { e.stopPropagation(); handleToggle(cat); }}
                                            title={isInactive ? 'Reactivar categoría' : 'Dar de baja'}
                                        >
                                            {toggling === cat._id ? '…' : isInactive ? <RotateCcw size={13} /> : <Ban size={13} />}
                                        </Button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="border-t border-border bg-background px-3.5 py-2.5 pl-9">
                                        {arts.length === 0 ? <p className="py-2 text-muted-foreground">Sin artículos.</p> : (
                                            <ul className="m-0 list-none p-0">
                                                {arts.map((a) => (
                                                    <li key={a._id} className="flex items-center justify-between border-b border-border/50 py-1.5 text-sm last:border-0">
                                                        <span>{a.name}</span>
                                                        <span className="font-mono text-muted-foreground">{fmt(a.salePrice)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {sinCategoria.length > 0 && (
                        <div className="overflow-hidden rounded-md border border-dashed border-border">
                            <div className="flex cursor-pointer items-center justify-between gap-2 bg-card px-3.5 py-2.5 hover:bg-background" onClick={() => setExpandida(expandida === '__sin__' ? null : '__sin__')}>
                                <div className="flex items-center gap-2">
                                    <ChevronRight size={16} className={`text-muted-foreground transition-transform ${expandida === '__sin__' ? 'rotate-90' : ''}`} />
                                    <span className="text-sm font-semibold text-muted-foreground">Sin categoría</span>
                                </div>
                                <span className="rounded-full bg-background px-2 py-0.5 text-xs whitespace-nowrap text-muted-foreground">{sinCategoria.length} art.</span>
                            </div>
                            {expandida === '__sin__' && (
                                <div className="border-t border-border bg-background px-3.5 py-2.5 pl-9">
                                    <ul className="m-0 list-none p-0">
                                        {sinCategoria.map((a) => (
                                            <li key={a._id} className="flex items-center justify-between border-b border-border/50 py-1.5 text-sm last:border-0">
                                                <span>{a.name}</span>
                                                <span className="font-mono text-muted-foreground">{fmt(a.salePrice)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
