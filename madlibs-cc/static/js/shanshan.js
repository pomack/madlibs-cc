//global Object: toolbar UI, used for UI animation and load the right form
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
//saveArray: save all the drag and drop input value when dropped. leave the input fields empty until the form is submitted. before submit, in validation method, get the input fields and validte them, then insert into the array.
playerMode.saveArray = [];
//point to the tag object generated from author mode, rightnow, use a static object
playerMode.getAuthorTags = [
		{Tag:{id:"tag-1",originalValue:"your 'joy' factor",POSSuggestion:"NN",description:"desc 1"}},
		{Tag:{id:"tag-2",originalValue:"your price",POSSuggestion:"NN",description:"desc 2"}},
		{Tag:{id:"tag-3",originalValue:"the math",POSSuggestion:"Verb",description:"desc 3"}}
]; 

//Text Field object : input mode and dropable mode
//playerMode.textFieldHelper = {};
//playerMode.textFieldHelper.typeMode = function(){ //onblur event
//	playerMode.saveInputArray = playerMode.saveInputArray.push($(this).val());
//};
//playerMode.textFieldHelper.dropMode = function(){ //drop event
//	playerMode.saveDropArray = playerMode.saveDropArray.push($(this).val());
//};

//Todo: add event: click to enable input, mouseup to validate and disable input


//form object
playerMode.form = {
	elementSpan: document.getElementsByClassName("highlight")
}

playerMode.form.enableEdit = function(){
	for(var i=0; i<playerMode.form.elementSpan.length; i++){
		playerMode.form.elementSpan[i].innerHTML = "<input type='text' class='ui-widget-header' value=''/><p></p>";
		playerMode.saveArray[i] = "";
	}
}

playerMode.form.autofill = function(){
		//get the partofspeech array
		var partofspeech = [];
		for(var i =0; i < playerMode.getAuthorTags.length; i++){
			partofspeech[i] = playerMode.getAuthorTags[i].POSSuggestion
		}
		//random function, get random id from a certain length
		
		//generate random word for each input filed, based on the part of speech
		//insert the generated input array values to the form		
}
	
playerMode.form.validate = function(data){ //data: playerMode.saveArray 
	var len = data.length;
	for(var i = 0 ; i < len; i++ ){
		if(!data[i]){
			$(".error","#playerForm").html("Please fill all the fields").show();
		}else{
			//validate the matching of data type, todo
		}
	}
}
	
playerMode.form.updateArray = function(index,value){	
		playerMode.saveArray[index] = value;
}

//Drag/Drop Object
playerMode.dragDropHelper = {
		draggedValue: "",
		dropBoolean: false	
}

playerMode.dragDropHelper.dragMode = function(){
	$("a","#auto-suggest").draggable({ 
		snap: '.ui-widget-header',
		start: function(event,ui){
			var newDrag = $(this).clone();
			newDrag.appendTo($(this).parent());
			newDrag.draggable('enable');
			$(this).css({
				"display": "inline",
				"padding": "0"
			});
		},
		drag: function(event,ui){
			playerMode.dragDropHelper.draggedValue = $(this).html();
			
		},
		stop: function(event,ui){
			var AllInput = $("span.ui-widget-header").find("input");
			$(this).remove();
			//detect where the draggable item is, find the nearest input field
			playerMode.dragDropHelper.dropMode();
			if (playerMode.dragDropHelper.dropBoolean) {
				console.log("inside Droppable");
			}else{
				console.log("outside droppable");
				alert("please drop inside the input field");
			}
		}
		}).disableSelection();
	
}

playerMode.dragDropHelper.dropMode = function(){ //$("span.ui-widget-header")
	$("input.ui-widget-header").droppable({
		accept: ".draggable",
		hoverClass: "drop-hover",
		activeClass: "drop-active",
		greedy: true,
		drop: function( event, ui ) {
			console.log($(this));
			playerMode.dragDropHelper.dropBoolean = true;
			var index = $("span.highlight").index($(this).parent());
			$(this).val(playerMode.dragDropHelper.draggedValue);
			//update the dropArray and inputArray in dragdrop mode
			playerMode.form.updateArray(index,playerMode.dragDropHelper.draggedValue);
			console.log(playerMode.saveArray);
			//enable the new append div to be draggable
			playerMode.dragDropHelper.dragMode();
		},
		out: function(event,ui){
			playerMode.dragDropHelper.dropBoolean = false;
		}
	});
}

//auto search object: populate results, enable dragging
playerMode.autoSuggestHelper = {}
	
playerMode.autoSuggestHelper.autoSuggest = function(){
	
}

playerMode.autoSuggestHelper.updateInput = function(){
	//return the ajax url
}

playerMode.autoSuggestHelper.generate = function(){ 
	$( "#suggestion" ).attr("disabled",true).css("background","#ddd");
	//generate the partofspeech dropdown
	for(var i =0; i < playerMode.getAuthorTags.length; i++){
		$("#partofspeech").append("<option value='"+playerMode.getAuthorTags[i].Tag.POSSuggestion+"'>"+playerMode.getAuthorTags[i].Tag.POSSuggestion+"</option>"); 
	}
	$("#partofspeech").change(function(){
		 $( "#suggestion" ).removeAttr("disabled").css("background","#fff");
	});
	
	$( "#suggestion" ).autocomplete({
			source:function( request, response ) {
				$.ajax({
					url: "http://madlibs-cc.appspot.com/find/?category="+$("option:selected","#partofspeech").val()+"&text="+request.term,
					type: "GET",
					dataType: "json",
					success: function( data ) {
						console.log(data);
						response( $.map( data.words, function( item ) {
							return {
								label: item.text,
								value: item.text
							}
						}));
					},
					error:function(jqXHR, textStatus, errorThrown){
						alert(textStatus);
					}
				});
			},
			minLength: 2,
			autoFocus: true,
			appendTo: "#auto-suggest",
			search: function( event, ui ) {
				console.log(this.value); //input value
			},
			open: function( event, ui ){
				$("li>a","#auto-suggest").addClass("draggable");
				playerMode.dragDropHelper.dragMode();
			}
		});
		
}

function consoleLog(){
	console.log(playerMode.saveArray);
	//console.log(playerMode.getAuthorTags);
}


$(document).ready(function() {
    var element = $('#mainContainer'),
    	  dragEl = $("span","#auto-suggest"),
	 	  dropEl = $("input.ui-widget-header"),
	 	  autoFill = $("#autofill"),
	 	  form = $("#playerForm"),
	 	  submitBtn = $("#submit");
	 	  
	playerMode.autoSuggestHelper.updateInput();
  	//Consider so far we have all the spans tagged, and tag informaiton populated.(Lenin)
  	//lenin provide a disableAuthorMode function,rightnow, disable his js file.
  	
  	//generate the playermode forms, and attach toolbar UI to onblur event
	playerMode.form.enableEdit();
	playerMode.dragDropHelper.dropMode(); //init the droppable input
	//onblur open the toolbar, as user type, generate the auto-suggestion result
	$("input.ui-widget-header").blur(function(){
			//enable typemode
			//playerMode.textFieldHelper.typeMode();
			//open the toolbar UI, enable the auto-suggestion form
		});
	$("input.ui-widget-header").keyup(function(){
		var index = $("span","#playerForm").index($(this).parent());
		playerMode.form.updateArray(index,$(this).val());
		console.log(playerMode.saveArray);
		//todo: add the auto suggestion based on the typed in content + the current tag desc, tag category
	});
	
	//Toolbar auto-suggest
	
	playerMode.autoSuggestHelper.generate();
	
	//click on the auto-suggested result, enable drag and drop
	dragEl.mousedown( playerMode.dragDropHelper.dragMode );
	//drag and drop to the desired field
	//auto-fill the whole form for user, random pick the words matching the partofspeech
	autoFill.click( playerMode.form.autofill );
	//validate the fields(make sure is valid word) and submit form,close the toolbar.
	form.submit(function(){
		playerMode.form.validate();
		$("#user-data").html(playerMode.saveArray);
		$.ajax(function(){
						
			});
		});
		consoleLog();
});
