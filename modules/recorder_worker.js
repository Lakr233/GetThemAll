var httpRequest = null;
var httpRequest2 = null;
var arrayPlaylist = [];
var lastTSFile = '';
var isRun = false;
var strData = "";
var countTSFiles = 0;
var sizeOfVideo = 0;

function roughSizeOfObject( object ) {

    var objectList = [];

    var recurse = function( value )
    {
        var bytes = 0;

        if ( typeof value === 'boolean' ) {
            bytes = 4;
        }
        else if ( typeof value === 'string' ) {
            bytes = value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes = 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList[ objectList.length ] = value;

            for( i in value ) {
                bytes+= 8; // an assumed existence overhead
                bytes+= recurse( value[i] )
            }
        }

        return bytes;
    }

    return recurse( object );
}

function IsRequestSuccessful (httpReq) {
	// Fix for IE: sometimes 1223 instead of 204
	var success = (httpReq.status == 0 || 
		(httpReq.status >= 200 && httpReq.status < 300) || 
		httpReq.status == 304 || httpReq.status == 1223);

	return success;
}

function getDomainFromUrl(url)
{
	var i = url.lastIndexOf("/");
	url = url.substring(0, i+1);
	return url;
}

function OnStateChangePlaylist (urlPlaylist) {
	return function()  {
		if (httpRequest.readyState==4) {
	    	if (IsRequestSuccessful (httpRequest))    	{                        						
	        	//console.log ( 'OnStateChangePlaylist' ); 
	        	parsePlaylist(httpRequest.responseText);
	        	for(var i = 0; i < arrayPlaylist.length; i++)     	{
		        	//console.log ( 'OnStateChangePlaylist: i = '+i );
		        	if (isRun)      	{
			        	//console.log ( 'OnStateChangePlaylist: i = '+i+' isRun = '+isRun);
						if (arrayPlaylist[i].indexOf('http') == 0) {
							var urlTSFile = arrayPlaylist[i];
						}
						else {	
							var urlTSFile = getDomainFromUrl(urlPlaylist)+arrayPlaylist[i];
						}	
						loadFileTS(urlTSFile);
						lastTSFile = arrayPlaylist[i];
					}
	        	}
	    	}
			else 
			{
	        	self.postMessage({'msg': 'error', 'error':"Failed to get playlist!"});
				isRun=false;
	    	}
		}
	}
}

function OnStateChangeTSFile () {
	if (httpRequest2.readyState==4) {
		if (IsRequestSuccessful (httpRequest2)) 
		{
    		//console.log ( 'OnStateChangeTSFile' );                        						
			strData += httpRequest2.responseText;
			countTSFiles++;
			sizeOfVideo += roughSizeOfObject(httpRequest2.responseText);
			self.postMessage({'msg': 'runing', 'videoData':strData, 'countTSFiles':countTSFiles, 'sizeOfVideo':sizeOfVideo});
		}
		else 
		{
    		self.postMessage({'msg': 'error', 'error':"Failed to get .ts file!"});
			isRun=false;
		}
	}
}

function loadFileTS(url)
{
	//console.log ( 'loadFileTS',url );
	try
	{
		if (isRun)
		{
			httpRequest2 = new XMLHttpRequest(); 
			httpRequest2.open ("GET", url, false);
			httpRequest2.overrideMimeType("text/plain; charset=x-user-defined");  
			httpRequest2.onreadystatechange = OnStateChangeTSFile;
			httpRequest2.send();
		}
	}
	catch(err)
	{
		self.postMessage({'msg': 'error', 'error':"Failed to load .ts file!"});
		isRun=false;
	}
}

function loadFilePlaylist(urlPlaylist) {
	//console.log ( 'loadFilePlaylist', urlPlaylist );
	try	{
		if(isRun) {
			httpRequest = new XMLHttpRequest(); 
			httpRequest.open ("GET", urlPlaylist, false);
			httpRequest.onreadystatechange = OnStateChangePlaylist(urlPlaylist);
			httpRequest.send();
		}
	}
	catch(err)  {
		self.postMessage({'msg': 'error', 'error':"Failed to get playlist file!"});
		isRun=false;
	}
}

function parsePlaylist(strPlaylist) {
	if(typeof(strPlaylist) !== "undefined" || strPlaylist != "") {
		var allPlaylist = strPlaylist.split(/\r\n|\r|\n/);
		var isNextTSFile = false;
		var i = 0;
		arrayPlaylist = [];
		var isFind = false;
		var isPlaylist = false;
		
		for(i; i < allPlaylist.length; i++) 	{
			if(allPlaylist[i] == lastTSFile && allPlaylist[i] != "")
			{
				isFind = true;
				isPlaylist = true;
				break;
			}
		}
		
		if(!isFind)	{
			i = 0;
		}
		
		for(i; i < allPlaylist.length; i++)	{
			if (isNextTSFile == true)	{
				isNextTSFile = false;
				arrayPlaylist.push(allPlaylist[i]);
			}
			if (allPlaylist[i].search("#EXTINF:") >= 0)	{
				isNextTSFile = true;
				isPlaylist = true;
			}
		}
		if(!isPlaylist) 	{
			self.postMessage({'msg': 'error', 'error':"The playlist don't have .ts files records!"});
			isRun = false;
		}
	}
	else  {
		self.postMessage({'msg': 'error', 'error':"Playlist is empty!"});
		isRun = false;
	}
}
	
function cycle(urlPlaylist)  {
	while(isRun)	{
		loadFilePlaylist(urlPlaylist);
	}
	self.postMessage({'msg': 'stop', 'videoData':strData});
}
		
self.onmessage = function(e) 
{
	switch (e.data.cmd)
	{
		case 'startRecord':
			//console.log ( 'Rec start!' );
			isRun = true;
			cycle(e.data.url);
			break;
		case 'stopRecord':
			//console.log ( 'Rec stop!' );
			isRun = false;
			break;
	}
}

