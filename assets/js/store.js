/* =========================================================
   نُضْج — طبقة الحالة (السلة، المفضلة، الحساب، الطلبات، خطط المستشار)
   كل شيء محفوظ في المتصفح (localStorage). في النسخة الفعلية
   تُستبدل هذه الطبقة بواجهة برمجية — بقية الموقع لا يتغير.
   ========================================================= */
window.NUDJ_STORE = (function () {
  "use strict";
  const D = window.NUDJ;
  const C = D.CONFIG;
  const L = D.L || (ar => ar);
  const marinadeLabel = m => L("تتبيلة " + m.n, m.n + " marinade");

  const K = { cart: "nudj_cart", wish: "nudj_wish", user: "nudj_user", orders: "nudj_orders", addr: "nudj_addr", recent: "nudj_recent", city: "nudj_city", plans: "nudj_plans", known: "nudj_known" };
  function read(k, fb) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

  /* ---------- أحداث ---------- */
  const subs = {};
  function on(evt, fn) { (subs[evt] = subs[evt] || []).push(fn); }
  function emit(evt, data) { (subs[evt] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); }
  window.addEventListener("storage", e => {
    if (e.key === K.cart) emit("cart");
    if (e.key === K.wish) emit("wish");
    if (e.key === K.user) emit("auth");
  });

  const r2 = n => Math.round(n * 100) / 100;
  const snapKg = (p, kg) => { const st = p.step || 0.5; return Math.max(p.min || st, Math.min(50, Math.round((+kg || 0) / st) * st)); };

  /* =========================================================
     التسعير
     سطر اللحم بالكيلو:  { key, id, kg, opts:{prep, marinade, skewer, vacuum}, note, src }
     سطر الذبيحة:        { key, id, qty, opts:{size, part, style, vacuum}, note }
     سطر الإضافة:        { key, id, qty }
     ========================================================= */
  const sizeOf = (p, k) => (p.sizes || []).find(s => s.k === k) || (p.sizes || []).find(s => s.k === p.sizeDef) || (p.sizes || [])[0];

  /* تفصيل سعر السطر: الأساس + كل إضافة مدفوعة على حدة (تُعرض كما هي في الفاتورة) */
  function breakdown(l) {
    const p = D.byId(l.id); if (!p) return { base: 0, adds: [], total: 0 };
    const o = l.opts || {}, adds = [];
    let base = 0;
    if (p.sold === "kg") {
      const kg = l.kg || p.def;
      base = r2(kg * p.price);
      const m = D.marinade(o.marinade);
      if (m.p) adds.push({ k: "marinade", n: marinadeLabel(m), q: kg, u: m.p, v: r2(kg * m.p) });
      if (o.skewer) adds.push({ k: "skewer", n: D.SERVICES.skewer.n, q: kg, u: D.SERVICES.skewer.p, v: r2(kg * D.SERVICES.skewer.p) });
      if (o.vacuum) adds.push({ k: "vacuum", n: D.SERVICES.vacuum.n, q: kg, u: D.SERVICES.vacuum.p, v: r2(kg * D.SERVICES.vacuum.p) });
    } else if (p.sold === "carcass") {
      const q = l.qty || 1, s = sizeOf(p, o.size);
      base = r2(s.p * q);
      if (o.vacuum) adds.push({ k: "vacuum", n: D.SERVICES.vacuum.n, q, u: D.SERVICES.vacuum.carcass, v: r2(q * D.SERVICES.vacuum.carcass), flat: true });
    } else base = r2(p.price * (l.qty || 1));
    return { base, adds, total: r2(base + adds.reduce((t, a) => t + a.v, 0)) };
  }
  const linePrice = l => breakdown(l).total;
  /* سعر وحدة للعرض (للكيلو أو للحبة أو للذبيحة بالحجم) */
  function unitPrice(p, opts) {
    if (!p) return 0;
    if (p.sold === "carcass") return sizeOf(p, opts && opts.size).p;
    return p.price;
  }
  const fromPrice = p => p.sold === "carcass" ? Math.min.apply(null, p.sizes.map(s => s.p)) : p.price;

  /* =========================================================
     السلة
     ========================================================= */
  const getCart = () => read(K.cart, []).filter(l => l && D.byId(l.id));
  function saveCart(c) { write(K.cart, c); emit("cart"); }
  const lineKey = (id, opts, note) => id + "|" + JSON.stringify(opts || {}) + "|" + (note || "");

  /* يضيف سطراً أو يدمجه مع سطر مطابق */
  function add(id, o) {
    o = o || {};
    const p = D.byId(id); if (!p || (D.soldOut && D.soldOut(p))) return null;
    const c = getCart(), opts = clean(p, o.opts || {}), key = lineKey(id, opts, o.note);
    let ex = c.find(l => l.key === key);
    if (p.sold === "kg") {
      const kg = snapKg(p, o.kg || p.def);
      if (ex) ex.kg = snapKg(p, ex.kg + kg); else c.push({ key, id, kg, opts, note: o.note || "", src: o.src || "" });
    } else {
      const q = Math.max(1, o.qty || 1);
      if (ex) ex.qty = Math.min(99, ex.qty + q); else c.push({ key, id, qty: q, opts, note: o.note || "", src: o.src || "" });
    }
    saveCart(c); return key;
  }
  /* يحذف الخيارات غير الصالحة للمنتج */
  function clean(p, o) {
    const out = {};
    if (p.sold === "kg") {
      out.prep = p.preps.indexOf(o.prep) > -1 ? o.prep : p.prepDef;
      if (o.marinade && o.marinade !== "none" && D.marinade(o.marinade).p) out.marinade = o.marinade;
      if (o.skewer && D.PREPS[out.prep] && D.PREPS[out.prep].skew) out.skewer = true;
      if (o.vacuum) out.vacuum = true;
    } else if (p.sold === "carcass") {
      out.size = sizeOf(p, o.size).k;
      if (p.parts) out.part = (p.parts.find(x => x.k === o.part) || p.parts[0]).k;
      out.style = o.style || "fridge";
      if (o.vacuum) out.vacuum = true;
    }
    return out;
  }
  function setAmount(key, v) {
    let c = getCart(); const l = c.find(x => x.key === key); if (!l) return;
    const p = D.byId(l.id);
    if (p.sold === "kg") { if (v <= 0) c = c.filter(x => x.key !== key); else l.kg = snapKg(p, v); }
    else { if (v <= 0) c = c.filter(x => x.key !== key); else l.qty = Math.min(99, Math.round(v)); }
    saveCart(c);
  }
  /* تعديل خيارات سطر موجود (مثلاً إضافة تتبيلة من السلة) */
  function setOpts(key, patch) {
    const c = getCart(); const l = c.find(x => x.key === key); if (!l) return;
    const p = D.byId(l.id);
    l.opts = clean(p, Object.assign({}, l.opts, patch));
    const nk = lineKey(l.id, l.opts, l.note);
    const dup = c.find(x => x !== l && x.key === nk);
    if (dup) { if (p.sold === "kg") dup.kg = snapKg(p, dup.kg + l.kg); else dup.qty += l.qty; c.splice(c.indexOf(l), 1); }
    else l.key = nk;
    saveCart(c);
  }
  const remove = key => saveCart(getCart().filter(x => x.key !== key));
  const clear = () => saveCart([]);
  const has = id => getCart().some(l => l.id === id);
  /* العدد في الشارة: عدد الأسطر (الوزن لا يُعد قطعاً) */
  const count = () => getCart().length;

  /* الإجماليات — الأسعار شاملة الضريبة، والضريبة جزء مشمول يُعرض منفصلاً */
  function totals(lines, coupon) {
    lines = lines || getCart();
    const meatLines = lines.filter(l => { const p = D.byId(l.id); return p && p.animal !== "extra"; });
    const meat = r2(meatLines.reduce((t, l) => t + breakdown(l).base, 0));
    const services = r2(lines.reduce((t, l) => t + breakdown(l).adds.reduce((s, a) => s + a.v, 0), 0));
    const extrasSum = r2(lines.filter(l => { const p = D.byId(l.id); return p && p.animal === "extra"; }).reduce((t, l) => t + breakdown(l).total, 0));
    const cp = coupon && C.coupons[coupon] ? C.coupons[coupon] : null;
    const discount = cp ? r2(meat * cp.pct / 100) : 0;
    const sub = r2(meat + services + extrasSum - discount);
    const delivery = !lines.length ? 0 : sub >= C.delivery.freeOver ? 0 : C.delivery.fee;
    const total = r2(sub + delivery);
    const vat = r2(total - total / (1 + C.vat));
    const kg = r2(lines.reduce((t, l) => { const p = D.byId(l.id); return t + (p.sold === "kg" ? l.kg : p.sold === "carcass" ? sizeOf(p, l.opts.size).kg * (l.qty || 1) : 0); }, 0));
    return { meat, services, extras: extrasSum, discount, sub, delivery, total, vat, kg, toFree: delivery ? r2(C.delivery.freeOver - sub) : 0, coupon: cp ? coupon : null, count: lines.length };
  }

  /* =========================================================
     المفضلة
     ========================================================= */
  const wish = {
    list: () => read(K.wish, []).filter(id => D.byId(id)),
    has: id => read(K.wish, []).indexOf(id) > -1,
    toggle(id) { const l = read(K.wish, []); const i = l.indexOf(id); if (i > -1) l.splice(i, 1); else l.unshift(id); write(K.wish, l); emit("wish"); return i === -1; }
  };

  /* =========================================================
     الحساب (الدخول برقم الجوال)
     ========================================================= */
  const known = () => read(K.known, {});
  const user = {
    get: () => read(K.user, null),
    knownName: phone => known()[phone] || null,
    login(phone, name) { const u = { phone, name: name || "", since: Date.now() }; write(K.user, u); const k = known(); k[phone] = u.name; write(K.known, k); emit("auth"); return u; },
    update(patch) { const u = Object.assign({}, read(K.user, {}), patch); write(K.user, u); if (u.phone) { const k = known(); k[u.phone] = u.name || ""; write(K.known, k); } emit("auth"); return u; },
    logout() { try { localStorage.removeItem(K.user); } catch (e) { } emit("auth"); }
  };
  function normPhone(v) {
    let d = String(v || "").replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/\D/g, "");
    if (d.indexOf("966") === 0) d = d.slice(3);
    if (d.indexOf("0") === 0) d = d.slice(1);
    return /^5\d{8}$/.test(d) ? d : null;
  }
  const fmtPhone = d => d ? "+966 " + d.slice(0, 2) + " " + d.slice(2, 5) + " " + d.slice(5) : "";

  /* =========================================================
     العناوين
     ========================================================= */
  const addr = {
    list: () => read(K.addr, []),
    get: id => read(K.addr, []).find(a => a.id === id),
    save(a) {
      const l = read(K.addr, []);
      if (!a.id) { a.id = "a" + Date.now().toString(36); l.push(a); }
      else { const i = l.findIndex(x => x.id === a.id); if (i > -1) l[i] = a; else l.push(a); }
      if (a.isDefault || l.length === 1) l.forEach(x => { x.isDefault = x.id === a.id; });
      write(K.addr, l); emit("addr"); return a;
    },
    remove(id) { let l = read(K.addr, []).filter(a => a.id !== id); if (l.length && !l.some(a => a.isDefault)) l[0].isDefault = true; write(K.addr, l); emit("addr"); },
    setDefault(id) { const l = read(K.addr, []); l.forEach(a => { a.isDefault = a.id === id; }); write(K.addr, l); emit("addr"); },
    def: () => { const l = read(K.addr, []); return l.find(a => a.isDefault) || l[0] || null; }
  };

  /* =========================================================
     الطلبات
     ========================================================= */
  function orderId() {
    const d = new Date(); const p = n => String(n).padStart(2, "0");
    return "NJ" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + Math.floor(1000 + Math.random() * 9000);
  }
  const orders = {
    list: () => read(K.orders, []),
    get: id => read(K.orders, []).find(o => o.id === id),
    create({ lines, coupon, address, slot, payment, plan }) {
      const t = totals(lines, coupon);
      const items = lines.map(l => { const p = D.byId(l.id); const b = breakdown(l); return { id: l.id, name: p.name, sold: p.sold, kg: l.kg, qty: l.qty, opts: l.opts, note: l.note, unit: unitPrice(p, l.opts), base: b.base, adds: b.adds, price: b.total, src: l.src || "" }; });
      const u = user.get();
      const o = { id: orderId(), date: Date.now(), items, totals: t, address, slot, payment, plan: plan || null, status: "placed", user: u ? { name: u.name, phone: u.phone } : null, log: [{ s: "placed", t: Date.now() }] };
      const l = read(K.orders, []); l.unshift(o); write(K.orders, l);
      emit("orders"); return o;
    },
    cancel(id) { const l = read(K.orders, []); const o = l.find(x => x.id === id); if (!o || o.status !== "placed") return false; o.status = "cancelled"; o.log = (o.log || []).concat([{ s: "cancelled", t: Date.now() }]); write(K.orders, l); emit("orders"); return true; },
    /* من لوحة التحكم: placed → cutting → onway → done (أو cancelled) مع سجل الأوقات */
    setStatus(id, st) { const l = read(K.orders, []); const o = l.find(x => x.id === id); if (!o) return false; o.status = st; o.log = (o.log || []).concat([{ s: st, t: Date.now() }]); write(K.orders, l); emit("orders"); return true; },
    remove(id) { write(K.orders, read(K.orders, []).filter(x => x.id !== id)); emit("orders"); }
  };

  /* =========================================================
     خطط المستشار المحفوظة
     ========================================================= */
  const plans = {
    list: () => read(K.plans, []),
    save(p) { const l = read(K.plans, []).filter(x => x.id !== p.id); p.saved = Date.now(); l.unshift(p); write(K.plans, l.slice(0, 20)); emit("plans"); return p; },
    remove(id) { write(K.plans, read(K.plans, []).filter(x => x.id !== id)); emit("plans"); },
    get: id => read(K.plans, []).find(x => x.id === id)
  };

  /* =========================================================
     متفرقات
     ========================================================= */
  const recent = {
    list: () => read(K.recent, []),
    push(q) { q = String(q || "").trim(); if (!q) return; const l = read(K.recent, []).filter(x => x !== q); l.unshift(q); write(K.recent, l.slice(0, 8)); },
    clear() { write(K.recent, []); }
  };
  /* المدن تُحفظ بالاسم العربي (ثابت بين اللغتين) وتُعرض بلغة الصفحة */
  const cityKey = v => { const i = (C.cities || []).indexOf(v); return i > -1 && C.cities_ar ? C.cities_ar[i] : v; };
  const cityLabel = v => { const i = (C.cities_ar || []).indexOf(v); return i > -1 ? C.cities[i] : v; };
  const city = {
    get: () => read(K.city, null) || (addr.def() || {}).city || cityKey(C.cities[0]),
    set: v => { write(K.city, cityKey(v)); emit("city"); }
  };

  return {
    on, emit, marinadeLabel, cityKey, cityLabel, sizeOf, unitPrice, fromPrice, breakdown, snapKg,
    cart: { get: getCart, add, setAmount, setOpts, remove, clear, has, count, linePrice, totals },
    wish, user, normPhone, fmtPhone, addr, orders, plans, recent, city
  };
})();
