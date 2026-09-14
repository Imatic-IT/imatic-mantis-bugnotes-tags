<?php
/**
 * The "hide unsaved" group toggle: a per-user, per-bug standing preference
 * (as opposed to collapse-all's one-off snapshot, see CollapseTest).
 *
 * Run from the repository root:
 *   vendor/bin/phpunit -c plugins/ImaticBugnotesTags/phpunit.xml --testsuite integration
 */

require_once dirname(__DIR__) . '/ImaticBugnotesTagsIntegrationCase.php';

class FoldModeTest extends ImaticBugnotesTagsIntegrationCase
{
    public function test_defaults_to_disabled(): void
    {
        $t_bug_id = $this->createIssue();

        $this->assertSame(
            ['enabled' => false],
            $this->callAction(ImaticBugnotesTagsPlugin::GET_FOLD_MODE, ['bugId' => $t_bug_id])
        );
    }

    public function test_enabling_it_is_reflected_by_get(): void
    {
        $t_bug_id = $this->createIssue();

        $t_result = $this->callAction(ImaticBugnotesTagsPlugin::SET_FOLD_MODE, [
            'bugId'   => $t_bug_id,
            'enabled' => true,
        ]);

        $this->assertSame(['status' => 'success', 'enabled' => true], $t_result);
        $this->assertSame(
            ['enabled' => true],
            $this->callAction(ImaticBugnotesTagsPlugin::GET_FOLD_MODE, ['bugId' => $t_bug_id])
        );
    }

    public function test_disabling_it_again_removes_it(): void
    {
        $t_bug_id = $this->createIssue();

        $this->callAction(ImaticBugnotesTagsPlugin::SET_FOLD_MODE, ['bugId' => $t_bug_id, 'enabled' => true]);
        $this->callAction(ImaticBugnotesTagsPlugin::SET_FOLD_MODE, ['bugId' => $t_bug_id, 'enabled' => false]);

        $this->assertSame(
            ['enabled' => false],
            $this->callAction(ImaticBugnotesTagsPlugin::GET_FOLD_MODE, ['bugId' => $t_bug_id])
        );
    }

    public function test_is_scoped_per_bug(): void
    {
        $t_bug_id_a = $this->createIssue();
        $t_bug_id_b = $this->createIssue();

        $this->callAction(ImaticBugnotesTagsPlugin::SET_FOLD_MODE, ['bugId' => $t_bug_id_a, 'enabled' => true]);

        $this->assertSame(
            ['enabled' => false],
            $this->callAction(ImaticBugnotesTagsPlugin::GET_FOLD_MODE, ['bugId' => $t_bug_id_b])
        );
    }
}
