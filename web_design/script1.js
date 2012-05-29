// JavaScript Document

$(document).ready(function(){
$("#start_button").click(function(){
								  
	// 首先检查工程名和作者名称是否符合规范
	/*
	if (document.name_form.widget_name.value == ""){
		alert("工程名不可为空 :)");
		return;
	}

	if (document.author_form.author.value == ""){
		alert("请输出尊姓大名 :)");
		return;
	}
	*/

	componentArray[0]=createComponentObject("horizontalLayout", 0, 0);
	
	$("#component0").sortable();
	$("#component0").disableSelection();

	$("#wrapper").hide();
	$("#work_station").css("display", "block");
	$("#component0").css("height", dp2px(WidgetProject.height) +"px");
	$("#component0").css("width", dp2px(WidgetProject.width) + "px");
	document.getElementById("component0").onclick=clickOnComponent;
	changeHighLight(0);	
});
$(".create").click(function(){
	//只有高亮的Layout才能添加部件
	if (componentArray[highLightID].typeName != "horizontalLayout" && componentArray[highLightID].typeName != "verticalLayout")
		highLightID = componentArray[highLightID].parentID;
		
	if (addNewComponentNode(this.id.substring(4)) == false)
		return;
	
	document.getElementById("component"+globalComponentCounter).onclick=clickOnComponent;
	changeHighLight(globalComponentCounter);	

	if (this.id=="new_verticalLayout" || this.id=="new_horizontalLaytout"){
		$("#component_outer"+globalComponentCounter).sortable();
		$("#component_outer"+globalComponentCounter).disableSelection();
	}

	globalComponentCounter ++;
});
$("#submit_button").click(function(){
	if (!jsonWarning) alert("您的Widget正在制作中^_^");
	refreshHighLightSpan();
});
$("#save_button").click(function(){
	alert("save尚未实现>.<");
});
$("#reset_button").click(function(){
	componentArray = new Array;
	componentArray[0]=createComponentObject("horizontalLayout", 0, 0);
	resourceArray = new Array();//存放资源对象
	globalResourceCounter=0;
	highLightID = 0;
	document.getElementById("component0").innerHTML = null;
});
$("#back_button").click(function(){
	$("#work_station").css("display", "none");
	$("#wrapper").css("display", "block");
});
$(".handle1").click(function(){
	$("#"+$(".highLight1").attr("id").substring(7)).css("display", "none");
	$(".highLight1").removeClass("highLight1");
	this.className="handle1 highLight1";
	$("#"+this.id.substring(7)).css("display", "block");
	if ($("#switch1").hasClass("in")){
		$("#c1").animate({left:"0px"},"slow");
		$("#switch1").removeClass("in").addClass("out");
	}
});
$(".handle2").click(function(){
	$("#"+$(".highLight2").attr("id").substring(7)).css("display", "none");
	$(".highLight2").removeClass("highLight2");
	this.className="handle2 highLight2";
	$("#"+this.id.substring(7)).css("display", "block");
	if ($("#switch2").hasClass("in")){
		$("#c3wrap").animate({right:"0px"},"slow");
		$("#switch2").removeClass("in").addClass("out");
	}
});
$(".switch").click(function(){
	if (this.id == "switch1"){
		if ($("#switch1").hasClass("out")){
			$("#c1").animate({left:"-270px"},"slow");
			$("#switch1").removeClass("out").addClass("in");
		}
		else{
			$("#c1").animate({left:"0px"},"slow");
			$("#switch1").removeClass("in").addClass("out");
		}
	}
	else if (this.id == "switch2"){
		if ($("#switch2").hasClass("out")){
			$("#c3wrap").animate({right:"-270px"},"slow");
			$("#switch2").removeClass("out").addClass("in");
		}
		else{
			$("#c3wrap").animate({right:"0px"},"slow");
			$("#switch2").removeClass("in").addClass("out");
		}
	}
});
//如果图片资源被选择
$("#resource_select").change(function(){
	var selected = $("#resource_select").get(0).selectedIndex;
	componentArray[highLightID].imageID=selected-1;
	if (selected > 0) {
		$("#component"+highLightID).attr("src", resourceArray[selected-1].path);
	} else {
		if (componentArray[highLightID].typeName == "imageview")
			$("#component"+highLightID).attr("src", "img.png");
		else 
			$("#component"+highLightID).attr("src", "imgbtn.png");
	}
});
//如果组件功能被选择
$("#function_select").change(function(){
	var selected = $("#function_select").get(0).selectedIndex;
	componentArray[highLightID].functionID=selected-1;
	if (selected > 0) {
		componentArray[highLightID].clickable=true;
	} else {
		componentArray[highLightID].clickable=false;
	}
	changeHighLight(highLightID);
});
//如果组件选择动态显示标签
$("#link_select").change(function(){
	var selected = $("#link_select").get(0).selectedIndex;
	componentArray[highLightID].linkID=$("#link_select").get(0).options[selected].value.substring(9);
	if (selected > 0) {
		componentArray[highLightID].hasLink=true;
	} else {
		componentArray[highLightID].hasLink=false;
	}
});
//管理组件属性
$("#manager_delete").click(function(){
	var _index = $("#manager_select").get(0).selectedIndex;
	var _id = $("#manager_select").get(0).options[_index].value.substring(9);
	var component = componentArray[_id];
	if (getTag(component.typeName) == "LinearLayout") {
		if (_id == 0 || component.liveSonNum > 0) {
			alert("警告：不能删除该Layout！");
			return ;
		}
	}
	//删除组件的显示
	$(".select"+_id).remove();
	$("#component"+_id).hide(250, function() {
		$("#component_outer"+_id).remove();
		});
	changeHighLight(component.parentID);
	//逻辑上该组件已删除
	componentArray[component.parentID].liveSonNum--;
	component.deleted = true;
});
$("#manager_select").change(function() {
	changeHighLight($("#manager_select").get(0).options[$("#manager_select").get(0).selectedIndex].value.substring(9));
});
//如果提交新属性
$("#manager_submit").click(function() {
	var _index = $("#manager_select").get(0).selectedIndex;
	var _id = $("#manager_select").get(0).options[_index].value.substring(9);
	var component = componentArray[_id];
	var _typeName = component.typeName;

	//更新方向属性显示
	if (getTag(component.typeName) == "LinearLayout") {
		component.orientation = $("#manager_orientation_input").get(0).value;
	}
	//更新文字属性显示
	if (component.typeName == "textview" || component.typeName == "button") {
		component.text = $("#manager_text_input").get(0).value;
	}
	//更新宽度高度属性显示	
	var _width = $("#manager_width").get(0).value;
	component.w = parseFloat(_width);
	var _height = $("#manager_height").get(0).value;
	component.h = parseFloat(_height);
	
	// 更新属性同时更新组件在网页端的显示
	$("#component"+_id).css("width", dp2px(_width));
	$("#component_outer"+_id).css("width", dp2px(_width));
	$("#component"+_id).css("height", dp2px(_height));
	$("#component_outer"+_id).css("height", dp2px(_height));
	if (component.typeName == "textview" || component.typeName == "button") {
		document.getElementById("component"+_id).innerHTML = $("#manager_text_input").get(0).value;
	}

	// TODO refresh when linear layout change.
		
});
});

//当ID为_id的组件进行显示的更新
function manager_select_change(_id){
	if (_id > -1) {
		for (var i = 0; i < $("#manager_select").get(0).length; i++) {
			if ($("#manager_select").get(0).options[i].value.substring(9) == _id)
				$("#manager_select").get(0).selectedIndex = i;
		}
	} else {
		var _index = $("#manager_select").get(0).selectedIndex;
		_id = $("#manager_select").get(0).options[_index].value.substring(9);
	}
	var component = componentArray[_id];
	var _typeName = component.typeName;
	//更新方向属性显示
	if (getTag(component.typeName) == "LinearLayout") {
		for (var i = 0; i < $("#manager_orientation_input").get(0).length; i++) {
			if ($("#manager_orientation_input").get(0).options[i].value == component.orientation)
				$("#manager_orientation_input").get(0).selectedIndex = i;
		}
		$("#manager_orientation").show();
	} else {
		$("#manager_orientation").hide();
	}
	//更新文字属性显示
	if (component.typeName == "textview" || component.typeName == "button") {
		$("#manager_text_input").get(0).value = component.text;
		$("#manager_text").show();
	} else {
		$("#manager_text").hide();
	}
	//更新宽度高度属性显示	
	if (!isNaN(component.w)) $("#manager_width").get(0).value = parseFloat(component.w);
	else $("#manager_width").get(0).value = component.w;
	if (!isNaN(component.h)) $("#manager_height").get(0).value = parseFloat(component.h);
	else $("#manager_height").get(0).value = component.h;
	//如果是可以选择功能的组件，功能部分提供功能的选择
	if (_typeName == "button"
			|| _typeName == "textview"
			|| _typeName == "imageview"
			|| _typeName == "imagebutton") {
		if (component.functionID != -1) {
			$("#function_select").get(0).selectedIndex=parseInt(component.functionID)+1;
		} else {
			$("#function_select").get(0).selectedIndex=0;
		}
		$("#function_select").show();
	} else {
		$("#function_select").hide();
	}
	//如果是可以显示图片的部件，外观部分提供可选图片
	if (_typeName == "imageview" || _typeName == "imagebutton") {
		if (component.imageID != -1) {
			$("#resource_select").get(0).selectedIndex=parseInt(component.imageID)+1;
		} else {
			$("#resource_select").get(0).selectedIndex=0;
		}
		$("#resource_select").show();
	} else {
		$("#resource_select").hide();
	}
	//如果是有功能的组件，功能部分提供可动态显示标签
	if (component.clickable) {
		if (component.hasLink) {
			for (var i = 0; i < $("#link_select").get(0).length; i++) {
				if ($("#link_select").get(0).options[i].value.substring(9) == component.linkID)
					$("#link_select").get(0).selectedIndex = i;
			}
		} else {
			$("#link_select").get(0).selectedIndex=0;
		}
		$("#link_select").show();
	} else {
		$("#link_select").hide();
	}

}

/*
工程对象widgetProject
（该类唯一全区变量实例w在加载时被创建）
参数说明：
author：作者
widgetName：工程名
row：行数
column：列数
height：实际在网页上显示的高度
width：实际在网页上显示的高度
*/
WidgetProject ={
	author:"", widgetName:"", row:0, column:0, height:0, width:0
}

//点击start之后初始化WidgetProject各种参数
//全局变量u是插件单位为1在网页上显示的长度。对于app widget来说，实际的长度需要除以u乘以70
function getStarted(){
	if (document.author_form.author.value != "")
		WidgetProject.author=document.author_form.author.value;
	if (document.name_form.widget_name.value != "")
		WidgetProject.widgetName=document.name_form.widget_name.value;
	WidgetProject.row = document.size_form.size_row.value.valueOf();
	WidgetProject.column = document.size_form.size_column.value.valueOf();
	var maxValue = WidgetProject.row > WidgetProject.column ? WidgetProject.row : WidgetProject.column;
	u = 380 / (maxValue - 3/7);
	WidgetProject.height=WidgetProject.row * 70 - 30;
	WidgetProject.width=WidgetProject.column * 70 - 30;
}

function checkName(){
	if (document.getElementById("name_input").value == ""){
		$("#name_input_span").css("display", "block");
	}
	else{
		$("#name_input_span").css("display", "none");
	}
}

function checkAuthor(){
	if (document.getElementById("author_input").value == ""){
		$("#author_input_span").css("display", "block");
	}
	else{
		$("#author_input_span").css("display", "none");
	}
}

globalComponentCounter = 1;//全局的部件计数器

var getComponentHeight = function(id){
	var res = componentArray[id].h;
	if (res == "fill_parent")
		res = getParentHeight(highLightID);
	return res;
}

var getComponentWidth = function(id){
	var res = componentArray[id].w;
	if (res == "fill_parent")
		res = getParentWidth(highLightID);
	return res;
}

var calculateLeftHeight = function(_id){
	if (componentArray[_id].orientation == "horizontal"){
		var res = getComponentHeight(_id);
		return res;
	}
	else{
		var sonList = componentArray[_id].sonList;
		var sum = 0;
		for (var i = 0; i < sonList.length; i ++){
			if (componentArray[sonList[i]].deleted) continue;
			var tH = getComponentHeight(sonList[i]);
			sum += tH;
		}
		var aH = getComponentHeight(_id);
		return (aH - sum);
	}
}

var calculateLeftWidth = function(_id){
	if (componentArray[_id].orientation == "vertical"){
		var res = getComponentWidth(_id);
		return res;
	}
	else{
		var sonList = componentArray[_id].sonList;
		var sum = 0;
		for (var i = 0; i < sonList.length; i ++){
			if (componentArray[sonList[i]].deleted) continue;
			var tW = getComponentWidth(sonList[i]);
			sum += tW;
		}
		var aW = getComponentWidth(_id);
		return (aW - sum);
	}
}

var addNewComponentNode = function(cStyle){
	var newNode = document.createElement("li");
	var leftWidth = calculateLeftWidth(highLightID);	
	var leftHeight = calculateLeftHeight(highLightID);
	
	//if there isnt enough space, simply return?
	if (leftWidth < 5 || leftHeight < 5)
		return false;
	
	newNode.id = "component_outer" + globalComponentCounter;
	var innerNode;
	
	switch (cStyle){
		case "textview":
			innerNode = document.createElement("div");
			innerNode.title = "textview id=" + globalComponentCounter;

			// FIXME #31 5

			innerNode.className = "component";
			innerNode.innerHTML = "textview";
			break;
		case "button":
			innerNode = document.createElement("img");
			innerNode.src = "btn.png";
			innerNode.title = "button id=" + globalComponentCounter;	
			
			if (leftHeight / 80 * 120 < leftWidth)
				var minX = (leftHeight / 80 * 120);
			else
				var minX = leftWidth;
			innerNode.width = dp2px(minX);
			innerNode.height = dp2px(minX / 120 * 80);
			
			innerNode.className = "component";
			break;
		case "imageview":
			innerNode = document.createElement("img");
			innerNode.src = "img.png";
			innerNode.title = "imageview id=" + globalComponentCounter;
			
			var minX = leftHeight < leftWidth ? leftHeight : leftWidth;
			innerNode.width = dp2px(minX);
			innerNode.height = dp2px(minX);
			
			innerNode.className = "component";
			break;
		case "imagebutton":
			innerNode = document.createElement("img");
			innerNode.src = "imgbtn.png";
			innerNode.title = "imagebutton id=" + globalComponentCounter;
			
			var minX = leftHeight < leftWidth ? leftHeight : leftWidth;
			innerNode.width = dp2px(minX);
			innerNode.height = dp2px(minX);
	
			innerNode.className = "component";
			break;
		case "horizontalLayout":
			innerNode = document.createElement("ul");
			innerNode.title = "horizontal-layout id=" + globalComponentCounter;
			
			var minX = leftHeight < leftWidth ? leftHeight : leftWidth;
			// FIXME #31 1,2
			innerNode.width = dp2px(minX);
			innerNode.height = dp2px(minX);
	
			innerNode.className = "component horizontal-layout";
			break;
		case "verticalLayout":
			innerNode = document.createElement("ul");
			innerNode.title = "vertical-layout id=" + globalComponentCounter;
			
			var minX = leftHeight < leftWidth ? leftHeight : leftWidth;
			// FIXME #31 1,2
			innerNode.width = dp2px(minX);
			innerNode.height = dp2px(minX);
	
			innerNode.className = "component vertical-layout";
			break;
		default:
			alert("error!");
			return null;
	}
	innerNode.id = "component" + globalComponentCounter;
	newNode.appendChild(innerNode);
	document.getElementById("component"+highLightID).appendChild(newNode);
	componentArray[globalComponentCounter]=createComponentObject(cStyle, globalComponentCounter, highLightID);
	return true;
}

//鼠标单击部件后执行的函数
function clickOnComponent(e){
	//改变高亮部件
	changeHighLight(this.id.substring(9));
	
	//停止冒泡
	if (!e) var e = window.event;
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
}

function changeHighLight(componentID){
	if (componentID >= 0) highLightID = componentID;
	manager_select_change(componentID);
	refreshHighLightSpan();	
}

function refreshHighLightSpan(){
	var highLightElement = document.getElementById("component"+highLightID);
	$(".highLighted").removeClass("highLighted");

	$("#component_outer"+highLightID).addClass("highLighted");
	if (highLightID == 0)
		return;
	$("#component_outer"+highLightID).resizable({ containment: "parent"});
//	$("#component_outer"+highLightID).resizable( "option", "alsoResize", "#component"+highLightID);

/*
	$("#component"+highLightID).resizable();
	var maxHeight;
	var maxWidth;
	var pID = componentArray[highLightID].parentID;
	if (componentArray[pID].orientation == "vertical"){
		maxWidth = getComponentWidth(pID);
		var sonList = componentArray[pID].sonList;
		var sum = 0;
		for (var i = 0; i < sonList.length; i ++){
			var tH = getComponentHeight(sonList[i]);
			sum += tH;
		}
		var aH = getComponentHeight(pID);
		maxHeight = aH - sum;		
	}
	else{
		maxHeight = getComponentHeight(pID);
		var sonList = componentArray[pID].sonList;
		var sum = 0;
		for (var i = 0; i < sonList.length; i ++){
			var tW = getComponentWidth(sonList[i]);
			sum += tW;
		}
		var aW = getComponentWidth(pID);
		maxWidth = aW - sum;
	}
	$("#component"+highLightID).resizable( "option", "maxHeight", maxHeight );
	$("#component"+highLightID).resizable( "option", "maxWidth", maxWidth);
	*/

	$("#component_outer"+highLightID).bind( "resizestop", function(event, ui) {
		// refresh the component's size
		componentArray[highLightID].h = px2dp(document.getElementById("component_outer"+highLightID).clientHeight);
		componentArray[highLightID].w = px2dp(document.getElementById("component_outer"+highLightID).clientWidth);
		// if change too much
		var leftWidth = calculateLeftWidth(componentArray[highLightID].parentID);	
		var leftHeight = calculateLeftHeight(componentArray[highLightID].parentID);
		if (leftWidth < 0) {
			componentArray[highLightID].w += leftWidth; 	
			$("#component_outer"+highLightID).css("width", dp2px(componentArray[highLightID].w));
		}
		if (leftHeight < 0) {
			componentArray[highLightID].h += leftHeight;
			$("#component_outer"+highLightID).css("height", dp2px(componentArray[highLightID].h));
		}
		$("#component"+highLightID).css("width", document.getElementById("component_outer"+highLightID).clientWidth);
		$("#component"+highLightID).css("height", document.getElementById("component_outer"+highLightID).clientHeight);
		manager_select_change(highLightID);
	});
}

resourceArray = new Array();//存放资源对象
globalResourceCounter=0;

/*
资源对象：
rid：资源ID
path：资源在用户机器中的路径，打包上传时使用
*/
function createResourceObject(_rid, _path){
	var resource = new Object;	
	resource.rid=_rid;
	resource.path=_path;	
	return resource;
}

//用户添加了图片资源，需要记住路径、为其编号、并生成预览图片
function ajaxFileUpload() {
	$("#loading")
	.ajaxStart(function(){
		$(this).show();
	})
	.ajaxComplete(function(){
		$(this).hide();
	});

	$.ajaxFileUpload
	(
		{
			url:'doajaxfileupload.php',
			secureuri:false,
			fileElementId:'fileToUpload',
			dataType: 'json',
			data:{name:'logan', id:'id'},
			success: function (data, status)
			{
				if(typeof(data.error) != 'undefined')
				{
					if(data.error != '')
					{
						alert(data.error);
					}else
					{
						alert(data.msg);
						if (data.msg.indexOf("Stored") >= 0) {
							//显示刚刚添加的图片
							var imgNode = document.createElement("img");
							imgNode.src=data.filepath;
							imgNode.setAttribute("width", "100px");
							imgNode.setAttribute("height", "100px");
							imgNode.id="res"+globalResourceCounter;
							document.getElementById("resources").appendChild(imgNode);
							//显示资源id
							var imgInfo = document.createElement("p");
							imgInfo.innerHTML=imgNode.id;
							document.getElementById("resources").appendChild(imgInfo);
							
							//添加资源到资源列表并且刷新高亮图片组件（如果高亮的是图片类组件）可选资源
							$("#resource_select").append("<option value='"+globalResourceCounter+"'>"+imgNode.id+"</option>");
							resourceArray[globalResourceCounter]=createResourceObject(globalResourceCounter, data.filepath);
							globalResourceCounter++;
							refreshHighLightSpan();
						}
					}
				}
			},
			error: function (data, status, e)
			{
				alert(e);
			}
		}
	)
	return false;
}

var getParentWidth = function(id){
	if (id == 0)
		return WidgetProject.width;
	var parentID = componentArray[id].parentID;
	var width = componentArray[parentID].w;

	if (width == "fill_parent")
		return getParentWidth(parentID)	
}

var getParentHeight = function(id){
	if (id == 0)
		return WidgetProject.height;
	var parentID = componentArray[id].parentID;
	var width = componentArray[parentID].h;

	if (width == "fill_parent")
		return getParentHeight(parentID)	
}

//============== component ==================
/*属性:
typename: 组建类型名称，如textview，button，horizontalLayout等等
id: 组件的全局唯一ID
parentID: 组件的父节点ID
x,y,w,h: 组件位置和长宽
text: 显示文字
imageID: 图片资源ID
orientation: layout的方向，horizontal或者vertical
functionID:
	0 打开应用程序
	1 打开网页
	2 快速拨号
	3 快速短信
	4 快速邮件
clickable: 是否可以点击
deleted: 是否已删除

sonList:子节点的数组，严格按照子节点的相对位置排列
position:本结点在父容器中的位置
liveSonNum:本结点活着的子节点数目
*/
componentArray = new Array();//存放所有的部件

function createComponentObject(_typeName, _id, _parentID){
	var component = new Object;
	component.typeName=_typeName;
	component.id=_id;

	component.parentID=parseInt(_parentID);
	var node=document.getElementById("component"+_id);
	component.w=parseFloat(px2dp(node.clientWidth));
	component.h=parseFloat(px2dp(node.clientHeight));
	if (0 == _id) component.w = component.h = "fill_parent"
	
	component.text="";
	component.orientation=null;
	if ("horizontalLayout" == _typeName) component.orientation="horizontal";
	else if ("verticalLayout" == _typeName) component.orientation="vertical";

	component.imageID=-1;
	component.functionID=-1;
	component.clickable=false;
	component.hasLink=false;
	component.linkID=0;
	if ("textview" == _typeName || "button" == _typeName) {
		$("#link_select").append("<option class=\"select"+_id+"\" value=\"component"+_id+"\">component"+_id+"</option>");
	}
	$("#manager_select").append("<option class=\"select"+_id+"\" value=\"component"+_id+"\">component"+_id+"</option>");

	component.deleted = false;

	component.sonList=new Array();
	component.liveSonNum=0;
	
	if (_id != 0){
		component.position=componentArray[_parentID].sonList.length;
		componentArray[_parentID].sonList[component.position]=_id;
		componentArray[_parentID].liveSonNum++;
	}
	
	return component;
}

// 高亮部件，初始状态是最底层的layout
highLightID=0;

// 最后生成的XML
var componentXML;
// Json中需要的数据
var func_name = new Array("activity_launcher", "web_bookmark", "dial_shortcut", "message_shortcut", "mail_shortcut");
var componentPics;
var componentFunc;
var componentLink;
var jsonWarning;

// 提交之前生成需要的XML
function genXML() {
	componentPics = new Array();
	componentFunc = new Array(5);
	for (var i = 0; i < 5; i++) componentFunc[i] = new Array();
	componentLink = new Array();
	jsonWarning = false;

	componentXML = genXMLforComponent(0, "");
}

// 对于每个component编写其XML属性及其子节点
function genXMLforComponent(_id, padding) {
	var thisXML="";
	var component = componentArray[_id];
	var thisTag = getTag(component.typeName);

	if (jsonWarning) return thisXML;

	//如果有特殊需求需要添加到Json中
	if (component.imageID != -1) componentPics.push(resourceArray[component.imageID].path.substring(7));
	if (component.clickable) componentFunc[component.functionID].push("component"+_id);
	if (component.hasLink) componentLink.push("component"+_id), componentLink.push("component"+component.linkID);
	
	if (_id == 0) thisXML += "<?xml version=\\\"1.0\\\" encoding=\\\"utf-8\\\"?>\\n"
	thisXML += padding + "<" + thisTag;
	if (_id == 0) thisXML += " xmlns:android=\\\"http://schemas.android.com/apk/res/android\\\"";
	else thisXML += " android:id=\\\"@+id/component"+_id+"\\\"";

	if (component.imageID != -1) {
		thisXML += "\\n    "+padding + "android:src=\\\"@drawable/"+resourceArray[component.imageID].path.substring(7, resourceArray[component.imageID].path.lastIndexOf("."))+"\\\"";
		thisXML += "\\n    "+padding + "android:scaleType=\\\"fitXY\\\"";
	} else if (thisTag == "ImageView" || thisTag == "ImageButton") {
		alert("警告：component"+_id+"未指定图片资源！");
		jsonWarning = true;
		return thisXML;
	}
	if (component.clickable) thisXML += "\\n    "+padding + "android:clickable=\\\"true\\\"";
	if (component.text != null && component.text != "") thisXML += "\\n    "+padding + "android:text=\\\""+component.text+"\\\"";
	if (!isNaN(component.w)) thisXML += "\\n    "+padding + "android:layout_width=\\\""+Math.round(component.w)+"dp\\\"";
	else thisXML += "\\n    "+padding + "android:layout_width=\\\""+component.w+"\\\"";
	if (!isNaN(component.h)) thisXML += "\\n    "+padding + "android:layout_height=\\\""+Math.round(component.h)+"dp\\\"";
	else thisXML += "\\n    "+padding + "android:layout_height=\\\""+component.h+"\\\"";
	if (thisTag == "LinearLayout") {
		thisXML += "\\n    "+padding + "android:orientation=\\\""+component.orientation+"\\\"";
		thisXML += " >\\n";
		for (var i = 0; i < component.sonList.length; i++) {
			if (!componentArray[component.sonList[i]].deleted) {
				thisXML += "\\n"+genXMLforComponent(component.sonList[i], padding+"    ");
			}
		}
		thisXML += padding+"</" + thisTag + ">\\n";
	} else {
		thisXML += " />\\n";	
	}
	return thisXML;
}

function getTag(_typeName) {
	var ret;
	switch (_typeName) {
		case "textview":
			ret = "TextView";
			break;
		case "button":
			ret = "Button";
			break;
		case "imageview":
			ret = "ImageView";
			break;
		case "imagebutton":
			ret = "ImageButton";
			break;
		case "horizontalLayout":
			ret = "LinearLayout";
			break;
		case "verticalLayout":
			ret = "LinearLayout";
			break;
		default:
			alert("error!");
			return null;
	}
	return ret;
}

// 最后生成的Json
var componentJson;

// 提交之前生成需要的Json
function genJson()
{
	genXML();
	if (jsonWarning) return ;
	componentJson = "{\"name\":\""+WidgetProject.widgetName+"\", \"author\":\""+WidgetProject.author+"\", \"row\":"+WidgetProject.row+", \"col\":"+WidgetProject.column+", \"layout\":\""+componentXML+"\"";
	if (componentPics.length > 0) {
		componentJson = componentJson+", \"pics\": [\""+componentPics[0]+"\"";
		for (var i = 1; i < componentPics.length; i++) {
			componentJson = componentJson+", \""+componentPics[i]+"\"";
		}
		componentJson = componentJson+"]";
	}
	for (var i = 0; i < 5; i++) {
		if (componentFunc[i].length > 0) {
			componentJson = componentJson+", \""+func_name[i]+"\": [\""+componentFunc[i][0]+"\"";
			for (var j = 1; j < componentFunc[i].length; j++) {
				componentJson = componentJson+", \""+componentFunc[i][j]+"\"";
			}
			componentJson = componentJson+"]";
		}
	}
	if (componentLink.length > 0) {
		componentJson = componentJson+", \"link\": {\""+componentLink[0]+"\":\""+componentLink[1]+"\"";
		for (var i = 2; i < componentLink.length; i += 2) {
			componentJson = componentJson+", \""+componentLink[i]+"\":\""+componentLink[i+1]+"\"";
		}
		componentJson = componentJson+"}";
	}
	componentJson += "}";
	document.getElementById("submit_hidden").value=componentJson;
	document.getElementById("submit_form").submit();
}

var px2dp = function(length){
	return length * 70.0 / u;
}

var dp2px = function(length){
	return length * u / 70.0;
}

