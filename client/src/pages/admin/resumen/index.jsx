import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Search, FilterX, X, SlidersHorizontal } from 'lucide-react';
import { fmt, fmtFecha } from '../../../lib/format';
import { useResumen } from '../../../hooks/useResumen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, Th, Td } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/Select';
import { cn } from '../../../lib/utils';

const TODAS = '__todas__';
const ITEMS_PER_PAGE = 10;

export const ResumenPage = () => {
    const [branchId, setBranchId] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const { resumen, movimientos = [], branches } = useResumen(branchId);

    // Filtros multi-selección y popover modal
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const filterRef = useRef(null);

    const [busqueda, setBusqueda] = useState('');
    const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
    const [metodosSeleccionados, setMetodosSeleccionados] = useState([]);
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    // Cerrar al hacer click afuera
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

    const handleBranchChange = (v) => {
        setBranchId(v === TODAS ? '' : v);
        setPaginaActual(1);
    };

    const toggleTipo = (tipoId) => {
        setTiposSeleccionados((prev) =>
            prev.includes(tipoId) ? prev.filter((t) => t !== tipoId) : [...prev, tipoId]
        );
        setPaginaActual(1);
    };

    const toggleMetodo = (metodoId) => {
        setMetodosSeleccionados((prev) =>
            prev.includes(metodoId) ? prev.filter((m) => m !== metodoId) : [...prev, metodoId]
        );
        setPaginaActual(1);
    };

    const movimientosFiltrados = useMemo(() => {
        return (movimientos || []).filter((m) => {
            // Filtro por tipo (multi-selección)
            if (tiposSeleccionados.length > 0 && !tiposSeleccionados.includes(m.type)) {
                return false;
            }
            // Filtro por método (multi-selección)
            if (metodosSeleccionados.length > 0 && !metodosSeleccionados.includes((m.paymentMethod || '').toLowerCase())) {
                return false;
            }
            // Búsqueda general en la tabla (concepto, método, tipo, fecha) - EXCLUYENDO monto
            if (busqueda.trim()) {
                const q = busqueda.toLowerCase().trim();
                const dateObj = m.createdAt ? new Date(m.createdAt) : null;
                const dateStr1 = dateObj ? dateObj.toLocaleString().toLowerCase() : '';
                const dateStr2 = dateObj ? dateObj.toLocaleDateString().toLowerCase() : '';
                const dateIso = (m.createdAt || '').toLowerCase();

                const conceptStr = (m.concept || '').toLowerCase();
                const methodStr = (m.paymentMethod || '').toLowerCase();
                const typeStr = (m.type || '').toLowerCase();

                const matchConcept = conceptStr.includes(q);
                const matchMethod = methodStr.includes(q);
                const matchType = typeStr.includes(q);
                const matchDate = dateStr1.includes(q) || dateStr2.includes(q) || dateIso.includes(q);

                if (!matchConcept && !matchMethod && !matchType && !matchDate) {
                    return false;
                }
            }
            // Fecha desde
            if (fechaDesde) {
                const fromDate = new Date(fechaDesde + 'T00:00:00');
                if (new Date(m.createdAt) < fromDate) return false;
            }
            // Fecha hasta
            if (fechaHasta) {
                const toDate = new Date(fechaHasta + 'T23:59:59.999');
                if (new Date(m.createdAt) > toDate) return false;
            }
            return true;
        });
    }, [movimientos, tiposSeleccionados, metodosSeleccionados, busqueda, fechaDesde, fechaHasta]);

    const cntFiltrosActivos = tiposSeleccionados.length + metodosSeleccionados.length + (fechaDesde ? 1 : 0) + (fechaHasta ? 1 : 0);
    const hayFiltros = busqueda || cntFiltrosActivos > 0;
    const limpiarFiltros = () => {
        setBusqueda('');
        setTiposSeleccionados([]);
        setMetodosSeleccionados([]);
        setFechaDesde('');
        setFechaHasta('');
        setPaginaActual(1);
    };

    if (!resumen) return <p className="text-muted-foreground">Cargando…</p>;

    const totalPaginas = Math.ceil(movimientosFiltrados.length / ITEMS_PER_PAGE) || 1;
    const inicio = (paginaActual - 1) * ITEMS_PER_PAGE;
    const movimientosPaginados = movimientosFiltrados.slice(inicio, inicio + ITEMS_PER_PAGE);

    const obtenerPaginas = () => {
        if (totalPaginas <= 5) {
            return Array.from({ length: totalPaginas }, (_, i) => i + 1);
        }
        const start = Math.max(1, Math.min(paginaActual - 2, totalPaginas - 4));
        return Array.from({ length: 5 }, (_, i) => start + i);
    };

    return (
        <div>
            <div className="mb-6">
                <div className="flex items-center gap-2.5">
                    <span className="h-6 w-1.5 rounded-full bg-primary" />
                    <h1 className="m-0 text-2xl font-bold tracking-tight text-foreground">Resumen Contable</h1>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Métricas financieras y estado de movimientos generales en tiempo real.</p>
            </div>

            <div className="mb-6 flex flex-wrap gap-3.5">
                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-success px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Ingresos</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">{fmt(resumen.ingresos)}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Total</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-destructive px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Egresos</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">{fmt(resumen.egresos)}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Total</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-primary px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Saldo neto</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">{fmt(resumen.saldoNeto)}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Neto</span>
                    </div>
                </Card>

                <Card className="flex-1 min-w-[220px] max-w-[280px] gap-1.5 border-l-4 border-l-warning px-5 py-4">
                    <h4 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Margen bruto (ventas)</h4>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold text-foreground">{fmt(resumen.ventas.margenBruto)}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{resumen.ventas.cantidadTickets} t. · {resumen.ventas.unidades} u.</span>
                    </div>
                </Card>
            </div>

            {/* Herramientas de filtro y búsqueda FUERA de la tabla, sobre ella */}
            <div className="mb-4 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="m-0 text-base font-semibold text-foreground">Últimos movimientos</h3>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Barra de búsqueda */}
                        <div className="flex min-w-[200px] md:w-[240px] h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-xs text-muted-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-2xs">
                            <Search size={15} />
                            <input
                                placeholder="Buscar por concepto o método…"
                                value={busqueda}
                                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                                className="w-full border-none bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                            />
                            {busqueda && (
                                <button onClick={() => setBusqueda('')} className="text-muted-foreground hover:text-foreground">
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

                        {/* Botón Filtros */}
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

                            {/* Modal Flotante (Popover) con Backdrop Overlay para cierre al hacer click afuera */}
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
                                                <span>Filtros de movimientos</span>
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
                                            {/* TIPO (Multi-selección) */}
                                            <div>
                                                <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Tipo de movimiento</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {[
                                                        { id: 'ingreso', label: 'Ingresos', activeClass: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/50 font-semibold' },
                                                        { id: 'egreso', label: 'Egresos', activeClass: 'bg-rose-500/20 text-rose-700 border-rose-500/50 font-semibold' }
                                                    ].map((t) => {
                                                        const selected = tiposSeleccionados.includes(t.id);
                                                        return (
                                                            <button
                                                                key={t.id}
                                                                type="button"
                                                                onClick={() => toggleTipo(t.id)}
                                                                className={cn(
                                                                    "px-3 py-1 rounded-full border transition-all text-xs font-medium flex items-center gap-1",
                                                                    selected
                                                                        ? t.activeClass
                                                                        : "bg-card text-muted-foreground border-border hover:border-foreground/30"
                                                                )}
                                                            >
                                                                {selected && <span className="text-xs">✓</span>}
                                                                {t.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* MÉTODO DE PAGO (Multi-selección) */}
                                            <div>
                                                <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Método de pago (Múltiple)</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {[
                                                        { id: 'efectivo', label: 'Efectivo' },
                                                        { id: 'mercadopago', label: 'MercadoPago' },
                                                        { id: 'transferencia', label: 'Transferencia' },
                                                        { id: 'tarjeta', label: 'Tarjeta' }
                                                    ].map((m) => {
                                                        const selected = metodosSeleccionados.includes(m.id);
                                                        return (
                                                            <button
                                                                key={m.id}
                                                                type="button"
                                                                onClick={() => toggleMetodo(m.id)}
                                                                className={cn(
                                                                    "px-3 py-1 rounded-full border transition-all text-xs font-medium flex items-center gap-1 capitalize",
                                                                    selected
                                                                        ? "bg-primary text-primary-foreground border-primary font-semibold"
                                                                        : "bg-card text-muted-foreground border-border hover:border-foreground/30"
                                                                )}
                                                            >
                                                                {selected && <span className="text-xs">✓</span>}
                                                                {m.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* RANGO DE FECHAS */}
                                            <div className="border-t border-border/60 pt-3">
                                                <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Rango de fechas</span>
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
                    </div>
                </div>

                {/* Barra de Filtros Activos (Pill Badges con 'x' + 'Limpiar todo' como en la imagen) */}
                {cntFiltrosActivos > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {tiposSeleccionados.map((tipo) => (
                            <span
                                key={tipo}
                                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-medium text-primary"
                            >
                                <span>{tipo === 'ingreso' ? 'Ingresos' : 'Egresos'}</span>
                                <button
                                    type="button"
                                    onClick={() => toggleTipo(tipo)}
                                    className="rounded-full p-0.5 hover:bg-primary/20 text-primary transition-colors"
                                    title="Remover filtro"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}

                        {metodosSeleccionados.map((metodo) => (
                            <span
                                key={metodo}
                                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-medium text-primary capitalize"
                            >
                                <span>{metodo}</span>
                                <button
                                    type="button"
                                    onClick={() => toggleMetodo(metodo)}
                                    className="rounded-full p-0.5 hover:bg-primary/20 text-primary transition-colors"
                                    title="Remover filtro"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}

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
                {movimientosFiltrados.length === 0 ? (
                    <EmptyState message={movimientos.length === 0 ? "Sin movimientos todavía." : "Sin resultados para los filtros aplicados."} />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow><Th>Fecha</Th><Th>Concepto</Th><Th>Método</Th><Th className="text-right">Ingreso</Th><Th className="text-right">Egreso</Th></TableRow>
                            </TableHeader>
                            <TableBody>
                                {movimientosPaginados.map((m) => (
                                    <TableRow key={m._id}>
                                        <Td>{fmtFecha(m.createdAt)}</Td>
                                        <Td>{m.concept}</Td>
                                        <Td className="capitalize">{m.paymentMethod || '—'}</Td>
                                        <Td className="text-right text-success">{m.type === 'ingreso' ? fmt(m.amount) : '—'}</Td>
                                        <Td className="text-right text-destructive">{m.type === 'egreso' ? fmt(m.amount) : '—'}</Td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                            <span>
                                Mostrando {movimientosFiltrados.length > 0 ? inicio + 1 : 0} a {Math.min(inicio + ITEMS_PER_PAGE, movimientosFiltrados.length)} de {movimientosFiltrados.length} movimientos
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
        </div>
    );
};
