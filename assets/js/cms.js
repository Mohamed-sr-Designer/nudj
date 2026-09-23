/* =========================================================
   نُضْج — تطبيق تعديلات لوحة التحكم
   المصدر: مسودة المعاينة (في متصفح المدير فقط) أو المحتوى المنشور (content.js).
   إن كانت الصفحة الثابتة مبنية بمحتوى أقدم، تُحمَّل القوالب وتُعاد رسمها قبل سكربتات الصفحة.
   يعمل أيضاً داخل build.js (بدون document) لتطبيق المحتوى المنشور وقت البناء.
   ========================================================= */
(function (root) {
  "use strict";
  const D = root.NUDJ; if (!D) return;
  const ARR = ["ANIMALS", "MARINADES", "STYLES", "PRODUCTS", "FAQ", "FAQ_en", "HOME", "HELP", "ORDER_STEPS"];
  const OBJ = ["CONFIG", "IMAGES", "PREPS", "SERVICES", "USES", "ADVISOR", "COPY", "THEME", "ZONES"];
  const KEYS = ARR.concat(OBJ);
  const clone = o => JSON.parse(JSON.stringify(o));
  /* الاستبدال داخل نفس المرجع: دوال data.js (byId، animal…) تحتفظ بمرجع المصفوفات الأصلية */
  function replace(t, s) {
    if (Array.isArray(t)) { t.length = 0; s.forEach(x => t.push(x)); }
    else { Object.keys(t).forEach(k => { delete t[k]; }); Object.assign(t, s); }
  }
  function apply(ov) { if (!ov) return; KEYS.forEach(k => { if (ov[k] != null && D[k] != null) replace(D[k], clone(ov[k])); }); }
  /* صفحات /en/: النسخ الإنجليزية تحل محل العربية بعد تطبيق المحتوى المنشور */
  const localize = () => { if (D.localize) D.localize(); };
  function snapshot() { const o = {}; KEYS.forEach(k => { o[k] = clone(D[k]); }); return o; }
  function hash(o) { const s = JSON.stringify(o || null); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }

  const CMS = root.NUDJ_CMS = { apply, snapshot, hash, KEYS, localize, active: false, preview: false, rerender: false };
  if (typeof document === "undefined") return;

  CMS.original = snapshot(); /* نسخة data.js قبل أي تعديل (لزر «الرجوع للأصل») */
  const pub = root.NUDJ_CONTENT || null;
  let draft = null, preview = false;
  try { preview = localStorage.getItem("nudj_cms_preview") === "1"; if (preview) draft = JSON.parse(localStorage.getItem("nudj_cms_draft") || "null"); } catch (e) { }
  const ov = (preview && draft) || pub;
  CMS.active = !!ov; CMS.preview = !!(preview && draft); CMS.published = pub;
  if (ov) {
    apply(ov);
    try { if (D.THEME && D.THEME.accent) document.documentElement.style.setProperty("--ember", D.THEME.accent); } catch (e) { }
  }
  localize();
  const meta = document.querySelector('meta[name="nudj-content"]');
  const file = document.body && document.body.dataset.file;
  if (file === "admin.html") return;
  if ((ov && hash(ov) !== (meta ? meta.content : "0")) || file === "404.html") {
    CMS.rerender = true;
    document.write('<script src="' + (D.R || "") + 'assets/js/templates.js?v=' + (meta ? meta.getAttribute("data-tpl") : "") + '"><\/script>');
  }
})(typeof window !== "undefined" ? window : globalThis);
