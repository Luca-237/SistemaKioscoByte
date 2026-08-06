import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Search, FilterX, X, SlidersHorizontal } from 'lucide-react';
import { fmt } from '../../../lib/format';
import { useCajas } from '../../../hooks/useCajas';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/Select';
import { MovimientosModal } from './components/MovimientosModal';
import { cn } from '../../../lib/utils';

const TODAS = '__todas__';
const ITEMS_PER_PAGE = 10;

export function HistorialCajaPage() {
    const { cajas = [], loading, error, refresh, getSalesForSession } = useCajas();
    const [selectedCaja, setSelectedCaja] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);

    // Filtros de búsqueda, sucursal y popover modal
    const [branchId, setBranchId] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const filterRef = useRef(null);

    const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);
    const [filtroDiferencia, setFiltroDiferencia] = useState(''); // '', 'exacto', 'diferencia'
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    // Extraer lista única de sucursales desde la lista de cajas
    const branches = useMemo(() => {
        const map = new Map();
        (cajas || []).forEach((c) => {
            if (c.branchId?._id) map.set(c.branchId._id, c.branchId);
        });
        return Array.from(map.values());
    }, [cajas]);

    // Cerrar el modal flotante al hacer clic afuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setMostrarFiltros(false);
            }
        };
        if (mostrarFiltros) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mostrarFiltros]);

    const handleBranchChange = (val) => {
        setBranchId(val === TODAS ? '' : val);
        setPaginaActual(1);
    };

    const toggleEstado = (estadoId) => {
        setEstadosSeleccionados((prev) =>
            prev.includes(estadoId) ? prev.filter((e) => e !== estadoId) : [...prev, estadoId]
        );
        setPaginaActual(1);
    };

    const cajasFiltradas = useMemo(() => {
        return (cajas || []).filter((c) => {
            // Filtro por sucursal
            if (branchId && c.branchId?._id !== branchId) {
                return false;
            }
            // Filtro por estado (multi-selección: 'open' / 'closed')
            if (estadosSeleccionados.length > 0 && !estadosSeleccionados.includes(c.status)) {
                return false;
            }
            // Filtro por diferencia (exacto / diferencia)
            if (filtroDiferencia === 'exacto' && (c.status !== 'closed' || c.difference !== 0)) {
                return false;
            }
            if (filtroDiferencia === 'diferencia' && (c.status !== 'closed' || c.difference === 0)) {
                return false;
            }
            // Búsqueda general en la tabla (sucursal, usuarios, fechas)
            if (busqueda.trim()) {
                const q = busqueda.toLowerCase().trim();
                const branchName = (c.branchId?.name || '').toLowerCase();
                const openedByName = (c.openedBy?.name || '').toLowerCase();
                const closedByName = (c.closedBy?.name || '').toLowerCase();
                const openedDateStr = c.openedAt ? new Date(c.openedAt).toLocaleString('es-AR').toLowerCase() : '';
                const closedDateStr = c.closedAt ? new Date(c.closedAt).toLocaleString('es-AR').toLowerCase() : '';

                const matchBranch = branchName.includes(q);
                const matchOpenedBy = openedByName.includes(q);
                const matchClosedBy = closedByName.includes(q);
                const matchDates = openedDateStr.includes(q) || closedDateStr.includes(q);

                if (!matchBranch && !matchOpenedBy && !matchClosedBy && !matchDates) {
                    return false;
                }
            }
            // Fecha desde
            if (fechaDesde) {
                const fromDate = new Date(fechaDesde + 'T00:00:00');
                if (new Date(c.openedAt) < fromDate) return false;
            }
            // Fecha hasta
            if (fechaHasta) {
                const toDate = new Date(fechaHasta + 'T23:59:59.999');
                if (new Date(c.openedAt) > toDate) return false;
            }
            return true;
        });
    }, [cajas, branchId, estadosSeleccionados, filtroDiferencia, busqueda, fechaDesde, fechaHasta]);

    const cntFiltrosActivos = estadosSeleccionados.length + (filtroDiferencia ? 1 : 0) + (fechaDesde ? 1 : 0) + (fechaHasta ? 1 : 0);
    const hayFiltros = busqueda || cntFiltrosActivos > 0;
    const limpiarFiltros = () => {
        setBusqueda('');
        setEstadosSeleccionados([]);
        setFiltroDiferencia('');
        setFechaDesde('');
        setFechaHasta('');
        setPaginaActual(1);
    };

    const totalPaginas = Math.ceil(cajasFiltradas.length / ITEMS_PER_PAGE) || 1;
    const inicio = (paginaActual - 1) * ITEMS_PER_PAGE;
    const cajasPaginadas = cajasFiltradas.slice(inicio, inicio + ITEMS_PER_PAGE);

    const obtenerPaginas = () => {
        if (totalPaginas <= 5) {
            return Array.from({ length: totalPaginas }, (_, i) => i + 1);
        }
        const start = Math.max(1, Math.min(paginaActual - 2, totalPaginas - 4));
        return Array.from({ length: 5 }, (_, i) => start + i);
    };

    return (
        <div>
            <header className="mb-6">
                <div className="flex items-center gap-2.5">
                    <span className="h-6 w-1.5 rounded-full bg-primary" />
                    <h1 className="m-0 text-2xl font-bold tracking-tight text-foreground">Historial de Cajas</h1>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Registro de aperturas, cierres y diferencias arqueadas por sucursal en tiempo real.</p>
            </header>

            {/* Barra de herramientas y filtros sobre la tabla */}
            <div className="mb-4 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="m-0 text-base font-semibold text-foreground whitespace-nowrap">Cierres y Arqueos</h3>

                    <div className="flex flex-1 flex-wrap items-center justify-end gap-2.5 min-w-[280px]">
                        {/* Barra de búsqueda */}
                        <div className="flex flex-1 min-w-[200px] sm:max-w-[340px] md:max-w-[400px] h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-xs text-muted-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-2xs">
                            <Search size={15} className="shrink-0" />
                            <input
                                placeholder="Buscar por sucursal, usuario o fecha…"
                                value={busqueda}
                                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                                className="w-full border-none bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                            />
                            {busqueda && (
                                <button onClick={() => setBusqueda('')} className="text-muted-foreground hover:text-foreground shrink-0">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Filtro por Sucursal */}
                        <Select value={branchId || TODAS} onValueChange={handleBranchChange}>
                            <SelectTrigger className="h-9 min-w-[160px] rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground shadow-2xs">
                                <SelectValue placeholder="Todas las sucursales" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TODAS}>Todas las sucursales</SelectItem>
                                {branches.map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        {/* Botón Filtros con Popover Modal */}
                        <div ref={filterRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                                className={cn(
                                    "flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-medium shadow-2xs transition-all outline-none",
                                    cntFiltrosActivos > 0
                                        ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                                        : "bg-card border-input text-foreground hover:bg-accent"
                                )}
                            >
                                <SlidersHorizontal size={14} className={cntFiltrosActivos > 0 ? "text-primary" : "text-muted-foreground"} />
                                <span>Filtros</span>
                                {cntFiltrosActivos > 0 && (
                                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                                        {cntFiltrosActivos}
                                    </span>
                                )}
                            </button>

                            {/* Modal Flotante (Popover) */}
                            {mostrarFiltros && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40 bg-transparent"
                                        onClick={() => setMostrarFiltros(false)}
                                    />
                                    <div className="absolute right-0 top-11 z-50 w-[320px] sm:w-[380px] rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
                                        <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
                                            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                                                <SlidersHorizontal size={14} />
                                                <span>Filtros de cajas</span>
                                            </div>
                                            {hayFiltros && (
                                                <button
                                                    onClick={limpiarFiltros}
                                                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                                                >
                                                    <FilterX size={12} />
                                                    Limpiar todo
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-4 text-xs">
                                            {/* ESTADO DE CAJA */}
                                            <div>
                                                <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Estado de caja</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {[
                                                        { id: 'open', label: 'Abierta', activeClass: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/50 font-semibold' },
                                                        { id: 'closed', label: 'Cerrada', activeClass: 'bg-rose-500/20 text-rose-700 border-rose-500/50 font-semibold' }
                                                    ].map((st) => {
                                                        const selected = estadosSeleccionados.includes(st.id);
                                                        return (
                                                            <button
                                                                key={st.id}
                                                                type="button"
                                                                onClick={() => toggleEstado(st.id)}
                                                                className={cn(
                                                                    "px-3 py-1 rounded-full border transition-all text-xs font-medium flex items-center gap-1",
                                                                    selected
                                                                        ? st.activeClass
                                                                        : "bg-card text-muted-foreground border-border hover:border-foreground/30"
                                                                )}
                                                            >
                                                                {selected && <span className="text-xs">✓</span>}
                                                                {st.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* DIFERENCIA DE ARQUEO */}
                                            <div>
                                                <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Arqueo de diferencia</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {[
                                                        { id: '', label: 'Todas' },
                                                        { id: 'exacto', label: 'Exacto ($0)' },
                                                        { id: 'diferencia', label: 'Con diferencia (+/-)' }
                                                    ].map((df) => {
                                                        const selected = filtroDiferencia === df.id;
                                                        return (
                                                            <button
                                                                key={df.id}
                                                                type="button"
                                                                onClick={() => { setFiltroDiferencia(df.id); setPaginaActual(1); }}
                                                                className={cn(
                                                                    "px-3 py-1 rounded-full border transition-all text-xs font-medium flex items-center gap-1",
                                                                    selected
                                                                        ? "bg-primary text-primary-foreground border-primary font-semibold"
                                                                        : "bg-card text-muted-foreground border-border hover:border-foreground/30"
                                                                )}
                                                            >
                                                                {selected && <span className="text-xs">✓</span>}
                                                                {df.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* RANGO DE FECHAS DE APERTURA */}
                                            <div className="border-t border-border/60 pt-3">
                                                <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Fecha de apertura</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <span className="block text-[10px] text-muted-foreground mb-1">Desde</span>
                                                        <input
                                                            type="date"
                                                            value={fechaDesde}
                                                            onChange={(e) => { setFechaDesde(e.target.value); setPaginaActual(1); }}
                                                            className="w-full rounded-lg border border-input bg-card px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="block text-[10px] text-muted-foreground mb-1">Hasta</span>
                                                        <input
                                                            type="date"
                                                            value={fechaHasta}
                                                            onChange={(e) => { setFechaHasta(e.target.value); setPaginaActual(1); }}
                                                            className="w-full rounded-lg border border-input bg-card px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Botón Actualizar reacomodado junto a los filtros */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refresh}
                            disabled={loading}
                            className="h-9 rounded-lg px-3 gap-1.5 text-xs font-medium bg-card shadow-2xs"
                        >
                            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
                            <span>Actualizar</span>
                        </Button>
                    </div>
                </div>

                {/* Barra de Filtros Activos (Pill Badges con 'x' + 'Limpiar todo') */}
                {cntFiltrosActivos > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {estadosSeleccionados.map((st) => (
                            <span
                                key={st}
                                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-medium text-primary capitalize"
                            >
                                <span>Estado: {st === 'open' ? 'Abierta' : 'Cerrada'}</span>
                                <button
                                    type="button"
                                    onClick={() => toggleEstado(st)}
                                    className="rounded-full p-0.5 hover:bg-primary/20 text-primary transition-colors"
                                    title="Remover filtro"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}

                        {filtroDiferencia && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-medium text-primary">
                                <span>Arqueo: {filtroDiferencia === 'exacto' ? 'Exacto' : 'Con diferencia'}</span>
                                <button
                                    type="button"
                                    onClick={() => { setFiltroDiferencia(''); setPaginaActual(1); }}
                                    className="rounded-full p-0.5 hover:bg-primary/20 text-primary transition-colors"
                                    title="Remover filtro"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {fechaDesde && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-medium text-primary">
                                <span>Desde: {fechaDesde}</span>
                                <button
                                    type="button"
                                    onClick={() => { setFechaDesde(''); setPaginaActual(1); }}
                                    className="rounded-full p-0.5 hover:bg-primary/20 text-primary transition-colors"
                                    title="Remover filtro"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {fechaHasta && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-medium text-primary">
                                <span>Hasta: {fechaHasta}</span>
                                <button
                                    type="button"
                                    onClick={() => { setFechaHasta(''); setPaginaActual(1); }}
                                    className="rounded-full p-0.5 hover:bg-primary/20 text-primary transition-colors"
                                    title="Remover filtro"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="ml-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Limpiar todo
                        </button>
                    </div>
                )}
            </div>

            <Card className="overflow-hidden p-0 gap-0">
                {loading ? (
                    <p className="p-5 text-muted-foreground">Cargando cajas…</p>
                ) : error ? (
                    <p className="p-5 text-destructive">{error}</p>
                ) : cajasFiltradas.length === 0 ? (
                    <EmptyState message={cajas.length === 0 ? "No hay cajas registradas" : "Sin resultados para los filtros aplicados."} />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <Th>Sucursal</Th><Th>Estado</Th><Th>Apertura</Th>
                                    <Th>Apertura por</Th><Th>Cierre</Th><Th>Cierre por</Th>
                                    <Th>Diferencia</Th><Th>Acciones</Th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cajasPaginadas.map((c) => (
                                    <TableRow key={c._id}>
                                        <Td>{c.branchId?.name || '---'}</Td>
                                        <Td>
                                            <Badge variant={c.status === 'open' ? 'success' : 'danger'}>
                                                {c.status === 'open' ? 'Abierta' : 'Cerrada'}
                                            </Badge>
                                        </Td>
                                        <Td>{new Date(c.openedAt).toLocaleString('es-AR')}</Td>
                                        <Td>{c.openedBy?.name || '---'}</Td>
                                        <Td>{c.closedAt ? new Date(c.closedAt).toLocaleString('es-AR') : '---'}</Td>
                                        <Td>{c.closedBy?.name || '---'}</Td>
                                        <Td>
                                            {c.status === 'closed' ? (
                                                <span className={c.difference === 0 ? '' : c.difference > 0 ? 'text-success' : 'text-destructive'}>
                                                    {c.difference === 0 ? 'Exacto' : (c.difference > 0 ? `+${fmt(c.difference)}` : fmt(c.difference))}
                                                </span>
                                            ) : '---'}
                                        </Td>
                                        <Td>
                                            <Button variant="link" onClick={() => setSelectedCaja(c)}>Ver movimientos</Button>
                                        </Td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground">
                            <span>
                                Mostrando {cajasFiltradas.length > 0 ? inicio + 1 : 0} a {Math.min(inicio + ITEMS_PER_PAGE, cajasFiltradas.length)} de {cajasFiltradas.length} cajas
                            </span>

                            {totalPaginas > 1 && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={paginaActual === 1}
                                        onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                                        className="h-7 px-2 text-xs"
                                        title="Página anterior"
                                    >
                                        <ChevronLeft size={14} />
                                    </Button>

                                    {obtenerPaginas().map((num) => (
                                        <Button
                                            key={num}
                                            variant={paginaActual === num ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPaginaActual(num)}
                                            className="h-7 w-7 p-0 text-xs"
                                        >
                                            {num}
                                        </Button>
                                    ))}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={paginaActual >= totalPaginas}
                                        onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                                        className="h-7 px-2 text-xs"
                                        title="Página siguiente"
                                    >
                                        <ChevronRight size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Card>

            {selectedCaja && (
                <MovimientosModal
                    caja={selectedCaja}
                    onClose={() => setSelectedCaja(null)}
                    getSales={getSalesForSession}
                />
            )}
        </div>
    );
}
