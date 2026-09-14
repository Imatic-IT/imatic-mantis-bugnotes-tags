<?php
/**
 * Base class for the ImaticBugnotesTags tests.
 *
 * Every action goes straight through BugnoteHighlightsManager, the same class
 * the HTTP endpoint (pages/manageBugnoteHighlights.php) uses, so the whole
 * production path runs (access checks, CSRF check, DB reads/writes) without
 * an actual HTTP request. form_security_validate() itself always returns
 * true under the CLI SAPI phpunit runs under, so the CSRF token in the
 * request data is not exercised here - it is exercised on every real request
 * a browser makes, just not by this suite.
 *
 * Everything created is torn down again: its own project, its own issues,
 * and any row this plugin wrote for them in its own tables.
 */

require_once __DIR__ . '/bootstrap.php';
require_once BNT_PLUGIN_PATH . '/core/BugnoteHighlightsManager.php';

use PHPUnit\Framework\TestCase;

abstract class ImaticBugnotesTagsIntegrationCase extends TestCase
{
    /** Reserved TLD per RFC2606, so the account notification cannot reach anyone. */
    const TEST_USER_EMAIL_DOMAIN = 'bnt-tests.test';

    /** @var int the throwaway account the suite runs as */
    protected static $userId;

    /** @var int */
    protected static $projectId;

    /** @var string credentials of self::$userId, kept so a test that logs in
     *  as a different account (to exercise access control) can log back in. */
    protected static $adminUsername;
    protected static $adminPassword;

    /** @var int[] issues created by the running test */
    private $createdBugs = [];

    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();

        if (!BNT_TESTS_HAVE_MANTIS) {
            self::markTestSkipped(
                'needs an installed Mantis: start phpunit from the Mantis root with BNT_TESTS_MANTIS=1'
            );
        }

        $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
        $GLOBALS['g_bypass_headers'] = 1;

        # Nothing may leave the machine: the suite adds bugnotes.
        config_set_global('enable_email_notification', OFF);

        # Address validation does a DNS lookup when check_mx_record is ON,
        # which would make the suite depend on the network and on the
        # reserved .test domain resolving. It is a global, so this is
        # in-memory only.
        config_set_global('check_mx_record', OFF);

        self::login();
        self::installPlugin();

        self::$projectId = self::createProject();
    }

    public static function tearDownAfterClass(): void
    {
        if (self::$projectId) {
            project_delete(self::$projectId);
        }

        if (self::$userId) {
            user_delete(self::$userId);
        }
    }

    protected function tearDown(): void
    {
        foreach ($this->createdBugs as $t_bug_id) {
            $this->cleanupPluginRows($t_bug_id);
            if (bug_exists($t_bug_id)) {
                bug_delete($t_bug_id);
            }
        }
        $this->createdBugs = [];
    }

    /**
     * The plugin's own tables are not known to core, so bug_delete() does not
     * clean them up - do it explicitly instead of leaving orphaned rows behind
     * for the next test (or the next run) to trip over.
     */
    private function cleanupPluginRows(int $p_bug_id): void
    {
        foreach (
            [
                'imatic_bugnote_highlights',
                'imatic_bugnote_reactions',
                'imatic_bugnote_collapse',
                'imatic_bugnote_fold_mode',
            ] as $t_table
        ) {
            db_query(
                'DELETE FROM ' . db_get_table($t_table) . ' WHERE bug_id = ' . db_param(),
                [$p_bug_id]
            );
        }
    }

    # ─── fixtures ────────────────────────────────────────────────────────────

    protected static function installPlugin()
    {
        if (plugin_is_installed('ImaticBugnotesTags')) {
            return;
        }

        plugin_install(plugin_register('ImaticBugnotesTags'));
        plugin_init('ImaticBugnotesTags');

        self::assertTrue(
            plugin_is_installed('ImaticBugnotesTags'),
            'could not install the plugin into the Mantis the tests run against'
        );
    }

    /**
     * Creating projects, issues and notes needs a logged in user, which a CLI
     * run has not got.
     *
     * The suite creates its own account rather than expecting one to exist,
     * so it does not depend on the credentials of whichever install it runs
     * against. The account is removed again in the teardown.
     */
    protected static function login()
    {
        $t_username = 'bnt_tests_' . uniqid();
        $t_password = 'Bnt.' . bin2hex(random_bytes(8));

        $t_cookie = user_create(
            $t_username,
            $t_password,
            $t_username . '@' . self::TEST_USER_EMAIL_DOMAIN,
            ADMINISTRATOR
        );

        self::$userId = user_get_id_by_cookie($t_cookie);
        self::$adminUsername = $t_username;
        self::$adminPassword = $t_password;

        self::assertTrue(
            auth_attempt_script_login($t_username, $t_password),
            'could not log in as the account the suite just created'
        );
    }

    /**
     * A second account for access-control tests, with a global access level
     * lower than $g_private_project_threshold so it does not automatically
     * see private projects it was not added to.
     *
     * @return array{id:int, username:string, password:string}
     */
    protected static function createUser($p_access_level = VIEWER)
    {
        $t_username = 'bnt_tests_' . uniqid();
        $t_password = 'Bnt.' . bin2hex(random_bytes(8));

        $t_cookie = user_create(
            $t_username,
            $t_password,
            $t_username . '@' . self::TEST_USER_EMAIL_DOMAIN,
            $p_access_level
        );

        return [
            'id'       => user_get_id_by_cookie($t_cookie),
            'username' => $t_username,
            'password' => $t_password,
        ];
    }

    /**
     * Switch the current session back to the suite's own admin account, e.g.
     * after a test logged in as a different user to exercise access control.
     */
    protected function loginAsAdmin(): void
    {
        self::assertTrue(
            auth_attempt_script_login(self::$adminUsername, self::$adminPassword),
            'could not log back in as the suite account'
        );
    }

    private static function createProject()
    {
        $t_name = 'BNT tests ' . uniqid();

        return project_create($t_name, 'Created by the ImaticBugnotesTags test suite', VS_PUBLIC);
    }

    /**
     * @return int bug id
     */
    protected function createIssue($p_summary = 'BNT test issue')
    {
        $t_bug = new BugData;
        $t_bug->project_id = self::$projectId;
        $t_bug->reporter_id = auth_get_current_user_id();
        $t_bug->summary = $p_summary;
        $t_bug->description = 'Created by the ImaticBugnotesTags test suite';

        $t_bug_id = $t_bug->create();
        $this->createdBugs[] = $t_bug_id;

        return $t_bug_id;
    }

    /**
     * @return int bugnote id
     */
    protected function addNote($p_bug_id, $p_text = 'test note')
    {
        return bugnote_add($p_bug_id, $p_text, '0:00', false, BUGNOTE, '', null, false);
    }

    # ─── driving the plugin ──────────────────────────────────────────────────

    /**
     * Run one plugin action the same way the browser does, and return its
     * response data (what sendJsonResponse() would have echoed).
     *
     * @param string $p_action  one of the BugnoteHighlightsPlugin::* constants
     * @param array  $p_data    request payload, merged over the defaults below
     */
    protected function callAction($p_action, array $p_data = [])
    {
        $t_data = array_merge(['action' => $p_action, 'csrfToken' => ''], $p_data);

        $t_manager = new BugnoteHighlightsManager($t_data);
        return $t_manager->getResponseData();
    }
}
