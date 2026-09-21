/* =========================================================
   نُضْج — دوال العرض المشتركة
   دوال نقية تُرجع HTML — تُستخدم في المتصفح وفي build.js معاً،
   لهذا لا تلمس الـ DOM عند التحميل.
   ========================================================= */
(function (root) {
  "use strict";
  const D = root.NUDJ;
  const C = D.CONFIG;

  /* ---------------- أساسيات ---------------- */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /* المبالغ الصحيحة بلا كسور، والكسور دائماً بخانتين (52.50 لا 52.5) */
  const money = n => { const v = Math.round(Number(n || 0) * 100) / 100; return v.toLocaleString("en-US", v % 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 }); };
  const cur = n => `<span class="num">${money(n)}</span> <span class="cur">${C.currency}</span>`;

  /* ---------------- الأيقونات ---------------- */
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
    shop: '<path d="M5 8h14l-1 12.4a1 1 0 0 1-1 .9H7a1 1 0 0 1-1-.9z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    expertise: '<rect x="3" y="4" width="18" height="13.5" rx="2.5"/><path d="m10.2 8.2 4.6 2.55-4.6 2.55z"/><path d="M8 21h8"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.6l2.5 12.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 7H6"/>',
    user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c1.3-3.8 4.1-5.8 7.5-5.8s6.2 2 7.5 5.8"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.3-4.3"/>',
    chevR: '<path d="m9 5 7 7-7 7"/>',
    chevL: '<path d="m15 5-7 7 7 7"/>',
    chevD: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 7.7-1.5"/>',
    play: '<path d="M8 5.5v13l11-6.5z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>',
    share: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    filter: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    sort: '<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>',
    truck: '<path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.6 3 8.2 7 9.5 4-1.3 7-4.9 7-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    knife: '<path d="M3 13.5 13.5 3l7.5 7.5L10.5 21a1.5 1.5 0 0 1-2.1 0L3 15.6a1.5 1.5 0 0 1 0-2.1z"/><circle cx="16.5" cy="7.5" r="1.2"/><path d="m7 17 3-3"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9.5h19M6 15h4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    phone: '<path d="M5 3.5h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.6 6.6l1.4-2.3 4.5 1.8V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.1A1.5 1.5 0 0 1 5 3.5z"/>',
    video: '<rect x="2.5" y="6" width="13" height="12" rx="2"/><path d="m15.5 10.5 6-3.5v10l-6-3.5z"/>',
    chat: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.3 2.1-2.3 3.6M12 17.5v.3"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    logout: '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="m14 17 5-5-5-5M19 12H8"/>',
    spark: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    scale: '<path d="M5 20h14l-1.5-11h-11z"/><circle cx="12" cy="6" r="2.2"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.9-3.3 3.2-5 6-5s5.1 1.7 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.8M18 14.8c1.5.7 2.6 2.2 3 4.7"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
    plate: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>',
    thermo: '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-6.5 0-4-3-6-4-9-1.6 1.6-2 3-2 4.5C11 9 9 6.5 9 4.5 7 7 5 9.5 5 15.5 5 19.3 8 22 12 22Z"/>',
    pan: '<path d="M3 12h11a4 4 0 0 1 0 8H8a5 5 0 0 1-5-5z"/><path d="M14 12 21 5"/>',
    oven: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M7 6h.01M11 6h.01"/><rect x="7" y="12" width="10" height="6" rx="1"/>',
    pot: '<path d="M4 9h16v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 9h20M8 5.5 9 9M16 5.5 15 9"/>',
    swap: '<path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 0 8h-1"/><path d="m17 20 4-4-4-4"/>',
    mark: '<rect x="2.5" y="2.5" width="19" height="19"/><path d="M6.5 16.5c2-4 4.2-6.6 5.6-9M10.4 18.2c1.9-3.9 3.8-6.4 5.2-8.8M14.6 18.6c1.4-2.9 2.4-4.4 3.3-5.8"/>'
  };
  const icon = (n, cls, sw) => `<svg class="ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;
  const playIcon = cls => `<svg class="ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l11-6.5z"/></svg>`;
  const brand = (cls) => `<span class="brand${cls ? " " + cls : ""}">${icon("mark", "brand__mark", 1.4)}<span class="brand__word">نُضْج<small>NUDJ</small></span></span>`;

  /* ---------------- الروابط ---------------- */
  const url = {
    product: id => id + ".html",
    guide: gid => gid && gid.indexOf("dish-") === 0 ? gid + ".html" : "guide-" + gid + ".html",
    dish: slug => "dish-" + slug + ".html",
    shop: q => "shop.html" + (q ? "?" + q : "")
  };

  /* ---------------- الصور ----------------
     خانة الصورة رمادية حتى يُضاف مسارها في IMAGES أو في المنتج */
  function img(src, alt, cls) {
    return `<div class="ph${cls ? " " + cls : ""}">${src ? `<img src="${esc(src)}" alt="${esc(alt || "")}" loading="lazy" decoding="async">` : ""}</div>`;
  }
  const slot = (key, cls, alt) => img(D.IMAGES[key] || "", alt, cls).replace('<div class="ph', `<div data-slot="${key}" class="ph`);
  const productImg = (p, cls) => img(p.img || "", p.name, cls);

  /* ---------------- التسعير ---------------- */
  function sizeOf(p, k) { return (p.sizes || []).find(s => s.k === k) || (p.sizes || []).find(s => s.k === p.sizeDef) || (p.sizes || [])[0]; }
  function unitPrice(p, opts) {
    if (p.type === "carcass") { const s = sizeOf(p, opts && opts.size); return s ? s.p : 0; }
    if (p.type === "box") return p.price;
    if (p.unit === "kg") { const s = sizeOf(p, opts && opts.size); return Math.round(p.price * (s ? s.m : 1) * 100) / 100; }
    return p.price;
  }
  function boxValue(p) { return (p.contents || []).reduce((t, c) => t + unitPrice(D.byId(c.id), { size: c.size }) * (c.qty || 1), 0); }
  /* السعر: القيمة نفسها لا تنكسر أبداً (price__v)، والوصف الصغير يلتف حولها */
  const pv = n => `<span class="price__v">${cur(n)}</span>`;
  function priceTag(p) {
    if (p.type === "carcass") return `<span class="price"><small>يبدأ من</small> ${pv(Math.min.apply(null, p.sizes.map(s => s.p)))}</span>`;
    if (p.type === "box") return `<span class="price">${pv(p.price)} <del class="num">${money(boxValue(p))}</del></span>`;
    const per = p.unit === "kg" ? "كجم" : p.unitName || "حبة";
    return `<span class="price">${pv(p.price)} <small>/ ${per}</small></span>`;
  }
  const typeName = p => p.type === "carcass" ? "ذبائح" : p.type === "box" ? "بوكس" : p.mince ? "مفروم" : "قطعيات " + p.animal;

  /* ---------------- مكوّنات الهوية ---------------- */
  const codeTag = code => `<span class="cut-code"><b>${esc(code)}</b></span>`;
  const SPEC_K = ["طراوة", "دهن", "نكهة", "تحضير"];
  const SPEC_KL = ["الطراوة", "نسبة الدهن", "قوة النكهة", "صعوبة التحضير"];
  function specStrip(spec, full) {
    if (!spec) return "";
    const K = full ? SPEC_KL : SPEC_K;
    return `<div class="spec${full ? " spec--full" : ""}">${spec.map((v, i) =>
      `<div class="spec__row${i === 3 ? " is-eff" : ""}"><span class="spec__k">${K[i]}</span><span class="spec__bar" role="img" aria-label="${K[i]} ${v} من 5">${[1, 2, 3, 4, 5].map(n => `<i${n <= v ? ' class="on"' : ""}></i>`).join("")}</span></div>`).join("")}</div>`;
  }

  /* ---------------- بطاقة المنتج ---------------- */
  function productCard(p, o) {
    o = o || {};
    const href = url.product(p.id);
    const save = p.type === "box" ? Math.round(boxValue(p) - p.price) : 0;
    return `<article class="pcard" data-id="${p.id}">
  <a class="pcard__media" href="${href}" tabindex="-1" aria-hidden="true">${productImg(p)}${save > 0 ? `<span class="pcard__flag">وفّر ${money(save)} ${C.currency}</span>` : ""}</a>
  <button class="pcard__wish" type="button" data-wish="${p.id}" aria-label="أضف ${esc(p.name)} للمفضلة" aria-pressed="false">${icon("heart")}</button>
  <div class="pcard__body">
    <div class="pcard__meta">${p.code ? codeTag(p.code) : ""}<span class="pcard__type">${typeName(p)}</span></div>
    <h3 class="pcard__title"><a href="${href}">${esc(p.name)}</a></h3>
    <p class="pcard__short">${esc(p.short || "")}</p>
    ${o.spec !== false && p.spec ? specStrip(p.spec) : ""}
    <div class="pcard__foot">${priceTag(p)}<button class="pcard__add" type="button" data-quick="${p.id}" aria-label="أضف ${esc(p.name)} للسلة">${icon("plus", "", 2.2)}</button></div>
  </div>
</article>`;
  }
  const productGrid = (list, o) => list.map(p => productCard(p, o)).join("");

  /* صف منتج مختصر (القوائم والمخطط والبحث) */
  function productRow(p, o) {
    o = o || {};
    return `<a class="prow" href="${url.product(p.id)}">
  ${productImg(p, "prow__img")}
  <span class="prow__b">${p.code ? codeTag(p.code) : ""}<b>${esc(p.name)}</b><small>${esc(o.sub || p.short || "")}</small></span>
  <span class="prow__p">${priceTag(p)}</span>${icon("chevL", "prow__chev")}
</a>`;
  }

  /* ---------------- الأنواع والأطباق ---------------- */
  const typeTile = t => `<a class="type-tile" href="${url.shop("t=" + t.k)}">${slot("type-" + t.k, "type-tile__img", t.n)}<b>${t.n}</b><small>${t.s}</small></a>`;

  const DICON = {
    kabsa: '<path d="M4 18h16M6 18c0-5 2.7-8 6-8s6 3 6 8"/><path d="M12 10V6M9 6h6"/>',
    mandi: '<path d="M3 12h18M5 12a7 7 0 0 1 14 0M8 19h8"/><path d="M12 19v-3"/>',
    mashawi: P.flame,
    steak: P.pan,
    slow: P.clock,
    burger: '<path d="M4 11h16a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M5 8c1-2 3-3 7-3s6 1 7 3M6 18h12"/>'
  };
  const dishIcon = slug => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DICON[slug] || P.plate}</svg>`;
  const dishTile = d => `<a class="dish-tile" href="${url.dish(d.slug)}"><span class="dish-tile__ic">${dishIcon(d.slug)}</span><b>${d.name}</b><small>${d.cuts.length} قطعيات مناسبة</small></a>`;

  /* ---------------- الأدلة ---------------- */
  /* حالة الدليل تُحدَّث في المتصفح (data-gstate). الافتراضي عند البناء: مقفل */
  function guideCard(g) {
    const ic = g.kind === "dish" ? dishIcon(g.id.slice(5)) : g.kind === "carcass" ? icon("knife") : icon("video");
    return `<a class="gcard" href="${g.href}" data-guide="${g.id}">
  <span class="gcard__ic">${ic}</span>
  <span class="gcard__b"><b>${esc(g.title)}</b><small>${esc(g.short || "")}</small></span>
  <span class="gstate" data-gstate="${g.id}">${lockPill()}</span>
</a>`;
  }
  const lockPill = () => `<span class="pill pill--lock">${icon("lock")}${C.guidePrice} ${C.currency}</span>`;
  const ownPill = t => `<span class="pill pill--own">${icon("check", "", 2.4)}${t || "متاح لك"}</span>`;
  const cartPill = () => `<span class="pill pill--cart">${icon("cart")}في السلة</span>`;

  /* ---------------- خيارات الشراء (صفحة المنتج + ورقة الإضافة السريعة) ---------------- */
  let uid = 0;
  function radios(name, label, items, def, cls) {
    return `<fieldset class="opt${cls ? " " + cls : ""}"><legend class="opt__label">${label}</legend><div class="chips">${items.map((it, i) => {
      const v = typeof it === "string" ? it : it.k; const t = typeof it === "string" ? it : it.l;
      const sub = typeof it === "string" ? "" : it.d ? `<small>${it.d}</small>` : "";
      const pr = typeof it === "object" && it.p ? `<em class="num">${money(it.p)} ${C.currency}</em>` : "";
      const on = def != null ? v === def : i === 0;
      return `<label class="chip-r${sub ? " chip-r--card" : ""}"><input type="radio" name="${name}" value="${esc(v)}"${on ? " checked" : ""}><span>${esc(t)}${sub}${pr}</span></label>`;
    }).join("")}</div></fieldset>`;
  }
  function buyForm(p, o) {
    o = o || {}; const n = "f" + (++uid);
    const parts = [];
    if (p.type === "box") {
      parts.push(`<div class="opt"><span class="opt__label">محتويات البوكس</span><ul class="box-list">${p.contents.map(c => {
        const q = D.byId(c.id); const s = q.unit === "kg" ? sizeOf(q, c.size).l : (c.qty > 1 ? c.qty + " × " : "") + (q.unitName || "حبة");
        return `<li><a href="${url.product(q.id)}">${esc(q.name)}</a><span>${s}${c.cut ? " · " + c.cut : ""}</span></li>`;
      }).join("")}</ul></div>`);
    } else {
      if (p.sizes) parts.push(radios(n + "-size", p.type === "carcass" ? "الحجم" : "الوزن", p.sizes, p.sizeDef, p.type === "carcass" ? "opt--cards" : ""));
      if (p.parts) parts.push(radios(n + "-part", p.parts.l, p.parts.o, null));
      if (p.cuts) parts.push(radios(n + "-cut", p.cutLabel || "التقطيع", p.cuts, null));
      (p.extras || []).forEach(x => parts.push(radios(n + "-x-" + x.k, x.l, x.o, null, "opt--seg")));
      if (p.pack) parts.push(radios(n + "-pack", "التغليف", p.pack, null, "opt--seg"));
      if (p.type === "carcass" || o.note) parts.push(`<label class="opt opt--note"><span class="opt__label">ملاحظات للجزّار <small>(اختياري)</small></span><textarea name="note" rows="2" maxlength="200" placeholder="${p.type === "carcass" ? "مثال: الأفخاذ كاملة والباقي ثلاجة" : "مثال: شيل الدهن الزائد"}"></textarea></label>`);
    }
    const gid = D.guideIdFor(p);
    const guideRow = gid ? `<label class="guide-toggle" data-guide-toggle="${gid}">
      <input type="checkbox" name="withGuide" value="${gid}">
      <span class="guide-toggle__box">${icon("check", "", 2.6)}</span>
      <span class="guide-toggle__b"><b>أضف الدليل المصوّر</b><small>${gid === "carcass" ? "فيديو تقطيع الذبيحة وأي تقطيع يناسب طبختك" : "فيديو التقطيع وخطوات الطبخ والحرارات"}</small></span>
      <span class="guide-toggle__p num">+${C.guidePrice} ${C.currency}</span>
    </label>
    <div class="guide-owned" data-guide-owned="${gid}" hidden>${icon("check", "", 2.4)}<span>الدليل المصوّر متاح لك</span><a href="${url.guide(gid)}">افتحه</a></div>` : "";
    return `<form class="buy-form" data-product="${p.id}" novalidate>
  ${parts.join("")}
  ${guideRow}
  <div class="buy-row">
    <div class="stepper" data-stepper><button type="button" data-step="-1" aria-label="إنقاص">${icon("minus", "", 2.2)}</button><output name="qty" class="num">1</output><button type="button" data-step="1" aria-label="زيادة">${icon("plus", "", 2.2)}</button></div>
    <button class="btn btn--brand btn--lg buy-submit" type="submit">${icon("cart")}<span>أضف للسلة</span><b class="num" data-total></b></button>
  </div>
</form>`;
  }

  /* ---------------- مخطط الذبيحة ---------------- */
  function chartSVG(o) {
    o = o || {}; const lbl = D.PRIMALS["ضأن"];
    const z = (k, d, x, y, extra) => `<g class="zg" data-zone="${k}" tabindex="0" role="button" aria-label="${lbl[k].name}"><path class="zone" d="${d}"/>${extra || ""}<text class="zlabel" x="${x}" y="${y}">${lbl[k].name}</text></g>`;
    return `<svg class="chart-svg${o.cls ? " " + o.cls : ""}" viewBox="90 90 715 340" role="img" aria-label="مخطط مناطق الذبيحة">
  <path class="map-soft" d="M226,300 L262,300 L258,366 L270,408 L242,412 L228,368 Z"/>
  <path class="map-soft" d="M482,300 L518,300 L514,366 L526,408 L498,412 L484,368 Z"/>
  <path class="map-line" d="M700,126 C726,110 762,108 782,122 C796,132 793,152 779,160 L742,175 L706,168 Z"/>
  <path class="map-line" d="M726,116 C730,100 744,94 752,100 C757,104 754,114 746,120"/>
  <circle cx="752" cy="136" r="3.2" class="map-eye"/>
  ${z("leg", "M262,150 L262,312 L186,312 C140,310 112,282 112,240 C112,196 136,166 178,157 Z", 190, 240)}
  ${z("loin", "M262,150 L380,147 L380,264 L262,264 Z", 321, 210)}
  ${z("rack", "M380,147 L500,150 L500,264 L380,264 Z", 440, 210)}
  ${z("shoulder", "M500,150 L622,162 L622,264 L500,264 Z", 561, 212)}
  ${z("neck", "M622,160 L702,126 L720,168 L640,204 L622,200 Z", 668, 172)}
  ${z("breast", "M290,264 L622,264 L622,312 L318,312 C300,312 290,300 290,286 Z", 452, 294)}
  ${z("shank", "M190,312 L236,312 L232,372 L246,414 L212,420 L194,376 Z", 213, 352, '<path class="zone" d="M524,312 L570,312 L566,372 L580,414 L546,420 L528,376 Z"/>')}
</svg>`;
  }
  /* خريطة صغيرة تبيّن منطقة القطعة */
  function locatorSVG(zone) {
    const Z = {
      leg: "M26,6 L26,30 L14,30 C8,30 5,25 5,19 C5,12 9,7 15,6 Z", loin: "M26,6 L42,6 L42,24 L26,24 Z", rack: "M42,6 L58,6 L58,24 L42,24 Z",
      shoulder: "M58,6 L74,8 L74,24 L58,24 Z", neck: "M74,8 L86,3 L89,10 L78,16 L74,15 Z", breast: "M30,24 L74,24 L74,30 L32,30 Z",
      shank: "M14,30 L20,30 L20,40 L15,40 Z M60,30 L66,30 L66,40 L61,40 Z"
    };
    return `<svg class="locator" viewBox="0 0 92 44" aria-hidden="true">${Object.keys(Z).map(k => `<path class="lz${k === zone ? " on" : ""}" d="${Z[k]}"/>`).join("")}</svg>`;
  }

  /* ---------------- مقياس النضج ---------------- */
  const ruler = id => `<div class="ruler" id="${id || "ruler"}">
  <div class="ruler__read"><span class="ruler__n" data-rn>—</span><span class="ruler__t num" data-rt>—</span></div>
  <div class="ruler__scale"><span class="ruler__pin" data-rp></span></div>
  <div class="ruler__steps" role="radiogroup" aria-label="درجة النضج">${D.DONENESS.map(d => `<button type="button" role="radio" aria-checked="false" data-k="${d.k}">${d.n}</button>`).join("")}</div>
  <p class="ruler__note" data-rnote></p>
</div>`;

  /* ---------------- عناصر عامة ---------------- */
  const empty = (ic, title, text, cta) => `<div class="empty">${icon(ic || "info", "empty__ic", 1.4)}<h3>${title}</h3>${text ? `<p>${text}</p>` : ""}${cta || ""}</div>`;
  /* خلية قائمة بنمط iOS */
  function cell(o) {
    const tag = o.href ? "a" : o.button ? "button" : "div";
    const attrs = (o.href ? ` href="${o.href}"` : "") + (o.button ? ` type="button"` : "") + (o.attrs ? " " + o.attrs : "");
    return `<${tag} class="cell${o.cls ? " " + o.cls : ""}"${attrs}>${o.icon ? `<span class="cell__ic${o.tone ? " is-" + o.tone : ""}">${icon(o.icon)}</span>` : ""}<span class="cell__b"><span class="cell__t">${o.title}</span>${o.sub ? `<span class="cell__s">${o.sub}</span>` : ""}</span>${o.detail != null ? `<span class="cell__d">${o.detail}</span>` : ""}${o.href || o.chev ? icon("chevL", "cell__chev") : ""}</${tag}>`;
  }
  const group = (cells, head, foot) => `${head ? `<h2 class="group__head">${head}</h2>` : ""}<div class="group">${cells.join("")}</div>${foot ? `<p class="group__foot">${foot}</p>` : ""}`;

  const fmtDate = (ts, o) => new Date(ts).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", Object.assign({ day: "numeric", month: "long", year: "numeric" }, o || {}));
  const optsText = l => {
    if (!l || !l.opts) return "";
    const p = D.byId(l.id); if (!p) return "";
    const o = l.opts, out = [];
    if (o.size && p.sizes) { const s = sizeOf(p, o.size); if (s) out.push(p.type === "carcass" ? s.l + " (" + s.d + ")" : s.l); }
    if (o.part) out.push(o.part);
    if (o.cut) out.push(o.cut);
    if (o.extras) Object.keys(o.extras).forEach(k => { const x = (p.extras || []).find(e => e.k === k); if (x) out.push(x.l + ": " + o.extras[k]); });
    if (o.pack) out.push("تغليف " + o.pack);
    return out.join(" · ");
  };

  root.NUDJ_UI = {
    esc, money, cur, icon, playIcon, brand, url, img, slot, productImg, unitPrice, boxValue, priceTag, typeName, sizeOf,
    codeTag, specStrip, productCard, productGrid, productRow, typeTile, dishIcon, dishTile, guideCard,
    lockPill, ownPill, cartPill, buyForm, chartSVG, locatorSVG, ruler, empty, cell, group, fmtDate, optsText
  };
})(typeof window !== "undefined" ? window : globalThis);
