/* =========================================================
   نُضْج — طبقة الحالة (السلة، المفضلة، الحساب، الاشتراك، الطلبات)
   كل شيء محفوظ في المتصفح (localStorage). في النسخة الفعلية
   تُستبدل هذه الطبقة بواجهة برمجية على الخادم — بقية الموقع لا يتغير.
   ========================================================= */
window.NUDJ_STORE = (function () {
  "use strict";
  const D = window.NUDJ;
  const C = D.CONFIG;

  /* ---------- تخزين آمن ---------- */
  const K = {
    cart: "nudj_cart", wish: "nudj_wish", user: "nudj_user", member: "nudj_member", guides: "nudj_guides",
    orders: "nudj_orders", addr: "nudj_addr", consults: "nudj_consults", recent: "nudj_recent", city: "nudj_city"
  };
  function read(k, fb) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

  /* ---------- أحداث ---------- */
  const subs = {};
  function on(evt, fn) { (subs[evt] = subs[evt] || []).push(fn); }
  function emit(evt, data) { (subs[evt] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); }
  /* تزامن بين التبويبات */
  window.addEventListener("storage", e => {
    if (e.key === K.cart) emit("cart");
    if (e.key === K.wish) emit("wish");
    if (e.key === K.user || e.key === K.member || e.key === K.guides) emit("auth");
  });

  const round2 = n => Math.round(n * 100) / 100;

  /* =========================================================
     التسعير
     ========================================================= */
  function sizeOf(p, k) { return (p.sizes || []).find(s => s.k === k) || (p.sizes || []).find(s => s.k === p.sizeDef) || (p.sizes || [])[0]; }

  /* سعر وحدة واحدة من المنتج حسب الخيارات */
  function unitPrice(p, opts) {
    if (!p) return 0;
    if (p.type === "carcass") { const s = sizeOf(p, opts && opts.size); return s ? s.p : 0; }
    if (p.type === "box") return p.price;
    if (p.unit === "kg") { const s = sizeOf(p, opts && opts.size); return round2(p.price * (s ? s.m : 1)); }
    return p.price;
  }
  /* السعر المعروض على البطاقة */
  function fromPrice(p) {
    if (p.type === "carcass") return Math.min.apply(null, p.sizes.map(s => s.p));
    return p.price;
  }
  /* القيمة المنفصلة لمحتويات البوكس */
  function boxValue(p) {
    return round2((p.contents || []).reduce((t, c) => { const q = D.byId(c.id); return t + unitPrice(q, { size: c.size }) * (c.qty || 1); }, 0));
  }

  /* =========================================================
     السلة
     سطر اللحم: { key, kind:"meat", id, qty, opts:{size,cut,part,extras,pack}, note }
     سطر الدليل: { key, kind:"guide", id }
     ========================================================= */
  function getCart() { return read(K.cart, []).filter(validLine); }
  function validLine(l) {
    if (!l || !l.kind) return false;
    if (l.kind === "meat") return !!D.byId(l.id);
    if (l.kind === "guide") return !!D.guideById(l.id);
    return false;
  }
  function saveCart(c) { write(K.cart, c); emit("cart"); }
  function lineKey(id, opts, note) { return id + "|" + JSON.stringify(opts || {}) + "|" + (note || ""); }

  function addMeat(id, opts, qty, note) {
    const c = getCart(); const key = lineKey(id, opts, note);
    const ex = c.find(l => l.key === key);
    if (ex) ex.qty = Math.min(99, ex.qty + (qty || 1));
    else c.push({ key, kind: "meat", id, qty: qty || 1, opts: opts || {}, note: note || "" });
    saveCart(c); return key;
  }
  function addGuide(gid) {
    if (!D.guideById(gid) || hasAccess(gid)) return false;
    const c = getCart(); const key = "guide:" + gid;
    if (!c.find(l => l.key === key)) { c.push({ key, kind: "guide", id: gid }); saveCart(c); }
    return true;
  }
  function guideInCart(gid) { return getCart().some(l => l.kind === "guide" && l.id === gid); }
  function setQty(key, q) {
    let c = getCart(); const l = c.find(x => x.key === key); if (!l) return;
    if (q <= 0) c = c.filter(x => x.key !== key); else l.qty = Math.min(99, q);
    saveCart(c);
  }
  function removeLine(key) { saveCart(getCart().filter(x => x.key !== key)); }
  function clearCart() { saveCart([]); }
  /* يزيل من السلة أي دليل صار متاحاً (بعد الاشتراك أو الشراء) */
  function pruneOwnedGuides() { const c = getCart(); const n = c.filter(l => !(l.kind === "guide" && hasAccess(l.id))); if (n.length !== c.length) saveCart(n); }

  function cartCount() { return getCart().reduce((t, l) => t + (l.kind === "meat" ? l.qty : 1), 0); }

  function linePrice(l) {
    if (l.kind === "guide") return C.guidePrice;
    return round2(unitPrice(D.byId(l.id), l.opts) * l.qty);
  }

  /* الإجماليات — الأسعار شاملة الضريبة، والضريبة تُعرض كجزء مشمول */
  function totals(lines, coupon) {
    lines = lines || getCart();
    const meat = round2(lines.filter(l => l.kind === "meat").reduce((t, l) => t + linePrice(l), 0));
    const digital = round2(lines.filter(l => l.kind === "guide").reduce((t, l) => t + linePrice(l), 0));
    const cp = coupon && C.coupons[coupon] ? C.coupons[coupon] : null;
    const discount = cp ? round2(meat * cp.pct / 100) : 0;
    const hasMeat = lines.some(l => l.kind === "meat");
    const afterDisc = meat - discount;
    const delivery = !hasMeat ? 0 : afterDisc >= C.delivery.freeOver ? 0 : C.delivery.fee;
    const total = round2(afterDisc + digital + delivery);
    const vat = round2(total - total / (1 + C.vat));
    const toFree = hasMeat && delivery > 0 ? round2(C.delivery.freeOver - afterDisc) : 0;
    return { meat, digital, discount, delivery, total, vat, hasMeat, toFree, coupon: cp ? coupon : null };
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
     الحساب (تسجيل الدخول برقم الجوال)
     ========================================================= */
  /* أسماء الأرقام التي سجّلت سابقاً على هذا الجهاز (بديل مؤقت لقاعدة المستخدمين) */
  const known = () => read("nudj_known", {});
  const user = {
    get: () => read(K.user, null),
    knownName: phone => known()[phone] || null,
    login(phone, name) { const u = { phone, name: name || "", since: Date.now() }; write(K.user, u); const k = known(); k[phone] = u.name; write("nudj_known", k); emit("auth"); return u; },
    update(patch) { const u = Object.assign({}, read(K.user, {}), patch); write(K.user, u); if (u.phone) { const k = known(); k[u.phone] = u.name || ""; write("nudj_known", k); } emit("auth"); return u; },
    logout() { try { localStorage.removeItem(K.user); } catch (e) { } emit("auth"); }
  };
  /* رقم سعودي: 5XXXXXXXX (9 أرقام) — يقبل 05 و 966 و +966 */
  function normPhone(v) {
    let d = String(v || "").replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/\D/g, "");
    if (d.indexOf("966") === 0) d = d.slice(3);
    if (d.indexOf("0") === 0) d = d.slice(1);
    return /^5\d{8}$/.test(d) ? d : null;
  }
  const fmtPhone = d => d ? "+966 " + d.slice(0, 2) + " " + d.slice(2, 5) + " " + d.slice(5) : "";

  /* =========================================================
     الخبرة: اشتراك نُضْج+ والأدلة المشتراة
     ========================================================= */
  const member = {
    get() { const m = read(K.member, null); return m && m.status === "active" ? m : null; },
    raw: () => read(K.member, null),
    subscribe(plan) {
      const P = C.plans[plan]; if (!P) return null;
      const now = new Date(); const renew = new Date(now);
      if (plan === "annual") renew.setFullYear(renew.getFullYear() + 1); else renew.setMonth(renew.getMonth() + 1);
      const m = { plan, price: P.price, since: now.getTime(), renews: renew.getTime(), status: "active", autoRenew: true };
      write(K.member, m); pruneOwnedGuides(); emit("auth"); return m;
    },
    setAutoRenew(v) { const m = read(K.member, null); if (!m) return; m.autoRenew = !!v; write(K.member, m); emit("auth"); },
    end() { try { localStorage.removeItem(K.member); } catch (e) { } emit("auth"); }
  };
  const isMember = () => !!member.get();
  const owned = () => read(K.guides, []);
  function grant(ids) { const o = owned(); (ids || []).forEach(id => { if (o.indexOf(id) < 0) o.push(id); }); write(K.guides, o); pruneOwnedGuides(); emit("auth"); }
  /* هل يستطيع المستخدم فتح هذا الدليل؟ مختبر الطبخ للأعضاء فقط */
  function hasAccess(gid) { if (gid === "lab") return isMember(); return isMember() || owned().indexOf(gid) > -1; }

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
    /* ينشئ الطلب من أسطر محددة (السلة أو شراء سريع) ويمنح الأدلة المدفوعة فوراً */
    create({ lines, coupon, address, slot, payment }) {
      const t = totals(lines, coupon);
      const snap = lines.map(l => {
        if (l.kind === "guide") { const g = D.guideById(l.id); return { kind: "guide", id: l.id, name: g.title, qty: 1, price: C.guidePrice }; }
        const p = D.byId(l.id);
        return { kind: "meat", id: l.id, name: p.name, qty: l.qty, opts: l.opts, note: l.note, unit: unitPrice(p, l.opts), price: linePrice(l) };
      });
      const guides = lines.filter(l => l.kind === "guide").map(l => l.id);
      const o = {
        id: orderId(), date: Date.now(), items: snap, totals: t, address: t.hasMeat ? address : null,
        slot: t.hasMeat ? slot : null, payment, guides, status: t.hasMeat ? "placed" : "done"
      };
      const l = read(K.orders, []); l.unshift(o); write(K.orders, l);
      if (guides.length) grant(guides);
      emit("orders"); return o;
    },
    /* الإلغاء متاح قبل بدء التجهيز فقط */
    cancel(id) { const l = read(K.orders, []); const o = l.find(x => x.id === id); if (!o || o.status !== "placed") return false; o.status = "cancelled"; write(K.orders, l); emit("orders"); return true; }
  };

  /* =========================================================
     الاستشارات
     ========================================================= */
  const consults = {
    list: () => read(K.consults, []),
    create(c) {
      c.id = "C" + String(Date.now()).slice(-7); c.created = Date.now(); c.status = "confirmed";
      const l = read(K.consults, []); l.unshift(c); write(K.consults, l); emit("consults"); return c;
    },
    cancel(id) { const l = read(K.consults, []); const c = l.find(x => x.id === id); if (c) c.status = "cancelled"; write(K.consults, l); emit("consults"); }
  };

  /* =========================================================
     متفرقات
     ========================================================= */
  const recent = {
    list: () => read(K.recent, []),
    push(q) { q = String(q || "").trim(); if (!q) return; const l = read(K.recent, []).filter(x => x !== q); l.unshift(q); write(K.recent, l.slice(0, 8)); },
    clear() { write(K.recent, []); }
  };
  const city = {
    get: () => read(K.city, null) || (addr.def() || {}).city || C.cities[0],
    set: v => { write(K.city, v); emit("city"); }
  };

  return {
    on, emit, unitPrice, fromPrice, boxValue, sizeOf,
    cart: { get: getCart, addMeat, addGuide, guideInCart, setQty, remove: removeLine, clear: clearCart, count: cartCount, linePrice, totals },
    wish, user, normPhone, fmtPhone, member, isMember, owned, grant, hasAccess, addr, orders, consults, recent, city
  };
})();
