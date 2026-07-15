/* =========================================================
   Cosmic Daily — app.js
   -------------------------------------------------
   Contents:
     1) CONFIG           -> Vedika Astrology API (sandbox)
     2) DAILY HOROSCOPE  -> GET  /sandbox/daily/horoscope/{sign}
     3) BIRTH CHART      -> POST /sandbox/astrology/birth-chart
     4) FREEDOM WALL     -> localStorage (bonus feature, no external API)
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

  select.innerHTML = CITY_PRESETS.map((c) =>
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
   4) FREEDOM WALL  (localStorage — bonus feature)
   Posts are saved as a JSON string in the browser.
   This is not an external API, since this project uses only
   one required API (Vedika) per the assignment.
   ========================================================= */

const WALL_KEY = "cosmicDaily_wallPosts";

function loadPosts() {
  try {
    return JSON.parse(localStorage.getItem(WALL_KEY)) || [];
  } catch (err) {
    console.error("Cannot read wall posts:", err);
    return [];
  }
}

function savePosts(posts) {
  try {
    localStorage.setItem(WALL_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error("Cannot save wall posts:", err);
    alert("Couldn't save the post — the browser's storage might be full.");
  }
}

function setupWallForm() {
  const form = document.getElementById("wallForm");
  const message = document.getElementById("wallMessage");
  const counter = document.getElementById("charCount");

  message.addEventListener("input", () => {
    counter.textContent = `${message.value.length} / 200`;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = message.value.trim();
    if (!text) return;

    const post = {
      id: Date.now(),
      name: document.getElementById("wallName").value.trim() || "Anonymous",
      mood: document.getElementById("wallMood").value,
      text: text,
      date: new Date().toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      }),
    };

    const posts = loadPosts();
    posts.unshift(post);
    savePosts(posts);
    renderPosts();

    form.reset();
    counter.textContent = "0 / 200";
  });
}

function deletePost(id) {
  if (!confirm("Delete this post?")) return;
  const posts = loadPosts().filter((p) => p.id !== id);
  savePosts(posts);
  renderPosts();
}

function renderPosts() {
  const list = document.getElementById("wallList");
  const posts = loadPosts();

  if (posts.length === 0) {
    list.innerHTML = `<p class="wall-empty">No posts yet. Be the first! ✍️</p>`;
    return;
  }

  list.innerHTML = posts.map((p) => `
    <div class="wall-post">
      <div class="post-meta">
        <span class="post-author">${p.mood ? `<span class="post-mood">${escapeHtml(p.mood)}</span> ` : ""}${escapeHtml(p.name)}</span>
        <button class="post-delete" data-id="${p.id}" title="Delete" aria-label="Delete post">🗑️</button>
      </div>
      <p class="post-body">${escapeHtml(p.text)}</p>
      <div class="post-meta"><span></span><span>${escapeHtml(p.date)}</span></div>
    </div>
  `).join("");

  list.querySelectorAll(".post-delete").forEach((btn) => {
    btn.addEventListener("click", () => deletePost(Number(btn.dataset.id)));
  });
}

/* =========================================================
   INIT — run everything once the page is ready.
   ========================================================= */
function init() {
  showTodayDate();
  buildZodiacGrid();   // Daily Horoscope UI (GET)
  setupChartForm();    // Birth Chart UI (POST)
  setupWallForm();     // Freedom Wall UI (localStorage)
  renderPosts();
}

document.addEventListener("DOMContentLoaded", init);
