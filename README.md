# Contraction Tracker

A private, mobile-first web app for timing contractions. It has no account, backend, analytics, or network storage. Contractions are saved only in the current browser profile.

## Use the app

Contraction Tracker is available on my GitHub Pages site at [estet.github.io/ConTracker](https://estet.github.io/ConTracker/).

## Run locally

Serve the repository over HTTP and open it in a browser:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173/`.

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
