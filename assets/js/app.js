/* =========================================================
   نُضْج — سلوك الواجهة المشترك
   شريط التنقل بنمط iOS، الأوراق السفلية، الميزان ونموذج الشراء،
   الإضافة السريعة، الشارات، المفضلة، وزر المستشار العائم.
   ========================================================= */
(function () {
  "use strict";
  /* تعديلات لوحة التحكم: إعادة رسم الصفحة قبل ربط السلوك (القوالب حمّلها cms.js) */
  if (window.NUDJ_CMS && window.NUDJ_CMS.rerender && window.NUDJ_TPL) { try { window.NUDJ_TPL.rerender(); } catch (e) { console.error(e); } }
  const D = window.NUDJ, S = window.NUDJ_STORE, U = window.NUDJ_UI;
  const C = D.CONFIG;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const html = document.documentElement;

  /* =========================================================
     التنبيه (Toast)
     ========================================================= */
  let toastT;
  function toast(msg, o) {
    o = o || {};
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.innerHTML = `${U.icon(o.icon || "check", "toast__ic", 2.2)}<span class="toast__msg">${U.esc(msg)}</span>${o.action ? `<a class="toast__act" href="${o.action.href}">${U.esc(o.action.label)}</a>` : ""}`;
    t.classList.remove("show"); void t.offsetWidth; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), o.ms || 2800);
  }

  /* =========================================================
     قفل التمرير (يعمل على iOS Safari)
     ========================================================= */
  let lockY = 0, locks = 0;
  function lockScroll() {
    if (locks++ > 0) return;
    lockY = window.scrollY;
    document.body.style.top = -lockY + "px";
    html.classList.add("is-locked");
  }
  function unlockScroll() {
    if (--locks > 0) return; locks = 0;
    html.classList.remove("is-locked");
    document.body.style.top = "";
    window.scrollTo(0, lockY);
  }

  /* =========================================================
     الورقة السفلية (Sheet) — على الجوال من الأسفل، وعلى الشاشة الكبيرة نافذة وسطية
     ========================================================= */
  const stack = [];
  function openSheet(o) {
    o = o || {};
    const back = document.createElement("div"); back.className = "sheet-backdrop";
    const sh = document.createElement("div");
    sh.className = "sheet" + (o.cls ? " " + o.cls : "") + (o.full ? " sheet--full" : "");
    sh.setAttribute("role", "dialog"); sh.setAttribute("aria-modal", "true");
    if (o.title) sh.setAttribute("aria-label", o.title);
    sh.innerHTML = `<div class="sheet__grab" aria-hidden="true"></div>
      ${o.bare ? "" : `<div class="sheet__head">${o.title ? `<h2 class="sheet__title">${o.title}</h2>` : "<span></span>"}<button class="sheet__x" type="button" aria-label="إغلاق">${U.icon("x", "", 2.2)}</button></div>`}
      <div class="sheet__body"></div>${o.foot ? `<div class="sheet__foot"></div>` : ""}`;
    const body = $(".sheet__body", sh);
    if (typeof o.body === "string") body.innerHTML = o.body; else if (o.body) body.appendChild(o.body);
    if (o.foot) { const f = $(".sheet__foot", sh); if (typeof o.foot === "string") f.innerHTML = o.foot; else f.appendChild(o.foot); }
    document.body.appendChild(back); document.body.appendChild(sh);
    lockScroll();
    const prevFocus = document.activeElement;
    requestAnimationFrame(() => { back.classList.add("in"); sh.classList.add("in"); });
    const ctl = {
      el: sh, body,
      close(result) {
        if (ctl.closed) return; ctl.closed = true;
        sh.classList.remove("in"); back.classList.remove("in");
        sh.style.transform = "";
        const done = () => { sh.remove(); back.remove(); };
        sh.addEventListener("transitionend", done, { once: true }); setTimeout(done, 450);
        unlockScroll();
        const i = stack.indexOf(ctl); if (i > -1) stack.splice(i, 1);
        if (prevFocus && prevFocus.focus) try { prevFocus.focus({ preventScroll: true }); } catch (e) { }
        if (o.onClose) o.onClose(result);
      }
    };
    stack.push(ctl);
    back.addEventListener("click", () => ctl.close());
    if ($(".sheet__x", sh)) $(".sheet__x", sh).addEventListener("click", () => ctl.close());
    /* السحب للأسفل للإغلاق */
    let y0 = null, dy = 0, t0 = 0;
    const startDrag = e => {
      if (window.innerWidth >= 900) return;
      if (e.target.closest(".sheet__body") && body.scrollTop > 0) return;
      y0 = e.touches ? e.touches[0].clientY : e.clientY; dy = 0; t0 = Date.now(); sh.classList.add("dragging");
    };
    const moveDrag = e => {
      if (y0 == null) return;
      dy = Math.max(0, (e.touches ? e.touches[0].clientY : e.clientY) - y0);
      sh.style.transform = `translateY(${dy}px)`;
    };
    const endDrag = () => {
      if (y0 == null) return; y0 = null; sh.classList.remove("dragging");
      const v = dy / Math.max(1, Date.now() - t0);
      if (dy > 110 || v > 0.6) ctl.close(); else sh.style.transform = "";
    };
    [$(".sheet__grab", sh), $(".sheet__head", sh), $(".adv__head", sh)].filter(Boolean).forEach(h => {
      h.addEventListener("touchstart", startDrag, { passive: true });
      h.addEventListener("touchmove", moveDrag, { passive: true });
      h.addEventListener("touchend", endDrag);
    });
    setTimeout(() => { const f = $("[autofocus]", sh) || $(".sheet__x", sh); if (f) try { f.focus({ preventScroll: true }); } catch (e) { } }, 60);
    return ctl;
  }
  document.addEventListener("keydown", e => { if (e.key === "Escape" && stack.length) stack[stack.length - 1].close(); });

  /* ورقة تأكيد بنمط iOS */
  function confirmSheet(o) {
    return new Promise(res => {
      const foot = document.createElement("div"); foot.className = "sheet__actions";
      foot.innerHTML = `<button class="btn ${o.danger ? "btn--danger" : "btn--brand"} btn--block" type="button" data-ok>${o.ok || "تأكيد"}</button><button class="btn btn--ghost btn--block" type="button" data-no>${o.cancel || "تراجع"}</button>`;
      const sh = openSheet({ title: o.title, body: o.text ? `<p class="sheet__text">${o.text}</p>` : "", foot, cls: "sheet--alert", onClose: r => res(!!r) });
      $("[data-ok]", foot).addEventListener("click", () => sh.close(true));
      $("[data-no]", foot).addEventListener("click", () => sh.close(false));
    });
  }

  /* =========================================================
     شريط التنقل (App bar) — العنوان الكبير ينكمش عند التمرير
     ========================================================= */
  function initAppBar() {
    const bar = $(".app-bar"); if (!bar) return;
    const onScroll = () => bar.classList.toggle("is-scrolled", window.scrollY > 4);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    /* العنوان الصغير يظهر في الشريط فقط بعد أن يختفي عنوان الصفحة الكبير — مثل iOS */
    const watch = $(".large-title") || $("main h1");
    if (watch && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(([e]) => bar.classList.toggle("show-title", !e.isIntersecting && e.boundingClientRect.top < 60), { rootMargin: "-56px 0px 0px 0px" });
      io.observe(watch);
    } else if (!watch) bar.classList.add("show-title");
  }

  /* زر الرجوع: يرجع في السجل إن كان المصدر من الموقع، وإلا يذهب للصفحة الأم */
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-back]"); if (!b) return;
    e.preventDefault();
    let same = false;
    try {
      const r = new URL(document.referrer);
      /* لا نرجع إلى خطوة انتهت (الدفع، الدخول، الاشتراك، الحجز) — نذهب للصفحة الأم بدلاً منها */
      const flow = /\/(checkout|login|subscribe|consult)\.html$/.test(r.pathname);
      same = r.origin === location.origin && r.href !== location.href && !flow;
    } catch (x) { }
    if (same && history.length > 1) history.back(); else location.href = b.getAttribute("href") || "index.html";
  });

  /* الضغط على التبويب الحالي يرجع لأعلى الصفحة (سلوك iOS) */
  document.addEventListener("click", e => {
    const t = e.target.closest(".tabbar a.is-on"); if (!t) return;
    if (t.getAttribute("href") === location.pathname.split("/").pop() || (t.getAttribute("href") === "index.html" && /\/$/.test(location.pathname))) {
      if (window.scrollY > 10) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    }
  });

  /* اتجاه انتقال الصفحات (للأمام / للخلف) */
  function markBack(e) { try { if (e.viewTransition && window.navigation && navigation.activation && navigation.activation.navigationType === "traverse") e.viewTransition.types.add("back"); } catch (x) { } }
  window.addEventListener("pagereveal", markBack);
  window.addEventListener("pageswap", e => { try { if (e.viewTransition && e.activation && e.activation.navigationType === "traverse") e.viewTransition.types.add("back"); } catch (x) { } });

  /* =========================================================
     الشارات والحالة العامة
     ========================================================= */
  function paintBadges() {
    const n = S.cart.count();
    $$("[data-cart-count]").forEach(b => { b.textContent = n > 99 ? "99+" : n; b.classList.toggle("has", n > 0); });
  }
  function bump() { $$(".tabbar [data-tab=cart], .hdr-cart").forEach(el => { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }); }

  function paintHearts(scope) {
    $$("[data-wish]", scope).forEach(b => { const on = S.wish.has(b.dataset.wish); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-wish]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const added = S.wish.toggle(b.dataset.wish);
    const p = D.byId(b.dataset.wish);
    toast(added ? "أُضيف للمفضلة" : "أُزيل من المفضلة", { icon: "heart", action: added ? { label: "عرض", href: "wishlist.html" } : null });
    paintHearts();
  });

  function paintAuth() {
    const u = S.user.get();
    $$("[data-auth]").forEach(el => { el.hidden = (el.dataset.auth === "in") !== !!u; });
    $$("[data-user-name]").forEach(el => { el.textContent = u ? (u.name || "أهلاً بك") : "ضيف"; });
    $$("[data-user-phone]").forEach(el => { el.textContent = u ? S.fmtPhone(u.phone) : ""; });
    $$("[data-city-label]").forEach(el => { el.textContent = S.city.get(); });
  }

  /* خانات الصور التي أُضيفت لاحقاً في IMAGES */
  function fillSlots() {
    $$("[data-slot]").forEach(el => {
      const src = D.IMAGES[el.dataset.slot];
      if (src && !el.querySelector("img")) el.innerHTML = `<img src="${U.esc(src)}" alt="" loading="lazy" decoding="async">`;
    });
  }

  function refresh() { paintBadges(); paintHearts(); paintAuth(); }
  S.on("cart", paintBadges);
  S.on("wish", () => paintHearts());
  S.on("auth", paintAuth);
  S.on("city", paintAuth);

  /* =========================================================
     نموذج الشراء: الميزان + التقطيع + التتبيل + الخدمات
     (صفحة المنتج + ورقة الإضافة السريعة)
     ========================================================= */
  function readForm(form, p) {
    const get = n => { const el = form.querySelector(`input[name$="-${n}"]:checked`); return el ? el.value : undefined; };
    const chk = n => { const el = form.querySelector(`input[name="${n}"]`); return !!(el && el.checked && !el.closest("[hidden]")); };
    const noteEl = form.querySelector("textarea[name=note]");
    const qEl = form.querySelector("output[name=qty]");
    const r = { note: noteEl ? noteEl.value.trim() : "", opts: {} };
    if (p.sold === "kg") {
      r.kg = parseFloat(form.dataset.kg || p.def);
      r.opts = { prep: get("prep"), marinade: get("marinade"), skewer: chk("skewer"), vacuum: chk("vacuum") };
    } else {
      if (p.sold === "carcass") r.opts = { size: get("size"), part: get("part"), style: get("style"), vacuum: chk("vacuum") };
      r.qty = qEl ? (parseInt(qEl.textContent, 10) || 1) : 1;
    }
    return r;
  }
  function setKg(form, p, kg) {
    kg = S.snapKg(p, kg); form.dataset.kg = kg;
    const out = form.querySelector(".scale__read"); if (out) out.textContent = kg.toFixed(2);
    const nd = form.querySelector(".scale__needle"); if (nd) nd.style.transform = `rotate(${-90 + Math.min(1, kg / 5) * 180}deg)`;
    $$("[data-kg]", form).forEach(b => b.classList.toggle("on", +b.dataset.kg === kg));
    form.dispatchEvent(new Event("change"));
  }
  function bindBuyForm(form, o) {
    o = o || {};
    if (!form || form.dataset.bound) return; form.dataset.bound = "1";
    const p = D.byId(form.dataset.product); if (!p) return;
    const totalEl = form.querySelector("[data-total]"), sumEl = form.querySelector("[data-sum]");
    function update() {
      /* سطر التسييخ يظهر فقط لأشكال التقطيع القابلة للتسييخ */
      const sk = form.querySelector("[data-skew-row]");
      if (sk) {
        const pr = form.querySelector('input[name$="-prep"]:checked');
        const ok = pr && D.PREPS[pr.value] && D.PREPS[pr.value].skew;
        sk.hidden = !ok; if (!ok) { const i = sk.querySelector("input"); if (i) i.checked = false; }
      }
      const r = readForm(form, p);
      const b = S.breakdown(p.sold === "kg" ? { id: p.id, kg: r.kg, opts: r.opts } : { id: p.id, qty: r.qty, opts: r.opts });
      if (totalEl) totalEl.textContent = U.money(b.total) + " " + C.currency;
      if (sumEl) sumEl.innerHTML = b.adds.length ? `<span>${p.sold === "kg" ? U.kgTxt(r.kg) + " × " + U.money(p.price) : "الأساس"} <b class="num">${U.money(b.base)}</b></span>${b.adds.map(a => `<span>+ ${a.n} <b class="num">${U.money(a.v)}</b></span>`).join("")}` : "";
      $$(".opt", form).forEach(f => f.classList.toggle("has-val", !!f.querySelector("input:checked")));
      if (o.onChange) o.onChange(r, b.total);
    }
    form.addEventListener("change", update);
    form.addEventListener("click", e => {
      const k = e.target.closest("[data-kg]"); if (k) { setKg(form, p, +k.dataset.kg); return; }
      const ks = e.target.closest("[data-kg-step]"); if (ks) { setKg(form, p, parseFloat(form.dataset.kg || p.def) + (+ks.dataset.kgStep) * (p.step || 0.5)); return; }
      const s = e.target.closest("[data-step]"); if (!s) return;
      const out = form.querySelector("output[name=qty]");
      out.textContent = Math.max(1, Math.min(99, (parseInt(out.textContent, 10) || 1) + parseInt(s.dataset.step, 10))); update();
    });
    form.addEventListener("submit", e => {
      e.preventDefault();
      const r = readForm(form, p);
      S.cart.add(p.id, { kg: r.kg, qty: r.qty, opts: r.opts, note: r.note });
      bump();
      toast("أُضيف " + p.name + (p.sold === "kg" ? " · " + U.kgTxt(r.kg) : ""), { icon: "cart", action: { label: "السلة", href: "cart.html" } });
      if (o.onAdded) o.onAdded(r);
    });
    if (p.sold === "kg") setKg(form, p, p.def); else update();
    form.update = update; form.setKg = kg => setKg(form, p, kg);
  }

  /* الإضافة السريعة من البطاقات: الإضافات مباشرة، واللحم بورقة الميزان */
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-quick]"); if (!b) return;
    e.preventDefault();
    const p = D.byId(b.dataset.quick); if (!p) return;
    if (p.sold === "piece") { S.cart.add(p.id, { qty: 1 }); bump(); toast("أُضيف " + p.name, { icon: "cart", action: { label: "السلة", href: "cart.html" } }); return; }
    const body = document.createElement("div");
    body.innerHTML = `<div class="qs-head">${U.productImg(p, "qs-head__img")}<div class="qs-head__b"><span class="tag__code num">${p.code}</span><b>${U.esc(p.name)}</b><span>${U.priceTag(p)}</span></div></div>
      ${U.buyForm(p)}<a class="qs-more" href="${U.url.product(p.id)}">كل التفاصيل عن ${U.esc(p.name)} ${U.icon("chevL")}</a>`;
    const sh = openSheet({ title: "أضف للسلة", body, cls: "sheet--buy" });
    bindBuyForm($(".buy-form", body), { onAdded: () => sh.close(true) });
  });

  /* =========================================================
     المستشار: الزر العائم + الورقة
     ========================================================= */
  function openAdvisor(o) {
    o = o || {};
    const ADV = window.NUDJ_ADVISOR; if (!ADV) { location.href = "advisor.html"; return; }
    if (o.occ) ADV.start(o.occ, o.hints); else if (o.ask) ADV.askAbout(o.ask);
    /* إن كان المستشار موجوداً في الصفحة ننتقل له بدل فتح ورقة */
    const inline = $("[data-advisor-inline]");
    if (inline && !o.sheet) { inline.scrollIntoView({ behavior: "smooth", block: "center" }); const i = inline.querySelector(".adv__input input"); if (i && window.innerWidth >= 900) setTimeout(() => i.focus({ preventScroll: true }), 500); return; }
    const body = document.createElement("div"); body.className = "adv-host";
    const sh = openSheet({ body, cls: "sheet--advisor", full: true, bare: true });
    ADV.mount(body, { close: true, cls: "adv--sheet", scroll: true, onClose: () => sh.close() });
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-advisor]"); if (!b) return;
    e.preventDefault();
    openAdvisor({ occ: b.dataset.advisor && b.dataset.advisor !== "open" ? b.dataset.advisor : null, ask: b.dataset.ask || null, hints: b.dataset.animal ? { animal: b.dataset.animal } : null, sheet: b.hasAttribute("data-sheet") });
  });
  function initFab() {
    if (document.body.classList.contains("page-advisor") || document.body.classList.contains("page-admin") || $("[data-no-fab]") || $("[data-advisor-inline]")) return;
    const f = document.createElement("button");
    f.type = "button"; f.className = "fab"; f.setAttribute("data-advisor", "open"); f.setAttribute("data-sheet", ""); f.setAttribute("aria-label", "اسأل مستشار نُضْج");
    f.innerHTML = `<span class="fab__av">${U.mark("fab__mark")}</span><span class="fab__t">اسأل المستشار</span>`;
    document.body.appendChild(f);
  }

  /* =========================================================
     تسجيل الدخول المطلوب
     ========================================================= */
  function requireLogin(next) {
    if (S.user.get()) return true;
    location.href = "login.html?next=" + encodeURIComponent(next || (location.pathname.split("/").pop() + location.search));
    return false;
  }

  /* =========================================================
     متفرقات
     ========================================================= */
  /* بحث الترويسة (سطح المكتب) */
  document.addEventListener("submit", e => {
    const f = e.target.closest("[data-search-form]"); if (!f) return;
    e.preventDefault();
    const q = (f.querySelector("input").value || "").trim();
    location.href = "search.html" + (q ? "?q=" + encodeURIComponent(q) : "");
  });

  /* اختيار المدينة */
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-city]"); if (!b) return;
    e.preventDefault();
    const cur = S.city.get();
    const body = `<p class="sheet__text">نعرض لك مواعيد التوصيل المتاحة حسب مدينتك.</p><div class="group">${C.cities.map(c =>
      `<button class="cell" type="button" data-pick-city="${U.esc(c)}"><span class="cell__b"><span class="cell__t">${c}</span></span>${c === cur ? U.icon("check", "cell__check", 2.4) : ""}</button>`).join("")}</div>`;
    const sh = openSheet({ title: "التوصيل إلى", body });
    sh.body.addEventListener("click", ev => { const c = ev.target.closest("[data-pick-city]"); if (!c) return; S.city.set(c.dataset.pickCity); sh.close(); toast("التوصيل إلى " + c.dataset.pickCity, { icon: "pin" }); });
  });

  /* المشاركة */
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-share]"); if (!b) return;
    e.preventDefault();
    const data = { title: document.title, url: location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(location.href); toast("نُسخ الرابط", { icon: "share" });
    } catch (x) { }
  });

  /* =========================================================
     أدوات مشتركة للصفحات
     ========================================================= */
  /* توحيد النص العربي للبحث: بدون تشكيل، والهمزات والتاء المربوطة والألف المقصورة موحّدة */
  const norm = s => String(s || "").toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
    .replace(/\s+/g, " ").trim();

  /* أيام وفترات (للتوصيل والاستشارة) */
  const dayFmt = (d, o) => d.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", o);
  function slotPicker(daysEl, timesEl, o) {
    o = o || {};
    const list = o.times || C.windows, n = o.days || C.deliveryDays, lead = o.leadHours == null ? 2 : o.leadHours;
    const now = new Date();
    const days = [];
    for (let i = 0; days.length < n && i < n + 2; i++) {
      const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i);
      const open = list.some(w => i > 0 || w.h - lead > now.getHours());
      if (open) days.push({ d, i });
    }
    const state = { day: null, time: null };
    daysEl.innerHTML = days.map((x, k) => `<button class="day" type="button" role="radio" aria-checked="${k === 0}" data-i="${k}"><small>${x.i === 0 ? "اليوم" : x.i === 1 ? "غداً" : dayFmt(x.d, { weekday: "long" })}</small><b>${x.d.getDate()}</b><small>${dayFmt(x.d, { month: "short" })}</small></button>`).join("");
    function paintTimes() {
      const x = days[state.dayIdx];
      timesEl.innerHTML = list.map((w, k) => {
        const off = x.i === 0 && w.h - lead <= now.getHours();
        return `<button class="time" type="button" role="radio" aria-checked="false" data-k="${k}"${off ? " disabled" : ""}>${w.l}</button>`;
      }).join("");
      const first = $(".time:not(:disabled)", timesEl);
      if (first) pickTime(+first.dataset.k); else { state.time = null; emit(); }
    }
    function pickDay(k) {
      state.dayIdx = k; state.day = days[k].d;
      $$(".day", daysEl).forEach(b => b.setAttribute("aria-checked", +b.dataset.i === k ? "true" : "false"));
      paintTimes();
    }
    function pickTime(k) {
      state.time = list[k];
      $$(".time", timesEl).forEach(b => b.setAttribute("aria-checked", +b.dataset.k === k ? "true" : "false"));
      emit();
    }
    function emit() { if (o.onChange) o.onChange(get()); }
    function get() {
      if (!state.day || !state.time) return null;
      const x = days[state.dayIdx];
      return { date: state.day.getTime(), dayLabel: x.i === 0 ? "اليوم" : x.i === 1 ? "غداً" : dayFmt(state.day, { weekday: "long" }),
        dateLabel: dayFmt(state.day, { weekday: "long", day: "numeric", month: "long" }), time: state.time.l };
    }
    daysEl.addEventListener("click", e => { const b = e.target.closest(".day"); if (b) pickDay(+b.dataset.i); });
    timesEl.addEventListener("click", e => { const b = e.target.closest(".time"); if (b && !b.disabled) pickTime(+b.dataset.k); });
    pickDay(0);
    return { get };
  }

  /* طرق الدفع + حقول البطاقة (واجهة فقط — لا تُحفظ بيانات البطاقة أبداً) */
  function payMethods(box, o) {
    o = o || {};
    const list = U.payments().filter(p => o.cod || !p.cod);
    const name = "pay" + Math.random().toString(36).slice(2, 6);
    box.innerHTML = `${C.demo ? `<p class="demo-banner">${U.icon("info")}نسخة تجريبية: الدفع محاكاة ولا يُخصم أي مبلغ.</p>` : ""}
      <div class="pay-list">${list.map((p, i) => `<label class="radio-card"><input type="radio" name="${name}" value="${p.k}"${i === 0 ? " checked" : ""}><span class="radio-card__b"><b>${U.esc(p.n)}</b><small>${U.esc(p.s)}</small></span>${U.payLogos(p)}</label>`).join("")}</div>
      <div class="card card-fields" hidden>
        <label class="field"><span class="field__l">رقم البطاقة</span><input class="input num" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" maxlength="23" dir="ltr" data-cc="num"></label>
        <div class="form-grid">
          <label class="field"><span class="field__l">تاريخ الانتهاء</span><input class="input num" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY" maxlength="7" dir="ltr" data-cc="exp"></label>
          <label class="field"><span class="field__l">رمز الأمان</span><input class="input num" inputmode="numeric" autocomplete="cc-csc" placeholder="CVV" maxlength="4" dir="ltr" data-cc="cvv"></label>
        </div>
      </div>`;
    const fields = $(".card-fields", box);
    const sync = () => { const p = C.payments.find(x => x.k === value()); fields.hidden = !(p && p.card); };
    const value = () => { const c = $(`input[name=${name}]:checked`, box); return c ? c.value : null; };
    box.addEventListener("change", sync);
    $("[data-cc=num]", box).addEventListener("input", e => { const v = e.target.value.replace(/\D/g, "").slice(0, 19); e.target.value = v.replace(/(.{4})/g, "$1 ").trim(); });
    $("[data-cc=exp]", box).addEventListener("input", e => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); e.target.value = v.length > 2 ? v.slice(0, 2) + " / " + v.slice(2) : v; });
    sync();
    return {
      value,
      label: () => (C.payments.find(x => x.k === value()) || {}).n,
      /* تحقق بسيط من اكتمال حقول البطاقة */
      valid() {
        const p = C.payments.find(x => x.k === value()); if (!p || !p.card) return true;
        const num = $("[data-cc=num]", box), exp = $("[data-cc=exp]", box), cvv = $("[data-cc=cvv]", box);
        const ok = [[num, num.value.replace(/\D/g, "").length >= 15], [exp, /^\d{2} \/ \d{2}$/.test(exp.value) && +exp.value.slice(0, 2) >= 1 && +exp.value.slice(0, 2) <= 12], [cvv, /^\d{3,4}$/.test(cvv.value)]];
        ok.forEach(([el, v]) => el.classList.toggle("is-err", !v));
        const bad = ok.find(x => !x[1]); if (bad) { bad[0].focus(); return false; } return true;
      }
    };
  }

  /* ورقة العنوان (إضافة/تعديل) — مشتركة بين الدفع والحساب */
  function addressSheet(a, onSaved) {
    a = a || {};
    const labels = ["المنزل", "العمل", "أخرى"];
    const body = document.createElement("form");
    body.noValidate = true;
    body.innerHTML = `
      <div class="seg seg--full" role="radiogroup" aria-label="نوع العنوان" style="margin-bottom:14px">${labels.map(l => `<button type="button" role="radio" data-l="${l}" aria-checked="${(a.label || "المنزل") === l}" class="${(a.label || "المنزل") === l ? "on" : ""}">${l}</button>`).join("")}</div>
      <label class="field"><span class="field__l">المدينة</span><select class="select" name="city">${C.cities.map(c => `<option${(a.city || S.city.get()) === c ? " selected" : ""}>${c}</option>`).join("")}</select></label>
      <label class="field"><span class="field__l">الحي</span><input class="input" name="district" value="${U.esc(a.district || "")}" placeholder="مثال: حي الملقا" required></label>
      <label class="field"><span class="field__l">الشارع</span><input class="input" name="street" value="${U.esc(a.street || "")}" placeholder="اسم الشارع" required></label>
      <div class="form-grid">
        <label class="field"><span class="field__l">رقم المبنى</span><input class="input num" name="building" inputmode="numeric" value="${U.esc(a.building || "")}" placeholder="0000" required></label>
        <label class="field"><span class="field__l">العنوان الوطني المختصر <small>(اختياري)</small></span><input class="input num" name="short" value="${U.esc(a.short || "")}" placeholder="ABCD1234" maxlength="8" dir="ltr"></label>
      </div>
      <label class="field"><span class="field__l">ملاحظات للمندوب <small>(اختياري)</small></span><input class="input" name="notes" value="${U.esc(a.notes || "")}" placeholder="أقرب معلم، رقم الشقة…"></label>
      <label class="check"><input type="checkbox" name="isDefault"${a.isDefault || !S.addr.list().length ? " checked" : ""}><span>اجعله العنوان الافتراضي</span></label>`;
    const foot = document.createElement("div");
    foot.innerHTML = `<button class="btn btn--brand btn--block btn--lg" type="button" data-save>حفظ العنوان</button>`;
    const sh = openSheet({ title: a.id ? "تعديل العنوان" : "عنوان جديد", body, foot });
    let label = a.label || "المنزل";
    $(".seg", body).addEventListener("click", e => { const b = e.target.closest("button[data-l]"); if (!b) return; label = b.dataset.l; $$(".seg button", body).forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); }); });
    $("[data-save]", foot).addEventListener("click", () => {
      const f = new FormData(body);
      let bad = null;
      ["district", "street", "building"].forEach(n => { const el = body.elements[n]; const ok = String(el.value).trim().length > 0; el.classList.toggle("is-err", !ok); if (!ok && !bad) bad = el; });
      if (bad) { bad.focus(); toast("أكمل الحقول المطلوبة", { icon: "info" }); return; }
      const saved = S.addr.save({ id: a.id, label, city: f.get("city"), district: f.get("district").trim(), street: f.get("street").trim(), building: f.get("building").trim(),
        short: (f.get("short") || "").trim().toUpperCase(), notes: (f.get("notes") || "").trim(), isDefault: !!f.get("isDefault") });
      sh.close(true); toast("حُفظ العنوان", { icon: "pin" });
      if (onSaved) onSaved(saved);
    });
    return sh;
  }
  const addrLine = a => a ? `${a.district}، ${a.street}، مبنى ${a.building} — ${a.city}` : "";

  /* زر يعرض حالة المعالجة ثم ينفّذ */
  function busy(btn, ms) {
    return new Promise(res => { if (!btn) return res(); btn.classList.add("is-busy"); setTimeout(() => { btn.classList.remove("is-busy"); res(); }, ms || 900); });
  }

  /* =========================================================
     التشغيل
     ========================================================= */
  function init() {
    fillSlots(); initAppBar(); refresh(); initFab();
    /* شريط «أنت تشاهد المسودة» للمدير فقط */
    if (window.NUDJ_CMS && window.NUDJ_CMS.preview && document.body.dataset.file !== "admin.html") {
      const b = document.createElement("div"); b.className = "preview-bar";
      b.innerHTML = `<span>${U.icon("edit")}تشاهد مسودة لوحة التحكم — غير منشورة</span><a href="admin.html">لوحة التحكم</a><button type="button" data-stop-preview>إيقاف المعاينة</button>`;
      document.body.appendChild(b);
      b.querySelector("[data-stop-preview]").addEventListener("click", () => { try { localStorage.removeItem("nudj_cms_preview"); } catch (e) { } location.reload(); });
    }
    $$(".buy-form").forEach(f => bindBuyForm(f));
    $$("[data-advisor-inline]").forEach(el => { if (window.NUDJ_ADVISOR) window.NUDJ_ADVISOR.mount(el, { cls: el.dataset.advisorInline || "", scroll: true }); });
    html.classList.add("js-ready");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  window.NUDJ_APP = { toast, openSheet, confirmSheet, bindBuyForm, requireLogin, refresh, paintHearts, lockScroll, unlockScroll, bump,
    norm, slotPicker, payMethods, busy, addressSheet, addrLine, openAdvisor, $, $$ };
})();
