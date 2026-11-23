(function () {
  var d = document.documentElement, tocco = matchMedia('(hover: none) and (pointer: coarse)');
  var ancora = null, congela = 0, sf = 0, W = innerWidth, H = innerHeight, giri = [];
  var fermo = function () { return d.classList.contains('carica-on') || d.classList.contains('in-carica') || d.classList.contains('caricando') || d.classList.contains('apertura'); };
  var sezioni = function () { return [].slice.call(document.querySelectorAll('section, footer')); };
  var leggi = function () {
    if (fermo() || performance.now() < congela) return;
    var y = window.scrollY, a = {}, ST = window.ScrollTrigger;
    if (ST) { var t = ST.getAll(); for (var i = 0; i < t.length; i++) { var s = t[i]; if (s.pin && y >= s.start && y <= s.end && s.end > s.start) { a.st = s; a.fs = (y - s.start) / (s.end - s.start); break; } } }
    var l = sezioni(); for (var k = l.length - 1; k >= 0; k--) { var r = l[k].getBoundingClientRect(); if (r.height && r.top <= 1 && r.bottom > 1) { a.el = l[k]; a.f = -r.top / r.height; break; } }
    if (a.st || a.el) ancora = a;
  };
  var posa = function () {
    if (!ancora) return;
    var ST = window.ScrollTrigger, a = ancora, y = null;
    if (a.st && ST && ST.getAll().indexOf(a.st) >= 0 && a.st.end > a.st.start) y = a.st.start + (a.st.end - a.st.start) * a.fs;
    else if (a.el) { var r = a.el.getBoundingClientRect(); y = window.scrollY + r.top + r.height * a.f; }
    if (y === null) return;
    window.scrollTo({ top: Math.round(y), behavior: 'instant' });
    if (ST) ST.update();
  };
  addEventListener('scroll', function () { clearTimeout(sf); sf = setTimeout(leggi, 120); }, { passive: true });
  addEventListener('resize', function () {
    var cambia = tocco.matches ? innerWidth !== W : innerWidth !== W || innerHeight !== H;
    W = innerWidth; H = innerHeight;
    if (!cambia) return;
    clearTimeout(sf); congela = performance.now() + 1700;
    giri.forEach(clearTimeout);
    giri = [150, 400, 800, 1200, 1650].map(function (ms) { return setTimeout(posa, ms); });
  });
  if (window.ScrollTrigger) window.ScrollTrigger.addEventListener('refresh', function () { if (performance.now() < congela) posa(); });
  leggi();
})();
