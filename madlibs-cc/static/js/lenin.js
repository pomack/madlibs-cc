// Lenin's JS file

var authorMode = authorMode || {};
var currentId = '';

authorMode.Tag = function Tag (id) { 
	this.id = id;
	this.originalValue = '';
	this.description = '';
	this.POSSuggestion = '';
}

authorMode.Tag.prototype.setOriginalValue = function(ov) {
	this.originalValue = ov;
}

authorMode.Tag.prototype.setDescription = function(desc) { 
	this.description = desc;
}

authorMode.Tag.prototype.setPOSSuggestion = function(sugg) {
	this.POSSuggestion = sugg;
}

authorMode.Tags = new Array();

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

authorMode.cancelCurrentSelection = function () {
		
}

authorMode.processSelection = function ()  {
	
	var sr = window.getSelection();
	var r = sr.getRangeAt(0);
	if (sr.toString().trim() != '')  {
		 
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
			$(x).attr('id', this.getUniqueID('tag-'));
			r.surroundContents(x);
			//console.log("added unique ID " + $(x).attr('id'));
			this.DoTag(x);
			
		}
		
		
			
	}
	//normalize();
}	


authorMode.DoTag = function(tagSpan) {
	// create a new tag
	var currentTag = new this.Tag($(tagSpan).attr('id'));
	currentTag.setOriginalValue($(tagSpan).text());
	
	
	$('#authorModeOriginalValueValue').text();
	$('#authorModeToolbox').fadeIn(200);
	$('#authorModeToolboxSaveButon').bind('click', function() {
		// validate
		// ...
		
		currentTag.setDescription($('#tagDesc').val());
		currentTag.setPOSSuggestion($('#tagPOS').val());
		authorMode.Tags.push(currentTag);
		
	});
}
	
	
$(function () {
	// it is likely that none of this will work with IE prior to version 9
	
	$('#authorModeToolbox').hide();
	$('#mainContainer').bind('mouseup', 
		function () { authorMode.processSelection(); } );
	$('#authorModeToolboxCancel').bind('click', function() {
		authorMode.cancelCurrentSelection();
	});
	
}
);

