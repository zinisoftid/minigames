// Language support for the hub page. To add a language, create assets/lang/<code>.json
// (copy en.json) and add one line to LANGUAGES below. The games read the same cookie.
(function () {
  var LANGUAGES = { en: "English", vi: "Tiếng Việt" };
  var DEFAULT = "en";
  var cache = {};

  function getCookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function saved() {
    var code = getCookie("defaultLanguage");
    return LANGUAGES[code] ? code : DEFAULT;
  }

  function apply(dict, code) {
    document.documentElement.lang = code;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (dict[el.dataset.i18n]) el.textContent = dict[el.dataset.i18n];
    });
    if (dict.language) select.setAttribute("aria-label", dict.language);
  }

  function load(code) {
    if (cache[code]) return Promise.resolve(cache[code]);
    return fetch("assets/lang/" + code + ".json")
      .then(function (r) { return r.json(); })
      .then(function (d) { cache[code] = d; return d; });
  }

  function setLanguage(code) {
    document.cookie = "defaultLanguage=" + code + ";max-age=31536000;path=/";
    // English is already in the HTML, so a failed fetch still leaves a working page.
    load(code).then(function (d) { apply(d, code); }).catch(function () {});
  }

  var select = document.getElementById("lang-select");
  Object.keys(LANGUAGES).forEach(function (code) {
    var o = document.createElement("option");
    o.value = code;
    o.textContent = LANGUAGES[code];
    select.appendChild(o);
  });
  var start = saved();
  select.value = start;
  select.addEventListener("change", function () { setLanguage(select.value); });
  if (start !== DEFAULT) setLanguage(start);
})();
