if (window == chrome.extension.getBackgroundPage()) {

	(function(){
	
		var Media = function(){

			var self = this;

			var _onMediaForTabUpdateListeners = [];
			
			this.scaleZoom = 1;
			this.widthWin = 0;
			this.localUser = 'en';
			
			this.isDownload = false;
			this.countDownload = 0;
			this.totalDownload = 0;
			
			var textFile = null;
			
			this.fileSys = null;
			
			const DETECT_MODULES = ["Sniffer", "Youtube", "Vimeo", "DailyMotion", "VKontakte", "BreakCom", "MediaStream", "MediaManifest", "Twitch", "FaceBook", "SitePage"];
			
			// ===============================================================
			this.init = function(){
				
				this.initFileSystem();
				
				this.Storage.onMediaRemove.addListener(function( tabId ) {

							console.log( "REMOVE ITEM " + tabId );
					
							_onMediaForTabUpdateListeners.forEach(function(listener) {
						
										try
										{
											listener(tabId);							
										}
										catch( ex ){			}
						
									});
				
						});
				
				
				const removeChars = /[\\\/:*?"<>|"']/g;
												
				function mediaDetectListener(m){
					
					if ( !m ) return;
					
					var media = null;
					
					function f(m) {

						if (!m.url) return null;

						if ( m.filename ) {
							m.filename = m.filename.replace(removeChars, "")
												   .replace(/^\.+/, "").replace(/\.+$/, "") 
												   .trim();
						}	
						if ( m.downloadName ) {
							m.downloadName = m.downloadName.replace(removeChars, "")
														   .replace(/^\.+/, "").replace(/\.+$/, "") 
														   .trim();
						}	
						
						// имя отображения
						var displayName = m.displayName ? m.displayName : m.downloadName;
						if ( !_b(GetThemAll.Prefs.get( "gta.original_filename" )) && m.ext == "swf")	{							
							if (m.filename) displayName = m.filename;	
						}
						if (displayName && displayName.length > 50) displayName = displayName.substr(0,50)+"...";

						// имя файла	
						if ( !m.filename ) {
							var ff = GetThemAll.Utils.extractPath( m.url );
							if (ff) {
								if (!m.ext) m.ext = ff.ext;
								m.filename = ff.name;
							}					
						}	
						
						var mm = {	tabId:			m.tabId,
									frameId:		m.frameId,
									groupId:		m.groupId ? m.groupId : 0,
									orderField:		m.orderField ? m.orderField : new Date().getTime(),
									priority:		m.priority,
						
									url:			m.url,
									downloadName:	m.downloadName,
									displayName:	displayName,
									format:			m.format,
									quality:		m.quality ? m.quality : null,
									title:			m.title,
									filename:		m.filename,
									ext:			m.ext,

									playlist:		m.playlist ? m.playlist : null,
									initSeg:		m.initSeg ? m.initSeg : null,
									videoId:		m.videoId ? m.videoId : null,
									status:			m.status ? m.status : 'stop',
									hash:			m.hash ? m.hash : hex_md5(m.url),
									
									metod:			m.metod ? m.metod : "download",
									size:			m.size,
									source:			m.source,
									type:			m.type,
									dwnl:			m.dwnl ? m.dwnl : 1,
									vubor:			0,
								}
						if ( m.params )  mm.params = m.params;		
						if ( m.parseUrl )  mm.parseUrl = m.parseUrl;		
								
						return mm;		
					}	

			
					var tabId = null;
					
					GetThemAll.Utils.Async.chain ( [
							function( chainCallback ){	// преобразуем
										if( m.length )	{							
											media = [];
											m.forEach(function( item ) {
															var ff = f(item);
															if (ff) media.push(ff);							
														});
										}
										else  {							
											var ff = f(m);
											if (!ff) return;
											media = ff;
										}
										chainCallback();
									},
					
							function() {
							
										if (media)	{	
											if( media.length )	{							
							
												media.forEach(function( item ) {
																tabId = item.tabId;
																self.Storage.addItemForTab(item.tabId, item);							
															});
											}
											else	{							
												tabId = media.tabId;
												self.Storage.addItemForTab(media.tabId, media);
											}
				
											chrome.extension.sendMessage( {
																		subject: "mediaForTabUpdate",
																		data: tabId
																	} );
				
											_onMediaForTabUpdateListeners.forEach(function(listener){
							
															try	{
																listener(tabId);							
															}
															catch( ex ){	}
							
														});
										}
									}] );
					
				};
				
				// --------------------------- Sniffer, Youtube
				DETECT_MODULES.forEach( function( module ){
				
					if( self[module] )	{
						self[module].onMediaDetect.addListener(mediaDetectListener);						
					}
					
				});
				
				// --------------------------- 
				chrome.tabs.onRemoved.addListener( function( tabId ){
				
							if( GetThemAll.Media.Storage.hasDataForTab( tabId ) )	{
								GetThemAll.Media.Storage.removeTabData( tabId );
						
								_onMediaForTabUpdateListeners.forEach(function( listener ){
												listener( tabId );
											});
							}
						} );
				
				// --------------------------- 
				chrome.tabs.onUpdated.addListener( function( tabId, changeInfo ){
				
							if( changeInfo.url )	{
								if( GetThemAll.Media.Storage.hasDataForTab( tabId ) )	{
									
									GetThemAll.Media.Storage.removeTabData( tabId );
								
									_onMediaForTabUpdateListeners.forEach(function( listener ){
												listener( tabId );
											});
								}
							}
					
						} );
				
				// --------------------------- 
				chrome.extension.onRequest.addListener ( function(request, sender, sendResponse) {        
				
									if(request.command=="getVideoData")	{
										GetThemAll.Utils.getActiveTab( function( tab ) {
													if( tab )	{
														var media = GetThemAll.Media.Storage.getMedia( tab.id );
														sendResponse(media);
													}
												});	
									}
									else if(request.command=="startDownload")	{
										self.startMediaDownload( request.media, true );	
									}
									else if(request.command=="stopDownload")	{
										self.stopMediaDownload( request.media );	
									}
								});
				
				
				chrome.extension.onMessage.addListener( function( request ) {
					
									if( request.subject == "start_download" ) {
										chrome.browserAction.setBadgeText({
										  text: "zip"
										});
										self.isDownload = true;
										self.countDownload = 0;
										self.totalDownload = request.count;
									}	
									else if( request.subject == "finish_download" ) {
										chrome.browserAction.setBadgeText({
										  text: ""
										});
										self.isDownload = false;
									}	
									else if( request.subject == "status_download" ) {
										self.countDownload = request.count;
									}	
								} );
				
			}

			// ===============================================================
			this.initFileSystem = function(){

				function onInitFs(fs) {
					//console.log('Opened file system: ' + fs.name);
					var dirReader = fs.root.createReader();
					var readEntries = function() {
						dirReader.readEntries (function(results) {
							if (results.length>0) {
								results.forEach(function(entry, i) {
									entry.remove(function() {
										console.log('File removed.', entry.fullPath);
									}, self.errorHandler);
								});								
							} 
						}, self.errorHandler);
					  };

					readEntries();
				}	

				window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;				
				var requestedBytes = 1024*1024*1024; 
				navigator.webkitTemporaryStorage.requestQuota(requestedBytes, function(grantedBytes) {
					_grantedBytes = grantedBytes;
					window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, onInitFs, self.errorHandler);
				}, self.errorHandler);				
				
			}
			
			// -------------------------------------------------------------------
			this.errorHandler = function(e){
				
				console.log(e);
				var msg = '';

				switch (e.code) {
					case FileError.QUOTA_EXCEEDED_ERR:
					  msg = 'QUOTA_EXCEEDED_ERR';
					  break;
					case FileError.NOT_FOUND_ERR:
					  msg = 'NOT_FOUND_ERR';
					  break;
					case FileError.SECURITY_ERR:
					  msg = 'SECURITY_ERR';
					  break;
					case FileError.INVALID_MODIFICATION_ERR:
					  msg = 'INVALID_MODIFICATION_ERR';
					  break;
					case FileError.INVALID_STATE_ERR:
					  msg = 'INVALID_STATE_ERR';
					  break;
					default:
					  msg = 'Unknown Error';
					  break;
				};

				console.log('Error: ' + msg);
			}
			
			// ----------------------------------------------
			this.display_setting = function(){
				chrome.tabs.query( 	{
								url: chrome.extension.getURL( "/options.html" )
							}, function( tabs ){

									if( tabs.length > 0 )
									{
										foundTabId = tabs[0].id;
										chrome.tabs.update( foundTabId, {
																		active: true
																		} );
									}
									else
									{
										chrome.tabs.create( {	active: true,
																url: chrome.extension.getURL("/options.html")
															}, function( tab ){ }
														);
									}
						} );
			}

			// ===============================================================
			this.stopListDownload = function( listMedia, count ){

				var m = _b(GetThemAll.Prefs.get( "gta.download_zip" ));
				if (m) {
					GetThemAll.DownloaderZIP.stop( function()	{ 
					
					});
				}
			}	
			
			// ===============================================================
			this.clickOneDownload = function( media, tab ){

				console.log('clickOneDownload', media.status, media);			
				if ( media.status == 'start' ) {
					self.stopMediaDownload( media, true );							
				}
				else {	
					self.startMediaDownload( media, true );							
				}	

			}	
			
			// ===============================================================
			this.startListDownload = function( listMedia, title ){
				
				var removeChars = /[\\\/:*?"<>|"']/g;
				title = title.replace(removeChars, "");
				
				var m = _b(GetThemAll.Prefs.get( "gta.download_zip" ));
				var t = _b(GetThemAll.Prefs.get( "gta.original_filename" ));
				
 				if (listMedia.length==1) {
					self.startMediaDownload( listMedia[0], t );							
				}
				else if (!m) {
					listMedia.forEach( function( item ){
								self.startMediaDownload( item, t );							
							});
				}	
				else { 
					GetThemAll.Utils.getActiveTab(function( tab ){
						GetThemAll.DownloaderZIP.start( {	
														list: 	listMedia,	
														title:	title,
														tabId:	tab.id,
														metod:  t
												 }, function(url, fileName)	{ 

												saveDownloadZip(url, fileName+'.zip')	
												
						});									   
					});
					
				}	
					
			}	
			
			// ===============================================================
			function saveDownloadZip(url, filename)	{ 	
			
				try {
					chrome.downloads.download({
											url: url,
											filename:  filename,
											},
											function (downloadId) {
												console.log('DOWNLOAD ZIP', downloadId );
											}		
										);
					
				}
				catch(e) {
					console.log(e);	
				}	
				
			}	
			
			// ===============================================================
			this.stopMediaDownload = function( media, metod ){

				if ( media.metod == 'stream' ) {
					self.stopDownloadStream( media.hash );	
				}
				else if ( media.metod == 'record' ) {
					self.stopRecordTwitch( media.hash );	
				}
				else {
					self.stopDownload( media );
				}	

			}	
			
			// ===============================================================
			this.startMediaDownload = function( media, metod ){
				
				console.log(media, metod);

				var flag_download = ('dwnl' in media && media.dwnl) ?  media.dwnl : 1;
				if( flag_download == 1 && !chrome.downloads ) flag_download = 3;

				if (_b(GetThemAll.Prefs.get( "gta.original_filename" ))) metod = false;
				
				var filename = null;
				if (metod) {			
					if (media.title)  filename = media.title;
					if (!filename && media.downloadName) filename = media.downloadName;
				}
				else {								// оригинальное имя файла
					if (media.filename) filename = media.filename;
					if (!filename && media.downloadName)  filename = media.downloadName;
					if (!filename && media.title) filename = media.title;
				}	
				if (!filename) filename='media';
				var ext = (media.ext ? media.ext : null); 
				
				var removeChars = /[\\\/:*?"<>|"']/g;
				filename = filename.replace(removeChars, "");
				
				if ( media.metod == 'stream' ) {
				
					self.startDownloadStream( {	playlist:	media.playlist,
												filename:	filename,
												ext:		ext,
												hash:		media.hash,
												id:			media.id,
												tabId:		media.tabId,
												init:		media.init,
											 } );
				}
				else if ( media.metod == 'record' ) {
				
					self.startRecordTwitch( {	
											playlist:	media.playlist,
											filename:	filename,
											ext:		ext,
											hash:		media.hash,
											id:			media.id,
											tabId:		media.tabId,
											init:		media.init,
										 } );
				}
				else {
					self.startDownload( media, filename, flag_download );
				}	
				
						
			}
			
			// ===============================================================
			this.startDownloadStream = function( params ){
				
				GetThemAll.Streamer.start( params.hash,
							function(rez)	{ 
									if ( rez.msg === 'start' ) {
										GetThemAll.Media.Storage.setStream( rez.hash, { status:'start' } );
										chrome.extension.sendMessage( {	subject: "start_download_streams", id: params.id, streamHash: rez.hash, size: -2	} );
									}	
									else if ( rez.msg === 'cancel' ) {
										GetThemAll.Media.Storage.setStream( rez.hash, { status: 'stop' } );
										chrome.extension.sendMessage( {	subject: "finish_download_streams", id: params.id, streamHash: rez.hash, size: -3	} );
									}
									else if ( rez.msg === 'finish' ) {
										GetThemAll.Media.Storage.setStream( rez.hash, { status: 'stop' } );
										chrome.extension.sendMessage( {	subject: "finish_download_streams", id: params.id, streamHash: rez.hash, size: -3	} );
									}
									else if ( rez.msg === 'playlist' ) {
										chrome.extension.sendMessage( {	subject: "load_download_streams", id: params.id, count: rez.count, streamHash: rez.hash, size: -2 } );
									}	
									else if ( rez.msg === 'load' ) {
										GetThemAll.Media.Storage.setStream( rez.hash, { size: rez.size, progress: rez.progress } );
										chrome.extension.sendMessage( {	subject: "load_download_streams", id: params.id, count: rez.count, streamHash: rez.hash, size: rez.size, progress: rez.progress	} );
									}	
							},									
							function(error, hash, file, count, size, chunk)	{ 
									if(error) {
										console.log(GetThemAll.Streamer.getError());
									}
									else {
										saveDownloadStream(hash, count, size, file, params.filename, params.ext, params.id);
									}	
							}
				);									   
			
			}
			
			// ===============================================================
			this.stopDownloadStream = function( hash ){
				GetThemAll.Streamer.stop( hash );
			}	
			
			// ===============================================================
			function saveDownloadStream(hash, count, size, url, filename, ext, id)	{ 	
			
				filename = filename+(ext ? '.'+ext : '');
				var removeChars = /[\\\/:*?"<>|"']/g;
				filename = filename.replace(removeChars, "");

				var media = GetThemAll.Media.Storage.getDataForHash(hash);
				if (media) {
					try {
						chrome.downloads.download({
												url: url,
												filename:  filename,
												saveAs: true 
												},
												function (downloadId) {
													console.log('DOWNLOAD', downloadId, id );
 													setTimeout( function(){
														GetThemAll.Streamer.remove( hash );	
														chrome.extension.sendMessage( {	subject: "save_download_streams", id: id	} );
													}, 1000);	 
												}		
											);
						
					}
					catch(e) {
						console.log(e);	
					}	
				}
				
			}	

			// ===============================================================
			function saveTSFile(data)	{ 	
				if (textFile !== null) 	{
					window.URL.revokeObjectURL(textFile);
				}
			
				textFile = window.URL.createObjectURL(data);		
				return textFile;
			}
			
			// ===============================================================
			this.startRecordTwitch = function( params ){
				console.log('startRecordTwitch', params)
				GetThemAll.Recorder.start( params.hash, params.playlist,
						function(error, countTSFiles, sizeOfVideo, status)	{ 
							if(error) {
								console.log(GetThemAll.Recorder.getError());
							}
							else  {
								GetThemAll.Media.Storage.setTwitch( params.hash, status, sizeOfVideo );
								chrome.extension.sendMessage( {	subject: "load_download_record", id: params.id, hash: params.hash, count: countTSFiles, size: sizeOfVideo	} );
							}
					}
				);

			}	
			// ===============================================================
			this.stopRecordTwitch = function( hash ){
				console.log('stopRecordTwitch', hash);				
				GetThemAll.Recorder.stop( hash, function(error, file, status)	{ 
						
								if(error) {
									// If true, get error info
									console.log(GetThemAll.Recorder.getError());
								}
								else {
									GetThemAll.Media.Storage.setTwitch( hash, status, null  );
									
									var link_href = saveTSFile(file);
									saveDownloadRecord(hash, link_href);
									console.log(link_href);
								}	
						});

			}	
			
			// ===============================================================
			function saveDownloadRecord(hash, url)	{ 	
			
				var media = GetThemAll.Media.Storage.getDataForHash(hash);

				if (media) {
					var filename;
					if ( _b(GetThemAll.Prefs.get( "gta.original_filename" )) && m.ext == "swf")	{							
						filename = media.filename+'.'+(media.ext ? media.ext : 'mp4');
					}
					else {
						filename = media.downloadName+'.'+(media.ext ? media.ext : 'mp4');
					}
					
					try {
						console.log('DOWNLOAD - api', url, filename);	
						
						chrome.downloads.download({
												url: url,
												filename:  filename,
												saveAs: true 
												},
												function (downloadId) {
													console.log('DOWNLOAD', downloadId );
												}		
											);
					}
					catch(e) {
						console.log(e);	
					}	
				}
				
			}	
			
			// ===============================================================
			this.startDownload = function( media, filename, flag_download ){

				console.log('MEDIA.startDownload: ', media, filename, flag_download);

				filename = filename+(media.ext ? '.'+media.ext : '');
				var removeChars = /[\\\/:*?"<>|"']/g;
				filename = filename.replace(removeChars, "");

				if (flag_download == 1) {							
					var info = { url: 		media.url,  
								 filename:  filename,		
							   };	
							   
					GetThemAll.Downloader.start( media.id, media.url, filename,
							function(error, downloadId)	{ 
							
								if(error) {
									console.log(GetThemAll.Downloader.getError());
								}
								else  {
									
								}
							}
					);
				}				
				else if (flag_download == 2) {	
					chrome.tabs.create({
									url: 	media.url,
									active: false
								});		
				}				
				else if (flag_download == 3) {	
					var info = { url: 			media.url,  
								 downloadName: 	filename,
							   };	

					GetThemAll.Utils.getActiveTab(function( tab ){
								GetThemAll.ContentScriptController.processMessage( tab.id, {
											action: 	"startDownload",
											media: 		info,
										} );
							});
				}				

			}
			
			// ===============================================================
			this.stopDownload = function( media ){
				
				console.log('MEDIA.stopDownload: ', media);
				
				if ( !media ) return;
				
				if (media.downloadId) {
			
					GetThemAll.Downloader.stop( media.downloadId,
							function(error)	{ 
								if(error) {
									console.log(GetThemAll.Downloader.getError());
								}
								else  {
								}
							}
					);
				}
				else {
					GetThemAll.Media.Storage.setData_Attribute(media.tabId, media.id, "status", 'stop');		
				}	

			}
			
			// ===============================================================
			this.SaveLink = function( media, title ){
				
				var text = '';
				if (media.k_link>0) {
					text += '\n\nLINK\n';
					media.link.forEach( function( item ){
						text +=  item.title +'\t \t'+item.url+'\n';
					});
				}			
				if (media.k_image>0) {
					text += '\n\nIMAGE\n';
					media.image.forEach( function( item ){
						text +=  item.title +'\t \t'+item.url+'\n';
					});
				}			
				if (media.k_file>0) {
					text += '\n\nFILE\n';
					media.file.forEach( function( item ){
						text +=  item.title +'\t \t'+item.url+'\n';
					});
				}			
				if (media.k_video>0) {
					text += '\n\nMEDIA\n';
					media.video.forEach( function( item ){
						text +=  item.title +'\t \t'+item.url+'\n';
					});
				}			
				
				var blob = new Blob([text], {type: 'text/plain'});
				var link_href = saveTSFile(blob);

				var filename = title+'.txt';
				var removeChars = /[\\\/:*?"<>|"']/g;
				filename = filename.replace(removeChars, "");
				
				chrome.downloads.download({ url: 		link_href,  
											saveAs: 	true,
											filename:   filename,
										  }, function (downloadId) {
												console.log('DOWNLOAD', downloadId );
										  });

			}
			
			
			
			// ===============================================================
			this.onMediaForTabUpdate = {
				addListener: function(callback){
							if (_onMediaForTabUpdateListeners.indexOf(callback) == -1) 
							{
								_onMediaForTabUpdateListeners.push(callback);
							}
						}
			}
		}
		
		this.Media = new Media();
		
	}).apply(GetThemAll);
	
}
else
{
	GetThemAll.Media = chrome.extension.getBackgroundPage().GetThemAll.Media;
}
