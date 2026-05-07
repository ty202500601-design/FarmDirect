/**
 * farmdirect.js — Shared data & utility library for FarmDirect
 * Covers: Cart, Checkout, Orders, Profile, Addresses, Vouchers,
 *         Ratings, Notifications, Privacy, and UI helpers.
 *
 * Every page that needs persistent state should load this script FIRST,
 * before any page-specific inline scripts.
 *
 * Usage:  <script src="farmdirect.js"></script>
 */

(function (global) {
  'use strict';

  /* ══════════════════════════════════════════════════
     STORAGE KEYS
  ══════════════════════════════════════════════════ */
  const KEYS = {
    CART:        'fd_cart',
    CHECKOUT:    'fd_checkout',
    ORDERS:      'fd_orders',
    PROFILE:     'fd_profile',
    ADDRESSES:   'fd_addresses',
    VOUCHERS:    'fd_vouchers',
    RATINGS:     'fd_ratings',
    PRIVACY:     'fd_privacy',
    NOTIFS:      'fd_notifs',
    LAST_ORDER:  'fd_last_order',
    DATA_VER:    'fd_data_version',
  };

  const DATA_VERSION = 'fd_v4';   // bump when demo data schema changes

  /* ══════════════════════════════════════════════════
     SAFE JSON HELPERS
  ══════════════════════════════════════════════════ */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function remove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  /* ══════════════════════════════════════════════════
     FORMAT HELPERS
  ══════════════════════════════════════════════════ */
  const fmt = {
    peso(v) {
      return '₱' + Number(v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    date(iso) {
      if (!iso) return '—';
      const d = new Date(iso);
      return isNaN(d) ? '—' : d.toLocaleDateString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    },
    time(iso) {
      if (!iso) return '—';
      const d = new Date(iso);
      return isNaN(d) ? '—' : d.toLocaleTimeString('en-PH', {
        hour: '2-digit', minute: '2-digit',
      });
    },
  };

  /* ══════════════════════════════════════════════════
     PRICING ENGINE
  ══════════════════════════════════════════════════ */
  const VOUCHERS_DEF = {
    FARMSAVE50: { label: '₱50 Off',          type: 'flat',    value: 50  },
    FRESH10:    { label: '10% Off Veggies',   type: 'percent', value: 10  },
    NEWBUYER:   { label: '₱100 Off (New)',    type: 'flat',    value: 100 },
    THANKYOU30: { label: '₱30 Off Next Order',type: 'flat',    value: 30  },
  };

  const Pricing = {
    VOUCHERS: VOUCHERS_DEF,

    subtotal(items) {
      return (items || []).reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
    },

    discountAmount(sub, voucherCode, specialDisc) {
      let d = 0;
      if (specialDisc) d += sub * 0.20;
      if (voucherCode && VOUCHERS_DEF[voucherCode]) {
        const v = VOUCHERS_DEF[voucherCode];
        d += v.type === 'flat' ? v.value : sub * (v.value / 100);
      }
      return d;
    },

    vat(base) {
      return Math.round(base * 0.12 * 100) / 100;
    },

    total(items, shipping, voucherCode, specialDisc) {
      const sub  = this.subtotal(items);
      const disc = this.discountAmount(sub, voucherCode, specialDisc);
      const base = sub - disc;
      const vat  = this.vat(base);
      return {
        sub,
        disc,
        shipping: shipping || 0,
        vat,
        total: base + vat + (shipping || 0),
      };
    },
  };

  /* ══════════════════════════════════════════════════
     CART MODULE
  ══════════════════════════════════════════════════ */
  const Cart = {
    get()          { return read(KEYS.CART, []); },
    save(arr)      { write(KEYS.CART, arr); },
    clear()        { remove(KEYS.CART); },

    count() {
      return this.get().reduce((s, i) => s + (i.qty || 1), 0);
    },

    add(item) {
      const cart = this.get();
      const key  = item.key || item.id;
      if (!key) return;
      const existing = cart.find(c => c.key === key);
      if (existing) {
        existing.qty = Math.min(99, (existing.qty || 1) + (item.qty || 1));
      } else {
        cart.push({ ...item, key, qty: item.qty || 1 });
      }
      this.save(cart);
      _syncCartBadge();
      return cart;
    },

    remove(key) {
      const cart = this.get().filter(i => i.key !== key);
      this.save(cart);
      _syncCartBadge();
      return cart;
    },

    updateQty(key, qty) {
      const cart = this.get();
      const item = cart.find(i => i.key === key);
      if (item) {
        item.qty = Math.max(1, Math.min(99, qty));
        this.save(cart);
        _syncCartBadge();
      }
      return cart;
    },

    subtotal() {
      return Pricing.subtotal(this.get());
    },

    /** Transfer checked-out items from cart to checkout state */
    toCheckoutItems(selectedKeys) {
      const cart = this.get();
      if (!selectedKeys || selectedKeys.length === 0) return cart;
      return cart.filter(i => selectedKeys.includes(i.key));
    },
  };

  /* ══════════════════════════════════════════════════
     CHECKOUT MODULE
  ══════════════════════════════════════════════════ */
  const DEFAULT_CHECKOUT_ITEMS = [
    { id: 'carrots',    key: 'carrots_kg',   name: 'Fresh Organic Carrots', qty: 2, price: 195, img: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=200', farm: 'Green Valley Farm, Labuan', unit: 'per kg' },
    { id: 'tomatoes',  key: 'tomatoes_kg',  name: 'Heirloom Tomatoes',     qty: 1, price: 280, img: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200', farm: 'Sunrise Farm, Tugbungan',  unit: 'per kg' },
    { id: 'watermelon',key: 'watermelon_pc', name: 'Sweet Watermelon',      qty: 1, price: 560, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200', farm: 'Sibuco Tropicals',         unit: 'per piece' },
  ];

  const Checkout = {
    _recompute(data) {
      const ship = (data.shippingFee !== undefined) ? data.shippingFee : 60;
      data.pricing = Pricing.total(
        data.items || DEFAULT_CHECKOUT_ITEMS,
        ship,
        data.voucherCode || '',
        data.specialDisc  || ''
      );
      return data;
    },

    get() {
      let data = read(KEYS.CHECKOUT, null) || {};
      if (!data.items || data.items.length === 0) {
        // Try pulling from live cart first, fall back to demo items
        const cartItems = Cart.get();
        data.items = cartItems.length > 0 ? cartItems : DEFAULT_CHECKOUT_ITEMS;
      }
      if (data.shippingFee === undefined) data.shippingFee = 60;
      if (!data.pricing) this._recompute(data);
      return data;
    },

    save(obj) {
      const current = read(KEYS.CHECKOUT, {}) || {};
      const merged  = Object.assign({}, current, obj);
      this._recompute(merged);
      write(KEYS.CHECKOUT, merged);
      return merged;
    },

    clear() { remove(KEYS.CHECKOUT); },

    /** Populate checkout from the current live cart */
    initFromCart(selectedKeys) {
      const cart  = Cart.get();
      const items = selectedKeys
        ? cart.filter(i => selectedKeys.includes(i.key))
        : cart;
      if (items.length > 0) this.save({ items });
    },
  };

  /* ══════════════════════════════════════════════════
     ORDERS MODULE
  ══════════════════════════════════════════════════ */
  const NON_CANCELLABLE = ['picked_up', 'on_the_way', 'delivered', 'reviewed', 'return_requested', 'cancelled'];

  const Orders = {
    getAll()      { return read(KEYS.ORDERS, []); },
    saveAll(arr)  { write(KEYS.ORDERS, arr); },

    get(id) {
      return this.getAll().find(o => o.id === id) || null;
    },

    place(orderData) {
      const id     = 'FD-' + Date.now();
      const orders = this.getAll();
      const order  = {
        id,
        ...orderData,
        status:    'preparing',
        placedAt:  new Date().toISOString(),
        cancelled: false,
      };
      orders.push(order);
      this.saveAll(orders);
      write(KEYS.LAST_ORDER, id);
      return { id, order };
    },

    updateStatus(id, status) {
      const orders = this.getAll();
      const order  = orders.find(o => o.id === id);
      if (order) { order.status = status; this.saveAll(orders); }
      return order;
    },

    cancel(id, reason) {
      const orders = this.getAll();
      const order  = orders.find(o => o.id === id);
      if (!order) return false;
      const status = (order.status || '').toLowerCase().replace(/\s+/g, '_');
      if (NON_CANCELLABLE.includes(status)) return false;
      order.status     = 'cancelled';
      order.cancelled  = true;
      order.cancelReason = reason || '';
      order.cancelledAt  = new Date().toISOString();
      this.saveAll(orders);
      return true;
    },

    markDelivered(id) {
      const orders = this.getAll();
      const order  = orders.find(o => o.id === id);
      if (order) {
        order.status      = 'delivered';
        order.deliveredAt = new Date().toISOString();
        this.saveAll(orders);
      }
      return !!order;
    },

    submitReview(id, stars, comment) {
      const orders = this.getAll();
      const order  = orders.find(o => o.id === id);
      if (!order || order.status !== 'delivered') return false;
      order.status  = 'reviewed';
      order.review  = { stars, comment, date: new Date().toISOString() };
      this.saveAll(orders);

      // Also persist to ratings store
      const ratings = read(KEYS.RATINGS, []);
      ratings.push({ orderId: id, stars, comment, date: new Date().toISOString() });
      write(KEYS.RATINGS, ratings);
      return true;
    },

    requestReturn(id, reason) {
      const orders = this.getAll();
      const order  = orders.find(o => o.id === id);
      if (!order || !['delivered', 'reviewed'].includes(order.status)) return false;
      order.status        = 'return_requested';
      order.returnReason  = reason;
      order.returnedAt    = new Date().toISOString();
      this.saveAll(orders);
      return true;
    },

    canReturn(order) {
      return order && ['delivered', 'reviewed'].includes(order.status) && !order.cancelled;
    },

    canCancel(order) {
      if (!order || order.cancelled) return false;
      const status = (order.status || '').toLowerCase().replace(/\s+/g, '_');
      return !NON_CANCELLABLE.includes(status);
    },

    getLastOrder() {
      const id = localStorage.getItem(KEYS.LAST_ORDER);
      return id ? this.get(id) : null;
    },

    /** Build demo orders only when the data version hasn't been set yet */
    ensureDemoData() {
      if (localStorage.getItem(KEYS.DATA_VER) === DATA_VERSION) return;
      remove(KEYS.ORDERS);
      remove(KEYS.RATINGS);
      localStorage.setItem(KEYS.DATA_VER, DATA_VERSION);

      const ago = ms => new Date(Date.now() - ms).toISOString();
      const demo = [
        // TO PAY
        {
          id: 'FD-001', status: 'to_pay', placedAt: ago(3_600_000), paymentMethod: 'gcash',
          farm: 'Green Valley Farm, Labuan', total: 970,
          pricing: { sub: 970, disc: 0, shipping: 60, vat: 104.64, total: 1134.64 },
          address: { name: 'Juan Dela Cruz', phone: '+63 912 345 6789', street: '123 Rizal St.', brgy: 'Tetuan', city: 'Zamboanga City', zip: '7000' },
          items: [
            { name: 'Fresh Carrots (Medium)', unit: 'per kg',           qty: 2, price: 195, img: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=200' },
            { name: 'Heirloom Tomatoes (Large)', unit: 'per kg',        qty: 1, price: 280, img: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200' },
            { name: 'Fresh Lettuce (Medium)', unit: 'per bundle (0.3kg)', qty: 2, price: 150, img: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200' },
          ],
        },
        {
          id: 'FD-002', status: 'to_pay', placedAt: ago(7_200_000), paymentMethod: 'cod',
          farm: 'Taluksangay Spice Farm', total: 440,
          pricing: { sub: 440, disc: 0, shipping: 60, vat: 53.28, total: 553.28 },
          address: { name: 'Juan Dela Cruz', phone: '+63 912 345 6789', street: '123 Rizal St.', brgy: 'Tetuan', city: 'Zamboanga City', zip: '7000' },
          items: [
            { name: 'Luyang Dilaw Turmeric', unit: 'per 250g', qty: 2, price: 160, img: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=200' },
            { name: 'Sukang Tuba (Coconut Vinegar)', unit: 'per 750ml', qty: 1, price: 120, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200' },
          ],
        },
        // TO SHIP
        {
          id: 'FD-003', status: 'to_ship', placedAt: ago(86_400_000), paymentMethod: 'gcash',
          farm: 'Ayala Poultry', total: 1260,
          pricing: { sub: 1260, disc: 0, shipping: 80, vat: 152.64, total: 1492.64 },
          address: { name: 'Juan Dela Cruz', phone: '+63 912 345 6789', street: '123 Rizal St.', brgy: 'Tetuan', city: 'Zamboanga City', zip: '7000' },
          items: [
            { name: 'Native Chicken Eggs', unit: 'per tray (30 pcs)', qty: 2, price: 360, img: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=200' },
            { name: 'Itik Eggs (Duck Eggs)', unit: 'per tray (30 pcs)', qty: 1, price: 540, img: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=200' },
          ],
        },
        {
          id: 'FD-004', status: 'to_ship', placedAt: ago(108_000_000), paymentMethod: 'bank',
          farm: 'Manenan Ranch', total: 1040,
          pricing: { sub: 1040, disc: 0, shipping: 80, vat: 125.76, total: 1245.76 },
          address: { name: 'Juan Dela Cruz', phone: '+63 912 345 6789', street: '123 Rizal St.', brgy: 'Tetuan', city: 'Zamboanga City', zip: '7000' },
          items: [
            { name: 'Grass-Fed Beef Sirloin', unit: 'per kg', qty: 1, price: 480, img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200' },
            { name: 'Artisan Farm Butter', unit: 'per 200g', qty: 2, price: 280, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200' },
          ],
        },
        // TO RECEIVE
        {
          id: 'FD-005', status: 'to_receive', placedAt: ago(172_800_000), paymentMethod: 'gcash',
          farm: 'Sibuco Tropicals', total: 565,
          pricing: { sub: 445, disc: 0, shipping: 60, vat: 53.4, total: 558.4 },
          address: { name: 'Juan Dela Cruz', phone: '+63 912 345 6789', street: '123 Rizal St.', brgy: 'Tetuan', city: 'Zamboanga City', zip: '7000' },
          items: [
            { name: 'Queen Pineapple', unit: 'per piece', qty: 3, price: 75, img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=200' },
            { name: 'Fresh Papayas', unit: 'per kg', qty: 2, price: 85, img: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=200' },
            { name: 'Saba Bananas', unit: 'per bundle (1 kg)', qty: 2, price: 60, img: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200' },
          ],
        },
        {
          id: 'FD-006', status: 'to_receive', placedAt: ago(216_000_000), paymentMethod: 'cod',
          farm: 'Manenan Dairy', total: 504,
          pricing: { sub: 504, disc: 0, shipping: 60, vat: 53.28, total: 617.28 },
          address: { name: 'Juan Dela Cruz', phone: '+63 912 345 6789', street: '123 Rizal St.', brgy: 'Tetuan', city: 'Zamboanga City', zip: '7000' },
          items: [
            { name: 'Fresh Carabao Milk', unit: 'per liter', qty: 3, price: 120, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200' },
            { name: 'Pasteurized Goat Milk', unit: 'per 500ml', qty: 2, price: 72, img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200' },
          ],
        },
        // DELIVERED (to rate)
        {
          id: 'FD-007', status: 'delivered', placedAt: ago(604_800_000), paymentMethod: 'gcash',
          farm: 'Manenan Ranch', total: 620, deliveredAt: ago(518_400_000),
          pricing: { sub: 480, disc: 0, shipping: 80, vat: 57.6, total: 617.6 },
          address: { name: 'Juan Dela Cruz', phone: '+63 912 345 6789', street: '123 Rizal St.', brgy: 'Tetuan', city: 'Zamboanga City', zip: '7000' },
          items: [
            { name: 'Grass-Fed Beef Sirloin', unit: 'per 500g', qty: 2, price: 240, img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200' },
          ],
        },
        {
          id: 'FD-008', status: 'delivered', placedAt: ago(864_000_000), paymentMethod: 'cod',
          farm: 'Taluksangay Spice Farm', total: 960, deliveredAt: ago(777_600_000),
          pricing: { sub: 960, disc: 0, shipping: 60, vat: 115.2, total: 1135.2 },
          address: { name: 'Juan Dela Cruz', phone: '+63 912 345 6789', street: '123 Rizal St.', brgy: 'Tetuan', city: 'Zamboanga City', zip: '7000' },
          items: [
            { name: 'Luyang Dilaw Turmeric', unit: 'per kg', qty: 1, price: 640, img: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=200' },
            { name: 'Sukang Tuba (Coconut Vinegar)', unit: 'per liter', qty: 2, price: 160, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200' },
          ],
        },
        {
          id: 'FD-009', status: 'delivered', placedAt: ago(1_296_000_000), paymentMethod: 'gcash',
          farm: 'Sibuco Tropicals', total: 1050, deliveredAt: ago(1_209_600_000),
          pricing: { sub: 1050, disc: 0, shipping: 0, vat: 126, total: 1176 },
          address: { name: 'Juan Dela Cruz', phone: '+63 912 345 6789', street: '123 Rizal St.', brgy: 'Tetuan', city: 'Zamboanga City', zip: '7000' },
          items: [
            { name: 'Queen Pineapple', unit: 'per box (6 pcs)', qty: 1, price: 450, img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=200' },
            { name: 'Saba Bananas', unit: 'per sack (10 kg)', qty: 1, price: 600, img: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200' },
          ],
        },
      ];
      this.saveAll(demo);
    },
  };

  /* ══════════════════════════════════════════════════
     PROFILE MODULE
  ══════════════════════════════════════════════════ */
  const PROFILE_DEFAULT = {
    name:   'Juan Dela Cruz',
    email:  'juan@email.com',
    phone:  '+63 912 345 6789',
    city:   'Zamboanga City',
    avatar: 'J',
  };

  const Profile = {
    get() {
      return Object.assign({}, PROFILE_DEFAULT, read(KEYS.PROFILE, {}));
    },
    save(obj) {
      const current = this.get();
      const merged  = Object.assign({}, current, obj);
      if (merged.name) merged.avatar = merged.name[0].toUpperCase();
      write(KEYS.PROFILE, merged);
      return merged;
    },
  };

  /* ══════════════════════════════════════════════════
     ADDRESSES MODULE
  ══════════════════════════════════════════════════ */
  const ADDRESSES_DEFAULT = [
    {
      id: 'addr-default', name: 'Juan Dela Cruz', phone: '+63 912 345 6789',
      street: '123 Rizal Street, Purok 4', brgy: 'Tetuan',
      city: 'Zamboanga City', zip: '7000',
      landmark: 'Near Tetuan Market', isDefault: true,
    },
  ];

  const Addresses = {
    get() {
      const stored = read(KEYS.ADDRESSES, null);
      return (stored && stored.length) ? stored : ADDRESSES_DEFAULT;
    },
    save(arr) { write(KEYS.ADDRESSES, arr); },

    getDefault() {
      const all = this.get();
      return all.find(a => a.isDefault) || all[0] || null;
    },

    add(addr) {
      const all = this.get();
      if (all.length === 0) addr.isDefault = true;
      addr.id = addr.id || 'addr-' + Date.now();
      all.push(addr);
      this.save(all);
      return addr;
    },

    update(id, changes) {
      const all = this.get();
      const idx = all.findIndex(a => a.id === id);
      if (idx > -1) { all[idx] = Object.assign({}, all[idx], changes); this.save(all); }
      return all;
    },

    setDefault(id) {
      const all = this.get().map(a => ({ ...a, isDefault: a.id === id }));
      this.save(all);
      return all;
    },

    remove(id) {
      let all = this.get().filter(a => a.id !== id);
      if (all.length > 0 && !all.find(a => a.isDefault)) all[0].isDefault = true;
      this.save(all);
      return all;
    },
  };

  /* ══════════════════════════════════════════════════
     VOUCHERS MODULE
  ══════════════════════════════════════════════════ */
  const VOUCHERS_STORED_DEFAULT = [
    { code: 'FARMSAVE50', desc: '₱50 off on any order',         expires: '2026-08-01', used: false },
    { code: 'FRESH10',    desc: '10% off on vegetables',         expires: '2026-07-15', used: false },
    { code: 'THANKYOU30', desc: '₱30 off next purchase',          expires: '2026-06-30', used: false },
    { code: 'NEWBUYER',   desc: '₱100 off (new users only)',      expires: '2026-06-01', used: true  },
  ];

  const Vouchers = {
    get() {
      const stored = read(KEYS.VOUCHERS, null);
      return stored || VOUCHERS_STORED_DEFAULT;
    },
    save(arr) { write(KEYS.VOUCHERS, arr); },

    markUsed(code) {
      const all = this.get();
      const v   = all.find(v => v.code === code);
      if (v) { v.used = true; this.save(all); }
    },

    validate(code) {
      const def = Pricing.VOUCHERS[code.toUpperCase()];
      return def || null;
    },
  };

  /* ══════════════════════════════════════════════════
     RATINGS MODULE
  ══════════════════════════════════════════════════ */
  const Ratings = {
    get()       { return read(KEYS.RATINGS, []); },
    save(arr)   { write(KEYS.RATINGS, arr); },

    add(orderId, stars, comment) {
      const all = this.get();
      all.push({ orderId, stars, comment: comment || '', date: new Date().toISOString() });
      this.save(all);
    },

    forOrder(orderId) {
      return this.get().find(r => r.orderId === orderId) || null;
    },
  };

  /* ══════════════════════════════════════════════════
     PRIVACY & NOTIFICATIONS MODULE
  ══════════════════════════════════════════════════ */
  const Privacy = {
    _default() {
      return {
        twoFA: false,
        notifs: { orders: true, promos: true, reviews: false, newsletter: false },
      };
    },
    get()       { return Object.assign(this._default(), read(KEYS.PRIVACY, {})); },
    save(obj)   { write(KEYS.PRIVACY, Object.assign(this.get(), obj)); },
  };

  /* ══════════════════════════════════════════════════
     UI HELPERS (usable on all pages)
  ══════════════════════════════════════════════════ */
  function _syncCartBadge() {
    const count = Cart.count();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count || '0';
    });
  }

  /** Generic toast notification */
  function showToast(msg, type) {
    // Try page-specific toast IDs first
    let el = document.getElementById('fd-toast') || document.getElementById('dash-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'fd-toast-global';
      Object.assign(el.style, {
        position: 'fixed', bottom: '2rem', left: '50%',
        transform: 'translateX(-50%) translateY(80px)',
        background: '#1a3a22', color: '#fff',
        padding: '0.65rem 1.4rem', borderRadius: '30px',
        fontSize: '0.88rem', fontWeight: '700', zIndex: '9999',
        transition: 'transform 0.3s, opacity 0.3s', opacity: '0',
        pointerEvents: 'none', whiteSpace: 'nowrap',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      });
      document.body.appendChild(el);
    }
    const colours = { warn: '#e65c00', error: '#c62828', success: '#1a3a22' };
    el.style.background = colours[type] || colours.success;
    el.textContent = msg;
    el.style.transform = 'translateX(-50%) translateY(0)';
    el.style.opacity = '1';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.style.transform = 'translateX(-50%) translateY(80px)';
      el.style.opacity = '0';
    }, 2500);
  }

  /** Auto-initialise on every page load */
  function _init() {
    // Ensure demo order data exists
    Orders.ensureDemoData();

    // Sync cart badge
    _syncCartBadge();

    // Pre-seed checkout from cart if empty
    const co = read(KEYS.CHECKOUT, null);
    if (!co || !co.items || co.items.length === 0) {
      const cartItems = Cart.get();
      if (cartItems.length > 0) {
        Checkout.save({ items: cartItems });
      }
    }

    // Sync notification dot in topbar
    _syncNotifDot();

    // Sync username display from profile
    const profile = Profile.get();
    document.querySelectorAll('.user-link').forEach(el => {
      const text = el.textContent.trim();
      // only replace default placeholder
      if (text.includes('farmuser') || text.includes('Juan')) {
        const icon    = el.querySelector('i.fa-user-circle');
        const chevron = el.querySelector('i.fa-chevron-down');
        if (icon && chevron) {
          el.innerHTML = '';
          el.appendChild(icon.cloneNode(true));
          el.appendChild(document.createTextNode(' ' + profile.name.split(' ')[0] + ' '));
          el.appendChild(chevron.cloneNode(true));
        }
      }
    });
  }

  function _syncNotifDot() {
    // Simple: just keep whatever count is in the HTML; no dynamic compute needed for demo
    // (real app would check unread notifications from store)
  }

  /* Run init when the DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  /* ══════════════════════════════════════════════════
     PUBLIC API  —  window.FD
  ══════════════════════════════════════════════════ */
  global.FD = {
    /* Sub-modules */
    Cart,
    Checkout,
    Orders,
    Profile,
    Addresses,
    Vouchers,
    Ratings,
    Privacy,
    Pricing,

    /* Convenience aliases kept for backward-compat with inline shims */
    fmt,

    /* UI */
    showToast,
    syncCartBadge: _syncCartBadge,

    /* KEYS (read-only reference) */
    KEYS,
  };

}(window));