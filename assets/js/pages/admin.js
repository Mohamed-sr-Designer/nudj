/* =========================================================
   نُضْج — لوحة التحكم
   تعدّل كل بيانات الموقع ونصوصه في «مسودة» محفوظة في هذا المتصفح،
   تعاينها على الموقع الحقيقي، ثم تنشرها (GitHub) أو تنزّلها كملف.
   ========================================================= */
(function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, A = window.NUDJ_APP, U = window.NUDJ_UI, CMS = window.NUDJ_CMS;
  const { $, $$ } = A;
  const esc = U.esc, icon = U.icon;
  const root = $("#adm"); if (!root || !CMS) return;
  const LS = { draft: "nudj_cms_draft", preview: "nudj_cms_preview", ok: "nudj_admin_ok", gh: "nudj_cms_gh", pub: "nudj_cms_pubhash" };
  const clone = o => JSON.parse(JSON.stringify(o));
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };

  /* لغة المحتوى الذي تعدّله: العربية (الأصل) أو الإنجليزية (نسخ «_en» بجانب كل نص) */
  let CL = lsGet("nudj_adm_lang") === "en" ? "en" : "ar";
  const TR = () => CL === "en";
  /* PRODUCTS.3.name ← PRODUCTS.3.name_en · FAQ.2.0 ← FAQ_en.2.0 · CONFIG.cities.1 ← CONFIG.cities_en.1 */
  function enPath(path) {
    const ks = path.split(".");
    if (ks.some(k => /_en$/.test(k))) return path;
    for (let i = ks.length - 1; i >= 0; i--) if (!/^\d+$/.test(ks[i])) { ks[i] += "_en"; return ks.join("."); }
    return path;
  }
  const isMeta = k => /_(en|ar)$/.test(k);
  const zoneKeys = () => Object.keys(draft.ZONES).filter(k => !isMeta(k));

  /* ---------------- المسودة ---------------- */
  let draft = null;
  try { draft = JSON.parse(lsGet(LS.draft) || "null"); } catch (e) { }
  if (!draft) draft = CMS.snapshot();
  CMS.KEYS.forEach(k => { if (draft[k] == null) draft[k] = clone(D[k]); });
  let saveT, view = "home";
  function save(quiet) {
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      const ok = lsSet(LS.draft, JSON.stringify(draft));
      paintStatus();
      if (!ok) A.toast("المساحة ممتلئة — صغّر الصور أو احذف بعضها", { icon: "info", ms: 5000 });
      else if (!quiet) { const s = $(".adm-save"); if (s) { s.classList.remove("flash"); void s.offsetWidth; s.classList.add("flash"); } }
    }, 250);
  }
  const isPublishedSame = () => CMS.hash(draft) === (CMS.published ? CMS.hash(CMS.published) : CMS.hash(CMS.original));
  function paintStatus() {
    const el = $(".adm-status"); if (!el) return;
    const same = isPublishedSame();
    el.className = "adm-status" + (same ? " is-ok" : "");
    el.innerHTML = same ? `${icon("check", "", 2.4)}مطابق للمنشور` : `${icon("edit")}مسودة غير منشورة`;
  }

  /* ---------------- مسارات البيانات ---------------- */
  const get = (path, o) => path.split(".").reduce((x, k) => x == null ? x : x[k], o || draft);
  function set(path, val) {
    const ks = path.split("."), last = ks.pop();
    const obj = ks.reduce((x, k) => { if (x[k] == null) x[k] = /^\d+$/.test(k) ? [] : {}; return x[k]; }, draft);
    obj[last] = val; save();
  }
  const P = s => esc(s);

  /* ---------------- حقول عامة ---------------- */
  const F = {
    text(path, label, o) {
      o = o || {};
      /* في وضع الإنجليزي: الحقل يكتب في نسخة «_en» ويعرض العربي كتلميح (الأكواد والأرقام تبقى كما هي) */
      const tr = TR() && !o.raw && o.dir !== "ltr";
      const src = get(path.split(".").map(k => k.replace(/_en$/, "")).join(".")), p = tr ? enPath(path) : path, v = get(p);
      const ph = tr ? (typeof src === "string" ? src : "") : o.ph;
      const dir = tr ? "ltr" : o.dir;
      const long = o.rows || [v, src].some(x => typeof x === "string" && (x.length > 70 || /[<\n]/.test(x)));
      return `<label class="af${o.cls ? " " + o.cls : ""}${tr ? " af--en" : ""}"><span class="af__l">${label}${tr ? '<em class="af__lang">EN</em>' : ""}${o.hint ? `<small>${o.hint}</small>` : ""}</span>${long
        ? `<textarea class="input af__ta" rows="${o.rows || (/</.test(v || src) ? 8 : 3)}" data-p="${P(p)}"${dir ? ` dir="${dir}"` : ""}${ph ? ` placeholder="${esc(ph)}"` : ""}>${esc(v == null ? "" : v)}</textarea>`
        : `<input class="input" data-p="${P(p)}" value="${esc(v == null ? "" : v)}"${dir ? ` dir="${dir}"` : ""}${ph ? ` placeholder="${esc(ph)}"` : ""}>`}</label>`;
    },
    num(path, label, o) {
      o = o || {}; const v = get(path);
      return `<label class="af af--num"><span class="af__l">${label}${o.hint ? `<small>${o.hint}</small>` : ""}</span><span class="af__num"><input class="input num" type="number" step="${o.step || "any"}"${o.min != null ? ` min="${o.min}"` : ""} data-p="${P(path)}" data-t="num" value="${v == null ? "" : v}">${o.suf ? `<em>${o.suf}</em>` : ""}</span></label>`;
    },
    bool(path, label, o) {
      o = o || {}; const v = get(path); const on = o.invert ? !v : v !== false && v != null && v !== 0 ? !!v : false;
      return `<label class="toggle af-t"><input type="checkbox" data-p="${P(path)}" data-t="${o.invert ? "inv" : "bool"}"${(o.invert ? !v : !!v) ? " checked" : ""}><span class="toggle__sw"></span><span class="toggle__b"><b>${label}</b>${o.hint ? `<small>${o.hint}</small>` : ""}</span></label>`;
    },
    select(path, label, opts) {
      const v = get(path);
      return `<label class="af"><span class="af__l">${label}</span><select class="select" data-p="${P(path)}">${opts.map(o => `<option value="${esc(o[0])}"${String(v) === String(o[0]) ? " selected" : ""}>${esc(o[1])}</option>`).join("")}</select></label>`;
    },
    checks(path, label, opts) {
      const v = get(path) || [];
      return `<fieldset class="af"><legend class="af__l">${label}</legend><div class="af__checks" data-checks="${P(path)}">${opts.map(o => `<label class="af-c"><input type="checkbox" value="${esc(o[0])}"${v.indexOf(o[0]) > -1 ? " checked" : ""}><span>${esc(o[1])}</span></label>`).join("")}</div></fieldset>`;
    },
    color(path, label) { const v = get(path) || "#FF5A36"; return `<label class="af af--color"><span class="af__l">${label}</span><span><input type="color" data-p="${P(path)}" value="${esc(v)}"><code class="num">${esc(v)}</code></span></label>`; },
    img(path, label, o) {
      o = o || {}; const v = get(path) || "";
      return `<div class="af af-img"><span class="af__l">${label}${o.hint ? `<small>${o.hint}</small>` : ""}</span><div class="af-img__b"><span class="af-img__ph${o.logo ? " is-logo" : ""}">${v ? `<img src="${esc(v)}" alt="">` : icon("grid")}</span>
        <span class="af-img__act"><label class="btn btn--line btn--sm">${icon("plus")}${v ? "استبدال" : "رفع صورة"}<input type="file" accept="image/*" hidden data-upload="${P(path)}"${o.logo ? ' data-logo="1"' : ""}></label>
        ${v ? `<button type="button" class="btn btn--ghost btn--sm" data-clear="${P(path)}">إزالة</button>` : ""}<small class="af-img__path num">${esc(v.indexOf("data:") === 0 ? "صورة مرفوعة (تُنشر مع المحتوى)" : v)}</small></span></div></div>`;
    }
  };
  /* قائمة قابلة للإضافة والحذف والترتيب */
  function list(path, label, row, blank, o) {
    o = o || {};
    /* قوائم النصوص المترجمة (الأسئلة، المدن، الشريط…) لها قائمة إنجليزية موازية */
    if (o.tr && TR()) {
      const src = path; path = enPath(path);
      if (get(path) == null) return `<div class="af-list"><div class="af-list__h"><b>${label} <em class="af__lang">EN</em></b></div><p class="muted small">لا توجد نسخة إنجليزية بعد — تظهر العربية في الموقع الإنجليزي.</p><button type="button" class="btn btn--line btn--sm" data-copy-ar="${P(src)}">${icon("plus")}ابدأ الترجمة (انسخ العربي)</button></div>`;
      label += ' <em class="af__lang">EN</em>';
    }
    const arr = get(path) || [];
    return `<div class="af-list"${o.id ? ` id="${o.id}"` : ""}><div class="af-list__h"><b>${label}</b><button type="button" class="btn btn--ghost btn--sm" data-add="${P(path)}" data-blank='${esc(JSON.stringify(blank))}'>${icon("plus")}إضافة</button></div>
      ${arr.map((it, i) => `<div class="af-row">${row(path + "." + i, it, i)}<span class="af-row__act"><button type="button" class="icon-btn" data-move="${P(path)}" data-i="${i}" data-d="-1" aria-label="لأعلى"${i ? "" : " disabled"}>${icon("chevU")}</button><button type="button" class="icon-btn" data-move="${P(path)}" data-i="${i}" data-d="1" aria-label="لأسفل"${i < arr.length - 1 ? "" : " disabled"}>${icon("chevD")}</button><button type="button" class="icon-btn is-del" data-del="${P(path)}" data-i="${i}" aria-label="حذف">${icon("trash")}</button></span></div>`).join("") || `<p class="muted small">لا شيء بعد.</p>`}</div>`;
  }
  const card = (title, body, o) => `<section class="adm-card${o && o.cls ? " " + o.cls : ""}"${o && o.id ? ` id="${o.id}"` : ""}>${title ? `<h3 class="adm-card__t">${title}${o && o.sub ? `<small>${o.sub}</small>` : ""}</h3>` : ""}${body}</section>`;
  const grid2 = (...x) => `<div class="af-grid">${x.join("")}</div>`;

  /* ---------------- محرّر شجري عام (للنصوص) ---------------- */
  const LBL = {
    ticker: "الشريط المتحرك أعلى الموقع", nav: "القائمة والبحث", footer: "الفوتر", home: "الصفحة الرئيسية", hero: "البطل (أول الصفحة)", herd: "القطيع", occasions: "المناسبات",
    how: "كيف تشتغل", uses: "وش بتطبخ؟", services: "خدمات بالطلب", cutband: "قسم السكين (التقطيع مجاني)", carcass: "الذبائح", faq: "الأسئلة", shop: "المتجر", animal: "صفحة الماشية",
    product: "صفحة المنتج", advisorPage: "صفحة المستشار", help: "المساعدة", about: "من نحن", contact: "تواصل معنا", terms: "الشروط والأحكام", privacy: "سياسة الخصوصية",
    title: "العنوان", em: "السطر الملوّن", sub: "النص", kicker: "العنوان الصغير", link: "نص الرابط", cta: "نص الزر", cta1: "الزر الأساسي", cta2: "الزر الثاني", eyebrow: "الشارة",
    s1: "وصف الرقم 1", s2: "وصف الرقم 2", s3: "وصف الرقم 3", go: "نص «ابدأ»", steps: "الخطوات", t: "العنوان", d: "الوصف", freeT: "عنوان السطر المجاني", freeD: "وصف السطر المجاني",
    again: "زر الإعادة", forms: "أشكال التقطيع في الشرائح", btn1: "الزر الأول", btn2: "الزر الثاني", count: "عدد الأسئلة المعروضة", seoTitle: "عنوان الصفحة في جوجل", seoDesc: "وصف الصفحة في جوجل",
    body: "المحتوى (HTML)", updated: "آخر تحديث", formTitle: "عنوان النموذج", ask: "زر اسأل المستشار", empty: "رسالة لا توجد نتائج", carcassSub: "نص الذبائح", free: "شارة التقطيع المجاني",
    howMuch: "عنوان «كم تحتاج؟»", pair: "عنوان «يكمّلها»", pairSub: "نص «يكمّلها»", rules: "عنوان القواعد", note: "ملاحظة", copyright: "حقوق النشر", search: "نص خانة البحث", advisor: "المستشار", extras: "عدّة الشواء"
  };
  const lbl = (k, path) => path === "COPY.footer.about" ? "نبذة الفوتر" : LBL[k] || k;
  function tree(path, v, depth) {
    const k = path.split(".").pop();
    if (isMeta(k)) return "";
    if (k === "forms" && Array.isArray(v)) return F.checks(path, lbl(k, path), Object.keys(draft.PREPS).map(x => [x, draft.PREPS[x].n]));
    if (typeof v === "string") return F.text(path, lbl(k, path), { rows: /body$/.test(path) ? 12 : null });
    if (typeof v === "number") return F.num(path, lbl(k, path));
    if (Array.isArray(v)) {
      if (!v.length || typeof v[0] === "string") return list(path, lbl(k, path), p => F.text(p, "النص"), "", { tr: true });
      const keys = Object.keys(v[0]).filter(x => !isMeta(x));
      return list(path, lbl(k, path), p => keys.map(x => F.text(p + "." + x, lbl(x, x))).join(""), keys.reduce((o, x) => (o[x] = "", o), {}));
    }
    if (v && typeof v === "object") {
      const inner = Object.keys(v).filter(x => !isMeta(x)).map(x => tree(path + "." + x, v[x], depth + 1)).join("");
      return depth ? `<details class="adm-sub"${depth > 1 ? "" : " open"}><summary>${lbl(k, path)}</summary><div class="adm-sub__b">${inner}</div></details>` : inner;
    }
    return "";
  }
  const TOKENS = `<p class="adm-tip">${icon("info")}رموز تُستبدل تلقائياً داخل أي نص: <code>{fee}</code> رسوم التوصيل · <code>{freeOver}</code> حد التوصيل المجاني · <code>{cities}</code> · <code>{windows}</code> · <code>{phone}</code> · <code>{email}</code> · <code>{cr}</code> · <code>{vatNo}</code> · <code>{city}</code> · <code>{hours}</code> · <code>{skewer}</code> · <code>{vacuumKg}</code> · <code>{vacuumCarcass}</code> · <code>{marinades}</code> · <code>{styles}</code> · <code>{cutsCount}</code></p>`;

  /* =========================================================
     التجارة (بأسلوب Shopify): الرئيسية، الطلبات، العملاء، التحليلات، الخصومات، المنتجات
     الأرقام من NUDJ_STATS والرسوم من NUDJ_CHARTS
     ========================================================= */
  const ST = window.NUDJ_STATS, CH = window.NUDJ_CHARTS;
  /* المبالغ الكبيرة بلا كسور، والصغيرة بخانتين */
  const rnd = v => Math.abs(v) >= 1000 ? Math.round(v) : v;
  const cur = v => `${U.money(rnd(v))} <small>ر.س</small>`;
  const sar = v => U.money(rnd(v)) + " ر.س";
  /* الكمية بوحدتها: كجم أو ذبيحة أو كيس/علبة… */
  const qtyTxt = (id, t) => { const p = D.byId(id) || {}; return t.kg ? U.kgTxt(Math.round(t.kg * 10) / 10) : t.qty + " " + (p.sold === "carcass" ? "ذبيحة" : p.unitName || "حبة"); };
  const oid = id => `<bdi class="num">#${esc(id)}</bdi>`;
  const dayF = (t, o) => new Date(t).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", o || { day: "numeric", month: "short" });
  const whenF = t => dayF(t) + " · " + U.fmtTime(t);
  const pctF = v => (Math.round(Math.abs(v) * 10) / 10) + "٪";
  let range = +(sessionStorage.getItem("nudj_adm_range") || 30);
  const RANGES = [[7, "7 أيام"], [30, "30 يوماً"], [90, "90 يوماً"]];
  const rangeSeg = () => `<div class="seg-r" role="group" aria-label="الفترة">${RANGES.map(r => `<button type="button" data-range="${r[0]}" aria-pressed="${range === r[0]}">${r[1]}</button>`).join("")}</div>`;
  const animalsOpts = () => draft.ANIMALS.map(a => [a.k, a.n]).concat([["extra", "عدّة الشواء والبهارات"]]);
  const animalName = k => (animalsOpts().find(a => a[0] === k) || [k, k])[1];
  const stepName = k => k === "cancelled" ? "ملغي" : ((draft.ORDER_STEPS.find(s => s.k === k) || {}).n || k);
  const STC = { placed: "warn", cutting: "info", onway: "violet", done: "ok", cancelled: "mute" };
  const badge = (t, c, dot) => `<span class="bdg bdg--${c}">${dot ? "<i></i>" : ""}${esc(t)}</span>`;
  const stBadge = s => badge(stepName(s), STC[s] || "mute", 1);
  const payBadge = o => o.status === "cancelled" ? badge("ملغي", "mute") : o.payment && o.payment.k === "cod" && o.status !== "done" ? badge("الدفع عند الاستلام", "warn") : badge("مدفوع", "mute-ok");
  const NEXT = { placed: ["cutting", "ابدأ التقطيع", "knife"], cutting: ["onway", "سلّم للمندوب", "truck"], onway: ["done", "تأكيد التسليم", "check"] };
  const custName = o => o.user ? (o.user.name || S.fmtPhone(o.user.phone)) : "ضيف";
  const payName = o => (o.payment && ((draft.CONFIG.payments || []).find(x => x.k === o.payment.k) || {}).n) || (o.payment && o.payment.n) || "—";
  const deltaPill = v => v == null || !isFinite(v) ? "" : `<span class="dlt ${v >= 0 ? "is-up" : "is-down"}">${icon(v >= 0 ? "trendUp" : "trendDown", "", 2.2)}${pctF(v)}</span>`;
  const empty = (ic, t, s, cta) => `<div class="adm-empty">${icon(ic, "", 1.3)}<b>${t}</b>${s ? `<p>${s}</p>` : ""}${cta || ""}</div>`;
  const pageHead = (title, sub, act) => `<div class="adm-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${act ? `<div class="adm-head__act">${act}</div>` : ""}</div>`;
  const thumb = id => { const p = D.byId(id) || draft.PRODUCTS.find(x => x.id === id); return p && p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : `<span class="ph0"></span>`; };
  const pname = (id, fb) => { const p = draft.PRODUCTS.find(x => x.id === id) || D.byId(id); return p ? p.name : fb || id; };
  const demoBar = () => ST.hasDemo() ? `<div class="adm-demo">${icon("info")}<span>الأرقام تشمل <b>بيانات تجريبية للعرض</b> (عملاء باسم «عميل تجريبي») — ليست مبيعات حقيقية.</span><button type="button" class="btn btn--line btn--sm" data-act="demo-clear">حذف البيانات التجريبية</button></div>` : "";
  const noOrders = () => card("", empty("chart", "لا توجد طلبات بعد", "طلبات نسخة العرض محفوظة في متصفح العميل، لذلك تظهر هنا طلبات هذا الجهاز فقط (وعند ربط قاعدة بيانات تظهر كل الطلبات). لتشوف شكل التقارير والرسوم الآن، ولّد بيانات تجريبية واضحة الوسم — تحذفها بضغطة.",
    `<div class="row-btns" style="justify-content:center"><button type="button" class="btn btn--ember" data-act="demo-seed">${icon("spark")}ولّد بيانات تجريبية للعرض</button><a class="btn btn--line" href="index.html" target="_blank">جرّب طلباً من المتجر</a></div>`));
  /* أعمدة أفقية متحركة */
  const hbars = (items, fmt, color) => { const max = Math.max.apply(null, items.map(i => i.v).concat([1])); return items.length ? `<div class="hb">${items.map((it, i) => `<div class="hb__r"><span class="hb__l" title="${esc(it.l)}">${esc(it.l)}</span><span class="hb__t"><i style="--w:${(it.v / max * 100).toFixed(1)}%;--d:${i * 70}ms${it.c || color ? ";--c:" + (it.c || color) : ""}"></i></span><b class="num">${fmt ? fmt(it.v) : it.v}</b></div>`).join("")}</div>` : `<p class="muted small">لا بيانات في هذه الفترة.</p>`; };
  const donutBox = (parts, center, sub) => { const ps = parts.filter(p => p.value > 0); return ps.length ? `<div class="dn">${CH.slot("donut", { parts: ps, center, sub, size: 168 })}<ul class="dn__lg">${ps.map((p, i) => `<li><i style="background:${p.color || CH.PALETTE[i % CH.PALETTE.length]}"></i><span>${esc(p.label)}</span><b class="num">${p.fmt || p.value}</b></li>`).join("")}</ul></div>` : `<p class="muted small">لا بيانات في هذه الفترة.</p>`; };
  const ordersTable = (list, o) => {
    o = o || {};
    return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${o.select ? `<th style="width:34px"><input type="checkbox" data-osel-all aria-label="تحديد الكل"${list.length && list.every(x => oSel.has(x.id)) ? " checked" : ""}></th>` : ""}<th>الطلب</th><th>التاريخ</th><th>العميل</th><th>الإجمالي</th><th>الدفع</th><th>الحالة</th><th>المنتجات</th></tr></thead><tbody>
      ${list.map(x => `<tr data-href="#orders/${encodeURIComponent(x.id)}">${o.select ? `<td><input type="checkbox" data-osel="${esc(x.id)}"${oSel.has(x.id) ? " checked" : ""} aria-label="تحديد"></td>` : ""}<td><b>${oid(x.id)}</b>${x.demo ? " " + badge("تجريبي", "demo") : ""}</td><td>${whenF(x.date)}</td><td>${esc(custName(x))}</td><td class="num">${sar(x.totals.total)}</td><td>${payBadge(x)}</td><td>${stBadge(x.status)}</td><td>${(x.items || []).length} ${(x.items || []).length === 1 ? "منتج" : "منتجات"}</td></tr>`).join("")}</tbody></table></div>`;
  };

  /* ---------------- الرئيسية: ملخص المبيعات والأرباح ---------------- */
  function vHome() {
    const all = ST.orders(), h = new Date().getHours();
    const head = pageHead(h < 12 ? "صباح الخير" : "مساء الخير", "هذا ملخص متجر نُضْج — " + dayF(Date.now(), { weekday: "long", day: "numeric", month: "long" }), rangeSeg());
    const quick = card("اختصارات", `<div class="qlinks"><a href="#products">${icon("tag")}المنتجات والأسعار</a><a href="#sections">${icon("grid")}أقسام الرئيسية</a><a href="#copy">${icon("doc")}نصوص الصفحات</a><a href="#advisor">${icon("chat")}المستشار</a><a href="#settings">${icon("gear")}الدفع والتوصيل</a><a href="#publish">${icon("share")}النشر</a></div>`);
    if (!all.length) return head + noOrders() + quick;
    const k = ST.kpis(range), c = k.cur, s = ST.series(range, 0), sp = ST.series(range, 1), oc = ST.series(range, 0, "orders"), pr = ST.series(range, 0, "profit"), b = ST.breakdown(range), sc = ST.statusCounts();
    const kpi = (label, val, d, spark, color, sub) => `<div class="kpi"><span class="kpi__l">${label}</span><b class="kpi__v">${val}</b><span class="kpi__d">${deltaPill(d)}<small>${sub || "مقابل الفترة السابقة"}</small></span>${spark ? CH.slot("spark", { values: spark, color }) : '<div class="ch"></div>'}</div>`;
    const kpis = `<div class="kpis">${kpi("إجمالي المبيعات", cur(c.gross), k.d.gross, s.values)}${kpi("الطلبات", c.orders, k.d.orders, oc.values, "#3E6FD8")}${kpi("متوسط قيمة الطلب", cur(c.aov), k.d.aov, null)}${kpi("صافي الربح التقديري", c.profit == null ? "—" : cur(c.profit), k.d.profit, c.profit == null ? null : pr.values, "#1F8A70", c.profit == null ? '<a href="#settings" class="link">حدّد نسبة التكلفة</a>' : "")}</div>`;
    const sales = card("المبيعات عبر الوقت", `<div class="ch-head"><b class="ch-head__v">${cur(c.gross)}</b>${deltaPill(k.d.gross)}<span class="ch-legend"><span><i></i>آخر ${range} يوماً</span><span><i class="is-p"></i>الفترة السابقة</span></span></div>` +
      CH.slot("area", { values: s.values, prev: sp.values, labels: s.labels, h: 280, fmt: sar, fmtX: t => dayF(t), fmtTip: t => dayF(t, { weekday: "long", day: "numeric", month: "long" }), names: ["الحالية", "السابقة"] }));
    const vatPct = Math.round((D.CONFIG.vat || .15) * 100);
    const profit = card(`ملخص الأرباح <small>${c.profit == null ? "حدّد نسبة التكلفة لحساب الربح" : "تقديري · " + (ST.costs().assumed ? "تكلفة " + ST.costs().pct + "٪ (افتراض للعرض)" : "تكلفة " + ST.costs().pct + "٪")}</small><a class="link" href="#settings">التكلفة</a>`,
      `<div class="pf-wrap"><div class="pf">
        <div class="pf__r"><span>إجمالي المبيعات</span><b>${cur(c.gross)}</b></div>
        <div class="pf__r is-neg"><span>الضريبة المشمولة (${vatPct}٪)</span><b>− ${cur(c.vat)}</b></div>
        <div class="pf__r is-neg"><span>التوصيل (يُدفع للمندوب)</span><b>− ${cur(c.delivery / (1 + (D.CONFIG.vat || 0)))}</b></div>
        <div class="pf__r is-neg"><span>تكلفة البضاعة والخدمات</span><b>${c.cogs == null ? "—" : "− " + cur(c.cogs)}</b></div>
        <div class="pf__r is-total"><span>صافي الربح التقديري</span><b>${c.profit == null ? "—" : cur(c.profit)}</b></div></div>
        <div class="mring">${CH.slot("donut", { parts: c.profit == null ? [] : [{ label: "الربح", value: Math.max(0, c.profit), color: "#1F8A70" }, { label: "الباقي", value: Math.max(0, c.net - c.profit), color: "#EBEBEB" }], center: c.margin == null ? "—" : Math.round(c.margin) + "٪", sub: "هامش الربح", size: 150 })}</div></div>`);
    const src = card("مصادر الإيراد", donutBox([
      { label: "اللحم", value: c.meat, fmt: sar(c.meat), color: "#FF5A36" }, { label: "الخدمات (تتبيل، تسييخ، تغليف)", value: c.services, fmt: sar(c.services), color: "#E7A33E" },
      { label: "عدّة الشواء والبهارات", value: c.extras, fmt: sar(c.extras), color: "#3E6FD8" }, { label: "التوصيل", value: c.delivery, fmt: sar(c.delivery), color: "#9AA3AB" }
    ], CH.short(c.gross), "ر.س") + (c.discount ? `<p class="muted small" style="margin-top:10px">الخصومات المطبّقة: − ${sar(c.discount)}</p>` : ""));
    const maxTop = Math.max.apply(null, b.top.slice(0, 5).map(t => t.v).concat([1]));
    const top = card(`الأكثر مبيعاً <a class="link" href="#analytics">التحليلات</a>`, b.top.length ? `<div class="tp">${b.top.slice(0, 5).map(t => `<a href="#products" data-find-product="${esc(t.id)}">${thumb(t.id)}<span class="tp__b"><b>${esc(pname(t.id))}</b><small>${qtyTxt(t.id, t)}</small><span class="tp__bar"><i style="--w:${(t.v / maxTop * 100).toFixed(1)}%"></i></span></span><span class="tp__v num">${sar(t.v)}</span></a>`).join("")}</div>` : `<p class="muted small">لا بيانات في هذه الفترة.</p>`);
    const byAnimal = card("المبيعات حسب الماشية", hbars(Object.keys(b.animal).map(a => ({ l: animalName(a), v: Math.round(b.animal[a]) })).sort((x, y) => y.v - x.v), v => sar(v)));
    const flow = ["placed", "cutting", "onway", "done", "cancelled"];
    const status = card(`حالة الطلبات <a class="link" href="#orders">كل الطلبات</a>`, `<div class="stl">${flow.map(f => `<a href="#orders" data-otab="${f}"><span>${stBadge(f)}</span><b class="num">${sc[f] || 0}</b></a>`).join("")}</div><p class="muted small" style="margin-top:10px">${sc.placed ? `<b>${sc.placed}</b> طلب بانتظار التجهيز` : "لا طلبات بانتظار التجهيز"}</p>`);
    const recent = `<section class="adm-card adm-card--flush"><h3 class="adm-card__t" style="padding:14px 16px 0">آخر الطلبات <a class="link" href="#orders">عرض الكل</a></h3>${ordersTable(all.slice(0, 6))}</section>`;
    return head + demoBar() + kpis + sales + `<div class="adm-grid adm-grid--main">${profit}${src}</div><div class="adm-grid adm-grid--3">${top}${byAnimal}${status}</div>` + recent;
  }

  /* ---------------- الطلبات ---------------- */
  let oTab = "all", oQ = "", oLimit = 50;
  const oSel = new Set();
  function vOrders() {
    const all = ST.orders(), sc = ST.statusCounts();
    const tabs = [["all", "الكل", all.length], ["placed", stepName("placed"), sc.placed], ["cutting", stepName("cutting"), sc.cutting], ["onway", stepName("onway"), sc.onway], ["done", stepName("done"), sc.done], ["cancelled", "ملغية", sc.cancelled]];
    const q = oQ.trim();
    const rows = all.filter(o => (oTab === "all" || o.status === oTab) && (!q || (o.id + " " + custName(o) + " " + ((o.user || {}).phone || "")).indexOf(q) > -1));
    Array.from(oSel).forEach(id => { if (!all.some(o => o.id === id)) oSel.delete(id); });
    const head = pageHead("الطلبات", "غيّر مرحلة أي طلب وتتحدث فاتورة العميل ومراحلها الأربع مباشرة.",
      `<button type="button" class="btn btn--line btn--sm" data-export="orders">${icon("download")}تصدير CSV</button>${all.length ? "" : `<button type="button" class="btn btn--ember btn--sm" data-act="demo-seed">${icon("spark")}بيانات تجريبية</button>`}`);
    if (!all.length) return head + noOrders();
    const bulk = oSel.size ? `<div class="tbl-bulk"><b>تم تحديد ${oSel.size}</b><span class="muted">نقل إلى:</span>${["cutting", "onway", "done"].map(s => `<button type="button" class="btn btn--line btn--sm" data-bulk="${s}">${esc(stepName(s))}</button>`).join("")}<button type="button" class="btn btn--ghost btn--sm btn--danger-t" data-bulk="cancelled">إلغاء</button><button type="button" class="link small" data-osel-none>إلغاء التحديد</button></div>` : "";
    return head + demoBar() + `<section class="adm-card adm-card--flush"><div class="tbl-tabs">${tabs.map(t => `<button type="button" data-otab="${t[0]}" aria-pressed="${oTab === t[0]}">${esc(t[1])}<small class="num">${t[2]}</small></button>`).join("")}</div>
      <div class="tbl-bar"><input class="input" type="search" placeholder="ابحث برقم الطلب أو اسم العميل أو الجوال" data-oq value="${esc(oQ)}"></div>${bulk}
      ${rows.length ? ordersTable(rows.slice(0, oLimit), { select: true }) + (rows.length > oLimit ? `<div class="tbl-more"><button type="button" class="btn btn--line btn--sm" data-omore>عرض ${Math.min(50, rows.length - oLimit)} طلب إضافي</button></div>` : "") : `<div style="padding:10px 16px 20px">${empty("search", "لا طلبات مطابقة", "جرّب تبويباً آخر أو امسح البحث.")}</div>`}
      <div class="tbl-foot">يعرض ${Math.min(rows.length, oLimit)} من ${rows.length} · الإجمالي ${all.length} طلب محفوظ على هذا الجهاز</div></section>` +
      card("مراحل الطلب", `<p class="muted small">الأسماء والأوصاف التي يراها العميل في صفحة طلبه.</p>` + draft.ORDER_STEPS.map((s, i) => grid2(F.text(`ORDER_STEPS.${i}.n`, `المرحلة ${i + 1}`), F.text(`ORDER_STEPS.${i}.d`, "الوصف"))).join(""));
  }

  /* ---------------- تفاصيل طلب ---------------- */
  function vOrder(id) {
    const o = ST.get(id);
    if (!o) return pageHead(`<a class="icon-btn" href="#orders" aria-label="رجوع">${icon("chevR")}</a>الطلب`) + card("", empty("receipt", "الطلب غير موجود", "ربما حُذف أو محفوظ على جهاز آخر.", `<a class="btn btn--line" href="#orders">كل الطلبات</a>`));
    const m = ST.metrics(o), nx = NEXT[o.status], t = o.totals || {};
    const flow = ["placed", "cutting", "onway", "done"], ci = flow.indexOf(o.status);
    const act = `${nx ? `<button type="button" class="btn btn--ember btn--sm" data-ostatus="${esc(o.id)}" data-to="${nx[0]}">${icon(nx[2])}${nx[1]}</button>` : ""}${o.status !== "cancelled" && o.status !== "done" ? `<button type="button" class="btn btn--line btn--sm btn--danger-t" data-ostatus="${esc(o.id)}" data-to="cancelled">إلغاء الطلب</button>` : ""}${o.demo ? "" : `<a class="btn btn--line btn--sm" href="order.html?id=${encodeURIComponent(o.id)}" target="_blank">${icon("receipt")}فاتورة العميل</a>`}<button type="button" class="icon-btn is-del" data-del-order="${esc(o.id)}" aria-label="حذف الطلب">${icon("trash")}</button>`;
    const head = `<div class="adm-head"><a class="icon-btn" href="#orders" aria-label="رجوع للطلبات">${icon("chevR")}</a><div><h1>${oid(o.id)}${payBadge(o)}${stBadge(o.status)}${o.demo ? badge("تجريبي", "demo") : ""}</h1><p>${dayF(o.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${U.fmtTime(o.date)}</p></div><div class="adm-head__act">${act}</div></div>`;
    const steps = o.status === "cancelled" ? `<p class="bdg bdg--mute" style="margin-bottom:10px">أُلغي هذا الطلب</p>` : `<ol class="ostep">${flow.map((f, i) => `<li class="${i < ci || o.status === "done" ? "done" : i === ci ? "now" : ""}">${esc(stepName(f))}</li>`).join("")}</ol>`;
    const items = card(`المنتجات <small>${(o.items || []).length}</small>`, steps + (o.items || []).map(it => {
      const qty = it.kg ? U.kgTxt(it.kg) : (it.qty || 1) + " ×";
      return `<div class="oit">${thumb(it.id)}<span class="oit__b"><b>${esc(pname(it.id, it.name))}</b><small>${esc(U.optsText(it) || "").replace(/&amp;/g, "&")}${(it.adds || []).length ? " · " + it.adds.map(a => esc(a.n)).join("، ") : ""}${it.src === "advisor" ? " · من المستشار" : ""}</small></span><span class="oit__q num">${qty} ${U.money(it.unit || 0)}</span><span class="oit__p num">${sar(it.price || it.base || 0)}</span></div>`;
    }).join("") + `<div class="osum"><div><span>اللحم</span><b class="num">${sar(t.meat || 0)}</b></div>${t.services ? `<div><span>الخدمات</span><b class="num">${sar(t.services)}</b></div>` : ""}${t.extras ? `<div><span>عدّة الشواء والبهارات</span><b class="num">${sar(t.extras)}</b></div>` : ""}${t.discount ? `<div><span>خصم ${esc(t.coupon || "")}</span><b class="num">− ${sar(t.discount)}</b></div>` : ""}<div><span>التوصيل</span><b class="num">${t.delivery ? sar(t.delivery) : "مجاني"}</b></div><div class="muted"><span>منها ضريبة</span><span class="num">${sar(t.vat || 0)}</span></div><div class="is-total"><span>الإجمالي</span><b class="num">${sar(t.total || 0)}</b></div></div>`);
    const log = (o.log && o.log.length ? o.log : [{ s: "placed", t: o.date }]).slice().reverse();
    const tl = card("السجل", `<ol class="tl">${log.map(e => `<li><span></span><span>${esc(stepName(e.s))}</span><small class="num">${whenF(e.t)}</small></li>`).join("")}</ol>`);
    const u = o.user || {}, cnt = ST.orders().filter(x => x.user && u.phone && x.user.phone === u.phone).length, a = o.address;
    const side = card("العميل", `<div class="kv"><b>${esc(u.name || "بدون اسم")}</b>${u.phone ? `<a href="#orders?q=${encodeURIComponent(u.phone)}" class="num" dir="ltr">${S.fmtPhone(u.phone)}</a>` : ""}<span class="muted small">${cnt} ${cnt === 1 ? "طلب" : "طلبات"}</span></div>
      ${a ? `<div class="kv"><h4>عنوان التوصيل</h4><span>${esc(a.label || "")}</span><span class="muted small">${esc(A.addrLine(a))}</span>${a.notes ? `<span class="muted small">${esc(a.notes)}</span>` : ""}</div>` : ""}
      ${o.slot ? `<div class="kv"><h4>موعد التوصيل</h4><span>${o.slot.date ? dayF(o.slot.date, { weekday: "long", day: "numeric", month: "long" }) : esc(o.slot.dateLabel || "")} · ${esc(((draft.CONFIG.windows || []).find(w => w.h === o.slot.h) || {}).l || o.slot.time || "")}</span></div>` : ""}
      <div class="kv"><h4>الدفع</h4><span>${esc(payName(o))}</span></div>`) +
      card("ربحية الطلب <small>تقديري</small>", m.profit == null ? `<p class="muted small">حدّد نسبة التكلفة من <a class="link" href="#settings">الإعدادات</a>.</p>` : `<div class="pf"><div class="pf__r"><span>صافي المبيعات</span><b>${cur(m.net)}</b></div><div class="pf__r is-neg"><span>التكلفة</span><b>− ${cur(m.cogs)}</b></div><div class="pf__r is-total"><span>الربح</span><b>${cur(m.profit)}</b></div></div>`);
    return head + `<div class="adm-grid adm-grid--main"><div class="adm-grid">${items}${tl}</div><div class="adm-grid">${side}</div></div>`;
  }

  /* ---------------- العملاء ---------------- */
  let cQ = "";
  function vCustomers() {
    const all = ST.customers(), q = cQ.trim();
    const list = all.filter(c => !q || (c.name + " " + c.phone).indexOf(q) > -1);
    const head = pageHead("العملاء", "من الطلبات المسجّلة — الاسم والجوال وعدد الطلبات وقيمتها.", `<button type="button" class="btn btn--line btn--sm" data-export="customers">${icon("download")}تصدير CSV</button>`);
    if (!all.length) return head + noOrders();
    const rep = all.filter(c => c.orders > 1).length, spent = all.reduce((t, c) => t + c.spent, 0);
    const kp = `<div class="kpis kpis--3"><div class="kpi"><span class="kpi__l">العملاء</span><b class="kpi__v">${all.length}</b></div><div class="kpi"><span class="kpi__l">عملاء متكررون</span><b class="kpi__v">${Math.round(rep / all.length * 100)}٪ <small>(${rep})</small></b></div><div class="kpi"><span class="kpi__l">متوسط إنفاق العميل</span><b class="kpi__v">${cur(spent / all.length)}</b></div></div>`;
    return head + demoBar() + kp + `<section class="adm-card adm-card--flush"><div class="tbl-bar"><input class="input" type="search" placeholder="ابحث بالاسم أو الجوال" data-cq value="${esc(cQ)}"></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>العميل</th><th>الجوال</th><th>المدينة</th><th>الطلبات</th><th>إجمالي الإنفاق</th><th>آخر طلب</th></tr></thead><tbody>
      ${list.map(c => `<tr data-href="#orders?q=${encodeURIComponent(c.phone || c.name)}"><td><span class="cust"><span class="cust__av">${esc((c.name || "؟").trim().slice(0, 1))}</span><b>${esc(c.name || "بدون اسم")}</b>${c.demo ? " " + badge("تجريبي", "demo") : ""}</span></td><td class="num" dir="ltr" style="text-align:end">${c.phone ? S.fmtPhone(c.phone) : "—"}</td><td>${esc(c.city || "—")}</td><td class="num">${c.orders}</td><td class="num">${sar(c.spent)}</td><td>${dayF(c.last)}</td></tr>`).join("")}</tbody></table></div>
      <div class="tbl-foot">${list.length} عميل</div></section>`;
  }

  /* ---------------- التحليلات ---------------- */
  function vAnalytics() {
    const all = ST.orders();
    const head = pageHead("التحليلات", "أداء المتجر في الفترة المختارة مقارنة بالفترة السابقة.", rangeSeg());
    if (!all.length) return head + noOrders();
    const k = ST.kpis(range), c = k.cur, b = ST.breakdown(range);
    const oc = ST.series(range, 0, "orders"), ocp = ST.series(range, 1, "orders"), pr = ST.series(range, 0, "profit"), prp = ST.series(range, 1, "profit");
    const area = (title, v, p, fmt, color, total, d) => card(title, `<div class="ch-head"><b class="ch-head__v">${total}</b>${deltaPill(d)}</div>` + CH.slot("area", { values: v.values, prev: p.values, labels: v.labels, h: 220, fmt, color, fmtX: t => dayF(t), fmtTip: t => dayF(t, { weekday: "long", day: "numeric", month: "long" }), names: ["الحالية", "السابقة"] }));
    const WD = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const winL = h => ((draft.CONFIG.windows || []).find(w => w.h === +h) || {}).l || h + ":00";
    const n = b.count || 1;
    const payParts = Object.keys(b.pay).map((pk, i) => ({ label: ((draft.CONFIG.payments || []).find(x => x.k === pk) || {}).n || pk, value: b.pay[pk].n, fmt: b.pay[pk].n + " طلب", color: CH.PALETTE[i % CH.PALETTE.length] }));
    const marNames = k2 => (draft.MARINADES.find(m2 => m2.k === k2) || {}).n || k2;
    return head + demoBar() +
      `<div class="kpis"><div class="kpi"><span class="kpi__l">إجمالي المبيعات</span><b class="kpi__v">${cur(c.gross)}</b><span class="kpi__d">${deltaPill(k.d.gross)}</span></div><div class="kpi"><span class="kpi__l">الطلبات</span><b class="kpi__v">${c.orders}</b><span class="kpi__d">${deltaPill(k.d.orders)}</span></div><div class="kpi"><span class="kpi__l">الكمية المباعة</span><b class="kpi__v">${U.kgTxt(Math.round(c.kg))}</b><span class="kpi__d"><small>لحم</small></span></div><div class="kpi"><span class="kpi__l">العملاء</span><b class="kpi__v">${c.customers}</b><span class="kpi__d">${deltaPill(k.d.customers)}</span></div></div>` +
      `<div class="adm-grid adm-grid--2">${area("الطلبات عبر الوقت", oc, ocp, v => v + " طلب", "#3E6FD8", c.orders, k.d.orders)}${c.profit == null ? card("الربح التقديري عبر الوقت", `<p class="muted small">حدّد نسبة التكلفة من <a class="link" href="#settings">الإعدادات</a> لعرض الربح.</p>`) : area("الربح التقديري عبر الوقت", pr, prp, sar, "#1F8A70", cur(c.profit), k.d.profit)}</div>` +
      `<div class="adm-grid adm-grid--3">${card("المبيعات حسب اليوم", hbars(WD.map((d, i) => ({ l: d, v: Math.round(b.week[i]) })), sar, "#FF5A36"))}${card("حسب فترة التوصيل", hbars(Object.keys(b.slot).sort((x, y) => x - y).map(h => ({ l: winL(h), v: b.slot[h] })), v => v + " طلب", "#8C6FD1"))}${card("حسب المدينة", hbars(Object.keys(b.city).map(ck => ({ l: S.cityLabel ? S.cityLabel(ck) : ck, v: Math.round(b.city[ck]) })).sort((x, y) => y.v - x.v).slice(0, 6), sar, "#1F8A70"))}</div>` +
      `<div class="adm-grid adm-grid--3">${card("طرق الدفع", donutBox(payParts, String(b.count), "طلب"))}${card("حصة المستشار من المبيعات", donutBox([{ label: "من المستشار", value: b.advisorShare, fmt: Math.round(b.advisorShare) + "٪", color: "#FF5A36" }, { label: "شراء مباشر", value: 100 - b.advisorShare, fmt: Math.round(100 - b.advisorShare) + "٪", color: "#D9D9D9" }], Math.round(b.advisorShare) + "٪", "المستشار"))}${card("الخدمات الإضافية <small>نسبة الطلبات</small>", hbars([{ l: "التتبيل", v: Math.round(b.svc.marinade / n * 100) }, { l: "التسييخ", v: Math.round(b.svc.skewer / n * 100) }, { l: "التغليف المفرّغ", v: Math.round(b.svc.vacuum / n * 100) }], v => v + "٪", "#E7A33E") + `<h4 style="margin:16px 0 8px;font-size:.8rem">التتبيلات الأكثر طلباً</h4>` + hbars(Object.keys(b.mar).map(mk => ({ l: marNames(mk), v: Math.round(b.mar[mk] * 10) / 10 })).sort((x, y) => y.v - x.v), v => U.kgTxt(v), "#E7A33E"))}</div>` +
      card("المنتجات حسب المبيعات", `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المنتج</th><th>الماشية</th><th>الكمية</th><th>المبيعات</th><th>الحصة</th></tr></thead><tbody>${b.top.slice(0, 12).map(t => { const p = D.byId(t.id) || {}; const tot = b.top.reduce((x, y) => x + y.v, 0) || 1; return `<tr><td><span class="cust">${thumb(t.id).replace("<img", '<img class="pth"')}<b>${esc(pname(t.id))}</b></span></td><td>${esc(animalName(p.animal))}</td><td class="num">${qtyTxt(t.id, t)}</td><td class="num">${sar(t.v)}</td><td class="num">${(t.v / tot * 100).toFixed(1)}٪</td></tr>`; }).join("")}</tbody></table></div>`, { cls: "adm-card--flushbody" });
  }

  /* ---------------- الخصومات ---------------- */
  function vDiscounts() {
    const LF = TR() ? "label_en" : "label";
    const coupons = Object.keys(draft.CONFIG.coupons || {}).map(code => ({ code, pct: draft.CONFIG.coupons[code].pct, label: draft.CONFIG.coupons[code].label, label_en: draft.CONFIG.coupons[code].label_en }));
    const use = {}; ST.orders().forEach(o => { const cp = o.totals && o.totals.coupon; if (!cp || o.status === "cancelled") return; const u = use[cp] = use[cp] || { n: 0, d: 0, s: 0 }; u.n++; u.d += o.totals.discount || 0; u.s += o.totals.total || 0; });
    return pageHead("الخصومات", "أكواد الخصم تنطبق على اللحوم فقط (لا تشمل الخدمات وعدّة الشواء).", `<button type="button" class="btn btn--ember btn--sm" data-act="coupon-add">${icon("plus")}كود جديد</button>`) +
      `<section class="adm-card adm-card--flush"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>الكود</th><th>الوصف</th><th>الخصم</th><th>الحالة</th><th>الاستخدام</th><th>قيمة الخصومات</th><th>مبيعات بالكود</th></tr></thead><tbody>
      ${coupons.map(c => { const u = use[c.code] || { n: 0, d: 0, s: 0 }; return `<tr><td><b class="num">${esc(c.code)}</b></td><td>${esc(c[LF] || c.label || "")}</td><td class="num">${c.pct}٪</td><td>${badge("نشط", "ok", 1)}</td><td class="num">${u.n}</td><td class="num">${sar(u.d)}</td><td class="num">${sar(u.s)}</td></tr>`; }).join("") || `<tr><td colspan="7" class="muted">لا أكواد بعد.</td></tr>`}</tbody></table></div></section>` +
      card("تعديل الأكواد", `<div class="af-list">${coupons.map((c, i) => `<div class="af-row">${grid2(`<label class="af"><span class="af__l">الكود</span><input class="input num" dir="ltr" data-coupon="${i}" data-f="code" value="${esc(c.code)}"></label>`, `<label class="af"><span class="af__l">الخصم ٪</span><input class="input num" type="number" data-coupon="${i}" data-f="pct" value="${c.pct}"></label>`, `<label class="af"><span class="af__l">الوصف${TR() ? ' <em class="af__lang">EN</em>' : ""}</span><input class="input" data-coupon="${i}" data-f="${LF}" value="${esc(c[LF] || "")}"${TR() ? ` dir="ltr" placeholder="${esc(c.label)}"` : ""}></label>`)}<span class="af-row__act"><button type="button" class="icon-btn is-del" data-coupon-del="${esc(c.code)}" aria-label="حذف">${icon("trash")}</button></span></div>`).join("") || `<p class="muted small">لا أكواد.</p>`}</div>`);
  }

  /* ---------------- المنتجات ---------------- */
  let pFilter = "all", pSearch = "";
  function vProducts() {
    const b = ST.breakdown(30), sold = {}; b.top.forEach(t => { sold[t.id] = t; });
    const rows = draft.PRODUCTS.map((p, i) => [p, i]).filter(([p]) => (pFilter === "all" || p.animal === pFilter) && (!pSearch || (p.name + " " + p.code + " " + p.id).indexOf(pSearch) > -1));
    const live = draft.PRODUCTS.filter(p => !p.hidden).length;
    return pageHead("المنتجات", `${live} ظاهر من ${draft.PRODUCTS.length} منتج · الأسعار شاملة الضريبة`, `<button type="button" class="btn btn--ember btn--sm" data-act="new-product">${icon("plus")}منتج جديد</button>`) +
      `<section class="adm-card adm-card--flush"><div class="tbl-tabs">${[["all", "الكل"]].concat(animalsOpts()).map(a => `<button type="button" data-pf="${a[0]}" aria-pressed="${pFilter === a[0]}">${esc(a[1])}<small class="num">${a[0] === "all" ? draft.PRODUCTS.length : draft.PRODUCTS.filter(p => p.animal === a[0]).length}</small></button>`).join("")}</div>
      <div class="tbl-bar"><input class="input" type="search" placeholder="ابحث بالاسم أو الكود" data-psearch value="${esc(pSearch)}"></div>
      <div class="tbl-wrap"><table class="tbl tbl--prod"><thead><tr><th style="width:52px"></th><th>المنتج</th><th>الحالة</th><th>الماشية</th><th>السعر</th><th>مبيعات 30 يوماً</th><th></th></tr></thead><tbody>
      ${rows.map(([p, i]) => { const s = sold[p.id]; return `<tr class="${p.hidden ? "is-off" : ""}"><td>${p.img ? `<img class="pth" src="${esc(p.img)}" alt="" loading="lazy">` : `<span class="pth"></span>`}</td>
        <td><b>${esc(p.name)}</b><br><small class="muted num">${esc(p.code || "")} · ${p.sold === "kg" ? "بالكيلو" : p.sold === "carcass" ? "ذبيحة" : "بالحبة"}</small></td>
        <td><label class="toggle toggle--mini" title="ظاهر في المتجر"><input type="checkbox" data-p="PRODUCTS.${i}.hidden" data-t="inv"${p.hidden ? "" : " checked"}><span class="toggle__sw"></span></label> ${p.hidden ? badge("مخفي", "mute") : badge("نشط", "ok")}</td>
        <td>${esc(animalName(p.animal))}</td>
        <td>${p.sold === "carcass" ? `<span class="num">${(p.sizes || []).map(z => U.money(z.p)).join(" / ")}</span>` : `<span class="pin-price"><input class="input input--sm num" type="number" step="any" data-p="PRODUCTS.${i}.price" data-t="num" value="${p.price}"><small>${p.sold === "kg" ? "ر.س/كجم" : "ر.س"}</small></span>`}</td>
        <td class="num">${s ? sar(s.v) + `<br><small class="muted">${qtyTxt(p.id, s)}</small>` : "—"}</td>
        <td><button type="button" class="btn btn--line btn--sm" data-edit-product="${i}">${icon("edit")}تعديل</button></td></tr>`; }).join("") || `<tr><td colspan="7" class="muted">لا نتائج.</td></tr>`}</tbody></table></div>
      <div class="tbl-foot">${rows.length} منتج</div></section>`;
  }

  function productForm(i) {
    const p = draft.PRODUCTS[i], b = `PRODUCTS.${i}`;
    const an = draft.ANIMALS.find(a => a.k === p.animal);
    const zones = an ? Object.keys(an.pins || {}) : [];
    return `<div class="adm-form">
      ${F.img(b + ".img", "الصورة الرئيسية", { hint: "مربعة 1:1" })}
      ${grid2(F.text(b + ".name", "الاسم"), F.text(b + ".code", "الكود", { dir: "ltr" }))}
      ${F.text(b + ".short", "وصف مختصر (يظهر على البطاقة)")}
      ${F.text(b + ".info", "معلومات القطعة", { rows: 3 })}
      ${grid2(F.select(b + ".animal", "الماشية", animalsOpts()), F.select(b + ".sold", "طريقة البيع", [["kg", "بالكيلو"], ["carcass", "ذبيحة بالحجم"], ["piece", "بالحبة"]]))}
      ${p.sold === "carcass" ? list(b + ".sizes", "الأحجام والأسعار", q => grid2(F.text(q + ".l", "الاسم"), F.num(q + ".kg", "الوزن", { suf: "كجم" }), F.num(q + ".p", "السعر", { suf: "ر.س" }), F.text(q + ".k", "المعرّف", { dir: "ltr" })), { k: "x" + Date.now().toString(36).slice(-3), l: "", kg: 10, p: 1000 })
        : grid2(F.num(b + ".price", p.sold === "kg" ? "السعر للكيلو" : "السعر", { suf: "ر.س" }), p.sold === "piece" ? F.text(b + ".unitName", "الوحدة", { ph: "كيس، علبة، طقم" }) : F.select(b + ".zone", "مكانها على الرسم", [["", "بدون موقع"]].concat(zones.map(z => [z, draft.ZONES[z] || z])))) }
      ${p.sold === "kg" ? F.checks(b + ".preps", "أشكال التقطيع المتاحة (مجانية)", Object.keys(draft.PREPS).map(k => [k, draft.PREPS[k].n])) + F.select(b + ".prepDef", "التقطيع الافتراضي", (p.preps || []).map(k => [k, (draft.PREPS[k] || {}).n || k])) : ""}
      ${p.animal !== "extra" ? F.checks(b + ".uses", "تنفع لـ", Object.keys(draft.USES).map(k => [k, draft.USES[k].n])) : ""}
      ${p.animal !== "extra" ? grid2(F.num(b + ".spec.0", "الطراوة (0–5)", { step: 1, min: 0 }), F.num(b + ".spec.1", "الدهن (0–5)", { step: 1, min: 0 }), F.num(b + ".spec.2", "النكهة (0–5)", { step: 1, min: 0 })) + F.bool(b + ".bone", "بالعظم") : ""}
      ${F.bool(b + ".hidden", "مخفي من الموقع", { hint: "يبقى في السلات والطلبات السابقة" })}
      <label class="af af--num"><span class="af__l">تكلفة المنتج<small>٪ من صافي سعر البيع · فارغ = النسبة العامة (${ST.costs().pct == null ? "غير محددة" : ST.costs().pct + "٪"}) · لا تُنشر</small></span><span class="af__num"><input class="input num" type="number" min="0" max="100" step="1" data-cost-id="${esc(p.id)}" value="${ST.costs().byId[p.id] == null ? "" : ST.costs().byId[p.id]}"><em>٪</em></span></label>
      <div class="row-btns"><button type="button" class="btn btn--ghost btn--danger-t" data-del-product="${i}">${icon("trash")}حذف المنتج</button></div>
    </div>`;
  }
  function openProduct(i) {
    const body = document.createElement("div");
    const paint = () => { body.innerHTML = productForm(i); };
    paint();
    body.addEventListener("change", e => { if (e.target.matches('[data-p$=".sold"],[data-p$=".animal"],[data-checks$=".preps"] input')) setTimeout(paint, 50); });
    bindFields(body, paint);
    body.addEventListener("input", e => { const t = e.target; if (t.matches("[data-cost-id]")) { const c = ST.costs(); if (t.value === "") delete c.byId[t.dataset.costId]; else c.byId[t.dataset.costId] = Math.max(0, Math.min(100, +t.value)); ST.setCost({ byId: c.byId }); } });
    const sh = A.openSheet({ title: draft.PRODUCTS[i].name || "منتج", body, cls: "sheet--adm", onClose: () => render() });
    body.addEventListener("click", async e => {
      if (!e.target.closest("[data-del-product]")) return;
      if (!(await A.confirmSheet({ title: "حذف المنتج؟", text: "الأفضل إخفاؤه إن كان في طلبات سابقة.", ok: "حذف", danger: true }))) return;
      draft.PRODUCTS.splice(i, 1); save(); sh.close(); A.toast("حُذف المنتج", { icon: "trash" });
    });
  }

  function vHerd() {
    return draft.ANIMALS.map((a, i) => card(`${esc(a.n)} <small class="num">${esc(a.en)}</small>`, `${grid2(F.text(`ANIMALS.${i}.n`, "الاسم"), F.text(`ANIMALS.${i}.en`, "الاسم بالإنجليزي", { dir: "ltr" }), F.text(`ANIMALS.${i}.code`, "حرف الكود", { dir: "ltr" }))}
      ${F.text(`ANIMALS.${i}.note`, "الوصف")}
      ${F.img(`ANIMALS.${i}.art`, "الرسم الخطي", { hint: "أبيض على خلفية شفافة — فارغ = الرسم الحالي", logo: true })}
      <div class="af"><span class="af__l">مواقع القطعيات على الرسم<small>اسحب أي نقطة لمكانها</small></span>
      <div class="pins-ed" data-pins="${i}" style="aspect-ratio:${(a.ratio || 1.3).toFixed(3)}"><img src="${esc(a.art || "assets/img/herd/" + a.k + ".png")}" alt="">
        ${Object.keys(a.pins || {}).map(z => `<span class="pins-ed__p" data-zone="${esc(z)}" style="left:${a.pins[z][0]}%;top:${a.pins[z][1]}%">${esc(draft.ZONES[z] || z)}</span>`).join("")}</div>
      <div class="af__checks">${zoneKeys().map(z => `<label class="af-c"><input type="checkbox" data-zone-toggle="${i}" value="${z}"${a.pins && a.pins[z] ? " checked" : ""}><span>${esc(draft.ZONES[z])}</span></label>`).join("")}</div></div>
      <div class="row-btns"><button type="button" class="btn btn--ghost btn--sm btn--danger-t" data-del-animal="${i}">${icon("trash")}حذف الماشية</button></div>`)).join("") +
      card("إضافة ماشية", `<div class="row-btns"><button type="button" class="btn btn--line" data-act="new-animal">${icon("plus")}ماشية جديدة</button></div>`) +
      card("أسماء مناطق الذبيحة", grid2(...zoneKeys().map(z => F.text(`ZONES.${z}`, z))));
  }

  function vServices() {
    return card("أشكال التقطيع (مجانية)", Object.keys(draft.PREPS).map(k => grid2(F.text(`PREPS.${k}.n`, "الاسم"), F.text(`PREPS.${k}.d`, "الوصف"), F.bool(`PREPS.${k}.skew`, "قابل للتسييخ"))).join("")) +
      card("التتبيلات (مدفوعة بالكيلو)", list("MARINADES", "التتبيلات", p => grid2(F.text(p + ".n", "الاسم"), F.text(p + ".d", "المكوّنات"), F.num(p + ".p", "السعر", { suf: "ر.س/كجم" }), F.text(p + ".k", "المعرّف", { dir: "ltr" })), { k: "m" + Date.now().toString(36).slice(-4), n: "", d: "", p: 10 })) +
      card("خدمات", grid2(F.text("SERVICES.skewer.n", "التسييخ — الاسم"), F.text("SERVICES.skewer.d", "الوصف"), F.num("SERVICES.skewer.p", "السعر", { suf: "ر.س/كجم" })) +
        grid2(F.text("SERVICES.vacuum.n", "التغليف — الاسم"), F.text("SERVICES.vacuum.d", "الوصف"), F.num("SERVICES.vacuum.p", "للكيلو", { suf: "ر.س" }), F.num("SERVICES.vacuum.carcass", "للذبيحة", { suf: "ر.س" }))) +
      card("أساليب تقطيع الذبيحة", list("STYLES", "الأساليب", p => grid2(F.text(p + ".n", "الاسم"), F.text(p + ".d", "الوصف"), F.text(p + ".k", "المعرّف", { dir: "ltr" })), { k: "s" + Date.now().toString(36).slice(-4), n: "", d: "" })) +
      card("الطبخات (فلاتر المتجر)", grid2(...Object.keys(draft.USES).map(k => F.text(`USES.${k}.n`, k))));
  }

  const QDEF = { occ: "رسالة الترحيب", people: "سؤال العدد", forms: "مشاوي: شكل التقطيع", gAnimal: "مشاوي: نوع اللحم", marinade: "التتبيلة", skewer: "التسييخ", tools: "عدّة الشواء", dish: "العزومة: الطبخة", fAnimal: "العزومة: اللحم", bone: "بالعظم أو بدون", spice: "البهارات", trays: "الصواني", cAnimal: "الذبيحة: النوع", style: "الذبيحة: التقطيع", vacuum: "التغليف", cSpice: "الذبيحة: البهارات", steakCut: "الستيك: النوع", where: "الستيك: فحم أو مقلاة", sMarinade: "الستيك: التتبيلة", days: "الأسبوع: الأيام", items: "الأسبوع: الطبخات", wAnimal: "الأسبوع: اللحم", qAnimal: "سؤال عن قطعة: الماشية" };
  function vAdvisor() {
    const G = "ADVISOR.grams";
    return card("قواعد الكميات", grid2(F.num(G + ".grill", "مشاوي بدون عظم", { suf: "جم/شخص" }), F.num(G + ".grillBone", "مشاوي بالعظم", { suf: "جم/شخص" }), F.num(G + ".kabsa", "كبسة ومندي بالعظم", { suf: "جم/شخص" }), F.num(G + ".kabsaBoneless", "كبسة بدون عظم", { suf: "جم/شخص" }),
        F.num(G + ".steak", "ستيك", { suf: "جم/شخص" }), F.num(G + ".stew", "مرق وإيدام", { suf: "جم/شخص" }), F.num(G + ".oven", "فرن", { suf: "جم/شخص" }), F.num(G + ".dailyDay", "طبخ يومي", { suf: "جم/شخص/يوم" })) +
      grid2(F.num("ADVISOR.charcoalKgPerBag", "كيس فحم يكفي", { suf: "كجم لحم" }), F.num("ADVISOR.skewerKgPerSet", "طقم أسياخ يكفي", { suf: "كجم" }), F.num("ADVISOR.spiceKgPerPack", "كيس بهارات يكفي", { suf: "كجم" }), F.num("ADVISOR.trayPeoplePerSet", "طقم صواني لكل", { suf: "أشخاص" }))) +
      card("المناسبات", draft.ADVISOR.occasions.map((o, i) => grid2(F.text(`ADVISOR.occasions.${i}.n`, "الاسم"), F.text(`ADVISOR.occasions.${i}.s`, "الوصف"), F.select(`ADVISOR.occasions.${i}.img`, "الصورة", [["", "بدون صورة (أيقونة)"]].concat(Object.keys(draft.IMAGES).map(k => [k, k]))), F.bool(`ADVISOR.occasions.${i}.on`, "ظاهرة"))).join("")) +
      card("أشكال الشوي", draft.ADVISOR.grillForms.map((f, i) => grid2(F.text(`ADVISOR.grillForms.${i}.n`, "الاسم"), F.text(`ADVISOR.grillForms.${i}.d`, "الوصف"))).join("")) +
      card("الطبخات", draft.ADVISOR.dishes.map((d, i) => grid2(F.text(`ADVISOR.dishes.${i}.n`, "الاسم"), F.select(`ADVISOR.dishes.${i}.spice`, "كيس البهارات", [["", "بدون"]].concat(draft.PRODUCTS.filter(p => /^spice/.test(p.id)).map(p => [p.id, p.name]))))).join("")) +
      card("أنواع الستيك في المستشار", F.checks("ADVISOR.steaks", "القطع", draft.PRODUCTS.filter(p => p.sold === "kg" && (p.uses || []).indexOf("steak") > -1).map(p => [p.id, p.name]))) +
      card("نصوص أسئلة المستشار", `<p class="muted small">اتركها فارغة لاستخدام النص الافتراضي.</p>` + Object.keys(QDEF).map(k => F.text(`ADVISOR.q.${k}`, QDEF[k], { ph: "النص الافتراضي" })).join(""));
  }

  function vSections() {
    return card("أقسام الصفحة الرئيسية", `<p class="muted small">رتّب الأقسام، أخفِ أو أظهر أي قسم، واختر خلفيته: داكنة أو فاتحة (ورق) لكسر الأسود. نصوص كل قسم في «نصوص الصفحات».</p>` +
      list("HOME", "الترتيب", p => `<div class="sec-row">${F.bool(p + ".on", esc(get(p + ".n")))}${F.select(p + ".tone", "الخلفية", [["dark", "داكنة"], ["light", "فاتحة (ورق الجزّار)"]])}</div>`, null, { id: "homeList" }).replace(/<button type="button" class="btn btn--ghost btn--sm" data-add="HOME"[^>]*>[\s\S]*?<\/button>/, "").replace(/<button type="button" class="icon-btn is-del" data-del="HOME"[^>]*>[\s\S]*?<\/button>/g, ""));
  }
  const vCopy = () => card("نصوص الصفحات", TOKENS + tree("COPY", draft.COPY, 0));
  function vFaq() {
    return card("أسئلة الرئيسية", list("FAQ", "الأسئلة", p => F.text(p + ".0", "السؤال") + F.text(p + ".1", "الإجابة", { rows: 3 }), ["", ""], { tr: true })) +
      card("صفحة المساعدة", TOKENS + draft.HELP.map((g, i) => `<details class="adm-sub"><summary>${esc(g.t)}</summary><div class="adm-sub__b">${grid2(F.text(`HELP.${i}.t`, "عنوان المجموعة"), F.text(`HELP.${i}.k`, "المعرّف (للرابط)", { dir: "ltr" }))}
        ${list(`HELP.${i}.items`, "الأسئلة", p => F.text(p + ".0", "السؤال") + F.text(p + ".1", "الإجابة", { rows: 3 }), ["", ""], { tr: true })}</div></details>`).join("") +
        `<div class="row-btns"><button type="button" class="btn btn--line btn--sm" data-add="HELP" data-blank='${esc(JSON.stringify({ k: "g" + Date.now().toString(36).slice(-4), ic: "help", t: "مجموعة جديدة", items: [] }))}'>${icon("plus")}مجموعة جديدة</button></div>`);
  }
  function vImages() {
    const orig = CMS.original.IMAGES || {};
    return card("صور الصفحات", `<div class="adm-imgs">${Object.keys(draft.IMAGES).map(k => `<div>${F.img(`IMAGES.${k}`, k)}${orig[k] && orig[k] !== draft.IMAGES[k] ? `<button type="button" class="link small" data-reset-img="${esc(k)}">الرجوع للأصل</button>` : ""}</div>`).join("")}</div>`) +
      card("صور المنتجات", `<p class="muted small">صورة كل منتج تتغير من «المنتجات والأسعار» ← تعديل.</p>`);
  }
  function vSettings() {
    const C = "CONFIG", cs = ST.costs();
    return card("التكلفة والأرباح", `<p class="muted small">تُستخدم لحساب «صافي الربح التقديري» في الرئيسية والتحليلات. تُحفظ في هذا المتصفح فقط ولا تُنشر مع المحتوى.</p>
        <div class="af-grid"><label class="af af--num"><span class="af__l">تكلفة البضاعة والخدمات<small>٪ من صافي سعر البيع (بدون الضريبة)</small></span><span class="af__num"><input class="input num" type="number" min="0" max="100" step="1" data-cost="pct" value="${cs.pct == null ? "" : cs.pct}" placeholder="مثال: 65"><em>٪</em></span></label></div>
        ${cs.assumed ? `<p class="adm-tip">${icon("info")}القيمة الحالية افتراض للعرض مع البيانات التجريبية — استبدلها بنسبتك الفعلية.</p>` : ""}<p class="muted small">لتكلفة مختلفة لمنتج معيّن: المنتجات ← تعديل ← «تكلفة المنتج».</p>`) +
      card("طرق الدفع", draft.CONFIG.payments.map((p, i) => `<div class="adm-pay">${grid2(F.bool(`${C}.payments.${i}.on`, "مفعّلة"), F.text(`${C}.payments.${i}.n`, "الاسم"), F.text(`${C}.payments.${i}.s`, "الوصف"))}
        <div class="adm-pay__logos">${(p.logos || []).map((l, j) => F.img(`${C}.payments.${i}.logos.${j}`, "شعار " + (j + 1), { logo: true })).join("")}<button type="button" class="btn btn--ghost btn--sm" data-add="${C}.payments.${i}.logos" data-blank='""'>${icon("plus")}شعار</button></div>
        ${grid2(F.bool(`${C}.payments.${i}.card`, "تطلب بيانات بطاقة"), F.bool(`${C}.payments.${i}.cod`, "دفع عند الاستلام"))}</div>`).join("")) +
      card("التوصيل والضريبة", grid2(F.num(`${C}.delivery.fee`, "رسوم التوصيل", { suf: "ر.س" }), F.num(`${C}.delivery.freeOver`, "مجاني من", { suf: "ر.س" }), F.num(`${C}.vat`, "الضريبة", { hint: "0.15 = 15٪", step: .01 }), F.num(`${C}.deliveryDays`, "أيام التوصيل المعروضة", { step: 1 })) +
        list(`${C}.cities`, "المدن", p => F.text(p, "المدينة"), "", { tr: true }) +
        list(`${C}.windows`, "فترات التوصيل", p => grid2(F.text(p + ".l", "الفترة"), F.num(p + ".h", "ساعة البداية", { step: 1, hint: "24 ساعة" })), { l: "", h: 9 })) +
      card("بيانات التواصل والمنشأة", grid2(...[["phone", "الهاتف", 1], ["whatsapp", "واتساب", 1], ["email", "البريد", 1], ["city", "المدينة"], ["address", "العنوان"], ["hours", "ساعات العمل"], ["cr", "السجل التجاري", 1], ["vatNo", "الرقم الضريبي", 1]].map(x => F.text(`${C}.contact.${x[0]}`, x[1], { raw: !!x[2] })))) +
      card("إعدادات", grid2(F.bool(`${C}.demo`, "نسخة عرض", { hint: "تظهر تنبيهات «الدفع محاكاة»" }), F.text(`${C}.adminPin`, "رمز دخول لوحة التحكم", { dir: "ltr" })));
  }
  const vTheme = () => card("الألوان", `${F.color("THEME.accent", "لون الفعل الأساسي (الجمرة)")}<p class="muted small">يُطبّق على الأزرار والمستشار والأسعار المميزة وكل العناصر البرتقالية.</p>
    <div class="row-btns"><button type="button" class="btn btn--ghost btn--sm" data-act="accent-reset">اللون الأصلي</button></div>`);

  function vPublish() {
    const gh = (() => { try { return JSON.parse(lsGet(LS.gh) || "{}"); } catch (e) { return {}; } })();
    const size = (JSON.stringify(draft).length / 1024).toFixed(0);
    return card("المعاينة", `<p class="muted">شاهد الموقع الحقيقي بالمسودة — في هذا المتصفح فقط.</p><div class="row-btns">${lsGet(LS.preview) === "1" ? `<button type="button" class="btn btn--line" data-act="preview-off">إيقاف المعاينة</button><a class="btn btn--ember" href="index.html" target="_blank">افتح الموقع ↗</a><a class="btn btn--line" href="en/index.html" target="_blank">English ↗</a>` : `<button type="button" class="btn btn--ember" data-act="preview-on">${icon("share")}عاين الموقع بالمسودة</button>`}</div>`) +
      card("النشر على الموقع (GitHub)", `<p class="muted small">ينشر المسودة كملف <code>assets/js/content.js</code> ويرفع الصور الجديدة في مستودع الموقع؛ يتحدث الموقع خلال دقيقة تقريباً. تحتاج <b>رمز وصول شخصي (Fine-grained token)</b> بصلاحية Contents: Read and write على المستودع — يُحفظ في هذا المتصفح فقط إذا اخترت ذلك.</p>
        <form id="ghForm" class="af-grid">${[["repo", "المستودع", gh.repo || "Mohamed-sr-Designer/nudj"], ["branch", "الفرع", gh.branch || "main"]].map(x => `<label class="af"><span class="af__l">${x[1]}</span><input class="input num" dir="ltr" name="${x[0]}" value="${esc(x[2])}"></label>`).join("")}
        <label class="af"><span class="af__l">رمز الوصول</span><input class="input num" dir="ltr" type="password" name="token" autocomplete="off" value="${esc(gh.token || "")}"></label>
        <label class="af-c"><input type="checkbox" name="remember"${gh.token ? " checked" : ""}><span>تذكّر الرمز على هذا الجهاز</span></label></form>
        <div class="row-btns"><button type="button" class="btn btn--ember" data-act="publish">${icon("share")}انشر الآن</button></div><pre class="adm-log" id="pubLog" hidden></pre>`) +
      card("نسخ المحتوى", `<p class="muted small">حجم المسودة: <b class="num">${size} KB</b></p><div class="row-btns">
        <button type="button" class="btn btn--line" data-act="export">${icon("save")}تنزيل ملف المحتوى (content.js)</button>
        <label class="btn btn--line">${icon("plus")}استيراد ملف<input type="file" accept=".js,.json,application/json,text/javascript" hidden data-import></label></div>
        <p class="muted small">بديل النشر اليدوي: نزّل الملف وضعه مكان <code>assets/js/content.js</code> في المشروع ثم شغّل <code>node build.js</code> ليُطبع داخل الصفحات.</p>`) +
      card("التراجع", `<div class="row-btns"><button type="button" class="btn btn--ghost" data-act="discard">تجاهل المسودة (الرجوع للمنشور)</button><button type="button" class="btn btn--ghost btn--danger-t" data-act="original">الرجوع لمحتوى الموقع الأصلي</button></div>`);
  }
  const VIEWFN = { home: vHome, orders: vOrders, customers: vCustomers, analytics: vAnalytics, discounts: vDiscounts, products: vProducts, sections: vSections, herd: vHerd, services: vServices, advisor: vAdvisor, copy: vCopy, faq: vFaq, images: vImages, settings: vSettings, theme: vTheme, publish: vPublish };
  /* القائمة الجانبية (بأسلوب Shopify): التجارة ثم المتجر الإلكتروني ثم الإعدادات */
  const NAV = [
    ["home", "الرئيسية", "home"], ["orders", "الطلبات", "receipt"], ["products", "المنتجات", "tag"], ["customers", "العملاء", "people"], ["analytics", "التحليلات", "chart"], ["discounts", "الخصومات", "percent"],
    ["-", "المتجر الإلكتروني", "store"],
    ["sections", "أقسام الرئيسية", "grid"], ["copy", "نصوص الصفحات", "doc"], ["herd", "القطيع والمواشي", "map"], ["services", "التقطيع والخدمات", "knife"], ["advisor", "المستشار", "chat"], ["faq", "الأسئلة والمساعدة", "help"], ["images", "الصور", "image"], ["theme", "الهوية والألوان", "spark"],
    ["-", "", ""],
    ["settings", "الإعدادات", "gear"], ["publish", "النشر والنسخ", "share"]
  ];
  const ALIAS = { dash: "home", checkout: "settings" };
  const COMMERCE = { home: 1, orders: 1, customers: 1, analytics: 1, discounts: 1, products: 1 };
  let sub = null;

  function frame() {
    root.innerHTML = `<div class="adm-app">
      <header class="adm-top">
        <button type="button" class="adm-burger" data-act="nav" aria-label="القائمة">${icon("grid")}</button>
        <a class="adm-top__brand" href="#home">${U.logo()}<span>نُضْج<small>لوحة التحكم</small></span></a>
        <div class="adm-search">${icon("search")}<input type="search" placeholder="ابحث في الطلبات والمنتجات والعملاء" data-gsearch autocomplete="off" aria-label="بحث"><div class="adm-search__res" hidden></div></div>
        <span class="adm-top__sp"></span>
        <span class="adm-status"></span><span class="adm-save" aria-hidden="true">${icon("check", "", 2.4)}حُفظ</span>
        <span class="adm-lang" role="group" aria-label="لغة المحتوى"><button type="button" data-cl="ar">عربي</button><button type="button" data-cl="en">English</button></span>
        <a class="adm-top__btn" href="index.html" target="_blank">${icon("eye")}<span>المتجر</span></a>
        <button type="button" class="adm-top__btn" data-act="preview-on">${icon("share")}<span>معاينة</span></button>
        <a class="btn btn--ember btn--sm" href="#publish">نشر</a>
      </header>
      <div class="adm-shell">
        <aside class="adm-side"><nav>${NAV.map(n => n[0] === "-" ? `<div class="adm-side__g">${n[2] ? icon(n[2]) : ""}${n[1]}</div>` : `<a href="#${n[0]}" data-nav="${n[0]}">${icon(n[2])}<span>${n[1]}</span>${n[0] === "orders" ? '<b class="nb" data-nb hidden></b>' : ""}</a>`).join("")}</nav>
          <div class="adm-side__foot"><a href="index.html" target="_blank">${icon("eye")}<span>المتجر بالعربي</span></a><a href="en/index.html" target="_blank">${icon("eye")}<span>English store</span></a></div></aside>
        <div class="adm-main"><div class="adm-page" id="admBody"></div></div>
      </div></div>`;
  }
  function render() {
    if (!$(".adm-app")) frame();
    $$(".adm-side [data-nav]").forEach(a => a.toggleAttribute("aria-current", a.dataset.nav === view));
    const nb = $("[data-nb]"), placed = ST.statusCounts().placed || 0; if (nb) { nb.hidden = !placed; nb.textContent = placed; }
    $$(".adm-lang [data-cl]").forEach(b => b.setAttribute("aria-pressed", b.dataset.cl === CL ? "true" : "false"));
    document.documentElement.classList.toggle("adm-en", TR());
    document.documentElement.classList.remove("nav-open");
    const body = $("#admBody");
    const title = (NAV.find(n => n[0] === view) || NAV[0])[1];
    const tip = TR() && view !== "home" && view !== "analytics" && view !== "customers" ? `<p class="adm-tip adm-tip--en">${icon("info")}تعدّل الآن <b>النسخة الإنجليزية</b> (الموقع في /en/). النص العربي يظهر كتلميح داخل كل حقل، والحقل الفارغ يعرض العربي في الموقع الإنجليزي. الأسعار والصور والإعدادات مشتركة بين اللغتين.</p>` : "";
    const html = view === "orders" && sub ? vOrder(sub) : (VIEWFN[view] || vHome)();
    body.innerHTML = COMMERCE[view] ? tip + html : pageHead(title) + tip + html;
    document.title = title + " · لوحة تحكم نُضْج";
    CH.mount(body);
    paintStatus();
  }
  /* التوجيه: #orders · #orders/رقم · #orders?q=جوال */
  function route() {
    const h = decodeURIComponent((location.hash || "#home").slice(1)), qi = h.indexOf("?");
    const path = qi > -1 ? h.slice(0, qi) : h, q = new URLSearchParams(qi > -1 ? h.slice(qi + 1) : "");
    const parts = path.split("/");
    view = ALIAS[parts[0]] || parts[0] || "home"; if (!VIEWFN[view]) view = "home";
    sub = parts[1] || null;
    if (view === "orders" && q.get("q") != null) { oQ = q.get("q"); oTab = "all"; }
    render();
  }
  const go = v => { if (location.hash === "#" + v) route(); else location.hash = v; };

  /* ---------------- البحث العام في الشريط العلوي ---------------- */
  function searchResults(q) {
    q = q.trim(); if (!q) return "";
    const ords = ST.orders().filter(o => (o.id + " " + custName(o) + " " + ((o.user || {}).phone || "")).indexOf(q) > -1).slice(0, 5);
    const prods = draft.PRODUCTS.map((p, i) => [p, i]).filter(([p]) => (p.name + " " + p.code + " " + p.id).indexOf(q) > -1).slice(0, 5);
    const custs = ST.customers().filter(c => (c.name + " " + c.phone).indexOf(q) > -1).slice(0, 4);
    const out = (ords.length ? `<h6>الطلبات</h6>` + ords.map(o => `<a href="#orders/${encodeURIComponent(o.id)}">${icon("receipt")}<span>${oid(o.id)}</span><small>${esc(custName(o))} · ${sar(o.totals.total)}</small></a>`).join("") : "") +
      (prods.length ? `<h6>المنتجات</h6>` + prods.map(([p, i]) => `<a href="#products" data-edit-product="${i}">${p.img ? `<img src="${esc(p.img)}" alt="">` : icon("tag")}<span>${esc(p.name)}</span><small class="num">${esc(p.code || "")}</small></a>`).join("") : "") +
      (custs.length ? `<h6>العملاء</h6>` + custs.map(c => `<a href="#orders?q=${encodeURIComponent(c.phone || c.name)}">${icon("user")}<span>${esc(c.name || "بدون اسم")}</span><small class="num">${c.orders} طلب</small></a>`).join("") : "");
    return out || `<p class="muted small" style="padding:10px">لا نتائج لـ «${esc(q)}»</p>`;
  }

  /* ---------------- تصدير CSV (يفتح في Excel بالعربي) ---------------- */
  const csv = rows => "﻿" + rows.map(r => r.map(v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  function exportCsv(kind) {
    if (kind === "orders") {
      const rows = [["الطلب", "التاريخ", "العميل", "الجوال", "المدينة", "الحالة", "الدفع", "اللحم", "الخدمات", "العدّة", "الخصم", "التوصيل", "الضريبة", "الإجمالي", "تجريبي"]];
      ST.orders().forEach(o => { const t = o.totals || {}; rows.push([o.id, new Date(o.date).toISOString().slice(0, 16).replace("T", " "), (o.user || {}).name || "", (o.user || {}).phone || "", (o.address || {}).city || "", stepName(o.status), payName(o), t.meat, t.services, t.extras, t.discount, t.delivery, t.vat, t.total, o.demo ? "نعم" : ""]); });
      download("nudj-orders.csv", csv(rows), "text/csv");
    } else {
      const rows = [["الاسم", "الجوال", "المدينة", "الطلبات", "إجمالي الإنفاق", "آخر طلب", "تجريبي"]];
      ST.customers().forEach(c => rows.push([c.name, c.phone, c.city, c.orders, c.spent, new Date(c.last).toISOString().slice(0, 10), c.demo ? "نعم" : ""]));
      download("nudj-customers.csv", csv(rows), "text/csv");
    }
  }

  /* ---------------- ربط الحقول ---------------- */
  function bindFields(scope, rerender) {
    scope.addEventListener("input", e => {
      const el = e.target;
      if (el.matches("[data-p]") && el.type !== "checkbox" && el.type !== "file") {
        let v = el.value; if (el.dataset.t === "num") v = el.value === "" ? "" : +el.value;
        set(el.dataset.p, v);
        if (el.type === "color") { const c = el.parentNode.querySelector("code"); if (c) c.textContent = v; document.documentElement.style.setProperty("--ember", v); }
      }
    });
    scope.addEventListener("change", async e => {
      const el = e.target;
      if (el.matches('input[type=checkbox][data-p]')) set(el.dataset.p, el.dataset.t === "inv" ? !el.checked : el.checked);
      if (el.matches("select[data-p]")) set(el.dataset.p, el.value);
      const ch = el.closest("[data-checks]");
      if (ch && el.type === "checkbox") set(ch.dataset.checks, $$("input:checked", ch).map(x => x.value));
      if (el.matches("[data-upload]") && el.files[0]) {
        try { const url = await readImage(el.files[0], el.dataset.logo ? 480 : 1400, !!el.dataset.logo); set(el.dataset.upload, url); A.toast("رُفعت الصورة", { icon: "check" }); (rerender || render)(); }
        catch (x) { A.toast("تعذّر قراءة الصورة", { icon: "info" }); }
      }
    });
    scope.addEventListener("click", e => {
      const t = e.target;
      const add = t.closest("[data-add]"); if (add) { const arr = get(add.dataset.add) || []; arr.push(JSON.parse(add.dataset.blank || '""')); set(add.dataset.add, arr); (rerender || render)(); return; }
      const del = t.closest("[data-del]"); if (del) { const arr = get(del.dataset.del); arr.splice(+del.dataset.i, 1); set(del.dataset.del, arr); (rerender || render)(); return; }
      const mv = t.closest("[data-move]"); if (mv) { const arr = get(mv.dataset.move), i = +mv.dataset.i, j = i + +mv.dataset.d; if (j < 0 || j >= arr.length) return; const x = arr[i]; arr[i] = arr[j]; arr[j] = x; set(mv.dataset.move, arr); (rerender || render)(); return; }
      const cl = t.closest("[data-clear]"); if (cl) { set(cl.dataset.clear, ""); (rerender || render)(); }
    });
  }

  /* الصور: تصغير وضغط في المتصفح قبل الحفظ */
  function readImage(file, maxW, png) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onerror = rej;
      fr.onload = () => {
        const im = new Image();
        im.onerror = rej;
        im.onload = () => {
          const k = Math.min(1, maxW / im.width), c = document.createElement("canvas");
          c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          let url = png ? c.toDataURL("image/png") : c.toDataURL("image/webp", .82);
          if (url.indexOf("data:image/webp") !== 0 && !png) url = c.toDataURL("image/jpeg", .85);
          res(url);
        };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  /* ---------------- الإجراءات ---------------- */
  function newProduct() {
    const a = pFilter !== "all" ? pFilter : (draft.ANIMALS[0] || {}).k || "lamb";
    const an = draft.ANIMALS.find(x => x.k === a);
    const n = draft.PRODUCTS.filter(p => p.animal === a).length + 1;
    const p = a === "extra"
      ? { id: "x-" + Date.now().toString(36), animal: "extra", name: "منتج جديد", sold: "piece", price: 10, unitName: "حبة", short: "", info: "", uses: ["grill"], code: "X-" + String(n).padStart(2, "0") }
      : { id: a + "-" + Date.now().toString(36), animal: a, name: "قطعة جديدة", zone: null, sold: "kg", price: 50, preps: ["whole", "cubes"], prepDef: "whole", uses: ["slow"], min: .5, step: .5, def: 1, short: "", info: "", spec: [3, 3, 3], code: (an ? an.code : "N") + "-" + String(n).padStart(2, "0") };
    draft.PRODUCTS.push(p); save(); render(); openProduct(draft.PRODUCTS.length - 1);
  }
  function newAnimal() {
    const k = (prompt("معرّف الماشية بالإنجليزي (حروف صغيرة، مثل: sheep2)") || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!k) return; if (draft.ANIMALS.some(a => a.k === k)) { A.toast("المعرّف مستخدم", { icon: "info" }); return; }
    draft.ANIMALS.push({ k, n: "ماشية جديدة", en: k.toUpperCase(), code: k[0].toUpperCase(), ratio: 1.3, note: "", pins: {}, art: "" });
    save(); render(); A.toast("أُضيفت — ارفع رسمها وحدد مواقع القطعيات", { icon: "check" });
  }
  function download(name, text, type) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: (type || "text/javascript") + ";charset=utf-8" })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  const contentFile = obj => `/* نُضْج — المحتوى المنشور من لوحة التحكم (${new Date().toISOString().slice(0, 16).replace("T", " ")}) */\nwindow.NUDJ_CONTENT = ${JSON.stringify(obj)};\n`;

  /* النشر عبر GitHub: الصور المرفوعة كملفات، ثم content.js */
  async function publish() {
    const f = $("#ghForm"), log = $("#pubLog");
    const repo = f.repo.value.trim(), branch = f.branch.value.trim() || "main", token = f.token.value.trim();
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !token) { A.toast("أدخل المستودع ورمز الوصول", { icon: "info" }); return; }
    lsSet(LS.gh, JSON.stringify(f.remember.checked ? { repo, branch, token } : { repo, branch }));
    log.hidden = false; log.textContent = "";
    const say = t => { log.textContent += t + "\n"; };
    const api = "https://api.github.com/repos/" + repo + "/contents/";
    const H = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" };
    const b64 = bytes => { let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); };
    async function put(path, contentB64, msg) {
      let sha;
      const g = await fetch(api + path + "?ref=" + encodeURIComponent(branch), { headers: H });
      if (g.ok) sha = (await g.json()).sha; else if (g.status !== 404) throw new Error("GET " + path + " → " + g.status);
      const r = await fetch(api + path, { method: "PUT", headers: Object.assign({ "Content-Type": "application/json" }, H), body: JSON.stringify({ message: msg, content: contentB64, branch, sha }) });
      if (!r.ok) throw new Error("PUT " + path + " → " + r.status + " " + (await r.text()).slice(0, 160));
    }
    try {
      const out = clone(draft), seen = {};
      /* كل صورة data: تُرفع كملف ويُستبدل مسارها */
      const walk = async o => {
        for (const k of Object.keys(o)) {
          const v = o[k];
          if (typeof v === "string" && v.indexOf("data:image/") === 0) {
            const m = v.match(/^data:image\/(\w+);base64,(.*)$/); if (!m) continue;
            const ext = m[1] === "jpeg" ? "jpg" : m[1], name = "assets/img/uploads/" + CMS.hash(v) + "." + ext;
            if (!seen[name]) { say("رفع صورة… " + name); await put(name, m[2], "CMS: upload image"); seen[name] = 1; }
            o[k] = name;
          } else if (v && typeof v === "object") await walk(v);
        }
      };
      await walk(out);
      say("نشر المحتوى… assets/js/content.js");
      await put("assets/js/content.js", b64(new TextEncoder().encode(contentFile(out))), "CMS: publish content");
      draft = out; lsSet(LS.draft, JSON.stringify(draft)); CMS.published = clone(out);
      say("✓ تم النشر. يتحدث الموقع خلال دقيقة تقريباً.");
      A.toast("تم النشر", { icon: "check" }); paintStatus();
    } catch (x) { say("✗ " + x.message); A.toast("تعذّر النشر — راجع السجل", { icon: "info", ms: 5000 }); }
  }

  function bindShell() {
    bindFields(root);
    const keepFocus = (sel, fn) => { const el = $(sel), pos = el ? el.selectionStart : 0; fn(); const n = $(sel); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) { } } };
    let qT;
    root.addEventListener("click", async e => {
      const t = e.target;
      const cl = t.closest("[data-cl]"); if (cl) { CL = cl.dataset.cl; lsSet("nudj_adm_lang", CL); render(); return; }
      const ca = t.closest("[data-copy-ar]"); if (ca) { set(enPath(ca.dataset.copyAr), clone(get(ca.dataset.copyAr) || [])); render(); return; }
      const ep = t.closest("[data-edit-product]"); if (ep) { e.preventDefault(); const r = $(".adm-search__res"); if (r) r.hidden = true; openProduct(+ep.dataset.editProduct); return; }
      const fp = t.closest("[data-find-product]"); if (fp) { e.preventDefault(); const i = draft.PRODUCTS.findIndex(p => p.id === fp.dataset.findProduct); if (i > -1) openProduct(i); return; }
      const rg = t.closest("[data-range]"); if (rg) { range = +rg.dataset.range; try { sessionStorage.setItem("nudj_adm_range", range); } catch (x) { } render(); return; }
      const ot = t.closest("[data-otab]"); if (ot) { e.preventDefault(); oTab = ot.dataset.otab; oSel.clear(); oLimit = 50; if (view !== "orders" || sub) location.hash = "orders"; else render(); return; }
      const pf = t.closest("[data-pf]"); if (pf) { pFilter = pf.dataset.pf; render(); return; }
      if (t.closest("[data-osel-none]")) { oSel.clear(); render(); return; }
      if (t.closest("[data-omore]")) { oLimit += 50; render(); return; }
      const bk = t.closest("[data-bulk]"); if (bk) {
        const to = bk.dataset.bulk, n = oSel.size;
        if (to === "cancelled" && !(await A.confirmSheet({ title: `إلغاء ${n} طلب؟`, ok: "إلغاء الطلبات", danger: true }))) return;
        oSel.forEach(id => ST.setStatus(id, to)); oSel.clear(); A.toast(`نُقل ${n} طلب إلى «${stepName(to)}»`, { icon: "check" }); render(); return;
      }
      const os = t.closest("[data-ostatus]"); if (os) {
        const to = os.dataset.to;
        if (to === "cancelled" && !(await A.confirmSheet({ title: "إلغاء الطلب؟", text: "تتحدث حالة الطلب عند العميل إلى «ملغي».", ok: "إلغاء الطلب", danger: true }))) return;
        ST.setStatus(os.dataset.ostatus, to); A.toast("تحدّثت حالة الطلب: " + stepName(to), { icon: "check" }); render(); return;
      }
      const ex = t.closest("[data-export]"); if (ex) { exportCsv(ex.dataset.export); return; }
      if (t.closest("input[type=checkbox][data-osel],input[type=checkbox][data-osel-all]")) return;
      const tr = t.closest("tr[data-href]"); if (tr && !t.closest("a,button,input,label,select")) { location.hash = tr.dataset.href.slice(1); return; }
      const dp = t.closest("[data-del-product]"); if (dp) {
        if (!(await A.confirmSheet({ title: "حذف المنتج؟", text: "الأفضل إخفاؤه إن كان في طلبات سابقة.", ok: "حذف", danger: true }))) return;
        draft.PRODUCTS.splice(+dp.dataset.delProduct, 1); save(); $$(".sheet__x").forEach(x => x.click()); render(); return;
      }
      const da = t.closest("[data-del-animal]"); if (da) {
        if (!(await A.confirmSheet({ title: "حذف الماشية؟", text: "منتجاتها تبقى لكن بدون صفحة ماشية.", ok: "حذف", danger: true }))) return;
        draft.ANIMALS.splice(+da.dataset.delAnimal, 1); save(); render(); return;
      }
      const so = t.closest("[data-del-order]"); if (so) { if (await A.confirmSheet({ title: "حذف الطلب من هذا الجهاز؟", text: "لا يمكن التراجع عن الحذف.", ok: "حذف", danger: true })) { ST.remove(so.dataset.delOrder); A.toast("حُذف الطلب", { icon: "trash" }); location.hash = "orders"; } return; }
      const ri = t.closest("[data-reset-img]"); if (ri) { set("IMAGES." + ri.dataset.resetImg, CMS.original.IMAGES[ri.dataset.resetImg]); render(); return; }
      const cd = t.closest("[data-coupon-del]"); if (cd) { delete draft.CONFIG.coupons[cd.dataset.couponDel]; save(); render(); return; }
      const act = t.closest("[data-act]"); if (!act) return;
      const k = act.dataset.act;
      if (k === "nav") document.documentElement.classList.toggle("nav-open");
      else if (k === "new-product") newProduct();
      else if (k === "new-animal") newAnimal();
      else if (k === "demo-seed") { const n = ST.seed(); A.toast(`أُنشئ ${n} طلباً تجريبياً للعرض`, { icon: "spark" }); render(); }
      else if (k === "demo-clear") { if (await A.confirmSheet({ title: "حذف البيانات التجريبية؟", text: "تُحذف الطلبات التجريبية فقط — طلبات المتجر الحقيقية تبقى.", ok: "حذف", danger: true })) { ST.clearDemo(); A.toast("حُذفت البيانات التجريبية", { icon: "trash" }); if (sub) location.hash = "orders"; else render(); } }
      else if (k === "coupon-add") { draft.CONFIG.coupons = draft.CONFIG.coupons || {}; draft.CONFIG.coupons["CODE" + (Object.keys(draft.CONFIG.coupons).length + 1)] = { pct: 10, label: "خصم 10٪" }; save(); render(); }
      else if (k === "accent-reset") { set("THEME.accent", (CMS.original.THEME || {}).accent || "#FF5A36"); document.documentElement.style.setProperty("--ember", draft.THEME.accent); render(); }
      else if (k === "preview-on") { lsSet(LS.draft, JSON.stringify(draft)); lsSet(LS.preview, "1"); window.open(TR() ? "en/index.html" : "index.html", "_blank"); if (view === "publish") render(); }
      else if (k === "preview-off") { try { localStorage.removeItem(LS.preview); } catch (x) { } render(); }
      else if (k === "export") download("content.js", contentFile(draft));
      else if (k === "publish") publish();
      else if (k === "discard") { if (await A.confirmSheet({ title: "تجاهل المسودة؟", text: "تضيع كل التعديلات غير المنشورة.", ok: "تجاهل", danger: true })) { draft = clone(CMS.published || CMS.original); save(true); render(); } }
      else if (k === "original") { if (await A.confirmSheet({ title: "الرجوع للأصل؟", text: "تصير المسودة مثل محتوى الموقع الأصلي (data.js). لا يتغير الموقع حتى تنشر.", ok: "رجوع", danger: true })) { draft = clone(CMS.original); save(true); render(); } }
    });
    root.addEventListener("change", e => {
      const t = e.target;
      if (t.matches("[data-osel]")) { if (t.checked) oSel.add(t.dataset.osel); else oSel.delete(t.dataset.osel); render(); return; }
      if (t.matches("[data-osel-all]")) { $$("[data-osel]").forEach(c => { if (t.checked) oSel.add(c.dataset.osel); else oSel.delete(c.dataset.osel); }); render(); return; }
      if (t.matches("[data-zone-toggle]")) {
        const a = draft.ANIMALS[+t.dataset.zoneToggle]; a.pins = a.pins || {};
        if (t.checked) a.pins[t.value] = [50, 50]; else delete a.pins[t.value]; save(); render();
      }
      if (t.matches("[data-import]") && t.files[0]) {
        const fr = new FileReader(); fr.onload = () => {
          try { const txt = String(fr.result); const json = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1)); CMS.KEYS.forEach(k => { if (json[k] != null) draft[k] = json[k]; }); save(); render(); A.toast("استُورد المحتوى", { icon: "check" }); }
          catch (x) { A.toast("الملف غير صالح", { icon: "info" }); }
        }; fr.readAsText(t.files[0]);
      }
      if (t.matches("[data-p$='.hidden']") && view === "products") setTimeout(render, 30);
    });
    root.addEventListener("input", e => {
      const t = e.target;
      if (t.matches("[data-psearch]")) { pSearch = t.value.trim(); keepFocus("[data-psearch]", render); }
      if (t.matches("[data-oq]")) { oQ = t.value; clearTimeout(qT); qT = setTimeout(() => keepFocus("[data-oq]", render), 180); }
      if (t.matches("[data-cq]")) { cQ = t.value; clearTimeout(qT); qT = setTimeout(() => keepFocus("[data-cq]", render), 180); }
      if (t.matches("[data-cost]")) { ST.setCost({ pct: t.value === "" ? null : Math.max(0, Math.min(100, +t.value)), assumed: false }); }
      if (t.matches("[data-cost-id]")) { const c = ST.costs(); if (t.value === "") delete c.byId[t.dataset.costId]; else c.byId[t.dataset.costId] = Math.max(0, Math.min(100, +t.value)); ST.setCost({ byId: c.byId }); }
      if (t.matches("[data-gsearch]")) { const r = $(".adm-search__res"); r.innerHTML = searchResults(t.value); r.hidden = !t.value.trim(); }
      if (t.matches("[data-coupon]")) {
        const list = Object.keys(draft.CONFIG.coupons).map(code => ({ code, pct: draft.CONFIG.coupons[code].pct, label: draft.CONFIG.coupons[code].label, label_en: draft.CONFIG.coupons[code].label_en }));
        const c = list[+t.dataset.coupon]; if (!c) return;
        c[t.dataset.f] = t.dataset.f === "pct" ? +t.value : t.dataset.f === "code" ? t.value.toUpperCase().replace(/\s/g, "") : t.value;
        draft.CONFIG.coupons = {}; list.forEach(x => { if (x.code) draft.CONFIG.coupons[x.code] = Object.assign({ pct: x.pct, label: x.label }, x.label_en ? { label_en: x.label_en } : {}); }); save();
      }
    });
    /* إغلاق نتائج البحث */
    document.addEventListener("click", e => { if (!e.target.closest(".adm-search")) { const r = $(".adm-search__res"); if (r) r.hidden = true; } });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { const r = $(".adm-search__res"); if (r) r.hidden = true; } if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); const s = $("[data-gsearch]"); if (s) s.focus(); } });
    window.addEventListener("hashchange", () => { route(); window.scrollTo(0, 0); });
    /* الطلبات من المتجر في تبويب آخر تظهر مباشرة */
    window.addEventListener("storage", e => { if (e.key === "nudj_orders" && (view === "orders" || view === "home")) render(); });
    /* سحب نقاط القطعيات على الرسم */
    let drag = null;
    root.addEventListener("pointerdown", e => { const p = e.target.closest(".pins-ed__p"); if (!p) return; e.preventDefault(); drag = { p, box: p.parentNode, i: +p.parentNode.dataset.pins, z: p.dataset.zone }; p.setPointerCapture(e.pointerId); p.classList.add("is-drag"); });
    root.addEventListener("pointermove", e => {
      if (!drag) return; const r = drag.box.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)), y = Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100));
      drag.p.style.left = x + "%"; drag.p.style.top = y + "%"; drag.xy = [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
    });
    root.addEventListener("pointerup", () => { if (!drag) return; if (drag.xy) { draft.ANIMALS[drag.i].pins[drag.z] = drag.xy; save(); } drag.p.classList.remove("is-drag"); drag = null; });
  }

  /* ---------------- الدخول ---------------- */
  function gate() {
    const pin = String((draft.CONFIG && draft.CONFIG.adminPin) || D.CONFIG.adminPin || "");
    const start = () => { bindShell(); route(); };
    if (!pin || sessionStorage.getItem(LS.ok) === "1") { start(); return; }
    root.innerHTML = `<div class="adm-gate-wrap"><form class="adm-gate" id="gate"><span class="adm-gate__logo">${U.logo()}</span><h1>تسجيل الدخول</h1><p class="muted">لوحة تحكم متجر نُضْج</p>
      <label class="af"><span class="af__l">رمز الدخول</span><input class="input num" type="password" inputmode="numeric" autocomplete="off" dir="ltr" name="pin" autofocus></label><button class="btn btn--ember btn--lg btn--block" type="submit">دخول</button>
      <p class="muted small">${D.CONFIG.demo ? "نسخة العرض: الرمز الافتراضي 2026 — غيّره من «الإعدادات»." : ""}</p></form></div>`;
    $("#gate").addEventListener("submit", e => {
      e.preventDefault();
      if (e.target.pin.value === pin) { try { sessionStorage.setItem(LS.ok, "1"); } catch (x) { } start(); }
      else { e.target.pin.classList.add("is-err"); A.toast("الرمز غير صحيح", { icon: "info" }); }
    });
  }
  gate();
})();
