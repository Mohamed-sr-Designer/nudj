/* المتجر: النوع + التصفية + البحث + الترتيب — والحالة محفوظة في الرابط */
(function () {
  "use strict";
  const D = window.NUDJ, A = window.NUDJ_APP, U = window.NUDJ_UI;
  const { $, $$ } = A;
  const grid = $("#grid"); if (!grid) return;

  const cards = $$(".pcard", grid);
  const byId = id => D.byId(id);
  const order = D.PRODUCTS.map(p => p.id);
  const q0 = new URLSearchParams(location.search);
  const S = {
    t: q0.get("t") || "",
    z: new Set((q0.get("z") || "").split(",").filter(Boolean)),
    m: new Set((q0.get("m") || "").split(",").filter(Boolean)),
    f: new Set((q0.get("f") || "").split(",").filter(Boolean)),
    q: q0.get("q") || "",
    sort: q0.get("sort") || ""
  };

  const typeOk = p => {
    if (!S.t) return true;
    if (S.t === "carcass") return p.type === "carcass";
    if (S.t === "box") return p.type === "box";
    if (S.t === "mince") return !!p.mince;
    if (S.t === "lamb") return p.type === "cut" && p.animal === "ضأن" && !p.mince;
    if (S.t === "beef") return p.type === "cut" && p.animal === "بقر" && !p.mince;
    return true;
  };
  const hay = p => A.norm([p.name, p.en, p.short, (p.bestFor || []).join(" "), p.type === "carcass" ? "ذبيحه ذبايح" : "", p.type === "box" ? "بوكس" : ""].join(" "));
  function match(p) {
    if (!typeOk(p)) return false;
    const needCut = S.z.size || S.m.size || S.f.size;
    if (needCut && p.type !== "cut") return false;
    if (S.z.size && !S.z.has(p.zone)) return false;
    if (S.m.size && !p.methods.some(m => S.m.has(m))) return false;
    if (S.f.has("tender") && p.spec[0] < 4) return false;
    if (S.f.has("fat") && p.spec[1] < 4) return false;
    if (S.f.has("easy") && p.spec[3] > 2) return false;
    if (S.q) { const words = A.norm(S.q).split(" "); const h = hay(p); if (!words.every(w => h.indexOf(w) > -1)) return false; }
    return true;
  }
  const price = p => window.NUDJ_STORE.fromPrice(p);
  const SORT = {
    low: (a, b) => price(a) - price(b), high: (a, b) => price(b) - price(a),
    tender: (a, b) => ((b.spec || [0])[0] - (a.spec || [0])[0]), bold: (a, b) => ((b.spec || [0, 0, 0])[2] - (a.spec || [0, 0, 0])[2])
  };

  function apply(push) {
    const list = D.PRODUCTS.filter(match);
    if (S.sort && SORT[S.sort]) list.sort(SORT[S.sort]); else list.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    const ids = list.map(p => p.id);
    cards.forEach(c => { c.hidden = ids.indexOf(c.dataset.id) < 0; });
    ids.forEach(id => { const c = cards.find(x => x.dataset.id === id); if (c) grid.appendChild(c); });
    $("#resN").textContent = ids.length;
    $("#noRes").hidden = ids.length > 0;
    grid.hidden = ids.length === 0;
    $$("#typeChips button").forEach(b => { const on = b.dataset.t === S.t; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
    $$(".filters input, .sheet input[type=checkbox]").forEach(i => { i.checked = S[i.name] && S[i.name].has(i.value); });
    const dot = $("#openFilters .dot"); if (dot) dot.hidden = !(S.z.size || S.m.size || S.f.size);
    $("#sort").value = S.sort;
    const qi = $("#shopQ"); if (qi && qi !== document.activeElement) qi.value = S.q;
    /* عنوان الصفحة يعكس النوع */
    const T = D.TYPES.find(t => t.k === S.t);
    document.title = (T ? T.n + " — " : "") + "المتجر · نُضْج";
    syncUrl(push);
  }
  function syncUrl(push) {
    const p = new URLSearchParams();
    if (S.t) p.set("t", S.t);
    ["z", "m", "f"].forEach(k => { if (S[k].size) p.set(k, Array.from(S[k]).join(",")); });
    if (S.q) p.set("q", S.q);
    if (S.sort) p.set("sort", S.sort);
    const url = "shop.html" + (p.toString() ? "?" + p.toString() : "");
    try { history[push ? "pushState" : "replaceState"](null, "", url); } catch (e) { }
  }

  /* النوع */
  $("#typeChips").addEventListener("click", e => {
    const b = e.target.closest("button[data-t]"); if (!b) return;
    S.t = b.dataset.t; apply(true);
    b.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });
  /* التصفية (سطح المكتب) */
  document.addEventListener("change", e => {
    const i = e.target.closest("input[type=checkbox][name]"); if (!i || !S[i.name] || !(S[i.name] instanceof Set)) return;
    if (i.checked) S[i.name].add(i.value); else S[i.name].delete(i.value);
    apply();
  });
  document.addEventListener("click", e => {
    if (!e.target.closest("[data-clear]")) return;
    S.z.clear(); S.m.clear(); S.f.clear(); S.q = ""; S.t = "";
    const qi = $("#shopQ"); if (qi) qi.value = "";
    apply();
  });
  $("#sort").addEventListener("change", e => { S.sort = e.target.value; apply(); });

  /* البحث داخل المتجر */
  const qi = $("#shopQ");
  if (qi) { let t; qi.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { S.q = qi.value.trim(); apply(); }, 180); }); }

  /* التصفية على الجوال: ورقة سفلية */
  const fb = $("#openFilters");
  if (fb) fb.addEventListener("click", () => {
    const body = document.createElement("div");
    body.innerHTML = $("#filters").innerHTML;
    const foot = document.createElement("div");
    foot.innerHTML = `<button class="btn btn--brand btn--block btn--lg" type="button" data-done>عرض النتائج (<span data-n>${$("#resN").textContent}</span>)</button>`;
    const sh = A.openSheet({ title: "تصفية", body, foot });
    $$("input", body).forEach(i => { i.checked = S[i.name] && S[i.name].has(i.value); });
    const upd = () => { $("[data-n]", foot).textContent = $("#resN").textContent; };
    body.addEventListener("change", () => setTimeout(upd, 0));
    body.addEventListener("click", e => { if (e.target.closest("[data-clear]")) setTimeout(() => { $$("input", body).forEach(i => { i.checked = false; }); upd(); }, 0); });
    $("[data-done]", foot).addEventListener("click", () => sh.close());
  });

  window.addEventListener("popstate", () => {
    const q = new URLSearchParams(location.search);
    S.t = q.get("t") || ""; S.q = q.get("q") || ""; S.sort = q.get("sort") || "";
    ["z", "m", "f"].forEach(k => { S[k] = new Set((q.get(k) || "").split(",").filter(Boolean)); });
    apply();
  });

  apply();
  /* تمرير الشريحة النشطة إلى العرض */
  const on = $("#typeChips .on"); if (on && S.t) on.scrollIntoView({ block: "nearest", inline: "center" });
})();
