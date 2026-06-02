# 🏭 B2B Core | Plataforma E-commerce Industrial

[![Estado](https://img.shields.io/badge/Estado-Prototipo_Premium-blue.svg)]()
[![Stack](https://img.shields.io/badge/Stack-Vanilla_JS-yellow.svg)]()
[![Diseño](https://img.shields.io/badge/Diseño-Glassmorphism-cyan.svg)]()
[![Arquitectura](https://img.shields.io/badge/Arquitectura-SPA_+_Partials-orange.svg)]()
[![Idioma](https://img.shields.io/badge/Idioma-Español-green.svg)]()

Plataforma de comercio electrónico B2B (Business-to-Business) de alto rendimiento para la gestión de suministros industriales. Incluye lógica de precios por volumen, crédito corporativo, dashboard de métricas y una interfaz visual premium estilo Apple — todo construido en **Vanilla JS puro**, sin frameworks.

---

## 🖥️ Vista Previa del Proyecto

<div align="center">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" width="50%">
        <b>Pantalla de Login Glassmorphic</b><br>
        <img src="assets/img/login.png" width="100%" alt="Login Screen">
      </td>
      <td align="center" width="50%">
        <b>Catálogo de Suministros (Modo Oscuro)</b><br>
        <img src="assets/img/catalog.png" width="100%" alt="Catalog Screen">
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <b>Dashboard Corporativo</b><br>
        <img src="assets/img/dashboard.png" width="100%" alt="Dashboard Screen">
      </td>
      <td align="center" width="50%">
        <b>Resumen del Pedido (Carrito)</b><br>
        <img src="assets/img/cart.png" width="100%" alt="Cart Screen">
      </td>
    </tr>
  </table>
</div>

---

## 🧠 Arquitectura

El proyecto combina dos patrones:

- **SPA (Single Page Application):** Un único `index.html` que actúa como shell de la aplicación. JavaScript controla qué vista mostrar sin recargar la página.
- **HTML Partials via `fetch()`:** El sidebar (`sidebar.html`) y el header (`header.html`) se cargan como fragmentos independientes e inyectados dinámicamente en slots del DOM.

```
Browser carga index.html
    └── router.js arranca
        ├── fetch('components/sidebar.html') → inyecta en #sidebar-slot
        ├── fetch('components/header.html')  → inyecta en #header-slot
        └── fetch('pages/catalogo.html')     → inyecta en #page-slot
```

> ⚠️ **Por este motivo necesitas un servidor local.** El navegador bloquea `fetch()` cuando se abre un archivo directamente (`file://`) por políticas de seguridad CORS. El comando `npm run dev` levanta un servidor HTTP mínimo para resolverlo.

---

## 📁 Estructura del Proyecto

```
b2b-core/
│
├── index.html                  ← Shell principal: login, modales, slots, whatsapp
│
├── assets/
│   ├── css/
│   │   ├── variables.css       ← Tokens de diseño: colores, radios, sombras, dark mode
│   │   └── global.css          ← Estilos base, animaciones, glassmorphism, responsivo
│   └── js/
│       ├── app.js              ← Estado global, datos maestros, renderizado de vistas
│       └── router.js           ← Navegación SPA, fetch de partials, login, tema
│
├── components/
│   ├── sidebar.html            ← Menú lateral (cargado via fetch una sola vez)
│   └── header.html             ← Header dinámico con título, búsqueda y badge carrito
│
├── pages/
│   ├── catalogo.html           ← Grid de productos con búsqueda en tiempo real
│   ├── carrito-b2b.html        ← Revisión de orden, resumen y botón de checkout
│   ├── ordenes.html            ← Historial completo de órdenes con filtros
│   └── login.html              ← (Referencia visual; el login real está en index.html)
│
├── package.json                ← Scripts de servidor local
└── README.md                   ← Este archivo
```

---

## 🗂️ Responsabilidad de Archivos Clave

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Shell: login con glassmorphism, slots del app, modales, toast, WhatsApp flotante |
| `app.js` | Estado global (`state`), productos, perfiles B2B, renderizado de vistas, acciones |
| `router.js` | Navegación, carga de partials via `fetch()`, persistencia en `localStorage`, temas |
| `variables.css` | Tokens CSS: paleta de colores, variables de tema claro/oscuro |
| `global.css` | Clases utilitarias, animaciones (`enter-up`, `scale-in`), dark mode, responsivo mobile |

---

## 🚀 Características

### 💎 Diseño & UX
- **Glassmorphism Premium** con backdrop-blur y gradientes mesh animados en el login
- **Dark Mode / Light Mode** con toggle persistente via `localStorage`
- **Animaciones fluidas:** micro-animaciones de entrada, hover effects, skeleton loaders
- **Menú hamburguesa** para navegación en dispositivos móviles (< 800px)
- **Toast notifications** con íconos y colores según tipo (éxito, error, info)
- **Botón WhatsApp flotante** en esquina inferior derecha para contacto directo

### 💼 Lógica de Negocio B2B
- **Precios por Volumen (Tiers):** Precio unitario baja automáticamente según cantidad pedida
- **Perfiles de Cliente:**
  - `C-9901` — Sistemas Industriales S.A. (Distribuidor, 10% descuento, crédito Bs. 50.000)
  - `C-8842` — Global Tech Solutions (Partner Premium, 20% descuento, crédito Bs. 150.000)
- **Crédito Corporativo:** Barra de uso en tiempo real, validación antes de confirmar orden
- **Carga Masiva (Bulk Import):** Importación de SKUs y cantidades via texto plano `ID, CANTIDAD`
- **Validación de Stock:** Control proactivo al agregar al carrito
- **Checkout con Generación de Orden:** Estado automático (Aprobado < Bs. 5.000 / Pendiente ≥ Bs. 5.000)

### 📊 Dashboard
- **Bento Grid de KPIs:** Pedidos del mes, crédito disponible, envíos en tránsito, ahorro B2B
- **Gráfico de Barras Interactivo:** Consumo mensual con tooltip al hover
- **Mini tabla de órdenes recientes** con acceso rápido a factura

### 📋 Historial de Órdenes
- Filtros: Todos / Pendientes / Aprobados
- Expansión de fila para ver detalle de productos por orden
- Modal de **Factura imprimible** con cálculo de IVA (13%)
- Modal de **Rastreo de envío** con timeline visual de 5 pasos

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 Semántico |
| Estilos | CSS3 Custom + Tailwind CSS v3 (CDN) |
| Lógica | JavaScript ES2022 — Vanilla, sin frameworks |
| Persistencia | `localStorage` (estado, carrito, tema, sesión) |
| Iconos | [Lucide Icons](https://lucide.dev/) (CDN) |
| Servidor dev | `npx serve` (HTTP estático) |

---

## ⚡ Instalación y Uso

### Requisitos
- **Node.js** (para usar el servidor de desarrollo estático `npm run dev`)
- **Go (Golang)** 1.18+ (para correr el servidor backend API `npm run go-dev` o `go run main.go`)
- O la extensión **Live Server** de VS Code (para correr de forma 100% estática)

### Pasos de Ejecución

#### Opción A: Conexión Cliente-Servidor (Go Backend + API REST) — *Recomendado para clases*
Esta opción levanta un servidor de archivos en Go que a la vez expone una API REST. El frontend se conecta dinámicamente y envía las órdenes en tiempo real:
```bash
# 1. Inicia el servidor Go
go run main.go
# O alternativamente: npm run go-dev

# 2. Entra al navegador
# → http://localhost:3000
```
*Las órdenes que finalices en la web se imprimirán detalladamente en tiempo real en la terminal de tu servidor Go.*

#### Opción B: Ejecución Estática Local (Node.js)
```bash
# Inicia el servidor estático
npm run dev
# → http://localhost:3000
```

#### Opción C: Sin herramientas de terminal (VS Code)
- Abre la carpeta del proyecto en VS Code.
- Haz clic en **"Go Live"** (extensión Live Server) en la esquina inferior derecha.

> 🔌 **Nota de Arquitectura Híbrida (Offline Fallback):** La aplicación cuenta con detección automática de red. Si el servidor Go está activo, consume la información de la API. Si el servidor está apagado (ej. se corre vía Live Server), el frontend de forma inteligente conmuta a modo local (Offline), cargando los datos maestros y órdenes directamente desde JavaScript y `localStorage` sin romperse.

### Credenciales de prueba
| Usuario | Contraseña | Perfil |
|---|---|---|
| `C-9901` | cualquiera | Distribuidor — 10% dto., crédito Bs. 50.000 |
| `C-8842` | cualquiera | Partner Premium — 20% dto., crédito Bs. 150.000 |
| *Cualquiera* | cualquiera | Invitado B2B — 5% dto., crédito Bs. 30.000 (Generación dinámica) |

---

## 📝 Estado Global Centralizado

La aplicación usa un objeto `state` como fuente única de verdad (patrón Redux simplificado):

```javascript
let state = {
    user: CUSTOMER_PROFILES.distributor, // Perfil corporativo activo
    view: 'catalog',                      // Vista actual del router
    cart: [],                             // Ítems en el carrito
    orders: [...],                        // Historial de órdenes
    searchTerm: '',                       // Búsqueda activa en catálogo
    theme: 'light',                       // Tema de la UI
    isLoggedIn: false                     // Estado de sesión
};
```

`router.js` persiste y restaura este estado en `localStorage` con `saveState()` / `loadState()`.

---

## ☁️ Despliegue en Netlify

El proyecto está diseñado para funcionar perfectamente en plataformas de hosting estático como **Netlify**:
1. **Build Command (Comando de construcción):** Dejar vacío (no se requiere compilación, es JavaScript vainilla puro).
2. **Publish Directory (Directorio de publicación):** `.` (el directorio raíz del proyecto).
3. **Modo de Operación:** Al desplegarse en Netlify, dado que es un servidor estático y no ejecutará el archivo `main.go`, el frontend lo detectará y funcionará en **Modo Offline Fallback** de manera transparente, guardando todo de forma segura en el navegador (`localStorage`).

---

## 📌 Notas de Desarrollo

- **No uses `file://`** para abrir la app directamente — el `fetch()` del router fallará por CORS.
- **CSS personalizado + Tailwind:** Se usan en paralelo. Tailwind para layout rápido, CSS custom para animaciones y glassmorphism.
- **Lucide Icons** se reinicializan con `lucide.createIcons()` después de cada inyección de HTML para que los iconos SVG se rendericen correctamente.

---

Desarrollado con ❤️ por **José Luis Choquevillca** · Sector Industrial B2B