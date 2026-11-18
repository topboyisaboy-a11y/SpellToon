GEMFALL - source files
======================

Gemfall.html   The whole game in one file. Open it in any browser (phone or PC) to play.

src/logic.js   Game rules and level maps (boulders, digging, traps, gates, saves).
src/game.js    Pixel art, sound, touch pad, menus and drawing.
src/shell.html Page layout and styles. The two scripts are inserted where it says /*LOGIC*/ and /*GAME*/.
src/build.py   Rebuilds index.html from the three files above:  python3 build.py
src/tests.js   Rule checks and full playthroughs of every level:  node tests.js

Levels live in the LEVELS list at the top of logic.js. Map legend:
  #  stone wall      .  soil            (space) open floor
  O  boulder         *  crystal         R  ember crystal (secret)
  K  key             D  locked door     E  exit gate
  ^  spike trap      C  checkpoint      S  snake        P  start
  G  crystal gate    H  hammer          X  cracked wall
  _  pressure plate  |  bars            v  pit          ~  crumbling floor

Note: the title font loads from Google Fonts. Offline, it falls back to a system font.
Before sending to Poki, that font must be bundled into the file (Poki blocks outside requests).
