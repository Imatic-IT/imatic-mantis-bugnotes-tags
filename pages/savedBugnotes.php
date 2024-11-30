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

    public function fetchBugnoteDetails(): void
    {
        $this->bugnoteDetails = array_map(function($bugnoteId) {

            return bugnote_get($bugnoteId);
        }, $this->highlightedBugnotes);
    }

    public function getAllBugnotesDetails(): array
    {
        return $this->bugnoteDetails;
    }
}

$manager = new SavedBugnotesManager();
$manager->getHighlightsByUserId();
$manager->fetchBugnoteDetails();
$data = $manager->getAllBugnotesDetails();
$itemCount = count($data);

?>


<h3><i class="fa fa-bookmark"></i> <?php echo $itemCount ?> </h3>
<?php foreach ($data as $item): ?>
    <?php
    $item = (array)$item;

    ?>
    <div class="widget-body">
        <div class="widget-main no-padding">
            <div class="table-responsive">
                <table class="table table-bordered table-condensed table-striped">
                    <tbody>
                    <tr class="bugnote visible-on-hover-toggle highlighted"
                        id="c<?php echo $item['bugnote_text_id']; ?>">
                        <td class="category">
                            <div class="pull-left padding-2"></div>
                            <div class="pull-left padding-2">
                                <p class="no-margin">
                                    <i class="fa fa-user grey"></i>
                                    <a href="http://localhost:8888/view_user_page.php?id=<?php echo $item['reporter_id']; ?>">
                                        <?php echo user_get_username($item['reporter_id']); ?>
                                    </a>
                                </p>
                                <p class="no-margin small lighter">
                                    <i class="fa fa-clock-o grey"></i> <?php echo date('Y-m-d H:i', $item['date_submitted']); ?>
                                    &nbsp;&nbsp;
                                    <i class="fa fa-eye red"></i> <?php
                                    $viewState = $item['view_state'] === VS_PRIVATE ? lang_get('private') : lang_get('public');
                                    echo $viewState;
                                    ?>
                                </p>
                                <p class="no-margin">
                                    <span class="label label-sm label-default arrowed-in-right"><?php echo access_level_get_string(current_user_get_access_level()) ?></span>
                                    &nbsp;
                                    <i class="fa fa-link grey"></i>
                                    <a rel="bookmark"
                                       href="view.php?id=<?php echo $item['bug_id']; ?>#c<?php echo $item['id']; ?>"
                                       class="lighter" title="Přímý odkaz na poznámku">
                                        ~000<?php echo $item['bugnote_text_id']; ?>
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
                                                       value="<?php echo $item['bugnote_text_id']; ?>">
                                            </fieldset>
                                        </form>
                                    </div>
                                </div>
                        </td>
                        <td class="bugnote-note <?php echo $item['view_state'] === VS_PRIVATE ? ' bugnote-private' : ' bugnote-public' ?>">
                            <p><?php echo htmlspecialchars($item['note']); ?></p>
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

<?php
layout_page_end();
?>



