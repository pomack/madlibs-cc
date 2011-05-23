// Lenin's JS file

var authorMode = authorMode || {};
var currentTag = {};

function Status(t) {
	$('#toolbarStatusMsg').text(t).show(500, function() {
		setTimeout(function() {$('#toolbarStatusMsg').hide(500);}, 1000);
	});
}

authorMode.Tag = function Tag (id, originalValue) { 
	this.id = id;
	this.originalValue = originalValue;
	this.description = '';
	this.POSSuggestion = '';
	this.hasBeenSet = false;
}

authorMode.Tag.prototype.set = function () { this.hasBeenSet = true; }

authorMode.Tag.prototype.setOriginalValue = function(ov) {
	this.originalValue = ov;
}

authorMode.Tag.prototype.setDescription = function(desc) { 
	this.description = desc;
}

authorMode.Tag.prototype.setPOSSuggestion = function(sugg) {
	this.POSSuggestion = sugg;
}

authorMode.Tags = {}; //new Array();

function logVar(varname) {
	console.log(varname + ": " + window[varname]);
}

authorMode.toggleHighlight = function(obj) {
	if ($(obj).hasClass('highlight')) 
		$(obj).removeClass('highlight');
	else
		$(obj).addClass('highlight');
}

authorMode.ce = function(t) { // creates element
	return document.createElement(t);
}

authorMode.getUniqueID = function(prefix) {
	var i = 1;
	while (document.getElementById(prefix + i)) i++;
	
	return prefix + i;
}

authorMode.processSelection = function ()  {
	
	var sr = window.getSelection();
	
	if (sr.toString().trim() != '')  {
		
		var r = sr.getRangeAt(0);	 
		
		var startNode, endNode, startPos, endPos;
		 
		 
		 // should we be cloning the node?  loses the parent stuff
		 
		 // just focus on adding the span first...can verify that it's a whole word later
		 
		 // check if the same node
		 if (sr.anchorNode == sr.focusNode) {
		 	
		 	startNode = sr.anchorNode; //.cloneNode();
		 	endNode = startNode; //.cloneNode();
		 	
		 	if (sr.anchorOffset < sr.focusOffset) {
	 			startPos = sr.anchorOffset;
	 			endPos = sr.focusOffset;
	 		}
		 	else {
		 		startPos = sr.focusOffset;
		 		endPos = sr.anchorOffset;	
	 		} 
	 		
	 		// expand the selection to include full words/phrases 
	 			// work backwards, then forwards
	 		console.log("Char at startpos: " + startNode.nodeValue.charAt(startPos) + " endpos: " + endNode.nodeValue.charAt(endPos));
	 		var rx = /[ ./?',<>;"$()\[\]\\]/g;
	 		 
	 		while (rx.test(startNode.nodeValue.charAt(startPos)) && startPos < startNode.nodeValue.length) startPos++;
	 		
	 		while (!(rx.test(startNode.nodeValue.charAt(startPos-1))) && startPos > 0) startPos--;

	 		while (rx.test(endNode.nodeValue.charAt(endPos)) && endPos > 0) endPos--;
	 		
	 		while (!(rx.test(endNode.nodeValue.charAt(endPos-1))) && endPos < endNode.nodeValue.length) endPos++;
	 		
	 		console.log("startpos: " + startPos + " endpos: " + endPos);
	 		
	 		r.setStart(startNode, startPos);
	 		r.setEnd(endNode, endPos-1);
			var x = this.ce('span');
			this.toggleHighlight(x);
			var tagId = this.getUniqueID('tag-');
			$(x).attr('id', tagId);
			r.surroundContents(x);
			//console.log("added unique ID " + $(x).attr('id'));

			$(x).bind('click', function () {
				authorMode.editTag(tagId);
			});
			
			$(x).trigger('click');
			
		}
		//else enableSelect();
		
			
	}
	//normalize();
}	

authorMode.removeTag = function(id) {

	if (authorMode.Tags[id]) {
		$('#' + id).contents().unwrap().unbind('click');
		
		delete authorMode.Tags[id];
		if (!authorMode.Tags[id]) Status("Tag removed!"); else Status("Tag removal failed...");
	}
	
}

authorMode.editTag = function(id) {
	
	// disable other selections
	disableSelect();
	$('#mainContainer').addClass('disabled');
	
	// if this is a new tag, add it to the Tags object
	if (!authorMode.Tags[id]) {
		authorMode.Tags[id] = new authorMode.Tag(id, $('#' + id).text());
		$('#authorModeToolboxRemoveButton').hide();
	}
	else $('#authorModeToolboxRemoveButton').show();

	currentTag = authorMode.Tags[id];
	
	// populate the spans in the toolbox
	$('#authorModeOriginalValueValue').text(currentTag.originalValue);
	$('#tagDesc').val(currentTag.description);
	$('#tagPOS').val(currentTag.POSSuggestion);
	
	// show the toolbox
	$('#authorModeToolbox').show();
	

}

authorMode.saveTags = function() {
		
		currentTag.setDescription($('#tagDesc').val());
		currentTag.setPOSSuggestion($('#tagPOS').val());

		currentTag.set();
		authorMode.Tags[currentTag.id] = currentTag;
		
		if (authorMode.Tags[currentTag.id] === currentTag) Status('saved!'); else Status('Save failed!');
		//clear values
		$('#authorModeToolbox').hide();
		$('#tagDesc,#tagPOS').val('');
		enableSelect();	
}

authorMode.DoTag = function(tagSpan) {
	// create a new tag
	
	
	
	
}
	
	
$(function () {
	// it is likely that none of this will work with IE prior to version 9
	
	$('#authorModeToolbox').hide();
	enableSelect();

	
		$('#authorModeToolboxSaveButton').bind('click', function() {
			authorMode.saveTags();
	});
	
	$('#authorModeToolboxCancelButton').bind('click', function() {
		if (!currentTag.hasBeenSet) authorMode.removeTag(currentTag.id);
		$('#authorModeToolbox').hide();
		enableSelect();
		
	});
	
	$('#authorModeToolboxRemoveButton').bind('click', function() {
		authorMode.removeTag(currentTag.id);
		$('#authorModeToolbox').hide();
		enableSelect();
	});
	
	document.write ('<table>');
	for(var word in POSTAGGER_LEXICON) {
		var tmp = ''; 
		for (var i = 0; i < POSTAGGER_LEXICON[word].length ; i++)
			document.write('<tr><td>' + word + '|' + POSTAGGER_LEXICON[word][i] + '</td></tr>' );
	}
	document.write ('</table>')
}
);

function enableSelect() {
	//$('#mainContainer').animate('color: #000;', 500);
		$('#mainContainer').removeClass('disabled');
	$('#mainContainer').unbind('mousedown');
	
	$('#mainContainer').bind('mouseup', 
		function () { authorMode.processSelection(); } );
	
}

function disableSelect() {
	//$('#mainContainer:not(span)').animate({ opacity:0.1 }, 500, function () { $('span').css({ opacity: 1 })});
	$('#mainContainer').addClass('disabled');
	$('#mainContainer').unbind('mouseup');
	$('#mainContainer').bind('mousedown', function () {return false;})
}
