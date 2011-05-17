(function() {
    
    /**
     *  getDataFromHtml simply gathers the DOM elements 
     *  we want to get data from, inserts their values 
     *  into an object and returns a string version of 
     *  that object
     */
    var getDataFromHtml = function() {

        var madlibContainer, madlibTitle, madlibBody, madlibObject, madlibString, data, sent;

        /**
         *  get elements we want to retrieve data from
         */
        madlibContainer = $('article');
        madlibTitle = madlibContainer.children('.title').text();
        madlibBody = madlibContainer.children('.body').text();

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
     *  sendDataToAppEngine sends the returned string 
     *  from getDataFromHtml to our appEngine /store/
     *  using jQuery's ajax method
     */
    var sendDataToAppEngine = function(data) {
        
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
                console.log('complete');
            }
        });
    };

    /**
     *  getDataFromAppEngine
     */
    // var getDataFromAppEngine = function() {
    //     
    //     var receivedData = $.ajax({
    //         url: 'http://localhost:8080/store/?id',
    //         contentType: 'application/json',
    //         type: 'GET',
    //         data: data,
    //         dataType: 'json',
    //         success: function() {
    //             console.log(data);
    //         }
    //     });

    //     return receivedData;
    // };
    
    data = getDataFromHtml();
    sent = sendDataToAppEngine(data);
    // received = getDataFromAppEngine();
    // console.log(received);

})();
