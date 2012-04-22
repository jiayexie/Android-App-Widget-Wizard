// JavaScript Document

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

function onLoad(){
}

//点击start之后初始化WidgetProject各种参数
//全局变量u是插件单位为1在网页上显示的长度。对于app widget来说，实际的长度是70*u
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
globalComponentCounter = 0;//全局的部件计数器

//在widget_container中添加新的部件
var createComponent=function(cClass){
	switch (cClass){
		// create a new textview
		case 1:
		str = "<div id=\"component" + globalComponentCounter + "\" title=\"textview id=" + globalComponentCounter + "\" class=\"drag\">textview</div>";
		break;
		// create a new button
		case 2:
		str = "<img id=\"component" + globalComponentCounter + "\" src=\"btn.png\" title=\"button id=" + globalComponentCounter + "\"  height=\"80px\" width=\"120px\" class=\"drag\" />";
		break;
		// create a new imageview
		case 3:
		str = "<img id=\"component" + globalComponentCounter + "\" src=\"img.png\" title=\"image id=" + globalComponentCounter + "\"  height=\"80px\" width=\"80px\" class=\"drag\" />";
		break;
		// create a new imagebutton
		case 4:
		str = "<img id=\"component" + globalComponentCounter + "\" src=\"imgbtn.png\" title=\"imagebutton id=" + globalComponentCounter + "\"  height=\"80px\" width=\"80px\" class=\"drag\" />";
		break;
	}
	componentArray.push(createComponentObject(cClass, globalComponentCounter));
	globalComponentCounter++;
	return str;
}

var addToManager = function(cClass){
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

//========= drag ====================

var dragobject={
	x:0, y:0,
	
	z: 0, tx: 0, ty: 0, offsetx : null, offsety : null, targetobj : null, dragapproved : 0,
	
	initialize:function(){
		document.onmousedown=this.drag
		document.onmouseup=function(){
			this.dragapproved = 0
		}

	},
	
	drag:function(e){
		var evtobj=window.event? window.event : e
		this.targetobj=window.event? event.srcElement : e.target
		if (this.targetobj.className=="drag"){
			this.dragapproved=1
			if (isNaN(parseInt(this.targetobj.style.left))){
				this.targetobj.style.left=document.getElementById("widget_container").offsetLeft + "px";
			}
			if (isNaN(parseInt(this.targetobj.style.top))){
				this.targetobj.style.top=document.getElementById("widget_container").offsetTop + "px";
			}
			this.offsetx=parseInt(this.targetobj.style.left)
			this.offsety=parseInt(this.targetobj.style.top)
			this.tx=evtobj.clientX
			this.ty=evtobj.clientY
			if (evtobj.preventDefault)
				evtobj.preventDefault()
			document.onmousemove=dragobject.moveit
		}
	},
	
	moveit:function(e){
		var evtobj=window.event? window.event : e
		if (this.dragapproved==1){
			this.targetobj.style.left=this.offsetx+evtobj.clientX-this.tx+"px"
			this.targetobj.style.top=this.offsety+evtobj.clientY-this.ty+"px"
			this.x = this.offsetx+evtobj.clientX-this.tx;
			this.y = this.offsety+evtobj.clientY-this.ty;
			return false
		}
	},
}
dragobject.initialize()

//============== component ==================
componentArray = new Array();//存放所有的部件
function createComponentObject(_typeName, _id){
	component = new Object;
	component.typeName=_typeName;
	component.id=_id;	
	return component;
}





















