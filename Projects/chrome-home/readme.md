# Custom Chrome Home Documentation

Custom Chrome Home is a Chrome extension that replaces the New Tab page with a productivity dashboard.

## 1. Overview

The extension provides:

- Live clock and date
- Google search with autocomplete suggestions
- Editable quick shortcuts with favicons
- Built-in task manager with persistent state
- Theme, layout, and animated background customization
- Optional terminal-style visual mode

## 2. Project Structure

| Path | Purpose |
|---|---|
| `manifest.json` | Chrome extension manifest (MV3) and New Tab override |
| `newtab.html` | Main page markup and UI structure |
| `style.css` | Styling, layouts, themes, and animation templates |
| `script.js` | App logic (search, shortcuts, tasks, settings, persistence) |
| `asserts/image.png` | Default background image |
| `asserts/icons8-home-48.png` | Extension/New Tab icon |
| `INSTALL.md` | Quick installation guide |

## 3. Installation

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the root project folder (`Chrome Themes`).
5. Open a new tab to verify the custom home page loads.

## 4. Runtime Features

### 4.1 Search

- Submits normal queries to Google.
- Detects URL-like input and navigates directly.
- Fetches suggestions from the Google suggestions endpoint.
- Supports keyboard navigation for suggestions (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).

### 4.2 Shortcuts

- Includes default shortcuts on first load.
- Supports add, edit, and delete actions.
- Displays each site favicon using the Google favicon service.
- Persists to local storage.

### 4.3 Tasks

- Add tasks from the main form or quick-add modal.
- Toggle complete/incomplete state.
- Remove individual tasks.
- Clear completed or clear all tasks.
- Shows a warning modal when opening the page with pending tasks.

### 4.4 Customization

- Theme selection: `ocean`, `emerald`, `sunset`, `mono`
- Command-line aesthetic toggle (`terminal-mode`)
- Page layout options: `centered`, `wide`, `minimal`
- Background templates:
	- `aurora`
	- `prism`
	- `dark-wave`
	- `neon-grid`
	- `sunrise`
	- `midnight`
	- `fluid-flow`
	- `pulse-ring`
	- `spiral-orbit`
	- `bouncing-bg`
	- `custom`
- Custom template controls: primary color, secondary color, glow color, motion speed
- Optional custom background image upload

## 5. Data Persistence

All data is saved in browser local storage.

| Key | Value |
|---|---|
| `customHomeShortcuts` | Array of shortcut objects `{ name, url }` |
| `customHomeTasks` | Array of task objects `{ id, text, done, createdAt }` |
| `customHomeSettings` | Settings object for theme, layout, template, and background |

### Default Settings

- `theme`: `ocean`
- `terminalMode`: `false`
- `layout`: `centered`
- `background`: `asserts/image.png`
- `template`: `aurora`
- `custom`:
	- `primary`: `#4cc9f0`
	- `secondary`: `#3a86ff`
	- `glow`: `#ffffff`
	- `speed`: `8`

## 6. Permissions and External Calls

Declared in `manifest.json`:

- `https://suggestqueries.google.com/*` for search suggestions
- `https://www.google.com/*` for search and favicon/suggestion-related requests

No backend service is used. All state remains local to the browser profile.

## 7. Development Notes

- Manifest version: `3`
- New Tab override entry: `chrome_url_overrides.newtab = newtab.html`
- Main logic initialization sequence:
	1. Load shortcuts
	2. Load tasks
	3. Load settings
	4. Apply settings
	5. Render UI

## 8. Troubleshooting

### Extension does not update after editing

1. Go to `chrome://extensions`.
2. Click reload on the extension card.
3. Open a new tab again.

### Suggestions are not appearing

- Confirm internet connectivity.
- Confirm extension host permissions were not modified.

### Background resets unexpectedly

- Check whether local storage was cleared.
- Reapply settings and verify browser profile persistence settings.

## 9. Version

- Extension version: `1.1.2`
- Last documentation update: April 12, 2026