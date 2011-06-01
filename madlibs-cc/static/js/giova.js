var returnedTagObject;
(function() {

// hide content and manuplation sections on load
$('#leftColumn, #rightColumn').hide();

// declare variables up top to avoid hoisting
var getDataFromHtml, saveAuthoredStory, saveTaggedStory, savePlayedStory, sendDataToAppEngine, getDataFromAppEngine, roleDetector, roles = $('header ul li a'), activeRole, saveButton = $('#save_button'), deleteButton = $('#delete_button'), submitButton = $('#submitter');

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
        id = objId;
        console.log(id);
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
       id = objId;
       console.log(id);
   });
};

// clear tagged story  
clearTaggedStory = function() {

    // Empty out the array of tags
    authorMode.Tags = {};

    // TODO Strip all span tags that are surrounding a highlighted word
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
            } else {
                console.log('Stored ID ' + obj.id);
            }
        }
    });
};

// getDataFromAppEngine
getDataFromAppEngine = function(taggedId) {
    console.log('Called getDataFromAppEngine ' + taggedId);
    $.ajax({
        url: 'http://localhost:8080/view/' + taggedId + '/',
        contentType: 'application/json',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log(data);
			returnedTagObject = data;
        }
    });
};

roleDetector = function() {

    var that = $(this)
        authorTemplate = $('#authorModeForm'),
        tagAndPlayerTemplate = $('#leftColumn, #rightColumn'),
        toolbar = $('#toolbar'),
        autoFillButton = $('#autofill'),
        submitButton = $('#submit');
    
    if (that.hasClass('active')) {
        return;
    } else {
        roles.removeClass('active');
        that.addClass('active');
    }

    activeRole = $('header ul li a.active').text();

    if (activeRole === 'Author') {
    	disableSelect();
        tagAndPlayerTemplate.hide();
        authorTemplate.show();
    } else if (activeRole === 'Tag') {
    	enableSelect();
        authorTemplate.hide();
        autoFillButton.hide();
        submitButton.hide();
        saveButton.show();
        deleteButton.show();
        toolbar.hide();
        tagAndPlayerTemplate.show();
    } else if (activeRole === 'Play') {
    	disableSelect();
        authorTemplate.hide();
        saveButton.hide();
        deleteButton.hide();
        autoFillButton.show();
        submitButton.show();
        toolbar.show();
        tagAndPlayerTemplate.show();
        getDataFromAppEngine(id);
    }
};

// function calls
saveButton.bind('click', saveTaggedStory);
roles.bind('click', roleDetector);
submitButton.bind('click', saveAuthorStory);
deleteButton.bind('click', clearTaggedStory);

})();
