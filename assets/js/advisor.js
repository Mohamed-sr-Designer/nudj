/* =========================================================
   نُضْج — مستشار نُضْج (محادثة تفاعلية بحلقة مفتوحة)
   يسأل عن المناسبة ← العدد ← الشكل ← التتبيل ← العدّة،
   ثم يطبع فاتورة بالجرام والسعر. كل إجابة قابلة للتعديل،
   وبعد النتيجة يرجع يسأل: طبق ثاني؟ عدد مختلف؟ للسلة؟
   الحالة مشتركة بين كل نسخ المستشار في الصفحة (sessionStorage).
   ========================================================= */
window.NUDJ_ADVISOR = (function () {
  "use strict";
  const D = window.NUDJ, S = window.NUDJ_STORE, U = window.NUDJ_UI;
  const AD = D.ADVISOR, C = D.CONFIG;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = U.esc, icon = U.icon;
  const KEY = "nudj_adv";
  const up = kg => Math.max(0.5, Math.ceil(kg * 2 - 1e-9) / 2);
  const r2 = n => Math.round(n * 100) / 100;

  /* ---------------- الحالة ---------------- */
  const fresh = () => ({ v: 3, a: {}, sections: [], hints: {}, pre: {}, adj: {}, added: 0, note: "", seq: 0 });
  let st = load();
  function load() { try { const s = JSON.parse(sessionStorage.getItem(KEY)); if (s && s.v === 3) return s; } catch (e) { } return fresh(); }
  function save(anim) { st.seq++; st.anim = anim || null; try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } S.emit("advisor"); }

  /* ---------------- صياغة ---------------- */
  const people = n => n === 1 ? "شخص واحد" : n === 2 ? "شخصين" : n <= 10 ? n + " أشخاص" : n + " شخص";
  const dish = a => AD.dishes.find(d => d.k === a.dish) || AD.dishes[0];
  const aName = k => (D.animal(k) || {}).n || "";
  const animalsOpt = keys => keys.map(k => ({ k, n: aName(k) }));
  const priceOf = id => D.byId(id).price;

  /* ---------------- الأسئلة ---------------- */
  const hasSkew = a => (a.forms || []).some(k => { const f = AD.grillForms.find(x => x.k === k); return f && f.skew; });
  function toolsOpts(a) {
    const kg = r2(a.people * AD.grams.grill / 1000);
    const o = [
      { k: "charcoal", n: "فحم طبيعي", d: Math.ceil(kg / AD.charcoalKgPerBag) + " كيس × " + priceOf("charcoal") + " ر.س" },
      { k: "starters", n: "مكعبات إشعال", d: "علبة × " + priceOf("starters") + " ر.س" },
      { k: "trays", n: "صواني ألمنيوم", d: Math.ceil(a.people / AD.trayPeoplePerSet) + " طقم × " + priceOf("trays") + " ر.س" }
    ];
    if (hasSkew(a) && a.skewer !== "yes") o.push({ k: "skewers", n: "أسياخ ستيل", d: "طقم 10 × " + priceOf("skewers") + " ر.س" });
    return o;
  }
  const yes = (n, p, per) => ({ k: "yes", n, p, per });
  const NODES = {
    occ: { type: "occ", ask: () => st.sections.length ? "حلو! وش المناسبة أو الطبق الثاني؟" : "هلا! أنا مستشار نُضْج. قل لي وش المناسبة، وأحسب لك كل شي بالجرام — اللحم والتتبيلة والفحم — وتطلبه بضغطة.",
      opts: () => AD.occasions.filter(o => o.on !== false).map(o => ({ k: o.k, n: o.n, d: o.s, img: o.img, ic: o.ic })) },
    people: { type: "people", ask: a => ({ grill: "كم شخص على الشواية؟", feast: "كم شخص معزوم؟", carcass: "كم شخص بتكفيهم الذبيحة؟", steak: "كم شخص على العشاء؟", weekly: "كم شخص في البيت؟", ask: "لكم شخص تبغى تطبخها؟" })[a.occ] },
    forms: { type: "multi", max: 3, ask: () => "وش تبغى على الشواية؟ قطع، شرائح، ولا قطع سليمة؟ تقدر تختار لين ثلاثة.", opts: () => AD.grillForms.map(f => ({ k: f.k, n: f.n, d: f.d })) },
    gAnimal: { type: "chips", ask: () => "أي لحم تفضّل؟",
      opts: a => { const ks = D.ANIMALS.map(x => x.k).filter(k => (a.forms || []).some(f => AD.grillForms.find(g => g.k === f).pick[k])); return [{ k: "mix", n: "نوّع لي", d: "الأنسب لكل نوع" }].concat(animalsOpt(ks)); } },
    marinade: { type: "chips", ask: () => "تبغى نتبّلها لك؟ التتبيل خدمة إضافية تنحسب بالكيلو.", opts: () => D.MARINADES.map(m => ({ k: m.k, n: m.n, d: m.d, p: m.p, per: "/كجم" })) },
    skewer: { type: "chips", skip: a => !hasSkew(a), ask: () => "نسيّخها لك جاهزة على أسياخ؟",
      opts: () => [yes("إيه سيّخوها", D.SERVICES.skewer.p, "/كجم"), { k: "no", n: "لا، أسيّخها بنفسي" }] },
    tools: { type: "multi", min: 0, ask: () => "وعدّة الشواء؟ حسبت لك الكميات على عددكم.", opts: toolsOpts, def: () => ["charcoal"] },
    dish: { type: "chips", ask: () => "وش الطبخة؟", opts: () => AD.dishes.map(d => ({ k: d.k, n: d.n })) },
    fAnimal: { type: "chips", ask: a => "أي لحم للـ" + dish(a).n + "؟", opts: a => animalsOpt(dish(a).animals) },
    mode: { type: "chips", skip: a => !(a.people >= 12 && ["lamb", "goat"].indexOf(a.fAnimal) > -1 && ["kabsa", "mandi"].indexOf(a.dish) > -1),
      ask: a => "لـ " + people(a.people) + "، الذبيحة غالباً أوفر من القطعيات وتجيك مقطّعة على الطبخة. وش تفضّل؟",
      opts: () => [{ k: "carcass", n: "ذبيحة مقطّعة", d: "التقطيع مجاني" }, { k: "cuts", n: "قطعيات فقط", d: "كتف أو فخذ" }] },
    bone: { type: "chips", skip: a => a.mode === "carcass" || ["kabsa", "mandi"].indexOf(a.dish) < 0, ask: () => "تبغاها قطع بالعظم ولا بدون عظم؟",
      opts: () => [{ k: "bone", n: "قطع بالعظم", d: AD.grams.kabsa + " جم للشخص" }, { k: "boneless", n: "بدون عظم", d: AD.grams.kabsaBoneless + " جم للشخص" }] },
    spice: { type: "chips", skip: a => !dish(a).spice, ask: a => "أضيف لك بهارات " + dish(a).n + "؟", opts: a => [yes("إيه أضف", priceOf(dish(a).spice || "spice-kabsa"), "/كيس"), { k: "no", n: "عندي بهارات" }] },
    trays: { type: "chips", ask: () => "تحتاج صواني ألمنيوم للتقديم؟", opts: a => [yes("إيه", priceOf("trays"), "/طقم"), { k: "no", n: "لا" }] },
    cAnimal: { type: "chips", ask: () => "ذبيحة إيش؟", opts: () => [{ k: "lamb", n: "ضأن", d: "من " + U.money(D.byId("lamb-half").sizes[0].p) + " ر.س للنصف" }, { k: "goat", n: "ماعز", d: "من " + U.money(D.byId("goat-half").sizes[0].p) + " ر.س للنصف" }] },
    style: { type: "chips", ask: () => "كيف نقطّعها لك؟ التقطيع مجاني.", opts: () => D.STYLES.map(s => ({ k: s.k, n: s.n, d: s.d })) },
    vacuum: { type: "chips", ask: a => a.occ === "carcass" ? "نغلّفها مفرّغة من الهواء؟ تدوم أطول في الفريزر." : "نغلّف كل وجبة في كيس مفرّغ؟",
      opts: a => [yes("إيه غلّفوها", a.occ === "carcass" ? D.SERVICES.vacuum.carcass : D.SERVICES.vacuum.p, a.occ === "carcass" ? "" : "/كجم"), { k: "no", n: "أكياس عادية", p: 0 }] },
    cSpice: { type: "multi", min: 0, ask: () => "تبغى بهارات معها؟", opts: () => ["spice-kabsa", "spice-mandi", "spice-grill"].map(id => ({ k: id, n: D.byId(id).name.replace(" 100 جم", ""), p: priceOf(id), per: "/كيس" })) },
    steakCut: { type: "chips", ask: () => "أي ستيك؟", opts: () => AD.steaks.map(id => { const p = D.byId(id); return { k: id, n: p.name, d: p.short, p: p.price, per: "/كجم", abs: true }; }).concat([{ k: "mix", n: "نوّع لي", d: "ريب آي + تندرلوين" }]) },
    where: { type: "chips", ask: () => "على الفحم ولا بالمقلاة؟", opts: () => [{ k: "coal", n: "على الفحم", d: "أضيف لك الفحم" }, { k: "pan", n: "مقلاة أو فرن" }] },
    sMarinade: { type: "chips", ask: () => "الستيك الطيب يكفيه ملح خشن. تبغى تتبيلة؟", opts: () => [{ k: "none", n: "ملح خشن فقط", p: 0 }, { k: "herb", n: "ليمون وأعشاب", p: D.marinade("herb").p, per: "/كجم" }] },
    days: { type: "chips", ask: () => "كم يوم تطبخون لحم في الأسبوع؟", opts: () => [{ k: "3", n: "3 أيام" }, { k: "5", n: "5 أيام" }, { k: "7", n: "كل يوم" }] },
    items: { type: "multi", ask: () => "وش تطبخون عادة؟ اختر كل اللي يناسبكم.", opts: () => AD.weekly.map(w => ({ k: w.k, n: w.n })) },
    wAnimal: { type: "chips", ask: () => "أي لحم في البيت؟", opts: () => [{ k: "mix", n: "نوّع لي" }].concat(animalsOpt(["lamb", "veal", "beef", "camel"])) },
    qAnimal: { type: "chips", ask: () => "عن أي ماشية؟", opts: () => animalsOpt(D.ANIMALS.map(x => x.k)) },
    qCut: { type: "chips", ask: a => "أي قطعة " + aName(a.qAnimal) + "؟", opts: a => D.cutsOf(a.qAnimal).filter(p => p.sold === "kg").map(p => ({ k: p.id, n: p.name, p: p.price, per: "/كجم", abs: true })) },
    qNext: { type: "chips", ask: a => aboutCut(a.qCut), html: true,
      opts: a => [{ k: "plan", n: "احسب لي كمية لعزومة" }, { k: "another", n: "اسأل عن قطعة ثانية", act: true }, { k: "add", n: "أضف 1 كجم للسلة", act: true }, { k: "open", n: "افتح صفحة القطعة", act: true, href: U.url.product(a.qCut) }] }
  };
  NODES.people.skip = a => a.occ === "ask" && a.qNext !== "plan";
  const FLOWS = {
    grill: ["occ", "people", "forms", "gAnimal", "marinade", "skewer", "tools"],
    feast: ["occ", "people", "dish", "fAnimal", "mode", "bone", "spice", "trays"],
    carcass: ["occ", "cAnimal", "people", "style", "vacuum", "cSpice"],
    steak: ["occ", "people", "steakCut", "where", "sMarinade"],
    weekly: ["occ", "people", "days", "items", "wAnimal", "vacuum"],
    ask: ["occ", "qAnimal", "qCut", "qNext", "people"]
  };
  const flow = () => FLOWS[st.a.occ] || ["occ"];
  const isSkip = k => NODES[k].skip && NODES[k].skip(st.a);
  function current() { return flow().find(k => st.a[k] == null && !isSkip(k)) || null; }
  const opts = k => (typeof NODES[k].opts === "function" ? NODES[k].opts(st.a) : NODES[k].opts) || [];
  function label(k, v) {
    const n = NODES[k];
    if (n.type === "people") return people(v);
    if (n.type === "multi") { if (!v.length) return "بدون"; const o = opts(k); return v.map(x => (o.find(y => y.k === x) || { n: x }).n).join("، "); }
    const o = opts(k).find(x => x.k === v); return o ? o.n : v;
  }

  function aboutCut(id) {
    const p = D.byId(id), a = D.animal(p.animal);
    const g = gramsFor(p);
    return `<div class="adv-cut">${U.productImg(p, "adv-cut__img")}<div><span class="tag__code num">${p.code}</span><b>${esc(p.name)}</b><p>${esc(p.info)}</p>
      <dl><div><dt>تنفع لـ</dt><dd>${p.uses.map(u => D.USES[u].n).join("، ")}</dd></div><div><dt>التقطيع</dt><dd>${p.preps.map(k => D.PREPS[k].n).join("، ")}</dd></div>
      <div><dt>الكمية</dt><dd>${g.g} جم للشخص (${g.use})</dd></div><div><dt>السعر</dt><dd class="num">${U.money(p.price)} ر.س/كجم</dd></div></dl>${U.spec(p.spec)}</div></div>
      <p>وش تبغى نسوي بعدها؟</p>`;
  }
  function gramsFor(p) {
    const use = p.uses[0];
    const g = use === "grill" ? (p.bone ? AD.grams.grillBone : AD.grams.grill) : use === "kabsa" ? (p.bone ? AD.grams.kabsa : AD.grams.kabsaBoneless) : use === "steak" ? AD.grams.steak : use === "oven" ? AD.grams.oven : AD.grams.stew;
    return { g, use: D.USES[use].n };
  }

  /* ---------------- الحساب ---------------- */
  function pickCarcass(ak, n) {
    const need = n * AD.grams.kabsa / 1000;
    const whole = D.byId(ak + "-whole"), half = D.byId(ak + "-half");
    const hs = half.sizes.find(s => s.kg >= need);
    if (hs) return { id: half.id, size: hs.k, qty: 1, kg: hs.kg };
    const ws = whole.sizes.find(s => s.kg >= need);
    if (ws) return { id: whole.id, size: ws.k, qty: 1, kg: ws.kg };
    const L = whole.sizes[whole.sizes.length - 1], q = Math.ceil(need / L.kg);
    return { id: whole.id, size: L.k, qty: q, kg: L.kg * q };
  }
  const tool = (id, qty, why) => ({ id, qty: Math.max(1, qty), why });
  const meatKg = lines => r2(lines.reduce((t, l) => { const p = D.byId(l.id); return t + (p.sold === "kg" ? l.kg : p.sold === "carcass" ? l.kgc || 0 : 0); }, 0));

  function compute() {
    const a = st.a, lines = [], notes = [];
    let title = "";
    if (a.occ === "grill") {
      const forms = a.forms.map(k => AD.grillForms.find(f => f.k === k));
      const per = AD.grams.grill * a.people / 1000 / forms.length;
      const used = [];
      forms.forEach(f => {
        let ak = a.gAnimal;
        if (ak === "mix" || !f.pick[ak]) {
          const pref = ["lamb", "veal", "beef", "camel", "goat", "buffalo"].filter(k => f.pick[k]);
          const pk = ak === "mix" ? (pref.find(k => used.indexOf(k) < 0) || pref[0]) : pref[0];
          if (ak !== "mix") notes.push(f.n + " من " + aName(ak) + " ما تتوفر عندنا — اخترت لك " + aName(pk) + ".");
          ak = pk;
        }
        used.push(ak);
        const pk = f.pick[ak], id = Array.isArray(pk) ? pk[0] : pk, prep = Array.isArray(pk) ? pk[1] : f.prep, p = D.byId(id);
        const bi = p.bone && ["chops", "rack", "kabsa", "mandi", "osso", "whole", "stew"].indexOf(prep) > -1;
        const kg = up(per * (bi ? 1.3 : 1));
        const o = { prep };
        if (a.marinade !== "none" && prep !== "steaks") o.marinade = a.marinade;
        if (a.skewer === "yes" && D.PREPS[prep].skew) o.skewer = true;
        lines.push({ id, kg, opts: o, why: f.n + " · " + Math.round(kg * 1000 / a.people) + " جم للشخص" + (bi ? " بالعظم" : "") });
      });
      if (a.marinade !== "none" && lines.some(l => l.opts.prep === "steaks")) notes.push("الستيك تركته بدون تتبيلة — يكفيه ملح خشن على الجمر.");
      const kg = meatKg(lines), skewKg = r2(lines.filter(l => D.PREPS[l.opts.prep].skew).reduce((t, l) => t + l.kg, 0));
      (a.tools || []).forEach(t => {
        if (t === "charcoal") lines.push(tool("charcoal", Math.ceil(kg / AD.charcoalKgPerBag), "كيس لكل " + AD.charcoalKgPerBag + " كجم لحم"));
        if (t === "starters") lines.push(tool("starters", 1, "تكفي لإشعال الفحم"));
        if (t === "trays") lines.push(tool("trays", Math.ceil(a.people / AD.trayPeoplePerSet), "طقم لكل " + AD.trayPeoplePerSet + " أشخاص"));
        if (t === "skewers") lines.push(tool("skewers", Math.ceil(skewKg / AD.skewerKgPerSet), "طقم لكل " + AD.skewerKgPerSet + " كجم"));
      });
      title = "حفلة مشاوي · " + people(a.people);
    } else if (a.occ === "feast") {
      const d = dish(a);
      if (a.mode === "carcass") {
        const c = pickCarcass(a.fAnimal, a.people);
        lines.push({ id: c.id, qty: c.qty, kgc: c.kg, opts: { size: c.size, style: d.k === "mandi" ? "mandi" : "kabsa" }, why: "≈ " + c.kg + " كجم تكفي نحو " + Math.floor(c.kg / (AD.grams.kabsa / 1000)) + " شخص" });
      } else {
        let pick, g;
        if (d.k === "marag") { pick = AD.dishPick.marag[a.fAnimal]; g = AD.grams.stew; }
        else if (d.k === "oven") { pick = AD.dishPick.oven[a.fAnimal]; g = AD.grams.oven; notes.push("الفخذ الواحد 2–2.5 كجم تقريباً — نقسّم الوزن على أفخاذ كاملة قدر الإمكان."); }
        else if (a.bone === "boneless") { pick = AD.boneless[d.k][a.fAnimal]; g = AD.grams.kabsaBoneless; }
        else { pick = AD.dishPick[d.k][a.fAnimal]; g = AD.grams.kabsa; }
        const kg = up(g * a.people / 1000);
        lines.push({ id: pick[0], kg, opts: { prep: pick[1] }, why: g + " جم للشخص" });
        if (a.fAnimal === "camel" && d.k !== "marag") notes.push("الحاشي يحتاج وقت أطول من الضأن بنص ساعة إلى ساعة.");
      }
      const kg = meatKg(lines);
      if (a.spice === "yes") lines.push(tool(d.spice, Math.ceil(kg / AD.spiceKgPerPack), "كيس لكل " + AD.spiceKgPerPack + " كجم لحم"));
      if (a.trays === "yes") lines.push(tool("trays", Math.ceil(a.people / AD.trayPeoplePerSet), "طقم لكل " + AD.trayPeoplePerSet + " أشخاص"));
      title = d.n + " · " + people(a.people);
    } else if (a.occ === "carcass") {
      const c = pickCarcass(a.cAnimal, a.people);
      lines.push({ id: c.id, qty: c.qty, kgc: c.kg, opts: { size: c.size, style: a.style, vacuum: a.vacuum === "yes" }, why: "≈ " + c.kg + " كجم تكفي نحو " + Math.floor(c.kg / (AD.grams.kabsa / 1000)) + " شخص" });
      const sp = a.cSpice || [];
      if (sp.length) { const each = Math.ceil(Math.ceil(c.kg / AD.spiceKgPerPack) / sp.length); sp.forEach(id => lines.push(tool(id, each, "كيس لكل " + AD.spiceKgPerPack + " كجم"))); }
      title = "ذبيحة " + aName(a.cAnimal) + " · " + people(a.people);
    } else if (a.occ === "steak") {
      const kg = AD.grams.steak * a.people / 1000;
      const ids = a.steakCut === "mix" ? ["beef-ribeye", "beef-tenderloin"] : [a.steakCut];
      ids.forEach(id => lines.push({ id, kg: up(kg / ids.length), opts: { prep: "steaks", marinade: a.sMarinade !== "none" ? a.sMarinade : undefined }, why: "قطعة 2.5 سم ≈ " + AD.grams.steak + " جم للشخص" }));
      if (a.where === "coal") { const k = meatKg(lines); lines.push(tool("charcoal", Math.ceil(k / AD.charcoalKgPerBag), "كيس يكفي " + AD.charcoalKgPerBag + " كجم")); lines.push(tool("starters", 1, "للإشعال")); }
      title = "عشاء ستيك · " + people(a.people);
    } else if (a.occ === "weekly") {
      const days = +a.days, total = a.people * days * AD.grams.dailyDay / 1000;
      const items = a.items.map(k => AD.weekly.find(w => w.k === k)), per = total / items.length;
      const mixOrder = ["lamb", "veal", "beef", "camel"];
      items.forEach((w, i) => {
        let ak = a.wAnimal === "mix" ? mixOrder[i % 4] : a.wAnimal;
        if (!w.pick[ak]) ak = Object.keys(w.pick)[0];
        const p = D.byId(w.pick[ak]);
        lines.push({ id: p.id, kg: up(per), opts: { prep: p.preps.indexOf(w.prep) > -1 ? w.prep : p.prepDef, vacuum: a.vacuum === "yes" }, why: w.n });
      });
      notes.push("حسبتها على " + AD.grams.dailyDay + " جم للشخص في يوم الطبخ.");
      title = "طبخ الأسبوع · " + people(a.people) + " · " + days + " أيام";
    } else if (a.occ === "ask") {
      const p = D.byId(a.qCut), g = gramsFor(p);
      lines.push({ id: p.id, kg: up(g.g * a.people / 1000), opts: { prep: p.prepDef }, why: g.g + " جم للشخص (" + g.use + ")" });
      title = p.name + " · " + people(a.people);
    }
    /* تعديلات المستخدم على الأوزان من داخل الفاتورة */
    lines.forEach((l, i) => { const v = st.adj[i]; if (v != null) { if (l.kg != null) l.kg = v; else l.qty = v; } });
    return { id: "S" + Date.now().toString(36), occ: a.occ, title, people: a.people, lines, notes };
  }

  const total = lines => r2(lines.reduce((t, l) => t + S.breakdown(l).total, 0));
  const planLines = () => st.sections.reduce((t, s) => t.concat(s.lines), []);

  /* ---------------- العرض ---------------- */
  const av = () => `<span class="bb__av">${U.mark()}</span>`;
  const bot = (html, cls) => `<div class="bb bb--bot${cls ? " " + cls : ""}">${av()}<div class="bb__text">${html}</div></div>`;

  function sectionReceipt(s, live) {
    const t = total(s.lines);
    return U.receipt({
      cls: "receipt--chat",
      kicker: "خطة المستشار",
      title: esc(s.title),
      lines: s.lines.map((l, i) => {
        const x = U.lineForReceipt(l); if (!x) return null;
        x.sub = [l.why ? esc(l.why) : "", x.sub].filter(Boolean).join(" · ");
        if (live) {
          const p = D.byId(l.id), val = p.sold === "kg" ? U.kgTxt(l.kg) : l.qty + " " + (p.sold === "carcass" ? "ذبيحة" : p.unitName || "حبة");
          x.tools = `<div class="rc__adj"><button type="button" data-adj="${i}" data-d="-1" aria-label="أنقص">${icon("minus", "", 2.4)}</button><span class="num">${val}</span><button type="button" data-adj="${i}" data-d="1" aria-label="زد">${icon("plus", "", 2.4)}</button></div>`;
        }
        return x;
      }).filter(Boolean),
      totals: [["مجموع الخطة", U.money2(t), "is-total"], ["للشخص تقريباً", U.money2(t / (s.people || 1))]]
    });
  }

  function logHTML() {
    const out = [];
    /* الأقسام السابقة في الخطة */
    st.sections.forEach((s, i) => {
      out.push(`<details class="bb-sec"><summary>${icon("check", "", 2.4)}<b>${esc(s.title)}</b><span class="num">${U.money2(total(s.lines))} ر.س</span>${icon("chevD")}</summary>${sectionReceipt(s)}<button type="button" class="link" data-drop-sec="${i}">احذفها من الخطة</button></details>`);
    });
    const f = flow(), cur = current();
    for (const k of f) {
      if (isSkip(k)) continue;
      const n = NODES[k], v = st.a[k];
      /* نص السؤال من لوحة التحكم إن وُجد */
      const q = !n.html && AD.q && AD.q[k] && !(k === "occ" && st.sections.length) ? AD.q[k] : n.ask(st.a);
      if (v == null) {
        if (k === cur) out.push(bot(n.type === "occ" ? esc(q) + occGrid() : n.html ? q : esc(q), "is-q"));
        break;
      }
      out.push(bot(n.html ? q : esc(q) + (n.type === "occ" ? "" : "")));
      out.push(`<button class="bb bb--me" type="button" data-edit="${k}" aria-label="عدّل: ${esc(label(k, v))}"><span>${esc(label(k, v))}</span>${icon("edit")}</button>`);
    }
    if (st.note) out.push(bot(esc(st.note), "is-note"));
    if (!cur && st.a.occ) {
      const s = compute();
      if (s.notes.length) out.push(bot(s.notes.map(esc).join("<br>")));
      out.push(bot(`<p>هذي خطتك — عدّل أي وزن بـ − و + قبل ما تطلب:</p>${sectionReceipt(s, true)}`, "is-result"));
      if (st.sections.length) {
        const all = st.sections.concat([s]), t = all.reduce((x, y) => x + total(y.lines), 0);
        out.push(bot(`الخطة كاملة: <b>${all.length} مناسبات</b> بقيمة <b class="num">${U.money2(t)} ر.س</b>.`));
      }
      if (st.added) out.push(bot(`تمام! أضفت الخطة للسلة ${icon("check", "", 2.4)} تقدر تكمل الطلب أو تخطط لمناسبة ثانية.`, "is-done"));
    }
    return out.join("");
  }
  function occGrid() {
    return `<div class="occ-grid">${opts("occ").map(o => `<button type="button" class="occ" data-occ="${o.k}">${o.img ? U.slot(o.img, "occ__img") : `<span class="occ__ic">${icon(o.ic, "", 1.6)}</span>`}<span class="occ__b"><b>${o.n}</b><small>${o.d}</small></span></button>`).join("")}</div>`;
  }

  function chipHTML(o, on, multi) {
    const price = o.p ? `<em class="num">${o.abs ? "" : "+"}${U.money(o.p)}${o.per || ""}</em>` : o.p === 0 ? `<em>مجاناً</em>` : "";
    return `<button type="button" class="qr${on ? " on" : ""}${o.act ? " qr--act" : ""}" data-v="${esc(o.k)}"${multi ? ` aria-pressed="${on}"` : ""}><b>${esc(o.n)}</b>${o.d ? `<small>${esc(o.d)}</small>` : ""}${price}</button>`;
  }
  function dockHTML() {
    const cur = current();
    if (!cur) {
      if (!st.a.occ) return "";
      if (st.added) return `<div class="qrs"><a class="qr qr--main" href="cart.html"><b>اذهب للسلة</b></a><button type="button" class="qr" data-act="more"><b>أضف مناسبة ثانية</b></button><button type="button" class="qr" data-act="reset"><b>خطة جديدة</b></button></div>`;
      return `<div class="qrs"><button type="button" class="qr qr--main" data-act="cart">${icon("cart", "", 2)}<b>أضف الخطة للسلة</b></button>
        <button type="button" class="qr" data-act="people"><b>عدّل عدد الأشخاص</b></button>
        <button type="button" class="qr" data-act="more"><b>أضف طبق أو مناسبة ثانية</b></button>
        <button type="button" class="qr" data-act="save">${icon("save", "", 2)}<b>احفظ الخطة</b></button>
        <button type="button" class="qr" data-act="reset"><b>ابدأ من جديد</b></button></div>`;
    }
    const n = NODES[cur];
    if (n.type === "occ") return "";
    if (n.type === "people") {
      const v = st.pre.people || st.hints.people || 6;
      return `<div class="pp" data-pp-box><button type="button" data-pp="-1" aria-label="أقل">${icon("minus", "", 2.4)}</button><output class="num" data-pp-v>${v}</output><button type="button" data-pp="1" aria-label="أكثر">${icon("plus", "", 2.4)}</button>
        <button type="button" class="qr qr--main" data-pp-go><b>تم</b></button></div>
        <div class="qrs qrs--nums">${[2, 4, 6, 8, 10, 15, 20, 30, 50].map(x => `<button type="button" class="qr" data-pp-set="${x}"><b class="num">${x}</b></button>`).join("")}</div>`;
    }
    const list = opts(cur);
    if (n.type === "multi") {
      const pre = st.pre[cur] || (n.def ? n.def(st.a) : []);
      return `<div class="qrs" data-multi="${cur}">${list.map(o => chipHTML(o, pre.indexOf(o.k) > -1, true)).join("")}</div>
        <button type="button" class="qr qr--main qr--go" data-multi-go="${cur}"><b>تم</b>${n.max ? `<small>حتى ${n.max}</small>` : ""}</button>`;
    }
    return `<div class="qrs">${list.map(o => o.href ? `<a class="qr qr--act" href="${o.href}"><b>${esc(o.n)}</b></a>` : chipHTML(o, st.pre[cur] === o.k)).join("")}</div>`;
  }

  /* ---------------- النسخ (مضمّن في الصفحة / ورقة / صفحة كاملة) ---------------- */
  const views = [];
  function shell(o) {
    return `<div class="adv${o.cls ? " " + o.cls : ""}">
  <div class="adv__head">${av()}<div class="adv__who"><b>مستشار نُضْج</b><small><i class="live"></i>يحسب لك بالجرام</small></div>
    <div class="adv__steps" aria-hidden="true"></div>
    <button type="button" class="adv__btn" data-act="reset" aria-label="ابدأ من جديد" title="ابدأ من جديد">${icon("refresh")}</button>${o.close ? `<button type="button" class="adv__btn" data-close aria-label="إغلاق">${icon("x", "", 2.2)}</button>` : ""}</div>
  <div class="adv__log" role="log" aria-live="polite"></div>
  <div class="adv__dock"><div class="adv__qr"></div>
    <form class="adv__input" autocomplete="off"><input type="text" name="q" placeholder="اكتب… مثلاً: مشاوي لـ 10 أشخاص" aria-label="اكتب للمستشار" enterkeyhint="send"><button type="submit" aria-label="إرسال">${icon("send", "", 2)}</button></form></div>
</div>`;
  }
  function mount(el, o) {
    o = o || {};
    el.innerHTML = shell(o);
    const v = { el, root: $(".adv", el), log: $(".adv__log", el), qr: $(".adv__qr", el), steps: $(".adv__steps", el), o, seq: -1 };
    views.push(v);
    bind(v);
    paint(v, true);
    return v;
  }
  function paint(v, first) {
    if (!v.root.isConnected) return;
    const prevCount = first ? 1e9 : v.log.children.length;
    v.log.innerHTML = logHTML();
    v.qr.innerHTML = dockHTML();
    /* الفقاعات الجديدة فقط تتحرّك (مع مؤشر الكتابة للمستشار) */
    Array.prototype.forEach.call(v.log.children, (b, i) => { if (i >= prevCount && !first) b.classList.add("is-new"); });
    const f = flow().filter(k => !isSkip(k)), done = f.filter(k => st.a[k] != null).length;
    v.steps.innerHTML = st.a.occ ? f.map((k, i) => `<i class="${i < done ? "on" : ""}"></i>`).join("") : "";
    if (!first || v.o.scroll) requestAnimationFrame(() => { const last = v.log.lastElementChild; if (last) scrollLog(v, last); });
  }
  function scrollLog(v, el) {
    const L = v.log;
    if (L.scrollHeight > L.clientHeight + 4) L.scrollTo({ top: Math.max(0, el.offsetTop - 12 - (el.offsetHeight > L.clientHeight * .8 ? 0 : L.clientHeight - el.offsetHeight - 24)), behavior: "smooth" });
  }
  function repaint() { views.forEach(v => paint(v)); }
  S.on("advisor", repaint);

  /* ---------------- التفاعل ---------------- */
  function answer(k, v) {
    st.a[k] = v; delete st.pre[k]; st.note = ""; st.added = 0; st.adj = {};
    autoFill();
    save("new");
  }
  /* ما كتبه المستخدم مسبقاً (العدد أو الماشية) يُعبّأ تلقائياً حين يأتي سؤاله */
  function autoFill() {
    for (let i = 0; i < 6; i++) {
      const cur = current(); if (!cur) return;
      if (cur === "people" && st.hints.people) { st.a.people = st.hints.people; delete st.hints.people; continue; }
      if (/Animal$/.test(cur) && st.hints.animal && opts(cur).some(o => o.k === st.hints.animal)) { st.a[cur] = st.hints.animal; delete st.hints.animal; continue; }
      if (cur === "dish" && st.hints.dish) { st.a.dish = st.hints.dish; delete st.hints.dish; continue; }
      return;
    }
  }
  function edit(k) {
    const f = flow(), i = f.indexOf(k);
    st.pre[k] = st.a[k];
    /* تعديل العدد لا يمسح بقية الإجابات — الكميات تُعاد حسابها فقط */
    if (k === "people") delete st.a.people;
    else f.slice(i).forEach(x => { if (x !== "occ" || k === "occ") delete st.a[x]; });
    if (k === "occ") { st.a = {}; }
    st.adj = {}; st.note = ""; st.added = 0;
    save();
  }
  function reset() { st = fresh(); save("new"); }
  function addToCart() {
    const s = compute(), all = st.sections.concat([s]);
    let n = 0;
    all.forEach(sec => sec.lines.forEach(l => { const o = { opts: l.opts, src: "advisor" }; if (l.kg != null) o.kg = l.kg; else o.qty = l.qty; if (S.cart.add(l.id, o)) n++; }));
    st.added = n; save("new");
    const A = window.NUDJ_APP; if (A) { A.bump(); A.toast("أُضيفت الخطة للسلة (" + n + " أسطر)", { icon: "cart", action: { label: "السلة", href: "cart.html" } }); }
  }
  function savePlan() {
    const s = compute(), all = st.sections.concat([s]);
    S.plans.save({ id: "P" + Date.now().toString(36), title: all.map(x => x.title).join(" + "), sections: all, total: all.reduce((t, x) => t + total(x.lines), 0) });
    const A = window.NUDJ_APP; if (A) A.toast("حُفظت الخطة في حسابك", { icon: "save", action: { label: "خططي", href: "account.html?s=plans" } });
  }

  function bind(v) {
    v.root.addEventListener("click", e => {
      const t = e.target;
      const occ = t.closest("[data-occ]"); if (occ) { answer("occ", occ.dataset.occ); return; }
      const ed = t.closest("[data-edit]"); if (ed) { edit(ed.dataset.edit); return; }
      const cl = t.closest("[data-close]"); if (cl) { if (v.o.onClose) v.o.onClose(); return; }
      const adj = t.closest("[data-adj]"); if (adj) {
        const s = compute(), i = +adj.dataset.adj, l = s.lines[i], d = +adj.dataset.d; if (!l) return;
        if (l.kg != null) st.adj[i] = Math.max(0.5, r2(l.kg + d * 0.5)); else st.adj[i] = Math.max(1, l.qty + d);
        save(); return;
      }
      const drop = t.closest("[data-drop-sec]"); if (drop) { st.sections.splice(+drop.dataset.dropSec, 1); save(); return; }
      const act = t.closest("[data-act]"); if (act) {
        const k = act.dataset.act;
        if (k === "reset") reset();
        else if (k === "cart") addToCart();
        else if (k === "save") savePlan();
        else if (k === "people") edit("people");
        else if (k === "more") { const s = compute(); if (!st.added) st.sections.push(s); else st.sections = []; st.a = {}; st.adj = {}; st.added = 0; st.note = ""; save("new"); }
        return;
      }
      /* الأشخاص */
      const box = $("[data-pp-v]", v.root);
      const pp = t.closest("[data-pp]"); if (pp && box) { box.textContent = Math.max(1, Math.min(200, (+box.textContent || 1) + +pp.dataset.pp)); return; }
      const ps = t.closest("[data-pp-set]"); if (ps) { answer("people", +ps.dataset.ppSet); return; }
      if (t.closest("[data-pp-go]") && box) { answer("people", +box.textContent || 1); return; }
      /* اختيار متعدد */
      const mg = t.closest("[data-multi-go]"); if (mg) {
        const k = mg.dataset.multiGo, n = NODES[k];
        const sel = $$(`[data-multi="${k}"] .qr.on`, v.root).map(b => b.dataset.v);
        if (sel.length < (n.min == null ? 1 : n.min)) { hint(v, "اختر خياراً واحداً على الأقل"); return; }
        answer(k, sel); return;
      }
      const q = t.closest(".qr[data-v]"); if (q) {
        const m = q.closest("[data-multi]");
        if (m) {
          const n = NODES[m.dataset.multi], on = !q.classList.contains("on");
          if (on && n.max && $$(".qr.on", m).length >= n.max) { hint(v, "حدّك " + n.max + " — شيل واحد أول"); return; }
          q.classList.toggle("on", on); q.setAttribute("aria-pressed", on); return;
        }
        const cur = current(); if (!cur) return;
        const o = opts(cur).find(x => x.k === q.dataset.v);
        if (o && o.act) { action(cur, o.k); return; }
        answer(cur, q.dataset.v);
      }
    });
    $(".adv__input", v.root).addEventListener("submit", e => {
      e.preventDefault();
      const inp = e.target.q, txt = inp.value.trim(); if (!txt) return;
      inp.value = ""; understand(txt);
    });
  }
  function action(node, k) {
    if (node === "qNext" && k === "another") { st.pre.qAnimal = st.a.qAnimal; delete st.a.qAnimal; delete st.a.qCut; save("new"); }
    if (node === "qNext" && k === "add") {
      const p = D.byId(st.a.qCut); S.cart.add(p.id, { kg: 1, opts: { prep: p.prepDef }, src: "advisor" });
      const A = window.NUDJ_APP; if (A) { A.bump(); A.toast("أُضيف 1 كجم " + p.name, { icon: "cart", action: { label: "السلة", href: "cart.html" } }); }
    }
  }
  function hint(v, msg) { const A = window.NUDJ_APP; if (A) A.toast(msg, { icon: "info" }); }

  /* ---------------- فهم النص المكتوب ---------------- */
  const norm = s => String(s || "").replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/[ً-ٰٟـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase();
  const KW = {
    occ: [["steak", /ستيك|ريب ?اي|تندرلوين|انتركوت|ستربلوين/], ["grill", /مشاوي|شوي|شواء|شوايه|باربكيو|bbq|اوصال|تكه|كباب/], ["carcass", /ذبيحه|خروف|تيس|نفر|ذبح/], ["weekly", /اسبوع|شهر|مقاضي|يومي|للبيت/], ["feast", /عزيمه|عزومه|وليمه|كبسه|مندي|مرق|ضيوف|مظبي|غدا|اكله/], ["ask", /الفرق|وش احسن|ايش احسن|قطعه|سؤال|تنفع/]],
    animal: [["lamb", /ضان|غنم|خروف|نعيمي|حري/], ["goat", /ماعز|تيس|عنز/], ["camel", /حاشي|جمل|ابل|قعود/], ["veal", /عجل/], ["beef", /بقر/], ["buffalo", /جاموس/]],
    dish: [["kabsa", /كبسه/], ["mandi", /مندي/], ["marag", /مرق|ايدام/], ["oven", /فرن/]]
  };
  const find = (list, t) => { const x = list.find(r => r[1].test(t)); return x ? x[0] : null; };
  function understand(txt) {
    const t = norm(txt);
    const num = (t.match(/\d{1,3}/) || [])[0], n = num ? +num : /شخصين|اثنين/.test(t) ? 2 : null;
    const occ = find(KW.occ, t), ani = find(KW.animal, t), dsh = find(KW.dish, t);
    const cur = current();
    st.note = "";
    if (!st.a.occ || (cur === "occ")) {
      if (occ || dsh) {
        if (n) st.hints.people = n; if (ani) st.hints.animal = ani; if (dsh) st.hints.dish = dsh;
        return answer("occ", occ || "feast");
      }
    } else if (cur) {
      const node = NODES[cur];
      if (node.type === "people" && n) return answer("people", Math.min(200, n));
      if (n) st.hints.people = n; if (ani) st.hints.animal = ani; if (dsh) st.hints.dish = dsh;
      if (node.type === "chips") {
        const o = opts(cur).find(x => (ani && x.k === ani) || (dsh && x.k === dsh) || norm(txt).indexOf(norm(x.n)) > -1 || norm(x.n).indexOf(t) > -1);
        if (o && !o.act) return answer(cur, o.k);
      }
      if (node.type === "multi") {
        const hits = opts(cur).filter(x => t.indexOf(norm(x.n).split(" ")[0]) > -1).map(x => x.k);
        if (hits.length) return answer(cur, hits.slice(0, node.max || 9));
      }
      autoFill();
      if (current() !== cur) return save("new");
    } else if (n && st.a.people) { st.a.people = n; st.adj = {}; return save("new"); }
    st.note = "ما فهمت عليك تماماً — اختر من الخيارات تحت، أو اكتب مثل: «كبسة حاشي لـ 12 شخص».";
    save("new");
  }

  /* ---------------- واجهات للاستخدام من الصفحات ---------------- */
  /* يبدأ مناسبة محددة (من بطاقات الرئيسية مثلاً) */
  function start(occ, hints) {
    if (st.a.occ && current() !== "occ") { if (!st.added && current() == null) st.sections.push(compute()); }
    st.a = {}; st.adj = {}; st.added = 0; st.note = ""; st.hints = hints || {};
    if (occ) answer("occ", occ); else save("new");
  }
  /* سؤال عن قطعة محددة (من صفحة المنتج) */
  function askAbout(id) {
    const p = D.byId(id); if (!p || p.sold !== "kg") return start();
    st.a = { occ: "ask", qAnimal: p.animal, qCut: p.id }; st.adj = {}; st.added = 0; st.note = ""; save("new");
  }
  /* الكمية المقترحة لقطعة وعدد أشخاص (لميزان صفحة المنتج) */
  function suggestKg(p, n) { const g = gramsFor(p); return { kg: up(g.g * n / 1000), g: g.g, use: g.use }; }
  /* تنبيهات السلة: ما ينقص الطلب؟ */
  function cartTips(lines) {
    const tips = [], ids = lines.map(l => l.id);
    const grillKg = r2(lines.filter(l => { const p = D.byId(l.id); return p.sold === "kg" && ["cubes", "kebab", "slices", "chops", "rack"].indexOf(l.opts.prep) > -1 || (l.opts.prep === "steaks" && p.uses.indexOf("grill") > -1); }).reduce((t, l) => t + (l.kg || 0), 0));
    if (grillKg && ids.indexOf("charcoal") < 0) tips.push({ t: "عندك " + U.kgTxt(grillKg) + " للشوي — تحتاج فحم؟", id: "charcoal", qty: Math.ceil(grillKg / AD.charcoalKgPerBag) });
    const skewKg = r2(lines.filter(l => ["cubes", "kebab", "slices"].indexOf(l.opts.prep) > -1 && !l.opts.skewer).reduce((t, l) => t + (l.kg || 0), 0));
    if (skewKg && ids.indexOf("skewers") < 0) tips.push({ t: U.kgTxt(skewKg) + " أوصال وكباب بدون تسييخ — عندك أسياخ؟", id: "skewers", qty: Math.ceil(skewKg / AD.skewerKgPerSet) });
    const kabsaKg = r2(lines.filter(l => ["kabsa", "mandi"].indexOf(l.opts.prep) > -1 || D.byId(l.id).sold === "carcass").reduce((t, l) => { const p = D.byId(l.id); return t + (p.sold === "carcass" ? S.sizeOf(p, l.opts.size).kg * (l.qty || 1) : l.kg); }, 0));
    if (kabsaKg && ids.indexOf("spice-kabsa") < 0 && ids.indexOf("spice-mandi") < 0) tips.push({ t: "لحم كبسة ومندي " + U.kgTxt(kabsaKg) + " — نضيف البهارات؟", id: lines.some(l => l.opts.prep === "mandi" || l.opts.style === "mandi") ? "spice-mandi" : "spice-kabsa", qty: Math.ceil(kabsaKg / AD.spiceKgPerPack) });
    const plain = lines.filter(l => ["cubes", "kebab", "slices", "chops"].indexOf(l.opts.prep) > -1 && !l.opts.marinade);
    if (plain.length) tips.push({ t: "تبغى نتبّل " + D.byId(plain[0].id).name + "؟ تتبيلة المشاوي الحارة +" + D.marinade("hot").p + " ر.س/كجم", key: plain[0].key, marinade: "hot" });
    return tips.slice(0, 3);
  }

  return { mount, start, askAbout, suggestKg, cartTips, state: () => st, current, reset };
})();
