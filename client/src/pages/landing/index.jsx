import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "../../styles/landing.css";

gsap.registerPlugin(ScrollTrigger);

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

const MARQUEE_ITEMS = [
  "Kioscos",
  "Almacenes",
  "Maxikioscos",
  "Drugstores",
  "Despensas",
  "Vendé más rápido",
  "Stock automático",
  "Caja clara",
];

const PRODUCTOS = [
  { code: "779123456", name: "Alfajor Jorgito",     price: "$1.500", stock: "Stock: 45 u.", sel: true },
  { code: "779555001", name: "Coca-Cola 500ml",      price: "$2.200", stock: "Stock: 18 u." },
  { code: "779332210", name: "Chicles Beldent",      price: "$800",   stock: "Stock: 3 u." },
  { code: "779808011", name: "Papas Lays 85g",       price: "$2.900", stock: "Stock: 22 u." },
  { code: "779114003", name: "Agua Villavicencio",   price: "$1.400", stock: "Stock: 30 u." },
  { code: "779660870", name: "Turrón Arcor",         price: "$600",   stock: "Stock: 51 u." },
];

const FAQS = [
  [
    "¿Necesito tarjeta para la prueba gratis?",
    "Sí, asociás una tarjeta para activar la prueba, pero no se cobra nada durante los 14 días. Cancelás cuando quieras y no pagás un peso. Te avisamos por email antes de cualquier cobro.",
  ],
  [
    "¿Sirve si tengo más de un local?",
    "Sí, es multi-sucursal desde el día uno: cada local tiene su stock y su caja, tus operarios entran con PIN propio, y vos ves todo junto desde un solo panel.",
  ],
  [
    "¿Necesito instalar algo o comprar equipos?",
    "No. FitoShop anda en el navegador: te sirve la compu, notebook o tablet que ya tenés en el mostrador. Si tenés lector de código de barras USB, lo conectás y funciona directo.",
  ],
  [
    "¿Qué pasa con mis datos si dejo de pagar?",
    "Tus datos son tuyos. Si cancelás, exportás tus productos, ventas e historial antes de cerrar la cuenta, y los guardamos 90 días por si te arrepentís.",
  ],
  [
    "¿Es difícil de aprender para mis empleados?",
    "El punto de venta tiene una sola pantalla: buscar, tocar, cobrar. Alguien que nunca lo vio en su vida cobra su primera venta en minutos, sin capacitación.",
  ],
];

function splitWords(text) {
  return text.split(" ").flatMap((word, i, arr) => [
    <span key={i} className="ld-word">
      <span className="ld-word-inner">{word}</span>
    </span>,
    i < arr.length - 1 ? " " : "",
  ]);
}

export default function LandingPage() {
  const [theme, setTheme] = useState(() =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({ duration: 1.2 });
    lenis.on("scroll", ScrollTrigger.update);

    const syncLenis = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(syncLenis);
    gsap.ticker.lagSmoothing(0);

    // Los links con #ancla deben ir por Lenis: si el navegador salta solo,
    // Lenis lo pisa en el siguiente frame y la sección queda mal ubicada.
    // Calculamos el scrollY absoluto nosotros mismos (en vez de pasarle un
    // elemento + offset a Lenis) porque esa combinación daba un resultado
    // consistentemente ~76px corto del target real — más simple y confiable
    // resolver la matemática acá y pasarle un número final a scrollTo.
    const scrollToId = (id, immediate = false) => {
      const target = document.getElementById(id);
      if (!target) return;
      const nav = root.querySelector(".nav");
      const navOffset = (nav?.offsetHeight ?? 68) - 32;
      const y = target.getBoundingClientRect().top + window.scrollY - navOffset;
      lenis.scrollTo(y, { immediate });
    };

    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      e.preventDefault();
      scrollToId(anchor.getAttribute("href").slice(1));
    };
    root.addEventListener("click", handleAnchorClick);

    // Si la página carga con un #ancla en la URL (recarga, link compartido,
    // volver con el botón atrás), Lenis todavía no existía cuando el
    // navegador hizo su salto nativo — lo re-alineamos ya inicializado.
    if (window.location.hash) {
      requestAnimationFrame(() => scrollToId(window.location.hash.slice(1), true));
    }

    const ctx = gsap.context(() => {

      gsap.timeline({ delay: 0.12 })
        .from(".hero-badge", {
          y: 20, opacity: 0, duration: 0.6, ease: "power2.out",
        })
        .from(".ld-word-inner", {
          yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.065,
        }, "-=0.28")
        .from(".hero-sub", {
          y: 26, opacity: 0, duration: 0.65, ease: "power2.out",
        }, "-=0.52")
        .from(".hero-ctas > *", {
          y: 18, opacity: 0, duration: 0.5, ease: "power2.out", stagger: 0.1,
        }, "-=0.38")
        .from(".hero-fine", {
          opacity: 0, duration: 0.4,
        }, "-=0.18")
        .from(".mock", {
          y: 68, opacity: 0, duration: 1, ease: "power3.out",
        }, "-=0.58")
        .to(".mock", {
          y: -12, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1,
        }, "+=0.25");

      gsap.to(".ld-marquee-track", {
        xPercent: -50,
        ease: "none",
        duration: 32,
        repeat: -1,
      });

      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 42,
          opacity: 0,
          duration: 0.72,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      gsap.utils.toArray(".reveal-group").forEach((group) => {
        gsap.from([...group.children], {
          y: 38,
          opacity: 0,
          duration: 0.62,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: { trigger: group, start: "top 82%" },
        });
      });

    }, root);

    return () => {
      ctx.revert();
      root.removeEventListener("click", handleAnchorClick);
      gsap.ticker.remove(syncLenis);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="landing" data-theme={theme} ref={rootRef}>
      <a className="skip" href="#main">Saltar al contenido</a>

      <header className="nav">
        <div className="wrap nav-in">
          <a className="brand" href="#top">
            <Logo />
            <span>FitoShop</span>
          </a>
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
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <Link className="btn btn-primary btn-sm" to="/admin">
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      <main id="main">

        <section className="hero" id="top">
          <div className="wrap hero-in">
            <span className="hero-badge">14 días de prueba gratis</span>

            <h1 aria-label="Sabé cuánto ganó tu kiosco, hoy mismo">
              {splitWords("Sabé cuánto ganó tu kiosco,")}
              {" "}
              <em>{splitWords("hoy mismo")}</em>
            </h1>

            <p className="hero-sub">
              Cobrá más rápido, sabé cuánto stock te queda y mirá cuánto ganaste
              hoy — sin cuadernos, sin planillas. FitoShop es el sistema de
              gestión pensado para kioscos y almacenes.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" to="/admin">Probar 14 días gratis</Link>
              <a className="btn btn-outline" href="#funciones">Ver cómo funciona</a>
            </div>
            <p className="hero-fine">
              Asociás tu tarjeta, probás gratis y cancelás cuando quieras. Sin permanencia.
            </p>

            <div
              className="mock"
              role="img"
              aria-label="Vista del punto de venta de FitoShop: buscador de productos, caja abierta, grilla de artículos y ticket con el botón cobrar"
            >
              <div className="mock-top">
                <Logo size={24} />
                <span className="mock-search">Buscar o escanear código…</span>
                <span className="mock-caja">Caja abierta</span>
              </div>
              <div className="mock-main">
                <div className="mock-grid">
                  {PRODUCTOS.map((p) => (
                    <div key={p.code} className={`mock-prod${p.sel ? " sel" : ""}`}>
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

        <div className="ld-marquee" aria-hidden="true">
          <div className="ld-marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="ld-marquee-item">
                {item}
                <span className="ld-marquee-sep">·</span>
              </span>
            ))}
          </div>
        </div>

        <section id="funciones">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="eyebrow">Funciones</span>
              <h2>Simplificá la gestión diaria de tu kiosco</h2>
              <p>Cobrá, controlá stock y cerrá caja en minutos, no en horas.</p>
            </div>
            <div className="feat-grid reveal-group">
              <article className="feat">
                <span className="feat-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 8h2M1.5 12h2M2 16h2" /><rect x="7" y="5" width="15" height="14" rx="1.5" />
                    <path d="M10 8v8M13 8v8M16 8v8M19 8v8" />
                  </svg>
                </span>
                <div className="feat-body">
                  <h3>Cobrá en segundos</h3>
                  <p>Buscás o escaneás el código de barras, tocás cobrar y listo. Efectivo, transferencia o los dos, con el ticket armado solo.</p>
                </div>
              </article>

              <article className="feat">
                <span className="feat-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8l9-4 9 4-9 4-9-4z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" />
                    <path d="M17.5 2.5a3 3 0 1 1-3 3" /><path d="M17.5 2.5l-1.2 1M17.5 2.5l1 1.3" />
                  </svg>
                </span>
                <div className="feat-body">
                  <h3>Stock que se actualiza solo</h3>
                  <p>Cada venta descuenta stock al instante. Te avisamos antes de que la góndola se quede vacía, no cuando ya es tarde.</p>
                </div>
              </article>

              <article className="feat">
                <span className="feat-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="13" rx="1.5" /><path d="M2 12h20" />
                    <circle cx="12" cy="12" r="2.4" />
                    <path d="M6 7V5.5A2.5 2.5 0 0 1 8.5 3h7A2.5 2.5 0 0 1 18 5.5V7" />
                  </svg>
                </span>
                <div className="feat-body">
                  <h3>Caja clara, cierres sin sorpresas</h3>
                  <p>Apertura y cierre de caja con historial completo. Bajás la persiana sabiendo exactamente cuánto tiene que haber, sin contar dos veces.</p>
                </div>
              </article>

              <article className="feat">
                <span className="feat-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10l1.2-5h13.6L20 10" /><path d="M4 10v9h16v-9" />
                    <path d="M4 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
                    <path d="M10 19v-5h4v5" />
                  </svg>
                </span>
                <div className="feat-body">
                  <h3>Más de un local, una sola cuenta</h3>
                  <p>Cada sucursal con su stock y su caja, separados. Tus operarios entran con PIN propio, y vos ves todo junto.</p>
                </div>
              </article>

              <article className="feat">
                <span className="feat-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20V13M10 20V9M16 20V5M22 20H2" /><path d="M13.5 6.5L16 4l2.2 2.2" />
                  </svg>
                </span>
                <div className="feat-body">
                  <h3>Sabés dónde está la plata</h3>
                  <p>Cuánto vendiste, cuánto te costó y cuánto ganaste: por día, por producto y por sucursal. Sin esperar a fin de mes para enterarte.</p>
                </div>
              </article>

              <article className="feat feat-ia">
                <span className="tag-ia">Plan IA</span>
                <span className="feat-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.5v-3.5H6.5A2.5 2.5 0 0 1 4 12.5v-7z" />
                    <path d="M12 6.5l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9.9-2z" />
                  </svg>
                </span>
                <div className="feat-body">
                  <h3>Un asistente que conoce tu negocio</h3>
                  <p>Preguntale qué te conviene reponer esta semana y te responde con tus propios datos: qué se vende, qué se frena y dónde está tu margen.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="porque" className="sec-tight">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="eyebrow">Por qué FitoShop</span>
              <h2>Hecho para el mostrador, no para una oficina de sistemas</h2>
              <p>Los sistemas de gestión de supermercados están pensados para alguien que nunca atendió un mostrador. Este lo hizo alguien que conoce el rubro.</p>
            </div>
            <div className="stats reveal-group">
              <div className="stat">
                <b>3x más rápido</b>
                <span>que cobrar a mano, con calculadora y cuaderno.</span>
              </div>
              <div className="stat">
                <b>0 papeles</b>
                <span>ventas, stock, compras y cierres, todo guardado solo, sin cuadernos ni planillas.</span>
              </div>
              <div className="stat">
                <b>24/7</b>
                <span>mirá cómo va tu kiosco desde el celular, aunque no estés atrás del mostrador.</span>
              </div>
              <div className="stat">
                <b>5 min</b>
                <span>tarda un empleado nuevo en cobrar su primera venta, sin capacitación.</span>
              </div>
            </div>
          </div>
        </section>

        <section id="pasos" className="sec-tight">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="eyebrow">Cómo empezar</span>
              <h2>En tres pasos estás vendiendo, sin vueltas</h2>
            </div>
            <div className="steps3 reveal-group">
              <article className="paso">
                <div className="paso-body">
                  <h3>Creá tu cuenta</h3>
                  <p>Registrate con tu email, poné el nombre de tu kiosco y cargá tus productos (o pedinos ayuda para importarlos).</p>
                </div>
              </article>
              <article className="paso">
                <div className="paso-body">
                  <h3>Activá tu prueba gratis</h3>
                  <p>Asociás una tarjeta y tenés 14 días con todo incluido. Si no te convence, cancelás antes y no se te cobra nada.</p>
                </div>
              </article>
              <article className="paso">
                <div className="paso-body">
                  <h3>Cobrá tu primera venta</h3>
                  <p>Abrís la caja y arrancás a vender el mismo día. Esa noche, cuando bajes la persiana, ya sabés exactamente cuánto ganaste.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="precios" className="sec-tight">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="eyebrow">Precios</span>
              <h2>Dos planes, cero letra chica</h2>
              <p>Los dos incluyen los 14 días de prueba gratis y todas las sucursales que necesités.</p>
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
