(function(){
	
	var Vimeo = function(){		
	
		const TITLE_MAX_LENGTH  = 96;
	
		var mediaDetectCallbacks = [];

		// --------------------------------------------------------------------------------
		function getAJAX( url, headers, callback ){
			
			var ajax = new XMLHttpRequest();
			ajax.open('GET', url, true);
			ajax.setRequestHeader('Cache-Control', 'no-cache');
			ajax.setRequestHeader('X-FVD-Extra', 'yes');
			
			if (headers) {
				for (var key in headers) {
					ajax.setRequestHeader(key, headers[key]);
				}
			}	
			
			ajax.onload = function(){
						var content = this.responseText;
						callback( content );
			}
			
			ajax.onerror = function(){
				callback( null );
			}
			
			ajax.send( null );
		
		}
		
		// --------------------------------------------------------------------------------
		function detectVimeo( data, callback ){

		    var url = data.url,
		        videoId = null;

			getAJAX( url, null, function(content){

				if (content) {

                    try {
                        var info = JSON.parse(content);
                    }                     
                    catch(ex) {
                        console.log(ex);
                        return;
                    }

                    videoId = GetThemAll.Utils.getJSON( info, 'clip_id' );
					
					var uu = 'https://player.vimeo.com/video/'+videoId+'/config?byline=0&collections=1&context=Vimeo%5CController%5CClipController.main&default_to_hd=1';

					getAJAX( uu, null, function(content){
					
						try {
							var info = JSON.parse(content);
							var media = parsed( info, data );
							if (media) callback(media);
						}                     
						catch(ex) {
							console.log(ex);
							return;
						}
					});

                }    
			});	


		}	
	
		// --------------------------------------------------------------------------------
		function checkVimeo( data, callback ){
			
			tabInfo = data.tab;

		    var url = data.url;
				
			getAJAX( url, null, function(content){

				if (content) {

                    try {
                        var info = JSON.parse(content);
						var media = parsed( info, data );
						if (media) callback(media);
                    }                     
                    catch(ex) {
                        console.log(ex);
                        return;
                    }
                }    
			});	
			
		}
		
		// -----------------------------------------------------------
		function parsed( info, data ) {
			
			var videoId = GetThemAll.Utils.getJSON( info, 'video/id' );
			var title = data.tab.title;
			title = GetThemAll.Utils.getJSON( info, 'video/title' );
			var info = GetThemAll.Utils.getJSON( info, 'request/files/progressive' );

			var mediaFound = false;
			var parsedMediaList = [];

			if ( typeof info == 'object' && info.length ) {

				for (var i=0; i<info.length; i++) {

					var u = info[i]['url'];

					if (u) {
						var height = info[i]['height'];
						var width = info[i]['width'];
						var hash = videoId+'_'+height;
						var fileName = "vimeo";
						var extension = "mp4";
						var ff = GetThemAll.Utils.extractPath( u );
						if (ff) {
							extension = ff.ext;
							fileName = ff.name;
						}	

						var label = width+'x'+height; 

						var media =  {
									hash: hash,
									url: u,
									title: title,
									downloadName: "["+label+"] "+title,
									displayName: "["+label+"] "+title,
									quality: label,
									filename: fileName,
									ext: extension,
									format: label,
									videoId: videoId,
									type: "video",
									size: null,
									groupId: 0,
									orderField: 0
								};
						
						parsedMediaList.push(media);
						mediaFound = true;
					}
				}
				
			}
			
			if ( mediaFound )	{
				return parsedMediaList;
			}
			else {
				return null;
			}


		}
		
		// -----------------------------------------------------------
		function storeMedia( media, data ){
			
			if (media)	{	
				if( media.length ) 	 {							
					media.forEach(function( item ){
											item.tabId = data.tabId;
											item.priority = 1;
											item.source = "Vimeo";
										});
				}
				else	{							
					media.tabId = data.tabId;
					media.priority = 1;
					media.source = "Vimeo";
				}						
			
				mediaDetectCallbacks.forEach( function( callback ){
									callback( media );
								} );
			
 			}
		}
		
		// -----------------------------------------------------------
		this.onMediaDetect = {
			addListener: function( callback ){
				if( mediaDetectCallbacks.indexOf( callback ) == -1 )
				{
					mediaDetectCallbacks.push( callback );
				}
			}
		};
		
		// -----------------------------------------------------------
		this.isEqualItems = function( item1, item2 )		{
		
			if( item1.hash == item2.hash )	{
				return true;
			}
			return false;
		};

		// ------------------------------------------------------------------------
        chrome.webRequest.onResponseStarted.addListener(function(data){
			
			if( !data || data.tabId < 0 )		return false;
		
			chrome.tabs.get( data.tabId, function( tab ){
				
				if (chrome.runtime.lastError) {
					//console.log(chrome.runtime.lastError.message);
				} 
				else if ( !tab ) {
					console.log( data );
				}	
				else {
			
					var tabInfo = tab;
					data.tab = tabInfo;
					
					if ( /player\.vimeo\.com\/video\/(.*)\/config/i.test(data.url.toLowerCase()) )   {
					
									checkVimeo( data, function( mediaToSave )  {
												if( mediaToSave )	{
													storeMedia( mediaToSave, data );
												}
									} );
					}
					else if ( /\.vimeocdn\.com\/(.+?)\/master\.json/i.test(data.url.toLowerCase()) )   {
					
									detectVimeo( data, function( mediaToSave )  {
												if( mediaToSave )	{
													storeMedia( mediaToSave, data );
												}
									} );
					}
					
				}	

			});
		}, {
			urls: ["<all_urls>"],
		}, ["responseHeaders"]);
				
	};
	
	this.Vimeo = new Vimeo();
	
}).apply( GetThemAll.Media );
