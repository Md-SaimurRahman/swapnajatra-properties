/* Home loan calculator: shows commas while typing (Bangladeshi lakh/crore grouping) and a words hint (e.g. 1.5 Crore). */
(function () {
  function digits(s) { return String(s == null ? '' : s).replace(/[^\d]/g, '').slice(0, 12); }
  function group(d) {
    if (!d) return '';
    var last = d.slice(-3), rest = d.slice(0, -3);
    return rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last : last;
  }
  function fmt(n) { return '৳' + (group(digits(Math.round(Number(n) || 0))) || '0'); }
  function words(n) {
    n = Number(n) || 0;
    if (n >= 10000000) return (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + ' Crore';
    if (n >= 100000) return (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' Lakh';
    return '';
  }
  function setup(id) {
    var input = document.getElementById(id);
    if (!input) return;
    input.type = 'text';
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('autocomplete', 'off');
    input.removeAttribute('min');
    input.value = group(digits(input.value));
    var h = document.createElement('div');
    h.className = 'fmt-hint';
    input.parentNode.appendChild(h);
    function hint() {
      var v = Number(digits(input.value)) || 0;
      var w = words(v);
      h.textContent = v ? fmt(v) + (w ? '  ·  ' + w : '') : '';
    }
    input.addEventListener('input', function () {
      var before = input.value, pos = input.selectionStart == null ? before.length : input.selectionStart;
      var digitsLeft = digits(before.slice(0, pos)).length;
      var out = group(digits(before));
      if (out !== before) {
        input.value = out;
        var p = 0, seen = 0;
        while (p < out.length && seen < digitsLeft) { if (/\d/.test(out[p])) seen++; p++; }
        try { input.setSelectionRange(p, p); } catch (e) {}
      }
      hint();
    });
    hint();
  }
  function init() { setup('ep'); setup('ed'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
