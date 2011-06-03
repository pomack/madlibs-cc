/*Global variables to share between author and player*/
var postId = "",
	 playerMode = playerMode || {
		switch: false,
		storyContainer: null,
		authorData: {}, //pass from author and tag mode
		saveArray: [],
		init:{},
		form:{},
		dragDropHelper: {
				draggedValue: "",
				dropBoolean: false	
			},
		autoSuggestHelper: {}
		};
		
/*shan's code*/
(function() {
	
playerMode.form.createInterface = function(){ //data: author tagged object
	
	playerMode.storyContainer = document.createElement("div");
	playerMode.storyContainer.setAttribute("id","playerform");
	var newstory = "<ul>";
	var posList = {
			'Phrase' :'Phrase',
			'CC' :'Coord Conjuncn',
			'CD' :'Cardinal number',
			'DT' :'Determiner',
			'EX' :'Existential there',
			'FW' :'Foreign Word',
			'IN' :'Preposition',
			'JJ' :'Adjective',
			'JJR' :'Adj., comparative',
			'JJS' :'Adj., superlative',
			'LS' :'List item marker',
			'MD' :'Modal',
			'NN' :'Noun, sing. or mass',
			'NNP' :'Proper noun, sing.',
			'NNPS' :'Proper noun, plural',
			'NNS' :'Noun, plural',
			'POS' :'Possessive ending',
			'PDT' :'Predeterminer',
			'PP$' :'Possessive pronoun',
			'PRP' :'Personal pronoun',
			'RB' :'Adverb',
			'RBR' :'Adverb, comparative',
			'RBS' :'Adverb, superlative',
			'RP' :'Particle',
			'SYM' :'Symbol',
			'TO' :'ÒtoÓ',
			'UH' :'Interjection',
			'VB' :'verb, base form',
			'VBD' :'verb, past tense',
			'VBG' :'verb, gerund',
			'VBN' :'verb, past part',
			'VBP' :'Verb, present',
			'VBZ' :'Verb, present',
			'WDT' :'Wh-determiner',
			'WP' :'Wh pronoun',
			'WP$' :'Possessive-Wh',
			'WRB' :'Wh-adverb'
		};
	
	$("#partofspeech").append("<option value='part of speech'>part of speech</option>");
	if(playerMode.authorData.tags !== undefined){
		for(key in playerMode.authorData.tags){
				playerMode.saveArray.push("");
			if(playerMode.authorData.tags.hasOwnProperty(key)){			
				$("#partofspeech").append("<option value='"+playerMode.authorData.tags[key].POSSuggestion+"'>"+posList[playerMode.authorData.tags[key].POSSuggestion]+"</option>"); 
			
				newstory += "<li class='"+key+"'><input type='text' class='ui-widget-header'/><label>"+posList[playerMode.authorData.tags[key].POSSuggestion]+"</label><p>"+playerMode.authorData.tags[key].description+"</p></li>";
				}
		}
	}
	newstory = newstory + "</ul>";
	playerMode.storyContainer.innerHTML = newstory;
	console.log($("#playerform"));
				
	$("#leftColumn").append(playerMode.storyContainer);
}

playerMode.form.submitForm = function(){
	if(!playerMode.form.validate(playerMode.saveArray)){
	//alert message
		$(".error").html("Please fill all the fields").show();	
	}else{ //proceed
	//update the article
		alert("validate successfully");
		for(var i=0; i<playerMode.saveArray.length;i++){
			$("span#tag-"+(i+1),"div.body").html(playerMode.saveArray[i]);
		}
	//get new story
		var playerStory = getDataFromHtml();
	//save to database	
		sendDataToAppEngine(playerStory);
	//if saved successfully, show the story
		$("div.body").show();
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
			return false;
		}else{
			//validate the matching of data type, todo
			return true;
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
/*	var dropObject;
	if(!$("#currentIndex").html()){
		dropObject = $("input.ui-widget-header");
	}else{
		dropObject = $("span.highlight:eq("+$("#currentIndex").html()+")");
	}*/
	//console.log($("#currentIndex").html());
	$("input.ui-widget-header").droppable({
		accept: ".draggable",
		hoverClass: "drop-hover",
		activeClass: "drop-active",
		greedy: true,
		drop: function( event, ui ) {
			//console.log($(this));
			playerMode.dragDropHelper.dropBoolean = true;
			var index = $("input","#playerform").index($(this));
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
		var currentIndex = $("input").index($(this));
			$(this).val("").css("background","#fff");
			$(".ui-autocomplete").children().remove();
			playerMode.autoSuggestHelper.updateCategory(currentIndex+1);
			
	});
	$("input.ui-widget-header").bind("keyup",function(){
		var currentIndex = $("input","#playerform").index($(this));
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

playerMode.init = function(data){
   playerMode.authorData = data;
	$("div.body").hide();
	playerMode.form.createInterface();
   
	playerMode.dragDropHelper.dropMode(); 
	playerMode.autoSuggestHelper.init();
	$("span","#auto-suggest").mousedown( playerMode.dragDropHelper.dragMode );
	$("#autofill").click(playerMode.form.autofill);
	$("#submit").click(playerMode.form.submitForm);
}

playerMode.clear = function(){
	playerMode.authorData = {};	
	$("#partofspeech").html("");
}
})();