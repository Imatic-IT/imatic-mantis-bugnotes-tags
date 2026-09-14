<?php
/**
 * Per-user bugnote highlighting ("save a note").
 *
 * Run from the repository root:
 *   vendor/bin/phpunit -c plugins/ImaticBugnotesTags/phpunit.xml --testsuite integration
 */

require_once dirname(__DIR__) . '/ImaticBugnotesTagsIntegrationCase.php';

class HighlightTest extends ImaticBugnotesTagsIntegrationCase
{
    public function test_highlight_then_appears_in_get_highlights(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_id = $this->addNote($t_bug_id);

        $t_result = $this->callAction(ImaticBugnotesTagsPlugin::HIGHLIGHT, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
        ]);

        $this->assertSame('success', $t_result['status']);
        $this->assertContains('c' . $t_note_id, $this->callAction(ImaticBugnotesTagsPlugin::GET_HIGHLIGHTS));
    }

    public function test_highlighting_the_same_note_twice_is_an_error(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_id = $this->addNote($t_bug_id);

        $this->callAction(ImaticBugnotesTagsPlugin::HIGHLIGHT, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
        ]);

        $t_result = $this->callAction(ImaticBugnotesTagsPlugin::HIGHLIGHT, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
        ]);

        $this->assertSame('error', $t_result['status']);
    }

    public function test_unhighlight_removes_it_from_get_highlights(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_id = $this->addNote($t_bug_id);

        $this->callAction(ImaticBugnotesTagsPlugin::HIGHLIGHT, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
        ]);
        $this->callAction(ImaticBugnotesTagsPlugin::UNHIGHLIGHT, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
        ]);

        $this->assertNotContains('c' . $t_note_id, $this->callAction(ImaticBugnotesTagsPlugin::GET_HIGHLIGHTS));
    }

    /**
     * Regression anchor for the historical bug (IMPROVEMENTS.md #2): highlights
     * and reactions used to live in one table and unhighlighting deleted both.
     * They are separate tables now, so this can no longer happen structurally,
     * but the behaviour is worth pinning down explicitly.
     */
    public function test_unhighlight_does_not_touch_reactions_on_the_same_note(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_id = $this->addNote($t_bug_id);

        $this->callAction(ImaticBugnotesTagsPlugin::HIGHLIGHT, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
        ]);
        $this->callAction(ImaticBugnotesTagsPlugin::REACTION, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
            'emoji'     => '👍',
        ]);

        $this->callAction(ImaticBugnotesTagsPlugin::UNHIGHLIGHT, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
        ]);

        $t_reactions = $this->callAction(ImaticBugnotesTagsPlugin::GET_REACTIONS, ['bugId' => $t_bug_id]);
        $this->assertCount(1, $t_reactions);
        $this->assertSame('👍', $t_reactions[0]['emoji']);
    }
}
