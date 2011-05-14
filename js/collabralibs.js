// Self loading-function
(function () {
    var element = $('#mainContainer');
    //console.log(element);
})();

$(function () {

	$('#mainContainer').bind('mouseup', function () { 
		var r = window.getSelection().getRangeAt(0).cloneRange();
		if (r.toString() == '') console.log('nothing selected'); else console.log(r.toString());
	}
);
	
});

