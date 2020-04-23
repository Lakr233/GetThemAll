(function(){
	
	var VKontakte = function(){		
	
		const TITLE_MAX_LENGTH  = 96;
	
		var mediaDetectCallbacks = [];

		
		// --------------------------------------------------------------------------------
		const VIDEO2EXT = {		
			'mpeg' : 'mp4',
			'm4v': 'mp4',
			'3gpp' : '3gp',
			'flv' : 'flv',
			'x-flv' : 'flv',
			'quicktime' : 'mov',
			'msvideo' : 'avi',
			'ms-wmv' : 'wmv',
			'ms-asf' : 'asf',
			'web' : 'webm'
		};
		
		const AUDIO2EXT = {		
			'realaudio' : 'ra',
			'pn-realaudio' : 'rm',
			'midi' : 'mid',
			'mpeg' : 'mp3',
			'mpeg3' : 'mp3',
			'wav' : 'wav',
			'aiff' : 'aif'
		};
		
		const TRANSLATE_EXT = {
			"m4v" : "mp4"
		};
			
		

		// --------------------------------------------------------------------------------
        function getHeaderValue(name, data){
            name = name.toLowerCase();
            for (var i = 0; i != data.responseHeaders.length; i++) {
                if (data.responseHeaders[i].name.toLowerCase() == name) {
                    return data.responseHeaders[i].value;
                }
            }
            return null;
        }
        
		
		// --------------------------------------------------------------------------------
		function getExtByContentType( contentType ){
			if( !contentType ){
				return null;
			}
			var tmp = contentType.split("/");
			
			if( tmp.length == 2 ){
				switch( tmp[0] ){
					case "audio":
						if( AUDIO2EXT[tmp[1]] ){
							return AUDIO2EXT[tmp[1]];
						}
					break;
					case "video":
						if( VIDEO2EXT[tmp[1]] ){
							return VIDEO2EXT[tmp[1]];
						}						
					break;					
				}
			}			
			
			return null;
		}
		
		// --------------------------------------------------------------------------------
		function postAJAX( url, data, callback ){
			
			var ajax = new XMLHttpRequest();
			ajax.open('POST', url, true);
			ajax.setRequestHeader('Cache-Control', 'no-cache');
			ajax.setRequestHeader('X-FVD-Extra', 'yes');
			ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			
			ajax.onload = function(){
						var content = this.responseText;
						callback( content );
			}
			
			ajax.onerror = function(){
				callback( null );
			}
			
			var l = [];
			for (var k in data) l.push(k + '=' + data[k]);
			
			ajax.send( l.join('&') );
		
		}
		
		// ----------------------------------------------------------
		function parseVKontakteAudio( data, callback ){

			var mediaFound = false;
			var parsedMediaList = [];
			
			var action = '';
			for (var k in data.requestBody.formData) {
				var t = k + '=' + data.requestBody.formData[k];
				if ( k == 'act' ) action = t;
			}	
			
			if (['act=reload_audio'].indexOf(action) != -1) {
			
				postAJAX( data.url, data.requestBody.formData, function(content){
					
					var m = content.match( /<!json>(.+?)<!>/i ); 
					if (m) {
						var x = JSON.parse( m[1] );	
						
						for (var i=0; i<x.length; i++) {
							var url = x[i][2];
							var ff = GetThemAll.Utils.extractPath( url );
							if (ff) {
								var media = addMedia({	videoId: x[i][1] + '_' + x[i][0],
														url: url,
														filename: ff.name,
														ext:	ff.ext,
														title: x[i][4]+' '+x[i][3],
														tabId: data.tabId,
														frameId: data.frameId,
												  });
									  
					
								parsedMediaList.push(media);
								mediaFound = true;
									  
							}					  
						}	
						
						if (mediaFound) {
							setTimeout( function() {	
								callback(parsedMediaList);
							}, 1500);	
							
							if ( _b(GetThemAll.Prefs.get( "gta.display_vk_button" ) ) && data.tabId ) {
								GetThemAll.ContentScriptController.processMessage( data.tabId, {
													action: "insertVK_AudioButton",
													media: parsedMediaList
												} );				
							}					
							
						}	
					} 	
				});				
			}	
		}	
		
		// ----------------------------------------------------------
		function parseVKontakteVideo( data, callback ){
		
			var mediaFound = false;
			var parsedMediaList = [];
			
			var formData = data.requestBody.formData;
			if ( 'video' in formData ) {	
			
				postAJAX( data.url, formData, function(content){
					
					var m = content.match( /<!json>{(.+?)}<!>/i ); 
					if (m) {
						//m = m[1].replace(/\\"/g,'"');
						var x = JSON.parse( '{' + m[1] + '}' ); 
						var info = x['mvData'];

						var videoId = info["videoRaw"];
						var title = info["title"].replace(/&(.+?);/gm,'').trim();

						var player = x['player'];
						info = player.params[0];
						
						if (info["url240"])  _create(info["url240"],  videoId, '[240] '+title,  '240');
						if (info["url360"])  _create(info["url360"],  videoId, '[360] '+title,  '360');
						if (info["url480"])  _create(info["url480"],  videoId, '[480] '+title,  '480');
						if (info["url720"])  _create(info["url720"],  videoId, '[720] '+title,  '720');
						if (info["url1080"]) _create(info["url1080"], videoId, '[1080] '+title, '1080');
						
					}	

					if (mediaFound) {
						setTimeout( function() {	
							callback(parsedMediaList);
						}, 1500);	
					}	
				});				
			}	
			
			// -----------------
			function _create(url, videoId, ft, q) {

				var ff = GetThemAll.Utils.extractPath( url );
				if (ff) {
					var media = addMedia({	videoId: videoId,
											url: url,
											filename: ff.name,
											ext:	ff.ext,
											title: ft,
											tabId: data.tabId,
											frameId: data.frameId,
									  });
					parsedMediaList.push(media);
					mediaFound = true;
				}    
			}
		}
		
		// ----------------------------------------------------------
		function addMedia( x ) {
			
			var result = {	
				videoId: x.videoId,
				url: x.url,
				tabId: x.tabId,
				frameId: x.frameId,
				ext: x.ext,
				
				title: x.title,
				format: "",
				
				downloadName: x.title,
				displayName: x.title,
				filename: x.filename,
				priority: 10,
				vubor:  0,
				size: 0,
				type: "video",
				metod: "download",
				source: "VKontakte",
				groupId: 0,
				dwnl:	1,
			};
			
			console.log(result);
			
			return result;
		}

		// -----------------------------------------------------------
		function storeMedia( media, data ){

			if (media)	{	
				if( media.length )	{							
					media.forEach(function( item ){
											item.tabId = data.tabId;
											item.priority = 1;
											item.dwnl =	1;
											item.metod = "download";
											item.source = "VKontakte";
										});
				}
				else	{							
					media.tabId = data.tabId;
					media.priority = 1;
					media.dwnl =	1;
					media.metod = "download";
					media.source = "VKontakte";
				}						

				mediaDetectCallbacks.forEach( function( callback ){
									callback( media );
								} );
			
			}
		}
		
		this.onMediaDetect = {
			addListener: function( callback ){
				if( mediaDetectCallbacks.indexOf( callback ) == -1 )
				{
					mediaDetectCallbacks.push( callback );
				}
			}
		};
		
		this.isEqualItems = function( item1, item2 )		{
		
			if( item1.url == item2.url )
			{
				return true;
			}
			return false;
		};

		// --------------------------------------------------------------------------------
		chrome.extension.onRequest.addListener ( function(request, sender, sendResponse) {        

						if(request.akce=="set_VK_Audio_Media_title")	{
							tabId = request.tabId;
							url = request.url;
							ext = request.ext;
							title = request.title;
							
							GetThemAll.Media.Storage.setData_AttributeUrl(tabId, url, "title", title);		
							frmt = title;
							if ( frmt.length > 10) frmt = frmt.substr(0,10)+"...";
							GetThemAll.Media.Storage.setData_AttributeUrl(tabId, url, "format", frmt);		
							downloadName = title + "." + ext;
							GetThemAll.Media.Storage.setData_AttributeUrl(tabId, url, "downloadName", downloadName);		
							
						}
						
					});
					
					
		chrome.webRequest.onBeforeRequest.addListener( function(data) {
			
			if (data.method == "POST") {
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
						
						if(/^https?:\/\/vk\.com\/al_audio\.php/i.test(data.url)) {
					
							parseVKontakteAudio( data, function( mediaToSave )  {
															if( mediaToSave )	{
																storeMedia( mediaToSave, data );
															}
												} );
						
						}
						else if(/^https?:\/\/vk\.com\/al_video\.php/i.test(data.url)) {

							parseVKontakteVideo( data, function( mediaToSave )  {
															if( mediaToSave )	{
																storeMedia( mediaToSave, data );
															}
												} );
						
						}
						
					}
				});	
			}
			
 		},
		  {urls: ["https://vk.com/*"]},
		  ["requestBody"]
		); 
			
	};
	
	this.VKontakte = new VKontakte();
	
}).apply( GetThemAll.Media );

