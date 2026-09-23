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

  /* ---------------- المسودة ---------------- */
  let draft = null;
  try { draft = JSON.parse(lsGet(LS.draft) || "null"); } catch (e) { }
  if (!draft) draft = CMS.snapshot();
  CMS.KEYS.forEach(k => { if (draft[k] == null) draft[k] = clone(D[k]); });
  let saveT, view = (location.hash || "#dash").slice(1);
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
      o = o || {}; const v = get(path); const long = o.rows || (typeof v === "string" && (v.length > 70 || /[<\n]/.test(v)));
      return `<label class="af${o.cls ? " " + o.cls : ""}"><span class="af__l">${label}${o.hint ? `<small>${o.hint}</small>` : ""}</span>${long
        ? `<textarea class="input af__ta" rows="${o.rows || (/</.test(v) ? 8 : 3)}" data-p="${P(path)}"${o.dir ? ` dir="${o.dir}"` : ""}>${esc(v == null ? "" : v)}</textarea>`
        : `<input class="input" data-p="${P(path)}" value="${esc(v == null ? "" : v)}"${o.dir ? ` dir="${o.dir}"` : ""}${o.ph ? ` placeholder="${esc(o.ph)}"` : ""}>`}</label>`;
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
    o = o || {}; const arr = get(path) || [];
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
    if (k === "forms" && Array.isArray(v)) return F.checks(path, lbl(k, path), Object.keys(draft.PREPS).map(x => [x, draft.PREPS[x].n]));
    if (typeof v === "string") return F.text(path, lbl(k, path), { rows: /body$/.test(path) ? 12 : null });
    if (typeof v === "number") return F.num(path, lbl(k, path));
    if (Array.isArray(v)) {
      if (!v.length || typeof v[0] === "string") return list(path, lbl(k, path), p => F.text(p, "النص"), "");
      const keys = Object.keys(v[0]);
      return list(path, lbl(k, path), p => keys.map(x => F.text(p + "." + x, lbl(x, x))).join(""), keys.reduce((o, x) => (o[x] = "", o), {}));
    }
    if (v && typeof v === "object") {
      const inner = Object.keys(v).map(x => tree(path + "." + x, v[x], depth + 1)).join("");
      return depth ? `<details class="adm-sub"${depth > 1 ? "" : " open"}><summary>${lbl(k, path)}</summary><div class="adm-sub__b">${inner}</div></details>` : inner;
    }
    return "";
  }
  const TOKENS = `<p class="adm-tip">${icon("info")}رموز تُستبدل تلقائياً داخل أي نص: <code>{fee}</code> رسوم التوصيل · <code>{freeOver}</code> حد التوصيل المجاني · <code>{cities}</code> · <code>{windows}</code> · <code>{phone}</code> · <code>{email}</code> · <code>{cr}</code> · <code>{vatNo}</code> · <code>{city}</code> · <code>{hours}</code> · <code>{skewer}</code> · <code>{vacuumKg}</code> · <code>{vacuumCarcass}</code> · <code>{marinades}</code> · <code>{styles}</code> · <code>{cutsCount}</code></p>`;

  /* ---------------- الأقسام ---------------- */
  const animalsOpts = () => draft.ANIMALS.map(a => [a.k, a.n]).concat([["extra", "عدّة الشواء والبهارات"]]);
  const VIEWS = [
    ["dash", "نظرة عامة", "grid"], ["orders", "الطلبات", "receipt"], ["products", "المنتجات والأسعار", "tag"], ["herd", "القطيع والمواشي", "map"],
    ["services", "التقطيع والتتبيل والخدمات", "knife"], ["advisor", "المستشار", "chat"], ["home", "أقسام الرئيسية", "home"], ["copy", "نصوص الصفحات", "doc"],
    ["faq", "الأسئلة والمساعدة", "help"], ["images", "الصور", "grid"], ["checkout", "الدفع والتوصيل والتواصل", "card"], ["theme", "الألوان", "spark"], ["publish", "النشر والنسخ", "share"]
  ];

  function vDash() {
    const orders = S.orders.list(), live = draft.PRODUCTS.filter(p => !p.hidden).length;
    const rev = orders.filter(o => o.status !== "cancelled").reduce((t, o) => t + o.totals.total, 0);
    const stat = (n, t, go) => `<button type="button" class="adm-stat" data-go="${go}"><b class="num">${n}</b><span>${t}</span></button>`;
    return `<div class="adm-stats">${stat(orders.length, "طلبات على هذا الجهاز", "orders")}${stat(U.money(rev) + " ر.س", "قيمة الطلبات", "orders")}${stat(live + " / " + draft.PRODUCTS.length, "منتج ظاهر", "products")}${stat(draft.ANIMALS.length, "مواشي", "herd")}</div>
      ${card("ابدأ من هنا", `<ol class="adm-how"><li><b>عدّل</b> أي شيء من القائمة — يُحفظ تلقائياً كمسودة في هذا المتصفح.</li><li><b>عاين</b> الموقع الحقيقي بالمسودة قبل ما يشوفها أحد.</li><li><b>انشر</b> من «النشر والنسخ» — أو نزّل ملف المحتوى وارفعه.</li></ol>
        <div class="row-btns"><button type="button" class="btn btn--ember" data-act="preview-on">${icon("share")}عاين الموقع بالمسودة</button><button type="button" class="btn btn--line" data-go="publish">النشر والنسخ</button></div>`)}
      ${card("آخر الطلبات", orders.length ? `<div class="adm-table">${orders.slice(0, 5).map(orderRow).join("")}</div>` : `<p class="muted">لا توجد طلبات على هذا الجهاز بعد.</p>`)}`;
  }
  const stepOpts = () => draft.ORDER_STEPS.map(s => [s.k, s.n]).concat([["cancelled", "ملغي"]]);
  function orderRow(o) {
    const who = o.user ? esc(o.user.name || "") + " · " + S.fmtPhone(o.user.phone) : "";
    return `<div class="adm-order"><span class="adm-order__id"><b class="num">${esc(o.id)}</b><small>${U.fmtDate(o.date)} · ${U.fmtTime(o.date)}${who ? " · " + who : ""}</small></span>
      <span class="num">${U.money(o.totals.total)} ر.س</span>
      <select class="select select--sm" data-status="${esc(o.id)}">${stepOpts().map(s => `<option value="${s[0]}"${o.status === s[0] ? " selected" : ""}>${esc(s[1])}</option>`).join("")}</select>
      <a class="btn btn--ghost btn--sm" href="order.html?id=${encodeURIComponent(o.id)}" target="_blank">الفاتورة</a><button type="button" class="icon-btn is-del" data-del-order="${esc(o.id)}" aria-label="حذف">${icon("trash")}</button></div>`;
  }
  function vOrders() {
    const orders = S.orders.list();
    return card("الطلبات", `<p class="adm-tip">${icon("info")}نسخة العرض تحفظ الطلبات في المتصفح، لذلك تظهر هنا طلبات هذا الجهاز فقط. عند ربط قاعدة بيانات تظهر كل الطلبات. غيّر الحالة وتتحدث فاتورة العميل ومراحلها الأربع مباشرة.</p>
      ${orders.length ? `<div class="adm-table">${orders.map(orderRow).join("")}</div>` : `<p class="muted">لا توجد طلبات بعد — جرّب طلباً من الموقع.</p>`}`) +
      card("مراحل الطلب", `<p class="muted small">الأسماء والأوصاف التي يراها العميل في فاتورته.</p>` + draft.ORDER_STEPS.map((s, i) => grid2(F.text(`ORDER_STEPS.${i}.n`, `المرحلة ${i + 1}`), F.text(`ORDER_STEPS.${i}.d`, "الوصف"))).join(""));
  }

  let pFilter = "all", pSearch = "";
  function vProducts() {
    const rows = draft.PRODUCTS.map((p, i) => [p, i]).filter(([p]) => (pFilter === "all" || p.animal === pFilter) && (!pSearch || (p.name + p.code + p.id).indexOf(pSearch) > -1));
    return card("المنتجات والأسعار", `<div class="adm-bar"><select class="select select--sm" data-pfilter><option value="all">كل المواشي</option>${animalsOpts().map(a => `<option value="${a[0]}"${pFilter === a[0] ? " selected" : ""}>${esc(a[1])}</option>`).join("")}</select>
      <input class="input input--sm" placeholder="بحث بالاسم أو الكود" data-psearch value="${esc(pSearch)}"><button type="button" class="btn btn--ember btn--sm" data-act="new-product">${icon("plus")}منتج جديد</button></div>
      <div class="adm-products">${rows.map(([p, i]) => `<div class="adm-prod${p.hidden ? " is-hidden" : ""}"><span class="adm-prod__img">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : icon("grid")}</span>
        <span class="adm-prod__b"><small class="num">${esc(p.code || "")}</small><b>${esc(p.name)}</b><small>${esc(animalsOpts().find(a => a[0] === p.animal) ? animalsOpts().find(a => a[0] === p.animal)[1] : p.animal)} · ${p.sold === "kg" ? "بالكيلو" : p.sold === "carcass" ? "ذبيحة" : "بالحبة"}</small></span>
        <span class="adm-prod__price">${p.sold === "carcass" ? `<span class="num">${(p.sizes || []).map(s => U.money(s.p)).join(" / ")}</span>` : `<input class="input input--sm num" type="number" step="any" data-p="PRODUCTS.${i}.price" data-t="num" value="${p.price}"><em>${p.sold === "kg" ? "ر.س/كجم" : "ر.س"}</em>`}</span>
        <label class="toggle toggle--mini" title="ظاهر في الموقع"><input type="checkbox" data-p="PRODUCTS.${i}.hidden" data-t="inv"${p.hidden ? "" : " checked"}><span class="toggle__sw"></span></label>
        <button type="button" class="btn btn--line btn--sm" data-edit-product="${i}">${icon("edit")}تعديل</button></div>`).join("") || `<p class="muted">لا نتائج.</p>`}</div>`);
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
      <div class="row-btns"><button type="button" class="btn btn--ghost btn--danger-t" data-del-product="${i}">${icon("trash")}حذف المنتج</button></div>
    </div>`;
  }
  function openProduct(i) {
    const body = document.createElement("div");
    const paint = () => { body.innerHTML = productForm(i); };
    paint();
    body.addEventListener("change", e => { if (e.target.matches('[data-p$=".sold"],[data-p$=".animal"],[data-checks$=".preps"] input')) setTimeout(paint, 50); });
    bindFields(body, paint);
    A.openSheet({ title: draft.PRODUCTS[i].name || "منتج", body, cls: "sheet--adm", onClose: () => render() });
  }

  function vHerd() {
    return draft.ANIMALS.map((a, i) => card(`${esc(a.n)} <small class="num">${esc(a.en)}</small>`, `${grid2(F.text(`ANIMALS.${i}.n`, "الاسم"), F.text(`ANIMALS.${i}.en`, "الاسم بالإنجليزي", { dir: "ltr" }), F.text(`ANIMALS.${i}.code`, "حرف الكود", { dir: "ltr" }))}
      ${F.text(`ANIMALS.${i}.note`, "الوصف")}
      ${F.img(`ANIMALS.${i}.art`, "الرسم الخطي", { hint: "أبيض على خلفية شفافة — فارغ = الرسم الحالي", logo: true })}
      <div class="af"><span class="af__l">مواقع القطعيات على الرسم<small>اسحب أي نقطة لمكانها</small></span>
      <div class="pins-ed" data-pins="${i}" style="aspect-ratio:${(a.ratio || 1.3).toFixed(3)}"><img src="${esc(a.art || "assets/img/herd/" + a.k + ".png")}" alt="">
        ${Object.keys(a.pins || {}).map(z => `<span class="pins-ed__p" data-zone="${esc(z)}" style="left:${a.pins[z][0]}%;top:${a.pins[z][1]}%">${esc(draft.ZONES[z] || z)}</span>`).join("")}</div>
      <div class="af__checks">${Object.keys(draft.ZONES).map(z => `<label class="af-c"><input type="checkbox" data-zone-toggle="${i}" value="${z}"${a.pins && a.pins[z] ? " checked" : ""}><span>${esc(draft.ZONES[z])}</span></label>`).join("")}</div></div>
      <div class="row-btns"><button type="button" class="btn btn--ghost btn--sm btn--danger-t" data-del-animal="${i}">${icon("trash")}حذف الماشية</button></div>`)).join("") +
      card("إضافة ماشية", `<div class="row-btns"><button type="button" class="btn btn--line" data-act="new-animal">${icon("plus")}ماشية جديدة</button></div>`) +
      card("أسماء مناطق الذبيحة", grid2(...Object.keys(draft.ZONES).map(z => F.text(`ZONES.${z}`, z))));
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

  function vHome() {
    return card("أقسام الصفحة الرئيسية", `<p class="muted small">رتّب الأقسام وأخفِ أو أظهر أي قسم. نصوص كل قسم في «نصوص الصفحات».</p>` +
      list("HOME", "الترتيب", p => F.bool(p + ".on", get(p + ".n")), null, { id: "homeList" }).replace(/<button type="button" class="btn btn--ghost btn--sm" data-add="HOME"[^>]*>[\s\S]*?<\/button>/, "").replace(/<button type="button" class="icon-btn is-del" data-del="HOME"[^>]*>[\s\S]*?<\/button>/g, ""));
  }
  const vCopy = () => card("نصوص الصفحات", TOKENS + tree("COPY", draft.COPY, 0));
  function vFaq() {
    return card("أسئلة الرئيسية", list("FAQ", "الأسئلة", p => F.text(p + ".0", "السؤال") + F.text(p + ".1", "الإجابة", { rows: 3 }), ["", ""])) +
      card("صفحة المساعدة", TOKENS + draft.HELP.map((g, i) => `<details class="adm-sub"><summary>${esc(g.t)}</summary><div class="adm-sub__b">${grid2(F.text(`HELP.${i}.t`, "عنوان المجموعة"), F.text(`HELP.${i}.k`, "المعرّف (للرابط)", { dir: "ltr" }))}
        ${list(`HELP.${i}.items`, "الأسئلة", p => F.text(p + ".0", "السؤال") + F.text(p + ".1", "الإجابة", { rows: 3 }), ["", ""])}</div></details>`).join("") +
        `<div class="row-btns"><button type="button" class="btn btn--line btn--sm" data-add="HELP" data-blank='${esc(JSON.stringify({ k: "g" + Date.now().toString(36).slice(-4), ic: "help", t: "مجموعة جديدة", items: [] }))}'>${icon("plus")}مجموعة جديدة</button></div>`);
  }
  function vImages() {
    const orig = CMS.original.IMAGES || {};
    return card("صور الصفحات", `<div class="adm-imgs">${Object.keys(draft.IMAGES).map(k => `<div>${F.img(`IMAGES.${k}`, k)}${orig[k] && orig[k] !== draft.IMAGES[k] ? `<button type="button" class="link small" data-reset-img="${esc(k)}">الرجوع للأصل</button>` : ""}</div>`).join("")}</div>`) +
      card("صور المنتجات", `<p class="muted small">صورة كل منتج تتغير من «المنتجات والأسعار» ← تعديل.</p>`);
  }
  function vCheckout() {
    const C = "CONFIG";
    const coupons = Object.keys(draft.CONFIG.coupons || {}).map(code => ({ code, pct: draft.CONFIG.coupons[code].pct, label: draft.CONFIG.coupons[code].label }));
    return card("طرق الدفع", draft.CONFIG.payments.map((p, i) => `<div class="adm-pay">${grid2(F.bool(`${C}.payments.${i}.on`, "مفعّلة"), F.text(`${C}.payments.${i}.n`, "الاسم"), F.text(`${C}.payments.${i}.s`, "الوصف"))}
        <div class="adm-pay__logos">${(p.logos || []).map((l, j) => F.img(`${C}.payments.${i}.logos.${j}`, "شعار " + (j + 1), { logo: true })).join("")}<button type="button" class="btn btn--ghost btn--sm" data-add="${C}.payments.${i}.logos" data-blank='""'>${icon("plus")}شعار</button></div>
        ${grid2(F.bool(`${C}.payments.${i}.card`, "تطلب بيانات بطاقة"), F.bool(`${C}.payments.${i}.cod`, "دفع عند الاستلام"))}</div>`).join("")) +
      card("التوصيل والضريبة", grid2(F.num(`${C}.delivery.fee`, "رسوم التوصيل", { suf: "ر.س" }), F.num(`${C}.delivery.freeOver`, "مجاني من", { suf: "ر.س" }), F.num(`${C}.vat`, "الضريبة", { hint: "0.15 = 15٪", step: .01 }), F.num(`${C}.deliveryDays`, "أيام التوصيل المعروضة", { step: 1 })) +
        list(`${C}.cities`, "المدن", p => F.text(p, "المدينة"), "") +
        list(`${C}.windows`, "فترات التوصيل", p => grid2(F.text(p + ".l", "الفترة"), F.num(p + ".h", "ساعة البداية", { step: 1, hint: "24 ساعة" })), { l: "", h: 9 })) +
      card("أكواد الخصم", `<div class="af-list"><div class="af-list__h"><b>الأكواد</b><button type="button" class="btn btn--ghost btn--sm" data-act="coupon-add">${icon("plus")}كود</button></div>${coupons.map((c, i) => `<div class="af-row">${grid2(`<label class="af"><span class="af__l">الكود</span><input class="input num" dir="ltr" data-coupon="${i}" data-f="code" value="${esc(c.code)}"></label>`, `<label class="af"><span class="af__l">الخصم ٪</span><input class="input num" type="number" data-coupon="${i}" data-f="pct" value="${c.pct}"></label>`, `<label class="af"><span class="af__l">الوصف</span><input class="input" data-coupon="${i}" data-f="label" value="${esc(c.label)}"></label>`)}<span class="af-row__act"><button type="button" class="icon-btn is-del" data-coupon-del="${esc(c.code)}">${icon("trash")}</button></span></div>`).join("")}</div>`) +
      card("بيانات التواصل والمنشأة", grid2(...[["phone", "الهاتف"], ["whatsapp", "واتساب"], ["email", "البريد"], ["city", "المدينة"], ["address", "العنوان"], ["hours", "ساعات العمل"], ["cr", "السجل التجاري"], ["vatNo", "الرقم الضريبي"]].map(x => F.text(`${C}.contact.${x[0]}`, x[1])))) +
      card("إعدادات", grid2(F.bool(`${C}.demo`, "نسخة عرض", { hint: "تظهر تنبيهات «الدفع محاكاة»" }), F.text(`${C}.adminPin`, "رمز دخول لوحة التحكم", { dir: "ltr" })));
  }
  const vTheme = () => card("الألوان", `${F.color("THEME.accent", "لون الفعل الأساسي (الجمرة)")}<p class="muted small">يُطبّق على الأزرار والمستشار والأسعار المميزة وكل العناصر البرتقالية.</p>
    <div class="row-btns"><button type="button" class="btn btn--ghost btn--sm" data-act="accent-reset">اللون الأصلي</button></div>`);

  function vPublish() {
    const gh = (() => { try { return JSON.parse(lsGet(LS.gh) || "{}"); } catch (e) { return {}; } })();
    const size = (JSON.stringify(draft).length / 1024).toFixed(0);
    return card("المعاينة", `<p class="muted">شاهد الموقع الحقيقي بالمسودة — في هذا المتصفح فقط.</p><div class="row-btns">${lsGet(LS.preview) === "1" ? `<button type="button" class="btn btn--line" data-act="preview-off">إيقاف المعاينة</button><a class="btn btn--ember" href="index.html" target="_blank">افتح الموقع ↗</a>` : `<button type="button" class="btn btn--ember" data-act="preview-on">${icon("share")}عاين الموقع بالمسودة</button>`}</div>`) +
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
  const VIEWFN = { dash: vDash, orders: vOrders, products: vProducts, herd: vHerd, services: vServices, advisor: vAdvisor, home: vHome, copy: vCopy, faq: vFaq, images: vImages, checkout: vCheckout, theme: vTheme, publish: vPublish };

  /* ---------------- الإطار ---------------- */
  function frame() {
    root.innerHTML = `<div class="adm-shell">
      <aside class="adm-nav"><a class="adm-nav__logo" href="index.html" target="_blank">${U.logo()}<span>لوحة التحكم</span></a>
        <nav>${VIEWS.map(v => `<button type="button" data-go="${v[0]}"${v[0] === view ? ' aria-current="page"' : ""}>${icon(v[2])}<span>${v[1]}</span></button>`).join("")}</nav>
        <a class="adm-nav__site" href="index.html" target="_blank">${icon("share")}فتح الموقع</a></aside>
      <div class="adm-main"><header class="adm-top"><h1>${(VIEWS.find(v => v[0] === view) || VIEWS[0])[1]}</h1><span class="adm-status"></span><span class="adm-save" aria-hidden="true">${icon("check", "", 2.4)}حُفظ</span>
        <button type="button" class="btn btn--line btn--sm" data-act="preview-on">${icon("share")}معاينة</button><button type="button" class="btn btn--ember btn--sm" data-go="publish">نشر</button></header>
        <div class="adm-body" id="admBody"></div></div></div>`;
  }
  function render() {
    if (!$(".adm-shell")) frame();
    $$(".adm-nav button[data-go]").forEach(b => b.toggleAttribute("aria-current", b.dataset.go === view));
    $(".adm-top h1").textContent = (VIEWS.find(v => v[0] === view) || VIEWS[0])[1];
    const body = $("#admBody"), y = window.scrollY;
    body.innerHTML = (VIEWFN[view] || vDash)();
    paintStatus();
    return y;
  }
  const go = v => { view = v; try { history.replaceState(null, "", "#" + v); } catch (e) { } render(); window.scrollTo(0, 0); };

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
  function download(name, text) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/javascript" })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
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
    root.addEventListener("click", async e => {
      const t = e.target;
      const g = t.closest("[data-go]"); if (g) { go(g.dataset.go); return; }
      const ep = t.closest("[data-edit-product]"); if (ep) { openProduct(+ep.dataset.editProduct); return; }
      const dp = t.closest("[data-del-product]"); if (dp) {
        if (!(await A.confirmSheet({ title: "حذف المنتج؟", text: "الأفضل إخفاؤه إن كان في طلبات سابقة.", ok: "حذف", danger: true }))) return;
        draft.PRODUCTS.splice(+dp.dataset.delProduct, 1); save(); $$(".sheet__x").forEach(x => x.click()); render(); return;
      }
      const da = t.closest("[data-del-animal]"); if (da) {
        if (!(await A.confirmSheet({ title: "حذف الماشية؟", text: "منتجاتها تبقى لكن بدون صفحة ماشية.", ok: "حذف", danger: true }))) return;
        draft.ANIMALS.splice(+da.dataset.delAnimal, 1); save(); render(); return;
      }
      const so = t.closest("[data-del-order]"); if (so) { if (await A.confirmSheet({ title: "حذف الطلب من هذا الجهاز؟", ok: "حذف", danger: true })) { S.orders.remove(so.dataset.delOrder); render(); } return; }
      const ri = t.closest("[data-reset-img]"); if (ri) { set("IMAGES." + ri.dataset.resetImg, CMS.original.IMAGES[ri.dataset.resetImg]); render(); return; }
      const cd = t.closest("[data-coupon-del]"); if (cd) { delete draft.CONFIG.coupons[cd.dataset.couponDel]; save(); render(); return; }
      const act = t.closest("[data-act]"); if (!act) return;
      const k = act.dataset.act;
      if (k === "new-product") newProduct();
      else if (k === "new-animal") newAnimal();
      else if (k === "coupon-add") { draft.CONFIG.coupons = draft.CONFIG.coupons || {}; draft.CONFIG.coupons["CODE" + (Object.keys(draft.CONFIG.coupons).length + 1)] = { pct: 10, label: "خصم 10٪" }; save(); render(); }
      else if (k === "accent-reset") { set("THEME.accent", (CMS.original.THEME || {}).accent || "#FF5A36"); document.documentElement.style.setProperty("--ember", draft.THEME.accent); render(); }
      else if (k === "preview-on") { lsSet(LS.draft, JSON.stringify(draft)); lsSet(LS.preview, "1"); window.open("index.html", "_blank"); if (view === "publish") render(); }
      else if (k === "preview-off") { try { localStorage.removeItem(LS.preview); } catch (x) { } render(); }
      else if (k === "export") download("content.js", contentFile(draft));
      else if (k === "publish") publish();
      else if (k === "discard") { if (await A.confirmSheet({ title: "تجاهل المسودة؟", text: "تضيع كل التعديلات غير المنشورة.", ok: "تجاهل", danger: true })) { draft = clone(CMS.published || CMS.original); save(true); render(); } }
      else if (k === "original") { if (await A.confirmSheet({ title: "الرجوع للأصل؟", text: "تصير المسودة مثل محتوى الموقع الأصلي (data.js). لا يتغير الموقع حتى تنشر.", ok: "رجوع", danger: true })) { draft = clone(CMS.original); save(true); render(); } }
    });
    root.addEventListener("change", e => {
      const t = e.target;
      if (t.matches("[data-status]")) { S.orders.setStatus(t.dataset.status, t.value); A.toast("تحدّثت حالة الطلب", { icon: "check" }); }
      if (t.matches("[data-pfilter]")) { pFilter = t.value; render(); }
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
    });
    root.addEventListener("input", e => {
      const t = e.target;
      if (t.matches("[data-psearch]")) { pSearch = t.value.trim(); const pos = t.selectionStart; render(); const n = $("[data-psearch]"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
      if (t.matches("[data-coupon]")) {
        const list = Object.keys(draft.CONFIG.coupons).map(code => ({ code, pct: draft.CONFIG.coupons[code].pct, label: draft.CONFIG.coupons[code].label }));
        const c = list[+t.dataset.coupon]; if (!c) return;
        c[t.dataset.f] = t.dataset.f === "pct" ? +t.value : t.dataset.f === "code" ? t.value.toUpperCase().replace(/\s/g, "") : t.value;
        draft.CONFIG.coupons = {}; list.forEach(x => { if (x.code) draft.CONFIG.coupons[x.code] = { pct: x.pct, label: x.label }; }); save();
      }
    });
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
    if (!pin || sessionStorage.getItem(LS.ok) === "1") { bindShell(); render(); return; }
    root.innerHTML = `<form class="adm-gate" id="gate"><span class="adm-gate__logo">${U.logo()}</span><h1>لوحة التحكم</h1><p class="muted">أدخل رمز الدخول</p>
      <input class="input num" type="password" inputmode="numeric" autocomplete="off" dir="ltr" name="pin" autofocus><button class="btn btn--ember btn--lg btn--block" type="submit">دخول</button>
      <p class="muted small">${D.CONFIG.demo ? "نسخة العرض: الرمز الافتراضي 2026 — غيّره من «الدفع والتوصيل والتواصل ← إعدادات»." : ""}</p></form>`;
    $("#gate").addEventListener("submit", e => {
      e.preventDefault();
      if (e.target.pin.value === pin) { try { sessionStorage.setItem(LS.ok, "1"); } catch (x) { } bindShell(); render(); }
      else { e.target.pin.classList.add("is-err"); A.toast("الرمز غير صحيح", { icon: "info" }); }
    });
  }
  gate();
})();
