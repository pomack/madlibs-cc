var getDataFromHtml,sendDataToAppEngine;
var authorSave = false, tagSave = false, storySave = false;
(function() {
	
// hide content and manuplation sections on load
$('#leftColumn, #rightColumn').hide();

// declare variables up top to avoid hoisting

//shan: make the getDataFromHtml,sendDataToAppEngine global variable
var saveAuthoredStory, saveTaggedStory, savePlayedStory, getDataFromAppEngine, roleDetector, roles = $('header ul li a'), activeRole, saveButton = $('#save_button'), deleteButton = $('#delete_button'), submitButton = $('#submitter');

// getDataFromHtml simply gathers the DOM elements we want to get data from, 
// inserts their values into an object and returns a string version of that object
getDataFromHtml = function() {
    // TODO this is being called twice NO GOOD

    // declare up top
    var madlibContainer, madlibTitle, madlibBody, madlibObject, madlibString, saveTaggedStory, clearTaggedStory; 

    // get elements we want to retrieve data from
    madlibContainer = $('article');
    madlibTitle = madlibContainer.children('.title').html();
    madlibBody = madlibContainer.children('.body').html();

    //  insert data from elements into object properties
    madlibObject = {};
    madlibObject.title = madlibTitle;
    madlibObject.body = madlibBody;
    madlibObject.tags = authorMode.Tags;

    // convert object to a json string and return
    madlibString = JSON.stringify(madlibObject);
    return madlibString;
};

saveAuthorStory = function() {
    var title = $('.fieldContainer input[type=text]').val(),
        body = $('.fieldContainer textarea').val(),
        originalStory,
        originalStoryJSONString;
	
	body += '<p class="authorTagMode">';
	var rplc = '</p><p class="authorTagMode">';
	body = body.replace(/\r\n/g, rplc).replace(/[\n]/g, rplc).replace(/[\r]/g, rplc);
	
	body += '</p>';
	
    originalStory = {
        title : title,
        body : body
    };

    originalStoryJSONString = JSON.stringify(originalStory);
       
    // writing to Tag Mode
    populateStory(title, body);
    sendDataToAppEngine(originalStoryJSONString, function(objId) {
        postId = objId;
        //return objId; //shanshan's edit
        console.log(postId);
        notify('Your story has been saved. Move to the Tag tab to start tagging words!')
        authorSave = true;
    });
};

populateStory = function(title, body) {
    var madlibContainer = $('article'),
        madlibTitle = madlibContainer.children('.title'),
        madlibBody = madlibContainer.children('.body');

    madlibTitle.text(title);
    madlibBody.html(body);
};

// save tagged story 
saveTaggedStory = function() {
   var taggedStory;
   taggedStory = getDataFromHtml();
   sendDataToAppEngine(taggedStory, function(objId) {
       postId = objId;
       notify('Your tags have been saved. Move to the Play tab to play the game!');
      //return objId; //shanshan's edit
      // console.log(postId);
       tagSave = true;
   });
};

// clear tagged story  
clearTaggedStory = function() {

    // Empty out the array of tags
    authorMode.Tags = {};

    // TODO Strip all span tags that are surrounding a highlighted word
}

savePlayedStory = function() {
    var playedStory = getDataFromHtml();
    sendDataToAppEngine(playedStory, function(objId) {
        postId = objId;
    });
}

// sendDataToAppEngine sends the returned string from getDataFromHtml 
// to our appEngine /store/ using jQuery's ajax method
sendDataToAppEngine = function(data, f) {
    $.ajax({
        url: 'http://localhost:8080/store/',
        contentType: 'application/json',
        processData: 'false',
        type: 'POST',
        data: data,
        crossDomain: 'true',
        dataType: 'json',
        success: function(obj) {
            if (f) {
                f(obj.id);
               // console.log(f(obj.id));
               // getDataFromAppEngine(obj.id);
            } else {
                console.log('Stored ID ' + obj.id);
            }
        }
    });
};

// getDataFromAppEngine
getDataFromAppEngine = function(taggedId,f) {
    console.log('Called getDataFromAppEngine ' + taggedId);
   $.ajax({
        url: 'http://localhost:8080/view/' + taggedId + '/',
        contentType: 'application/json',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
		  		if(f){	         
	        // playerMode.authorData = data;
            //console.log(data);
            //console.log(playerMode.authorData);
            f(data);
         	}
        }
    });
   // return playerMode.authorData;
};

roleDetector = function() {

    var that = $(this),
        authorTemplate = $('#authorModeForm'),
        tagAndPlayerTemplate = $('#leftColumn, #rightColumn'),
        toolbar = $('#toolbar'),
        autoFillButton = $('#autofill'),
        submitButton = $('#submit');
 
   

   var newRole = $(that).text();
    
    logVar('newRole'); logVar('activeRole');
    
    if (activeRole == 'Author' && newRole == 'Tag' && !authorSave) {
    	notify('You must save your story before moving to the Tag tab.');
    	return false;
    }
	else if (activeRole == 'Author' && newRole == 'Play') {
    	notify('You must save your story and tag it before moving to the Play tab.');
    	return false;
    }
    else if (activeRole == 'Tag' && newRole == 'Play' && !tagSave) {
    	notify('You must save your tags before moving to the Play tab.');
    	return false;
    }
    
 if (that.hasClass('active')) {
        return;
    } else {
        roles.removeClass('active');
        that.addClass('active');
    }
    
    activeRole = $('header ul li a.active').text();

    if (activeRole === 'Author') {
    	$('#notifications').fadeOut(500);
    	disableSelect();
        tagAndPlayerTemplate.hide();
        authorTemplate.show();
        $("div.body").show();
        playerMode.clear();
    } else if (activeRole === 'Tag') {
    	
    	$('#notifications').fadeOut(500);
    	setTimeout( function () { notify("Welcome to Tag mode, where you select words that you want your friends to replace, called 'tags.' For each of these tags, you will provide a part of speech to help them choose the right type of word.<br/><br/>To create a tag, highlight a word and fill in the box that appears.  Make sure to select the correct part of speech for your words.  We will try to guess the part of speech automatically, but you can change it to whatever you want.<br/><br/>If you'd like, you can enter a description to help your friends along.<br/><br/>Once you are finished creating tags, click Save Story.")}, 500);
    	enableSelect();
    	$('#mainContainer').removeClass('disabled');
		//$('#mainContainer').unbind('mousedown');
		
		$('#mainContainer').bind('mouseup', 
			function () { authorMode.selectionHandler(); } );
		
        authorTemplate.hide();
        autoFillButton.hide();
        submitButton.hide();
        saveButton.show();
        deleteButton.show();
        toolbar.hide();
        $("div.body").show();
        tagAndPlayerTemplate.show();
        playerMode.clear();
    } else if (activeRole === 'Play') {
    	$('#notifications').fadeOut(500);
    	setTimeout( function () { notify("Welcome to Play mode. Here, have a friend fill in each of the blanks provided below using the part of speech guidance you set in the Tag tab.<br/><br/>You can get suggestions for words by typing a few letters and looking at the list on the right. If you see a word you like, simply drag and drop it into the space!<br/><br/>After all blanks are filled, click Submit to read the new story!")}, 500);
    	setTimeout( function () { notify()});
    	  disableSelect();
        authorTemplate.hide();
        saveButton.hide();
        deleteButton.hide();
        autoFillButton.show();
        submitButton.show();
        toolbar.show();
        tagAndPlayerTemplate.show();
        
      // if(playerMode.authorData.tags === undefined){
        		getDataFromAppEngine(postId, function(data){
						playerMode.init(data); 
						console.log(data);       			
        			});
        		//console.log("hereis:"+playerMode.authorData.tags);
        		//playerMode.init(playerMode.authorData);
     		//}
     		
     		
    }
};

// function calls
saveButton.bind('click', saveTaggedStory);
roles.bind('click', roleDetector);
submitButton.bind('click', saveAuthorStory);
deleteButton.bind('click', clearTaggedStory);

notify('Welcome to Vippits! Vippits is a word game you can play with your friends.  To play Vippits, you create a story, select pieces of it that you want your friends to replace with specific types of words (nouns, adjectives, and so on), and then share the tagged story with your friends to play.');
setTimeout(function () {
	notify("You are currently in Author mode, which will allow you to create a story.  To begin, type your story's title and body text.<br/><br/>Once you are finished, click Save Story to move to the Tag mode.");
	}, 8000);
activeRole = 'Author';
})();
