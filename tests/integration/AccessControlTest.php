<?php
/**
 * Access control (IMPROVEMENTS.md #3): every action must check that the
 * current user can actually see the bug it targets, not just that they are
 * logged in somewhere.
 *
 * Run from the repository root:
 *   vendor/bin/phpunit -c plugins/ImaticBugnotesTags/phpunit.xml --testsuite integration
 */

require_once dirname(__DIR__) . '/ImaticBugnotesTagsIntegrationCase.php';

class AccessControlTest extends ImaticBugnotesTagsIntegrationCase
{
    public function test_unknown_action_is_rejected(): void
    {
        $t_result = $this->callAction('not-a-real-action');

        $this->assertSame(['status' => 'error', 'message' => 'Invalid action'], $t_result);
    }

    public function test_nonexistent_bug_is_denied(): void
    {
        $t_result = $this->callAction(
            ImaticBugnotesTagsPlugin::GET_COLLAPSED,
            ['bugId' => 999999999]
        );

        $this->assertSame(['status' => 'error', 'message' => 'Access denied'], $t_result);
    }

    /**
     * A user with no membership on a private project, and a global access
     * level below $g_private_project_threshold, must not be able to act on an
     * issue inside it - even if they know its id.
     */
    public function test_user_without_project_access_is_denied(): void
    {
        $t_project_id = project_create(
            'BNT access test ' . uniqid(),
            'Created by the ImaticBugnotesTags test suite',
            VS_PUBLIC,
            VS_PRIVATE
        );

        $t_bug = new BugData;
        $t_bug->project_id = $t_project_id;
        $t_bug->reporter_id = auth_get_current_user_id();
        $t_bug->summary = 'BNT access test issue';
        $t_bug->description = 'Created by the ImaticBugnotesTags test suite';
        $t_bug_id = $t_bug->create();

        $t_stranger = self::createUser(VIEWER);

        try {
            self::assertTrue(auth_attempt_script_login($t_stranger['username'], $t_stranger['password']));

            $t_result = $this->callAction(
                ImaticBugnotesTagsPlugin::GET_COLLAPSED,
                ['bugId' => $t_bug_id]
            );

            $this->assertSame(['status' => 'error', 'message' => 'Access denied'], $t_result);
        } finally {
            $this->loginAsAdmin();
            bug_delete($t_bug_id);
            project_delete($t_project_id);
            user_delete($t_stranger['id']);
        }
    }
}
