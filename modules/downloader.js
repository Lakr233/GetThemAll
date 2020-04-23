if (window == chrome.extension.getBackgroundPage()) {
	
	(function(){
	
		var Downloader = function(){		
		
			var self = this;
		
			var error;
			
			var listDownload = {};
			
			// -------------------------------------------------------------------
			this.start = function( id, url, fileName,  callback ){
				
				console.log('Downloader.start', id, url, fileName);
				
				try	{
					chrome.downloads.download({
											url:  url,
											filename: fileName,
											saveAs: true 
											},
											function (downloadId) {
												console.log('DOWNLOAD: ', downloadId );
												
												listDownload[downloadId] = id;
												
												sendMessage( downloadId, 'start' );
												
												callback( false, downloadId );
											}		
										);
				}
				catch(err)	{
					error = err.name + ' ' + err.message;
					callback(true);
				}
				
				
			}
			
			// -------------------------------------------------------------------
			this.stop = function( downloadId, callback ){
				
				console.log('Downloader.stop', downloadId);
				
				try		{
					chrome.downloads.cancel( downloadId, function(){
						sendMessage( downloadId, 'stop' );
						callback( false )
					});
				}
				catch(err)	{
					error = err.name + ' ' + err.message;
					sendMessage( downloadId, 'stop' );
					callback( true );
				}
				
			}
			
			// -------------------------------------------------------------------
			this.getError = function( ){
			
				if(error !== "")
				{
					return error;
				}
				else
				{
					return "No Error!";	
				}
			}

			// -------------------------------------------------------------------
			this.state = function( callback ){
				
				try		{
					chrome.downloads.search({}, function(items) {
						
						var list = [];
						
						items.forEach(function(item) {
 	      
							if (item.state == 'in_progress') {
								if (item.totalBytes) {
									list.push( item );
									list[list.length-1].mediaId = listDownload[item.id];
								} 
							} 
						});
						
						callback(list);
					});					
					
				}
				catch(err)	{
					error = err.name + ' ' + err.message;
					callback( true );
				}
				
			}
			
			// -------------------------------------------------------------------
			function sendMessage( downloadId, state, size, progress ){

				if (downloadId in listDownload) {
					var id = listDownload[downloadId];
					var media = GetThemAll.Media.Storage.getDataForId(id);
				
					if (media) {
			
						if (state == 'start') {
							GetThemAll.Media.Storage.setData_Attribute(media.tabId, media.id, "downloadId", downloadId);
						}
						else if (state == 'stop') {
							GetThemAll.Media.Storage.setData_Attribute(media.tabId, media.id, "status", 'stop');		
						}
						else if (state == 'progress') {
							GetThemAll.Media.Storage.setData_Attribute(media.tabId, media.id, "progress", {progres: progress, progressByte:size} );		
						}
						
 						chrome.extension.sendMessage( {
													subject: 	"mediaDownloadState",
													id: media.id,
													status:		state,
													size:		size,
													progress:	progress,
												} ); 
						
					}	
				}	
			}
			
			// -------------------------------------------------------------------
			function onChanged( downloadDelta ){
				
				var downloadId = downloadDelta.id;
				
				if ( downloadDelta.state ) {
					if ( downloadDelta.state.current == "complete" || 
					     downloadDelta.state.current == "interrupted")  {
							 
							sendMessage( downloadId, 'stop' ); 
						
							delete listDownload[downloadId];						
					}
				}
				
			}
			
			// -------------------------------------------------------------------
			function checkStateDownloads(  ){
				self.state( function( list ){  
					for (var i=0; i<list.length; i++) {
						sendMessage( list[i].id, 'progress', list[i].bytesReceived, Math.round( 100 * list[i].bytesReceived / list[i].totalBytes ) );
					}
				});
			}
			
			// -------------------------------------------------------------------
			chrome.downloads.onChanged.addListener( onChanged );
			
			setInterval(function(){ 
			
				if ( Object.keys( listDownload ).length > 0 )  checkStateDownloads();
				
			}, 1500);
			// -------------------------------------------------------------------
			
		}
		
		this.Downloader = new Downloader();
		
	}).apply(GetThemAll);
}
else{
	GetThemAll.Downloader = chrome.extension.getBackgroundPage().GetThemAll.Downloader;
}

