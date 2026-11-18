// Global tuning for Jetpack Surge. Everything a designer might want to tweak lives here.

// The stage has two shapes:
//  - vertical (portrait): 405 wide, the height follows the phone so tall phones get a taller playfield;
//  - horizontal (landscape): 560 tall, the width follows the screen (16:10 to 21:9).
// "auto" picks by the screen's shape; the player can also force either one in Settings.
export const PORTRAIT_W = 405;
export const LANDSCAPE_H = 560;
export let W = PORTRAIT_W; // logical width, updated by setStageSize (ES module bindings are live)
export let ORIENT = "vertical";

/** The orientation to use for a preference ("auto" | "vertical" | "horizontal") on this screen. */
export function resolveOrient(pref) {
  if (pref === "vertical" || pref === "horizontal") return pref;
  const vw = window.innerWidth || 405, vh = window.innerHeight || 720;
  return vw / vh >= 1.15 ? "horizontal" : "vertical";
}

/** Horizontal chosen on an upright screen: the whole game is turned sideways,
 *  so the player turns the phone and gets a full landscape screen, even with
 *  rotation lock on (and inside hosts that keep the page upright). */
export function isRotated(pref) {
  return pref === "horizontal" && (window.innerHeight || 720) > (window.innerWidth || 405) * 1.05;
}

/** Logical stage size for a preference. */
export function computeLogicalSize(pref = "auto") {
  const orient = resolveOrient(pref);
  let vw = window.innerWidth || 405, vh = window.innerHeight || 720;
  if (isRotated(pref)) [vw, vh] = [vh, vw]; // measured as the player will hold it
  if (orient === "horizontal") {
    const aspect = vw / vh >= 1.15 ? vw / vh : 16 / 9; // forced on a tall screen: a 16:9 stage
    return { orient, w: Math.round(Math.min(1260, Math.max(860, LANDSCAPE_H * aspect))), h: LANDSCAPE_H };
  }
  const aspect = vh / vw;
  const h = aspect < 1.3 ? 720 : Math.round(Math.min(900, Math.max(700, PORTRAIT_W * aspect)));
  return { orient, w: PORTRAIT_W, h };
}

export function setStageSize(size) {
  W = size.w;
  ORIENT = size.orient;
}

/** Kept for older callers: the height of the current preference. */
export function computeLogicalHeight(pref = "auto") {
  return computeLogicalSize(pref).h;
}

// Pixel density used when baking art so everything stays crisp on retina screens.
export function computeRenderScale(logicalH) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const vw = window.innerWidth || W;
  const vh = window.innerHeight || logicalH;
  const cssScale = Math.min(vw / W, vh / logicalH);
  // Capped at 2.5x: sharper than that is invisible on a phone but costs fill-rate.
  return Math.max(1, Math.min(2.5, Math.round(cssScale * dpr * 4) / 4));
}

export const PALETTE = {
  ink: 0x060b1a,
  navy: 0x0b1633,
  steel: 0x2a3a5c,
  cyan: 0x3ee8ff,
  gold: 0xffc233,
  goldLight: 0xffe58a,
  laser: 0xff3b5c,
  laserHot: 0xffd1dc,
  violet: 0xa77bff,
  magnet: 0xff5a4e,
  green: 0x4dff9a,
  white: 0xffffff
};

// Flight model copied 1:1 from the original Jetpack Surge (v1) so the pilot handles
// exactly the same: separate lift/gravity for rising vs falling, air damping,
// a brake when you tap during a fast fall, and the same speed caps.
export const PHYSICS = {
  liftWhileFalling: 1850, // thrust when moving down (vy > 0)
  liftWhileRising: 1400, // thrust when already moving up
  gravityRising: 1250, // gravity while still travelling up after release
  gravityFalling: 1000, // gravity while falling
  tapBrakeSpeed: 180, // pressing while falling faster than this...
  tapBrake: 0.55, // ...instantly keeps only 55% of the fall speed
  airDamping: 0.994, // per 1/60 s
  maxRise: -460,
  maxFall: 570,
  ceilingBounce: 50, // hitting the ceiling pushes you down at this speed
  landDustSpeed: 135,
  crashLaunch: -90, // crash pop-up (or current rise speed if faster)
  crashGravity: 1850,
  crashMaxFall: 850,
  shieldKnock: -300,
  playerX: 86,
  hitRadius: 15, // forgiving capsule, smaller than the painted sprite
  hitHalfHeight: 17
};

export const SPEED = {
  start: 235,
  // Portrait screens show little of what is ahead, so the top speed is lower
  // than a landscape runner and approaches it smoothly.
  max: 455,
  ramp: 2600, // meters for ~63% of the ramp
  menu: 110,
  // Horizontal mode shows far more of what is coming, so it runs a little faster.
  wideFactor: 1.15
};

export const PX_PER_METER = 24;

// Single lab theme for the whole run (no zones or level changes).
export const THEME = { tint: 0x3ee8ff, sky: [0x07122b, 0x0d2b52] };

// Pilots marked comingSoon show in the Pilots screen but cannot be bought or
// flown yet. Remove the flag to release one.
export const PILOTS = [
  { id: "scout", name: "Scout", role: "Jungle explorer", price: 0, accent: "#ffb347" },
  { id: "tinker", name: "Tinker", role: "Lab inventor", price: 750, accent: "#ffd84d", comingSoon: true },
  { id: "ranger", name: "Ranger", role: "Veteran flyer", price: 1500, accent: "#6aa8ff", comingSoon: true },
  { id: "nova", name: "Nova", role: "Sky mechanic", price: 3000, accent: "#3ee8c5", comingSoon: true }
];

// Sound files (assets/audio/<name>.mp3). They download right after the menu
// appears: browsers only play audio after the player's first tap, so none of
// it is needed to show the menu.
export const AUDIO_FILES = {
  music: "music-lab-escape",
  thrust: "jetpack-thrust",
  run: "running-footsteps",
  coin: "coin-collection",
  powerup: "powerup-chime",
  warn: "missile-warning",
  impact: "obstacle-impact",
  boom: "missile-explosion"
};

// Where each pilot's feet and jetpack nozzle sit inside its atlas frames.
// Built in (it used to be a separate download) so a dropped request can
// never stop the game from starting.
export const PILOT_META = {
  scout: { frameW: 188, frameH: 217, footY: 103.4, headY: -91.1, nozzle: [-39.3, 31.0] },
  tinker: { frameW: 224, frameH: 279, footY: 120.1, headY: -71.2, nozzle: [-43.0, 48.3] },
  ranger: { frameW: 211, frameH: 242, footY: 108.5, headY: -85.1, nozzle: [-52.3, 32.3] },
  nova: { frameW: 219, frameH: 235, footY: 111.8, headY: -81.4, nozzle: [-36.7, 29.8] }
};

export const UPGRADE_COSTS = [200, 450, 900, 1600, 2600];

export const POWERUPS = {
  shield: {
    label: "Shield",
    color: 0x3ee8ff,
    css: "#3ee8ff",
    upgradeTitle: "Launch Shield",
    upgradeText: (lvl) => (lvl === 0 ? "Absorbs one hit" : `${lvl * 20}% chance to start runs shielded`)
  },
  chrono: {
    label: "Slow-down",
    color: 0xa77bff,
    css: "#b48cff",
    duration: (lvl) => 10 + lvl * 2,
    upgradeTitle: "Slow-down",
    upgradeText: (lvl) => `Slows the world for ${10 + lvl * 2}s`
  },
  ghost: {
    label: "Invisible",
    color: 0x7dffc8,
    css: "#7dffc8",
    duration: (lvl) => 10 + lvl * 2,
    upgradeTitle: "Invisible",
    upgradeText: (lvl) => `Pass through lasers and missiles for ${10 + lvl * 2}s`
  },
  magnet: {
    label: "Magnet",
    color: 0xff5a4e,
    css: "#ff6a5e",
    duration: (lvl) => 8 + lvl * 2,
    upgradeTitle: "Coin Magnet",
    upgradeText: (lvl) => `Pulls in coins for ${8 + lvl * 2}s`
  }
};

export const REVIVE_COST = 200;
