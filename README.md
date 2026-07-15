# ✨ Cosmic Daily

A simple web app for our **API Group Exercise**. It uses the **Vedika Astrology API**
(sandbox mode) for two features — a daily horoscope and a personal birth chart — plus a
bonus **Freedom Wall**, presented in a clean, astrology-themed design.

| Feature | Endpoint | Method |
|---------|----------|--------|
| 🔮 **Daily Horoscope** — pick a zodiac sign, get today's reading (prediction, rating, lucky number/color/time, moon phase) | `/sandbox/daily/horoscope/{sign}` | **GET** |
| 🪐 **Birth Chart** — enter your birth date, time & city, get your ascendant sign, nakshatra, traits, and a chart diagram | `/sandbox/astrology/birth-chart` | **POST** |
| 🌌 **Freedom Wall** — write an anonymous thought, "release" it, browse everyone else's under "View Sky", reply anonymously, and see replies to your own posts under "Universe Reply" | JSONBin.io — `POST /v3/b`, `GET /v3/c/{id}/bins` | **POST + GET** |

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

## Setting up the shared Freedom Wall (JSONBin.io)

The horoscope and birth chart work out of the box with no setup. The Freedom Wall's **View
Sky** feature needs a one-time, free setup so everyone's released thoughts land in the same
shared place:

1. Sign up for a free account at **https://jsonbin.io** and copy your **X-Master-Key** from
   the API Keys page.
2. Create a collection to hold all released thoughts — easiest way is with `curl`:
   ```bash
   curl -X POST https://api.jsonbin.io/v3/c \
     -H "Content-Type: application/json" \
     -H "X-Master-Key: YOUR_MASTER_KEY" \
     -H "X-Collection-Name: cosmic-daily-freedom-wall" \
     -d "{}"
   ```
   The response's `"record"` field is your **Collection ID**.
3. Open [`app.js`](app.js) and fill in `CONFIG.JSONBIN_MASTER_KEY` and
   `CONFIG.JSONBIN_COLLECTION_ID` with the values from steps 1–2.

> ⚠️ **Security note:** this is a static, client-only site with no backend, so the Master Key
> necessarily ships inside `app.js` and is visible to anyone who views the page source. That's
> an acceptable trade-off for a class demo, but don't reuse this key for anything you actually
> care about protecting — anyone could technically use it to write to (or read) this collection.

Without this setup, the horoscope and birth chart still work normally — only clicking
**Release** or **View Sky** will show a friendly "not set up yet" message instead of erroring.

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
    python -m http.server 8080
    ```
    then visit **http://localhost:8080** in your browser.

> ⚠️ **Use port 8080** (not the Live Server default of 5500). The Vedika sandbox only allows
> requests from a small whitelist of origins (`localhost:8080`, `localhost:3000`, etc.) — if
> your dev server runs on a different port, the horoscope/birth chart requests will silently
> fail with a CORS error in the browser console. If you use VS Code Live Server, change its
> port in the extension settings (or `.vscode/settings.json` → `"liveServer.settings.port": 8080`)
> before opening the page.

That's it! 🎉

---

## 📁 Project structure

```
API-Group-Excercise/
├── index.html               # Page structure (3 sections + header/footer)
├── style.css                 # Clear-sky light blue theme, responsive layout
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

## 🔌 API details — JSONBin.io (Freedom Wall)

Base URL: `https://api.jsonbin.io/v3`

### POST — Release a thought
```
POST /b
Content-Type: application/json
X-Master-Key: YOUR_MASTER_KEY
X-Collection-Id: YOUR_COLLECTION_ID

{ "text": "...", "mood": "😊", "releasedAt": "2026-07-15T10:00:00.000Z" }
```
Creates one bin per released thought (no name field — fully anonymous), tagged into the
shared collection.

### POST — Reply to a thought
```
POST /b
Content-Type: application/json
X-Master-Key: YOUR_MASTER_KEY
X-Collection-Id: YOUR_COLLECTION_ID

{ "parentId": "<the thought's bin id>", "text": "...", "createdAt": "2026-07-15T10:05:00.000Z" }
```
Also anonymous (no name field). JSONBin's free tier only allows **one collection**, so a bin
is treated as a reply whenever its content has a `parentId` — otherwise it's a thought.

### GET — View Sky / Universe Reply
```
GET /c/{collectionId}/bins        (list bin IDs in the collection)
GET /b/{binId}/latest?meta=false  (fetch one bin's content)
```
The app lists the collection's bins, fetches the latest 50 by creation time, and splits them
into thoughts vs. replies (grouped by `parentId`) on the client. **View Sky** shows all of
them; **Universe Reply** filters down to only the thoughts *this browser* has released (see
below), so you can see what people replied to your posts.

> 💬 **How comments are moderated:** before a reply is sent, it's checked in the browser
> against a small English + Tagalog blocklist of unkind words. This is a courtesy nudge, not a
> real moderation system — it runs client-side, so it can be bypassed by anyone determined to.

> 📍 **How "Universe Reply" knows which posts are yours:** since the wall has no accounts, the
> browser keeps a small local list (`localStorage`) of the thoughts *you've* released — just
> their text, mood, and ID, never anything about you. This list never leaves your browser and
> is the only thing the Freedom Wall stores locally.

### 🧪 Testing with Postman

Import [`postman_collection.json`](postman_collection.json) into Postman — it has the
**GET Daily Horoscope** / **POST Birth Chart** requests for Vedika, plus **POST Release
Thought** / **POST Reply to Thought** / **GET List Sky Bins** / **GET Read One Thought** for
JSONBin, matching the assignment's requirement to read the docs and test GET/POST before
building the site.

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

- The Freedom Wall is **fully anonymous** — there is no name field anywhere, on a thought or a
  reply, and nothing you write is ever linked to you. Pressing Enter (or **Release ✨**) plays
  a local animation of your thought rising away, and (if configured) saves just the text +
  mood to a shared JSONBin collection so **View Sky** can show what others have released, and
  **Universe Reply** can show replies to what *you've* released. It's a bonus feature, not
  part of the required Vedika API integration.
- All user- and API-provided text is escaped before being inserted into the page
  (basic XSS protection).

---

Built with 💜 for our group exercise.
