// JavaScript Document

$(document).ready(function(){
$("#start_button").click(function(){
	$("#wrapper").hide();
	$("#work_station").css("display", "block");
	$("#widget_container").css("height", WidgetProject.height+"px");
	$("#widget_container").css("width", WidgetProject.width+"px");
});
$("#new_textview").click(function(){
	$("#widget_container").append(createComponent(1));
	$("#manager").append(addToManager(1));
	$(".drag").draggable({containment: "parent"});
});
$("#new_button").click(function(){
	$("#widget_container").append(createComponent(2));
	$("#manager").append(addToManager(2));
	$(".drag").draggable({containment: "parent"});
});
$("#new_imageview").click(function(){
	$("#widget_container").append(createComponent(3));
	$("#manager").append(addToManager(3));
	$(".drag").draggable({containment: "parent"});
});
$("#new_imagebutton").click(function(){
	$("#widget_container").append(createComponent(4));
	$("#manager").append(addToManager(4));
	$(".drag").draggable({containment: "parent"});
});
$("#horizontalLayout").click(function(){
	$("#widget_container").append(createComponent(5));
	$("#manager").append(addToManager(5));
	$(".drag").draggable({containment: "parent"});
});
$("#verticalLayout").click(function(){
	$("#widget_container").append(createComponent(6));
	$("#manager").append(addToManager(6));
	$(".drag").draggable({containment: "parent"});
});
});

/*
���̶���widgetProject
������Ψһȫ������ʵ��w�ڼ���ʱ��������
����˵����
author������
widgetName��������
row������
column������
height��ʵ������ҳ����ʾ�ĸ߶�
width��ʵ������ҳ����ʾ�ĸ߶�
*/
WidgetProject ={
	author:null, widgetName:null, row:0, column:0, height:0, width:0,

	calculateSize:function(){
		this.height=document.size_form.size_row.value.valueOf() * u - u/7*3;
		this.width=document.size_form.size_column.value.valueOf() * u - u/7*3;
	},
}

//���start֮���ʼ��WidgetProject���ֲ���
//ȫ�ֱ���u�ǲ����λΪ1����ҳ����ʾ�ĳ��ȡ�����app widget��˵��ʵ�ʵĳ�����Ҫ����u����70
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
globalComponentCounter = 0;//ȫ�ֵĲ���������

//��widget_container������µĲ���
var createComponent=function(cClass){
	var str;
	switch (cClass){
		// create a new textview
		case 1:
		str = "<div id=\"component" + globalComponentCounter + "\" title=\"textview id=" + globalComponentCounter + "\" class=\"drag component\">textview</div>";
		break;
		// create a new button
		case 2:
		str = "<img id=\"component" + globalComponentCounter + "\" src=\"btn.png\" title=\"button id=" + globalComponentCounter + "\"  height=\"80px\" width=\"120px\" class=\"drag component\" />";
		break;
		// create a new imageview
		case 3:
		str = "<img id=\"component" + globalComponentCounter + "\" src=\"img.png\" title=\"image id=" + globalComponentCounter + "\"  height=\"80px\" width=\"80px\" class=\"drag component\" />";
		break;
		// create a new imagebutton
		case 4:
		str = "<img id=\"component" + globalComponentCounter + "\" src=\"imgbtn.png\" title=\"imagebutton id=" + globalComponentCounter + "\"  height=\"80px\" width=\"80px\" class=\"drag component\" />";
		break;
		case 5:
		str = "<div>horizontal layout</div>";
		break;
		case 6:
		str = "<div>vertical layout</div>";
		break;
	}
	
	componentArray.push(createComponentObject(cClass, globalComponentCounter));
	globalComponentCounter++;
	return str;
}

var addToManager = function(cClass){
	var str;
	switch(cClass){
		case 1:
		str="<p>component" + (globalComponentCounter-1) + "(textview)</p>";
		break;
		case 2:
		str="<p>component" + (globalComponentCounter-1) + "(button)</p>";
		break;
		case 3:
		str="<p>component" + (globalComponentCounter-1) + "(imageview)</p>";
		break;
		case 4:
		str="<p>component" + (globalComponentCounter-1) + "(imagebutton)</p>";
		break;
	}
	return str;
}

//============== component ==================
/*���ԣ�
typename���齨�������ƣ���textview��button��horizontalLayout�ȵ�
id�������ȫ��ΨһID
parentID������ĸ��ڵ�ID

*/
componentArray = new Array();//������еĲ���
function createComponentObject(_typeName, _id){
	component = new Object;
	component.typeName=_typeName;
	component.id=_id;
	return component;
}






















