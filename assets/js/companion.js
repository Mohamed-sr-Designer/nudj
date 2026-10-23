/* =========================================================
   نُضْج — الجزار والشيف: الشخصية الكاملة في أسفل الشاشة
   الشخصية تقف في الركن (يسار في العربية، يمين في الإنجليزية)، وأسئلة المستشار
   في فقاعة كلام بجانبها. واحدة فقط على المسرح: الجزار ثم يسلّم للشيف.
   الحالات: peek (واقف ينتظر) · open (يكلّمك) · mini (منسحب، يطل برأسه)
   ========================================================= */
window.NUDJ_CMP = (function () {
  "use strict";
  const D = window.NUDJ, U = window.NUDJ_UI;
  const L = D.L || (ar => ar), R = D.R || "";
  const KEY = "nudj_cmp";
  const file = (document.body && document.body.dataset.file) || "";
  const OFF = { "admin.html": 1, "checkout.html": 1, "login.html": 1, "order.html": 1 };
  let el = null, view = null, state = "peek", who = "butcher", idleT = null;

  const img = (p, talk) => R + "assets/img/site/" + p + "-pose" + (talk ? "-talk" : "") + ".webp";
  const ch = p => `<figure class="cmp__ch cmp__ch--${p}${p === who ? " is-on" : ""}" data-ch="${p}" aria-hidden="true"><img src="${img(p)}" alt="" decoding="async"><img class="o" src="${img(p, 1)}" alt="" decoding="async"></figure>`;
  const HINT = {
    butcher: [L("محتار وش تطلب؟", "Not sure what to order?"), L("قل لي المناسبة وكم شخص — أحسبها لك بالجرام.", "Tell me the occasion and headcount — I'll work it out to the gram.")],
    chef: [L("نكمّل التقطيع والإضافات؟", "Shall we finish the cutting and extras?"), L("الشيف بانتظارك.", "The chef is waiting for you.")]
  };

  function ok() { return !!el; }
  function save() { try { sessionStorage.setItem(KEY, state); } catch (e) { } }
  function set(s) {
    state = s; el.dataset.state = s; save();
    document.documentElement.classList.toggle("cmp-open", s === "open");
    if (s === "open") mountAdvisor();
    hint();
  }
  function hint() {
    const h = el.querySelector(".cmp__hint"); if (!h) return;
    const t = HINT[who];
    h.innerHTML = `<b>${t[0]}</b><small>${t[1]}</small>`;
  }
  function mountAdvisor() {
    if (view || !window.NUDJ_ADVISOR) return;
    const host = el.querySelector(".cmp__panel");
    view = window.NUDJ_ADVISOR.mount(host, { cls: "adv--cmp", close: true, scroll: true, onClose: () => set("peek") });
  }
  /* تبديل الشخصية: الحالية تنزل، والثانية تطلع */
  function speaker(p) {
    if (!el || p === who) return;
    who = p; el.dataset.who = p;
    el.querySelectorAll("[data-ch]").forEach(f => f.classList.toggle("is-on", f.dataset.ch === p));
    hint();
  }
  function talk(p, dur) {
    if (!el) return;
    speaker(p);
    const f = el.querySelector(`[data-ch="${p}"]`); if (!f) return;
    f.classList.add("is-talking");
    clearTimeout(f._t); f._t = setTimeout(() => f.classList.remove("is-talking"), dur || 1000);
  }
  /* لو العميل وقف عن التفاعل: تلويحة صغيرة مرة واحدة */
  function idle() {
    clearTimeout(idleT);
    idleT = setTimeout(() => { if (state !== "mini") el.classList.add("is-nudge"); setTimeout(() => el && el.classList.remove("is-nudge"), 1800); }, 20000);
  }

  function init() {
    if (el || OFF[file] || document.querySelector("[data-no-fab]")) return;
    el = document.createElement("div");
    el.className = "cmp"; el.dataset.who = who;
    el.innerHTML = `<div class="cmp__panel" role="dialog" aria-label="${L("مستشار نُضْج: الجزار والشيف", "NUDJ advisor: the butcher and the chef")}"></div>
  <button type="button" class="cmp__hint" data-cmp-open></button>
  <button type="button" class="cmp__cast" data-cmp-open aria-label="${L("اسأل الجزار والشيف", "Ask the butcher and the chef")}">${ch("butcher")}${ch("chef")}<span class="cmp__floor" aria-hidden="true"></span></button>
  <button type="button" class="cmp__min" data-cmp-min aria-label="${L("إخفاء", "Hide")}">${U.icon("chevD", "", 2.4)}</button>`;
    document.body.appendChild(el);
    let s0 = "peek"; try { s0 = sessionStorage.getItem(KEY) || "peek"; } catch (e) { }
    if (document.body.classList.contains("page-advisor")) s0 = "open";
    if (s0 === "open" && !document.body.classList.contains("page-advisor") && window.innerWidth < 760) s0 = "peek";
    el.dataset.state = "enter";
    requestAnimationFrame(() => setTimeout(() => set(s0), 450));
    el.addEventListener("click", e => {
      if (e.target.closest("[data-cmp-min]")) { set(state === "mini" ? "peek" : "mini"); return; }
      if (e.target.closest("[data-cmp-open]")) { set(state === "open" ? "peek" : "open"); }
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && state === "open") set("peek"); });
    document.addEventListener("nudj:speaker", e => speaker(e.detail));
    document.addEventListener("nudj:talk", e => talk(e.detail.p, e.detail.dur));
    ["click", "keydown", "scroll"].forEach(t => document.addEventListener(t, idle, { passive: true }));
    idle();
  }
  function open() { if (!el) init(); if (el) set("open"); }
  return { init, open, ok, set: s => el && set(s) };
})();
