(function(){

    var MediaSniffer = function(){
    
        var self = this;
        
        var mediaDetectCallbacks = [];

		const VIDEO2EXT = {		
			'mpeg' : 'mp4',
			'm4v': 'mp4',
			'm4s': 'mp4',
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
			'realaudio' :  	 'ra',
			'pn-realaudio' : 'rm',
			'midi' : 'mid',
			'mpeg' : 'mp3',
			'mpeg3' : 'mp3',
			'm4a': 'm4a',
			'wav' : 'wav',
			'aiff' : 'aif'
		};
		
		const IMAGE2EXT = {		
			'jpeg' : 'jpg',
			'jpg': 'jpg',
			'gif' : 'gif',
			'pjpeg' : 'jpg',
			'png' : 'png',
			'msvideo' : 'avi',
			'tiff' : 'tiff',
			'x-icon' : 'ico'
		};
		
		const TEXT2EXT = {		
			'html' : 'html',
			'css': 'css',
			'jafascript' : 'js',
			'x-jafascript' : 'js',
			'xml' : 'xml'
		};
		
		const NO_YOUTUBE_SIGNS = [
			"://s.ytimg.com",
			"://o-o.preferred.",
			"youtube.",
			"soloset.net",
			"solosing.com",
			"static.doubleclick.net",
			"googlevideo.",
		];
		
		const SKIP_SNIFFER_SIGNS = [
			'break.com\/video\/([^.]*)',
			'http:\/\/(www\.)?dailymotion(\.co)?\.([^\.\/]+)\/',
			'www\.facebook\.com\/(.*)',
			'metacafe\.com\/watch\/(.*)',
			'vimeo\\.com\\/(.*)',
			'twitch\\.tv\\/(.*)',
			'joannixochart\\.com\\/(.*)',
		];

		const SKIP_SOUND_SIGNS = [
			"www\\.vevo\\.com",
			"www\\.pandora\\.com",
			"www\\.music\\.yahoo\\.com",
			"www\\.spotify\\.com",
			"www\\.tunein\\.com",
			"www\\.last\\.fm",
			"www\\.iheart\\.com",
			"www\\.allmusic\\.com",
			"www\\.radio\\.com",
			"soundcloud\\.com"
		];

		const MOVE_LINK_SIGNS = [
			'^https?:\\/\\/(.*)seg(\\d+)-frag(\\d+)',
			'\\/segment\\-[0-9]\\.m4s',
			'^https?:\\/\\/(.*)\\.ts',
			'googlevideo\\.com\\/(.*)',
		];
		
        const CONTENT_TYPE_RE = /^(video|audio)/i;
        const TRIGGER_VIDEO_SIZE = 1048576;
        const MIN_FILESIZE_TO_CHECK = 50 * 1024;
		
		
		// --------------------------------------------------------------------------
		function checkMedia( media ){

			if (media.url.indexOf("#") != -1)  media.url = media.url.substring(0,media.url.indexOf("#"));
			if ( (media.url.indexOf("tumblr.com") != -1) && (media.url.indexOf("#_=_") != -1) ) media.url = media.url.replace("#_=_", "");			
			
			return media;
		}
		
		
		// --------------------------------------------------------------------------
		this.prepareMedia = function( media ){
		
			//console.log(media);	
			if ( media == null ) return null;
			media = checkMedia( media );
			
			var type = null;
			var name = "";
			var title = media.tab.title;
			var size = "";
			var u = GetThemAll.Utils.convertURL(media.url);
			var fileName = u.name;
			var ext = u.ext;
			var ff = GetThemAll.Utils.extractPath( media.url );
			if (ff) {
				fileName = ff.name;
				ext = ff.ext;
			}	
			var type = null;
			var downloadName = "";
			var displayName = "";
			
			type = getTypeByContentType(media);
			if (type) {
				var x = getExtByContentType( media );
				if (x) {
					ext = x.ext;
					type = x.type;
				}	
			}	
			if (type != "video" && type != "audio" && type != "image" ) type = "";
			
			var disposName = dispositionName( media );
			if( disposName ) {
				ext = GetThemAll.Utils.extractExtension( disposName );
				if (!title) title = disposName;
			} 
			
			if ( !type )	{
				if (u.type) 	{
					type = u.type;
				}	
				else {
					type = getHeaderValue( "content-type", media );
					if (!ext) ext = getExtByContentTypeVideo( type );
					if (!ext) {
						ext = getExtByContentTypeImage( type );
						if (ext)  {
							type = "image";
						}	
						else  {
							ext = getExtByContentTypeText( type );
							type = "link";
						}
					}
				}	
			}
			
			if ( !type || type == "") type= "link";
			if (['video', "game", "audio"].indexOf( type ) != -1) {	
				if (self.ignoreDomain(media.tab.url)) return null;
 			}

			if ( !ext )	{
				if ( u.ext != "" )	{
					ext = u.ext;
					}
			}
			if ( ext == 'mp3' && self.ignoreSoundDomain( media.tab.url ) ) return null;
			

			for (var i in MOVE_LINK_SIGNS) {
				var r =  new RegExp(MOVE_LINK_SIGNS[i]);
				if( r.test(media.url.toLowerCase()) )   type= "link";			
			}
			
			size = getHeaderValue( "Content-Length", media );
			if( size >= TRIGGER_VIDEO_SIZE && !type )	type="video";

			if( media.tab.title )	{
				downloadName = media.tab.title;					
			}
			else {
				downloadName = self.getFileName( media );						
			}	
			if (!downloadName) {
				downloadName = fileName ? fileName : "media";
			}
			displayName = downloadName;
			if ( type != 'video' && fileName) {
				displayName = fileName;
				title = displayName;
			}	

			var result = {				
				url: media.url,
				tabId: media.tabId,
				rootUrl: media.tab.url,
				frameId: media.frameId,
				ext: ext,
				
				title: title,
				format: "",
				
				downloadName: downloadName ? downloadName : "media",
				displayName: displayName,
				filename: fileName ? fileName : media.url,
				priority: 10,
				vubor:  0,
				size: size,
				type: type,
				source: "Sniffer",
				groupId: 0,
				dwnl:	1,
				
				parseUrl: GetThemAll.Utils.parse_URL(media.url)
			};
			
			return result;
		}
		
		// --------------------------------------------------------------------------
		this.ignoreDomain = function( url ){
		
			for (var i in SKIP_SNIFFER_SIGNS) {
				if( url.toLowerCase().match( new RegExp(SKIP_SNIFFER_SIGNS[i],'g') )  )   return true;
			}
			return false;
		}	
		
		// --------------------------------------------------------------------------
		this.ignoreSoundDomain = function( url ){
		
			for (var i in SKIP_SOUND_SIGNS) {
				if( url.toLowerCase().match( new RegExp(SKIP_SOUND_SIGNS[i],'g') )  )   return true;
			}
			return false;
		}	
		
		// ------------------------------------------------------------------
		function getHeadersAll( data ){
			var result = [];
            for (var i = 0; i != data.responseHeaders.length; i++) 
			{
            	result.push( data.responseHeaders[i].name + ": " + data.responseHeaders[i].value );
            }
			return result;
		}
		
		// ------------------------------------------------------------------
        function getHeaderValue(name, data){
            name = name.toLowerCase();
            for (var i = 0; i != data.responseHeaders.length; i++) 
			{
                if (data.responseHeaders[i].name.toLowerCase() == name) 
				{
                    return data.responseHeaders[i].value;
                }
            }
            return null;
        }
		// -------------------------------------------------------------------
		function getTypeByContentType( media ){
			
			var contentType = getHeaderValue( "content-type", media );
			
			if( !contentType )		return null;
			if( contentType == "application/x-fcs" )  return "video";	
			
			var tmp = contentType.split("/");
			
			if( tmp.length == 2 )	{
				return  tmp[0];
			}	
			
			return null;
		}
		// -------------------------------------------------------------------
		function getExtByContentType( media ){
			
			var contentType = getHeaderValue( "content-type", media )
			if( !contentType )		return null;
			if( contentType == "application/x-fcs" )  return { ext: "flv", type: "video" };			
			
 			if( contentType == "application/octet-stream" 
				&& media.type == 'image' )  return null; 
			
			var tmp = contentType.split("/");
			if( tmp.length == 2 )	{
				tmp[1] = tmp[1].toLowerCase();
				switch( tmp[0] )	{
					case "audio":
									if( AUDIO2EXT[tmp[1]] )			return { ext: AUDIO2EXT[tmp[1]], type: "audio"};
									break;
					case "video":
									if( VIDEO2EXT[tmp[1]] )			return { ext: VIDEO2EXT[tmp[1]], type: "video"};
									break;					
					case "image":
									if( IMAGE2EXT[tmp[1]] )			return { ext: IMAGE2EXT[tmp[1]], type: "image"};
									break;					
					case "text":
									if( TEXT2EXT[tmp[1]] )			return { ext: TEXT2EXT[tmp[1]], type: "link"};
									break;					
				}
			}			
			
			return null;
		}
		// -------------------------------------------------------------------
		function getExtByContentTypeVideo( contentType ){
			if( !contentType )		return null;
			
			var tmp = contentType.split("/");
			
			if( tmp.length == 2 )	{
				tmp[1] = tmp[1].toLowerCase();
			
				switch( tmp[0] )	{
					case "audio":
									if( AUDIO2EXT[tmp[1]] )			return AUDIO2EXT[tmp[1]];
									break;
					case "video":
									if( VIDEO2EXT[tmp[1]] )			return VIDEO2EXT[tmp[1]];
									break;					
				}
			}			
			
			return null;
		}
		// -------------------------------------------------------------------
		function getExtByContentTypeImage( contentType ){
			if( !contentType )		return null;
			
			var tmp = contentType.split("/");
			
			if( tmp.length == 2 )	{
				if ( tmp[0] == "image")   {
					tmp[1] = tmp[1].toLowerCase();
					if( IMAGE2EXT[tmp[1]] )			return IMAGE2EXT[tmp[1]];
				}	
			}			
			
			return null;
		}
        
		// -------------------------------------------------------------------
		function getExtByContentTypeText( contentType ){
			if( !contentType )		return null;
			
			var tmp = contentType.split("/");
			
			if( tmp.length == 2 )	{
				if ( tmp[0] == "text") 	{
					tmp[1] = tmp[1].toLowerCase();
					var tip = tmp[1].split(";");
					if( TEXT2EXT[tip[0]] )			return TEXT2EXT[tip[0]];
				}	
			}			
			
			return null;
		}
        
		// -------------------------------------------------------------------
		this.getFileName = function( data ){
			// check disposition name
			
			var name = null, ext = null;

			var dn = dispositionName( data );
			if( dn )	return dn;
			
			var url = data.url;
			var tmp = url.split( "?" );
			url = tmp[0];
			tmp = url.split( "/" );
			tmp = tmp[ tmp.length - 1 ];

			k = tmp.lastIndexOf( "." );
			if ( k != -1 )  {
				name = tmp.substring(0, k);
				ext = tmp.substring(k+1, tmp.length);
			}	
			else {
				name = tmp;
			}	
			
			if( !ext )		{
				var x = getExtByContentType( data );
				if (x) {
					var replaceExt = x.ext;
					if( replaceExt )  {
						tmp = tmp.split( "." );
						tmp.pop();
						tmp.push( replaceExt );
						tmp = tmp.join(".");
					}	
				}
				
				try		{
					ext = decodeURIComponent(tmp);					
				}
				catch( ex )	{
					if( window.unescape )		ext = unescape(tmp);										
					else						ext = tmp;
				}
			}
			return  { name: name, ext: ext };		
		};
		// -------------------------------------------------------------------
        function dispositionName(data){
            try 
			{
                var cd = getHeaderValue('Content-Disposition', data);
                var at = cd.match(/^(inline|attachment);/i);
                
                if ((at != null) && (at[1].toLowerCase() == 'attachment')) 
				{
                    cd = cd.substr(at[0].length);
                    if (cd.charAt(cd.length - 1) != ';')            cd += ';';
                    
                    var fnm = cd.match(/filename="(.*?)"\s*?(?:;|$)/i);
                    if (fnm == null)           fnm = cd.match(/filename=(.*?)\s*?(?:;|$)/i);
                    if (fnm != null)           return fnm[1];
                }
                
            } 
            catch (e) {         }
			
            return null;
        }

		// ------------------------   ------------------------------	
        this.isMedia = function(data){

			if( data.tabId <= 0) return false;
			if ( !data.url )	return false;
            if (data.url.indexOf("chrome-extension") != -1)  return false;
			
            return true;
        }
		
        this.checkCombine = function(data, callback){
			
			var media = GetThemAll.Media.Storage.getDataForSource(data.tab.id, "Combine", "video");   
			
			var url = data.url;
			var tabId = data.tab.id;
			var p = GetThemAll.Utils.parse_URL(url);
			
			if (media && media.length == 1)  {
				var list = media[0].playlist;

 				if (similarity_url( p, media[0].parseUrl ))  {
					list.push(url);
					GetThemAll.Media.Storage.setPlaylist(tabId, media[0].id, list);							
				}

				return true; 
			}
			else {
				media = GetThemAll.Media.Storage.getDataForSource(tabId, "Sniffer", "video");
				if (media && media.length>3) {

					var f = [];
					for (var i=0; i<media.length; i++)  {
						if (!similarity_url( p, media[i].parseUrl ))  f.push( media[i].id );  
					}

					if ( (media.length - f.length) > 4 )  {

						media = GetThemAll.Media.Storage.removeTabSourceData(tabId, "Sniffer", f, 'video'); 

						media.sort( function( item1, item2 )  {   
							return (item1.id > item2.id ? 1 : -1);  
						});

						var list = [];
						for (var i=0; i<media.length; i++)  list.push(media[i].url);
						list.push(url);
						
						var result = {				
							url: media[0].url,
							playlist: list,
							tabId: 	tabId,
							frameId: data.frameId,
							ext: 'mp4',
							
							title: media[0].title,
							format: "",
							
							downloadName: media[0].downloadName,
							displayName: media[0].displayName,
							filename: media[0].fileName,
							priority: 11,
							vubor:  0,
							type: "video",
							metod: "stream",
							source: "Combine",
							groupId: 0,
							dwnl:	1,
							parseUrl:  GetThemAll.Utils.parse_URL(list[0])
						};
						
						callback(result);
						
						return true;    
					}
				}
			}
			
			function similarity_url( u1, u2 )  {
				
				if ( !u1 || !u2 )  return false;

				if (u1.protocol != u2.protocol)  return false;
				if (u1.hostname != u2.hostname)  return false;
				if (u1.file && u2.file && u1.file != u2.file)  return false;

				var k, rez = 0;
				// path
				if (u1.listPath.length == u2.listPath.length) {
					k = 0;
					for (var j in u1.listPath) {
						if ( u1.listPath[j] != u2.listPath[j] ) k++;
					} 
					if ( k>1 )  	  return false;
					else if ( k>0 )   rez++;
				}
				else {
					return false;
				}

				// serach
				if (u1.listSearch.length == u2.listSearch.length) {
					k = 0;
					for (var j in u1.listSearch) {
						if ( u1.listSearch[j] != u2.listSearch[j] )  k++;	
					}	
					if ( k>1 )  	  return -1;
					else if ( k>0 )   rez++;
				}	
				else {
					return -1;
				}

				// hash
				if (u1.listHash.length == u2.listHash.length) {
					k = 0;
					for (var j in u1.listHash) {
						if ( u1.listHash[j] != u2.listHash[j] )  k++;	
					}	
					if ( k>1 )  	  return false;
					else if ( k>0 )   rez++;
				}	
				else {
					return -1;
				}
				
				if (rez>1)  return false;

				return true;	
				
			}
			
			return false;
		}
		
		// ---------------------------------------------------------------------------
		this.onMediaDetect = {
						addListener: function( callback ) {
									if( mediaDetectCallbacks.indexOf( callback ) == -1 )	mediaDetectCallbacks.push( callback );   
								},
						removeListener: function(  ) {
									mediaDetectCallbacks.length=0;   
								}
					}
		
		// ---------------------------------------------------------------------------
		this.isEqualItems = function( item1, item2 ){  

			if ( item2.source == "MediaStream" ) return false;
		
			if (item1.url == item2.url) return true;
			
			return false;
			
		}
		
		// -----------------------------------------------------------------------------	
        chrome.webRequest.onResponseStarted.addListener(  function(data){

			if( data.tabId < 0 )		return false;
		
			chrome.tabs.get( data.tabId, function( tab ){
			
				if (chrome.runtime.lastError) {
					//console.log(chrome.runtime.lastError.message);
				} 
				else if ( !tab ) {
					console.log( data );
				}	
				else {
			
					var tabInfo = tab;
					
					if( self.isMedia( data ) )	{				
						
						if( GetThemAll.noYoutube )		{
							for( var i = 0; i != NO_YOUTUBE_SIGNS.length; i++ )		{
								var sign = NO_YOUTUBE_SIGNS[i];
								if( data.url.indexOf(sign) != -1 )				return;
							}
						}
						
						data.tab = tabInfo;
							
						// calling callbacks
						mediaDetectCallbacks.forEach(function( callback ){
							
							var m = self.checkCombine(data, callback);
							if ( !m ) {									
								m = self.prepareMedia( data );	
								callback( m );
							}	
																	
						});			
								
					}
				}	

			});
            
		}, {
			urls: ["<all_urls>"],
		}, ["responseHeaders"]);
				
        
    }
    
    this.Sniffer = new MediaSniffer();
    
    var MediaCombine = function(){
	
		this.isEqualItems = function( item1, item2 ){
			
			return item1.url == item2.url;
			
		};
	
	};
    this.Combine = new MediaCombine();
	
}).apply(GetThemAll.Media);
