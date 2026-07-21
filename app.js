/* =========================================================
   Cosmic Daily — app.js
   -------------------------------------------------
   Contents:
     1) CONFIG           -> Vedika Astrology API (sandbox)
     2) DAILY HOROSCOPE  -> GET  /sandbox/daily/horoscope/{sign}
     3) BIRTH CHART      -> POST /sandbox/astrology/birth-chart
     4) FREEDOM WALL     -> release animation, reactions, timestamps,
                             stickers & pictures (shared, anonymous)
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

/* A broad set of Philippine city presets with known lat/long,
   so the user doesn't have to look up coordinates themselves.       */
const CITY_PRESETS = [
  { key: "manila",        name: "Manila",          lat: 14.5995, lng: 120.9842, tz: "+08:00" },
  { key: "quezon-city",   name: "Quezon City",    lat: 14.6760, lng: 121.0437, tz: "+08:00" },
  { key: "caloocan",      name: "Caloocan",       lat: 14.6547, lng: 120.9832, tz: "+08:00" },
  { key: "cebu",          name: "Cebu City",      lat: 10.3157, lng: 123.8854, tz: "+08:00" },
  { key: "davao",         name: "Davao City",     lat: 7.1907,  lng: 125.4553, tz: "+08:00" },
  { key: "zamboanga",     name: "Zamboanga City", lat: 6.9214,  lng: 122.0790, tz: "+08:00" },
  { key: "iloilo",        name: "Iloilo City",    lat: 10.7202, lng: 122.5621, tz: "+08:00" },
  { key: "bacolod",       name: "Bacolod",        lat: 10.6760, lng: 122.9511, tz: "+08:00" },
  { key: "baguio",        name: "Baguio",         lat: 16.4023, lng: 120.5960, tz: "+08:00" },
  { key: "cagayan-de-oro",name: "Cagayan de Oro", lat: 8.4542,  lng: 124.6319, tz: "+08:00" },
  { key: "general-santos", name: "General Santos", lat: 6.1164,  lng: 125.1716, tz: "+08:00" },
  { key: "angeles",        name: "Angeles City",   lat: 15.1451, lng: 120.5886, tz: "+08:00" },
  { key: "tagaytay",      name: "Tagaytay",       lat: 14.1146, lng: 120.9636, tz: "+08:00" },
  { key: "puerto-princesa",name: "Puerto Princesa",lat: 9.7392,  lng: 118.7353, tz: "+08:00" },
  { key: "butuan",        name: "Butuan",         lat: 8.9475,  lng: 125.5406, tz: "+08:00" },
  { key: "legazpi",       name: "Legazpi",        lat: 13.1391, lng: 123.7432, tz: "+08:00" },
  { key: "tacloban",      name: "Tacloban",       lat: 11.2432, lng: 125.0022, tz: "+08:00" },
  { key: "dumaguete",     name: "Dumaguete",      lat: 9.3094,  lng: 123.3080, tz: "+08:00" },
  { key: "naga",           name: "Naga City",      lat: 13.6211, lng: 123.1814, tz: "+08:00" },
  { key: "batangas",      name: "Batangas City",  lat: 13.7565, lng: 121.0580, tz: "+08:00" },
  { key: "lipa",          name: "Lipa",           lat: 13.9414, lng: 121.1542, tz: "+08:00" },
  { key: "san-fernando",  name: "San Fernando",   lat: 16.6150, lng: 120.3155, tz: "+08:00" },
  { key: "olongapo",      name: "Olongapo",       lat: 14.8388, lng: 120.2828, tz: "+08:00" },
  { key: "dagupan",       name: "Dagupan",        lat: 16.0433, lng: 120.3334, tz: "+08:00" },
  { key: "malaybalay",    name: "Malaybalay",     lat: 8.1548,  lng: 125.1278, tz: "+08:00" },
  { key: "tarlac",        name: "Tarlac City",    lat: 15.4868, lng: 120.5976, tz: "+08:00" },
  { key: "cotabato",      name: "Cotabato City",  lat: 7.2233,  lng: 124.2459, tz: "+08:00" },
  { key: "sorsogon",      name: "Sorsogon City",  lat: 12.9704, lng: 124.0054, tz: "+08:00" },
  { key: "marawi",        name: "Marawi",         lat: 8.0000,  lng: 124.2920, tz: "+08:00" },
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

/* Turn an ISO timestamp into a short, human "time ago" label,
   falling back to a short date once it's more than a week old.
   Used to show when a thought/reply was posted.                    */
function formatRelativeTime(iso) {
  const then = new Date(iso).getTime();
  if (!iso || Number.isNaN(then)) return "";

  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

    // Fallback with mock horoscope data
    const fallback = {
      symbol: sign.symbol,
      rating: 4,
      prediction: "A day of balance and reflection awaits you. Trust your instincts and embrace the cosmic energy surrounding you.",
      luckyNumber: Math.floor(Math.random() * 30) + 1,
      luckyColor: ["Gold", "Silver", "Blue", "Purple", "Red"][Math.floor(Math.random() * 5)],
      luckyTime: ["6:00 AM", "12:00 PM", "6:00 PM", "9:00 PM"][Math.floor(Math.random() * 4)],
      moonPhase: ["Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full", "Waning Gibbous", "Last Quarter", "Waning Crescent"][Math.floor(Math.random() * 7)],
      compatibleSign: ZODIAC_SIGNS[Math.floor(Math.random() * ZODIAC_SIGNS.length)].name,
    };

    renderHoroscope(sign, fallback);
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
  if (!select) return;

  const sortedCities = [...CITY_PRESETS].sort((a, b) => a.name.localeCompare(b.name));
  select.innerHTML = sortedCities.map((c) =>
    `<option value="${c.key}">${escapeHtml(c.name)}</option>`
  ).join("");
}

/* Set up the birth chart form. */
function setupChartForm() {
  const form = document.getElementById("chartForm");
  if (!form) return;

  buildCityOptions();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const date = document.getElementById("chartDate").value;
    const cityKey = document.getElementById("chartCity").value;
    const city = CITY_PRESETS.find((c) => c.key === cityKey) || CITY_PRESETS[0];

    if (!date) {
      alert("Please enter your birth date.");
      return;
    }

    fetchBirthChart({ date, time: "12:00", city });
  });
}

/* Fetch the birth chart from the Vedika sandbox (POST). */
async function fetchBirthChart({ date, time, city }) {
  const box = document.getElementById("chartResult");
  if (!box) return;

  box.innerHTML = `<div class="loading"><div class="spinner"></div>Generating your birth chart...</div>`;

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

    const fallback = {
      sunSign: "Leo",
      moonSign: "Gemini",
      risingSign: "Virgo",
      planetaryFocus: "Sun & Venus",
      summary: "Your chart points to a confident and expressive spirit with a warm, magnetic presence.",
      ascendant: {
        sign: "Leo",
        signLord: "Sun",
        interpretation: {
          element: "Fire",
          quality: "Fixed",
          traits: ["Confident", "Creative", "Warm-hearted"],
          strengths: ["Leadership", "Passion", "Generosity"],
          career: ["Creative Direction", "Leadership Roles"],
          compatibility: ["Aries", "Sagittarius"],
        },
      },
      nakshatra: { name: "Purva Phalguni", pada: 1, deity: "Bhaga", lord: "Venus" },
      chart: {
        northIndian: `<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="200" height="200" rx="18" fill="#fff" stroke="#2f8fd1" stroke-width="2"/><circle cx="110" cy="110" r="72" stroke="#4fa8e0" stroke-width="2" fill="none"/><circle cx="110" cy="110" r="42" stroke="#1c6fa8" stroke-width="2" fill="none"/><path d="M110 35 L110 185" stroke="#145684" stroke-width="2"/><path d="M35 110 L185 110" stroke="#145684" stroke-width="2"/><circle cx="110" cy="110" r="8" fill="#2f8fd1"/></svg>`,
      },
    };

    renderBirthChart(fallback, city);
  }
}

/* Render the birth chart as a card + SVG diagram. */
function renderBirthChart(data, city) {
  const box = document.getElementById("chartResult");
  if (!box) return;

  const asc = data.ascendant || {};
  const interp = asc.interpretation || {};
  const nak = data.nakshatra || asc.nakshatra || {};
  const sunSign = data.sunSign || data.sun || data.sun_sign || asc.sign || "—";
  const moonSign = data.moonSign || data.moon || data.moon_sign || "—";
  const risingSign = data.risingSign || data.rising || data.rising_sign || asc.sign || "—";
  const planetaryFocus = data.planetaryFocus || data.planetary_focus || "—";
  const summary = data.summary || `Your chart blends ${interp.element || "balanced"} energy with ${interp.quality || "adaptable"} qualities.`;

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

      <div class="detail-grid">
        <div class="detail-card">
          <span class="detail-label">☀️ Sun Sign</span>
          <strong>${escapeHtml(sunSign)}</strong>
        </div>
        <div class="detail-card">
          <span class="detail-label">🌙 Moon Sign</span>
          <strong>${escapeHtml(moonSign)}</strong>
        </div>
        <div class="detail-card">
          <span class="detail-label">🌅 Rising Sign</span>
          <strong>${escapeHtml(risingSign)}</strong>
        </div>
        <div class="detail-card">
          <span class="detail-label">✨ Focus</span>
          <strong>${escapeHtml(planetaryFocus)}</strong>
        </div>
      </div>

      <div class="chart-summary">${escapeHtml(summary)}</div>

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
   (text + mood + optional sticker/picture — never a name) to a
   shared JSONBin.io collection, so anyone who opens "View Sky"
   can see, react to, and anonymously reply to what others released.

     RELEASE (write)     -> POST /v3/b            (tagged to a collection)
     REPLY   (write)     -> POST /v3/b            (same collection, has parentId)
     REACT   (write)     -> PUT  /v3/b/{id}       (updates the reactions tally)
     VIEW SKY (read)     -> GET  /v3/c/{id}/bins   then GET each bin's content
     UNIVERSE REPLY      -> same read, filtered to thoughts released from this browser

   JSONBin's free tier allows only one collection, so thoughts and
   replies share CONFIG.JSONBIN_COLLECTION_ID — a bin is a "reply"
   if its content has a parentId field, a "thought" otherwise.

   "Universe Reply" needs to know which thoughts are "yours" after
   a reload, so (with the user's OK) we keep a small local list of
   your own released thought IDs/text in localStorage. We also keep
   a small local list of which reactions YOU have tapped, so your
   heart/emoji stays highlighted and you can't spam the same
   reaction over and over. This is the ONLY thing saved locally —
   it never leaves your browser.

   PICTURES: since this is a lightweight, key-in-the-open static
   site (no real file server), pictures are resized/compressed in
   the browser to a small JPEG and stored as a base64 string right
   alongside the text, the same way the text itself is stored. This
   keeps things simple for a class demo, but means very large or
   detailed photos may be rejected as "too big" — it's meant for
   small illustrative pictures and stickers, not high-res photos.

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

/* Reaction emoji set. Thoughts show all of these; replies show a
   shorter "compact" set to keep reply rows tidy.                    */
const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "👍"];

/* Sticker set for the Freedom Wall's sticker picker — a bigger,
   more playful set of emoji than the mood dropdown, inserted
   straight into the message text at the cursor position.            */
const STICKERS = [
  "🌟", "🎉", "🌈", "🦋", "🍀", "🌻", "🐱", "🐶", "🍩", "☕",
  "🎈", "🌙", "⭐", "💫", "🔥", "👑", "🎨", "🍕", "🏆", "✨",
  "🌸", "🍉", "🐢", "🦄",
];

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
let pendingImageDataUrl = null; // staged picture waiting to be released

/* Local cache of the full content object for every bin currently shown
   in the sky modal (thoughts + replies), keyed by bin id. Lets a
   reaction click update the tally and PUT the change back without an
   extra GET round-trip.                                              */
const binCache = new Map();

/* ---------- Local "my thoughts" / "my reactions" tracking (opt-in, browser-only) ---------- */
const MY_THOUGHTS_KEY = "cosmicDaily_myThoughts";
const MY_REACTIONS_KEY = "cosmicDaily_myReactions";

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

/* Reactions you've tapped, stored as "binId:emoji" strings so we know
   what to highlight and what to "un-react" if tapped again.          */
function getMyReactions() {
  try {
    return new Set(JSON.parse(localStorage.getItem(MY_REACTIONS_KEY)) || []);
  } catch {
    return new Set();
  }
}

function saveMyReactions(set) {
  try {
    localStorage.setItem(MY_REACTIONS_KEY, JSON.stringify([...set]));
  } catch (err) {
    console.error("Could not remember reactions locally:", err);
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
    const image = pendingImageDataUrl;
    releaseThought(text, mood, image);

    form.reset();
    counter.textContent = "0 / 200";
    clearPendingImage();
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

/* ---------- Sticker picker ---------- */
function setupStickerPicker() {
  const btn = document.getElementById("stickerBtn");
  const panel = document.getElementById("stickerPanel");
  const textarea = document.getElementById("wallMessage");
  const counter = document.getElementById("charCount");
  if (!btn || !panel || !textarea) return;

  panel.innerHTML = STICKERS.map((s) =>
    `<button type="button" class="sticker-option" data-sticker="${s}" aria-label="Insert ${s} sticker">${s}</button>`
  ).join("");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    btn.setAttribute("aria-expanded", String(willOpen));
  });

  panel.addEventListener("click", (e) => {
    const opt = e.target.closest(".sticker-option");
    if (!opt) return;
    insertAtCursor(textarea, opt.dataset.sticker);
    counter.textContent = `${textarea.value.length} / 200`;
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    textarea.focus();
  });

  // Click-away closes the panel.
  document.addEventListener("click", (e) => {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== btn) {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

/* Insert text at the current cursor position in a textarea (or append
   it if nothing is focused), respecting the existing maxlength.      */
function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  const max = Number(textarea.getAttribute("maxlength")) || Infinity;

  textarea.value = `${before}${text}${after}`.slice(0, max);
  const pos = Math.min(start + text.length, max);
  textarea.setSelectionRange(pos, pos);
}

/* ---------- Picture attach ---------- */
function setupImagePicker() {
  const btn = document.getElementById("imageBtn");
  const input = document.getElementById("wallImage");
  const preview = document.getElementById("imagePreview");
  if (!btn || !input || !preview) return;

  btn.addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file (JPG, PNG, GIF, etc.).");
      input.value = "";
      return;
    }

    try {
      pendingImageDataUrl = await processImageFile(file);
      preview.hidden = false;
      preview.innerHTML = `
        <img src="${pendingImageDataUrl}" alt="Attached picture preview" />
        <button type="button" id="removeImageBtn" class="image-remove" aria-label="Remove picture">✕ Remove</button>`;
      document.getElementById("removeImageBtn").addEventListener("click", clearPendingImage);
    } catch (err) {
      console.error("Could not process image:", err);
      alert("Sorry, that picture is too large or couldn't be processed. Please try a smaller image.");
      clearPendingImage();
    } finally {
      input.value = ""; // allow re-selecting the same file later
    }
  });
}

function clearPendingImage() {
  pendingImageDataUrl = null;
  const preview = document.getElementById("imagePreview");
  if (preview) {
    preview.hidden = true;
    preview.innerHTML = "";
  }
}

/* Resize + compress an image file down to a small base64 JPEG so it's
   light enough to store as a plain string alongside the wall text.
   Tries a looser size first, then a tighter one if that's still big. */
async function processImageFile(file) {
  const SIZE_LIMIT = 180000; // ~130KB decoded — keeps JSONBin records small

  let dataUrl = await resizeImageToDataUrl(file, 320, 0.6);
  if (dataUrl.length > SIZE_LIMIT) {
    dataUrl = await resizeImageToDataUrl(file, 220, 0.45);
  }
  if (dataUrl.length > SIZE_LIMIT) {
    throw new Error("Image still too large after compression");
  }
  return dataUrl;
}

function resizeImageToDataUrl(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => { img.src = reader.result; };
    reader.onerror = () => reject(new Error("Could not read the file"));

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Could not load the image"));

    reader.readAsDataURL(file);
  });
}

/* Animate a thought rising out of view locally, and (if configured)
   save it — anonymously, text + mood + optional picture — to the
   shared sky. */
function releaseThought(text, mood, image) {
  const stage = document.getElementById("skyStage");
  const hint = document.getElementById("skyHint");
  const color = MOOD_COLORS[mood] || MOOD_COLORS[""];

  const orb = document.createElement("div");
  orb.className = "thought-orb";
  orb.style.setProperty("--mood-color", color);
  orb.textContent = `${mood ? mood + " " : ""}${image ? "📷 " : ""}${text}`;

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
    saveToSharedSky(text, mood, image)
      .then((id) => rememberMyThought(id, text, mood))
      .catch((err) => {
        // The local animation already played, so this failing shouldn't
        // interrupt the user — just log it for debugging.
        console.error("Could not save thought to the shared sky:", err);
      });
  }
}

/* POST the released thought (anonymous: text + mood + optional picture,
   plus an empty reactions tally) to JSONBin, tagged into our shared
   collection. Returns the new bin's ID. */
async function saveToSharedSky(text, mood, image) {
  const body = { text, mood, releasedAt: new Date().toISOString(), reactions: {} };
  if (image) body.image = image;

  const res = await fetch(`${CONFIG.JSONBIN_BASE}/b`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY,
      "X-Collection-Id": CONFIG.JSONBIN_COLLECTION_ID,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Save failed: status ${res.status}`);
  const json = await res.json();
  return json.metadata.id;
}

/* POST an anonymous reply to a thought, tagged with parentId so it can
   be matched back to the thought it belongs to. Returns the new reply's ID. */
async function postReply(parentId, text) {
  const res = await fetch(`${CONFIG.JSONBIN_BASE}/b`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY,
      "X-Collection-Id": CONFIG.JSONBIN_COLLECTION_ID,
    },
    body: JSON.stringify({ parentId, text, createdAt: new Date().toISOString(), reactions: {} }),
  });
  if (!res.ok) throw new Error(`Reply failed: status ${res.status}`);
  const json = await res.json();
  return json.metadata.id;
}

/* PUT an updated content object back over an existing bin — used to
   persist a reaction tally change. */
async function putBinContent(id, content) {
  const res = await fetch(`${CONFIG.JSONBIN_BASE}/b/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY,
    },
    body: JSON.stringify(content),
  });
  if (!res.ok) throw new Error(`Reaction update failed: status ${res.status}`);
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

  // Keep a fresh lookup of every bin currently on screen, for reactions.
  binCache.clear();
  bins.forEach((b) => binCache.set(b.id, b));

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

/* Build the row of reaction buttons + counts for a thought or reply.
   compact=true trims the emoji set down for cramped reply rows.      */
function reactionsBarHtml(id, reactions = {}, compact = false) {
  const emojis = compact ? REACTION_EMOJIS.slice(0, 3) : REACTION_EMOJIS;
  const mine = getMyReactions();

  return `<div class="reactions-bar${compact ? " compact" : ""}">
    ${emojis.map((emoji) => {
      const count = reactions[emoji] || 0;
      const active = mine.has(`${id}:${emoji}`);
      return `<button type="button" class="reaction-btn${active ? " active" : ""}" data-id="${id}" data-emoji="${emoji}" aria-pressed="${active}">
        <span class="reaction-emoji">${emoji}</span>${count > 0 ? `<span class="reaction-count">${count}</span>` : ""}
      </button>`;
    }).join("")}
  </div>`;
}

function replyItemHtml(reply) {
  return `<div class="reply-item-wrap">
    <p class="reply-item">💭 ${escapeHtml(reply.text)}</p>
    <div class="reply-item-meta">
      <span class="reply-time">${formatRelativeTime(reply.createdAt)}</span>
      ${reactionsBarHtml(reply.id, reply.reactions, true)}
    </div>
  </div>`;
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
    const imageHtml = t.image ? `<img class="cloud-image" src="${t.image}" alt="Attached picture" loading="lazy" />` : "";

    return `
      <div class="cloud-bubble" style="--mood-color:${color}">
        ${imageHtml}
        <p class="cloud-text">${label}</p>
        <p class="cloud-time">${formatRelativeTime(t.releasedAt)}</p>
        ${reactionsBarHtml(t.id, t.reactions)}
        <button type="button" class="reply-toggle" data-id="${t.id}">💬 ${replies.length ? `${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : "Reply"}</button>

        <div class="reply-panel" data-panel-for="${t.id}" hidden>
          <div class="reply-list">
            ${replies.length
              ? replies.map((r) => replyItemHtml(r)).join("")
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

  wireBubbleInteractions(panel);
}

/* One set of delegated listeners handles reply-toggle clicks, reaction
   clicks, and reply-form submissions for the whole sky panel — so newly
   inserted replies work immediately without re-binding anything.      */
function wireBubbleInteractions(panel) {
  panel.addEventListener("click", handlePanelClick);
  panel.addEventListener("submit", handlePanelSubmit);
}

function handlePanelClick(e) {
  const panel = e.currentTarget;

  const toggleBtn = e.target.closest(".reply-toggle");
  if (toggleBtn) {
    const target = panel.querySelector(`.reply-panel[data-panel-for="${toggleBtn.dataset.id}"]`);
    if (target) target.hidden = !target.hidden;
    return;
  }

  const reactionBtn = e.target.closest(".reaction-btn");
  if (reactionBtn) {
    handleReactionClick(reactionBtn);
  }
}

/* Toggle a reaction on/off for a thought or reply: updates the UI
   instantly, remembers the choice locally, then persists the new
   tally to JSONBin in the background. */
function handleReactionClick(btn) {
  const id = btn.dataset.id;
  const emoji = btn.dataset.emoji;
  const content = binCache.get(id);
  if (!content) return;

  const mine = getMyReactions();
  const key = `${id}:${emoji}`;
  const alreadyReacted = mine.has(key);

  content.reactions = content.reactions || {};
  const current = content.reactions[emoji] || 0;
  const nextCount = alreadyReacted ? Math.max(0, current - 1) : current + 1;
  content.reactions[emoji] = nextCount;

  if (alreadyReacted) mine.delete(key);
  else mine.add(key);
  saveMyReactions(mine);

  updateReactionButtonUI(btn, nextCount, !alreadyReacted);

  const { id: _drop, ...bodyToSave } = content;
  putBinContent(id, bodyToSave).catch((err) => {
    console.error("Could not save reaction:", err);
  });
}

function updateReactionButtonUI(btn, count, active) {
  btn.classList.toggle("active", active);
  btn.setAttribute("aria-pressed", String(active));

  let countEl = btn.querySelector(".reaction-count");
  if (count > 0) {
    if (!countEl) {
      countEl = document.createElement("span");
      countEl.className = "reaction-count";
      btn.appendChild(countEl);
    }
    countEl.textContent = String(count);
  } else if (countEl) {
    countEl.remove();
  }
}

async function handlePanelSubmit(e) {
  const form = e.target.closest(".reply-form");
  if (!form) return;
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
    const createdAt = new Date().toISOString();
    const newId = await postReply(form.dataset.parent, text);
    const replyObj = { id: newId, parentId: form.dataset.parent, text, createdAt, reactions: {} };
    binCache.set(newId, replyObj);

    input.value = "";
    const list = form.previousElementSibling; // .reply-list
    const empty = list.querySelector(".reply-empty");
    if (empty) empty.remove();
    list.insertAdjacentHTML("beforeend", replyItemHtml(replyObj));

    // Keep the visible reply count on the toggle button in sync.
    const bubble = form.closest(".cloud-bubble");
    const toggleBtn = bubble?.querySelector(".reply-toggle");
    if (toggleBtn) {
      const count = list.querySelectorAll(".reply-item-wrap").length;
      toggleBtn.textContent = `💬 ${count} ${count === 1 ? "reply" : "replies"}`;
    }
  } catch (err) {
    console.error("Post reply error:", err);
    errorEl.hidden = false;
    errorEl.textContent = "😕 Couldn't send your reply. Please try again.";
  } finally {
    submitBtn.disabled = false;
  }
}

/* =========================================================
   INIT — run everything once the page is ready.
   ========================================================= */
function init() {
  showTodayDate();
  buildZodiacGrid();    // Daily Horoscope UI (GET)
  setupChartForm();     // Birth Chart UI (POST)
  setupWallForm();      // Freedom Wall UI (release into the sky)
  setupStickerPicker(); // Freedom Wall stickers
  setupImagePicker();   // Freedom Wall picture attach
}

document.addEventListener("DOMContentLoaded", init);
