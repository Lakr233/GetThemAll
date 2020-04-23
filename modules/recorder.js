if (window == chrome.extension.getBackgroundPage()) {
	
	(function(){
	
		var Recorder = function(){		
		
			var worker;
			var videoData = {};
			var isRun = false;
			var callback;
			var error;
			var countTSFiles = 0;
			var sizeOfVideo = 0;
			
			// -------------------------------------------------------------------
			this.start = function( id, url, callback ){
				
				console.log('Recorder.start', id, url);
				
				try
				{
					isRun = true;
					if(typeof(Worker) !== "undefined") 
					{
						worker = undefined;
						worker = new Worker(chrome.runtime.getURL('/modules/recorder_worker.js'))
						
						worker.onmessage = function(e) 
						{
							switch(e.data.msg)
							{		
								case "stop":
								case "runing":
									videoData[id] = e.data.videoData;
									if(typeof(e.data.countTSFiles) == "undefined" || typeof(e.data.sizeOfVideo) == "undefined")
									{
										countTSFiles = 0;
										sizeOfVideo = 0;
									}
									else
									{
										countTSFiles = e.data.countTSFiles;
										sizeOfVideo = e.data.sizeOfVideo;
									}
									callback(false,countTSFiles,sizeOfVideo);
									break;
								
								case "error":
									error = e.data.error;
									callback(true,countTSFiles,sizeOfVideo);
									break;
							}
						};
						callback(false,0,0,'start');
						worker.postMessage({'cmd':'startRecord',
											'url':url});	
					}
					else
					{
						throw { name: 'Worker', message: "Workers isn't supported!"};
					}
				}
				catch(err)
				{
					error = err.name + ' ' + err.message;
					callback(true,countTSFiles,sizeOfVideo);
				}
				
				
			}
			
			// -------------------------------------------------------------------
			this.stop = function( id, callback ){
				
				console.log('Recorder.stop', id);
				
				try		{
					worker.terminate();
					var x = b64toBlob(videoData[id], 'video/mp2t');
					callback(false, x, 'stop');
					delete videoData[id];
				}
				catch(err)	{
					error = err.name + ' ' + err.message;
					callback(true, null, 'stop');
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
			
		}
		
		this.Recorder = new Recorder();
		
	}).apply(GetThemAll);
}
else{
	GetThemAll.Recorder = chrome.extension.getBackgroundPage().GetThemAll.Recorder;
}

