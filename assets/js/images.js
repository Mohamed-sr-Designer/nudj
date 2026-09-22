/* مولّد تلقائياً بواسطة build.js — لا تعدّله يدوياً (0 صورة مكتشفة).
   يربط الصور المحفوظة بأسمائها الصحيحة بخاناتها في الموقع. */
(function (D) {
  if (!D) return;
  var M = {"site":{},"products":{},"posters":{}};
  Object.keys(M.site).forEach(function (k) { if (!D.IMAGES[k]) D.IMAGES[k] = M.site[k]; });
  D.PRODUCTS.forEach(function (p) {
    var f = (M.products[p.id] || []).filter(Boolean);
    if (f.length) { if (!p.img) p.img = f[0]; if (!p.gallery || !p.gallery.length) p.gallery = p.img === f[0] ? f.slice(1) : f; }
    if (!p.poster && M.posters[p.id]) p.poster = M.posters[p.id];
  });
  if (!D.CARCASS_GUIDE.poster && M.posters.carcass) D.CARCASS_GUIDE.poster = M.posters.carcass;
  D.DISHES.forEach(function (d) { if (!d.poster && M.posters["dish-" + d.slug]) d.poster = M.posters["dish-" + d.slug]; });
})(window.NUDJ);
