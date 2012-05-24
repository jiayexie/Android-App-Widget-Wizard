// JavaScript Document

$(document).ready(function(){
$("#start_button").click(function(){
	componentArray[0]=createComponentObject("horizontalLayout", 0);
	
	$("#component0").sortable();
	$("#component0").disableSelection();
	
	$("#wrapper").hide();
	$("#work_station").css("display", "block");
	$("#component0").css("height", WidgetProject.height+"px");
	$("#component0").css("width", WidgetProject.width+"px");
	document.getElementById("component0").onclick=clickOnComponent;
	refreshHighLightSpan();
});
$(".create").click(function(){
	//只有高亮的Layout才能添加部件
	if (componentArray[highLightID].typeName != "horizontalLayout" && componentArray[highLightID].typeName != "verticalLayout")
		highLightID = componentArray[highLightID].parentID, refreshHighLightSpan();	
	//	return;
	
	//判断是否有足够的地方来放它？
	if (!hasEnoughSpace(this.id)){
		return;
	}
	
	$("#component"+highLightID).append(createComponent(this.id));
	document.getElementById("component"+globalComponentCounter).onclick=clickOnComponent;
	changeHighLight(globalComponentCounter);
	
	if (this.id=="new_verticalLayout" || this.id=="new_horizontalLaytout"){
		$("#component_outer"+globalComponentCounter).sortable();
		$("#component_outer"+globalComponentCounter).disableSelection();
	}

	globalComponentCounter ++;
});
$("#submit_button").click(function(){
	$("#wrapper").css("display", "block");
	$("#work_station").hide();
	refreshHighLightSpan();
});
$("#save_button").click(function(){
	alert("save尚未实现>.<");
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
});


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
	author:null, widgetName:null, row:0, column:0, height:0, width:0,

	calculateSize:function(){
		this.height=document.size_form.size_row.value.valueOf() * u - u/7*3;
		this.width=document.size_form.size_column.value.valueOf() * u - u/7*3;
	},
}

//点击start之后初始化WidgetProject各种参数
//全局变量u是插件单位为1在网页上显示的长度。对于app widget来说，实际的长度需要除以u乘以70
function getStarted(){
	WidgetProject.author=document.author_form.author.value;
	WidgetProject.widgetName=document.name_form.widget_name.value;
	WidgetProject.row = document.size_form.size_row.value.valueOf();
	WidgetProject.column = document.size_form.size_column.value.valueOf();
	var maxValue = WidgetProject.row > WidgetProject.column ? WidgetProject.row : WidgetProject.column;
	u = 380 / (maxValue - 3/7);
	WidgetProject.height=WidgetProject.row * u - u/7*3;
	WidgetProject.width=WidgetProject.column * u - u/7*3;
	
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

//在widget_container中添加新的部件
//参数: cStyle是要添加部件的类型
//返回值：包含添加部件html代码的字符串
var createComponent=function(cStyle){
	var str;
	switch (cStyle){
		case "new_textview":
			str = 
					"<li id='component_outer" + globalComponentCounter + "'>"
					+ "<div id='component" + globalComponentCounter
					+ "' title='textview id=" + globalComponentCounter 
					+ "' class='component'>textview</div>"
					+ "</li>" 
					;
			break;
		case "new_button":
			str = 
					"<li id='component_outer" + globalComponentCounter + "'>"
					+ "<img id=\"component" + globalComponentCounter 
					+ "\" src='btn.png' title='button id=" + globalComponentCounter 
					+ "'  height='80px' width='120px' class='component' />"
					+ "</li>"
					;
			break;
		case "new_imageview":
			str = 
					"<li id='component_outer" + globalComponentCounter + "'>"
					+ "<img id='component" + globalComponentCounter 
					+ "' src='img.png' title='image id=" + globalComponentCounter 
					+ "'  height='80px' width='80px' class='component' />"
					+ "</li>"
					;		
			break;
		case "new_imagebutton":
			str = 
					"<li id='component_outer" + globalComponentCounter + "'>"
					+ "<img id='component" + globalComponentCounter 
					+ "' src='imgbtn.png' title='imagebutton id=" + globalComponentCounter 
					+ "'  height='80px' width='80px' class='component' />"
					+ "</li>"
					;
			break;
		case "new_horizontalLayout":
			str = 
					"<li id='component_outer" + globalComponentCounter + "'>"
					+ "<ul id='component" + globalComponentCounter + "'" 
					+ " title='horizontal-layout id=" + globalComponentCounter + "'" 
					+ " height='80px' width='80px' class='component horizontal-layout'>"
					+ "</ul>"
					+ "</li>"
					;
			break;
		case "new_verticalLayout":
			str = 
					"<li id='component_outer" + globalComponentCounter + "'>"
					+ "<ul id='component" + globalComponentCounter + "'"
					+ " title='vertical-layout id=" + globalComponentCounter + "'" 
					+ "  height='80px' width='80px' class='component vertical-layout'>"
					+ "</ul>"
					+ "</li>"
					;
			break;
		default:
			alert("error!");
			return null;
	}
	componentArray[globalComponentCounter]=createComponentObject(cStyle.substring(4), globalComponentCounter, highLightID);
	return str;
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
	highLightID = componentID;
	refreshHighLightSpan();	
}

function refreshHighLightSpan(){	
	var highLightElement = document.getElementById("component"+highLightID);
		$("#highLightDiv").css("left", highLightElement.offsetLeft+"px");
		$("#highLightDiv").css("top", highLightElement.offsetTop+"px");
		$("#highLightDiv").css("height", highLightElement.clientHeight-4+"px");
		$("#highLightDiv").css("width", highLightElement.clientWidth-4+"px");
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
function addImageRes(){
	var fileNode = document.getElementById("addImage");		
	var path = getFullPath(fileNode.value);	
	var resNum = globalResourceCounter;	
	
	var imgNode = document.createElement("img");
	imgNode.src=path;
	imgNode.setAttribute("width", "100px");
	imgNode.setAttribute("height", "100px");
	imgNode.id="res"+globalResourceCounter;
	document.getElementById("resources").appendChild(imgNode);
	
	resourceArray[globalResourceCounter]=createResourceObject(globalResourceCounter, path);
	
	globalResourceCounter++;
}

 function getFullPath(obj) {    //得到图片的完整路径  
     if (obj) {  
         //ie  
         if (window.navigator.userAgent.indexOf("MSIE") >= 1) {  
             obj.select();  
             return document.selection.createRange().text;  
         }  
         //firefox  
         else if (window.navigator.userAgent.indexOf("Firefox") >= 1) {  
             if (obj.files) {  
                 return obj.files.item(0).getAsDataURL();  
             }  
             return obj.value;  
         }  
         return obj.value;  
     }  
 } 

// need fix
var hasEnoughSpace = function(){
	var sonList = componentArray[highLightID].sonList;
	var orientation = componentArray[highLightID].orientation;
	var sum = 0;
	for (var i = 0; i < sonList.lenghth; i ++){
		if (orientation == "vertical"){
			sum += sonList[i].h;
		}
		else if (orientation == "horizontal"){
			sum += sonList[i].w;
		}
		else{
			alert("error!");
		}
	}
	if (componentArray[highLightID])
	return true;
}

//============== component ==================
/*属性：
typename：组建类型名称，如textview，button，horizontalLayout等等
id：组件的全局唯一ID
parentID：组件的父节点ID
x,y,w,h：组件位置和长宽
text：显示文字
imageID：图片资源ID
orientation：layout的方向，horizontal或者vertical

sonList:子节点的数组，严格按照子节点的相对位置排列
position:本结点在父容器中的位置
*/
componentArray = new Array();//存放所有的部件

function createComponentObject(_typeName, _id, _parentID){
	var component = new Object;
	component.typeName=_typeName;
	component.id=_id;

	component.parentID=parseInt(_parentID);
	var node=document.getElementById("new_"+_typeName);
	//component.x=node.offsetLeft / 70 * u;
	//component.y=node.offsetTop / 70 * u;
	component.w=node.clientWidth / 70 * u;
	component.h=node.clientHeight / 70 * u;
	
	component.hasLink=0;
	component.linkID=0;
	component.text="";
	component.imageID=null;
	component.orientation=null;

	component.sonList=new Array();
	
	if (_id != 0){
		component.position=componentArray[_parentID].sonList.length;
		componentArray[_parentID].sonList[component.position]=_id;
	}
	
	return component;
}

// 高亮部件，初始状态是最底层的layout
highLightID=0;

// 最后生成的XML
var componentXML;
// component之间的父子关系图
var componentGraph;

// 提交之前生成需要的XML
function genXML() {
	var visited = new Boolean(globalComponentCounter);
	var completedCounter = 0;
	
	genGraph();
	componentXML = genXMLforComponent(0, "");
	//可以用Javascript控制台查看Elements中submit块中注释即为结果
	$("#submit_content").append("<!--\n"+componentXML); // FIXME
}

// 生成component之间的父子关系图
function genGraph() {
	componentGraph = new Array(globalComponentCounter);
	for (var i = 0; i < globalComponentCounter; i++) componentGraph[i] = new Array();
	
	for (var i = 0; i < globalComponentCounter; i++) {
		if (!isNaN(componentArray[i].parentID))
		//	componentGraph[componentArray[i].parentID].push(i);
			componentGraph[componentArray[i].parentID][i] = 1;
	}	
}

// 对于每个component编写其XML属性及其子节点
function genXMLforComponent(_id, padding) {
	var thisXML;
	var component = componentArray[_id];
	var thisTag = getTag(component.typeName);
	
/*
typename：组建类型名称，如textview，button，horizontalLayout等等
id：组件的全局唯一ID
parentID：组件的父节点ID
x,y,w,h：组件位置和长宽
text：显示文字
imageID：图片资源ID
orientation：layout的方向，horizontal或者vertical
*/

	thisXML = padding + "<" + thisTag;
	if (_id == 0) thisXML += "xmlns:android=\"http://schemas.android.com/apk/res/android\"";

	if (component.imageID != null && component.imageID != "") thisXML += "\n    "+padding + "android:src=\""+component.imageID+"\""; // FIXME
	if (component.text != null && component.text != "") thisXML += "\n    "+padding + "android:text=\""+component.text+"\"";
	if (!isNaN(component.w)) thisXML += "\n    "+padding + "android:layout_width=\""+component.w+"px\"";// FIXME
	if (!isNaN(component.h)) thisXML += "\n    "+padding + "android:layout_height=\""+component.h+"px\"";// FIXME
	if (thisTag == "LinearLayout") {
		thisXML += "\n    "+padding + "android:orientation=\""+component.orientation+"\"";
		thisXML += " >\n";
		for (var i = 0; i < globalComponentCounter; i++) {
			if (componentGraph[_id][i] == 1)
				thisXML += "\n"+genXMLforComponent(i, padding+"    ");
		}
		thisXML += padding+"</" + thisTag + ">\n";
	} else {
		thisXML += " />\n";	
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

