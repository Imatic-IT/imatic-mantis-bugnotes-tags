# Imatic Bugnote Tools

Plugin provides per-user bugnote interactions for MantisBT.

## Features

- **Per-user save (highlight)** — bookmark any bugnote; it gets a coloured border visible only to you.
- **Per-user per-note collapse** — fold individual bugnotes into a one-line summary bar (author · date · preview); state persisted server-side.
- **"Hide unsaved" group toggle** — one button hides every non-highlighted note into a placeholder row; clicking the placeholder expands just that run inline. State persisted per user per bug.
- **Emoji reactions** — attach emoji reactions to any bugnote; per-note reaction counts with tooltips showing who reacted.
- **Saved-notes page** — dedicated page listing all your saved bugnotes, filtered by current project by default, with a project switcher at the top and notes grouped by bug.

## Installation

Upload the folder into `plugins/` in your Mantis installation so that you have `plugins/ImaticBugnotesTags/ImaticBugnotesTags.php`. Then install it via `manage_plugin_page.php`.

## Core patch (recommended)

This plugin loads its CSS in `EVENT_LAYOUT_RESOURCES` (inside `<head>`) to avoid a flash of unstyled content when the page loads.

This requires the patch `imatic-update/dark_theme_head_begin_event.patch` to be applied to Mantis core — specifically the `EVENT_LAYOUT_HEAD_BEGIN` event added to `core/events_inc.php` and `core/layout_api.php`.

**Without the patch**, change the hook in `ImaticBugnotesTags.php` from:

```php
'EVENT_LAYOUT_RESOURCES' => ['addHighlightStylesHook', 'layout_resources_hook'],
```

to:

```php
'EVENT_LAYOUT_RESOURCES' => 'addHighlightStylesHook',
'EVENT_LAYOUT_BODY_END' => 'layout_body_end_hook',
```

and move the `<link>` stylesheet back into `layout_body_end_hook`. The plugin will work but styles will load after page render (visible jump/flash).
