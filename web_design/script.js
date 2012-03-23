// JavaScript Document
function createWidgetProject(_widgetName, _author, _height, _width){
	var tmpProject=new Object;
	tmpProject.widgetName=_widgetName;
	tmpProject.author=_author;
	tmpProject.height=_height.valueOf() * 70 - 30;
	tmpProject.width=_width.valueOf() * 70 - 30;
	alert(height + this.width);
	tmpProject.heightStr=this.height.toString()+"px";
	tmpProject.widthStr=this.width.toString()+"px";
	alert(this.heightStr + this.widthStr);
	return tmpProject;
}
var w;

function getStarted(){
	//get initial parameters & create a widget
	w = createWidgetProject(document.name_form.widget_name.value, 
								document.author_form.author.value,
								document.size_form.size_row.value,
								document.size_form.size_column.value);
	
}
function updateRow(){
	w.heightStr=(document.size_form.size_row.value.valueOf()*70-30).toString()+"px";
}
function updateColumn(){
	w.widthStr=(document.size_form.size_column.value.valueOf()*70-30).toString()+"px";
}

//=============================

var dragobject={
	z: 0, x: 0, y: 0, offsetx : null, offsety : null, targetobj : null, dragapproved : 0,
	initialize:function(){
		document.onmousedown=this.drag
		document.onmouseup=function(){this.dragapproved=0}
	},
	drag:function(e){
		var evtobj=window.event? window.event : e
		this.targetobj=window.event? event.srcElement : e.target
		if (this.targetobj.className=="drag"){
			this.dragapproved=1
			if (isNaN(parseInt(this.targetobj.style.left))){
				this.targetobj.style.left=0
			}
			if (isNaN(parseInt(this.targetobj.style.top))){
				this.targetobj.style.top=0
			}
			this.offsetx=parseInt(this.targetobj.style.left)
			this.offsety=parseInt(this.targetobj.style.top)
			this.x=evtobj.clientX
			this.y=evtobj.clientY
			if (evtobj.preventDefault)
				evtobj.preventDefault()
			document.onmousemove=dragobject.moveit
		}
	},
	moveit:function(e){
		var evtobj=window.event? window.event : e
		if (this.dragapproved==1){
			this.targetobj.style.left=this.offsetx+evtobj.clientX-this.x+"px"
			this.targetobj.style.top=this.offsety+evtobj.clientY-this.y+"px"
			return false
		}
	}
}
dragobject.initialize()