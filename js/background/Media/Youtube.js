(function(){
	
	var Youtube = function(){		
	
		const TITLE_MAX_LENGTH  = 96;
	
		var mediaDetectCallbacks = [];
	
		
		// -------------------------------------------------------------------
		function storeMedia( media, data ){
			
			media.forEach(function( item ){
			
						item.tabId = data.tabId;
						item.priority = 1;
						item.source = "Youtube";
				
					});
				
			mediaDetectCallbacks.forEach( function( callback ){
						callback( media );
					} );
			
			GetThemAll.ContentScriptController.processMessage( data.tabId, {
										action: "insertYTButton",
										media: media
									} );				
				
		}
		
		// -------------------------------------------------------------------
		this.onMediaDetect = {
			addListener: function( callback ){
				if( mediaDetectCallbacks.indexOf( callback ) == -1 ){
					mediaDetectCallbacks.push( callback );
				}
			}
		}
		
		// -------------------------------------------------------------------
		this.isEqualItems = function( item1, item2 ){
			
			if( item1.type == item2.type && item1.format == item2.format ){
				return true;
			}
			
			return false;
			
		}

	}
	
	this.Youtube = new Youtube();
	
}).apply( GetThemAll.Media );
