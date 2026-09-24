/* =========================================================
   نُضْج — أرقام لوحة التحكم (مثل Shopify Analytics)
   المصادر:
   - الطلبات: nudj_orders (طلبات هذا الجهاز) + nudj_demo_orders (بيانات عرض منفصلة)
   - الزيارات: nudj_track (جلسات حقيقية من track.js) + nudj_demo_traffic (مجمّعة يومياً للعرض)
   - التكلفة: nudj_adm_costs (في هذا المتصفح فقط، لا تُنشر)
   كل الدوال تأخذ «فترة» من range(): اليوم، أمس، 7/30/90 يوماً، 12 شهراً — مع الفترة السابقة للمقارنة.
   ========================================================= */
window.NUDJ_STATS = (function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE;
  const C = D.CONFIG;
  const K = { demo: "nudj_demo_orders", traffic: "nudj_demo_traffic", track: "nudj_track", cost: "nudj_adm_costs" };
  const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const r2 = n => Math.round(n * 100) / 100;
  const HOUR = 36e5, DAY = 864e5;
  const day0 = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const inc = (m, k, v) => { m[k] = (m[k] || 0) + (v == null ? 1 : v); };
  const valid = o => o.status !== "cancelled";

  /* ---------------- الفترات ---------------- */
  const RANGES = { today: "اليوم", yesterday: "أمس", "7": "آخر 7 أيام", "30": "آخر 30 يوماً", "90": "آخر 90 يوماً", "365": "آخر 12 شهراً" };
  function range(key) {
    key = RANGES[key] ? String(key) : "30";
    const t0 = day0(Date.now());
    let start, end, gran;
    if (key === "today") { start = t0; end = t0 + DAY; gran = "hour"; }
    else if (key === "yesterday") { start = t0 - DAY; end = t0; gran = "hour"; }
    else { const n = +key; end = t0 + DAY; start = end - n * DAY; gran = n > 120 ? "week" : "day"; }
    const len = end - start;
    /* اليوم يُقارن بأمس حتى نفس الساعة (مثل Shopify)، وباقي الفترات بالفترة المماثلة قبلها */
    const prev = key === "today" ? { start: start - DAY, end: Date.now() - DAY } : { start: start - len, end: start };
    return { key, start, end, len, gran, hourly: gran === "hour", label: RANGES[key], prev };
  }
  const inP = (t, p) => t >= p.start && t < p.end;
  /* خانات السلسلة الزمنية */
  function buckets(p) {
    const step = p.gran === "hour" ? HOUR : p.gran === "week" ? 7 * DAY : DAY;
    const n = Math.ceil((p.end - p.start) / step);
    return { step, n, at: t => Math.floor((t - p.start) / step), labels: Array.from({ length: n }, (_, i) => p.start + i * step) };
  }

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
  /* الأسعار شاملة الضريبة: الصافي = المبلغ ÷ (1 + الضريبة). التكلفة نسبة من صافي سعر البيع، والتوصيل يمر للمندوب */
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
    return { gross: t.total || 0, net, vat: t.vat || 0, delivery: t.delivery || 0, discount: t.discount || 0, meat: t.meat || 0, services: t.services || 0, extras: t.extras || 0, cogs: known ? r2(cogs) : null, profit: known ? r2(net - (t.delivery || 0) / v - cogs) : null };
  }

  /* أول طلب لكل عميل (لتمييز الجديد من العائد) */
  function firstOrders(all) {
    const f = {};
    all.filter(valid).forEach(o => { const ph = o.user && o.user.phone; if (!ph) return; if (f[ph] == null || o.date < f[ph]) f[ph] = o.date; });
    return f;
  }
  function summary(list, c, all) {
    c = c || costs();
    const ok = list.filter(valid), first = firstOrders(all || orders());
    const s = { orders: ok.length, all: list.length, cancelled: list.length - ok.length, gross: 0, net: 0, vat: 0, delivery: 0, discount: 0, meat: 0, services: 0, extras: 0, cogs: 0, profit: 0, kg: 0, profitKnown: true };
    const cust = new Set(), ret = new Set();
    ok.forEach(o => {
      const m = metrics(o, c);
      ["gross", "net", "vat", "delivery", "discount", "meat", "services", "extras"].forEach(k => { s[k] += m[k]; });
      if (m.profit == null) s.profitKnown = false; else { s.profit += m.profit; s.cogs += m.cogs; }
      s.kg += (o.totals && o.totals.kg) || 0;
      const ph = o.user && o.user.phone; if (ph) { cust.add(ph); if (first[ph] < o.date) ret.add(ph); }
    });
    Object.keys(s).forEach(k => { if (typeof s[k] === "number") s[k] = r2(s[k]); });
    if (!s.profitKnown) { s.profit = null; s.cogs = null; }
    s.aov = s.orders ? r2(s.gross / s.orders) : 0;
    s.margin = s.profit != null && s.net ? r2(s.profit / s.net * 100) : null;
    s.customers = cust.size; s.returning = ret.size; s.newCustomers = cust.size - ret.size;
    s.returningRate = cust.size ? r2(ret.size / cust.size * 100) : 0;
    s.cancelRate = list.length ? r2(s.cancelled / list.length * 100) : 0;
    return s;
  }
  /* لا نسبة تغيّر إن لم توجد بيانات في الفترة السابقة (بدل «100٪» مضللة) */
  const delta = (a, b) => a == null || b == null || !b ? null : r2((a - b) / Math.abs(b) * 100);

  /* ---------------- الزيارات ---------------- */
  /* نسبة الجلسات لكل ساعة (لتوزيع أيام العرض المجمّعة على الساعات) — ذروة المساء */
  const HW = [.4, .2, .1, .1, .1, .2, .5, 1, 1.6, 2, 2.2, 2.4, 2.6, 2.4, 2.2, 2.4, 3, 3.6, 4.2, 5, 5.4, 5, 3.6, 1.6];
  const HWS = HW.reduce((a, b) => a + b, 0);
  function traffic(p) {
    const T = { sessions: 0, visitors: 0, pv: 0, bounce: 0, viewed: 0, carted: 0, checkout: 0, bought: 0, coVal: 0, abandonedVal: 0,
      dev: {}, src: {}, land: {}, city: {}, adv: { start: 0, plan: 0, cart: 0 }, occ: {}, searches: {}, zero: {}, views: {}, carts: {} };
    const vids = new Set();
    const tr = read(K.track, null);
    if (tr) (tr.sessions || []).forEach(s => {
      if (!inP(s.t, p)) return;
      T.sessions++; vids.add(tr.vid); T.pv += s.pv || 0; if ((s.pv || 0) <= 1) T.bounce++;
      if ((s.views || []).length) T.viewed++; if (s.cart) T.carted++; if (s.co) T.checkout++; if (s.buy) T.bought++;
      if (s.co && !s.buy) T.abandonedVal += s.coVal || 0;
      inc(T.dev, s.dev || "desktop"); inc(T.src, s.src || "direct"); inc(T.land, s.land || "index.html"); if (s.city) inc(T.city, s.city);
      const a = s.adv || {}; T.adv.start += a.start || 0; T.adv.plan += a.plan || 0; T.adv.cart += a.cart || 0; if (a.occ) inc(T.occ, a.occ);
      (s.search || []).forEach(q => { inc(T.searches, q.q); if (!q.n) inc(T.zero, q.q); });
      (s.views || []).forEach(id => inc(T.views, id)); (s.cartIds || []).forEach(id => inc(T.carts, id));
    });
    let demoVisitors = 0;
    read(K.traffic, []).forEach(d => {
      const f = fracIn(d.d, p); if (!f) return;
      const k = x => Math.round((x || 0) * f);
      T.sessions += k(d.s); demoVisitors += k(d.v); T.pv += k(d.pv); T.bounce += k(d.bn); T.viewed += k(d.pview); T.carted += k(d.cart); T.checkout += k(d.co); T.bought += k(d.buy); T.abandonedVal += (d.abVal || 0) * f;
      [["dev", d.dev], ["src", d.src], ["land", d.land], ["city", d.city], ["occ", d.occ], ["searches", d.srch], ["zero", d.zero], ["views", d.views], ["carts", d.carts]].forEach(([key, m]) => Object.keys(m || {}).forEach(x => inc(T[key], x, k(m[x]))));
      T.adv.start += k(d.adv && d.adv.start); T.adv.plan += k(d.adv && d.adv.plan); T.adv.cart += k(d.adv && d.adv.cart);
    });
    T.visitors = vids.size + demoVisitors;
    T.conv = T.sessions ? r2(T.bought / T.sessions * 100) : 0;
    T.bounceRate = T.sessions ? r2(T.bounce / T.sessions * 100) : 0;
    T.pps = T.sessions ? r2(T.pv / T.sessions) : 0;
    T.abandoned = Math.max(0, T.checkout - T.bought); T.abandonedVal = r2(T.abandonedVal);
    return T;
  }
  /* نسبة يوم العرض داخل الفترة (اليوم الجاري: حتى الساعة الحالية) */
  function fracIn(d, p) {
    if (d + DAY <= p.start || d >= p.end) return 0;
    const a = Math.max(d, p.start), b = Math.min(d + DAY, p.end, d === day0(Date.now()) ? Date.now() : d + DAY);
    if (b <= a) return 0;
    const h0 = Math.floor((a - d) / HOUR), h1 = Math.ceil((b - d) / HOUR);
    let w = 0; for (let h = h0; h < h1 && h < 24; h++) w += HW[h];
    return w / HWS;
  }

  /* ---------------- المؤشرات والسلاسل ---------------- */
  function kpis(p) {
    const all = orders(), c = costs();
    const cur = summary(all.filter(o => inP(o.date, p)), c, all), prev = summary(all.filter(o => inP(o.date, p.prev)), c, all);
    const t = traffic(p), tp = traffic(p.prev);
    return { cur, prev, t, tp, d: { gross: delta(cur.gross, prev.gross), orders: delta(cur.orders, prev.orders), aov: delta(cur.aov, prev.aov), profit: cur.profit != null && prev.profit != null ? delta(cur.profit, prev.profit) : null,
      customers: delta(cur.customers, prev.customers), returningRate: delta(cur.returningRate, prev.returningRate), sessions: delta(t.sessions, tp.sessions), conv: delta(t.conv, tp.conv), visitors: delta(t.visitors, tp.visitors) } };
  }
  /* metric: sales | orders | profit | aov | sessions | conv | new | returning */
  function series(p, metric, prevToo) {
    const run = q => {
      const b = buckets(q), v = Array(b.n).fill(0), cnt = Array(b.n).fill(0), c = costs();
      if (metric === "sessions" || metric === "conv") {
        const ses = Array(b.n).fill(0), buy = Array(b.n).fill(0);
        const tr = read(K.track, null);
        if (tr) (tr.sessions || []).forEach(s => { if (!inP(s.t, q)) return; const i = b.at(s.t); ses[i]++; if (s.buy) buy[i]++; });
        read(K.traffic, []).forEach(d => {
          if (d.d + DAY <= q.start || d.d >= q.end) return;
          if (q.gran === "hour") for (let h = 0; h < 24; h++) { const t = d.d + h * HOUR; if (!inP(t, q) || (d.d === day0(Date.now()) && t > Date.now())) continue; const i = b.at(t); ses[i] += d.s * HW[h] / HWS; buy[i] += d.buy * HW[h] / HWS; }
          else { const i = b.at(Math.max(d.d, q.start)); if (i >= 0 && i < b.n) { ses[i] += d.s; buy[i] += d.buy; } }
        });
        return { values: ses.map((x, i) => metric === "conv" ? (x ? r2(buy[i] / x * 100) : 0) : Math.round(x)), labels: b.labels };
      }
      const all = orders(), first = metric === "new" || metric === "returning" ? firstOrders(all) : null;
      all.filter(o => valid(o) && inP(o.date, q)).forEach(o => {
        const i = b.at(o.date); if (i < 0 || i >= b.n) return;
        if (metric === "orders") v[i]++;
        else if (metric === "profit") v[i] += metrics(o, c).profit || 0;
        else if (metric === "aov") { v[i] += o.totals.total; cnt[i]++; }
        else if (first) { const ph = o.user && o.user.phone, isRet = ph && first[ph] < o.date; if ((metric === "returning") === !!isRet) v[i]++; }
        else v[i] += o.totals.total || 0;
      });
      return { values: v.map((x, i) => metric === "aov" ? (cnt[i] ? r2(x / cnt[i]) : 0) : r2(x)), labels: b.labels };
    };
    const cur = run(p);
    /* خط المقارنة بنفس عدد الخانات ونفس الدقة (ساعة/يوم/أسبوع) — لليوم: كامل يوم أمس */
    if (prevToo) cur.prev = run({ start: p.prev.start, end: p.prev.start + p.len, gran: p.gran }).values;
    cur.gran = p.gran;
    return cur;
  }

  /* ملخص المبيعات بأسلوب Shopify: إجمالي ← خصومات ← مرتجعات ← صافي + توصيل + ضرائب = المبيعات */
  function salesBreakdown(p) {
    const v = 1 + (C.vat || 0), b = { gross: 0, discounts: 0, returns: 0, net: 0, shipping: 0, taxes: 0, total: 0 };
    orders().filter(o => inP(o.date, p)).forEach(o => {
      const t = o.totals || {}, goods = ((t.meat || 0) + (t.services || 0) + (t.extras || 0)) / v;
      b.gross += goods; b.discounts += (t.discount || 0) / v;
      if (!valid(o)) { b.returns += goods - (t.discount || 0) / v; return; }
      b.shipping += (t.delivery || 0) / v; b.taxes += t.vat || 0;
    });
    b.net = b.gross - b.discounts - b.returns; b.total = b.net + b.shipping + b.taxes;
    Object.keys(b).forEach(k => { b[k] = r2(b[k]); });
    return b;
  }

  /* تفاصيل الطلبات في الفترة */
  function breakdown(p) {
    const list = orders().filter(o => valid(o) && inP(o.date, p)), c = costs();
    const prod = {}, animal = {}, pay = {}, city = {}, slot = {}, week = [0, 0, 0, 0, 0, 0, 0], hours = Array(24).fill(0), svc = { marinade: 0, skewer: 0, vacuum: 0 }, mar = {}, disc = {};
    let advisorSales = 0, totalBase = 0;
    list.forEach(o => {
      const pk = (o.payment && o.payment.k) || "other";
      pay[pk] = pay[pk] || { n: 0, v: 0 }; pay[pk].n++; pay[pk].v += o.totals.total;
      const ck = (o.address && o.address.city) || "—"; city[ck] = city[ck] || { n: 0, v: 0 }; city[ck].n++; city[ck].v += o.totals.total;
      if (o.slot && o.slot.h != null) inc(slot, o.slot.h);
      const dt = new Date(o.date); week[dt.getDay()] += o.totals.total; hours[dt.getHours()] += o.totals.total;
      const cp = o.totals.coupon || o.coupon; if (cp) { disc[cp] = disc[cp] || { n: 0, d: 0, v: 0 }; disc[cp].n++; disc[cp].d += o.totals.discount || 0; disc[cp].v += o.totals.total; }
      const has = { marinade: 0, skewer: 0, vacuum: 0 };
      (o.items || []).forEach(it => {
        const pr = D.byId(it.id), v = it.price || it.base || 0, pct = pctOf(it.id, c);
        totalBase += v;
        const e = prod[it.id] = prod[it.id] || { id: it.id, v: 0, kg: 0, qty: 0, orders: 0, profit: 0, profitKnown: true };
        e.v += v; e.orders++; if (it.kg) e.kg += it.kg; else e.qty += it.qty || 1;
        if (pct == null) e.profitKnown = false; else e.profit += v / (1 + (C.vat || 0)) * (1 - pct / 100);
        inc(animal, pr ? pr.animal : "extra", v);
        if (it.src === "advisor") advisorSales += v;
        (it.adds || []).forEach(a => { if (has[a.k] != null) has[a.k] = 1; });
        if (it.opts && it.opts.marinade) inc(mar, it.opts.marinade, it.kg || 0);
      });
      Object.keys(has).forEach(k => { svc[k] += has[k]; });
    });
    const top = Object.values(prod).map(e => Object.assign(e, { profit: e.profitKnown ? r2(e.profit) : null })).sort((a, b) => b.v - a.v);
    return { count: list.length, top, animal, pay, city, slot, week, hours, svc, mar, disc, advisorSales: r2(advisorSales), advisorShare: totalBase ? r2(advisorSales / totalBase * 100) : 0 };
  }
  function statusCounts() { const c = { placed: 0, cutting: 0, onway: 0, done: 0, cancelled: 0 }; orders().forEach(o => { inc(c, o.status); }); return c; }

  /* ---------------- العملاء ---------------- */
  function customers() {
    const m = {};
    orders().forEach(o => {
      const u = o.user || {}, k = u.phone || "guest-" + o.id;
      const c = m[k] = m[k] || { phone: u.phone || "", name: u.name || "", orders: 0, spent: 0, last: 0, first: o.date, city: (o.address && o.address.city) || "", demo: o.demo };
      if (valid(o)) { c.orders++; c.spent += o.totals.total; }
      c.last = Math.max(c.last, o.date); c.first = Math.min(c.first, o.date);
      if (!c.name && u.name) c.name = u.name;
    });
    return Object.values(m).filter(c => c.orders).map(c => Object.assign(c, { spent: r2(c.spent), aov: r2(c.spent / c.orders) })).sort((a, b) => b.last - a.last);
  }
  /* شرائح العملاء (RFM مبسّط) */
  const SEG = [
    { k: "loyal", n: "مخلصون", d: "4 طلبات فأكثر وآخر طلب خلال 60 يوماً", c: "#1F8A70" },
    { k: "returning", n: "عائدون", d: "طلبان أو أكثر وآخر طلب خلال 60 يوماً", c: "#3E6FD8" },
    { k: "new", n: "جدد", d: "طلب واحد خلال آخر 30 يوماً", c: "#E7A33E" },
    { k: "risk", n: "معرّضون للفقد", d: "آخر طلب قبل 60–120 يوماً", c: "#D24C7B" },
    { k: "lost", n: "غير نشطين", d: "لم يطلبوا منذ أكثر من 120 يوماً", c: "#9AA3AB" },
    { k: "one", n: "طلب واحد قديم", d: "طلب واحد قبل أكثر من 30 يوماً", c: "#C9C9C9" }
  ];
  function segOf(c) {
    const age = (Date.now() - c.last) / DAY;
    if (age > 120) return "lost"; if (age > 60) return "risk";
    if (c.orders >= 4) return "loyal"; if (c.orders >= 2) return "returning";
    return age <= 30 ? "new" : "one";
  }
  function segments() {
    const out = {}; SEG.forEach(s => { out[s.k] = { cnt: 0, v: 0 }; });
    customers().forEach(c => { const k = segOf(c); out[k].cnt++; out[k].v += c.spent; });
    return SEG.map(s => Object.assign({}, s, { cnt: out[s.k].cnt, v: r2(out[s.k].v) }));
  }
  /* الأفواج: عملاء كل شهر (حسب أول طلب) ونسبة من عاد منهم بعد شهر، شهرين، ثلاثة */
  function cohorts() {
    const all = orders().filter(valid), first = firstOrders(all), rows = {};
    const mk = t => { const d = new Date(t); return d.getFullYear() * 12 + d.getMonth(); };
    Object.keys(first).forEach(ph => { const m = mk(first[ph]); (rows[m] = rows[m] || { m, users: new Set(), back: [new Set(), new Set(), new Set(), new Set()] }).users.add(ph); });
    all.forEach(o => { const ph = o.user && o.user.phone; if (!ph) return; const m0 = mk(first[ph]), off = mk(o.date) - m0; if (off >= 1 && off <= 4) rows[m0].back[off - 1].add(ph); });
    const nowM = mk(Date.now());
    return Object.values(rows).sort((a, b) => a.m - b.m).slice(-7).map(r => ({ label: new Date(Math.floor(r.m / 12), r.m % 12, 1).getTime(), size: r.users.size, pct: r.back.map((s, i) => r.m + i + 1 > nowM ? null : r2(s.size / r.users.size * 100)) }));
  }

  /* ---------------- المنتجات والمخزون ---------------- */
  function productStats(p) {
    const b = breakdown(p), t = traffic(p), out = {};
    b.top.forEach(e => { out[e.id] = Object.assign({ views: 0, carts: 0 }, e); });
    Object.keys(t.views).forEach(id => { out[id] = out[id] || { id, v: 0, kg: 0, qty: 0, orders: 0, profit: null }; out[id].views = t.views[id]; });
    Object.keys(t.carts).forEach(id => { out[id] = out[id] || { id, v: 0, kg: 0, qty: 0, orders: 0, profit: null, views: 0 }; out[id].carts = t.carts[id]; });
    return Object.values(out).map(e => Object.assign(e, { viewToCart: e.views ? r2(Math.min(100, (e.carts || 0) / e.views * 100)) : null, cartToBuy: e.carts ? r2(Math.min(100, e.orders / e.carts * 100)) : null })).sort((a, b) => b.v - a.v);
  }
  /* سرعة البيع لكل منتج (آخر 30 يوماً) وأيام التغطية للمخزون */
  function inventory(products) {
    const p = range("30"), b = breakdown(p), sold = {};
    b.top.forEach(e => { sold[e.id] = e; });
    return products.map((pr, i) => {
      const s = sold[pr.id], units = s ? (pr.sold === "kg" ? s.kg : s.qty) : 0, perDay = r2(units / 30);
      const stock = pr.stock == null || pr.stock === "" ? null : +pr.stock;
      const cover = stock == null ? null : perDay ? Math.floor(stock / perDay) : stock > 0 ? Infinity : 0;
      const low = pr.lowAt == null || pr.lowAt === "" ? null : +pr.lowAt;
      const status = stock == null ? "untracked" : stock <= 0 ? "out" : (low != null && stock <= low) || (cover !== Infinity && cover < 4) ? "low" : "ok";
      return { p: pr, i, units: r2(units), perDay, stock, cover, status, value: stock ? r2(stock * (pr.sold === "carcass" ? pr.sizes[0].p : pr.price)) : 0 };
    });
  }

  /* ---------------- النشاط الأخير ---------------- */
  function activity(n) {
    const ev = [];
    orders().slice(0, 30).forEach(o => ev.push({ t: o.date, k: o.status === "cancelled" ? "cancel" : "order", o }));
    const tr = read(K.track, null);
    if (tr) (tr.sessions || []).slice(-40).forEach(s => {
      if (s.co && !s.buy) ev.push({ t: s.last, k: "abandon", v: s.coVal });
      (s.search || []).forEach(q => ev.push({ t: s.last, k: q.n ? "search" : "zero", q: q.q }));
      if ((s.adv || {}).plan) ev.push({ t: s.last, k: "advisor", occ: s.adv.occ });
    });
    return ev.sort((a, b) => b.t - a.t).slice(0, n || 12);
  }

  /* ---------------- بيانات تجريبية للعرض ----------------
     180 يوماً من الطلبات على المنتجات والأسعار الحالية (نمو تدريجي، ذروة الخميس والجمعة)،
     عملاء «عميل تجريبي 001…» بعضهم يعود، وزيارات يومية مجمّعة متسقة مع الطلبات. */
  function seed() {
    let sd = 20260924;
    const rnd = () => { sd = (sd * 1664525 + 1013904223) % 4294967296; return sd / 4294967296; };
    const pick = a => a[Math.floor(rnd() * a.length)];
    const wpick = m => { const ks = Object.keys(m), tot = ks.reduce((t, k) => t + m[k], 0); let x = rnd() * tot; for (const k of ks) { x -= m[k]; if (x <= 0) return k; } return ks[0]; };
    const live = D.PRODUCTS.filter(p => !p.hidden);
    const kgP = live.filter(p => p.sold === "kg"), car = live.filter(p => p.sold === "carcass"), ext = live.filter(p => p.sold === "piece");
    const popular = {}; kgP.forEach(p => { popular[p.id] = /rack|shoulder|leg|ribeye|mince|liver|cubes|bone/.test(p.id) ? 3 : 1; });
    const cities = C.cities_ar || C.cities, cityW = {}; cities.forEach((c, i) => { cityW[c] = [40, 22, 12, 10, 9, 7][i] || 5; });
    const people = [];
    const newPerson = () => { const p = { name: "عميل تجريبي " + String(people.length + 1).padStart(3, "0"), phone: "5" + String(Math.floor(10000000 + rnd() * 89999999)), city: wpick(cityW) }; people.push(p); return p; };
    const payW = { mada: 30, applepay: 28, card: 12, tamara: 12, cod: 18 };
    const now = Date.now(), out = [], traf = [];
    const DAYS = 180;
    for (let d = DAYS - 1; d >= 0; d--) {
      const t0 = day0(now) - d * DAY, wd = new Date(t0).getDay();
      const base = 1 + (DAYS - 1 - d) / (DAYS - 1) * 3.2 + (wd === 4 || wd === 5 ? 2.2 : 0);
      const n = Math.max(0, Math.round(base + (rnd() - .5) * 2.6));
      let dayOrders = 0, abVal = 0;
      for (let j = 0; j < n; j++) {
        const lines = [], adv = rnd() < .42;
        if (rnd() < .15 && car.length) {
          const p = pick(car), sz = pick(p.sizes);
          lines.push({ id: p.id, qty: 1, opts: Object.assign({ size: sz.k, style: pick(D.STYLES).k, vacuum: rnd() < .3 }, p.parts ? { part: p.parts[0].k } : {}), src: adv ? "advisor" : "" });
        } else {
          const m = 1 + Math.floor(rnd() * 3);
          for (let q = 0; q < m; q++) {
            const p = D.byId(wpick(popular)), prep = pick(p.preps), o = { prep };
            if (rnd() < .35) o.marinade = wpick({ classic: 3, hot: 4, herb: 2, yogurt: 1 });
            if (D.PREPS[prep] && D.PREPS[prep].skew && rnd() < .4) o.skewer = true;
            if (rnd() < .15) o.vacuum = true;
            lines.push({ id: p.id, kg: pick([.5, 1, 1, 1.5, 2, 2, 3, 4]), opts: o, src: adv ? "advisor" : "" });
          }
        }
        if (ext.length && rnd() < .45) lines.push({ id: pick(ext).id, qty: 1 + Math.floor(rnd() * 2), opts: {}, src: "" });
        lines.forEach(l => { l.key = l.id + "|" + JSON.stringify(l.opts); });
        const coupon = rnd() < .12 ? Object.keys(C.coupons || {})[0] || null : null;
        const t = S.cart.totals(lines, coupon);
        const items = lines.map(l => { const p = D.byId(l.id), b = S.breakdown(l); return { id: l.id, name: p.name, sold: p.sold, kg: l.kg, qty: l.qty, opts: l.opts, unit: S.unitPrice(p, l.opts), base: b.base, adds: b.adds, price: b.total, src: l.src }; });
        const who = people.length > 8 && rnd() < .38 ? pick(people) : newPerson(), win = pick(C.windows);
        const date = t0 + (9 + Math.floor(rnd() * 14)) * HOUR + Math.floor(rnd() * HOUR);
        if (date > now) { abVal += t.total; continue; }
        const age = (now - date) / DAY;
        const status = rnd() < .05 ? "cancelled" : age > 2 ? "done" : age > 1 ? pick(["onway", "done"]) : pick(["placed", "placed", "cutting", "onway"]);
        const flow = ["placed", "cutting", "onway", "done"], log = [{ s: "placed", t: date }];
        if (status === "cancelled") log.push({ s: "cancelled", t: date + 18e5 });
        else flow.slice(1, flow.indexOf(status) + 1).forEach((st, i) => log.push({ s: st, t: date + (i + 1) * 3 * HOUR }));
        const pk = wpick(payW), pm = (C.payments || []).find(x => x.k === pk) || { k: pk, n: pk }, dd = new Date(date);
        out.push({ id: "DM" + String(dd.getFullYear()).slice(2) + String(dd.getMonth() + 1).padStart(2, "0") + String(dd.getDate()).padStart(2, "0") + "-" + (1000 + Math.floor(rnd() * 9000)),
          date, items, totals: t, coupon, status, log, user: { name: who.name, phone: who.phone },
          address: { label: "المنزل", city: who.city, district: "حي تجريبي", street: "شارع تجريبي", building: String(1000 + Math.floor(rnd() * 8999)) },
          slot: { date: day0(date) + DAY, h: win.h, time: win.l, dayLabel: "", dateLabel: "" }, payment: { k: pm.k, n: pm.n } });
        dayOrders++;
      }
      /* زيارات اليوم: معدل تحويل 2.3–3.6٪ وقمع متسق مع الطلبات */
      const conv = .023 + rnd() * .013, s = Math.max(dayOrders * 12, Math.round(dayOrders / conv + 30 + rnd() * 25));
      const co = Math.round(dayOrders * (1.7 + rnd() * .5)), cart = Math.round(co * (2 + rnd() * .6)), pview = Math.round(s * (.5 + rnd() * .1));
      const split = (tot, w) => { const o = {}; let left = tot; const ks = Object.keys(w), sum = ks.reduce((a, k) => a + w[k], 0); ks.forEach((k, i) => { const v = i === ks.length - 1 ? left : Math.round(tot * w[k] / sum * (.85 + rnd() * .3)); o[k] = Math.max(0, Math.min(left, v)); left -= o[k]; }); return o; };
      const views = {}, carts = {};
      for (let i = 0; i < Math.min(pview, 400); i++) inc(views, wpick(popular));
      for (let i = 0; i < cart; i++) inc(carts, wpick(popular));
      const advStart = Math.round(s * (.16 + rnd() * .06)), advPlan = Math.round(advStart * (.52 + rnd() * .12)), advCart = Math.round(advPlan * (.36 + rnd() * .1));
      const terms = { "ريش": 6, "كبسة": 5, "جمل": 4, "ستيك": 4, "مفروم": 3, "كبدة": 3, "ذبيحة": 3, "فحم": 2, "تندرلوين": 2, "مندي": 2 }, zeroT = { "دجاج": 3, "سمك": 2, "نقانق": 1, "كوارع": 1, "روبيان": 1 };
      const ns = Math.round(s * .06), srch = {}, zero = {};
      for (let i = 0; i < ns; i++) { if (rnd() < .18) { const z = wpick(zeroT); inc(zero, z); inc(srch, z); } else inc(srch, wpick(terms)); }
      traf.push({ d: t0, s, v: Math.round(s * .82), pv: Math.round(s * (3.1 + rnd() * .8)), bn: Math.round(s * (.34 + rnd() * .08)), pview, cart, co, buy: dayOrders, abVal: r2((co - dayOrders) * (330 + rnd() * 80)),
        dev: split(s, { mobile: 72, desktop: 22, tablet: 6 }), src: split(s, { instagram: 27, direct: 24, search: 18, snapchat: 12, tiktok: 8, whatsapp: 7, x: 4 }),
        land: split(s, { "index.html": 44, "advisor.html": 15, "shop.html": 11, "lamb-rack.html": 7, "beef-ribeye.html": 5, "cuts.html": 5, "lamb-whole.html": 5, "camel.html": 4, "help.html": 4 }),
        city: split(s, cityW), occ: split(advStart, { grill: 34, feast: 30, carcass: 12, steak: 12, weekly: 8, ask: 4 }), adv: { start: advStart, plan: advPlan, cart: advCart }, srch, zero, views, carts });
    }
    const ok = write(K.demo, out) && write(K.traffic, traf);
    const c = costs(); if (c.pct == null) setCost({ pct: 68, assumed: true });
    return ok ? out.length : -1;
  }
  function clearDemo() {
    try { localStorage.removeItem(K.demo); localStorage.removeItem(K.traffic); } catch (e) { }
    const c = costs(); if (c.assumed) setCost({ pct: null, assumed: false });
  }

  return { RANGES, range, orders, get, hasDemo, setStatus, remove, costs, setCost, pctOf, metrics, summary, kpis, series, salesBreakdown, breakdown, traffic, statusCounts,
    customers, SEG, segOf, segments, cohorts, productStats, inventory, activity, seed, clearDemo, DAY };
})();
