// Vehicles. A token drifts in during a run; touch it to ride. Each vehicle has
// its own controls, and a hit wrecks the vehicle instead of the pilot, who carries
// on by jetpack. Upgrades make a vehicle turn up more often and boost its trick.
//
// Original designs for Jetpack Surge (art painted here with Canvas 2D):
//   Blink Pack   hold to send an aim marker up, release to teleport to it
//   Ember Wyrm   a clockwork dragon: tap to flap; its fire burns lasers and missiles ahead
//   Stomp Rig    a walking mech: hold to charge a leap; landing ground-pounds nearby lasers
//   Flip Suit    tap to flip gravity between the floor and the ceiling
//   Coin Gull    a brass robot gull: tap to flap; every coin counts double (triple at level 3)

import { bake, art, artScale, Phaser } from "./art.js";
import { save } from "./save.js";
import { W } from "./config.js";

export const VEHICLES = {
  blink: {
    name: "Blink Pack", color: 0x3ee8ff, css: "#3ee8ff",
    upgradeTitle: "Blink Pack",
    upgradeText: (l) => (l === 0 ? "Teleport through hazards" : `Aim marker ${l * 10}% slower, turns up more often`)
  },
  wyrm: {
    name: "Ember Wyrm", color: 0xff7a2e, css: "#ff8a3d",
    upgradeTitle: "Ember Wyrm",
    upgradeText: (l) => `Fire burns ${150 + l * 25} px ahead${l ? ", turns up more often" : ""}`
  },
  stomp: {
    name: "Stomp Rig", color: 0xffc233, css: "#ffc233",
    upgradeTitle: "Stomp Rig",
    upgradeText: (l) => `Ground-pound clears ${140 + l * 25} px${l ? ", turns up more often" : ""}`
  },
  flip: {
    name: "Flip Suit", color: 0xa77bff, css: "#b48cff",
    upgradeTitle: "Flip Suit",
    upgradeText: (l) => (l === 0 ? "Flip between floor and ceiling" : `Flips ${l * 12}% faster, turns up more often`)
  },
  gull: {
    name: "Coin Gull", color: 0xffd23f, css: "#ffd23f",
    upgradeTitle: "Coin Gull",
    upgradeText: (l) => `Coins are worth ${l >= 3 ? 3 : 2}x${l ? ", turns up more often" : ""}`
  }
};
export const VEHICLE_IDS = Object.keys(VEHICLES);

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lvlOf = (id) => save.data.upgrades[id] || 0;

/* ------------------------------------------------------------------ art --- */

const TAU = Math.PI * 2;
function grad(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}
function ellipse(c, x, y, rx, ry, rot = 0) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, rot, 0, TAU);
}
function outline(c, w = 3) {
  c.lineWidth = w;
  c.strokeStyle = "#1a0f0a";
  c.stroke();
}

export function bakeVehicles(scene) {
  // Ember Wyrm: a clockwork dragon facing right.
  bake(scene, "veh-wyrm", 170, 110, (c) => {
    // tail
    c.beginPath();
    c.moveTo(48, 62);
    c.bezierCurveTo(20, 66, 10, 50, 4, 70);
    c.bezierCurveTo(12, 64, 22, 80, 50, 76);
    c.closePath();
    c.fillStyle = "#c2410c";
    c.fill();
    outline(c, 2.5);
    c.beginPath();
    c.moveTo(4, 70);
    c.lineTo(-2 + 6, 58);
    c.lineTo(14, 66);
    c.closePath();
    c.fillStyle = "#ffd166";
    c.fill();
    outline(c, 2);
    // body
    ellipse(c, 82, 66, 46, 28);
    c.fillStyle = grad(c, 0, 38, 0, 94, [[0, "#ff9a3c"], [0.55, "#e2541f"], [1, "#8a2a0c"]]);
    c.fill();
    outline(c);
    // belly plates
    for (let i = 0; i < 5; i++) {
      ellipse(c, 60 + i * 12, 84 - Math.abs(i - 2) * 1.5, 7, 5);
      c.fillStyle = "#ffe0a3";
      c.fill();
      outline(c, 1.5);
    }
    // back spikes
    c.fillStyle = "#ffd166";
    for (let i = 0; i < 5; i++) {
      const x = 52 + i * 13;
      c.beginPath();
      c.moveTo(x, 44 - Math.sin(i / 4 * Math.PI) * 4);
      c.lineTo(x + 6, 30 - Math.sin(i / 4 * Math.PI) * 6);
      c.lineTo(x + 11, 44 - Math.sin(i / 4 * Math.PI) * 4);
      c.closePath();
      c.fill();
      outline(c, 1.8);
    }
    // rivets
    c.fillStyle = "#5b1d08";
    for (const [x, y] of [[70, 60], [86, 56], [100, 62], [78, 72], [94, 74]]) {
      ellipse(c, x, y, 2, 2);
      c.fill();
    }
    // neck + head
    c.beginPath();
    c.moveTo(112, 52);
    c.quadraticCurveTo(128, 30, 142, 34);
    c.lineTo(150, 54);
    c.quadraticCurveTo(132, 58, 122, 74);
    c.closePath();
    c.fillStyle = "#e2541f";
    c.fill();
    outline(c);
    c.beginPath();
    c.moveTo(134, 28);
    c.quadraticCurveTo(160, 24, 168, 40);
    c.lineTo(162, 48);
    c.lineTo(166, 54);
    c.quadraticCurveTo(150, 62, 136, 54);
    c.closePath();
    c.fillStyle = grad(c, 0, 24, 0, 60, [[0, "#ffb24a"], [1, "#d1461a"]]);
    c.fill();
    outline(c);
    // horns
    c.fillStyle = "#ffe8b0";
    c.beginPath();
    c.moveTo(138, 30);
    c.lineTo(128, 14);
    c.lineTo(145, 27);
    c.closePath();
    c.fill();
    outline(c, 1.8);
    // eye
    ellipse(c, 152, 36, 5, 4.5);
    c.fillStyle = "#fff7b0";
    c.fill();
    outline(c, 1.6);
    ellipse(c, 153.5, 36, 2, 3);
    c.fillStyle = "#1a0f0a";
    c.fill();
    // nostril glow
    ellipse(c, 165, 45, 2.5, 2);
    c.fillStyle = "#ffd166";
    c.fill();
    // saddle
    c.beginPath();
    c.moveTo(64, 42);
    c.quadraticCurveTo(80, 34, 98, 42);
    c.lineTo(94, 50);
    c.quadraticCurveTo(80, 44, 68, 50);
    c.closePath();
    c.fillStyle = "#3b2a5c";
    c.fill();
    outline(c, 2);
  });
  bake(scene, "veh-wyrm-wing", 90, 70, (c) => {
    c.beginPath();
    c.moveTo(10, 62);
    c.lineTo(30, 6);
    c.quadraticCurveTo(62, 10, 86, 30);
    c.quadraticCurveTo(70, 34, 66, 44);
    c.quadraticCurveTo(52, 42, 46, 54);
    c.quadraticCurveTo(32, 50, 26, 64);
    c.closePath();
    c.fillStyle = grad(c, 0, 6, 0, 64, [[0, "#ffcf6e"], [1, "#e86a24"]]);
    c.fill();
    outline(c, 2.5);
    c.strokeStyle = "#8a2a0c";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(30, 8);
    c.lineTo(46, 54);
    c.moveTo(30, 8);
    c.lineTo(66, 44);
    c.stroke();
  });

  // Stomp Rig: a two-legged walker with an open cockpit.
  bake(scene, "veh-stomp", 120, 150, (c) => {
    const leg = (x) => {
      c.fillStyle = "#4b5568";
      c.beginPath();
      c.moveTo(x - 7, 78);
      c.lineTo(x + 9, 78);
      c.lineTo(x + 14, 112);
      c.lineTo(x - 2, 112);
      c.closePath();
      c.fill();
      outline(c, 2.5);
      ellipse(c, x + 6, 112, 9, 9);
      c.fillStyle = "#ffc233";
      c.fill();
      outline(c, 2);
      c.fillStyle = "#3a4256";
      c.beginPath();
      c.moveTo(x, 114);
      c.lineTo(x + 12, 114);
      c.lineTo(x + 8, 136);
      c.lineTo(x - 2, 136);
      c.closePath();
      c.fill();
      outline(c, 2.5);
      c.fillStyle = "#2a3040";
      c.beginPath();
      c.moveTo(x - 12, 136);
      c.lineTo(x + 22, 136);
      c.lineTo(x + 20, 146);
      c.lineTo(x - 14, 146);
      c.closePath();
      c.fill();
      outline(c, 2.5);
    };
    leg(30);
    leg(76);
    // hull
    c.beginPath();
    c.moveTo(14, 40);
    c.lineTo(106, 40);
    c.lineTo(100, 84);
    c.lineTo(20, 84);
    c.closePath();
    c.fillStyle = grad(c, 0, 40, 0, 84, [[0, "#ffd65a"], [1, "#d99a12"]]);
    c.fill();
    outline(c);
    // hazard stripes
    c.save();
    c.beginPath();
    c.rect(20, 70, 80, 10);
    c.clip();
    for (let x = 0; x < 120; x += 14) {
      c.fillStyle = "#1a1408";
      c.beginPath();
      c.moveTo(x, 80);
      c.lineTo(x + 7, 70);
      c.lineTo(x + 14, 70);
      c.lineTo(x + 7, 80);
      c.fill();
    }
    c.restore();
    // cockpit rim
    c.beginPath();
    c.moveTo(24, 40);
    c.quadraticCurveTo(60, 22, 96, 40);
    c.fillStyle = "#2a3040";
    c.fill();
    outline(c, 2.5);
    // headlight
    ellipse(c, 102, 56, 7, 7);
    c.fillStyle = "#e9fbff";
    c.fill();
    outline(c, 2);
    // vents
    c.fillStyle = "#8a5b06";
    for (let i = 0; i < 3; i++) c.fillRect(30 + i * 9, 48, 5, 14);
  });

  // Coin Gull: a brass robot gull facing right.
  bake(scene, "veh-gull", 140, 90, (c) => {
    // tail
    c.beginPath();
    c.moveTo(30, 46);
    c.lineTo(4, 36);
    c.lineTo(8, 50);
    c.lineTo(2, 62);
    c.lineTo(32, 58);
    c.closePath();
    c.fillStyle = "#f2f2f2";
    c.fill();
    outline(c, 2.5);
    // body
    ellipse(c, 66, 52, 40, 22);
    c.fillStyle = grad(c, 0, 30, 0, 74, [[0, "#ffe9a0"], [0.5, "#f4c33a"], [1, "#b07a10"]]);
    c.fill();
    outline(c);
    // coin badge on the chest
    ellipse(c, 86, 58, 9, 9);
    c.fillStyle = "#fff3b8";
    c.fill();
    outline(c, 2);
    c.fillStyle = "#b07a10";
    c.font = "bold 11px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("$", 86, 58.5);
    // head
    ellipse(c, 108, 36, 17, 15);
    c.fillStyle = "#f6f6f6";
    c.fill();
    outline(c);
    // beak
    c.beginPath();
    c.moveTo(122, 34);
    c.lineTo(138, 40);
    c.lineTo(122, 44);
    c.closePath();
    c.fillStyle = "#ff9a2e";
    c.fill();
    outline(c, 2);
    // goggle eye
    ellipse(c, 112, 32, 6, 6);
    c.fillStyle = "#3ee8ff";
    c.fill();
    outline(c, 2);
    ellipse(c, 113.5, 30.5, 2, 2);
    c.fillStyle = "#fff";
    c.fill();
    // legs
    c.strokeStyle = "#ff9a2e";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(58, 72);
    c.lineTo(56, 84);
    c.moveTo(72, 72);
    c.lineTo(72, 84);
    c.stroke();
  });
  bake(scene, "veh-gull-wing", 80, 50, (c) => {
    c.beginPath();
    c.moveTo(8, 44);
    c.quadraticCurveTo(26, 4, 76, 8);
    c.quadraticCurveTo(62, 18, 66, 22);
    c.quadraticCurveTo(50, 24, 52, 32);
    c.quadraticCurveTo(36, 34, 36, 42);
    c.closePath();
    c.fillStyle = grad(c, 0, 6, 0, 44, [[0, "#ffffff"], [1, "#cfd8ea"]]);
    c.fill();
    outline(c, 2.5);
  });

  // Blink Pack: the device on the pilot's back, and the aim marker.
  bake(scene, "veh-blink", 44, 54, (c) => {
    c.beginPath();
    c.moveTo(8, 6);
    c.lineTo(36, 6);
    c.lineTo(40, 48);
    c.lineTo(4, 48);
    c.closePath();
    c.fillStyle = grad(c, 0, 6, 0, 48, [[0, "#5b6b8c"], [1, "#2a3450"]]);
    c.fill();
    outline(c, 2.5);
    ellipse(c, 22, 26, 11, 11);
    c.fillStyle = grad(c, 0, 15, 0, 37, [[0, "#c9fbff"], [1, "#16b6d6"]]);
    c.fill();
    outline(c, 2);
    ellipse(c, 19, 22, 4, 3);
    c.fillStyle = "rgba(255,255,255,0.85)";
    c.fill();
  });
  bake(scene, "veh-blink-mark", 64, 64, (c) => {
    c.lineWidth = 4;
    c.strokeStyle = "#3ee8ff";
    ellipse(c, 32, 32, 24, 24);
    c.stroke();
    c.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const a = (i * TAU) / 4;
      c.beginPath();
      c.moveTo(32 + Math.cos(a) * 14, 32 + Math.sin(a) * 14);
      c.lineTo(32 + Math.cos(a) * 30, 32 + Math.sin(a) * 30);
      c.stroke();
    }
  });

  // Tokens: a hexagonal badge per vehicle.
  const glyph = {
    blink: (c) => {
      c.strokeStyle = "#fff";
      c.lineWidth = 3;
      ellipse(c, 32, 32, 9, 9);
      c.stroke();
      c.beginPath();
      c.moveTo(32, 14);
      c.lineTo(32, 20);
      c.moveTo(32, 44);
      c.lineTo(32, 50);
      c.moveTo(14, 32);
      c.lineTo(20, 32);
      c.moveTo(44, 32);
      c.lineTo(50, 32);
      c.stroke();
    },
    wyrm: (c) => {
      c.fillStyle = "#fff";
      c.beginPath();
      c.moveTo(18, 40);
      c.quadraticCurveTo(26, 18, 46, 22);
      c.lineTo(50, 30);
      c.lineTo(42, 32);
      c.quadraticCurveTo(36, 44, 18, 40);
      c.fill();
      c.beginPath();
      c.moveTo(30, 26);
      c.lineTo(26, 14);
      c.lineTo(36, 23);
      c.fill();
    },
    stomp: (c) => {
      c.fillStyle = "#fff";
      c.fillRect(20, 18, 24, 14);
      c.fillRect(22, 32, 6, 14);
      c.fillRect(36, 32, 6, 14);
      c.fillRect(18, 44, 12, 4);
      c.fillRect(34, 44, 12, 4);
    },
    flip: (c) => {
      c.strokeStyle = "#fff";
      c.lineWidth = 3.5;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(24, 46);
      c.lineTo(24, 18);
      c.moveTo(17, 25);
      c.lineTo(24, 18);
      c.lineTo(31, 25);
      c.moveTo(40, 18);
      c.lineTo(40, 46);
      c.moveTo(33, 39);
      c.lineTo(40, 46);
      c.lineTo(47, 39);
      c.stroke();
    },
    gull: (c) => {
      c.fillStyle = "#fff";
      c.beginPath();
      c.moveTo(14, 36);
      c.quadraticCurveTo(24, 22, 32, 32);
      c.quadraticCurveTo(40, 22, 50, 36);
      c.quadraticCurveTo(40, 30, 32, 38);
      c.quadraticCurveTo(24, 30, 14, 36);
      c.fill();
    }
  };
  for (const id of VEHICLE_IDS) {
    const col = VEHICLES[id].color;
    const hex = (a) => `rgba(${(col >> 16) & 255},${(col >> 8) & 255},${col & 255},${a})`;
    bake(scene, `veh-tok-${id}`, 64, 64, (c) => {
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * TAU) / 6 - Math.PI / 2;
        const x = 32 + Math.cos(a) * 28, y = 32 + Math.sin(a) * 28;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.closePath();
      c.fillStyle = grad(c, 0, 4, 0, 60, [[0, hex(1)], [1, "rgba(20,24,48,1)"]]);
      c.fill();
      c.lineWidth = 3;
      c.strokeStyle = "#ffffff";
      c.stroke();
      glyph[id](c);
    });
  }
}

/* --------------------------------------------------------------- system --- */

// How each vehicle sits around the pilot's body centre, and its hitbox.
const LAYOUT = {
  wyrm: { img: [8, 4], pilot: [-14, -30], pilotScale: 0.74, hit: [-34, 30, 26] },
  gull: { img: [6, 8], pilot: [-12, -24], pilotScale: 0.72, hit: [-30, 26, 24] },
  stomp: { img: [0, -37], pilot: [0, -72], pilotScale: 0.74, hit: [-96, 30, 28], top: 112 },
  flip: { hit: null },
  blink: { hit: null }
};

export class Vehicles {
  constructor(scene, { minY, maxY, k }) {
    this.s = scene;
    this.minY = minY;
    this.maxY = maxY;
    this.k = k;
    this.id = null; // vehicle being ridden
    this.token = null;
    this.last = null;
    this.nextAt = 200 + Math.random() * 80; // meters
    this.prevHeld = false;
    bakeVehicles(scene);
    const img = (key, depth) => art(scene, 0, 0, key).setDepth(depth).setVisible(false);
    this.parts = {
      wyrm: img("veh-wyrm", 9.5), wyrmWing: img("veh-wyrm-wing", 10.6),
      gull: img("veh-gull", 9.5), gullWing: img("veh-gull-wing", 10.6),
      stomp: img("veh-stomp", 9.5), blink: img("veh-blink", 9.6), mark: img("veh-blink-mark", 11)
    };
    this.parts.wyrmWing.setOrigin(0.15, 0.9);
    this.parts.gullWing.setOrigin(0.12, 0.85);
    this.fire = scene.add.particles(0, 0, "spark", {
      speedX: { min: 260, max: 420 }, speedY: { min: -40, max: 40 }, lifespan: 380,
      scale: { start: 0.9 * artScale("spark"), end: 0 }, tint: [0xffd166, 0xff7a2e, 0xff3b1f],
      blendMode: Phaser.BlendModes.ADD, emitting: false
    }).setDepth(11);
  }

  get riding() {
    return !!this.id;
  }

  /** Body-relative hitbox [top, bottom, radius], or null for the pilot's own. */
  hitbox() {
    return this.id ? LAYOUT[this.id].hit : null;
  }

  coinValue() {
    if (this.id !== "gull") return 1;
    return lvlOf("gull") >= 3 ? 3 : 2;
  }

  /* ---- tokens ---- */

  pickId() {
    const weights = VEHICLE_IDS.map((id) => (id === this.last ? 0.25 : 1) * (1 + lvlOf(id) * 0.5));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < VEHICLE_IDS.length; i++) if ((r -= weights[i]) <= 0) return VEHICLE_IDS[i];
    return VEHICLE_IDS[0];
  }

  spawnToken(x) {
    const id = this.pickId();
    const s = this.s;
    const glow = art(s, 0, 0, "glow").setBlendMode(Phaser.BlendModes.ADD).setDepth(7).setTint(VEHICLES[id].color);
    glow.setDisplaySize(120, 120).setAlpha(0.6);
    const img = art(s, 0, 0, `veh-tok-${id}`).setDepth(8);
    const y = this.minY + (this.maxY - this.minY) * (0.25 + Math.random() * 0.5);
    this.token = { id, x, y, baseY: y, t: 0, img, glow };
  }

  update(move, dt, time) {
    const s = this.s, p = s.player;
    // A token every 300-450 m while on foot.
    if (!this.id && !this.token && s.state === "run" && s.meters >= this.nextAt) {
      this.spawnToken(W + 60);
    }
    const t = this.token;
    if (t) {
      t.x -= move;
      t.t += dt;
      t.y = t.baseY + Math.sin(t.t * 2.6) * 14;
      t.img.setPosition(t.x, t.y).setRotation(Math.sin(t.t * 1.8) * 0.12);
      t.glow.setPosition(t.x, t.y).setAlpha(0.45 + Math.sin(t.t * 6) * 0.15);
      if (s.state === "run" && !this.id && Math.hypot(t.x - p.x, t.y - p.y) < 48) this.mount(t.id);
      else if (t.x < -60) this.clearToken(true);
    }
    if (!this.id) return;

    // Ember Wyrm: its breath burns lasers and missiles just ahead.
    if (this.id === "wyrm" && s.state === "run") {
      const range = 150 + lvlOf("wyrm") * 25;
      const fx = p.x + 60, fy = p.y - 8;
      if (!s.lowFx || Math.random() < 0.4) this.fire.emitParticleAt(fx, fy, 2);
      for (const z of s.zappers) {
        if (z.dead || z.x < fx - 10 || z.x > fx + range) continue;
        const half = Math.abs(Math.sin(z.angle)) * z.len / 2 + 10;
        if (Math.abs(z.y - fy) < half + 30) this.burn(z);
      }
      for (const m of s.missiles) {
        if (!m.dead && m.x > fx && m.x < fx + range + 60 && Math.abs(m.y - fy) < 50) {
          s.destroyHazard(m);
        }
      }
    }
  }

  burn(z) {
    const s = this.s;
    s.destroyHazard(z);
    s.audio.play("impact", { volume: 0.3, rate: 1.4, throttle: 120 });
  }

  clearToken(missed) {
    if (!this.token) return;
    this.token.img.destroy();
    this.token.glow.destroy();
    this.token = null;
    if (missed) this.nextAt = this.s.meters + 120 + Math.random() * 80;
  }

  mount(id) {
    const s = this.s;
    this.clearToken(false);
    this.id = id;
    this.last = id;
    this.gdir = 1; // Flip Suit: 1 = floor, -1 = ceiling
    this.charge = 0;
    this.aim = null;
    this.airborne = false;
    this.prevHeld = s.inputHeld();
    s.takeTaps();
    s.player.vy = 0;
    s.ringBurst(s.player.x, s.player.y, VEHICLES[id].color, 1.6);
    s.audio.play("powerup", { volume: 0.6 });
    s.audio.haptic(30);
    s.ui.toast(VEHICLES[id].name.toUpperCase(), VEHICLES[id].css);
  }

  /** A hit wrecks the vehicle; the pilot carries on by jetpack. */
  eject() {
    const s = this.s, p = s.player;
    const name = VEHICLES[this.id].name;
    s.explode(p.x + 10, p.y);
    s.shake(220, 0.01);
    s.audio.haptic([40, 30, 60]);
    s.ui.toast(`${name.toUpperCase()} WRECKED`, "#ff6b86");
    this.dismount();
    p.vy = -260 * this.k;
    s.invuln = 1.4;
  }

  dismount() {
    const s = this.s;
    this.id = null;
    for (const k of Object.keys(this.parts)) this.parts[k].setVisible(false);
    s.sprite.setFlipY(false);
    s.sprite.clearTint();
    this.nextAt = s.meters + 300 + Math.random() * 150;
  }

  /* ---- controls: return true when the vehicle moved the pilot ---- */

  fly(p, held, dt) {
    const k = this.k, s = this.s;
    const taps = s.takeTaps();
    const pressed = taps > 0 || (held && !this.prevHeld);
    // A whole tap between two frames still counts as a press and a release.
    const released = (!held && this.prevHeld) || (taps > 0 && !held);
    this.prevHeld = held;
    const top = this.minY + ((LAYOUT[this.id].top || 0) ? LAYOUT[this.id].top - 38 : 0);
    switch (this.id) {
      case "wyrm":
      case "gull": {
        const flap = this.id === "wyrm" ? 380 : 330, g = this.id === "wyrm" ? 1000 : 820;
        if (pressed) {
          p.vy = -flap * k;
          this.flapAt = s.time.now;
          s.audio.play("thrust", { volume: 0.25, rate: 0.7, throttle: 90 });
        }
        p.vy = Math.min(p.vy + g * k * dt, 620 * k);
        break;
      }
      case "stomp": {
        if (this.grounded(p) && held) this.charge = Math.min(0.7, this.charge + dt);
        if (this.grounded(p) && released && this.charge > 0) {
          p.vy = -(460 + 640 * (this.charge / 0.7)) * k;
          this.charge = 0;
          this.airborne = true;
          s.audio.play("impact", { volume: 0.25, rate: 0.6 });
        }
        p.vy += 1500 * k * dt;
        break;
      }
      case "flip": {
        if (pressed) {
          this.gdir = -this.gdir;
          s.audio.tone(this.gdir < 0 ? 620 : 420, 0.1, 0.04, "triangle", this.gdir < 0 ? 900 : 260);
        }
        const g = 1700 * (1 + lvlOf("flip") * 0.12);
        p.vy = clamp(p.vy + this.gdir * g * k * dt, -760 * k, 760 * k);
        break;
      }
      case "blink": {
        if (held) {
          // The aim marker climbs from the pilot and bounces between ceiling and floor.
          if (!this.aim) this.aim = { y: p.y, dir: -1 };
          const sp = 560 * k * (1 - lvlOf("blink") * 0.1);
          this.aim.y += this.aim.dir * sp * dt;
          if (this.aim.y < this.minY) { this.aim.y = this.minY; this.aim.dir = 1; }
          if (this.aim.y > this.maxY) { this.aim.y = this.maxY; this.aim.dir = -1; }
        } else if (this.aim) {
          // Teleport: nothing on the way can touch you.
          s.ringBurst(p.x, p.y, 0x3ee8ff, 1);
          p.y = this.aim.y;
          p.vy = 0;
          this.aim = null;
          s.ringBurst(p.x, p.y, 0x3ee8ff, 1.3);
          s.audio.tone(1200, 0.12, 0.05, "sine", 400);
        }
        p.vy = Math.min(p.vy + 260 * k * dt, 220 * k); // a slow drift down between blinks
        break;
      }
    }
    p.y += p.vy * dt;
    if (p.y >= this.maxY) {
      if (this.id === "stomp" && this.airborne && p.vy > 200 * k) this.groundPound(p);
      p.y = this.maxY;
      p.vy = 0;
      this.airborne = false;
    }
    if (p.y <= top) {
      p.y = top;
      if (this.id !== "flip") p.vy = Math.max(p.vy, 0);
      else p.vy = 0;
    }
    return true;
  }

  grounded(p) {
    return p.y >= this.maxY - 0.5;
  }

  groundPound(p) {
    const s = this.s;
    const reach = 140 + lvlOf("stomp") * 25;
    s.shake(200, 0.012);
    s.dustFx.explode(s.lowFx ? 8 : 18, p.x, s.floorY);
    s.ringBurst(p.x, s.floorY - 10, 0xffc233, 1.5);
    s.audio.play("impact", { volume: 0.5, rate: 0.7 });
    for (const z of s.zappers) {
      if (z.dead || Math.abs(z.x - p.x) > reach) continue;
      const bottom = z.y + Math.abs(Math.sin(z.angle)) * z.len / 2;
      if (bottom > s.floorY - 160) this.burn(z);
    }
  }

  /** Draws the vehicle around the pilot. Called after the pilot sprite is placed. */
  render(time) {
    const s = this.s, p = s.player, sp = s.sprite;
    const L = LAYOUT[this.id];
    if (this.id === "wyrm" || this.id === "gull" || this.id === "stomp") {
      const body = this.parts[this.id];
      const bob = this.id === "stomp" && this.grounded(p) ? Math.sin(time * 0.02) * 1.5 : 0;
      const squash = this.id === "stomp" ? 1 - this.charge * 0.12 : 1;
      body.setVisible(true).setPosition(p.x + L.img[0], p.y + L.img[1] + bob + (1 - squash) * 40).setScale(artScale(`veh-${this.id}`), artScale(`veh-${this.id}`) * squash);
      body.rotation = this.id === "stomp" ? 0 : clamp(p.vy / (1400 * this.k), -0.25, 0.3);
      sp.setPosition(p.x + L.pilot[0], p.y + L.pilot[1] + bob + (1 - squash) * 40);
      sp.setScale(0.4 * L.pilotScale);
      sp.rotation = body.rotation * 0.5;
      if (this.id !== "stomp") {
        const wing = this.parts[this.id === "wyrm" ? "wyrmWing" : "gullWing"];
        const since = (s.time.now - (this.flapAt || 0)) / 1000;
        const flap = since < 0.25 ? Math.sin((since / 0.25) * Math.PI) : 0;
        wing.setVisible(true).setPosition(p.x + L.img[0] - 14, p.y + L.img[1] - 8);
        wing.rotation = body.rotation - 0.5 + flap * 1.5 + Math.sin(time * 0.006) * 0.08;
      }
    } else if (this.id === "flip") {
      // The pilot runs on the floor or the ceiling, upside down up there.
      const up = this.gdir < 0;
      sp.setFlipY(up);
      sp.setTint(0xd7c4ff);
      if (up) sp.setPosition(p.x, p.y - 38 + s.pilotMeta.footY * 0.4);
      sp.rotation = 0;
    } else if (this.id === "blink") {
      const pack = this.parts.blink;
      pack.setVisible(true).setPosition(p.x - 18, p.y - 4).setAlpha(0.85 + Math.sin(time * 0.02) * 0.15);
      const m = this.parts.mark;
      if (this.aim) m.setVisible(true).setPosition(p.x + 6, this.aim.y).setRotation(time * 0.004).setAlpha(0.9);
      else m.setVisible(false);
    }
  }
}
