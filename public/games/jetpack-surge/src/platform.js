// Platform layer: one codebase, two targets.
//
//  - "web"      : regular browser build (itch.io, Poki, your own site).
//                 Saves to localStorage, uses the Page Visibility API, no ads.
//  - "youtube"  : YouTube Playables build. Everything goes through the ytgame
//                 SDK as the certification rules require: cloud save, YouTube's
//                 mute/pause signals, language, scores and YouTube-served ads.
//
// The YouTube build sets window.JD_BUILD = "youtube" in its index.html and
// loads https://www.youtube.com/game_api/v1 before any game code.

const SAVE_KEY = "jetdash.save.v2";
const yt = () => (typeof window !== "undefined" ? window.ytgame : undefined);

function lsGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function withTimeout(promise, ms, fallback) {
  return Promise.race([promise, new Promise((r) => setTimeout(() => r(fallback), ms))]);
}

const isYouTube = window.JD_BUILD === "youtube";

let saveChain = Promise.resolve();
let pendingSave = null;
let saveTimer = 0;
let loaded = false;

export const platform = {
  name: isYouTube ? "youtube" : "web",
  isYouTube,

  /** Only the web build may show links that leave the game. */
  allowExternalLinks: !isYouTube,

  /** YouTube shows its own mute button, so the in-game master switch is hidden there. */
  hasOwnMute: isYouTube,

  /** True between YouTube's onPause and onResume (set in main.js). Nothing may
   *  start playing or moving while this is set. */
  paused: false,

  /** Ads exist only on YouTube, served by YouTube. */
  get hasAds() {
    return isYouTube && !!yt()?.ads;
  },

  firstFrameReady() {
    try {
      yt()?.game?.firstFrameReady();
    } catch (e) {
      console.warn(e);
    }
  },

  gameReady() {
    try {
      yt()?.game?.gameReady();
    } catch (e) {
      console.warn(e);
    }
  },

  /** Returns the raw save string (or null). YouTube requires awaiting loadData before any save.
   *
   *  On YouTube the game never waits more than 2s for the save (YouTube asks for
   *  the game to be playable within 5s of opening). If the cloud save
   *  hasn't arrived by then (slow network) or the request fails, the game starts
   *  with a fresh profile BUT saving stays blocked, so that empty profile can
   *  never overwrite the player's real cloud save. Loading keeps retrying in
   *  the background; when the real save arrives, `onLate(raw)` is called so the
   *  game can merge it with whatever was earned meanwhile, and saving unlocks.
   *  If every attempt fails, saving stays off for the session (losing one
   *  session's progress is far better than wiping a whole profile). */
  async loadSave(onLate) {
    if (!isYouTube) {
      loaded = true;
      return lsGet(SAVE_KEY);
    }
    const TIMED_OUT = {};
    let late = false;
    let arrived; // set as soon as the real save comes back
    const attempt = async () => {
      const delays = [0, 1500, 4000];
      let lastErr;
      for (const d of delays) {
        if (d) await new Promise((r) => setTimeout(r, d));
        try {
          const g = yt()?.game;
          if (!g?.loadData) return "";
          return (await g.loadData()) ?? "";
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr;
    };
    const real = attempt().then(
      (raw) => {
        arrived = raw || "";
        if (late) {
          loaded = true;
          try {
            onLate?.(raw || null);
          } catch (e) {
            this.logError(e);
          }
        }
        return raw;
      },
      (e) => {
        // Every attempt failed: keep saving disabled for this session.
        this.logError(e);
        return TIMED_OUT;
      }
    );
    const first = await withTimeout(real, 2000, TIMED_OUT);
    if (first === TIMED_OUT) {
      if (arrived !== undefined) {
        // Landed in the same instant as the timeout: use it normally.
        loaded = true;
        return arrived || null;
      }
      late = true;
      return null;
    }
    loaded = true;
    return first || null;
  },

  /** True once the player's real save has been read and saving is allowed. */
  get saveReady() {
    return loaded;
  },

  /** Legacy v1 keys, web only (YouTube players never had them). */
  legacy() {
    if (isYouTube) return null;
    const coins = lsGet("jetDashCoins");
    const best = lsGet("jetDashBestDistance");
    if (coins == null && best == null) return null;
    return { coins: Number(coins) || 0, best: Number(best) || 0, tutorialSeen: lsGet("jetDashTutorialSeen") === "yes" };
  },

  /** Saves are debounced and chained so YouTube never receives overlapping writes. */
  save(str) {
    if (!loaded) return;
    if (!isYouTube) {
      try {
        localStorage.setItem(SAVE_KEY, str);
      } catch {
        /* storage unavailable */
      }
      return;
    }
    pendingSave = str;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const data = pendingSave;
      pendingSave = null;
      saveChain = saveChain
        .then(() => yt()?.game?.saveData(data))
        .catch((e) => this.logError(e));
    }, 250);
  },

  sendScore(value) {
    if (!isYouTube) return;
    try {
      yt()?.engagement?.sendScore({ value: Math.floor(value) })?.catch?.(() => {});
    } catch {
      /* ignore */
    }
  },

  /** YouTube's own mute state. Always true on the web build. */
  audioEnabled() {
    if (!isYouTube) return true;
    try {
      return yt()?.system?.isAudioEnabled?.() ?? true;
    } catch {
      return true;
    }
  },

  /** cb receives the enabled boolean straight from the SDK — callers should
   *  apply it directly rather than re-polling audioEnabled() themselves, so
   *  there's no window where the two disagree. */
  onAudioChange(cb) {
    if (isYouTube) yt()?.system?.onAudioEnabledChange?.(cb);
  },

  /** Flushes any debounced save immediately. onPause is the signal that the
   *  player may be backgrounding or closing the game, so a write still
   *  sitting in the 250ms debounce window must go out now or it's lost. */
  flushSave() {
    if (!isYouTube || !loaded || pendingSave === null) return;
    clearTimeout(saveTimer);
    const data = pendingSave;
    pendingSave = null;
    saveChain = saveChain
      .then(() => yt()?.game?.saveData(data))
      .catch((e) => this.logError(e));
  },

  onPause(cb) {
    if (isYouTube) yt()?.system?.onPause?.(cb);
  },

  onResume(cb) {
    if (isYouTube) yt()?.system?.onResume?.(cb);
  },

  async getLanguage() {
    if (!isYouTube) return "en";
    try {
      return (await withTimeout(yt()?.system?.getLanguage() ?? Promise.resolve("en"), 2000, "en")) || "en";
    } catch {
      return "en";
    }
  },

  /** Interstitial at a natural break. Resolves when the ad is over (or unavailable). */
  async interstitial() {
    if (!this.hasAds) return;
    try {
      await yt().ads.requestInterstitialAd();
    } catch {
      /* no fill */
    }
  },

  /** Rewarded ad. Resolves true only if the player earned the reward. */
  async rewarded(rewardId) {
    if (!this.hasAds) return false;
    try {
      return !!(await yt().ads.requestRewardedAd(rewardId));
    } catch {
      return false;
    }
  },

  logError(e) {
    console.warn(e);
    try {
      if (isYouTube) yt()?.health?.logError?.();
    } catch {
      /* ignore */
    }
  }
};
