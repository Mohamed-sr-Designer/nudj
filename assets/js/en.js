/* =========================================================
   NUDJ — English content
   Adds an "_en" twin next to every Arabic text in data.js (name → name_en…).
   Loaded on /en/ pages and in the dashboard (which edits these twins).
   On /en/ pages, data.js swaps the twins in (NUDJ.localize).
   Anything written in [brackets] is a placeholder to replace before launch.
   ========================================================= */
(function (D) {
  "use strict";
  if (!D) return;

  const EN = {
    CONFIG: {
      currency: "SAR",
      coupons: { NUDJ10: { label: "10% off meat" } },
      cities: ["Riyadh", "Jeddah", "Dammam", "Khobar", "Makkah", "Madinah"],
      windows: [{ l: "9 am – 12 pm" }, { l: "12 – 3 pm" }, { l: "3 – 6 pm" }, { l: "6 – 9 pm" }],
      payments: {
        applepay: { s: "Pay with Face ID or Touch ID" },
        mada: { n: "mada", s: "mada bank card" },
        card: { n: "Credit card", s: "Visa or Mastercard" },
        tamara: { n: "Tamara", s: "Split into 4 payments" },
        cod: { n: "Cash on delivery", s: "Cash or card on delivery" }
      },
      contact: {
        phone: "[Unified number]", whatsapp: "[WhatsApp number]", email: "[Email address]",
        city: "[City]", address: "[Address]", cr: "[Commercial registration no.]", vatNo: "[VAT number]",
        hours: "[Opening hours]"
      }
    },

    ANIMALS: {
      lamb: { n: "Lamb", note: "Pink meat with balanced white fat — the backbone of kabsa, mandi and the grill." },
      goat: { n: "Goat", note: "Dark red, lean and bolder in flavour — a favourite for mandi and mathbi." },
      camel: { n: "Camel", note: "Coarse fibres, a distinctive flavour and a fatty hump — for kabsa and long cooking." },
      veal: { n: "Veal", note: "Pale, fine-grained and lean — escalope, light steaks and mince." },
      beef: { n: "Beef", note: "Marbled fat and deep flavour — home of steak, brisket and stewing cubes." },
      buffalo: { n: "Buffalo", note: "Deep red, dense and lean — at its best in long, slow cooking." }
    },

    PREPS: {
      whole: { n: "Whole piece", d: "As is, uncut" },
      kabsa: { n: "Kabsa pieces", d: "Large bone-in pieces" },
      mandi: { n: "Mandi pieces", d: "Large halves and quarters" },
      stew: { n: "Stew pieces", d: "Medium pieces for the pot" },
      cubes: { n: "Skewer cubes", d: "3 cm, for grilling and skewers" },
      slices: { n: "Slices", d: "Thin, for quick grilling" },
      steaks: { n: "Steaks", d: "Thick 2.5 cm cuts" },
      chops: { n: "Separate chops", d: "Each rib on its own" },
      rack: { n: "Whole rack", d: "Ribs left joined" },
      mince: { n: "Mince", d: "Medium grind" },
      kebab: { n: "Kebab", d: "Minced with fat for grilling" },
      escalope: { n: "Escalope", d: "Thin, pounded slices" },
      osso: { n: "Rounds", d: "Cross-cut through the bone" }
    },

    MARINADES: {
      none: { n: "No marinade", d: "Raw meat as it is" },
      classic: { n: "Classic", d: "Salt, black pepper, onion" },
      hot: { n: "Hot grill", d: "Paprika, chilli, garlic" },
      herb: { n: "Lemon & herbs", d: "Lemon, thyme, rosemary" },
      yogurt: { n: "Yoghurt & spice", d: "Yoghurt, cumin, coriander, cardamom" }
    },

    SERVICES: {
      skewer: { n: "Ready skewered", d: "We thread it onto wooden skewers" },
      vacuum: { n: "Vacuum packing", d: "Each meal in its own vacuum-sealed bag" }
    },

    STYLES: {
      fridge: { n: "Freezer cut", d: "Medium pieces split into bags" },
      kabsa: { n: "Kabsa cut", d: "Large bone-in pieces" },
      mandi: { n: "Mandi cut", d: "Halves and quarters" },
      mixed: { n: "By dish", d: "Legs for the oven, ribs for the grill, the rest for kabsa" },
      whole: { n: "Uncut", d: "Whole, for mathbi or quzi" }
    },

    USES: {
      grill: { n: "Grill" }, kabsa: { n: "Kabsa & mandi" }, steak: { n: "Steak" },
      slow: { n: "Slow cooking & broth" }, oven: { n: "Oven" }, mince: { n: "Mince & kebab" }
    },

    ZONES: { neck: "Neck", shoulder: "Shoulder", rack: "Rack / rib", loin: "Loin", strip: "Strip", leg: "Leg", breast: "Breast", shank: "Shank", ribs: "Ribs", hump: "Hump" },

    PRODUCTS: {
      /* ---------- lamb ---------- */
      "lamb-whole": { name: "Whole lamb carcass", short: "Cut free to suit your dish",
        info: "The weight shown is the approximate dressed weight. Cutting and bagging are free, the way you choose." },
      "lamb-half": { name: "Half lamb carcass", short: "Leg, shoulder, ribs and neck",
        info: "A lengthwise half of the carcass: leg, shoulder, half the rack, the loin and the breast." },
      "lamb-quarter": { name: "Lamb quarter", short: "Front or hind",
        parts: { front: { l: "Front", d: "Shoulder, neck and breast" }, hind: { l: "Hind", d: "Leg and loin" } },
        info: "The front quarter is richer in fat and flavour for kabsa; the hind quarter is leaner for the oven and mandi." },
      "lamb-neck": { name: "Lamb neck", short: "The richest cut for broth",
        info: "A muscle that works all day, so its connective tissue is dense — long cooking turns it into a rich broth with a silky texture." },
      "lamb-shoulder": { name: "Lamb shoulder", short: "Marbled fat, rich flavour",
        info: "Fat running between the fibres makes it more flavourful than the leg. Bone-in for kabsa and mandi, cubed for skewers." },
      "lamb-rack": { name: "Lamb rack", short: "Tender, with an outer fat cap",
        info: "A little-used muscle between the ribs, capped with fat that melts over the coals and bastes the meat — the star of any grill." },
      "lamb-loin": { name: "Lamb loin", short: "The most tender cut on the carcass",
        info: "The least-worked muscle on the carcass. It loves high heat and a short cook — don't leave it too long." },
      "lamb-leg": { name: "Leg of lamb", short: "Lots of meat, less fat",
        info: "A large, lean muscle: whole for the oven and mandi, cubed or sliced for the grill." },
      "lamb-shank": { name: "Lamb shank", short: "Falls off the bone when slow-cooked",
        info: "Rich in collagen, which after 3 hours over low heat becomes meat you can lift off the bone with a spoon." },
      "lamb-breast": { name: "Lamb breast & ribs", short: "Layers of meat and fat",
        info: "Layers of fat and meat between thin ribs — they melt at low heat or crisp up over gentle coals." },
      "lamb-mince": { name: "Minced lamb", short: "For kebab and kofta",
        info: "From the shoulder and breast, with enough fat to hold kebab on the skewer and keep it juicy." },
      "lamb-liver": { name: "Lamb liver", short: "For breakfast and the grill",
        info: "Cooks fast over high heat. Overcooking makes it tough — two minutes a side is enough." },

      /* ---------- goat ---------- */
      "goat-whole": { name: "Whole goat carcass", short: "Cut free to suit your dish",
        info: "Leaner than lamb with a bolder flavour. The weight is approximate after dressing, and cutting is free." },
      "goat-half": { name: "Half goat carcass", short: "Leg, shoulder and ribs",
        info: "A lengthwise half: leg, shoulder, half the rack and the neck." },
      "goat-shoulder": { name: "Goat shoulder", short: "For mandi and mathbi",
        info: "The most flavourful part of the goat. It's low in fat, so it needs gentle cooking or a marinade to keep it moist." },
      "goat-leg": { name: "Goat leg", short: "The meatiest goat cut",
        info: "Plenty of meat and little fat: whole for mandi, cubed for skewers with a yoghurt marinade." },
      "goat-rack": { name: "Goat rack", short: "Lean ribs",
        info: "Leaner than lamb rack — it grills faster and benefits from a marinade." },
      "goat-neck": { name: "Goat neck", short: "For broth and stews",
        info: "Bone-in rounds that give a strong broth after two and a half hours over low heat." },
      "goat-mince": { name: "Minced goat", short: "Lean mince",
        info: "A flavourful mince with little fat — add hump fat or other fat for kebab." },

      /* ---------- camel ---------- */
      "camel-bone": { name: "Bone-in camel", short: "For kabsa and mandi",
        info: "Large bone-in pieces that need 30 minutes to an hour longer than lamb." },
      "camel-leg": { name: "Camel leg", short: "Boneless red meat",
        info: "Coarse, lean fibres — an acidic marinade and thin slices make it tender enough for the grill." },
      "camel-ribs": { name: "Camel ribs", short: "Ribs with a layer of fat",
        info: "Long bones and meat under a layer of fat — for long cooking or a covered oven." },
      "camel-hump": { name: "Camel hump", short: "Pure fat for kebab and cooking",
        info: "Dense white fat, added to mince and kebab or rendered down for cooking." },
      "camel-mince": { name: "Minced camel", short: "Lean red mince",
        info: "A distinctive flavour and little fat — mix it with hump fat for a juicier kebab." },
      "camel-liver": { name: "Camel liver", short: "For the grill and breakfast",
        info: "Larger and stronger in flavour than lamb liver. Slice it thin and grill it fast." },

      /* ---------- veal ---------- */
      "veal-cubes": { name: "Veal shoulder cubes", short: "For the pot and skewers",
        info: "Shoulder cubes with a fine texture — tender in an hour and a half, and good on skewers with a marinade." },
      "veal-entrecote": { name: "Veal entrecôte", short: "A light, tender steak",
        info: "From the rib section, lightly marbled with a mild flavour — a hot pan and two minutes a side." },
      "veal-fillet": { name: "Veal fillet", short: "The finest cut of veal",
        info: "A muscle that barely works, so it's the most tender. Whole for the oven, or medallions for the pan." },
      "veal-escalope": { name: "Veal escalope", short: "Thin slices, ready to cook",
        info: "From the leg, pounded thin — a minute a side in a hot pan, or breaded." },
      "veal-shank": { name: "Veal shank", short: "Rounds with marrow",
        info: "Cross-cut rounds with the marrow — two hours over low heat and the meat turns buttery." },
      "veal-mince": { name: "Minced veal", short: "Light, balanced mince",
        info: "A lean mince for kofta, sauces and stuffed vegetables." },
      "veal-liver": { name: "Veal liver", short: "Delicate and mild",
        info: "Softer and milder than lamb liver. Thin slices and high heat." },

      /* ---------- beef ---------- */
      "beef-chuck": { name: "Beef chuck cubes", short: "The base of any stew",
        info: "Internal fat and connective tissue give the deepest flavour after two and a half hours of gentle cooking." },
      "beef-ribeye": { name: "Ribeye", short: "The richest marbled steak",
        info: "The eye of fat in the centre melts over high heat and gives a flavour like no other." },
      "beef-striploin": { name: "Striploin", short: "A firm steak with a fat edge",
        info: "Between ribeye and tenderloin: tender yet firm, with a fat edge that crisps over the coals." },
      "beef-tenderloin": { name: "Tenderloin", short: "The most tender cut on the carcass",
        info: "Needs no tenderising — high heat, a short cook, and no further than medium." },
      "beef-topside": { name: "Topside", short: "A lean roasting joint",
        info: "From the hind leg: a whole joint for the oven, carved thin, or slices for shawarma." },
      "beef-brisket": { name: "Brisket", short: "For smoking and long cooking",
        info: "Long fibres and a layer of fat — 6 hours at low heat turn it into a piece that melts." },
      "beef-shank": { name: "Beef shank", short: "Rounds for broth",
        info: "Marrow and collagen — the richest beef broth, and it needs at least 3 hours." },
      "beef-mince": { name: "Minced beef", short: "For burgers and kofta",
        info: "Enough fat to hold a burger together and keep it juicy. For burgers, ask for a coarse grind in the notes." },

      /* ---------- buffalo ---------- */
      "buffalo-cubes": { name: "Buffalo shoulder cubes", short: "For tagines and the pot",
        info: "Dense, lean meat that needs long, gentle cooking — at least two and a half hours." },
      "buffalo-ribs": { name: "Buffalo ribs", short: "Ribs for long cooking",
        info: "Wide bones and dark meat layered with fat — for a covered oven or broth." },
      "buffalo-leg": { name: "Buffalo leg", short: "Boneless, deep red meat",
        info: "Very dense and lean: thin slices with a marinade, or a whole joint covered in the oven." },
      "buffalo-shank": { name: "Buffalo shank", short: "Marrow rounds for broth",
        info: "Large rounds with marrow — a strong broth and meat that falls apart after 3 hours." },
      "buffalo-mince": { name: "Minced buffalo", short: "Lean mince",
        info: "An economical dark mince for sauces, stuffed vegetables and cooked kofta." },

      /* ---------- BBQ kit & spices ---------- */
      "charcoal": { name: "Natural charcoal 3 kg", unitName: "bag", short: "Grills about 4.5 kg of meat",
        info: "Natural wood charcoal in large pieces. A 3 kg bag grills around 4.5 kg of meat." },
      "starters": { name: "Fire starter cubes", unitName: "box", short: "Light the charcoal without kerosene",
        info: "Starter cubes go under the charcoal and catch within minutes." },
      "skewers": { name: "Steel skewers · 10", unitName: "set", short: "A set of 10 flat skewers",
        info: "Flat steel skewers that hold cubes and kebab firmly — wash and reuse." },
      "trays": { name: "Aluminium trays · 5", unitName: "set", short: "For serving and marinating",
        info: "5 rectangular aluminium trays for marinating, serving and roasting in the oven." },
      "spice-kabsa": { name: "Kabsa spice 100 g", unitName: "bag", short: "A complete whole and ground blend",
        info: "Cardamom, cloves, cinnamon, black pepper, dried lime and bay leaf — enough for about 3 kg of meat." },
      "spice-mandi": { name: "Mandi spice 100 g", unitName: "bag", short: "A golden blend with turmeric",
        info: "Turmeric, cumin, coriander, cardamom and dried lime — enough for about 3 kg of meat." },
      "spice-grill": { name: "Grill spice 100 g", unitName: "bag", short: "Smoked paprika and chilli",
        info: "Smoked paprika, chilli, garlic, black pepper and oregano — enough for about 3 kg of meat." }
    },

    ADVISOR: {
      occasions: {
        grill: { n: "BBQ party", s: "Cubes, kebab, ribs…" },
        feast: { n: "Feast or gathering", s: "Kabsa, mandi, broth" },
        carcass: { n: "Whole carcass", s: "We work out the size and cut" },
        steak: { n: "Steak dinner", s: "Ribeye, tenderloin…" },
        weekly: { n: "Weekly cooking", s: "Household meat, portioned" },
        ask: { n: "Ask about a cut", s: "What it's for, and how much I need" }
      },
      grillForms: {
        cubes: { n: "Cubes (shish)", d: "3 cm cubes on the skewer" },
        slices: { n: "Slices", d: "Thin and quick to grill" },
        whole: { n: "Whole cuts", d: "Ribs and whole steaks on the grill" },
        kebab: { n: "Kebab", d: "Mince with fat on the skewer" },
        liver: { n: "Liver", d: "Slices or cubes" }
      },
      dishes: { kabsa: { n: "Kabsa" }, mandi: { n: "Mandi" }, marag: { n: "Broth & stew" }, oven: { n: "Oven-roast leg or shoulder" } },
      weekly: { mince: { n: "Mince" }, stew: { n: "Stew pieces" }, bone: { n: "Bone-in pieces" }, steak: { n: "Steaks & slices" }, liver: { n: "Liver" } }
    },

    ORDER_STEPS: {
      placed: { n: "Order received", d: "Confirmed and waiting to be prepared" },
      cutting: { n: "On the butcher's block", d: "Cutting, marinating and packing as you asked" },
      onway: { n: "On its way to you", d: "With the driver in your chosen slot" },
      done: { n: "Delivered", d: "Enjoy your meal!" }
    },

    COPY: {
      ticker: ["Free cutting, any style", "Marinating and skewering on request", "The advisor works it out to the gram", "Free delivery from {freeOver} SAR", "Lamb · Goat · Camel · Veal · Beef · Buffalo"],
      nav: { shop: "Shop", herd: "The Herd", carcass: "Carcasses", extras: "BBQ kit", advisor: "Advisor", search: "Ribs, kabsa, camel…" },
      footer: { about: "An online butcher and cooking advisor: tell us the occasion and we'll cut the meat for your dish, to the gram.", copyright: "© 2026 NUDJ · Kingdom of Saudi Arabia" },
      home: {
        seoTitle: "NUDJ — Butcher & cooking advisor: meat cut for your occasion, to the gram",
        seoDesc: "Tell the NUDJ advisor the occasion — BBQ, kabsa, a whole carcass, steak — and it works out the quantity to the gram, plus the cut, marinade and charcoal. Lamb, goat, camel, veal, beef and buffalo, with free cutting.",
        hero: { eyebrow: "Butcher · Cooking advisor", title: "Tell us the occasion.", em: "We'll cut it to the gram.", sub: "The advisor asks how many of you there are and what you're cooking, then works out how many grams of each cut, the cutting style, the marinade and how many bags of charcoal — and you order the whole plan in one tap.", cta1: "Start with the advisor", cta2: "Shop the cuts", s1: "Animals", s2: "Cuts", s3: "SAR for cutting" },
        herd: { kicker: "The Herd", title: "Six animals. Every cut has a number.", sub: "Pick an animal and see its cuts on the drawing — every dot is a cut you can order, cut the way you want.", link: "Cuts map" },
        occasions: { kicker: "The Advisor", title: "Your occasion first. The cut second.", sub: "Pick the occasion and the advisor takes it from there: cubes, slices or whole cuts? Marinated? Skewered? — then hands you a receipt to the gram.", go: "Start" },
        how: { kicker: "How it works", title: "From “we have guests” to a ready receipt.", cta: "Try it with a BBQ party",
          steps: [{ t: "Name the occasion and headcount", d: "BBQ for ten? Camel kabsa for twenty? Pick one, or type it in your own words." }, { t: "Answer the butcher's questions", d: "Cubes or slices? Bone-in? Marinade? Skewers? Every option is clear, with its price." }, { t: "Adjust and order", d: "Change any weight with − and +, add a second dish, and order the whole plan in one tap." }] },
        uses: { kicker: "Start from the dish", title: "What are you cooking?", link: "All cuts" },
        services: { kicker: "Services on request", title: "Your meat arrives raw. The rest is up to you.", sub: "Cutting is free, any style. Marinating, skewering and vacuum packing are extras charged per kilo — and you see the price before you add them.", freeT: "Cutting", freeD: "Pieces, cubes, slices, steaks, mince, kebab…", link: "BBQ kit & spices" },
        cutband: { kicker: "Cutting styles", title: "Cutting is free.", em: "Any style you like.", sub: "Choose the style when you order — the butcher cuts it for you at no extra charge.", again: "Cut it again" },
        carcass: { kicker: "Carcasses", title: "A whole carcass? Let the advisor work out the size.", sub: "Tell us how many people and we'll suggest a half or a whole, and which size — cut for the freezer, kabsa or mandi, free of charge.", btn1: "Work out my carcass", btn2: "All carcasses" },
        faq: { kicker: "Questions", title: "Before you order", link: "All questions" }
      },
      shop: { title: "Shop", sub: "products · prices include VAT", ask: "Not sure? Ask the advisor", empty: "No products match this filter" },
      herd: { title: "The Herd", sub: "Six animals, every cut numbered on the drawing. Pick an animal." },
      animal: { ask: "Ask about the cuts of", carcassSub: "Free cutting in any style: freezer, kabsa, mandi or by dish." },
      product: { free: "Free cutting", howMuch: "How much do you need?", pair: "Goes well with", pairSub: "Kit and spices that suit this cut." },
      advisorPage: { kicker: "NUDJ Advisor", title: "Name the occasion.", em: "We'll work it out to the gram.", sub: "You can go back and change any answer. Once you have a plan, add a second occasion or adjust any weight before you order.", rules: "How does it calculate?", note: "Quantities are approximate raw weights, rounded to the nearest half kilo." },
      help: { title: "How can we help?", sub: "Can't find your answer? <a class=\"link\" href=\"contact.html\">Contact us</a>." },
      about: { title: "A butcher that asks before it cuts.",
        body: "<p class=\"lead\">Most people don't know how many kilos they need for ten guests, or which cut works for mandi. NUDJ is built around that question: tell us the occasion and we'll work out the rest.</p>\n<h2>What we offer</h2>\n<ul><li><b>The herd:</b> lamb, goat, camel, veal, beef and buffalo — {cutsCount} cuts by the kilo and {carcassCount} carcasses.</li><li><b>Free cutting:</b> kabsa pieces, skewer cubes, slices, steaks, rounds, mince, kebab — any style you like.</li><li><b>Services on request:</b> marinating, skewering and vacuum packing — at a clear price per kilo.</li><li><b>The advisor:</b> works out quantities to the gram, plus the kit and spices, and you order the whole plan.</li></ul>\n<h2>Company details</h2>\n<ul><li>Trade name: NUDJ (نُضْج)</li><li>City: {city}</li><li>Commercial registration: {cr}</li><li>VAT number: {vatNo}</li></ul>" },
      contact: { title: "Contact us", sub: "A question about your order or the cutting? We're here.", formTitle: "Send us a message" },
      terms: { updated: "[Date]",
        body: "<h2>1. Definitions</h2>\n<p>“NUDJ”, “we” or “us”: the establishment that owns the store (Commercial Registration {cr}). “Customer”: anyone who uses or buys from the store. “Advisor”: the interactive quantity calculator on the website.</p>\n<h2>2. Orders and prices</h2>\n<p>Prices are in Saudi riyals and include VAT. Cuts are sold by the kilo; carcass weights are approximate and listed on each product page. An order is confirmed once payment is completed or cash on delivery is selected.</p>\n<h2>3. Delivery</h2>\n<p>Delivery takes place on the day and in the slot chosen by the customer, within the cities we cover. Delivery costs {fee} SAR and is free on orders of {freeOver} SAR or more.</p>\n<h2>4. Returns and cancellation</h2>\n<p>Meat is a fresh product and cannot be returned after delivery unless it arrives in poor condition or does not match the order, provided this is reported within [reporting period]. An order can be cancelled before preparation begins.</p>\n<h2>5. Extra services</h2>\n<p>Cutting is free. Marinating, skewering and vacuum packing are paid services charged per kilo (or a flat fee per carcass) and shown separately on the receipt.</p>\n<h2>6. The advisor</h2>\n<p>Quantities suggested by the advisor are estimates to help the customer, who is responsible for reviewing and adjusting them before confirming an order.</p>\n<h2>7. Contact</h2>\n<p>For any enquiry: {phone} · {email}</p>" },
      privacy: { updated: "[Date]",
        body: "<h2>Data we collect</h2>\n<ul><li>Your mobile number and name, to sign in and confirm orders.</li><li>The delivery addresses you save.</li><li>Order details and the advisor plans you save.</li></ul>\n<h2>How we use it</h2>\n<ul><li>To prepare and deliver orders and contact you about them.</li><li>To keep advisor plans in your account.</li><li>To improve the service. We do not sell your data to anyone.</li></ul>\n<h2>Payment</h2>\n<p>Payments are processed by an approved payment provider, and we do not store your card details.</p>\n<h2>Your rights</h2>\n<p>You can ask to see, correct or delete your data by contacting us at {email}, in line with the Personal Data Protection Law of the Kingdom of Saudi Arabia.</p>" }
    },

    HELP: {
      delivery: { t: "Ordering & delivery", items: [
        ["How do I order?", "Two ways: pick a cut, set the weight on the scale and the cutting style, then add it to your cart — or ask the advisor about your occasion and get a complete plan you can add in one tap. Then choose your address, delivery slot and payment method."],
        ["When will my order arrive?", "You choose the delivery day and slot at checkout. Available slots: {windows}."],
        ["How much is delivery?", "{fee} SAR, and delivery is free on orders of {freeOver} SAR or more."],
        ["Where do you deliver?", "Currently: {cities}."],
        ["How does the meat arrive?", "[Add a description of the actual chilling and packaging process]. Vacuum packing is available as an extra service."]] },
      cutting: { t: "Cutting & marinating", items: [
        ["Is there a charge for cutting?", "No. Any cutting style — kabsa pieces, skewer cubes, slices, steaks, rounds, mince, kebab — is free."],
        ["How much are marinating, skewering and packing?", "{marinades}<br><b>Ready skewered:</b> {skewer} SAR/kg<br><b>Vacuum packing:</b> {vacuumKg} SAR/kg, or {vacuumCarcass} SAR per carcass"],
        ["What are the carcass cutting styles?", "{styles}"],
        ["Can I ask for a special cut?", "Yes. Write it in “Note for the butcher” on the product page, for example: “legs whole, the rest cut for the freezer”."],
        ["Are the weights exact?", "Cuts are weighed to the weight you choose on the scale. Carcass weights are approximate because every animal is different; the approximate weight is shown under each size."]] },
      payment: { t: "Payment", items: [
        ["Which payment methods are available?", "mada, Apple Pay, Visa and Mastercard, instalments with Tamara, and cash on delivery."],
        ["Do prices include VAT?", "Yes, all prices include 15% VAT, and the VAT amount is shown on the receipt."],
        ["How do I use a discount code?", "Enter it at checkout. Discount codes apply to meat only, not to extra services or the BBQ kit."]] },
      returns: { t: "Returns & cancellation", items: [
        ["Can I return the meat?", "Because meat is a fresh product, it can't be returned after delivery unless it arrives in poor condition or doesn't match your order. Contact us within [reporting period] of delivery with a photo of the product and your order number."],
        ["How do I cancel my order?", "From the receipt page under “My account → My orders” before preparation starts, or by contacting us with your order number."]] },
      advisor: { t: "The advisor", items: [
        ["What is the NUDJ advisor?", "A chat that asks about your occasion (BBQ, gathering, whole carcass, steak, weekly cooking), how many of you there are and what you prefer, then works out the cuts to the gram — with the cutting, marinade, kit and the price of everything. It's free to use."],
        ["How does the advisor calculate quantities?", "In grams per person depending on the occasion, rounded to the nearest half kilo. The rules are listed on the advisor page, and you can change any number before you order."],
        ["Can I change the advisor's plan?", "Yes — tap any earlier answer in the chat to change it, or adjust the weights in the receipt or in your cart. You can also save the plan to your account."],
        ["Is the advisor AI?", "No — it works from clear quantity rules and understands simple phrases like “camel kabsa for 12”. Quantities are estimates and you can adjust them before ordering."]] },
      account: { t: "Account", items: [
        ["How do I sign up?", "With your mobile number only: enter it and we'll send you a verification code."],
        ["Where do I find my orders and plans?", "In “My account”: your orders with their receipts and status, your saved advisor plans, and your addresses."]] }
    }
  };

  const FAQ = [
    ["Is cutting free?", "Yes. Whatever cutting style you choose (kabsa pieces, cubes, slices, steaks, mince…) costs nothing. The only paid extras are marinating, skewering and vacuum packing — and their prices are shown before you add them."],
    ["How does the advisor calculate quantities?", "In grams per person depending on the occasion: 350 g for boneless BBQ, 450 g for bone-in kabsa and mandi, 300 g for steak and 250 g for broth — rounded to the nearest half kilo. You can change any number before you order."],
    ["Can I change the advisor's plan?", "Yes — tap any earlier answer in the chat to change it, or adjust the weights in your cart. The plan stays saved in your account."],
    ["How does the meat arrive?", "[Add a description of the actual chilling and delivery process]. Delivery is 25 SAR, and free on orders from 300 SAR."],
    ["Do prices include VAT?", "Yes, all prices include 15% VAT, and the VAT amount is shown separately on the receipt."],
    ["Can I cancel my order?", "You can cancel from the order page before preparation starts. [Add the actual returns policy]."]
  ];

  /* size labels repeat on every carcass: translate them by their Arabic text */
  const SIZE = { "صغيرة": "Small", "وسط": "Medium", "كبيرة": "Large" };

  /* ---------- merge: text → text_en (never overwrites a twin that already exists) ---------- */
  const isTextList = v => Array.isArray(v) && v.length && (typeof v[0] === "string" || Array.isArray(v[0]));
  function put(t, tr) {
    if (t == null || tr == null || typeof t !== "object") return;
    if (Array.isArray(t)) {
      if (Array.isArray(tr)) tr.forEach((x, i) => { if (t[i] && typeof t[i] === "object" && !Array.isArray(t[i])) put(t[i], x); });
      else t.forEach(item => { if (item && typeof item === "object") { const key = item.id != null ? item.id : item.k; if (key != null && tr[key]) put(item, tr[key]); } });
      return;
    }
    Object.keys(tr).forEach(k => {
      const v = tr[k], cur = t[k];
      const objList = Array.isArray(cur) && cur.length && cur[0] && typeof cur[0] === "object" && !Array.isArray(cur[0]);
      if (typeof v === "string" || (isTextList(v) && !objList)) { if (t[k + "_en"] == null) t[k + "_en"] = v; }
      else if (cur && typeof cur === "object") put(cur, v);
    });
  }
  Object.keys(EN).forEach(k => put(D[k], EN[k]));
  D.PRODUCTS.forEach(p => (p.sizes || []).forEach(s => { if (s.l_en == null && SIZE[s.l]) s.l_en = SIZE[s.l]; }));
  if (D.FAQ_en && !D.FAQ_en.length) FAQ.forEach(x => D.FAQ_en.push(x));
})(window.NUDJ);
