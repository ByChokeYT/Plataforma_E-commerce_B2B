// ═══════════════════════════════════════════════════════════
// app.js — Lógica de Negocio B2B Core
// Responsabilidad ÚNICA:
//   · Datos maestros (productos, perfiles de cliente)
//   · Estado global de la aplicación
//   · Funciones de renderizado por vista
//   · Acciones del usuario (carrito, checkout, modales)
//
// ⚠️ Este archivo NO define: navigate, render, saveState,
//    loadState, toggleTheme, handleLogin ni DOMContentLoaded.
//    Esas funciones viven en router.js.
//
// Debe cargarse ANTES que router.js en index.html.
// ═══════════════════════════════════════════════════════════

'use strict';

// ─────────────────────────────────────────────────────────
// DATOS MAESTROS (simulando respuesta de API)
// ─────────────────────────────────────────────────────────
let PRODUCTS = [
    {
        id: 1, name: "Procesador Industrial X-100", category: "Componentes",
        basePrice: 450.00, stock: 120,
        image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 450 }, { min: 10, price: 410 }, { min: 50, price: 380 }]
    },
    {
        id: 2, name: "Módulo de Control PLC-7", category: "Automatización",
        basePrice: 890.00, stock: 45,
        image: "https://images.unsplash.com/photo-1580983553083-cde3bceb1e16?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 890 }, { min: 5, price: 840 }, { min: 15, price: 790 }]
    },
    {
        id: 3, name: "Cableado Estructurado Cat8 (Rollo 100m)", category: "Redes",
        basePrice: 120.00, stock: 500,
        image: "https://images.unsplash.com/photo-1544244015-0cd4b3ffc6b0?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 120 }, { min: 20, price: 105 }, { min: 100, price: 85 }]
    },
    {
        id: 4, name: "Sensor de Proximidad Laser v2", category: "Sensores",
        basePrice: 65.00, stock: 210,
        image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 65 }, { min: 50, price: 55 }, { min: 200, price: 45 }]
    },
    {
        id: 5, name: "Servidor Rack Mount 2U XEON", category: "Componentes",
        basePrice: 2450.00, stock: 15,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 2450 }, { min: 3, price: 2200 }, { min: 10, price: 1950 }]
    },
    {
        id: 6, name: "Gateway IoT Industrial Pro", category: "Conectividad",
        basePrice: 320.00, stock: 85,
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 320 }, { min: 10, price: 290 }, { min: 50, price: 260 }]
    },
    {
        id: 7, name: "Cámara Térmica de Inspección", category: "Seguridad",
        basePrice: 1560.00, stock: 12,
        image: "https://images.unsplash.com/photo-1551703599-6b3e8379aa8b?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 1560 }, { min: 5, price: 1400 }]
    },
    {
        id: 8, name: "Unidad de Almacenamiento NAS 40TB", category: "Componentes",
        basePrice: 1800.00, stock: 25,
        image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 1800 }, { min: 4, price: 1650 }]
    },
    {
        id: 9, name: 'Monitor Industrial 4K 32"', category: "Componentes",
        basePrice: 750.00, stock: 40,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 750 }, { min: 10, price: 680 }]
    },
    {
        id: 10, name: "Adaptador Fibra Óptica Duplex", category: "Redes",
        basePrice: 45.00, stock: 1000,
        image: "https://images.unsplash.com/photo-1544244015-0cd4b3ffc6b0?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 45 }, { min: 100, price: 35 }]
    },
    {
        id: 11, name: "Interruptor Automático 600V", category: "Electricidad",
        basePrice: 185.00, stock: 150,
        image: "https://images.unsplash.com/photo-1558444479-c8402a31653c?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 185 }, { min: 20, price: 165 }]
    },
    {
        id: 12, name: "Transformador Seco 50kVA", category: "Electricidad",
        basePrice: 3400.00, stock: 5,
        image: "https://images.unsplash.com/photo-1610056494052-6a4f83a8368c?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 3400 }]
    },
    {
        id: 13, name: "Kit Herramientas Precision Pro", category: "Mantenimiento",
        basePrice: 150.00, stock: 200,
        image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 150 }, { min: 50, price: 120 }]
    },
    {
        id: 14, name: "Router Industrial 5G Dual SIM", category: "Redes",
        basePrice: 480.00, stock: 60,
        image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 480 }, { min: 10, price: 440 }]
    },
    {
        id: 15, name: "Panel Solar Mono-Cristalino 400W", category: "Energía",
        basePrice: 210.00, stock: 300,
        image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=600&fit=crop",
        tiers: [{ min: 1, price: 210 }, { min: 100, price: 175 }]
    }
];

let CUSTOMER_PROFILES = {
    distributor: {
        id: "C-9901", name: "Sistemas Industriales S.A.",
        level: "Distribuidor", discount: 0.10,
        creditLimit: 50000, usedCredit: 12500
    },
    premium: {
        id: "C-8842", name: "Global Tech Solutions",
        level: "Partner Premium", discount: 0.20,
        creditLimit: 150000, usedCredit: 45000
    }
};

// ─────────────────────────────────────────────────────────
// ESTADO GLOBAL
// Fuente única de verdad para toda la aplicación.
// router.js lo lee y escribe via saveState/loadState.
// ─────────────────────────────────────────────────────────
let state = {
    user: CUSTOMER_PROFILES.distributor,
    view: 'catalog',
    cart: [],
    orders: [
        { id: 'OC-4401', date: '2025-03-25', total: 4500.00, status: 'Aprobado',  items: 12 },
        { id: 'OC-4402', date: '2025-04-02', total: 1250.00, status: 'Pendiente', items: 5  }
    ],
    searchTerm: '',
    theme: 'light',
    isLoggedIn: false
};

// ─────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────

/** Muestra un toast de notificación (busca los elementos cada vez) */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const msg   = document.getElementById('toast-message');
    const icon  = document.getElementById('toast-icon');
    if (!toast || !msg) return;

    msg.innerText = message;

    const colors = { success: 'text-emerald-400', error: 'text-red-400', info: 'text-blue-400' };
    const icons  = { success: 'check-circle',      error: 'alert-circle', info: 'info'          };

    if (icon) {
        icon.className = colors[type] || colors.info;
        icon.innerHTML = `<i data-lucide="${icons[type] || 'info'}" size="18"></i>`;
        lucide.createIcons();
    }

    toast.classList.add('show');
    clearTimeout(toast._toastTimer);
    toast._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/** Pequeño helper: establece innerText de un elemento si existe */
function _set(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}

/** Calcula el precio unitario según tiers y descuento del cliente */
function calculateUnitPrice(product, quantity) {
    if (!product || !product.tiers || product.tiers.length === 0) {
        return (product ? product.basePrice : 0) * (1 - state.user.discount);
    }
    const tier = [...product.tiers].reverse().find(t => quantity >= t.min);
    const base = tier ? tier.price : product.basePrice;
    return base * (1 - state.user.discount);
}

// ─────────────────────────────────────────────────────────
// RENDERIZADO: CATÁLOGO
// ─────────────────────────────────────────────────────────
function renderCatalog() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const term     = (state.searchTerm || '').toLowerCase();
    const filtered = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-24 text-center animate-scale-in">
                <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <i data-lucide="search-x" size="28" class="text-slate-300"></i>
                </div>
                <p class="font-bold text-slate-700 text-sm mb-1">Sin resultados</p>
                <p class="text-slate-400 text-xs">No encontramos productos para "<em>${state.searchTerm}</em>"</p>
            </div>`;
        return;
    }

    grid.innerHTML = filtered.map(product => {
        const corpPrice = product.basePrice * (1 - state.user.discount);
        
        // Calcular precio mínimo de los tiers con descuento aplicado
        const hasTiers = product.tiers && product.tiers.length > 1;

        return `
        <div onclick="openProductQtyModal(${product.id})" class="card-apple group flex flex-col h-full animate-enter-up cursor-pointer">
            <div class="aspect-square relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900/50 mb-5 shadow-inner">
                <img src="${product.image}" alt="${product.name}"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop'">
                
                <div class="absolute top-3 left-3 px-2.5 py-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-lg
                            text-[10px] font-black text-slate-900 dark:text-white border border-white/40 dark:border-white/10 shadow-sm uppercase tracking-tighter">
                    Stock: ${product.stock}
                </div>

                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            <div class="flex-1 flex flex-col px-1">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                        ${product.category}
                    </span>
                    <span class="text-[9px] font-bold text-slate-300 dark:text-slate-600 font-mono">ID: ${String(product.id).padStart(4, '0')}</span>
                </div>
                
                <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    ${product.name}
                </h3>

                <!-- Descuentos por volumen (B2B Tiers) -->
                ${hasTiers ? `
                <div class="mb-4 p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                    <p class="font-bold text-[8px] uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                        <i data-lucide="tags" size="10"></i> Escala de Precios B2B
                    </p>
                    <div class="grid grid-cols-3 gap-1 text-center font-mono">
                        ${product.tiers.map(t => `
                            <div class="bg-white dark:bg-slate-800 py-1 rounded border border-slate-100 dark:border-slate-700/50">
                                <span class="block text-[8px] text-slate-400">${t.min}+ uds</span>
                                <span class="font-bold text-slate-900 dark:text-white">Bs. ${(t.price * (1 - state.user.discount)).toFixed(0)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : `
                <div class="mb-4 h-11 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] text-slate-400">
                    Tarifa Plana Corporativa
                </div>
                `}

                <div class="mt-auto">
                    <div class="flex items-end gap-2 mb-5">
                        <div class="flex flex-col">
                            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mb-0.5">Precio Corp.</span>
                            <span class="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                                Bs. ${corpPrice.toFixed(2)}
                            </span>
                        </div>
                        <div class="flex flex-col ml-auto text-right">
                             <span class="text-[9px] text-slate-300 dark:text-slate-600 line-through font-bold">Bs. ${product.basePrice.toFixed(2)}</span>
                             <span class="text-[10px] font-black text-emerald-500">
                                -${(state.user.discount * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    <button onclick="event.stopPropagation(); openProductQtyModal(${product.id})"
                        class="btn-premium w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-[0.98] transition-all">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// ─────────────────────────────────────────────────────────
// RENDERIZADO: CARRITO
// ─────────────────────────────────────────────────────────
function renderCart() {
    const cartEl = document.getElementById('cart-items');
    if (!cartEl) return;

    if (state.cart.length === 0) {
        cartEl.innerHTML = `
            <div class="bg-white p-16 text-center rounded-[3rem] border-2 border-dashed border-slate-200 animate-scale-in">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="shopping-basket" size="40" class="text-slate-200"></i>
                </div>
                <h2 class="text-xl font-bold text-slate-800 mb-2">Su orden está vacía</h2>
                <p class="text-slate-400 mb-8 max-w-xs mx-auto text-sm">
                    Añada productos del catálogo para generar una orden de compra corporativa.
                </p>
                <button onclick="navigate('catalog')"
                    class="btn-premium px-8 py-3 rounded-2xl font-bold text-xs active:scale-[0.98] transition-all">
                    Ir al Catálogo
                </button>
            </div>`;
        resetTotals();
        lucide.createIcons();
        return;
    }

    cartEl.innerHTML = state.cart.map(item => {
        const unitPrice = calculateUnitPrice(item, item.quantity);
        return `
            <div class="bg-white p-3 md:p-5 rounded-2xl flex flex-row items-center gap-3 md:gap-5 animate-enter-left
                        border border-slate-200/40 shadow-sm text-slate-900">
                <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-slate-50 p-1 flex-shrink-0">
                    <img src="${item.image}" alt="${item.name}"
                        class="w-full h-full object-cover rounded-lg"
                        onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop'">
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-slate-900 text-xs md:text-sm mb-0.5 leading-tight line-clamp-2">${item.name}</h4>
                    <p class="text-[9px] md:text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Bs. ${unitPrice.toFixed(2)} / ud
                    </p>
                </div>
                <div class="flex items-center bg-slate-100 rounded-xl p-0.5 flex-shrink-0 scale-90 md:scale-100">
                    <button onclick="updateQty(${item.id}, -1)"
                        class="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all active:scale-90">
                        <i data-lucide="minus" size="11"></i>
                    </button>
                    <span class="px-2 md:px-3 font-bold text-[11px] md:text-xs text-slate-900 min-w-[1.5rem] md:min-w-[2rem] text-center">
                        ${item.quantity}
                    </span>
                    <button onclick="updateQty(${item.id}, 1)"
                        class="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all active:scale-90">
                        <i data-lucide="plus" size="11"></i>
                    </button>
                </div>
                <div class="text-right flex-shrink-0 min-w-[70px] md:min-w-[80px]">
                    <p class="font-bold text-slate-900 text-xs md:text-sm">Bs. ${(unitPrice * item.quantity).toFixed(2)}</p>
                </div>
            </div>`;
    }).join('');

    calculateTotals();
    lucide.createIcons();
}

// ─────────────────────────────────────────────────────────
// TOTALES DEL CARRITO
// ─────────────────────────────────────────────────────────
function calculateTotals() {
    const totals = state.cart.reduce((acc, item) => {
        const price = calculateUnitPrice(item, item.quantity);
        return {
            subtotal: acc.subtotal + (price * item.quantity),
            savings:  acc.savings  + ((item.basePrice - price) * item.quantity),
            items:    acc.items    + item.quantity
        };
    }, { subtotal: 0, savings: 0, items: 0 });

    const tax   = totals.subtotal * 0.13;
    const total = totals.subtotal + tax;
    const fmt   = n => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

    _set('summary-subtotal', `Bs. ${fmt(totals.subtotal)}`);
    _set('summary-savings',  `-Bs. ${fmt(totals.savings)}`);
    _set('summary-tax',      `Bs. ${fmt(tax)}`);
    _set('summary-total',    `Bs. ${fmt(total)}`);

    const percent   = Math.min(100, (state.user.usedCredit / state.user.creditLimit) * 100);
    const creditBar = document.getElementById('credit-bar');
    if (creditBar) creditBar.style.width = `${percent}%`;
    _set('credit-percent', `${Math.round(percent)}%`);
    _set('credit-used',    `Bs. ${state.user.usedCredit.toLocaleString()}`);
    _set('credit-limit',   `Bs. ${state.user.creditLimit.toLocaleString()}`);

    const canAfford = (state.user.creditLimit - state.user.usedCredit) >= total;
    const btn = document.getElementById('checkout-btn');
    if (btn) {
        btn.disabled = !canAfford || state.cart.length === 0;
        btn.style.opacity = (!canAfford || state.cart.length === 0) ? '0.5' : '1';
    }
    const wsBtn = document.getElementById('whatsapp-btn');
    if (wsBtn) {
        wsBtn.disabled = state.cart.length === 0;
        wsBtn.style.opacity = state.cart.length === 0 ? '0.5' : '1';
    }
}

function resetTotals() {
    _set('summary-subtotal', 'Bs. 0.00');
    _set('summary-savings',  '-Bs. 0.00');
    _set('summary-tax',      'Bs. 0.00');
    _set('summary-total',    'Bs. 0.00');
    const btn = document.getElementById('checkout-btn');
    if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    }
    const wsBtn = document.getElementById('whatsapp-btn');
    if (wsBtn) {
        wsBtn.disabled = true;
        wsBtn.style.opacity = '0.5';
    }
}

// ─────────────────────────────────────────────────────────
// RENDERIZADO: DASHBOARD
// ─────────────────────────────────────────────────────────
const COLOR_MAP = {
    blue:    { icon: 'bg-blue-600',    text: 'text-blue-600',    bg: 'bg-blue-50',    badge: 'Activo'  },
    emerald: { icon: 'bg-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'OK'      },
    amber:   { icon: 'bg-amber-500',   text: 'text-amber-600',   bg: 'bg-amber-50',   badge: 'Rastreo' },
    purple:  { icon: 'bg-purple-600',  text: 'text-purple-600',  bg: 'bg-purple-50',  badge: 'Ahorro'  },
};

function renderDashboard() {
    const bento = document.getElementById('stats-bento');
    if (bento) {
        const stats = [
            { label: 'Pedidos este mes',   value: state.orders.length,
              sub: `${state.orders.filter(o => o.status === 'Pendiente').length} pendientes`,
              icon: 'clipboard-list', color: 'blue'    },
            { label: 'Crédito Disponible',
              value: `Bs. ${(state.user.creditLimit - state.user.usedCredit).toLocaleString()}`,
              sub: `Límite: Bs. ${state.user.creditLimit.toLocaleString()}`,
              icon: 'wallet',         color: 'emerald' },
            { label: 'En Tránsito', value: '3', sub: 'Entregas esta semana',
              icon: 'truck',          color: 'amber'   },
            { label: 'Ahorro B2B',
              value: `Bs. ${Math.round(state.user.usedCredit * 0.15).toLocaleString()}`,
              sub: `Desc. ${(state.user.discount * 100).toFixed(0)}% activo`,
              icon: 'trending-down',  color: 'purple'  },
        ];
        bento.innerHTML = stats.map(s => {
            const c = COLOR_MAP[s.color];
            return `
            <div class="card-apple group animate-enter-up">
                <div class="flex justify-between items-start mb-6">
                    <div class="w-12 h-12 ${c.icon} rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform duration-500">
                        <i data-lucide="${s.icon}" class="text-white" size="22"></i>
                    </div>
                </div>
                <div class="space-y-1">
                    <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">${s.label}</p>
                    <p class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">${s.value}</p>
                    <div class="flex items-center gap-2 pt-2">
                        <span class="text-[9px] font-black uppercase tracking-widest ${c.text} ${c.bg} px-2 py-0.5 rounded-md">
                            ${c.badge}
                        </span>
                        <p class="text-[10px] ${c.text} font-bold tracking-tight">${s.sub}</p>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    const miniTable = document.getElementById('orders-mini-table');
    if (miniTable) {
        miniTable.innerHTML = state.orders.slice(0, 5).map(order => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800" onclick="showInvoice('${order.id}')">
                <td class="px-6 py-3.5 font-bold text-blue-600 font-mono text-xs">${order.id}</td>
                <td class="px-6 py-3.5 text-[10px] text-slate-400">${order.date}</td>
                <td class="px-6 py-3.5 font-bold text-slate-900 dark:text-white text-xs">Bs. ${order.total.toFixed(2)}</td>
                <td class="px-6 py-3.5 text-right">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold
                        ${order.status === 'Aprobado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
                        <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                        ${order.status}
                    </span>
                </td>
            </tr>`).join('');
    }

    // Renderizar indicador radial de crédito (Circular Gauge)
    const used = state.user.usedCredit;
    const limit = state.user.creditLimit;
    const available = Math.max(0, limit - used);
    const percent = Math.min(100, (used / limit) * 100);

    const gaugeCircle = document.getElementById('credit-gauge-circle');
    const gaugePercent = document.getElementById('credit-gauge-percent');
    const gaugeUsed = document.getElementById('credit-gauge-used');
    const gaugeAvailable = document.getElementById('credit-gauge-available');

    if (gaugeCircle) {
        // Circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.2
        const strokeDashOffset = 251.2 - (251.2 * percent) / 100;
        gaugeCircle.style.strokeDashoffset = strokeDashOffset;
    }
    if (gaugePercent) gaugePercent.innerText = `${Math.round(percent)}%`;
    if (gaugeUsed) gaugeUsed.innerText = `Bs. ${used.toLocaleString()}`;
    if (gaugeAvailable) gaugeAvailable.innerText = `Bs. ${available.toLocaleString()}`;

    renderChart();
}

// ─────────────────────────────────────────────────────────
// RENDERIZADO: GRÁFICO DE BARRAS
// ─────────────────────────────────────────────────────────
// Generador de curvas Bezier cúbicas suavizadas (Spline de Figma)
function getBezierPath(points) {
    if (points.length === 0) return "";
    let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        // Puntos de control para suavizado
        const cpX1 = p0.x + (p1.x - p0.x) * 0.45;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) * 0.55;
        const cpY2 = p1.y;
        d += ` C ${cpX1.toFixed(1)},${cpY1.toFixed(1)} ${cpX2.toFixed(1)},${cpY2.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
    }
    return d;
}

function renderChart() {
    const chart = document.getElementById('revenue-chart');
    if (!chart) return;

    // Generar consumo dinámico sumando las órdenes reales al seed
    const baseData = [30, 45, 25, 60, 80, 55, 90, 65, 85, 40, 75, 90];
    
    // Sumar órdenes del usuario en los meses correspondientes
    state.orders.forEach(order => {
        if (!order.date) return;
        const monthNum = parseInt(order.date.split('-')[1]) - 1; // 0-indexed
        if (monthNum >= 0 && monthNum < 12) {
            // Cada 1000 Bs sumados aumentan la barra o punto del mes en un valor de 5 (escalado visual)
            baseData[monthNum] += Math.min(30, (order.total / 1000) * 4);
        }
    });

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Dimensiones del SVG
    const width = 450;
    const height = 140;
    const paddingX = 25;
    const paddingY = 20;

    const stepX = (width - paddingX * 2) / (baseData.length - 1);
    
    // Mapear datos a coordenadas X e Y
    const points = baseData.map((val, i) => {
        const x = paddingX + i * stepX;
        const y = height - paddingY - (val / 130) * (height - paddingY * 2); // Dividir por 130 para dar margen superior
        return { x, y, val, month: months[i] };
    });

    // Generar path del gráfico de línea usando curvas suavizadas
    const dLine = getBezierPath(points);
    
    // Generar path del gráfico de área (cierra abajo en el eje X)
    const dArea = dLine + ` L ${points[points.length-1].x.toFixed(1)},${(height - paddingY).toFixed(1)} L ${points[0].x.toFixed(1)},${(height - paddingY).toFixed(1)} Z`;

    // Renderizar el SVG completo
    chart.innerHTML = `
        <div class="relative w-full h-full flex flex-col justify-between select-none">
            <svg viewBox="0 0 ${width} ${height}" class="w-full h-full overflow-visible">
                <defs>
                    <!-- Gradiente del área -->
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.22" />
                        <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.00" />
                    </linearGradient>
                    <!-- Gradiente de la línea -->
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="var(--primary)" />
                        <stop offset="100%" stop-color="hsl(280, 85%, 60%)" />
                    </linearGradient>
                    <!-- Filtro de sombra para los puntos -->
                    <filter id="dotShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2" flood-color="var(--primary)" />
                    </filter>
                </defs>
                
                <!-- Líneas de cuadrícula horizontal -->
                <line x1="${paddingX}" y1="${paddingY}" x2="${width - paddingX}" y2="${paddingY}" stroke="var(--border)" stroke-width="1" stroke-dasharray="4,4" />
                <line x1="${paddingX}" y1="${(height / 2).toFixed(1)}" x2="${width - paddingX}" y2="${(height / 2).toFixed(1)}" stroke="var(--border)" stroke-width="1" stroke-dasharray="4,4" />
                <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="var(--border)" stroke-width="1" />

                <!-- Guía vertical de hover -->
                <line id="chart-guideline" x1="0" y1="${paddingY}" x2="0" y2="${height - paddingY}" stroke="var(--primary)" stroke-width="1" stroke-dasharray="3,3" class="hidden pointer-events-none transition-all duration-75" />

                <!-- Eje y etiquetas de meses -->
                ${points.map(p => `
                    <text x="${p.x.toFixed(1)}" y="${height - 4}" class="fill-slate-400 dark:fill-slate-500 font-black text-[7.5px] uppercase tracking-wider" text-anchor="middle">
                        ${p.month}
                    </text>
                `).join('')}

                <!-- Gráfico de Área -->
                <path d="${dArea}" fill="url(#areaGrad)" class="animate-fade-in" />

                <!-- Gráfico de Línea -->
                <path d="${dLine}" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animate-fade-in" />

                <!-- Puntos interactivos -->
                ${points.map((p, i) => `
                    <g class="group/dot cursor-pointer" 
                       onmouseover="showChartTooltip(event, '${p.month}', 'Bs. ${(p.val * 2.4).toFixed(0)}k', ${p.x.toFixed(1)})"
                       onmouseout="hideChartTooltip()">
                        <!-- Zona sensible al tacto/hover más grande -->
                        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="10" fill="transparent" />
                        <!-- Círculo visual -->
                        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" 
                                class="chart-dot fill-white stroke-[var(--primary)] stroke-[2.5] transition-all duration-200 group-hover/dot:r-6 group-hover/dot:stroke-[hsl(280,85%,60%)]" 
                                filter="url(#dotShadow)" />
                    </g>
                `).join('')}
            </svg>

            <!-- Tooltip Flotante de HTML -->
            <div id="chart-tooltip" class="absolute hidden bg-slate-900/90 dark:bg-slate-950/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg border border-slate-700/50 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-200 backdrop-blur-md">
                <span id="tooltip-text"></span>
            </div>
        </div>
    `;
}

// Helpers globales para el tooltip interactivo del gráfico
window.showChartTooltip = (event, month, value, xCoord) => {
    const tooltip = document.getElementById('chart-tooltip');
    const text = document.getElementById('tooltip-text');
    const guideline = document.getElementById('chart-guideline');
    if (!tooltip || !text) return;

    // Calcular posición relativa al contenedor
    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = tooltip.parentElement.getBoundingClientRect();
    
    const posX = rect.left - containerRect.left + (rect.width / 2);
    const posY = rect.top - containerRect.top - 6;

    text.innerText = `${month}: ${value}`;
    tooltip.style.left = `${posX}px`;
    tooltip.style.top = `${posY}px`;
    tooltip.classList.remove('hidden');

    if (guideline && xCoord !== undefined) {
        guideline.setAttribute('x1', xCoord);
        guideline.setAttribute('x2', xCoord);
        guideline.classList.remove('hidden');
    }
};

window.hideChartTooltip = () => {
    const tooltip = document.getElementById('chart-tooltip');
    const guideline = document.getElementById('chart-guideline');
    if (tooltip) tooltip.classList.add('hidden');
    if (guideline) guideline.classList.add('hidden');
};

// ─────────────────────────────────────────────────────────
// RENDERIZADO: HISTORIAL DE ÓRDENES
// ─────────────────────────────────────────────────────────
let activeFilter = 'all';

window.filterOrders = (filter) => {
    activeFilter = filter;
    ['all','Pendiente','Aprobado'].forEach(f => {
        const id  = f === 'all' ? 'filter-all' : f === 'Pendiente' ? 'filter-pending' : 'filter-approved';
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.className = (f === filter)
            ? 'px-3 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-bold transition-all'
            : 'px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 transition-all hover:bg-slate-50';
    });
    _renderOrdersFiltered();
};

function _renderOrdersFiltered() {
    const tbody = document.getElementById('orders-full-table');
    if (!tbody) return;

    const list = activeFilter === 'all'
        ? state.orders
        : state.orders.filter(o => o.status === activeFilter);

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6" class="px-8 py-16 text-center text-slate-400 text-sm font-medium">
                No hay órdenes con este filtro.
            </td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(order => `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-50 group cursor-pointer" onclick="toggleOrderItems('${order.id}')">
            <td class="px-4 py-3.5 md:px-8 md:py-5 font-bold text-blue-600 font-mono text-sm">
                <div class="flex items-center gap-2">
                    <i data-lucide="chevron-down" size="14" class="text-slate-300 group-hover:text-blue-500 transition-transform" id="icon-${order.id}"></i>
                    ${order.id}
                </div>
            </td>
            <td class="px-4 py-3.5 md:px-8 md:py-5 text-sm text-slate-500 font-medium">${order.date}</td>
            <td class="px-4 py-3.5 md:px-8 md:py-5 text-sm font-bold text-slate-700">${order.itemsCount || order.items} prod.</td>
            <td class="px-4 py-3.5 md:px-8 md:py-5 font-bold text-slate-900 font-mono">Bs. ${order.total.toFixed(2)}</td>
            <td class="px-4 py-3.5 md:px-8 md:py-5">
                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter
                    ${order.status === 'Aprobado'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'}">
                    ${order.status}
                </span>
            </td>
            <td class="px-4 py-3.5 md:px-8 md:py-5 text-right space-x-1" onclick="event.stopPropagation()">
                <button onclick="showInvoice('${order.id}')" title="Ver Factura"
                    class="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                    <i data-lucide="file-text" size="15"></i>
                </button>
                <button onclick="showTracking('${order.id}')" title="Rastrear Envío"
                    class="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                    <i data-lucide="map-pin" size="15"></i>
                </button>
            </td>
        </tr>
        <tr id="details-${order.id}" class="hidden bg-slate-50/50">
            <td colspan="6" class="px-3 py-3 md:px-12 md:py-6">
                <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <table class="w-full text-left text-[11px]">
                        <thead class="bg-slate-50 text-slate-400 uppercase tracking-widest font-black">
                            <tr>
                                <th class="px-6 py-3">Producto</th>
                                <th class="px-6 py-3 text-center">Cant.</th>
                                <th class="px-6 py-3 text-right">Precio</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${(order.orderItems || []).map(item => `
                                <tr>
                                    <td class="px-6 py-3 font-bold text-slate-700">${item.name}</td>
                                    <td class="px-6 py-3 text-center font-mono">${item.quantity}</td>
                                    <td class="px-6 py-3 text-right font-bold text-slate-900">Bs. ${(item.basePrice * (1 - state.user.discount)).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </td>
        </tr>`).join('');
    lucide.createIcons();
}

window.toggleOrderItems = (id) => {
    const row  = document.getElementById(`details-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    if (row) {
        row.classList.toggle('hidden');
        if (icon) icon.style.transform = row.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }
};

function renderOrdersFull() {
    activeFilter = 'all';
    window.filterOrders('all');
}

// ─────────────────────────────────────────────────────────
// MODAL: RASTREO DE ENVÍO
// ─────────────────────────────────────────────────────────
window.showTracking = (orderId) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    _set('tracking-order-id',   `Rastreo: ${order.id}`);
    _set('tracking-order-date', `Fecha de orden: ${order.date}`);
    _set('tracking-guide',      `1Z${order.id.replace('OC-','')}AA${Math.floor(Math.random()*1e9)}`);

    const elTL = document.getElementById('tracking-timeline');
    if (!elTL) return;

    const isApproved = order.status === 'Aprobado';
    const steps = [
        { icon: 'check-circle', label: 'Orden Confirmada',   sub: 'Pago procesado',          done: true         },
        { icon: 'package',      label: 'Preparando Envío',   sub: 'En bodega',               done: true         },
        { icon: 'truck',        label: 'En Tránsito',        sub: 'Ruta hacia destino',       done: isApproved   },
        { icon: 'map-pin',      label: 'Distribución Local', sub: 'Llegada estimada 24h',     done: isApproved   },
        { icon: 'home',         label: 'Entregado',          sub: isApproved ? 'Recibido' : 'Pendiente', done: false },
    ];
    const lastDone = steps.reduce((acc, s, i) => s.done ? i : acc, -1);

    elTL.innerHTML = `
        <div class="relative">
            <div class="absolute left-5 top-5 bottom-5 w-px bg-slate-100 z-0"></div>
            <div class="space-y-5">
                ${steps.map((step, i) => {
                    const active = (i === lastDone + 1);
                    const done   = step.done;
                    return `
                    <div class="flex items-center gap-4 relative z-10">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                            ${done   ? 'bg-blue-600 shadow-sm shadow-blue-500/30'
                            : active  ? 'bg-amber-100 border-2 border-amber-300'
                                       : 'bg-white border border-slate-200'}">
                            <i data-lucide="${step.icon}" size="15"
                               class="${done ? 'text-white' : active ? 'text-amber-600' : 'text-slate-300'}"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-bold ${done ? 'text-slate-900' : active ? 'text-amber-700' : 'text-slate-300'}">
                                ${step.label}
                            </p>
                            <p class="text-[10px] mt-0.5 ${done ? 'text-slate-400' : active ? 'text-amber-500 font-semibold' : 'text-slate-200'}">
                                ${step.sub}
                            </p>
                        </div>
                        ${done   ? '<i data-lucide="check" size="13" class="text-blue-500 flex-shrink-0"></i>'
                        : active  ? '<span class="text-[9px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase">En curso</span>'
                        : ''}
                    </div>`;
                }).join('')}
            </div>
        </div>`;

    openModal('tracking');
    lucide.createIcons();
};

// ─────────────────────────────────────────────────────────
// MODAL: FACTURA
// ─────────────────────────────────────────────────────────
window.showInvoice = (orderId) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;
    const content = document.getElementById('invoice-content');
    if (!content) return;

    const subtotal = order.total / 1.13;
    const tax      = order.total - subtotal;
    const fmt      = n => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

    content.innerHTML = `
        <div class="flex justify-between items-start mb-12">
            <div>
                <div class="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                    <i data-lucide="command" class="text-white" size="22"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-900">Factura Comercial</h2>
                <p class="text-slate-400 text-sm mt-1">B2B Core Supply Chain Solutions</p>
            </div>
            <div class="text-right">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Orden</p>
                <p class="text-2xl font-bold text-slate-900 font-mono">${order.id}</p>
                <p class="text-sm text-slate-400 mt-2">${order.date}</p>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-12 mb-12">
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Facturar a</p>
                <p class="font-bold text-slate-900">${state.user.name}</p>
                <p class="text-sm text-slate-400 mt-1">ID Cliente: ${state.user.id}</p>
                <p class="text-sm text-slate-400">${state.user.level}</p>
            </div>
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Estado de Pago</p>
                <span class="px-3 py-1.5 rounded-full text-xs font-bold uppercase
                    ${order.status === 'Aprobado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
                    ${order.status}
                </span>
            </div>
        </div>
        <div class="border-t border-slate-100 pt-8 space-y-4">
            <div class="flex justify-between text-sm">
                <span class="text-slate-400">Subtotal Neto</span>
                <span class="font-bold text-slate-900">Bs. ${fmt(subtotal)}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-slate-400">IVA (13%)</span>
                <span class="font-bold text-slate-900">Bs. ${fmt(tax)}</span>
            </div>
            <div class="flex justify-between items-baseline pt-6 border-t border-slate-900">
                <span class="text-lg font-bold text-slate-900">Total Facturado</span>
                <span class="text-3xl font-bold text-blue-600 font-mono">Bs. ${fmt(order.total)}</span>
            </div>
        </div>
        <div class="mt-16 pt-8 border-t border-dashed border-slate-200 text-center">
            <p class="text-[10px] text-slate-300 uppercase font-bold tracking-widest">
                Gracias por su confianza corporativa
            </p>
        </div>`;

    openModal('invoice');
    lucide.createIcons();
};

// ─────────────────────────────────────────────────────────
// ACCIONES DEL USUARIO
// ─────────────────────────────────────────────────────────

window.addToCart = (id) => {
    const product  = PRODUCTS.find(p => p.id === id);
    if (!product) return;
    const existing = state.cart.find(item => item.id === id);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + 1 > product.stock) {
        showToast(`Stock insuficiente para "${product.name}"`, 'error');
        return;
    }

    if (existing) { existing.quantity += 1; }
    else          { state.cart.push({ ...product, quantity: 1 }); }

    showToast(`✓ ${product.name}`, 'success');

    // Actualizar badge del sidebar sin navegar
    if (typeof window.updateCartBadge === 'function') {
        window.updateCartBadge();
    } else {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const count = state.cart.reduce((a, i) => a + i.quantity, 0);
            badge.innerText = count;
            badge.classList.toggle('hidden', count === 0);
        }
    }

    if (typeof saveState === 'function') saveState();
};

window.updateQty = (id, delta) => {
    const item    = state.cart.find(i => i.id === id);
    const product = PRODUCTS.find(p => p.id === id);
    if (!item || !product) return;

    if (delta > 0 && item.quantity + delta > product.stock) {
        showToast('Límite de stock alcanzado', 'error');
        return;
    }

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
        state.cart = state.cart.filter(i => i.id !== id);
        showToast(`Eliminado: ${product.name}`, 'info');
    } else {
        item.quantity = newQty;
    }

    renderCart();
    
    // Sincronizar badge del sidebar en tiempo real
    if (typeof window.updateCartBadge === 'function') {
        window.updateCartBadge();
    } else {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const count = state.cart.reduce((a, i) => a + i.quantity, 0);
            badge.innerText = count;
            badge.classList.toggle('hidden', count === 0);
        }
    }

    if (typeof saveState === 'function') saveState();
};

window.handleCheckout = async () => {
    if (state.cart.length === 0) {
        showToast('El carrito está vacío', 'error');
        return;
    }

    const totals = state.cart.reduce((acc, item) => {
        const price = calculateUnitPrice(item, item.quantity);
        return { subtotal: acc.subtotal + (price * item.quantity), items: acc.items + item.quantity };
    }, { subtotal: 0, items: 0 });

    const total = totals.subtotal * 1.13;

    if (state.user.usedCredit + total > state.user.creditLimit) {
        showToast('Crédito insuficiente para esta orden', 'error');
        return;
    }

    const newOrder = {
        id:         `OC-${Math.floor(Math.random() * 9000) + 1000}`,
        date:       new Date().toISOString().split('T')[0],
        total,
        status:     total > 5000 ? 'Pendiente' : 'Aprobado',
        itemsCount: totals.items,
        orderItems: [...state.cart] // Clonar detalle de productos
    };

    state.orders.unshift(newOrder);
    state.user.usedCredit += total;
    state.cart = [];

    showToast(`Orden ${newOrder.id} generada con éxito`, 'success');

    // Enviar al Go Backend de forma asíncrona (si está disponible)
    try {
        fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
        }).then(res => {
            if (res.ok) {
                console.log(`[B2B-API] Orden ${newOrder.id} registrada en el backend de Go.`);
            }
        }).catch(err => {
            console.log('[B2B-API] Error de red. Orden registrada localmente (Modo Offline).');
        });
    } catch (e) {
        // Silencioso, fallback local completado
    }

    navigate('dashboard');
};

window.toggleUserProfile = () => {
    state.user = state.user.id === 'C-9901'
        ? CUSTOMER_PROFILES.premium
        : CUSTOMER_PROFILES.distributor;
    showToast(`Perfil cambiado a: ${state.user.level}`);
    navigate(state.view); // Re-renderizar la vista actual
};

window.openModal = (id) => {
    const m = document.getElementById(`modal-${id}`);
    if (m) m.classList.remove('hidden');
};

window.closeModal = (id) => {
    const m = document.getElementById(`modal-${id}`);
    if (m) m.classList.add('hidden');
};

window.handleBulkImport = () => {
    const input = document.getElementById('bulk-input');
    if (!input || !input.value.trim()) return;

    let count = 0;
    input.value.split('\n').forEach(line => {
        const [idStr, qtyStr] = line.split(',');
        const id  = parseInt(idStr?.trim());
        const qty = parseInt(qtyStr?.trim()) || 1;
        if (!isNaN(id)) {
            const product  = PRODUCTS.find(p => p.id === id);
            const existing = state.cart.find(i => i.id === id);
            if (product) {
                if (existing) existing.quantity += qty;
                else          state.cart.push({ ...product, quantity: qty });
                count++;
            }
        }
    });

    if (count > 0) {
        showToast(`${count} producto(s) añadidos al carrito`, 'success');
        input.value = '';
        closeModal('bulk-import');
        navigate('cart');
    } else {
        showToast('No se encontraron SKUs válidos', 'error');
    }
};

window.sendWhatsAppOrder = () => {
    if (state.cart.length === 0) return;
    const subtotal = state.cart.reduce((acc, item) => {
        return acc + calculateUnitPrice(item, item.quantity) * item.quantity;
    }, 0);
    const items   = state.cart.map(i => `• ${i.quantity}x ${i.name}`).join('%0A');
    const msg     = `Hola, soy de ${state.user.name} (ID: ${state.user.id}).%0AOrdén para negociar:%0A%0A${items}%0A%0ATotal estimado: Bs. ${(subtotal * 1.13).toFixed(2)}`;
    window.open(`https://wa.me/59178945612?text=${msg}`, '_blank');
};

// ─── API FETCH: CONEXIÓN DINÁMICA CON EL SERVIDOR GO ─────
window.initBackendData = async () => {
    try {
        const respProducts = await fetch('/api/products');
        if (respProducts.ok) {
            const data = await respProducts.json();
            if (data && data.length > 0) {
                PRODUCTS = data;
                console.log('[B2B-API] Productos cargados desde Go Backend.');
            }
        }
    } catch (e) {
        console.log('[B2B-API] Usando productos locales (Servidor Go offline).');
    }

    try {
        const respCustomers = await fetch('/api/customers');
        if (respCustomers.ok) {
            const data = await respCustomers.json();
            if (data && Object.keys(data).length > 0) {
                CUSTOMER_PROFILES = data;
                console.log('[B2B-API] Perfiles de cliente cargados desde Go Backend.');
                // Sincronizar el usuario del estado activo con los nuevos datos
                if (state.user && state.user.id) {
                    state.user = CUSTOMER_PROFILES[state.user.id] || state.user;
                }
            }
        }
    } catch (e) {
        console.log('[B2B-API] Usando perfiles locales (Servidor Go offline).');
    }
};

// Listener global para mover el efecto de brillo (Figma Glow reflection) en tarjetas card-apple
document.addEventListener('mousemove', e => {
    document.querySelectorAll('.card-apple').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// ─── MODAL DE CANTIDAD B2B INTERACTIVO ─────────────────────
window.openProductQtyModal = (productId) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    state.selectedProduct = product;

    // Resetear cantidad a 1
    const qtyInput = document.getElementById('modal-prod-qty-input');
    if (qtyInput) qtyInput.value = 1;

    // Rellenar datos
    const modalImg = document.getElementById('modal-prod-img');
    const modalName = document.getElementById('modal-prod-name');
    const modalCategory = document.getElementById('modal-prod-category');
    const modalStock = document.getElementById('modal-prod-stock-info');

    if (modalImg) modalImg.src = product.image;
    if (modalName) modalName.innerText = product.name;
    if (modalCategory) modalCategory.innerText = product.category;
    if (modalStock) modalStock.innerText = `Stock disponible: ${product.stock} unidades`;

    // Renderizar la escala de precios
    const tiersContainer = document.getElementById('modal-prod-tiers-container');
    if (tiersContainer) {
        const hasTiers = product.tiers && product.tiers.length > 1;
        if (hasTiers) {
            tiersContainer.innerHTML = `
                <p class="font-bold text-[9px] uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                    <i data-lucide="tags" size="10"></i> Escala de Precios B2B
                </p>
                <div class="grid grid-cols-3 gap-2 text-center font-mono">
                    ${product.tiers.map(t => `
                        <div class="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/60">
                            <span class="block text-[8px] text-slate-450 dark:text-slate-400 font-bold">${t.min}+ uds</span>
                            <span class="font-bold text-[11px] text-slate-900 dark:text-white">Bs. ${(t.price * (1 - state.user.discount)).toFixed(0)}</span>
                        </div>
                    `).join('')}
                </div>`;
        } else {
            tiersContainer.innerHTML = `
                <div class="py-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] text-slate-450">
                    Tarifa Plana Corporativa (Sin escala)
                </div>`;
        }
    }

    updateModalTotals();
    openModal('product-qty');
    lucide.createIcons();
};

window.adjustModalQty = (delta) => {
    const qtyInput = document.getElementById('modal-prod-qty-input');
    if (!qtyInput || !state.selectedProduct) return;

    let qty = parseInt(qtyInput.value) || 1;
    qty = Math.max(1, qty + delta);

    if (qty > state.selectedProduct.stock) {
        showToast('Stock máximo alcanzado', 'error');
        qty = state.selectedProduct.stock;
    }

    qtyInput.value = qty;
    updateModalTotals();
};

window.updateModalTotals = () => {
    const qtyInput = document.getElementById('modal-prod-qty-input');
    const unitPriceEl = document.getElementById('modal-prod-unit-price');
    const subtotalEl = document.getElementById('modal-prod-subtotal');
    const addBtn = document.getElementById('modal-add-btn');

    if (!qtyInput || !state.selectedProduct) return;

    let qty = parseInt(qtyInput.value);
    if (isNaN(qty) || qty < 1) {
        qty = 1;
    }

    const product = state.selectedProduct;

    // Controlar exceso de stock
    if (qty > product.stock) {
        qty = product.stock;
        qtyInput.value = qty;
        showToast(`Cantidad ajustada al stock disponible (${product.stock})`, 'warning');
    }

    const unitPrice = calculateUnitPrice(product, qty);
    const subtotal = unitPrice * qty;

    if (unitPriceEl) unitPriceEl.innerText = `Bs. ${unitPrice.toFixed(2)}`;
    if (subtotalEl) subtotalEl.innerText = `Bs. ${subtotal.toFixed(2)}`;

    // Controlar botón de añadir
    if (addBtn) {
        const hasStock = product.stock > 0;
        addBtn.disabled = !hasStock;
        addBtn.style.opacity = hasStock ? '1' : '0.5';
    }
};

window.confirmAddToCart = () => {
    const qtyInput = document.getElementById('modal-prod-qty-input');
    if (!qtyInput || !state.selectedProduct) return;

    const qty = parseInt(qtyInput.value) || 1;
    const product = state.selectedProduct;

    const existing = state.cart.find(item => item.id === product.id);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + qty > product.stock) {
        showToast(`Stock insuficiente. Ya tienes ${currentQty} en el carrito y el stock total es ${product.stock}`, 'error');
        return;
    }

    if (existing) {
        existing.quantity += qty;
    } else {
        state.cart.push({ ...product, quantity: qty });
    }

    showToast(`Añadido: ${qty}x ${product.name}`, 'success');

    if (typeof window.updateCartBadge === 'function') {
        window.updateCartBadge();
    } else {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const count = state.cart.reduce((a, i) => a + i.quantity, 0);
            badge.innerText = count;
            badge.classList.toggle('hidden', count === 0);
        }
    }

    if (typeof saveState === 'function') saveState();

    closeModal('product-qty');
};
