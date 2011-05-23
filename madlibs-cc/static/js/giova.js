(function() {

    // hide content and manuplation sections on load
    $('#leftColumn, #rightColumn').hide();

    var getDataFromHtml, 
        sendDataToAppEngine,
        getDataFromAppEngine,
        insertedData,
        sent,
        roleDetector,
        roles = $('header ul li a'),
        activeRole,
        saveButton = $('#save_button'),
        deleteButton = $('#delete_button');
    
    /**
     *  getDataFromHtml simply gathers the DOM elements 
     *  we want to get data from, inserts their values 
     *  into an object and returns a string version of 
     *  that object
     */
    getDataFromHtml = function() {

        var madlibContainer,
            madlibTitle,
            madlibBody,
            madlibObject, 
            madlibString,
            saveTaggedStory,
            clearTaggedStory; 

        /**
         *  get elements we want to retrieve data from
         */
        madlibContainer = $('article');
        madlibTitle = madlibContainer.children('.title').html();
        madlibBody = madlibContainer.children('.body').html();

        /**
         *  insert data from elements into object properties
         */
        madlibObject = {};
        madlibObject.title = madlibTitle;
        madlibObject.body = madlibBody;

        /**
         *  convert object to a json string and return
         */
        madlibString = JSON.stringify(madlibObject);
        return madlibString;
    };

    /**
     *  save tagged story 
     */
    saveTaggedStory = function() {
       var taggedStory;
       taggedStory = getDataFromHtml();
       sendDataToAppEngine(taggedStory);
    };

    /**
     *  clear tagged story  
     */
    clearTaggedStory = function() {

        // Empty out the array of tags
        authorMode.Tags = [];

        // TODO Strip all span tags that are surrounding a highlighted word
    }

    /**
     *  sendDataToAppEngine sends the returned string 
     *  from getDataFromHtml to our appEngine /store/
     *  using jQuery's ajax method
     */
    sendDataToAppEngine = function(data) {
        
        $.ajax({
            url: 'http://localhost:8080/store/',
            contentType: 'application/json',
            processData: 'false',
            type: 'POST',
            data: data,
            crossDomain: 'true',
            success: function() {
                console.log('succeded');
            },
            complete: function() {
                console.log('completed');
            }
        });
    };

    /**
     *  getDataFromAppEngine
     */
    getDataFromAppEngine = function(f) {

        $.ajax({
            url: 'http://localhost:8080/list/',
            contentType: 'application/json',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                f(data);
            }
        });
    };

    roleDetector = function() {

        var that = $(this)
            authorTemplate = $('#authorModeForm'),
            tagAndPlayerTemplate = $('#leftColumn, #rightColumn');
        
        if (that.hasClass('active')) {
            return;
        } else {
            roles.removeClass('active');
            that.addClass('active');
        }

        activeRole = $('header ul li a.active').text();

        if (activeRole === 'Author') {
            tagAndPlayerTemplate.hide();
            authorTemplate.show();
            console.log('author mode');
        } else if (activeRole === 'Tag') {
            authorTemplate.hide();
            tagAndPlayerTemplate.show();
            console.log('tag mode');
        } else if (activeRole === 'Play') {
            authorTemplate.hide();
            tagAndPlayerTemplate.show();
            console.log('player mode');
        }
    };
    
    // function calls
    insertedData = getDataFromHtml();
    sent = sendDataToAppEngine(insertedData);
    getDataFromAppEngine(function (receivedData) {
        console.log(receivedData); 
    });
    saveButton.bind('click', saveTaggedStory);
    roles.bind('click', roleDetector);
    deleteButton.bind('click', clearTaggedStory);

})();
