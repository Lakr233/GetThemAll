if (window == chrome.extension.getBackgroundPage()) {
	
	(function(){
		
		// ======================================================================
		var StreamWorker = function(hash) {
			
			const DEBUG = false;
			const MAX_STREAM_DOWNLOAD = 10;
			const MIN_STREAM_DOWNLOAD = 3;
			const LOAD_STREAM_TIMEOUT = 300000;  // 5мин

			var isRun = false,
				isSave = false,
				isEnd = false,
				saveInitSector = true;				
			
			var funcMessage = null;
			var funcFinish = null;
			
			var fileName = "video";

			var countLoad = 0,
				countTSFiles = 0,
				sizeOfVideo = 0,
				startIndex = 0;
			
			var hash, 
				playlist, 
				initSector = null, 
				queue=0,
				file = [];

			var blockStartReadTS = 0;
			var paramsBootstrap = null;
			

			// ---------------------------
			this.start = function(hash, media, onMessage, onFinish) {

				if (DEBUG) console.log('--start--', hash, media);
				
				isRun = true;
				
				funcMessage = onMessage;
				funcFinish = onFinish;
				
				queue = 0;
				hash = media.hash;
				playlist = media.playlist;
				initSector = media.initSeg;
				paramsBootstrap = media.params && media.params.bootstrap ? media.params.bootstrap : null;
				
				fileName = "video_"+hash;
				
				createFile(function(){
				
					if ( typeof playlist == 'object' ) {
						
						for(var j = 0; j < playlist.length; j++)  {
							file.push( { index: j,
										 url: playlist[j], 
										 state: 0,	
										 stream:  null } );
						}	

						if (DEBUG) console.log( 'File: ', file.length, file );

						funcMessage({'msg': 'playlist', 'hash': hash, 'countTSFiles':countTSFiles});
						
						load( );
					}
					else {	
						loadPlayListFile(playlist, function(listFile){

							for(var j = 0; j < listFile.length; j++)  {
								file.push( { index: j,
											 url: listFile[j],	   
											 state: 0,
											 stream:  null } );
							}	
							
							if (DEBUG) console.log( 'File: ', file.length, file );

							funcMessage({'msg': 'playlist', 'hash': hash, 'countTSFiles':countTSFiles});

							load( );
						}); 
					}
				
				});
					  
			};

			// ---------------------------
			this.stop = function() {

				if (DEBUG) console.log( 'STREAMER.stop' );
				
				isRun = false;
					
			};
		
			// -------------------------------------------------------------------
			function load( ){
				
				if (DEBUG) console.log( 'load', queue );

				if ( queue < MIN_STREAM_DOWNLOAD && blockStartReadTS == 0) {
				
					countTSFiles = file.length;

					blockStartReadTS = 1;
					
					for(var i = 0; i < file.length; i++)     	{
						
						if (isRun && file[i].state==0)      	{
							
							loadStreamFile(file[i].url, file[i].index);
							file[i].state = 1;
																
							if (queue >= MAX_STREAM_DOWNLOAD)  {  // очеред заполнили
								blockStartReadTS = 0;
								return;
							}	
						}
					}
				}
			}

			// -------------------------------------------------------------
			function IsRequestSuccessful (httpReq) {
				var success = (httpReq.status == 0 || (httpReq.status >= 200 && httpReq.status < 300) || httpReq.status == 304 || httpReq.status == 1223);
				return success;
			}
			function loadStreamFile(url, index)  {
				if (DEBUG) console.log( 'loadStreamFile: '+index, url );
				try	{
					var httpRequest = new XMLHttpRequest(); 
					file[index].req = httpRequest;					
					
					httpRequest.open ("GET", url, true);
					httpRequest.ind = index;
					httpRequest.responseType = "arraybuffer"; 
					
					httpRequest.onreadystatechange = function() {
							if (httpRequest.readyState==4) {
								if (IsRequestSuccessful (httpRequest)) 	{
									var i = httpRequest.ind;
									
									file[i].req = null;
									clearTimeout( file[i].timer );
									file[i].timer = null;
									
									file[i].state = 2;						
									
									var b = new Uint8Array(httpRequest.response);
									if (paramsBootstrap) {
										file[i].stream = DecodeFragment(b);
									}
									else {
										file[i].stream = b;
									}	
									var x = httpRequest.getResponseHeader("Content-Length");
									sizeOfVideo += parseInt(x);
										
									endLoadStreamFile(false);
								}
								else 	{
									console.log('===============ERROR===================== httpRequest ==========');
									endLoadStreamFile(true);
								}
								queue--;	// очередь скачки уменьшаем (на эту скачку)
								
							}
					};
					
					file[index].timer = setTimeout(function () { 
					
							httpRequest.onreadystatechange = null;
							httpRequest.abort();
							file[index].req = null;
							clearTimeout( file[index].timer );
							file[index].timer = null;
							file[index].state = 3;	

							endLoadStreamFile(true, index);		
							
							queue--;	// очередь скачки уменьшаем (на эту скачку)
							
						}, LOAD_STREAM_TIMEOUT);
					
					
					httpRequest.send();
					
					queue++;		// еще одна закачка
				}
				catch(err)	{
					console.log('===============CATCH===================== httpRequest ==========', err);
					endLoadStreamFile(true);
				}
			}
			
			// -------------------------------------------------------------
			function endLoadStreamFile(error)  {

				if (DEBUG) console.log( 'endLoadStreamFile: ',error, isSave );
				
 				if (isSave) return;

				// подсчитаем состояние
				var indexLoad = -1, flagEmpty = false;
				countLoad = startIndex;
				isEnd = true;
				
				for (var j=startIndex; j<file.length; j++) {
					
					if (file[j].state > 1) countLoad++;			// скачано сегментов
					else isEnd = false;
					
					if (file[j].stream) {
						if ( !flagEmpty )  indexLoad = j; 
					}	
					else {
						if (file[j].state == 1) {			// на очереди на чтение, но не прочитано (
							flagEmpty = true;
						}	
					}	
				}

				// сообщение	
				funcMessage({'msg': 'load', 'hash': hash, 'size': sizeOfVideo, 'count': countLoad, 'progress': Math.round( 100 * countLoad / countTSFiles ) });
				
				// дальнейшие действия
				if (isEnd || !isRun ) {
					loadEnd();
					return;
				}
				
				if ( indexLoad != -1 ) {
					loadSave(indexLoad);
					return;
				}
				
				if ( isRun ) {
					load();
				}
 				
			}
			// -------------------------------------------------------------
			function loadEnd()  {

				var blobs = [];
				
				isSave = true;
				
				if (initSector && saveInitSector) {
					var b = b64toBlob(initSector, 'video/mp4');
					if (DEBUG) console.log(initSector, b);
					blobs.push(b);
					saveInitSector = false;
				}	
					
				var k = 0;	
				for(var j = startIndex; j < file.length; j++)     	{
					if (file[j].stream) {
						blobs.push(file[j].stream);
						k++;
					}
				}
				
				if ( k > 0 ) {
					writeFile( blobs, function(){
						if (DEBUG) console.log('UNION', blobs, k, sizeOfVideo);					
						funcMessage({'msg': 'finish', 'hash': hash, size: sizeOfVideo, filename: fileName });
						funcFinish(hash, sizeOfVideo, fileName);
					});
				}
				else {
					if (DEBUG) console.log('UNION', blobs, k, sizeOfVideo);					
					funcMessage({'msg': 'finish', 'hash': hash, 'count':k, size: sizeOfVideo});
					funcFinish(hash, sizeOfVideo, fileName);
				}

			}
			// -------------------------------------------------------------
			function loadSave( kk )  {

				if ( kk >= file.length ) kk =file.length;
				
				isSave = true;

				var blobs = [];	
				if (initSector && saveInitSector) {
					var b = b64toBlob(initSector, 'video/mp4');
					if (DEBUG) console.log(initSector, b);
					blobs.push(b);
					saveInitSector = false;
				}	
					
				var k = 0;	
				var r = sizeOfVideo;
				for(var j = startIndex; j <= kk; j++)     	{
					if (file[j].stream) {
						blobs.push(file[j].stream);
						k++;
						r += file[j].stream.length;
						file[j].stream = null;
						file[j].state = 3;
					}
				}
				
				if ( k > 0 ) {
					startIndex = kk+1;
					
					writeFile( blobs, function(){
						isSave = false;
						
						endLoadStreamFile(false);
					});
				}
				else {
					isSave = false;
					
					endLoadStreamFile(false);
				}
				
			}
			// -------------------------------------------------------------
			function writeFile( blobs, callback )  {

				var blob = new Blob(blobs, {type: "video/mp4"});

				writePortion(blob, callback);
				
			}
			
			
			
			// --------------------------------------------------------------------------------
			function getAJAX( url, callback ){
				var ajax = new XMLHttpRequest();
				ajax.open('GET', url, true);
				ajax.setRequestHeader('Cache-Control', 'no-cache');
				ajax.onload = function(){
							var content = this.responseText;
							callback( content );
				}
				ajax.onerror = function(){
					callback( null );
				}
				ajax.send( null );
			}

			// -------------------------------------------------------------
			function loadPlayListFile(url, callback)  {
				
				if (DEBUG) console.log( 'loadPlayListFile: ', hash, url );
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
				
				getAJAX( url, function(content){
					if (!content) return;
					var results = [];
					content.split('\n').forEach(function( item ){
							if ( item.substring(0,1) == '#' )   return;
							item = item.trim();
							if ( !item )   return;	 
							var u = item;
							if (u.indexOf('http') != 0) {
								if (u.indexOf('/') == 0)  u = domain + u;
								else	u = host + u;
							}	
							
							results.push( u );
					});	

					callback(results);	
				});
			}
			// ---------------------------
			function fsReq(cb) {
			  webkitRequestFileSystem(TEMPORARY, 1 * 1024 * 1024 * 1024, cb);
			}
			// ---------------------------
			function createFile(cb) {
				
				var error;
				fsReq(function(fs) {
					fs.root.getFile(fileName, {create: true}, function(file) {
						file.createWriter(function(writer) {
							writer.truncate(0);
							cb();
						});
					});
				});
			}

			// ---------------------------
			function removeFile() {
				
				var error;
				fsReq(function(fs) {
					fs.root.getFile(fileName, {create: true}, function(file) {
						file.remove(function() {
							console.log('File removed.');
						});
					});
				});
			}

			// ---------------------------
			function writePortion(blob, cb) {
				
				var error;
				fsReq(function(fs) {
					fs.root.getFile(fileName, {create: true}, function(file) {
						file.createWriter(function(writer) {
							writer.onwriteend = function() {
								if (DEBUG) console.log("write success");
								cb(error);
							};
							writer.onerror = function(err) {
								error = err;
								console.log('ERROR fileSystem:', err);
							};
					
							writer.seek(writer.length);
							writer.write(blob);
						});
					});
				});
			}
			// -------------------------------------------------------------------
			function b64toBlob(b64Data, contentType, sliceSize)	{
				contentType = contentType || '';
				sliceSize = sliceSize || 512;

				var byteArrays = [];
				for (var offset = 0; offset < b64Data.length; offset += sliceSize) 
				{
					var slice = b64Data.slice(offset, offset + sliceSize);

					var byteNumbers = new Array(slice.length);
					for (var i = 0; i < slice.length; i++) 
					{
						byteNumbers[i] = slice.charCodeAt(i);
					}

					var byteArray = new Uint8Array(byteNumbers);
					byteArrays.push(byteArray);
				}

				var blob = new Blob(byteArrays, {type: contentType});
				return blob;
			}
			// ------------------------------
			function DecodeFragment(frag) {
				
				if ( !frag ) return "";
				
				var ad       = null,
					boxType  = '',
					boxSize  = 0,
					flvFile  = null,
					flvWrite = true,
					flvData  = "",
					flvTag   = "",
					fragPos  = 0,
					packetTS = 0,
					fragLen  = frag.byteLength;
					
				while (fragPos < fragLen)  {
					ReadBoxHeader(frag);
					if (boxType == "mdat") {
						fragLen = fragPos + boxSize;
						break;
					}
					fragPos += boxSize;
				}


				return frag.slice(fragPos, fragLen);	
					
				
				// -----------------------------
				function ReadBoxHeader(arr)	{
					
					boxSize = GetThemAll.jspack.ReadInt32(arr, fragPos);
					boxType = GetThemAll.jspack.bytesToString(arr.slice(fragPos + 4, fragPos + 8));
					
					if (boxSize == 1)	{
					  boxSize = GetThemAll.jspack.ReadInt64(arr, fragPos + 8) - 16;
					  fragPos += 16;
					}
					else  {
					  boxSize -= 8;
					  fragPos += 8;
					}
					if (boxSize <= 0) boxSize = 0;
				}
			}
		}	
		
	
		// ======================================================================
		var Streamer = function(){		
		
			var workers = {};
			var isRun = false;
			var error;
			
			// -------------------------------------------------------------------
			this.start = function( hash, callbackMessage, callbackFinish ){
				
				var media = GetThemAll.Media.Storage.getDataForHash(hash);
				console.log('Streamer.start', hash, media);
				
				var hash = media.hash;

				workers[hash] = new StreamWorker(hash);

				callbackMessage( { msg: "start", hash: hash, status: 'start', size: 0, count: 0 });

				workers[hash].start(hash, media,
									function(msg) {         // onMessage
										callbackMessage(msg);
									},
									function(hash, size, filename){
										console.log('==FINISH==');
										callbackMessage( { msg: "finish", hash: hash, status: 'stop', size: size });
										webkitRequestFileSystem(TEMPORARY, 2 * 1024 * 1024 * 1024, function(fs){
											fs.root.getFile(filename, {create: true}, function(file) {
												callbackFinish(false, hash, file.toURL(), size );
											});
										});
										setTimeout(function() {                    
											delete workers[hash];
										}, 100);    

									}); 

				return hash;
				
			}
			
			// -------------------------------------------------------------------
			this.stop = function( hash, callback ){
				
				console.log('Streamer.stop', hash);
				
				workers[hash].stop();
				
			}
			
 			// -------------------------------------------------------------------
			this.remove = function( hash ){

				console.log('Streamer.remove', hash);

				if (workers[hash]) {	
					delete workers[hash];
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
		};
		
		this.Streamer = new Streamer();
		
	}).apply(GetThemAll);
}
else{
	GetThemAll.Streamer = chrome.extension.getBackgroundPage().GetThemAll.Streamer;
}

