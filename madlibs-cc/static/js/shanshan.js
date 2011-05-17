// Self loading-function
$(document).ready(function(){
    var element = $('#mainContainer');
	
  	//Consider so far we have all the spans tagged, and tag informaiton populated.
	playerMode.enableEditHelper();
	playerMode.dragDropHelper.dragMode();
	playerMode.dragDropHelper.dropMode();
			
	toolbarUI.openToolbar();
});

//global: toolbar UI, CAN BE REUSED FOR LENIN
var toolbarUI = toolbarUI || {};
toolbarUI.sideToolbar = $("#toolbar"); 

toolbarUI.openToolbar = function(){
	var el = toolbarUI.sideToolbar; //declaing dependency
		el.onkeydown = function(evt) {
	    evt = evt || window.event;
	    alert("keydown: " + evt.keyCode);
		el.show();
	};
}

toolbarUI.closeToolbar = function(){
	var el = toolbarUI.sideToolbar; //declaing dependency
		el.onkeydown = function(evt) {
	    evt = evt || window.event;
	    alert("keydown: " + evt.keyCode);
		el.hide();
	};
}

//global: player mode object
var playerMode = playerMode || {};
//Todo: save the input data into an array
playerMode.saveArray = [];

//Todo: add event: click to enable input, mouseup to validate and disable input
playerMode.enableEditHelper = function(){
	var elementSpan = document.getElementsByClassName("tagthis");
	for(var i=0; i<elementSpan.length; i++){
		elementSpan[i].innerHTML = "<input type='text' value=''/><p></p>";
	}
}

//Drag/Drop Object
playerMode.dragDropHelper = {};
playerMode.dragDropHelper.draggedValue = "";
playerMode.dragDropHelper.dropBoolean = false;
playerMode.dragDropHelper.dragMode = function(){
	$("span","#auto-suggest").draggable({ 
		snap: '.ui-widget-header',
		start: function(event,ui){
			var newDrag = $(this).clone();
			newDrag.appendTo($(this).parent());
			newDrag.draggable('enable');
			
		},
		drag: function(event,ui){
			playerMode.dragDropHelper.draggedValue = $(this).html();
			playerMode.saveArray.push(playerMode.dragDropHelper.draggedValue);
		},
		stop: function(event,ui){
			var AllInput = $("span.ui-widget-header").find("input");
			//detect where the draggable item is, find the nearest input field
			
			var targetInput = playerMode.dragDropHelper.dropMode();
			console.log(targetInput);
			if (playerMode.dragDropHelper.dropBoolean) {
				console.log("inside Droppable");
				//targetInput.val(playerMode.dragDropHelper.draggedValue);
			}else{
				console.log("outside droppable");
			}
			$(this).remove();
		}
		}).disableSelection();
	
};

playerMode.dragDropHelper.dropMode = function(){
	$("span.ui-widget-header").droppable({
		accept: ".draggable",
		activate: function(event,ui){
			$(this).addClass("lightup");
		},
		drop: function( event, ui ) {
			playerMode.dragDropHelper.dropBoolean = true;
			var targetInput = $(this).find("input");
			targetInput.val(playerMode.dragDropHelper.draggedValue);
			//return $(this);
		},
		out: function(event,ui){
			playerMode.dragDropHelper.dropBoolean = false;
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



	
	
	
