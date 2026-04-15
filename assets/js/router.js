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
window.navigate = async (view) => {
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

    // ─── Mostrar la sección solicitada ────────────────────
    const route = ROUTES[view];
    const targetSection = document.getElementById(route?.id);
    
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
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

        // Renderizado lógico
        _renderView(view);
        _updateNav();
        _updateUserInfo();
        _updateCartBadge();
        _updateThemeIcon();

        lucide.createIcons();
        saveState();
    }
};

async function loadHTML(url) { return ''; }
function showFatalError() {}


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
