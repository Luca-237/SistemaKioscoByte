import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPos } from '../../api/http';
import { useOperatorStore } from '../../store/operatorStore';
import './pos.css';

const METODOS = [
    { id: 'efectivo', label: 'Efectivo' },
    { id: 'transferencia', label: 'Transferencia' },
    { id: 'mercadopago', label: 'Mercado Pago' },
    { id: 'tarjeta', label: 'Tarjeta' }
];

const fmt = (n) => `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PosPage() {
    const navigate = useNavigate();
    const { operator, logout } = useOperatorStore();
    const branchId = operator?.branchId || operator?.branch?.id;

    const [articulos, setArticulos] = useState([]);
    const [caja, setCaja] = useState(null);
    const [ventasTurno, setVentasTurno] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState([]);
    const [modal, setModal] = useState(null);           // 'abrir' | 'cerrar' | 'cobrar' | null
    const [ultimaVenta, setUltimaVenta] = useState(null);
    const [ocupado, setOcupado] = useState(false);
    const [ultimoCierre, setUltimoCierre] = useState(null);
    const [historialVentas, setHistorialVentas] = useState([]);
    const [showHistorial, setShowHistorial] = useState(false);
    const [showNotas, setShowNotas] = useState(false);
    const [noteForm, setNoteForm] = useState({
        type: 'reporte',
        title: '',
        description: '',
        supplierName: '',
        paymentMethod: 'efectivo',
        items: []
    });
    const [noteItems, setNoteItems] = useState([]);
    const [noteTemp, setNoteTemp] = useState({ articleId: '', quantity: '', unitCost: '' });
    const [noteBusy, setNoteBusy] = useState(false);

    const cargar = useCallback(async () => {
        try {
            const [arts, cajaRes, ventas] = await Promise.all([
                apiPos.get('/api/pos/articles'),
                apiPos.get('/api/pos/cash'),
                apiPos.get('/api/pos/sales')
            ]);
            setArticulos(arts.data.data);
            setCaja(cajaRes.data.data);
            setVentasTurno(ventas.data.data);
        } catch (e) { console.error(e); }
    }, []);

    const cargarUltimoCierre = useCallback(async () => {
        try {
            if (!branchId) return;
            const res = await apiPos.get(`/api/pos/cash/last-session/${branchId}`);
            setUltimoCierre(res.data.data);
        } catch (e) { console.error('Error al cargar último cierre:', e); }
    }, [branchId]);

    const cargarHistorialVentas = useCallback(async () => {
        try {
            if (!branchId) return;
            const res = await apiPos.get(`/api/pos/sales/recent/${branchId}`);
            setHistorialVentas(res.data.data);
            setShowHistorial(true);
        } catch (e) { console.error('Error al cargar historial:', e); }
    }, [branchId]);

    useEffect(() => { cargar(); }, [cargar]);

    // --- Carrito ---
    const agregar = (art) => {
        if (art.stock <= 0) return;
        setCarrito((prev) => {
            const item = prev.find((i) => i.articleId === art._id);
            if (item) {
                if (item.quantity >= art.stock) return prev;
                return prev.map((i) => i.articleId === art._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { articleId: art._id, name: art.name, unitPrice: art.salePrice, quantity: 1, stock: art.stock }];
        });
    };
    const quitar = (articleId) => setCarrito((prev) => prev.filter((i) => i.articleId !== articleId));
    const total = useMemo(() => carrito.reduce((a, i) => a + i.unitPrice * i.quantity, 0), [carrito]);

    // --- Caja ---
    const abrirCaja = async (monto) => {
        setOcupado(true);
        try {
            await apiPos.post('/api/pos/cash/open', { openingAmount: monto });
            setModal(null);
            cargar();
        } catch (e) { alert(e.response?.data?.message || 'Error al abrir la caja'); }
        finally { setOcupado(false); }
    };

    const abrirModalApertura = async () => {
        await cargarUltimoCierre();
        setModal('abrir');
    };

    const cerrarCaja = async (contado) => {
        setOcupado(true);
        try {
            const { data } = await apiPos.post('/api/pos/cash/close', { closingAmount: contado });
            const c = data.data;
            setModal(null);
            setCarrito([]);
            alert(`Caja cerrada.\nEsperado: ${fmt(c.expectedAmount)}\nContado: ${fmt(c.closingAmount)}\nDiferencia: ${fmt(c.difference)}`);
            cargar();
        } catch (e) { alert(e.response?.data?.message || 'Error al cerrar la caja'); }
        finally { setOcupado(false); }
    };

    // --- Venta ---
    const cobrar = async (paymentMethod) => {
        if (ocupado) return;
        setOcupado(true);
        try {
            const { data } = await apiPos.post('/api/pos/sales', {
                paymentMethod,
                items: carrito.map((i) => ({ articleId: i.articleId, quantity: i.quantity }))
            });
            setUltimaVenta(data.data);
            setCarrito([]);
            setModal(null);
            cargar();
        } catch (e) { alert(e.response?.data?.message || 'Error al registrar la venta'); }
        finally { setOcupado(false); }
    };

    const filtrados = articulos.filter((a) =>
        a.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.code?.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.barcode?.includes(busqueda)
    );

    const totalTurno = ventasTurno.reduce((a, v) => a + v.total, 0);
    const noteTotal = noteItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitCost || 0), 0);

    const addNoteItem = () => {
        const art = articulos.find((a) => a._id === noteTemp.articleId);
        if (!art || !noteTemp.quantity || noteTemp.unitCost === '') return;
        setNoteItems((prev) => [
            ...prev,
            {
                articleId: art._id,
                name: art.name,
                quantity: Number(noteTemp.quantity),
                unitCost: Number(noteTemp.unitCost)
            }
        ]);
        setNoteTemp({ articleId: '', quantity: '', unitCost: '' });
    };

    const submitNote = async () => {
        if (!noteForm.title.trim() || !noteForm.description.trim()) {
            alert('Completá título y descripción');
            return;
        }
        if (noteForm.type === 'compra' && noteItems.length === 0) {
            alert('La compra requiere al menos un artículo');
            return;
        }
        setNoteBusy(true);
        try {
            await apiPos.post('/api/pos/notes', {
                ...noteForm,
                items: noteItems,
                supplierName: noteForm.supplierName.trim(),
                paymentMethod: noteForm.paymentMethod,
                title: noteForm.title.trim(),
                description: noteForm.description.trim()
            });
            setShowNotas(false);
            setNoteForm({ type: 'reporte', title: '', description: '', supplierName: '', paymentMethod: 'efectivo', items: [] });
            setNoteItems([]);
            setNoteTemp({ articleId: '', quantity: '', unitCost: '' });
            alert('Nota enviada al administrador');
        } catch (error) {
            alert(error.response?.data?.message || 'No se pudo enviar la nota');
        } finally {
            setNoteBusy(false);
        }
    };

    return (
        <div className="pos-wrapper">
            <header className="pos-header">
                <div className="pos-header-left">
                    <span className="pos-logo">FS</span>
                    <div>
                        <h1>{operator?.orgName || 'FitoShop'}</h1>
                        <span className="pos-sub">{operator?.branch?.name} · {operator?.name}</span>
                    </div>
                    <input
                        className="pos-search"
                        placeholder="Buscar por nombre, código o código de barras…"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <div className="pos-header-right">
                    <button className="btn-outline" onClick={cargarHistorialVentas}>
                        📊 Historial
                    </button>
                    <button className="btn-outline" onClick={() => setShowNotas(true)}>
                        📝 Notas
                    </button>
                    <button className="btn-outline" onClick={() => caja ? setModal('cerrar') : abrirModalApertura()}>
                        {caja ? 'Cerrar Caja' : 'Abrir Caja'}
                    </button>
                    <div className={`pos-caja-chip ${caja ? 'abierta' : ''}`}>
                        <span>{caja ? 'Caja abierta' : 'Caja cerrada'}</span>
                        <strong>{fmt(totalTurno)}</strong>
                    </div>
                    <button className="btn-outline" onClick={() => { logout(); navigate('/login'); }}>Salir</button>
                </div>
            </header>

            <main className="pos-main">
                <section className="pos-products">
                    {filtrados.map((a) => (
                        <button
                            key={a._id}
                            className="pos-card"
                            disabled={a.stock <= 0}
                            onClick={() => agregar(a)}
                        >
                            {a.code && <span className="pos-card-code">#{a.code}</span>}
                            <span className="pos-card-name">{a.name}</span>
                            <span className="pos-card-price">{fmt(a.salePrice)}</span>
                            <span className={`pos-card-stock ${a.stock <= 0 ? 'agotado' : ''}`}>
                                {a.stock <= 0 ? 'Agotado' : `Stock: ${a.stock}`}
                            </span>
                        </button>
                    ))}
                    {filtrados.length === 0 && (
                        <p className="pos-empty">No hay artículos que coincidan con la búsqueda.</p>
                    )}
                </section>

                <aside className="pos-cart">
                    <h2>Carrito</h2>
                    <div className="pos-cart-items">
                        {carrito.length === 0 && <p className="pos-empty">El carrito está vacío</p>}
                        {carrito.map((i) => (
                            <div key={i.articleId} className="pos-cart-item">
                                <div>
                                    <p>{i.name}</p>
                                    <span>{i.quantity} × {fmt(i.unitPrice)}</span>
                                </div>
                                <div className="pos-cart-item-right">
                                    <strong>{fmt(i.quantity * i.unitPrice)}</strong>
                                    <button onClick={() => quitar(i.articleId)}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pos-total">
                        <span>Total</span>
                        <strong>{fmt(total)}</strong>
                    </div>

                    <button
                        className="btn-cobrar"
                        disabled={carrito.length === 0 || !caja}
                        onClick={() => setModal('cobrar')}
                    >
                        COBRAR
                    </button>
                    {!caja && <p className="pos-aviso">⚠️ Abrí la caja para poder vender</p>}
                </aside>
            </main>

            {modal === 'abrir' && (
                <ModalMonto
                    titulo="Abrir caja"
                    descripcion="Monto inicial en efectivo"
                    accion="Abrir"
                    ocupado={ocupado}
                    ultimoCierre={ultimoCierre}
                    onConfirm={abrirCaja}
                    onClose={() => setModal(null)}
                />
            )}
            {modal === 'cerrar' && (
                <ModalMonto
                    titulo="Cerrar caja"
                    descripcion="¿Cuánto efectivo contaste en la caja?"
                    accion="Cerrar caja"
                    ocupado={ocupado}
                    onConfirm={cerrarCaja}
                    onClose={() => setModal(null)}
                />
            )}
            {modal === 'cobrar' && (
                <div className="pos-modal-overlay" onClick={() => setModal(null)}>
                    <div className="pos-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Cobrar {fmt(total)}</h3>
                        <p className="pos-modal-desc">Elegí el método de pago</p>
                        <div className="pos-metodos">
                            {METODOS.map((m) => (
                                <button key={m.id} disabled={ocupado} onClick={() => cobrar(m.id)}>
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        <button className="btn-link" onClick={() => setModal(null)}>Cancelar</button>
                    </div>
                </div>
            )}
            {ultimaVenta && (
                <div className="pos-modal-overlay" onClick={() => setUltimaVenta(null)}>
                    <div className="pos-modal pos-ticket" onClick={(e) => e.stopPropagation()}>
                        <h3>✅ Venta #{ultimaVenta.number}</h3>
                        <div className="pos-ticket-items">
                            {ultimaVenta.items.map((i, idx) => (
                                <div key={idx}>
                                    <span>{i.quantity}× {i.name}</span>
                                    <span>{fmt(i.unitPrice * i.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pos-ticket-total">
                            <span>Total ({ultimaVenta.paymentMethod})</span>
                            <strong>{fmt(ultimaVenta.total)}</strong>
                        </div>
                        <button className="btn-cobrar" onClick={() => setUltimaVenta(null)}>Nueva venta</button>
                    </div>
                </div>
            )}
            {showHistorial && (
                <div className="pos-modal-overlay" onClick={() => setShowHistorial(false)}>
                    <div className="pos-modal pos-historial" onClick={(e) => e.stopPropagation()}>
                        <h3>📊 Últimas 30 Ventas</h3>
                        <div className="pos-historial-list">
                            {historialVentas.length === 0 ? (
                                <p className="pos-empty">No hay ventas registradas</p>
                            ) : (
                                historialVentas.map((venta, idx) => (
                                    <div key={idx} className="pos-historial-item">
                                        <div className="pos-historial-header">
                                            <span className="pos-historial-number">Venta #{venta.number}</span>
                                            <span className="pos-historial-date">
                                                {new Date(venta.createdAt).toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                        <div className="pos-historial-items">
                                            {venta.items.map((item, i) => (
                                                <span key={i} className="pos-historial-item-detail">
                                                    {item.quantity}× {item.name}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="pos-historial-footer">
                                            <span className="pos-historial-method">{venta.paymentMethod}</span>
                                            <span className="pos-historial-total">{fmt(venta.total)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="btn-link" onClick={() => setShowHistorial(false)}>Cerrar</button>
                    </div>
                </div>
            )}

            {showNotas && (
                <div className="pos-modal-overlay" onClick={() => setShowNotas(false)}>
                    <div className="pos-modal pos-notes" onClick={(e) => e.stopPropagation()}>
                        <h3>📝 Nueva nota</h3>
                        <div className="pos-note-form-grid">
                            <select value={noteForm.type} onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value })}>
                                <option value="compra">Compra</option>
                                <option value="mantenimiento">Mantenimiento</option>
                                <option value="reporte">Reporte</option>
                                <option value="otro">Otro</option>
                            </select>
                            <input placeholder="Título" value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} />
                            <textarea placeholder="Descripción" rows="3" value={noteForm.description} onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })} />
                            {noteForm.type === 'compra' && (
                                <>
                                    <input placeholder="Proveedor" value={noteForm.supplierName} onChange={(e) => setNoteForm({ ...noteForm, supplierName: e.target.value })} />
                                    <select value={noteForm.paymentMethod} onChange={(e) => setNoteForm({ ...noteForm, paymentMethod: e.target.value })}>
                                        {METODOS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                                    </select>
                                    <div className="pos-note-items-row">
                                        <select value={noteTemp.articleId} onChange={(e) => setNoteTemp({ ...noteTemp, articleId: e.target.value })}>
                                            <option value="">Artículo…</option>
                                            {articulos.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                                        </select>
                                        <input type="number" min="1" placeholder="Cant." value={noteTemp.quantity} onChange={(e) => setNoteTemp({ ...noteTemp, quantity: e.target.value })} />
                                        <input type="number" min="0" step="0.01" placeholder="Costo" value={noteTemp.unitCost} onChange={(e) => setNoteTemp({ ...noteTemp, unitCost: e.target.value })} />
                                        <button className="btn-outline" type="button" onClick={addNoteItem}>+ Ítem</button>
                                    </div>
                                    {noteItems.length > 0 && (
                                        <div className="pos-note-items-list">
                                            {noteItems.map((item, idx) => (
                                                <div key={`${item.articleId}-${idx}`} className="pos-note-item-row">
                                                    <span>{item.name}</span>
                                                    <span>{item.quantity} × {fmt(item.unitCost)}</span>
                                                </div>
                                            ))}
                                            <strong>Total: {fmt(noteTotal)}</strong>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="pos-modal-actions">
                            <button className="btn-cobrar" disabled={noteBusy} onClick={submitNote}>{noteBusy ? 'Enviando…' : 'Enviar nota'}</button>
                            <button className="btn-link" onClick={() => setShowNotas(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Modal genérico para pedir un monto (apertura/cierre de caja).
function ModalMonto({ titulo, descripcion, accion, ocupado, ultimoCierre, onConfirm, onClose }) {
    const [monto, setMonto] = useState('');
    const fmt = (n) => `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    return (
        <div className="pos-modal-overlay" onClick={onClose}>
            <div className="pos-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{titulo}</h3>
                <p className="pos-modal-desc">{descripcion}</p>
                
                {titulo === 'Abrir caja' && ultimoCierre?.closingAmount !== undefined && (
                    <div className="pos-modal-info">
                        <p className="pos-modal-info-title">📋 Último cierre:</p>
                        <p className="pos-modal-info-amount">{fmt(ultimoCierre.closingAmount)}</p>
                        {ultimoCierre.closedAt && (
                            <p className="pos-modal-info-date">
                                {new Date(ultimoCierre.closedAt).toLocaleString('es-AR')}
                            </p>
                        )}
                    </div>
                )}
                
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    autoFocus
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                />
                <button
                    className="btn-cobrar"
                    disabled={ocupado || monto === ''}
                    onClick={() => onConfirm(Number(monto))}
                >
                    {ocupado ? 'Procesando…' : accion}
                </button>
                <button className="btn-link" onClick={onClose}>Cancelar</button>
            </div>
        </div>
    );
}
