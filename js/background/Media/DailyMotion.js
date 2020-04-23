(function(){
	
	var DailyMotion = function(){		
	
		const TITLE_MAX_LENGTH  = 96;
	
		var mediaDetectCallbacks = [];

		// -----------------------------------------------------
		function parse_PageDailyMotion(data, callback) {

			if (!data) return callback(null);
			if ( !('url' in data) ) return callback(null);

			var mm = data.url.match( /dailymotion\.com\/cdn\/manifest\/video\/(.+?)\.m3u8/i ); 
			if (mm)    videoId = mm[1];   
		
			if (videoId) {
			
				getContent( videoId, function(content) {
				
					parse(content, data, callback);
				
				});
			}	
			
		}
		
		// -----------------------------------------------------
		function parse_EmbedDailyMotion(data, callback) {

			if (!data) return callback(null);
			if ( !('url' in data) ) return callback(null);

			var url = data.url;
			
			var kk = url.indexOf('?');
			if ( kk != -1 )  url = url.substring(0, kk);      

			var mm = url.match( /\.dailymotion\.com\/embed\/video\/(.+?)$/i ); 
			if (mm)    videoId = mm[1];   
			
			if (videoId) {
			
				getContent( videoId, function(content) {
				
					parse(content, data, callback);
				
				});
			}	

		}
		
		// -----------------------------------------------------
		function parse(content, data, callback  ) {
			
			var mediaFound = false;
			var parsedMediaList = [];
			
			var m=/\"metadata\"\:(.*)\}\)/.exec(content);

			if(m) 		{
				var info=JSON.parse(m[1]);
				
				var title = info['title'];
				if (title) baseFileName = title;		
				
				info = info.qualities;
				var tags={	"144": 		{  	label: "LOW",		},
							"240": 		{  	label: "LD",		},
							"380": 		{	label: "SD",		},
							"480": 		{	label: "HQ",		},
							"720": 		{	label: "HD",		},
							"1080":		{	label: "FULL HD",	},
						}
						
				for(var tag in tags)   {
					var mediaUrls = info[tag];
				
					if (mediaUrls) {
						for (var mm in mediaUrls)   {
							if ( mediaUrls[mm] ) {
								_create( title, mediaUrls[mm].url, tags[tag].label );
							}
						}
					}	
						
				}

				if ( mediaFound )	callback( parsedMediaList );
			} 

			// ------
			function _create( title, url, label ) {
				
				var extension="flv";
				var fileName = label;
				var ff = GetThemAll.Utils.extractPath( url );
				if (ff) {
					extension = ff.ext;
					fileName = label+"_"+ff.name;
				}					

				var media =  {
						url: url,
						title: 			title,
						format: 		label,
						quality: 		label,
						downloadName: 	"["+label+"] "+baseFileName,
						displayName: 	"["+label+"] "+baseFileName,
						filename: 		fileName,
						ext: 			extension,
						type: 			"video",
						size: 			null,
						dwnl:			1,
					};
						
				parsedMediaList.push(media);
				mediaFound = true;
			}
			// -----			
		}
	
		// --------------------------------------------------------------------------------
		function getContent( videoId, callback ){
			
			var url = 'http://www.dailymotion.com/embed/video/'+videoId;
			
			// send request to DailyMotion
			var ajax = new XMLHttpRequest();
			ajax.open('GET', url, true);
			ajax.setRequestHeader('Cache-Control', 'no-cache');
			
			ajax.onload = function(){
						callback( this.responseText );
			}
			
			ajax.onerror = function(){
				callback( null );
			}
			
			ajax.send( null );
		}
		
		// ----------------------------------------------------------
		function get_JSON_param( name, val ){			
		
			var x = '"' + name + '"\s*:\s*"([^\"]+?)"';
			var rxe = new RegExp( x, 'i');
			var m  = rxe.exec(val);
			if (m)	return m[1];
			return null;
		}
		
		// -----------------------------------------------------------
		function storeMedia( media, data ){
			
			media.forEach(function( item ){
				item.tabId = data.tabId;
				item.frameId = data.frameId;
				item.priority = 20;
				item.metod = "download";
				item.source = "DailyMotion";
			});
			
			mediaDetectCallbacks.forEach( function( callback ){
						callback( media );
					} );
			
			GetThemAll.ContentScriptController.processMessage( data.tabId, {
							action: "insertDMButton",
							media: media,
						} );				

		}
		
		this.onMediaDetect = {
			addListener: function( callback ){
				if( mediaDetectCallbacks.indexOf( callback ) == -1 )
				{
					mediaDetectCallbacks.push( callback );
				}
			}
		}
		
		this.isEqualItems = function( item1, item2 )		{
		
			if( item1.type == item2.type && item1.displayName == item2.displayName) {
				try {
					if (item1.url.split('?')[0] == item2.url.split('?')[0] )	return true;
				}
				catch (e) {
					return false;
				}	
			}
			return false;
		}
		
		
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
					
					if (!tabInfo.url) return false;
					
 					if ( /(www\.)?dailymotion\.com?\/cdn\/manifest\/video\//i.test(data.url) )        {
						parse_PageDailyMotion( data, function( mediaToSave )  {
															if( mediaToSave )	{
																storeMedia( mediaToSave, data );
															}
												} );	
					}  
					else if ( /(www\.)?dailymotion\.com?\/embed\/video\//i.test(data.url) )        {
						parse_EmbedDailyMotion( data, function( mediaToSave )  {
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
				
	}
	
	this.DailyMotion = new DailyMotion();
	
}).apply( GetThemAll.Media );
