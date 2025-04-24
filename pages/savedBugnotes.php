<?php

layout_page_header();
layout_page_begin('manage_overview_page.php');

class SavedBugnotesManager
{
    private array $highlightedBugnotes = [];
    private $plugin;

    private array $bugnoteDetails = [];

    public function __construct()
    {
        $this->plugin = plugin_get('ImaticBugnotesTags');
    }

    private function getHighlightAction(): string
    {
        return $this->plugin::HIGHLIGHT;
    }

    private function getUserId(): int
    {
        return auth_get_current_user_id();
    }

    public function getHighlightsByUserId(): void
    {
        $userId = $this->getUserId();


        $query = 'SELECT bugnote_id FROM ' . db_get_table('imatic_bugnote_tags') . ' WHERE user_id = ' . db_param() . ' AND type = ' . db_param();
        $params = [$userId, $this->getHighlightAction()];

        $queryResult = db_query($query, $params);

        $highlights = [];
        while ($row = db_fetch_array($queryResult)) {
            array_push($highlights, $row['bugnote_id']);
        }
        $this->highlightedBugnotes = $highlights;
    }

    public function fetchBugnoteDetailsGroupedByProject(): void
    {
        $grouped = [];

        foreach ($this->highlightedBugnotes as $bugnoteId) {
            $bugnote = bugnote_get($bugnoteId);

            $bug = bug_get_row($bugnote->bug_id);

            $projectId = $bug['project_id'];

            if (!isset($grouped[$projectId])) {
                $grouped[$projectId] = [];
            }

            $grouped[$projectId][] = $bugnote;
        }

        $this->bugnoteDetails = $grouped;
    }

    public function getAllBugnotesDetails(): array
    {
        return $this->bugnoteDetails;
    }
}

$manager = new SavedBugnotesManager();
$manager->getHighlightsByUserId();
$manager->fetchBugnoteDetailsGroupedByProject();
$data = $manager->getAllBugnotesDetails();
$itemCount = array_map(function ($bugnotes) {
    return count($bugnotes);
}, $data);

?>

<div id="bugnotes">
    <?php foreach ($data as $key => $item): ?>

        <div class="project-item">
                <div class="project-header">
                    <span class="pr"><?php echo project_get_name($key); ?></span>
                    <span class="project-count"><i class="fa fa-bookmark"></i> <?php echo $itemCount[$key]; ?> </span>
                </div>
            </div>

        <?php foreach ($item as $bugnote): ?>

            <?php
            $bugnote = (array)$bugnote;
            ?>

            <div class="widget-body">
                <div class="widget-main no-padding">
                    <div class="table-responsive">
                        <table class="table table-bordered table-condensed table-striped">
                            <tbody>
                            <tr class="bugnote visible-on-hover-toggle "
                                id="c<?php echo $bugnote['id']; ?>">

                                <a rel="bookmark"
                                   href="view.php?id=<?php echo $bugnote['bug_id']; ?>"
                                       class=" lighter" title="Přímý odkaz na poznámku">
                                <?php echo bug_format_id($bugnote['bug_id']); ?>
                                </a> -

                                <strong>
                                    <?php echo bug_get_field($bugnote['bug_id'], 'summary'); ?>
                                </strong>

                                <td class="category">
                                    <div class="pull-left padding-2"></div>
                                    <br>
                                    <div class="pull-left padding-2">
                                        <p class="no-margin">
                                            <i class="fa fa-user grey"></i>
                                            <a href="http://localhost:8888/view_user_page.php?id=<?php echo $bugnote['reporter_id']; ?>">
                                                <?php echo user_get_username($bugnote['reporter_id']); ?>
                                            </a>
                                        </p>
                                        <p class="no-margin small lighter">
                                            <i class="fa fa-clock-o grey"></i> <?php echo date('Y-m-d H:i', $bugnote['date_submitted']); ?>
                                            &nbsp;&nbsp;
                                            <i class="fa fa-eye red"></i> <?php
                                            $viewState = $bugnote['view_state'] === VS_PRIVATE ? lang_get('private') : lang_get('public');
                                            echo $viewState;
                                            ?>
                                        </p>
                                        <p class="no-margin">
                                            <span class="label label-sm label-default arrowed-in-right"><?php echo access_level_get_string(current_user_get_access_level()) ?></span>
                                            &nbsp;
                                            <i class="fa fa-link grey"></i>
                                            <a rel="bookmark"
                                               href="view.php?id=<?php echo $bugnote['bug_id']; ?>#c<?php echo $bugnote['id']; ?>"
                                               class="lighter" title="Přímý odkaz na poznámku">
                                                <?php echo bugnote_format_id($bugnote['id']); ?>
                                            </a>
                                        </p>
                                        <div class="clearfix"></div>
                                        <div class="space-2"></div>
                                        <div class="btn-group visible-on-hover invisible">
                                            <div class="pull-left">
                                                <form method="post" action="bugnote_edit_page.php"
                                                      class="form-inline inline single-button-form">
                                                    <fieldset>
                                                        <button type="submit"
                                                                class="btn btn-primary btn-xs btn-white btn-round"><?php echo lang_get('bugnote_edit_link'); ?>
                                                        </button>
                                                        <input type="hidden" name="bugnote_id"
                                                               value="<?php echo $bugnote['id']; ?>">
                                                    </fieldset>
                                                </form>
                                            </div>
                                        </div>
                                </td>
                                <td class="bugnote-note <?php echo $bugnote['view_state'] === VS_PRIVATE ? ' bugnote-private' : ' bugnote-public' ?>">
                                    <p><?php echo htmlspecialchars($bugnote['note']); ?></p>
                                </td>
                            </tr>
                            <tr class="spacer">
                                <td colspan="2"></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        <?php endforeach; ?>
    <?php endforeach; ?>

</div>

<?php
layout_page_end();
?>



