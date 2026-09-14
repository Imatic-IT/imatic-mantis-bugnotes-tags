# Code improvements

## Critical

### 1. Hardcoded localhost URL (`savedBugnotes.php:122`)
```php
// current
href="http://localhost:8888/view_user_page.php?id=..."

// fix
href="<?php echo helper_mantis_url('view_user_page.php?id=' . $bugnote['reporter_id']); ?>"
```

### 2. `unhighlight()` deletes reactions too (`manageBugnoteHighlights.php:101`)
DELETE query is missing `AND type = 'highlight'` filter — also deletes emoji reactions of the same user on the same bugnote.
```php
// fix
DELETE FROM imatic_bugnote_tags WHERE bugnote_id = ? AND user_id = ? AND type = ?
```

### 3. Missing authorization
Only `auth_ensure_user_authenticated()` is checked. Any authenticated user can read/modify highlights on bugs they don't have access to. Each action should verify the user has access to the bug:
```php
access_ensure_bug_level(VIEWER, $bugId);
```

### 4. No input validation (`manageBugnoteHighlights.php:225`)
If the request body is invalid JSON or missing `action` key, the script crashes with a PHP notice.
```php
// fix
$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data) || !isset($data['action'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}
```

---

## Performance

### 5. N+1 query problem (`savedBugnotes.php:49-63`)
For each highlighted bugnote there are 2 separate DB queries (`bugnote_get` + `bug_get_row`). With 50 highlights = 100 queries. Should be replaced with a single JOIN query fetching all bugnotes and their bugs at once.

---

## Design

### 6. Side effect in constructor (`manageBugnoteHighlights.php:33`)
`handleAction()` is called inside `__constructor`. Constructor should only initialize state — actions should be called explicitly from outside. Makes the class untestable and unpredictable.
```php
// current
$searchedIssue = new BugnoteHighlightsManager($data); // already executes the action

// fix
$manager = new BugnoteHighlightsManager($data);
$manager->handleAction();
$manager->sendJsonResponse();
```

### 7. One table for two concepts
`imatic_bugnote_tags` stores both highlights and reactions in one table using a `type` column. Queries are unnecessarily complex and the two concepts have different data (reactions have `emoji`, `username`; highlights don't). Consider splitting into `imatic_bugnote_highlights` and `imatic_bugnote_reactions`.

### 8. Dead code
`getBug()` method in `BugnoteHighlightsManager` is never called — remove it.

---

## Minor

### 9. Literal dot in HTML output (`ImaticBugnotesTags.php:84`)
```php
// current — prints literal " . " in browser
'<i class="fa fa-bookmark"></i>  . ' . plugin_lang_get('saved_notes')

// fix
'<i class="fa fa-bookmark"></i> ' . plugin_lang_get('saved_notes')
```

### 10. `array_push` instead of `[]`
```php
// current
array_push($highlights, $row['bugnote_id']);

// fix
$highlights[] = $row['bugnote_id'];
```

### 11. `SELECT *` in `getAllReactionsByBugId()`
Select only the columns actually used instead of `SELECT *`.

---

## Fixed

### 12. Double response body on "Invalid action" — found by the new test suite
`handleAction()` used to `echo json_encode(...)` directly for the "Invalid action" branch instead of
setting `$this->responseData`. `sendJsonResponse()` then echoed `json_encode(null)` right after,
so the real HTTP response was `{"status":"error",...}null`. Fixed in `core/BugnoteHighlightsManager.php`
to set `$this->responseData` like every other branch, covered by `AccessControlTest::test_unknown_action_is_rejected`.

### 13. Dead code — `EMOJIBASE_CDN` constant
Defined in `ImaticBugnotesTagsPlugin` but never referenced anywhere; the emoji picker uses the bundled
`src/emojiPicker/data.json` instead. Removed.
