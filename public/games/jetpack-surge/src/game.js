import { W, ORIENT, PHYSICS, SPEED, PX_PER_METER, THEME, PALETTE, POWERUPS, PILOTS, PILOT_META, REVIVE_COST, AUDIO_FILES } from "./config.js";
import { bakeMenuArt, bakeRunArt, art, artScale } from "./art.js";
import { Rules, RULES } from "./classic.js";
import { Vehicles } from "./vehicles.js";
import { Audio } from "./audio.js";
import { save } from "./save.js";
import { ui } from "./ui.js";
import { platform } from "./platform.js";

const Phaser = window.Phaser;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));

const PILOT_SCALE = 0.4; // atlas run height 190px -> ~76 logical px
const BODY_HALF = 38; // player.y is the body centre; feet sit BODY_HALF below
const CEIL_H = 74;
const FLOOR_OFFSET = 118;
const BARRAGE = { charge: 1.45, fire: 1.05, retract: 0.35 };
let soundTries = 0; // deferred sound downloads attempted (one retry, then give up quietly)
const MISSILE_SPEED = 820;

// Closest distance between segments p1-p2 and q1-q2.
function segDist(p1x, p1y, p2x, p2y, q1x, q1y, q2x, q2y) {
  const ux = p2x - p1x, uy = p2y - p1y, vx = q2x - q1x, vy = q2y - q1y;
  const wx = p1x - q1x, wy = p1y - q1y;
  const a = ux * ux + uy * uy, b = ux * vx + uy * vy, c = vx * vx + vy * vy;
  const d = ux * wx + uy * wy, e = vx * wx + vy * wy;
  const D = a * c - b * b;
  let sN, sD = D, tN, tD = D;
  if (D < 1e-6) {
    sN = 0; sD = 1; tN = e; tD = c;
  } else {
    sN = b * e - c * d;
    tN = a * e - b * d;
    if (sN < 0) { sN = 0; tN = e; tD = c; } else if (sN > sD) { sN = sD; tN = e + b; tD = c; }
  }
  if (tN < 0) {
    tN = 0;
    if (-d < 0) sN = 0; else if (-d > a) sN = sD; else { sN = -d; sD = a; }
  } else if (tN > tD) {
    tN = tD;
    if (-d + b < 0) sN = 0; else if (-d + b > a) sN = sD; else { sN = -d + b; sD = a; }
  }
  const sc = Math.abs(sN) < 1e-6 ? 0 : sN / sD;
  const tc = Math.abs(tN) < 1e-6 ? 0 : tN / tD;
  const dx = wx + sc * ux - tc * vx;
  const dy = wy + sc * uy - tc * vy;
  return Math.sqrt(dx * dx + dy * dy);
}

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init(data) {
    this.startMode = data?.mode || "menu";
    this.startShield = !!data?.shield;
  }

  /* ================================================================ SETUP */

  create() {
    const reg = this.registry;
    this.H = reg.get("H");
    this.R = reg.get("R");
    this.floorY = this.H - FLOOR_OFFSET;
    this.playTop = CEIL_H + 2;
    this.playBottom = this.floorY;
    this.playerX = PHYSICS.playerX;
    this.lowFx = save.data.settings.lowFx;

    const cam = this.cameras.main;
    cam.setOrigin(0, 0);
    cam.setZoom(this.R);
    cam.setScroll(0, 0);
    cam.setRoundPixels(false);

    bakeMenuArt(this, this.H, this.floorY);
    this.createPilotAnims();

    this.state = "menu";
    this.leaving = false;
    // Phaser reuses this scene for every run, so per-run flags are reset here.
    this.finished = false;
    this.adBusy = false;
    this.doubled = false;
    this.meters = 0;
    this.runCoins = 0;
    this.baseSpeed = SPEED.menu;
    this.worldSpeed = SPEED.menu;
    this.speedFactor = 1;
    this.hitStop = 0;
    this.invuln = 0;
    this.shield = false;
    this.chrono = 0;
    this.chronoMax = 1;
    this.magnet = 0;
    this.magnetMax = 1;
    this.ghost = 0;
    this.ghostMax = 1;
    this.revived = false;
    this.bestAtStart = 0; // the best is a score now (meters + coins), shown on the results
    this.bestScore = save.data.best;
    this.bestBeaten = false;
    this.thrusting = false;
    this.everThrusted = false;
    this.pointersDown = new Set();
    this.onGround = false;

    this.buildWorld();
    this.buildPools();
    this.buildPlayer();
    this.buildFx();
    this.bindInput();

    this.audio = new Audio(this);
    this.audio.init();
    this.audio.applyMute();
    this.rules = null; // created for each run (classic.js)
    this.veh = null; // vehicles (vehicles.js), also per run
    this.ui = ui;

    ui.bind(this);
    this.events.once("shutdown", () => this.teardown());
    // Web build pauses on tab switch; YouTube uses its own onPause signal (see main.js).
    if (!platform.isYouTube) this.game.events.on("hidden", this.onHidden, this);

    if (this.startMode === "run") {
      this.startRun(true, this.startShield);
      this.loadDeferred(); // in case a restart cut a background download short
    } else this.enterMenu();
  }

  teardown() {
    this.game.events.off("hidden", this.onHidden, this);
    this.input.keyboard?.removeAllListeners();
    this.audio?.stopAllLoops();
    this.audio?.destroy();
  }

  // Every pilot uses one shared animation sheet layout: the same seven rows,
  // six frames each, identical frame rates and the same state mapping as the
  // original default pilot (landing/falling = take-off played in reverse).
  createPilotAnims() {
    const range = [0, 1, 2, 3, 4, 5];
    const SHEET = [
      // name     row        frames                 fps  repeat
      ["idle", "idle", range, 6, -1],
      ["run", "run", range, 16, -1],
      ["takeoff", "takeoff", range, 14, 0],
      ["fly", "fly", range, 14, -1],
      ["land", "takeoff", [5, 4, 3, 2, 1, 0], 14, 0],
      ["hurt", "hurt", range, 12, 0],
      ["tumble", "tumble", range, 12, -1],
      ["death", "death", range, 8, 0]
    ];
    for (const p of PILOTS) {
      const id = p.id;
      if (this.anims.exists(`${id}-run`) || !this.textures.exists(id)) continue;
      for (const [name, row, frames, frameRate, repeat] of SHEET) {
        this.anims.create({
          key: `${id}-${name}`,
          frames: frames.map((i) => ({ key: id, frame: `${row}-${i}` })),
          frameRate,
          repeat
        });
      }
    }
  }

  buildWorld() {
    const H = this.H;
    this.sky = this.add.graphics().setDepth(0);
    this.skyColors = THEME.sky.slice();
    this.drawSky(this.skyColors);

    const bgs = artScale("bg-far");
    this.bgFar = this.add.tileSprite(0, 0, W, H, "bg-far").setOrigin(0).setDepth(1);
    this.bgFar.setTileScale(bgs, bgs);
    this.bgFar.setTint(THEME.tint);
    this.bgFar.setAlpha(0.9);
    this.bgMid = this.add.tileSprite(0, 0, W, H, "bg-mid").setOrigin(0).setDepth(2);
    this.bgMid.setTileScale(bgs, bgs);
    this.bgMid.setTint(0x9fb2dc).setAlpha(0.8);

    // Tinted haze band gives the lab depth.
    this.haze = art(this, W / 2, this.floorY - 40, "glow").setDepth(2.5).setBlendMode(Phaser.BlendModes.ADD);
    this.haze.setDisplaySize(W * 2.2, 260).setAlpha(0.22).setTint(THEME.tint);

    this.lightCones = [];
    for (let i = 0; i < 3; i++) {
      const cone = art(this, 60 + i * 150, CEIL_H - 6, "ceiling-light").setOrigin(0.5, 0).setDepth(3);
      cone.setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.55);
      cone.setDisplaySize(130, Math.min(260, this.floorY - CEIL_H));
      this.lightCones.push(cone);
    }

    const cs = artScale("ceiling");
    this.ceiling = this.add.tileSprite(0, 0, W, CEIL_H, "ceiling").setOrigin(0).setDepth(20);
    this.ceiling.setTileScale(cs, cs);
    const fs = artScale("floor");
    this.floor = this.add.tileSprite(0, this.floorY, W, H - this.floorY, "floor").setOrigin(0).setDepth(20);
    this.floor.setTileScale(fs, fs);
    this.floorGlow = art(this, W / 2, this.floorY, "glow").setDepth(20.5).setBlendMode(Phaser.BlendModes.ADD);
    this.floorGlow.setDisplaySize(W * 1.6, 26).setTint(THEME.tint).setAlpha(0.55);

    this.vignette = art(this, W / 2, H / 2, "vignette").setDepth(40).setDisplaySize(W, H).setAlpha(0.7);
    this.chronoTint = this.add.rectangle(W / 2, H / 2, W, H, PALETTE.violet, 1).setDepth(39).setAlpha(0);
    this.chronoTint.setBlendMode(Phaser.BlendModes.ADD);
    this.flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 1).setDepth(60).setAlpha(0);

    this.radar = this.add.graphics().setDepth(38);

    // Best-distance flag
    this.bestFlag = art(this, -100, this.floorY - 75, "flag").setDepth(4).setVisible(false);
    this.bestFlagText = this.add
      .text(-100, this.playTop + 14, "BEST", { fontFamily: "Lilita One, sans-serif", fontSize: "15px", color: "#ffc233" })
      .setResolution(this.R)
      .setDepth(4)
      .setVisible(false)
      .setShadow(0, 2, "#000", 4);
    this.bestFlag.setDisplaySize(40, this.floorY - this.playTop);
    this.bestFlag.setPosition(-100, (this.floorY + this.playTop) / 2);
  }

  drawSky([top, bottom]) {
    this.sky.clear();
    this.sky.fillGradientStyle(top, top, bottom, bottom, 1);
    this.sky.fillRect(0, 0, W, this.H);
  }

  buildPools() {
    this.zappers = [];
    this.saws = [];
    this.coins = [];
    this.powerups = [];
    this.missiles = [];
    this.warnings = [];
    this.markers = [];
    this.barrage = null;
    this.flyingCoins = [];
    this.pool = { zap: [], saw: [], coin: [], pu: [], missile: [], warn: [], fly: [] };
  }

  buildPlayer() {
    const id = save.data.pilot;
    this.pilotId = this.textures.exists(id) ? id : "scout";
    this.pilotMeta = PILOT_META[this.pilotId] || PILOT_META.scout;
    this.player = { x: this.playerX, y: this.floorY - BODY_HALF, vy: 0 };
    this.shadow = art(this, this.playerX, this.floorY + 2, "glow").setDepth(19).setTint(0x000000).setAlpha(0.5);
    this.shadow.setDisplaySize(70, 14);
    this.jetGlow = art(this, 0, 0, "glow").setDepth(9).setBlendMode(Phaser.BlendModes.ADD).setTint(0xff8a3d).setAlpha(0);
    this.sprite = this.add.sprite(this.player.x, this.player.y, this.pilotId, "idle-0").setDepth(10).setScale(PILOT_SCALE);
    this.sprite.play(`${this.pilotId}-idle`);
    this.shieldImg = art(this, 0, 0, "shield").setDepth(11).setVisible(false);
    this.shieldImg.setDisplaySize(96, 96);
    this.magnetRing = art(this, 0, 0, "ring").setDepth(8).setVisible(false).setTint(PALETTE.magnet).setBlendMode(Phaser.BlendModes.ADD);
  }

  setPilot(id) {
    if (!this.textures.exists(id)) return;
    this.pilotId = id;
    this.pilotMeta = PILOT_META[id] || PILOT_META.scout;
    this.sprite.setTexture(id, "fly-0");
    this.anim(this.state === "menu" ? "fly" : "run", true);
    this.fxSpark.particleTint = 0xffe08a;
    this.fxSpark.explode(18, this.sprite.x, this.sprite.y);
    this.audio.success();
  }

  buildFx() {
    const s = artScale("spark");
    this.thrustFx = this.add.particles(0, 0, "spark", {
      emitting: false,
      lifespan: { min: 180, max: 340 },
      speedX: { min: -260, max: -120 },
      speedY: { min: 90, max: 240 },
      scale: { start: 1.1 * s, end: 0 },
      tint: [0xfff1a8, 0xffb347, 0xff6a3d],
      blendMode: "ADD"
    }).setDepth(9);
    this.smokeFx = this.add.particles(0, 0, "smoke", {
      emitting: false,
      lifespan: { min: 420, max: 700 },
      speedX: { min: -200, max: -120 },
      speedY: { min: 30, max: 110 },
      scale: { start: 0.25, end: 0.9 },
      alpha: { start: 0.28, end: 0 },
      tint: 0xb8c4e0
    }).setDepth(7);
    this.dustFx = this.add.particles(0, 0, "smoke", {
      emitting: false,
      lifespan: 380,
      speedX: { min: -220, max: -80 },
      speedY: { min: -60, max: -10 },
      scale: { start: 0.12, end: 0.5 },
      alpha: { start: 0.35, end: 0 },
      tint: 0x9fb4d8
    }).setDepth(19);
    this.fxSpark = this.add.particles(0, 0, "spark", {
      emitting: false,
      lifespan: { min: 300, max: 620 },
      speed: { min: 80, max: 340 },
      scale: { start: 1.3 * s, end: 0 },
      blendMode: "ADD"
    }).setDepth(30);
    this.missileSmoke = this.add.particles(0, 0, "smoke", {
      emitting: false,
      lifespan: { min: 380, max: 600 },
      speedX: { min: 30, max: 90 },
      speedY: { min: -20, max: 20 },
      scale: { start: 0.2, end: 0.7 },
      alpha: { start: 0.3, end: 0 },
      tint: 0xd0d8ec
    }).setDepth(12);
    this.motes = this.add.particles(0, 0, "spark", {
      x: { min: 0, max: W + 40 },
      y: { min: this.playTop, max: this.floorY },
      lifespan: 6000,
      speedX: { min: -40, max: -10 },
      speedY: { min: -8, max: 8 },
      scale: { start: 0.5 * s, end: 0.2 * s },
      alpha: { start: 0.5, end: 0 },
      frequency: this.lowFx ? 700 : 260,
      tint: THEME.tint,
      blendMode: "ADD"
    }).setDepth(3);
    this.streaks = this.add.particles(0, 0, "streak", {
      emitting: false,
      x: W + 30,
      y: { min: this.playTop, max: this.floorY },
      lifespan: 500,
      speedX: { min: -1300, max: -900 },
      scaleX: { min: 0.8 * artScale("streak"), max: 1.8 * artScale("streak") },
      scaleY: artScale("streak"),
      alpha: { start: 0.35, end: 0 },
      blendMode: "ADD"
    }).setDepth(5);
  }

  bindInput() {
    this.input.addPointer(2);
    const down = (p) => {
      this.pointersDown.add(p.id);
      this.taps = (this.taps || 0) + 1; // counted, so a tap shorter than a frame still registers
      this.audio?.unlock();
    };
    const up = (p) => this.pointersDown.delete(p.id);
    this.input.on("pointerdown", down);
    this.input.on("pointerup", up);
    this.input.on("pointerupoutside", up);
    this.input.on("gameout", () => this.pointersDown.clear());
    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys({ space: "SPACE", up: "UP", w: "W" });
      kb.on("keydown-SPACE", (e) => {
        this.audio?.unlock();
        if (!e.repeat) this.taps = (this.taps || 0) + 1;
      });
      kb.on("keydown-UP", (e) => { if (!e.repeat) this.taps = (this.taps || 0) + 1; });
      kb.on("keydown-W", (e) => { if (!e.repeat) this.taps = (this.taps || 0) + 1; });
    }
  }

  /** Taps since the last call (so vehicles never miss a quick tap). */
  takeTaps() {
    const n = this.taps || 0;
    this.taps = 0;
    return n;
  }

  inputHeld() {
    if (this.pointersDown.size > 0) return true;
    const k = this.keys;
    return !!(k && (k.space.isDown || k.up.isDown || k.w.isDown));
  }

  /* =========================================================== LIFECYCLE */

  enterMenu() {
    this.state = "menu";
    this.player.y = this.H * 0.5;
    this.player.x = W / 2;
    this.anim("fly", true);
    ui.showMenu();
    this.audio.setLoop("music", true);
    if (!this.game.__jdReady) {
      this.game.__jdReady = true;
      ui.hideLoader();
      platform.gameReady();
      // Keep YouTube's score in sync with the saved best from the start.
      if (save.data.best > 0) platform.sendScore(save.data.best);
    }
    // Run-only art, painted once the menu has had a few frames on screen.
    this.time.delayedCall(250, () => bakeRunArt(this));
    this.loadDeferred();
  }

  // Everything the menu doesn't need downloads after gameReady: sounds first
  // (they can't play before the player's first tap anyway), then the "coming
  // soon" pilots, which only appear as portraits in the Pilots screen.
  loadDeferred() {
    if (!this.game.__jdReady || this.load.isLoading()) return;
    this.load.setPath("assets/");
    const sounds = soundTries < 2 ? Object.entries(AUDIO_FILES).filter(([key]) => !this.cache.audio.exists(key)) : [];
    if (sounds.length) {
      soundTries += 1;
      for (const [key, file] of sounds) this.load.audio(key, `audio/${file}.mp3`);
      this.load.once("complete", () => {
        this.audio?.attach();
        this.loadDeferred();
      });
      this.load.start();
      return;
    }
    const pilots = PILOTS.filter((p) => !this.textures.exists(p.id));
    if (!pilots.length) return;
    for (const p of pilots) this.load.atlas(p.id, `sprites/${p.id}.webp`, `sprites/${p.id}.json`);
    this.load.once("complete", () => this.createPilotAnims());
    this.load.start();
  }

  setRenderScale(R) {
    this.R = R;
    this.cameras.main.setZoom(R);
    this.bestFlagText?.setResolution(R);
  }

  startRun(immediate = false, freeShield = false) {
    if (this.state === "run") return;
    bakeRunArt(this); // usually already done in the background after the menu appeared
    this.audio.unlock();
    ui.hideMenu();
    ui.showHud(true);
    this.state = "run";
    this.runStartedAt = this.time.now;
    save.data.runs += 1;
    save.commit();

    this.rules = new Rules(this, { minY: this.playTop + BODY_HALF - 6, maxY: this.floorY - BODY_HALF });
    this.veh = new Vehicles(this, { minY: this.playTop + BODY_HALF - 6, maxY: this.floorY - BODY_HALF, k: this.rules.k });
    const shieldLvl = save.data.upgrades.shield || 0;
    if (shieldLvl > 0 && Math.random() < shieldLvl * 0.2) this.time.delayedCall(600, () => this.activatePowerup("shield", true));

    if (immediate) {
      this.player.x = this.playerX;
      this.player.y = this.floorY - BODY_HALF;
      this.player.vy = 0;
      this.onGround = true;
      this.anim("run", true);
    } else {
      // Glide from the menu hover position into the run lane.
      this.tweens.add({ targets: this.player, x: this.playerX, duration: 650, ease: "Cubic.easeInOut" });
    }
    if (!save.data.tutorialSeen) ui.hint(true);
    this.audio.setLoop("music", true);
  }

  onHidden() {
    if (this.state === "run" && !this.scene.isPaused()) this.pause();
  }

  pause() {
    if (this.state !== "run" || this.scene.isPaused()) return;
    this.pointersDown.clear();
    this.audio.stopAllLoops();
    this.sound.pauseAll();
    this.scene.pause();
    ui.showPause();
  }

  resume() {
    if (!this.scene.isPaused()) return;
    ui.hidePause();
    this.pointersDown.clear();
    this.sound.resumeAll();
    this.scene.resume();
    this.audio.setLoop("music", true);
  }

  restart() {
    this.leave("run");
  }

  // YouTube only: rewarded ad that starts the next run with a shield already on.
  // From the menu it starts the run in place; from results it restarts with the shield.
  async shieldStart() {
    if (!platform.hasAds || this.leaving || this.adBusy) return false;
    if (this.state !== "menu" && this.state !== "dead") return false;
    this.adBusy = true;
    const fromResults = this.state === "dead";
    this.audio.stopAllLoops();
    this.sound.pauseAll();
    const ok = await platform.rewarded("shield_start");
    this.sound.resumeAll();
    this.adBusy = false;
    if (!ok) {
      if (!fromResults) this.audio.applySettings(true);
      return false;
    }
    if (fromResults) this.leave("run", { shield: true, skipAd: true });
    else this.startRun(false, true);
    return true;
  }

  goHome() {
    this.leave("menu");
  }

  // YouTube only: a short ad at a natural break, never before the 3rd run and
  // at most once every 3 runs. Only shown when leaving the results screen.
  async leave(mode, opts = {}) {
    if (this.leaving) return;
    this.leaving = true;
    const fromResults = this.state === "dead";
    this.audio.stopAllLoops();
    if (fromResults && !opts.skipAd && platform.hasAds && save.data.runs >= 3 && save.data.runsSinceAd >= 3) {
      save.data.runsSinceAd = 0;
      save.commit();
      ui.busy(true);
      this.sound.pauseAll();
      await platform.interstitial();
      ui.busy(false);
    }
    this.sound.resumeAll();
    ui.resetRun();
    this.scene.restart({ mode, shield: !!opts.shield });
  }

  applySettings() {
    this.audio.applySettings(this.state !== "dead" && !this.scene.isPaused());
    this.lowFx = save.data.settings.lowFx;
    this.motes.frequency = this.lowFx ? 700 : 260;
  }

  toggleSound() {
    save.data.settings.sound = !save.data.settings.sound;
    save.commit();
    this.audio.unlock();
    this.audio.applySettings(this.state !== "dead" && !this.scene.isPaused());
    ui.syncSound();
  }

  /* ============================================================ SPAWNING */

  take(poolName, make) {
    const pool = this.pool[poolName];
    return pool.length ? pool.pop() : make();
  }

  spawnZapper({ x, y, len, angle = 0, spin = 0, bob = null }) {
    const z = this.take("zap", () => {
      const glow = art(this, 0, 0, "beam").setBlendMode(Phaser.BlendModes.ADD);
      const core = art(this, 0, 0, "beam").setBlendMode(Phaser.BlendModes.ADD);
      const crackle = this.add.tileSprite(0, 0, 64, 26, "crackle").setBlendMode(Phaser.BlendModes.ADD);
      const cs = artScale("crackle");
      crackle.setTileScale(cs, cs);
      const haloA = art(this, 0, 0, "glow").setBlendMode(Phaser.BlendModes.ADD).setTint(0xff3b5c);
      const haloB = art(this, 0, 0, "glow").setBlendMode(Phaser.BlendModes.ADD).setTint(0xff3b5c);
      const nodeA = art(this, 0, 0, "emitter");
      const nodeB = art(this, 0, 0, "emitter");
      haloA.setDisplaySize(64, 64).setAlpha(0.5);
      haloB.setDisplaySize(64, 64).setAlpha(0.5);
      const c = this.add.container(0, 0, [glow, core, crackle, haloA, haloB, nodeA, nodeB]).setDepth(6);
      return { c, glow, core, crackle, haloA, haloB, nodeA, nodeB };
    });
    z.x = x;
    z.y = z.baseY = y;
    z.len = len;
    z.angle = angle;
    z.spin = spin;
    z.bob = bob ? { amp: bob.amp, speed: bob.speed, phase: bob.phase ?? Math.random() * 6.28 } : null;
    z.t = Math.random() * 10;
    z.kind = "zap";
    z.dead = false;
    const inner = len - 20;
    z.glow.setDisplaySize(inner, 46).setAlpha(0.5);
    z.core.setDisplaySize(inner, 22);
    z.crackle.setSize(inner, 26);
    z.nodeA.x = z.haloA.x = -len / 2;
    z.nodeB.x = z.haloB.x = len / 2;
    z.nodeA.rotation = 0;
    z.nodeB.rotation = Math.PI;
    z.c.setVisible(true).setAlpha(1).setScale(1);
    z.c.setPosition(x, y).setRotation(angle);
    this.zappers.push(z);
    return z;
  }

  spawnSaw({ x, speed, phase }) {
    const s = this.take("saw", () => {
      const rail = this.add.tileSprite(0, 0, 14, 100, "rail");
      const rs = artScale("rail");
      rail.setTileScale(rs, rs);
      const capT = art(this, 0, 0, "rail-cap");
      const capB = art(this, 0, 0, "rail-cap");
      const glow = art(this, 0, 0, "glow").setBlendMode(Phaser.BlendModes.ADD).setTint(0xff3b5c).setAlpha(0.35);
      glow.setDisplaySize(120, 120);
      const blur = art(this, 0, 0, "saw-blur").setBlendMode(Phaser.BlendModes.ADD);
      const blade = art(this, 0, 0, "saw");
      const c = this.add.container(0, 0, [rail, capT, capB, glow, blade, blur]).setDepth(6);
      return { c, rail, capT, capB, glow, blade, blur };
    });
    const top = this.playTop;
    const bottom = this.floorY;
    s.rail.setSize(14, bottom - top);
    s.rail.setPosition(0, (top + bottom) / 2);
    s.capT.setPosition(0, top + 6);
    s.capB.setPosition(0, bottom - 6);
    s.mid = (top + bottom) / 2;
    s.amp = (bottom - top) / 2 - 48;
    s.x = x;
    s.speed = speed;
    s.phase = phase;
    s.t = 0;
    s.y = s.mid;
    s.kind = "saw";
    s.dead = false;
    s.c.setVisible(true).setAlpha(1).setPosition(x, 0);
    this.saws.push(s);
  }

  spawnCoins(points) {
    for (const [x, y] of points) {
      const c = this.take("coin", () => {
        const sp = this.add.sprite(0, 0, "coin", "c0").setDepth(7);
        sp.setScale(artScale("coin"));
        return { sp };
      });
      c.x = x;
      c.y = y;
      c.pulled = false;
      c.sp.setVisible(true).setPosition(x, y).setAlpha(1);
      c.sp.play({ key: "coin-spin", startFrame: Math.floor(((x * 0.05) % 10 + 10) % 10) });
      this.coins.push(c);
    }
  }

  spawnCoinLine(x, y, count, spacing) {
    const pts = [];
    for (let i = 0; i < count; i++) pts.push([x + i * spacing, clamp(y, this.playTop + 30, this.floorY - 24)]);
    this.spawnCoins(pts);
  }

  canOfferPowerup(type) {
    if (type === "shield") return !this.shield;
    if (type === "chrono") return this.chrono <= 0;
    if (type === "magnet") return this.magnet <= 0;
    if (type === "ghost") return this.ghost <= 0;
    return true;
  }

  spawnPowerup(type, x, y) {
    const p = this.take("pu", () => {
      const glow = art(this, 0, 0, "glow").setBlendMode(Phaser.BlendModes.ADD).setDepth(7);
      const img = art(this, 0, 0, "pu-shield").setDepth(8);
      const ring = art(this, 0, 0, "ring").setBlendMode(Phaser.BlendModes.ADD).setDepth(7);
      return { glow, img, ring };
    });
    p.type = type;
    p.speed = null;
    p.x = x;
    p.y = p.baseY = y;
    p.t = 0;
    p.img.setTexture(`pu-${type}`).setScale(artScale(`pu-${type}`)).setVisible(true);
    p.glow.setTint(POWERUPS[type].color).setDisplaySize(110, 110).setAlpha(0.55).setVisible(true);
    p.ring.setTint(POWERUPS[type].color).setVisible(true);
    this.powerups.push(p);
  }

  spawnMarker(x, fn) {
    this.markers.push({ x, fn });
  }

  /* -------------------------------------------------- missiles & barrage */

  missileDuration(salvo) {
    return 1.15 + 0.45 + (W + 140) / MISSILE_SPEED + (salvo - 1) * 0.55;
  }

  queueMissiles(salvo) {
    if (this.state !== "run") return;
    for (let i = 0; i < salvo; i++) {
      const w = this.takeWarning();
      w.t = -i * 0.55;
      w.y = clamp(this.player.y + (i ? (i % 2 ? -1 : 1) * 70 * Math.ceil(i / 2) : 0), this.playTop + 24, this.floorY - 24);
      w.locked = false;
      w.fired = false;
      w.img.setTexture("warn").setVisible(false);
      w.glow.setVisible(false).setDisplaySize(90, 90);
      this.warnings.push(w);
    }
  }

  takeWarning() {
    return this.take("warn", () => {
      const glow = art(this, 0, 0, "glow").setBlendMode(Phaser.BlendModes.ADD).setDepth(36).setTint(0xff2e55);
      const img = art(this, 0, 0, "warn").setDepth(37);
      return { img, glow };
    });
  }

  launchMissile(y, x = W + 70, speed = null) {
    const m = this.take("missile", () => {
      const flame = art(this, 0, 0, "flame").setOrigin(0, 0.5).setBlendMode(Phaser.BlendModes.ADD).setDepth(12);
      const glow = art(this, 0, 0, "glow").setBlendMode(Phaser.BlendModes.ADD).setTint(0xff7a3d).setDepth(12);
      const img = art(this, 0, 0, "missile").setDepth(13);
      return { img, flame, glow };
    });
    m.x = x;
    m.y = y;
    m.speed = speed;
    m.t = 0;
    m.kind = "missile";
    m.dead = false;
    m.passed = false;
    m.img.setVisible(true).setAlpha(1).setScale(artScale("missile") * 0.85);
    m.flame.setVisible(true).setFlipX(true);
    m.glow.setVisible(true).setDisplaySize(70, 50);
    this.missiles.push(m);
    this.audio.play("thrust", { volume: 0.4, rate: 1.6 });
    return m;
  }

  barrageDuration() {
    return BARRAGE.charge + BARRAGE.fire + BARRAGE.retract + 0.2;
  }

  startBarrage(rows) {
    if (this.state !== "run" || this.barrage) return;
    const beams = rows.map((y) => {
      const podL = art(this, -30, y, "pod").setDepth(21);
      const podR = art(this, W + 30, y, "pod").setDepth(21).setFlipX(true);
      const line = art(this, W / 2, y, "beam").setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
      line.setDisplaySize(W - 40, 4).setAlpha(0);
      const glow = art(this, W / 2, y, "beam").setDepth(6).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      const core = art(this, W / 2, y, "beam").setDepth(6).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      const crackle = this.add.tileSprite(W / 2, y, W - 40, 26, "crackle").setDepth(6).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      const cs = artScale("crackle");
      crackle.setTileScale(cs, cs);
      glow.setDisplaySize(W - 40, 60);
      core.setDisplaySize(W - 40, 26);
      this.tweens.add({ targets: podL, x: 18, duration: 260, ease: "Back.easeOut" });
      this.tweens.add({ targets: podR, x: W - 18, duration: 260, ease: "Back.easeOut" });
      return { y, podL, podR, line, glow, core, crackle };
    });
    this.barrage = { t: 0, beams, firing: false, fired: false };
    this.audio.play("warn", { volume: 0.4, rate: 1.25 });
  }

  endBarrage() {
    if (!this.barrage) return;
    for (const b of this.barrage.beams) {
      [b.podL, b.podR, b.line, b.glow, b.core, b.crackle].forEach((o) => o.destroy());
    }
    this.barrage = null;
  }

  /* ============================================================ POWERUPS */

  activatePowerup(type, silent = false, duration = null) {
    const def = POWERUPS[type];
    const lv = save.data.upgrades[type] || 0;
    const secs = duration ?? (def.duration ? def.duration(lv) : 0);
    if (type === "shield") {
      this.shield = true;
      this.shieldImg.setVisible(true).setAlpha(0);
      this.tweens.add({ targets: this.shieldImg, alpha: 1, duration: 200 });
    } else if (type === "chrono") {
      this.chronoMax = this.chrono = secs;
    } else if (type === "magnet") {
      this.magnetMax = this.magnet = def.duration(lv);
    } else if (type === "ghost") {
      this.ghostMax = this.ghost = secs;
    }
    this.fxSpark.particleTint = def.color;
    this.fxSpark.explode(this.lowFx ? 10 : 22, this.player.x, this.player.y);
    this.ringBurst(this.player.x, this.player.y, def.color);
    ui.toast(def.label.toUpperCase(), def.css);
    if (!silent) {
      this.audio.play("powerup", { volume: 0.6 });
      this.audio.haptic(20);
    }
  }

  ringBurst(x, y, color, size = 1) {
    const r = art(this, x, y, "ring").setDepth(31).setTint(color).setBlendMode(Phaser.BlendModes.ADD);
    r.setDisplaySize(30 * size, 30 * size);
    this.tweens.add({
      targets: r,
      displayWidth: 180 * size,
      displayHeight: 180 * size,
      alpha: 0,
      duration: 460,
      ease: "Cubic.easeOut",
      onComplete: () => r.destroy()
    });
  }

  /* ============================================================== DAMAGE */

  hit(source) {
    // Ghost: every hazard passes straight through.
    if (this.ghost > 0) return;
    if (this.invuln > 0 || this.state !== "run") return;
    if (this.veh?.riding) {
      this.veh.eject();
      if (source) this.destroyHazard(source);
      return;
    }
    if (this.shield) {
      this.shield = false;
      this.invuln = 1.3;
      this.hitStop = 0.08;
      this.tweens.add({ targets: this.shieldImg, alpha: 0, scale: this.shieldImg.scale * 1.6, duration: 260, onComplete: () => this.shieldImg.setVisible(false).setDisplaySize(96, 96) });
      this.fxSpark.particleTint = PALETTE.cyan;
      this.fxSpark.explode(this.lowFx ? 14 : 30, this.player.x, this.player.y);
      this.ringBurst(this.player.x, this.player.y, PALETTE.cyan, 1.4);
      this.shake(160, 0.006);
      this.audio.play("impact", { volume: 0.45, rate: 1.3 });
      this.audio.tone(380, 0.24, 0.05, "triangle", 900);
      this.audio.haptic([30, 40, 30]);
      this.player.vy = PHYSICS.shieldKnock;
      this.anim("hurt", true);
      this.hurtUntil = this.time.now + 450;
      if (source) this.destroyHazard(source);
      ui.toast("SHIELD BROKEN", "#3ee8ff");
      return;
    }
    this.crash(source?.kind === "missile" ? "boom" : "impact");
  }

  destroyHazard(h) {
    if (!h || h.dead) return;
    h.dead = true;
    const c = h.c || h.img;
    const x = h.x, y = h.y ?? this.player.y;
    this.fxSpark.particleTint = 0xff6b86;
    this.fxSpark.explode(this.lowFx ? 10 : 20, x, y);
    if (h.kind === "missile") this.explode(h.x, h.y);
    if (c) this.tweens.add({ targets: c, alpha: 0, duration: 200 });
  }

  explode(x, y) {
    this.fxSpark.particleTint = 0xffb347;
    this.fxSpark.explode(this.lowFx ? 14 : 34, x, y);
    this.ringBurst(x, y, 0xffb347, 1.2);
    const g = art(this, x, y, "glow").setDepth(31).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffd27a);
    g.setDisplaySize(150, 150);
    this.tweens.add({ targets: g, alpha: 0, displayWidth: 260, displayHeight: 260, duration: 320, onComplete: () => g.destroy() });
    this.audio.play("boom", { volume: 0.5 });
  }

  crash(sound) {
    this.state = "crash";
    this.hitStop = 0.12;
    this.speedFactor = 0; // the remake stops everything the moment you're hit
    this.onGround = false;
    this.anim("hurt", true);
    this.flashScreen(0.55);
    this.shake(300, 0.014);
    this.fxSpark.particleTint = 0xffc233;
    this.fxSpark.explode(this.lowFx ? 16 : 36, this.player.x, this.player.y);
    this.ringBurst(this.player.x, this.player.y, PALETTE.laser, 1.3);
    this.audio.play(sound, { volume: 0.6 });
    this.audio.haptic([60, 40, 120]);
    this.audio.setLoop("thrust", false);
    this.audio.setLoop("run", false);
    for (const w of this.warnings) this.recycleWarning(w);
    this.warnings.length = 0;
    this.chrono = 0;
    this.magnet = 0;
    this.ghost = 0;
    if (this.veh?.riding) this.veh.dismount();
    ui.hint(false);
  }

  onCrashLanded() {
    this.state = "dead";
    this.anim("death", true);
    this.deadAt = this.time.now;
    // One hit ends the run: no revive.
    this.time.delayedCall(RULES.finishDelay * 1000, () => this.finishRun());
  }

  offerReviveOrFinish() {
    const cost = REVIVE_COST;
    const balance = save.data.coins + this.runCoins;
    const canPay = balance >= cost;
    const canAd = platform.hasAds;
    if (!this.revived && (canPay || canAd) && this.meters > 80) {
      ui.offerRevive({
        cost,
        balance,
        canPay,
        canAd,
        onAccept: () => this.revive(cost),
        onAd: async () => {
          this.sound.pauseAll();
          const ok = await platform.rewarded("revive");
          this.sound.resumeAll();
          if (ok) this.revive(0);
          return ok;
        },
        onDecline: () => this.finishRun()
      });
    } else {
      this.finishRun();
    }
  }

  revive(cost = 0) {
    // Pay from the run's pickups first, then the bank (cost 0 = rewarded ad).
    const fromRun = Math.min(this.runCoins, cost);
    this.runCoins -= fromRun;
    save.data.coins -= cost - fromRun;
    save.commit();
    this.revived = true;
    this.state = "run";
    this.invuln = 2.6;
    this.speedFactor = 1;
    this.player.vy = PHYSICS.maxRise;
    this.player.y = Math.min(this.player.y, this.floorY - BODY_HALF);
    this.anim("fly", true);
    // Clear everything near the pilot so the second chance is fair.
    for (const z of this.zappers) if (z.x < W + 60) this.destroyHazard(z);
    for (const s of this.saws) if (s.x < W + 60) this.destroyHazard(s);
    for (const m of this.missiles) this.destroyHazard(m);
    this.endBarrage();
    this.ringBurst(this.player.x, this.player.y, PALETTE.gold, 1.6);
    this.audio.success();
    ui.showHud(true);
  }

  finishRun() {
    if (this.state !== "dead" || this.finished) return;
    this.finished = true;
    const meters = Math.floor(this.meters);
    const score = meters + this.runCoins; // the remake's FINAL SCORE
    const prevBest = save.data.best;
    const isBest = score > prevBest;
    save.data.coins += this.runCoins;
    save.data.runsSinceAd += 1;
    if (isBest) save.data.best = score;
    save.commit();
    if (isBest) platform.sendScore(save.data.best);
    ui.showHud(false);
    this.doubled = false;
    ui.showResults({ meters, coins: this.runCoins, score, best: save.data.best, isBest });
    this.audio.setLoop("music", false);
    if (isBest) this.audio.success();
  }

  // Rewarded ad on the results screen: the run's coins are paid out again.
  async doubleCoins() {
    if (this.doubled || this.runCoins <= 0) return false;
    this.sound.pauseAll();
    const ok = await platform.rewarded("double_coins");
    this.sound.resumeAll();
    if (!ok || this.doubled) return false;
    this.doubled = true;
    save.data.coins += this.runCoins;
    save.commit();
    this.audio.success();
    return true;
  }

  /* ================================================================= FX */

  shake(ms, intensity) {
    if (this.lowFx) intensity *= 0.35;
    this.cameras.main.shake(ms, intensity);
  }

  flashScreen(alpha) {
    this.flash.setAlpha(this.lowFx ? alpha * 0.4 : alpha);
    this.tweens.add({ targets: this.flash, alpha: 0, duration: 260 });
  }

  anim(name, force = false) {
    const key = `${this.pilotId}-${name}`;
    if (!force && this.sprite.anims.currentAnim?.key === key && this.sprite.anims.isPlaying) return;
    // One-shot "land" holds its last frame while falling instead of restarting.
    if (!force && this.sprite.anims.currentAnim?.key === key && name === "land") return;
    this.sprite.play(key);
  }

  flyCoin(x, y) {
    const target = ui.coinTarget();
    if (!target) return;
    const f = this.take("fly", () => art(this, 0, 0, "coin", "c0").setDepth(45));
    f.setVisible(true).setPosition(x, y).setScale(artScale("coin") * 0.9).setAlpha(1);
    this.tweens.add({
      targets: f,
      x: target.x,
      y: target.y,
      scale: artScale("coin") * 0.55,
      duration: 420 + Math.random() * 120,
      ease: "Cubic.easeIn",
      onComplete: () => {
        f.setVisible(false);
        this.pool.fly.push(f);
        ui.pulseCoin();
      }
    });
  }

  /* ============================================================== UPDATE */

  update(time, deltaMs) {
    let dt = Math.min(deltaMs / 1000, 1 / 30);
    this.audio.update(dt);
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      return;
    }

    this.updateSpeed(dt);
    const move = this.worldSpeed * dt;
    this.scrollWorld(move, dt);

    if (this.state === "menu") {
      this.updateMenuPilot(time, dt);
    } else if (this.state === "run") {
      this.meters += RULES.metersPerSecond * dt; // the remake counts 1 m every 11 frames
      this.rules.update(move, dt, time);
      this.veh.update(move, dt, time);
      this.updatePlayer(time, dt);
    } else if (this.state === "crash" || this.state === "dead") {
      this.updateCrash(dt);
    }

    this.updateHazards(move, dt, time);
    this.updateCollectibles(move, dt, time);
    this.updateMissiles(move, dt, time);
    this.updateBarrage(dt);
    this.updateMarkers(move);
    this.updatePlayerFx(time, dt);
    this.updateRadar();
    this.updateBestFlag();
    if (this.state === "run") this.updateHud(dt);
  }

  updateSpeed(dt) {
    if (this.rules && this.state !== "menu") {
      this.baseSpeed = this.rules.speed();
      if (this.state !== "run") this.speedFactor = 0;
      this.chronoLevel = 1;
      this.worldSpeed = this.baseSpeed * this.speedFactor;
      return;
    }
    if (this.state === "menu") {
      this.baseSpeed = SPEED.menu;
    } else {
      const m = this.meters;
      const wide = ORIENT === "horizontal" ? SPEED.wideFactor : 1;
      const target = (SPEED.start + (SPEED.max - SPEED.start) * (1 - Math.exp(-m / SPEED.ramp))) * wide;
      this.baseSpeed = damp(this.baseSpeed, target, 1.5, dt);
    }
    if (this.state === "crash" || this.state === "dead") {
      this.speedFactor = damp(this.speedFactor, 0, this.onGround ? 4 : 1.2, dt);
    } else {
      this.speedFactor = damp(this.speedFactor, 1, 3, dt);
    }
    const chronoFactor = this.chrono > 0 ? 0.6 : 1;
    this.chronoLevel = damp(this.chronoLevel || 1, chronoFactor, 6, dt);
    this.worldSpeed = this.baseSpeed * this.speedFactor * this.chronoLevel;
  }

  scrollWorld(move, dt) {
    // tilePosition is in texture pixels, so convert logical travel.
    this.bgFar.tilePositionX += (move * 0.12) / artScale("bg-far");
    this.bgMid.tilePositionX += (move * 0.38) / artScale("bg-mid");
    this.ceiling.tilePositionX += move / artScale("ceiling");
    this.floor.tilePositionX += move / artScale("floor");
    for (const cone of this.lightCones) {
      cone.x -= move;
      if (cone.x < -70) cone.x += 450;
    }
    const fast = clamp((this.worldSpeed - 330) / 150, 0, 1);
    if (fast > 0 && !this.lowFx && Math.random() < fast * dt * 18) this.streaks.emitParticle(1);
  }

  updateMenuPilot(time, dt) {
    const p = this.player;
    p.y = this.H * 0.5 + Math.sin(time * 0.0022) * 12;
    this.thrusting = true;
    this.menuZoom = damp(this.menuZoom ?? 1.35, 1.35, 6, dt);
    this.sprite.setScale(PILOT_SCALE * this.menuZoom);
    this.sprite.setPosition(p.x, p.y + BODY_HALF - this.pilotMeta.footY * PILOT_SCALE);
    this.sprite.rotation = -0.08 + Math.sin(time * 0.0022 + 1) * 0.04;
  }

  updatePlayer(time, dt) {
    const p = this.player;
    const held = this.inputHeld();
    const wasThrusting = this.thrusting;
    this.thrusting = held;

    if (held && !this.everThrusted) {
      this.everThrusted = true;
      if (!save.data.tutorialSeen) {
        save.data.tutorialSeen = true;
        save.commit();
        this.time.delayedCall(1200, () => ui.hint(false));
      }
    }

    // --- Flight: the remake's physics (classic.js) ---
    const P = PHYSICS;
    const maxY = this.floorY - BODY_HALF;
    const fallSpeed = p.vy;
    const riding = this.veh?.riding;
    if (riding) this.veh.fly(p, held, dt);
    else this.rules.fly(p, held, dt);
    const wasGround = this.onGround;
    this.onGround = p.y >= maxY || (riding && this.veh.id === "flip" && this.veh.gdir < 0 && p.y <= this.playTop + BODY_HALF - 5.5);
    if (riding) this.thrusting = false; // no jetpack flame while riding
    if (this.onGround) {
      if (!wasGround && fallSpeed > P.landDustSpeed) {
        this.dustFx.explode(this.lowFx ? 4 : 9, p.x, this.floorY);
        this.audio.play("impact", { volume: 0.12, rate: 1.8, throttle: 200 });
        this.landUntil = time + 240;
      }
    }

    // Animation state (same mapping for every pilot)
    if (!held && wasThrusting && !this.onGround) this.anim("land", true);
    if (!(this.hurtUntil > time)) {
      if (this.onGround && !held) this.anim(time < (this.landUntil || 0) ? "land" : "run");
      else if (held && !wasThrusting && (this.onGround || wasGround)) {
        this.anim("takeoff", true);
        this.takeoffUntil = time + 200;
      } else if (this.takeoffUntil > time) this.anim("takeoff");
      else if (held) this.anim("fly");
      else this.anim("land");
    }
    const key = this.sprite.anims.currentAnim?.key || "";
    this.sprite.anims.timeScale = key.endsWith("-run")
      ? clamp(this.worldSpeed / 390, 1, 2.1)
      : key.endsWith("-fly") ? clamp(this.worldSpeed / 520, 1, 1.65) : 1;

    if (this.menuZoom > 1.001) {
      this.menuZoom = damp(this.menuZoom, 1, 5, dt);
      this.sprite.setScale(PILOT_SCALE * this.menuZoom);
    }
    const tilt = this.onGround ? 0 : clamp(p.vy / 1400, -0.28, 0.34);
    this.sprite.rotation = damp(this.sprite.rotation, tilt, 8.5, dt);
    // Running bob and tiny squash, as in v1.
    const running = this.onGround && time >= (this.landUntil || 0);
    const bob = running ? Math.sin(time * 0.024) * 1.1 : 0;
    const stretch = running ? 1 + Math.sin(time * 0.024) * 0.004 : 1;
    if (!(this.menuZoom > 1.001)) this.sprite.setScale(PILOT_SCALE * stretch, PILOT_SCALE / stretch);
    this.sprite.setPosition(p.x, p.y + bob + BODY_HALF - this.pilotMeta.footY * PILOT_SCALE);
    if (riding) this.veh.render(time);

    this.audio.setLoop("thrust", held && !riding);
    this.audio.setLoop("run", this.onGround && !held, clamp(this.worldSpeed / 300, 0.85, 1.35));

    if (this.invuln > 0) {
      this.invuln -= dt;
      this.sprite.setAlpha(this.invuln > 0 ? (Math.floor(time / 70) % 2 ? 0.35 : 1) : 1);
    }

    // Power-up timers
    if (this.chrono > 0) this.chrono = Math.max(0, this.chrono - dt);
    if (this.magnet > 0) this.magnet = Math.max(0, this.magnet - dt);
    if (this.ghost > 0) this.ghost = Math.max(0, this.ghost - dt);
  }

  updateCrash(dt) {
    const p = this.player;
    this.thrusting = false;
    if (this.state === "crash") {
      // v1 crash: short pop, heavy gravity, pilot rotates forward, no bounce.
      this.rules.fall(p, dt);
      this.sprite.rotation = lerp(this.sprite.rotation, 1.18, 1 - Math.exp(-7 * dt));
      const maxY = this.floorY - BODY_HALF + 4;
      if (p.y >= maxY) {
        p.y = maxY;
        p.vy = 0;
        this.onGround = true;
        this.sprite.rotation = 0;
        this.dustFx.explode(this.lowFx ? 6 : 14, p.x, this.floorY);
        this.onCrashLanded();
      }
    } else {
      this.sprite.rotation = 0;
    }
    this.sprite.setAlpha(1);
    this.sprite.setPosition(p.x, p.y + BODY_HALF - this.pilotMeta.footY * PILOT_SCALE);
  }

  playerCapsule() {
    const p = this.player;
    const hb = this.veh?.hitbox();
    if (hb) return [p.x, p.y + hb[0], p.x, p.y + hb[1]];
    return [p.x, p.y - PHYSICS.hitHalfHeight, p.x, p.y + PHYSICS.hitHalfHeight];
  }

  hitR() {
    const hb = this.veh?.hitbox();
    return hb ? hb[2] : PHYSICS.hitRadius;
  }

  updateHazards(move, dt, time) {
    const [ax, ay, bx, by] = this.playerCapsule();
    const pr = this.hitR();
    const canHit = this.state === "run";

    for (let i = this.zappers.length - 1; i >= 0; i--) {
      const z = this.zappers[i];
      z.x -= move;
      z.t += dt;
      const slow = this.chronoLevel;
      if (z.spin) z.angle += z.spin * dt * slow;
      if (z.bob) z.y = z.baseY + Math.sin(z.bob.phase + z.t * z.bob.speed * slow) * z.bob.amp;
      z.c.setPosition(z.x, z.y).setRotation(z.angle);
      // Living beam: flicker and scrolling crackle.
      z.glow.setAlpha(0.42 + Math.sin(time * 0.03 + z.t * 7) * 0.1);
      z.crackle.tilePositionX -= dt * 900;
      z.crackle.setAlpha(0.55 + Math.random() * 0.45);
      const pulse = 0.4 + Math.sin(time * 0.012 + z.t) * 0.15;
      z.haloA.setAlpha(pulse);
      z.haloB.setAlpha(pulse);

      if (canHit && !z.dead && z.x > -60 && z.x < W + 60) {
        const hx = Math.cos(z.angle) * (z.len / 2);
        const hy = Math.sin(z.angle) * (z.len / 2);
        const d = segDist(ax, ay, bx, by, z.x - hx, z.y - hy, z.x + hx, z.y + hy);
        if (d < pr + 7) this.hit(z);
      }
      if (z.x < -z.len - 40 || z.dead && z.c.alpha <= 0.01) {
        z.c.setVisible(false);
        this.pool.zap.push(z);
        this.zappers.splice(i, 1);
      }
    }

    for (let i = this.saws.length - 1; i >= 0; i--) {
      const s = this.saws[i];
      s.x -= move;
      s.t += dt * this.chronoLevel;
      s.y = s.mid + Math.sin(s.phase + s.t * s.speed) * s.amp;
      s.blade.setPosition(0, s.y);
      s.blade.rotation -= dt * 14 * this.chronoLevel;
      s.blur.setPosition(0, s.y).setRotation(s.blade.rotation * 0.5);
      s.glow.setPosition(0, s.y);
      s.c.x = s.x;
      if (canHit && !s.dead && Math.abs(s.x - ax) < 80) {
        const d = segDist(ax, ay, bx, by, s.x, s.y, s.x, s.y);
        if (d < pr + 30) this.hit(s);
      }
      if (s.x < -80 || (s.dead && s.c.alpha <= 0.01)) {
        s.c.setVisible(false);
        this.pool.saw.push(s);
        this.saws.splice(i, 1);
      }
    }
  }

  updateCollectibles(move, dt, time) {
    const p = this.player;
    const alive = this.state === "run";
    const magnetOn = this.magnet > 0 && alive;
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.x -= move;
      if (magnetOn) {
        const dx = p.x - c.x, dy = p.y - c.y;
        const dist = Math.hypot(dx, dy);
        if (c.pulled || dist < 190) {
          c.pulled = true;
          const pull = Math.min(dist, (700 + (190 - Math.min(dist, 190)) * 6) * dt);
          c.x += (dx / (dist || 1)) * pull + move * 0.9;
          c.y += (dy / (dist || 1)) * pull;
        }
      }
      c.sp.setPosition(c.x, c.y);
      const hb = this.veh?.hitbox();
      if (alive && Math.abs(c.x - p.x) < (hb ? 46 : 30) && c.y > p.y + (hb ? hb[0] - 14 : -44) && c.y < p.y + (hb ? hb[1] + 14 : 44)) {
        this.runCoins += this.veh?.coinValue() ?? 1;
        this.audio.coin();
        this.fxSpark.particleTint = 0xffd23f;
        if (!this.lowFx) this.fxSpark.explode(4, c.x, c.y);
        this.flyCoin(c.x, c.y);
        c.sp.setVisible(false).stop();
        this.pool.coin.push(c);
        this.coins.splice(i, 1);
        continue;
      }
      if (c.x < -30) {
        c.sp.setVisible(false).stop();
        this.pool.coin.push(c);
        this.coins.splice(i, 1);
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const u = this.powerups[i];
      u.x -= u.speed != null ? u.speed * dt * (alive ? 1 : 0) : move;
      u.t += dt;
      u.y = u.baseY + Math.sin(u.t * 3) * 10;
      u.img.setPosition(u.x, u.y).setRotation(Math.sin(u.t * 2) * 0.15);
      u.glow.setPosition(u.x, u.y).setAlpha(0.45 + Math.sin(u.t * 6) * 0.15);
      const rp = (u.t * 0.9) % 1;
      u.ring.setPosition(u.x, u.y).setDisplaySize(40 + rp * 50, 40 + rp * 50).setAlpha((1 - rp) * 0.7);
      let gone = u.x < -40;
      if (alive && Math.hypot(u.x - p.x, u.y - p.y) < 42) {
        if (this.rules) this.rules.pickPowerup(u);
        else this.activatePowerup(u.type);
        gone = true;
      }
      if (gone) {
        u.img.setVisible(false);
        u.glow.setVisible(false);
        u.ring.setVisible(false);
        this.pool.pu.push(u);
        this.powerups.splice(i, 1);
      }
    }
  }

  recycleWarning(w) {
    w.img.setVisible(false);
    w.glow.setVisible(false);
    this.pool.warn.push(w);
  }

  updateMissiles(move, dt, time) {
    const p = this.player;
    for (let i = this.warnings.length - 1; i >= 0; i--) {
      const w = this.warnings[i];
      w.t += dt;
      if (w.t < 0) continue;
      if (!w.img.visible) {
        w.img.setVisible(true);
        w.glow.setVisible(true);
        this.audio.play("warn", { volume: 0.45, throttle: 150 });
      }
      if (!w.locked) {
        w.y = damp(w.y, clamp(p.y, this.playTop + 24, this.floorY - 24), 5, dt);
        if (w.t > 1.15) {
          w.locked = true;
          w.img.setTexture("warn-lock");
          this.audio.tone(980, 0.08, 0.04, "square");
        }
      }
      const blink = w.locked ? Math.floor(time / 60) % 2 : Math.floor(time / 140) % 2;
      const wx = W - 28 + (w.locked ? Math.sin(time * 0.08) * 2 : 0);
      w.img.setPosition(wx, w.y).setAlpha(blink ? 1 : 0.55);
      w.glow.setPosition(wx, w.y).setAlpha(w.locked ? 0.7 : 0.35);
      if (w.t > 1.6) {
        this.launchMissile(w.y);
        this.recycleWarning(w);
        this.warnings.splice(i, 1);
      }
    }

    const [ax, ay, bx, by] = this.playerCapsule();
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      if (m.speed != null) m.x -= m.speed * dt; // the remake's missile keeps its speed
      else m.x -= MISSILE_SPEED * this.chronoLevel * (this.state === "run" ? 1 : 0.6) * dt + move * 0.2;
      m.t += dt;
      const wob = Math.sin(m.t * 30) * 0.8;
      m.img.setPosition(m.x, m.y + wob);
      m.flame.setPosition(m.x + 36, m.y + wob).setScale(artScale("flame") * (0.9 + Math.random() * 0.4), artScale("flame") * (0.8 + Math.random() * 0.3));
      m.glow.setPosition(m.x + 44, m.y);
      if (!this.lowFx && Math.random() < 0.7) this.missileSmoke.emitParticleAt(m.x + 60, m.y, 1);
      if (!m.passed && m.x < p.x) {
        m.passed = true;
        if (this.state === "run") this.shake(80, 0.003);
      }
      if (this.state === "run" && !m.dead && !(this.ghost > 0) && Math.abs(m.x - p.x) < 70) {
        const d = segDist(ax, ay, bx, by, m.x - 30, m.y, m.x + 28, m.y);
        if (d < this.hitR() + 8) {
          this.hit(m);
          if (!m.dead) {
            m.dead = true;
            this.explode(m.x, m.y);
          }
        }
      }
      if (m.x < -120 || m.dead) {
        m.img.setVisible(false);
        m.flame.setVisible(false);
        m.glow.setVisible(false);
        m.dead = false;
        this.pool.missile.push(m);
        this.missiles.splice(i, 1);
      }
    }
  }

  updateBarrage(dt) {
    const b = this.barrage;
    if (!b) return;
    b.t += dt * (this.chronoLevel || 1);
    const t = b.t;
    const charging = t < BARRAGE.charge;
    const firing = t >= BARRAGE.charge && t < BARRAGE.charge + BARRAGE.fire;
    for (const beam of b.beams) {
      if (charging) {
        const k = t / BARRAGE.charge;
        beam.line.setAlpha((Math.floor(t * (6 + k * 16)) % 2 ? 0.25 : 0.8) * (0.4 + k * 0.6));
        beam.line.setDisplaySize(W - 40, 3 + k * 5);
      } else if (firing) {
        beam.line.setAlpha(0);
        const f = Math.min(1, (t - BARRAGE.charge) / 0.08);
        beam.glow.setAlpha(0.6 * f + Math.random() * 0.1);
        beam.core.setAlpha(f);
        beam.crackle.setAlpha(0.6 + Math.random() * 0.4);
        beam.crackle.tilePositionX -= dt * 1400;
      } else {
        const k = clamp((t - BARRAGE.charge - BARRAGE.fire) / BARRAGE.retract, 0, 1);
        [beam.glow, beam.core, beam.crackle].forEach((o) => o.setAlpha(1 - k));
        beam.podL.x = 18 - k * 50;
        beam.podR.x = W - 18 + k * 50;
      }
    }
    if (firing && !b.fired) {
      b.fired = true;
      this.shake(BARRAGE.fire * 1000, 0.0025);
      this.audio.play("impact", { volume: 0.35, rate: 0.6 });
      this.audio.tone(90, BARRAGE.fire, 0.05, "sawtooth", 60);
    }
    if (firing && this.state === "run") {
      const [ax, ay, bx, by] = this.playerCapsule();
      for (const beam of b.beams) {
        const d = segDist(ax, ay, bx, by, 20, beam.y, W - 20, beam.y);
        if (d < PHYSICS.hitRadius + 9) {
          this.hit(null);
          break;
        }
      }
    }
    if (t > this.barrageDuration()) this.endBarrage();
  }

  updateMarkers(move) {
    for (let i = this.markers.length - 1; i >= 0; i--) {
      const mk = this.markers[i];
      mk.x -= move;
      if (mk.x <= this.playerX + 30) {
        this.markers.splice(i, 1);
        if (this.state === "run") mk.fn();
      }
    }
  }

  updatePlayerFx(time, dt) {
    const p = this.player;
    const sp = this.sprite;
    const n = this.pilotMeta.nozzle;
    const cos = Math.cos(sp.rotation), sin = Math.sin(sp.rotation);
    const nx = sp.x + (n[0] * cos - n[1] * sin) * sp.scaleX;
    const ny = sp.y + (n[0] * sin + n[1] * cos) * sp.scaleY;
    const flying = this.thrusting && (this.state === "run" || this.state === "menu");
    if (flying) {
      this.thrustFx.emitParticleAt(nx, ny, this.lowFx ? 1 : 2);
      if (Math.random() < 0.5) this.smokeFx.emitParticleAt(nx - 6, ny + 6, 1);
      this.jetGlow.setPosition(nx - 4, ny + 6).setDisplaySize(60 + Math.random() * 16, 60 + Math.random() * 16);
      this.jetGlow.setAlpha(damp(this.jetGlow.alpha, 0.8, 20, dt));
    } else {
      this.jetGlow.setAlpha(damp(this.jetGlow.alpha, 0, 14, dt));
    }
    if (this.state === "run" && this.onGround && !this.thrusting && Math.random() < dt * 14) {
      this.dustFx.emitParticleAt(p.x - 8, this.floorY, 1);
    }

    // Shadow shrinks with altitude.
    const alt = clamp((this.floorY - BODY_HALF - p.y) / 360, 0, 1);
    this.shadow.setPosition(p.x, this.floorY + 1).setDisplaySize(64 * (1 - alt * 0.6), 12 * (1 - alt * 0.5));
    this.shadow.setAlpha((0.55 - alt * 0.4) * (this.state === "menu" ? 0.4 : 1));

    if (this.shieldImg.visible) {
      this.shieldImg.setPosition(p.x, p.y + 2);
      this.shieldImg.rotation += dt * 0.6;
      if (this.shield) this.shieldImg.setScale(artScale("shield") * (96 / 150) * (1 + Math.sin(time * 0.008) * 0.03));
    }
    if (this.magnet > 0 && this.state === "run") {
      const k = (time * 0.0018) % 1;
      this.magnetRing.setVisible(true).setPosition(p.x, p.y).setDisplaySize(380 - k * 300, 380 - k * 300).setAlpha(k * 0.35);
    } else this.magnetRing.setVisible(false);

    // Ghost: the pilot turns see-through and shimmers, blinking in the last second.
    // (The revive blink owns the sprite while it runs.)
    if (this.sprite && !(this.invuln > 0)) {
      if (this.ghost > 0 && this.state === "run") {
        const blink = this.ghost < 1 && Math.floor(time / 90) % 2 === 0;
        this.sprite.setAlpha(blink ? 0.85 : 0.38 + Math.sin(time / 110) * 0.08);
        this.sprite.setTint(0xbfffe8);
        this.ghostFx = true;
      } else if (this.ghostFx) {
        this.sprite.setAlpha(1);
        this.sprite.clearTint();
        this.ghostFx = false;
      }
    }
    const chronoTarget = this.chrono > 0 ? 0.08 : 0;
    this.chronoTint.setAlpha(damp(this.chronoTint.alpha, chronoTarget, 6, dt));
    const music = this.audio.loops.music;
    if (music?.isPlaying) {
      const rate = this.chrono > 0 ? 0.88 : 1;
      if (Math.abs(music.rate - rate) > 0.01) music.setRate(damp(music.rate, rate, 5, dt));
    }
  }

  // Portrait screens show little of what is ahead, so hazards about to enter
  // cast small ticks on the right edge: the player sees height before the shape.
  updateRadar() {
    const g = this.radar;
    g.clear();
    if (this.state !== "run") return;
    const edge = W - 4;
    const draw = (y0, y1, x) => {
      const near = clamp(1 - (x - W) / 200, 0, 1);
      if (near <= 0) return;
      g.fillStyle(0xff3b5c, 0.25 + near * 0.6);
      g.fillRoundedRect(edge - 2 - near * 2, Math.min(y0, y1) - 2, 4 + near * 2, Math.abs(y1 - y0) + 4, 2);
    };
    for (const z of this.zappers) {
      if (z.x - z.len / 2 < W || z.x - z.len / 2 > W + 200) continue;
      const hy = Math.abs(Math.sin(z.angle) * z.len) / 2 + 12;
      if (z.spin) draw(z.y - z.len / 2, z.y + z.len / 2, z.x - z.len / 2);
      else draw(z.y - hy, z.y + hy, z.x - Math.abs(Math.cos(z.angle) * z.len) / 2);
    }
    for (const s of this.saws) if (s.x > W && s.x < W + 200) draw(s.mid - s.amp - 36, s.mid + s.amp + 36, s.x);
  }

  updateBestFlag() {
    const best = this.bestAtStart;
    if (best <= 0 || this.state === "menu") {
      if (this.bestFlag.visible) {
        this.bestFlag.setVisible(false);
        this.bestFlagText.setVisible(false);
      }
      return;
    }
    const x = this.playerX + (best - this.meters) * PX_PER_METER;
    const show = x > -40 && x < W + 40;
    this.bestFlag.setVisible(show).setX(x + 14);
    this.bestFlagText.setVisible(show).setPosition(x + 4, this.playTop + 6);
  }

  updateHud() {
    const meters = Math.floor(this.meters);
    if (!this.bestBeaten && this.bestAtStart > 0 && meters > this.bestAtStart) {
      this.bestBeaten = true;
      ui.banner("New Best!", `${this.bestAtStart} m beaten`, true);
      this.audio.success();
      this.fxSpark.particleTint = PALETTE.gold;
      this.fxSpark.explode(24, this.player.x, this.player.y);
    }
    if (!this.bestBeaten && this.bestScore > 0 && meters + this.runCoins > this.bestScore) {
      this.bestBeaten = true;
      ui.banner("New Best!", `${this.bestScore} beaten`, true);
      this.audio.success();
    }
    ui.setHud({ meters, coins: this.runCoins, best: this.bestAtStart, beaten: this.bestBeaten });
    const powers = [];
    if (this.shield) powers.push({ type: "shield", frac: 1 });
    if (this.chrono > 0) powers.push({ type: "chrono", frac: this.chrono / this.chronoMax });
    if (this.magnet > 0) powers.push({ type: "magnet", frac: this.magnet / this.magnetMax });
    if (this.ghost > 0) powers.push({ type: "ghost", frac: this.ghost / this.ghostMax });
    if (this.veh?.riding) powers.push({ type: this.veh.id, frac: 1 });
    ui.setPowers(powers);
  }
}
