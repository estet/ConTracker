# Contraction Tracker

A private, mobile-first web app for timing contractions. It has no account, backend, analytics, or network storage. Contractions are saved only in the current browser profile.

## Run locally

Service workers require HTTP(S), so use a local server rather than opening `index.html` with `file://`:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173/`.

## Publish with GitHub Pages

The included GitHub Actions workflow deploys the static app whenever `main` changes.

1. Push the files to the repository's `main` branch.
2. In GitHub, open **Settings → Pages** and select **GitHub Actions** as the source if it is not already selected.
3. Open **Actions** and verify that **Deploy static site to GitHub Pages** succeeds.
4. Open the HTTPS deployment URL shown by GitHub.

On iPhone, open that URL in Safari and use **Share → Add to Home Screen**. If Actions cannot be enabled, the app can alternatively be published directly from the `main` branch and repository root.

## Features

- Large Start/Stop action designed for one-handed use.
- Retroactive starts: 30 seconds, 1 minute, 2 minutes, or 3 minutes ago.
- Live duration and start-to-start intervals.
- Recent average duration and interval.
- Persistent history and active-timer recovery after reload.
- Manual entries, undo/cancel, individual deletion, and clear-all confirmation.
- Shareable summary and CSV export.
- Automatic light/dark appearance.
- Offline support after the first successful visit.

## Privacy and backup

Data is stored only in browser `localStorage` under `contraction-tracker-v1`. Clearing Safari website data, switching browsers/devices, or using a private tab can remove or hide it. Use **Export CSV** or **Share summary** to keep a copy.

## Medical limitation

This is a timing and recording aid, not medical advice and not a diagnostic tool. Follow the instructions from your maternity unit and contact them whenever you are concerned.
