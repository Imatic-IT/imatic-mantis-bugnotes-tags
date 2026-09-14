<?php
/**
 * Per-note collapse, and the "fold all / unfold all" snapshot action
 * (0084928: "Možnost sbalit nějaké poznámky v ticketu").
 *
 * Run from the repository root:
 *   vendor/bin/phpunit -c plugins/ImaticBugnotesTags/phpunit.xml --testsuite integration
 */

require_once dirname(__DIR__) . '/ImaticBugnotesTagsIntegrationCase.php';

class CollapseTest extends ImaticBugnotesTagsIntegrationCase
{
    public function test_collapse_then_appears_in_get_collapsed(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_id = $this->addNote($t_bug_id);

        $this->callAction(ImaticBugnotesTagsPlugin::COLLAPSE, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
        ]);

        $this->assertSame(
            ['c' . $t_note_id],
            $this->callAction(ImaticBugnotesTagsPlugin::GET_COLLAPSED, ['bugId' => $t_bug_id])
        );
    }

    public function test_uncollapse_removes_it_from_get_collapsed(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_id = $this->addNote($t_bug_id);

        $this->callAction(ImaticBugnotesTagsPlugin::COLLAPSE, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
        ]);
        $this->callAction(ImaticBugnotesTagsPlugin::UNCOLLAPSE, [
            'bugId'     => $t_bug_id,
            'bugnoteId' => 'c' . $t_note_id,
        ]);

        $this->assertSame(
            [],
            $this->callAction(ImaticBugnotesTagsPlugin::GET_COLLAPSED, ['bugId' => $t_bug_id])
        );
    }

    public function test_get_collapsed_is_scoped_to_the_bug(): void
    {
        $t_bug_id_a = $this->createIssue();
        $t_note_a = $this->addNote($t_bug_id_a);
        $t_bug_id_b = $this->createIssue();
        $t_note_b = $this->addNote($t_bug_id_b);

        $this->callAction(ImaticBugnotesTagsPlugin::COLLAPSE, ['bugId' => $t_bug_id_a, 'bugnoteId' => 'c' . $t_note_a]);
        $this->callAction(ImaticBugnotesTagsPlugin::COLLAPSE, ['bugId' => $t_bug_id_b, 'bugnoteId' => 'c' . $t_note_b]);

        $this->assertSame(
            ['c' . $t_note_a],
            $this->callAction(ImaticBugnotesTagsPlugin::GET_COLLAPSED, ['bugId' => $t_bug_id_a])
        );
    }

    /**
     * The whole point of "fold all" (0084928, jan.pekar ~0518116): it is a
     * one-off snapshot ("mark everything up to now as read"), not a standing
     * rule, so a note added afterwards must stay expanded.
     */
    public function test_collapse_all_only_collapses_notes_that_exist_at_that_moment(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_before = $this->addNote($t_bug_id, 'written before fold-all');

        $t_result = $this->callAction(ImaticBugnotesTagsPlugin::COLLAPSE_ALL, ['bugId' => $t_bug_id]);
        $this->assertSame('success', $t_result['status']);
        $this->assertSame(['c' . $t_note_before], $t_result['collapsed']);

        $t_note_after = $this->addNote($t_bug_id, 'written after fold-all');

        $t_collapsed = $this->callAction(ImaticBugnotesTagsPlugin::GET_COLLAPSED, ['bugId' => $t_bug_id]);
        $this->assertContains('c' . $t_note_before, $t_collapsed);
        $this->assertNotContains('c' . $t_note_after, $t_collapsed);
    }

    public function test_collapse_all_is_idempotent(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_id = $this->addNote($t_bug_id);

        $this->callAction(ImaticBugnotesTagsPlugin::COLLAPSE_ALL, ['bugId' => $t_bug_id]);
        $t_result = $this->callAction(ImaticBugnotesTagsPlugin::COLLAPSE_ALL, ['bugId' => $t_bug_id]);

        $this->assertSame(['c' . $t_note_id], $t_result['collapsed']);
        $this->assertSame(
            ['c' . $t_note_id],
            $this->callAction(ImaticBugnotesTagsPlugin::GET_COLLAPSED, ['bugId' => $t_bug_id])
        );
    }

    public function test_uncollapse_all_clears_every_note_on_the_bug(): void
    {
        $t_bug_id = $this->createIssue();
        $t_note_a = $this->addNote($t_bug_id);
        $t_note_b = $this->addNote($t_bug_id);

        $this->callAction(ImaticBugnotesTagsPlugin::COLLAPSE, ['bugId' => $t_bug_id, 'bugnoteId' => 'c' . $t_note_a]);
        $this->callAction(ImaticBugnotesTagsPlugin::COLLAPSE, ['bugId' => $t_bug_id, 'bugnoteId' => 'c' . $t_note_b]);

        $t_result = $this->callAction(ImaticBugnotesTagsPlugin::UNCOLLAPSE_ALL, ['bugId' => $t_bug_id]);

        $this->assertSame('success', $t_result['status']);
        $this->assertSame(
            [],
            $this->callAction(ImaticBugnotesTagsPlugin::GET_COLLAPSED, ['bugId' => $t_bug_id])
        );
    }

    public function test_uncollapse_all_does_not_touch_other_bugs(): void
    {
        $t_bug_id_a = $this->createIssue();
        $t_note_a = $this->addNote($t_bug_id_a);
        $t_bug_id_b = $this->createIssue();
        $t_note_b = $this->addNote($t_bug_id_b);

        $this->callAction(ImaticBugnotesTagsPlugin::COLLAPSE, ['bugId' => $t_bug_id_a, 'bugnoteId' => 'c' . $t_note_a]);
        $this->callAction(ImaticBugnotesTagsPlugin::COLLAPSE, ['bugId' => $t_bug_id_b, 'bugnoteId' => 'c' . $t_note_b]);

        $this->callAction(ImaticBugnotesTagsPlugin::UNCOLLAPSE_ALL, ['bugId' => $t_bug_id_a]);

        $this->assertSame(
            ['c' . $t_note_b],
            $this->callAction(ImaticBugnotesTagsPlugin::GET_COLLAPSED, ['bugId' => $t_bug_id_b])
        );
    }
}
