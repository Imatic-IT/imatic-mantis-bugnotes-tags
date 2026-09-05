# Imatic Bugnote Tools

Plugin provides per-user bugnote interactions for MantisBT.

## Features

- **Per-user save (highlight)** — bookmark any bugnote; it gets a coloured border visible only to you.
- **Per-user per-note collapse** — fold individual bugnotes into a one-line summary bar (author · date · preview); state persisted server-side.
- **"Fold all" button** — collapses every note that exists on the issue right now (a snapshot). Notes added later stay expanded, so it works as "mark everything up to now as read". Highlighted notes fold too but keep their coloured border. Clicking again unfolds all.
- **"Hide unsaved" group toggle** — one button hides every non-highlighted note into a placeholder row; clicking the placeholder expands just that run inline. State persisted per user per bug.
- **Emoji reactions** — attach emoji reactions to any bugnote; per-note reaction counts with tooltips showing who reacted.
- **Saved-notes page** — dedicated page listing all your saved bugnotes, filtered by current project by default, with a project switcher at the top and notes grouped by bug.

## Installation

Upload the folder into `plugins/` in your Mantis installation so that you have `plugins/ImaticBugnotesTags/ImaticBugnotesTags.php`. Then install it via `manage_plugin_page.php`.

## Styling

This plugin loads its CSS via `EVENT_LAYOUT_RESOURCES` and `EVENT_LAYOUT_BODY_END` — no core patch is required.
