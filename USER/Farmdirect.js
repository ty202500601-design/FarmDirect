const FD = (() => {

  /* ── CONSTANTS ── */
  const VAT_RATE     = 0.12;   // 12% VAT
  const CANCEL_MINS  = 30;     // cancel window in minutes after order placed

  /* ── STORAGE HELPERS ── */
  const get  = key        => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const set  = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
  const del  = key        => { try { localStorage.removeItem(key); } catch {} };

  /* ── CART ── */
  const Cart = {
    all()           { return get('fd_cart') || []; },
    save(items)     { set('fd_cart', items); Cart.updateBadge(); },
    count()         { return Cart.all().reduce((s, i) => s + (i.qty || 1), 0); },
    updateBadge()   {
      document.querySelectorAll('.cart-count').forEach(el => {
        const c = Cart.count();
        el.textContent = c;
        el.style.display = c > 0 ? '' : 'none';
      });
    },
    add(product) {
      const items = Cart.all();
      const idx   = items.findIndex(i => i.id === product.id && i.variant === product.variant);
      if (idx > -1) { items[idx].qty = (items[idx].qty || 1) + (product.qty || 1); }
      else          { items.push({ ...product, qty: product.qty || 1 }); }
      Cart.save(items);
    },
    remove(id, variant) {
      Cart.save(Cart.all().filter(i => !(i.id === id && i.variant === variant)));
    },
    updateQty(id, variant, qty) {
      const items = Cart.all();
      const idx   = items.findIndex(i => i.id === id && i.variant === variant);
      if (idx > -1) { if (qty < 1) { items.splice(idx, 1); } else { items[idx].qty = qty; } }
      Cart.save(items);
    },
    clear() { del('fd_cart'); Cart.updateBadge(); }
  };

  /* ── PRICING ── */
  const Pricing = {
    // discount types: 'SC' = senior citizen 20%, 'PWD' = 20%, voucher codes
    VOUCHERS: {
      FARMSAVE50: { type: 'flat',    value: 50,  label: 'FARMSAVE50 Voucher' },
      FRESH10:    { type: 'percent', value: 10,  label: 'FRESH10 (10% off)' },
      THANKYOU30: { type: 'flat',    value: 30,  label: 'THANKYOU30 Voucher' },
      NEWBUYER:   { type: 'flat',    value: 100, label: 'New Buyer Voucher' },
    },

    subtotal(items)  { return items.reduce((s, i) => s + i.price * (i.qty || 1), 0); },

    discountAmount(subtotal, voucherCode, specialDiscount) {
      let disc = 0;
      // Special discounts (SC/PWD) apply to subtotal before VAT
      if (specialDiscount === 'SC' || specialDiscount === 'PWD') {
        disc += subtotal * 0.20;
      }
      // Voucher on top
      if (voucherCode && this.VOUCHERS[voucherCode]) {
        const v = this.VOUCHERS[voucherCode];
        disc += v.type === 'flat' ? v.value : subtotal * (v.value / 100);
      }
      return Math.min(disc, subtotal);
    },

    vat(amountAfterDiscount) { return amountAfterDiscount * VAT_RATE; },

    total(items, shippingFee, voucherCode, specialDiscount) {
      const sub  = this.subtotal(items);
      const disc = this.discountAmount(sub, voucherCode, specialDiscount);
      const base = sub - disc;
      const vat  = this.vat(base);
      return { sub, disc, base, vat, shipping: shippingFee, total: base + vat + shippingFee };
    }
  };

  /* ── ORDERS ── */
  const Orders = {
    all()         { return get('fd_orders') || []; },
    save(orders)  { set('fd_orders', orders); },

    place(orderData) {
      const orders = Orders.all();
      const order  = {
        ...orderData,
        id:        'FD-' + Math.floor(100000 + Math.random() * 900000),
        placedAt:  Date.now(),
        status:    'confirmed',   // confirmed → preparing → out_for_delivery → delivered → reviewed
        cancelDeadline: Date.now() + CANCEL_MINS * 60 * 1000,
        cancelled:  false,
        returned:   false,
        review:     null,
      };
      orders.unshift(order);
      Orders.save(orders);
      Cart.clear();
      return order;
    },

    get(id) { return Orders.all().find(o => o.id === id); },

    canCancel(order) {
      return !order.cancelled && !order.returned &&
             ['confirmed', 'preparing'].includes(order.status) &&
             Date.now() < order.cancelDeadline;
    },

    cancel(id, reason) {
      const orders = Orders.all();
      const idx    = orders.findIndex(o => o.id === id);
      if (idx < 0) return false;
      if (!Orders.canCancel(orders[idx])) return false;
      orders[idx].cancelled      = true;
      orders[idx].cancelReason   = reason;
      orders[idx].cancelledAt    = Date.now();
      orders[idx].status         = 'cancelled';
      Orders.save(orders);
      return true;
    },

    canReturn(order) {
      return !order.cancelled && !order.returned &&
             order.status === 'delivered';
    },

    requestReturn(id, reason) {
      const orders = Orders.all();
      const idx    = orders.findIndex(o => o.id === id);
      if (idx < 0) return false;
      if (!Orders.canReturn(orders[idx])) return false;
      orders[idx].returned       = true;
      orders[idx].returnReason   = reason;
      orders[idx].returnedAt     = Date.now();
      orders[idx].status         = 'return_requested';
      Orders.save(orders);
      return true;
    },

    markDelivered(id) {
      const orders = Orders.all();
      const idx    = orders.findIndex(o => o.id === id);
      if (idx < 0) return;
      orders[idx].status      = 'delivered';
      orders[idx].deliveredAt = Date.now();
      Orders.save(orders);
    },

    submitReview(id, stars, text) {
      const orders = Orders.all();
      const idx    = orders.findIndex(o => o.id === id);
      if (idx < 0 || orders[idx].status !== 'delivered') return false;
      orders[idx].review  = { stars, text, at: Date.now() };
      orders[idx].status  = 'reviewed';
      Orders.save(orders);
      return true;
    }
  };

  /* ── CHECKOUT STATE ── */
  const Checkout = {
    get()       { return get('fd_checkout') || {}; },
    save(data)  { set('fd_checkout', { ...Checkout.get(), ...data }); },
    clear()     { del('fd_checkout'); }
  };

  /* ── FORMATTING ── */
  const fmt = {
    peso(n)   { return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
    date(ts)  {
      return new Date(ts).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    },
    timeLeft(deadline) {
      const diff = deadline - Date.now();
      if (diff <= 0) return null;
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return `${m}:${s.toString().padStart(2,'0')}`;
    }
  };

  /* ── INIT ── */
  function init() {
    Cart.updateBadge();

    // Notification bell toggle
    document.querySelectorAll('.notif-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const wrap = btn.closest('.notif-wrap');
        if (wrap) wrap.classList.toggle('open');
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.notif-wrap.open').forEach(w => w.classList.remove('open'));
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { Cart, Pricing, Orders, Checkout, fmt, VAT_RATE };
})();
