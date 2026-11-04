// Hub page language switch. Language list, storage and DOM updates live in shared/i18n.js;
// this file only loads assets/lang/<code>.json and wires up the selector.
(function () {
  var cache = {};
  var select = document.getElementById("lang-select");

  function load(code) {
    if (cache[code]) return Promise.resolve(cache[code]);
    return fetch("assets/lang/" + code + ".json")
      .then(function (r) { return r.json(); })
      .then(function (d) { cache[code] = d; return d; });
  }

  function show(code) {
    // English is already in the HTML, so a failed fetch still leaves a working page.
    load(code)
      .then(function (dict) {
        MiniLang.apply(document, function (key) { return dict[key]; });
        if (dict.language) select.setAttribute("aria-label", dict.language);
      })
      .catch(function () {});
  }

  Object.keys(MiniLang.LANGUAGES).forEach(function (code) {
    var o = document.createElement("option");
    o.value = code;
    o.textContent = MiniLang.LANGUAGES[code];
    select.appendChild(o);
  });
  var start = MiniLang.get();
  select.value = start;
  select.addEventListener("change", function () {
    MiniLang.set(select.value);
    show(select.value);
  });
  if (start !== MiniLang.DEFAULT) show(start);
})();
