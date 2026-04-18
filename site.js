/* Spark I/O — shared site script
   Mobile nav drawer. Expects a .site-nav-toggle button inside .site-nav-inner
   and a .site-nav-links list. */
(function () {
  function init() {
    document.querySelectorAll('.site-nav').forEach(function (nav) {
      var toggle = nav.querySelector('.site-nav-toggle');
      var links = nav.querySelector('.site-nav-links');
      if (!toggle || !links) return;
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // Close on link click
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
      });
      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target)) { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
      });
    });
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
