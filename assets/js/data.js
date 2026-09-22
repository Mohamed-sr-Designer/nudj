/* =========================================================
   نُضْج — NUDJ · قاعدة البيانات
   كل ما يخص المتجر في ملف واحد: الإعدادات، القطيع (6 مواشي)،
   القطعيات وأسعارها، الذبائح، الإضافات المدفوعة، وقواعد المستشار.
   - الأسعار مقترحة (ر.س شاملة الضريبة) — عدّلها من هنا فقط.
   - المعلومات الطهوية معرفة عامة. أي معلومة تجارية غير مؤكدة
     مكتوبة بين [أقواس] لتُستبدل.
   ========================================================= */
window.NUDJ = (function () {
  "use strict";

  /* ================= الإعدادات التجارية ================= */
  const CONFIG = {
    demo: true, /* true = الدفع ورمز التحقق محاكاة (لا يُخصم أي مبلغ) */
    base: "https://mohamed-sr-designer.github.io/nudj/",
    currency: "ر.س",
    vat: 0.15, /* الأسعار المعروضة شاملة الضريبة */
    delivery: { fee: 25, freeOver: 300 },
    coupons: { NUDJ10: { pct: 10, label: "خصم 10٪ على اللحوم" } },
    cities: ["الرياض", "جدة", "الدمام", "الخبر", "مكة المكرمة", "المدينة المنورة"],
    /* فترات التوصيل — h: ساعة البداية (تُخفى فترات اليوم التي بقي عليها أقل من ساعتين) */
    windows: [{ l: "9 – 12 صباحاً", h: 9 }, { l: "12 – 3 ظهراً", h: 12 }, { l: "3 – 6 عصراً", h: 15 }, { l: "6 – 9 مساءً", h: 18 }],
    deliveryDays: 6,
    payments: [
      { k: "applepay", n: "Apple Pay", logo: "Pay", s: "ادفع ببصمة الوجه أو الإصبع" },
      { k: "mada", n: "مدى", logo: "mada", s: "بطاقة مدى البنكية", card: true },
      { k: "card", n: "بطاقة ائتمانية", logo: "VISA", s: "فيزا أو ماستركارد", card: true },
      { k: "tamara", n: "تمارا", logo: "tamara", s: "قسّم المبلغ على دفعات" },
      { k: "cod", n: "الدفع عند الاستلام", logo: "COD", s: "نقداً أو بالشبكة عند التوصيل", cod: true }
    ],
    contact: {
      phone: "[الرقم الموحّد]", whatsapp: "[رقم الواتساب]", email: "[البريد الإلكتروني]",
      city: "[المدينة]", address: "[العنوان]", cr: "[رقم السجل التجاري]", vatNo: "[الرقم الضريبي]",
      hours: "[ساعات العمل]"
    }
  };

  /* ================= صور الصفحات =================
     احفظ الصورة بالاسم في assets/img/site/ وشغّل node build.js — تُكتشف تلقائياً.
     صور المنتجات: assets/img/products/<id>-1.webp (و -2 و -3 للمعرض). */
  const IMAGES = {
    "home-hero": "", "occ-feast": "", "occ-grill": "", "occ-steak": "", "occ-weekly": "", "occ-carcass": "",
    "marinade": "", "texture": "", "about": "", "og-share": ""
  };

  /* ================= القطيع =================
     art: الرسم الخطي للماشية · pins: مواقع القطعيات على الرسم (% من اليسار، % من الأعلى) */
  const ANIMALS = [
    { k: "lamb", n: "ضأن", en: "LAMB", code: "L", ratio: 876 / 683,
      note: "لحم وردي بدهن أبيض متوازن — الأساس في الكبسة والمندي والمشاوي.",
      pins: { neck: [24, 31], shoulder: [33, 44], rack: [55, 29], loin: [69, 40], leg: [86, 42], breast: [49, 57], shank: [33, 73] } },
    { k: "goat", n: "ماعز", en: "GOAT", code: "G", ratio: 884 / 740,
      note: "أحمر داكن وقليل الدهن ونكهته أوضح — يحبّه أهل المندي والمظبي.",
      pins: { neck: [23, 33], shoulder: [35, 45], rack: [57, 37], leg: [84, 42] } },
    { k: "camel", n: "حاشي", en: "CAMEL", code: "C", ratio: 958 / 818,
      note: "ألياف خشنة ونكهة خاصة وسنام دهني — للكبسة والطبخ الطويل.",
      pins: { hump: [63, 14], shoulder: [42, 38], ribs: [58, 43], leg: [83, 40] } },
    { k: "veal", n: "عجل", en: "VEAL", code: "V", ratio: 955 / 741,
      note: "لحم فاتح ناعم الألياف قليل الدهن — إسكالوب وستيك خفيف ومفروم.",
      pins: { shoulder: [30, 36], rack: [50, 28], loin: [66, 34], leg: [86, 36], shank: [35, 74] } },
    { k: "beef", n: "بقر", en: "BEEF", code: "B", ratio: 941 / 726,
      note: "دهن متداخل ونكهة عميقة — منطقة الستيك والبريسكت والمكعبات.",
      pins: { shoulder: [31, 30], rack: [48, 25], strip: [64, 22], loin: [63, 38], leg: [86, 32], breast: [30, 55], shank: [35, 74] } },
    { k: "buffalo", n: "جاموس", en: "BUFFALO", code: "U", ratio: 962 / 679,
      note: "أحمر قاتم وكثيف وقليل الدهن — يعطي أفضل ما عنده في الطبخ الطويل.",
      pins: { shoulder: [31, 33], ribs: [56, 45], leg: [86, 34], shank: [39, 76] } }
  ];
  const animal = k => ANIMALS.find(a => a.k === k);

  /* ================= أشكال التقطيع (مجانية) ================= */
  const PREPS = {
    whole: { n: "قطعة كاملة", d: "كما هي بدون تقطيع" },
    kabsa: { n: "قطع كبسة", d: "قطع كبيرة بالعظم" },
    mandi: { n: "قطع مندي", d: "أنصاف وأرباع كبيرة" },
    stew: { n: "قطع مرق", d: "قطع متوسطة للقدر" },
    cubes: { n: "مكعبات أوصال", d: "3 سم للشوي والتسييخ", skew: true },
    slices: { n: "شرائح", d: "رفيعة للشوي السريع", skew: true },
    steaks: { n: "ستيك", d: "شرائح سميكة 2.5 سم" },
    chops: { n: "ريش مفرّقة", d: "كل ضلع لوحده" },
    rack: { n: "رف كامل", d: "الأضلاع متصلة" },
    mince: { n: "مفروم", d: "فرم متوسط" },
    kebab: { n: "كباب", d: "مفروم بدهن للشوي", skew: true },
    escalope: { n: "إسكالوب", d: "شرائح مطروقة رفيعة" },
    osso: { n: "حلقات", d: "مقطّعة عرضياً بالعظم" }
  };

  /* ================= الإضافات المدفوعة ================= */
  const MARINADES = [
    { k: "none", n: "بدون تتبيل", d: "لحم خام كما هو", p: 0 },
    { k: "classic", n: "كلاسيكي", d: "ملح، فلفل أسود، بصل", p: 8 },
    { k: "hot", n: "مشاوي حار", d: "بابريكا، شطة، ثوم", p: 10 },
    { k: "herb", n: "ليمون وأعشاب", d: "ليمون، زعتر، روزماري", p: 10 },
    { k: "yogurt", n: "زبادي وبهارات", d: "زبادي، كمون، كزبرة، هيل", p: 12 }
  ];
  const marinade = k => MARINADES.find(m => m.k === k) || MARINADES[0];
  const SERVICES = {
    skewer: { n: "تسييخ جاهز", d: "نركّبها على أسياخ خشب", p: 6 },      /* لكل كجم */
    vacuum: { n: "تغليف مفرّغ", d: "كل وجبة في كيس مفرّغ من الهواء", p: 3, carcass: 35 } /* لكل كجم · للذبيحة مبلغ ثابت */
  };

  /* أساليب تقطيع الذبيحة (مجانية) */
  const STYLES = [
    { k: "fridge", n: "تقطيع ثلاجة", d: "قطع متوسطة مقسّمة على أكياس" },
    { k: "kabsa", n: "تقطيع كبسة", d: "قطع كبيرة بالعظم" },
    { k: "mandi", n: "تقطيع مندي", d: "أنصاف وأرباع" },
    { k: "mixed", n: "حسب الطبخة", d: "فخذ للفرن، ريش للشوي، والباقي كبسة" },
    { k: "whole", n: "بدون تقطيع", d: "كاملة للمظبي أو القوزي" }
  ];
  const style = k => STYLES.find(s => s.k === k) || STYLES[0];

  /* ================= الاستخدامات ================= */
  const USES = {
    grill: { n: "مشاوي", ic: "flame" },
    kabsa: { n: "كبسة ومندي", ic: "pot" },
    steak: { n: "ستيك", ic: "pan" },
    slow: { n: "طبخ بطيء ومرق", ic: "clock" },
    oven: { n: "فرن", ic: "oven" },
    mince: { n: "مفروم وكباب", ic: "grid" }
  };

  /* ================= المنتجات =================
     sold: kg (بالكيلو) · carcass (ذبيحة بالحجم) · piece (بالحبة)
     spec: [طراوة، دهن، نكهة] من 5 */
  const PRODUCTS = [];
  const cut = (id, a, n, zone, price, preps, uses, o) => PRODUCTS.push(Object.assign({
    id, animal: a, name: n, zone, sold: "kg", price, preps, prepDef: preps[0], uses, min: 0.5, step: 0.5, def: 1
  }, o));

  /* ---------- ضأن ---------- */
  PRODUCTS.push(
    { id: "lamb-whole", animal: "lamb", name: "ذبيحة ضأن كاملة", sold: "carcass", uses: ["kabsa", "grill", "oven"],
      sizes: [{ k: "s", l: "صغيرة", kg: 12, p: 1150 }, { k: "m", l: "وسط", kg: 15, p: 1390 }, { k: "l", l: "كبيرة", kg: 19, p: 1690 }], sizeDef: "m",
      short: "تُقطّع مجاناً على طبختك", spec: [3, 3, 4],
      info: "الوزن المذكور وزن الذبيحة بعد التجهيز تقريباً. التقطيع والتكييس مجاني بالطريقة اللي تختارها." },
    { id: "lamb-half", animal: "lamb", name: "نصف ذبيحة ضأن", sold: "carcass", uses: ["kabsa", "grill"],
      sizes: [{ k: "s", l: "صغيرة", kg: 6, p: 620 }, { k: "m", l: "وسط", kg: 7.5, p: 750 }, { k: "l", l: "كبيرة", kg: 9.5, p: 910 }], sizeDef: "m",
      short: "فخذ وكتف وريش ورقبة", spec: [3, 3, 4],
      info: "نصف طولي من الذبيحة: فخذ وكتف ونصف الريش والخاصرة والصدر." },
    { id: "lamb-quarter", animal: "lamb", name: "ربع ذبيحة ضأن", sold: "carcass", uses: ["kabsa", "oven"],
      sizes: [{ k: "s", l: "صغيرة", kg: 3, p: 330 }, { k: "m", l: "وسط", kg: 3.8, p: 400 }, { k: "l", l: "كبيرة", kg: 4.7, p: 485 }], sizeDef: "m",
      parts: [{ k: "front", l: "أمامي", d: "كتف ورقبة وصدر" }, { k: "hind", l: "خلفي", d: "فخذ وخاصرة" }],
      short: "أمامي أو خلفي", spec: [3, 3, 4],
      info: "الأمامي أغنى بالدهن والنكهة للكبسة، والخلفي ألحم للفرن والمندي." }
  );
  cut("lamb-neck", "lamb", "رقبة ضأن", "neck", 55, ["osso", "stew", "whole"], ["slow", "kabsa"], { bone: true, spec: [1, 3, 5],
    short: "أغنى قطعة للمرق", info: "عضلة تعمل طوال اليوم فنسيجها الضام كثيف — يتحول مع الطبخ الطويل إلى مرق غني وقوام حريري." });
  cut("lamb-shoulder", "lamb", "كتف ضأن", "shoulder", 72, ["kabsa", "whole", "cubes", "mince"], ["kabsa", "grill", "slow"], { bone: true, spec: [3, 3, 4],
    short: "دهن داخلي ونكهة غنية", info: "دهن موزّع بين الألياف يجعله أغنى نكهة من الفخذ. بالعظم للكبسة والمندي، ومكعبات للأوصال." });
  cut("lamb-rack", "lamb", "ريش ضأن", "rack", 98, ["chops", "rack"], ["grill", "oven"], { bone: true, spec: [4, 4, 4],
    short: "طرية بدهن خارجي", info: "عضلة قليلة الحركة بين الأضلاع مغطاة بدهن يذوب على الجمر ويبلّل اللحم — نجمة المشاوي." });
  cut("lamb-loin", "lamb", "خاصرة ضأن", "loin", 88, ["steaks", "cubes"], ["grill", "steak"], { spec: [5, 3, 3],
    short: "أطرى قطعة في الذبيحة", info: "أقل عضلة حركة في الذبيحة. تحب الحرارة العالية والوقت القصير — لا تطوّل عليها." });
  cut("lamb-leg", "lamb", "فخذ ضأن", "leg", 76, ["whole", "kabsa", "cubes", "slices", "mince"], ["oven", "kabsa", "grill"], { bone: true, spec: [3, 2, 3],
    short: "لحم كثير ودهن أقل", info: "عضلة كبيرة قليلة الدهن: كاملة للفرن والمندي، ومكعبات أو شرائح للمشاوي." });
  cut("lamb-shank", "lamb", "موزة ضأن", "shank", 70, ["whole", "osso"], ["slow"], { bone: true, spec: [2, 2, 5],
    short: "تنفصل عن العظم بالطبخ البطيء", info: "كولاجين عالٍ يتحول مع 3 ساعات على نار هادئة إلى لحم ينفصل عن العظم بالملعقة." });
  cut("lamb-breast", "lamb", "صدر وضلوع ضأن", "breast", 52, ["whole", "stew"], ["slow", "grill"], { bone: true, spec: [2, 5, 4],
    short: "طبقات لحم ودهن", info: "طبقات دهن ولحم بين أضلاع رفيعة — تذوب بالحرارة المنخفضة أو تتحمّر على الفحم الهادئ." });
  cut("lamb-mince", "lamb", "مفروم ضأن", null, 65, ["mince", "kebab"], ["mince", "grill"], { spec: [3, 4, 4],
    short: "للكباب والكفتة", info: "من الكتف والصدر بنسبة دهن تمسك الكباب على السيخ وتبقيه طرياً." });
  cut("lamb-liver", "lamb", "كبدة ضأن", null, 45, ["slices", "cubes"], ["grill"], { spec: [4, 1, 4],
    short: "للفطور والمشاوي", info: "تُطبخ بسرعة على نار عالية. الطبخ الزائد يجعلها قاسية — دقيقتان لكل جهة تكفي." });

  /* ---------- ماعز ---------- */
  PRODUCTS.push(
    { id: "goat-whole", animal: "goat", name: "ذبيحة ماعز كاملة", sold: "carcass", uses: ["kabsa", "grill"],
      sizes: [{ k: "s", l: "صغيرة", kg: 9, p: 850 }, { k: "m", l: "وسط", kg: 12, p: 1050 }, { k: "l", l: "كبيرة", kg: 15, p: 1250 }], sizeDef: "m",
      short: "تُقطّع مجاناً على طبختك", spec: [3, 2, 5],
      info: "لحم أقل دهناً من الضأن ونكهته أوضح. الوزن تقريبي بعد التجهيز والتقطيع مجاني." },
    { id: "goat-half", animal: "goat", name: "نصف ذبيحة ماعز", sold: "carcass", uses: ["kabsa"],
      sizes: [{ k: "s", l: "صغيرة", kg: 4.5, p: 460 }, { k: "m", l: "وسط", kg: 6, p: 570 }, { k: "l", l: "كبيرة", kg: 7.5, p: 680 }], sizeDef: "m",
      short: "فخذ وكتف وريش", spec: [3, 2, 5],
      info: "نصف طولي: فخذ وكتف ونصف الريش والرقبة." }
  );
  cut("goat-shoulder", "goat", "كتف ماعز", "shoulder", 68, ["kabsa", "whole", "cubes"], ["kabsa", "slow"], { bone: true, spec: [3, 2, 5],
    short: "للمندي والمظبي", info: "أغنى أجزاء الماعز بالنكهة، ودهنه قليل فيحتاج طبخاً هادئاً أو تتبيلة ترطّبه." });
  cut("goat-leg", "goat", "فخذ ماعز", "leg", 72, ["whole", "kabsa", "cubes"], ["kabsa", "oven", "grill"], { bone: true, spec: [3, 1, 4],
    short: "ألحم قطعة في الماعز", info: "لحم كثير ودهن قليل: كامل للمندي، ومكعبات للأوصال مع تتبيلة زبادي." });
  cut("goat-rack", "goat", "ريش ماعز", "rack", 88, ["chops", "rack"], ["grill"], { bone: true, spec: [4, 2, 4],
    short: "ريش قليلة الدهن", info: "أخف دهناً من ريش الضأن — تُشوى أسرع وتستفيد من التتبيل." });
  cut("goat-neck", "goat", "رقبة ماعز", "neck", 52, ["osso", "stew"], ["slow"], { bone: true, spec: [1, 2, 5],
    short: "للمرق والإيدام", info: "حلقات بالعظم تعطي مرقاً قوياً مع ساعتين ونصف على نار هادئة." });
  cut("goat-mince", "goat", "مفروم ماعز", null, 62, ["mince", "kebab"], ["mince"], { spec: [3, 2, 5],
    short: "مفروم قليل الدهن", info: "مفروم نكهته واضحة ودهنه قليل — يُنصح بإضافة سنام أو دهن للكباب." });

  /* ---------- حاشي ---------- */
  cut("camel-bone", "camel", "حاشي بالعظم", "shoulder", 58, ["kabsa", "mandi", "stew"], ["kabsa", "slow"], { bone: true, spec: [2, 2, 4],
    short: "للكبسة والمندي", info: "قطع كبيرة بالعظم تحتاج طبخاً أطول من الضأن بنحو نصف ساعة إلى ساعة." });
  cut("camel-leg", "camel", "فخذ حاشي", "leg", 64, ["whole", "cubes", "slices"], ["kabsa", "grill", "oven"], { spec: [3, 1, 4],
    short: "لحم أحمر بلا عظم", info: "ألياف خشنة قليلة الدهن — التتبيل الحمضي والشرائح الرفيعة يطرّيانه للمشاوي." });
  cut("camel-ribs", "camel", "ضلوع حاشي", "ribs", 60, ["whole", "stew"], ["slow", "kabsa"], { bone: true, spec: [2, 3, 4],
    short: "ضلوع بطبقة دهن", info: "عظام طويلة ولحم بطبقة دهن — للطبخ الطويل أو الفرن المغطى." });
  cut("camel-hump", "camel", "سنام حاشي", "hump", 45, ["whole", "cubes"], ["grill", "mince"], { spec: [3, 5, 3],
    short: "دهن نقي للكباب والطبخ", info: "دهن أبيض كثيف يُضاف للمفروم والكباب أو يُذوّب للطبخ." });
  cut("camel-mince", "camel", "مفروم حاشي", null, 56, ["mince", "kebab"], ["mince"], { spec: [2, 2, 4],
    short: "مفروم أحمر قليل الدهن", info: "نكهة مميزة ودهن قليل — امزجه بالسنام لكباب أطرى." });
  cut("camel-liver", "camel", "كبدة حاشي", null, 52, ["slices", "cubes"], ["grill"], { spec: [3, 1, 4],
    short: "للمشاوي والفطور", info: "أكبر وأقوى نكهة من كبدة الضأن. تُقطّع رفيعة وتُشوى بسرعة." });

  /* ---------- عجل ---------- */
  cut("veal-cubes", "veal", "مكعبات كتف عجل", "shoulder", 62, ["stew", "cubes"], ["slow", "grill"], { spec: [3, 2, 3],
    short: "للقدر والأوصال", info: "مكعبات من الكتف بنسيج ناعم — تنضج في ساعة ونصف، وتنفع للأوصال مع تتبيلة." });
  cut("veal-entrecote", "veal", "انتركوت عجل", "rack", 110, ["steaks", "slices"], ["steak", "grill"], { spec: [4, 3, 3],
    short: "ستيك خفيف طري", info: "من منطقة الضلع، دهنه خفيف ونكهته هادئة — مقلاة ساخنة ودقيقتان لكل جهة." });
  cut("veal-fillet", "veal", "فيليه عجل", "loin", 140, ["whole", "steaks", "cubes"], ["steak", "grill"], { spec: [5, 1, 2],
    short: "أنعم قطعة في العجل", info: "عضلة لا تعمل تقريباً، فهي الأطرى. قطعة كاملة للفرن أو ميداليات للمقلاة." });
  cut("veal-escalope", "veal", "إسكالوب عجل", "leg", 85, ["escalope", "slices"], ["steak"], { spec: [4, 1, 2],
    short: "شرائح رفيعة جاهزة", info: "من الفخذ، مطروقة رفيعة — دقيقة لكل جهة في مقلاة ساخنة أو تُغلّف بالبقسماط." });
  cut("veal-shank", "veal", "موزة عجل", "shank", 58, ["osso", "whole"], ["slow"], { bone: true, spec: [2, 2, 4],
    short: "حلقات بالنخاع", info: "حلقات عرضية بالنخاع — ساعتان على نار هادئة ويصير اللحم كالزبدة." });
  cut("veal-mince", "veal", "مفروم عجل", null, 56, ["mince", "kebab"], ["mince", "grill"], { spec: [3, 2, 3],
    short: "مفروم فاتح متوازن", info: "مفروم خفيف الدهن للكفتة والصلصات والمحاشي." });
  cut("veal-liver", "veal", "كبدة عجل", null, 48, ["slices", "cubes"], ["grill"], { spec: [5, 1, 3],
    short: "ناعمة وطعمها هادئ", info: "أنعم من كبدة الضأن وأخف نكهة. شرائح رفيعة ونار عالية." });

  /* ---------- بقر ---------- */
  cut("beef-chuck", "beef", "كتف بقر مكعبات", "shoulder", 58, ["stew", "cubes", "mince"], ["slow", "kabsa"], { spec: [2, 3, 4],
    short: "أساس اليخنات", info: "دهن داخلي ونسيج ضام يعطي أعمق نكهة بعد ساعتين ونصف من الطبخ الهادئ." });
  cut("beef-ribeye", "beef", "ريب آي", "rack", 175, ["steaks", "whole"], ["steak", "grill"], { spec: [4, 5, 5],
    short: "أغنى ستيك بالدهن المتداخل", info: "عين الدهن في المنتصف تذوب على الحرارة العالية وتعطي نكهة لا تشبه غيرها." });
  cut("beef-striploin", "beef", "ستربلوين", "strip", 160, ["steaks", "whole", "cubes"], ["steak", "grill"], { spec: [4, 3, 4],
    short: "ستيك متماسك بحافة دهن", info: "بين الريب آي والتندرلوين: طري ومتماسك مع حافة دهن تتحمّر على الفحم." });
  cut("beef-tenderloin", "beef", "تندرلوين", "loin", 210, ["steaks", "whole", "cubes"], ["steak", "grill", "oven"], { spec: [5, 1, 3],
    short: "الأطرى في الذبيحة", info: "لا يحتاج أي تطرية — حرارة عالية وقت قصير، ولا تتجاوز النصف استواء." });
  cut("beef-topside", "beef", "توب سايد", "leg", 62, ["whole", "slices", "escalope"], ["oven", "steak"], { spec: [2, 1, 3],
    short: "روست قليل الدهن", info: "من الفخذ الخلفي: قطعة كاملة للفرن تُقطّع رفيعة، أو شرائح للشاورما." });
  cut("beef-brisket", "beef", "بريسكت", "breast", 72, ["whole", "stew"], ["slow", "oven"], { spec: [2, 4, 5],
    short: "للتدخين والطبخ الطويل", info: "ألياف طويلة وطبقة دهن — 6 ساعات على حرارة منخفضة تحوّله لقطعة تذوب." });
  cut("beef-shank", "beef", "موزة بقر", "shank", 55, ["osso"], ["slow"], { bone: true, spec: [1, 2, 5],
    short: "حلقات للمرق", info: "نخاع وكولاجين — أغنى مرق بقري، وتحتاج 3 ساعات على الأقل." });
  cut("beef-mince", "beef", "مفروم بقر", null, 49, ["mince", "kebab"], ["mince", "grill"], { spec: [3, 3, 4],
    short: "للبرجر والكفتة", info: "نسبة دهن تمسك البرجر وتبقيه عصيراً. للبرجر اطلب الفرم الخشن في الملاحظات." });

  /* ---------- جاموس ---------- */
  cut("buffalo-cubes", "buffalo", "كتف جاموس مكعبات", "shoulder", 52, ["stew", "cubes"], ["slow"], { spec: [2, 2, 4],
    short: "للطواجن والقدر", info: "لحم كثيف قليل الدهن يحتاج طبخاً طويلاً وهادئاً — ساعتان ونصف على الأقل." });
  cut("buffalo-ribs", "buffalo", "ضلوع جاموس", "ribs", 44, ["whole", "stew"], ["slow", "oven"], { bone: true, spec: [2, 3, 4],
    short: "ضلوع للطبخ الطويل", info: "عظام عريضة ولحم داكن بطبقات دهن — للفرن المغطى أو المرق." });
  cut("buffalo-leg", "buffalo", "فخذ جاموس", "leg", 58, ["whole", "slices", "stew"], ["slow", "oven"], { spec: [2, 1, 4],
    short: "لحم أحمر قاتم بلا عظم", info: "كثيف جداً وقليل الدهن: شرائح رفيعة مع تتبيلة، أو قطعة كاملة مغطاة في الفرن." });
  cut("buffalo-shank", "buffalo", "موزة جاموس", "shank", 48, ["osso"], ["slow"], { bone: true, spec: [1, 2, 5],
    short: "حلقات بالنخاع للمرق", info: "حلقات كبيرة بالنخاع — مرق قوي ولحم ينفصل بعد 3 ساعات." });
  cut("buffalo-mince", "buffalo", "مفروم جاموس", null, 46, ["mince", "kebab"], ["mince"], { spec: [2, 2, 4],
    short: "مفروم قليل الدهن", info: "مفروم داكن اقتصادي للصلصات والمحاشي والكفتة المطبوخة." });

  /* ---------- إضافات الشوي والتتبيل (بالحبة) ---------- */
  const extra = (id, n, price, unitName, short, info) => PRODUCTS.push({ id, animal: "extra", name: n, sold: "piece", price, unitName, short, info, uses: ["grill"] });
  extra("charcoal", "فحم طبيعي 3 كجم", 22, "كيس", "يكفي لشوي 4.5 كجم لحم تقريباً", "فحم خشب طبيعي بقطع كبيرة. كيس 3 كجم يكفي لنحو 4.5 كجم لحم.");
  extra("starters", "مكعبات إشعال", 8, "علبة", "تشعل الفحم بلا كيروسين", "مكعبات إشعال تُوضع تحت الفحم وتشتعل خلال دقائق.");
  extra("skewers", "أسياخ ستيل · 10", 25, "طقم", "طقم 10 أسياخ مسطّحة", "أسياخ ستيل مسطّحة تمسك الأوصال والكباب — تُغسل وتُستخدم مرة ثانية.");
  extra("trays", "صواني ألمنيوم · 5", 15, "طقم", "للتقديم والتتبيل", "5 صواني ألمنيوم مستطيلة للتتبيل والتقديم والشوي في الفرن.");
  extra("spice-kabsa", "بهارات كبسة 100 جم", 12, "كيس", "خلطة كاملة حبّ ومطحون", "هيل، قرنفل، قرفة، فلفل أسود، ليمون أسود وورق غار — تكفي نحو 3 كجم لحم.");
  extra("spice-mandi", "بهارات مندي 100 جم", 12, "كيس", "خلطة ذهبية بالكركم", "كركم، كمون، كزبرة، هيل وليمون أسود — تكفي نحو 3 كجم لحم.");
  extra("spice-grill", "بهارات مشاوي 100 جم", 12, "كيس", "بابريكا مدخّنة وشطة", "بابريكا مدخّنة، شطة، ثوم، فلفل أسود وأوريجانو — تكفي نحو 3 كجم لحم.");

  const byId = id => PRODUCTS.find(p => p.id === id);
  /* أكواد القطعيات: L-01، B-03… حسب ترتيب الماشية */
  ANIMALS.forEach(a => { PRODUCTS.filter(p => p.animal === a.k).forEach((p, i) => { p.code = a.code + "-" + String(i + 1).padStart(2, "0"); }); });
  PRODUCTS.filter(p => p.animal === "extra").forEach((p, i) => { p.code = "X-" + String(i + 1).padStart(2, "0"); });
  const cutsOf = k => PRODUCTS.filter(p => p.animal === k);
  const carcasses = () => PRODUCTS.filter(p => p.sold === "carcass");
  const extras = () => PRODUCTS.filter(p => p.animal === "extra");

  /* أسماء مناطق الذبيحة (لنقاط المخطط) */
  const ZONES = { neck: "الرقبة", shoulder: "الكتف", rack: "الريش / الضلع", loin: "الخاصرة", strip: "الظهر", leg: "الفخذ", breast: "الصدر", shank: "الموزة", ribs: "الضلوع", hump: "السنام" };

  /* ================= المستشار =================
     كل مناسبة سلسلة أسئلة، والنتيجة فاتورة بالجرام والسعر.
     الكميات للحم النيء للشخص الواحد (بالعظم أثقل لأن العظم لا يؤكل). */
  const ADVISOR = {
    grams: { grill: 350, grillBone: 450, kabsa: 450, kabsaBoneless: 320, stew: 250, steak: 300, oven: 400, dailyDay: 150 },
    charcoalKgPerBag: 4.5,  /* كيس فحم 3 كجم يشوي نحو 4.5 كجم لحم */
    skewerKgPerSet: 1.2,    /* طقم 10 أسياخ ≈ 1.2 كجم لحم */
    spiceKgPerPack: 3,      /* كيس بهارات 100 جم ≈ 3 كجم لحم */
    trayPeoplePerSet: 10,
    occasions: [
      { k: "grill", n: "حفلة مشاوي", s: "أوصال، كباب، ريش…", img: "occ-grill", ic: "flame" },
      { k: "feast", n: "عزومة أو وليمة", s: "كبسة، مندي، مرق", img: "occ-feast", ic: "pot" },
      { k: "carcass", n: "ذبيحة كاملة", s: "نحسب لك الحجم والتقطيع", img: "occ-carcass", ic: "knife" },
      { k: "steak", n: "عشاء ستيك", s: "ريب آي، تندرلوين…", img: "occ-steak", ic: "pan" },
      { k: "weekly", n: "طبخ الأسبوع", s: "مقاضي البيت مقسّمة", img: "occ-weekly", ic: "calendar" },
      { k: "ask", n: "سؤال عن قطعة", s: "وش تنفع له وكم أحتاج", ic: "help" }
    ],
    /* أشكال الشوي — لكل ماشية القطعة المناسبة */
    grillForms: [
      { k: "cubes", n: "قطع (أوصال)", d: "مكعبات 3 سم على السيخ", prep: "cubes", skew: true,
        pick: { lamb: "lamb-shoulder", goat: "goat-leg", camel: "camel-leg", veal: "veal-cubes", beef: "beef-striploin" } },
      { k: "slices", n: "شرائح", d: "رفيعة وتنشوى بسرعة", prep: "slices", skew: true,
        pick: { lamb: "lamb-leg", camel: "camel-leg", veal: "veal-entrecote", beef: "beef-topside", buffalo: "buffalo-leg" } },
      { k: "whole", n: "قطع سليمة", d: "ريش وستيك كامل على الشواية", bone: true,
        pick: { lamb: ["lamb-rack", "chops"], goat: ["goat-rack", "chops"], veal: ["veal-entrecote", "steaks"], beef: ["beef-ribeye", "steaks"] } },
      { k: "kebab", n: "كباب", d: "مفروم بالدهن على السيخ", prep: "kebab", skew: true,
        pick: { lamb: "lamb-mince", goat: "goat-mince", camel: "camel-mince", veal: "veal-mince", beef: "beef-mince", buffalo: "buffalo-mince" } },
      { k: "liver", n: "كبدة", d: "شرائح أو مكعبات", prep: "cubes", skew: true,
        pick: { lamb: "lamb-liver", camel: "camel-liver", veal: "veal-liver" } }
    ],
    dishes: [
      { k: "kabsa", n: "كبسة", spice: "spice-kabsa", animals: ["lamb", "camel", "goat", "veal"] },
      { k: "mandi", n: "مندي", spice: "spice-mandi", animals: ["lamb", "goat", "camel"] },
      { k: "marag", n: "مرق وإيدام", spice: null, animals: ["lamb", "veal", "beef", "goat", "buffalo", "camel"] },
      { k: "oven", n: "فخذ أو كتف بالفرن", spice: null, animals: ["lamb", "goat"] }
    ],
    /* القطعة لكل طبق وماشية: [المنتج، شكل التقطيع] */
    dishPick: {
      kabsa: { lamb: ["lamb-shoulder", "kabsa"], goat: ["goat-shoulder", "kabsa"], camel: ["camel-bone", "kabsa"], veal: ["veal-cubes", "stew"] },
      mandi: { lamb: ["lamb-leg", "kabsa"], goat: ["goat-leg", "kabsa"], camel: ["camel-bone", "mandi"] },
      marag: { lamb: ["lamb-neck", "osso"], goat: ["goat-neck", "osso"], veal: ["veal-shank", "osso"], beef: ["beef-chuck", "stew"], buffalo: ["buffalo-cubes", "stew"], camel: ["camel-ribs", "stew"] },
      oven: { lamb: ["lamb-leg", "whole"], goat: ["goat-leg", "whole"] }
    },
    boneless: { kabsa: { lamb: ["lamb-leg", "cubes"], goat: ["goat-leg", "cubes"], camel: ["camel-leg", "cubes"], veal: ["veal-cubes", "stew"] },
      mandi: { lamb: ["lamb-leg", "cubes"], goat: ["goat-leg", "cubes"], camel: ["camel-leg", "cubes"] } },
    steaks: ["beef-ribeye", "beef-striploin", "beef-tenderloin", "veal-entrecote", "veal-fillet", "lamb-loin"],
    weekly: [
      { k: "mince", n: "مفروم", pick: { lamb: "lamb-mince", veal: "veal-mince", beef: "beef-mince", camel: "camel-mince", goat: "goat-mince", buffalo: "buffalo-mince" }, prep: "mince" },
      { k: "stew", n: "قطع مرق", pick: { lamb: "lamb-neck", veal: "veal-cubes", beef: "beef-chuck", camel: "camel-ribs", goat: "goat-neck", buffalo: "buffalo-cubes" }, prep: "stew" },
      { k: "bone", n: "قطع بالعظم", pick: { lamb: "lamb-shoulder", veal: "veal-shank", beef: "beef-shank", camel: "camel-bone", goat: "goat-shoulder", buffalo: "buffalo-ribs" }, prep: "kabsa" },
      { k: "steak", n: "ستيك وشرائح", pick: { lamb: "lamb-loin", veal: "veal-escalope", beef: "beef-striploin", camel: "camel-leg", goat: "goat-leg", buffalo: "buffalo-leg" }, prep: "slices" },
      { k: "liver", n: "كبدة", pick: { lamb: "lamb-liver", veal: "veal-liver", camel: "camel-liver" }, prep: "slices" }
    ]
  };

  /* ================= أسئلة شائعة ================= */
  const FAQ = [
    ["هل التقطيع مجاني؟", "نعم. أي شكل تقطيع تختاره (قطع كبسة، مكعبات، شرائح، ستيك، مفروم…) بدون رسوم. المدفوع فقط: التتبيل، التسييخ، والتغليف المفرّغ — وأسعارها واضحة قبل الإضافة."],
    ["كيف يحسب المستشار الكميات؟", "بالجرام للشخص حسب المناسبة: 350 جم للمشاوي بدون عظم، 450 جم للكبسة والمندي بالعظم، 300 جم للستيك، و250 جم للمرق. ويقرّب لأقرب نصف كيلو. يمكنك تعديل أي رقم قبل الطلب."],
    ["هل أستطيع تعديل خطة المستشار؟", "نعم، اضغط على أي إجابة سابقة في المحادثة لتغييرها، أو عدّل الأوزان من السلة. الخطة تبقى محفوظة في حسابك."],
    ["كيف يوصل اللحم؟", "[يُضاف وصف آلية التبريد والتوصيل الفعلية]. رسوم التوصيل 25 ر.س، ومجاني للطلبات من 300 ر.س."],
    ["هل الأسعار شاملة الضريبة؟", "نعم، كل الأسعار شاملة ضريبة القيمة المضافة 15٪، وتظهر قيمة الضريبة منفصلة في الفاتورة."],
    ["هل أستطيع إلغاء الطلب؟", "يمكن إلغاء الطلب من صفحة الطلب قبل بدء تجهيزه. [تُضاف سياسة الاسترجاع الفعلية]."]
  ];

  return { CONFIG, IMAGES, ANIMALS, animal, PREPS, MARINADES, marinade, SERVICES, STYLES, style, USES, PRODUCTS, byId, cutsOf, carcasses, extras, ZONES, ADVISOR, FAQ };
})();
