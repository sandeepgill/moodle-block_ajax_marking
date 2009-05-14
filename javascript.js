// JavaScript for the AJAX marking block


YAHOO.namespace('AJAXmarking');

YAHOO.AJAXmarking = {

    // the following 2 variables sometimes hold different things e.g. user id or submission
    // this holds the assessment id so it can be accessed by other functions
    aidHolder : '', 
    // this holds the submission id so it can be accessed by other functions.
    sidHolder : '',                           
    // this holds the parent node so it can be referenced by other functions                                                    
    nodeHolder : '',           
    // this holds the callback function of the parent node so it can be called once all the child nodes have been built
    compHolder : '',  
    // what does this do?
    checkVar : 6,
    // all pieces of work to be marked. Updated dynamically by altering this.
    totalCount : 0,   
    // the div that holds totalCount
    valueDiv : '',             
    // this is the variable used by the openPopup function on the front page. 
    windowobj : '',                    
    // this holds the timer that keeps trying to add the onclick stuff to the pop ups as the pop up loads
    timerVar : '',
    // same but for closing the frames for a workshop
    frameTimerVar : '',

    t : 0,
    
    // objects which form the trees - the main display one for the block and if needed, the config one.
    main : '',
    config : '',


    /**
     * just moved out from ajaxtree, this needs:
     * @ the tree icon div
     * @ the tree div for construction
     * @ the tree loadcounter (what was this for?)
     * @ the tree ajaxcallback function (same for both?)
     */
    ajaxBuild : function(tree) {

        var sUrl = amVariables.wwwroot+'/blocks/ajax_marking/ajax.php';
        var postData = '';
        if (tree.loadCounter === 0) {

            tree.icon.setAttribute('class', 'loaderimage');
            tree.icon.setAttribute('className', 'loaderimage');
            // if this is the config tree, we need to ask for config_courses
            if (tree.config) {
                postData = 'id='+amVariables.userid+'&type=config_main&userid='+amVariables.userid;
            } else {
                postData = 'id='+amVariables.userid+'&type=main&userid='+amVariables.userid;
            }

            var request = YAHOO.util.Connect.asyncRequest('POST', sUrl, AJAXmarkingCallback, postData);
            tree.loadCounter = 1;
        }
    },

    /**
     * ajax success function which checks the data coming in and calls the right function.
     * @
     */
    AJAXsuccess : function (o) {

        var type = null;
        var responseArray = null;
        var label = '';

        /* uncomment for debugging output for the admin user

        if (userid == 2) {
            var checkDiv = document.getElementById("conf_left");
            checkDiv.innerHTML = o.responseText;
        }

        */
        try {
            responseArray = YAHOO.lang.JSON.parse(o.responseText);
        } catch (error) {
            // if the response is not JSON, we have got back the contents of one of the pop ups

            // add it to the panel

            //YAHOO.AJAXmarking.greyOut.setBody(o.responseText);

            //YAHOO.AJAXmarking.greyOut.beforeHideEvent.subscribe(function() {

            //});

            //YAHOO.AJAXmarking.greyOut.render(document.body);
            //YAHOO.AJAXmarking.greyOut.show();

  
        }
        // first object holds data about what kind of nodes we have so we can fire the right function.
        if (responseArray != null) {
            type = responseArray[0].type;
            // remove the data object, leaving just the node objects
            responseArray.shift();

           // TODO - these are inconsistent. Some refer to where the request
           // is triggered and some to what it creates.
            switch (type) {

                case 'main':

                    YAHOO.AJAXmarking.makeCourseNodes(responseArray, YAHOO.AJAXmarking.main);
                    break;

                case 'course':

                    YAHOO.AJAXmarking.makeAssessmentNodes(responseArray, YAHOO.AJAXmarking.main);
                    YAHOO.AJAXmarking.ie_width();
                    break;

                // this replaces the ones above and below
                case 'assessments':
                    YAHOO.AJAXmarking.makeAssessmentNodes(responseArray, YAHOO.AJAXmarking.main);
                    break;

                case 'quiz_question':
                    YAHOO.AJAXmarking.makeAssessmentNodes(responseArray, YAHOO.AJAXmarking.main);
                    break;

                case 'groups':

                    YAHOO.AJAXmarking.makeGroupNodes(responseArray, YAHOO.AJAXmarking.main);
                    break;

                case 'submissions':

                    YAHOO.AJAXmarking.makeSubmissionNodes(responseArray, YAHOO.AJAXmarking.main);
                    break;

                case 'config_main':

                    YAHOO.AJAXmarking.makeCourseNodes(responseArray, YAHOO.AJAXmarking.config);
                    break;

                case 'config_course':

                    YAHOO.AJAXmarking.makeAssessmentNodes(responseArray, YAHOO.AJAXmarking.config);
                    break;

                case 'config_groups':

                    // called when the groups settings have been updated.

                    // TODO - only change the select value, don't totally re build them
                    YAHOO.AJAXmarking.makeConfigGroupsList(responseArray, YAHOO.AJAXmarking.config);
                    break;

                case 'config_set':
                    //just need to un-disable the radio button
                    
                    if (responseArray[0].value === false) {
                        label = document.createTextNode(amVariables.configNothingString);
                        YAHOO.AJAXmarking.removeNodes(YAHOO.AJAXmarking.config.status);
                        YAHOO.AJAXmarking.config.status.appendChild(label);
                    } else {
                        YAHOO.AJAXmarking.enableRadio();
                    }
                    break;

                case 'config_check':
                    // called when any data about config comes back after a request (not a data setting request)

                    // make the id of the checkbox div
                    var checkId = 'config'+responseArray[0].value;

                    // make the radio button on screen match the value in the database that was just returned.
                    document.getElementById(checkId).checked = true;
                    // if its set to 'display by groups', make the groups bit underneath
                    if (responseArray[0].value == 2) {
                        // remove the config bit leaving just the groups, which were tacked onto the end of the returned array
                        responseArray.shift();
                        //make the groups bit
                        YAHOO.AJAXmarking.makeConfigGroupsList(responseArray);
                    }
                    //allow the radio buttons to be clicked again
                    YAHOO.AJAXmarking.enableRadio();
                    break;

                case 'config_group_save':

                    if (responseArray[0].value === false) {
                        YAHOO.AJAXmarking.config.status.innerHTML = 'AJAX error';
                    } else {
                        YAHOO.AJAXmarking.enableRadio();
                    }

                    break;

            }
        }
    },

    /**
     * function which fires if the AJAX call fails
     * TODO: why does this not fire when the connection times out?
     */
    AJAXfailure : function (o) {
        if (o.tId == -1) {
            div.innerHTML =  amVariables.collapseString;
        }
        if (o.tId === 0) {
            div.innerHTML = amVariables.connectFail;
        }
    },

    /**
     * Creates the initial nodes for both the main block tree or configuration tree.
     */
    makeCourseNodes : function(nodesArray, AJAXtree) {

        var label = '';

        // make the array of nodes
        var nodesLeng = nodesArray.length;
        // the array is empty, so say there is nothing to mark
        if (nodesLeng === 0) {
            if (AJAXtree.treeDiv === 'treediv') {
                label = document.createTextNode(amVariables.configNothingString);
            } else {
                label = document.createTextNode(amVariables.nothingString);
            }
            AJAXtree.div.appendChild(label);
            AJAXtree.icon.removeAttribute('class', 'loaderimage');
            AJAXtree.icon.removeAttribute('className', 'loaderimage');
        } else { 
            // there is a tree to be drawn

            // cycle through the array and make the nodes
            for (n=0;n<nodesLeng;n++) {
                if (AJAXtree.treeDiv === 'treediv') { //only show the marking totals if its not a config tree
                    label = '('+nodesArray[n].count+') '+nodesArray[n].name;
                } else {
                    label = nodesArray[n].name;
                }

                var tmpNode1 = new YAHOO.widget.TextNode(nodesArray[n], AJAXtree.root, false);

                // save reference in the map for the context menu
                // AJAXtree.textNodeMap[tmpNode1.labelElId] = tmpNode1;

                tmpNode1.labelStyle = 'icon-course';
                tmpNode1.setDynamicLoad(YAHOO.AJAXmarking.loadNodeData);
            }

            // now make the tree, add the total at the top and remove the loading icon
            AJAXtree.tree.render();

            // get rid of the loading icon - IE6 is rubbish so use 2 methods
            AJAXtree.icon.removeAttribute('class', 'loaderimage');
            AJAXtree.icon.removeAttribute('className', 'loaderimage');

            // add onclick events
            // Main tree option first:
            if (!AJAXtree.config) {

                // Alter total count above tree
                label = document.createTextNode(amVariables.totalMessage);
                var total = document.getElementById('totalmessage');
                YAHOO.AJAXmarking.removeNodes(total);
                total.appendChild(label);
                YAHOO.AJAXmarking.updateTotal();

                // this function is the listener for the main tree. Event bubbling means that this will catch all node clicks
                AJAXtree.tree.subscribe(
                    "clickEvent",
                    function(oArgs) {

                        // ref saves space
                        var nd = oArgs.node;

                        // putting window.open into the switch statement causes it to fail in IE6. No idea why.
                        var popUpAddress = amVariables.wwwroot;
                        var popUpArgs = 'menubar=0,location=0,scrollbars,resizable,width=780,height=500';
                        var timerFunction = '';
                        var popUpUrl = '';
                        // not used yet - waiting to get web services going so this can be ana ajax call for a panel widget
                        var popUpPost = '';
                        
                        

                        if (nd.data.dynamic == 'true') {
                            return true;
                        }
                           
                        switch (nd.data.type) {

                            case 'quiz_answer':

                                popUpPost = 'mode=grading&action=grade&q='+nd.parent.parent.data.id+'&questionid='+nd.data.aid+'&userid='+nd.data.sid;
                                popUpUrl = '/mod/quiz/report.php';
                                popUpAddress += '/mod/quiz/report.php?mode=grading&action=grade&q='+nd.parent.parent.data.id+'&questionid='+nd.data.aid+'&userid='+nd.data.sid+'';
                                timerFunction = 'YAHOO.AJAXmarking.quizOnLoad(\''+nd.data.id+'\')';

                                break;

                            case 'assignment_answer':

                                popUpPost = 'id='+nd.data.aid+'&userid='+nd.data.sid+'&mode=single&offset=0';
                                popUpUrl = '/mod/assignment/submissions.php';
                                popUpAddress += '/mod/assignment/submissions.php?id='+nd.data.aid+'&userid='+nd.data.sid+'&mode=single&offset=0';
                                timerFunction = function() {YAHOO.AJAXmarking.assignmentOnLoad(nd.data.id, nd.data.sid);};
                                // timerFunction = 'YAHOO.AJAXmarking.assignmentOnLoad(\''+nd.data.id+'\', \''+nd.data.sid+'\')';
                                break;

                            case 'workshop_answer':

                                popUpPost = 'id='+nd.data.aid+'&sid='+nd.data.sid+'&redirect='+amVariables.wwwroot;
                                popUpUrl = '/mod/workshop/assess.php';
                                popUpAddress += '/mod/workshop/assess.php?id='+nd.data.aid+'&sid='+nd.data.sid+'&redirect='+amVariables.wwwroot+'';
                                timerFunction = 'YAHOO.AJAXmarking.workshopOnLoad(\''+nd.data.id+'\')';
                                break;

                            case 'discussion':

                                popUpPost = 'd='+nd.data.aid+'#p'+nd.data.sid;
                                popUpUrl = '/mod/forum/discuss.php';
                                
                                popUpAddress += '/mod/forum/discuss.php?d='+nd.data.aid+'#p'+nd.data.sid;
                                timerFunction = 'YAHOO.AJAXmarking.forumOnLoad(\''+nd.data.id+'\')';
                                break;

                            case 'journal':

                                popUpPost = 'id='+nd.data.cmid;
                                popUpUrl = '/mod/journal/report.php';

                                popUpArgs = 'menubar=0,location=0,scrollbars,resizable,width=900,height=500';
                                popUpAddress += '/mod/journal/report.php?id='+nd.data.cmid+'';
                                // TODO this is for the level 2 ones where there are group nodes that lead to
                                // a pop-up. Need to make this dynamic - the extension to the url may differ.
                                ((typeof(nd.data.group)) != 'undefined') ? popUpAddress += '&group='+nd.data.group+'' : popUpAddress += '' ;
                                timerFunction = function() {YAHOO.AJAXmarking.journalOnLoad(nd.data.id);};
                                // timerFunction = 'YAHOO.AJAXmarking.journalOnLoad(\''+nd.data.id+'\')';
                                break;
                        }

                        if (timerFunction !== '') {

                            // make a panel if it's not there already - can we use the one from greyout?
                            // if (!YAHOO.AJAXmarking.greyOut) {
                            //    YAHOO.AJAXmarking.makePanel();
                            // }
                            // var request = YAHOO.util.Connect.asyncRequest('POST', popUpUrl, AJAXmarkingCallback, popUpPost);
                            // Prepare the vaiables above

                            // make a new AJAX call
                            

                            YAHOO.AJAXmarking.windowobj = window.open(popUpAddress, '_blank', popUpArgs);
                            YAHOO.AJAXmarking.timerVar  = window.setInterval(timerFunction, 2000);
                            //YAHOO.util.Event.addListener(YAHOO.AJAXmarking.windowobj, 'load', timerFunction);
                            //YAHOO.AJAXmarking.windowobj.location.href = popUpAddress;

                            YAHOO.AJAXmarking.windowobj.focus();
                                

                            return false;
                        }
                        return true;
                    }
                );
                // Make the footer divs if they don't exist
                if (!document.getElementById('AMBcollapse')) {
                    YAHOO.AJAXmarking.makeFooter();
                }

            } else { 

                // procedure for config tree nodes:
                // This function is the listener for the config tree that makes the onclick stuff happen
                AJAXtree.tree.subscribe(
                    'clickEvent',
                    function(oArgs) {

                        var AJAXdata  = '';

                        // function to make checkboxes for each of the three main options
                        function makeBox(value, id, label) {
                            try{
                                box = document.createElement('<input type="radio" name="showhide" />');
                            }catch(error){
                                box = document.createElement('input');
                            }
                            box.setAttribute('type','radio');
                            box.setAttribute('name','showhide');
                            box.value = value;
                            box.id    = id;
                            box.onclick = function() {
                                YAHOO.AJAXmarking.configCheckboxAJAXRequest(this);
                            };
                            formDiv.appendChild(box);

                            var boxText = document.createTextNode(label);
                            formDiv.appendChild(boxText);
                            
                            var breaker = document.createElement('br');
                            formDiv.appendChild(breaker);
                        }

                        // remove group nodes from the previous item if they are there.
                        YAHOO.AJAXmarking.clearGroupConfig();
                        
                        var title   = document.getElementById('configInstructions');
                        title.innerHTML = oArgs.node.data.icon+oArgs.node.data.name;
                        

                        var formDiv = document.getElementById('configshowform');
                        // grey out the form before ajax call - it will be un-greyed later
                        formDiv.style.color = '#AAA';

                       

                        // add hidden variables so they can be used for the later AJAX calls
                        // If it's a course, we send things a bit differently
                       
                        var hidden1       = document.createElement('input');
                            hidden1.type  = 'hidden';
                            hidden1.name  = 'course';
                            hidden1.value = (oArgs.node.data.type == 'config_course') ? oArgs.node.data.id : oArgs.node.parent.data.id;
                        formDiv.appendChild(hidden1);
                        
                        var hidden2       = document.createElement('input');
                            hidden2.type  = 'hidden';
                            hidden2.name  = 'assessment';
                            hidden2.value = oArgs.node.data.id;
                        formDiv.appendChild(hidden2);

                        var hidden3   = document.createElement('input');
                            hidden3.type  = 'hidden';
                            hidden3.name  = 'assessmenttype';
                            hidden3.value = (oArgs.node.data.type == 'config_course') ? 'course' : oArgs.node.data.type;
                        formDiv.appendChild(hidden3);

                        // For non courses, add a default checkbox that will remove the record
                        makeBox('default',   'config0', amVariables.confDefault);


                        // make the three main checkboxes, appending them to the form as we go along
                        makeBox('show',   'config1', amVariables.confShow);
                        makeBox('groups', 'config2', amVariables.confGroups);
                        makeBox('hide',   'config3', amVariables.confHide);

                        // now, we need to find out what the current group mode is and display that box as checked.
                        var AJAXUrl   = amVariables.wwwroot+'/blocks/ajax_marking/ajax.php';
                        if (oArgs.node.data.type !== 'config_course') {
                            AJAXdata += 'courseid='       +oArgs.node.parent.data.id;
                            AJAXdata += '&assessmenttype='+oArgs.node.data.type;
                            AJAXdata += '&assessmentid='  +oArgs.node.data.id;
                            AJAXdata += '&type=config_check';
                        } else {
                            AJAXdata += 'courseid='             +oArgs.node.data.id;
                            AJAXdata += '&assessmenttype=course';
                            AJAXdata += '&type=config_check';
                        }
                        var request   = YAHOO.util.Connect.asyncRequest('POST', AJAXUrl, AJAXmarkingCallback, AJAXdata);

                        return true;
                    }
                );
            }
        }
    },

    /**
     * Obsolete function to make tooltips for the whole tree using YUI container widget. Overkill, so disabled
     */
    tooltips : function(tree) {

        var name = navigator.appName;
        if (name.search('iPhone') == -1) {
            // this is disabled for IE because, although useful, in IE6 (assuming others too) the tooltips seem to sometimes remain as an invisible div on top
            // of the tree structure once nodes has expanded, so that some of the child nodes are unclickable. Firefox is ok with it. This is a pain
            // because a person may not remember the full details of the assignment that was set and a tooltip is better than leaving the front page.
            // I will re-enable it once I find a fix

            var i = 0;
            var j = 0;
            var k = 0;
            var m = 0;
            var n = 0;
           
            if (tree.div != 'treeDiv') {
                return false;
            }
            // 1. all courses loop
            var numberOfCourses = tree.root.children.length;
            for (i=0;i<numberOfCourses;i++) {
                node = tree.root.children[i];
                YAHOO.AJAXmarking.make_tooltip(node);
                var numberOfAssessments = tree.root.children[i].children.length;
                for (j=0;j<numberOfAssessments;j++) {
                    // assessment level
                    node = tree.root.children[i].children[j];
                    YAHOO.AJAXmarking.make_tooltip(node);
                    var numberOfThirdLevelNodes = tree.root.children[i].children[j].children.length;
                    for (k=0;k<numberOfThirdLevelNodes;k++) {
                        // users level (or groups)
                        node = tree.root.children[i].children[j].children[k];
                        check = node.data.time;
                        if (typeof(check) !== null) {
                            YAHOO.AJAXmarking.make_tooltip(node);
                        }
                        var numberOfFourthLevelNodes = node.children.length;
                        for (m=0;m<numberOfFourthLevelNodes;m++) {
                            node = tree.root.children[i].children[j].children[k].children[m];
                            YAHOO.AJAXmarking.make_tooltip(node);
                            var numberOfFifthLevelNodes = node.children.length;
                            for (n=0;n<numberOfFifthLevelNodes;n++) {
                                node = tree.root.children[i].children[j].children[k].children[m].children[n];
                                YAHOO.AJAXmarking.make_tooltip(node);
                            }
                        }
                    }
                }
            }
            return true;
        }
        return false;
    },

    /**
     * This function enables the config popup radio buttons again after the AJAX request has
     * returned a success code.
     *
     */
    enableRadio : function() {
        var h ='';
        var radio = document.getElementById('configshowform');
        radio.style.color = '#000';

        for (h = 0; h < radio.childNodes.length; h++) {
            if (radio.childNodes[h].name == 'showhide') {
                radio.childNodes[h].setAttribute('disabled', false);
                radio.childNodes[h].disabled = false;
            }
        }
        var groupDiv = document.getElementById('configGroups');
        groupDiv.style.color = '#000';

        for (h = 0; h < groupDiv.childNodes.length; h++) {
            if (groupDiv.childNodes[h].type == 'checkbox') {
                groupDiv.childNodes[h].setAttribute('disabled', false);
                groupDiv.childNodes[h].disabled = false;
            }
        }
    },

    /**
     * This function disables the radio buttons when AJAX request is sent
     */
    disableRadio : function() {
        var h ='';
        var radio = document.getElementById('configshowform');
        radio.style.color = '#AAA';

        for (h = 0; h < radio.childNodes.length; h++) {
            if (radio.childNodes[h].type == 'radio') {
                radio.childNodes[h].setAttribute('disabled',  true);
            }
        }
        var groupDiv = document.getElementById('configGroups');
        groupDiv.style.color = '#AAA';

        for (h = 0; h < groupDiv.childNodes.length; h++) {
            if (groupDiv.childNodes[h].type == 'checkbox') {
                groupDiv.childNodes[h].setAttribute('disabled', true);
            }
        }
    },

    /**
     * this function is called when a node is clicked (expanded) and makes the ajax request
     */
    loadNodeData : function(node, onCompleteCallback) {

        /// store details of the node that has been clicked in globals for reference by later callback function
        YAHOO.AJAXmarking.nodeHolder = node;
        YAHOO.AJAXmarking.compHolder = onCompleteCallback;

        /// request data using AJAX
        var sUrl = amVariables.wwwroot+'/blocks/ajax_marking/ajax.php';
        var postData = 'id='+node.data.id+'&type='+node.data.type+'&userid='+amVariables.userid;

        if (typeof node.data.group  != 'undefined') { 
            //add group id if its there
            postData += '&group='+node.data.group;
        } 
        if (node.data.type == 'quiz_question') { 
            //add quiz id if this is a question node
            postData += '&quizid='+node.parent.data.id;
        } 

        var request = YAHOO.util.Connect.asyncRequest('POST', sUrl, AJAXmarkingCallback, postData);
    },



    /**
     * function to update the parent assessment node when it is refreshed dynamically so that
     * if more work has been found, or a piece has now been marked, the count for that label will be accurate
     */
    parentUpdate : function(AJAXtree, node) {

        var counter = node.children.length;

        if (counter === 0) {
            AJAXtree.tree.removeNode(node, true);
        } else {

            if (node.data.type == 'course' || node.children[0].data.gid != 'undefined' || node.data.type == 'forum' || node.data.type == 'quiz') { // we need to sum child counts

                var tempCount = 0;
                var tempStr = '';
                for (i=0;i<counter;i++) {
                    tempStr = node.children[i].data.count;
                    tempCount += parseInt(tempStr, 10);
                }

                YAHOO.AJAXmarking.countAlter(node, tempCount);
            } else {
                // its an assessment node, so we count the children
                YAHOO.AJAXmarking.countAlter(node, counter);
            }

            // TODO - does this still work?
            AJAXtree.tree.root.refresh();

        }
    },


    /**
     * function to create tooltips. When root.refresh() is called it somehow wipes
     * out all the tooltips, so it is necessary to rebuild them
     * each time part of the tree is collapsed or expanded
     * tooltips for the courses are a bit pointless, so its just the assignments and submissions
     *
     *
     * n.b. the width of the tooltips is fixed because not specifying it makes them go narrow in IE6. making them 100% works fine in IE6 but makes FF
     * stretch them across the whole page. 200px is a guess as to a good width for a 1024x768 screen based on the width of the block. Change it in both places below
     * if you don't like it
     *
     * IE problem - the tooltips appear to interfere with the submission nodes using ie, so that they are not always clickable, but only when the user
     * clicks the node text rather than the expand (+) icon. Its not related to the timings as using setTimeout to delay the generation of the tooltips
     * makes no difference
     */
    make_tooltip : function(node) {

        tempLabelEl = node.getLabelEl();
        tempText = node.data.summary;
        tempTooltip = new YAHOO.widget.Tooltip('tempTooltip', { context:tempLabelEl, text:tempText, showdelay:0, hidedelay:0, width:150, iframe:false, zIndex:1110} );

    },

    /**
     * function to build the assessment nodes once the AJAX request has returned a data object
     */
    makeAssessmentNodes : function(nodesArray, AJAXtree) {
        // uncomment for verbatim on screen output of the AJAX response for assessment and submission nodes
        // this.div.innerHTML += o.responseText;
        // alternatively, use the firebug extension for mozilla firefox - less messy.

        var tmpNode2 = '';

        // First the courses array
        var  nodesLeng = nodesArray.length;

        // cycle through the array and make the nodes
        for (m=0;m<nodesLeng;m++) {

            // set the correct language strings for the tooltip summaries
            // TODO - set the amVariables to have an array and the use amVarables[type]

            //Set the summary so that it makes sense.
            switch (nodesArray[m].type) {

            case 'assignment':
                  nodesArray[m].summary = amVariables.assignmentString+' '+nodesArray[m].summary+'';
                  break;
            case 'workshop':
                  nodesArray[m].summary = amVariables.workshopString+' '+nodesArray[m].summary+'';
                  break;
            case 'forum':
                  nodesArray[m].summary = amVariables.forumString+' '+nodesArray[m].summary+'';
                  break;
            case 'quiz':
                  nodesArray[m].summary = amVariables.quizString+' '+nodesArray[m].summary+'';
                  break;
            case 'journal':
                  nodesArray[m].summary = amVariables.journalString+' '+nodesArray[m].summary+'';
                  break;
            case 'journal_submissions':
                  nodesArray[m].summary = amVariables.journalString+' '+nodesArray[m].summary+'';
                  break;
            }

            // use the object to create a new node
            tmpNode2 = new YAHOO.widget.TextNode(nodesArray[m], YAHOO.AJAXmarking.nodeHolder , false);

            //AJAXtree.textNodeMap[tmpNode2.labelElId] = tmpNode2;

            // style the node acording to its type

            // tmpNode2.labelStyle = 'icon-'+nodesArray[m].type;
            /*
            switch (nodesArray[m].type) {

                case 'assignment':
                    tmpNode2.labelStyle = 'icon-assignment';
                    break;
                case 'workshop':
                    tmpNode2.labelStyle = 'icon-workshop';
                    break;
                case 'forum':
                    tmpNode2.labelStyle = 'icon-forum';
                    break;
                case 'quiz_question':
                    tmpNode2.labelStyle = 'icon-quiz_question';
                    break;
                case 'quiz':
                    tmpNode2.labelStyle = 'icon-quiz';
                    break;
                case 'journal':
                    tmpNode2.labelStyle = 'icon-journal';
                    break;
            }
            */
            // set the node to load data dynamically, unless it is marked as not dynamic e.g. journal
            if ((!AJAXtree.config) && (nodesArray[m].dynamic == 'true')) {
               tmpNode2.setDynamicLoad(YAHOO.AJAXmarking.loadNodeData);
            }

        } 

        //don't do the totals if its a config tree
        if (!AJAXtree.config) {
            YAHOO.AJAXmarking.parentUpdate(AJAXtree, YAHOO.AJAXmarking.nodeHolder );
        }

        // finally, run the function that updates the original node and adds the children
        YAHOO.AJAXmarking.compHolder();

        if (!AJAXtree.config) {
            YAHOO.AJAXmarking.updateTotal();
        }
        AJAXtree.root.refresh();

    },

    /**
    * makes the submission nodes for each student with unmarked work. Takes ajax data object as input
    */
    makeSubmissionNodes : function(nodesArray, AJAXtree) {

        var tmpNode3 = '';

        for (var k=0;k<nodesArray.length;k++) {

            // set up a unique id so the node can be removed when needed
            uniqueId = nodesArray[k].type + nodesArray[k].aid + 'sid' + nodesArray[k].sid + '';

            // set up time-submitted thing for tooltip. This is set to make the time match the browser's local timezone,
            // but I can't find a way to use the user's specified timezone from \$USER. Not sure if this really matters.

            var secs = parseInt(nodesArray[k].seconds, 10);
            // javascript likes to work in miliseconds, whereas moodle uses unix format (whole seconds)
            var time = parseInt(nodesArray[k].time, 10)*1000; 
            // make a new data object
            var d = new Date(); 
            // set it to the time we just got above
            d.setTime(time);  

            // altered - does this work?
            tmpNode3 = new YAHOO.widget.TextNode(nodesArray[k], YAHOO.AJAXmarking.nodeHolder , false);

            //AJAXtree.textNodeMap[tmpNode3.labelElId] = tmpNode3;

            // apply a style according to how long since it was submitted

            if (secs < 21600) {
                // less than 6 hours
                tmpNode3.labelStyle = 'icon-user-one';
            } else if (secs < 43200) {
                // less than 12 hours
                tmpNode3.labelStyle = 'icon-user-two';
            } else if (secs < 86400) {
                // less than 24 hours
                tmpNode3.labelStyle = 'icon-user-three';
            } else if (secs < 172800) {
                // less than 48 hours
                tmpNode3.labelStyle = 'icon-user-four';
            } else if (secs < 432000) {
                // less than 5 days
                tmpNode3.labelStyle = 'icon-user-five';
            } else if (secs < 864000) {
                // less than 10 days
                tmpNode3.labelStyle = 'icon-user-six';
            } else if (secs < 1209600) {
                // less than 2 weeks
                tmpNode3.labelStyle = 'icon-user-seven';
            } else {
                // more than 2 weeks
                tmpNode3.labelStyle = 'icon-user-eight';
            }

        } 

        // update all the counts on the various nodes
        YAHOO.AJAXmarking.parentUpdate(AJAXtree, YAHOO.AJAXmarking.nodeHolder);
        //might be a course, might be a group if its a quiz by groups
        YAHOO.AJAXmarking.parentUpdate(AJAXtree, YAHOO.AJAXmarking.nodeHolder.parent);
        if (!YAHOO.AJAXmarking.nodeHolder.parent.parent.isRoot()) {
            this.parentUpdate(AJAXtree, YAHOO.AJAXmarking.nodeHolder.parent.parent);
            if (!YAHOO.AJAXmarking.nodeHolder.parent.parent.parent.isRoot()) {
                YAHOO.AJAXmarking.parentUpdate(AJAXtree, YAHOO.AJAXmarking.nodeHolder.parent.parent.parent);
            }
        }

        // finally, run the function that updates the original node and adds the children
        YAHOO.AJAXmarking.compHolder();
        YAHOO.AJAXmarking.updateTotal();

        // then add tooltips.
        //this.tooltips();

    },

    /**
     * Make the group nodes for an assessment
     */
    makeGroupNodes : function(responseArray, AJAXtree) {
        // need to turn the groups for this course into an array and attach it to the course
        // node. Then make the groups bit on screen
        // for the config screen??

        var arrayLength = responseArray.length;
        var tmpNode4 = '';

        for (var n =0; n<arrayLength; n++) {

            tmpNode4 = new YAHOO.widget.TextNode(responseArray[n], YAHOO.AJAXmarking.nodeHolder, false);

           // AJAXtree.textNodeMap[tmpNode4.labelElId] = tmpNode4;

            tmpNode4.labelStyle = 'icon-group';

            // if the groups are for journals, it is impossible to display individuals, so we make the
            // node clickable so that the pop up will have the group screen.
            // TODO make this into a dynamic thing based on another attribute of the data object
            if (responseArray[n].type !== 'journal') {
                tmpNode4.setDynamicLoad(YAHOO.AJAXmarking.loadNodeData);
            }
        }

        YAHOO.AJAXmarking.parentUpdate(AJAXtree, YAHOO.AJAXmarking.nodeHolder);
        YAHOO.AJAXmarking.parentUpdate(AJAXtree, YAHOO.AJAXmarking.nodeHolder.parent);
        YAHOO.AJAXmarking.compHolder();
        YAHOO.AJAXmarking.updateTotal();

    },


    /**
     *funtion to refresh all the nodes once the update operations have all been carried out by saveChangesAJAX()
     */

    refreshRoot : function(tree) {
        tree.root.refresh();
        if (tree.root.children.length === 0) {
            YAHOO.AJAXmarking.removeNodes(document.getElementById("totalmessage"));
            YAHOO.AJAXmarking.removeNodes(document.getElementById("count"));
            tree.div.appendChild(document.createTextNode(amVariables.nothingString));
        }
    },

    /**
     * The main constructor function for each of the tree objects
     */
    AJAXtree : function(treeDiv, icon, statusDiv, config) {

        this.loadCounter = 0;

        // YAHOO.widget.TreeView.preload();
        this.tree    = new YAHOO.widget.TreeView(treeDiv);

        // holds a map of textnodes for the context menu 
        // http://developer.yahoo.com/yui/examples/menu/treeviewcontextmenu.html
        //this.textNodeMap = {};

        this.treeDiv = treeDiv;
        this.icon    = document.getElementById(icon);
        this.div     = document.getElementById(statusDiv);
        this.config  = config;

        /// set the removal of all child nodes each time a node is collapsed (forces refresh)
        // not needed for config tree
        if (!config) { // the this keyword gets confused and can't be used for this
            this.tree.subscribe('collapseComplete', function(node) {
            // TODO - make this not use a hardcoded reference
            YAHOO.AJAXmarking.main.tree.removeChildren(node);
            });
        } 

        this.root = this.tree.getRoot();


        //this.contextMenu = new YAHOO.widget.ContextMenu("maincontextmenu", {
        //    trigger: treeDiv,
        //    lazyload: true,
        //    itemdata: [
                // Each of these is one line of the context menu when the tree is right clicked.
                // { text: this.currentTextNode.label  },
         //       { text: "Current group mode:", onclick: { } }
         //   ]
        //});
/*
        this.contextMenu.subscribe(
            "triggerContextMenu",  
            
            function (p_oEvent) {
            
                var oTarget = this.contextEventTarget;

                if (oTarget) {

                    this.currentTextNode = this.textNodeMap[oTarget.id];

                } else {
                    alert('no');
                    // Cancel the display of the ContextMenu instance.
                    this.cancel();
                }

            }
        );
        */
    }, 


    /**
     * funtion to refresh all the nodes once the operations have all been carried out - workshop frames version
     */
    refreshRootFrames : function(tree) {
        tree.root.refresh();
        if (tree.root.children.length === 0) {
            YAHOO.AJAXmarking.removeNodes(document.getElementById("totalmessage"));
            YAHOO.AJAXmarking.removeNodes(document.getElementById("count"));
            YAHOO.AJAXmarking.removeNodes(tree.div);
            tree.div.appendChild(document.createTextNode(amVariables.nothingString));
        }
    },

    /**
    * function to update the total marking count by a specified number and display it
    */
    updateTotal : function() {

        var count = 0;
        var countTemp = 0;
        var children = YAHOO.AJAXmarking.main.root.children;
        
        for (i=0;i<children.length;i++) {
            countTemp = children[i].data.count;
            count = count + parseInt(countTemp, 10);
        }
        
        if (count > 0) {
            var countDiv = document.getElementById('count');
            YAHOO.AJAXmarking.removeNodes(countDiv);
            countDiv.appendChild(document.createTextNode(count));
        }
    },

    /**
    * this function updates the tree to remove the node of the pop up that has just been marked, then it updates the parent nodes and refreshes the tree
    *
    */

    saveChangesAJAX : function(loc, AJAXtree, thisNodeId, frames) {
       
        var checkNode = "";
        var parentNode = "";
       
        /// remove the node that was just marked
        checkNode = AJAXtree.tree.getNodeByProperty("id", thisNodeId);

        // Now, we need to update all of the nodes up the tree hierarchy.
        // There are an uncertain number of levels, as different type have different 
        // sub-nodes, group nodes, etc
        parentNode  = AJAXtree.tree.getNodeByIndex(checkNode.parent.index);
        parentNode1 = AJAXtree.tree.getNodeByIndex(parentNode.parent.index);
        
        // this will be the course node if there is a quiz or groups
        if (parentNode1 && (typeof(parentNode1) != 'undefined') && !parentNode1.parent.isRoot()) { // the node above is not root so we need it
            parentNode2 = AJAXtree.tree.getNodeByIndex(parentNode1.parent.index);
        } else {
            parentNode2 = null;
        }
        
        // this will be the course node if there is both a quiz and groups
        if ((typeof(parentNode2) != 'undefined') && (!parentNode2.parent.isRoot())) {
            
            parentNode3 = AJAXtree.tree.getNodeByIndex(parentNode2.parent.index);
        } else {
            parentNode3 = null;
        }

        AJAXtree.tree.removeNode(checkNode, true);

        YAHOO.AJAXmarking.parentUpdate(AJAXtree, parentNode);
        // TODO - some are null and some are undefined
        if (parentNode1) {
            YAHOO.AJAXmarking.parentUpdate(AJAXtree, parentNode1);
        }
        if (parentNode2) {
            YAHOO.AJAXmarking.parentUpdate(AJAXtree, parentNode2);
        }
        if (parentNode3) {
            YAHOO.AJAXmarking.parentUpdate(AJAXtree, parentNode3);
        }

        /// refresh the tree to redraw the nodes with the new labels
        if (typeof(frames) != 'undefined') {
            YAHOO.AJAXmarking.refreshRootFrames(AJAXtree);
        } else {
            YAHOO.AJAXmarking.refreshRoot(AJAXtree);
        }

        YAHOO.AJAXmarking.updateTotal();
        YAHOO.AJAXmarking.tooltips(AJAXtree);

        if (loc != -1) { // no need if its an assignment as the pop up is self closing
            windowLoc = "YAHOO.AJAXmarking.afterLoad('"+loc+"')";
            setTimeout(windowLoc, 500);
        }
    },

        
    /**
    * Refresh tree function - for Collapse & refresh link in the main block
    */
    refreshTree : function(treeObj) {


        treeObj.loadCounter = 0;

        if (treeObj.root.children.length >0) {
            treeObj.tree.removeChildren(treeObj.root);
            treeObj.root.refresh();
        }

        YAHOO.AJAXmarking.removeNodes(document.getElementById('conf_right'));
        YAHOO.AJAXmarking.removeNodes(document.getElementById('conf_left'));
        YAHOO.AJAXmarking.removeNodes(treeObj.div);
        YAHOO.AJAXmarking.ajaxBuild(treeObj);
    },

    /**
     * Makes a list of groups as checkboxes and appends them to the config div next to the config tree.
     * Called when the 'show by groups' check box is selected for a node.
     */
    makeConfigGroupsList : function(data, tree) { 

        var groupDiv = document.getElementById('configGroups');
        YAHOO.AJAXmarking.removeNodes(groupDiv);

        // closure holding on click function
        var boxOnClick = function() {
                YAHOO.AJAXmarking.boxOnClick();
        };

        var dataLength = data.length;
        //continue the numbering of the ids from 4 (main checkboxes are 1-3). This allows us to disable/enable them
        var idCounter = 4;  
        if (dataLength === 0) {
            var emptyLabel = document.createTextNode(amVariables.nogroups);
            groupDiv.appendChild(emptyLabel);
        }
        for(var v=0; v<dataLength; v++) {

            var box = '';
            try{
                box = document.createElement('<input type="checkbox" name="showhide" />');
            }catch(err){
                box = document.createElement('input');
            }
            box.setAttribute('type','checkbox');
            box.setAttribute('name','groups');
            box.id = 'config'+idCounter;
            box.value = data[v].id;
            groupDiv.appendChild(box);
            
            if (data[v].display == 'true') {
                box.checked = true;
            } else {
                box.checked = false;
            }
            box.onclick = boxOnClick;
          
            var label = document.createTextNode(data[v].name);
            groupDiv.appendChild(label);
            
            var breaker = document.createElement('br');
            groupDiv.appendChild(breaker);
            idCounter++;
        }
        
        YAHOO.AJAXmarking.config.icon.removeAttribute('class', 'loaderimage');
        YAHOO.AJAXmarking.config.icon.removeAttribute('className', 'loaderimage');
        //re-enable the checkboxes
        YAHOO.AJAXmarking.enableRadio();
    },


    /**
     * function to alter a node's label with a new count once the children are removed or reloaded
     */
    countAlter : function (newNode, newCount) {
        //var name = newNode.data.name;
        var newLabel = newNode.data.icon+'(<span class="AMB_count">'+newCount+'</span>) '+newNode.data.name;
        newNode.data.count = newCount;
        newNode.label = newLabel;
    },


    /**
     * on click function for the groups check boxes on the config screen. clicking sets or unsets
     * a particular group for display.
     */
    boxOnClick : function() {
     
        var form = document.getElementById('configshowform');

        window.YAHOO.AJAXmarking.disableRadio();

        // hacky IE6 compatible fix
        for (c=0;c<form.childNodes.length;c++) {
            switch (form.childNodes[c].name) {
                case 'course':
                    var course = form.childNodes[c].value;
                    break;
                case 'assessmenttype':
                    var assessmentType = form.childNodes[c].value;
                    break;
                case 'assessment':
                    var assessment = form.childNodes[c].value;
                    break;
            }
        }

        // need to construct a space separated list of group ids.
        var groupIds = '';
        var groupDiv = document.getElementById('configGroups');
        var groups = groupDiv.getElementsByTagName('input');
        var groupsLength = groups.length;

        for (var a=0;a<groupsLength;a++) {
            if (groups[a].checked === true) {
                groupIds += groups[a].value+' ';
            }
        }
        // there are no checked boxes
        if (groupIds === '') { 
            //don't leave the db field empty as it will cause confusion between no groups chosen and first time we set this.
            groupIds = 'none'; 
        }

        var reqUrl = amVariables.wwwroot+'/blocks/ajax_marking/ajax.php';
        var postData = 'id='+course+'&assessmenttype='+assessmentType+'&assessmentid='+assessment+'&type=config_group_save&userid='+amVariables.userid+'&showhide=2&groups='+groupIds;
        
        var request = YAHOO.util.Connect.asyncRequest('POST', reqUrl, AJAXmarkingCallback, postData);
    },

    /**
     * this function is called every 100 milliseconds once the assignment pop up is called
     * and tries to add the onclick handlers until it is successful. There are a few extra
     * checks in the following functions that appear to be redundant but which are
     * necessary to avoid errors. The part of /mod/assignment/lib.php at line 509 tries to
     * update the main window with $this->update_main_listing($submission). This fails because
     * there is no main window with the submissions table as there would have been if the pop
     * up had been generated from the submissions grading screen. To avoid the errors,
     *
     *
     * NOTE: the offset system for saveandnext depends on the sort state having been stored in the $SESSION variable when the grading screen was accessed
     * (which may not have happened, as we are not coming from the submissions.php grading screen or may have been a while ago).
     * The sort reflects the last sort mode the user asked for when ordering the list of pop-ups, e.g. by clicking on the firstname column header.
     * I have not yet found a way to alter this variable using javascript - ideally, the sort would be the same as it is in the list presented in the marking block.
     * until a work around is found, the save and next function is be a bit wonky, sometimes showing next when there is only one submission, so I have hidden it.
     */
    assignmentOnLoad: function(me, userid) {
        
        var els ='';
        var els2 = '';
        var els3 = '';
        YAHOO.AJAXmarking.t++;

        // when the DOM is ready, add the onclick events and hide the other buttons
        if (YAHOO.AJAXmarking.windowobj.document) {
            if (YAHOO.AJAXmarking.windowobj.document.getElementsByName) {
                els = YAHOO.AJAXmarking.windowobj.document.getElementsByName('submit');
                // the above line will not return anything until the pop up is fully loaded
                if (els.length > 0) { 

                    // To keep the assignment javascript happy, we need to make some divs for it to copy the
                    // grading data to, just as it would if it was called from the main submission grading screen.
                    // Line 710-728 of /mod/assignment/lib.php can't be dealt with easily, so there will
                    // be an error if outcomes are in use, but hopefully, that won't be so frequent.
                    // TODO see if there is a way to grab the outcome ids from the pop up and make divs using them that
                    // will match the ones that the javascript is looking for
                    var div = document.createElement('div');
                    div.setAttribute('id', 'com'+userid);
                    div.style.display = 'none';

                    var textArea = document.createElement('textarea');
                    textArea.setAttribute('id', 'submissioncomment'+userid);
                    textArea.style.display = 'none';
                    textArea.setAttribute('rows', "2");
                    textArea.setAttribute('cols', "20");
                    div.appendChild(textArea);
                    window.document.getElementById('javaValues').appendChild(div);

                    var div2 = document.createElement('div');
                    div2.setAttribute('id', 'g'+userid);
                    div2.style.display = 'none';
                    window.document.getElementById('javaValues').appendChild(div2);

                    var textArea2 = document.createElement('textarea');
                    textArea2.setAttribute('id', 'menumenu'+userid);
                    textArea2.style.display = 'none';
                    textArea2.setAttribute('rows', "2");
                    textArea2.setAttribute('cols', "20");
                    window.document.getElementById('g'+userid).appendChild(textArea2);

                    var div3 = document.createElement('div');
                    div3.setAttribute('id', 'ts'+userid);
                    div3.style.display = 'none';
                    window.document.getElementById('javaValues').appendChild(div3);

                    var div4 = document.createElement('div');
                    div4.setAttribute('id', 'tt'+userid);
                    div4.style.display = 'none';
                    window.document.getElementById('javaValues').appendChild(div4);

                    var div5 = document.createElement('div');
                    div5.setAttribute('id', 'up'+userid);
                    div5.style.display = 'none';
                    window.document.getElementById('javaValues').appendChild(div5);

                    var div6 = document.createElement('div');
                    div6.setAttribute('id', 'finalgrade_'+userid);
                    div6.style.display = 'none';
                    window.document.getElementById('javaValues').appendChild(div6);

                    // now add onclick
                    els[0]["onclick"] = new Function("return YAHOO.AJAXmarking.saveChangesAJAX(-1, YAHOO.AJAXmarking.main, '"+me+"', false); "); // IE
                    els2 = YAHOO.AJAXmarking.windowobj.document.getElementsByName('saveandnext');

                    if (els2.length > 0) {
                        els2[0].style.display = "none";
                        els3 = YAHOO.AJAXmarking.windowobj.document.getElementsByName('next');
                        els3[0].style.display = "none";
                    }
                    // cancel the timer loop for this function
                    window.clearInterval(YAHOO.AJAXmarking.timerVar);

                }
            }
        }
    },


    /**
     * workshop pop up stuff
     * function to add workshop onclick stuff and shut the pop up after its been graded.
     * the pop -up goes to a redirect to display the grade, so we have to wait until
     * then before closing it so that the grade is processed properly.
     * 
     * 
     * 
     * note: this looks odd because there are 2 things that needs doing, one after the pop up loads (add onclicks)and one after it goes to its redirect
     * (close window).it is easier to check for a fixed url (i.e. the redirect page) than to mess around with regex stuff to detect a dynamic url, so the
     * else will be met first, followed by the if. The loop will keep running whilst the pop up is open, so this is not very elegant or efficient, but
     * should not cause any problems unless the client is horribly slow. A better implementation will follow sometime soon.
     */
    workshopOnLoad : function (me, parent, course) {
        var els ='';
        if (typeof YAHOO.AJAXmarking.windowobj.frames[0] != 'undefined') { //check that the frames are loaded - this can vary according to conditions
            if (YAHOO.AJAXmarking.windowobj.frames[0].location.href != amVariables.wwwroot+'/mod/workshop/assessments.php') {
                // this is the early stage, pop up has loaded and grading is occurring
                // annoyingly, the workshop module has not named its submit button, so we have to get it using another method as the 11th input
                els = YAHOO.AJAXmarking.windowobj.frames[0].document.getElementsByTagName('input');
                if (els.length == 11) {
                    els[10]["onclick"] = new Function("return YAHOO.AJAXmarking.saveChangesAJAX('/mod/workshop/assessments.php', YAHOO.AJAXmarking.main, '"+me+"', true);"); // IE
                    // cancel timer loop
                    window.clearInterval(YAHOO.AJAXmarking.timerVar);

                }
            }
        }
    },

    /**
     * function to add onclick stuff to the forum ratings button. This button also has no name or id so we
     * identify it by getting the last tag in the array of inputs. The function is triggered on an interval
     * of 1/2 a second until it manages to close the pop up after it has gone to the confirmation page
     */
    forumOnLoad : function (me) {
        var els ='';
        var name = navigator.appName;
        
        // first, add the onclick if possible
        if (typeof YAHOO.AJAXmarking.windowobj.document.getElementsByTagName('input') != 'undefined') {
            // window is open with some input. could be loading lots though.
            els = YAHOO.AJAXmarking.windowobj.document.getElementsByTagName('input');

            if (els.length > 0) {
                var key = els.length -1;
                if (els[key].value == amVariables.forumSaveString) { // does the last input have the 'send in my ratings string as label, showing that all the rating are loaded?
                    // IE friendly
                    els[key]["onclick"] = new Function("return YAHOO.AJAXmarking.saveChangesAJAX('/mod/forum/rate.php', YAHOO.AJAXmarking.main, '"+me+"');");
                    // cancel loop for this function
                    window.clearInterval(YAHOO.AJAXmarking.timerVar);

                }
            }
        }
    },

    /**
     * adds onclick stuff to the quiz popup
     */
    quizOnLoad : function (me) {
        var els = '';
        var lastButOne = '';

        if (typeof YAHOO.AJAXmarking.windowobj.document.getElementsByTagName('input') != 'undefined') {
            // window is open with some input. could be loading lots though.
            els = YAHOO.AJAXmarking.windowobj.document.getElementsByTagName('input');

            if (els.length > 14) { 
                // there is at least the DOM present for a single attempt, but if the student has made a couple of attempts,
                // there will be a larger window.
                lastButOne = els.length - 1;
               
                if (els[lastButOne].value == amVariables.quizSaveString) {
               
                // the onclick carries out the functions that are already specified in lib.php, followed by the function to update the tree
                els[lastButOne]["onclick"] = new Function("return YAHOO.AJAXmarking.saveChangesAJAX('/mod/quiz/report.php', YAHOO.AJAXmarking.main, '"+me+"'); ");
                // cancel the loop for this function
                window.clearInterval(YAHOO.AJAXmarking.timerVar);

                }
            }
        }
    },

    /**
     * adds onclick stuff to the journal pop up elements once they are ready
     * me is the id number of the journal we want
     */
    journalOnLoad :   function (me) {


          var journalClick = function () {

              // get the form submit input, which is always last but one (length varies)
              els = YAHOO.AJAXmarking.windowobj.document.getElementsByTagName('input');
              var key = els.length -1;
/*
              YAHOO.util.Event.on(
                  els[key],
                  'mouseover',
                  function(){
                      alert('mouseover');
                  }
              );
*/
              YAHOO.util.Event.on(
                  els[key],
                  'click',
                  function(){
                      return YAHOO.AJAXmarking.saveChangesAJAX(
                          '/mod/journal/report.php',
                          YAHOO.AJAXmarking.main,
                          me
                      );
                  }
              );
          };
         // YAHOO.util.Event.addListener(YAHOO.AJAXmarking.windowobj, 'load', journalClick);
/*
          var els ='';
          // first, add the onclick if possible
          if (typeof YAHOO.AJAXmarking.windowobj.document.getElementsByTagName('input') != 'undefined') { // window is open with some input. could be loading lots though.

              els = YAHOO.AJAXmarking.windowobj.document.getElementsByTagName('input');

              if (els.length > 0) {

                  //var key = els.length -1;

                  if (els[key].value == amVariables.journalSaveString) { 
                      
                      // does the last input have the 'send in my ratings' string as label, showing that all the rating are loaded?
                      els[key]["onclick"] = new Function("return YAHOO.AJAXmarking.saveChangesAJAX('/mod/journal/report.php', YAHOO.AJAXmarking.main, '"+me+"');");
                      // cancel loop for this function
                      window.clearInterval(YAHOO.AJAXmarking.timerVar);

                  }
              }
          }
              */
      },


    /**
     * function that waits till the pop up has a particular location,
     * i.e. the one it gets to when the data has been saved, and then shuts it.
     */
    afterLoad : function (loc) { 

        if (!YAHOO.AJAXmarking.windowobj.closed) {

            if (YAHOO.AJAXmarking.windowobj.location.href == amVariables.wwwroot+loc) {
                setTimeout('YAHOO.AJAXmarking.windowobj.close()', 1000);
                return;
            }

        } else if (YAHOO.AJAXmarking.windowobj.closed) {
            return;
        } else {
            setTimeout(YAHOO.AJAXmarking.afterLoad(loc), 1000);
            return;
        }
    },

    /**
     * IE seems not to want to expand the block when the tree becomes wider.
     * This provides a one-time resizing so that it is a bit bigger
     */
    ie_width : function () {
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){

        var el = document.getElementById('treediv');
        var width = el.offsetWidth;
        // set width of main content div to the same as treediv
        var contentDiv = el.parentNode;
        contentDiv.style.width = width;
        }
    },

    /**
     * The panel for the config tree and the pop ups is the same and is created here if it doesn't exist yet
     */
    makePanel : function () {
        YAHOO.AJAXmarking.greyOut =
            new YAHOO.widget.Panel(
                "greyOut",
                {
                    width:"470px",
                    height:"530px",
                    fixedcenter:true,
                    close:true,
                    draggable:false,
                    zindex:110,
                    modal:true,
                    visible:false,
                    iframe: true
                }
            );
    },

    /**
     * Builds the greyed out panel for the config overlay
     */

    greyBuild : function() {

        if (!YAHOO.AJAXmarking.greyOut) {

            YAHOO.AJAXmarking.makePanel();

            var headerText = amVariables.headertext+' '+amVariables.fullname;
            YAHOO.AJAXmarking.greyOut.setHeader(headerText);

            var bodyText = "<div id='configIcon' class='AMhidden'></div><div id='configStatus'></div><div id='configTree'></div><div id='configSettings'><div id='configInstructions'>"+amVariables.instructions+"</div><div id='configCheckboxes'><form id='configshowform' name='configshowform'></form></div><div id='configGroups'></div></div>";

            YAHOO.AJAXmarking.greyOut.setBody(bodyText);
            document.body.className += ' yui-skin-sam';

            YAHOO.AJAXmarking.greyOut.beforeHideEvent.subscribe(function() {
                YAHOO.AJAXmarking.refreshTree(YAHOO.AJAXmarking.main);
            });

            YAHOO.AJAXmarking.greyOut.render(document.body);
            YAHOO.AJAXmarking.greyOut.show();
            // Now that the grey overlay is in place with all the divs ready, we build the config tree
            YAHOO.AJAXmarking.config = new YAHOO.AJAXmarking.AJAXtree('configTree', 'configIcon', 'configStatus', true);
            YAHOO.AJAXmarking.ajaxBuild(YAHOO.AJAXmarking.config);

            YAHOO.AJAXmarking.config.icon.setAttribute('class', 'loaderimage');
            YAHOO.AJAXmarking.config.icon.setAttribute('className', 'loaderimage');

        } else {
            // It's all there from earlier, so just show it
            YAHOO.AJAXmarking.greyOut.show();
            YAHOO.AJAXmarking.clearGroupConfig();
            YAHOO.AJAXmarking.refreshTree(YAHOO.AJAXmarking.config);
        }
    },

    /**
     * the onclick for the radio buttons in the config screen.
     * if show by group is clicked, the groups thing pops up. If another one is, the groups thing is hidden.
     */
    configCheckboxAJAXRequest : function(checkbox) {
        // if its groups, show the groups by getting them from the course node?

        var showHide = '';


        var configSet = function (showHide) {
            var form = document.getElementById('configshowform');

            var len = form.childNodes.length;

            // silly hack to fix the way IE6 will not retrieve data from an input added using appendChild using form.assessment.value
            for(b=0; b<len; b++) {

                switch (form.childNodes[b].name) {
                    case 'assessment':
                        var assessmentValue = form.childNodes[b].value;
                        break;
                    case 'assessmenttype':
                        var assessmentType = form.childNodes[b].value;
                        break;

                }
            }
            // make the AJAX request
            var url       = amVariables.wwwroot+'/blocks/ajax_marking/ajax.php';
            var postData  = 'id='+assessmentValue;
                postData += '&type=config_set';
                postData += '&userid='+amVariables.userid;
                postData += '&assessmenttype='+assessmentType;
                postData += '&assessmentid='+assessmentValue
                postData += '&showhide='+showHide;
            var request  = YAHOO.util.Connect.asyncRequest('POST', url, AJAXmarkingCallback, postData);
        }

        //empty the groups area
        var groupDiv = document.getElementById('configGroups');
        while (groupDiv.firstChild) {
            groupDiv.removeChild(groupDiv.firstChild);
        }

        switch (checkbox.value) {

            case 'default':

                configSet(0);
                break;

            case 'show':

                configSet(1);
                break;

            case 'groups': //need to set the type of this assessment to 'show groups' and get the groups stuff.

                showHide = 2;
                //get the form div to be able to read the values
                var form = document.getElementById('configshowform');

                // silly IE6 bug fix
                for (c=0;c<form.childNodes.length;c++) {
                    switch (form.childNodes[c].name) {
                        case 'course':
                            var course = form.childNodes[c].value;
                            break;
                        case 'assessmenttype':
                            var assessmentType = form.childNodes[c].value;
                            break;
                        case 'assessment':
                            var assessment = form.childNodes[c].value;
                            break;
                    }
                }
                var url        = amVariables.wwwroot+'/blocks/ajax_marking/ajax.php';
                var postData   = 'id='+course;
                    postData  += '&assessmenttype='+assessmentType;
                    postData  += '&assessmentid='+assessment;
                    postData  += '&type=config_groups';
                    postData  += '&userid='+amVariables.userid;
                    postData  += '&showhide='+showHide;
                var request    = YAHOO.util.Connect.asyncRequest('POST', url, AJAXmarkingCallback, postData);
                break;

            case 'hide':

                configSet(3);
                break;

        } 
        YAHOO.AJAXmarking.disableRadio();
    },


    /**
     * Wipes all the group options away when another node or a course node is clicked in the config tree
     */
    clearGroupConfig : function() {

        YAHOO.AJAXmarking.removeNodes(document.getElementById('configshowform'));
        YAHOO.AJAXmarking.removeNodes(document.getElementById('configInstructions'));
        YAHOO.AJAXmarking.removeNodes(document.getElementById('configGroups'));
        return true;
    
    },
    
    /**
     * Used by other functions to clear all child nodes from some element
     */
    removeNodes: function (el) {
        if (el.hasChildNodes()) {
            while (el.hasChildNodes()) {
                el.removeChild(el.firstChild);
            }
        }
    },

    /**
     * This is to generate the footer controls once the tree has loaded
     */
    makeFooter: function () {
        // Create all text nodes

        // the two links
        var collapseButton = new YAHOO.widget.Button({
	                            label:amVariables.refreshString,
	                            id:"AMBcollapse",
                                onclick: {fn: function() {YAHOO.AJAXmarking.refreshTree(YAHOO.AJAXmarking.main)} },
	                            container:"conf_left" });

        var configButton = new YAHOO.widget.Button({
	                            label:amVariables.configureString,
	                            id:"AMBconfig",
                                onclick: {fn: function() {YAHOO.AJAXmarking.greyBuild()} },
	                            container:"conf_right" });
        //collapseButton.on("click", function (){YAHOO.AJAXmarking.refreshTree(YAHOO.AJAXmarking.main)});

        // Add bits to them like onclick
        // append them to each other and the DOM
    }
  
// end main class
}; 


/**
 * Callback object for the AJAX call, which
 * fires the correct function. Doesn't work when part of the main class. Don't know why
 */
var  AJAXmarkingCallback = {

    cache    : false,
    success  : YAHOO.AJAXmarking.AJAXsuccess,
    failure  : YAHOO.AJAXmarking.AJAXfailure,
    scope    : YAHOO.AJAXmarking,
    // TODO: find out what this was for as the timeouts seem not to be working
    // argument : 1200,
    timeout  : 10000

};

/**
 * The initial stuff to get everything started
 */

// workaround for odd https setups. Probably not needed in most (any?) cases
if ( document.location.toString().indexOf( 'https://' ) != -1 ) {
    amVariables.wwwroot = amVariables.wwwroot.replace('http:', 'https:');
}
// the context menu needs this for the skin to show up, as do other bits
document.body.className += ' yui-skin-sam';

YAHOO.AJAXmarking.main = new YAHOO.AJAXmarking.AJAXtree('treediv', 'mainIcon', 'status', false);

YAHOO.AJAXmarking.ajaxBuild(YAHOO.AJAXmarking.main);
    

	

