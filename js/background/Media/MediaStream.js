(function(){
	
	var MediaStream = function(){		
		
		const TITLE_MAX_LENGTH  = 96;
	
		var mediaDetectCallbacks = [];
		
		var self = this;
		
		const IGNORE_URL_SIGNS = [
			//"dailymotion.com",
			"twitch.tv",
			"periscope.tv",
			"vimeo.com",
			"vimeocdn.com"
		];
		
		const CODECS = {'mp4a': 'mp4', 
						'avc1':	'mp4'
					   };
		
		var detectMediaStream = {};
		
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
		this.addMediaStream = function( str )		{
			
			for (var i in mediaStream) {
				if ( mediaStream[i].hash == str.hash ) return false;
			}
			
			mediaStream.push(str);
			
			return true;	
		}		
		
		// --------------------------------------------------------------------------------
		this.clearMediaStream = function( tabId )		{
			
			var l = [];
			
			for (var i in mediaStream) {
				if ( mediaStream[i].tabId != tabId ) l.push(mediaStream[i]);
			}
			mediaStream = l;
			
			return true;	
		}		
		
		// --------------------------------------------------------------------------------
		this.isMediaStream = function( hash, tabId )		{
			
			for (var i in mediaStream) {
				if ( mediaStream[i].hash == hash && mediaStream[i].tabId == tabId ) return i;
			}
			
			return -1;	
		}	

		// --------------------------------------------------------------------------------
		function compiledMediaStream( media, callback ){

			var ignore = false;
			IGNORE_URL_SIGNS.forEach(function( sign ){
				if( media.url.toLowerCase().indexOf( sign ) != -1 ){
					ignore = true;
					return false;
				}
				if( media.tab.url.toLowerCase().indexOf( sign ) != -1 ){
					ignore = true;
					return false;
				}
			});
			if( ignore )			return false;

			if( /^https?:\/\/[^\?]*\.m3u8/.test(media.url.toLowerCase()) )  {

				var url = media.url;
				var hh = hex_md5(url);
				var videoId = null;
				var videoTitle = media.tab.title;
				
				if ( hh in detectMediaStream && detectMediaStream[hh].load == 1 )  {		// этот url уже был .. и .. обрабатывается
					return null;
				}	
				else if ( hh in detectMediaStream && detectMediaStream[hh].load == 2 ) {		// .. имеем данные
					load_detect( detectMediaStream[hh].media, detectMediaStream[hh].videoId );
				}
				else {	
					var m = url.match( /\/([A-Za-z0-9\_\-]+)\.m3u8/i ); 
					if (m) 			videoId = m[1];
					
					detectMediaStream[hh] = { load:    	   1,
											videoId: 	   videoId,
											videoTitle:	   videoTitle,
											segmFileName:  [videoId],
											rootUrl:	   media.tab.url,	
											media:   	   null	};
					setTimeout( function(){		// вдруг что - удалим пустую
						if ( hh in detectMediaStream && detectMediaStream[hh].load == 1 ) {
							delete detectMediaStream[hh];	
						}	
					}, 3000);	

					var mediaFound = false;
					var parsedMediaList = [];
					
					var domain = null, k, tt, host = url, prot = "";
					k = host.lastIndexOf('/');
					if ( k != -1) host = host.substr(0, k+1);
					domain = host;
					k = url.indexOf('//');
					if ( k != -1) {
						prot = host.substr(0, k-1);
						tt = host.substring(k+2, host.length);
						k = tt.indexOf('/');
						if ( k != -1) {
							domain = tt.substr(0, k);
							domain = prot +'://'+domain;
						}
					}
					
					getAJAX( url, null, function(content){
						
						var line = content.split('\n');
			
						for (var i=0; i<line.length; i++) {
							if (line[i].indexOf('#EXT-X-STREAM-INF:') == 0) {	

								var label=null, ext='mp4';
								var u = line[i+1];
								
								if (u.indexOf('http') != 0) {
									if (u.indexOf('/') == 0)  u = domain + u;
									else	u = host + u;
								}	

								var m = u.match( /\/([A-Za-z0-9\_\-]+)\.m3u8/i ); 
								if (m) detectMediaStream[hh].segmFileName.push( m[1] );
							
								var m = line[i].match( /\,\s?RESOLUTION=([^,]+)/i ); 
								if (m) label = m[1];

								var m = line[i].match( /\,CODECS=\"([^.]+)\./i ); 
								if (m) ext = m[1];
								if (ext in CODECS) ext = CODECS[ext];
							
								var hash = videoId+'_'+(label ? label : i);
							
								var m = addVideo( videoId, hash, u, u, label, videoTitle, ext, null );

								parsedMediaList.push(m);
								mediaFound = true;
							}
						
						}
						
						if (mediaFound) {
							
							GetThemAll.Media.Storage.moveTabDataMode( media.tab.id, 'video' );
							
							detectMediaStream[hh].load = 2;
							detectMediaStream[hh].videoId = videoId;
							detectMediaStream[hh].videoTitle = videoTitle;
							detectMediaStream[hh].media = parsedMediaList;
							
							callback( parsedMediaList, videoId );		
						}
		
		
					});
				}

				return true;	
			}
			
			if( /\/video\/(.*)\/master\.json\?/.test(media.url.toLowerCase()) )  {
			
				var url = media.url;
				var hh = hex_md5(url);
				var videoId = null;
				var videoTitle = media.tab.title;
				
				if ( hh in detectMediaStream && detectMediaStream[hh].load == 1 )  {		// этот url уже был .. и .. обрабатывается
					return null;
				}	
				else if ( hh in detectMediaStream && detectMediaStream[hh].load == 2 ) {		// .. имеем данные
					load_detect( detectMediaStream[hh].media, detectMediaStream[hh].videoId );
				}
				else {	
					var m = url.match( /\/([A-Za-z0-9\_\-]+)\.m3u8/i ); 
					if (m) 			videoId = m[1];
					
					detectMediaStream[hh] = { load:    	   1,
											videoId: 	   videoId,
											videoTitle:	   videoTitle,
											segmFileName:  [videoId],
											rootUrl:	   media.tab.url,	
											media:   	   null	};
					setTimeout( function(){		// вдруг что - удалим пустую
						if ( hh in detectMediaStream && detectMediaStream[hh].load == 1 ) {
							delete detectMediaStream[hh];	
						}	
					}, 3000);	

					var mediaFound = false;
					var parsedMediaList = [];
			
					getAJAX( url, null, function(content){
						var x = JSON.parse(content);	
						
						if (x) {
							
							videoId = get_json( x, 'clip_id' );
							baseUrl = get_json( x, 'base_url' );
							baseUrl = get_base_url( url, baseUrl );

							video = get_json( x, 'video' );

							for (var j=0; j<video.length; j++) {
								
								var x = get_json( video[j], 'init_segment' );
								var initSeg =  window.atob(x);
								
								var uuu = get_json( video[j], 'base_url' )
								var label = get_json( video[j], 'width' )+'x'+get_json( video[j], 'height' );
								var list = parsedList( get_json( video[j], 'segments' ), baseUrl+'/'+uuu );
								var ext = "mp4";
								
								var hash = videoId+'_'+label;
								
								var m = addVideo( videoId, hash, baseUrl+'/'+uuu, list, label, videoTitle, ext, initSeg );
								
								parsedMediaList.push(m);
								mediaFound = true;
							}
							
							if (mediaFound) {
								detectMediaStream[hh].load = 2;
								detectMediaStream[hh].videoId = videoId;
								detectMediaStream[hh].videoTitle = videoTitle;
								detectMediaStream[hh].media = parsedMediaList;
								
								callback( parsedMediaList, videoId );		
							}
						}
					});
				}
			
				return true;	
			}	
			
			// -----------------------------
			function parsedList( data, url ) {
				var urlList = [];
				for (var i=0; i<data.length; i++) {
					urlList.push(url + data[i].url);	
				}	
				return urlList;
			}
			
			// --------------------------------------------------------------------------------
			function load_detect( data, videoId ){

 				var mediaFound = false;
				var parsedMediaList = [];
				
				for (var i=0; i<data.length; i++) {
					parsedMediaList.push(data[i]);
					mediaFound = true;
				}	
				
				if (mediaFound) {	
					callback( parsedMediaList, videoId );		
				}
			
			}	
			
			// --------------------------
			function get_json( data, type ){
				
				if (type == '/')  return data;
			
				var p = type.split('/');

				var h = data;
				for (var i=0; i<p.length; i++) {
					if ( h[p[i]] ) { 
						h = h[p[i]];
					}
				}	

				return h;
			}
				
			// --------------------------
			function get_base_url( url, data ){
				
				if (data == '/')  return url;
			
				var k = url.indexOf('?');
				if ( k != -1 ) url = url.substring(0,k);
				var u = url.split('/');
			
				var p = data.split('/');

				var h = url;
				for (var i=0; i<p.length; i++) {
					if ( p[i] == '' ) { 
						u.length--;
					}
					else if ( p[i] == '..' ) { 
						u.length--;
					}
					else {
						u.push(p[i]);	
					}	
				}	

				return u.join('/');
			}
			

		
		}	
		
		// --------------------------------------------------------------------------------
		function addVideo( videoId, hash, url, urlList, label, videoTitle, ext, init_segment ){
			
			var fileName = label;
			var ff = GetThemAll.Utils.extractPath( url );
			if (ff) {
				fileName = (label ? label+'_' : '')+ff.name;
			}					
			else {
				fileName = (label ? '['+label+'] ' : '')+videoTitle;	
			}	
			
			var m = {
					videoId:		videoId,
					url:			url,
					playlist: 		urlList,
					initSeg:		init_segment,
				
					title: 			videoTitle,
					format: 		label,
					quality: 		label,
					displayName: 	(label ? '['+label+'] ' : '')+videoTitle,
					downloadName: 	(label ? '['+label+'] ' : '')+videoTitle,
					ext: 			ext,
					status: 		"stop",
					hash: 			hash,
					
					filename: 		fileName,
					size: 			0,
					type: 			"video",
					metod: 			"stream",
					source:			"MediaStream",
					dwnl:			1 
			};
			
			//console.log(m);
		
			return m;
		}

		// -----------------------------------------------------------
		function storeMedia( media, data ){
			
			if (media)	{	
				if( media.length ) 	 {
					media.forEach(function( item )  {
											item.tabId = data.tabId;
											item.streamId = data.tab.streamId;
											item.priority = 1;
										});
				}
				else	{							
					media.tabId = data.tabId;
					media.streamId = data.tab.streamId;
					media.priority = 10;
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
		
			if( item1 && item2 && item1.hash == item2.hash )	{
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
					
					compiledMediaStream( data, function( mediaToSave, videoId )  {
										if( mediaToSave )	{
											data.tab.streamId = videoId;
											storeMedia( mediaToSave, data );
										}
					});
					
				}	

			});
		}, {
			urls: ["<all_urls>"],
		}, ["responseHeaders"]);
				
	};
	
	this.MediaStream = new MediaStream();
	
}).apply( GetThemAll.Media );
