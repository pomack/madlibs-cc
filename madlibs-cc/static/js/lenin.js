// Lenin's JS file

var authorMode = authorMode || {};
var currentTag = {};
var authorModeSelectionEnabled = false;
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
	this.parentNode = {};
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

function getM() {
	return new Date().getMilliseconds();
}

authorMode.doNotProcessSelection = function () {}

authorMode.processSelection = function ()  {
	this.selectionHandler = this.doNotProcessSelection;
	
	try {
	
		var sr = $.extend({}, window.getSelection()),
			sr2 = window.getSelection(),
	        r = sr2.getRangeAt(0).cloneRange(),
	        curSelText = sr2.toString().trim(),
			self = this;
	
		if (curSelText != '')  {
			//console.log('sr toString is:' + sr.toString().trim());
			var startNode, endNode, startPos, endPos;
			 console.log ('doin it');
			 
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
	
		 		var rx = /[ ./?',<>;"$()\[\]\\]/g;
		 		 
		 		while (rx.test(startNode.nodeValue.charAt(startPos)) && startPos < startNode.nodeValue.length) startPos++;
		 		
		 		while (!(rx.test(startNode.nodeValue.charAt(startPos-1))) && startPos > 0) startPos--;
	
		 		while (rx.test(endNode.nodeValue.charAt(endPos)) && endPos > 0) endPos--;
		 		
		 		while (!(rx.test(endNode.nodeValue.charAt(endPos-1))) && endPos <= endNode.nodeValue.length) endPos++;
		 		
		 		
		 		r.setStart(startNode, startPos);
		 		r.setEnd(endNode, endPos-1);
				var x = self.ce('span');
				self.toggleHighlight(x);
				var tagId = self.getUniqueID('tag-');
				$(x).attr('id', tagId);
				r.surroundContents(x);
	
				$(x).bind('click', function () {
					authorMode.editTag(tagId);
				});
				
				$(x).trigger('click');
				
			}
			else {
				console.log ('selection spans multiple nodes...')
			}
	
		}
	}
	catch (e) {
		console.log('*** an error occurred: ' + e)
	}
	finally {
		this.selectionHandler = this.processSelection;
	}
};


authorMode.selectionHandler = authorMode.processSelection;

authorMode.removeTag = function(id) {

	if (authorMode.Tags[id]) {
		$('#' + id).contents().unwrap().unbind('click');
		document.normalize();
		delete authorMode.Tags[id];
		if (!authorMode.Tags[id]) Status("Tag successfully removed!"); else Status("Tag removal failed...");
	}
	
}

authorMode.editTag = function(id) {
	
	// disable other selections
	disableSelect();
	$('#mainContainer').addClass('disabled');
	
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
	// if this is a new tag, add it to the Tags object
	$('#authorModeToolboxRemoveButton').hide();
	if (!authorMode.Tags[id]) {
		
		authorMode.Tags[id] = new authorMode.Tag(id, $('#' + id).text().trim());
		// automatically determine the POS and properties
		
		$('#tagPOS option').remove().attr('disabled', true);
		$('#tagPOS').append('<option selected value="">Loading...</option>');
		var pos = $.ajax({
					url: "/find/?text="+authorMode.Tags[id].originalValue,
					type: "GET",
					dataType: "json",
					timeout: 3000,
					success: function( data ) {
						//console.log(data);
						$('#tagPOS option').remove();
						if (data.words) {
							if (data.words.length > 0) {
								// process the array
								for (var i = 0; i < data.words.length; i++) {
									// word object - has "text" and categories[]which has POS
									// find the right word
									if (data.words[i].text.toLowerCase() == authorMode.Tags[id].originalValue) {
										if (data.words[i].categories) {
											if (data.words[i].categories.length > 0) {
												var posListTxt = '';
												for (var j = 0; j < data.words[i].categories.length; j++) {
													posListTxt += data.words[i].categories[j] + "; ";
													if (posList[data.words[i].categories[j]]) {
														$('#tagPOS').append('<option value="' + data.words[i].categories[j] +
															'" ' + (j == 0 ? 'selected>' : '>') + 
															 posList[data.words[i].categories[j]] + '</option>');
														delete posList[data.words[i].categories[j]];
													}
												}
												if ($('#tagPOS option').length) {
													$('#tagPOS').append('<option value="---">---</option>');
												}
												//console.log(data.words[i].text + ": " + posList);
											}
											else {
												console.log("word was found but has no part of speech!");
											}
										}	
									}
								}
							}
							else {
								if (authorMode.Tags[id].originalValue.split(' ').length > 1) {
									console.log ("more than one word, it's a phrase.");
									$('#tagPOS').append('<option selected value="Phrase">Phrase</option>');
									$('#tagPOS').append('<option value="---">---</option>');
									delete posList['Phrase'];
								}
									
								else
									console.log ("words not found in db!");
							}
						}
					},
					error:function(jqXHR, textStatus, errorThrown){
						// nothing;
					},
					complete: function () {
						for (var i in posList) {
							$('#tagPOS').append('<option value="' + i + '">' + posList[i] + '</option>');	
						}
						$('#tagPOS').removeAttr('disabled');
					}
				});

		
	}
	else {
		// add all the parts of speech
		$('#tagPOS option').remove().attr('disabled', true);
		for (var i in posList) {
			$('#tagPOS').append('<option ' + ((authorMode.Tags[id].POSSuggestion == i) ? ' selected' : '') + ' value="' + i + '">' + posList[i] + '</option>');	
		}
		$('#tagPOS').removeAttr('disabled');
		if (authorMode.Tags[id].hasBeenSet) $('#authorModeToolboxRemoveButton').show();
	}
	
	currentTag = authorMode.Tags[id];
	
	// populate the spans in the toolbox
	$('#authorModeOriginalValueValue').text(currentTag.originalValue);
	$('#tagDesc').val(currentTag.description);
	//$('#tagPOS').val(currentTag.POSSuggestion);
	
	
	
	// show the toolbox
	$('#authorModeToolbox').show();
	

}

authorMode.saveTags = function() {
		
		currentTag.setDescription($('#tagDesc').val());
		currentTag.setPOSSuggestion($('#tagPOS').val());
		console.log ('*** CHeck to see if this is working properly!! ***');
		// **** FIX THIS - is it actually copying the data or is it all by ref?
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
	
	
authorMode.init = function() {
	// it is likely that none of this will work with IE prior to version 9
	
	$('#authorModeToolbox').hide();

	$('#authorModePOSSuggestion').bind('change', function() {
		var p = $(this).val();
	});
	
	$('#authorModeToolboxSaveButton').bind('click', function() {
			authorMode.saveTags();
			$('#authorModeToolbox').hide();
		enableSelect();
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

	/*document.write ('<table>');
	for(var word in POSTAGGER_LEXICON) {
		var tmp = ''; 
		for (var i = 0; i < POSTAGGER_LEXICON[word].length ; i++)
			document.write('<tr><td>' + word + '|' + POSTAGGER_LEXICON[word][i] + '</td></tr>' );
	}
	document.write ('</table>');
*/
}

function enableSelect() {
	//$('#mainContainer').animate('color: #000;', 500);
	if (!authorModeSelectionEnabled) {
		$('#mainContainer').removeClass('disabled');
		//$('#mainContainer').unbind('mousedown');
		
		$('#mainContainer').bind('mouseup', 
			function () { authorMode.selectionHandler(); } );
		
		authorModeSelectionEnabled = true;
	}
}

function disableSelect() {
	//$('#mainContainer:not(span)').animate({ opacity:0.1 }, 500, function () { $('span').css({ opacity: 1 })});
	if (authorModeSelectionEnabled) {
		$('#mainContainer').addClass('disabled');
		$('#mainContainer').unbind('mouseup');
		authorModeSelectionEnabled = false;
	}
	//$('#mainContainer').bind('mousedown', function () {return false;})
}

$(function () { authorMode.init(); });
