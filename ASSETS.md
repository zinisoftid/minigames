# Assets and third-party material

Status of every group of files. **Do not publish while any row says "unverified".**

| Group | Location | Source | License | Status |
|---|---|---|---|---|
| Bootstrap 4.3.1 | `games/guess-me/assets/vendors/bootstrap/` | https://getbootstrap.com | MIT | verified (header in file) |
| jQuery, jQuery Validation, jQuery i18n, Alertify, Font Awesome, Popper, malihu scrollbar | loaded from CDNs in `index.html` | cdnjs / jsDelivr / code.jquery.com | MIT or similar | not bundled |
| Fonts Pacifico, Quicksand, Roboto | Google Fonts, loaded from CDN | Google Fonts | OFL | not bundled |
| Character, product and prize illustrations | `games/*/assets/img/` | unknown, looks like cartoon stock art | unknown | **unverified** |
| UI elements (stars, buttons, wheel, backgrounds, icons) | `games/*/assets/img/` | unknown | unknown | **unverified** |
| Logos "Clik Clik" and "Lucky Spin" | `games/*/assets/img/logo*.png` | probably made by the author | CC BY 4.0 if confirmed | **unverified** |
| Music and sound effects | `games/*/assets/music/` | unknown | unknown | **unverified** |

## To finish before going public

1. For each "unverified" row, record the source (author, site, URL) and license, or replace the file with one you own or one under a permissive license (CC0, CC BY, public domain).
2. Remove any file that has no confirmed source.
3. Move rows you created yourself to a status of "original", which makes them CC BY 4.0 under [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
