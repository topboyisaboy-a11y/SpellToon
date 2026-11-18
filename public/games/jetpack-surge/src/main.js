import { W, computeLogicalSize, setStageSize, computeRenderScale, isRotated, PILOTS } from "./config.js";
import { GameScene } from "./game.js";
import { ui } from "./ui.js";
import { save } from "./save.js";
import { platform } from "./platform.js";

const Phaser = window.Phaser;
const params = new URLSearchParams(location.search);
// On YouTube the player's own controls decide the screen shape (and turning the
// phone changes it), so the game always follows the viewport there.
const orientPref = () => (platform.isYouTube ? "auto" : save.data?.settings?.orient || "auto");
/** Turns the game sideways when Horizontal is chosen on an upright screen. */
const applyRotation = () => {
  const rot = isRotated(orientPref());
  if (document.body.classList.contains("jd-rot") === rot) return false;
  document.body.classList.toggle("jd-rot", rot);
  return true;
};
let size = computeLogicalSize(orientPref());
setStageSize(size);
let H = size.h;
const fixedR = params.has("r") ? Number(params.get("r")) || 1 : 0;
let R = fixedR || computeRenderScale(H);
window.__JD_H = H;

const TIPS = ["Fuelling jetpack…", "Calibrating lasers…", "Polishing coins…", "Warming up the reactor…"];

// Only the default pilot's art is needed to show the menu. Sounds and the
// "coming soon" pilots download once the menu is up (GameScene.loadDeferred),
// so YouTube gets gameReady as early as possible.
const BOOT_PILOTS = PILOTS.filter((p) => !p.comingSoon);

// Started at boot and awaited only when the menu is about to be built, so the
// cloud save, the language and the asset download all happen at the same time.
let ready = { save: null, lang: null };

function setBar(p) {
  const fill = document.getElementById("ldFill");
  const tip = document.getElementById("ldTip");
  if (fill) fill.style.transform = `scaleX(${Math.max(0.02, Math.min(1, p))})`;
  if (tip) tip.textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))];
}

function queueAssets(load, onlyMissing) {
  const tex = load.scene.textures;
  for (const p of BOOT_PILOTS) {
    if (!onlyMissing || !tex.exists(p.id)) load.atlas(p.id, `sprites/${p.id}.webp`, `sprites/${p.id}.json`);
  }
}

class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload() {
    this.load.on("progress", (p) => setBar(0.3 + 0.5 * p));
    this.load.on("loaderror", (file) => platform.logError(`Asset failed to load: ${file?.src}`));
    this.load.setPath("assets/");
    // index.html already started downloading the default pilot's art
    // (window.__jdEarly); Phaser's loader only fetches it if that is missing.
    if (!window.__jdEarly) queueAssets(this.load, false);
  }

  /** Hands the art that index.html started downloading over to Phaser. */
  async adoptEarlyArt() {
    const early = window.__jdEarly?.scout;
    if (!early) return;
    try {
      const timeout = new Promise((_, no) => setTimeout(() => no(new Error("early art timed out")), 15000));
      const [img, json] = await Promise.race([early, timeout]);
      if (!this.textures.exists("scout")) this.textures.addAtlas("scout", img, json);
    } catch (e) {
      platform.logError(e); // retryMissing() below fetches it through Phaser instead
    }
  }

  /** One more attempt for anything that failed (a dropped mobile connection). */
  retryMissing() {
    return new Promise((resolve) => {
      queueAssets(this.load, true);
      if (this.load.list.size === 0) return resolve();
      this.load.once("complete", () => resolve());
      this.load.start();
      setTimeout(resolve, 6000);
    });
  }

  async create() {
    setBar(0.35);
    // The pilot art, display font, cloud save and language must all be in
    // before the menu is drawn. Each has its own time limit, so none of them
    // can hang boot, and they all arrive in parallel.
    const font = Promise.race([document.fonts.load('20px "Lilita One"'), new Promise((r) => setTimeout(r, 1500))]).catch(() => {});
    const art = this.adoptEarlyArt().then(() => setBar(0.8));
    const [lang] = await Promise.all([ready.lang, ready.save, font, art]);
    await this.retryMissing();
    setBar(1);
    document.documentElement.lang = lang || "en";

    // If the frame had no size when the page started (a host can lay it out
    // late), size the stage to the real screen now, before anything is built.
    // The saved screen preference is known now too.
    if (applyRotation()) this.game.scale.refresh();
    if (window.innerWidth > 0 && window.innerHeight > 0) {
      const next = computeLogicalSize(orientPref());
      if (next.h !== H || next.w !== W) {
        setStageSize(next);
        H = next.h;
        window.__JD_H = H;
        this.registry.set("H", H);
        if (!fixedR) R = computeRenderScale(H);
        this.registry.set("R", R);
        this.game.scale.setGameSize(Math.round(W * R), Math.round(H * R));
      }
    }

    ui.mount();
    startGame(this.game);
  }
}

// Starts the game scene straight away instead of through ScenePlugin.start(),
// which waits for the next rendered frame. YouTube may not give the page any
// frames (or may have paused it) until gameReady is sent, so nothing between
// the end of loading and gameReady may depend on the render loop.
function startGame(game, attempt = 1) {
  try {
    game.scene.start("game", { mode: "menu" });
    if (game.scene.isActive("boot")) game.scene.stop("boot");
  } catch (e) {
    platform.logError(e);
    try {
      game.scene.stop("game");
    } catch {
      /* already stopped */
    }
    if (attempt < 2) setTimeout(() => startGame(game, attempt + 1), 400);
    else ui.loaderError(() => location.reload());
  }
}

function boot() {
  // The HTML loading screen is already painted: tell YouTube frames are showing.
  platform.firstFrameReady();
  document.body.classList.add(`platform-${platform.name}`);

  ready = { save: save.init(), lang: platform.getLanguage() };

  const game = new Phaser.Game({
    type: params.get("renderer") === "canvas" ? Phaser.CANVAS : Phaser.AUTO,
    parent: "app",
    width: Math.round(W * R),
    height: Math.round(H * R),
    backgroundColor: "#070d1f",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, powerPreference: "high-performance", roundPixels: false },
    input: { activePointers: 3 },
    audio: { disableWebAudio: false },
    // Phaser caps parallel downloads at 6 on Android and only starts the rest
    // from its render loop. Starting every file at once lets loading finish
    // even when YouTube is not giving the page frames yet.
    loader: { maxParallelDownloads: 32 },
    fps: { target: 60, smoothStep: true },
    banner: false,
    callbacks: {
      preBoot: (g) => {
        g.registry.set("H", H);
        g.registry.set("R", R);
      }
    },
    scene: [BootScene, GameScene]
  });
  window.__jetdash = game;
  // While the game is turned sideways the engine must measure its container's
  // own (unrotated) size, not its on-screen box.
  const sm = game.scale;
  const parentBounds = sm.getParentBounds.bind(sm);
  sm.getParentBounds = function () {
    if (!document.body.classList.contains("jd-rot") || !this.parent) return parentBounds();
    const w = this.parent.offsetWidth, h = this.parent.offsetHeight, ps = this.parentSize;
    if (ps.width === w && ps.height === h) return false;
    ps.setSize(w, h);
    return true;
  };
  // Phaser's orientationchange handler refreshes from the old container size and
  // then records the new size as already seen, so on a phone turned mid-run the
  // canvas kept its old shape and spilled off screen. Measure first, always.
  const refresh = sm.refresh.bind(sm);
  sm.refresh = function (...a) {
    this.getParentBounds();
    return refresh(...a);
  };
  const updateCenter = sm.updateCenter.bind(sm);
  sm.updateCenter = function () {
    if (!document.body.classList.contains("jd-rot")) return updateCenter();
    const c = this.canvas;
    c.style.marginLeft = Math.floor((this.parentSize.width - c.offsetWidth) / 2) + "px";
    c.style.marginTop = Math.floor((this.parentSize.height - c.offsetHeight) / 2) + "px";
  };
  const gameScene = () => game.scene.getScene("game");

  // A slow cloud save may land after the menu is up: show the real numbers.
  save.onLateLoad = () => {
    ui.refresh();
    gameScene()?.applySettings?.();
  };

  // Responsive: when the window changes size (rotation, split screen, desktop
  // resize) the canvas re-fits and its pixel density is recomputed so art stays
  // sharp. The run is never restarted, so progress is kept.
  //
  // The playfield height follows the screen's shape. If that shape changes
  // (most often: the page loaded before the host gave it a size) the new
  // height is applied on the menu straight away, or when the current run
  // ends — a run in progress is never restarted.
  let pendingH = 0, pendingSize = null;
  const applyPendingH = () => {
    if (!pendingH) return;
    H = pendingH;
    pendingH = 0;
    if (pendingSize) setStageSize(pendingSize);
    pendingSize = null;
    window.__JD_H = H;
    game.registry.set("H", H);
    if (!fixedR) {
      R = computeRenderScale(H);
      game.registry.set("R", R);
    }
    game.scale.setGameSize(Math.round(W * R), Math.round(H * R));
  };
  game.events.once("ready", () => gameScene()?.events.on("shutdown", applyPendingH));
  const relayoutMenu = () => {
    const s = gameScene();
    if (!pendingH || platform.paused || s?.state !== "menu" || s.leaving || !s.scene.isActive()) return false;
    s.scene.restart({ mode: "menu" });
    return true;
  };

  let resizeTimer = 0;
  const onResize = () => {
    ui.fit();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (applyRotation()) game.scale.refresh();
      const nextSize = window.innerWidth > 0 && window.innerHeight > 0 ? computeLogicalSize(orientPref()) : { w: W, h: H, orient: null };
      const changed = nextSize.w !== W || Math.abs(nextSize.h - H) >= 24;
      pendingH = changed ? nextSize.h : 0;
      pendingSize = changed ? nextSize : null;
      if (relayoutMenu()) return;
      if (fixedR) return ui.fit();
      const next = computeRenderScale(H);
      if (Math.abs(next - R) >= 0.25) {
        R = next;
        game.registry.set("R", R);
        game.scale.setGameSize(Math.round(W * R), Math.round(H * R));
        gameScene()?.setRenderScale?.(R);
      }
      ui.fit();
    }, 180);
  };
  window.addEventListener("resize", onResize);
  // Settings → Screen: re-lay the stage out for the new choice (on the menu, or after the current run).
  window.__jdApplyOrient = () => {
    if (applyRotation()) game.scale.refresh();
    const next = computeLogicalSize(orientPref());
    if (next.w === W && next.h === H) return;
    pendingH = next.h;
    pendingSize = next;
    if (!relayoutMenu()) applyPendingH();
  };
  window.addEventListener("orientationchange", onResize);
  game.scale.on("resize", () => ui.fit());

  // YouTube Playables lifecycle: pause everything on onPause, continue only on
  // onResume. Wired before anything loads, because YouTube can pause the game
  // while it is still loading (for example behind its own loading screen).
  platform.onPause(() => {
    if (platform.paused) return;
    platform.paused = true;
    const s = gameScene();
    if (s?.state === "run" && s.scene.isActive() && !s.scene.isPaused()) s.pause();
    game.sound?.pauseAll();
    game.loop.sleep();
    // The revive-offer countdown runs on a real-time setInterval (it has to
    // keep ticking while the Phaser scene itself is paused), so it needs its
    // own freeze here — otherwise it keeps counting down in the background
    // and can auto-decline the offer before the player returns.
    ui.pauseReviveTimer();
    // The player may be backgrounding or closing the game right now — don't
    // let a save still sitting in the debounce window get lost.
    platform.flushSave();
  });
  platform.onResume(() => {
    if (!platform.paused) return;
    platform.paused = false;
    game.loop.wake();
    const s = gameScene();
    // A run stays on the pause menu until the player taps Resume.
    if (!s?.scene?.isPaused()) {
      game.sound?.resumeAll();
      // Menu music is held back if the menu opened while paused: start it now.
      if (s?.state === "menu" || s?.state === "run") s.audio?.setLoop("music", true);
    }
    ui.resumeReviveTimer();
    // A screen-size change that arrived while paused is applied now.
    relayoutMenu();
  });
  // A pause that arrived before the render loop started could not stop it yet.
  game.events.once("prestep", () => {
    if (platform.paused) game.loop.sleep();
  });
  // onResume is always paired with onAudioEnabledChange(true), so audio state
  // is driven entirely from this callback's own boolean — never re-derived.
  platform.onAudioChange((enabled) => gameScene()?.audio?.applyMute(enabled));

  window.addEventListener("error", (e) => platform.logError(e?.message));
  window.addEventListener("unhandledrejection", (e) => platform.logError(e?.reason));
}

boot();
