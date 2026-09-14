<?php
/**
 * Emoji reactions on a bugnote.
 *
 * Run from the repository root:
 *   vendor/bin/phpunit -c plugins/ImaticBugnotesTags/phpunit.xml --testsuite integration
 */

require_once dirname(__DIR__) . '/ImaticBugnotesTagsIntegrationCase.php';

class ReactionTest extends ImaticBugnotesTagsIntegrationCase
{
    public function test_reacting_then_appears_in_get_reactions(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_id = $this->addNote($t_bug_id);

        $t_result = $this->callAction(ImaticBugnotesTagsPlugin::REACTION, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
            'emoji'     => '🎉',
        ]);
        $this->assertSame('save', $t_result['action']);

        $t_reactions = $this->callAction(ImaticBugnotesTagsPlugin::GET_REACTIONS, ['bugId' => $t_bug_id]);
        $this->assertCount(1, $t_reactions);
        $this->assertSame('🎉', $t_reactions[0]['emoji']);
        $this->assertSame((string)$t_note_id, (string)$t_reactions[0]['bugnote_id']);
    }

    /**
     * Clicking the same emoji again is how a reaction is taken back — there is
     * no separate "unsave reaction" button in the UI for one's own reaction.
     */
    public function test_reacting_with_the_same_emoji_twice_removes_it(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_id = $this->addNote($t_bug_id);

        $t_data = [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
            'emoji'     => '👍',
        ];
        $this->callAction(ImaticBugnotesTagsPlugin::REACTION, $t_data);
        $t_second = $this->callAction(ImaticBugnotesTagsPlugin::REACTION, $t_data);

        $this->assertSame('delete', $t_second['action']);
        $this->assertSame([], $this->callAction(ImaticBugnotesTagsPlugin::GET_REACTIONS, ['bugId' => $t_bug_id]));
    }

    public function test_different_emoji_on_the_same_note_both_count(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_id = $this->addNote($t_bug_id);

        $this->callAction(ImaticBugnotesTagsPlugin::REACTION, [
            'bugId' => $t_bug_id, 'bugnoteId' => 'c' . $t_note_id, 'emoji' => '👍',
        ]);
        $this->callAction(ImaticBugnotesTagsPlugin::REACTION, [
            'bugId' => $t_bug_id, 'bugnoteId' => 'c' . $t_note_id, 'emoji' => '🎉',
        ]);

        $this->assertCount(2, $this->callAction(ImaticBugnotesTagsPlugin::GET_REACTIONS, ['bugId' => $t_bug_id]));
    }

    public function test_get_reactions_is_scoped_to_the_bug(): void
    {
        $t_bug_id_a = $this->createIssue();
        $t_note_a = $this->addNote($t_bug_id_a);
        $t_bug_id_b = $this->createIssue();
        $t_note_b = $this->addNote($t_bug_id_b);

        $this->callAction(ImaticBugnotesTagsPlugin::REACTION, [
            'bugId' => $t_bug_id_a, 'bugnoteId' => 'c' . $t_note_a, 'emoji' => '👍',
        ]);
        $this->callAction(ImaticBugnotesTagsPlugin::REACTION, [
            'bugId' => $t_bug_id_b, 'bugnoteId' => 'c' . $t_note_b, 'emoji' => '👍',
        ]);

        $t_reactions = $this->callAction(ImaticBugnotesTagsPlugin::GET_REACTIONS, ['bugId' => $t_bug_id_a]);
        $this->assertCount(1, $t_reactions);
        $this->assertSame((string)$t_note_a, (string)$t_reactions[0]['bugnote_id']);
    }
}
