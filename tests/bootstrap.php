<?php
/**
 * Bootstrap for the ImaticBugnotesTags test suite.
 *
 * Two ways of starting it have to work:
 *
 *   1. plugins/ImaticBugnotesTags/phpunit.xml on its own, with
 *      BNT_TESTS_MANTIS=1 in the environment, which boots Mantis from here.
 *      This is how the suite is started in CI.
 *
 *   2. the repository root phpunit.xml, whose own bootstrap has already
 *      booted Mantis. Nothing is booted twice.
 *
 * Every test file requires this bootstrap explicitly, so it does not matter
 * which of the two was used. Unlike EmailReporting, there is no stub-only
 * path: every test here needs a real Mantis + database, so a run with
 * neither of the above skips itself (see ImaticBugnotesTagsIntegrationCase).
 */

if (!defined('BNT_PLUGIN_PATH')) {
    define('BNT_PLUGIN_PATH', dirname(__DIR__));

    date_default_timezone_set('UTC');

    # config_get() is the marker for "Mantis core is already in this process",
    # which is the case when the repository root phpunit.xml started the run.
    $g_bnt_tests_have_mantis = function_exists('config_get');

    if (!$g_bnt_tests_have_mantis && getenv('BNT_TESTS_MANTIS')) {
        # require_mantis_core() resolves config_defaults_inc.php and core.php
        # relative to the working directory, so phpunit has to be started from
        # the Mantis root - which is where its configuration files live anyway.
        require_once dirname(BNT_PLUGIN_PATH, 2) . '/tests/TestConfig.php';
        require_mantis_core();

        $g_bnt_tests_have_mantis = true;
    }

    define('BNT_TESTS_HAVE_MANTIS', $g_bnt_tests_have_mantis);
    unset($g_bnt_tests_have_mantis);
}
