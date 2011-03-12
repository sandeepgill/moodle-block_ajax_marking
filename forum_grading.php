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
 * Class file for forum_functions
 *
 * @package   blocks-ajax_marking
 * @copyright 2008-2010 Matt Gibson
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_login(0, false);
/**
 * Provides functionality for grading of forum discussions
 */
class forum_functions extends module_base {

    /**
     * Constructor
     *
     * @param object $mainobject parent object passed in by reference
     */
    function __construct(&$mainobject) {
        $this->mainobject = $mainobject;
        // must be the same as th DB modulename
        $this->type = 'forum';
        $this->capability = 'mod/forum:viewhiddentimedposts';
        $this->levels = 3;
        $this->icon = 'mod/forum/icon.gif';
        $this->functions  = array(
            'forum' => 'submissions'
        );
    }


    /**
     * Gets all unmarked forum posts, but defines unmarked as not marked by the current account. If
     * another teacher has marked it, that is a problem.
     *
     * @return <type> gets all unmarked forum discussions for all courses
     */
    function get_all_unmarked() {
        global $CFG, $USER, $DB;

        list($coursesql, $courseparams) = $DB->get_in_or_equal($this->mainobject->courseids, SQL_PARAMS_NAMED, 'forumcourseparam0000');

        $teachersql = $this->get_teacher_sql();

        $params = $courseparams;

        $sql = "SELECT p.id as postid, p.userid, d.id, f.id, f.name, f.course, cm.id as cmid
                  FROM {forum_posts} p
             LEFT JOIN {rating} r
                    ON p.id = r.itemid
            INNER JOIN {forum_discussions} d
                    ON p.discussion = d.id
            INNER JOIN {forum} f
                    ON d.forum = f.id
            INNER JOIN {course_modules} cm
                    ON f.id = cm.instance
            INNER JOIN {course} c
                    ON c.id = f.course
                 WHERE p.userid <> :userid
                   AND f.course $coursesql
                   AND ( ( (r.userid <> :userid2) AND {$teachersql})
                         OR r.userid IS NULL)
                   AND cm.module = :moduleid
                   AND c.visible = 1
                   AND ((f.type <> 'eachuser') OR (f.type = 'eachuser' AND p.id = d.firstpost))
                   AND f.assessed > 0
              ORDER BY f.id";

        $params['userid'] = $USER->id;
        $params['userid2'] = $USER->id;
        $params['moduleid'] = $this->mainobject->modulesettings[$this->type]->id;

        $this->all_submissions = $DB->get_records_sql($sql, $params);
        return true;
    }

    /**
     * Gets all unmarked forum posts in a particular course
     *
     * @param int $courseid the id of the course we wnat to get forum posts for
     *
     * @return array database results array
     */
    function get_all_course_unmarked($courseid) {

        //return array();

        global $CFG, $USER, $DB;
        $unmarked = '';

        $context = get_context_instance(CONTEXT_COURSE, $courseid);

        $student_sql = $this->get_role_users_sql($context);
        $params = $student_sql->params;

        $sql = "SELECT p.id as post_id, p.userid, d.firstpost, f.course, f.type, f.id, f.name,
                       f.intro as description, c.id as cmid
                  FROM {forum} f
            INNER JOIN {course} c
                    ON c.id = f.course
            INNER JOIN {course_modules} cm
                    ON f.id = cm.instance
            INNER JOIN {forum_discussions} d
                    ON d.forum = f.id
            INNER JOIN {forum_posts} p
                    ON p.discussion = d.id
             LEFT JOIN {rating} r
                    ON p.id = r.itemid
            INNER JOIN ({$student_sql->sql}) stsql
                    ON p.userid = stsql.id
                 WHERE p.userid <> :userid
                   AND (((r.userid <> :userid2) AND ".$this->get_teacher_sql().")
                    OR r.userid IS NULL)
                   AND ((f.type <> 'eachuser') OR (f.type = 'eachuser' AND p.id = d.firstpost))
                   AND cm.module = :moduleid
                   AND cm.visible = 1
                   AND f.course = :courseid
                   AND f.assessed > 0
              ORDER BY f.id";
        $params['userid'] = $USER->id;
        $params['userid2'] = $USER->id;
        $params['moduleid'] = $this->mainobject->modulesettings[$this->type]->id;
        $params['courseid'] = $courseid;

//        echo $sql;
//        print_r($params);
//        die;

        $unmarked = $DB->get_records_sql($sql, $params);
        return $unmarked;
    }

    /**
     * Puts all the generation of the sql for 'is this person not a teacher in this course' This is so
     * that anything already marked by another teacher will not show up.
     *
     * Assumes that it is part of a larger query with course aliased as c
     *
     * @param int $forumid
     * @return array named parameters
     */
    function get_teacher_sql() {

        // making a where not exists to make sure the rating is not a teacher.
        // asume that the main query has a 'course c' and 'ratings r' clause in FROM

        // correlated sub query for the where should be OK if the joins only give a small number of
        // rows

        // role_assignment -> context -> cat1 -> coursecategory
        //                            -> cat1 -> coursecategory
        //

        $categorylevels = ajax_marking_functions::get_number_of_category_levels();

        // get category and course role assignments separately
        // for category level, we look for users with a role assignment where the contextinstance can be
        // left joined to any category that's a parent of the suplied course
        $select = "NOT EXISTS( SELECT 1
                                 FROM {role_assignments} ra
                           INNER JOIN {context} cx
                                   ON ra.contextid = cx.id
                           INNER JOIN {course_categories} cat1
                                   ON cx.instanceid = cat1.id ";

        $selectwhere = array('c.category = cat1.id');

        for ($i = 2; $i <= $categorylevels; $i++) {

            $onebefore = $i - 1;

            $select .=     "LEFT JOIN {course_categories} cat{$i}
                                   ON cat{$onebefore}.parent = cat{$i}.id ";
            $selectwhere[] =         "c.category = cat{$i}.id";

        }

        $select .= 'WHERE('.implode(' OR ', $selectwhere).') ';
        $select .= 'AND ra.userid = r.userid
                    AND cx.contextlevel = '.CONTEXT_COURSECAT.' ';


        $select .=            " UNION

                               SELECT 1
                                 FROM {role_assignments} ra
                           INNER JOIN {context} cx
                                   ON ra.contextid = cx.id
                                WHERE cx.contextlevel = ".CONTEXT_COURSE." 
                                  AND ra.userid = r.userid
                                  AND cx.instanceid = c.id
                                ) ";

        return $select;

    }

    /**
     * function to make nodes for forum submissions. It works on the existing object data
     * and outputs via echo to make the AJAX response
     *
     * @return void
     */
    function submissions() {

        global $CFG, $USER, $DB;

        $discussions = '';
        $forum = $DB->get_record('forum', array('id' => $this->mainobject->id));
        $courseid = $forum->course;

        // so we have cached student details
        $course = $DB->get_record('course', array('id' => $courseid));
        $this->mainobject->get_course_students($course);

        $discussions = $DB->get_records('forum_discussions', array('forum' => $this->mainobject->id));

        if (!$discussions) {
            return;
        }

        $coursecontext = get_context_instance(CONTEXT_COURSE, $courseid);
        $student_sql = $this->get_role_users_sql($coursecontext, true, SQL_PARAMS_NAMED);
        $params = $student_sql->params;

        // get ready to fetch all the unrated posts
        $sql = 'SELECT p.id, p.userid, p.created, p.message, d.id as discussionid
                  FROM {forum_discussions} d ';

        if ($forum->type == 'eachuser') {
            // add a bit to link to forum so we can check the type is correct
            $sql .= 'INNER JOIN {forum} f ON d.forum = f.id ';
        }

        $sql .= "INNER JOIN {forum_posts} p
                         ON p.discussion = d.id
                 INNER JOIN ({$student_sql->sql}) stsql
                         ON p.userid = stsql.id
                 INNER JOIN {course} c
                         ON d.course = c.id
                  LEFT JOIN {rating} r
                         ON p.id = r.itemid
                      WHERE d.forum = :forum
                        AND p.userid <> :userid1
                        AND (((r.userid <> :userid2) AND ".$this->get_teacher_sql().")
                         OR r.userid IS NULL) ";

        if ($forum->type == 'eachuser') {
            // make sure that it is just the first posts that we get
            $sql .= "AND (f.type = 'eachuser' AND p.id = d.firstpost)";
        }

        $params['forum'] = $this->mainobject->id;
        $params['userid1'] = $USER->id;
        $params['userid2'] = $USER->id;
        

        // TODO this is NOT fast at all. Even on a small DB.
        $posts = $DB->get_records_sql($sql, $params);

        if ($posts) {

            foreach ($posts as $key=>$post) {

                // sort for obvious exclusions
                if (!isset($post->userid)) {
                    unset($posts[$key]);
                    continue;
                }
                // Maybe this forum doesn't rate posts earlier than X time, so we check.
                if ($forum->assesstimestart != 0) {

                    if (!($post->created > $forum->assesstimestart)) {
                        unset($posts[$key]);
                        continue;
                    }
                }
                // Same for later cut-off time
                if ($forum->assesstimefinish != 0) {
                    // it also has a later limit, so check that too.
                    if (!($post->created < $forum->assesstimefinish)) {
                        unset($posts[$key]);
                        continue;
                    }
                }
            }

            // Check to see if group nodes need to be made instead of submissions

            if (!$this->mainobject->group) {
                $group_filter = $this->mainobject->assessment_groups_filter($posts, $this->type,
                                                                            $forum->id, $forum->course);

                if (!$group_filter) {
                    return;
                }
            }

            // Submissions nodes are needed, so make one per discussion
            $this->mainobject->output = '[{"type":"submissions"}';      // begin json object.

            // we may have excluded all of them now, so check again
            if (count($posts) > 0) {

                foreach ($discussions as $discussion) {

                    $firstpost = null;

                    // If we are under a group node, we want to ignore submissions from other groups
                    $groupnode     = $this->mainobject->group;
                    $memberofgroup = $this->mainobject->check_group_membership($groupnode, $discussion->userid);

                    if ($groupnode && !$memberofgroup) {
                        continue;
                    }

                    $count = 0;
                    // This variable will hold the id of the first post which is unrated, so it can
                    // be used in the link to load the pop up with the discussion page at that position.
                    $sid = 0;
                    // Start seconds at current time so we can compare with time created to find the
                    // oldest as we cycle through.
                    $time = time();

                    // If this forum is set to 'each student posts one discussion', we want to only
                    // grade the first one, which is the only one returned.
                    if ($forum->type == 'eachuser') {
                         $count = 1;
                         $firstpost = $post;
                    } else {
                        // Any other type of graded forum, we can grade any posts that are not yet
                        // graded. This means counting them first.

                        // Start seconds at current time so we can compare with time created to find
                        // the oldest as we cycle through.
                        $time = time();
                        $firsttime = '';

                        foreach ($posts as $key=>$post) {

                            if ($discussion->id == $post->discussionid) {
                                //post is relevant
                                $count++;

                                // link needs the id of the earliest post, so store time if this is
                                // the first post; check and modify for subsequent ones
                                if ($firstpost) {

                                    if ($post->created > $firstpost) {
                                        $firstpost = $post;
                                    }
                                } else {
                                    $firstpost = $post;
                                }
                                // store the time created for the tooltip if its the oldest post yet
                                // for this discussion
                                if ($firsttime) {

                                    if ($post->created < $time) {
                                        $time = $post->created;
                                    }
                                } else {
                                    $firsttime = $post->created;
                                }
                            }
                        }
                    }

                    // Add the node if there were any posts -  the node is the discussion with a
                    // count of the number of unrated posts.
                    if ($count > 0) {

                        // Make all the variables ready to put them together into the array.
                        $seconds = time() - $discussion->timemodified;

                        // We will show the student name as the node name as there is only one post
                        // that matters.
                        if ($forum->type == 'eachuser') {
                            $name = $this->mainobject->get_fullname($firstpost->userid);

                        } else {
                            // // the name will be the name of the discussion
                            $name = $discussion->name.' ('.$count.')';

                        }

                        $sum = strip_tags($firstpost->message);

                        $shortsum = substr($sum, 0, 100);

                        if (strlen($shortsum) < strlen($sum)) {
                            $shortsum .= '...';
                        }
                        $timesum = $this->mainobject->make_time_summary($seconds, true);

                        if (!isset($discuss)) {
                            $discuss = get_string('discussion', 'forum');
                        }
                        $summary = $discuss.': '.$shortsum.'<br />'.$timesum;

                        $node = $this->mainobject->make_submission_node(array(
                                'name' => $name,
                                'firstpostid' => $firstpost->id,
                                'discussionid' => $discussion->id,
                                'uniqueid' => 'forum_final'.$discussion->id.'-'.$firstpost->id,
                                'title' => $summary,
                                'type' => 'forum_final',
                                'seconds' => $seconds,
                                'time' => $time,
                                'count' => $count));

                        $this->mainobject->output .= $node;
                    }
                }
            }
            $this->mainobject->output .= ']';
        }
    }

    /**
     * gets all of the forums for all courses, ready for the config tree. Stores them as an object property
     *
     * @global object $CFG
     *
     * @return void
     */
    function get_all_gradable_items() {

        global $CFG, $DB;

        list($usql, $params) = $DB->get_in_or_equal($this->mainobject->courseids, SQL_PARAMS_NAMED);

        $sql = "SELECT f.id, f.course, f.intro as summary, f.name, f.type, c.id as cmid
                  FROM {forum} f
            INNER JOIN {course_modules} c
                    ON f.id = c.instance
                 WHERE c.module = :moduleid
                   AND c.visible = 1
                   AND f.course $usql
                   AND f.assessed > 0
              ORDER BY f.id";
        $params['moduleid'] = $this->mainobject->modulesettings['forum']->id;
        $forums = $DB->get_records_sql($sql, $params);
        $this->assessments = $forums;
    }

    /**
     * Returns a HTML link allowing a student's work to be marked
     *
     * @param object $item a row of the database tabe representing one discussion post
     *
     * @return string
     */
    function make_html_link($item) {
        global $CFG;
        $address = $CFG->wwwroot.'/mod/forum/view.php?id='.$item->cmid;
        return $address;
    }


}