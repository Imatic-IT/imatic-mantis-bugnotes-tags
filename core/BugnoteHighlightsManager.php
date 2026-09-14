<?php
/**
 * Handles every JSON action posted from the bugnote UI: highlight/unhighlight,
 * emoji reactions, per-note collapse, fold-all and the "hide unsaved" group
 * fold mode.
 *
 * Split out of pages/manageBugnoteHighlights.php so it can be instantiated
 * directly from tests (see tests/ImaticBugnotesTagsIntegrationCase.php)
 * without going through the HTTP entry point.
 */
class BugnoteHighlightsManager
{
    private array $data;
    private $responseData;
    private $plugin;
    private $bugnote;
    private array $actions;
    private array $actionHandlers;

    public function __construct(array $data)
    {
        $this->data    = $data;
        $this->plugin  = plugin_get('ImaticBugnotesTags');
        $this->actions = $this->plugin->getActions();
        $this->bugnote = $this->getBugnote();

        $this->actionHandlers = [
            $this->plugin::HIGHLIGHT      => 'highlight',
            $this->plugin::UNHIGHLIGHT    => 'unhighlight',
            $this->plugin::GET_HIGHLIGHTS => 'getHighlights',
            $this->plugin::REACTION       => 'addReaction',
            $this->plugin::UNSAVE_REACTION => 'deleteReaction',
            $this->plugin::GET_REACTIONS  => 'getAllReactionsByBugId',
            $this->plugin::COLLAPSE       => 'collapse',
            $this->plugin::UNCOLLAPSE     => 'uncollapse',
            $this->plugin::GET_COLLAPSED  => 'getCollapsed',
            $this->plugin::SET_FOLD_MODE  => 'setFoldMode',
            $this->plugin::GET_FOLD_MODE  => 'getFoldMode',
            $this->plugin::COLLAPSE_ALL   => 'collapseAll',
            $this->plugin::UNCOLLAPSE_ALL => 'uncollapseAll',
        ];

        $this->handleAction();
    }

    private function handleAction(): void
    {
        $action = $this->data['action'];

        if (!array_key_exists($action, $this->actions)) {
            $this->responseData = ['status' => 'error', 'message' => 'Invalid action'];
            return;
        }

        if (!$this->isCsrfTokenValid()) {
            http_response_code(403);
            $this->responseData = ['status' => 'error', 'message' => 'Invalid or missing CSRF token'];
            return;
        }

        if (!$this->currentUserCanAccessBug()) {
            http_response_code(403);
            $this->responseData = ['status' => 'error', 'message' => 'Access denied'];
            return;
        }

        $handlerMethod = $this->actionHandlers[$action];
        $this->$handlerMethod();
    }

    private function isCsrfTokenValid(): bool
    {
        $_POST[ImaticBugnotesTagsPlugin::CSRF_FORM_NAME . '_token'] = $this->data['csrfToken'] ?? '';
        return form_security_validate(ImaticBugnotesTagsPlugin::CSRF_FORM_NAME);
    }

    private function currentUserCanAccessBug(): bool
    {
        if (!isset($this->data['bugId'])) {
            return true;
        }

        $bugId = (int)$this->data['bugId'];
        return bug_exists($bugId) && access_has_bug_level(VIEWER, $bugId, $this->getUserId());
    }

    private function getBug()
    {
        if (isset($this->data['bugId'])) {
            return (array)bug_get($this->data['bugId']);
        }
    }

    private function getBugnote(): array
    {
        if (isset($this->data['bugnoteId'])) {
            $bugnoteId = ltrim($this->data['bugnoteId'], 'c');
            return (array)bugnote_get($bugnoteId);
        }
        return [];
    }

    private function getUserId(): int
    {
        return auth_get_current_user_id();
    }

    // --- Highlights ---

    private function highlight(): void
    {
        $userId    = $this->getUserId();
        $bugId     = $this->data['bugId'];
        $bugnoteId = $this->bugnote['id'];

        if ($this->highlightExists($bugnoteId, $userId)) {
            $this->responseData = ['status' => 'error', 'message' => 'Bugnote already highlighted'];
            return;
        }

        $query = 'INSERT INTO ' . db_get_table('imatic_bugnote_highlights')
               . ' (bug_id, bugnote_id, user_id, created_at) VALUES ('
               . db_param() . ', ' . db_param() . ', ' . db_param() . ', ' . db_param() . ')';
        db_query($query, [$bugId, $bugnoteId, $userId, time()]);

        $this->responseData = ['status' => 'success', 'message' => 'Bugnote highlighted'];
    }

    private function unhighlight(): void
    {
        $userId    = $this->getUserId();
        $bugnoteId = $this->bugnote['id'];

        $query = 'DELETE FROM ' . db_get_table('imatic_bugnote_highlights')
               . ' WHERE bugnote_id = ' . db_param()
               . ' AND user_id = '      . db_param();
        db_query($query, [$bugnoteId, $userId]);

        $this->responseData = ['status' => 'success', 'message' => 'Bugnote unhighlighted'];
    }

    private function getHighlights(): void
    {
        $userId = $this->getUserId();

        $query       = 'SELECT bugnote_id FROM ' . db_get_table('imatic_bugnote_highlights')
                     . ' WHERE user_id = ' . db_param();
        $queryResult = db_query($query, [$userId]);

        $highlights = [];
        while ($row = db_fetch_array($queryResult)) {
            $highlights[] = 'c' . $row['bugnote_id'];
        }
        $this->responseData = $highlights;
    }

    private function highlightExists(int $bugnoteId, int $userId): bool
    {
        $query       = 'SELECT id FROM ' . db_get_table('imatic_bugnote_highlights')
                     . ' WHERE bugnote_id = ' . db_param()
                     . ' AND user_id = '      . db_param();
        $queryResult = db_query($query, [$bugnoteId, $userId]);
        return db_num_rows($queryResult) > 0;
    }

    // --- Reactions ---

    private function addReaction(): void
    {
        $userId    = $this->getUserId();
        $username  = user_get_username($userId);
        $bugId     = $this->data['bugId'];
        $bugnoteId = $this->bugnote['id'];

        if ($id = $this->reactionExists($bugnoteId, $userId, $this->data['emoji'])) {
            $this->deleteReactionById($id);
            $this->responseData = [
                'status'   => 'success',
                'message'  => 'Reaction unsaved',
                'action'   => 'delete',
                'username' => $username,
            ];
            return;
        }

        $query = 'INSERT INTO ' . db_get_table('imatic_bugnote_reactions')
               . ' (bug_id, bugnote_id, user_id, emoji, username, created_at) VALUES ('
               . db_param() . ', ' . db_param() . ', ' . db_param() . ', '
               . db_param() . ', ' . db_param() . ', ' . db_param() . ')';
        db_query($query, [$bugId, $bugnoteId, $userId, $this->data['emoji'], $username, time()]);

        $this->responseData = [
            'status'   => 'success',
            'message'  => 'Reaction saved',
            'action'   => 'save',
            'username' => $username,
        ];
    }

    private function reactionExists(int $bugnoteId, int $userId, string $emoji)
    {
        $query       = 'SELECT id FROM ' . db_get_table('imatic_bugnote_reactions')
                     . ' WHERE bugnote_id = ' . db_param()
                     . ' AND user_id = '      . db_param()
                     . ' AND emoji = '        . db_param();
        $queryResult = db_query($query, [$bugnoteId, $userId, $emoji]);

        if (db_num_rows($queryResult) === 0) {
            return false;
        }
        return db_fetch_array($queryResult)['id'];
    }

    private function deleteReaction(): void
    {
        $userId    = $this->getUserId();
        $bugnoteId = $this->bugnote['id'];
        $emoji     = $this->data['emoji'];

        $id = $this->reactionExists($bugnoteId, $userId, $emoji);
        if (!$id) {
            $this->responseData = ['status' => 'error', 'message' => 'Reaction not found'];
            return;
        }

        $this->deleteReactionById($id);
    }

    private function deleteReactionById(int $reactionId): void
    {
        $query = 'DELETE FROM ' . db_get_table('imatic_bugnote_reactions')
               . ' WHERE id = ' . db_param();
        db_query($query, [$reactionId]);

        $this->responseData = ['status' => 'success', 'message' => 'Reaction unsaved'];
    }

    public function getAllReactionsByBugId(): void
    {
        $bugId = $this->data['bugId'];

        $query       = 'SELECT * FROM ' . db_get_table('imatic_bugnote_reactions')
                     . ' WHERE bug_id = ' . db_param();
        $queryResult = db_query($query, [$bugId]);

        $reactions = [];
        while ($row = db_fetch_array($queryResult)) {
            $reactions[] = $row;
        }
        $this->responseData = $reactions;
    }

    // --- Collapse ---

    private function collapse(): void
    {
        $userId    = $this->getUserId();
        $bugId     = $this->data['bugId'];
        $bugnoteId = $this->bugnote['id'];

        if ($this->collapseExists($bugnoteId, $userId)) {
            $this->responseData = ['status' => 'success', 'message' => 'Already collapsed'];
            return;
        }

        $query = 'INSERT INTO ' . db_get_table('imatic_bugnote_collapse')
               . ' (bug_id, bugnote_id, user_id, created_at) VALUES ('
               . db_param() . ', ' . db_param() . ', ' . db_param() . ', ' . db_param() . ')';
        db_query($query, [$bugId, $bugnoteId, $userId, time()]);

        $this->responseData = ['status' => 'success', 'message' => 'Bugnote collapsed'];
    }

    private function uncollapse(): void
    {
        $userId    = $this->getUserId();
        $bugnoteId = $this->bugnote['id'];

        $query = 'DELETE FROM ' . db_get_table('imatic_bugnote_collapse')
               . ' WHERE bugnote_id = ' . db_param()
               . ' AND user_id = '      . db_param();
        db_query($query, [$bugnoteId, $userId]);

        $this->responseData = ['status' => 'success', 'message' => 'Bugnote uncollapsed'];
    }

    private function collapseExists(int $bugnoteId, int $userId): bool
    {
        $query       = 'SELECT id FROM ' . db_get_table('imatic_bugnote_collapse')
                     . ' WHERE bugnote_id = ' . db_param()
                     . ' AND user_id = '      . db_param();
        $queryResult = db_query($query, [$bugnoteId, $userId]);
        return db_num_rows($queryResult) > 0;
    }

    private function getCollapsed(): void
    {
        $userId = $this->getUserId();
        $bugId  = $this->data['bugId'];

        $query       = 'SELECT bugnote_id FROM ' . db_get_table('imatic_bugnote_collapse')
                     . ' WHERE bug_id = '  . db_param()
                     . ' AND user_id = '   . db_param();
        $queryResult = db_query($query, [$bugId, $userId]);

        $collapsed = [];
        while ($row = db_fetch_array($queryResult)) {
            $collapsed[] = 'c' . $row['bugnote_id'];
        }
        $this->responseData = $collapsed;
    }

    /**
     * Collapse every bugnote that currently exists on the bug (snapshot).
     * Notes added later are NOT collapsed — that is the point of this action:
     * it simulates "mark everything up to now as read".
     */
    private function collapseAll(): void
    {
        $userId = $this->getUserId();
        $bugId  = (int)$this->data['bugId'];

        $t_collapse = db_get_table('imatic_bugnote_collapse');

        $query       = 'SELECT id FROM ' . db_get_table('bugnote')
                     . ' WHERE bug_id = ' . db_param();
        $queryResult = db_query($query, [$bugId]);

        $collapsed = [];
        while ($row = db_fetch_array($queryResult)) {
            $bugnoteId = (int)$row['id'];
            $collapsed[] = 'c' . $bugnoteId;

            if ($this->collapseExists($bugnoteId, $userId)) {
                continue;
            }

            db_query(
                'INSERT INTO ' . $t_collapse . ' (bug_id, bugnote_id, user_id, created_at) VALUES ('
                . db_param() . ', ' . db_param() . ', ' . db_param() . ', ' . db_param() . ')',
                [$bugId, $bugnoteId, $userId, time()]
            );
        }

        $this->responseData = ['status' => 'success', 'collapsed' => $collapsed];
    }

    private function uncollapseAll(): void
    {
        $userId = $this->getUserId();
        $bugId  = (int)$this->data['bugId'];

        $query = 'DELETE FROM ' . db_get_table('imatic_bugnote_collapse')
               . ' WHERE bug_id = ' . db_param()
               . ' AND user_id = '  . db_param();
        db_query($query, [$bugId, $userId]);

        $this->responseData = ['status' => 'success', 'collapsed' => []];
    }

    // --- Fold mode ---

    private function setFoldMode(): void
    {
        $userId  = $this->getUserId();
        $bugId   = $this->data['bugId'];
        $enabled = !empty($this->data['enabled']);

        if ($enabled) {
            if (!$this->foldModeExists($bugId, $userId)) {
                $query = 'INSERT INTO ' . db_get_table('imatic_bugnote_fold_mode')
                       . ' (bug_id, user_id, created_at) VALUES ('
                       . db_param() . ', ' . db_param() . ', ' . db_param() . ')';
                db_query($query, [$bugId, $userId, time()]);
            }
        } else {
            $query = 'DELETE FROM ' . db_get_table('imatic_bugnote_fold_mode')
                   . ' WHERE bug_id = '  . db_param()
                   . ' AND user_id = '   . db_param();
            db_query($query, [$bugId, $userId]);
        }

        $this->responseData = ['status' => 'success', 'enabled' => $enabled];
    }

    private function foldModeExists(int $bugId, int $userId): bool
    {
        $query       = 'SELECT id FROM ' . db_get_table('imatic_bugnote_fold_mode')
                     . ' WHERE bug_id = '  . db_param()
                     . ' AND user_id = '   . db_param();
        $queryResult = db_query($query, [$bugId, $userId]);
        return db_num_rows($queryResult) > 0;
    }

    private function getFoldMode(): void
    {
        $userId = $this->getUserId();
        $bugId  = $this->data['bugId'];

        $query       = 'SELECT id FROM ' . db_get_table('imatic_bugnote_fold_mode')
                     . ' WHERE bug_id = '  . db_param()
                     . ' AND user_id = '   . db_param();
        $queryResult = db_query($query, [$bugId, $userId]);

        $this->responseData = ['enabled' => db_num_rows($queryResult) > 0];
    }

    public function sendJsonResponse(): void
    {
        header('Content-Type: application/json');
        echo json_encode($this->responseData);
    }

    /**
     * Read the result of the action without going through the HTTP response
     * (header() calls fail hard under phpunit's CLI SAPI). Used by tests only.
     */
    public function getResponseData()
    {
        return $this->responseData;
    }
}
