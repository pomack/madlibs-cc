/*Global variables to share between author and player*/
var postId = "",
	 playerMode = playerMode || {
		switch: false,
		authorData: {}, //store global object in local variable, easy to access
		saveArray: [],
		init:{},
		form: {
				elementSpan: document.getElementsByClassName("highlight")
		},
		dragDropHelper: {
				draggedValue: "",
				dropBoolean: false	
			},
		autoSuggestHelper: {}
		};
		
/*shan's code*/
(function() {
	
playerMode.form.init = function(data){ //data: author tagged object
	for(var i=0; i<playerMode.form.elementSpan.length; i++){
		playerMode.form.elementSpan[i].innerHTML = "<input type='text' class='ui-widget-header' value=''/>";
		playerMode.saveArray[i] = "";
	}
	
	$("#partofspeech").append("<option value='part of speech'>part of speech</option>");
	console.log(data.tags);
	if(data.tags !== undefined){
		for(key in data.tags){
			//if(playerMode.authorData.tags.hasOwnProperty(key)){			
				$("#partofspeech").append("<option value='"+data.tags[key].POSSuggestion+"'>"+data.tags[key].POSSuggestion+"</option>"); 
				//}
		}
	}
}

playerMode.form.autofill = function(){
		//var randomNum = Math.ceil(Math.random()*data.words.length);
		for(key in playerMode.authorData.tags){
			//console.log("key:"+playerMode.authorData.tags[key]);
			$.getJSON("http://madlibs-cc.appspot.com/find/?category="+playerMode.authorData.tags[key].POSSuggestion, function(data) 				{ console.log(playerMode.authorData.tags[key].POSSuggestion);
					//console.log("map i"+i);
					if(data.words.length > 1){
						$("span#"+playerMode.authorData.tags[key].id).find("input").val(data.words[Math.ceil(Math.random()*data.words.length)].text);
					}else{
						$("span#"+playerMode.authorData.tags[key].id).find("input").val("Please type in here").css("background","red");	
					}
				});
		}
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
	//console.log($("#currentIndex").html());
	dropObject.droppable({
		accept: ".draggable",
		hoverClass: "drop-hover",
		activeClass: "drop-active",
		greedy: true,
		drop: function( event, ui ) {
			//console.log($(this));
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

playerMode.autoSuggestHelper.init = function(){
	$( "#suggestion" ).val("Please Select a Category").attr("disabled",true).css("background","#ccc");
	//playerMode.autoSuggestHelper.generateCat(returnedTagObject);
	playerMode.autoSuggestHelper.generateList();
	
	$("input.ui-widget-header").bind("focus",function(){
		var currentIndex = $("span.highlight").index($(this).parent());
		//if(currentIndex == -1){ currentIndex = 0;}
			//$("#currentIndex").html(currentIndex);
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

//authorObject stores the title, body, tags properties, tags are objects
playerMode.init = function(data){
  	//generate the playermode forms, and attach toolbar UI to onblur event
  	//onblur open the toolbar, as user type, generate the auto-suggestion result
	//init the droppable input
	//click on the auto-suggested result, enable drag and drop
	//auto-fill the whole form for user, random pick the words matching the partofspeech
	//validate the fields(make sure is valid word) and submit form,close the toolbar.
	
	//playerMode.form.init(playerMode.authorData);
	console.log(data);
	playerMode.authorData = data;
	$("div.body").hide();
	
	//todo: create new table with partofspeech and description
	
	var newContainer = document.createElement("div");
	newContainer.setAttribute("id","playerform");
	$("#leftColumn").append(newContainer);
	//$("span.highlight").unbind("click");
	for(var i=0; i<playerMode.form.elementSpan.length; i++){
		//$("#leftColumn").append("<span class='highlight'><input type='text' class='ui-widget-header' value=''/></span>");
		playerMode.saveArray[i] = "";
	}
	
	//create the select dropdown list
	$("#partofspeech").append("<option value='part of speech'>part of speech</option>");
	console.log(playerMode.authorData);
	if(playerMode.authorData.tags !== undefined){
		for(key in playerMode.authorData.tags){
			//if(playerMode.authorData.tags.hasOwnProperty(key)){			
				$("#partofspeech").append("<option value='"+playerMode.authorData.tags[key].POSSuggestion+"'>"+playerMode.authorData.tags[key].POSSuggestion+"</option>"); 
				$("#leftColumn").append("<span class='highlight'><label>"+playerMode.authorData.tags[key].POSSuggestion+"</label><input type='text' class='ui-widget-header' value=''/><p>"+playerMode.authorData.tags[key].description+"</p></span>");
				
				//}
		}
	}
	playerMode.dragDropHelper.dropMode(); 
	playerMode.autoSuggestHelper.init();
	$("span","#auto-suggest").mousedown( playerMode.dragDropHelper.dragMode );
	$("#autofill").click(playerMode.form.autofill);
	//todo: submit button 
}

playerMode.clear = function(){
	playerMode.authorData = {};	
	$("#partofspeech").html("");
	//console.log(playerMode.authorData);
}

})();