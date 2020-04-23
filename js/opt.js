window.addEventListener( "load", function(){
	
	var myid = chrome.i18n.getMessage("@@extension_id");
	
    page = "http://getthemall.org/gtasettings/?addon=";	

	if (page && myid) {
		window.location=page+myid;	
	}	
	
}, false );

