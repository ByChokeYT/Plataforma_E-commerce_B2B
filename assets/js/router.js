// ═══════════════════════════════════════════════════════════
// router.js — Client-Side Router B2B Core
// Responsabilidad:
//   · Cargar páginas HTML via fetch() e inyectarlas en #page-slot
//   · Cargar componentes (sidebar) una sola vez
//   · Actualizar el header dinámico, nav activa, tema
//   · Gestionar login/logout y persistencia de sesión
//
// Requiere: app.js cargado ANTES en index.html
// ═══════════════════════════════════════════════════════════

'use strict';

if (window.__router_initialized) {
    console.warn('[Router] El enrutador ya está inicializado. Abortando carga duplicada.');
} else {
    window.__router_initialized = true;

    // ─── Mapa de rutas (Vainilla Consolidada) ─────────────────
const ROUTES = {
    catalog:       { id: 'page-catalog',   title: 'Catálogo de Suministros',   sub: 'Gestión de suministros industriales con tarifas corporativas.', search: true  },
    cart:          { id: 'page-cart',      title: 'Revisión de Orden',          sub: 'Gestión de tu pedido actual al por mayor.',                   search: false },
    dashboard:     { id: 'page-dashboard', title: 'Panel de Control',           sub: 'Métricas clave y análisis de tu actividad corporativa.',      search: false },
    'orders-full': { id: 'page-orders-full', title: 'Historial de Órdenes',    sub: 'Consulta y gestiona todas tus órdenes de compra.',            search: false },
};

// ─── Referencia a elementos del DOM persistentes ─────────
const el = {};

function initPersistent() {
    el.navBtns         = document.querySelectorAll('.nav-btn');
    el.cartBadge       = document.getElementById('cart-badge');
    el.viewTitle       = document.getElementById('view-title');
    el.viewSubtitle    = document.getElementById('view-subtitle');
    el.userName        = document.getElementById('user-name');
    el.userLevel       = document.getElementById('user-level');
    el.userInitial     = document.getElementById('user-initial');
    el.themeIcon       = document.getElementById('theme-btn-icon');
    el.toast           = document.getElementById('toast');
    el.toastMessage    = document.getElementById('toast-message');
    el.toastIcon       = document.getElementById('toast-icon');
    el.searchInput     = document.getElementById('search-input');
    el.searchContainer = document.getElementById('search-container');
    el.pageSlot        = document.getElementById('page-slot');
    el.sidebarSlot     = document.getElementById('sidebar-slot');
    el.loginView       = document.getElementById('view-login');
    el.appShell        = document.getElementById('app-shell');

    // Sincronizar showToast con los nuevos elementos
    _syncToastElements();

    if (el.searchInput) {
        el.searchInput.addEventListener('input', (e) => {
            state.searchTerm = e.target.value;
            renderCatalog();
            lucide.createIcons();
        });
    }
}

function _syncToastElements() { window._routerEls = el; }

/**
 * navigate() — Navegación Local (Sin Fetch)
 */
let isNavigating = false;

window.navigate = async (view) => {
    if (isNavigating) return;
    isNavigating = true;

    try {
        state.view = view;
        console.log(`[Router] Navegando Local: ${view}`);

    const loginView = document.getElementById('view-login');
    const appShell  = document.getElementById('app-shell');
    const pageSlot  = document.getElementById('page-slot');

    // ─── Sin sesión: mostrar login ────────────────────────
    if (!state.isLoggedIn) {
        if (loginView) loginView.classList.remove('hidden');
        if (appShell)  appShell.classList.add('hidden');
        document.body.classList.add('overflow-hidden');
        lucide.createIcons();
        return;
    }

    // ─── Con sesión: mostrar app shell ────────────────────
    if (loginView) loginView.classList.add('hidden');
    if (appShell)  { appShell.classList.remove('hidden'); appShell.classList.add('flex'); }
    document.body.classList.remove('overflow-hidden');

    // Inicializar persistentes si es necesario
    if (!el.pageSlot) initPersistent();

    // ─── Ocultar todas las secciones locales ──────────────
    if (pageSlot) {
        const sections = pageSlot.querySelectorAll('section');
        sections.forEach(s => s.classList.add('hidden'));
    }

    // ─── Mostrar Skeleton mientras carga ──────────────────────
    _showPageSkeleton(view);

    // ─── Cargar el Shell si es la primera vez (Refactor B2B) ───
    const sidebarSlot = document.getElementById('sidebar-slot');
    const headerSlot  = document.getElementById('header-slot');
    if (view !== 'login' && (!(sidebarSlot && sidebarSlot.innerHTML) || !(headerSlot && headerSlot.innerHTML))) {
        await loadGlobalComponents();
    }

    // ─── Cargar el HTML de la página (Fetch) ──────────────────
    const route = ROUTES[view] || {};
    const pageUrl = `pages/${view === 'orders-full' ? 'ordenes' : view === 'cart' ? 'carrito-b2b' : view === 'catalog' ? 'catalogo' : view}.html`;
    const html = await loadHTML(pageUrl);
    
    if (pageSlot && html) {
        pageSlot.innerHTML = html;
        
        // Actualizar header dinámico
        if (el.viewTitle)    el.viewTitle.innerText    = route.title;
        if (el.viewSubtitle) el.viewSubtitle.innerText = route.sub;
        if (el.searchContainer) {
            el.searchContainer.classList.toggle('hidden', !route.search);
        }
        
        // Resetear búsqueda
        if (view === 'catalog' && el.searchInput) {
            state.searchTerm = '';
            el.searchInput.value = '';
        }

        // Renderizado lógico (app.js)
        _renderView(view);
        _updateNav();
        _updateUserInfo();
        _updateCartBadge();
        _updateThemeIcon();

        lucide.createIcons();
        saveState();

        // FORZAR VISIBILIDAD: Asegurar que el slot no se quede en opacidad 0
        if (pageSlot) {
            pageSlot.style.opacity = '1';
            pageSlot.style.visibility = 'visible';
        }
    } else {
        console.error(`[Router] Error al cargar la página: ${pageUrl}`);
        }
    } catch (e) {
        console.error(`[Router] Error crítico en navegación:`, e);
    } finally {
        isNavigating = false;
    }
};

/**
 * loadHTML() — Carga un fragmento HTML via fetch
 */
async function loadHTML(url) {
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.text();
    } catch (e) {
        console.error(`[Router] Error en loadHTML(${url}):`, e);
        return null;
    }
}

function showFatalError(msg) {
    const overlay = document.getElementById('error-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-10">
                <div class="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[3rem] text-center max-w-sm">
                    <div class="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="alert-triangle" class="text-red-400" size="32"></i>
                    </div>
                    <h2 class="text-white font-bold text-xl mb-3">Error de Carga</h2>
                    <p class="text-white/40 text-xs mb-8">${msg}</p>
                    <button onclick="location.reload()" class="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm">
                        Reintentar
                    </button>
                </div>
            </div>`;
        lucide.createIcons();
    }
}

/**
 * loadGlobalComponents() — Carga Sidebar y Header una sola vez
 */
async function loadGlobalComponents() {
    console.log('[Router] Cargando componentes globales...');
    const [sidebarHTML, headerHTML] = await Promise.all([
        loadHTML('components/sidebar.html'),
        loadHTML('components/header.html')
    ]);

    const sidebarSlot = document.getElementById('sidebar-slot');
    const headerSlot  = document.getElementById('header-slot');
    if (sidebarSlot && sidebarHTML) sidebarSlot.innerHTML = sidebarHTML;
    if (headerSlot && headerHTML)   headerSlot.innerHTML  = headerHTML;
    
    // Re-vincular elementos del header/sidebar tras carga
    _updateSelectors();
    lucide.createIcons();
}

/**
 * _updateSelectors() — Actualiza referencias a elementos dinámicos
 */
function _updateSelectors() {
    el.viewTitle       = document.getElementById('view-title');
    el.viewSubtitle    = document.getElementById('view-subtitle');
    el.searchContainer = document.getElementById('search-container');
    el.searchInput     = document.getElementById('search-input');
    el.cartBadge       = document.getElementById('cart-badge');
}

/**
 * _showPageSkeleton() — Renderiza un esqueleto visual de carga
 */
function _showPageSkeleton(view) {
    const pageSlot = el.pageSlot || document.getElementById('page-slot');
    if (!pageSlot) return;

    let skeletonHTML = '';

    if (view === 'catalog') {
        skeletonHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                ${Array(6).fill(`
                    <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div class="w-full h-48 skeleton rounded-2xl mb-6"></div>
                        <div class="h-4 w-2/3 skeleton rounded mb-3"></div>
                        <div class="h-3 w-1/3 skeleton rounded mb-6"></div>
                        <div class="flex justify-between items-center">
                            <div class="h-6 w-20 skeleton rounded"></div>
                            <div class="h-10 w-10 skeleton rounded-xl"></div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
    } else if (view === 'dashboard') {
        skeletonHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                ${Array(4).fill('<div class="h-32 skeleton rounded-3xl"></div>').join('')}
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 h-80 skeleton rounded-3xl"></div>
                <div class="h-80 skeleton rounded-3xl"></div>
            </div>`;
    } else {
        skeletonHTML = `<div class="w-full h-96 skeleton rounded-[2.5rem]"></div>`;
    }

    pageSlot.innerHTML = skeletonHTML;
}


// Delegador de renderizado por vista
function _renderView(view) {
    switch (view) {
        case 'catalog':       renderCatalog();       break;
        case 'cart':          renderCart();           break;
        case 'dashboard':     renderDashboard();      break;
        case 'orders-full':   renderOrdersFull();     break;
    }
}

// ═══════════════════════════════════════════════════════════
// ACTUALIZACIÓN DE UI COMPARTIDA (elementos del sidebar/header)
// ═══════════════════════════════════════════════════════════
function _updateCartBadge() {
    const badge = el.cartBadge || document.getElementById('cart-badge');
    if (!badge) return;
    const count = state.cart.reduce((acc, item) => acc + item.quantity, 0);
    badge.innerText = count;
    badge.classList.toggle('hidden', count === 0);
}

function _updateNav() {
    const btns = el.navBtns || document.querySelectorAll('.nav-btn');
    btns.forEach(btn => btn.classList.toggle('active', btn.id === `nav-${state.view}`));
}

function _updateUserInfo() {
    if (!state.user) return;
    const name    = el.userName    || document.getElementById('user-name');
    const level   = el.userLevel   || document.getElementById('user-level');
    const initial = el.userInitial || document.getElementById('user-initial');
    if (name)    name.innerText    = state.user.name;
    if (level)   level.innerText   = state.user.level;
    if (initial) initial.innerText = state.user.name.charAt(0).toUpperCase();
}

function _updateThemeIcon() {
    const icon = el.themeIcon || document.getElementById('theme-btn-icon');
    if (!icon) return;
    icon.setAttribute('data-lucide', state.theme === 'light' ? 'moon' : 'sun');
    lucide.createIcons();
}

// ═══════════════════════════════════════════════════════════
// TEMA
// ═══════════════════════════════════════════════════════════
window.toggleTheme = () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    _updateThemeIcon();
    saveState();
};

// ═══════════════════════════════════════════════════════════
// NAVEGACIÓN MÓVIL
// ═══════════════════════════════════════════════════════════
window.toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) {
        sidebar.classList.toggle('show');
        if (overlay) overlay.classList.toggle('hidden');
    }
};

// ═══════════════════════════════════════════════════════════
// PERSISTENCIA
// ═══════════════════════════════════════════════════════════
function saveState() {
    try {
        localStorage.setItem('b2b_core_state', JSON.stringify(state));
    } catch (e) { /* quota exceeded, silencioso */ }
}

function loadState() {
    try {
        const saved = localStorage.getItem('b2b_core_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge cuidadoso: no sobrescribir PRODUCTS ni CUSTOMER_PROFILES
            state.cart       = parsed.cart      ?? state.cart;
            state.orders     = parsed.orders    ?? state.orders;
            state.theme      = parsed.theme     ?? 'light';
            state.isLoggedIn = parsed.isLoggedIn ?? false;
            state.view       = parsed.view      ?? 'catalog';
            // Restaurar usuario según id guardado
            if (parsed.user && parsed.user.id) {
                state.user = Object.values(CUSTOMER_PROFILES).find(p => p.id === parsed.user.id) || state.user;
            }
            document.documentElement.setAttribute('data-theme', state.theme);
        }
    } catch (e) {
        console.warn('[Router] Estado corrupto en localStorage, usando defaults.');
    }
}

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
window.handleLogin = () => {
    state.isLoggedIn = true;
    showToast(`Bienvenido, ${state.user.name}`, 'success');
    navigate('catalog');
};

// ═══════════════════════════════════════════════════════════
// ARRANQUE
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    lucide.createIcons();

    if (!state.isLoggedIn) {
        document.getElementById('view-login')?.classList.remove('hidden');
        document.getElementById('app-shell')?.classList.add('hidden');
    } else {
        navigate(state.view || 'catalog');
    }
});
} // Cierre del bloque else { window.__router_initialized = true;
