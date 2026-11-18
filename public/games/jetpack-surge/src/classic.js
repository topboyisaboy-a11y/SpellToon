// Jetpack Surge gameplay rules: flight physics, spawn timings and scoring.
//
// Every number below is the remake's own, in its own units: pixels on its
// 1000x500 canvas and frames at 60 fps, converted to seconds here. Positions are
// mapped onto Surge's stage with one scale factor `k` (the remake's player travel
// of 340 px maps onto Surge's floor-to-ceiling travel), measured from the pilot,
// so every gap, height and timing is the same as in the remake on any screen.
//
// What the remake does, and so what this does:
//  - Physics: holding sets the climb to a fixed speed at once; releasing falls
//    under plain gravity (no air drag, no fall cap). The ceiling holds you until
//    gravity turns you round.
//  - Speed: starts at 2.1 px/frame and goes up 0.1 px/frame every 20 m.
//  - Distance: 1 m every 11 frames, whatever the speed.
//  - Lasers: three upright beams, 140 px tall at random heights, looping with gaps
//    of 300, 300 and 445 px.
//  - Coins: a line of 10 coins, 25 px apart, every 1550 px at a random height.
//  - Missile: a warning follows your height for 100 frames, then locks; the missile
//    flies at 10 px/frame from off-screen at that height; then the cycle repeats.
//  - Power-up: one orb every 150 m, drifting at 2 px/frame. The remake alternates
//    Slow-down (world 0.6 px/frame slower) and Invisible (no hits) for 10 s; here
//    Shield and Magnet join the rotation, and upgrades make each one last longer.
//  - One hit ends the run. Score = meters + coins.

import { W, POWERUPS } from "./config.js";
import { save } from "./save.js";

// The order power-ups take turns in at each 150 m drop.
const ROTATION = ["chrono", "ghost", "shield", "magnet"];

export const RULES = {
  travel: 340, // player top-left y runs 0..340
  playerLeft: 40,
  playerHalf: 27.5, // the 55 px player sprite
  rise: 4 * 60, // vy = -2 applied twice a frame
  gravity: 0.12 * 3600, // ay = 0.06 applied twice a frame
  startSpeed: 2.1, // px/frame
  speedStep: 0.1, // px/frame every stepMeters
  stepMeters: 20,
  slowBy: 0.6, // px/frame while Slow-down is on
  metersPerSecond: 60 / 11,
  laser: { w: 45, h: 140, starts: [1000, 1300, 1600], loop: 1045, yMax: 260 },
  coin: { size: 30, count: 10, gap: 25, first: 1000, loop: 1550, firstY: 250, yMax: 370 },
  missile: { h: 30, warnFrames: 101, startX: 1100, speed: 10 * 60, trip: (1100 + 500) / 600 },
  powerup: { size: 60, every: 150, x: 1100, y: 100, speed: 2 * 60, duration: 10 },
  finishDelay: 0.6 // seconds between landing and the results
};

const R = RULES;

export class Rules {
  /** @param s the game scene; minY/maxY: the pilot's body-centre range on this stage. */
  constructor(s, { minY, maxY }) {
    this.s = s;
    this.minY = minY;
    this.maxY = maxY;
    this.k = (maxY - minY) / R.travel;
    this.dist = 0; // remake pixels travelled since the run started
    this.lasers = R.laser.starts.slice(); // world position of each laser's next appearance
    this.coinLine = 0;
    this.missile = { phase: "track", t: 0, warn: null, m: null };
    this.puStep = 0;
    this.puTurn = Math.floor(Math.random() * ROTATION.length); // the remake starts on a random turn
  }

  /** Remake y (top-left of an object of height h) to a Surge centre y. */
  y(top, h) {
    return this.minY + (top + h / 2 - R.playerHalf) * this.k;
  }

  /** Remake on-screen x (left edge, width w) to a Surge centre x. */
  x(left, w) {
    return this.s.playerX + (left + w / 2 - (R.playerLeft + R.playerHalf)) * this.k;
  }

  /** World speed in Surge px/s. */
  speed() {
    const steps = Math.floor(this.s.meters / R.stepMeters);
    const slow = this.s.chrono > 0 ? R.slowBy : 0;
    return Math.max(0, R.startSpeed + R.speedStep * steps - slow) * 60 * this.k;
  }

  /** The remake's flight: fixed climb while held, plain gravity otherwise. */
  fly(p, held, dt) {
    if (held) p.vy = -R.rise * this.k;
    else p.vy += R.gravity * this.k * dt;
    p.y += p.vy * dt;
    if (p.y >= this.maxY) {
      p.y = this.maxY;
      p.vy = 0;
    }
    if (p.y < this.minY) p.y = this.minY; // speed kept: you hang until gravity turns you
  }

  /** Falling after a hit: same gravity, no control. */
  fall(p, dt) {
    p.vy += R.gravity * this.k * dt;
    p.y += p.vy * dt;
  }

  update(move, dt, time) {
    const s = this.s;
    this.dist += move / this.k;
    // Spawn anything whose position comes within reach of the right edge.
    const due = (w) => (W + 150 - s.playerX) / this.k + R.playerLeft + R.playerHalf - w / 2;

    // Lasers: each one comes back 1045 px after it appeared.
    for (let i = 0; i < this.lasers.length; i++) {
      while (this.lasers[i] - this.dist <= due(R.laser.w)) {
        const left = this.lasers[i] - this.dist;
        const top = Math.floor(Math.random() * (400 - R.laser.h));
        s.spawnZapper({ x: this.x(left, R.laser.w), y: this.y(top, R.laser.h), len: R.laser.h * this.k, angle: Math.PI / 2 });
        this.lasers[i] += R.laser.loop;
      }
    }

    // Coins: a line of ten every 1550 px.
    for (;;) {
      const at = R.coin.first + R.coin.loop * this.coinLine;
      if (at - this.dist > due(R.coin.size)) break;
      const top = this.coinLine === 0 ? R.coin.firstY : Math.floor(Math.random() * R.coin.yMax);
      const pts = [];
      for (let i = 0; i < R.coin.count; i++) pts.push([this.x(at - this.dist + i * R.coin.gap, R.coin.size), this.y(top, R.coin.size)]);
      s.spawnCoins(pts);
      this.coinLine++;
    }

    this.updateMissile(dt, time);

    // Power-up: released every 150 m.
    const step = Math.floor(s.meters / R.powerup.every);
    if (step > this.puStep) {
      this.puStep = step;
      if (!s.powerups.length) {
        // Next in turn, skipping one that is still running (a second shield would be wasted).
        let type = ROTATION[this.puTurn % ROTATION.length];
        for (let i = 0; i < ROTATION.length && !s.canOfferPowerup(type); i++) type = ROTATION[(this.puTurn + i + 1) % ROTATION.length];
        s.spawnPowerup(type, this.x(R.powerup.x, R.powerup.size), this.y(R.powerup.y, R.powerup.size));
        s.powerups[s.powerups.length - 1].speed = R.powerup.speed * this.k;
      }
    }
  }

  /** A power-up was touched: it lasts as long as its upgrade level allows (10 s at level 0). */
  pickPowerup(u) {
    this.puTurn = ROTATION.indexOf(u.type) + 1;
    const def = POWERUPS[u.type];
    const lvl = save.data.upgrades[u.type] || 0;
    this.s.activatePowerup(u.type, false, def.duration ? def.duration(lvl) : null);
  }

  updateMissile(dt, time) {
    const s = this.s, ms = this.missile, p = s.player;
    if (!ms.warn) ms.warn = s.takeWarning();
    const w = ms.warn;
    const wx = W - 28;
    ms.t += dt;
    if (s.state !== "run") {
      w.img.setVisible(false);
      w.glow.setVisible(false);
      return;
    }
    if (ms.phase === "track") {
      // The warning follows the pilot's height.
      w.y = p.y - 7.5 * this.k;
      w.img.setTexture("warn").setVisible(true).setPosition(wx, w.y).setAlpha(Math.floor(time / 140) % 2 ? 1 : 0.55);
      w.glow.setVisible(true).setPosition(wx, w.y).setAlpha(0.35).setDisplaySize(90, 90);
      if (ms.t >= R.missile.warnFrames / 60) {
        // Locked: the missile fires at the pilot's height right now.
        ms.phase = "fly";
        ms.t = 0;
        ms.y = p.y - (R.playerHalf - R.missile.h / 2) * this.k;
        w.y = p.y - 7.5 * this.k;
        s.audio.play("warn", { volume: 0.45 });
        ms.m = s.launchMissile(ms.y, this.x(R.missile.startX, 60), R.missile.speed * this.k);
      }
    } else {
      // The locked warning stays on the edge until the missile comes on screen.
      const onScreen = ms.m && ms.m.x < W;
      w.img.setTexture("warn-lock").setVisible(!onScreen).setPosition(wx + Math.sin(time * 0.08) * 2, w.y).setAlpha(Math.floor(time / 60) % 2 ? 1 : 0.55);
      w.glow.setVisible(!onScreen).setPosition(wx, w.y).setAlpha(0.7);
      if (ms.t >= R.missile.trip) {
        ms.phase = "track";
        ms.t = 0;
        ms.m = null;
      }
    }
  }
}
