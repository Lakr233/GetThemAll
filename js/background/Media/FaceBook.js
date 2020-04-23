(function(){

	var FaceBook = function(){		
	
		var self = this;
		
		const TITLE_MAX_LENGTH  = 96;
	
		var mediaDetectCallbacks = [];
		
		// --------------------------------------------------------------------------------
		function storeMedia( media, tabId ){
			
			media.forEach(function( item ){
			
						item.tabId = tabId;
						if (!item.priority) item.priority = 1;
						item.vubor = 0;
						item.metod = "download";
						item.source = "FaceBook";
				
					});
					
			mediaDetectCallbacks.forEach( function( callback ){
						callback( media );
					} );
					
		}
		
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
		this.parse_VideoData = function( data, callback ){
			
			var mediaFound = false;
			var parsedMediaList = [];
			var videoTitle;
			
			var title = data.tab.url;
	
			getAJAX( data.url, null, function(content){
				var mm = content.match( /<title\sid="pageTitle">(.+?)<\/title>/im ); 
				if (mm) title = mm[1];		

				var k = 0; 	
				var kk = 0;
				do {
					k = content.indexOf('videoData');	
					kk++;
					
					if ( k != -1 ) {
						var m = content.match( /"?videoData"?:\[\{(.+?)\}\]/im ); 
						if (m) {
							var info = m[1];
							var videoId = get_JSON_param( 'video_id', info );
							var srcHD = get_JSON_param( 'hd_src', info );
							var srcSD = get_JSON_param( 'sd_src', info );

							k += info.length;
							content = content.substring(k, content.length);
							var videoTitle = get_JSON_param( 'ownerName', content );
							
							if (srcHD) {
								var mmm = add_video( srcHD, 'hd', videoId, videoTitle || title );
								parsedMediaList.push(mmm);
								mediaFound = true;
							}
							if (srcSD) {
								var mmm = add_video( srcSD, 'sd', videoId, videoTitle || title );
								parsedMediaList.push(mmm);
								mediaFound = true;
							}
							
						}
					}
					
				} while ( k != -1 && kk < 100 );
				
				if ( parsedMediaList.length > 0 )	{
					callback( parsedMediaList, data.tab.id );
				}
				
			});


		}	
		
		// ------------------------------
		function get_JSON_param( name, val ){           
		
			var x = '"?' + name + '"?\s*:([^\,]+)';
			var rxe = new RegExp( x, 'i');
			var m  = rxe.exec(val);
			if (m)  {
				if ( m[1] == "null" ) return null;
				return m[1].substring(1, m[1].length-1);
			}   
			return null;
		}
		
		// ------------------------------
		function add_video( url, label, videoId, title ){
			
			url = url.replace(/\\/g,'');
			
			title = GetThemAll.Utils.decode_unicode(title);

			var hash = videoId+'_'+label;
			var x = getFileName( url );
			var fileName = x.name;
			var extension = x.ext;
		
			var media =  {
						hash: hash,
						url: url,
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
			//console.log(media);		
			return media;
		}	
		
		// ------------------------------
		function getFileName( url ){
		
			if ( !url ) return null;
		
			var ext = null;
			var ff = url;
			var k = ff.indexOf('?');
			if (k != -1) {
				ff = ff.substring(0, k);	
			}
			
			k = ff.indexOf('//');
			if (k != -1) {
				ff = ff.substring(k+2, ff.length);	
			}
			
			k = ff.indexOf('/');
			if (k != -1) {
				ff = ff.substring(k, ff.length);	
			}
			
			k = ff.lastIndexOf('.');
			if (k != -1) {
				ext = ff.substring(k+1, ff.length);	
				ff = ff.substring(0, k);	
				k = ff.lastIndexOf('/');
				if (k != -1) {
					ff = ff.substring(k+1, ff.length);	
					return { name: ff, ext: ext};
				}	
			}

			return null;	
		}
		
		// --------------------------------------------------------------------------------
		this.onMediaDetect = {
						addListener: function( callback ){
						
									if( mediaDetectCallbacks.indexOf( callback ) == -1 )	{
										mediaDetectCallbacks.push( callback );
									}
									
								}
					}
		
		// --------------------------------------------------------------------------------
		this.isEqualItems = function( item1, item2 ){
			
			if(  item1.hash == item2.hash  )		return true;
			
			return false;
			
		}
		
		// --------------------------------------------------------------------------------
		chrome.extension.onRequest.addListener ( function(request, sender, sendResponse) {        

						if(request.akce=="set_FaceBook_Media_title")	{
 							tabId = request.tabId;
							videoId = request.videoId;
							title = request.title;
							GetThemAll.Media.Storage.setTitle_FaceBook(tabId, videoId, title);		
						}
						
					});
					
		setInterval(function(){  
			chrome.tabs.query( 	{ }, function(tabs) {
				if( tabs.length > 0 ) {
					for (var i=0; i<tabs.length; i++) {
						if ( /^https?:\/\/www\.facebook\.com\/(.*)/i.test(tabs[i].url.toLowerCase()) )		{
							tabId = tabs[i].id;
							if ( _b(GetThemAll.Prefs.get( "gta.display_facebook_button" ) ) ) {
								var media = GetThemAll.Media.Storage.getMedia( tabId );
								if (media && media.length>0) {
									GetThemAll.ContentScriptController.processMessage( tabId, {
														action: "insertFaceBook_VideoButton",
														media: media
													} );				
								}	
							}					 
						}	
					}
				}	
			});
		}, 3000);
	
 
			
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

					data.tab = tab;
					var tabId = tab.id;
					
 					if ( /^https?:\/\/www\.facebook\.com\/(.*)/i.test(data.tab.url.toLowerCase()) )		{
							self.parse_VideoData(data, function( mediaToSave, tabId )  {
														if( mediaToSave )	{
															storeMedia( mediaToSave, tabId );
														}
													});  
					}
					
				}	

			});
			
        }, {
            urls: ["<all_urls>"],
			types: ["main_frame", "sub_frame", "object",  "xmlhttprequest"]
        }, ["responseHeaders"]);
 	
 
	}
	
	this.FaceBook = new FaceBook();
	
}).apply( GetThemAll.Media );
