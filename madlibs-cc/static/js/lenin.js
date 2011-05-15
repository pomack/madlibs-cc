// Lenin's JS file

function toggleHighlight(obj) {
	if ($(obj).hasClass('highlight')) 
		$(obj).removeClass('highlight');
	else
		$(obj).addClass('highlight');;
}

function ce(t) { // creates element
	return document.createElement(t);
}

function getUniqueID(prefix) {
	var i = 1;
	while (document.getElementById(prefix + i)) i++;
	
	return prefix + i;
}
$(function () {
	// it is likely that none of this will work with IE prior to version 9
	
	$('#mainContainer').bind('mouseup', function () { 
		var sr = window.getSelection();
		var r = sr.getRangeAt(0);
		if (sr.toString() != '')  {
			 
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
		 		
		 		//endPos--;
		 		// expand the selection
		 			// work backwards
		 		console.log("Chart at startpos: " + startNode.nodeValue.charAt(startPos) + " endpos: " + endNode.nodeValue.charAt(endPos));
		 		var rx = /[ ./?',<>;"$()\[\]\\]/g;
		 		 
		 		while (rx.test(startNode.nodeValue.charAt(startPos)) && startPos < startNode.nodeValue.length) startPos++;
		 		
		 		while (!(rx.test(startNode.nodeValue.charAt(startPos-1))) && startPos > 0) startPos--;

		 		while (rx.test(endNode.nodeValue.charAt(endPos)) && endPos > 0) endPos--;
		 		
		 		while (!(rx.test(endNode.nodeValue.charAt(endPos-1))) && endPos < endNode.nodeValue.length) endPos++;
		 		
		 		console.log("startpos: " + startPos + " endpos: " + endPos);
		 		
		 		r.setStart(startNode, startPos);
		 		r.setEnd(endNode, endPos-1);
				var x = ce('span');
				toggleHighlight(x);
				$(x).attr('id', getUniqueID('tag-'));
				r.surroundContents(x);
				//console.log("added unique ID " + $(x).attr('id'));
				DoTag(x);
				
			}
			
			
				
		}
		//normalize();
	}	
	
	);
}
);

function DoTag(tag) {
	
}
	
