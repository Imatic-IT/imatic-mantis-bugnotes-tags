<?php

header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

layout_page_header();
layout_page_begin('manage_overview_page.php');

$t_filter_project = isset($_GET['project_id']) ? (int)$_GET['project_id'] : (int)helper_get_current_project();
$t_user_id        = auth_get_current_user_id();
$t_accessible_projects = user_get_accessible_projects($t_user_id);
if ($t_filter_project > 0 && !in_array($t_filter_project, $t_accessible_projects, true)) {
    $t_filter_project = 0;
}

// Build highlight rows via a single JOIN query
$t_highlights  = db_get_table('imatic_bugnote_highlights');
$t_bugnote     = db_get_table('bugnote');
$t_bugnote_txt = db_get_table('bugnote_text');
$t_bug         = db_get_table('bug');

// db_param() must be called in the same order as the placeholders appear in the query.
$t_user_param    = db_param();
$t_params        = [$t_user_id];
$t_project_filter = '';
if ($t_filter_project > 0) {
    $t_project_filter = ' AND b.project_id = ' . db_param();
    $t_params[]       = $t_filter_project;
}

$t_query = "SELECT bn.id, bn.bug_id, bnt.note, bn.view_state, bn.reporter_id, bn.date_submitted,
                   b.project_id, b.summary
              FROM $t_highlights h
              JOIN $t_bugnote     bn  ON bn.id = h.bugnote_id
              JOIN $t_bugnote_txt bnt ON bnt.id = bn.bugnote_text_id
              JOIN $t_bug         b   ON b.id  = bn.bug_id
             WHERE h.user_id = " . $t_user_param
         . $t_project_filter
         . ' ORDER BY b.project_id, bn.bug_id, bn.date_submitted DESC';

$t_result = db_query($t_query, $t_params);

// Group by project → bug
$t_grouped = [];
while ($t_row = db_fetch_array($t_result)) {
    $t_bug_id     = (int)$t_row['bug_id'];
    $t_project_id = (int)$t_row['project_id'];

    if (!access_has_bug_level(VIEWER, $t_bug_id)) {
        continue;
    }

    if (!isset($t_grouped[$t_project_id])) {
        $t_grouped[$t_project_id] = [];
    }
    if (!isset($t_grouped[$t_project_id][$t_bug_id])) {
        $t_grouped[$t_project_id][$t_bug_id] = [
            'summary'  => $t_row['summary'],
            'bugnotes' => [],
        ];
    }
    $t_grouped[$t_project_id][$t_bug_id]['bugnotes'][] = $t_row;
}

?>

<div class="col-md-12 col-xs-12">

    <div class="widget-box widget-color-blue2">
        <div class="widget-header">
            <h4 class="widget-title lighter">
                <i class="fa fa-bookmark"></i>
                <?php echo plugin_lang_get('saved_notes'); ?>
            </h4>
            <div class="widget-toolbar">
                <form method="get" action="<?php echo plugin_page('savedBugnotes'); ?>" class="form-inline no-margin">
                    <label class="lighter" for="savedBugnotesProjectFilter">
                        <?php echo plugin_lang_get('filter_project'); ?>
                    </label>
                    <select id="savedBugnotesProjectFilter" name="project_id" class="form-control input-sm" onchange="this.form.submit()">
                        <option value="0"><?php echo plugin_lang_get('all_projects'); ?></option>
                        <?php foreach ($t_accessible_projects as $t_project_id_option): ?>
                            <option value="<?php echo $t_project_id_option; ?>" <?php echo ($t_project_id_option === $t_filter_project) ? 'selected' : ''; ?>>
                                <?php echo string_display_line(project_get_name($t_project_id_option)); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </form>
            </div>
        </div>
    </div>

    <?php if (empty($t_grouped)): ?>
        <div class="alert alert-info"><?php echo lang_get('no_bugnotes'); ?></div>
    <?php endif; ?>

    <?php foreach ($t_grouped as $t_project_id => $t_bugs): ?>

        <div class="project-item">
            <div class="project-header">
                <i class="fa fa-folder-open"></i>
                <span class="project-name"><?php echo string_display_line(project_get_name($t_project_id)); ?></span>
                <span class="project-count">
                    <i class="fa fa-bookmark"></i>
                    <?php
                    $t_total = array_sum(array_map(function($b) { return count($b['bugnotes']); }, $t_bugs));
                    echo $t_total;
                    ?>
                </span>
            </div>
        </div>

        <?php foreach ($t_bugs as $t_bug_id => $t_bug_data): ?>

            <div class="saved-bug-group">
                <div class="saved-bug-header">
                    <a href="<?php echo string_sanitize_url('view.php?id=' . $t_bug_id, true); ?>" class="bug-link">
                        <strong><?php echo bug_format_id($t_bug_id); ?></strong>
                        <?php echo string_display_line($t_bug_data['summary']); ?>
                    </a>
                </div>

                <div class="widget-body">
                    <div class="widget-main no-padding">
                        <div class="table-responsive">
                            <table class="table table-bordered table-condensed table-striped">
                                <tbody>
                                <?php foreach ($t_bug_data['bugnotes'] as $t_bugnote): ?>
                                    <tr class="bugnote visible-on-hover-toggle" id="c<?php echo (int)$t_bugnote['id']; ?>">
                                        <td class="category">
                                            <div class="pull-left padding-2">
                                                <p class="no-margin">
                                                    <i class="fa fa-user grey"></i>
                                                    <a href="<?php echo string_sanitize_url('view_user_page.php?id=' . (int)$t_bugnote['reporter_id'], true); ?>">
                                                        <?php echo string_display_line(user_get_username((int)$t_bugnote['reporter_id'])); ?>
                                                    </a>
                                                </p>
                                                <p class="no-margin small lighter">
                                                    <i class="fa fa-clock-o grey"></i>
                                                    <?php echo date('Y-m-d H:i', (int)$t_bugnote['date_submitted']); ?>
                                                    &nbsp;&nbsp;
                                                    <i class="fa fa-eye red"></i>
                                                    <?php echo ((int)$t_bugnote['view_state'] === VS_PRIVATE) ? lang_get('private') : lang_get('public'); ?>
                                                </p>
                                                <p class="no-margin">
                                                    <i class="fa fa-link grey"></i>
                                                    <a rel="bookmark"
                                                       href="<?php echo string_sanitize_url('view.php?id=' . $t_bug_id . '#c' . (int)$t_bugnote['id'], true); ?>"
                                                       class="lighter"
                                                       title="<?php echo lang_get('bugnote_link'); ?>">
                                                        <?php echo bugnote_format_id((int)$t_bugnote['id']); ?>
                                                    </a>
                                                </p>
                                            </div>
                                        </td>
                                        <td class="bugnote-note<?php echo ((int)$t_bugnote['view_state'] === VS_PRIVATE) ? ' bugnote-private' : ' bugnote-public'; ?>">
                                            <?php
                                            if (plugin_is_installed('ImaticFormatting')) {
                                                /** @var ImaticFormattingPlugin $markdownPlugin */
                                                $markdownPlugin = plugin_get('ImaticFormatting');
                                                echo $markdownPlugin->convert($t_bugnote['note']);
                                            } else {
                                                echo string_display(string_nl2br($t_bugnote['note']));
                                            }
                                            ?>
                                        </td>
                                    </tr>
                                    <tr class="spacer"><td colspan="2"></td></tr>
                                <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        <?php endforeach; ?>

    <?php endforeach; ?>

</div>

<?php
layout_page_end();
?>
