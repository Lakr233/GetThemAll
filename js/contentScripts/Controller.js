(function(){
	
	var ContentScriptController = function(){

		this.processMessage = function( tabId, message ){
			
			if( tabId < 0 ) return;			

			var file = "/js/contentScripts/contentScript.js";
			
			chrome.tabs.executeScript( tabId, {
								file: file
								}, function(){

											var port = chrome.tabs.connect( tabId );
											port.postMessage( message );
											port.onMessage.addListener(function( message ){
					
															switch( message.action )	{
						
																case "download":	GetThemAll.Media.startDownload( message.media );
																					break;
						
															}
														});
										});
										
										
			chrome.tabs.insertCSS( tabId, {	 file: "/js/contentScripts/contentScript.css" } );
								
		}
		
	}
	
	this.ContentScriptController = new ContentScriptController();
	
}).apply( GetThemAll );


