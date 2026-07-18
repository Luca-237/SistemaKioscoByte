# FitoShop — Sistema de Diseño (v1.0)

Especificación de identidad y componentes sobre base **shadcn/ui + Tailwind v4**.
Guía visual renderizada (ambos temas, para Figma): artifact "FitoShop · Sistema de Diseño".

Decisiones tomadas (2026-07-11):
- Alcance actual: solo definición (Figma primero, desarrollo después).
- Temas oscuro y claro con **toggle global** (patrón `.dark` de shadcn).
- Primario: violeta **#5A1CE4** (reemplaza al indigo #4F46E5 actual). Hover **#7A42F4**.
- Estilo **flat**: se elimina el glassmorphism (blur/transparencias) de `index.css`.
- El client sigue en **JavaScript** (shadcn en modo JSX).

## Tokens (variables shadcn)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--background` | `#F8F9FA` | `#0E0C15` | Fondo general |
| `--foreground` | `#18181B` | `#F5F3FA` | Texto principal |
| `--card` / `--popover` | `#FFFFFF` | `#1A1726` | Superficies, modales, dropdowns |
| `--primary` | `#5A1CE4` | `#5A1CE4` | Botón primario, activo |
| `--primary-foreground` | `#FFFFFF` | `#F5F3FA` | Texto sobre primario |
| `--primary-hover` *(extra)* | `#7A42F4` | `#7A42F4` | Hover del primario; links en oscuro |
| `--secondary` / `--muted` / `--accent` | `#F4F4F5` *(propuesto)* | `#2A253B` | Fondos sutiles, hover ghost/filas |
| `--muted-foreground` | `#71717A` | `#9A95B0` | Texto secundario, labels |
| `--border` / `--input` | `#E4E4E7` | `#2A253B` | Bordes, divisores |
| `--ring` | `#5A1CE4` | `#7A42F4` | Focus ring |
| `--destructive` | `#EF4444` | `#EF4444` | Acciones destructivas |

Semánticos (par fondo/texto por tema — badges y avisos):

| Estado | Claro (bg / texto) | Oscuro (bg / texto) | Significado |
|---|---|---|---|
| Success | `#DCFCE7` / `#166534` | `#064E3B` / `#10B981` | Cobro OK, caja abierta, turno asignado |
| Warning | `#FEF3C7` / `#92400E` | `#78350F` / `#F59E0B` | Stock bajo, pendiente |
| Danger  | `#FEE2E2` / `#991B1B` | `#7F1D1D` / `#EF4444` | Sin stock, cancelado, error |
| Info *(propuesto)* | `#DBEAFE` / `#1E40AF` | `#1E3A8A` / `#3B82F6` | Avisos (p. ej. último cierre) |

Reglas de contraste:
- Blanco sobre `#5A1CE4` = 7.7:1 (AAA). OK como botón en ambos temas.
- En tema oscuro, `#5A1CE4` **no** alcanza como texto sobre `#0E0C15`: los links/acentos de texto usan `#7A42F4`.
- Botón success (`Cobrar`): texto **oscuro `#0E0C15`** sobre `#10B981` (el blanco no pasa AA).

## Tipografía

- **Plus Jakarta Sans** — títulos (H1 800/30px, H2 700/22px, H3 700/17px), cifras destacadas (800, `tabular-nums`), marca.
- **Inter** — cuerpo (400/14–15px, línea 1.55), UI, labels (600/12px, caps, tracking +5%).
- **Mono** (JetBrains Mono o similar) — códigos de artículo, barras, columnas de montos.
- Cargar por `@fontsource` (no Google Fonts en runtime). Números tabulares en toda tabla/precio.

## Forma, espaciado y elevación

- Radio base shadcn `--radius: 10px`. Escala: 6 (badges internos) / 8 (botones, inputs) / 10 (botón lg) / 12 (cards) / 16 (modales) / pill (solo búsqueda POS y badges).
- Espaciado base 4px: 4, 8, 12, 16, 24, 32, 48.
- Sombras solo en claro: cards `0 1px 2px rgba(24,24,27,.05)`, modales `0 16px 48px rgba(24,24,27,.16)`. En oscuro la jerarquía es por superficie (#0E0C15 → #1A1726) y borde #2A253B.
- Focus visible: anillo 2–3px con `--ring` en todo interactivo.

## Botones

Inter 600 14px. Alturas: sm 32px · default 40px · lg 48px. Un solo primario por vista/modal.

| Variante | Spec | Uso |
|---|---|---|
| default | bg primary, texto blanco, hover `#7A42F4` | Acción principal |
| outline | borde 1.5px `--border`, hover borde+texto violeta | Cancelar, secundarias |
| ghost | transparente, hover `--muted` | Acciones terciarias |
| destructive | bg `#EF4444` blanco | Bajas (siempre con AlertDialog) |
| success *(custom)* | bg `#10B981`, texto `#0E0C15`, 800, size lg | **Solo** el botón Cobrar del POS |
| link | texto violeta subrayado | "Olvidé mi PIN", etc. |

## Especificación Figma — Button

Component set `Button` con propiedades que espejan la API de shadcn (`<Button variant="..." size="...">`):

- **Variant**: `default` · `outline` · `ghost` · `destructive` · `success` · `link`
- **Size**: `sm` · `default` · `lg` · `icon`
- **State**: `default` · `hover` · `focus` · `disabled`
- **Label**: text property · **Icon**: boolean + instance swap (gap 8px con el texto)

### Estructura (auto layout, hug × fixed height)

| Size | Alto | Padding horizontal | Radio | Tipografía |
|---|---|---|---|---|
| sm | 32 | 12 | 6 | Inter SemiBold 13 |
| default | 40 | 18 | 8 | Inter SemiBold 14 |
| lg | 48 | 24 | 10 | Inter SemiBold 16 (`success`: ExtraBold) |
| icon | 40 × 40 | — (centrado) | 8 | ícono 18px |

### Colores por variante (usar variables con modos Light/Dark)

| Variant | Fill | Texto | Hover |
|---|---|---|---|
| default | `--primary` #5A1CE4 | `--primary-foreground` | fill → #7A42F4 |
| outline | `--card` + borde 1.5px `--border` | `--foreground` | borde y texto → violeta (#5A1CE4 claro / #7A42F4 oscuro) |
| ghost | transparente | `--muted-foreground` | fill → `--muted`, texto → `--foreground` |
| destructive | #EF4444 | #FFFFFF | fill → #DC2626 |
| success | #10B981 | **#0E0C15** (oscuro, por contraste) | fill → #34D399 |
| link | — | violeta + subrayado (#5A1CE4 claro / #7A42F4 oscuro) | texto → #7A42F4 |

### Estados

- **focus**: igual al default + anillo exterior de 2px color `--ring` con offset 2 (en Figma: stroke outside en un frame wrapper, o effect).
- **disabled**: opacidad 50 %, sin hover. En `success` lg (Cobrar) el disabled es frecuente (caja cerrada / carrito vacío) — vale la pena mostrarlo en el diseño.

### Recomendaciones de armado

1. Crear una colección de **variables de color** con modos *Light* y *Dark* usando los nombres de tokens de este doc — un solo set de componentes sirve para ambos temas.
2. Wirear `default → hover → focus` como **interactive components** para que los prototipos respondan.
3. Nombrar `Button/{Variant}` con propiedades Size y State (no todo en el nombre), así el inspector queda igual a las props del código.
4. `link` solo necesita un tamaño; `success` se usa casi siempre en `lg` (botón Cobrar) pero conviene tener `default` también.

## Mapa de migración (clase actual → shadcn)

| Hoy | shadcn | Notas |
|---|---|---|
| `.btn-primario` | `Button` default | |
| `.btn-outline` / `.btn-mini` | `Button` outline · sm | Acciones de fila |
| `.btn-mini.rojo` | `Button` outline-destructive | + AlertDialog |
| `.btn-cobrar` | `Button` variante success · lg | Texto oscuro |
| `.btn-link` | `Button` link | |
| `.admin-field` / `.login-form` | `Input` + `Label` (+ `Field`) | Error debajo del campo |
| `select` nativo | `Select` | |
| `.pos-search` | `Input` pill (o `Command`) | Command = búsqueda con teclado |
| `.admin-card` (borde izq. color) | `Card` → patrón StatCard | Tendencia con Badge, no borde de color |
| `.pos-card` | `Card` interactiva | Hover violeta; agotado opacity .55 |
| `.admin-table` | `Table` | `tabular-nums`; estados como Badge |
| `.badge-*` | `Badge` variantes semánticas | Pares de la tabla de semánticos |
| `.pos-modal` | `Dialog` | Radio 16px; overlay `#0E0C15` 60% |
| `window.confirm()` | `AlertDialog` | |
| `alert()` de errores | `Sonner` (toast) | |
| `.nav-link` / `.admin-nav` | `Sidebar` | Activo: bg violeta pleno; sin blur |
| `.pos-caja-chip` | `Badge` outline / success | |
| `.admin-cargando` | `Skeleton` | |
| Vacíos ("Catálogo vacío.") | Patrón Empty state | Ícono + texto + acción |

## Plan de implementación (cuando se decida desarrollar)

1. Instalar Tailwind v4 (`@tailwindcss/vite`) y `shadcn` en modo JSX (`npx shadcn init`, base color zinc, CSS variables).
2. Pegar los tokens de arriba en `client/src/styles/index.css` (`:root` claro, `.dark` oscuro).
3. Instalar fuentes: `@fontsource-variable/plus-jakarta-sans`, `@fontsource-variable/inter`.
4. Agregar componentes por necesidad: `button input label select badge card table dialog alert-dialog sonner skeleton sidebar tabs`.
5. Extender `Button` con la variante `success` y `Badge` con `success/warning/info` (semánticos).
6. Migrar por módulo: auth (login) → admin (páginas comparten tabla/toolbar/form) → POS.
7. Resolver la duplicación actual: `index.css` define un layout glassmorphism y `admin.css` otro flat — al migrar queda solo el flat con tokens.
