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
 * Holds functions used in upgrade and install of the block.
 *
 * @package    block
 * @subpackage ajax_marking
 * @copyright  2012 Matt Gibson
 * @author     Matt Gibson {@link http://moodle.org/user/view.php?id=81450}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Removes the 'groups' field from the main settings table, so it can be made into a separate
 * join table.
 */
function drop_groups_field() {

    global $DB;

    $dbman = $DB->get_manager();

    $table = new xmldb_table('block_ajax_marking');
    $field = new xmldb_field('groups');

    // Launch drop field groups.
    if ($dbman->field_exists($table, $field)) {
        $dbman->drop_field($table, $field);
    }
}

/**
 * Add a new field for showing whether each group should be displayed. Allows override of.
 */
function add_display_field() {

    global $DB;

    $dbman = $DB->get_manager();

    // Show this group that may have been set at course level.
    $table = new xmldb_table('block_ajax_marking_groups');
    $field = new xmldb_field('display', XMLDB_TYPE_INTEGER, '1', XMLDB_UNSIGNED, null,
                             null, '0', 'groupid');
    // Conditionally launch add field.
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
    }
}

/**
 * Add a new field for showing whether groups should be displayed.
 */
function add_groups_display_field() {

    global $DB;

    $dbman = $DB->get_manager();

    $table = new xmldb_table('block_ajax_marking');
    $field = new xmldb_field('groupsdisplay', XMLDB_TYPE_INTEGER, '1', XMLDB_UNSIGNED, null,
                             null, '0', 'display');
    // Conditionally launch add field.
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
    }
}

/**
 * Alters the table to use coursemodule id instead of module name and module id. Separating due
 * to an xml problem that meant that some sites didn't upgrade cleanly and needed redoing.
 *
 * @return array
 */
function change_config_to_courseid() {

    global $DB;

    $dbman = $DB->get_manager();

    $existingrecords = $DB->get_records('block_ajax_marking');

    // Make the old columns go away.

    // Define field courseid to be dropped from block_ajax_marking.
    $table = new xmldb_table('block_ajax_marking');

    $fieldstodrop = array(
        'courseid',
        'coursemoduleid',
        'assessmenttype',
        'assessmentid'
    );

    foreach ($fieldstodrop as $fieldtodrop) {
        $field = new xmldb_field($fieldtodrop);
        // Conditionally launch drop field.
        if ($dbman->field_exists($table, $field)) {
            $dbman->drop_field($table, $field);
        }
    }

    // Add a new field for holding general ids from various tables.
    $field = new xmldb_field('instanceid', XMLDB_TYPE_INTEGER, '10', XMLDB_UNSIGNED, null,
                             null, '0', 'userid');
    // Conditionally launch add field.
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
    }

    // Add a new field for holding the table name.
    $field = new xmldb_field('tablename', XMLDB_TYPE_CHAR, '40', null, null, null,
                             null, 'instanceid');
    // Conditionally launch add field.
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
    }

    // Remove old data in the wrong format.
    $sql = "TRUNCATE TABLE {block_ajax_marking}";
    $DB->execute($sql);

    // Put the old data back.
    $modids = $DB->get_records('modules', array(), '', 'name, id');
    foreach ($existingrecords as $record) {
        $oldid = $record->id;
        unset($record->id);
        if (!empty($record->courseid)) {
            $record->instanceid = $record->courseid;
            $record->tablename = 'course';
        } else if (!empty($record->coursemoduleid)) {
            $record->instanceid = $record->coursemoduleid;
            $record->tablename = 'course_modules';
        } else {
            // Previous upgrade failed somehow.
            $cmid = $DB->get_field('course_modules',
                                   'id',
                                   array('module' => $modids[$record->assessmenttype]->id,
                                         'instance' => $record->assessmentid));
            $record->tablename = 'course_modules';
            $record->instanceid = $cmid;
        }

        $newid = $DB->insert_record('block_ajax_marking', $record);
        $sql = "UPDATE {block_ajax_marking_groups}
                       SET configid = :newid
                     WHERE configid = :oldid ";
        $DB->execute($sql,
                     array('oldid' => $oldid,
                           'newid' => $newid));
    }
}

/**
 * Adds an index that massively speeds up the query to get unmarked essay questions.
 */
function add_index_question_attempt_steps() {

    global $DB;

    $dbman = $DB->get_manager();

    // Define index amb_questattstep_combo to be added to question_attempt_steps.
    $table = new xmldb_table('question_attempt_steps');
    $index = new xmldb_index('amb_questattstep_combo', XMLDB_INDEX_UNIQUE, array('state', 'questionattemptid'));

    // Conditionally launch add index amb_questattstep_combo.
    if (!$dbman->index_exists($table, $index)) {
        $dbman->add_index($table, $index);
    }

}
