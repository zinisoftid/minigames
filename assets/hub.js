// Hub page: builds the game cards from games.json, then handles the language switch.
// Language list, storage and DOM updates live in shared/i18n.js; this file loads
// assets/lang/<code>.json and wires up the selector.
(function () {
  var cache = {};
  var select = document.getElementById("lang-select");
  var cards = document.getElementById("cards");

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // English text is written into each node; data-i18n lets the language files overlay it.
  function labelled(tag, className, key, english) {
    var node = el(tag, className, english);
    if (key) node.setAttribute("data-i18n", key);
    return node;
  }

  function buildCard(game, english) {
    var soon = game.status === "soon";
    var card = el("article", soon ? "card soon" : "card");
    card.setAttribute("data-group", game.group);
    if (soon) card.setAttribute("aria-disabled", "true");

    var art = el("div", "card-art" + (game.artClass ? " " + game.artClass : ""));
    art.setAttribute("aria-hidden", "true");
    if (soon) {
      art.appendChild(el("span", "soon-icon", "?"));
    } else {
      (game.art || []).forEach(function (src) {
        var img = el("img");
        img.src = src;
        img.alt = "";
        art.appendChild(img);
      });
    }
    card.appendChild(art);

    card.appendChild(
      game.titleKey
        ? labelled("h2", "", game.titleKey, english[game.titleKey])
        : el("h2", "", game.title)
    );
    card.appendChild(labelled("p", "", game.textKey, english[game.textKey]));

    if (game.tags) {
      var tags = el("ul", "tags");
      game.tags.forEach(function (tag) {
        tags.appendChild(
          tag.key ? labelled("li", "", tag.key, english[tag.key]) : el("li", "", tag.text)
        );
      });
      card.appendChild(tags);
    }

    if (soon) {
      card.appendChild(labelled("span", "play disabled", "comingSoon", english.comingSoon));
    } else {
      var link = el("a", "play");
      link.href = game.path;
      link.appendChild(labelled("span", "", "play", english.play));
      link.appendChild(document.createTextNode(" \u25B6"));
      card.appendChild(link);
    }
    return card;
  }

  function load(code) {
    if (cache[code]) return Promise.resolve(cache[code]);
    return fetch("assets/lang/" + code + ".json")
      .then(function (r) { return r.json(); })
      .then(function (d) { cache[code] = d; return d; });
  }

  function show(code) {
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

  Promise.all([fetch("games.json").then(function (r) { return r.json(); }), load(MiniLang.DEFAULT)])
    .then(function (loaded) {
      loaded[0].games.forEach(function (game) {
        cards.appendChild(buildCard(game, loaded[1]));
      });
      if (start !== MiniLang.DEFAULT) show(start);
    })
    .catch(function (error) {
      console.error("Could not build the game list", error);
    });
})();
