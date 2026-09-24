/* =========================================================
   نُضْج — فهم كلام العميل للمستشار
   عربي فصيح وعامي (سعودي ومصري وخليجي) وإنجليزي، مع الأخطاء الإملائية
   (مسافة تحرير 1–2)، الأرقام بالكلام («عشرة»، «خمسة وعشرين»)، وعدة معلومات
   في جملة واحدة: «عزومة 15 نفر كبسة جمل بالعظم».
   لا يرفض أي جملة: يرجع أفضل تخمين، والمستشار يكمل منه.
   ========================================================= */
window.NUDJ_NLU = (function () {
  "use strict";
  const D = window.NUDJ;

  /* ---------------- التوحيد ---------------- */
  function norm(s) {
    return String(s || "").toLowerCase()
      .replace(/[٠-٩]/g, c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/[۰-۹]/g, c => "۰۱۲۳۴۵۶۷۸۹".indexOf(c))
      .replace(/[ً-ْٰـ]/g, "")
      .replace(/[أإآٱ]/g, "ا").replace(/[ىی]/g, "ي").replace(/ک/g, "ك").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/[گڭ]/g, "ك").replace(/ڤ/g, "ف").replace(/چ/g, "ج")
      .replace(/(\d)\s*[.,٫]\s*(\d)/g, "$1.$2")
      .replace(/(\D)\1{2,}/g, "$1")
      .replace(/[^\p{L}\p{N}.\s]/gu, " ").replace(/\s+/g, " ").trim();
  }
  const PRE = /^(وبال|فبال|وال|بال|فال|كال|عال|لل|ال|و|ب|ل|ف|ك)/;
  /* صيغ الكلمة: كما هي، بدون «ال/و/ب/ل»، وبدون جمع إنجليزي */
  function forms(w) {
    const out = [w], m = w.match(PRE);
    if (m && w.length - m[0].length >= 3) { out.push(w.slice(m[0].length)); const w2 = w.slice(m[0].length), m2 = w2.match(/^(ال)/); if (m2 && w2.length > 4) out.push(w2.slice(2)); }
    if (/^[a-z]{4,}s$/.test(w)) out.push(w.slice(0, -1));
    if (/^[a-z]{5,}es$/.test(w)) out.push(w.slice(0, -2));
    return out;
  }
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let low = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < low) low = cur[j];
      }
      if (low > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  /* ---------------- القاموس: مفهوم ← كلمات (بعد التوحيد) ----------------
     الوزن w (افتراضي 1) يرجّح المناسبة حين تتعارض الكلمات */
  const LEX = [
    /* المناسبات */
    ["occ:grill", "مشاوي مشوي مشويات شوي شويه شواء شوا الشوي شوايه منقل باربكيو بربكيو باربيكيو برابيكيو bbq barbecue barbeque grill grilling cookout كشته طلعه بر"],
    ["occ:grill", "كباب كفته اوصال تكه شيش ريش كستليته برجر برغر burger burgers", 0.8],
    ["occ:feast", "عزيمه عزومه عزايم وليمه ولايم ضيوف ضيف معازيم غدا غداء لمه عيد مناسبه زواج ملكه عرس عقد نجاح تخرج feast gathering guests guest lunch family"],
    ["occ:feast", "حفله عشا عشاء party dinner", 0.4],
    ["occ:feast", "كبسه مندي مظبي حنيذ مضغوط برياني زربيان مقلوبه منسف مرق ايدام فته ملوخيه طاجن صالونه kabsa mandi biryani stew", 0.9],
    ["occ:carcass", "ذبيحه دبيحه ذبايح ذبيحتين عقيقه اضحيه ضحيه اضاحي نذر carcass aqiqah qurbani slaughter", 1.6],
    ["occ:carcass", "خروف_كامل نص_خروف نصف_خروف ربع_خروف تيس_كامل خروف_حي whole_lamb half_lamb whole_goat whole_sheep", 1.8],
    ["occ:steak", "ستيك ستيكات steak steaks ريب_اي ريباي ribeye تندرلوين تندر tenderloin ستربلوين سيرلوين striploin sirloin انتركوت entrecote فيليه fillet filet"],
    ["occ:weekly", "اسبوع اسبوعي الاسبوع شهر شهري مقاضي تموين للبيت البيت يومي يوميا طبخ_البيت week weekly month monthly groceries household meal_prep daily", 1.5],
    ["occ:ask", "الفرق فرق افضل احسن انهي انهو وش_تنفع ايش_تنفع تنفع استفسار سؤال اسال difference which best better recommend suggest compare vs", 0.6],
    /* المواشي */
    ["animal:lamb", "ضان ضاني ضأن غنم خروف خرفان نعيمي نجدي حري سواكني بربري حمري لحم_ضاني lamb sheep mutton"],
    ["animal:goat", "ماعز معز تيس عنز جدي سخل سخله goat kid"],
    ["animal:camel", "جمل جملي حاشي حواشي ناقه قعود ابل بعير حوار camel camels hashi"],
    ["animal:veal", "عجل عجول عجالي بتلو veal calf"],
    ["animal:beef", "بقر بقري بقره كندوز beef cow"],
    ["animal:buffalo", "جاموس جاموسي جاموسه buffalo"],
    /* الطبخات */
    ["dish:kabsa", "كبسه كبسات مضغوط برياني زربيان مقلوبه منسف رز_باللحم kabsa kabsah biryani"],
    ["dish:mandi", "مندي مظبي حنيذ مدفون madhbi mandi"],
    ["dish:marag", "مرق ايدام شوربه فته ملوخيه طاجن صالونه قدر stew soup broth curry marag"],
    ["dish:oven", "فرن محمر روستو مشوي_بالفرن محشي_بالفرن roast oven"],
    /* أشكال الشوي */
    ["form:cubes", "اوصال مكعبات مكعب تكه شيش شقف cubes cube shish tikka kebabs_cubes"],
    ["form:slices", "شرايح شريحه سلايس slices slice sliced strips"],
    ["form:whole", "ريش كستليته قطع_سليمه سليمه chops rack ribs_whole"],
    ["form:kebab", "كباب كفته برجر برغر kebab kabab kofta kofte burger"],
    ["form:liver", "كبده كبد معلاق liver"],
    /* التتبيل */
    ["mar:none", "بدون_تتبيل بلا_تتبيل من_غير_تتبيل ساده سادة خام طبيعي plain no_marinade unmarinated ملح_بس ملح_خشن"],
    ["mar:classic", "كلاسيك كلاسيكي عادي ملح_وفلفل classic regular simple"],
    ["mar:hot", "حار حاره سبايسي شطه بابريكا مشاوي_حار spicy hot chili chilli"],
    ["mar:herb", "ليمون اعشاب روزماري زعتر lemon herb herbs"],
    ["mar:yogurt", "زبادي لبن يوغرت روب yogurt yoghurt"],
    /* العظم */
    ["bone:bone", "بالعظم بعظم عظم عظام bone bone_in with_bone"],
    ["bone:boneless", "بدون_عظم بلا_عظم من_غير_عظم صافي هبر boneless no_bone without_bone"],
    /* الذبيحة */
    ["style:fridge", "ثلاجه تقطيع_ثلاجه فريزر fridge freezer"],
    ["style:mixed", "حسب_الطبخه مشكل منوع mixed"],
    ["style:whole", "بدون_تقطيع كامله قوزي uncut"],
    ["mode:carcass", "ذبيحه دبيحه carcass"],
    ["mode:cuts", "قطعيات قطع كتف فخذ cuts"],
    /* الستيك */
    ["steak:beef-ribeye", "ريب_اي ريباي ريب ribeye rib_eye"],
    ["steak:beef-tenderloin", "تندرلوين تندر فيليه_بقر tenderloin filet_mignon"],
    ["steak:beef-striploin", "ستربلوين سيرلوين نيويورك striploin sirloin new_york"],
    ["steak:veal-entrecote", "انتركوت entrecote"],
    ["steak:veal-fillet", "فيليه_عجل veal_fillet"],
    ["steak:lamb-loin", "خاصره_ضان lamb_loin"],
    /* مكان الشوي */
    ["where:coal", "فحم جمر شوايه منقل charcoal coals"],
    ["where:pan", "مقلاه طاوه طاسه فرن بوتاجاز pan skillet stove"],
    /* العدّة */
    ["tool:charcoal", "فحم charcoal"],
    ["tool:starters", "اشعال ولاعه مكعبات_اشعال starter starters firelighter"],
    ["tool:trays", "صواني صينيه صحون tray trays"],
    ["tool:skewers", "اسياخ سيخ اسياخ_ستيل skewer skewers"],
    /* أطباق البيت الأسبوعية */
    ["item:mince", "مفروم مفرومه كفته برجر mince minced ground burger"],
    ["item:stew", "مرق ايدام شوربه قطع_مرق stew"],
    ["item:bone", "بالعظم قطع_بالعظم bone"],
    ["item:steak", "ستيك شرايح بانيه اسكالوب steak escalope"],
    ["item:liver", "كبده liver"],
    /* نعم / لا / على كيفك */
    ["yes", "ايوه ايوا ايه نعم اكيد اوكي اوك ok okay yes yeah yep yup sure تمام طيب ماشي ابشر يب يس اه اها بالتاكيد ضروري ضيفها ضيفه حطه اضف حط اضيفه ضيفها حطها زين"],
    ["no", "لا لاء لاا لأ مو مش مب no nope nah مابي مابغى ماابغى ما_ابي ما_ابغى ما_بدي بلاش مش_عايز مش_عاوز skip عندي_بهارات no_thanks لا_شكرا"],
    ["mix", "نوع نوعلي نوعها منوع منوعه مشكل مشكله اي_شي اي_شيء اي_حاجه مش_فارقه على_كيفك انت_اختار اختار_انت اختارلي المهم any mix whatever surprise you_choose dont_mind"],
    ["all", "كلها الكل كله جميعها all everything both"],
    ["skewer:yes", "مسيخه مسيخ سيخوها اسياخ_جاهزه على_اسياخ skewered on_skewers"],
    ["vacuum:yes", "مفرغ مفرغه فاكيوم تفريغ vacuum vacuumed"],
    /* أسئلة جانبية */
    ["i:greet", "سلام السلام هلا هلو مرحبا مرحبتين اهلا اهلين هاي صباح_الخير مساء_الخير hi hello hey salam salaam"],
    ["i:thanks", "شكرا شكر مشكور مشكوره يعطيك_العافيه تسلم تسلمي جزاك_الله thanks thank thx appreciate"],
    ["i:delivery", "توصيل توصلون يوصل توصيله توصلو شحن مندوب delivery deliver shipping ship"],
    ["i:payment", "دفع ادفع الدفع مدى ابل_باي ابلباي تمارا كاش نقدا نقد فيزا ماستر بطاقه تقسيط payment pay cash card visa tamara installment"],
    ["i:price", "بكم بكام بقديش سعر السعر اسعار الاسعار كم_سعر كم_الكيلو كم_الكيلو_ب price prices cost how_much"],
    ["i:cutting", "تقطيع تقطعون تقطع مجاني_التقطيع cutting cut_free"],
    ["i:free", "مجاني مجانا ببلاش رسوم free fee"],
    ["i:cancel", "الغاء الغي الغاء_الطلب استرجاع ارجاع استبدال رجع cancel refund return"],
    ["i:contact", "تواصل رقم رقمكم واتساب وتساب اتصال خدمه_العملاء موظف انسان contact phone whatsapp human agent call"],
    ["i:reset", "من_جديد ابدا_من_جديد من_الاول ابدا_من_الاول جديد reset restart start_over"],
    ["i:cart", "السله للسله سله اطلب اطلبها اكمل_الطلب checkout add_to_cart order_it buy"],
    ["i:save", "احفظ احفظها save"],
    ["q", "كم وش ايش ايه شو هل ليش كيف متى وين انهي how what which when where why"]
  ];
  const WORDS = {}, PHRASES = [];
  LEX.forEach(([c, list, w]) => list.split(" ").forEach(x => {
    const k = norm(x.replace(/_/g, " ")); if (!k) return;
    const e = { c, w: w || 1 };
    if (k.indexOf(" ") > -1) PHRASES.push(Object.assign({ p: k }, e)); else (WORDS[k] = WORDS[k] || []).push(e);
  }));
  const KEYS = Object.keys(WORDS);
  /* كلمات شائعة لا نطابقها تقريبياً (تجنّب «عندي» ≈ «هندي») */
  const STOP = new Set("انا احنا ابغى ابي ابا ودي عايز عاوز بدي عندي عندنا لنا لي في على من مع او و يا بس لو اللي الي هذا هذي هاذي ذا دي ده عشان علشان لان حق حقت مال ناس شي شيء حاجه the a an for to of and with i we want need please plz".split(" ").map(norm));

  /* ---------------- الأرقام ---------------- */
  const NUMW = {}; [
    [1, "واحد وحده واحده one single"], [2, "اثنين اتنين ثنين اثنان two couple"], [3, "ثلاث ثلاثه تلات تلاته three"], [4, "اربع اربعه four"], [5, "خمس خمسه five"],
    [6, "ست سته سِته six"], [7, "سبع سبعه seven"], [8, "ثمان ثمانيه ثمانيه تمن تمانيه تمنيه eight"], [9, "تسع تسعه nine"], [10, "عشر عشره ten"],
    [11, "احدعش حداشر احداشر eleven"], [12, "اثنعش اطناشر اتناشر اثناعشر دزينه twelve dozen"], [13, "ثلاثطعش تلتاشر thirteen"], [14, "اربعطعش اربعتاشر fourteen"], [15, "خمسطعش خمستاشر fifteen"],
    [16, "ستطعش ستاشر sixteen"], [17, "سبعطعش سبعتاشر seventeen"], [18, "ثمنطعش تمنتاشر eighteen"], [19, "تسعطعش تسعتاشر nineteen"], [20, "عشرين twenty"],
    [30, "ثلاثين تلاتين thirty"], [40, "اربعين forty"], [50, "خمسين fifty"], [60, "ستين sixty"], [70, "سبعين seventy"], [80, "ثمانين تمانين eighty"], [90, "تسعين ninety"], [100, "ميه مئه مايه hundred"]
  ].forEach(([n, l]) => l.split(" ").forEach(w => { NUMW[norm(w)] = n; }));
  const PEOPLE = /^(شخص|اشخاص|شخوص|نفر|انفار|نفرات|نفس|انفس|ضيف|ضيوف|فرد|افراد|واحد|نفوس|عيال|ناس|person|people|persons|ppl|folks|souls|guests?|pax|heads?|adults?)$/;
  /* رقم بالكلام مكتوب بخطأ إملائي: tweleve ← twelve، عشرييين ← عشرين */
  const NUMK = Object.keys(NUMW);
  function numFuzzy(w) {
    if (!(/^[a-z]{4,}$/.test(w) || w.length >= 6)) return null;
    let best = null, bd = 2, tie = false;
    NUMK.forEach(k => { if (k.length < 4) return; const d = lev(w, k, 1); if (d < bd) { bd = d; best = k; tie = false; } else if (d === bd && best && NUMW[k] !== NUMW[best]) tie = true; });
    return best && bd <= 1 && !tie ? NUMW[best] : null;
  }
  const KGW = /^(كيلو|كيلوات|كجم|كغ|كيلوجرام|kg|kgs|kilo|kilos)$/;
  const DAYW = /^(يوم|ايام|days?)$/;
  function numbers(tokens) {
    const out = []; let i = 0;
    while (i < tokens.length) {
      const t = tokens[i];
      let v = null, span = 1;
      let glued = "", lead = "";
      if (/^\d+(\.\d+)?$/.test(t)) v = +t;
      else if (/^(ل|for)\d+$/.test(t)) { v = +t.match(/\d+/)[0]; lead = "ل"; }
      else if (/^\d+\D+$/.test(t)) { v = +t.match(/^\d+/)[0]; glued = t.replace(/^\d+/, ""); }
      else { const w = t.replace(/^(ول|و|لل|ل|ب)/, ""); if (NUMW[t] != null) v = NUMW[t]; else if (t !== w && NUMW[w] != null) { v = NUMW[w]; if (/^(ل|ول|لل)/.test(t)) lead = "ل"; } else if (!WORDS[t]) v = numFuzzy(t); }
      if (v != null) {
        /* «خمسه وعشرين» = 25 */
        const nx = tokens[i + 1]; if (v < 10 && nx && /^و/.test(nx)) { const w2 = nx.replace(/^و/, ""); if (NUMW[w2] >= 20 && NUMW[w2] < 100) { v += NUMW[w2]; span = 2; } }
        if (nx === "ونص" || nx === "ونصف" || nx === "and_half") v += .5;
        const after = glued || tokens[i + span] || "", before = lead || tokens[i - 1] || "";
        out.push({ v, kind: KGW.test(after) ? "kg" : DAYW.test(after) ? "days" : PEOPLE.test(after) ? "people" : /^(ل|لـ|for)$/.test(before) ? "people" : "" });
        i += span; continue;
      }
      /* المثنى: شخصين، نفرين، يومين، كيلوين */
      if (/^(شخصين|نفرين|ضيفين|فردين)$/.test(t)) out.push({ v: 2, kind: "people" });
      else if (/^يومين$/.test(t)) out.push({ v: 2, kind: "days" });
      else if (/^(كيلوين|كيلوان)$/.test(t)) out.push({ v: 2, kind: "kg" });
      else if (/^(نص|نصف|half)$/.test(t) && KGW.test(tokens[i + 1] || "")) out.push({ v: .5, kind: "kg" });
      i++;
    }
    return out;
  }

  /* ---------------- المنتجات: اسم القطعة + الماشية بأي صيغة ---------------- */
  const SYN = { "خروف": "ضان", "غنم": "ضان", "ضاني": "ضان", "معز": "ماعز", "تيس": "ماعز", "رجل": "فخذ", "كستليته": "ريش", "ضلع": "ضلوع", "بتلو": "عجل", "كندوز": "بقر", "ضاني": "ضان", "جملي": "جمل", "حاشي": "جمل", "بقري": "بقر", "كبد": "كبده", "مفرومه": "مفروم", "لحمه": "لحم", "leg": "leg", "kofta": "mince", "ground": "mince", "minced": "mince" };
  const canon = w => SYN[w] || w;
  let PIDX = null;
  function productIndex() {
    if (PIDX) return PIDX;
    PIDX = D.PRODUCTS.filter(p => !p.hidden).map(p => ({ p, words: norm(p.name).split(" ").map(w => canon(forms(w).pop())).filter(w => w.length > 1 && !/^\d+$/.test(w) && w !== "·") }));
    return PIDX;
  }
  function fuzzyHas(set, w) {
    if (set.has(w)) return true;
    if (w.length < 4) return false;
    for (const x of set) if (x.length >= 4 && lev(x, w, w.length >= 7 ? 2 : 1) <= (w.length >= 7 ? 2 : 1)) return true;
    return false;
  }
  function products(tokens) {
    const set = new Set(); tokens.forEach(t => forms(t).forEach(f => set.add(canon(f))));
    const hits = [];
    productIndex().forEach(({ p, words }) => {
      const n = words.filter(w => fuzzyHas(set, w)).length;
      if (n && n === words.length) hits.push({ p, score: n * 2 + (words.length === 1 ? 0 : 1) });
    });
    hits.sort((a, b) => b.score - a.score);
    /* «كتف ضان» يطابق «كتف ضأن» فقط، لا «مفروم ضأن» — نحتفظ بالأعلى تطابقاً ومن يساويه */
    return hits.map(h => h.p);
  }

  /* ---------------- التحليل ---------------- */
  function parse(txt) {
    const t = norm(txt), tokens = t.split(" ").filter(Boolean), padded = " " + t + " ";
    const found = {}, add = (c, w) => { found[c] = (found[c] || 0) + (w || 1); };
    const used = new Set();
    PHRASES.forEach(ph => { if (padded.indexOf(" " + ph.p + " ") > -1) { add(ph.c, ph.w); ph.p.split(" ").forEach(w => used.add(w)); } });
    tokens.forEach(tok => {
      if (STOP.has(tok)) return;
      const fs = forms(tok); let hit = false;
      for (const f of fs) { if (WORDS[f]) { WORDS[f].forEach(e => add(e.c, used.has(tok) ? e.w * .3 : e.w)); hit = true; break; } }
      if (hit || tok.length < 4 || /^\d/.test(tok)) return;
      /* تقريبي: أقرب كلمة بفارق حرف (أو حرفين للكلمات الطويلة) — والتعادل يُهمل */
      const max = tok.length >= 7 ? 2 : 1; let bd = max + 1, bests = [];
      for (const f of fs) for (const k of KEYS) {
        if (k.length < 4 || Math.abs(k.length - f.length) > max) continue;
        const d = lev(f, k, max);
        if (d < bd) { bd = d; bests = [k]; } else if (d === bd && bests.indexOf(k) < 0) bests.push(k);
      }
      if (bests.length && bd <= max) {
        const sets = bests.map(k => WORDS[k].map(e => e.c));
        const common = sets.reduce((a, b) => a.filter(c => b.indexOf(c) > -1));
        WORDS[bests[0]].forEach(e => { if (common.indexOf(e.c) > -1) add(e.c, e.w * .85); });
      }
    });
    /* «نفر» بعد رقم = أشخاص، ووحده = ذبيحة (بالسعودي) */
    const ni = tokens.indexOf("نفر"); if (ni > -1 && !(/^\d/.test(tokens[ni - 1] || "") || NUMW[tokens[ni - 1]] != null)) add("occ:carcass", 1.6);
    const pick = pre => { let b = null, s = 0; Object.keys(found).forEach(c => { if (c.indexOf(pre + ":") === 0 && found[c] > s) { s = found[c]; b = c.slice(pre.length + 1); } }); return b; };
    const all = pre => Object.keys(found).filter(c => c.indexOf(pre + ":") === 0).map(c => c.slice(pre.length + 1));
    const nums = numbers(tokens.slice());
    const r = { text: t, tokens, found };
    const occ = pick("occ"); r.occ = occ && found["occ:" + occ] >= .8 ? occ : null;
    /* الطبق وحده يعني عزومة، وشكل الشوي وحده يعني مشاوي */
    if (!r.occ && all("dish").length) r.occ = "feast";
    if (!r.occ && all("form").length) r.occ = "grill";
    if (!r.occ && all("steak").length) r.occ = "steak";
    r.animal = pick("animal"); r.dish = pick("dish"); r.forms = all("form"); r.marinade = pick("mar");
    r.bone = found["bone:boneless"] ? "boneless" : found["bone:bone"] ? "bone" : null;
    r.style = pick("style"); r.mode = found["mode:carcass"] ? "carcass" : found["mode:cuts"] ? "cuts" : null;
    r.steakCut = pick("steak"); r.where = pick("where"); r.tools = all("tool"); r.items = all("item");
    r.skewer = found["skewer:yes"] ? "yes" : null; r.vacuum = found["vacuum:yes"] ? "yes" : null;
    r.yes = !!found.yes && !found.no; r.no = !!found.no; r.mix = !!found.mix; r.all = !!found.all;
    r.question = !!found.q || /[?؟]/.test(txt);
    const people = nums.find(n => n.kind === "people") || nums.find(n => !n.kind && n.v >= 1 && n.v <= 300 && n.v === Math.round(n.v));
    r.people = people ? Math.round(people.v) : null;
    const kg = nums.find(n => n.kind === "kg"); r.kg = kg ? kg.v : null;
    const days = nums.find(n => n.kind === "days"); r.days = days ? days.v : /كل يوم|يوميا|daily|every day/.test(t) ? 7 : null;
    r.intents = {}; Object.keys(found).forEach(c => { if (c.indexOf("i:") === 0) r.intents[c.slice(2)] = true; });
    r.products = products(tokens);
    return r;
  }
  return { norm, parse, lev, products };
})();
