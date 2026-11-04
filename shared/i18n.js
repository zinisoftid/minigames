// Shared language support for the hub and every game.
//
// English text is written inline in each page, so a page still reads fine without JS or
// fetch. Translations live in assets/lang/<code>.json next to each page. Elements opt in
// with data-i18n (text), data-i18n-placeholder and data-i18n-title (attributes).
//
// To add a language for the whole site: add one line to LANGUAGES below, then add
// <code>.json to the hub and to each game's assets/lang/ folder.
(function (root) {
  var LANGUAGES = { en: "English", vi: "Tiếng Việt" };
  var DEFAULT = "en";
  var KEY = "minigame.lang";
  var memory = null;

  function get() {
    var code = memory;
    try {
      code = localStorage.getItem(KEY) || code;
    } catch (e) {}
    return LANGUAGES[code] ? code : DEFAULT;
  }

  function set(code) {
    if (!LANGUAGES[code]) return;
    memory = code;
    try {
      localStorage.setItem(KEY, code);
    } catch (e) {}
  }

  // translate(key) returns the text for the key, or a falsy value to keep the inline text.
  function apply(scope, translate) {
    document.documentElement.lang = get();
    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      var text = translate(el.getAttribute("data-i18n"));
      if (text) el.textContent = text;
    });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var text = translate(el.getAttribute("data-i18n-placeholder"));
      if (text) el.setAttribute("placeholder", text);
    });
    scope.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var text = translate(el.getAttribute("data-i18n-title"));
      if (!text) return;
      el.setAttribute("title", text);
      // Bootstrap tooltips keep their text here once initialised.
      if (el.hasAttribute("data-original-title")) {
        el.setAttribute("data-original-title", text);
      }
    });
  }

  root.MiniLang = { LANGUAGES: LANGUAGES, DEFAULT: DEFAULT, get: get, set: set, apply: apply };
})(window);
