/* =========================================================
   Cosmic Daily — app.js
   -------------------------------------------------
   Contents:
     1) CONFIG           -> Vedika Astrology API (sandbox)
     2) DAILY HOROSCOPE  -> GET  /sandbox/daily/horoscope/{sign}
     3) BIRTH CHART      -> POST /sandbox/astrology/birth-chart
     4) FREEDOM WALL     -> release animation, nothing saved (bonus feature)
   Each section is commented to keep the logic clear.
   ========================================================= */

"use strict";

/* =========================================================
   1) CONFIG
   =========================================================
   We use the Vedika Astrology API — Sandbox mode.
   The sandbox is free and does NOT require an API key
   (it's mock/sample data, not real astrological computation),
   but it MATCHES the same shape/format as the real (live) API,
   so it still fully demonstrates GET and POST requests.

   Optional: if you have a Vedika account (https://vedika.io/signup),
   you can put your key in VEDIKA_KEY below — it will automatically
   be included as an Authorization header. Not required, since the
   sandbox works even without a key.                                */
const CONFIG = {
  VEDIKA_BASE: "https://api.vedika.io/sandbox",
  VEDIKA_KEY: "", // optional — Bearer token if you have a real account

  // JSONBin.io — powers the shared "View Sky" feature on the Freedom Wall.
  // Free, requires signup for a Master Key. See README.md for setup steps.
  JSONBIN_BASE: "https://api.jsonbin.io/v3",
  JSONBIN_MASTER_KEY: "$2a$10$2oVOeyKvv9c/QT98lLDtV.DhbS0WhklivTaBN7XJfYHF.7OXTUCB.",
  JSONBIN_COLLECTION_ID: "6a56fc7bda38895dfe5f0937",
};

/* Zodiac data — symbol, name, and date range for each sign.
   Used to build the grid of buttons.                               */
const ZODIAC_SIGNS = [
  { key: "aries",       symbol: "♈", name: "Aries",       dates: "Mar 21 – Apr 19" },
  { key: "taurus",      symbol: "♉", name: "Taurus",      dates: "Apr 20 – May 20" },
  { key: "gemini",      symbol: "♊", name: "Gemini",      dates: "May 21 – Jun 20" },
  { key: "cancer",      symbol: "♋", name: "Cancer",      dates: "Jun 21 – Jul 22" },
  { key: "leo",         symbol: "♌", name: "Leo",         dates: "Jul 23 – Aug 22" },
  { key: "virgo",       symbol: "♍", name: "Virgo",       dates: "Aug 23 – Sep 22" },
  { key: "libra",       symbol: "♎", name: "Libra",       dates: "Sep 23 – Oct 22" },
  { key: "scorpio",     symbol: "♏", name: "Scorpio",     dates: "Oct 23 – Nov 21" },
  { key: "sagittarius", symbol: "♐", name: "Sagittarius", dates: "Nov 22 – Dec 21" },
  { key: "capricorn",   symbol: "♑", name: "Capricorn",   dates: "Dec 22 – Jan 19" },
  { key: "aquarius",    symbol: "♒", name: "Aquarius",    dates: "Jan 20 – Feb 18" },
  { key: "pisces",      symbol: "♓", name: "Pisces",      dates: "Feb 19 – Mar 20" },
];

/* A handful of city presets (PH-focused) with known lat/long,
   so the user doesn't have to look up coordinates themselves.       */
const CITY_PRESETS = [
  { key: "manila",   name: "Manila",   lat: 14.5995, lng: 120.9842, tz: "+08:00" },
  { key: "cebu",     name: "Cebu",     lat: 10.3157, lng: 123.8854, tz: "+08:00" },
  { key: "davao",    name: "Davao",    lat: 7.1907,  lng: 125.4553, tz: "+08:00" },
  { key: "baguio",   name: "Baguio",   lat: 16.4023, lng: 120.5960, tz: "+08:00" },
  { key: "iloilo",   name: "Iloilo",   lat: 10.7202, lng: 122.5621, tz: "+08:00" },
];

/* Small helper: avoids HTML injection (XSS) from user/API text.
   Makes it safe to insert text into the page's HTML.                */
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* Show today's date in the header. */
function showTodayDate() {
  const el = document.getElementById("todayDate");
  const today = new Date();
  el.textContent = today.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

/* Common headers for Vedika requests.
   Authorization is only included if a VEDIKA_KEY is set.            */
function vedikaHeaders(extra = {}) {
  const headers = { ...extra };
  if (CONFIG.VEDIKA_KEY) headers["Authorization"] = `Bearer ${CONFIG.VEDIKA_KEY}`;
  return headers;
}

/* =========================================================
   2) DAILY HOROSCOPE  (GET /sandbox/daily/horoscope/{sign})
   ========================================================= */

/* Build the grid of 12 zodiac buttons. */
function buildZodiacGrid() {
  const grid = document.getElementById("zodiacGrid");
  grid.innerHTML = ZODIAC_SIGNS.map((z) => `
    <button class="zodiac-btn" type="button" role="listitem"
            data-sign="${z.key}" aria-label="${z.name}">
      <span class="zodiac-symbol">${z.symbol}</span>
      <span class="zodiac-name">${z.name}</span>
      <span class="zodiac-dates">${z.dates}</span>
    </button>
  `).join("");

  // One listener for the whole grid (event delegation).
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".zodiac-btn");
    if (!btn) return;

    grid.querySelectorAll(".zodiac-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    fetchHoroscope(btn.dataset.sign);
  });
}

/* Fetch the daily horoscope for a sign from the Vedika sandbox (GET). */
async function fetchHoroscope(signKey) {
  const box = document.getElementById("horoscopeResult");
  const sign = ZODIAC_SIGNS.find((z) => z.key === signKey);

  box.innerHTML = `<div class="loading"><div class="spinner"></div>Fetching your reading...</div>`;

  try {
    const res = await fetch(
      `${CONFIG.VEDIKA_BASE}/daily/horoscope/${signKey}`,
      { headers: vedikaHeaders() }
    );

    if (!res.ok) throw new Error(`API returned status ${res.status}`);

    const json = await res.json();
    if (json.success === false) throw new Error(json.error || "Unknown API error");

    renderHoroscope(sign, json.data);
  } catch (err) {
    console.error("Horoscope fetch error:", err);
    box.innerHTML = `
      <div class="error-box">
        😕 Couldn't load the horoscope right now. Please check your internet connection and try again.
      </div>`;
  }
}

/* Render the horoscope reading as a nice card. */
function renderHoroscope(sign, data) {
  const box = document.getElementById("horoscopeResult");

  const rating = Number(data.rating) || 0;
  const stars = "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));

  box.innerHTML = `
    <div class="reading">
      <div class="reading-head">
        <span class="reading-symbol">${data.symbol || sign.symbol}</span>
        <div>
          <h3 class="reading-title">${escapeHtml(sign.name)}</h3>
          <div class="reading-stars" title="Rating: ${rating}/5">${stars}</div>
        </div>
      </div>

      <div class="reading-row">
        <span class="reading-label">Prediction</span>
        <p>${escapeHtml(data.prediction)}</p>
      </div>

      <div class="lucky-chips">
        <span class="chip">🔢 Lucky Number: <strong>${escapeHtml(data.luckyNumber)}</strong></span>
        <span class="chip">🎨 Lucky Color: <strong>${escapeHtml(data.luckyColor)}</strong></span>
        <span class="chip">⏰ Lucky Time: <strong>${escapeHtml(data.luckyTime)}</strong></span>
        <span class="chip">🌙 Moon Phase: <strong>${escapeHtml(data.moonPhase)}</strong></span>
        <span class="chip">💞 Compatible: <strong>${escapeHtml(data.compatibleSign)}</strong></span>
      </div>
    </div>`;
}

/* =========================================================
   3) BIRTH CHART  (POST /sandbox/astrology/birth-chart)
   ========================================================= */

/* Build the city preset dropdown in the chart form. */
function buildCityOptions() {
  const select = document.getElementById("chartCity");
  select.innerHTML = CITY_PRESETS.map((c) =>
    `<option value="${c.key}">${escapeHtml(c.name)}</option>`
  ).join("");
}

/* Set up the birth chart form. */
function setupChartForm() {
  buildCityOptions();

  const form = document.getElementById("chartForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const date = document.getElementById("chartDate").value;
    const time = document.getElementById("chartTime").value || "12:00";
    const cityKey = document.getElementById("chartCity").value;
    const city = CITY_PRESETS.find((c) => c.key === cityKey) || CITY_PRESETS[0];

    if (!date) {
      alert("Please enter your birth date.");
      return;
    }

    fetchBirthChart({ date, time, city });
  });
}

/* Fetch the birth chart from the Vedika sandbox (POST). */
async function fetchBirthChart({ date, time, city }) {
  const box = document.getElementById("chartResult");
  box.innerHTML = `<div class="loading"><div class="spinner"></div>Generating your birth chart...</div>`;

  // Build an ISO datetime string from the separate date and time inputs.
  const datetime = `${date}T${time}:00`;

  try {
    const res = await fetch(`${CONFIG.VEDIKA_BASE}/astrology/birth-chart`, {
      method: "POST",
      headers: vedikaHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        datetime,
        latitude: city.lat,
        longitude: city.lng,
        timezone: city.tz,
      }),
    });

    if (!res.ok) throw new Error(`API returned status ${res.status}`);

    const json = await res.json();
    if (json.success === false) throw new Error(json.error || "Unknown API error");

    renderBirthChart(json.data, city);
  } catch (err) {
    console.error("Birth chart fetch error:", err);
    box.innerHTML = `
      <div class="error-box">
        😕 Couldn't generate the birth chart right now. Please check the date/time you entered and try again.
      </div>`;
  }
}

/* Render the birth chart as a card + SVG diagram. */
function renderBirthChart(data, city) {
  const box = document.getElementById("chartResult");
  const asc = data.ascendant || {};
  const interp = asc.interpretation || {};
  const nak = data.nakshatra || asc.nakshatra || {};

  // Use the correct zodiac symbol (♓ etc.) from our own list,
  // since interp.symbol is just descriptive text ("The Fish"), not a symbol.
  const matchedSign = ZODIAC_SIGNS.find(
    (z) => z.name.toLowerCase() === String(asc.sign || "").toLowerCase()
  );
  const ascSymbol = matchedSign?.symbol || "🔮";

  // Safe SVG insertion: reject it if it contains a suspicious <script> tag.
  const svg = data.chart?.northIndian || "";
  const svgIsSafe = svg && !/<script/i.test(svg);

  const chipsFor = (label, arr) =>
    Array.isArray(arr) && arr.length
      ? `<span class="chip">${label}: <strong>${arr.map(escapeHtml).join(", ")}</strong></span>`
      : "";

  box.innerHTML = `
    <div class="reading">
      <div class="reading-head">
        <span class="reading-symbol">${ascSymbol}</span>
        <div>
          <h3 class="reading-title">${escapeHtml(asc.sign || "—")} Ascendant</h3>
          <div class="reading-stars" style="font-size:0.85rem; letter-spacing:0;">
            📍 ${escapeHtml(city.name)} &middot; Ruled by ${escapeHtml(asc.signLord || "—")}
          </div>
        </div>
      </div>

      <div class="reading-row">
        <span class="reading-label">Nakshatra</span>
        <p>${escapeHtml(nak.name || "—")} (Pada ${escapeHtml(nak.pada ?? "—")}) &middot; Deity: ${escapeHtml(nak.deity || "—")} &middot; Lord: ${escapeHtml(nak.lord || "—")}</p>
      </div>

      <div class="lucky-chips">
        <span class="chip">🌊 Element: <strong>${escapeHtml(interp.element || "—")}</strong></span>
        <span class="chip">🧭 Quality: <strong>${escapeHtml(interp.quality || "—")}</strong></span>
        ${chipsFor("✨ Traits", interp.traits)}
        ${chipsFor("💪 Strengths", interp.strengths)}
        ${chipsFor("💼 Career", interp.career)}
        ${chipsFor("💞 Compatible With", interp.compatibility)}
      </div>

      ${svgIsSafe ? `<div class="chart-svg-wrap">${svg}</div>` : ""}
    </div>`;
}

/* =========================================================
   4) FREEDOM WALL  (release into the sky — shared, anonymous)
   -------------------------------------------------
   Fully anonymous by design: there is no name field anywhere,
   on either a thought or a reply. Pressing Enter (or Release)
   animates the thought rising out of view locally AND saves it
   (text + mood only, never a name) to a shared JSONBin.io
   collection, so anyone who opens "View Sky" can see — and
   anonymously reply to — what others have released.

     RELEASE (write)     -> POST /v3/b            (tagged to a collection)
     REPLY   (write)     -> POST /v3/b            (same collection, has parentId)
     VIEW SKY (read)     -> GET  /v3/c/{id}/bins   then GET each bin's content
     UNIVERSE REPLY      -> same read, filtered to thoughts released from this browser

   JSONBin's free tier allows only one collection, so thoughts and
   replies share CONFIG.JSONBIN_COLLECTION_ID — a bin is a "reply"
   if its content has a parentId field, a "thought" otherwise.

   "Universe Reply" needs to know which thoughts are "yours" after
   a reload, so (with the user's OK) we keep a small local list of
   your own released thought IDs/text in localStorage — this is the
   ONLY thing saved locally, and it never leaves your browser.

   Requires JSONBIN_MASTER_KEY + JSONBIN_COLLECTION_ID in CONFIG
   (see README.md for setup). Note: since this is a static,
   client-only site, the key necessarily ships inside app.js and
   is visible to anyone who views the page source — fine for a
   class demo, but don't reuse this key for anything sensitive.
   ========================================================= */

/* Glow color per mood, used to tint thought bubbles. */
const MOOD_COLORS = {
  "😊": "#e6c860", // happy   -> gold
  "😢": "#7ea8ff", // sad     -> blue
  "😌": "#7fe0c4", // calm    -> teal
  "🔥": "#ff8a5b", // motivated -> orange
  "😴": "#a99bd8", // tired   -> muted lavender
  "💜": "#b48bff", // grateful -> violet
  "":   "#e6c860", // no mood chosen -> default gold
};

/* A modest blocklist (English + Tagalog) so replies can be checked
   for obviously unkind language before they're posted. This runs
   entirely in the browser, so it's a courtesy nudge, not a hard
   guarantee — someone determined to bypass it still could. */
const BAD_WORDS = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "cunt", "whore", "slut", "nigger", "faggot",
  "putangina", "putang ina", "gago", "gagi", "tangina", "tanga ka", "bobo", "ulol", "tarantado",
  "hayop ka", "leche", "punyeta", "kupal", "peste", "hinayupak", "pakshet", "pakyu",
];

function containsBadWords(text) {
  const lower = text.toLowerCase();
  return BAD_WORDS.some((w) => new RegExp(`\\b${w.replace(/\s+/g, "\\s+")}\\b`, "i").test(lower));
}

let releasedThisSession = 0; // in-memory tally only

/* ---------- Local "my thoughts" tracking (opt-in, browser-only) ---------- */
const MY_THOUGHTS_KEY = "cosmicDaily_myThoughts";

function getMyThoughtIds() {
  try {
    return JSON.parse(localStorage.getItem(MY_THOUGHTS_KEY)) || [];
  } catch {
    return [];
  }
}

function rememberMyThought(id, text, mood) {
  try {
    const mine = getMyThoughtIds();
    mine.unshift({ id, text, mood, releasedAt: new Date().toISOString() });
    localStorage.setItem(MY_THOUGHTS_KEY, JSON.stringify(mine.slice(0, 50)));
  } catch (err) {
    console.error("Could not remember this thought locally:", err);
  }
}

function isWallConfigured() {
  return (
    CONFIG.JSONBIN_MASTER_KEY &&
    CONFIG.JSONBIN_MASTER_KEY !== "YOUR_JSONBIN_MASTER_KEY_HERE" &&
    CONFIG.JSONBIN_COLLECTION_ID &&
    CONFIG.JSONBIN_COLLECTION_ID !== "YOUR_JSONBIN_COLLECTION_ID_HERE"
  );
}

function setupWallForm() {
  const form = document.getElementById("wallForm");
  const message = document.getElementById("wallMessage");
  const counter = document.getElementById("charCount");
  const viewSkyBtn = document.getElementById("viewSkyBtn");
  const universeReplyBtn = document.getElementById("universeReplyBtn");

  message.addEventListener("input", () => {
    counter.textContent = `${message.value.length} / 200`;
  });

  // Enter releases the thought; Shift+Enter still allows a new line.
  message.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = message.value.trim();
    if (!text) return;

    const mood = document.getElementById("wallMood").value;
    releaseThought(text, mood);

    form.reset();
    counter.textContent = "0 / 200";
    message.focus();
  });

  viewSkyBtn.addEventListener("click", () => openSkyModal({ onlyMine: false, title: "🔭 View Sky" }));
  universeReplyBtn.addEventListener("click", () => openSkyModal({ onlyMine: true, title: "💬 Universe Reply" }));

  // Closing the sky modal: the ✕ button, clicking the sky itself
  // (outside the content column), or pressing Escape.
  const modal = document.getElementById("skyModal");
  document.getElementById("skyModalClose").addEventListener("click", closeSkyModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeSkyModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeSkyModal();
  });
}

function closeSkyModal() {
  document.getElementById("skyModal").hidden = true;
  document.body.style.overflow = "";
}

/* Animate a thought rising out of view locally, and (if configured)
   save it — anonymously, text + mood only — to the shared sky. */
function releaseThought(text, mood) {
  const stage = document.getElementById("skyStage");
  const hint = document.getElementById("skyHint");
  const color = MOOD_COLORS[mood] || MOOD_COLORS[""];

  const orb = document.createElement("div");
  orb.className = "thought-orb";
  orb.style.setProperty("--mood-color", color);
  orb.textContent = mood ? `${mood} ${text}` : text;

  // Clean up the element once its rise-and-fade animation finishes.
  orb.addEventListener("animationend", () => orb.remove());

  stage.appendChild(orb);

  // Briefly swap the hint for a gentle confirmation, then restore it.
  hint.textContent = "Released into the sky. ☁️✨";
  setTimeout(() => {
    hint.textContent = "Press Enter (or click Release) to send your thought into the sky.";
  }, 2200);

  releasedThisSession += 1;
  const countEl = document.getElementById("releaseCount");
  countEl.textContent = releasedThisSession === 1
    ? "1 thought released"
    : `${releasedThisSession} thoughts released`;

  if (isWallConfigured()) {
    saveToSharedSky(text, mood)
      .then((id) => rememberMyThought(id, text, mood))
      .catch((err) => {
        // The local animation already played, so this failing shouldn't
        // interrupt the user — just log it for debugging.
        console.error("Could not save thought to the shared sky:", err);
      });
  }
}

/* POST the released thought (anonymous: text + mood only) to JSONBin,
   tagged into our shared collection. Returns the new bin's ID. */
async function saveToSharedSky(text, mood) {
  const res = await fetch(`${CONFIG.JSONBIN_BASE}/b`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY,
      "X-Collection-Id": CONFIG.JSONBIN_COLLECTION_ID,
    },
    body: JSON.stringify({ text, mood, releasedAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Save failed: status ${res.status}`);
  const json = await res.json();
  return json.metadata.id;
}

/* POST an anonymous reply to a thought, tagged with parentId so it can
   be matched back to the thought it belongs to. */
async function postReply(parentId, text) {
  const res = await fetch(`${CONFIG.JSONBIN_BASE}/b`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY,
      "X-Collection-Id": CONFIG.JSONBIN_COLLECTION_ID,
    },
    body: JSON.stringify({ parentId, text, createdAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Reply failed: status ${res.status}`);
}

/* Fetch the latest bins in the shared collection and split them into
   thoughts (no parentId) and replies grouped by the thought they
   belong to (has parentId). Shared by View Sky and Universe Reply. */
async function fetchSkyBatch(limit = 50) {
  const listRes = await fetch(
    `${CONFIG.JSONBIN_BASE}/c/${CONFIG.JSONBIN_COLLECTION_ID}/bins`,
    { headers: { "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY } }
  );
  if (!listRes.ok) throw new Error(`List failed: status ${listRes.status}`);
  const meta = await listRes.json();

  const latest = [...meta]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  const bins = (await Promise.all(
    latest.map(async (m) => {
      try {
        const res = await fetch(
          `${CONFIG.JSONBIN_BASE}/b/${m.record}/latest?meta=false`,
          { headers: { "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return { ...data, id: m.record };
      } catch {
        return null; // skip a single bad bin rather than fail the whole batch
      }
    })
  )).filter(Boolean);

  const thoughts = bins.filter((b) => !b.parentId);
  const commentsByParent = new Map();
  bins
    .filter((b) => b.parentId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((c) => {
      if (!commentsByParent.has(c.parentId)) commentsByParent.set(c.parentId, []);
      commentsByParent.get(c.parentId).push(c);
    });

  return { thoughts, commentsByParent };
}

/* Open the full-screen sky window and load either "View Sky" (everyone's
   thoughts) or "Universe Reply" (only thoughts released from this browser). */
async function openSkyModal({ onlyMine, title }) {
  const modal = document.getElementById("skyModal");
  const body = document.getElementById("skyModalBody");
  document.getElementById("skyModalTitle").textContent = title;
  modal.hidden = false;
  document.body.style.overflow = "hidden"; // lock background scroll while open

  if (!isWallConfigured()) {
    body.innerHTML = `
      <div class="error-box">
        🔑 The shared sky isn't set up yet. See README.md to configure
        <code>JSONBIN_MASTER_KEY</code> and <code>JSONBIN_COLLECTION_ID</code>.
      </div>`;
    return;
  }

  body.innerHTML = `<div class="loading"><div class="spinner"></div>${onlyMine ? "Looking for your replies..." : "Looking up at the sky..."}</div>`;

  try {
    const { thoughts, commentsByParent } = await fetchSkyBatch();

    let list = thoughts;
    if (onlyMine) {
      const myIds = new Set(getMyThoughtIds().map((t) => t.id));
      list = thoughts.filter((t) => myIds.has(t.id));
    }

    renderSky(body, list, commentsByParent, { emptyMessage: onlyMine
      ? "You haven't released anything from this browser yet — or your posts haven't received replies. Nothing to show here yet."
      : "The sky is empty right now. Be the first to release a thought! ☁️" });
  } catch (err) {
    console.error("Open sky modal error:", err);
    body.innerHTML = `
      <div class="error-box">
        😕 Couldn't load the sky right now. Please check your internet connection and try again.
      </div>`;
  }
}

function renderSky(panel, thoughts, commentsByParent, { emptyMessage }) {
  if (thoughts.length === 0) {
    panel.innerHTML = `<p class="placeholder">${emptyMessage}</p>`;
    return;
  }

  panel.innerHTML = `<div class="sky-cloud">${thoughts.map((t) => {
    const color = MOOD_COLORS[t.mood] || MOOD_COLORS[""];
    const label = t.mood ? `${t.mood} ${escapeHtml(t.text)}` : escapeHtml(t.text);
    const replies = commentsByParent.get(t.id) || [];

    return `
      <div class="cloud-bubble" style="--mood-color:${color}">
        <p class="cloud-text">${label}</p>
        <button type="button" class="reply-toggle" data-id="${t.id}">💬 ${replies.length ? `${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : "Reply"}</button>

        <div class="reply-panel" data-panel-for="${t.id}" hidden>
          <div class="reply-list">
            ${replies.length
              ? replies.map((r) => `<p class="reply-item">💭 ${escapeHtml(r.text)}</p>`).join("")
              : `<p class="reply-empty">No replies yet.</p>`}
          </div>
          <form class="reply-form" data-parent="${t.id}">
            <input type="text" class="reply-input" maxlength="150" placeholder="Write an anonymous reply..." aria-label="Reply" required />
            <button type="submit" class="btn btn-purple reply-submit">Send</button>
          </form>
          <p class="reply-error" hidden></p>
        </div>
      </div>`;
  }).join("")}</div>`;

  wireReplyInteractions(panel);
}

/* Expand/collapse reply panels and handle reply-form submissions
   for whichever sky panel (View Sky or Universe Reply) is showing. */
function wireReplyInteractions(panel) {
  panel.querySelectorAll(".reply-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = panel.querySelector(`.reply-panel[data-panel-for="${btn.dataset.id}"]`);
      target.hidden = !target.hidden;
    });
  });

  panel.querySelectorAll(".reply-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector(".reply-input");
      const errorEl = form.nextElementSibling; // .reply-error
      const text = input.value.trim();
      if (!text) return;

      if (containsBadWords(text)) {
        errorEl.hidden = false;
        errorEl.textContent = "🚫 Let's keep replies kind — please rephrase your comment.";
        return;
      }
      errorEl.hidden = true;

      const submitBtn = form.querySelector(".reply-submit");
      submitBtn.disabled = true;
      try {
        await postReply(form.dataset.parent, text);
        input.value = "";
        const list = form.previousElementSibling; // .reply-list
        const empty = list.querySelector(".reply-empty");
        if (empty) empty.remove();
        list.insertAdjacentHTML("beforeend", `<p class="reply-item">💭 ${escapeHtml(text)}</p>`);
      } catch (err) {
        console.error("Post reply error:", err);
        errorEl.hidden = false;
        errorEl.textContent = "😕 Couldn't send your reply. Please try again.";
      } finally {
        submitBtn.disabled = false;
      }
    });
  });
}

/* =========================================================
   INIT — run everything once the page is ready.
   ========================================================= */
function init() {
  showTodayDate();
  buildZodiacGrid();   // Daily Horoscope UI (GET)
  setupChartForm();    // Birth Chart UI (POST)
  setupWallForm();     // Freedom Wall UI (release into the sky)
}

document.addEventListener("DOMContentLoaded", init);
