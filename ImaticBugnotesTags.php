<?php

class ImaticBugnotesTagsPlugin extends MantisPlugin
{
    const HIGHLIGHT = 'highlight';
    const UNHIGHLIGHT = 'unhighlight';
    const GET_HIGHLIGHTS = 'get_highlights';
    const REACTION = 'reaction';
    const GET_REACTIONS = 'get_reactions';
    const UNSAVE_REACTION = 'unsave_reaction';

    const EMOJIBASE_CDN = 'https://cdn.jsdelivr.net/npm/emojibase-data@latest';

    public function register(): void
    {
        $this->name = 'Imatic Bugnote tags';
        $this->description = 'This plugin provides highlighting of notes and reaction on notes in MantisBT.';
        $this->version = '0.0.1';
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
            0 => ['CreateTableSQL', [db_get_table('imatic_bugnote_tags'), "
            id                          I               PRIMARY NOTNULL AUTOINCREMENT,
            bug_id                    I               PRIMARY NOTNULL,
            bugnote_id                    I             PRIMARY NOTNULL,
            user_id                     I               NOTNULL,
            type                    C(20)              NOTNULL,
            emoji           C(50)              ,
	        created_at	        		I	           NOTNULL  DEFAULT '" . db_now() . "',
	        updated_at			        I	           NOTNULL  DEFAULT '" . db_now() . "',
            username           C(100)              
        "]]
        ];
    }

    public function hooks(): array
    {
        return [
            'EVENT_LAYOUT_BODY_END' => 'layout_body_end_hook',
            'EVENT_VIEW_BUG_DETAILS' => 'bug_view_details',
            'EVENT_MENU_FILTER' => 'menu_filter',
            'EVENT_CORE_HEADERS' => 'csp_headers',
        ];
    }

    function csp_headers() {
        if( config_get_global( 'cdn_enabled' ) == ON ) {
            http_csp_add( 'script-src', self::EMOJIBASE_CDN );
            http_csp_add('script-src', 'https://cdn.jsdelivr.net');
            http_csp_add('connect-src', 'https://cdn.jsdelivr.net');
        }
    }

    function bug_view_details()
    {
        if (isset($_GET['id'])) {
            $issue_id = $_GET['id'];
            $issue = bug_get_row($issue_id);
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

    public function layout_body_end_hook($p_event)
    {
        if (!isset($_GET['id'])) {
            return;
        }
        $t_data = htmlspecialchars(json_encode([
            'url' => plugin_page('manageBugnoteHighlights'),
            'actions' => $this->getActions(),
            'bugId' => $_GET['id'],
        ]));

        echo '<script id="imaticNoteHighlighting" data-data="' . $t_data . '" src="' . plugin_file('bundle.js') . '&v=' . $this->version . '" defer></script>;
            <link rel="stylesheet" type="text/css" href="' . plugin_file('style.css') . '&v=' . $this->version . '" />';

        echo '
        <style>
            .highlighted {
                border: ' . plugin_config_get('highlighted')['border-type'] . ' ' . plugin_config_get('highlighted')['thickness'] . ' ' . plugin_config_get('highlighted')['color'] . ';             
            }
            .table.table-bordered.table-condensed.table-striped:first-child {
                margin-top: ' . plugin_config_get('highlighted')['thickness'] . ';
            }
        ';
    }

    public function getActions(): array
    {
        return [
            self::HIGHLIGHT => self::HIGHLIGHT,
            self::UNHIGHLIGHT => self::UNHIGHLIGHT,
            self::GET_HIGHLIGHTS => self::GET_HIGHLIGHTS,
            self::REACTION => self::REACTION,
            self::UNSAVE_REACTION => self::UNSAVE_REACTION,
            self::GET_REACTIONS => self::GET_REACTIONS
        ];
    }
}