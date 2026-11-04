# MiniGame

Two small HTML5 mini-games for food, drink and online-store campaigns, themed around the fictional Corner Café brand. Open them in a browser or host them as static files. No build step and no backend.

| Game | What it is | Folder |
|---|---|---|
| Guess Me | Spot the new product the character asks for before time runs out. English and Vietnamese. | [games/guess-me](games/guess-me) |
| Lucky Spin | Spin the wheel to win prizes, with a rank table. | [games/spin-wheel](games/spin-wheel) |

## Run locally

Any static server works. From this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/` for the hub page, which links to each game, or go straight to `http://localhost:8000/games/guess-me/` or `http://localhost:8000/games/spin-wheel/`.

Opening `index.html` directly from disk may fail for the language files (`fetch` is blocked on `file://`), so use a server.

## Publish

Publish the whole folder so the hub page and the "All games" links work (or upload a single game folder on its own). Upload to GitHub Pages, Netlify or any web host. The pages load jQuery, Bootstrap and Google Fonts from public CDNs, so visitors need internet access.

## Data and privacy

The registration form asks for name, email and phone number. Everything is kept in the visitor's own browser (`localStorage`); nothing is sent to a server. If you connect these games to a backend, add your own privacy notice and consent.

## Structure

Groups (marketing, education, ...) are data in `games.json`, not folders, so moving a game between groups never changes its URL. A game can use any stack as long as it ends up as static files under `games/<id>/`.

To add a game: create `games/<id>/`, then add one entry to `games.json`.

```
index.html            hub page (assets/hub.js, assets/lang/*.json)
games.json            list of games: id, group, tech, status; the hub builds its cards from it
shared/
  theme.css           the two fonts (display and body) used by every page
  i18n.js             language list, current language, applies data-i18n attributes
  settings.js         per-game settings: defaults + what the player saved
  boot.js             loads a game's config.json, then its scripts
games/<game>/
  index.html          the page, English text inline
  config.json         defaults: id, settings, products, prizes, ...
  assets/lang/        en.json, vi.json, ...
  assets/js|css|img|music
```

A new game follows the same layout: copy a game folder, edit `config.json`, and include the three shared scripts at the bottom of `index.html`:

```html
<script src="../../shared/i18n.js"></script>
<script src="../../shared/settings.js"></script>
<script src="../../shared/boot.js" data-scripts="assets/js/main.js"></script>
```

Read values with `GAME_SETTINGS.get("name")` and static data with `GAME_CONFIG`.

## Customize

- **Defaults** (times, limits, prizes, products, characters): edit the game's `config.json`.
- **Player settings**: Guess Me has a Settings page. It saves only the values the player changed, in `localStorage` (`minigame.guess-me.settings`), so a new default in `config.json` still reaches everyone who left that value alone. "Restore defaults" clears them. There is no `.env` file: these games run in the browser, so every value would be public anyway.
- **Language**: English is the default and is written inline in each page. The visitor's choice is stored in `localStorage` (`minigame.lang`) and shared by the hub and every game. Elements opt in with `data-i18n`, `data-i18n-placeholder` or `data-i18n-title`.
- **Add a language**: add one line to `LANGUAGES` in `shared/i18n.js`, then add `<code>.json` (copy `en.json`) to `assets/lang/` of the hub and of each game. A missing key falls back to the English text.
- **Images and audio**: `games/<game>/assets/img/` and `assets/music/`; Guess Me products and characters are listed in its `config.json`.

## License

- Code: [MIT](LICENSE).
- Original images, text and audio created for this project: [CC BY 4.0](LICENSE-CONTENT.md).
- Third-party material keeps its own terms. See [ASSETS.md](ASSETS.md) before reusing any image or sound.
