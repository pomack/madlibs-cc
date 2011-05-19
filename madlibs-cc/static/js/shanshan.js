// Self loading-function
$(document).ready(function(){
    var element = $('#mainContainer');
	
  	//Consider so far we have all the spans tagged, and tag informaiton populated.
	playerMode.enableEditHelper();
	playerMode.dragDropHelper.dragMode();
	playerMode.dragDropHelper.dropMode();
	playerMode.autoSuggestHelper.generate();
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
			playerMode.dragDropHelper.dragMode();
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
playerMode.autoSuggestHelper = {};
playerMode.autoSuggestHelper.generate = function(){
	$( "#suggestion" ).autocomplete({
			source: function( request, response ) {
				$.ajax({
					url: "http://ws.geonames.org/searchJSON/",
					type: "GET",
					dataType: "jsonp",
					data: {
						featureClass: "P",
						style: "full",
						maxRows: 12,
						name_startsWith: request.term
					},
					success: function( data ) {
						response( $.map( data.geonames, function( item ) {
							return {
								label: item.name + (item.adminName1 ? ", " + item.adminName1 : "") + ", " + item.countryName,
								value: item.name
							}
						}));
					}
				});
			},
			minLength: 2,
			appendTo: "#auto-suggest",
			search: function( event, ui ) {
				console.log( ui.item ?
					"Selected: " + ui.item.label :
					"Nothing selected, input was " + this.value);
			},
			select: function( event,ui ) {
				var count = 0;
				console.log(count);
				if (!count) {//todo:duplicate detect
					$("#auto-suggest").prepend('<li class="ui-widget-content"><span class="draggable">' + ui.item.label + '</span></li>');
				}
				count = count + 1;
				playerMode.dragDropHelper.dragMode();
			}

		});
}
