// Procedural art. Every hazard, pickup, effect and background layer is painted
// once at load with Canvas 2D at the device's pixel density, then reused as a
// GPU texture. This keeps the download tiny and every edge razor sharp.

const Phaser = window.Phaser;
export const ART_SCALE = {};

export function bake(scene, key, w, h, draw, scale) {
  const s = scale ?? scene.registry.get("R") ?? 1;
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, Math.ceil(w * s), Math.ceil(h * s));
  const ctx = tex.getContext();
  ctx.save();
  ctx.scale(s, s);
  draw(ctx, w, h);
  ctx.restore();
  tex.refresh();
  ART_SCALE[key] = s;
  return key;
}

/** Adds a baked image at logical size. */
export function art(scene, x, y, key, frame) {
  const img = scene.add.image(x, y, key, frame);
  img.setScale(1 / (ART_SCALE[key] || 1));
  return img;
}

export const artScale = (key) => 1 / (ART_SCALE[key] || 1);

const TAU = Math.PI * 2;
const rgba = (hex, a) => `rgba(${(hex >> 16) & 255},${(hex >> 8) & 255},${hex & 255},${a})`;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function lin(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

function rad(ctx, x, y, r0, r1, stops, fx = x, fy = y) {
  const g = ctx.createRadialGradient(fx, fy, r0, x, y, r1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

// Deterministic noise so the art looks identical every load.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ------------------------------------------------------------------ FX --- */

function bakeFx(scene) {
  bake(scene, "glow", 128, 128, (c) => {
    c.fillStyle = rad(c, 64, 64, 0, 64, [[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,0.55)"], [0.6, "rgba(255,255,255,0.12)"], [1, "rgba(255,255,255,0)"]]);
    c.fillRect(0, 0, 128, 128);
  }, 1);
  bake(scene, "spark", 16, 16, (c) => {
    c.fillStyle = rad(c, 8, 8, 0, 8, [[0, "#fff"], [0.45, "rgba(255,255,255,0.9)"], [1, "rgba(255,255,255,0)"]]);
    c.fillRect(0, 0, 16, 16);
  });
  bake(scene, "streak", 64, 6, (c) => {
    c.fillStyle = lin(c, 0, 0, 64, 0, [[0, "rgba(255,255,255,0)"], [0.8, "rgba(255,255,255,0.9)"], [1, "rgba(255,255,255,1)"]]);
    rr(c, 0, 1, 64, 4, 2);
    c.fill();
  });
  bake(scene, "smoke", 48, 48, (c) => {
    c.fillStyle = rad(c, 24, 24, 0, 24, [[0, "rgba(255,255,255,0.75)"], [0.55, "rgba(255,255,255,0.3)"], [1, "rgba(255,255,255,0)"]]);
    c.fillRect(0, 0, 48, 48);
  }, 1);
  bake(scene, "ring", 128, 128, (c) => {
    c.strokeStyle = "#fff";
    c.lineWidth = 6;
    c.beginPath();
    c.arc(64, 64, 58, 0, TAU);
    c.stroke();
  });
  bake(scene, "flame", 64, 28, (c) => {
    // Teardrop plume pointing left: white-hot core, orange body, red tips.
    const plume = (len, h, col) => {
      c.beginPath();
      c.moveTo(62, 14 - h);
      c.bezierCurveTo(40, 14 - h, 64 - len * 0.7, 14 - h * 0.4, 64 - len, 14);
      c.bezierCurveTo(64 - len * 0.7, 14 + h * 0.4, 40, 14 + h, 62, 14 + h);
      c.closePath();
      c.fillStyle = col;
      c.fill();
    };
    plume(62, 12, lin(c, 64, 0, 0, 0, [[0, "rgba(255,120,40,0.95)"], [1, "rgba(255,40,60,0)"]]));
    plume(44, 8, lin(c, 64, 0, 10, 0, [[0, "rgba(255,220,90,1)"], [1, "rgba(255,150,40,0)"]]));
    plume(24, 4.5, lin(c, 64, 0, 36, 0, [[0, "#fff"], [1, "rgba(255,255,220,0)"]]));
  });
  bake(scene, "shield", 150, 150, (c) => {
    const cx = 75, cy = 75;
    c.fillStyle = rad(c, cx, cy, 30, 70, [[0, "rgba(62,232,255,0)"], [0.7, "rgba(62,232,255,0.12)"], [1, "rgba(62,232,255,0.45)"]]);
    c.beginPath();
    c.arc(cx, cy, 70, 0, TAU);
    c.fill();
    // Hex lattice clipped to the bubble
    c.save();
    c.beginPath();
    c.arc(cx, cy, 69, 0, TAU);
    c.clip();
    c.strokeStyle = "rgba(160,245,255,0.22)";
    c.lineWidth = 1.2;
    const s = 11;
    for (let row = -8; row < 9; row++) {
      for (let col = -8; col < 9; col++) {
        const x = cx + col * s * 1.73 + (row % 2 ? s * 0.866 : 0);
        const y = cy + row * s * 1.5;
        c.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = Math.PI / 6 + (k * Math.PI) / 3;
          const px = x + Math.cos(a) * s * 0.95;
          const py = y + Math.sin(a) * s * 0.95;
          k ? c.lineTo(px, py) : c.moveTo(px, py);
        }
        c.closePath();
        c.stroke();
      }
    }
    c.restore();
    c.lineWidth = 3;
    c.strokeStyle = "rgba(170,248,255,0.95)";
    c.beginPath();
    c.arc(cx, cy, 69, 0, TAU);
    c.stroke();
    c.lineCap = "round";
    c.lineWidth = 5;
    c.strokeStyle = "rgba(255,255,255,0.85)";
    c.beginPath();
    c.arc(cx, cy, 60, Math.PI * 1.1, Math.PI * 1.4);
    c.stroke();
  });
}

/* --------------------------------------------------------------- COINS --- */

function drawCoinFace(c, cx, cy, r, squash) {
  c.save();
  c.translate(cx, cy);
  c.scale(Math.max(0.08, squash), 1);
  // Edge (thickness shows as the coin turns)
  c.fillStyle = "#a8610a";
  c.beginPath();
  c.arc(1.5, 1.5, r, 0, TAU);
  c.fill();
  c.fillStyle = rad(c, 0, 0, 0, r, [[0, "#fff4b8"], [0.45, "#ffd23f"], [0.85, "#f2a40e"], [1, "#c9780a"]], -r * 0.35, -r * 0.4);
  c.beginPath();
  c.arc(0, 0, r, 0, TAU);
  c.fill();
  c.lineWidth = r * 0.09;
  c.strokeStyle = "#8a4d05";
  c.stroke();
  c.lineWidth = r * 0.07;
  c.strokeStyle = "rgba(255,248,210,0.9)";
  c.beginPath();
  c.arc(0, 0, r * 0.74, 0, TAU);
  c.stroke();
  // Star emblem
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr2 = i % 2 === 0 ? r * 0.5 : r * 0.21;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = Math.cos(a) * rr2;
    const py = Math.sin(a) * rr2 + r * 0.02;
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.closePath();
  c.fillStyle = "#b86a06";
  c.fill();
  c.translate(-r * 0.04, -r * 0.05);
  c.fillStyle = "#fff1a6";
  c.fill();
  c.restore();
  // Specular glint stays upright regardless of spin.
  if (squash > 0.35) {
    c.fillStyle = "rgba(255,255,255,0.8)";
    c.beginPath();
    c.ellipse(cx - r * 0.35 * squash, cy - r * 0.45, r * 0.22 * squash, r * 0.1, -0.6, 0, TAU);
    c.fill();
  }
}

function bakeCoins(scene) {
  const frames = 10;
  const size = 36;
  const key = bake(scene, "coin", size * frames, size, (c) => {
    for (let i = 0; i < frames; i++) {
      const squash = Math.abs(Math.cos((i / frames) * Math.PI));
      drawCoinFace(c, i * size + size / 2, size / 2, 15, squash);
    }
  });
  const s = ART_SCALE[key];
  const tex = scene.textures.get(key);
  for (let i = 0; i < frames; i++) tex.add(`c${i}`, 0, i * size * s, 0, size * s, size * s);
  if (!scene.anims.exists("coin-spin")) {
    scene.anims.create({
      key: "coin-spin",
      frames: Array.from({ length: frames }, (_, i) => ({ key, frame: `c${i}` })),
      frameRate: 14,
      repeat: -1
    });
  }
}

/* ------------------------------------------------------------ POWERUPS --- */

function orb(c, cx, cy, r, base, dark) {
  c.fillStyle = rad(c, cx, cy, r * 0.6, r * 1.6, [[0, rgba(base, 0.35)], [1, rgba(base, 0)]]);
  c.fillRect(cx - r * 1.7, cy - r * 1.7, r * 3.4, r * 3.4);
  c.fillStyle = rad(c, cx, cy, 0, r, [[0, "#ffffff"], [0.25, rgba(base, 1)], [1, rgba(dark, 1)]], cx - r * 0.3, cy - r * 0.4);
  c.beginPath();
  c.arc(cx, cy, r, 0, TAU);
  c.fill();
  c.lineWidth = 3;
  c.strokeStyle = "rgba(255,255,255,0.9)";
  c.stroke();
  c.lineWidth = 2;
  c.strokeStyle = rgba(dark, 1);
  c.beginPath();
  c.arc(cx, cy, r + 2.5, 0, TAU);
  c.stroke();
}

function gloss(c, cx, cy, r) {
  c.fillStyle = lin(c, 0, cy - r, 0, cy, [[0, "rgba(255,255,255,0.7)"], [1, "rgba(255,255,255,0)"]]);
  c.beginPath();
  c.ellipse(cx, cy - r * 0.45, r * 0.68, r * 0.42, 0, 0, TAU);
  c.fill();
}

function bakePowerups(scene) {
  const S = 76, cx = 38, cy = 38, r = 22;
  bake(scene, "pu-shield", S, S, (c) => {
    orb(c, cx, cy, r, 0x3ee8ff, 0x0a5a8c);
    c.beginPath();
    c.moveTo(cx, cy - 12);
    c.quadraticCurveTo(cx + 10, cy - 8, cx + 11, cy - 7);
    c.quadraticCurveTo(cx + 11, cy + 7, cx, cy + 13);
    c.quadraticCurveTo(cx - 11, cy + 7, cx - 11, cy - 7);
    c.quadraticCurveTo(cx - 10, cy - 8, cx, cy - 12);
    c.fillStyle = "#fff";
    c.fill();
    c.fillStyle = "#1a8fd0";
    c.beginPath();
    c.moveTo(cx, cy - 7);
    c.lineTo(cx, cy + 8);
    c.quadraticCurveTo(cx - 7, cy + 4, cx - 7, cy - 4);
    c.closePath();
    c.fill();
    gloss(c, cx, cy, r);
  });
  bake(scene, "pu-chrono", S, S, (c) => {
    orb(c, cx, cy, r, 0xa77bff, 0x3b1d8f);
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(cx, cy + 1, 12, 0, TAU);
    c.fill();
    c.fillRect(cx - 3, cy - 16, 6, 4);
    c.strokeStyle = "#5a2fd0";
    c.lineWidth = 2.6;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(cx, cy + 1);
    c.lineTo(cx, cy - 7);
    c.moveTo(cx, cy + 1);
    c.lineTo(cx + 6, cy + 4);
    c.stroke();
    gloss(c, cx, cy, r);
  });
  bake(scene, "pu-ghost", S, S, (c) => {
    orb(c, cx, cy, r, 0x7dffc8, 0x0d6b5a);
    // A little ghost: round head, wavy hem, two eyes.
    c.fillStyle = "rgba(255,255,255,0.95)";
    c.beginPath();
    c.moveTo(cx - 10, cy + 11);
    c.lineTo(cx - 10, cy - 2);
    c.arc(cx, cy - 2, 10, Math.PI, 0);
    c.lineTo(cx + 10, cy + 11);
    c.quadraticCurveTo(cx + 7, cy + 7, cx + 5, cy + 11);
    c.quadraticCurveTo(cx + 2.5, cy + 7, cx, cy + 11);
    c.quadraticCurveTo(cx - 2.5, cy + 7, cx - 5, cy + 11);
    c.quadraticCurveTo(cx - 7, cy + 7, cx - 10, cy + 11);
    c.fill();
    c.fillStyle = "#0d6b5a";
    c.beginPath();
    c.ellipse(cx - 4, cy - 2, 2, 3, 0, 0, TAU);
    c.ellipse(cx + 4, cy - 2, 2, 3, 0, 0, TAU);
    c.fill();
    gloss(c, cx, cy, r);
  });
  bake(scene, "pu-magnet", S, S, (c) => {
    orb(c, cx, cy, r, 0xff5a4e, 0x8c1520);
    // Horseshoe magnet: white body with silver pole tips.
    c.lineCap = "butt";
    c.lineWidth = 7;
    c.strokeStyle = "#fff";
    c.beginPath();
    c.moveTo(cx - 8, cy - 9);
    c.lineTo(cx - 8, cy);
    c.arc(cx, cy, 8, Math.PI, 0, true);
    c.lineTo(cx + 8, cy - 9);
    c.stroke();
    c.fillStyle = "#cfd8ea";
    c.fillRect(cx - 11.5, cy - 14, 7, 6);
    c.fillRect(cx + 4.5, cy - 14, 7, 6);
    gloss(c, cx, cy, r);
  });
}

/* -------------------------------------------------------------- HAZARDS --- */

function bakeHazards(scene) {
  // Laser emitter: armoured node with a hazard ring and glowing lens.
  bake(scene, "emitter", 52, 52, (c) => {
    const cx = 26, cy = 26;
    c.fillStyle = "rgba(0,0,0,0.35)";
    c.beginPath();
    c.arc(cx + 1.5, cy + 2.5, 22, 0, TAU);
    c.fill();
    c.fillStyle = rad(c, cx, cy, 2, 22, [[0, "#6d7f9e"], [0.7, "#2c3854"], [1, "#141b2e"]], cx - 7, cy - 8);
    c.beginPath();
    c.arc(cx, cy, 21, 0, TAU);
    c.fill();
    // Hazard ring
    c.save();
    c.beginPath();
    c.arc(cx, cy, 18, 0, TAU);
    c.arc(cx, cy, 13, 0, TAU, true);
    c.clip();
    for (let i = 0; i < 12; i++) {
      c.fillStyle = i % 2 ? "#141b2e" : "#ffc233";
      c.beginPath();
      c.moveTo(cx, cy);
      c.arc(cx, cy, 20, (i * TAU) / 12, ((i + 1) * TAU) / 12);
      c.closePath();
      c.fill();
    }
    c.restore();
    c.fillStyle = rad(c, cx, cy, 0, 12, [[0, "#ffffff"], [0.35, "#ffb3c2"], [0.7, "#ff2e55"], [1, "#6d0a22"]]);
    c.beginPath();
    c.arc(cx, cy, 11, 0, TAU);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.85)";
    c.beginPath();
    c.ellipse(cx - 3.5, cy - 4, 3.5, 2, -0.6, 0, TAU);
    c.fill();
    c.lineWidth = 1.5;
    c.strokeStyle = "rgba(200,220,255,0.5)";
    c.beginPath();
    c.arc(cx, cy, 20.5, Math.PI * 1.05, Math.PI * 1.6);
    c.stroke();
  });

  // Beam: stretched horizontally at runtime. Vertical profile = glow > body > core.
  bake(scene, "beam", 8, 40, (c) => {
    c.fillStyle = lin(c, 0, 0, 0, 40, [
      [0, "rgba(255,40,80,0)"], [0.3, "rgba(255,40,80,0.35)"], [0.42, "rgba(255,90,120,0.95)"],
      [0.47, "#ffe3ea"], [0.53, "#ffe3ea"], [0.58, "rgba(255,90,120,0.95)"], [0.7, "rgba(255,40,80,0.35)"], [1, "rgba(255,40,80,0)"]
    ]);
    c.fillRect(0, 0, 8, 40);
  });

  // Crackle overlay that scrolls along the beam.
  bake(scene, "crackle", 128, 40, (c) => {
    const rand = rng(7);
    c.lineCap = "round";
    c.lineJoin = "round";
    for (let pass = 0; pass < 2; pass++) {
      c.beginPath();
      let y = 20;
      c.moveTo(0, 20);
      for (let x = 8; x <= 128; x += 8) {
        y = x === 128 ? 20 : 20 + (rand() - 0.5) * 16;
        c.lineTo(x, y);
      }
      c.strokeStyle = pass ? "rgba(255,255,255,0.95)" : "rgba(255,120,150,0.55)";
      c.lineWidth = pass ? 1.4 : 3.5;
      c.stroke();
    }
  });

  // Buzz saw
  bake(scene, "saw", 84, 84, (c) => {
    const cx = 42, cy = 42;
    c.beginPath();
    const teeth = 16;
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * TAU;
      const a1 = ((i + 0.62) / teeth) * TAU;
      const a2 = ((i + 1) / teeth) * TAU;
      c.lineTo(cx + Math.cos(a0) * 31, cy + Math.sin(a0) * 31);
      c.lineTo(cx + Math.cos(a1) * 40, cy + Math.sin(a1) * 40);
      c.lineTo(cx + Math.cos(a2) * 31, cy + Math.sin(a2) * 31);
    }
    c.closePath();
    c.fillStyle = rad(c, cx, cy, 8, 40, [[0, "#f4f8ff"], [0.6, "#b8c6dc"], [1, "#6b7a96"]], cx - 10, cy - 12);
    c.fill();
    c.lineWidth = 2;
    c.strokeStyle = "#2a3350";
    c.stroke();
    // Brushed grooves
    c.strokeStyle = "rgba(40,50,80,0.35)";
    c.lineWidth = 1;
    for (let rr2 = 12; rr2 < 30; rr2 += 4) {
      c.beginPath();
      c.arc(cx, cy, rr2, 0, TAU);
      c.stroke();
    }
    // Cut-outs
    c.fillStyle = "#1a2034";
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + 0.4;
      c.beginPath();
      c.ellipse(cx + Math.cos(a) * 19, cy + Math.sin(a) * 19, 5.5, 3, a + Math.PI / 2, 0, TAU);
      c.fill();
    }
    c.fillStyle = rad(c, cx, cy, 0, 10, [[0, "#fff"], [0.4, "#ffc233"], [1, "#a8610a"]]);
    c.beginPath();
    c.arc(cx, cy, 9, 0, TAU);
    c.fill();
    c.fillStyle = "#2a3350";
    c.beginPath();
    c.arc(cx, cy, 3.5, 0, TAU);
    c.fill();
  });
  bake(scene, "saw-blur", 96, 96, (c) => {
    c.strokeStyle = "rgba(255,90,110,0.55)";
    c.lineWidth = 4;
    c.beginPath();
    c.arc(48, 48, 43, 0.2, 2.2);
    c.stroke();
    c.beginPath();
    c.arc(48, 48, 43, 3.3, 5.3);
    c.stroke();
  });
  bake(scene, "rail", 14, 64, (c) => {
    c.fillStyle = lin(c, 0, 0, 14, 0, [[0, "#141b2e"], [0.35, "#56668a"], [0.6, "#2b3656"], [1, "#0d1222"]]);
    c.fillRect(3, 0, 8, 64);
    c.fillStyle = "rgba(255,194,51,0.9)";
    for (let y = 4; y < 64; y += 16) c.fillRect(5, y, 4, 6);
  });
  bake(scene, "rail-cap", 34, 16, (c) => {
    c.fillStyle = lin(c, 0, 0, 0, 16, [[0, "#6d7f9e"], [1, "#1c2640"]]);
    rr(c, 1, 1, 32, 14, 4);
    c.fill();
    c.strokeStyle = "#0b1020";
    c.lineWidth = 1.5;
    c.stroke();
    c.fillStyle = "#ffc233";
    c.fillRect(7, 6, 20, 4);
  });

  // Missile, nose pointing left.
  bake(scene, "missile", 96, 34, (c) => {
    const y = 17;
    // Fins
    c.fillStyle = "#b3122f";
    c.beginPath();
    c.moveTo(66, y - 5);
    c.lineTo(88, y - 16);
    c.lineTo(92, y - 16);
    c.lineTo(86, y - 4);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(66, y + 5);
    c.lineTo(88, y + 16);
    c.lineTo(92, y + 16);
    c.lineTo(86, y + 4);
    c.closePath();
    c.fill();
    // Body
    c.fillStyle = lin(c, 0, y - 8, 0, y + 8, [[0, "#ffffff"], [0.45, "#d7deea"], [1, "#7c879e"]]);
    c.beginPath();
    c.moveTo(4, y);
    c.quadraticCurveTo(14, y - 9, 28, y - 8);
    c.lineTo(88, y - 7);
    c.lineTo(88, y + 7);
    c.lineTo(28, y + 8);
    c.quadraticCurveTo(14, y + 9, 4, y);
    c.closePath();
    c.fill();
    c.lineWidth = 1.6;
    c.strokeStyle = "#1b2238";
    c.stroke();
    // Nose cone
    c.save();
    c.clip();
    c.fillStyle = lin(c, 0, y - 8, 0, y + 8, [[0, "#ff7a8a"], [0.5, "#ff2e55"], [1, "#8a0c26"]]);
    c.fillRect(0, 0, 26, 34);
    c.fillStyle = "#1b2238";
    c.fillRect(46, 0, 3, 34);
    c.fillStyle = "#ffc233";
    for (let i = 0; i < 4; i++) c.fillRect(54 + i * 6, 0, 3, 34);
    c.restore();
    // Nozzle
    c.fillStyle = "#2a3350";
    rr(c, 86, y - 6, 8, 12, 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.7)";
    c.fillRect(30, y - 6, 40, 2);
  });

  // Edge warning badge (missiles) and lock-on variant.
  const badge = (key, fill, edge) =>
    bake(scene, key, 60, 60, (c) => {
      c.fillStyle = rad(c, 30, 30, 10, 30, [[0, rgba(fill, 0.55)], [1, rgba(fill, 0)]]);
      c.fillRect(0, 0, 60, 60);
      c.beginPath();
      c.moveTo(30, 9);
      c.lineTo(52, 48);
      c.lineTo(8, 48);
      c.closePath();
      c.lineJoin = "round";
      c.lineWidth = 6;
      c.strokeStyle = rgba(edge, 1);
      c.stroke();
      c.fillStyle = rgba(fill, 1);
      c.fill();
      c.fillStyle = "#170611";
      rr(c, 27.5, 21, 5, 15, 2.5);
      c.fill();
      c.beginPath();
      c.arc(30, 41.5, 3, 0, TAU);
      c.fill();
    });
  badge("warn", 0xffc233, 0x2b1605);
  badge("warn-lock", 0xff2e55, 0xffffff);

  // Beam pod that clamps to the screen edge for barrage events.
  bake(scene, "pod", 44, 40, (c) => {
    c.fillStyle = "rgba(0,0,0,0.35)";
    rr(c, 2, 5, 40, 32, 8);
    c.fill();
    c.fillStyle = lin(c, 0, 2, 0, 38, [[0, "#6d7f9e"], [0.5, "#2c3854"], [1, "#141b2e"]]);
    rr(c, 0, 2, 38, 34, 8);
    c.fill();
    c.lineWidth = 1.5;
    c.strokeStyle = "#0b1020";
    c.stroke();
    c.fillStyle = "#ffc233";
    c.fillRect(4, 6, 6, 26);
    c.fillStyle = "#141b2e";
    for (let y = 8; y < 32; y += 6) c.fillRect(4, y, 6, 2.5);
    c.fillStyle = rad(c, 30, 19, 0, 10, [[0, "#fff"], [0.4, "#ff6b86"], [1, "#6d0a22"]]);
    c.beginPath();
    c.arc(30, 19, 8.5, 0, TAU);
    c.fill();
  });
}

// Best-distance marker: visible from the menu, so it is baked with the menu art.
function bakeFlag(scene) {
  bake(scene, "flag", 40, 150, (c) => {
    c.setLineDash([6, 6]);
    c.strokeStyle = "rgba(255,194,51,0.8)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(6, 0);
    c.lineTo(6, 150);
    c.stroke();
    c.setLineDash([]);
  });
}

/* ---------------------------------------------------------- BACKGROUND --- */

// Paints a layer twice, the second copy shifted one tile left, so anything that
// overflows the right edge wraps around and the tile repeats without a seam.
function wrapPaint(c, tile, paint) {
  paint(c);
  c.save();
  c.translate(-tile, 0);
  paint(c);
  c.restore();
}

// Background layers are rendered at a capped density: they sit behind a depth
// blur anyway and this keeps GPU memory low on 3x phones.
let bgBakedFor = "";

function bakeBackground(scene, H, floorY) {
  const bgScale = Math.min(scene.registry.get("R") || 1, 1.5);
  const TILE = 512;
  // The two wall layers are as tall as the playfield: repaint them if the
  // playfield height changed (the scene that used them has already shut down).
  const sig = `${H}@${bgScale}`;
  if (bgBakedFor && bgBakedFor !== sig) {
    for (const key of ["bg-far", "bg-mid"]) if (scene.textures.exists(key)) scene.textures.remove(key);
  }
  bgBakedFor = sig;

  // Far: tall tower silhouettes with lit windows, drawn in neutral tones so
  // the theme tint can recolour them.
  bake(scene, "bg-far", TILE, H, (c) => wrapPaint(c, TILE, (c) => {
    const rand = rng(11);
    const baseY = floorY + 10;
    for (let layer = 0; layer < 2; layer++) {
      let x = layer ? 8 : 0;
      while (x < TILE) {
        const w = 46 + rand() * 70;
        const h = (layer ? 0.35 : 0.55) * H + rand() * H * (layer ? 0.28 : 0.3);
        const top = baseY - h;
        c.fillStyle = layer ? "rgba(150,170,210,0.16)" : "rgba(120,140,190,0.10)";
        c.fillRect(x, top, w, h);
        // antenna
        if (rand() > 0.6) c.fillRect(x + w * 0.5 - 1, top - 26, 2, 26);
        // windows
        c.fillStyle = layer ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.16)";
        for (let wy = top + 10; wy < baseY - 10; wy += 12) {
          for (let wx = x + 6; wx < x + w - 8; wx += 10) {
            if (rand() > 0.62) c.fillRect(wx, wy, 5, 5);
          }
        }
        x += w + 6 + rand() * 20;
      }
    }
  }), bgScale);

  // Mid: structural lab wall — columns, glowing conduits, holo panels.
  bake(scene, "bg-mid", TILE, H, (c) => wrapPaint(c, TILE, (c) => {
    const rand = rng(23);
    const top = 70;
    const bottom = floorY;
    for (let i = 0; i < 4; i++) {
      const x = i * 128 + 8;
      // Column
      c.fillStyle = lin(c, x, 0, x + 34, 0, [[0, "rgba(20,30,58,0.95)"], [0.4, "rgba(60,78,120,0.95)"], [1, "rgba(14,20,40,0.95)"]]);
      c.fillRect(x, top, 34, bottom - top);
      c.fillStyle = "rgba(255,255,255,0.08)";
      c.fillRect(x + 6, top, 2, bottom - top);
      for (let y = top + 30; y < bottom; y += 90) {
        c.fillStyle = "rgba(8,12,28,0.9)";
        c.fillRect(x - 4, y, 42, 8);
        c.fillStyle = "rgba(255,255,255,0.55)";
        c.fillRect(x + 12, y + 3, 10, 2);
      }
      // Conduit between columns
      const cy = top + 60 + rand() * (bottom - top - 160);
      c.strokeStyle = "rgba(10,16,36,0.9)";
      c.lineWidth = 10;
      c.beginPath();
      c.moveTo(x + 34, cy);
      c.bezierCurveTo(x + 64, cy + 30, x + 94, cy - 30, x + 128, cy + 10);
      c.stroke();
      c.strokeStyle = "rgba(255,255,255,0.6)";
      c.lineWidth = 2;
      c.stroke();
      // Holo panel
      if (i % 2 === 0) {
        const px = x + 52, py = top + 40 + rand() * (bottom - top - 220);
        c.fillStyle = "rgba(255,255,255,0.07)";
        rr(c, px, py, 56, 78, 6);
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.35)";
        c.lineWidth = 1.2;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.45)";
        for (let k = 0; k < 5; k++) c.fillRect(px + 8, py + 12 + k * 12, 16 + rand() * 30, 3);
      }
    }
  }), bgScale);

  // Ceiling (scrolls at world speed)
  bake(scene, "ceiling", 256, 74, (c) => {
    c.fillStyle = lin(c, 0, 0, 0, 74, [[0, "#070b18"], [0.7, "#1a2440"], [1, "#2c3a60"]]);
    c.fillRect(0, 0, 256, 74);
    c.fillStyle = "#0b1020";
    c.fillRect(0, 60, 256, 14);
    for (let i = 0; i < 16; i++) {
      c.fillStyle = i % 2 ? "#0b1020" : "#ffc233";
      c.beginPath();
      c.moveTo(i * 16, 74);
      c.lineTo(i * 16 + 8, 62);
      c.lineTo(i * 16 + 24, 62);
      c.lineTo(i * 16 + 16, 74);
      c.closePath();
      c.fill();
    }
    c.fillStyle = "rgba(255,255,255,0.12)";
    c.fillRect(0, 58, 256, 2);
    // Vents & bolts
    for (const x of [30, 158]) {
      c.fillStyle = "#0b1020";
      rr(c, x, 18, 68, 26, 4);
      c.fill();
      c.fillStyle = "#26324f";
      for (let k = 0; k < 5; k++) c.fillRect(x + 6, 22 + k * 4.5, 56, 2);
    }
    // Light fixture
    c.fillStyle = "#0b1020";
    c.fillRect(118, 44, 20, 16);
    c.fillStyle = "#e8fbff";
    rr(c, 112, 52, 32, 6, 3);
    c.fill();
  });
  bake(scene, "ceiling-light", 120, 160, (c) => {
    c.fillStyle = lin(c, 0, 0, 0, 160, [[0, "rgba(200,245,255,0.35)"], [1, "rgba(200,245,255,0)"]]);
    c.beginPath();
    c.moveTo(48, 0);
    c.lineTo(72, 0);
    c.lineTo(120, 160);
    c.lineTo(0, 160);
    c.closePath();
    c.fill();
  }, 1);

  // Floor deck (feet stand on its top edge).
  const floorH = H - floorY;
  bake(scene, "floor", 128, floorH, (c) => {
    c.fillStyle = lin(c, 0, 0, 0, floorH, [[0, "#3a4d78"], [0.06, "#26365a"], [0.18, "#172340"], [1, "#050914"]]);
    c.fillRect(0, 0, 128, floorH);
    c.fillStyle = "#cfe6ff";
    c.fillRect(0, 0, 128, 2);
    c.fillStyle = "rgba(255,255,255,0.18)";
    c.fillRect(0, 2, 128, 2);
    // Plate seams + rivets
    c.fillStyle = "rgba(0,0,0,0.45)";
    c.fillRect(0, 22, 128, 3);
    c.fillRect(126, 4, 2, 18);
    c.fillStyle = "rgba(255,255,255,0.35)";
    [[10, 12], [116, 12]].forEach(([x, y]) => {
      c.beginPath();
      c.arc(x, y, 1.6, 0, TAU);
      c.fill();
    });
    // Glowing strip
    c.fillStyle = "rgba(255,255,255,0.8)";
    rr(c, 44, 11, 40, 4, 2);
    c.fill();
    // Under-deck machinery
    c.fillStyle = "rgba(8,12,26,0.9)";
    c.fillRect(0, 34, 128, floorH - 34);
    c.fillStyle = lin(c, 50, 0, 78, 0, [[0, "#0d1428"], [0.5, "#24335a"], [1, "#0d1428"]]);
    c.fillRect(50, 34, 28, floorH);
    c.fillStyle = "rgba(255,194,51,0.9)";
    for (let y = 44; y < floorH; y += 22) c.fillRect(56, y, 16, 3);
    c.fillStyle = "rgba(255,255,255,0.06)";
    for (let y = 40; y < floorH; y += 6) c.fillRect(0, y, 40, 1);
  });

  // Soft vignette to focus the eye on the playfield.
  bake(scene, "vignette", 200, 360, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h * 0.48, h * 0.25, w / 2, h * 0.48, h * 0.78);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.75)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  }, 1);
}

// Art the menu shows. Baked before gameReady.
export function bakeMenuArt(scene, H, floorY) {
  bakeFx(scene);
  bakeBackground(scene, H, floorY);
  bakeFlag(scene);
}

// Art only a run needs (coins, power-ups, hazards). Baked just after the menu
// is up, and again on demand when a run starts (each bake is skipped once done).
export function bakeRunArt(scene) {
  bakeCoins(scene);
  bakePowerups(scene);
  bakeHazards(scene);
}

export function bakeAll(scene, H, floorY) {
  bakeMenuArt(scene, H, floorY);
  bakeRunArt(scene);
}

export { Phaser };
