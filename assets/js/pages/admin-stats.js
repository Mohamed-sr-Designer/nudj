/* =========================================================
   نُضْج — أرقام لوحة التحكم (المبيعات، الأرباح، العملاء)
   المصدر: طلبات هذا الجهاز (nudj_orders) + «بيانات تجريبية للعرض» منفصلة
   (nudj_demo_orders) لا تظهر للعميل في «طلباتي» وتُحذف بزر واحد.
   التكلفة (لحساب الربح) تُحفظ في هذا المتصفح فقط ولا تُنشر مع المحتوى.
   ========================================================= */
window.NUDJ_STATS = (function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE;
  const C = D.CONFIG;
  const K = { demo: "nudj_demo_orders", cost: "nudj_adm_costs" };
  const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const r2 = n => Math.round(n * 100) / 100;
  const DAY = 864e5;
  const day0 = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

  /* ---------------- الطلبات ---------------- */
  function orders() {
    const real = S.orders.list().map(o => Object.assign({}, o, { demo: false }));
    const demo = read(K.demo, []).map(o => Object.assign({}, o, { demo: true }));
    return real.concat(demo).sort((a, b) => b.date - a.date);
  }
  const hasDemo = () => read(K.demo, []).length > 0;
  const get = id => orders().find(o => o.id === id);
  function setStatus(id, st) {
    const l = read(K.demo, []), o = l.find(x => x.id === id);
    if (o) { o.status = st; o.log = (o.log || []).concat([{ s: st, t: Date.now() }]); write(K.demo, l); return true; }
    return S.orders.setStatus(id, st);
  }
  function remove(id) {
    const l = read(K.demo, []);
    if (l.some(x => x.id === id)) { write(K.demo, l.filter(x => x.id !== id)); return; }
    S.orders.remove(id);
  }

  /* ---------------- التكلفة والربح ---------------- */
  const costs = () => Object.assign({ pct: null, byId: {}, assumed: false }, read(K.cost, {}));
  function setCost(patch) { const c = Object.assign(costs(), patch); write(K.cost, c); return c; }
  const pctOf = (id, c) => { c = c || costs(); const v = c.byId[id]; return v != null && v !== "" ? +v : c.pct; };
  /* الأسعار شاملة الضريبة: الصافي = المبلغ ÷ (1 + الضريبة). التكلفة نسبة من صافي سعر البيع.
     التوصيل يُعامل كمبلغ يمر (لا يدخل في الربح). */
  function metrics(o, c) {
    c = c || costs();
    const t = o.totals || {}, v = 1 + (C.vat || 0);
    const net = r2((t.total || 0) - (t.vat || 0));
    let cogs = 0, known = true;
    (o.items || []).forEach(it => {
      const p = pctOf(it.id, c); if (p == null) { known = false; return; }
      const svc = (it.adds || []).reduce((s, a) => s + (a.v || 0), 0);
      cogs += ((it.base || 0) + svc) / v * p / 100;
    });
    const profit = known ? r2(net - (t.delivery || 0) / v - cogs) : null;
    return { gross: t.total || 0, net, vat: t.vat || 0, delivery: t.delivery || 0, discount: t.discount || 0, meat: t.meat || 0, services: t.services || 0, extras: t.extras || 0, cogs: known ? r2(cogs) : null, profit };
  }

  /* ---------------- الفترات ---------------- */
  /* days: عدد الأيام · offset 1 = الفترة السابقة لها مباشرة */
  function period(days, offset) {
    const end = day0(Date.now()) + DAY - offset * days * DAY, start = end - days * DAY;
    return { start, end };
  }
  const inRange = (o, p) => o.date >= p.start && o.date < p.end;
  const valid = o => o.status !== "cancelled";

  function summary(list, c) {
    c = c || costs();
    const ok = list.filter(valid);
    const s = { orders: ok.length, all: list.length, cancelled: list.length - ok.length, gross: 0, net: 0, vat: 0, delivery: 0, discount: 0, meat: 0, services: 0, extras: 0, cogs: 0, profit: 0, kg: 0, profitKnown: true };
    ok.forEach(o => {
      const m = metrics(o, c);
      ["gross", "net", "vat", "delivery", "discount", "meat", "services", "extras"].forEach(k => { s[k] += m[k]; });
      if (m.profit == null) s.profitKnown = false; else { s.profit += m.profit; s.cogs += m.cogs; }
      s.kg += (o.totals && o.totals.kg) || 0;
    });
    Object.keys(s).forEach(k => { if (typeof s[k] === "number") s[k] = r2(s[k]); });
    if (!s.profitKnown) { s.profit = null; s.cogs = null; }
    s.aov = s.orders ? r2(s.gross / s.orders) : 0;
    s.margin = s.profit != null && s.net ? r2(s.profit / s.net * 100) : null;
    s.customers = new Set(ok.map(o => o.user && o.user.phone).filter(Boolean)).size;
    return s;
  }
  const delta = (a, b) => b ? r2((a - b) / Math.abs(b) * 100) : (a ? 100 : 0);

  /* مؤشرات الفترة الحالية مقابل السابقة */
  function kpis(days) {
    const all = orders(), c = costs();
    const cur = summary(all.filter(o => inRange(o, period(days, 0))), c);
    const prev = summary(all.filter(o => inRange(o, period(days, 1))), c);
    return { cur, prev, d: { gross: delta(cur.gross, prev.gross), orders: delta(cur.orders, prev.orders), aov: delta(cur.aov, prev.aov), profit: cur.profit != null && prev.profit != null ? delta(cur.profit, prev.profit) : null, customers: delta(cur.customers, prev.customers) } };
  }

  /* سلسلة يومية: المبيعات أو عدد الطلبات أو الربح لكل يوم */
  function series(days, offset, metric) {
    const p = period(days, offset || 0), c = costs();
    const buckets = Array.from({ length: days }, () => 0);
    orders().filter(o => valid(o) && inRange(o, p)).forEach(o => {
      const i = Math.floor((o.date - p.start) / DAY); if (i < 0 || i >= days) return;
      buckets[i] += metric === "orders" ? 1 : metric === "profit" ? (metrics(o, c).profit || 0) : (o.totals.total || 0);
    });
    return { values: buckets.map(r2), labels: buckets.map((_, i) => p.start + i * DAY) };
  }

  /* ---------------- التفاصيل ---------------- */
  function breakdown(days) {
    const p = period(days, 0), list = orders().filter(o => valid(o) && inRange(o, p));
    const prod = {}, animal = {}, pay = {}, city = {}, slot = {}, week = [0, 0, 0, 0, 0, 0, 0], svc = { marinade: 0, skewer: 0, vacuum: 0 }, mar = {};
    let advisorSales = 0, lineCount = 0, totalBase = 0;
    list.forEach(o => {
      const pk = (o.payment && o.payment.k) || "other";
      pay[pk] = pay[pk] || { n: 0, v: 0 }; pay[pk].n++; pay[pk].v += o.totals.total;
      const ck = (o.address && o.address.city) || "—"; city[ck] = (city[ck] || 0) + o.totals.total;
      if (o.slot && o.slot.h != null) slot[o.slot.h] = (slot[o.slot.h] || 0) + 1;
      week[new Date(o.date).getDay()] += o.totals.total;
      const has = { marinade: 0, skewer: 0, vacuum: 0 };
      (o.items || []).forEach(it => {
        const pr = D.byId(it.id), base = it.base || 0, v = it.price || base;
        lineCount++; totalBase += v;
        const e = prod[it.id] = prod[it.id] || { id: it.id, v: 0, kg: 0, qty: 0 }; e.v += v; if (it.kg) e.kg += it.kg; else e.qty += it.qty || 1;
        const ak = pr ? pr.animal : "extra"; animal[ak] = (animal[ak] || 0) + v;
        if (it.src === "advisor") advisorSales += v;
        (it.adds || []).forEach(a => { if (has[a.k] != null) has[a.k] = 1; });
        if (it.opts && it.opts.marinade) mar[it.opts.marinade] = (mar[it.opts.marinade] || 0) + (it.kg || 0);
      });
      Object.keys(has).forEach(k => { svc[k] += has[k]; });
    });
    const top = Object.values(prod).sort((a, b) => b.v - a.v);
    return { count: list.length, top, animal, pay, city, slot, week, svc, mar, advisorShare: totalBase ? r2(advisorSales / totalBase * 100) : 0, lineCount };
  }
  function statusCounts() {
    const c = { placed: 0, cutting: 0, onway: 0, done: 0, cancelled: 0 };
    orders().forEach(o => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }

  /* ---------------- العملاء (من الطلبات) ---------------- */
  function customers() {
    const m = {};
    orders().forEach(o => {
      const u = o.user || {}, k = u.phone || "guest-" + o.id;
      const c = m[k] = m[k] || { phone: u.phone || "", name: u.name || "", orders: 0, spent: 0, last: 0, first: o.date, city: (o.address && o.address.city) || "", demo: o.demo };
      c.orders++; if (valid(o)) c.spent += o.totals.total; c.last = Math.max(c.last, o.date); c.first = Math.min(c.first, o.date);
      if (!c.name && u.name) c.name = u.name;
    });
    return Object.values(m).map(c => Object.assign(c, { spent: r2(c.spent) })).sort((a, b) => b.last - a.last);
  }

  /* ---------------- بيانات تجريبية للعرض ----------------
     90 يوماً من الطلبات على المنتجات والأسعار الحالية، بأسماء «عميل تجريبي»
     واضحة. تُحفظ منفصلة وتُحذف بزر واحد. */
  function seed() {
    let s = 20260923;
    const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    const pick = a => a[Math.floor(rnd() * a.length)];
    const live = D.PRODUCTS.filter(p => !p.hidden);
    const kgP = live.filter(p => p.sold === "kg"), car = live.filter(p => p.sold === "carcass"), ext = live.filter(p => p.sold === "piece");
    const cities = C.cities_ar || C.cities;
    const people = Array.from({ length: 24 }, (_, i) => ({ name: "عميل تجريبي " + String(i + 1).padStart(2, "0"), phone: "5" + String(Math.floor(10000000 + rnd() * 89999999)), city: pick(cities) }));
    const pays = ["mada", "mada", "applepay", "applepay", "card", "tamara", "cod", "cod"];
    const now = Date.now(), out = [];
    for (let d = 89; d >= 0; d--) {
      const t0 = day0(now) - d * DAY, wd = new Date(t0).getDay();
      /* نمو تدريجي + ذروة الخميس والجمعة */
      const base = 1.2 + (89 - d) / 89 * 2.2 + (wd === 4 || wd === 5 ? 2 : 0);
      const n = Math.max(0, Math.round(base + (rnd() - .5) * 2.4));
      for (let j = 0; j < n; j++) {
        const lines = [];
        const kind = rnd();
        if (kind < .16 && car.length) {
          const p = pick(car), sz = pick(p.sizes);
          lines.push({ id: p.id, qty: 1, opts: { size: sz.k, part: p.parts ? p.parts[0].k : undefined, style: pick(D.STYLES).k, vacuum: rnd() < .3 }, src: rnd() < .45 ? "advisor" : "" });
        } else {
          const m = 1 + Math.floor(rnd() * 3);
          for (let q = 0; q < m; q++) {
            const p = pick(kgP), prep = pick(p.preps);
            const o = { prep };
            if (rnd() < .35) o.marinade = pick(["classic", "hot", "herb", "yogurt"]);
            if (D.PREPS[prep] && D.PREPS[prep].skew && rnd() < .4) o.skewer = true;
            if (rnd() < .15) o.vacuum = true;
            lines.push({ id: p.id, kg: pick([.5, 1, 1, 1.5, 2, 2, 3, 4]), opts: o, src: rnd() < .4 ? "advisor" : "" });
          }
        }
        if (ext.length && rnd() < .45) lines.push({ id: pick(ext).id, qty: 1 + Math.floor(rnd() * 2), opts: {}, src: "" });
        lines.forEach(l => { l.key = l.id + "|" + JSON.stringify(l.opts); if (l.opts.part === undefined) delete l.opts.part; });
        const coupon = rnd() < .12 ? Object.keys(C.coupons || {})[0] || null : null;
        const t = S.cart.totals(lines, coupon);
        const items = lines.map(l => { const p = D.byId(l.id), b = S.breakdown(l); return { id: l.id, name: p.name, sold: p.sold, kg: l.kg, qty: l.qty, opts: l.opts, unit: S.unitPrice(p, l.opts), base: b.base, adds: b.adds, price: b.total, src: l.src }; });
        const who = pick(people), win = pick(C.windows), date = t0 + (9 + Math.floor(rnd() * 13)) * 36e5 + Math.floor(rnd() * 36e5);
        if (date > now) continue;
        const age = (now - date) / DAY;
        const status = rnd() < .06 ? "cancelled" : age > 2 ? "done" : age > 1 ? pick(["onway", "done"]) : pick(["placed", "cutting", "onway"]);
        const flow = ["placed", "cutting", "onway", "done"], log = [{ s: "placed", t: date }];
        if (status === "cancelled") log.push({ s: "cancelled", t: date + 18e5 });
        else flow.slice(1, flow.indexOf(status) + 1).forEach((st, i) => log.push({ s: st, t: date + (i + 1) * 3 * 36e5 }));
        const pk = pick(pays), pm = (C.payments || []).find(x => x.k === pk) || { k: pk, n: pk };
        const dd = new Date(date);
        out.push({ id: "DM" + String(dd.getFullYear()).slice(2) + String(dd.getMonth() + 1).padStart(2, "0") + String(dd.getDate()).padStart(2, "0") + "-" + (1000 + Math.floor(rnd() * 9000)),
          date, items, totals: t, coupon, status, log, user: { name: who.name, phone: who.phone },
          address: { label: "المنزل", city: who.city, district: "حي تجريبي", street: "شارع تجريبي", building: String(1000 + Math.floor(rnd() * 8999)) },
          slot: { date: day0(date) + DAY, h: win.h, time: win.l, dayLabel: "", dateLabel: "" }, payment: { k: pm.k, n: pm.n } });
      }
    }
    write(K.demo, out);
    const c = costs(); if (c.pct == null) setCost({ pct: 68, assumed: true });
    return out.length;
  }
  function clearDemo() {
    try { localStorage.removeItem(K.demo); } catch (e) { }
    const c = costs(); if (c.assumed) setCost({ pct: null, assumed: false });
  }

  return { orders, get, hasDemo, setStatus, remove, costs, setCost, pctOf, metrics, period, summary, kpis, series, breakdown, statusCounts, customers, seed, clearDemo, DAY };
})();
