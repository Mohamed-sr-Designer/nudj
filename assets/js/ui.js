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
  /* المبالغ الصحيحة بلا كسور، والكسور دائماً بخانتين */
  const money = n => { const v = Math.round(Number(n || 0) * 100) / 100; return v.toLocaleString("en-US", v % 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 }); };
  const money2 = n => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cur = n => `<span class="num">${money(n)}</span> <span class="cur">${C.currency}</span>`;
  /* الوزن: 0.5 ← «½ كجم»، 1.5 ← «1.5 كجم» */
  const kgTxt = kg => (kg === 0.5 ? "½" : String(Math.round(kg * 100) / 100)) + " كجم";

  /* ---------------- الأيقونات ---------------- */
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
    shop: '<path d="M5 8h14l-1 12.4a1 1 0 0 1-1 .9H7a1 1 0 0 1-1-.9z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.6l2.5 12.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 7H6"/>',
    user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c1.3-3.8 4.1-5.8 7.5-5.8s6.2 2 7.5 5.8"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.3-4.3"/>',
    chevR: '<path d="m9 5 7 7-7 7"/>', chevL: '<path d="m15 5-7 7 7 7"/>', chevD: '<path d="m6 9 6 6 6-6"/>', chevU: '<path d="m6 15 6-6 6 6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', check: '<path d="M20 6 9 17l-5-5"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>',
    share: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    filter: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    truck: '<path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2"/>',
    knife: '<path d="M3 13.5 13.5 3l7.5 7.5L10.5 21a1.5 1.5 0 0 1-2.1 0L3 15.6a1.5 1.5 0 0 1 0-2.1z"/><circle cx="16.5" cy="7.5" r="1.2"/><path d="m7 17 3-3"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9.5h19M6 15h4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    phone: '<path d="M5 3.5h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.6 6.6l1.4-2.3 4.5 1.8V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.1A1.5 1.5 0 0 1 5 3.5z"/>',
    chat: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.3 2.1-2.3 3.6M12 17.5v.3"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    logout: '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="m14 17 5-5-5-5M19 12H8"/>',
    spark: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/>',
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    scale: '<path d="M5 20h14l-1.5-11h-11z"/><circle cx="12" cy="6" r="2.2"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.9-3.3 3.2-5 6-5s5.1 1.7 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.8M18 14.8c1.5.7 2.6 2.2 3 4.7"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-6.5 0-4-3-6-4-9-1.6 1.6-2 3-2 4.5C11 9 9 6.5 9 4.5 7 7 5 9.5 5 15.5 5 19.3 8 22 12 22Z"/>',
    pan: '<path d="M3 12h11a4 4 0 0 1 0 8H8a5 5 0 0 1-5-5z"/><path d="M14 12 21 5"/>',
    oven: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M7 6h.01M11 6h.01"/><rect x="7" y="12" width="10" height="6" rx="1"/>',
    pot: '<path d="M4 9h16v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 9h20M8 5.5 9 9M16 5.5 15 9"/>',
    receipt: '<path d="M5 3h14v18l-2.3-1.5L14.3 21 12 19.5 9.7 21l-2.4-1.5L5 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
    send: '<path d="M4 12 20 4l-4 16-4-7z"/><path d="m12 13 8-9"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    save: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>'
  };
  const icon = (n, cls, sw) => `<svg class="ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;

  /* ---------------- الهوية ----------------
     الشعار: «نضج» بالخط الكوفي المربّع يقطعه خط سكين، ونقطة النون جمرة */
  const LOGO = {
    vb: "92 0 296 216",
    body: "M358 84L380 84L380 132L358 132ZM101 112.4L299.6 112.4L308.7 134.4L101 134.4ZM307 110L380 110L380 132L316.1 132ZM251 52.4L274.9 52.4L284 74.4L251 74.4ZM282.3 50L340 50L340 72L291.4 72ZM318 50L340 50L340 132L318 132ZM251 52.4L273 52.4L273 134.4L251 134.4ZM284 12L306 12L306 34L284 34ZM207 86.4L229 86.4L229 134.4L207 134.4ZM101 112.4L123 112.4L123 202.4L101 202.4ZM101 180.4L191 180.4L191 202.4L101 202.4ZM169 162.4L191 162.4L191 202.4L169 202.4ZM141 140.4L163 140.4L163 162.4L141 162.4ZM255.9 0L259.1 0L347.2 214L344 214Z",
    dot: "M358 50L380 50L380 72L358 72Z"
  };
  const logo = cls => `<svg class="logo${cls ? " " + cls : ""}" viewBox="${LOGO.vb}" aria-hidden="true"><path fill="currentColor" d="${LOGO.body}"/><path class="logo__dot" d="${LOGO.dot}"/></svg>`;
  const brand = cls => `<span class="brand${cls ? " " + cls : ""}">${logo()}<span class="brand__en">NUDJ<small>BUTCHER · ADVISOR</small></span></span>`;
  /* رمز «ن» — أيقونة التطبيق ووجه المستشار */
  const mark = cls => `<svg class="mark${cls ? " " + cls : ""}" viewBox="0 0 100 100" aria-hidden="true"><path fill="currentColor" d="M20 36h17v46H20zM20 65h60v17H20zM63 28h17v54H63z"/><rect class="mark__dot" x="41.5" y="16" width="17" height="17"/></svg>`;

  /* ---------------- الروابط ---------------- */
  const url = {
    product: id => id + ".html",
    animal: k => k + ".html",
    shop: q => "shop.html" + (q ? "?" + q : ""),
    advisor: occ => "advisor.html" + (occ ? "?o=" + occ : "")
  };

  /* ---------------- الصور ---------------- */
  function img(src, alt, cls, o) {
    o = o || {};
    return `<div class="ph${cls ? " " + cls : ""}">${src ? `<img src="${esc(src)}" alt="${esc(alt || "")}"${o.eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">` : ""}</div>`;
  }
  const slot = (key, cls, alt, o) => img(D.IMAGES[key] || "", alt, cls, o);
  const productImg = (p, cls, o) => img(p.img || "", p.name, cls, o);
  const herdArt = (k, cls) => `<img class="herd-art${cls ? " " + cls : ""}" src="assets/img/herd/${k}.png" alt="" loading="lazy" decoding="async">`;

  /* ---------------- التسعير ---------------- */
  const sizeOf = (p, k) => (p.sizes || []).find(s => s.k === k) || (p.sizes || []).find(s => s.k === p.sizeDef) || (p.sizes || [])[0];
  const perTxt = p => p.sold === "kg" ? "كجم" : p.sold === "carcass" ? "ذبيحة" : p.unitName || "حبة";
  function priceTag(p) {
    if (p.sold === "carcass") return `<span class="price"><small>من</small> <b class="price__v">${cur(Math.min.apply(null, p.sizes.map(s => s.p)))}</b></span>`;
    return `<span class="price"><b class="price__v">${cur(p.price)}</b> <small>/ ${perTxt(p)}</small></span>`;
  }
  const animalName = p => p.animal === "extra" ? "إضافات" : (D.animal(p.animal) || {}).n || "";

  /* ---------------- بطاقة المنتج: بطاقة جزّار معلّقة ---------------- */
  function tagCard(p, o) {
    o = o || {};
    const href = url.product(p.id);
    const a = D.animal(p.animal);
    return `<article class="tag-card${p.animal === "extra" ? " is-extra" : ""}" data-id="${p.id}">
  <a class="tag-card__media" href="${href}" tabindex="-1" aria-hidden="true">${productImg(p)}</a>
  <button class="tag-card__wish" type="button" data-wish="${p.id}" aria-label="أضف ${esc(p.name)} للمفضلة" aria-pressed="false">${icon("heart")}</button>
  <div class="tag">
    <span class="tag__hole" aria-hidden="true"></span>
    <div class="tag__meta"><span class="tag__code num">${p.code}</span><span>${a ? a.n : "إضافات"}${p.bone ? " · بالعظم" : ""}</span></div>
    <h3 class="tag__name"><a href="${href}">${esc(p.name)}</a></h3>
    <p class="tag__short">${esc(p.short || "")}</p>
    <div class="tag__foot">${priceTag(p)}<button class="tag__add" type="button" data-quick="${p.id}" aria-label="أضف ${esc(p.name)} للسلة">${icon("plus", "", 2.4)}</button></div>
  </div>
</article>`;
  }
  const grid = list => list.map(p => tagCard(p)).join("");

  /* صف مختصر (البحث والقوائم) */
  const productRow = (p, sub) => `<a class="prow" href="${url.product(p.id)}">${productImg(p, "prow__img")}<span class="prow__b"><span class="tag__code num">${p.code}</span><b>${esc(p.name)}</b><small>${esc(sub || p.short || "")}</small></span><span class="prow__p">${priceTag(p)}</span>${icon("chevL", "prow__chev")}</a>`;

  /* شريط المواصفات (طراوة، دهن، نكهة) */
  function spec(s) {
    if (!s) return "";
    const K = ["الطراوة", "الدهن", "النكهة"];
    return `<div class="spec">${s.map((v, i) => `<div class="spec__row"><span>${K[i]}</span><span class="spec__bar" role="img" aria-label="${K[i]} ${v} من 5">${[1, 2, 3, 4, 5].map(n => `<i${n <= v ? ' class="on"' : ""}></i>`).join("")}</span></div>`).join("")}</div>`;
  }

  /* ---------------- القطيع ---------------- */
  function herdCard(a, i) {
    const list = D.cutsOf(a.k), from = Math.min.apply(null, list.filter(p => p.sold === "kg").map(p => p.price));
    return `<a class="herd-card" href="${url.animal(a.k)}">
  <span class="herd-card__n num">0${i + 1}</span>
  <span class="herd-card__art">${herdArt(a.k)}</span>
  <span class="herd-card__b"><b>${a.n}</b><small class="num">${a.en} · ${list.length} قطعيات</small></span>
  <span class="herd-card__p">من <b class="num">${from}</b> ${C.currency}/كجم</span>
</a>`;
  }
  /* الرسم الخطي مع نقاط مرقّمة لكل قطعة */
  function herdMap(a, o) {
    o = o || {};
    const list = D.cutsOf(a.k).filter(p => p.zone && a.pins[p.zone]);
    const seen = {};
    const pins = list.map(p => {
      const z = a.pins[p.zone]; const n = (seen[p.zone] = (seen[p.zone] || 0) + 1);
      return `<a class="pin" href="${url.product(p.id)}" data-pin="${p.id}" style="left:${z[0] + (n - 1) * 4}%;top:${z[1] + (n - 1) * 5}%"><span class="num">${p.code.slice(2)}</span><em>${esc(p.name)}</em></a>`;
    }).join("");
    return `<div class="herd-map${o.cls ? " " + o.cls : ""}" style="aspect-ratio:${a.ratio.toFixed(3)}">${herdArt(a.k, "herd-map__art")}${pins}</div>`;
  }

  /* ---------------- الباركود (زخرفي من رقم الطلب) ---------------- */
  function barcode(txt, h) {
    let s = 0, x = 0, bars = "";
    const str = String(txt || "NUDJ");
    for (let i = 0; i < 44; i++) {
      const c = str.charCodeAt(i % str.length) + i * 7; s = (s * 31 + c) % 9973;
      const w = 1 + (s % 3), gap = 1 + ((s >> 2) % 2);
      bars += `<rect x="${x}" width="${w}" height="${h || 40}"/>`; x += w + gap;
    }
    return `<svg class="barcode" viewBox="0 0 ${x} ${h || 40}" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
  }

  /* ---------------- الفاتورة الحرارية ----------------
     o = { kicker, title, meta:[[k,v]], lines:[{name, sub, calc, amount, adds:[{n, calc, v}]}], totals:[[k, v, cls]], code, stamp, foot, empty } */
  function receipt(o) {
    o = o || {};
    const rule = `<div class="rc__rule" aria-hidden="true"></div>`;
    return `<div class="receipt${o.cls ? " " + o.cls : ""}">
  <div class="rc__head">${logo("rc__logo")}<div><b>نُضْج</b><small>${esc(o.kicker || "ملحمة إلكترونية · مستشار طبخ")}</small></div></div>
  ${o.title ? `<div class="rc__title">${o.title}</div>` : ""}
  ${(o.meta || []).length ? `<dl class="rc__meta">${o.meta.map(m => `<div><dt>${m[0]}</dt><dd>${m[1]}</dd></div>`).join("")}</dl>` : ""}
  ${rule}
  <div class="rc__lines">${(o.lines || []).length ? o.lines.map(receiptLine).join("") : `<p class="rc__empty">${o.empty || "لا شيء بعد"}</p>`}</div>
  ${(o.totals || []).length ? rule + `<dl class="rc__totals">${o.totals.map(t => `<div class="${t[2] || ""}"><dt>${t[0]}</dt><dd class="num">${t[1]}</dd></div>`).join("")}</dl>` : ""}
  ${o.code ? rule + `<div class="rc__code">${barcode(o.code)}<span class="num">${esc(o.code)}</span></div>` : ""}
  ${o.foot ? `<p class="rc__foot">${o.foot}</p>` : ""}
  ${o.stamp ? `<span class="rc__stamp">${o.stamp}</span>` : ""}
</div>`;
  }
  function receiptLine(l) {
    return `<div class="rc__line"${l.key ? ` data-key="${esc(l.key)}"` : ""}>
  <div class="rc__row"><span class="rc__name">${l.name}</span><span class="rc__amt num">${money2(l.amount)}</span></div>
  ${l.sub ? `<div class="rc__sub">${l.sub}</div>` : ""}
  ${l.calc ? `<div class="rc__calc num">${l.calc}</div>` : ""}
  ${(l.adds || []).map(a => `<div class="rc__row rc__add"><span>+ ${a.n}${a.calc ? ` <em class="num">${a.calc}</em>` : ""}</span><span class="num">${money2(a.v)}</span></div>`).join("")}
  ${l.tools || ""}
</div>`;
  }
  /* يحوّل سطر السلة/الطلب إلى سطر فاتورة */
  function lineForReceipt(l) {
    const p = D.byId(l.id); if (!p) return null;
    const S = root.NUDJ_STORE;
    const b = l.base != null ? { base: l.base, adds: l.adds || [] } : S.breakdown(l);
    let calc = "", sub = optsText(l);
    if (p.sold === "kg") calc = `${kgTxt(l.kg)} × ${money2(p.price)}`;
    else if (p.sold === "carcass") calc = `${l.qty || 1} × ${money2(sizeOf(p, l.opts && l.opts.size).p)}`;
    else calc = `${l.qty || 1} ${p.unitName || "حبة"} × ${money2(p.price)}`;
    return { key: l.key, name: esc(p.name), sub, calc, amount: b.base, adds: (b.adds || []).map(a => ({ n: a.n, calc: a.flat ? "" : `${kgTxt(a.q)} × ${a.u}`, v: a.v })) };
  }
  function optsText(l) {
    const p = D.byId(l.id); if (!p || !l.opts) return "";
    const o = l.opts, out = [];
    if (p.sold === "kg" && o.prep && D.PREPS[o.prep]) out.push(D.PREPS[o.prep].n);
    if (p.sold === "carcass") {
      const s = sizeOf(p, o.size); out.push(s.l + " ≈ " + s.kg + " كجم");
      if (o.part && p.parts) { const x = p.parts.find(q => q.k === o.part); if (x) out.push(x.l); }
      out.push(D.style(o.style).n);
    }
    if (l.note) out.push("«" + esc(l.note) + "»");
    return out.join(" · ");
  }

  /* ---------------- نموذج الشراء ----------------
     بالكيلو: ميزان رقمي + التقطيع + التتبيل + التسييخ + التغليف
     الذبيحة: الحجم + الجزء + أسلوب التقطيع + التغليف · الإضافات: العدد */
  let uid = 0;
  function chips(name, label, items, def, o) {
    o = o || {};
    return `<fieldset class="opt${o.cls ? " " + o.cls : ""}"${o.attrs ? " " + o.attrs : ""}><legend class="opt__label">${label}${o.hint ? `<small>${o.hint}</small>` : ""}</legend><div class="chips">${items.map((it, i) => {
      const on = def != null ? it.k === def : i === 0;
      return `<label class="chip"><input type="radio" name="${name}" value="${esc(it.k)}"${on ? " checked" : ""}><span><b>${esc(it.n)}</b>${it.d ? `<small>${esc(it.d)}</small>` : ""}${it.p != null ? `<em class="num">${it.p ? "+" + money(it.p) + (it.per || "") : "مجاناً"}</em>` : ""}</span></label>`;
    }).join("")}</div></fieldset>`;
  }
  const toggle = (name, t, d, price) => `<label class="toggle"><input type="checkbox" name="${name}"><span class="toggle__sw" aria-hidden="true"></span><span class="toggle__b"><b>${t}</b><small>${d}</small></span><em class="num">+${price}</em></label>`;

  function scale(p) {
    const presets = [0.5, 1, 1.5, 2, 3, 5];
    return `<div class="scale" data-scale>
  <div class="scale__screen"><span class="scale__label">وزن</span><output class="scale__read num" name="kg">${p.def.toFixed(2)}</output><span class="scale__unit">KG</span></div>
  <div class="scale__dial" aria-hidden="true"><svg viewBox="0 0 200 110"><path class="scale__arc" d="M15 100a85 85 0 0 1 170 0"/><g class="scale__ticks">${Array.from({ length: 21 }, (_, i) => { const a = Math.PI * (1 - i / 20), r1 = i % 5 ? 76 : 70; return `<line x1="${(100 + r1 * Math.cos(a)).toFixed(1)}" y1="${(100 - r1 * Math.sin(a)).toFixed(1)}" x2="${(100 + 84 * Math.cos(a)).toFixed(1)}" y2="${(100 - 84 * Math.sin(a)).toFixed(1)}"/>`; }).join("")}</g><line class="scale__needle" x1="100" y1="100" x2="100" y2="28"/><circle cx="100" cy="100" r="6" class="scale__hub"/></svg></div>
  <div class="scale__ctl">
    <button type="button" class="scale__btn" data-kg-step="-1" aria-label="أنقص نصف كيلو">${icon("minus", "", 2.4)}</button>
    <div class="scale__presets">${presets.map(v => `<button type="button" data-kg="${v}"${v === p.def ? ' class="on"' : ""}>${v === 0.5 ? "½" : v}</button>`).join("")}</div>
    <button type="button" class="scale__btn" data-kg-step="1" aria-label="زد نصف كيلو">${icon("plus", "", 2.4)}</button>
  </div>
</div>`;
  }

  function buyForm(p, o) {
    o = o || {}; const n = "f" + (++uid);
    const parts = [];
    if (p.sold === "kg") {
      parts.push(scale(p));
      parts.push(chips(n + "-prep", "التقطيع", p.preps.map(k => ({ k, n: D.PREPS[k].n, d: D.PREPS[k].d })), p.prepDef, { hint: "مجاني" }));
      parts.push(chips(n + "-marinade", "التتبيل", D.MARINADES.map(m => ({ k: m.k, n: m.n, d: m.d, p: m.p, per: "/كجم" })), "none", { cls: "opt--paid", hint: "خدمة إضافية" }));
      parts.push(`<div class="opt opt--paid"><span class="opt__label">خدمات<small>خدمة إضافية</small></span>
        <div data-skew-row>${toggle("skewer", D.SERVICES.skewer.n, D.SERVICES.skewer.d, D.SERVICES.skewer.p + "/كجم")}</div>
        ${toggle("vacuum", D.SERVICES.vacuum.n, D.SERVICES.vacuum.d, D.SERVICES.vacuum.p + "/كجم")}</div>`);
    } else if (p.sold === "carcass") {
      parts.push(chips(n + "-size", "الحجم", p.sizes.map(s => ({ k: s.k, n: s.l, d: "≈ " + s.kg + " كجم · " + money(s.p) + " " + C.currency })), p.sizeDef, { cls: "opt--cards" }));
      if (p.parts) parts.push(chips(n + "-part", "الجزء", p.parts.map(x => ({ k: x.k, n: x.l, d: x.d })), null));
      parts.push(chips(n + "-style", "أسلوب التقطيع", D.STYLES.map(s => ({ k: s.k, n: s.n, d: s.d })), "fridge", { hint: "مجاني" }));
      parts.push(`<div class="opt opt--paid"><span class="opt__label">خدمات<small>خدمة إضافية</small></span>${toggle("vacuum", D.SERVICES.vacuum.n, "كل وجبة في كيس مفرّغ", D.SERVICES.vacuum.carcass + " للذبيحة")}</div>`);
    }
    if (p.sold !== "piece") parts.push(`<label class="opt opt--note"><span class="opt__label">ملاحظة للجزّار<small>اختياري</small></span><textarea name="note" rows="2" maxlength="160" placeholder="${p.sold === "carcass" ? "مثال: الأفخاذ كاملة والباقي ثلاجة" : "مثال: شيل الدهن الزائد"}"></textarea></label>`);
    const stepper = p.sold === "kg" ? "" : `<div class="stepper" data-stepper><button type="button" data-step="-1" aria-label="إنقاص">${icon("minus", "", 2.2)}</button><output name="qty" class="num">1</output><button type="button" data-step="1" aria-label="زيادة">${icon("plus", "", 2.2)}</button></div>`;
    return `<form class="buy-form" data-product="${p.id}" novalidate>
  ${parts.join("")}
  <div class="buy-sum" data-sum></div>
  <div class="buy-row">${stepper}<button class="btn btn--ember btn--lg buy-submit" type="submit">${icon("cart")}<span>أضف للسلة</span><b class="num" data-total></b></button></div>
</form>`;
  }

  /* ---------------- عناصر عامة ---------------- */
  const empty = (ic, title, text, cta) => `<div class="empty">${icon(ic || "info", "empty__ic", 1.4)}<h3>${title}</h3>${text ? `<p>${text}</p>` : ""}${cta || ""}</div>`;
  function cell(o) {
    const tag = o.href ? "a" : o.button ? "button" : "div";
    const attrs = (o.href ? ` href="${o.href}"` : "") + (o.button ? ` type="button"` : "") + (o.attrs ? " " + o.attrs : "");
    return `<${tag} class="cell${o.cls ? " " + o.cls : ""}"${attrs}>${o.icon ? `<span class="cell__ic${o.tone ? " is-" + o.tone : ""}">${icon(o.icon)}</span>` : ""}<span class="cell__b"><span class="cell__t">${o.title}</span>${o.sub ? `<span class="cell__s">${o.sub}</span>` : ""}</span>${o.detail != null ? `<span class="cell__d">${o.detail}</span>` : ""}${o.href || o.chev ? icon("chevL", "cell__chev") : ""}</${tag}>`;
  }
  const group = (cells, head, foot) => `${head ? `<h2 class="group__head">${head}</h2>` : ""}<div class="group">${cells.join("")}</div>${foot ? `<p class="group__foot">${foot}</p>` : ""}`;
  const fmtDate = (ts, o) => new Date(ts).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", Object.assign({ day: "numeric", month: "long", year: "numeric" }, o || {}));
  const fmtTime = ts => new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const kicker = (n, t) => `<span class="kicker"><b class="num">${n}</b>${t}</span>`;

  root.NUDJ_UI = {
    esc, money, money2, cur, kgTxt, icon, logo, brand, mark, url, img, slot, productImg, herdArt, sizeOf, perTxt, priceTag, animalName,
    tagCard, grid, productRow, spec, herdCard, herdMap, barcode, receipt, lineForReceipt, optsText, chips, buyForm, scale,
    empty, cell, group, fmtDate, fmtTime, kicker
  };
})(typeof window !== "undefined" ? window : globalThis);
