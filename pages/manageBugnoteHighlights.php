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

    public function __construct(array $data)
    {
        $this->data = $data;
        $this->plugin = plugin_get('ImaticBugnotesTags');
        $this->actions = $this->plugin->getActions();
        $this->bugnote = $this->getBugnote();


        $this->actionHandlers = [
            $this->plugin::HIGHLIGHT => 'highlight',
            $this->plugin::UNHIGHLIGHT => 'unhighlight',
            $this->plugin::GET_HIGHLIGHTS => 'getHighlights',
            $this->plugin::REACTION => 'addReaction',
            $this->plugin::UNSAVE_REACTION => 'deleteReaction',
            $this->plugin::GET_REACTIONS => 'getAllReactionsByBugId',
        ];

        $this->handleAction();
    }
    private function handleAction()
    {
        $action = $this->data['action'];

        if (!array_key_exists($action, $this->actions)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
            return;
        }

        $handlerMethod = $this->actionHandlers[$action];

        $this->$handlerMethod();
    }
    private function getBug()
    {
        if (isset($this->data['bugId'])) {
            $bugId = $this->data['bugId'];
            return (array)bug_get($bugId);
        }
    }

    private function getBugnote(): array
    {
        if (isset($this->data['bugnoteId'])) {
            $bugnoteId = $this->data['bugnoteId'];
            $bugnoteId = ltrim($bugnoteId, 'c');
            return (array)bugnote_get($bugnoteId);
        }
        return [];
    }

    private function getUserId(): int
    {
        return auth_get_current_user_id();
    }

    private function highlight()
    {
        $userId = $this->getUserId();
        $bugId = $this->data['bugId'];
        $bugnoteId = $this->bugnote['id'];

        if ($this->highlightExists($bugnoteId, $userId)) {
            $this->responseData = [
                'status' => 'error',
                'message' => 'Bugnote already highlighted'
            ];
            return;
        }

        $query = 'INSERT INTO ' . db_get_table('imatic_bugnote_tags') . ' (bug_id, bugnote_id, user_id, type) VALUES (' . db_param() . ', ' . db_param() . ', ' . db_param() . ', ' . db_param() . ')';

        $params = [$bugId, $bugnoteId, $userId, $this->plugin::HIGHLIGHT];
        db_query($query, $params);

        $this->responseData = [
            'status' => 'success',
            'message' => 'Bugnote highlighted'
        ];
    }

    private function unhighlight()
    {
        $userId = $this->getUserId();
        $bugnoteId = $this->bugnote['id'];

        $query = 'DELETE FROM ' . db_get_table('imatic_bugnote_tags') . ' WHERE bugnote_id = ' . db_param() . ' AND user_id = ' . db_param();
        $params = [ $bugnoteId, $userId];

        db_query($query, $params);

        $this->responseData = [
            'status' => 'success',
            'message' => 'Bugnote unhighlighted'
        ];
    }

    private function getHighlights(): void
    {
        $userId = $this->getUserId();

        $query = 'SELECT bugnote_id FROM ' . db_get_table('imatic_bugnote_tags') . ' WHERE  user_id = ' . db_param() . ' AND type = ' . db_param();
        $params = [$userId, $this->plugin::HIGHLIGHT];

        $queryResult = db_query($query, $params);

        $highlights = [];
        while ($row = db_fetch_array($queryResult)) {
            array_push($highlights, 'c' . $row['bugnote_id']);
        }
        $this->responseData = $highlights;
    }

    private function highlightExists($bugnoteId, $userId)
    {
        $query = 'SELECT * FROM ' . db_get_table('imatic_bugnote_tags') . ' WHERE bugnote_id = ' . db_param() . ' AND user_id = ' . db_param() . ' AND type = ' . db_param();
        $params = [$bugnoteId, $userId, $this->plugin::HIGHLIGHT];

        $queryResult = db_query($query, $params);

        return db_num_rows($queryResult) > 0;
    }
    private function addReaction()
    {
        $userId = $this->getUserId();
        $username = user_get_username($userId);
        $bugId = $this->data['bugId'];
        $bugnoteId = $this->bugnote['id'];

        if ($id = $this->reactionExists($bugnoteId, $userId, $this->data['emoji'])) {
            $this->deleteReactionById($id);

            $this->responseData = [
                'status' => 'success',
                'message' => 'Reaction unsaved',
                'action' => 'delete',
                'username' => $username
            ];

            return;
        }

        $query = 'INSERT INTO ' . db_get_table('imatic_bugnote_tags') . ' (bug_id, bugnote_id, user_id, type, emoji, username) VALUES (' . db_param() . ', ' . db_param() . ', ' . db_param() . ', ' . db_param() . ', ' . db_param() . ', ' . db_param() . ')';
        $params = [$bugId, $bugnoteId, $userId, $this->plugin::REACTION, $this->data['emoji'], $username];

        db_query($query, $params);

        $this->responseData = [
            'status' => 'success',
            'message' => 'Reaction saved',
            'action' => 'save',
            'username' => $username
        ];
    }

    private function reactionExists($bugnoteId, $userId, $emoji)
    {
        $query = 'SELECT * FROM ' . db_get_table('imatic_bugnote_tags') . ' WHERE bugnote_id = ' . db_param() . ' AND user_id = ' . db_param() . ' AND emoji = ' . db_param();
        $params = [$bugnoteId, $userId, $emoji];

        $queryResult = db_query($query, $params);

        if (db_num_rows($queryResult) === 0) {
            return false;
        }
        $id = db_fetch_array($queryResult)['id'];

        return $id;
    }

    private function deleteReactionById($reactionId)
    {
        $query = 'DELETE FROM ' . db_get_table('imatic_bugnote_tags') . ' WHERE id = ' . db_param();
        $params = [$reactionId];

        db_query($query, $params);

        $this->responseData = [
            'status' => 'success',
            'message' => 'Reaction unsaved'
        ];
    }

    public function getAllReactionsByBugId()
    {


        $bugId = $this->data['bugId'];

        $query = 'SELECT * FROM ' . db_get_table('imatic_bugnote_tags') . ' WHERE bug_id = ' . db_param() . ' AND type = ' . db_param();
        $params = [$bugId, $this->plugin::REACTION];

        $queryResult = db_query($query, $params);

        $reactions = [];
        while ($row = db_fetch_array($queryResult)) {
            array_push($reactions, $row);
        }
        $this->responseData = $reactions;
    }
    public function sendJsonResponse()
    {
        header('Content-Type: application/json');
        echo json_encode($this->responseData);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST'

) {
    $data = json_decode(file_get_contents('php://input'), true);

    $searchedIssue = new BugnoteHighlightsManager($data);
    $searchedIssue->sendJsonResponse();

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed']);
}
?>
