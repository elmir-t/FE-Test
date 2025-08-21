# Overwrite README.md with the full content in one go

cat > README.md <<'MARKDOWN'

# DAP – Jupyter UI POC

Frontend-only proof of concept that demonstrates two flows:

- **Canvas (`/`)** — mock live stream (status → progress → table preview → viz).
- **Notebook (`/notebook`)** — loads **exported artifacts** from a Colab/Jupyter notebook (JSON preferred, PNG/SVG fallback).

No real backend. All data is local.

---

## What’s included

- React + TypeScript + Vite + Tailwind.
- Plotly rendering via a shared `VizContainer` (renders only a provided Plotly spec).
- Mock stream with a simple state machine: `idle → running → processing → done | error`.
- Notebook integration through `useColabExports` that reads fixed filenames from `/public/colab-exports`.
- Export menu stubs (PNG/SVG/PDF) with success toasts (no files produced).

---

## Requirements

- Node 18+ (LTS recommended)
- npm 9+
- `.env.local` contains: `VITE_STREAM_MODE=mock`

---

## Getting started

```bash
npm i
npm run dev
Open the app at the printed URL (e.g., http://localhost:5173).

Pages & flows
1) Canvas (/)
Click Run to start the mock stream:

Status updates and a progress bar (0 → 100).

A table preview event (rows × cols) visible in the right panel (Data tab).

A final Plotly chart in the center panel.

Simulate Error → shows an error state.

Reset → returns to idle.

Export → shows success toasts for PNG/SVG/PDF (stubs).

2) Notebook (/notebook)
Buttons:

Open in Colab — opens the notebook link (placeholder).

Refresh from Notebook — reloads artifacts from /public/colab-exports.

View Exports — quick hint where files should live.

Center:

Heatmap, Stacked Bar, Boxplot — drawn from exported JSON; PNG/SVG used as fallback.

Right panel tabs: Params / Data / AI (placeholders).

Footer: “Streaming via mock; real WS/SSE later”.

Notebook → Frontend handoff (no backend)
Produce the following files with Colab/Jupyter and copy them into public/colab-exports/ of this repo:

pgsql
Copy
Edit
public/colab-exports/
  table_preview.json
  heatmap.json      (or heatmap.png / heatmap.svg)
  stacked_bar.json  (or stacked_bar.png / stacked_bar.svg)
  boxplot.json      (or boxplot.png / boxplot.svg)
Plotly JSON format (use figure.to_plotly_json()):

json
Copy
Edit
{
  "data": [...],
  "layout": { "title": "..." },
  "config": { "responsive": true }
}
After copying, open /notebook and click Refresh from Notebook.

Mock stream (Canvas)
Events emitted to the UI:

ts
Copy
Edit
{ type: "status", phase: "running" | "processing" | "done" | "error", progress: number }
{ type: "table",  dfPreview: { rows: number, cols: number } }
{ type: "viz",    spec: any /* Plotly JSON */ }
{ type: "error",  message: string }
State machine: idle → running → processing → done | error.

Verification checklist
npm run dev → no console errors.

Go to / → Run → see progress 0→100, table preview, final Plotly viz.

Simulate Error → error state; Reset → back to idle.

Place artifacts in public/colab-exports/ (see list above).

Go to /notebook → Refresh from Notebook → table preview + heatmap/stacked bar/boxplot render (JSON preferred, PNG/SVG fallback).

Troubleshooting
No visuals on /notebook: ensure files exist in public/colab-exports/ with exact names.

Canvas does nothing after Run: confirm .env.local has VITE_STREAM_MODE=mock; check browser console.

Plotly JSON not rendering: confirm it’s produced by to_plotly_json() (has data, optional layout, optional config).

What this POC proves
The frontend can show live (mocked) and offline (exported) results using the same visualization container.

The Colab/Jupyter → FE handoff works without a backend by exporting fixed-name artifacts and refreshing the UI.

```
