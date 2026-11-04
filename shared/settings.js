// Per-game settings: defaults from the game's config.json, overridden by what the player
// saves on the Settings page. Only the overrides are stored, in localStorage under
// "minigame.<game id>.settings", so changing a default in config.json reaches everyone
// who has not changed that value.
(function (root) {
  function create(gameId, defaults) {
    var key = "minigame." + gameId + ".settings";

    function read() {
      try {
        return JSON.parse(localStorage.getItem(key)) || {};
      } catch (e) {
        return {};
      }
    }

    function write(values) {
      try {
        localStorage.setItem(key, JSON.stringify(values));
      } catch (e) {}
    }

    return {
      get: function (name) {
        var saved = read();
        return name in saved ? saved[name] : defaults[name];
      },
      set: function (name, value) {
        var saved = read();
        saved[name] = value;
        write(saved);
      },
      setMany: function (values) {
        write(Object.assign(read(), values));
      },
      reset: function () {
        try {
          localStorage.removeItem(key);
        } catch (e) {}
      },
    };
  }

  root.MiniSettings = { create: create };
})(window);
