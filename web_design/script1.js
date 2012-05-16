// JavaScript Document

$(document).ready(function(){
$("#start_button").click(function(){
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
		return;
	
	//判断是否有足够的地方来放它？
	if (!hasEnoughSpace()){
		return;
	}
	
	$(".highLight").append(createComponent(this.id));
	document.getElementById("component"+globalComponentCounter).onclick=clickOnComponent;	
	$("#component" + globalComponentCounter).resizable({ghost:true, stop:function(event, ui){
			refreshHighLightSpan();	
		}});
	$("#component" + globalComponentCounter).parent().draggable();
	changeHighLight(globalComponentCounter);
	
	globalComponentCounter ++;	
});
$("#submit_button").click(function(){
	$("#wrapper").css("display", "block");
	$("#work_station").hide();
	refreshHighLightSpan();
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

//=============================
globalComponentCounter = 1;//全局的部件计数器

//在widget_container中添加新的部件
//参数: cStyle是要添加部件的类型
//返回值：包含添加部件html代码的字符串
var createComponent=function(cStyle){
	var str;
	switch (cStyle){
		case "new_textview":
			str = 
					"<div id='component_outer" + globalComponentCounter + "'>"
					+ "<div id='component" + globalComponentCounter
					+ "' title='textview id=" + globalComponentCounter 
					+ "' class='component'>textview</div>"
					+ "</div>" 
					;
			break;
		case "new_button":
			str = 
					"<div id='component_outer" + globalComponentCounter + "'>"
					+ "<img id=\"component" + globalComponentCounter 
					+ "\" src='btn.png' title='button id=" + globalComponentCounter 
					+ "'  height='80px' width='120px' class='component' />"
					+ "</div>"
					;
			break;
		case "new_imageview":
			str = 
					"<div id='component_outer" + globalComponentCounter + "'>"
					+ "<img id='component" + globalComponentCounter 
					+ "' src='img.png' title='image id=" + globalComponentCounter 
					+ "'  height='80px' width='80px' class='component' />"
					+ "</div>"
					;		
			break;
		case "new_imagebutton":
			str = 
					"<div id='component_outer" + globalComponentCounter + "'>"
					+ "<img id='component" + globalComponentCounter 
					+ "' src='imgbtn.png' title='imagebutton id=" + globalComponentCounter 
					+ "'  height='80px' width='80px' class='component' />"
					+ "</div>"
					;
			break;
		case "horizontalLayout":
			str = 
					"<div id='component_outer" + globalComponentCounter + "'>"
					+ "<div id='component" + globalComponentCounter 
					+ "' title='horizontal layout id=" + globalComponentCounter + "'" 
					+ "  height='80px' width='80px' class='component'>"
					+ "</div>"
					+ "</div>"
					;
			break;
		case "verticalLayout":
			str = 
					"<div id='component_outer" + globalComponentCounter + "'>"
					+ "<div id='component" + globalComponentCounter + "'"
					+ " title='vertical layout id=" + globalComponentCounter + "'" 
					+ "  height='80px' width='80px' class='component'>"
					+ "</div>"
					+ "</div>"
					;
			break;
		default:
			alert("error!");
			return null;
	}
	componentArray[globalComponentCounter]=createComponentObject(cStyle, globalComponentCounter, highLightID);
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
	document.getElementById("component" + highLightID).className="component";
	highLightID = componentID;
	document.getElementById("component" + componentID).className="highLight component";
	refreshHighLightSpan();	
}

function refreshHighLightSpan(){	
	var highLightElement = document.getElementById("component"+highLightID);	
	if (highLightElement.id == "component0"){
		$("#highLightDiv").css("left", highLightElement.offsetLeft+"px");
		$("#highLightDiv").css("top", highLightElement.offsetTop+"px");
		$("#highLightDiv").css("height", highLightElement.clientHeight-6+"px");
		$("#highLightDiv").css("width", highLightElement.clientWidth-6+"px");
	}
	else{		
		if (componentArray[highLightID].parentID == 0){
			var outerElement = highLightElement.parentNode;
			$("#highLightDiv").css("left", highLightElement.offsetLeft+outerElement.offsetLeft+"px");
			$("#highLightDiv").css("top", highLightElement.offsetTop+outerElement.offsetTop+"px");
			$("#highLightDiv").css("height", highLightElement.clientHeight-6+"px");
			$("#highLightDiv").css("width", highLightElement.clientWidth-6+"px");
		}
		else{
			var outerElement = document.getElementById("component_outer" + componentArray[highLightID].parentID);
			$("#highLightDiv").css("left", highLightElement.parentNode.offsetLeft+outerElement.offsetLeft+"px");
			$("#highLightDiv").css("top", highLightElement.parentNode.offsetTop+outerElement.offsetTop+"px");
			$("#highLightDiv").css("height", highLightElement.clientHeight-6+"px");
			$("#highLightDiv").css("width", highLightElement.clientWidth-6+"px");
		}
	}
}

var hasEnoughSpace = function(){
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
*/
componentArray = new Array();//存放所有的部件
componentArray[0]=createComponentObject("horizontalLayout", 0);

function createComponentObject(_typeName, _id, _parentID){
	component = new Object;
	component.typeName=_typeName;
	component.id=_id;

	component.parentID=parseInt(_parentID);
	component.x=0;
	component.y=0;
	component.w=0;
	component.h=0;
	component.hasLink=0;
	component.linkID=0;
	component.text="sometext";
	component.imageID="img1";
	component.orientation="horizontal";
	
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
	$("#submit").append("<!--\n"+componentXML); // FIXME
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
		case "new_textview":
			ret = "TextView";
			break;
		case "new_button":
			ret = "Button";
			break;
		case "new_imageview":
			ret = "ImageView";
			break;
		case "new_imagebutton":
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














