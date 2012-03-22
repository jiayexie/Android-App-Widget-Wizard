// JavaScript Document
function WidgetProject(widgetName, author, height, width, sizeStr){
	
	
}

function getStarted(){
	//get initial parameters
	WidgetProject.widgetName=document.name_form.widget_name.value;	
	WidgetProject.author=document.author_form.author.value;
	var sStr = document.size_form.size.value;
	WidgetProject.sizeStr=sStr+".png";
	WidgetProject.height=(sStr.substring(5,6)).valueOf();
	WidgetProject.width=sStr.substring(7,8).valueOf();
	
}

