<?php

class ImaticBugnotesTagsPlugin extends MantisPlugin
{
    const HIGHLIGHT      = 'highlight';
    const UNHIGHLIGHT    = 'unhighlight';
    const GET_HIGHLIGHTS = 'get_highlights';
    const REACTION       = 'reaction';
    const GET_REACTIONS  = 'get_reactions';
    const UNSAVE_REACTION = 'unsave_reaction';

    const COLLAPSE      = 'collapse';
    const UNCOLLAPSE    = 'uncollapse';
    const GET_COLLAPSED = 'get_collapsed';
    const SET_FOLD_MODE = 'set_fold_mode';
    const GET_FOLD_MODE = 'get_fold_mode';

    const EMOJIBASE_CDN = 'https://cdn.jsdelivr.net/npm/emojibase-data@latest';
    const CSRF_FORM_NAME = 'imatic_bugnote_highlights';

    public function register(): void
    {
        $this->name = 'Imatic Bugnote Tools';
        $this->description = 'Per-user bugnote interactions: save, collapse, emoji reactions, saved-notes page.';
        $this->version = '1.0.3';
        $this->requires = [
            'MantisCore' => '2.0.0',
        ];
        $this->author = 'Imatic Software s.r.o.';
        $this->contact = 'info@imatic.cz';
        $this->url = 'https://www.imatic.cz/';
    }

    public function config(): array
    {
        return [
            'saveNote' => [
                'enabled' => true,
                'fontAwesomeIcon' => true,
                'saved' => 'fa-bookmark',
                'unsaved' => 'fa-bookmark-o',
            ],
            'highlighted' => [
                'thickness' => '2px',
                'color' => '#ff0000',
                'border-type' => 'solid',
            ]
        ];
    }

    public function schema(): array
    {
        return [
            // index 0: legacy table — DO NOT modify; Mantis tracks applied upgrade indices
            0 => ['CreateTableSQL', [db_get_table('imatic_bugnote_tags'), "
            id          I               PRIMARY NOTNULL AUTOINCREMENT,
            bug_id      I               PRIMARY NOTNULL,
            bugnote_id  I               PRIMARY NOTNULL,
            user_id     I               NOTNULL,
            type        C(20)           NOTNULL,
            emoji       C(50),
            created_at  I               NOTNULL DEFAULT '" . db_now() . "',
            updated_at  I               NOTNULL DEFAULT '" . db_now() . "',
            username    C(100)
        "]],

            // 3a: per-concept tables
            1 => ['CreateTableSQL', [db_get_table('imatic_bugnote_highlights'), "
            id          I       NOTNULL AUTOINCREMENT PRIMARY,
            bug_id      I       NOTNULL,
            bugnote_id  I       NOTNULL,
            user_id     I       NOTNULL,
            created_at  I       NOTNULL DEFAULT '" . db_now() . "'
        "]],
            2 => ['CreateIndexSQL', ['idx_highlights_bnote_user', db_get_table('imatic_bugnote_highlights'), 'bugnote_id,user_id', ['UNIQUE']]],

            3 => ['CreateTableSQL', [db_get_table('imatic_bugnote_reactions'), "
            id          I       NOTNULL AUTOINCREMENT PRIMARY,
            bug_id      I       NOTNULL,
            bugnote_id  I       NOTNULL,
            user_id     I       NOTNULL,
            emoji       C(50)   NOTNULL,
            username    C(100)  NOTNULL,
            created_at  I       NOTNULL DEFAULT '" . db_now() . "'
        "]],
            4 => ['CreateIndexSQL', ['idx_reactions_bnote_user_emoji', db_get_table('imatic_bugnote_reactions'), 'bugnote_id,user_id,emoji', ['UNIQUE']]],

            5 => ['CreateTableSQL', [db_get_table('imatic_bugnote_collapse'), "
            id          I       NOTNULL AUTOINCREMENT PRIMARY,
            bug_id      I       NOTNULL,
            bugnote_id  I       NOTNULL,
            user_id     I       NOTNULL,
            created_at  I       NOTNULL DEFAULT '" . db_now() . "'
        "]],
            6 => ['CreateIndexSQL', ['idx_collapse_bnote_user', db_get_table('imatic_bugnote_collapse'), 'bugnote_id,user_id', ['UNIQUE']]],

            7 => ['CreateTableSQL', [db_get_table('imatic_bugnote_fold_mode'), "
            id          I       NOTNULL AUTOINCREMENT PRIMARY,
            bug_id      I       NOTNULL,
            user_id     I       NOTNULL,
            created_at  I       NOTNULL DEFAULT '" . db_now() . "'
        "]],
            8 => ['CreateIndexSQL', ['idx_fold_mode_bug_user', db_get_table('imatic_bugnote_fold_mode'), 'bug_id,user_id', ['UNIQUE']]],

            // 3b: migrate data from legacy table + rename it.
            //     UpdateFunction calls install_{name}() — safe PHP wrappers that skip
            //     gracefully when the source table doesn't exist.
            9  => ['UpdateFunction', 'imatic_bugnotes_migrate_highlights'],
            10 => ['UpdateFunction', 'imatic_bugnotes_migrate_reactions'],
            11 => ['UpdateFunction', 'imatic_bugnotes_rename_tags'],

            // 3c: re-run migration using cross-database SQL (blocks 9-11 used MySQL-only
            //     syntax that silently failed on PostgreSQL — INSERT IGNORE, RENAME TABLE,
            //     and DATABASE() are not valid PostgreSQL).  These blocks are safe no-ops
            //     on installations where blocks 9-11 already succeeded (source table gone).
            12 => ['UpdateFunction', 'imatic_bugnotes_migrate_highlights_v2'],
            13 => ['UpdateFunction', 'imatic_bugnotes_migrate_reactions_v2'],
            14 => ['UpdateFunction', 'imatic_bugnotes_rename_tags_v2'],
        ];
    }

    public function hooks(): array
    {
        return [
            'EVENT_LAYOUT_RESOURCES' => ['addHighlightStylesHook', 'layout_resources_hook'],
            'EVENT_LAYOUT_BODY_END' => 'layout_body_end_hook',
            'EVENT_VIEW_BUG_DETAILS' => 'bug_view_details',
            'EVENT_MENU_FILTER' => 'menu_filter',
        ];
    }


    function bug_view_details()
    {
        if (isset($_GET['id'])) {
            $issue_id = $_GET['id'];
            echo '<a id="savedBugnotesLinkButton" class="btn btn-primary btn-white btn-round btn-sm" href="' . plugin_page('savedBugnotes') . '&id=' . $issue_id . '"> '. plugin_lang_get('saved_notes') .' </a>';
        }
    }

    function menu_filter()
    {
        $t_menu_options = [];
        $t_menu_options[] = '<a href="' . plugin_page('savedBugnotes') . '" class="btn btn-primary btn-white btn-round btn-sm">
            <i class="fa fa-bookmark"></i>  . ' . plugin_lang_get('saved_notes') . '
</a>';
        return $t_menu_options;

    }

    public function layout_resources_hook()
    {
        if (!$this->shouldInjectHighlightingAssets()) {
            return;
        }

        echo '<link rel="stylesheet" type="text/css" href="' . plugin_file('style.css') . '&v=' . $this->version . '" />';
    }

    public function layout_body_end_hook($p_event)
    {
        if (!$this->shouldInjectHighlightingAssets()) {
            return;
        }

        $t_data = htmlspecialchars(json_encode([
            'url'       => plugin_page('manageBugnoteHighlights'),
            'actions'   => $this->getActions(),
            'bugId'     => $_GET['id'] ?? null,
            'csrfToken' => form_security_token(self::CSRF_FORM_NAME),
            'lang'    => [
                'fold_unsaved'   => plugin_lang_get('fold_unsaved'),
                'show_all'       => plugin_lang_get('show_all'),
                'n_notes_hidden' => plugin_lang_get('n_notes_hidden'),
            ],
        ]));

        echo '<script id="imaticNoteHighlighting" data-data="' . $t_data . '" src="' . plugin_file('bundle.js') . '&v=' . $this->version . '" defer></script>';
    }

    private function shouldInjectHighlightingAssets(): bool
    {
        return isset($_GET['id']) || (isset($_GET['page']) && $_GET['page'] === 'ImaticBugnotesTags/savedBugnotes');
    }


    public function getActions(): array
    {
        return [
            self::HIGHLIGHT      => self::HIGHLIGHT,
            self::UNHIGHLIGHT    => self::UNHIGHLIGHT,
            self::GET_HIGHLIGHTS => self::GET_HIGHLIGHTS,
            self::REACTION       => self::REACTION,
            self::UNSAVE_REACTION => self::UNSAVE_REACTION,
            self::GET_REACTIONS  => self::GET_REACTIONS,
            self::COLLAPSE       => self::COLLAPSE,
            self::UNCOLLAPSE     => self::UNCOLLAPSE,
            self::GET_COLLAPSED  => self::GET_COLLAPSED,
            self::SET_FOLD_MODE  => self::SET_FOLD_MODE,
            self::GET_FOLD_MODE  => self::GET_FOLD_MODE,
        ];
    }

    public function addHighlightStylesHook($p_event): void
    {
        $this->addHighlightStyles();
    }
    private function addHighlightStyles(): void
    {
        echo '
    <style>
        .highlighted {
            border: ' . plugin_config_get('highlighted')['border-type'] . ' ' . plugin_config_get('highlighted')['thickness'] . ' ' . plugin_config_get('highlighted')['color'] . ';
        }
        .table.table-bordered.table-condensed.table-striped:first-child {
            margin-top: ' . plugin_config_get('highlighted')['thickness'] . ';
        }
    </style>
    ';
    }
}

// ---------------------------------------------------------------------------
// Schema migration helpers — called by UpdateFunction blocks in schema().
// Each function returns 2 (ADOdb "all OK") or 0 (failure).
// All three skip gracefully when the source table no longer exists so that
// re-running the upgrade on a partially-migrated DB is safe.
// ---------------------------------------------------------------------------

function install_imatic_bugnotes_migrate_highlights(): int {
    global $g_db;
    $t_src = db_get_table('imatic_bugnote_tags');
    $t_dst = db_get_table('imatic_bugnote_highlights');

    $t_tables = array_map('strtolower', (array)$g_db->MetaTables());
    if (!in_array(strtolower($t_src), $t_tables)) {
        return 2;
    }

    db_query(
        "INSERT INTO $t_dst (bug_id, bugnote_id, user_id, created_at)"
        . " SELECT s.bug_id, s.bugnote_id, s.user_id, s.created_at"
        . " FROM $t_src s WHERE s.type = 'highlight'"
        . " AND NOT EXISTS (SELECT 1 FROM $t_dst d WHERE d.bugnote_id = s.bugnote_id AND d.user_id = s.user_id)"
    );
    return 2;
}

function install_imatic_bugnotes_migrate_reactions(): int {
    global $g_db;
    $t_src = db_get_table('imatic_bugnote_tags');
    $t_dst = db_get_table('imatic_bugnote_reactions');

    $t_tables = array_map('strtolower', (array)$g_db->MetaTables());
    if (!in_array(strtolower($t_src), $t_tables)) {
        return 2;
    }

    db_query(
        "INSERT INTO $t_dst (bug_id, bugnote_id, user_id, emoji, username, created_at)"
        . " SELECT s.bug_id, s.bugnote_id, s.user_id, COALESCE(s.emoji, ''), COALESCE(s.username, ''), s.created_at"
        . " FROM $t_src s WHERE s.type = 'reaction'"
        . " AND NOT EXISTS (SELECT 1 FROM $t_dst d WHERE d.bugnote_id = s.bugnote_id AND d.user_id = s.user_id AND d.emoji = s.emoji)"
    );
    return 2;
}

function install_imatic_bugnotes_rename_tags(): int {
    global $g_db;
    $t_src = db_get_table('imatic_bugnote_tags');
    $t_dst = db_get_table('imatic_bugnote_tags_legacy');

    $t_tables = array_map('strtolower', (array)$g_db->MetaTables());
    if (!in_array(strtolower($t_src), $t_tables)) {
        return 2;
    }
    if (in_array(strtolower($t_dst), $t_tables)) {
        return 2;
    }

    db_query("ALTER TABLE $t_src RENAME TO $t_dst");
    return 2;
}

function install_imatic_bugnotes_migrate_highlights_v2(): int {
    global $g_db;
    $t_src = db_get_table('imatic_bugnote_tags');
    $t_dst = db_get_table('imatic_bugnote_highlights');

    $t_tables = array_map('strtolower', (array)$g_db->MetaTables());
    if (!in_array(strtolower($t_src), $t_tables)) {
        return 2;
    }

    db_query(
        "INSERT INTO $t_dst (bug_id, bugnote_id, user_id, created_at)"
        . " SELECT s.bug_id, s.bugnote_id, s.user_id, s.created_at"
        . " FROM $t_src s WHERE s.type = 'highlight'"
        . " AND NOT EXISTS (SELECT 1 FROM $t_dst d WHERE d.bugnote_id = s.bugnote_id AND d.user_id = s.user_id)"
    );
    return 2;
}

function install_imatic_bugnotes_migrate_reactions_v2(): int {
    global $g_db;
    $t_src = db_get_table('imatic_bugnote_tags');
    $t_dst = db_get_table('imatic_bugnote_reactions');

    $t_tables = array_map('strtolower', (array)$g_db->MetaTables());
    if (!in_array(strtolower($t_src), $t_tables)) {
        return 2;
    }

    db_query(
        "INSERT INTO $t_dst (bug_id, bugnote_id, user_id, emoji, username, created_at)"
        . " SELECT s.bug_id, s.bugnote_id, s.user_id, COALESCE(s.emoji, ''), COALESCE(s.username, ''), s.created_at"
        . " FROM $t_src s WHERE s.type = 'reaction'"
        . " AND NOT EXISTS (SELECT 1 FROM $t_dst d WHERE d.bugnote_id = s.bugnote_id AND d.user_id = s.user_id AND d.emoji = s.emoji)"
    );
    return 2;
}

function install_imatic_bugnotes_rename_tags_v2(): int {
    global $g_db;
    $t_src = db_get_table('imatic_bugnote_tags');
    $t_dst = db_get_table('imatic_bugnote_tags_legacy');

    $t_tables = array_map('strtolower', (array)$g_db->MetaTables());
    if (!in_array(strtolower($t_src), $t_tables)) {
        return 2;
    }
    if (in_array(strtolower($t_dst), $t_tables)) {
        return 2;
    }

    db_query("ALTER TABLE $t_src RENAME TO $t_dst");
    return 2;
}