
var searchBox = null;
var clickTimer = null;
var clickElement = false;
var currentTab = null;

window.addEventListener( "load", function(){

	try	{
		GetThemAll.Popup.init();		
	}
	catch( ex ){

	}
	
	GetThemAll.Locale.localizeCurrentPage();

	document.getElementById("masterMain").removeAttribute("hidden");
	
	var x = GetThemAll.Prefs.get( "gta.links_mode" );
	
	chrome.tabs.query( {
			active: true,
			currentWindow: true
		}, function( tabs ){
					if( tabs.length > 0 )	{
						currentTab = tabs[0];
						
						if (GetThemAll.Popup.isYoutubeUrl(currentTab.url) && x == 'video') x = 'link';
						set_tab_popup( x );
					}
	} );
	
	document.getElementById("tab_links").addEventListener( "click", function(event){
							set_tab_popup( "link" );
							document.getElementById("head_size").style.display="none";
							
							GetThemAll.Popup.box_Youtube();
							GetThemAll.Popup.repaintThreadsList();		
						}, false );

	document.getElementById("tab_images").addEventListener( "click", function(event){
							set_tab_popup( "image" );
							document.getElementById("head_size").style.display="block";
							
							GetThemAll.Popup.box_Youtube();
							GetThemAll.Popup.repaintThreadsList();		
						}, false );

	document.getElementById("tab_docs").addEventListener( "click", function(event){
							set_tab_popup( "file" );
							document.getElementById("head_size").style.display="block";
							
							GetThemAll.Popup.box_Youtube();
							GetThemAll.Popup.repaintThreadsList();		
						}, false );

	document.getElementById("tab_videos").addEventListener( "click", function(event){

							if (GetThemAll.Popup.isYoutubeUrl(currentTab.url)) {
								x = 'link';
								var BG = chrome.extension.getBackgroundPage();
								BG.navigateMessageDisabled();
							}
							else {	
								set_tab_popup( "video" );
								document.getElementById("head_size").style.display="block";
								GetThemAll.Popup.box_Youtube();
								GetThemAll.Popup.repaintThreadsList();	
							}	
						}, false );

	document.getElementById("head_all_sel").addEventListener( "click", function(){		
							GetThemAll.Popup.SelectAll();		
						}, false );

	document.getElementById("head_url").addEventListener( "click", function(){		
							GetThemAll.Popup.SortMedia( "url" );		
						}, false );
	document.getElementById("head_descr").addEventListener( "click", function(){		
							GetThemAll.Popup.SortMedia( "descr" );		
						}, false );
	document.getElementById("head_size").addEventListener( "click", function(){		
							GetThemAll.Popup.SortMedia( "size" );		
						}, false );

	document.getElementById("show_filter").addEventListener( "click", function(){		
							GetThemAll.Popup.ShowFilter( );		
						}, false );
	document.getElementById("close_filter").addEventListener( "click", function(){		
							GetThemAll.Popup.CloseFilter( );		
						}, false );

	var button_setting = document.getElementById("tab_settings");
	if (button_setting) button_setting.addEventListener( "click", function(){
								chrome.extension.sendMessage({action:"SettingOptions"  }, function( response ){} 					);
							}, false );
						

 	document.getElementById("downBox_Button").addEventListener( "click", function(event){
							document.getElementById("masterMain").removeAttribute("data-message");
							GetThemAll.Popup.DownloadList();		
						}, false ); 
						
	document.getElementById("downButton").addEventListener( "click", function(){
	
							window.clearTimeout(clickTimer);
							clickElement = true;
							
							var m1 = _b(GetThemAll.Prefs.get( "gta.download_warning" ));
							var m2 = _b(GetThemAll.Prefs.get( "gta.download_zip" ));
							
							if (m1 && !m2)	{
								var e1 = document.getElementById("masterHead");
								e1.setAttribute("style", "display: none");
								var e2 = document.getElementById("masterMain");
								e2.setAttribute("style", "display: none");
								e2.setAttribute("data-message", "1");
								var e3 = document.getElementById("downloadBox");
								e3.setAttribute("style", "display: block");
							}
							else {
								GetThemAll.Popup.DownloadList();		
							}	
							
							GetThemAll.Popup.show_rate_message();
							
						}, false );
						
	var m = _b(GetThemAll.Prefs.get( "gta.download_zip" ));
	document.getElementById("gta_downloader_zip").checked = m;
	document.getElementById("gta_downloader_zip").addEventListener('change', function() {
						GetThemAll.Prefs.set( "gta.download_zip", this.checked );
					}, false);
	

	document.getElementById("download_warning").addEventListener( "click", function(event){
	
							var x = this.checked;
							GetThemAll.Prefs.set( "gta.download_warning", !x );

						}, false );
						
	document.getElementById("downloadBox_label").addEventListener( "click", function(event){
	
							GetThemAll.Prefs.set( "gta.download_warning", false );
							
							clickElement = true;
							var e = document.getElementById("download_warning");
							e.checked = true;

						}, false );
						
	// mask text
 	document.getElementById("filter_mask_text").addEventListener( "change", function(event){
							GetThemAll.Popup.filtering_mask();
						}, false ); 

	// clear all						
	document.getElementById("head_clear_all").addEventListener( "click", function(){		
							GetThemAll.Popup.ClearAllMedia( );		
						}, false );
						
	document.addEventListener( "click", function(){		
	
							try 	{
								if ( GetThemAll.Popup.MenuCopy ) {
									chrome.contextMenus.remove( GetThemAll.Popup.MenuCopy );				
									GetThemAll.Popup.MenuCopy = null;
								}	
								if ( GetThemAll.Popup.MenuOpen ) {
									chrome.contextMenus.remove( GetThemAll.Popup.MenuOpen );				
									GetThemAll.Popup.MenuOpen = null;
								}	
	
								var ee = document.getElementById("content-tooltip");
								if (ee)  {
									ee.style.opacity = 0;
									ee.style.display = "none";
								}	
							
								GetThemAll.Popup.curHref = null;
							}
							catch (e)
							{
								console.log(e);
							}		
	
						}, false );
						
	document.getElementById("savelinkButton").addEventListener( "click", GetThemAll.Popup.SaveLink )
	
}, false );

function set_tab_popup( x ) {
	
	GetThemAll.Prefs.set( "gta.links_mode", x );

	document.getElementById("tab_links").removeClass("gta_downloader_tab_active");
	document.getElementById("tab_docs").removeClass("gta_downloader_tab_active");
	document.getElementById("tab_images").removeClass("gta_downloader_tab_active");
	document.getElementById("tab_videos").removeClass("gta_downloader_tab_active");
	document.getElementById("filter_links").style.display="none";
	document.getElementById("filter_images").style.display="none";
	document.getElementById("filter_videos").style.display="none";
	document.getElementById("filter_docs").style.display="none";

	if ( x == "file") 	{
		document.getElementById("tab_docs").addClass("gta_downloader_tab_active");
		document.getElementById("filter_docs").style.display="block";
		document.getElementById("head_size").style.display="block";
	}	
	else if ( x == "image")		{
		document.getElementById("tab_images").addClass("gta_downloader_tab_active");
		document.getElementById("filter_images").style.display="block";
		document.getElementById("head_size").style.display="block";
	}	
	else if ( x == "video") 	{
		document.getElementById("tab_videos").addClass("gta_downloader_tab_active");
		document.getElementById("filter_videos").style.display="block";
		document.getElementById("head_size").style.display="block";
	}	
	else	{
		document.getElementById("tab_links").addClass("gta_downloader_tab_active");
		document.getElementById("filter_links").style.display="block";
		document.getElementById("head_size").style.display="none";
	}	
	
	
}	

	

