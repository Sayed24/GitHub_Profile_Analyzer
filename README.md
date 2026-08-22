# GitHub Profile Analyzer

A polished, responsive GitHub profile analytics Progressive Web App built with HTML, CSS, and vanilla JavaScript. It uses the public GitHub REST API to turn a username into a recruiter-friendly profile snapshot with repository analytics, language charts, public activity signals, favorites, comparison tools, offline caching, and PDF export.

## Highlights

- **Real GitHub profile search** with username or GitHub profile URL input
- **Responsive profile overview** with avatar, bio, location, company, website, join date, and GitHub link
- **Repository analytics** for stars, forks, languages, recent updates, original repos, and top repositories
- **Repository explorer** with text search, language filtering, and sort by update date, stars, forks, or name
- **Smart portfolio insights** using transparent client-side heuristics rather than pretending to call an AI model
- **Portfolio health signals** for profile completeness, recent activity, traction, technology breadth, and maintenance
- **Chart.js visualizations** for language usage and starred repositories, with accessible text fallbacks
- **Public activity heatmap** based on public GitHub events from the REST API
- **Profile comparison** with side-by-side metrics, portfolio scores, and language overlap
- **Dark/light theme** with system preference detection and localStorage persistence
- **Search history and favorites** stored locally
- **Shareable URLs** using `?user=username`
- **PDF export** using html2pdf.js loaded only when needed, with browser Print → Save as PDF fallback
- **PWA installation UI** and repository-relative paths that work on GitHub Pages project sites
- **Offline support** with local API caching plus Service Worker runtime caching
- **Local notification opt-in** plus a Service Worker push handler ready for a future push backend
- **Automated tests and GitHub Actions CI** using Node's built-in test runner

## Project structure

```text
GitHub_Profile_Analyzer/
├── .github/
│   └── workflows/
│       └── ci.yml
├── assets/
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       └── icon-maskable-512.png
├── css/
│   └── styles.css
├── js/
│   ├── api.js
│   ├── app.js
│   ├── charts.js
│   ├── compare.js
│   ├── pwa.js
│   ├── theme.js
│   ├── ui.js
│   └── utils.js
├── tests/
│   ├── project.test.js
│   └── utils.test.js
├── compare.html
├── index.html
├── manifest.webmanifest
├── offline.html
├── package.json
├── README.md
└── service-worker.js
```

## Important upgrade note

The previous repository contained multiple generations of the same app (root-level CSS/JS plus `css/` and `js/` modules, and multiple service worker files). For a clean upgrade, replace the old project files with this folder rather than copying these files on top of the previous structure.

In particular, remove obsolete duplicates such as old root `app.js`, root `styles.css`, `sw.js`, and old modular files that are not present in the structure above. Keeping an older service worker around can make the browser serve stale code.

After deploying the new version, if a browser still shows an old build, open DevTools → Application → Service Workers, unregister the old worker, clear site data, then reload once.

## Run locally

PWA and Service Worker features require HTTP(S), so do not rely on double-clicking `index.html` from `file://`.

With Python:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

Or use any local static server such as VS Code Live Server.

## Deploy to GitHub Pages

1. Replace the repository contents with this clean project structure.
2. Commit and push to the `main` branch.
3. In GitHub, open **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.

The code uses repository-relative paths (`./`) so it works when hosted under a project path such as:

```text
https://<username>.github.io/GitHub_Profile_Analyzer/
```

## GitHub API behavior

This project intentionally does **not** hard-code a Personal Access Token in browser JavaScript. A token committed to a public GitHub Pages repository is not secret.

The unauthenticated GitHub REST API has a lower request limit. The app mitigates that by:

- caching API responses in localStorage with expiration
- allowing stale cached data while offline or during network failure
- caching requests in the Service Worker
- limiting repository pagination to the first 300 public repositories
- showing the latest observed API limit status in the footer

For a production authenticated version, use a serverless/backend proxy or GitHub OAuth so credentials never ship to the browser bundle.

## Public activity heatmap

The heatmap uses public events returned by GitHub's REST API. It is intentionally labeled **Public activity heatmap** rather than pretending to reproduce GitHub's private contribution calendar.

## Smart insights and score

The portfolio score is deterministic, local, and transparent. It considers public profile completeness, recent public events, repository traction, technology breadth, and repository maintenance. It is **not** an assessment of developer skill and is not powered by an external AI model.

## Notifications

The current static app can:

- ask for notification permission
- show a local confirmation notification
- respond to Service Worker `push` events

True remote push delivery requires a push subscription endpoint and backend/service to send Web Push messages. That backend is intentionally not faked in this GitHub Pages-only project.

## PDF export

The Export PDF button loads `html2pdf.js` only when clicked to keep the initial page light. If that CDN is unavailable, the app falls back to the browser print dialog, where the report can be saved as PDF.

## Quality checks

No test dependency installation is required beyond Node.js 18+.

```bash
npm run check
npm test
```

The included GitHub Actions workflow runs both checks on pushes and pull requests.

## Accessibility and performance

The UI includes semantic headings, visible focus states, reduced-motion support, keyboard-friendly controls, accessible chart labels/fallbacks, responsive image constraints, and print styles. Chart.js is deferred, while the heavier PDF library is loaded only on demand.

Lighthouse scores vary by device, connection, GitHub API response time, browser extensions, and CDN availability; no project can honestly guarantee a fixed 100/100 score on every run.

## Author

Sayedrahim Sadat

## License

Add the license you prefer before distributing the project beyond your portfolio.
