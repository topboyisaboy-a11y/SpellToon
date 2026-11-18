// Persistent profile. Storage goes through the platform layer:
//  - web build:     localStorage (guarded; private mode can throw)
//  - YouTube build: ytgame cloud save (loadData is awaited before any save)
// The save format is versioned so future versions can read older saves.

import { PILOTS } from "./config.js";
import { platform } from "./platform.js";

const VERSION = 2;

const DEFAULTS = {
  v: VERSION,
  coins: 0,
  best: 0,
  runs: 0,
  runsSinceAd: 0,
  pilot: "scout",
  owned: ["scout"],
  upgrades: { shield: 0, chrono: 0, ghost: 0, magnet: 0, blink: 0, wyrm: 0, stomp: 0, flip: 0, gull: 0 },
  settings: { sound: true, music: true, sfx: true, haptics: true, lowFx: false, orient: "auto" },
  tutorialSeen: false
};

const clone = (o) => JSON.parse(JSON.stringify(o));
const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : d);

// Tolerant merge: unknown/missing fields fall back to defaults, so saves from
// older (or newer) versions never break the game.
function normalise(data) {
  const src = data && typeof data === "object" ? data : {};
  const merged = { ...clone(DEFAULTS), ...src };
  merged.v = VERSION;
  merged.coins = num(merged.coins);
  merged.best = num(merged.best);
  merged.runs = num(merged.runs);
  merged.runsSinceAd = num(merged.runsSinceAd);
  merged.upgrades = { ...DEFAULTS.upgrades, ...(src.upgrades || {}) };
  for (const k of Object.keys(merged.upgrades)) merged.upgrades[k] = Math.min(5, num(merged.upgrades[k]));
  merged.settings = { ...DEFAULTS.settings, ...(src.settings || {}) };
  if (!["auto", "vertical", "horizontal"].includes(merged.settings.orient)) merged.settings.orient = "auto";
  if (!Array.isArray(merged.owned)) merged.owned = ["scout"];
  if (!merged.owned.includes("scout")) merged.owned.unshift("scout");
  const flyable = PILOTS.find((p) => p.id === merged.pilot && !p.comingSoon);
  if (!merged.owned.includes(merged.pilot) || !flyable) merged.pilot = "scout";
  return merged;
}

export const save = {
  data: normalise(null),

  /** Called after a cloud save that arrived late has been merged in. */
  onLateLoad: null,

  /** Must be awaited once before the game starts. */
  async init() {
    let parsed = null;
    try {
      const raw = await platform.loadSave((lateRaw) => this.adoptLate(lateRaw));
      parsed = raw ? JSON.parse(raw) : null;
    } catch (e) {
      platform.logError(e);
    }
    this.data = normalise(parsed || platform.legacy());
  },

  /** The real cloud save arrived after the game had already started on a
   *  fresh profile. Keep the cloud progress and add this session's on top. */
  adoptLate(raw) {
    let cloud = null;
    try {
      cloud = raw ? JSON.parse(raw) : null;
    } catch (e) {
      platform.logError(e);
    }
    if (cloud) {
      const c = normalise(cloud);
      const s = this.data; // session progress, started from DEFAULTS
      const merged = normalise({
        ...c,
        coins: c.coins + s.coins,
        best: Math.max(c.best, s.best),
        runs: c.runs + s.runs,
        runsSinceAd: c.runsSinceAd + s.runsSinceAd,
        owned: [...new Set([...c.owned, ...s.owned])],
        upgrades: Object.fromEntries(
          Object.keys(DEFAULTS.upgrades).map((k) => [k, Math.max(c.upgrades[k] || 0, s.upgrades[k] || 0)])
        ),
        tutorialSeen: c.tutorialSeen || s.tutorialSeen
      });
      this.data = merged;
    }
    this.commit();
    try {
      this.onLateLoad?.();
    } catch (e) {
      platform.logError(e);
    }
  },

  commit() {
    platform.save(JSON.stringify(this.data));
  },

  reset() {
    const settings = this.data.settings;
    this.data = normalise(null);
    this.data.settings = settings;
    this.commit();
  }
};
