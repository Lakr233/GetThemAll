if (window == chrome.extension.getBackgroundPage()) {
	
	(function(){
	
		var DownloaderZIP = function(){		
		
			var isRun = false;
			var queue = [];
			var callback;
			var error;
			var countFiles = 0;
			var sizeOfFiles = 0;

			var zipFileName = null;
			
			var zipFileEntry;
			var zipWriter;
			var writer;

			var download_tabId = 0;
			
			var statusCreater = 0;
			
			// -------------------------------------------------------------------
			this.start = function( params, cb ){
				
				console.log('DownloaderZIP.start', params);
				
				var listMedia = params.list;
				zipFileName = params.title;
				download_tabId = params.tabId,
				
				callback =cb;
				
				chrome.extension.sendMessage( {	subject: "start_download", count: listMedia.length	} );
				
				queue = []; 
				for (var i=0; i<listMedia.length; i++) {
					
					var filename = null;
					if (params.metod) {			
						if (listMedia[i].title)  filename = listMedia[i].title;
						if (!filename && listMedia[i].downloadName) filename = listMedia[i].downloadName;
					}
					else {								// оригинальное имя файла
						if (listMedia[i].fileName)      filename = listMedia[i].fileName;
						if (listMedia[i].downloadName)	filename = listMedia[i].downloadName; 
						if (!filename && listMedia[i].title)  filename = listMedia[i].title;
					}	
					var ext = (listMedia[i].ext ? listMedia[i].ext : null); 
					
					queue.push( {	name:	unique_title( filename+(ext ? '.'+ext : ''), ext ),
									url:	listMedia[i].url,
									ext:	listMedia[i].ext,	
									id:		listMedia[i].id,
									source: listMedia[i].source,
									hash: 	listMedia[i].yt_hash,
									status:	0,								
							  } ); 
							  
					if (!zipFileName)	 zipFileName = listMedia[i].downloadName;	  
				}
				
				console.log(zipFileName, queue);
				
				isRun = true;
				countFiles = 0;
				sizeOfFiles = 0;
				
				create(1, function(){
					
					GetThemAll.Utils.Async.arrayProcess( queue, function( media, apCallback ){

										if ( media.source == 'MediaStream' ) {
											loadStreamFile(media, function(){
												
												apCallback();		
											});
										}
										else {	
											loadFile(media, function(){
												
												apCallback();		
											});
										}	
										
											
								}, function(){
							} 
					 );
					
				});
				
				
			}
			
			// -------------------------------------------------------------------
			this.stop = function( id, callback ){
				
				console.log('DownloaderZIP.stop', id);
				
				try		{
					isRun = false;
					finish();
				}
				catch(err)	{
				}
				
			}

			// -------------------------------------------------------------------
			function create( status, callback ){
				
				if (statusCreater == 99) return;		

				if (status == 1) {		
					statusCreater = 99;
					createZipWriter( function() {			
						statusCreater = 2;			
						console.log('---createZipWriter---');
						callback();
					});
				}	
				else if (status == 11) {		
					check_queue( function(){			
						
						zipFiles(function(url) {
							statusCreater = 12;			
							callback(url);
						});
						
					});
				}
				else if (status == 5) {		

					check_queue( function(){
						callback();
					});
				}
			}	

			// -------------------------------------------------------------------
			function check_queue( callback ){
				
				if (statusCreater < 2 || statusCreater == 99)  return;
				
				statusCreater = 99;
				
				GetThemAll.Utils.Async.arrayProcess( queue, function( q, apCallback ){
					
									if (q.status == 1) {
										addFiles(q.name, q.blob, function(){
											q.status = 2;
											q.blob = null;
											apCallback();		
										});
									}
									else {	
										apCallback();		
									}	
									
										
							}, function(){
								
								statusCreater = 2;
								callback();
						    } 
				 );
			}	
			
			// -------------------------------------------------------------------
			function finish( ){
			
				console.log('finish', queue);

				chrome.extension.sendMessage( {	subject: "finish_download",	} );
			
				var i = 0;
				while(statusCreater != 99)	{
					i++;
					if (i>100000) break;
				}
			
				create(11, function(url){
					
					console.log('=ZIP=',zipFileName,url);	
					
					clear_attr_zip();
					
					queue = [];
					download_tabId = 0;
					
					callback(url, zipFileName);
					
				});
			
			}
			
			// -------------------------------------------------------------------
			function clear_attr_zip()  {
			
				for (var i=0; i<queue.length; i++) {
					
					GetThemAll.Media.Storage.setData_Attribute( download_tabId, queue[i].id, "zip", 0 );
				}	
			
			}
			
			// -------------------------------------------------------------------
			function parse_title( title ){

				var p = title.split('.');
				
				var k = p.length;
				if (k<2) return { name: title, ext: '' };
				
				var ext = p.pop();
				return { name: p.join('.'), ext: ext };
			}	
			
			// -------------------------------------------------------------------
			function find_queue_title( title ){
				
				for (var i=0; i<queue.length; i++) {
					if (queue[i].name == title)   return true;
				}	
				return false;	
			}	
			
			// -------------------------------------------------------------------
			function unique_title( title, ext ){
				
				if (title == '') title = 'noname'+(ext ? ext : '');
				
				var t = parse_title( title );
				if (!t.ext) t.ext = (ext ? ext : '')
				
				for (var i=0; i<100000; i++) {
			
					if (i > 0) 	path = t.name + "("+i+")" + '.' + t.ext;
					else		path = title;
					
					if ( !find_queue_title( path ) )  return path;
					
				}
			}	
			
			// -------------------------------------------------------------------
			this.getError = function( ){
			
				if(error !== "")	{
					return error;
				}
				else  {
					return "No Error!";	
				}
			}

			// -------------------------------------------------------------------
			function loadFile(media, callback)  {
				//console.log ( 'loadFile',media );
				try 	{
					if (isRun)	{
						
						httpRequest = new XMLHttpRequest(); 
						httpRequest.open ("GET", media.url, true);
						httpRequest.responseType = 'blob';	
						httpRequest.onload = OnLoadFile;
						httpRequest.onerror = OnErrorFile;
						httpRequest.media_id = media.id;
						httpRequest.send();
						
						chrome.extension.sendMessage( {	subject: 	"load_zip_download",	
														id:			media.id,	
													 } );
														 
						GetThemAll.Media.Storage.setData_Attribute( download_tabId, media.id, "zip", 1 );
						
						callback();
					}
				}
				catch(err)	{
					isRun=false;
					callback();
				}
			}
			
			// -------------------------------------------------------------------
			function loadStreamFile(media, callback)  {
				//console.log ( 'loadStreamFile',media );
				try 	{
					if (isRun)	{
						
						chrome.extension.sendMessage( {	subject: 	"load_zip_download",	
														id:			media.id,	
													 } );
														 
						GetThemAll.Media.Storage.setData_Attribute( download_tabId, media.id, "zip", 1 );
						
						GetThemAll.DownloadStreams.start( {	hash:		media.hash,
															playlist: 	media.url,	
															filename:	media.name,
															ext:		media.ext,
															id:			media.id,
														  }, 
							 function(type, hash, data)	{ 
								console.log('== '+type+' ==', hash, data);
								if ( type === 'start' ) {
									GetThemAll.Media.Storage.setStream( hash, 'start', null );
									chrome.extension.sendMessage( {	subject: "start_download_streams", id: data.id	} );
								}	
								else if ( type === 'finish' ) {
									GetThemAll.Media.Storage.setStream( hash, null, data.size );
									chrome.extension.sendMessage( {	subject: "finish_download_streams", id: data.id	} );
								}
								else if ( type === 'playlist' ) {
									chrome.extension.sendMessage( {	subject: "load_download_streams", id: data.id, count: data.count } );
								}	
								else if ( type === 'load' ) {
									chrome.extension.sendMessage( {	subject: "load_download_streams", id: data.id, count: data.count	} );
								}	
								
							 },									
							 function(error, hash, file, count, size)	{ 
								if ( !error ) {
									for (var i=0; i<queue.length; i++) {
										if (queue[i].id == media.id && queue[i].status == 0) {
											queue[i].status = 1;
											queue[i].blob = file;
											
											countFiles++;
											sizeOfFiles += size;
											
											end_loadFile( media.id );
										}
									}	
									
								}				   
							}
						);									   
						
						
						callback();
					}
				}
				catch(err)	{
					isRun=false;
					callback();
				}
			}
			
			// -------------------------------------------------------------------
			function OnErrorFile () {

				console.log(this);
			}	
			
			// -------------------------------------------------------------------
			function OnLoadFile () {
				if (!isRun) return;
				if (this.status == 200) {
					var blob = this.response;
				
					var id = this.media_id;
					for (var i=0; i<queue.length; i++) {
						if (queue[i].id == id && queue[i].status == 0) {
							queue[i].status = 1;
							var blob = this.response;								
							queue[i].blob = blob;
							
							countFiles++;
							sizeOfFiles += blob.size;
							
							end_loadFile( id );
						}
					}	
					
			    }
				else if (this.status == 404) { 				
					var id = this.media_id;
					for (var i=0; i<queue.length; i++) {
						if (queue[i].id == id) {
							queue[i].status = 3;
							countFiles++;
							
							end_loadFile( id );
							
							return;
						}
					}	
				}
			}
			
			// ---------------------------------------------------------------
			function end_loadFile( id ) {

				chrome.extension.sendMessage( {	subject: 	"status_download",	
												count:		countFiles,	
												size:		sizeOfFiles,
												id:			id,
											 } );
											 
				GetThemAll.Media.Storage.setData_Attribute( download_tabId, id, "zip", 2 );
				
				create(5, function(){ 
				
					var fl = true;
					for (var i=0; i<queue.length; i++) {
						if (queue[i].status == 0) fl = false;	
					}	

					if (fl)  finish();	
					return;
				});

			}	
			
			// ---------------------------------------------------------------
			function createZipWriter( callback ) {

				console.log('createZipWriter' );
			
				writer = new zip.BlobWriter();

				zip.createWriter(writer, function(writer) {
					zipWriter = writer;
					callback();
				}, onerror, true);
			}
			
			// ---------------------------------------------------------------
			function addFiles(fileName, fileBlob, callback) {
				
				console.log('addFiles', fileName );
				
				if (zipWriter) {
					zipWriter.add(fileName, new zip.BlobReader(fileBlob), function() {
						callback();
					}, onprogress);
				}	
				else {
					console.log('ERROR: addFiles: no zipWriter:', zipWriter);
				} 
			}

			// ---------------------------------------------------------------
			function zipFiles(callback) {  

				zipWriter.close(function(blob) {
					var blobURL = window.URL.createObjectURL(blob);
					callback(blobURL);
					zipWriter = null;
				});
			
			}
			
			
			// ---------------------------------------------------------------
			function onprogress() {  }
			
			// ---------------------------------------------------------------
			function onerror(message) {
				console.log('ERROR',message);
			}
			
		}
		
		this.DownloaderZIP = new DownloaderZIP();
		
	}).apply(GetThemAll);
}
else{
	GetThemAll.DownloaderZIP = chrome.extension.getBackgroundPage().GetThemAll.DownloaderZIP;
}

