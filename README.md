# ✨ Cosmic Daily

A simple web app for our **API Group Exercise**. It uses the **Vedika Astrology API**
(sandbox mode) for two features — a daily horoscope and a personal birth chart — plus a
bonus local **Freedom Wall**, presented in a mystical astrology theme.

| Feature | Endpoint | Method |
|---------|----------|--------|
| 🔮 **Daily Horoscope** — pick a zodiac sign, get today's reading (prediction, rating, lucky number/color/time, moon phase) | `/sandbox/daily/horoscope/{sign}` | **GET** |
| 🪐 **Birth Chart** — enter your birth date, time & city, get your ascendant sign, nakshatra, traits, and a chart diagram | `/sandbox/astrology/birth-chart` | **POST** |
| 📝 **Freedom Wall** — post anonymous messages, saved in your browser | `localStorage` (bonus, not an external API) | — |

## Why "sandbox" mode?

Vedika's live API needs a **paid** plan ($12/month) to return real astrology data — there is
no free tier with real production data. Their **sandbox** is free, needs **no signup and no
API key**, and mirrors the exact same request/response shapes as the live API using realistic
mock data. This lets us fully demonstrate a real **GET + POST** workflow against their
documented API at zero cost — perfect for a class project.

> 💡 If you'd rather use a real account: sign up at **https://vedika.io/signup**, get your key
> from the **Console**, and paste it into `CONFIG.VEDIKA_KEY` in [`app.js`](app.js). It will
> automatically be sent as an `Authorization: Bearer <key>` header. This is fully optional —
> the app works out of the box without it.

---

## 🚀 How to launch

This is a plain **HTML / CSS / JavaScript** project — no installation, no build step, and
**no API key required**.

Pick **one** of these:

- **Easiest:** double-click [`index.html`](index.html) to open it in your browser.
- **Recommended (avoids some browser quirks):** run a local server, e.g.
  - VS Code → install the **Live Server** extension → right-click `index.html` → **Open with Live Server**, or
  - with Python:
    ```bash
    python -m http.server 5500
    ```
    then visit **http://localhost:5500** in your browser.

That's it! 🎉

---

## 📁 Project structure

```
API-Group-Excercise/
├── index.html               # Page structure (3 sections + header/footer)
├── style.css                 # Mystical dark theme, responsive layout
├── app.js                    # API calls, rendering, error handling, freedom wall
├── postman_collection.json   # Import into Postman to test the GET & POST endpoints
└── README.md                  # This file
```

---

## 🔌 API details — Vedika Astrology API (sandbox)

Base URL: `https://api.vedika.io/sandbox`

### GET — Daily Horoscope
```
GET /sandbox/daily/horoscope/{sign}
```
`{sign}` = `aries`, `taurus`, `gemini`, ... `pisces`. Example response:
```json
{
  "success": true,
  "data": {
    "sign": "leo", "symbol": "♌", "prediction": "Today's focus is on travel...",
    "rating": 4, "luckyNumber": 42, "luckyColor": "Gold", "luckyTime": "10:00-12:00",
    "moonPhase": "New Moon", "compatibleSign": "Leo", "theme": "travel"
  }
}
```

### POST — Birth Chart
```
POST /sandbox/astrology/birth-chart
Content-Type: application/json

{
  "datetime": "1990-06-15T14:30:00",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "timezone": "+08:00"
}
```
Returns the ascendant sign, its ruling planet, nakshatra info, personality traits/career/
compatibility, and an SVG birth chart diagram (`data.chart.northIndian`).

### 🧪 Testing with Postman

Import [`postman_collection.json`](postman_collection.json) into Postman — it has both the
**GET Daily Horoscope** and **POST Birth Chart** requests ready to run, matching the
assignment's requirement to read the docs and test GET/POST before building the site.

---

## 🛡️ Error handling

- Every API call is wrapped in `try/catch`.
- Non-OK HTTP responses (404, 500...) or `success: false` payloads throw and show a
  **user-friendly message** in the UI.
- Technical details are logged to the **browser console** (`console.error`) for debugging.
- The birth chart's SVG response is checked for a stray `<script>` tag before being inserted
  into the page, as a basic safety check.

---

## 📝 Notes

- Freedom Wall posts are stored **only in your own browser** (via `localStorage`) — they are
  a bonus feature, private to your device, and not part of the required API integration.
- All user- and API-provided text is escaped before being inserted into the page
  (basic XSS protection).

---

Built with 💜 for our group exercise.
