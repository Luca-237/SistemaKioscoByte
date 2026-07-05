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

    const [articulos, setArticulos] = useState([]);
    const [caja, setCaja] = useState(null);
    const [ventasTurno, setVentasTurno] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState([]);
    const [modal, setModal] = useState(null);           // 'abrir' | 'cerrar' | 'cobrar' | null
    const [ultimaVenta, setUltimaVenta] = useState(null);
    const [ocupado, setOcupado] = useState(false);

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
                    <button className="btn-outline" onClick={() => setModal(caja ? 'cerrar' : 'abrir')}>
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
        </div>
    );
}

// Modal genérico para pedir un monto (apertura/cierre de caja).
function ModalMonto({ titulo, descripcion, accion, ocupado, onConfirm, onClose }) {
    const [monto, setMonto] = useState('');
    return (
        <div className="pos-modal-overlay" onClick={onClose}>
            <div className="pos-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{titulo}</h3>
                <p className="pos-modal-desc">{descripcion}</p>
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
