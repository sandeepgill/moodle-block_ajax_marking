AJAXmarking={aidHolder:'',sidHolder:'',nodeHolder:'',compHolder:'',checkVar:6,totalCount:0,valueDiv:'',windowobj:'',timerVar:'',frameTimerVar:'',t:0,main:'',config:'',ajaxBuild:function(tree){var sUrl='';if(tree.loadCounter===0){tree.icon.setAttribute('class','loaderimage');tree.icon.setAttribute('className','loaderimage');if(tree.treeDiv=='configTree'){sUrl=amVariables.wwwroot+'/blocks/ajax_marking/ajax.php?id='+amVariables.userid+'&type=config_main&userid='+amVariables.userid+'';}else{sUrl=amVariables.wwwroot+'/blocks/ajax_marking/ajax.php?id='+amVariables.userid+'&type=main&userid='+amVariables.userid+'';}
var request=YAHOO.util.Connect.asyncRequest('GET',sUrl,AMajaxCallback);tree.loadCounter=1;}},AJAXsuccess:function(o){var type=null;var responseArray=null;var label='';responseArray=eval(o.responseText);type=responseArray[0].type;responseArray.shift();switch(type){case'main':AJAXmarking.makeCourseNodes(responseArray,AJAXmarking.main);break;case'course':AJAXmarking.makeAssessmentNodes(responseArray,AJAXmarking.main);AJAXmarking.ie_width();break;case'quiz_question':AJAXmarking.makeAssessmentNodes(responseArray,AJAXmarking.main);break;case'groups':AJAXmarking.makeGroupNodes(responseArray,AJAXmarking.main);break;case'submissions':AJAXmarking.makeSubmissionNodes(responseArray,AJAXmarking.main);break;case'config_main':AJAXmarking.makeCourseNodes(responseArray,AJAXmarking.config);break;case'config_course':AJAXmarking.makeAssessmentNodes(responseArray,AJAXmarking.config);break;case'config_groups':AJAXmarking.makeGroupsList(responseArray,AJAXmarking.config);break;case'config_set':if(responseArray[0].value===false){label=document.createTextNode(amVariables.configNothingString);AJAXmarking.removeNodes(AJAXmarking.config.status);AJAXmarking.config.status.appendChild(label);}else{AJAXmarking.enableRadio();}
break;case'config_check':var checkId='config'+responseArray[0].value;document.getElementById(checkId).checked=true;if(responseArray[0].value==2){responseArray.shift();AJAXmarking.makeGroupsList(responseArray);}
AJAXmarking.enableRadio();break;case'config_group_save':if(responseArray[0].value===false){AJAXmarking.config.status.innerHTML='AJAX error';}else{AJAXmarking.enableRadio();}
break;}},AJAXfailure:function(o)
{if(o.tId==-1){div.innerHTML=amVariables.collapseString;}
if(o.tId===0){div.innerHTML=amVariables.connectFail;}},makeCourseNodes:function(nodesArray,tree){var label='';var nodesLeng=nodesArray.length;if(nodesLeng===0){if(tree.treeDiv==='treediv'){label=document.createTextNode(amVariables.configNothingString);}else{label=document.createTextNode(amVariables.nothingString);}
tree.div.appendChild(label);tree.icon.removeAttribute('class','loaderimage');tree.icon.removeAttribute('className','loaderimage');}else{var i=0;for(n=0;n<nodesLeng;n++){if(tree.treeDiv==='treediv'){label=nodesArray[n].name+' ('+nodesArray[n].count+')';}else{label=nodesArray[n].name;}
var myobj={label:''+label+'',id:''+nodesArray[n].id+'',type:''+nodesArray[n].type+'',count:''+nodesArray[n].count+'',cmid:''+nodesArray[n].cmid+'',uniqueId:''+nodesArray[n].cid+'',name:''+nodesArray[n].name+'',summary:''+nodesArray[n].summary+'',title:''+nodesArray[n].summary};var tmpNode1=new YAHOO.widget.TextNode(myobj,tree.root,false);tmpNode1.labelStyle='icon-course';tmpNode1.setDynamicLoad(AJAXmarking.loadNodeData);}
tree.tree.render();tree.icon.removeAttribute('class','loaderimage');tree.icon.removeAttribute('className','loaderimage');if(tree.treeDiv=='treediv'){label=document.createTextNode(amVariables.totalMessage);var total=document.getElementById('totalmessage');AJAXmarking.removeNodes(total);total.appendChild(label);AJAXmarking.updateTotal();tree.tree.subscribe("clickEvent",function(oArgs){var nd=oArgs.node;var popUpAddress=amVariables.wwwroot;var popUpArgs='menubar=0,location=0,scrollbars,resizable,width=780,height=500';var timerFunction='';switch(nd.data.type){case'quiz_answer':popUpAddress+='/mod/quiz/report.php?mode=grading&action=grade&q='+nd.parent.parent.data.id+'&questionid='+nd.data.aid+'&userid='+nd.data.sid+'';timerFunction='AJAXmarking.quizOnLoad(\''+nd.data.id+'\')';break;case'assignment_answer':popUpAddress+='/mod/assignment/submissions.php?id='+nd.data.aid+'&userid='+nd.data.sid+'&mode=single&offset=0';timerFunction='AJAXmarking.assignmentOnLoad(\''+nd.data.id+'\', \''+nd.data.sid+'\')';break;case'workshop_answer':popUpAddress+='/mod/workshop/assess.php?id='+nd.data.aid+'&sid='+nd.data.sid+'&redirect='+amVariables.wwwroot+'';timerFunction='AJAXmarking.workshopOnLoad(\''+nd.data.id+'\')';break;case'discussion':popUpAddress+='/mod/forum/discuss.php?d='+nd.data.aid+'#p'+nd.data.sid+'';timerFunction='AJAXmarking.forumOnLoad(\''+nd.data.id+'\')';break;case'journal':popUpAddress+='/mod/journal/report.php?id='+nd.data.cmid+'';timerFunction='AJAXmarking.journalOnLoad(\''+nd.data.assid+'\', \''+nd.parent.data.cmid+'\')';break;}
if(timerFunction!==''){AJAXmarking.windowobj=window.open(popUpAddress,'_blank',popUpArgs);AJAXmarking.timerVar=window.setInterval(timerFunction,500);AJAXmarking.windowobj.focus();return false;}});}else{tree.tree.subscribe('clickEvent',function(oArgs){var title=document.getElementById('configInstructions');var check=document.getElementById('configshowform');var groups=document.getElementById('configGroups');AJAXmarking.clearGroupConfig();if(oArgs.node.data.type=='config_course'){AJAXmarking.removeNodes(title);}else{label=document.createTextNode(oArgs.node.data.name);title.appendChild(label);}
if(oArgs.node.data.type!=='config_course'){check.style.color='#AAA';var hidden1=document.createElement('input');hidden1.type='hidden';hidden1.name='course';hidden1.value=oArgs.node.parent.data.id;check.appendChild(hidden1);var hidden2=document.createElement('input');hidden2.setAttribute('type','hidden');hidden2.setAttribute('name','assessment');hidden2.setAttribute('value',oArgs.node.data.id);check.appendChild(hidden2);var hidden3=document.createElement('input');hidden3.type='hidden';hidden3.name='assessmenttype';hidden3.value=oArgs.node.data.type;check.appendChild(hidden3);try{box1=document.createElement('<input type="radio" name="showhide" />');}catch(err){box1=document.createElement('input');}
box1.setAttribute('type','radio');box1.setAttribute('name','showhide');box1.value='show';box1.id='config1';box1.onclick=function(){AJAXmarking.showHideChanges(this);};check.appendChild(box1);var box1text=document.createTextNode('Show');check.appendChild(box1text);var breaker=document.createElement('br');check.appendChild(breaker);try{box2=document.createElement('<input type="radio" name="showhide" />');}catch(error){box2=document.createElement('input');}
box2.setAttribute('type','radio');box2.setAttribute('name','showhide');box2.value='groups';box2.id='config2';box2.disabled=true;box2.onclick=function(){AJAXmarking.showHideChanges(this);};check.appendChild(box2);var box2text=document.createTextNode('Show by group');check.appendChild(box2text);var breaker2=document.createElement('br');check.appendChild(breaker2);try{box3=document.createElement('<input type="radio" name="showhide" />');}catch(errors){box3=document.createElement('input');}
box3.setAttribute('type','radio');box3.setAttribute('name','showhide');box3.value='hide';box3.id='config3';box3.disabled=true;box3.onclick=function(){AJAXmarking.showHideChanges(this);};check.appendChild(box3);var box3text=document.createTextNode('Hide');check.appendChild(box3text);}
var checkUrl=amVariables.wwwroot+'/blocks/ajax_marking/ajax.php?id='+oArgs.node.parent.data.id+'&assessmenttype='+oArgs.node.data.type+'&assessmentid='+oArgs.node.data.id+'&userid='+amVariables.userid+'&type=config_check';var request=YAHOO.util.Connect.asyncRequest('GET',checkUrl,AMajaxCallback);return false;});}}},tooltips:function(tree){var name=navigator.appName;if(name.search('iPhone')==-1){var i=0;var j=0;var k=0;var m=0;var n=0;var control='';if(tree.div!='treeDiv'){return false;}
var numberOfCourses=tree.root.children.length;for(i=0;i<numberOfCourses;i++){node=tree.root.children[i];AJAXmarking.make_tooltip(node);var numberOfAssessments=tree.root.children[i].children.length;for(j=0;j<numberOfAssessments;j++){node=tree.root.children[i].children[j];AJAXmarking.make_tooltip(node);var numberOfThirdLevelNodes=tree.root.children[i].children[j].children.length;for(k=0;k<numberOfThirdLevelNodes;k++){node=tree.root.children[i].children[j].children[k];check=node.data.time;if(typeof(check)!==null){AJAXmarking.make_tooltip(node);}
var numberOfFourthLevelNodes=node.children.length;for(m=0;m<numberOfFourthLevelNodes;m++){node=tree.root.children[i].children[j].children[k].children[m];AJAXmarking.make_tooltip(node);var numberOfFifthLevelNodes=node.children.length;for(n=0;n<numberOfFifthLevelNodes;n++){node=tree.root.children[i].children[j].children[k].children[m].children[n];AJAXmarking.make_tooltip(node);}}}}}
return true;}},enableRadio:function(){var h='';var radio=document.getElementById('configshowform');radio.style.color='#000';for(h=0;h<radio.childNodes.length;h++){if(radio.childNodes[h].name=='showhide'){radio.childNodes[h].setAttribute('disabled',false);radio.childNodes[h].disabled=false;}}
var groupDiv=document.getElementById('configGroups');groupDiv.style.color='#000';for(h=0;h<groupDiv.childNodes.length;h++){if(groupDiv.childNodes[h].type=='checkbox'){groupDiv.childNodes[h].setAttribute('disabled',false);groupDiv.childNodes[h].disabled=false;}}},disableRadio:function(){var h='';var radio=document.getElementById('configshowform');radio.style.color='#AAA';for(h=0;h<radio.childNodes.length;h++){if(radio.childNodes[h].type=='radio'){radio.childNodes[h].setAttribute('disabled',true);}}
var groupDiv=document.getElementById('configGroups');groupDiv.style.color='#AAA';for(h=0;h<groupDiv.childNodes.length;h++){if(groupDiv.childNodes[h].type=='checkbox'){groupDiv.childNodes[h].setAttribute('disabled',true);}}},loadNodeData:function(node,onCompleteCallback){AJAXmarking.nodeHolder=node;AJAXmarking.compHolder=onCompleteCallback;var sUrl=amVariables.wwwroot+'/blocks/ajax_marking/ajax.php?id='+node.data.id+'&type='+node.data.type+'&userid='+amVariables.userid+'';if(typeof node.data.gid!='undefined'){sUrl+='&group='+node.data.gid;}
if(node.data.type=='quiz_question'){sUrl+='&quizid='+node.parent.data.id;}
var request=YAHOO.util.Connect.asyncRequest('GET',sUrl,AMajaxCallback);},parentUpdate:function(tree,node){var counter=node.children.length;if(counter===0){tree.tree.removeNode(node,true);}else{if(node.data.type=='course'||node.children[0].data.gid!='undefined'||node.data.type=='forum'||node.data.type=='quiz'){var tempCount=0;var tempStr='';for(i=0;i<counter;i++){tempStr=node.children[i].data.count;tempCount+=parseInt(tempStr,10);}
AJAXmarking.countAlter(node,tempCount);}else{AJAXmarking.countAlter(node,counter);}
AJAXmarking.main.tree.root.refresh();}},make_tooltip:function(node){tempLabelEl=node.getLabelEl();tempText=node.data.summary;tempTooltip=new YAHOO.widget.Tooltip('tempTooltip',{context:tempLabelEl,text:tempText,showdelay:0,hidedelay:0,width:150,iframe:false,zIndex:1110});},makeAssessmentNodes:function(nodesArray,tree){var myobj='';var aidHolder='';var sidHolder='';var uniqueId='';var tmpNode2='';var tmpNode3='';var clickNode='';var label='';var nodesLeng=nodesArray.length;for(m=0;m<nodesLeng;m++){switch(nodesArray[m].type){case'assignment':nodesArray[m].summary=amVariables.assignmentString+' '+nodesArray[m].summary+'';break;case'workshop':nodesArray[m].summary=amVariables.workshopString+' '+nodesArray[m].summary+'';break;case'forum':nodesArray[m].summary=amVariables.forumString+' '+nodesArray[m].summary+'';break;case'quiz':nodesArray[m].summary=amVariables.quizString+' '+nodesArray[m].summary+'';break;case'journal':nodesArray[m].summary=amVariables.journalString+' '+nodesArray[m].summary+'';break;case'journal_submissions':nodesArray[m].summary=amVariables.journalString+' '+nodesArray[m].summary+'';break;}
if(tree.treeDiv=='treediv'){label=nodesArray[m].name+' ('+nodesArray[m].count+')';}else{label=nodesArray[m].name;}
if(nodesArray[m].type=='quiz_question'){myobj={label:''+label+'',id:''+nodesArray[m].id+'',type:''+nodesArray[m].type+'',assid:''+nodesArray[m].assid+'',uniqueId:''+nodesArray[m].assid+'',count:''+nodesArray[m].count+'',name:''+nodesArray[m].name+'',title:''+nodesArray[m].summary+'',gid:''+nodesArray[m].group+''};}else{myobj={label:''+label+'',id:''+nodesArray[m].id+'',type:''+nodesArray[m].type+'',assid:''+nodesArray[m].assid+'',cmid:''+nodesArray[m].cmid+'',uniqueId:''+nodesArray[m].assid+'',count:''+nodesArray[m].count+'',name:''+nodesArray[m].name+'',title:''+nodesArray[m].summary+''};}
tmpNode2=new YAHOO.widget.TextNode(myobj,AJAXmarking.nodeHolder,false);switch(nodesArray[m].type){case'assignment':tmpNode2.labelStyle='icon-assign';break;case'workshop':tmpNode2.labelStyle='icon-workshop';break;case'forum':tmpNode2.labelStyle='icon-forum';break;case'quiz_question':tmpNode2.labelStyle='icon-question';break;case'quiz':tmpNode2.labelStyle='icon-quiz';break;case'journal':tmpNode2.labelStyle='icon-journal';break;}
if(tree.treeDiv=='treediv'){tmpNode2.setDynamicLoad(AJAXmarking.loadNodeData);}}
if(tree.treeDiv=='treediv'){AJAXmarking.parentUpdate(tree,AJAXmarking.nodeHolder);}
AJAXmarking.compHolder();if(tree.treeDiv=='treediv'){AJAXmarking.updateTotal();}},makeSubmissionNodes:function(nodesArray,tree){var myobj='';var uniqueId='';var tmpNode2='';var tmpNode3='';var clickNode='';var nodesLeng='';nodesLeng=nodesArray.length;for(var k=0;k<nodesLeng;k++){uniqueId=nodesArray[k].type+nodesArray[k].aid+'sid'+nodesArray[k].sid+'';var secs=parseInt(nodesArray[k].seconds,10);var time=parseInt(nodesArray[k].time,10)*1000;var d=new Date();d.setTime(time);var nodeCount=0;if(typeof nodesArray[k].count!='undefined'){nodeCount=nodesArray[k].count;}
myobj={label:''+nodesArray[k].name+'',id:''+uniqueId+'',type:''+nodesArray[k].type+'',aid:''+nodesArray[k].aid+'',uniqueId:''+uniqueId+'',sid:''+nodesArray[k].sid+'',title:''+nodesArray[k].summary+'',count:''+nodeCount+''};if(nodesArray[k].type=='discussion'){myobj.label=myobj.label+' ('+myobj.count+')';}
tmpNode3=new YAHOO.widget.TextNode(myobj,AJAXmarking.nodeHolder,false);if(secs<21600){tmpNode3.labelStyle='icon-user-one';}else if(secs<43200){tmpNode3.labelStyle='icon-user-two';}else if(secs<86400){tmpNode3.labelStyle='icon-user-three';}else if(secs<172800){tmpNode3.labelStyle='icon-user-four';}else if(secs<432000){tmpNode3.labelStyle='icon-user-five';}else if(secs<864000){tmpNode3.labelStyle='icon-user-six';}else if(secs<1209600){tmpNode3.labelStyle='icon-user-seven';}else{tmpNode3.labelStyle='icon-user-eight';}}
AJAXmarking.parentUpdate(tree,AJAXmarking.nodeHolder);AJAXmarking.parentUpdate(tree,AJAXmarking.nodeHolder.parent);if(!AJAXmarking.nodeHolder.parent.parent.isRoot()){this.parentUpdate(tree,AJAXmarking.nodeHolder.parent.parent);if(!AJAXmarking.nodeHolder.parent.parent.parent.isRoot()){AJAXmarking.parentUpdate(tree,AJAXmarking.nodeHolder.parent.parent.parent);}}
AJAXmarking.compHolder();AJAXmarking.updateTotal();},makeGroupNodes:function(responseArray,tree){var object='';var arrayLength=responseArray.length;var tmpNode4='';var label='';for(var n=0;n<arrayLength;n++){uniqueId='group'+responseArray[n].gid+'';label=responseArray[n].name+' ('+responseArray[n].count+')';object={label:''+label+'',name:''+responseArray[n].name+'',id:''+responseArray[n].aid+'',type:''+responseArray[n].type+'',uniqueId:''+'g'+responseArray[n].gid+responseArray[n].type+responseArray[n].aid+'',gid:''+responseArray[n].gid+'',count:''+responseArray[n].count+'',title:''+responseArray[n].summary+''};tmpNode4=new YAHOO.widget.TextNode(object,AJAXmarking.nodeHolder,false);tmpNode4.labelStyle='icon-group';if(responseArray[n].type!=='journal'){tmpNode4.setDynamicLoad(AJAXmarking.loadNodeData);}}
AJAXmarking.parentUpdate(tree,AJAXmarking.nodeHolder);AJAXmarking.parentUpdate(tree,AJAXmarking.nodeHolder.parent);AJAXmarking.compHolder();AJAXmarking.updateTotal();},refreshRoot:function(tree){tree.root.refresh();if(tree.root.children.length===0){AJAXmarking.removeNodes(document.getElementById("totalmessage"));AJAXmarking.removeNodes(document.getElementById("count"));tree.div.appendChild(document.createTextNode(amVariables.nothingString));}},AJAXtree:function(treeDiv,icon,statusDiv,config){this.loadCounter=0;this.tree=new YAHOO.widget.TreeView(treeDiv);this.treeDiv=treeDiv;this.icon=document.getElementById(icon);this.div=document.getElementById(statusDiv);if(treeDiv=='treediv'){this.tree.subscribe('collapseComplete',function(node){AJAXmarking.main.tree.removeChildren(node);});}
this.root=this.tree.getRoot();},refreshRootFrames:function(tree){tree.root.refresh();if(tree.root.children.length===0){AJAXmarking.removeNodes(document.getElementById("totalmessage"));AJAXmarking.removeNodes(document.getElementById("count"));AJAXmarking.removeNodes(tree.div);tree.div.appendChild(document.createTextNode(amVariables.nothingString));}},updateTotal:function(){var count=0;var countTemp=0;var children=AJAXmarking.main.root.children;for(i=0;i<children.length;i++){countTemp=children[i].data.count;count=count+parseInt(countTemp,10);}
if(count>0){var countDiv=document.getElementById('count');AJAXmarking.removeNodes(countDiv);countDiv.appendChild(document.createTextNode(count));}},saveChangesAJAX:function(loc,tree,thisNodeId,frames){var checkNode="";var parentNode="";var marker=0;checkNode=tree.tree.getNodeByProperty("id",thisNodeId);parentNode=tree.tree.getNodeByIndex(checkNode.parent.index);parentNode1=tree.tree.getNodeByIndex(parentNode.parent.index);if(!parentNode1.parent.isRoot()){parentNode2=tree.tree.getNodeByIndex(parentNode1.parent.index);}
if((typeof parentNode2!='undefined')&&(!parentNode2.parent.isRoot())){parentNode3=tree.tree.getNodeByIndex(parentNode2.parent.index);}
tree.tree.removeNode(checkNode,true);AJAXmarking.parentUpdate(tree,parentNode);AJAXmarking.parentUpdate(tree,parentNode1);if(typeof parentNode2!='undefined'){AJAXmarking.parentUpdate(tree,parentNode2);}
if(typeof parentNode3!='undefined'){AJAXmarking.parentUpdate(tree,parentNode3);}
if(typeof(frames)!='undefined'){AJAXmarking.refreshRootFrames(tree);}else{AJAXmarking.refreshRoot(tree);}
AJAXmarking.updateTotal();AJAXmarking.tooltips(tree);if(loc!=-1){windowLoc='AJAXmarking.afterLoad(\''+loc+'\')';setTimeout(windowLoc,500);}},refreshTree:function(treeObj){treeObj.loadCounter=0;if(treeObj.root.children.length>0){treeObj.tree.removeChildren(treeObj.root);treeObj.root.refresh();}
AJAXmarking.removeNodes(treeObj.div);AJAXmarking.ajaxBuild(treeObj);},makeGroupsList:function(data){var groupDiv=document.getElementById('configGroups');var dataLength=data.length;var idCounter=4;if(dataLength===0){var emptyLabel=document.createTextNode(amVariables.nogroups);groupDiv.appendChild(emptyLabel);}
for(var v=0;v<dataLength;v++){var box='';try{box=document.createElement('<input type="checkbox" name="showhide" />');}catch(err){box=document.createElement('input');}
box.setAttribute('type','checkbox');box.setAttribute('name','groups');box.id='config'+idCounter;box.value=data[v].id;groupDiv.appendChild(box);if(data[v].display=='true'){box.checked=true;}else{box.checked=false;}
box.onclick=function(){AJAXmarking.boxOnClick();};var label=document.createTextNode(data[v].name);groupDiv.appendChild(label);var breaker=document.createElement('br');groupDiv.appendChild(breaker);idCounter++;}
AJAXmarking.config.icon.removeAttribute('class','loaderimage');AJAXmarking.config.icon.removeAttribute('className','loaderimage');AJAXmarking.enableRadio();},countAlter:function(newNode,newCount){var name=newNode.data.name;var newLabel=name+' ('+newCount+')';newNode.data.count=newCount;newNode.label=newLabel;},boxOnClick:function(){var form=document.getElementById('configshowform');window.AJAXmarking.disableRadio();for(c=0;c<form.childNodes.length;c++){switch(form.childNodes[c].name){case'course':var course=form.childNodes[c].value;break;case'assessmenttype':var assessmentType=form.childNodes[c].value;break;case'assessment':var assessment=form.childNodes[c].value;break;}}
var groupIds='';var groupDiv=document.getElementById('configGroups');var groups=groupDiv.getElementsByTagName('input');var groupsLength=groups.length;for(var a=0;a<groupsLength;a++){if(groups[a].checked===true){groupIds+=groups[a].value+' ';}}
if(groupIds===''){groupIds='none';}
var reqUrl=amVariables.wwwroot+'/blocks/ajax_marking/ajax.php?id='+course+'&assessmenttype='+assessmentType+'&assessmentid='+assessment+'&type=config_group_save&userid='+amVariables.userid+'&showhide=2&groups='+groupIds+'';var request=YAHOO.util.Connect.asyncRequest('GET',reqUrl,AMajaxCallback);},assignmentOnLoad:function(me,userid){var els='';var els2='';var els3='';AJAXmarking.t++;var div=document.createElement('div');div.setAttribute('id','com'+userid);document.getElementById('javaValues').appendChild(div);var textArea=document.createElement('textarea');textArea.setAttribute('id','submissioncomment'+userid);document.getElementById('com'+userid).appendChild(textArea);var div2=document.createElement('div');div2.setAttribute('id','g'+userid);document.getElementById('javaValues').appendChild(div2);var textArea2=document.createElement('textarea');textArea2.setAttribute('id','menumenu'+userid);document.getElementById('g'+userid).appendChild(textArea2);var div3=document.createElement('div');div3.setAttribute('id','ts'+userid);document.getElementById('javaValues').appendChild(div3);var div4=document.createElement('div');div4.setAttribute('id','tt'+userid);document.getElementById('javaValues').appendChild(div4);var div5=document.createElement('div');div5.setAttribute('id','up'+userid);document.getElementById('javaValues').appendChild(div5);var div6=document.createElement('div');div6.setAttribute('id','finalgrade_'+userid);document.getElementById('javaValues').appendChild(div6);if(AJAXmarking.windowobj.document.getElementsByName){els=AJAXmarking.windowobj.document.getElementsByName('submit');if(els.length>0){els[0]["onclick"]=new Function("AJAXmarking.saveChangesAJAX(-1, AJAXmarking.main, '"+me+"', false); ");els2=AJAXmarking.windowobj.document.getElementsByName('saveandnext');if(els2.length>0){els2[0].style.display="none";els3=AJAXmarking.windowobj.document.getElementsByName('next');els3[0].style.display="none";}
window.clearInterval(AJAXmarking.timerVar);}}},workshopOnLoad:function(me,parent,course){var els='';if(typeof AJAXmarking.windowobj.frames[0]!='undefined'){if(AJAXmarking.windowobj.frames[0].location.href!=amVariables.wwwroot+'/mod/workshop/assessments.php'){els=AJAXmarking.windowobj.frames[0].document.getElementsByTagName('input');if(els.length==11){els[10]["onclick"]=new Function("AJAXmarking.saveChangesAJAX('/mod/workshop/assessments.php', AJAXmarking.main, '"+me+"', true);");window.clearInterval(AJAXmarking.timerVar);}}}},forumOnLoad:function(me){var els='';var name=navigator.appName;if(typeof AJAXmarking.windowobj.document.getElementsByTagName('input')!='undefined'){els=AJAXmarking.windowobj.document.getElementsByTagName('input');if(els.length>0){var key=els.length-1;if(els[key].value==amVariables.forumSaveString){els[key]["onclick"]=new Function("return AJAXmarking.saveChangesAJAX('/mod/forum/rate.php', AJAXmarking.main, '"+me+"');");window.clearInterval(AJAXmarking.timerVar);}}}},quizOnLoad:function(me){var els='';var lastButOne='';t=t+1;if(typeof AJAXmarking.windowobj.document.getElementsByTagName('input')!='undefined'){els=AJAXmarking.windowobj.document.getElementsByTagName('input');if(els.length>14){lastButOne=els.length-1;if(els[lastButOne].value==amVariables.quizSaveString){var name=navigator.appName;if(name=="Microsoft Internet Explorer"){els[lastButOne]["onclick"]=new Function("AJAXmarking.saveChangesAJAX('/mod/quiz/report.php', AJAXmarking.main, '"+me+"'); ");}else{els[lastButOne].setAttribute("onClick","window.opener.AJAXmarking.saveChangesAJAX('/mod/quiz/report.php', AJAXmarking.main, '"+me+"')");}
window.clearInterval(AJAXmarking.timerVar);}}}},journalOnLoad:function(me){var els='';if(typeof AJAXmarking.windowobj.document.getElementsByTagName('input')!='undefined'){els=AJAXmarking.windowobj.document.getElementsByTagName('input');if(els.length>0){var key=els.length-1;if(els[key].value==amVariables.journalSaveString){els[key].setAttribute("onClick","return AJAXmarking.saveChangesAJAX('/mod/journal/report.php', AJAXmarking.main, '"+me+"')");els[key]["onclick"]=new Function("return AJAXmarking.saveChangesAJAX('/mod/journal/report.php', AJAXmarking.main, '"+me+"');");window.clearInterval(AJAXmarking.timerVar);}}}},afterLoad:function(loc){if(!AJAXmarking.windowobj.closed){if(AJAXmarking.windowobj.location.href==amVariables.wwwroot+loc){setTimeout('AJAXmarking.windowobj.close()',1000);return;}}else if(AJAXmarking.windowobj.closed){return;}else{setTimeout(AJAXmarking.afterLoad(loc),1000);return;}},ie_width:function(){if(/MSIE (\d+\.\d+);/.test(navigator.userAgent)){var el=document.getElementById('treediv');var width=el.offsetWidth;var contentDiv=el.parentNode;contentDiv.style.width=width;}},greyBuild:function(){if(!AJAXmarking.greyOut){AJAXmarking.greyOut=new YAHOO.widget.Panel("greyOut",{width:"470px",height:"530px",fixedcenter:true,close:true,draggable:false,zindex:110,modal:true,visible:false,iframe:true});var headerText=amVariables.headertext+' '+amVariables.fullname;AJAXmarking.greyOut.setHeader(headerText);var bodyText="<div id='configIcon' class='AMhidden'></div><div id='configStatus'></div><div id='configTree'></div><div id='configSettings'><div id='configInstructions'>"+amVariables.instructions+"</div><div id='configCheckboxes'><form id='configshowform' name='configshowform'></form></div><div id='configGroups'></div></div>";AJAXmarking.greyOut.setBody(bodyText);document.body.className+=' yui-skin-sam';AJAXmarking.greyOut.beforeHideEvent.subscribe(function(){AJAXmarking.refreshTree(AJAXmarking.main);});AJAXmarking.greyOut.render(document.body);AJAXmarking.greyOut.show();AJAXmarking.config=new AJAXmarking.AJAXtree('configTree','configIcon','configStatus',true);AJAXmarking.ajaxBuild(AJAXmarking.config);AJAXmarking.config.icon.setAttribute('class','loaderimage');AJAXmarking.config.icon.setAttribute('className','loaderimage');}else{AJAXmarking.greyOut.show();AJAXmarking.clearGroupConfig();AJAXmarking.refreshTree(AJAXmarking.config);}},showHideChanges:function(checkbox){var showHide='';var groupDiv=document.getElementById('configGroups');while(groupDiv.firstChild){groupDiv.removeChild(groupDiv.firstChild);}
switch(checkbox.value){case'groups':showHide=2;var form=document.getElementById('configshowform');for(c=0;c<form.childNodes.length;c++){switch(form.childNodes[c].name){case'course':var course=form.childNodes[c].value;break;case'assessmenttype':var assessmentType=form.childNodes[c].value;break;case'assessment':var assessment=form.childNodes[c].value;break;}}
var url=amVariables.wwwroot+'/blocks/ajax_marking/ajax.php?id='+course+'&assessmenttype='+assessmentType+'&assessmentid='+assessment+'&type=config_groups&userid='+amVariables.userid+'&showhide='+showHide+'';var request=YAHOO.util.Connect.asyncRequest('GET',url,AMajaxCallback);break;case'show':AJAXmarking.configSet(1);break;case'hide':AJAXmarking.configSet(3);break;}
AJAXmarking.disableRadio();},configSet:function(showHide){var form=document.getElementById('configshowform');var len=form.childNodes.length;for(b=0;b<len;b++){switch(form.childNodes[b].name){case'assessment':var assessmentValue=form.childNodes[b].value;break;case'assessmenttype':var assessmentType=form.childNodes[b].value;break;}}
var url=amVariables.wwwroot+'/blocks/ajax_marking/ajax.php?id='+assessmentValue+'&type=config_set&userid='+amVariables.userid+'&assessmenttype='+assessmentType+'&assessmentid='+assessmentValue+'&showhide='+showHide+'';var request=YAHOO.util.Connect.asyncRequest('GET',url,AMajaxCallback);},clearGroupConfig:function(){AJAXmarking.removeNodes(document.getElementById('configshowform'));AJAXmarking.removeNodes(document.getElementById('configInstructions'));AJAXmarking.removeNodes(document.getElementById('configGroups'));return true;},removeNodes:function(el){if(el.hasChildNodes()){while(el.hasChildNodes()){el.removeChild(el.firstChild);}}}}
var AMajaxCallback={cache:false,success:AJAXmarking.AJAXsuccess,failure:AJAXmarking.AJAXfailure,argument:1200};function AMinit(){if(document.location.toString().indexOf('https://')!=-1){amVariables.wwwroot=amVariables.wwwroot.replace('http:','https:');}
AJAXmarking.main=new AJAXmarking.AJAXtree('treediv','mainIcon','status');AJAXmarking.ajaxBuild(AJAXmarking.main);}
AMinit();