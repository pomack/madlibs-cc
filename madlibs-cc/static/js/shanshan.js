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
playerMode.switch = false;
playerMode.saveArray = [];
//point to the tag object generated from author mode, rightnow, use a static object
playerMode.getAuthorTags = [
		{Tag:{id:"tag-1",originalValue:"your 'joy' factor",POSSuggestion:"NN",description:"desc 1"}},
		{Tag:{id:"tag-2",originalValue:"your price",POSSuggestion:"VB",description:"desc 2"}},
		{Tag:{id:"tag-3",originalValue:"the math",POSSuggestion:"Phrase",description:"desc 3"}}
]; 


//form object
playerMode.form = {
	elementSpan: document.getElementsByClassName("highlight")
}

playerMode.form.enableEdit = function(){
	for(var i=0; i<playerMode.form.elementSpan.length; i++){
		playerMode.form.elementSpan[i].innerHTML = "<input type='text' class='ui-widget-header' value=''/>";
		playerMode.saveArray[i] = "";
	}
}

playerMode.form.autofill = function(){
		
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

playerMode.dragDropHelper.dropMode = function(){ 
	var dropObject;
	if(!$("#currentIndex").html()){
		dropObject = $("input.ui-widget-header");
	}else{
		dropObject = $("span.highlight:eq("+$("#currentIndex").html()+")");
	}
	console.log($("#currentIndex").html());
	dropObject.droppable({
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

playerMode.autoSuggestHelper.init = function(){
	$( "#suggestion" ).val("Please Select a Category").attr("disabled",true).css("background","#ccc");
	playerMode.autoSuggestHelper.generateCat();
	playerMode.autoSuggestHelper.generateList();
	
	$("input.ui-widget-header").bind("focus",function(){
		var currentIndex = $("span.highlight").index($(this).parent());
		//if(currentIndex == -1){ currentIndex = 0;}
			$("#currentIndex").html(currentIndex);
			$(this).val("").css("background","#fff");
			$(".ui-autocomplete").children().remove();
			playerMode.autoSuggestHelper.updateCategory(currentIndex+1);
			
	});
	$("input.ui-widget-header").bind("keyup",function(){
		var currentIndex = $("span.highlight").index($(this).parent());
		playerMode.form.updateArray(currentIndex,$(this).val());
		console.log(playerMode.saveArray);
		//todo: add the auto suggestion based on the typed in content + the current tag desc, tag category
	});
	
}

playerMode.autoSuggestHelper.generateCat = function(){
	$("#partofspeech").append("<option value=''/>");
	for(var i =0; i < playerMode.getAuthorTags.length; i++){
		$("#partofspeech").append("<option value='"+playerMode.getAuthorTags[i].Tag.POSSuggestion+"'>"+playerMode.getAuthorTags[i].Tag.POSSuggestion+"</option>"); 
	}
	
	//TODO: RETURN PARTOFSPEECH ARRAY
}

playerMode.autoSuggestHelper.updateCategory = function(index){
	$("option","select#partofspeech").removeAttr('selected').eq(index).attr("selected",true);
		
	if($("option:selected","#partofspeech").val() === "Phrase"){
		$("#suggestion").val("Please type in by yourself for Phrase").attr('disabled','true').css("background","#ccc");
		
	}else if( $("option:selected","#partofspeech").val() === "" ){
		$("#suggestion").val("Please Selcted a Category").attr('disabled','true').css("background","#ccc");
		
	}else{
		$( "#suggestion" ).val("").removeAttr("disabled").css("background","#fff");	
			
	}
}

playerMode.autoSuggestHelper.generateList = function(){ 
	
	$("#partofspeech").bind("change",function(){
		//var currentIndex = $(this);
		$("#currentIndex").html("");
		var index = $("option").index($(this).children(":selected"));
		console.log(index);
		playerMode.autoSuggestHelper.updateCategory(index);
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
}

playerMode.init = function(){
	var element = $('#mainContainer'),
    	  dragEl = $("span","#auto-suggest"),
	 	  dropEl = $("input.ui-widget-header"),
	 	  autoFill = $("#autofill"),
	 	  submitBtn = $("#submit");
	 	  
	//Consider so far we have all the spans tagged, and tag informaiton populated.(Lenin)
  	//lenin provide a disableAuthorMode function,rightnow, disable his js file.
  	
  	//generate the playermode forms, and attach toolbar UI to onblur event
	playerMode.form.enableEdit();
	playerMode.dragDropHelper.dropMode(); //init the droppable input
	//onblur open the toolbar, as user type, generate the auto-suggestion result
	
	
	//Toolbar auto-suggest
	
	playerMode.autoSuggestHelper.init();
	
	//click on the auto-suggested result, enable drag and drop
	dragEl.mousedown( playerMode.dragDropHelper.dragMode );
	//drag and drop to the desired field
	//auto-fill the whole form for user, random pick the words matching the partofspeech
	autoFill.click(function(){
		$.map(playerMode.getAuthorTags,function(n,i){
			var randomNum = Math.ceil(Math.random()*9);
			$.getJSON("http://madlibs-cc.appspot.com/find/?category="+n.Tag.POSSuggestion, function(data) { console.log(randomNum);
				console.log(i);
				if(data.words.length > 1){
					$("span.highlight:eq("+i+")").find("input").val(data.words[1].text);
				}else{
					$("span.highlight:eq("+i+")").find("input").val("Please type in here").css("background","red");	
				}
			});	
		});	
	});
	//validate the fields(make sure is valid word) and submit form,close the toolbar.
	$("#player_submit").click(function(){
		playerMode.form.validate();
		$("#user-data").html(playerMode.saveArray);
		$.ajax(function(){
						
			});
		});
		consoleLog();	
}


$(document).ready(function() {
   playerMode.init();
});
