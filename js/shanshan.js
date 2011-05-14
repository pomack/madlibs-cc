// Self loading-function
$(document).ready(function(){
    var element = $('#mainContainer');
	
  	//Consider so far we have all the spans tagged, and tag informaiton populated.
	playerMode.enableEditHelper();
	playerMode.dragDropHelper.dragMode();
	
});

var playerMode = {};
//Todo: save the input data into an array
playerMode.saveArray = [];



//Todo: add event: click to enable input, mouseup to validate and disable input
//1. Access Player Mode: enable all input fields
playerMode.enableEditHelper = function(){
	var elementSpan = document.getElementsByClassName("tagthis");
	for(var i=0; i<elementSpan.length; i++){
		elementSpan[i].innerHTML = "<input type='text' value=''/><p></p>";
	}
}

//Drag/Drop Object
playerMode.dragDropHelper = {};
playerMode.dragDropHelper.draggedValue = "";
playerMode.dragDropHelper.dragMode = function(){
	$("span","#auto-suggest").draggable({ 
		snap: '.ui-widget-header',
		drag: function(event,ui){
			playerMode.dragDropHelper.draggedValue = $(this).html();
			playerMode.saveArray.push(playerMode.dragDropHelper.draggedValue);
			//console.log(playerMode.saveArray[0]);
			playerMode.dragDropHelper.dropMode();
		},
		drop: function(event,ui){
			//$("span.ui-widget-header").find("input").val(playerMode.dragDropHelper.draggedValue);
		}
		}).disableSelection();
	
};
playerMode.dragDropHelper.dropMode = function(){
	$("span.ui-widget-header").droppable({
		accept: ".draggable",
		drop: function( event, ui ) {
			$(this).find("input").val(playerMode.dragDropHelper.draggedValue);
			console.log("dropped");
		},
		out: function(event,ui){
			$(this).find("input").val("");
			console.log("drag out");
		}
	});
};
	

//Text Field object : input mode and dropable mode
playerMode.textFieldHelper = {};
playerMode.textFieldHelper.typeMode = function(){
			
};
playerMode.textFieldHelper.dropMode = function(){
			
};
//auto search object: populate results, enable dragging


//Todo: drop the result to the input hot area
	
	
	
