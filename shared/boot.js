// Loads the game's config.json, builds window.GAME_CONFIG and window.GAME_SETTINGS, then
// loads the game's own scripts in order. Used as:
//   <script src="../../shared/boot.js" data-scripts="assets/js/game.js,assets/js/main.js"></script>
// (include shared/i18n.js and shared/settings.js before it).
(function () {
  var self = document.currentScript;
  var scripts = (self.getAttribute("data-scripts") || "").split(",").filter(Boolean);

  function loadNext() {
    var src = scripts.shift();
    if (!src) return;
    var el = document.createElement("script");
    el.src = src;
    el.onload = loadNext;
    document.body.appendChild(el);
  }

  fetch("config.json")
    .then(function (r) {
      if (!r.ok) throw new Error("config.json: HTTP " + r.status);
      return r.json();
    })
    .then(function (config) {
      window.GAME_CONFIG = config;
      var defaults = Object.assign({}, config.settings, {
        products: config.products,
        characters: config.characters,
      });
      window.GAME_SETTINGS = MiniSettings.create(config.id, defaults);
      loadNext();
    })
    .catch(function (err) {
      console.error("Could not start the game:", err);
    });
})();
