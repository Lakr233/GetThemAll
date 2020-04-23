(function(){

	var SitePage = function(){		
	
		var self = this;
		
		const TITLE_MAX_LENGTH  = 96;
        const VIDEO_EXTENSIONS = ["flv", "ram", "mpg", "mpeg", "avi", "rm", "wmv", "mov", "asf", "rbs", "movie", "divx", "mp4", "ogg", "mpeg4", "m4v", "webm"];
	
		var mediaDetectCallbacks = [];
		
		// ----------------------------------------------------------
		function get_JSON_param( name, val ){			
		
			var x = '"' + name + '"\s*:\s*"([^\"]+?)"';
			var rxe = new RegExp( x, 'i');
			var m  = rxe.exec(val);
			if (m)	return m[1];
			return null;
		}
		
		// --------------------------------------------------------------------------
		function prepareMedia( media ){
			
			//console.log(media);
			if ( !media.url || media.url.indexOf('blob:') != -1 )  return null;
			
			var u = GetThemAll.Utils.convertURL(media.url);
			
			if (u.type)			{
				media.type = u.type;
			}	
			
			if (u.type == 'video') {
				if (GetThemAll.Media.Sniffer.ignoreDomain(media.url)) return null;
			}	
			
			if ( !GetThemAll.Utils.check_enable_type(media.type) )  return null;
			
			var downloadName = u.name;
			if (!downloadName)  downloadName = media.title;
			if (!downloadName) {
				var p = u.url.split('/');
				if (p.length>0)	downloadName = p[p.length-1];
			}	
			if (!downloadName)  downloadName = 'no name';

			var title = media.title;
			if (!title)  title = downloadName;
			
			var result = {				
				url: media.url,
				ext: u.ext,
				title: title,
				format: "",
				downloadName: downloadName,
				displayName: downloadName,
				filename: u.name,
				priority: 10,
				size: "",
				type: media.type,
				groupId: 0,
				dwnl:	1,
				orderField: 0
			};
			
			//console.log(result);
			return result;
		}
		
		// --------------------------------------------------------------------------------
		function storeMedia( media, tabId ){
			
 			media.forEach(function( item ){
			
						item.tabId = tabId;
						item.vubor = 0;
						if (!item.priority) item.priority = 1;
						if ( !('source' in item) )	item.source = "SitePage";
				
					});
					
			mediaDetectCallbacks.forEach( function( callback ){
						callback( media );
					} ); 
					
		}
		// --------------------------------------------------------  
		function parse_str(str){
			var glue1 = '=';
			var glue2 = '&';
			var array2 = str.split(glue2);
			var array3 = [];
			for(var x=0; x<array2.length; x++)
			{
				var tmp = array2[x].split(glue1);
				array3[unescape(tmp[0])] = unescape(tmp[1]).replace(/[+]/g, ' ');
			}
			return array3;
		}
		
		// --------------------------------------------------------------------------------
		function asyncOpen( url, callback ){

			var ajax = new XMLHttpRequest();
				
			ajax.open('GET', url);
			ajax.setRequestHeader('Cache-Control', 'no-cache');
				
			ajax.onreadystatechange = function()  {
							try
							{
								if  ( (this.readyState == 4) && (this.status == 200))
								{
									var text = ajax.response;
									if (text)
									{
										callback(text);
										return text;
									}	
									else
									{
										callback( null );
										return null;
									}	
								}
							}
							catch (e) {}
						};
			ajax.onerror = function(){
							callback( null );
							return null;
						};
				
			ajax.send(null);
		}
		
		// --------------------------------------------------------------------------------
		this.check_Links = function( tabId, answer, url, link, callback ){
		
//console.log("check_Links:", tabId, answer, url, link);
			if (link == null) return;
			
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			if (answer == "vk_audio")		{
				return true;
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			else if (answer == "vk_video")	{
				return true;
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			else if (answer == "other")	{
				var parsedMediaList = [];
				
				link.forEach(function( mm ){
			
						var m = prepareMedia( mm );
						
	                    if (m) parsedMediaList.push(m);

					});
				
				//console.log("other", parsedMediaList);
				callback( parsedMediaList, tabId );
				return true;
			}
		}

		function convertEscapedCodesToCodes(str, prefix, base, num_bits) {
			var parts = str.split(prefix);
			parts.shift();  // Trim the first element.
			var codes = [];
			var max = Math.pow(2, num_bits);
			for (var i = 0; i < parts.length; ++i) 
			{
				var code = parseInt(parts[i], base);
				if (code >= 0 && code < max) 
				{
					codes.push(code);
				} 
				else 
				{
					// Malformed code ignored.
				}
			}
			return codes;
		}

		function convertEscapedUtf16CodesToUtf16Codes(str) {
			return convertEscapedCodesToCodes(str, "\\u", 16, 16);
		}

		function convertUtf16CodesToString(utf16_codes) {
			var unescaped = '';
			for (var i = 0; i < utf16_codes.length; ++i) 
			{
				unescaped += String.fromCharCode(utf16_codes[i]);
			}
			return unescaped;
		}
		
		function unescapeFromUtf16(str)  {
			var utf16_codes = convertEscapedUtf16CodesToUtf16Codes(str);
			return convertUtf16CodesToString(utf16_codes);
		}

		// --------------------------------------------------------------------------------
		this.getPage_All_URLs = function( url, tab, callback ){

				GetThemAll.Media.Storage.removeTabSourceData( tab.id, "SitePage" );
				callback( { command: "Get_Links", tip: "all", answer: "other", tabId: tab.id } );
				return null;
		}
		
		const DISPLAY_FVDSD_RATE_SHOW = 3600 * 24 * 1 * 1000; // one day
		
		// --------------------------------------------------------------------------------
		this.Rate_Message = function( tabId, type, url ){

			var xx = "rate.display_"+type;
			var flag = _b(GetThemAll.Prefs.get( xx ));
			
			if (flag) {
				var xx = "rate.last_show_"+type;
				var last = parseInt(GetThemAll.Prefs.get( xx ));

				last += DISPLAY_FVDSD_RATE_SHOW;
				
				var current_dt = new Date();
				var current_time = current_dt.getTime();
				
				if (last > current_time) flag = false;
			}
			
			if (flag)	{
				GetThemAll.Prefs.set( xx, current_time );
				
				GetThemAll.ContentScriptController.processMessage( tabId, {
									action: "canShowRateDialog",
									type: type,
									url: url
								} );				
			}
		}
		
		// --------------------------------------------------------------------------------
		this.Dont_Rate_Message = function( type ){
		
			var xx ="rate.display_"+type;
			GetThemAll.Prefs.set( xx, false );
		
		}
		
		
		// --------------------------------------------------------------------------------
		this.getContentFromYoutubePage = function( videoId, callback ){
			getContentFromYoutubePage( videoId, callback );
		}
		
		// --------------------------------------------------------------------------------
		this.onMediaDetect = {
						addListener: function( callback ){
						
									if( mediaDetectCallbacks.indexOf( callback ) == -1 )
									{
										mediaDetectCallbacks.push( callback );
									}
									
								}
					}
		
		// --------------------------------------------------------------------------------
		this.isEqualItems = function( item1, item2 ){
			
 			if(  item1.url == item2.url  )	{
				if ( (item1.type == "video") || (item1.type == "audio") ) return false;
				else return true;
			}	 
			
			return false;
			
		}
		
		chrome.extension.onRequest.addListener ( function(request, sender, sendResponse) {        
	
						if(request.akce=="Page_URL")	{
							self.getPage_All_URLs(request.url, sender.tab, sendResponse );  
						}
						else if(request.akce=="Get_Links")	{
							if (request.tabId == sender.tab.id)	{
								self.check_Links(request.tabId, request.answer, request.url, request.link, function( mediaToSave, tabId ){

																if( mediaToSave )	{
																	storeMedia( mediaToSave, tabId );
																}
																
															} );
							}	
						}
						
					});
	
	}
	
	
	this.SitePage = new SitePage();
	
}).apply( GetThemAll.Media );
