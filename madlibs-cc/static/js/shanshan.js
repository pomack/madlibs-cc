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
				//$("#partofspeech").append("<option value='"+playerMode.authorData.tags[key].POSSuggestion+"'>"+posList[playerMode.authorData.tags[key].POSSuggestion]+"</option>"); 
			
				newstory += "<li class='"+key+"'><p><span>Part of Speech:</span> "+posList[playerMode.authorData.tags[key].POSSuggestion]+"</p><p><span>Your word:</span> <input type='text' id='tag-blank-" +key + "' class='ui-widget-header ui-autocomplete-input'/></p><p><span>Description:</span> "+playerMode.authorData.tags[key].description+"</p></li>";
				}
		}
	}
	newstory = newstory + "</ul> <button id='submit' type='submit' class='standard_button'>Submit</button>";
	playerMode.storyContainer.innerHTML = newstory;			
	$("#leftColumn").append(playerMode.storyContainer);
	
	//todo: bind functions to the input field object
}

playerMode.form.submitForm = function(){
	//if(!playerMode.form.validate(playerMode.saveArray)){
		// $(".error").html("Please fill all the fields").show();	
	//}else{ //proceed
	//update the article
		//alert("validate successfully");
		$("div.body").clone().removeClass("body").addClass("userstory").appendTo($("article"));
		for(var i=0; i<playerMode.saveArray.length;i++){
			$("span#tag-"+(i+1),"div.userstory").html(playerMode.saveArray[i]);
		}
	//get new story
		var playerStory = getDataFromHtml();
	//save to database	
		sendDataToAppEngine(playerStory);
	//if saved successfully, show the story
		$("div.userstory").show(1000);
		$("#playerform").remove();
		$("#toolbar").hide();
		$("button.standard_button").hide();
	//}
}
var spinQueue = 0;
playerMode.assignRandomWord = function (pos, key) {
	
	var randomWord = '';
	spinQueue++;
	$('#autofillspin').show();
	$.getJSON("/find/?category="+pos, function(data) {
		if (data.words && data.words.length > 0 ) {
			var idx = Math.ceil(Math.random()*data.words.length)-1;
			randomWord = (data.words[idx].text);
			$('#tag-blank-'+key).val(randomWord);
			if(pos === "Phrase"){
				console.log(Number(key.replace("tag-","")));
				playerMode.saveArray[Number(key.replace("tag-",""))] = "";
				$('#tag-blank-'+key).addClass("backgroundred");
			}else{
				playerMode.saveArray[Number(key.replace("tag-",""))] = randomWord;
			}
			console.log(playerMode.saveArray);
			if (--spinQueue == 0) $('#autofillspin').hide();
		} 
	});
}

playerMode.form.autofill = function(){
		//var randomNum = Math.ceil(Math.random()*data.words.length);
		
		for(key in playerMode.authorData.tags) {
			playerMode.assignRandomWord(playerMode.authorData.tags[key].POSSuggestion, key);
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


playerMode.autoSuggest = function(event){
	$(this).removeClass("backgroundred");
	var currenttagid = $(this).parent().parent().attr("class");
	console.log(currenttagid);
	if(playerMode.authorData.tags[currenttagid].POSSuggestion === "Phrase" && !$("#auto-suggest").html()){
		$("#auto-suggest").append("<p style='margin-left:20px'>Sorry, there is no suggestion for Phrase</p>");	
	}else{
	$( this ).autocomplete({
			source:function( request, response ) {
				$.ajax({
					url: "/find/?category="+playerMode.authorData.tags[currenttagid].POSSuggestion+"&text="+request.term,
					type: "GET",
					dataType: "json",
					success: function( data ) {
						console.log(data);
						response( $.map( data.words, function( item ) {
							if(item){
								return {
									label: item.text,
									value: item.text
								}
							}else{
								return {
									label: "No Result",
									value: "No Result"								
								}							
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
}

function consoleLog(){
	console.log(playerMode.saveArray);
}

playerMode.init = function(data){
   playerMode.authorData = data;
	$("div.body").hide();
	playerMode.form.createInterface();
   
	playerMode.dragDropHelper.dropMode(); 
	//playerMode.autoSuggestHelper.init();
	$("input","#playerform").keyup(playerMode.autoSuggest);
	$("input","#playerform").focus(function(){
		$(".ui-autocomplete").remove();		
		});
	$("span","#auto-suggest").mousedown( playerMode.dragDropHelper.dragMode );
	$("#autofill").click(playerMode.form.autofill);
	$("#submit").click(playerMode.form.submitForm);
}

playerMode.clear = function(){
	playerMode.authorData = {};	
	$("#partofspeech").html("");
	$("#playerform").remove();
	$("div.userstory").hide();
	
}
})();
