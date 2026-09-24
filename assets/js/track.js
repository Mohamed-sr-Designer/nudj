/* =========================================================
   نُضْج — قياس الزيارات (مثل Shopify Analytics)
   جلسة = زيارة تنتهي بعد 30 دقيقة بلا نشاط. نسجّل: الجهاز، المصدر،
   صفحة الهبوط، المدينة، الصفحات، القطع المشاهدة، الإضافة للسلة،
   الوصول للدفع، الشراء، البحث، والمستشار.
   في نسخة العرض تُحفظ في هذا المتصفح (nudj_track) وتقرؤها لوحة التحكم.
   عند الإطلاق: استبدل write() بإرسال للخادم — بقية الكود كما هو.
   ========================================================= */
window.NUDJ_TRACK = (function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE;
  const KEY = "nudj_track", MAX = 800, GAP = 30 * 60e3;
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const write = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { } };
  const now = Date.now();
  const data = read() || { vid: "v" + now.toString(36) + Math.random().toString(36).slice(2, 6), sessions: [] };
  const file = (document.body && document.body.dataset.file) || "index.html";
  if (file === "admin.html") return { ev() { } };

  const device = () => { const w = Math.min(window.innerWidth || 1200, (screen && screen.width) || 9999); return w < 768 ? "mobile" : w < 1100 ? "tablet" : "desktop"; };
  function source() {
    const q = new URLSearchParams(location.search), utm = (q.get("utm_source") || q.get("ref") || "").toLowerCase();
    const map = h => /google|bing|yahoo|duckduckgo|yandex/.test(h) ? "search" : /instagram/.test(h) ? "instagram" : /snapchat|snap/.test(h) ? "snapchat" : /tiktok/.test(h) ? "tiktok"
      : /(^|\.)x\.com|twitter|t\.co/.test(h) ? "x" : /facebook|fb\./.test(h) ? "facebook" : /whatsapp|wa\.me/.test(h) ? "whatsapp" : /youtube|youtu\.be/.test(h) ? "youtube" : "other";
    if (utm) return map(utm);
    if (!document.referrer) return "direct";
    try { const h = new URL(document.referrer).hostname; if (h === location.hostname) return null; return map(h); } catch (e) { return "direct"; }
  }
  let s = data.sessions[data.sessions.length - 1];
  const src = source();
  /* جلسة جديدة: أول زيارة، أو بعد 30 دقيقة، أو قادم من مصدر خارجي جديد */
  if (!s || now - s.last > GAP || (src && src !== "direct" && src !== s.src)) {
    s = { id: "s" + now.toString(36), t: now, last: now, dev: device(), lang: D.lang || "ar", land: file, src: src || "direct", city: (S && S.city) ? S.city.get() : "", pv: 0, pages: [], views: [], cart: 0, cartIds: [], co: 0, coVal: 0, buy: 0, val: 0, adv: {}, search: [] };
    data.sessions.push(s);
  }
  s.last = now; s.pv++;
  if (s.pages.length < 40) s.pages.push(file);
  const pid = document.body && document.body.dataset.product;
  if (pid && s.views.indexOf(pid) < 0) s.views.push(pid);
  const persist = () => { data.sessions = data.sessions.slice(-MAX); write(data); };
  if (file === "checkout.html" && S) { s.co = 1; try { s.coVal = S.cart.totals().total; } catch (e) { } }
  persist();

  /* الإضافة للسلة والشراء: نلف دوال المتجر نفسها */
  if (S && S.cart && S.cart.add) {
    const add0 = S.cart.add;
    S.cart.add = function (id) { const k = add0.apply(this, arguments); if (k) { s.cart = 1; if (s.cartIds.indexOf(id) < 0) s.cartIds.push(id); s.last = Date.now(); persist(); } return k; };
  }
  if (S && S.orders && S.orders.create) {
    const c0 = S.orders.create;
    S.orders.create = function () { const o = c0.apply(this, arguments); if (o) { s.buy = 1; s.co = 1; s.val += o.totals.total; s.order = o.id; persist(); } return o; };
  }
  /* أحداث من الصفحات: البحث والمستشار */
  function ev(name, d) {
    d = d || {};
    if (name === "search" && d.q) { if (s.search.length < 20) s.search.push({ q: String(d.q).slice(0, 40), n: d.n || 0 }); }
    if (name === "adv") { s.adv[d.k] = (s.adv[d.k] || 0) + 1; if (d.occ) s.adv.occ = d.occ; }
    s.last = Date.now(); persist();
  }
  return { ev, session: () => s };
})();
