# interview-syntax-editor

## SyntaxAid — AI-Powered Go Syntax Editor

An interview-focused code editor with local AI syntax completions via Ollama.

---

## Phase 0: Environment & Tooling

- **Frontend:** Vanilla JS + Vite
- **Local Model Runtime:** Ollama (HTTP API, easy setup)
- **Language Support:** Go only (v1)
- **Hosting:** Static site (Cloudflare Pages / Netlify)

## Phase 1: Monaco Editor Baseline

A clean, fast Go editor with all native suggestions disabled.

**Setup:**
```bash
npm create vite@latest syntaxaid -- --template vanilla
cd syntaxaid
npm install monaco-editor
npm run dev
```

**Configured defaults:**
- Font: JetBrains Mono, 14px
- Go syntax highlighting enabled
- Tabs (Go convention), line numbers on, minimap off
- No quick suggestions, no word-based suggestions, no snippets, no hover, no context menu
- Dark theme default

## Phase 2: Ollama Connection Layer

`ollama.js` provides settings persistence and health check.

**Features:**
- Pings `http://localhost:11434/api/tags` on load
- Detects 3 states: Ollama ready, model missing, Ollama not running
- Colour-coded status bar with copyable fix commands
- Persisted host/model via `localStorage`

**Files:**
- `ollama.js` — `loadSettings()`, `saveSettings()`, `checkStatus()`
- `index.html` — status bar + settings panel markup
- `style.css` — status bar + panel styles
- `main.js` — wires health check, retry, settings UI


