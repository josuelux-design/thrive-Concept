# Thrive TRM — Hub Prototype

An interactive, in-browser prototype of the Thrive TRM Hub (projects, candidates,
people, market map, and a personal activity feed). Built with React + Babel loaded
from CDN — **no build step and no dependencies to install.**

## Run it locally

The prototype loads its `.jsx` files at runtime via in-browser Babel, so it must be
served over HTTP (opening the file directly with `file://` will not work).

From this folder:

```bash
python3 -m http.server 8756
```

Then open **http://localhost:8756/Thrive%20Hub.html**

> Tip: if you edit a `.jsx` file and don't see the change, hard-reload the tab
> (⌘/Ctrl + Shift + R) — the browser caches the compiled scripts.

## Structure

- `Thrive Hub.html` — entry point; loads the scripts below in order
- `css/tokens.css` — design tokens (colors, spacing, typography)
- `js/` — the app, split by area:
  - `hub.jsx` — app shell, nav, Hub home (personal activity + calendar)
  - `hub-project*.jsx` — project workspace (kanban / list / details / market map)
  - `hub-candidate-panel.jsx` — candidate side panel + team-activity feed
  - `hub-person.jsx` — full-page person profile
  - `hub-pages.jsx`, `hub-data.jsx`, `hub-shared.jsx`, `icons.jsx`, … — pages, sample data, shared UI

All data is synthesized in `hub-data.jsx` (and deterministic generators) — nothing is
persisted server-side; it's a design prototype.
