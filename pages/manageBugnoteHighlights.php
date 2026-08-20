<?php
header('Content-Type: application/json');

require_api('authentication_api.php');
auth_ensure_user_authenticated();

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
        ];

        $this->handleAction();
    }

    private function handleAction(): void
    {
        $action = $this->data['action'];

        if (!array_key_exists($action, $this->actions)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
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
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data    = json_decode(file_get_contents('php://input'), true);
    $manager = new BugnoteHighlightsManager($data);
    $manager->sendJsonResponse();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed']);
}
?>
