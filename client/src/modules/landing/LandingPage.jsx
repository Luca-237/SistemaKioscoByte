import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';

// Landing pública de FitoShop (ruta "/"). Diseño según docs/design-system.md:
// tokens violeta #5A1CE4, temas claro/oscuro con toggle local y assets de /public.

const Logo = ({ size = 36 }) => (
    <img
        src="/logo.svg"
        alt=""
        aria-hidden="true"
        width={size}
        height={Math.round(size * (546 / 471))}
        className="ld-logo"
    />
);

const PRODUCTOS = [
    { code: '779123456', name: 'Alfajor Jorgito', price: '$1.500', stock: 'Stock: 45 u.', sel: true },
    { code: '779555001', name: 'Coca-Cola 500ml', price: '$2.200', stock: 'Stock: 18 u.' },
    { code: '779332210', name: 'Chicles Beldent', price: '$800', stock: 'Stock: 3 u.' },
    { code: '779808011', name: 'Papas Lays 85g', price: '$2.900', stock: 'Stock: 22 u.' },
    { code: '779114003', name: 'Agua Villavicencio', price: '$1.400', stock: 'Stock: 30 u.' },
    { code: '779660870', name: 'Turrón Arcor', price: '$600', stock: 'Stock: 51 u.' },
];

const FAQS = [
    ['¿Necesito tarjeta para la prueba gratis?',
        'Sí: asociás una tarjeta al activar la prueba, pero no se cobra nada durante los 14 días. Si cancelás antes de que termine, no pagás nada. Te avisamos por email antes del primer cobro.'],
    ['¿Sirve si tengo más de un local?',
        'Sí, es multi-sucursal desde el primer día: cada local tiene su stock y su caja, tus operarios entran con PIN propio, y vos ves todo junto desde el panel de administración.'],
    ['¿Necesito instalar algo o comprar equipos?',
        'No. FitoShop funciona en el navegador: sirve la compu, notebook o tablet que ya tenés en el mostrador. Si tenés lector de código de barras USB, funciona directo.'],
    ['¿Qué pasa con mis datos si dejo de pagar?',
        'Tus datos son tuyos. Si cancelás, podés exportar tus productos, ventas e historial antes de cerrar la cuenta, y los guardamos 90 días por si querés volver.'],
    ['¿Es difícil de aprender para mis empleados?',
        'El punto de venta tiene una sola pantalla: buscar, tocar, cobrar. Una persona que nunca lo usó cobra su primera venta en minutos, sin capacitación.'],
];

export default function LandingPage() {
    const [theme, setTheme] = useState(() =>
        window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
    const rootRef = useRef(null);

    // Animaciones de aparición al scrollear (respetan prefers-reduced-motion vía CSS).
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        root.classList.add('js');
        const targets = root.querySelectorAll('.reveal, .reveal-group');
        if (!('IntersectionObserver' in window)) {
            targets.forEach((el) => el.classList.add('in'));
            return;
        }
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
            }),
            { threshold: 0.12, rootMargin: '0px 0px -50px' }
        );
        targets.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <div className="landing" data-theme={theme} ref={rootRef}>
            <a className="skip" href="#main">Saltar al contenido</a>

            <header className="nav">
                <div className="wrap nav-in">
                    <a className="brand" href="#top"><Logo /><span>FitoShop</span></a>
                    <nav className="nav-links" aria-label="Navegación principal">
                        <a href="#funciones">Funciones</a>
                        <a href="#porque">Por qué FitoShop</a>
                        <a href="#pasos">Cómo empezar</a>
                        <a href="#precios">Precios</a>
                        <a href="#faq">Preguntas</a>
                    </nav>
                    <div className="nav-cta">
                        <button
                            className="theme-btn"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                        >
                            {theme === 'dark' ? '☀' : '☾'}
                        </button>
                        <Link className="btn btn-primary btn-sm" to="/admin">Empezar gratis</Link>
                    </div>
                </div>
            </header>

            <main id="main">
                {/* ============ HERO ============ */}
                <section className="hero" id="top">
                    <div className="wrap hero-in">
                        <span className="hero-badge">14 días de prueba gratis</span>
                        <h1>Tu kiosco, <em>bajo control</em> desde el primer día</h1>
                        <p className="hero-sub">
                            Cobrá más rápido, sabé cuánto stock te queda y mirá cuánto ganaste hoy — sin
                            cuadernos, sin planillas. FitoShop es el sistema de gestión pensado para kioscos y almacenes.
                        </p>
                        <div className="hero-ctas">
                            <Link className="btn btn-primary" to="/admin">Probar 14 días gratis</Link>
                            <a className="btn btn-outline" href="#funciones">Ver cómo funciona</a>
                        </div>
                        <p className="hero-fine">Asociás tu tarjeta, probás gratis y cancelás cuando quieras. Sin permanencia.</p>

                        <div className="mock" role="img" aria-label="Vista del punto de venta de FitoShop: buscador de productos, caja abierta, grilla de artículos y ticket con el botón cobrar">
                            <div className="mock-top">
                                <Logo size={24} />
                                <span className="mock-search">Buscar o escanear código…</span>
                                <span className="mock-caja">Caja abierta</span>
                            </div>
                            <div className="mock-main">
                                <div className="mock-grid">
                                    {PRODUCTOS.map((p) => (
                                        <div key={p.code} className={`mock-prod${p.sel ? ' sel' : ''}`}>
                                            <span className="mp-code">{p.code}</span>
                                            <span className="mp-name">{p.name}</span>
                                            <span className="mp-price">{p.price}</span>
                                            <span className="mp-stock">{p.stock}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mock-cart">
                                    <h3>Ticket actual</h3>
                                    <div className="mc-item"><span>2 × Alfajor Jorgito</span>$3.000</div>
                                    <div className="mc-item"><span>1 × Coca-Cola 500ml</span>$2.200</div>
                                    <div className="mc-total">Total <strong>$5.200</strong></div>
                                    <div className="mc-cobrar">COBRAR</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ RUBROS ============ */}
                <div className="rubros">
                    <div className="wrap rubros-in reveal">
                        <span className="rubros-label">Pensado para</span>
                        {['Kioscos', 'Maxikioscos', 'Almacenes', 'Drugstores', 'Despensas'].map((r) => (
                            <span key={r} className="rubro">{r}</span>
                        ))}
                    </div>
                </div>

                {/* ============ FUNCIONES ============ */}
                <section id="funciones">
                    <div className="wrap">
                        <div className="sec-head reveal">
                            <span className="eyebrow">Funciones</span>
                            <h2>Todo lo que hoy hacés a mano, automático</h2>
                            <p>Cada función existe porque un kiosquero la necesita todos los días. Nada de módulos que nunca vas a abrir.</p>
                        </div>
                        <div className="feat-grid reveal-group">
                            <article className="feat">
                                <span className="feat-ico" aria-hidden="true">⚡</span>
                                <h3>Cobrá en segundos</h3>
                                <p>Buscás o escaneás el código de barras, tocás cobrar y listo. Efectivo o transferencia, con el ticket armado solo.</p>
                            </article>
                            <article className="feat">
                                <span className="feat-ico" aria-hidden="true">📦</span>
                                <h3>Stock que se actualiza solo</h3>
                                <p>Cada venta descuenta stock al instante. Te avisamos cuando un producto está por agotarse, antes de que un cliente te lo pida.</p>
                            </article>
                            <article className="feat">
                                <span className="feat-ico" aria-hidden="true">🔒</span>
                                <h3>Caja clara, cierres sin sorpresas</h3>
                                <p>Apertura y cierre de caja con historial completo. Sabés cuánto tiene que haber en el cajón antes de contarlo.</p>
                            </article>
                            <article className="feat">
                                <span className="feat-ico" aria-hidden="true">🏪</span>
                                <h3>Más de un local, una sola cuenta</h3>
                                <p>Cada sucursal con su stock y su caja. Tus operarios entran con PIN propio y vos ves todo desde un solo panel.</p>
                            </article>
                            <article className="feat">
                                <span className="feat-ico" aria-hidden="true">📊</span>
                                <h3>Números que se entienden</h3>
                                <p>Cuánto vendiste, cuánto te costó y cuánto ganaste — por día, por producto y por sucursal. Sin contador de por medio.</p>
                            </article>
                            <article className="feat feat-ia">
                                <span className="tag-ia">Plan IA</span>
                                <span className="feat-ico" aria-hidden="true">✨</span>
                                <h3>Un asistente que conoce tu negocio</h3>
                                <p>Preguntale "¿qué me conviene reponer esta semana?" y te responde con tus propios datos: qué se vende, qué se frena y dónde está tu margen.</p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ============ POR QUÉ ============ */}
                <section id="porque" className="sec-tight">
                    <div className="wrap">
                        <div className="sec-head reveal">
                            <span className="eyebrow">Por qué FitoShop</span>
                            <h2>Hecho para el mostrador, no para la oficina</h2>
                            <p>Los sistemas de gestión suelen estar pensados para supermercados con encargado de sistemas. FitoShop está pensado para vos.</p>
                        </div>
                        <div className="stats reveal-group">
                            <div className="stat"><b>+ Rápido</b><span>que la calculadora y el cuaderno: buscar, tocar, cobrar.</span></div>
                            <div className="stat"><b>0 papeles</b><span>ventas, stock, compras y cierres quedan guardados en la nube.</span></div>
                            <div className="stat"><b>24/7</b><span>mirá cómo va el kiosco desde el celular, estés donde estés.</span></div>
                            <div className="stat"><b>2 temas</b><span>modo claro y oscuro, y una interfaz accesible para cualquier persona.</span></div>
                        </div>
                    </div>
                </section>

                {/* ============ PASOS ============ */}
                <section id="pasos" className="sec-tight">
                    <div className="wrap">
                        <div className="sec-head reveal">
                            <span className="eyebrow">Cómo empezar</span>
                            <h2>En tres pasos estás vendiendo</h2>
                        </div>
                        <div className="steps3 reveal-group">
                            <article className="paso">
                                <h3>Creá tu cuenta</h3>
                                <p>Registrate con tu email, poné el nombre de tu kiosco y cargá tus productos (o pedinos ayuda para importarlos).</p>
                            </article>
                            <article className="paso">
                                <h3>Activá tu prueba gratis</h3>
                                <p>Asociás una tarjeta y tenés 14 días con todo incluido. Si no te convence, cancelás antes y no se te cobra nada.</p>
                            </article>
                            <article className="paso">
                                <h3>Cobrá tu primera venta</h3>
                                <p>Abrís la caja y empezás a vender el mismo día. Esa noche ya vas a saber exactamente cuánto ganaste.</p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ============ PRECIOS ============ */}
                <section id="precios" className="sec-tight">
                    <div className="wrap">
                        <div className="sec-head reveal">
                            <span className="eyebrow">Precios</span>
                            <h2>Dos planes, cero letra chica</h2>
                            <p>Los dos incluyen los 14 días de prueba gratis y todas las sucursales que necesites.</p>
                        </div>
                        <div className="plans reveal-group">
                            <article className="plan">
                                <div>
                                    <h3>Esencial</h3>
                                    <p className="plan-desc">La gestión completa del kiosco, todos los días.</p>
                                </div>
                                <p className="plan-price"><b>$19.999</b><span>/ mes</span></p>
                                <ul>
                                    <li>Punto de venta con código de barras</li>
                                    <li>Stock automático y avisos de faltantes</li>
                                    <li>Caja, cierres e historial de ventas</li>
                                    <li>Sucursales y operarios ilimitados</li>
                                    <li>Reportes de ventas, costos y margen</li>
                                    <li className="no">Asistente con inteligencia artificial</li>
                                </ul>
                                <Link className="btn btn-outline" to="/admin">Empezar prueba gratis</Link>
                                <p className="plan-fine">Luego $19.999/mes. Cancelás cuando quieras.</p>
                            </article>
                            <article className="plan destacado">
                                <span className="plan-flag">Recomendado</span>
                                <div>
                                    <h3>Esencial + IA</h3>
                                    <p className="plan-desc">Todo lo del plan Esencial, más un asistente que piensa con vos.</p>
                                </div>
                                <p className="plan-price"><b>$29.999</b><span>/ mes</span></p>
                                <ul>
                                    <li>Todo lo del plan Esencial</li>
                                    <li>Asistente IA sobre tus propios datos</li>
                                    <li>Sugerencias de reposición semanales</li>
                                    <li>Detección de productos que se frenan</li>
                                    <li>Resumen del día en lenguaje simple</li>
                                </ul>
                                <Link className="btn btn-primary" to="/admin">Empezar prueba gratis</Link>
                                <p className="plan-fine">Luego $29.999/mes. Cancelás cuando quieras.</p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ============ FAQ ============ */}
                <section id="faq" className="sec-tight">
                    <div className="wrap">
                        <div className="sec-head reveal">
                            <span className="eyebrow">Preguntas frecuentes</span>
                            <h2>Lo que todos preguntan antes de empezar</h2>
                        </div>
                        <div className="faq reveal-group">
                            {FAQS.map(([q, a]) => (
                                <details key={q}>
                                    <summary>{q}</summary>
                                    <p>{a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============ CTA FINAL ============ */}
                <section className="sec-tight">
                    <div className="wrap">
                        <div className="cta-final reveal">
                            <h2>Esta noche podés saber cuánto ganaste hoy</h2>
                            <p>Creá tu cuenta, cargá tus productos y probalo 14 días gratis en tu propio kiosco.</p>
                            <Link className="btn btn-primary" to="/admin">Probar FitoShop gratis</Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer>
                <div className="wrap foot">
                    <a className="brand brand-sm" href="#top"><Logo size={26} /><span>FitoShop</span></a>
                    <nav aria-label="Enlaces del pie">
                        <a href="#funciones">Funciones</a>
                        <a href="#precios">Precios</a>
                        <a href="#faq">Preguntas</a>
                        <Link to="/login">Ingreso operarios</Link>
                    </nav>
                    <span>© 2026 FitoShop</span>
                </div>
            </footer>
        </div>
    );
}
