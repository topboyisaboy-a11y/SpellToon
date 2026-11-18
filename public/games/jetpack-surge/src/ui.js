// DOM interface layer: menu, HUD, sheets. Real HTML gives crisp type, proper
// buttons, accessibility and cheap animations; a logical W x H stage is scaled
// to sit exactly over the canvas so both layers share one coordinate space.
import { W, ORIENT, PILOTS, POWERUPS, UPGRADE_COSTS } from "./config.js";
import { VEHICLES } from "./vehicles.js";
import { save } from "./save.js";
import { platform } from "./platform.js";

const svg = (body, vb = "0 0 24 24") =>
  `<svg viewBox="${vb}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const I = {
  screen: svg('<rect x="3" y="6" width="13" height="9" rx="1.5"/><rect x="17" y="4" width="4" height="16" rx="1.2"/>'),
  play: svg('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>'),
  pause: svg('<rect x="6.5" y="5" width="3.8" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="13.7" y="5" width="3.8" height="14" rx="1.2" fill="currentColor" stroke="none"/>'),
  retry: svg('<path d="M20 12a8 8 0 1 1-2.35-5.65"/><path d="M20 4v5h-5"/>'),
  home: svg('<path d="M4 11.5 12 4.5l8 7"/><path d="M6.5 10v9.5h11V10"/><path d="M10 19.5v-5h4v5"/>'),
  gear: svg('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.5l2.1 1.2M17.7 15.3l2.1 1.2M4.2 16.5l2.1-1.2M17.7 8.7l2.1-1.2"/><circle cx="12" cy="12" r="7"/>'),
  hangar: svg('<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.6-4 3.4-6 7-6s6.4 2 7 6"/>'),
  bolt: svg('<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z" fill="currentColor" stroke="none"/>'),
  book: svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  check: svg('<path d="M5 12.5 10 17.5 19 7"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  crown: svg('<path d="M4 18 3 7l5 4 4-6 4 6 5-4-1 11z" fill="currentColor" stroke="none"/>'),
  music: svg('<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
  sound: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18.3 6.5a7.5 7.5 0 0 1 0 11"/>'),
  ad: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none"/>'),
  mute: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
  vibrate: svg('<rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4 9v6M20 9v6"/>'),
  sparkle: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
  finger: svg('<path d="M9 11V5.5a1.8 1.8 0 0 1 3.6 0V11"/><path d="M12.6 10.5V9.4a1.8 1.8 0 0 1 3.6 0v1.8a1.8 1.8 0 0 1 3.4.8V16a6 6 0 0 1-6 6h-1.2a6 6 0 0 1-5-2.7L4.6 15a1.8 1.8 0 0 1 2.9-2.1L9 14.5"/>')
};

const COIN = `<svg class="coin" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12.6" cy="12.6" r="10" fill="#a8610a"/><circle cx="12" cy="12" r="10" fill="url(#jdcg)"/><circle cx="12" cy="12" r="10" fill="none" stroke="#8a4d05" stroke-width="1.2"/><circle cx="12" cy="12" r="7.3" fill="none" stroke="#fff4c4" stroke-width="1"/><path d="M12 6.8l1.5 3.3 3.5.3-2.7 2.3.9 3.5L12 14.3l-3.2 1.9.9-3.5L7 10.4l3.5-.3z" fill="#fff1a6" stroke="#b86a06" stroke-width=".7"/></svg>`;
const COIN_DEFS = `<svg width="0" height="0" style="position:absolute"><defs><radialGradient id="jdcg" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff4b8"/><stop offset=".45" stop-color="#ffd23f"/><stop offset=".85" stop-color="#f2a40e"/><stop offset="1" stop-color="#c9780a"/></radialGradient></defs></svg>`;

const PU_ICON = {
  shield: svg('<path d="M12 3 5 6v6c0 4.2 3 7.4 7 9 4-1.6 7-4.8 7-9V6z" fill="currentColor" stroke="none"/>'),
  chrono: svg('<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 2M10 2.5h4"/>'),
  ghost: svg('<path d="M5 21V10a7 7 0 0 1 14 0v11l-2.5-2-2.3 2-2.2-2-2.2 2-2.3-2z"/><circle cx="9.5" cy="10.5" r=".9" fill="currentColor"/><circle cx="14.5" cy="10.5" r=".9" fill="currentColor"/>'),
  magnet: svg('<path d="M6 4v8a6 6 0 0 0 12 0V4"/><path d="M6 4h3.5v8M18 4h-3.5v8"/>'),
  blink: svg('<circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>'),
  wyrm: svg('<path d="M3 16c3-7 9-10 16-8l2 3-3 1c-2 4-7 6-15 4z"/><path d="M9 9 8 4l4 4"/><path d="M19 11h2"/>'),
  stomp: svg('<rect x="6" y="4" width="12" height="7" rx="1.5"/><path d="M9 11v6M15 11v6M6 20h6M12 20h6"/>'),
  flip: svg('<path d="M8 20V5M4 9l4-4 4 4M16 4v15M12 15l4 4 4-4"/>'),
  gull: svg('<path d="M2 13c3-4 6-4 10 0 4-4 7-4 10 0"/><path d="M12 13v5"/>')
};
const DEF = (k) => POWERUPS[k] || VEHICLES[k];

const fmt = (n) => Math.floor(n).toLocaleString("en-US");

let scene = null;
let els = {};
let stage, scale = 1;
let last = {};
let current = null; // open sheet id
let toastTimer, bannerTimer, reviveTimer, countRaf;
// Revive countdown state, lifted out of offerRevive() so the YouTube Playables
// onPause/onResume lifecycle (wired in main.js) can freeze and unfreeze it —
// a plain setInterval would otherwise keep ticking in real time while the
// game is backgrounded and auto-decline the offer with no player input.
let reviveState = null;

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function click() {
  scene?.audio?.click();
}

function fit() {
  const canvas = document.querySelector("#app canvas");
  if (!canvas || !stage) return;
  // Turned sideways: lay the overlay out in the game's own (unrotated) frame.
  const rot = document.body.classList.contains("jd-rot");
  const r = rot
    ? { left: canvas.offsetLeft, top: canvas.offsetTop, width: canvas.offsetWidth, bottom: canvas.offsetTop + canvas.offsetHeight }
    : canvas.getBoundingClientRect();
  const H = window.__JD_H || 720;
  scale = r.width / W;
  stage.style.width = W + "px";
  stage.classList.toggle("wide", ORIENT === "horizontal");
  stage.style.height = H + "px";
  stage.style.transform = `translate(${r.left}px, ${r.top}px) scale(${scale})`;
  // Safe-area insets (notches) converted into stage units.
  const probe = document.getElementById("jdSafe");
  if (probe && !rot) {
    const cs = getComputedStyle(probe);
    const top = Math.max(0, parseFloat(cs.paddingTop) - r.top) / scale;
    const bottom = Math.max(0, parseFloat(cs.paddingBottom) - (window.innerHeight - r.bottom)) / scale;
    stage.style.setProperty("--safe-top", `${top}px`);
    stage.style.setProperty("--safe-bottom", `${bottom}px`);
  }
}

function portrait(id) {
  // Draws the pilot's idle frame from the loaded atlas into a small canvas.
  const game = scene?.game;
  if (!game || !game.textures.exists(id)) return "";
  const frame = game.textures.getFrame(id, "idle-0");
  const c = document.createElement("canvas");
  c.width = frame.cutWidth;
  c.height = frame.cutHeight;
  c.getContext("2d").drawImage(frame.source.image, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, frame.cutWidth, frame.cutHeight);
  return c.toDataURL("image/png");
}
const portraitCache = {};
const portraitOf = (id) => (portraitCache[id] ||= portrait(id));

function build() {
  document.body.insertAdjacentHTML("beforeend", COIN_DEFS + '<div id="jdSafe"></div>');
  stage = el(`<div class="jd-stage" id="jdStage">
    <section class="hud" id="hud" aria-live="polite">
      <div class="hud-top">
        <div class="dist">
          <div class="dist-num"><span id="hudDist">0</span><small>m</small></div>
          <div class="best-bar" id="hudBestBar"><i id="hudBestFill"></i></div>
          <div class="best-cap" id="hudBestCap"></div>
        </div>
        <div class="hud-right">
          <div class="pill coin-pill" id="hudCoinPill">${COIN}<span id="hudCoins">0</span></div>
          ${platform.hasOwnMute ? "" : `<button class="icon-btn snd-btn" data-a="sound" aria-label="Sound on/off">${I.sound}</button>`}
          <button class="icon-btn" data-a="pause" aria-label="Pause">${I.pause}</button>
        </div>
      </div>
      <div class="powers" id="hudPowers"></div>
      <div class="hint" id="hint"><div class="hint-ring">${I.finger}</div><b>Hold to fly</b><span>Release to drop</span></div>
    </section>
    <div class="toast" id="toast"></div>
    <div class="banner" id="banner"><small id="bannerSub"></small><b id="bannerTitle"></b></div>

    <section class="menu" id="menu">
      <div class="menu-top">
        <div class="pill coin-pill big">${COIN}<span id="menuCoins">0</span></div>
        <div class="top-btns">
          ${platform.hasOwnMute ? "" : `<button class="icon-btn snd-btn" data-a="sound" aria-label="Sound on/off">${I.sound}</button>`}
          ${platform.isYouTube ? "" : `<button class="icon-btn rot-btn" data-a="rotate" aria-label="Switch between vertical and horizontal">${I.screen}</button>`}
          <button class="icon-btn" data-a="settings" aria-label="Settings">${I.gear}</button>
        </div>
      </div>
      <div class="logo"><img src="assets/logo.webp" alt="Jetpack Surge — Escape the lab" draggable="false"></div>
      <div class="menu-bottom">
        <div class="best-chip">${I.crown}<span>Best</span><b id="menuBest">0 m</b></div>
        <button class="btn primary xl" data-a="play">${I.play}<span>Play</span></button>
        <div class="tiles">
          <button class="tile" data-a="hangar">${I.hangar}<span>Pilots</span></button>
          <button class="tile" data-a="upgrades">${I.bolt}<span>Upgrades</span><i class="dot" id="upDot"></i></button>
          <button class="tile" data-a="guide">${I.book}<span>Guide</span></button>
        </div>
      </div>
    </section>

    <div class="scrim" id="scrim"></div>
    <div class="busy" id="busy"><i></i></div>
    <section class="sheet" id="sheet" role="dialog" aria-modal="true"></section>
  </div>`);
  document.getElementById("app").appendChild(stage);
  const $ = (id) => stage.querySelector("#" + id);
  els = {
    hud: $("hud"), dist: $("hudDist"), bestBar: $("hudBestBar"), bestFill: $("hudBestFill"), bestCap: $("hudBestCap"),
    coins: $("hudCoins"), coinPill: $("hudCoinPill"), powers: $("hudPowers"), hint: $("hint"),
    toast: $("toast"), banner: $("banner"), bannerTitle: $("bannerTitle"), bannerSub: $("bannerSub"),
    menu: $("menu"), menuCoins: $("menuCoins"), menuBest: $("menuBest"), upDot: $("upDot"),
    scrim: $("scrim"), sheet: $("sheet"), busy: $("busy")
  };

  stage.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b || b.disabled) return;
    e.stopPropagation();
    b.blur();
    action(b.dataset.a, b.dataset);
  });
  // Keep UI touches from also triggering flight on the canvas below.
  stage.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, .sheet, .scrim")) e.stopPropagation();
  });
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", () => requestAnimationFrame(fit));
  window.addEventListener("orientationchange", () => setTimeout(fit, 200));
  if (window.ResizeObserver) new ResizeObserver(fit).observe(document.getElementById("app"));
  fit();
  setTimeout(fit, 100);
}

function onKey(e) {
  if (!scene) return;
  const k = e.key;
  if ((k === "m" || k === "M") && !platform.hasOwnMute) return scene.toggleSound();
  if (k === "Escape" || k === "p" || k === "P") {
    if (current && current !== "pause" && current !== "results" && current !== "revive") return closeSheet();
    if (scene.state === "run") scene.scene.isPaused() ? scene.resume() : scene.pause();
  } else if ((k === "Enter" || k === " ") && !current && scene.state === "menu") {
    e.preventDefault();
    scene.startRun();
  } else if ((k === "Enter" || k === "r" || k === "R") && current === "results") {
    scene.restart();
  } else if (k === "Enter" && current === "revive") {
    stage.querySelector('[data-a="revive"]')?.click();
  }
}

function action(a, data) {
  click();
  switch (a) {
    case "play": return scene.startRun();
    case "pause": return scene.pause();
    case "resume": closeSheet(); return scene.resume();
    case "restart": closeSheet(); return scene.restart();
    case "home": closeSheet(); return scene.goHome();
    case "settings": return openSettings();
    case "hangar": return openHangar();
    case "upgrades": return openUpgrades();
    case "guide": return openGuide();
    case "close": return closeSheet();
    case "toggle": return toggleSetting(data.key);
    case "orient": return setOrient(data.key);
    case "rotate": return setOrient(ORIENT === "horizontal" ? "vertical" : "horizontal");
    case "sound": return scene.toggleSound();
    case "pilot": return pilotAction(data.id);
    case "upgrade": return buyUpgrade(data.key);
    case "reset": return resetProgress(data);
    case "revive": return reviveAccept?.();
    case "skip": return reviveDecline?.();
    case "revive-ad": return reviveAd?.();
    case "double": return doubleAction?.();
    case "shield-start": return shieldStartAction();
    case "results-upgrades": return openUpgrades(true);
    default: return undefined;
  }
}

/* ------------------------------------------------------------- sheets --- */

function openSheet(id, html, opts = {}) {
  current = id;
  els.sheet.className = `sheet sheet--${id}`;
  els.sheet.innerHTML = html;
  els.sheet.classList.add("open");
  els.scrim.classList.add("open");
  els.scrim.classList.toggle("dark", !!opts.dark);
  els.menu.classList.toggle("dimmed", true);
}

function closeSheet() {
  const was = current;
  current = null;
  els.sheet.classList.remove("open");
  els.scrim.classList.remove("open", "dark");
  els.menu.classList.remove("dimmed");
  if (was === "upgrades-results") return showResultsAgain();
  refreshMenu();
}

const header = (title, back = true) =>
  `<header class="sheet-head"><h2>${title}</h2>${back ? `<button class="icon-btn ghost" data-a="close" aria-label="Close">${I.close}</button>` : ""}</header>`;

const bank = () => `<div class="pill coin-pill">${COIN}<span>${fmt(save.data.coins)}</span></div>`;

function openSettings() {
  const s = save.data.settings;
  const row = (key, icon, label, sub) => `
    <button class="set-row" data-a="toggle" data-key="${key}" role="switch" aria-checked="${s[key]}">
      <span class="set-ico">${icon}</span><span class="set-txt"><b>${label}</b><small>${sub}</small></span>
      <span class="switch ${s[key] ? "on" : ""}"><i></i></span>
    </button>`;
  openSheet("settings", `${header("Settings")}
    <div class="sheet-body">
      ${platform.hasOwnMute ? "" : row("sound", I.sound, "Sound", "Master on / off (M key)")}
      ${row("music", I.music, "Music", "Background soundtrack")}
      ${row("sfx", I.sound, "Sound effects", "Jetpack, coins, hazards")}
      ${row("haptics", I.vibrate, "Vibration", "Buzz on hits and pickups")}
      ${row("lowFx", I.sparkle, "Reduced effects", "Less shake and particles")}
${platform.isYouTube ? "" : `      <div class="set-row set-orient" role="radiogroup" aria-label="Screen">
        <span class="set-ico">${I.screen}</span><span class="set-txt"><b>Screen</b><small>Vertical, horizontal, or follow the device</small></span>
      </div>
      <div class="seg" role="radiogroup" aria-label="Screen mode">
        ${["auto", "vertical", "horizontal"].map((o) => `<button type="button" role="radio" data-a="orient" data-key="${o}" aria-checked="${s.orient === o}" class="${s.orient === o ? "on" : ""}">${{ auto: "Auto", vertical: "Vertical", horizontal: "Horizontal" }[o]}</button>`).join("")}
      </div>`}
      <button class="btn ghost danger small" data-a="reset" data-step="1">Reset progress</button>
      <p class="fine">${platform.allowExternalLinks ? `<a class="policy-link" href="privacy.html" target="_blank" rel="noopener">Privacy policy</a> · ` : ""}Jetpack Surge v2.0</p>
    </div>`);
}

function setOrient(o) {
  if (save.data.settings.orient === o) return;
  save.data.settings.orient = o;
  save.commit();
  els.sheet.querySelectorAll('[data-a="orient"]').forEach((b) => {
    const on = b.dataset.key === o;
    b.setAttribute("aria-checked", on);
    b.classList.toggle("on", on);
  });
  window.__jdApplyOrient?.();
}

function toggleSetting(key) {
  save.data.settings[key] = !save.data.settings[key];
  save.commit();
  scene?.applySettings();
  const btn = els.sheet.querySelector(`[data-key="${key}"]`);
  if (!btn) return;
  btn.setAttribute("aria-checked", save.data.settings[key]);
  btn.querySelector(".switch")?.classList.toggle("on", save.data.settings[key]);
  if (btn.classList.contains("chip")) btn.classList.toggle("on", save.data.settings[key]);
  syncSound();
}

function resetProgress(data) {
  const btn = els.sheet.querySelector('[data-a="reset"]');
  if (data.step === "1") {
    btn.dataset.step = "2";
    btn.textContent = "Tap again to erase everything";
    return;
  }
  save.reset();
  scene?.setPilot("scout");
  closeSheet();
}

function openHangar() {
  const cards = PILOTS.map((p) => {
    const owned = save.data.owned.includes(p.id);
    const selected = save.data.pilot === p.id;
    const afford = save.data.coins >= p.price;
    let btn;
    if (p.comingSoon) btn = `<button class="btn small locked soon" disabled>${I.lock}<span>Coming soon</span></button>`;
    else if (selected) btn = `<button class="btn small selected" disabled>${I.check}<span>Flying</span></button>`;
    else if (owned) btn = `<button class="btn small glass" data-a="pilot" data-id="${p.id}"><span>Select</span></button>`;
    else btn = `<button class="btn small ${afford ? "primary" : "locked"}" data-a="pilot" data-id="${p.id}">${afford ? COIN : I.lock}<span>${fmt(p.price)}</span></button>`;
    return `<article class="pilot-card ${selected ? "is-selected" : ""} ${owned && !p.comingSoon ? "" : "is-locked"} ${p.comingSoon ? "is-soon" : ""}" style="--accent:${p.accent}">
      <div class="pilot-art"><img alt="" src="${portraitOf(p.id)}"></div>
      <div class="pilot-info"><b>${p.name}</b><small>${p.role}</small>${btn}</div>
    </article>`;
  }).join("");
  openSheet("hangar", `${header("Pilots")}<div class="sheet-sub">${bank()}<span>More pilots are coming soon</span></div><div class="sheet-body pilots">${cards}</div>`);
}

function pilotAction(id) {
  const p = PILOTS.find((x) => x.id === id);
  if (!p || p.comingSoon) return;
  if (!save.data.owned.includes(id)) {
    if (save.data.coins < p.price) {
      scene?.audio.denied();
      shake(els.sheet.querySelector(`[data-id="${id}"]`));
      return;
    }
    save.data.coins -= p.price;
    save.data.owned.push(id);
  }
  save.data.pilot = id;
  save.commit();
  scene?.setPilot(id);
  openHangar();
}

function openUpgrades(fromResults = false) {
  const rows = [...Object.entries(POWERUPS), ...Object.entries(VEHICLES)].map(([key, def], i) => {
    const lvl = save.data.upgrades[key] || 0;
    const max = lvl >= UPGRADE_COSTS.length;
    const cost = UPGRADE_COSTS[lvl];
    const afford = !max && save.data.coins >= cost;
    const pips = UPGRADE_COSTS.map((_, i) => `<i class="${i < lvl ? "on" : ""}"></i>`).join("");
    const btn = max
      ? `<button class="btn small selected" disabled><span>MAX</span></button>`
      : `<button class="btn small ${afford ? "primary" : "locked"}" data-a="upgrade" data-key="${key}">${COIN}<span>${fmt(cost)}</span></button>`;
    const head = i === 0 ? `<h3 class="up-head">Power-ups</h3>` : key === "blink" ? `<h3 class="up-head">Vehicles</h3>` : "";
    return `${head}<article class="up-row" style="--c:${def.css}">
      <div class="up-ico">${PU_ICON[key]}</div>
      <div class="up-info"><b>${def.upgradeTitle}</b><small>${def.upgradeText(lvl)}</small><div class="pips">${pips}</div>
      ${max ? "" : `<small class="next">Next: ${def.upgradeText(lvl + 1)}</small>`}</div>
      ${btn}
    </article>`;
  }).join("");
  openSheet(fromResults ? "upgrades-results" : "upgrades", `${header("Upgrades")}<div class="sheet-sub">${bank()}<span>Power-ups last longer, vehicles turn up more and hit harder</span></div><div class="sheet-body">${rows}</div>`);
}

function buyUpgrade(key) {
  const lvl = save.data.upgrades[key] || 0;
  const cost = UPGRADE_COSTS[lvl];
  if (cost === undefined) return;
  if (save.data.coins < cost) {
    scene?.audio.denied();
    shake(els.sheet.querySelector(`[data-key="${key}"]`));
    return;
  }
  save.data.coins -= cost;
  save.data.upgrades[key] = lvl + 1;
  save.commit();
  scene?.audio.success();
  openUpgrades(current === "upgrades-results");
}

function openGuide() {
  const card = (art, title, body) => `<article class="guide-card"><div class="guide-art">${art}</div><div><b>${title}</b><p>${body}</p></div></article>`;
  const zap = `<svg viewBox="0 0 80 60"><line x1="18" y1="10" x2="62" y2="50" stroke="#ff3b5c" stroke-width="6" stroke-linecap="round" opacity=".5"/><line x1="18" y1="10" x2="62" y2="50" stroke="#ffe3ea" stroke-width="2.4"/><circle cx="18" cy="10" r="7" fill="#2c3854" stroke="#ffc233" stroke-width="2.5"/><circle cx="62" cy="50" r="7" fill="#2c3854" stroke="#ffc233" stroke-width="2.5"/></svg>`;
  const fly = `<svg viewBox="0 0 80 60"><path d="M10 50 Q30 50 40 30 T70 12" fill="none" stroke="#3ee8ff" stroke-width="3" stroke-dasharray="4 5"/><circle cx="70" cy="12" r="6" fill="#ffc233"/><path d="M40 44v-9M36 39l4-4 4 4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`;
  const warn = `<svg viewBox="0 0 80 60"><path d="M58 12 74 42H42z" fill="#ffc233" stroke="#2b1605" stroke-width="3" stroke-linejoin="round"/><rect x="56.5" y="21" width="3" height="11" rx="1.5" fill="#170611"/><circle cx="58" cy="37" r="2" fill="#170611"/><path d="M6 44h30" stroke="#ff3b5c" stroke-width="3" stroke-dasharray="3 4"/><rect x="8" y="39" width="18" height="10" rx="5" fill="#d7deea"/></svg>`;
  const pw = `<svg viewBox="0 0 80 60"><circle cx="20" cy="30" r="11" fill="#3ee8ff"/><circle cx="40" cy="30" r="11" fill="#a77bff"/><circle cx="60" cy="30" r="11" fill="#ff5a4e"/><circle cx="40" cy="12" r="7" fill="#7dffc8"/><circle cx="16" cy="25" r="3" fill="#fff" opacity=".8"/><circle cx="36" cy="25" r="3" fill="#fff" opacity=".8"/><circle cx="56" cy="25" r="3" fill="#fff" opacity=".8"/></svg>`;
  openSheet("guide", `${header("How to play")}<div class="sheet-body">
    ${card(fly, "Hold to fly", "Hold anywhere (or Space) and the jetpack climbs at a steady speed. Let go and you drop. Touch the ceiling and you hang there until you fall.")}
    ${card(zap, "Dodge the lasers", "Upright lasers come at random heights. Touch one and the run is over: there's only one life.")}
    ${card(warn, "Watch for missiles", "A warning on the right follows your height, then turns red and locks. The missile fires at that height, so move.")}
    ${card(`<svg viewBox="0 0 80 60"><path d="M10 44c6-16 22-24 40-18l6 8-8 2c-6 10-18 14-38 8z" fill="#ff8a3d" stroke="#1a0f0a" stroke-width="2.5"/><path d="M28 26 24 12l12 12" fill="#ffd166" stroke="#1a0f0a" stroke-width="2"/></svg>`, "Ride the vehicles", "Touch a hex token to ride: Blink Pack (hold to aim, let go to teleport), Ember Wyrm (tap to flap, its fire burns lasers), Stomp Rig (hold to charge a leap), Flip Suit (tap to flip to the ceiling) or Coin Gull (tap to flap, double coins). A hit wrecks the vehicle, not you.")}
    ${card(pw, "Grab the power-ups", "One appears every 150 m: Slow-down, Invisible, Shield (takes one hit for you) and Magnet (pulls in coins), taking turns.")}
    <p class="fine">Your score is meters plus coins, and coins go in your bank. Spend them in Upgrades to make every power-up last longer. The game speeds up every 20 m.</p>
    <button class="btn primary" data-a="close">${I.check}<span>Got it</span></button>
  </div>`);
}

/* ------------------------------------------------------ revive/results --- */

let reviveAccept = null;
let reviveAd = null;
let doubleAction = null;

// Rewarded "start with shield" (YouTube build only). Works from the menu and the results screen.
async function shieldStartAction() {
  const btn = document.querySelectorAll('[data-a="shield-start"]');
  btn.forEach((b) => (b.disabled = true));
  ui.busy(true);
  const ok = await scene.shieldStart();
  ui.busy(false);
  if (ok) closeSheet();
  else btn.forEach((b) => (b.disabled = false));
}
let reviveDecline = null;
let lastResults = null;

function showResultsAgain() {
  if (lastResults) ui.showResults({ ...lastResults, bank: save.data.coins, replay: true });
}

function shake(node) {
  if (!node) return;
  node.classList.remove("shake");
  void node.offsetWidth;
  node.classList.add("shake");
}

function syncSound() {
  const on = save.data.settings.sound;
  stage?.querySelectorAll(".snd-btn").forEach((b) => {
    b.innerHTML = on ? I.sound : I.mute;
    b.classList.toggle("off", !on);
    b.setAttribute("aria-pressed", String(!on));
  });
  const row = els.sheet?.querySelector('[data-key="sound"]');
  if (row) {
    row.setAttribute("aria-checked", on);
    row.querySelector(".switch")?.classList.toggle("on", on);
    if (row.classList.contains("chip")) row.classList.toggle("on", on);
  }
}

function refreshMenu() {
  if (!els.menu) return;
  els.menuCoins.textContent = fmt(save.data.coins);
  els.menuBest.textContent = fmt(save.data.best);
  const canBuy = Object.values(save.data.upgrades).some((l) => UPGRADE_COSTS[l] !== undefined && save.data.coins >= UPGRADE_COSTS[l]);
  els.upDot.classList.toggle("on", canBuy);
}

function countUp(node, to, dur, suffix = "") {
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    node.textContent = fmt(to * e) + suffix;
    if (p < 1) countRaf = requestAnimationFrame(step);
  };
  countRaf = requestAnimationFrame(step);
}

function confetti(host) {
  const colors = ["#ffc233", "#3ee8ff", "#ff5a7a", "#a77bff", "#4dff9a", "#fff"];
  const box = document.createElement("div");
  box.className = "confetti";
  for (let i = 0; i < 44; i++) {
    const p = document.createElement("i");
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random() * 0.5}s`;
    p.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
    p.style.setProperty("--dx", `${(Math.random() - 0.5) * 120}px`);
    p.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
    box.appendChild(p);
  }
  host.appendChild(box);
  setTimeout(() => box.remove(), 3200);
}

/* ------------------------------------------------------------ public --- */

export const ui = {
  mount() {
    if (!stage) build();
  },

  /** Fades out the HTML loading screen. Called only once the menu is open,
   *  so there is never a moment with neither the loader nor the menu. */
  hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader || loader.classList.contains("done")) return;
    loader.classList.add("done");
    setTimeout(() => loader.remove(), 700);
  },

  /** Last resort if the game could not start: say so and offer a retry
   *  instead of leaving an empty screen. */
  loaderError(retry) {
    const tip = document.getElementById("ldTip");
    const loader = document.getElementById("loader");
    if (!tip || !loader) return;
    tip.textContent = "Couldn't start. Tap to try again.";
    loader.style.pointerEvents = "auto";
    loader.addEventListener("click", retry, { once: true });
  },

  bind(s) {
    scene = s;
    this.mount();
    syncSound();
    fit();
  },

  fit,
  syncSound,

  /** Re-reads the save into the menu (used when a late cloud save arrives). */
  refresh() {
    if (!els.menu) return;
    // The first-time guide may have opened while the save was still loading.
    if (current === "guide" && save.data.tutorialSeen) closeSheet();
    else refreshMenu();
  },

  showMenu() {
    refreshMenu();
    els.menu.classList.add("open");
    els.hud.classList.remove("open");
    // First launch: the guide opens shortly after, unless the player has
    // already tapped Play or opened something else.
    if (!save.data.tutorialSeen && save.data.runs === 0) setTimeout(() => current || scene?.state !== "menu" || openGuide(), 700);
  },

  hideMenu() {
    els.menu.classList.remove("open");
    if (current) closeSheet();
  },

  showHud(on) {
    els.hud.classList.toggle("open", !!on);
  },

  resetRun() {
    cancelAnimationFrame(countRaf);
    clearInterval(reviveTimer);
    reviveTimer = 0;
    reviveState = null;
    if (current) closeSheet();
    last = {};
    els.dist.textContent = "0";
    els.coins.textContent = "0";
    els.powers.innerHTML = "";
    els.bestFill.style.transform = "scaleX(0)";
    els.hud.classList.remove("beaten");
    els.toast.classList.remove("show");
    els.banner.classList.remove("show");
  },

  setHud({ meters, coins, best, beaten }) {
    if (meters !== last.m) {
      last.m = meters;
      els.dist.textContent = fmt(meters);
    }
    if (coins !== last.c) {
      last.c = coins;
      els.coins.textContent = fmt(coins);
    }
    if (best !== last.best || beaten !== last.beaten) {
      last.best = best;
      last.beaten = beaten;
      els.bestBar.style.display = best > 0 ? "" : "none";
      els.bestCap.textContent = best > 0 ? (beaten ? "New best!" : `Best ${fmt(best)} m`) : "";
      els.hud.classList.toggle("beaten", !!beaten);
    }
    if (best > 0) {
      const f = Math.min(1, meters / best);
      if (Math.abs(f - (last.f || 0)) > 0.004) {
        last.f = f;
        els.bestFill.style.transform = `scaleX(${f})`;
      }
    }
  },

  setPowers(list) {
    const key = list.map((p) => p.type).join(",");
    if (key !== last.powers) {
      last.powers = key;
      els.powers.innerHTML = list
        .map((p) => `<div class="power" data-t="${p.type}" style="--c:${DEF(p.type).css}"><svg class="ring" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17"/><circle class="fg" cx="20" cy="20" r="17"/></svg>${PU_ICON[p.type]}</div>`)
        .join("");
    }
    for (const p of list) {
      const node = els.powers.querySelector(`[data-t="${p.type}"]`);
      if (!node) continue;
      node.querySelector(".fg").style.strokeDashoffset = String(106.8 * (1 - p.frac));
      node.classList.toggle("low", p.type !== "shield" && p.frac < 0.25);
    }
  },

  toast(text, color = "#3ee8ff") {
    els.toast.textContent = text;
    els.toast.style.setProperty("--c", color);
    els.toast.classList.remove("show");
    void els.toast.offsetWidth;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 1300);
  },

  banner(title, sub, gold = false) {
    els.bannerTitle.textContent = title;
    els.bannerSub.textContent = sub;
    els.banner.classList.toggle("gold", !!gold);
    els.banner.classList.remove("show");
    void els.banner.offsetWidth;
    els.banner.classList.add("show");
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => els.banner.classList.remove("show"), 2300);
  },

  hint(on) {
    els.hint.classList.toggle("show", !!on);
  },

  coinTarget() {
    const r = els.coinPill?.querySelector(".coin")?.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    if (!r || !r.width) return null;
    return { x: (r.left + r.width / 2 - s.left) / scale, y: (r.top + r.height / 2 - s.top) / scale };
  },

  pulseCoin() {
    const c = els.coinPill;
    c.classList.remove("pulse");
    void c.offsetWidth;
    c.classList.add("pulse");
  },

  showPause() {
    const s = save.data.settings;
    openSheet("pause", `${header("Paused", false)}
      <div class="sheet-body">
        <div class="pause-stats"><div><small>Distance</small><b>${fmt(scene.meters)} m</b></div><div><small>Coins</small><b>${COIN}${fmt(scene.runCoins)}</b></div></div>
        <button class="btn primary xl" data-a="resume">${I.play}<span>Resume</span></button>
        <div class="row2">
          <button class="btn glass" data-a="restart">${I.retry}<span>Restart</span></button>
          <button class="btn glass" data-a="home">${I.home}<span>Home</span></button>
        </div>
        <div class="quick">
          ${platform.hasOwnMute ? "" : `<button class="chip ${s.sound ? "on" : ""}" data-a="toggle" data-key="sound">${I.sound}Sound</button>`}
          <button class="chip ${s.music ? "on" : ""}" data-a="toggle" data-key="music">${I.music}Music</button>
          <button class="chip ${s.sfx ? "on" : ""}" data-a="toggle" data-key="sfx">${I.sparkle}Effects</button>
        </div>
      </div>`, { dark: true });
  },

  hidePause() {
    if (current === "pause") closeSheet();
  },

  offerRevive({ cost, balance, canPay, canAd, onAccept, onAd, onDecline }) {
    const stopTimer = () => {
      clearInterval(reviveTimer);
      reviveTimer = 0;
      reviveState = null;
    };
    const done = (fn) => {
      stopTimer();
      reviveAccept = reviveDecline = reviveAd = null;
      closeSheet();
      fn();
    };
    reviveAccept = canPay ? () => done(onAccept) : null;
    reviveDecline = () => done(onDecline);
    reviveAd = canAd
      ? async () => {
          stopTimer();
          ui.busy(true);
          const ok = await onAd();
          ui.busy(false);
          reviveAccept = reviveDecline = reviveAd = null;
          closeSheet();
          if (!ok) onDecline();
        }
      : null;
    const payBtn = canPay
      ? `<button class="btn ${canAd ? "glass" : "primary xl"}" data-a="revive">${I.retry}<span>Continue</span><em>${COIN}${fmt(cost)}</em></button>`
      : "";
    const adBtn = canAd ? `<button class="btn primary xl" data-a="revive-ad">${I.ad}<span>Continue free</span><em>Watch ad</em></button>` : "";
    openSheet("revive", `<div class="revive">
      <div class="revive-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/><circle class="fg" id="revRing" cx="50" cy="50" r="44"/></svg><b id="revNum">5</b></div>
      <h2>Second chance?</h2>
      <p>Jump back in right where you fell.</p>
      ${adBtn}${payBtn}
      <button class="btn ghost small" data-a="skip">No thanks</button>
      ${canPay ? `<small class="fine">Balance ${fmt(balance)}</small>` : ""}
    </div>`, { dark: true });
    const ring = els.sheet.querySelector("#revRing");
    const num = els.sheet.querySelector("#revNum");
    requestAnimationFrame(() => ring.classList.add("run"));
    reviveState = { left: 5, num, decline: () => reviveDecline?.() };
    ui.resumeReviveTimer();
  },

  /** Freezes the revive countdown without losing the seconds remaining — call
   *  from the YouTube Playables onPause handler. */
  pauseReviveTimer() {
    clearInterval(reviveTimer);
    reviveTimer = 0;
  },

  /** Restarts the revive countdown from wherever it left off — call from the
   *  onResume handler. No-op if no revive offer is currently showing. */
  resumeReviveTimer() {
    if (!reviveState || reviveTimer) return;
    reviveTimer = setInterval(() => {
      const st = reviveState;
      if (!st) return;
      st.left -= 1;
      st.num.textContent = String(Math.max(0, st.left));
      if (st.left <= 0) st.decline();
    }, 1000);
  },

  /** Blocks input while a YouTube ad is being shown. */
  busy(on) {
    els.busy?.classList.toggle("on", !!on);
  },

  showResults({ meters, coins, score, best, isBest, replay }) {
    lastResults = { meters, coins, score, best, isBest };
    openSheet("results", `<div class="results ${isBest ? "is-best" : ""}">
      <div class="res-badge">${isBest ? `${I.crown}<span>New best score</span>` : "<span>Run over</span>"}</div>
      <div class="res-dist"><b id="resScore">${replay ? fmt(score) : "0"}</b><small>final score</small></div>
      <div class="res-grid res-grid3">
        <div><small>Meters</small><b id="resDist">${replay ? fmt(meters) : "0"}</b></div>
        <div><small>Coins</small><b>${COIN}<span id="resCoins">${replay ? fmt(coins) : "0"}</span></b></div>
        <div><small>Best</small><b>${fmt(best)}</b></div>
      </div>
      <div class="res-bank">${COIN}<span>Bank ${fmt(save.data.coins)}</span></div>
      <button class="btn primary xl" data-a="restart">${I.retry}<span>Play again</span></button>
      <div class="row2">
        <button class="btn glass" data-a="home">${I.home}<span>Home</span></button>
        <button class="btn glass" data-a="results-upgrades">${I.bolt}<span>Upgrade</span></button>
      </div>
    </div>`, { dark: true });
    if (!replay) {
      countUp(els.sheet.querySelector("#resDist"), meters, Math.min(1400, 500 + meters * 0.6));
      countUp(els.sheet.querySelector("#resScore"), score, Math.min(1600, 600 + score * 0.6));
      countUp(els.sheet.querySelector("#resCoins"), coins, 900);
      if (isBest) setTimeout(() => confetti(els.sheet), 250);
    }
  }
};
