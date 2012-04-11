// JavaScript Document
function WidgetProject(_widgetName, _author, _height, _width){
	this.widgetName=document.name_form.widget_name.value;
	this.author=document.author_form.author.value;
	this.height=document.size_form.size_row.value.valueOf() * 98 - 42;
	this.width=document.size_form.size_column.value.valueOf() * 98 - 42;
	this.setHeight=function(){
		this.height=document.size_form.size_row.value.valueOf()*98-42;
	}
	this.setWidth=function(){
		this.width=document.size_form.size_column.value.valueOf()*98-42;
	}
}
function onLoad(){
	w = new WidgetProject();
}
function getStarted(){
	
}
function updateRow(){
	w.setHeight();
}
function updateColumn(){
	w.setWidth();
}

//=============================
globalComponentCounter = 0;

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

//=============================

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