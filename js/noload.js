window.addEventListener( "load", function(){

	chrome.tabs.query( {
			active: true,
			currentWindow: true
		}, function( tabs ){
					if( tabs.length > 0 )	{
						var url = tabs[0].url;
						var BG = chrome.extension.getBackgroundPage();
						BG.navigateMessageDisabled(url);
					}
	} ); 
	
	
}, false );

	

