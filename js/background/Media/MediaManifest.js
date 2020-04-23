(function(){
	
	var MediaManifest = function(){		
		
		const TITLE_MAX_LENGTH  = 96;
	
		var mediaDetectCallbacks = [];
		
		var self = this;
		
		const IGNORE_URL_SIGNS = [];
		
		const CODECS = {'mp4a': 'mp4', 
						'avc1':	'mp4'
					   };
					   
		var detectLivePool = {};
		
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
		this.addLivePool = function( str )		{
			
			for (var i in LivePool) {
				if ( LivePool[i].hash == str.hash ) return false;
			}
			
			LivePool.push(str);
			
			return true;	
		}		
		
		// --------------------------------------------------------------------------------
		this.clearLivePool = function( tabId )		{
			
			var l = [];
			
			for (var i in LivePool) {
				if ( LivePool[i].tabId != tabId ) l.push(LivePool[i]);
			}
			LivePool = l;
			
			return true;	
		}		
		
		// --------------------------------------------------------------------------------
		this.isLivePool = function( hash, tabId )		{
			
			for (var i in LivePool) {
				if ( LivePool[i].hash == hash && LivePool[i].tabId == tabId ) return i;
			}
			
			return -1;	
		}	

		// --------------------------------------------------------------------------------
		function compiledManifest( media, callback ){

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
			
			var mediaFound = false;
			var parsedMediaList = [];
			
			if( /^https?:\/\/[^\?]*\.f4m/.test(media.url.toLowerCase()) )  {

				var url = media.url;
				var hh = hex_md5(url);
				var videoId = null;
				var videoTitle = media.tab.title;
				
				if ( hh in detectLivePool && detectLivePool[hh].load == 1 )  {		// этот url уже был .. и .. обрабатывается
					return null;
				}	
				else if ( hh in detectLivePool && detectLivePool[hh].load == 2 ) {		// .. имеем данные
					load_detect( detectLivePool[hh].media, detectLivePool[hh].videoId );
				}
				else {	
					videoId = hh;
					
					detectLivePool[hh] = {  load:    	   1,
											videoId: 	   videoId,
											videoTitle:	   videoTitle,
											segmFileName:  [videoId],
											rootUrl:	   media.tab.url,	
											media:   	   null	};
					setTimeout( function(){		// вдруг что - удалим пустую
						if ( hh in detectLivePool && detectLivePool[hh].load == 1 ) {
							delete detectLivePool[hh];	
						}	
					}, 3000);	

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

						var xml = GetThemAll.Utils.parseXml( content );
						if (xml) {
							ParseManifest(xml, domain, host);
						}
		
					});
				}

				return true;	
			}
			
			// -----------------------------------------------------------
			function ParseManifest(xml, domain, host)  {

				var duration = "",
					mediaXML = [],
					t = '',
					bootstrapInfo = {};
			
				// продолжительность
				t = xml.getElementsByTagName('duration');	
				if (!t) return;
				try {
					duration = t[0].textContent || t[0].duration.textContent;	
				}
				catch(ex) {
					return;
				}	
			
				// bootstrapInfo
				t = xml.getElementsByTagName('bootstrapInfo');
				for (var i=0; i<t.length; i++) {
					var id = t[i].getAttribute('id');
					var text = t[i].textContent;
					bootstrapInfo[id] = text;
				}	

				// media
				t = xml.getElementsByTagName('media');
				for (var i=0; i<t.length; i++) {
					var bootId = t[i].getAttribute('bootstrapInfoId');
					var width = t[i].getAttribute('width');
					var height = t[i].getAttribute('height');
					var streamId = t[i].getAttribute('streamId');
					var bitrate = t[i].getAttribute('bitrate');
					var uri = t[i].getAttribute('url');
					if ( ! /^https?/.test(uri) ) {            
						uri = host + uri;            
					}    
					
					var text = t[i].textContent;
					
					var bootstrap = bootstrapInfo[bootId];
					if (bootstrap) bootstrap = GetThemAll.jspack.stringToBytes(window.atob(bootstrap));
					
					mediaXML.push({		streamId: streamId,
										width:	width,
										height:	height,
										bitrate: bitrate,
										uri: uri,			
										metadata: window.atob(text),
										bootstrap: bootstrap,
										duration: duration
								  });
				}	

				//console.log(mediaXML);				
				if (mediaXML.length == 0) return;
				for (var i=0; i<mediaXML.length; i++) {
					ParseVideo(mediaXML[i]);			
				}	

				if (mediaFound) {
					detectLivePool[hh].load = 2;
					detectLivePool[hh].videoId = videoId;
					detectLivePool[hh].videoTitle = videoTitle;
					detectLivePool[hh].media = parsedMediaList;
					
					callback( parsedMediaList, videoId );		
				}


			}	
			
			// -----------------------------------------------------------
			function ParseVideo(mXML)  {
				
				var pos = 0, 
					boxType = 0, 
					boxSize = 0,
					paramsBootstrap = {};
					
				var	label = mXML.height || mXML.bitrate;
				if (!label) {
					var m = url.match(/([0-9]*)x([0-9]*)/g);
					if(m)   label = m[m.length-1];   
				}   
				
				
				ReadBoxHeader(mXML.bootstrap);	

				ParseBootstrapBox(mXML.bootstrap);
				
				var list = [];
				
				var segNum  = paramsBootstrap.segStart;
				var fragNum = paramsBootstrap.fragStart;
				var lastFrag = fragNum;
				var firstFragment  = paramsBootstrap.fragTable[0];
				
				while (fragNum < paramsBootstrap.fragCount) {
					fragNum = fragNum + 1;
					var segNum = GetSegmentFromFragment(fragNum);
					list.push( mXML.uri + "Seg" + segNum + "-Frag" + fragNum	);
				}
				
				var initSeg = WriteMetadata(GetThemAll.jspack.stringToBytes(mXML.metadata));
				
				var ext = 'flv';
				var k = mXML.streamId.lastIndexOf('.');
				if ( k != -1 )  {
					var ee = mXML.streamId.substring(k+1, mXML.streamId.length);
					if (['mp4','flv','webm'].indexOf(ee) != -1)  ext = ee;
				}

				var m = addVideo( { 
							hash: videoId+'_'+(label ? label : ''), 
							url:  url, 
							urlList: list, 
							label: label, 
							videoTitle: videoTitle, 
							ext: ext, 
							initSeg: initSeg,
							options: { bootstrap: paramsBootstrap }
						} );
				//console.log(m);						
				
				parsedMediaList.push(m);
				mediaFound = true;

				
				// -----------------------------
				function ReadBoxHeader(arr)	{
					if (!arr || arr.length==0) return;
					if (!pos) pos = 0;
					boxSize = GetThemAll.jspack.ReadInt32(arr, pos);
					boxType = GetThemAll.jspack.bytesToString(arr.slice(pos + 4, pos + 8));
					
					if (boxSize == 1)	{
					  boxSize = GetThemAll.jspack.ReadInt64(arr, pos + 8) - 16;
					  pos += 16;
					}
					else  {
					  boxSize -= 8;
					  pos += 8;
					}
					if (boxSize <= 0) boxSize = 0;
				}

				// -----------------------------
				function ParseBootstrapBox(str)  {
					
					if ( !str || str.length==0) return;
						
					paramsBootstrap.version          = GetThemAll.jspack.ReadByte(str, pos);
					paramsBootstrap.flags            = GetThemAll.jspack.ReadInt24(str, pos + 1);
					paramsBootstrap.bootstrapVersion = GetThemAll.jspack.ReadInt32(str, pos + 4);
					var bt               = GetThemAll.jspack.ReadByte(str, pos + 8);
					paramsBootstrap.profile          = (bt & 0xC0) >> 6;
					
					if ((bt & 0x20) >> 5)  {
						paramsBootstrap.live     = true;
						paramsBootstrap.metadata = false;
					}
					paramsBootstrap.update = (bt & 0x10) >> 4;
					if (!paramsBootstrap.update)  {
						paramsBootstrap.segTable  = [];
						paramsBootstrap.fragTable = [];
					}
					paramsBootstrap.timescale           = GetThemAll.jspack.ReadInt32(str, pos + 9);
					paramsBootstrap.currentMediaTime    = GetThemAll.jspack.ReadInt64(str, pos + 13);
					paramsBootstrap.smpteTimeCodeOffset = GetThemAll.jspack.ReadInt64(str, pos + 21);
					pos += 29;
					var x = GetThemAll.jspack.ReadString(str, pos);
					paramsBootstrap.movieIdentifier = x.str;
					pos = x.pos;	
					paramsBootstrap.serverEntryCount = GetThemAll.jspack.ReadByte(str, pos++);
					
					paramsBootstrap.serverEntryTable = [];
					for (var i = 0; i<paramsBootstrap.serverEntryCount; i++)  {
						var x =  GetThemAll.jspack.ReadString(str, pos);
						pos = x.pos;
						paramsBootstrap.serverEntryTable.push(x.str)
					}	
					
					paramsBootstrap.qualityEntryCount = GetThemAll.jspack.ReadByte(str, pos++);
					paramsBootstrap.qualityEntryTable = [];
					for (var i=0; i<paramsBootstrap.qualityEntryCount; i++) {
						var x =  GetThemAll.jspack.ReadString(str, pos);
						pos = x.pos;
						paramsBootstrap.qualityEntryTable.push(x.str);
					}	
					
					var x =  GetThemAll.jspack.ReadString(str, pos);
					pos = x.pos;
					paramsBootstrap.drmData = x.str;
					
					var x =  GetThemAll.jspack.ReadString(str, pos);
					pos = x.pos;
					paramsBootstrap.metadata = x.str;
          
					paramsBootstrap.segRunTableCount = GetThemAll.jspack.ReadByte(str, pos++);
					
					paramsBootstrap.segTable         = [];
					for (var i=0; i<paramsBootstrap.segRunTableCount; i++)     {
						ReadBoxHeader(str);
						if (boxType == "asrt") {
							paramsBootstrap.segTable =  ParseAsrtBox(str, pos);
						}	
						pos += boxSize;
					}
					
					paramsBootstrap.fragRunTableCount = GetThemAll.jspack.ReadByte(str, pos++);
					paramsBootstrap.fragTable         = [];
					for (var i=0; i<paramsBootstrap.fragRunTableCount; i++)  {
						ReadBoxHeader(str);
						if (boxType == "afrt") {
							paramsBootstrap.fragTable = ParseAfrtBox(str, pos);
						}	
						pos += boxSize;
					}
					
					ParseSegAndFragTable();
				
					//console.log(paramsBootstrap);         
				}
				
				// -----------------------------
				function ParseAsrtBox(asrt, pos)	{
					
					if ( !asrt || asrt.length==0) return;
					
					var segTable          = [];
					var version           = GetThemAll.jspack.ReadByte(asrt, pos);
					var flags             = GetThemAll.jspack.ReadInt24(asrt, pos + 1);
					var qualityEntryCount = GetThemAll.jspack.ReadByte(asrt, pos + 4);
					
					pos += 5;
					var qualitySegmentUrlModifiers = [];
					for (var i=0; i<qualityEntryCount; i++) {
						var x =  GetThemAll.jspack.ReadString(asrt, pos);
						pos = x.pos;
						qualitySegmentUrlModifiers.push( x.str );
					}
					
					var segCount = GetThemAll.jspack.ReadInt32(asrt, pos);
					
					pos += 4;
				    for (var i=0; i<segCount; i++)  {
						var firstSegment = GetThemAll.jspack.ReadInt32(asrt, pos);
						var fragmentsPerSegment = GetThemAll.jspack.ReadInt32(asrt, pos + 4);
						segTable.push({  firstSegment: firstSegment,
										 fragmentsPerSegment: fragmentsPerSegment,
									  });
						pos += 8;
					}
					
					return segTable;  
				}
				// -----------------------------
				function ParseAfrtBox(afrt, pos)		{
					
					if ( !afrt || afrt.length==0 ) return;
					
					var fragTable         = [];
					var version           = GetThemAll.jspack.ReadByte(afrt, pos);
					var flags             = GetThemAll.jspack.ReadInt24(afrt, pos + 1);
					var timescale         = GetThemAll.jspack.ReadInt32(afrt, pos + 4);
					var qualityEntryCount = GetThemAll.jspack.ReadByte(afrt, pos + 8);
					pos += 9;
					
					var qualitySegmentUrlModifiers = [];
					for (var i=0; i<qualityEntryCount; i++) {
						var x =  GetThemAll.jspack.ReadString(afrt, pos);
						pos = x.pos;
						qualitySegmentUrlModifiers.push( x.str );
					}
					
					var fragEntries = GetThemAll.jspack.ReadInt32(afrt, pos);
					pos += 4;
					
					for (var i = 0; i<fragEntries; i++)	{
						var firstFragment = GetThemAll.jspack.ReadInt32(afrt, pos);
						var firstFragmentTimestamp = GetThemAll.jspack.ReadInt64(afrt, pos + 4);
						var fragmentDuration       = GetThemAll.jspack.ReadInt32(afrt, pos + 12);
						var discontinuityIndicator = "";
						
						pos += 16;
						
						if (fragmentDuration == 0)		discontinuityIndicator = GetThemAll.jspack.ReadByte(afrt, pos++);
						
						fragTable.push({  firstFragment: firstFragment,
										  firstFragmentTimestamp: parseInt(firstFragmentTimestamp),
										  fragmentDuration: fragmentDuration,
										  discontinuityIndicator: discontinuityIndicator  });
					}
					  
				    return fragTable;
				}
				
				// -----------------------------			
				function ParseSegAndFragTable()  {
					
					var firstSegment  = paramsBootstrap.segTable[0];
					var lastSegment   = paramsBootstrap.segTable[paramsBootstrap.segTable.length-1];

					var firstFragment = paramsBootstrap.fragTable[0];
					var lastFragment  = paramsBootstrap.fragTable[paramsBootstrap.fragTable.length-1];

					if (lastFragment['fragmentDuration'] == 0 && lastFragment['discontinuityIndicator'] == 0)   {
						paramsBootstrap.live = false;
						paramsBootstrap.fragTable.pop();
						lastFragment  = paramsBootstrap.fragTable[paramsBootstrap.fragTable.length-1];
					}

					var invalidFragCount = false;
					var prev = paramsBootstrap.segTable[0];
					paramsBootstrap.fragCount  = prev['fragmentsPerSegment'];
					for (var i=1; i<paramsBootstrap.segTable.length; i++) {
						paramsBootstrap.fragCount += (paramsBootstrap.segTable[i]['firstSegment'] - paramsBootstrap.segTable[i-1]['firstSegment'] - 1) * paramsBootstrap.segTable[i-1]['fragmentsPerSegment'];
						paramsBootstrap.fragCount += paramsBootstrap.segTable[i]['fragmentsPerSegment'];
					}	
					if (!(paramsBootstrap.fragCount & 0x80000000))  {
						paramsBootstrap.fragCount += firstFragment['firstFragment'] - 1;
					}  
					if (paramsBootstrap.fragCount & 0x80000000)    {
						paramsBootstrap.fragCount  = 0;
						var invalidFragCount = true;
					}
					if (paramsBootstrap.fragCount < lastFragment['firstFragment'])   { 
						paramsBootstrap.fragCount = lastFragment['firstFragment'];
					}	  
		            
					if (paramsBootstrap.live)  {
						paramsBootstrap.segStart = lastSegment['firstSegment'];
					}	
					else  {
						paramsBootstrap.segStart = firstSegment['firstSegment'];
					}
					if (paramsBootstrap.segStart < 1) {
						paramsBootstrap.segStart = 1;
					}

					if (paramsBootstrap.live && !invalidFragCount) {
						paramsBootstrap.fragStart = paramsBootstrap.fragCount - 2;
					}	
					else  {
						paramsBootstrap.fragStart = firstFragment['firstFragment'] - 1;
					}	
					if (paramsBootstrap.fragStart < 0) {
						paramsBootstrap.fragStart = 0;
					}	

				}	
				
				// -----------------------------			
				function GetSegmentFromFragment(fragNum)		{
					
					var firstSegment  = paramsBootstrap.segTable[0];
					var lastSegment   = paramsBootstrap.segTable[paramsBootstrap.segTable.length-1];

					var firstFragment = paramsBootstrap.fragTable[0];
					var lastFragment  = paramsBootstrap.fragTable[paramsBootstrap.fragTable.length-1];
					
					if (paramsBootstrap.segTable.length == 1) {
						return firstSegment['firstSegment'];
					}	
					else {
						var prev  = firstSegment['firstSegment'];
						var start = firstFragment['firstFragment'];
						for (var i = firstSegment['firstSegment']; i <= lastSegment['firstSegment']; i++)  {
							if (paramsBootstrap.segTable[i]) {
								var seg = paramsBootstrap.segTable[i];
							}	  
							else {
								var seg = prev;
							}	
							var end = start + seg['fragmentsPerSegment'];
							if ( fragNum >= start && fragNum < end) {
								return i;
							}	  
							prev  = seg;
							start = end;
						}
					}
					return lastSegment['firstSegment'];
				}
				
				// -----------------------------			
				function WriteMetadata(meta, $f4f, $flv)		{
					if (meta)	{
						
						var flvHeader = [0x46, 0x4c, 0x56, 0x01, 0x05, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x00];
						var flvHeaderLen = flvHeader.length;
						var tagHeaderLen = 11;
						var prevTagSize = 4;
						var metadataSize = meta.length;
						metadata = [];
						
						GetThemAll.jspack.WriteByte(metadata, 0, 0x12);
						GetThemAll.jspack.WriteInt24(metadata, 1, metadataSize);
						GetThemAll.jspack.WriteInt24(metadata, 4, 0);
						GetThemAll.jspack.WriteInt32(metadata, 7, 0);
						
						for (var i=0; i<metadataSize; i++)  metadata.push(meta[i]);
						
						GetThemAll.jspack.WriteByte(metadata, tagHeaderLen + metadataSize - 1, 0x09);
						GetThemAll.jspack.WriteInt32(metadata, tagHeaderLen + metadataSize, tagHeaderLen + metadataSize);
						
						for (var i=flvHeaderLen-1; i>=0; i--)	metadata.unshift(flvHeader[i]);  
						
						metadata.length = flvHeaderLen + tagHeaderLen + metadataSize + prevTagSize;
						
						return GetThemAll.jspack.bytesToString(metadata);
					}
				    return false;
				}
			
			}	
			
			// -----------------------------------------------------------
			
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
		function addVideo( params ){
			
			var fileName = params.label;
			var ff = GetThemAll.Utils.extractPath( params.url );
			if (ff) {
				fileName = (params.label ? params.label+'_' : '')+ff.name;
			}					
			else {
				fileName = (params.label ? '['+params.label+'] ' : '')+params.videoTitle;	
			}	
			
			var m = {
					videoId:		params.hash,
					url:			params.url,
					playlist: 		params.urlList,
					initSeg:		params.initSeg,
				
					title: 			params.videoTitle,
					format: 		params.label,
					quality: 		params.label,
					displayName: 	(params.label ? '['+params.label+'] ' : '')+params.videoTitle,
					downloadName: 	(params.label ? '['+params.label+'] ' : '')+params.videoTitle,
					ext: 			params.ext,
					status: 		"stop",
					hash: 			params.hash,
					
					filename: 		fileName,
					size: 			0,
					type: 			"video",
					metod: 			"stream",
					source:			'MediaManifest',
					dwnl:			1,
					
					params:			params.options,	
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
					
					compiledManifest( data, function( mediaToSave, videoId )  {
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
	
	this.MediaManifest = new MediaManifest();
	
}).apply( GetThemAll.Media );
