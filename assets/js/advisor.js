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
  const L = D.L || (ar => ar), EN = D.lang === "en";
  const CUR = C.currency, KG = L("كجم", "kg"), G = L("جم", "g");
  const lc = t => EN ? String(t || "").toLowerCase() : t;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = U.esc, icon = U.icon;
  const KEY = "nudj_adv";
  const up = kg => Math.max(0.5, Math.ceil(kg * 2 - 1e-9) / 2);
  const r2 = n => Math.round(n * 100) / 100;

  /* ---------------- الحالة ---------------- */
  const fresh = () => ({ v: 3, a: {}, sections: [], hints: {}, pre: {}, adj: {}, added: 0, note: "", said: "", seq: 0 });
  let st = load();
  function load() { try { const s = JSON.parse(sessionStorage.getItem(KEY)); if (s && s.v === 3) return s; } catch (e) { } return fresh(); }
  function save(anim) { st.seq++; st.anim = anim || null; try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } S.emit("advisor"); }

  /* ---------------- صياغة ---------------- */
  const people = n => EN ? (n === 1 ? "1 person" : n + " people") : n === 1 ? "شخص واحد" : n === 2 ? "شخصين" : n <= 10 ? n + " أشخاص" : n + " شخص";
  const dish = a => AD.dishes.find(d => d.k === a.dish) || AD.dishes[0];
  const aName = k => (D.animal(k) || {}).n || "";
  const animalsOpt = keys => keys.map(k => ({ k, n: aName(k) }));
  const priceOf = id => D.byId(id).price;

  /* ---------------- الأسئلة ---------------- */
  const hasSkew = a => (a.forms || []).some(k => { const f = AD.grillForms.find(x => x.k === k); return f && f.skew; });
  function toolsOpts(a) {
    const kg = r2(a.people * AD.grams.grill / 1000);
    const o = [
      { k: "charcoal", n: L("فحم طبيعي", "Natural charcoal"), d: Math.ceil(kg / AD.charcoalKgPerBag) + L(" كيس × ", " bag × ") + priceOf("charcoal") + " " + CUR },
      { k: "starters", n: L("مكعبات إشعال", "Fire starters"), d: L("علبة × ", "Box × ") + priceOf("starters") + " " + CUR },
      { k: "trays", n: L("صواني ألمنيوم", "Aluminium trays"), d: Math.ceil(a.people / AD.trayPeoplePerSet) + L(" طقم × ", " set × ") + priceOf("trays") + " " + CUR }
    ];
    if (hasSkew(a) && a.skewer !== "yes") o.push({ k: "skewers", n: L("أسياخ ستيل", "Steel skewers"), d: L("طقم 10 × ", "Set of 10 × ") + priceOf("skewers") + " " + CUR });
    return o;
  }
  const yes = (n, p, per) => ({ k: "yes", n, p, per });
  const NODES = {
    occ: { type: "occ", ask: () => st.sections.length ? L("حلو! وش المناسبة أو الطبق الثاني؟", "Nice! What's the next occasion or dish?") : L("هلا! أنا مستشار نُضْج. قل لي وش المناسبة، وأحسب لك كل شي بالجرام — اللحم والتتبيلة والفحم — وتطلبه بضغطة.", "Hi! I'm the NUDJ advisor. Tell me the occasion and I'll work out everything to the gram — the meat, the marinade, the charcoal — and you order it in one tap."),
      opts: () => AD.occasions.filter(o => o.on !== false).map(o => ({ k: o.k, n: o.n, d: o.s, img: o.img, ic: o.ic })) },
    people: { type: "people", ask: a => (EN ? { grill: "How many people at the grill?", feast: "How many guests?", carcass: "How many people should the carcass feed?", steak: "How many for dinner?", weekly: "How many people at home?", ask: "How many people are you cooking for?" }
      : { grill: "كم شخص على الشواية؟", feast: "كم شخص معزوم؟", carcass: "كم شخص بتكفيهم الذبيحة؟", steak: "كم شخص على العشاء؟", weekly: "كم شخص في البيت؟", ask: "لكم شخص تبغى تطبخها؟" })[a.occ] },
    forms: { type: "multi", max: 3, ask: () => L("وش تبغى على الشواية؟ قطع، شرائح، ولا قطع سليمة؟ تقدر تختار لين ثلاثة.", "What do you want on the grill? Cubes, slices or whole cuts? You can pick up to three."), opts: () => AD.grillForms.map(f => ({ k: f.k, n: f.n, d: f.d })) },
    gAnimal: { type: "chips", ask: () => L("أي لحم تفضّل؟", "Which meat do you prefer?"),
      opts: a => { const ks = D.ANIMALS.map(x => x.k).filter(k => (a.forms || []).some(f => AD.grillForms.find(g => g.k === f).pick[k])); return [{ k: "mix", n: L("نوّع لي", "Mix it up"), d: L("الأنسب لكل نوع", "The best for each style") }].concat(animalsOpt(ks)); } },
    marinade: { type: "chips", ask: () => L("تبغى نتبّلها لك؟ التتبيل خدمة إضافية تنحسب بالكيلو.", "Shall we marinate it for you? Marinating is an extra, charged per kilo."), opts: () => D.MARINADES.map(m => ({ k: m.k, n: m.n, d: m.d, p: m.p, per: "/" + KG })) },
    skewer: { type: "chips", skip: a => !hasSkew(a), ask: () => L("نسيّخها لك جاهزة على أسياخ؟", "Shall we put it on skewers for you, ready to grill?"),
      opts: () => [yes(L("إيه سيّخوها", "Yes, skewer it"), D.SERVICES.skewer.p, "/" + KG), { k: "no", n: L("لا، أسيّخها بنفسي", "No, I'll do it myself") }] },
    tools: { type: "multi", min: 0, ask: () => L("وعدّة الشواء؟ حسبت لك الكميات على عددكم.", "And the BBQ kit? I've worked out the quantities for your group."), opts: toolsOpts, def: () => ["charcoal"] },
    dish: { type: "chips", ask: () => L("وش الطبخة؟", "What are you cooking?"), opts: () => AD.dishes.map(d => ({ k: d.k, n: d.n })) },
    fAnimal: { type: "chips", ask: a => L("أي لحم للـ" + dish(a).n + "؟", "Which meat for the " + lc(dish(a).n) + "?"), opts: a => animalsOpt(dish(a).animals) },
    mode: { type: "chips", skip: a => !(a.people >= 12 && ["lamb", "goat"].indexOf(a.fAnimal) > -1 && ["kabsa", "mandi"].indexOf(a.dish) > -1),
      ask: a => L("لـ " + people(a.people) + "، الذبيحة غالباً أوفر من القطعيات وتجيك مقطّعة على الطبخة. وش تفضّل؟", "For " + people(a.people) + ", a whole carcass usually works out cheaper than separate cuts, and it arrives cut for your dish. Which do you prefer?"),
      opts: () => [{ k: "carcass", n: L("ذبيحة مقطّعة", "A cut carcass"), d: L("التقطيع مجاني", "Free cutting") }, { k: "cuts", n: L("قطعيات فقط", "Cuts only"), d: L("كتف أو فخذ", "Shoulder or leg") }] },
    bone: { type: "chips", skip: a => a.mode === "carcass" || ["kabsa", "mandi"].indexOf(a.dish) < 0, ask: () => L("تبغاها قطع بالعظم ولا بدون عظم؟", "Bone-in pieces or boneless?"),
      opts: () => [{ k: "bone", n: L("قطع بالعظم", "Bone-in"), d: AD.grams.kabsa + " " + G + L(" للشخص", " per person") }, { k: "boneless", n: L("بدون عظم", "Boneless"), d: AD.grams.kabsaBoneless + " " + G + L(" للشخص", " per person") }] },
    spice: { type: "chips", skip: a => !dish(a).spice, ask: a => L("أضيف لك بهارات " + dish(a).n + "؟", "Shall I add " + lc(dish(a).n) + " spice?"), opts: a => [yes(L("إيه أضف", "Yes, add it"), priceOf(dish(a).spice || "spice-kabsa"), L("/كيس", "/bag")), { k: "no", n: L("عندي بهارات", "I have spices") }] },
    trays: { type: "chips", ask: () => L("تحتاج صواني ألمنيوم للتقديم؟", "Do you need aluminium trays for serving?"), opts: a => [yes(L("إيه", "Yes"), priceOf("trays"), L("/طقم", "/set")), { k: "no", n: L("لا", "No") }] },
    cAnimal: { type: "chips", ask: () => L("ذبيحة إيش؟", "Which carcass?"), opts: () => ["lamb", "goat"].map(k => ({ k, n: aName(k), d: L("من ", "from ") + U.money(D.byId(k + "-half").sizes[0].p) + " " + CUR + L(" للنصف", " for a half") })) },
    style: { type: "chips", ask: () => L("كيف نقطّعها لك؟ التقطيع مجاني.", "How shall we cut it? Cutting is free."), opts: () => D.STYLES.map(s => ({ k: s.k, n: s.n, d: s.d })) },
    vacuum: { type: "chips", ask: a => a.occ === "carcass" ? L("نغلّفها مفرّغة من الهواء؟ تدوم أطول في الفريزر.", "Shall we vacuum-pack it? It keeps longer in the freezer.") : L("نغلّف كل وجبة في كيس مفرّغ؟", "Shall we vacuum-pack each meal?"),
      opts: a => [yes(L("إيه غلّفوها", "Yes, vacuum-pack it"), a.occ === "carcass" ? D.SERVICES.vacuum.carcass : D.SERVICES.vacuum.p, a.occ === "carcass" ? "" : "/" + KG), { k: "no", n: L("أكياس عادية", "Regular bags"), p: 0 }] },
    cSpice: { type: "multi", min: 0, ask: () => L("تبغى بهارات معها؟", "Want spices with it?"), opts: () => ["spice-kabsa", "spice-mandi", "spice-grill"].map(id => ({ k: id, n: D.byId(id).name.replace(/ 100 (جم|g)$/, ""), p: priceOf(id), per: L("/كيس", "/bag") })) },
    steakCut: { type: "chips", ask: () => L("أي ستيك؟", "Which steak?"), opts: () => AD.steaks.map(id => { const p = D.byId(id); return { k: id, n: p.name, d: p.short, p: p.price, per: "/" + KG, abs: true }; }).concat([{ k: "mix", n: L("نوّع لي", "Mix it up"), d: L("ريب آي + تندرلوين", "Ribeye + tenderloin") }]) },
    where: { type: "chips", ask: () => L("على الفحم ولا بالمقلاة؟", "Over charcoal or in a pan?"), opts: () => [{ k: "coal", n: L("على الفحم", "Over charcoal"), d: L("أضيف لك الفحم", "I'll add charcoal") }, { k: "pan", n: L("مقلاة أو فرن", "Pan or oven") }] },
    sMarinade: { type: "chips", ask: () => L("الستيك الطيب يكفيه ملح خشن. تبغى تتبيلة؟", "A good steak only needs coarse salt. Want a marinade?"), opts: () => [{ k: "none", n: L("ملح خشن فقط", "Coarse salt only"), p: 0 }, { k: "herb", n: D.marinade("herb").n, p: D.marinade("herb").p, per: "/" + KG }] },
    days: { type: "chips", ask: () => L("كم يوم تطبخون لحم في الأسبوع؟", "How many days a week do you cook meat?"), opts: () => [{ k: "3", n: L("3 أيام", "3 days") }, { k: "5", n: L("5 أيام", "5 days") }, { k: "7", n: L("كل يوم", "Every day") }] },
    items: { type: "multi", ask: () => L("وش تطبخون عادة؟ اختر كل اللي يناسبكم.", "What do you usually cook? Pick everything that applies."), opts: () => AD.weekly.map(w => ({ k: w.k, n: w.n })) },
    wAnimal: { type: "chips", ask: () => L("أي لحم في البيت؟", "Which meat at home?"), opts: () => [{ k: "mix", n: L("نوّع لي", "Mix it up") }].concat(animalsOpt(["lamb", "veal", "beef", "camel"])) },
    qAnimal: { type: "chips", ask: () => L("عن أي ماشية؟", "Which animal?"), opts: () => animalsOpt(D.ANIMALS.map(x => x.k)) },
    qCut: { type: "chips", ask: a => L("أي قطعة " + aName(a.qAnimal) + "؟", "Which " + lc(aName(a.qAnimal)) + " cut?"), opts: a => D.cutsOf(a.qAnimal).filter(p => p.sold === "kg").map(p => ({ k: p.id, n: p.name, p: p.price, per: "/" + KG, abs: true })) },
    qNext: { type: "chips", ask: a => aboutCut(a.qCut), html: true,
      opts: a => [{ k: "plan", n: L("احسب لي كمية لعزومة", "Work out a quantity for a gathering") }, { k: "another", n: L("اسأل عن قطعة ثانية", "Ask about another cut"), act: true }, { k: "add", n: L("أضف 1 كجم للسلة", "Add 1 kg to cart"), act: true }, { k: "open", n: L("افتح صفحة القطعة", "Open the cut's page"), act: true, href: U.url.product(a.qCut) }] }
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
    if (n.type === "multi") { if (!v.length) return L("بدون", "None"); const o = opts(k); return v.map(x => (o.find(y => y.k === x) || { n: x }).n).join(L("، ", ", ")); }
    const o = opts(k).find(x => x.k === v); return o ? o.n : v;
  }

  function aboutCut(id) {
    const p = D.byId(id), a = D.animal(p.animal);
    const g = gramsFor(p);
    return `<div class="adv-cut">${U.productImg(p, "adv-cut__img")}<div><span class="tag__code num">${p.code}</span><b>${esc(p.name)}</b><p>${esc(p.info)}</p>
      <dl><div><dt>${L("تنفع لـ", "Good for")}</dt><dd>${p.uses.map(u => D.USES[u].n).join(L("، ", ", "))}</dd></div><div><dt>${L("التقطيع", "Cutting")}</dt><dd>${p.preps.map(k => D.PREPS[k].n).join(L("، ", ", "))}</dd></div>
      <div><dt>${L("الكمية", "Quantity")}</dt><dd>${g.g} ${G}${L(" للشخص", " per person")} (${g.use})</dd></div><div><dt>${L("السعر", "Price")}</dt><dd class="num">${U.money(p.price)} ${CUR}/${KG}</dd></div></dl>${U.spec(p.spec)}</div></div>
      <p>${L("وش تبغى نسوي بعدها؟", "What would you like to do next?")}</p>`;
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
  const perBag = kg => L("كيس لكل " + kg + " كجم لحم", "1 bag per " + kg + " kg of meat");
  const feeds = kg => L("≈ " + kg + " كجم تكفي نحو " + Math.floor(kg / (AD.grams.kabsa / 1000)) + " شخص", "≈ " + kg + " kg, feeds about " + Math.floor(kg / (AD.grams.kabsa / 1000)) + " people");
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
          if (ak !== "mix") notes.push(L(f.n + " من " + aName(ak) + " ما تتوفر عندنا — اخترت لك " + aName(pk) + ".", f.n + " isn't available in " + lc(aName(ak)) + " — I picked " + lc(aName(pk)) + " instead."));
          ak = pk;
        }
        used.push(ak);
        const pk = f.pick[ak], id = Array.isArray(pk) ? pk[0] : pk, prep = Array.isArray(pk) ? pk[1] : f.prep, p = D.byId(id);
        const bi = p.bone && ["chops", "rack", "kabsa", "mandi", "osso", "whole", "stew"].indexOf(prep) > -1;
        const kg = up(per * (bi ? 1.3 : 1));
        const o = { prep };
        if (a.marinade !== "none" && prep !== "steaks") o.marinade = a.marinade;
        if (a.skewer === "yes" && D.PREPS[prep].skew) o.skewer = true;
        lines.push({ id, kg, opts: o, why: f.n + " · " + Math.round(kg * 1000 / a.people) + " " + G + L(" للشخص", " per person") + (bi ? L(" بالعظم", " bone-in") : "") });
      });
      if (a.marinade !== "none" && lines.some(l => l.opts.prep === "steaks")) notes.push(L("الستيك تركته بدون تتبيلة — يكفيه ملح خشن على الجمر.", "I left the steak unmarinated — coarse salt over the coals is all it needs."));
      const kg = meatKg(lines), skewKg = r2(lines.filter(l => D.PREPS[l.opts.prep].skew).reduce((t, l) => t + l.kg, 0));
      (a.tools || []).forEach(t => {
        if (t === "charcoal") lines.push(tool("charcoal", Math.ceil(kg / AD.charcoalKgPerBag), perBag(AD.charcoalKgPerBag)));
        if (t === "starters") lines.push(tool("starters", 1, L("تكفي لإشعال الفحم", "Enough to light the charcoal")));
        if (t === "trays") lines.push(tool("trays", Math.ceil(a.people / AD.trayPeoplePerSet), L("طقم لكل " + AD.trayPeoplePerSet + " أشخاص", "1 set per " + AD.trayPeoplePerSet + " people")));
        if (t === "skewers") lines.push(tool("skewers", Math.ceil(skewKg / AD.skewerKgPerSet), L("طقم لكل " + AD.skewerKgPerSet + " كجم", "1 set per " + AD.skewerKgPerSet + " kg")));
      });
      title = L("حفلة مشاوي · ", "BBQ party · ") + people(a.people);
    } else if (a.occ === "feast") {
      const d = dish(a);
      if (a.mode === "carcass") {
        const c = pickCarcass(a.fAnimal, a.people);
        lines.push({ id: c.id, qty: c.qty, kgc: c.kg, opts: { size: c.size, style: d.k === "mandi" ? "mandi" : "kabsa" }, why: feeds(c.kg) });
      } else {
        let pick, g;
        if (d.k === "marag") { pick = AD.dishPick.marag[a.fAnimal]; g = AD.grams.stew; }
        else if (d.k === "oven") { pick = AD.dishPick.oven[a.fAnimal]; g = AD.grams.oven; notes.push(L("الفخذ الواحد 2–2.5 كجم تقريباً — نقسّم الوزن على أفخاذ كاملة قدر الإمكان.", "A single leg is roughly 2–2.5 kg — we'll split the weight into whole legs where we can.")); }
        else if (a.bone === "boneless") { pick = AD.boneless[d.k][a.fAnimal]; g = AD.grams.kabsaBoneless; }
        else { pick = AD.dishPick[d.k][a.fAnimal]; g = AD.grams.kabsa; }
        const kg = up(g * a.people / 1000);
        lines.push({ id: pick[0], kg, opts: { prep: pick[1] }, why: g + " " + G + L(" للشخص", " per person") });
        if (a.fAnimal === "camel" && d.k !== "marag") notes.push(L("الجمل يحتاج وقت أطول من الضأن بنص ساعة إلى ساعة.", "Camel needs 30 minutes to an hour longer than lamb."));
      }
      const kg = meatKg(lines);
      if (a.spice === "yes") lines.push(tool(d.spice, Math.ceil(kg / AD.spiceKgPerPack), perBag(AD.spiceKgPerPack)));
      if (a.trays === "yes") lines.push(tool("trays", Math.ceil(a.people / AD.trayPeoplePerSet), L("طقم لكل " + AD.trayPeoplePerSet + " أشخاص", "1 set per " + AD.trayPeoplePerSet + " people")));
      title = d.n + " · " + people(a.people);
    } else if (a.occ === "carcass") {
      const c = pickCarcass(a.cAnimal, a.people);
      lines.push({ id: c.id, qty: c.qty, kgc: c.kg, opts: { size: c.size, style: a.style, vacuum: a.vacuum === "yes" }, why: feeds(c.kg) });
      const sp = a.cSpice || [];
      if (sp.length) { const each = Math.ceil(Math.ceil(c.kg / AD.spiceKgPerPack) / sp.length); sp.forEach(id => lines.push(tool(id, each, perBag(AD.spiceKgPerPack)))); }
      title = L("ذبيحة " + aName(a.cAnimal), aName(a.cAnimal) + " carcass") + " · " + people(a.people);
    } else if (a.occ === "steak") {
      const kg = AD.grams.steak * a.people / 1000;
      const ids = a.steakCut === "mix" ? ["beef-ribeye", "beef-tenderloin"] : [a.steakCut];
      ids.forEach(id => lines.push({ id, kg: up(kg / ids.length), opts: { prep: "steaks", marinade: a.sMarinade !== "none" ? a.sMarinade : undefined }, why: L("قطعة 2.5 سم ≈ " + AD.grams.steak + " جم للشخص", "2.5 cm cut ≈ " + AD.grams.steak + " g per person") }));
      if (a.where === "coal") { const k = meatKg(lines); lines.push(tool("charcoal", Math.ceil(k / AD.charcoalKgPerBag), L("كيس يكفي " + AD.charcoalKgPerBag + " كجم", "1 bag covers " + AD.charcoalKgPerBag + " kg"))); lines.push(tool("starters", 1, L("للإشعال", "To light it"))); }
      title = L("عشاء ستيك · ", "Steak dinner · ") + people(a.people);
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
      notes.push(L("حسبتها على " + AD.grams.dailyDay + " جم للشخص في يوم الطبخ.", "Based on " + AD.grams.dailyDay + " g per person per cooking day."));
      title = L("طبخ الأسبوع · ", "Weekly cooking · ") + people(a.people) + " · " + days + L(" أيام", " days");
    } else if (a.occ === "ask") {
      const p = D.byId(a.qCut), g = gramsFor(p);
      lines.push({ id: p.id, kg: up(g.g * a.people / 1000), opts: { prep: p.prepDef }, why: g.g + " " + G + L(" للشخص", " per person") + " (" + g.use + ")" });
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
      kicker: L("خطة المستشار", "Advisor's plan"),
      title: esc(s.title),
      lines: s.lines.map((l, i) => {
        const x = U.lineForReceipt(l); if (!x) return null;
        x.sub = [l.why ? esc(l.why) : "", x.sub].filter(Boolean).join(" · ");
        if (live) {
          const p = D.byId(l.id), val = p.sold === "kg" ? U.kgTxt(l.kg) : l.qty + " " + (p.sold === "carcass" ? L("ذبيحة", "carcass") : p.unitName || L("حبة", "piece"));
          x.tools = `<div class="rc__adj"><button type="button" data-adj="${i}" data-d="-1" aria-label="${L("أنقص", "Less")}">${icon("minus", "", 2.4)}</button><span class="num">${val}</span><button type="button" data-adj="${i}" data-d="1" aria-label="${L("زد", "More")}">${icon("plus", "", 2.4)}</button></div>`;
        }
        return x;
      }).filter(Boolean),
      totals: [[L("مجموع الخطة", "Plan total"), U.money2(t), "is-total"], [L("للشخص تقريباً", "Per person, approx."), U.money2(t / (s.people || 1))]]
    });
  }

  function logHTML() {
    const out = [];
    /* ما كتبه العميل (نص حر) + رد المستشار عليه — الرد مبني بنصوص آمنة */
    const said = () => { if (st.said) out.push(`<div class="bb bb--me bb--typed"><span>${esc(st.said)}</span></div>`); if (st.note) out.push(bot(st.note, "is-note")); };
    /* الأقسام السابقة في الخطة */
    st.sections.forEach((s, i) => {
      out.push(`<details class="bb-sec"><summary>${icon("check", "", 2.4)}<b>${esc(s.title)}</b><span class="num">${U.money2(total(s.lines))} ${CUR}</span>${icon("chevD")}</summary>${sectionReceipt(s)}<button type="button" class="link" data-drop-sec="${i}">${L("احذفها من الخطة", "Remove from plan")}</button></details>`);
    });
    const f = flow(), cur = current();
    for (const k of f) {
      if (isSkip(k)) continue;
      const n = NODES[k], v = st.a[k];
      /* نص السؤال من لوحة التحكم إن وُجد (في الإنجليزية: فقط إن كُتبت له نسخة إنجليزية) */
      const custom = AD.q && AD.q[k] && (!EN || AD.q[k + "_ar"] !== undefined);
      const q = !n.html && custom && !(k === "occ" && st.sections.length) ? AD.q[k] : n.ask(st.a);
      if (v == null) {
        if (k === cur) { said(); out.push(bot(n.type === "occ" ? esc(q) + occGrid() : n.html ? q : esc(q), "is-q")); }
        break;
      }
      out.push(bot(n.html ? q : esc(q) + (n.type === "occ" ? "" : "")));
      out.push(`<button class="bb bb--me" type="button" data-edit="${k}" aria-label="${L("عدّل: ", "Edit: ")}${esc(label(k, v))}"><span>${esc(label(k, v))}</span>${icon("edit")}</button>`);
    }
    if (!cur && st.a.occ) {
      said();
      const s = compute();
      if (s.notes.length) out.push(bot(s.notes.map(esc).join("<br>")));
      out.push(bot(`<p>${L("هذي خطتك — عدّل أي وزن بـ − و + قبل ما تطلب:", "Here's your plan — adjust any weight with − and + before you order:")}</p>${sectionReceipt(s, true)}`, "is-result"));
      if (st.sections.length) {
        const all = st.sections.concat([s]), t = all.reduce((x, y) => x + total(y.lines), 0);
        out.push(bot(L(`الخطة كاملة: <b>${all.length} مناسبات</b> بقيمة <b class="num">${U.money2(t)} ${CUR}</b>.`, `The full plan: <b>${all.length} occasions</b> totalling <b class="num">${U.money2(t)} ${CUR}</b>.`)));
      }
      if (st.added) out.push(bot(L(`تمام! أضفت الخطة للسلة ${icon("check", "", 2.4)} تقدر تكمل الطلب أو تخطط لمناسبة ثانية.`, `Done! I've added the plan to your cart ${icon("check", "", 2.4)} You can check out now or plan another occasion.`), "is-done"));
    }
    return out.join("");
  }
  function occGrid() {
    return `<div class="occ-grid">${opts("occ").map(o => `<button type="button" class="occ" data-occ="${o.k}">${o.img ? U.slot(o.img, "occ__img") : `<span class="occ__ic">${icon(o.ic, "", 1.6)}</span>`}<span class="occ__b"><b>${o.n}</b><small>${o.d}</small></span></button>`).join("")}</div>`;
  }

  function chipHTML(o, on, multi) {
    const price = o.p ? `<em class="num">${o.abs ? "" : "+"}${U.money(o.p)}${o.per || ""}</em>` : o.p === 0 ? `<em>${L("مجاناً", "Free")}</em>` : "";
    return `<button type="button" class="qr${on ? " on" : ""}${o.act ? " qr--act" : ""}" data-v="${esc(o.k)}"${multi ? ` aria-pressed="${on}"` : ""}><b>${esc(o.n)}</b>${o.d ? `<small>${esc(o.d)}</small>` : ""}${price}</button>`;
  }
  function dockHTML() {
    const cur = current();
    if (!cur) {
      if (!st.a.occ) return "";
      if (st.added) return `<div class="qrs"><a class="qr qr--main" href="cart.html"><b>${L("اذهب للسلة", "Go to cart")}</b></a><button type="button" class="qr" data-act="more"><b>${L("أضف مناسبة ثانية", "Add another occasion")}</b></button><button type="button" class="qr" data-act="reset"><b>${L("خطة جديدة", "New plan")}</b></button></div>`;
      return `<div class="qrs"><button type="button" class="qr qr--main" data-act="cart">${icon("cart", "", 2)}<b>${L("أضف الخطة للسلة", "Add plan to cart")}</b></button>
        <button type="button" class="qr" data-act="people"><b>${L("عدّل عدد الأشخاص", "Change headcount")}</b></button>
        <button type="button" class="qr" data-act="more"><b>${L("أضف طبق أو مناسبة ثانية", "Add another dish or occasion")}</b></button>
        <button type="button" class="qr" data-act="save">${icon("save", "", 2)}<b>${L("احفظ الخطة", "Save plan")}</b></button>
        <button type="button" class="qr" data-act="reset"><b>${L("ابدأ من جديد", "Start over")}</b></button></div>`;
    }
    const n = NODES[cur];
    if (n.type === "occ") return "";
    if (n.type === "people") {
      const v = st.pre.people || st.hints.people || 6;
      return `<div class="pp" data-pp-box><button type="button" data-pp="-1" aria-label="${L("أقل", "Fewer")}">${icon("minus", "", 2.4)}</button><output class="num" data-pp-v>${v}</output><button type="button" data-pp="1" aria-label="${L("أكثر", "More")}">${icon("plus", "", 2.4)}</button>
        <button type="button" class="qr qr--main" data-pp-go><b>${L("تم", "Done")}</b></button></div>
        <div class="qrs qrs--nums">${[2, 4, 6, 8, 10, 15, 20, 30, 50].map(x => `<button type="button" class="qr" data-pp-set="${x}"><b class="num">${x}</b></button>`).join("")}</div>`;
    }
    const list = opts(cur);
    if (n.type === "multi") {
      const pre = st.pre[cur] || (n.def ? n.def(st.a) : []);
      return `<div class="qrs" data-multi="${cur}">${list.map(o => chipHTML(o, pre.indexOf(o.k) > -1, true)).join("")}</div>
        <button type="button" class="qr qr--main qr--go" data-multi-go="${cur}"><b>${L("تم", "Done")}</b>${n.max ? `<small>${L("حتى", "up to")} ${n.max}</small>` : ""}</button>`;
    }
    return `<div class="qrs">${list.map(o => o.href ? `<a class="qr qr--act" href="${o.href}"><b>${esc(o.n)}</b></a>` : chipHTML(o, st.pre[cur] === o.k)).join("")}</div>`;
  }

  /* ---------------- النسخ (مضمّن في الصفحة / ورقة / صفحة كاملة) ---------------- */
  const views = [];
  function shell(o) {
    return `<div class="adv${o.cls ? " " + o.cls : ""}">
  <div class="adv__head">${av()}<div class="adv__who"><b>${L("مستشار نُضْج", "NUDJ Advisor")}</b><small><i class="live"></i>${L("يحسب لك بالجرام", "Works it out to the gram")}</small></div>
    <div class="adv__steps" aria-hidden="true"></div>
    <button type="button" class="adv__btn" data-act="reset" aria-label="${L("ابدأ من جديد", "Start over")}" title="${L("ابدأ من جديد", "Start over")}">${icon("refresh")}</button>${o.close ? `<button type="button" class="adv__btn" data-close aria-label="${L("إغلاق", "Close")}">${icon("x", "", 2.2)}</button>` : ""}</div>
  <div class="adv__log" role="log" aria-live="polite"></div>
  <div class="adv__dock"><div class="adv__qr"></div>
    <form class="adv__input" autocomplete="off"><input type="text" name="q" placeholder="${L("اكتب… مثلاً: مشاوي لـ 10 أشخاص", "Type… e.g. BBQ for 10 people")}" aria-label="${L("اكتب للمستشار", "Message the advisor")}" enterkeyhint="send"><button type="submit" aria-label="${L("إرسال", "Send")}">${icon("send", "", 2)}</button></form></div>
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
  /* قياس المستشار للوحة التحكم: بدأ، اكتملت الخطة، أُضيفت للسلة */
  const TRK = (k, occ) => { try { if (window.NUDJ_TRACK) window.NUDJ_TRACK.ev("adv", { k, occ }); } catch (e) { } };
  function trackPlan() { if (!current() && st.a.occ) { const key = JSON.stringify(st.a); if (st.planKey !== key) { st.planKey = key; TRK("plan", st.a.occ); } } }
  function answer(k, v) {
    st.a[k] = v; delete st.pre[k]; st.note = ""; st.said = ""; st.added = 0; st.adj = {};
    if (k === "occ") TRK("start", v);
    autoFill(); trackPlan();
    save("new");
  }
  function edit(k) {
    const f = flow(), i = f.indexOf(k);
    st.pre[k] = st.a[k];
    /* تعديل العدد لا يمسح بقية الإجابات — الكميات تُعاد حسابها فقط */
    if (k === "people") delete st.a.people;
    else f.slice(i).forEach(x => { if (x !== "occ" || k === "occ") delete st.a[x]; });
    if (k === "occ") { st.a = {}; }
    st.adj = {}; st.note = ""; st.said = ""; st.added = 0;
    save();
  }
  function reset() { st = fresh(); save("new"); }
  function addToCart() {
    const s = compute(), all = st.sections.concat([s]);
    let n = 0, miss = 0;
    all.forEach(sec => sec.lines.forEach(l => { const o = { opts: l.opts, src: "advisor" }; if (l.kg != null) o.kg = l.kg; else o.qty = l.qty; if (S.cart.add(l.id, o)) n++; else miss++; }));
    st.added = n; TRK("cart", st.a.occ); save("new");
    const A = window.NUDJ_APP; if (A) { A.bump(); A.toast(L("أُضيفت الخطة للسلة (" + n + " أسطر)", "Plan added to cart (" + n + " lines)") + (miss ? L(" — " + miss + " نفدت كميته", " — " + miss + " sold out") : ""), { icon: "cart", action: { label: L("السلة", "Cart"), href: "cart.html" } }); }
  }
  function savePlan() {
    const s = compute(), all = st.sections.concat([s]);
    S.plans.save({ id: "P" + Date.now().toString(36), title: all.map(x => x.title).join(" + "), sections: all, total: all.reduce((t, x) => t + total(x.lines), 0) });
    const A = window.NUDJ_APP; if (A) A.toast(L("حُفظت الخطة في حسابك", "Plan saved to your account"), { icon: "save", action: { label: L("خططي", "My plans"), href: "account.html?s=plans" } });
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
        else if (k === "more") { const s = compute(); if (!st.added) st.sections.push(s); else st.sections = []; st.a = {}; st.adj = {}; st.added = 0; st.note = ""; st.said = ""; save("new"); }
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
        if (sel.length < (n.min == null ? 1 : n.min)) { hint(v, L("اختر خياراً واحداً على الأقل", "Pick at least one option")); return; }
        answer(k, sel); return;
      }
      const q = t.closest(".qr[data-v]"); if (q) {
        const m = q.closest("[data-multi]");
        if (m) {
          const n = NODES[m.dataset.multi], on = !q.classList.contains("on");
          if (on && n.max && $$(".qr.on", m).length >= n.max) { hint(v, L("حدّك " + n.max + " — شيل واحد أول", "Max " + n.max + " — remove one first")); return; }
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
      const A = window.NUDJ_APP; if (A) { A.bump(); A.toast(L("أُضيف 1 كجم " + p.name, "Added 1 kg of " + p.name), { icon: "cart", action: { label: L("السلة", "Cart"), href: "cart.html" } }); }
    }
  }
  function hint(v, msg) { const A = window.NUDJ_APP; if (A) A.toast(msg, { icon: "info" }); }

  /* ---------------- فهم النص المكتوب ----------------
     NUDJ_NLU يستخرج كل ما في الجملة (المناسبة، العدد، الماشية، الطبق، التتبيلة…)،
     والمستشار يعبّئ منه كل الأسئلة الممكنة دفعة واحدة، ويجاوب الأسئلة الجانبية
     (التوصيل، السعر، الدفع…) ويكمل. لا يقول للعميل «ما فهمت» أبداً — يقترح ويكمل. */
  const NLU = window.NUDJ_NLU;
  const has = (k, v) => opts(k).some(o => o.k === v);
  const near = (list, v) => list.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a);
  /* قيمة سؤال معيّن من نتيجة التحليل (أو من الملاحظات المحفوظة) — direct: الجملة موجّهة لهذا السؤال */
  function valueFor(k, r, direct) {
    if (!r) return null;
    const pickOpt = v => v != null && has(k, v) ? v : null;
    switch (k) {
      case "people": return r.people ? Math.min(200, Math.max(1, r.people)) : null;
      case "forms": { const f = (r.forms || []).filter(x => has(k, x)).slice(0, 3); return f.length ? f : direct && (r.mix || r.all) ? ["cubes", "kebab", "whole"].filter(x => has(k, x)) : null; }
      case "gAnimal": case "wAnimal": return pickOpt(r.animal) || (direct && r.mix ? "mix" : null);
      case "fAnimal": case "qAnimal": case "cAnimal": return pickOpt(r.animal) || (k === "qAnimal" && r.products && r.products[0] ? r.products[0].animal : null);
      case "marinade": return pickOpt(r.marinade) || (direct && r.no ? "none" : direct && r.yes ? "classic" : null);
      case "sMarinade": return pickOpt(r.marinade) || (direct && r.no ? "none" : direct && r.yes ? "herb" : null);
      case "skewer": return r.skewer || (direct && r.yes ? "yes" : direct && r.no ? "no" : null);
      case "vacuum": return r.vacuum || (direct && r.yes ? "yes" : direct && r.no ? "no" : null);
      case "spice": case "trays": return direct ? (r.yes ? "yes" : r.no ? "no" : null) : null;
      case "tools": { const t = (r.tools || []).filter(x => has(k, x)); return t.length ? t : direct && r.all ? opts(k).map(o => o.k) : direct && r.no ? [] : direct && r.yes ? ["charcoal"] : null; }
      case "dish": return pickOpt(r.dish);
      case "mode": return r.mode || (direct && r.dish ? null : null);
      case "bone": return r.bone;
      case "style": return pickOpt(r.style) || pickOpt(r.dish === "mandi" ? "mandi" : r.dish === "kabsa" ? "kabsa" : null);
      case "cSpice": { if (!direct) return null; const m = { kabsa: "spice-kabsa", mandi: "spice-mandi" }; const l = []; if (r.dish && m[r.dish]) l.push(m[r.dish]); if ((r.forms || []).length || r.occ === "grill") l.push("spice-grill"); return l.length ? l : r.all ? opts(k).map(o => o.k) : r.no ? [] : null; }
      case "steakCut": return pickOpt(r.steakCut) || (r.products || []).map(p => p.id).find(id => has(k, id)) || (direct && r.mix ? "mix" : null);
      case "where": return r.where;
      case "days": return r.days ? String(near([3, 5, 7], r.days)) : null;
      case "items": { const it = (r.items || []).filter(x => has(k, x)); return it.length ? it : direct && (r.mix || r.all) ? opts(k).map(o => o.k) : null; }
      case "qCut": return (r.products || []).map(p => p.id).find(id => has(k, id)) || null;
      case "qNext": return r.people || r.occ === "feast" || r.occ === "grill" ? "plan" : null;
    }
    return null;
  }
  /* مطابقة نص الجملة بأسماء الخيارات الظاهرة (تشمل بيانات لوحة التحكم والإنجليزي) */
  function optionByName(k, r) {
    const toks = new Set(r.tokens);
    let best = null, score = 0;
    opts(k).forEach(o => {
      const w = NLU.norm(o.n).split(" ").filter(x => x.length > 2);
      const n = w.filter(x => toks.has(x) || r.tokens.some(t => t.length > 3 && NLU.lev(t, x, 1) <= 1)).length;
      if (w.length && n / w.length > score && n / w.length >= .5) { score = n / w.length; best = o; }
    });
    return best && !best.act ? best.k : null;
  }
  /* ما كتبه العميل سابقاً يُعبّأ تلقائياً حين يصل سؤاله — ثم تُحذف الملاحظة حتى لا تعود لو غيّر إجابته */
  const HK = { people: "people", gAnimal: "animal", fAnimal: "animal", cAnimal: "animal", wAnimal: "animal", qAnimal: "animal", dish: "dish", forms: "forms", marinade: "marinade", sMarinade: "marinade",
    skewer: "skewer", vacuum: "vacuum", tools: "tools", mode: "mode", bone: "bone", style: "style", steakCut: "steakCut", where: "where", days: "days", items: "items", qCut: "products" };
  function autoFill() {
    for (let i = 0; i < 14; i++) {
      const cur = current(); if (!cur) return;
      const v = valueFor(cur, st.hints, false);
      if (v == null || (Array.isArray(v) && !v.length && ["tools", "cSpice"].indexOf(cur) < 0)) return;
      st.a[cur] = v; st.filled = (st.filled || 0) + 1;
      if (HK[cur]) delete st.hints[HK[cur]];
    }
  }
  function remember(r) {
    const h = st.hints;
    ["people", "animal", "dish", "marinade", "bone", "style", "mode", "steakCut", "where", "days", "skewer", "vacuum"].forEach(k => { if (r[k] != null) h[k] = r[k]; });
    ["forms", "items", "tools"].forEach(k => { if ((r[k] || []).length) h[k] = r[k]; });
    if (r.products && r.products.length) h.products = r.products;
  }

  /* ---------------- ردود جانبية (ثم يكمل المستشار سؤاله) ---------------- */
  const joinL = a => a.join(L("، ", ", "));
  const pName = p => esc(p.name);
  const priceLine = p => p.sold === "carcass"
    ? `<b>${pName(p)}</b>: ${L("من", "from")} <b class="num">${U.money(p.sizes[0].p)}</b> ${L("إلى", "to")} <b class="num">${U.money(p.sizes[p.sizes.length - 1].p)}</b> ${CUR} (${p.sizes.map(z => esc(z.l) + " ≈ " + z.kg + " " + KG).join(L("، ", ", "))})`
    : `<b>${pName(p)}</b>: <b class="num">${U.money(p.price)}</b> ${CUR}/${p.sold === "kg" ? KG : esc(p.unitName || L("حبة", "piece"))}`;
  const REPLY = {
    greet: r => /سلام|salam/.test(r.text) ? L("وعليكم السلام ورحمة الله، حيّاك!", "Wa alaykum as-salam, welcome!") : L("هلا والله، حيّاك!", "Hi, welcome!"),
    thanks: () => L("العفو، بالعافية مقدماً! أي شي ثاني أنا حاضر.", "You're welcome! Anything else, I'm here."),
    delivery: () => { const c = D.CONFIG, d = c.delivery; return L(`التوصيل <b class="num">${d.fee}</b> ${CUR}، ومجاني للطلبات من <b class="num">${d.freeOver}</b> ${CUR}. نوصّل حالياً: ${joinL(c.cities.map(esc))}. وتختار اليوم والفترة عند إتمام الطلب: ${joinL(c.windows.map(w => esc(w.l)))}.`,
      `Delivery is <b class="num">${d.fee}</b> ${CUR}, and free on orders from <b class="num">${d.freeOver}</b> ${CUR}. We currently deliver to: ${joinL(c.cities.map(esc))}. You pick the day and slot at checkout: ${joinL(c.windows.map(w => esc(w.l)))}.`); },
    payment: () => L(`تقدر تدفع بـ: ${joinL(U.payments().map(p => esc(p.n)))}. والأسعار شاملة الضريبة.`, `You can pay with: ${joinL(U.payments().map(p => esc(p.n)))}. Prices include VAT.`),
    cutting: () => L(`التقطيع مجاني بأي شكل: ${joinL(["kabsa", "cubes", "slices", "steaks", "mince", "kebab"].filter(k => D.PREPS[k]).map(k => esc(D.PREPS[k].n)))}… المدفوع فقط التتبيل والتسييخ والتغليف المفرّغ، وسعرها يظهر قبل ما تضيفها.`,
      `Cutting is free in any style: ${joinL(["kabsa", "cubes", "slices", "steaks", "mince", "kebab"].filter(k => D.PREPS[k]).map(k => esc(D.PREPS[k].n)))}… Only marinating, skewering and vacuum packing are paid, and you see their price before adding them.`),
    cancel: () => L("تقدر تلغي طلبك من صفحة الطلب قبل ما نبدأ التجهيز. ولأن اللحم طازج، ما يُسترجع بعد الاستلام إلا إذا وصل بحالة غير سليمة أو مخالفة لطلبك.", "You can cancel from the order page before preparation starts. Because meat is fresh, it can't be returned after delivery unless it arrives in poor condition or doesn't match your order."),
    contact: () => { const k = D.CONFIG.contact; return L(`تقدر تكلمنا على <span class="num" dir="ltr">${esc(k.phone)}</span> أو واتساب <span class="num" dir="ltr">${esc(k.whatsapp)}</span>. وأنا هنا أحسب لك أي طلب.`, `You can reach us on <span class="num" dir="ltr">${esc(k.phone)}</span> or WhatsApp <span class="num" dir="ltr">${esc(k.whatsapp)}</span>. And I'm here to work out any order for you.`); }
  };
  function priceReply(r) {
    if (r.products.length) return r.products.slice(0, 4).map(priceLine).join("<br>");
    if (r.animal) { const l = D.cutsOf(r.animal).filter(p => p.sold === "kg").sort((a, b) => a.price - b.price); const a = D.animal(r.animal); return L(`أسعار ${esc(a.n)} تبدأ من <b class="num">${U.money(l[0].price)}</b> ${CUR}/${KG}:`, `${esc(a.n)} starts from <b class="num">${U.money(l[0].price)}</b> ${CUR}/${KG}:`) + "<br>" + l.slice(0, 4).map(priceLine).join("<br>"); }
    const kg = D.live().filter(p => p.sold === "kg"), min = Math.min.apply(null, kg.map(p => p.price)), car = D.carcasses(), cmin = car.length ? Math.min.apply(null, car.map(p => p.sizes[0].p)) : 0;
    return L(`القطعيات تبدأ من <b class="num">${U.money(min)}</b> ${CUR} للكيلو${car.length ? `، والذبائح من <b class="num">${U.money(cmin)}</b> ${CUR}` : ""}. قل لي اسم القطعة وأعطيك سعرها بالضبط.`, `Cuts start from <b class="num">${U.money(min)}</b> ${CUR}/kg${car.length ? `, and carcasses from <b class="num">${U.money(cmin)}</b> ${CUR}` : ""}. Tell me the cut and I'll give you its exact price.`);
  }
  function compareReply(list) {
    const K3 = L(["الطراوة", "الدهن", "النكهة"], ["tenderness", "fat", "flavour"]);
    return L("الفرق باختصار:", "The difference in short:") + "<br>" + list.slice(0, 3).map(p => `• ${priceLine(p)}${p.spec ? " — " + p.spec.map((v, i) => K3[i] + " " + v + "/5").join(L("، ", ", ")) : ""}${p.short ? " — " + esc(p.short) : ""}`).join("<br>");
  }
  /* ما التقطناه من الجملة (لتأكيده للعميل) */
  function ackList(r) {
    const out = [];
    if (r.people) out.push(people(r.people));
    if (r.animal && D.animal(r.animal)) out.push(esc(D.animal(r.animal).n));
    if (r.dish) { const d = AD.dishes.find(x => x.k === r.dish); if (d) out.push(esc(d.n)); }
    (r.forms || []).forEach(f => { const g = AD.grillForms.find(x => x.k === f); if (g) out.push(esc(g.n)); });
    if (r.marinade) out.push(esc(D.marinade(r.marinade).n));
    if (r.bone) out.push(r.bone === "bone" ? L("بالعظم", "bone-in") : L("بدون عظم", "boneless"));
    return out;
  }
  /* توضيح لطيف للسؤال الحالي — بدون «ما فهمت» */
  function helpFor(k) {
    const n = NODES[k]; if (!n) return "";
    if (n.type === "people") return L("اكتب العدد بالأرقام أو بالكلام (مثل: عشرة، خمسة وعشرين) — أو اختر من الأرقام تحت.", "Type the number in digits or words (like “ten”), or pick one below.");
    if (n.type === "occ") return "";
    const ex = opts(k).filter(o => !o.act).slice(0, 3).map(o => "«" + esc(o.n) + "»").join(L(" أو ", " or "));
    return ex ? L(`تقدر تختار من تحت، أو تكتبها بطريقتك — مثل ${ex}.`, `Pick one below, or say it your way — like ${ex}.`) : "";
  }

  function understand(txt) {
    const r = NLU.parse(txt), I = r.intents, notes = [];
    st.said = txt; st.note = ""; st.filled = 0;
    if (I.reset && !r.occ) { reset(); return; }
    const cur0 = current();
    /* الأسئلة الجانبية تُجاب أولاً ثم نكمل */
    if (I.greet) notes.push(REPLY.greet(r));
    if (I.delivery) notes.push(REPLY.delivery());
    if (I.payment) notes.push(REPLY.payment());
    if (I.cancel) notes.push(REPLY.cancel());
    if (I.contact) notes.push(REPLY.contact());
    if (I.cutting && (I.free || I.price || r.question)) notes.push(REPLY.cutting());
    if (r.products.length >= 2 && (r.question || r.found["occ:ask"])) notes.push(compareReply(r.products));
    else if (I.price && !I.delivery && !(I.cutting && (I.free || r.question))) notes.push(priceReply(r));
    if (I.thanks && !notes.length) notes.push(REPLY.thanks());
    remember(r);
    const sideOnly = notes.length && !r.occ && !r.people && !r.animal && !r.dish && !r.forms.length;

    if (!st.a.occ || cur0 === "occ") {
      let occ = r.occ;
      /* قطعة محددة بلا مناسبة ← «سؤال عن قطعة» عنها مباشرة */
      if (!occ && r.products.length === 1 && r.products[0].sold === "kg" && !I.price && has("occ", "ask")) { const p = r.products[0]; st.a = { occ: "ask", qAnimal: p.animal, qCut: p.id }; }
      else if (!occ && !sideOnly && (r.question || r.found["occ:ask"]) && r.animal && has("occ", "ask")) occ = "ask";
      else if (!occ && !sideOnly && r.kg && r.products.length === 1) { const p = r.products[0]; st.a = { occ: "ask", qAnimal: p.animal, qCut: p.id }; }
      if (occ && has("occ", occ)) { st.a.occ = occ; }
      if (st.a.occ) { autoFill(); if (current() && st.filled >= 1 && ackList(r).length) notes.push(L("تمام، سجّلت: ", "Got it: ") + ackList(r).join(L("، ", ", ")) + "."); }
      else if (!notes.length) {
        const got = ackList(r);
        notes.push(got.length ? L(`تمام، سجّلت ${got.join("، ")}. بقي تختار المناسبة عشان أحسبها لك صح:`, `Got it: ${got.join(", ")}. Now pick the occasion so I can work it out properly:`)
          : L("حيّاك! عشان أحسبها لك صح، اختر أقرب مناسبة لطلبك — أو اكتبها بكلامك مثل «مشاوي لـ 8» أو «كبسة جمل لعشرين».", "Welcome! To get it right, pick the closest occasion — or say it your way, like “BBQ for 8” or “camel kabsa for twenty”."));
      } else if (!sideOnly) notes.push(L("وش المناسبة؟ اختر من تحت وأكمل معك.", "What's the occasion? Pick below and I'll take it from there."));
    } else if (cur0) {
      const node = NODES[cur0];
      let v = valueFor(cur0, r, true);
      if (v == null && (node.type === "chips" || node.type === "multi")) { const o = optionByName(cur0, r); if (o) v = node.type === "multi" ? [o] : o; }
      if (cur0 === "qNext" && v === "plan") { if (r.people) st.hints.people = r.people; }
      if (v != null && !(node.type === "multi" && Array.isArray(v) && !v.length && (node.min == null ? 1 : node.min) > 0)) {
        st.a[cur0] = v; if (HK[cur0]) delete st.hints[HK[cur0]]; autoFill();
      } else {
        autoFill();
        if (current() === cur0) {
          const got = ackList(r);
          if (got.length) notes.push(L("تمام، سجّلت: ", "Noted: ") + got.join(L("، ", ", ")) + ".");
          else if (!notes.length) notes.push(helpFor(cur0) || L("خلني أساعدك — اختر من الخيارات تحت.", "Let me help — pick from the options below."));
          /* مناسبة جديدة مكتوبة وسط الأسئلة ← نبدأها */
          if (r.occ && r.occ !== st.a.occ && !got.length && (r.found["occ:" + r.occ] || 0) >= 1.4) { st.a = { occ: r.occ }; autoFill(); notes.length = 0; }
        }
      }
    } else {
      /* الخطة جاهزة: عدد جديد، سلة، حفظ، أو مناسبة ثانية */
      if (r.people && !r.occ) { st.a.people = r.people; st.adj = {}; notes.push(L(`حسبتها من جديد على ${people(r.people)}.`, `Recalculated for ${people(r.people)}.`)); }
      else if (I.cart) { st.said = ""; st.note = notes.join("<br>"); addToCart(); return; }
      else if (I.save) { savePlan(); notes.push(L("حفظتها لك في حسابك.", "Saved to your account.")); }
      else if (r.occ && has("occ", r.occ)) { if (!st.added) st.sections.push(compute()); else st.sections = []; st.a = { occ: r.occ }; st.adj = {}; st.added = 0; autoFill(); notes.push(L("تمام، نضيفها على الخطة:", "Sure, adding it to the plan:")); }
      else if (!notes.length) notes.push(L("خطتك جاهزة — تقدر تضيفها للسلة، أو تكتب عدداً جديداً وأعيد الحساب، أو تضيف مناسبة ثانية.", "Your plan is ready — add it to the cart, type a new headcount and I'll recalculate, or add another occasion."));
    }
    st.note = notes.join("<br>"); st.adj = st.adj || {}; if (current() !== cur0) st.added = 0;
    if (cur0 === "occ" && st.a.occ) TRK("start", st.a.occ);
    trackPlan();
    save("new");
  }

  /* ---------------- واجهات للاستخدام من الصفحات ---------------- */
  /* يبدأ مناسبة محددة (من بطاقات الرئيسية مثلاً) */
  function start(occ, hints) {
    if (st.a.occ && current() !== "occ") { if (!st.added && current() == null) st.sections.push(compute()); }
    st.a = {}; st.adj = {}; st.added = 0; st.note = ""; st.said = ""; st.hints = hints || {};
    if (occ) answer("occ", occ); else save("new");
  }
  /* سؤال عن قطعة محددة (من صفحة المنتج) */
  function askAbout(id) {
    const p = D.byId(id); if (!p || p.sold !== "kg") return start();
    st.a = { occ: "ask", qAnimal: p.animal, qCut: p.id }; st.adj = {}; st.added = 0; st.note = ""; st.said = ""; save("new");
  }
  /* الكمية المقترحة لقطعة وعدد أشخاص (لميزان صفحة المنتج) */
  function suggestKg(p, n) { const g = gramsFor(p); return { kg: up(g.g * n / 1000), g: g.g, use: g.use }; }
  /* تنبيهات السلة: ما ينقص الطلب؟ */
  function cartTips(lines) {
    const tips = [], ids = lines.map(l => l.id);
    const grillKg = r2(lines.filter(l => { const p = D.byId(l.id); return p.sold === "kg" && ["cubes", "kebab", "slices", "chops", "rack"].indexOf(l.opts.prep) > -1 || (l.opts.prep === "steaks" && p.uses.indexOf("grill") > -1); }).reduce((t, l) => t + (l.kg || 0), 0));
    if (grillKg && ids.indexOf("charcoal") < 0) tips.push({ t: L("عندك " + U.kgTxt(grillKg) + " للشوي — تحتاج فحم؟", "You have " + U.kgTxt(grillKg) + " for grilling — need charcoal?"), id: "charcoal", qty: Math.ceil(grillKg / AD.charcoalKgPerBag) });
    const skewKg = r2(lines.filter(l => ["cubes", "kebab", "slices"].indexOf(l.opts.prep) > -1 && !l.opts.skewer).reduce((t, l) => t + (l.kg || 0), 0));
    if (skewKg && ids.indexOf("skewers") < 0) tips.push({ t: L(U.kgTxt(skewKg) + " أوصال وكباب بدون تسييخ — عندك أسياخ؟", U.kgTxt(skewKg) + " of cubes and kebab without skewers — got skewers?"), id: "skewers", qty: Math.ceil(skewKg / AD.skewerKgPerSet) });
    const kabsaKg = r2(lines.filter(l => ["kabsa", "mandi"].indexOf(l.opts.prep) > -1 || D.byId(l.id).sold === "carcass").reduce((t, l) => { const p = D.byId(l.id); return t + (p.sold === "carcass" ? S.sizeOf(p, l.opts.size).kg * (l.qty || 1) : l.kg); }, 0));
    if (kabsaKg && ids.indexOf("spice-kabsa") < 0 && ids.indexOf("spice-mandi") < 0) tips.push({ t: L("لحم كبسة ومندي " + U.kgTxt(kabsaKg) + " — نضيف البهارات؟", U.kgTxt(kabsaKg) + " of kabsa and mandi meat — shall we add spices?"), id: lines.some(l => l.opts.prep === "mandi" || l.opts.style === "mandi") ? "spice-mandi" : "spice-kabsa", qty: Math.ceil(kabsaKg / AD.spiceKgPerPack) });
    const plain = lines.filter(l => ["cubes", "kebab", "slices", "chops"].indexOf(l.opts.prep) > -1 && !l.opts.marinade);
    if (plain.length) tips.push({ t: L("تبغى نتبّل " + D.byId(plain[0].id).name + "؟ تتبيلة المشاوي الحارة +" + D.marinade("hot").p + " ر.س/كجم", "Marinate the " + lc(D.byId(plain[0].id).name) + "? " + D.marinade("hot").n + " marinade +" + D.marinade("hot").p + " " + CUR + "/kg"), key: plain[0].key, marinade: "hot" });
    return tips.slice(0, 3);
  }

  return { mount, start, askAbout, suggestKg, cartTips, state: () => st, current, reset, say: understand };
})();
