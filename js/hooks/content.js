function init()
{
	
	getPage_url();
	
	setInterval(function(){  getPage_url()  }, 1000);
	
}

// ----------------------------------
function getPage_url()
{
	var url = document.location.href;
	var title = document.title;
	
	if (curHref != url)  {
		curHref = url;
		chrome.extension.sendRequest({akce:"Page_URL",  url: url  },	
										function( response ){ 	
										
											if ( response.command == 'Get_Links')		{
												getAll_URLs( response.tip, response.answer, response.tabId, function(results){
												
													chrome.extension.sendRequest(results,  function( resp ){ 	} );
												
												});
											}
										

									} );
	}								
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
};

// ---------------------------------------------------------------------------
function getAll_URLs( tip, answer, tabId, callback ) {

	var url = document.location.href;
	var title = document.title;
	
	aURLs.length = 0;
	if ( (tip.indexOf('all') != -1) || (tip.indexOf('link') != -1) )
	{
		var links = new Array(document.links.length);
		//console.log(links);		
		for (var i = 0; i < document.links.length; i++) 
		{
			links.push(document.links[i]);
		}
		addLinksToArray(links, url );
	}	
			
	if ( (tip.indexOf('all') != -1) || (tip.indexOf('image') != -1) )
	{
		var images = new Array(document.images.length);
		//console.log(images);		
		for (var i = 0; i < document.images.length; i++) 
		{
			images.push(document.images[i]);
		}	
		addImagesToArray(images, url, "image");			
	}	
	
	if ( (tip.indexOf('all') != -1) || (tip.indexOf('embed') != -1) )
	{
		var embeds = new Array(document.embeds.length);
		//console.log(embeds);		
		for (var i = 0; i < document.embeds.length; i++) 
		{
			embeds.push(document.embeds[i]);
		}			
		addEmbedsToArray( embeds, url );			
	}	
			
	if ( (tip.indexOf('all') != -1) || (tip.indexOf('video') != -1) )
	{
		var videos = [];
		//console.log(videos);		
		var x = document.getElementsByTagName('video');
		if (x)
		{
			for (var i = 0; i < x.length; i++) 
			{
				videos.push(x[i]);
			}			
			addImagesToArray(videos, url, "video");			
		}	
	}	
			
	if ( (tip.indexOf('all') != -1) || (tip.indexOf('audio') != -1) )
	{
		var audios = [];
		var x = document.getElementsByTagName('audio');
		if (x)
		{
			for (var i = 0; i < x.length; i++) 
			{
				audios.push(x[i]);
			}			
			addImagesToArray(audios, url, "audio");			
		}	
	}	

	if ( tip.indexOf('input') != -1 )
	{
		var x = document.getElementsByTagName('input');
		if (x)
		{
			var inputs = [];
			for (var i = 0; i < x.length; i++) 
			{
				inputs.push(x[i]);
			}
			addInputsToArray( inputs, url );			
		}	
	}	
	
	if ( (tip.indexOf('all') != -1) || (tip.indexOf('object') != -1) )
	{
		var x = document.getElementsByTagName('param');
		if (x)
		{
			var params = [];
			for (var i = 0; i < x.length; i++) 
			{
				params.push(x[i]);
			}
			addParamsToArray( params, url );	
		}	
	}	
	
	callback(	{	akce:		"Get_Links", 
					answer: 	answer, 
					tabId: 		tabId, 
					url: 		url, 
					link: 		aURLs   
				});
	
}			

// ---------------------------------------------------------------------------
function addLinksToArray(lnks, ref) {
			
	if (!lnks || !lnks.length) 	return;

	lnks.forEach(function( link ){

							var url = getURL(link.href, ref);
							
							if ( url != "") 
							{
								var title = '';
								if (link.hasAttribute('title')) 
								{
									title = trimMore(link.getAttribute('title'));
								}
								if (!title && link.hasAttribute('alt')) 
								{
									title = trimMore(link.getAttribute('alt'));
								}
								if (!title) 
								{
									title = trimMore(link.innerText);
								}
								var cl = "";
								if (link.hasAttribute('class')) 
								{
									cl = trimMore(link.getAttribute('class'));
								}

								aURLs.push({
											'url': url,
											'title': title,
											'class': cl,
											'id': (link.id ? link.id : ""),
											'value': '',
											'type': 'link'
										});
							}			
			
						});
						
}
// ---------------------------------------------------------------------------
function addImagesToArray(lnks, ref, tip)	{

	if (!lnks || !lnks.length) 	return;
	
	lnks.forEach(function( link ){
		
							var u = "";
							if (link.src) u = link.src;
							if (link.hasAttribute('data-thumb'))
							{
								u = trimMore(link.getAttribute('data-thumb'));
								if (u.indexOf("http") == -1) u = "http:" + u;
							}	

							var url = getURL(u, ref);
							if ( url != "") 
							{
							
								var desc = '';
								if (link.hasAttribute('alt')) 
								{
									desc = trimMore(link.getAttribute('alt'));
								}
								else if (link.hasAttribute('title')) 
								{
									desc = trimMore(link.getAttribute('title'));
								}
								var cl = "";
								if (link.hasAttribute('class')) 
								{
									cl = trimMore(link.getAttribute('class'));
								}
								
								aURLs.push({
											'url': url,
											'title': desc,
											'class': (link.class ? link.class : ""),
											'id': (link.id ? link.id : ""),
											'value': (link.value ? link.value : ""),
											'type': tip
										});
							}			
									
						});
}
// ---------------------------------------------------------------------------
function addInputsToArray(lnks, ref)	{
		
	if (!lnks || !lnks.length) 	return;
	
	lnks.forEach(function( link ){

							var url = getURL(link.src, ref);
							
							var desc = '';
							if (link.hasAttribute('alt')) 
							{
								desc = trimMore(link.getAttribute('alt'));
							}
							else if (link.hasAttribute('title')) 
							{
								desc = trimMore(link.getAttribute('title'));
							}
							var cl = "";
							if (link.hasAttribute('class')) 
							{
								cl = trimMore(link.getAttribute('class'));
							}
							var v = "";
							if (link.hasAttribute('value')) 
							{
								v = trimMore(link.getAttribute('value'));
							}

							aURLs.push({
											'url': url,
											'title': desc,
											'class': cl,
											'id': (link.id ? link.id : ""),
											'value': (link.value ? link.value : ""),
											'type': "input"
										});
									
						});
}
// ---------------------------------------------------------------------------
function addEmbedsToArray(lnks, ref)	{
		
	if (!lnks || !lnks.length) 	return;
	
	lnks.forEach(function( link ){

							var url = getURL(link.src, ref);
							
							var desc = '';
							if (link.hasAttribute('alt')) 
							{
								desc = trimMore(link.getAttribute('alt'));
							}
							else if (link.hasAttribute('title')) 
							{
								desc = trimMore(link.getAttribute('title'));
							}
							var cl = "";
							if (link.hasAttribute('class')) 
							{
								cl = trimMore(link.getAttribute('class'));
							}
							var v = "";
							if (link.hasAttribute('flashvars')) 
							{
								v = trimMore(link.getAttribute('flashvars'));
							}

							aURLs.push({
											'url': url,
											'title': desc,
											'class': cl,
											'id': (link.id ? link.id : ""),
											'value': v,
											'type': "embed"
										});
									
						});
}
// ---------------------------------------------------------------------------
function addParamsToArray(lnks, ref)	{
		
	if (!lnks || !lnks.length) 	return;
	
	lnks.forEach(function( link ){

							var url ="";
							var id ="";
							var cl = "";
							var v = "";
							var name = '';
							if (link.hasAttribute('name')) 
							{
								name = trimMore(link.getAttribute('name'));
							}
							if (link.hasAttribute('value')) 
							{
								v = trimMore(link.getAttribute('value'));
							}
							
							var parent = link.parentNode;
							if ( parent)
							{
								url = parent.getAttribute('data');
								if (parent.id) id = parent.id;
							}
							
							aURLs.push({
											'url': url,
											'title': name,
											'class': cl,
											'id': id,
											'value': v,
											'type': "object"
										});
									
						});
}
// ---------------------------------------------------------------------------
function trimMore(t) {
	if (t == null) return '';
	return t.replace(/^[\s_]+|[\s_]+$/gi, '').replace(/(_){2,}/g, "_");
}

// ---------------------------------------------------------------------------
function decode_unicode(str)	{

	var r = /\\u([\d\w]{4})/gi;
	str = str.replace(r, function (match, grp) {	return String.fromCharCode(parseInt(grp, 16)); });
	str = unescape(str);
	return str;
};
		
// ---------------------------------------------------------------------------
function getURL( url, ref) {
		
	if ( (url.toLowerCase().indexOf('javascript:') != -1) || (url.toLowerCase().indexOf('javascript :') != -1) )
	{
		url = "";
	}
	if ( (url.toLowerCase().indexOf('mailto:') != -1) || (url.toLowerCase().indexOf('mailto :') != -1) )
	{
		url = "";
	}
	if (url.indexOf("data:image") != -1)  url="";
		
		
	return url;
}

var aURLs = [];
var curHref = null;

// ================================================================================================ 
window.addEventListener("load",function( e ) {

						init()
						
					},false);
// ---------------------------------------------------------
