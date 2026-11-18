// Sound layer: decoded Web Audio buffers through Phaser's sound manager (no
// HTMLAudio cloning, so rapid coin pickups never stutter on mobile), plus a few
// synthesised UI blips that need no files at all.
import { save } from "./save.js";
import { platform } from "./platform.js";

const LOOPS = {
  music: { key: "music", volume: 0.32 },
  thrust: { key: "thrust", volume: 0.28 },
  run: { key: "run", volume: 0.3 }
};

export class Audio {
  constructor(scene) {
    this.scene = scene;
    this.loops = {};
    this.coinChain = 0;
    this.lastCoinAt = 0;
    this.lastPlay = {};
  }

  get ctx() {
    return this.scene.sound.context || null;
  }

  init() {
    // On YouTube, pausing is driven only by the SDK onPause/onResume signals.
    this.scene.sound.pauseOnBlur = !platform.isYouTube;
    this.addLoops();
  }

  addLoops() {
    const sound = this.scene.sound;
    for (const [name, def] of Object.entries(LOOPS)) {
      if (this.loops[name] || !this.scene.cache.audio.exists(def.key)) continue;
      this.loops[name] = sound.add(def.key, { loop: true, volume: 0 });
      this.loops[name].baseVolume = def.volume;
      this.loops[name].target = 0;
    }
  }

  /** Sounds download after the menu is shown. When they land, hook up the
   *  loops and start the music if it should already be playing. */
  attach() {
    this.addLoops();
    const s = this.scene;
    if (s.state === "menu" || (s.state === "run" && !s.scene.isPaused())) this.setLoop("music", true);
  }

  unlock() {
    const ctx = this.ctx;
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
  }

  // Loops fade toward a target level instead of hard starting/stopping.
  setLoop(name, on, rate = 1) {
    const loop = this.loops[name];
    if (!loop) return;
    const allowed = name === "music" ? save.data.settings.music : save.data.settings.sfx;
    if (!allowed) {
      // Switched off in settings: cut instantly instead of fading.
      loop.target = 0;
      if (loop.isPlaying) loop.pause();
      return;
    }
    loop.target = on ? loop.baseVolume : 0;
    // While YouTube has the game paused nothing may start; onResume restarts music.
    if (platform.paused) return;
    if (loop.target > 0 && !loop.isPlaying) {
      try {
        if (loop.isPaused) loop.resume();
        else loop.play({ volume: 0, loop: true });
      } catch {
        /* audio locked until first gesture */
      }
    }
    if (loop.isPlaying && rate !== loop.rate) loop.setRate(rate);
  }

  update(dt) {
    for (const loop of Object.values(this.loops)) {
      if (!loop.isPlaying) continue;
      const k = 1 - Math.exp(-dt * 9);
      const v = loop.volume + (loop.target - loop.volume) * k;
      loop.setVolume(v);
      if (loop.target === 0 && v < 0.005) loop.pause();
    }
  }

  // Master switch: Phaser's global mute silences everything at once,
  // including one-shots and synthesised blips that are already sounding.
  // `audioEnabled`, when given, is the boolean YouTube's onAudioEnabledChange
  // callback just delivered — used directly instead of re-polling the SDK,
  // so there's no window where applied state can lag behind what YouTube
  // just told us. Falls back to the live getter for callers (settings
  // toggle, scene init) that aren't reacting to that callback.
  applyMute(audioEnabled = platform.audioEnabled()) {
    // Muted if the player switched sound off in-game, or YouTube's mute is on.
    this.scene.sound.mute = !(save.data.settings.sound && audioEnabled);
  }

  // Applies the settings immediately, even while the game is paused.
  applySettings(musicWanted = true) {
    this.applyMute();
    const st = save.data.settings;
    if (!st.sfx) {
      for (const snd of this.scene.sound.sounds || []) {
        if (snd !== this.loops.music && (snd.isPlaying || snd.isPaused)) snd.stop();
      }
      this.setLoop("thrust", false);
      this.setLoop("run", false);
    }
    this.setLoop("music", musicWanted);
    const music = this.loops.music;
    if (music && st.music && musicWanted && music.volume < 0.05) music.setVolume(music.baseVolume);
  }

  destroy() {
    for (const loop of Object.values(this.loops)) loop.destroy();
    this.loops = {};
  }

  stopAllLoops() {
    for (const loop of Object.values(this.loops)) {
      loop.target = 0;
      if (loop.isPlaying) loop.pause();
    }
  }

  play(key, opts = {}) {
    if (!save.data.settings.sfx || !save.data.settings.sound) return;
    if (!this.scene.cache.audio.exists(key)) return;
    const now = performance.now();
    if (opts.throttle && now - (this.lastPlay[key] || 0) < opts.throttle) return;
    this.lastPlay[key] = now;
    try {
      this.scene.sound.play(key, { volume: opts.volume ?? 0.6, detune: opts.detune || 0, rate: opts.rate || 1 });
    } catch {
      /* ignore */
    }
  }

  // Consecutive coins climb in pitch, which makes streaks feel rewarding.
  coin() {
    const now = performance.now();
    this.coinChain = now - this.lastCoinAt < 420 ? Math.min(this.coinChain + 1, 12) : 0;
    this.lastCoinAt = now;
    this.play("coin", { volume: 0.42, detune: this.coinChain * 90, throttle: 35 });
  }

  tone(freq, dur = 0.1, vol = 0.05, type = "sine", slideTo = 0, delay = 0) {
    if (!save.data.settings.sfx || !save.data.settings.sound) return;
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.scene.sound.destination || ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  click() {
    this.tone(620, 0.06, 0.035, "triangle", 880);
  }

  success() {
    this.tone(660, 0.12, 0.05, "triangle", 990);
    this.tone(990, 0.2, 0.05, "triangle", 1320, 0.1);
  }

  denied() {
    this.tone(220, 0.14, 0.05, "square", 150);
  }

  haptic(pattern) {
    if (!save.data.settings.haptics) return;
    try {
      navigator.vibrate?.(pattern);
    } catch {
      /* unsupported */
    }
  }
}
