<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Allows the client to get an updated set of counts so that when groups are shown/hidden on
 * non-expanded nodes, the count will reflect that.
 *
 * General plan is get nodes that would be what you get if you click this node's parent, then pick
 * out the one we want, then send the counts back. This saves a whole lot of duplicated code.
 *
 * @package    block
 * @subpackage ajax_marking
 * @copyright  2007 Matt Gibson
 * @author     Matt Gibson {@link http://moodle.org/user/view.php?id=81450}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);

require_once(dirname(__FILE__).'/../../../config.php');

// For unit tests to work
global $CFG, $PAGE;

require_login(0, false);
require_once($CFG->dirroot.'/blocks/ajax_marking/lib.php');
require_once($CFG->dirroot.'/blocks/ajax_marking/classes/output.class.php');
require_once($CFG->dirroot.'/blocks/ajax_marking/classes/module_base.class.php');
require_once($CFG->dirroot.'/blocks/ajax_marking/classes/nodes_factory.class.php');

// TODO might be in a course
$PAGE->set_context(get_context_instance(CONTEXT_SYSTEM));

// Each ajax request will have different stuff that we want to pass to the callback function. Using
// required_param() means hard-coding them.
$params = array();
foreach ($_POST as $name => $value) {
    $params[$name] = clean_param($value, PARAM_ALPHANUMEXT);
}

if (!isset($params['currentfilter'])) {
    print_error('No filter specified for node count');
    die();
}
if (!isset($params['filtervalue'])) {
    print_error('No filter value specified for node count');
    die();
}
if (!isset($params['nodeindex'])) {
    print_error('No node index specified for the count');
    die();
}
// Makes it easier to reuse the query code.
$params['nextnodefilter'] = $params['currentfilter'];

$nodes = block_ajax_marking_nodes_factory::unmarked_nodes($params);
$nodewearecounting = false;

foreach ($nodes as &$node) {
    if ($node->$currentfilter == $params['nodeid']) {
        /**
         * @var $nodewearecounting stdClass;
         */
        $nodewearecounting = $node;
        break;
    }
}

if (!$nodewearecounting) {
    throw new coding_exception('Relevant node was not returned for counting');
}

// reindex array so we pick it up in js as an array and can find the length. Associative arrays
// with strings for keys are automatically sent as objects
$nodecounts = array(
    'recentcount' => $nodewearecounting->recentcount,
    'mediumcount' => $nodewearecounting->mediumcount,
    'overduecount' => $nodewearecounting->overduecount,
    'itemcount' => $nodewearecounting->itemcount
);

$data = array('counts' => $nodecounts);
if (isset($params['nodeindex'])) {
    $data['nodeindex'] = $params['nodeindex'];
}
echo json_encode($data);
