(function(){
	
	var Popup = function(){
		
		var self = this;
		
		const ALLOWED_EXT_IMAGES = [
			"flv",
			"mp3",
			"mp4",
			"pdf",
			"swf",
			"webm",
			"3gp"
		];
		
		const ButtonDownload_start = 'DOWNLOAD';
		const ButtonDownload_stop = 'Cancel download';
		
		const VECTOR_EXT_IMAGES = ["svg", "svgt", "wmf", "swf", "cgm"];
		
		this.ListMedia = null;
		
		this.tabSelectAll_links = "0";
		this.tabSelectAll_images = "0";
		this.tabSelectAll_docs = "0";
		this.tabSelectAll_videos = "0";
		
		this.curHref = null;
		this.curId = null;
		this.MenuCopy = null; 
		this.MenuOpen = null; 
		this.MenuDown = null; 
		
		this.video_YT = false;
		
		this.is_youtube = false;
		
		const URL_RATE_REVIEW = "https://chrome.google.com/webstore/detail/nbkekaeindpfpcoldfckljplboolgkfm/reviews";
		const INTERVAL_TO_DISPLAY_WRITE_REVIEW = 2 * 24 * 3600 * 1000; // 2 days
		const INTERVAL_TO_DISPLAY_RATE = 2 * 24 * 3600 * 1000; // 5 days

		const FILTER_LINK = [ { id: 'link_all',		title: 'All files' },
							  { id: 'link_html',	title: 'html' },
							  { id: 'link_css',		title: 'css' },
							  { id: 'link_js',		title: 'js' },
							];
		const FILTER_IMAGES = [ { id: 'image_all',		title: 'All files' },
								{ id: 'image_jpg',		title: 'jpg' },
								{ id: 'image_gif',		title: 'gif' },
								{ id: 'image_png',		title: 'png' },
								{ id: 'image_bmp',		title: 'bmp' },
								{ id: 'image_ico',		title: 'ico' },
								{ id: 'image_vector',	title: 'Vector files' },
							  ];
		const FILTER_FILE = [ { id: 'file_all',		title: 'All files' },
							  { id: 'file_doc',		title: 'doc' },
							  { id: 'file_xls',		title: 'xls' },
							  { id: 'file_ppt',		title: 'ppt' },
							  { id: 'file_pdf',		title: 'pdf' },
							  { id: 'file_exe',		title: 'exe & msi' },
							  { id: 'file_addon',	title: 'addon' },
							  { id: 'file_zip',		title: 'zip' },
							  { id: 'file_rar',		title: 'rar' },
							  { id: 'file_7z',		title: '7z' },
							  { id: 'file_jar',		title: 'jar' },
							  { id: 'file_tar',		title: 'tar' },
							];
							  
							  
		const FILTER_VIDEO = [ { id: 'video_all',		title: 'All files' },
							   { id: 'video_mp4',		title: 'mp4' },
							   { id: 'video_flv',		title: 'flv' },
							   { id: 'video_avi',		title: 'avi' },
							   { id: 'video_webm',		title: 'webm' },
							   { id: 'video_3gp',		title: '3gp' },
							   { id: 'video_mov',		title: 'mov' },
							   { id: 'video_mp3',		title: 'mp3' },
							   { id: 'video_wav',		title: 'wav' },
							   { id: 'video_mid',		title: 'mid' },
							 ];
							 
		var showMain, perfectMain;					 
		
		var scroll_X = 0;
		var scroll_width = 0;
		var scroll_Y = 0;
		var scroll_height = 0;
		var scroll_show_width = 0;
		var scroll_show_height = 0;
		var scroll_perfect_width = 0;
		var scroll_perfect_height = 0;
		
		var scaleZoom = 1;
		
		// -------------------------------------------------------
		function threadsOfActiveMode( mode, srtn, callback ){

			if ( self.ListMedia == null ) return null;
			var media = null;
			
			if (mode == "video")  		
			{
				media = self.ListMedia.video;
				if ( GetThemAll.Prefs.get( "gta.filter_video_all" ) == "false" )
				{
					var flag_mp4  = _b(GetThemAll.Prefs.get( "gta.filter_video_mp4" ));
					var flag_flv  = _b(GetThemAll.Prefs.get( "gta.filter_video_flv" ));
					var flag_avi  = _b(GetThemAll.Prefs.get( "gta.filter_video_avi" ));
					var flag_webm = _b(GetThemAll.Prefs.get( "gta.filter_video_webm" ));
					var flag_3gp  = _b(GetThemAll.Prefs.get( "gta.filter_video_3gp" ));
					var flag_mov  = _b(GetThemAll.Prefs.get( "gta.filter_video_mov" ));
					var flag_mp3  = _b(GetThemAll.Prefs.get( "gta.filter_video_mp3" ));
					var flag_wav  = _b(GetThemAll.Prefs.get( "gta.filter_video_wav" ));
					var flag_mid  = _b(GetThemAll.Prefs.get( "gta.filter_video_mid" ));
					
					media = media.filter( function (item, i, arr) {
				
											if ( flag_mp4  && item.ext == "mp4" ) return true;
											if ( flag_flv  && item.ext == "flv" ) return true;
											if ( flag_avi  && item.ext == "avi" ) return true;
											if ( flag_webm && item.ext == "webm" ) return true;
											if ( flag_3gp  && item.ext == "3gp" ) return true;
											if ( flag_mov  && item.ext == "mov" ) return true;

											if ( flag_mp4  && item.ext == "m4a" ) return true;
											
											if ( flag_mp3  && item.ext == "mp3" ) return true;
											if ( flag_wav  && item.ext == "wav" ) return true;
											if ( flag_mid  && (item.ext == "mid" || item.ext == "midi") ) return true;
				
											return false;
										} );			
				}						
			}	
			else if (mode == "file")  	
			{
				media = self.ListMedia.file;
				if ( GetThemAll.Prefs.get( "gta.filter_file_all" ) == "false" )
				{
					var flag_doc  = _b(GetThemAll.Prefs.get( "gta.filter_file_doc" ));
					var flag_xls  = _b(GetThemAll.Prefs.get( "gta.filter_file_xls" ));
					var flag_ppt  = _b(GetThemAll.Prefs.get( "gta.filter_file_ppt" ));
					var flag_pdf  = _b(GetThemAll.Prefs.get( "gta.filter_file_pdf" ));
					var flag_zip  = _b(GetThemAll.Prefs.get( "gta.filter_file_zip" ));
					var flag_rar  = _b(GetThemAll.Prefs.get( "gta.filter_file_rar" ));
					var flag_7z   = _b(GetThemAll.Prefs.get( "gta.filter_file_7z" ));
					var flag_jar  = _b(GetThemAll.Prefs.get( "gta.filter_file_jar" ));
					var flag_tar  = _b(GetThemAll.Prefs.get( "gta.filter_file_tar" ));
					var flag_exe  = _b(GetThemAll.Prefs.get( "gta.filter_file_exe" ));
					var flag_addon  = _b(GetThemAll.Prefs.get( "gta.filter_file_addon" ));
					
					media = media.filter( function (item, i, arr) {
				
											if ( flag_doc && ( item.ext == "doc" || item.ext == "docx"  || item.ext == "rtf" ) ) return true;
											if ( flag_xls && ( item.ext == "xls" || item.ext == "xlsx" ) ) return true;
											if ( flag_ppt && ( item.ext == "ppt" || item.ext == "pptx" ) ) return true;
											if ( flag_pdf && (item.ext == "pdf" || item.ext == "odf" || item.ext == "odt")  ) return true;
											if ( flag_zip && item.ext == "zip" ) return true;
											if ( flag_rar && item.ext == "rar" ) return true;
											if ( flag_7z  && item.ext == "7z" ) return true;
											if ( flag_jar && item.ext == "jar" ) return true;
											if ( flag_tar && (item.ext == "tar" || item.ext == "bz2" || item.ext == "qz")  ) return true;
											if ( flag_exe && ( item.ext == "exe" || item.ext == "bin" || item.ext == "msi" || item.ext == "iso" || item.ext == "dmg" ) ) return true;
											if ( flag_addon && ( item.ext == "xpi" || item.ext == "crx"  || item.ext == "nex" || item.ext == "oex" ) ) return true;
				
											return false;
										} );			
				}						
			}	
			else if (mode == "image")  	
			{
				media = self.ListMedia.image;
				if ( GetThemAll.Prefs.get( "gta.filter_image_all" ) == "false" )
				{
					var flag_jpg  = _b(GetThemAll.Prefs.get( "gta.filter_image_jpg" ));
					var flag_gif  = _b(GetThemAll.Prefs.get( "gta.filter_image_gif" ));
					var flag_png  = _b(GetThemAll.Prefs.get( "gta.filter_image_png" ));
					var flag_bmp  = _b(GetThemAll.Prefs.get( "gta.filter_image_bmp" ));
					var flag_ico  = _b(GetThemAll.Prefs.get( "gta.filter_image_ico" ));
					var flag_vector  = _b(GetThemAll.Prefs.get( "gta.filter_image_vector" ));
					
					media = media.filter( function (item, i, arr) {
				
											if ( flag_jpg && ( item.ext == "jpg" || item.ext == "jpeg" ) ) return true;
											if ( flag_gif && item.ext == "gif" ) return true;
											if ( flag_png && item.ext == "png" ) return true;
											if ( flag_bmp && item.ext == "bmp" ) return true;
											if ( flag_ico && item.ext == "ico" ) return true;
											if ( flag_vector && VECTOR_EXT_IMAGES.indexOf(item.ext) != -1 ) return true;

											return false;
										} );			
				}						
				var v = document.getElementById("filter_image_size").value;
				if (!v || v == "") v = 0;
				var min_size = parseFloat(v);
				
				if ( min_size )	{
					min_size = min_size * 1024;
					media = media.filter( function (item, i, arr) {
				
											if ( item.size != "" && item.size < min_size ) return false;

											return true;
										} );			
				}
				
				
			}	
			else if (mode == "link")  	
			{
				media = self.ListMedia.link;
				
				if ( GetThemAll.Prefs.get( "gta.filter_link_all" ) == "false" )
				{
					var flag_html = _b(GetThemAll.Prefs.get( "gta.filter_link_html" ));
					var flag_css  = _b(GetThemAll.Prefs.get( "gta.filter_link_css" ));
					var flag_js   = _b(GetThemAll.Prefs.get( "gta.filter_link_js" ));
					
					media = media.filter( function (item, i, arr) {

											if ( flag_html && ( item.ext == "html" || item.ext == "htm" || item.ext == "shtml") ) return true;
											if ( flag_css && item.ext == "css" ) return true;
											if ( flag_js && (item.ext == "js" || item.ext == "jsm") ) return true;
											
											return false;
				
										} );			
				}						
			}	

			if (srtn == "asc_url")			media.sort( function( item1, item2 ) {	  return item1.url.toLowerCase() > item2.url.toLowerCase() ? 1 : -1;  } );
			else if ( srtn == "desc_url")	media.sort( function( item1, item2 ) {	  return item2.url.toLowerCase() > item1.url.toLowerCase() ? 1 : -1;  } );
			else if ( srtn == "asc_title")	media.sort( function( item1, item2 ) {	  return item1.title.toLowerCase() > item2.title.toLowerCase() ? 1 : -1;  } );
			else if ( srtn == "desc_title")	media.sort( function( item1, item2 ) {	  return item2.title.toLowerCase() > item1.title.toLowerCase() ? 1 : -1;  } );
			else if ( srtn == "asc_size")	media.sort( function( item1, item2 ) {	  return (item1.size ? parseInt(item1.size) : 0) > (item2.size ? parseInt(item2.size) : 0)  ? 1 : -1;  } );
			else if ( srtn == "desc_size")	media.sort( function( item1, item2 ) {	  return (item2.size ? parseInt(item2.size) : 0) > (item1.size ? parseInt(item1.size) : 0)  ? 1 : -1;  } );
			else							media.sort( sort_priority );
			
			function sort_priority(item1, item2) {
				
				if (item1.priority == item2.priority) {
					if (item1.priority > 0) {
						return (item1.id < item2.id ? 1 : -1)	
					}	
					else if (item1.priority < 0) {
						return (item1.id > item2.id ? 1 : -1)	
					}	
				}
				else {	
					return (item1.priority < item2.priority ? 1 : -1);
				}
				
			}
			
			callback( media); 

		}

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
			
		this.isYoutubeUrl = function( url ){
		
			if ( GetThemAll.noYoutube == false ) return false;
		
			var url = url.toLowerCase();
				
			for( var i = 0; i != YOUTUBE_URL_SIGNS.length; i++ )
			{
				if( url.indexOf( YOUTUBE_URL_SIGNS[i] ) != -1 )		return true;
			}
				
			return false;
		}
			
		// -------------------------------------------------------
		function getExtImage( ext ){
			if( ALLOWED_EXT_IMAGES.indexOf(ext) == -1 ){
				return;
			}
			
			ext = ext.toLowerCase();
		
			return "images/formats/"+ext+".png";
		}
		
		// ---------------------------------------------------- 
		function inlineSize( el ){
			var hiddenStyle = "left:-10000px;top:-10000px;height:auto;width:auto;position:absolute;";
			var clone = document.createElement('div');
			for (var i in el.style) {
				try {
					if ((el.style[i] != '') && (el.style[i].indexOf(":") > 0)) 		{
						clone.style[i] = el.style[i];
					}
				} 
				catch (e) {}
			}
			document.all ? clone.style.setAttribute('cssText', hiddenStyle) : clone.setAttribute('style', hiddenStyle);
			clone.innerHTML = el.innerHTML
			parent.document.body.appendChild(clone);
			var rect = {width:clone.offsetWidth,height:clone.offsetHeight};
			parent.document.body.removeChild(clone);
			return rect;
		}	

		// ----------------------------------------------------   
		function setCheck_ListMedia( id, t ){
		
			self.ListMedia.v_link = 0;
			self.ListMedia.v_image = 0;
			self.ListMedia.v_file = 0;
			self.ListMedia.v_video = 0;
		
			if (self.ListMedia.k_link>0) 
			{
				self.ListMedia.link.forEach( function( item ){
							if ( item.id == id)
							{
								item.vubor = t;
								GetThemAll.Utils.getActiveTab( function( tab ){		GetThemAll.Media.Storage.setData_Status( tab.id, id, t );		});
							}	
							if ( item.vubor == 1)
							{
								self.ListMedia.v_link++;
							}
						} );
			}			
			if (self.ListMedia.k_image>0) 
			{
				self.ListMedia.image.forEach( function( item ){
							if ( item.id == id)
							{
								item.vubor = t;
								GetThemAll.Utils.getActiveTab( function( tab ){		GetThemAll.Media.Storage.setData_Status( tab.id, id, t );		});
							}	
							if ( item.vubor == 1)
							{
								self.ListMedia.v_image++;
							}
						} );
			}			
			if (self.ListMedia.k_file>0) 
			{
				self.ListMedia.file.forEach( function( item ){
							if ( item.id == id)
							{
								item.vubor = t;
								GetThemAll.Utils.getActiveTab( function( tab ){		GetThemAll.Media.Storage.setData_Status( tab.id, id, t );		});
							}	
							if ( item.vubor == 1)
							{
								self.ListMedia.v_file++;
							}
						} );
			}			
			if (self.ListMedia.k_video>0) 
			{
				self.ListMedia.video.forEach( function( item ){
							if ( item.id == id)
							{
								item.vubor = t;
								GetThemAll.Utils.getActiveTab( function( tab ){		GetThemAll.Media.Storage.setData_Status( tab.id, id, t );		});
							}	
							if ( item.vubor == 1)
							{
								self.ListMedia.v_video++;
							}
						} );
			}			

			buildThreadCount( { link: self.ListMedia.k_link, vlink: self.ListMedia.v_link,
								image: self.ListMedia.k_image, vimage: self.ListMedia.v_image,
								file: self.ListMedia.k_file, vfile: self.ListMedia.v_file,
								video: self.ListMedia.k_video, vvideo: self.ListMedia.v_video  } );	
		
		}

		// --------------------------------------------------------
		function Item_contextMenu( url, id ){

			self.curHref = url;
			self.curId = id;
			
			if ( !self.MenuCopy) {
				self.MenuCopy = chrome.contextMenus.create({
													type: "normal",
													"title": "Copy URL", 
													"contexts":["all"], 
													"id": "copy_link", 
													"onclick": genericOnClick_ContextPopup_Copy
												});
			}
			
			self.MenuOpen = chrome.contextMenus.create({
													type: "normal",
													"title": "Open Link", 
													"contexts":["all"], 
													"id": "open_link", 
													"onclick": genericOnClick_ContextPopup_Open
												});

			self.MenuDown = chrome.contextMenus.create({
													type: "normal",
													"title": "Download", 
													"contexts":["all"], 
													"id": "open_down", 
													"onclick": genericOnClick_ContextPopup_Down
												});

		}
		
		// ----------------------------------------------------
		function genericOnClick_ContextPopup_Copy( info, tab ) {
		
			if ( self.MenuCopy) {
				chrome.contextMenus.remove( self.MenuCopy );				
				self.MenuCopy = null;
			}	
				
			chrome.contextMenus.remove( self.MenuOpen );				
			
			GetThemAll.Utils.copyToClipboard( self.curHref );
		
		}

		// ----------------------------------------------------
		function genericOnClick_ContextPopup_Open( info, tab ) {
		
			if ( self.MenuCopy) {
				chrome.contextMenus.remove( self.MenuCopy );				
				self.MenuCopy = null;
			}	
			chrome.contextMenus.remove( self.MenuOpen );				
		
			chrome.tabs.create({
								url: self.curHref,
								active: false
							});
		}
		
		// ----------------------------------------------------
		function genericOnClick_ContextPopup_Down( info, tab ) {
		
			if ( self.MenuDown) {
				chrome.contextMenus.remove( self.MenuDown );				
				self.MenuDown = null;
			}	
			chrome.contextMenus.remove( self.MenuOpen );				
		
			self.DownloadOne(self.curId);
		
		}
		
		// ----------------------------------------------------   
		function buildThreadItem( media, mode ){

			function fbc( className ){
				return item.getElementsByClassName(className)[0];
			}

			if (!media.url || media.url == "") return null;
			
			var item = null;
			
			var item = document.querySelector('[item="'+media.id+'"');
			if (item) {		
				// --  url
				var e1 =  fbc("item_url");
				e1.textContent = media.url;			
				e1.title = media.url;
				e1.href = media.url;

				// --  descr
				var e2 =  fbc("item_descr");
				e2.textContent = media.displayName;
				e2.title = media.title;
			
				return;
			}
			
			item = document.getElementById("download_item_template").cloneNode( true );
			item.removeAttribute( "id" );
			item.setAttribute("item", media.id);
			item.setAttribute("status", media.status);

			if (media.zip>0) item.setAttribute("zip", media.zip);	
			
			// --  url
			var e1 =  fbc("item_url");
			e1.textContent = media.url;			
			e1.title = media.url;
			e1.href = media.url;
			
			e1.addEventListener( "contextmenu", function( event ){

							Item_contextMenu( this.title, media.id );
			
						}, false ); 
						
			if (media.type == "image")	{
				var e1e =  fbc("item_ext");
				e1e.setAttribute("adr", media.url);
				e1e.addEventListener( "mouseover", function( event ){

							var ee = document.getElementById("image-tooltip");
							
							var x = event.clientX + 20;
							var y = event.clientY;
							if (y > 250)   y = event.clientY-100;
							if (y > 340)   y = event.clientY-200;
							if (y > 440)   y = event.clientY-300;
							
							ee.style.left = x;
							ee.style.top = y;
							ee.style.opacity = 1;
							ee.style.display = "block";
							
							var img_url = this.getAttribute("adr");

							var ii = document.getElementById("preview-image");
							ii.src = img_url;
							ii.addEventListener( "load", function( event ){
										
												var ee = document.getElementById("rg3fbpz-title");
												ee.removeAttribute("loading");
							
											});
							
						}, false );
			
				e1e.addEventListener( "mouseout", function( event ){

							var ee = document.getElementById("image-tooltip");
							ee.style.opacity = 0;
							ee.style.display = false;
							var ii = document.getElementById("preview-image");
							ii.src = '';
							var ee = document.getElementById("rg3fbpz-title");
							ee.setAttribute("loading","1");
						
						}, false );
			}			
			

			// --  descr
			var e2 =  fbc("item_descr");
			e2.textContent = media.displayName;
			e2.title = media.title;

			// --  extension
			var e3 =  fbc("item_ext");
			var extClass = 'gta_downloader_icon_ic_list_other';
			if (media.type == "image")	{
				switch ( media.ext )	{
					case "jpeg":
					case "jpg":   extClass = "gta_downloader_icon_ic_list_jpg";   break;
					case "gif":   extClass = "gta_downloader_icon_ic_list_gif";   break;
					case "png":   extClass = "gta_downloader_icon_ic_list_png";   break;
					case "bmp":   extClass = "gta_downloader_icon_ic_list_bmp";   break;
					case "ico":   extClass = "gta_downloader_icon_ic_list_ico";   break;
					case "svg":   extClass = "gta_downloader_icon_ic_list_svg";   break;
					default: 	  extClass = "gta_downloader_icon_ic_list_jpg";
				}
			}
			else if (media.type == "audio") {
				extClass = "gta_downloader_icon_ic_list_mp3";
			}
			else if (media.type == "http") 	{
				switch ( media.ext )	{
					case "shtml":
					case "htm":
					case "html":  extClass = "gta_downloader_icon_ic_list_html";   break;
					case "css":   extClass = "gta_downloader_icon_ic_list_css";    break;
					case "js":    extClass = "gta_downloader_icon_ic_list_js";     break;
					default: 	  extClass = "gta_downloader_icon_ic_list_html";
				}
			}
			else if (media.type == "file" || media.type == "archiv") 	{
				switch ( media.ext )    {
					case "rtf":
					case "docx":
					case "doc":   extClass = "gta_downloader_icon_ic_list_doc";   break;
					case "xlsx":
					case "xls":   extClass = "gta_downloader_icon_ic_list_xls";   break;
					case "pptx":
					case "ppt":   extClass = "gta_downloader_icon_ic_list_ppt";   break;
					case "odf":
					case "odt":
					case "pdf":   extClass = "gta_downloader_icon_ic_list_pdf";   break;
					case "zip":	  extClass = "gta_downloader_icon_ic_list_zip";   break;	
					case "rar":	  extClass = "gta_downloader_icon_ic_list_rar";   break;	
					case "7z":    extClass = "gta_downloader_icon_ic_list_7z";    break;
					case "jar":   extClass = "gta_downloader_icon_ic_list_jar";   break;
					case "qz":
					case "bz2":	  extClass = "gta_downloader_icon_ic_list_bz2";   break;
					case "tar":   extClass = "gta_downloader_icon_ic_list_tar";   break;
					case "exe":
					case "bin":
					case "iso":
					case "dmg":
					case "msi":   extClass = "gta_downloader_icon_ic_list_exe";   break;
					case "xpi":   extClass = "gta_downloader_icon_ic_list_xpi";   break;
					case "crx":   extClass = "gta_downloader_icon_ic_list_crx";   break;
					case "nex":
					case "oex":   extClass = "gta_downloader_icon_ic_list_oex";   break;
					default: 	  extClass = "gta_downloader_icon_ic_list_file";
				}
			}
			else if (media.type == "video")	{
				switch ( media.ext )		{
					case "3gp":   extClass = "gta_downloader_icon_ic_list_3gp";   break;
					case "flv":   extClass = "gta_downloader_icon_ic_list_flv";   break;
					case "mp4":   extClass = "gta_downloader_icon_ic_list_mp4";   break;
					case "swf":   extClass = "gta_downloader_icon_ic_list_swf";   break;
					case "webm":  extClass = "gta_downloader_icon_ic_list_webm";  break;
					default: 	  extClass = "gta_downloader_icon_ic_list_video";
				}
			
				
			}
			e3.addClass(extClass);
			e3.title = media.ext ? media.ext : media.type;
			
			// -- select
			var e4 =  fbc("item_sel");
			if ( self.isYoutubeUrl(media.url) && (mode == "video") )		{
				return null;
			}
			else if ( media.metod == "record" || media.metod == "stream" )		{
				e4.setAttribute('disabled', true);
			}
			else	{
				if ( media.vubor == 1) 	e4.checked = true;
								  else  e4.checked = false;
								  
				e4.addEventListener( "click", function( event ){

						var x = this.checked;
						var id = parseInt( this.getAttribute("item") );
						if (x)	{
							setCheck_ListMedia( id, 1);
						}	
						else 	{
							setCheck_ListMedia( id, 0);
							clear_Flag_SelectAll(  );  // убрать метку select all
						}
								
					}, false );
			}					  
			
			e4.title = media.source;
			e4.setAttribute("item", media.id);			

			// -- size
			if ( media.metod == "download" )  {
				var e5 =  fbc("item_size");
				e5.parentNode.removeAttribute("hidden");
				e5.textContent = "";	
				
				if (media.size) 	{
					e5.textContent = str_download_size(media.size);
				}
				else	{
					e5.setAttribute( "loading", 1 );
				
					GetThemAll.Utils.getSizeByUrl( media.url, function( size ){
					
														e5.removeAttribute( "loading" );
														if( size ) 	{
															GetThemAll.Utils.getActiveTab( function( tab ){		
																if (tab) GetThemAll.Media.Storage.setData_Attribute( tab.id, media.id, "size", size );		
															});
														
															e5.textContent = str_download_size( size );
														}
					
													} );				

				}
			}
			else   {

				if (media.status == 'start') 	{
					if (media.progressByte && media.progressByte>0) {
						fbc("item_size").textContent = str_download_size(media.progressByte);
					}	
				}

			}	
			
			// -- download
			var e6 =  fbc("js-download-button");
			
			if ( e6 )		{
				_set_icon(media.metod, media.status, e6);
				
				e6.setAttribute("item", media.id);		
				e6.addEventListener( "click", function( event ){
					var id = parseInt( this.getAttribute("item") );

					item.setAttribute("status", media.status == 'start' ? 'stop' : 'start');
					
					if (media.metod == "download") {
						_set_icon(media.metod, media.status == 'start' ? 'stop' : 'start', e6)
					}
					else {	
						_set_icon(media.metod, media.status == 'start' ? 'stop' : 'start', e6)
					}
					
					self.DownloadOne(id);					
					
					event.stopPropagation();
				}, false );
			}		
			
			
			return item;
			
			// --------
			function _set_icon(metod, status, e) {
				
				if (metod == 'stream') {
					if (status == 'stop') {
						e.textContent='Start record';
						e.parentNode.style['background'] = '-webkit-linear-gradient(90deg, #4da5d8, #58d2fd)';
					}	
					else if (status == 'loading') {
						e.parentNode.setAttribute( "loading", 1 );
						e.textContent='Start';
						e.parentNode.style['background'] = '-webkit-linear-gradient(90deg, #4da5d8, #58d2fd)';
					}	
					else {
						e.parentNode.removeAttribute( "loading");
						e.textContent='Stop';
						e.parentNode.style['background'] = '-webkit-linear-gradient(90deg, #FC2B53, #F9869C)';
					}	
				}
				else if (metod == 'record') {
					if (status == 'start') {
						e.textContent='Stop';
						e.parentNode.style['background'] = '-webkit-linear-gradient(90deg, #FC2B53, #F9869C)';
					}	
					else {
						e.textContent='Start record';
						e.parentNode.style['background'] = '-webkit-linear-gradient(90deg, #4da5d8, #58d2fd)';
					}	
				}
				else {
					if (status == 'start') {
						e.textContent='Cancel';
						e.parentNode.style['background'] = '-webkit-linear-gradient(90deg, #FC2B53, #F9869C)';
					}	
					else {
						e.textContent='Download';
						e.parentNode.style['background'] = '-webkit-linear-gradient(90deg, #4da5d8, #58d2fd)';
					}	
				}	
			}	
			
		}
		
		// ----------------------------------------------------   заполним строку иконками
		function buildThreadItemAlternative( media, mode ){
	
			function fbc( className ){
				return item.getElementsByClassName(className)[0];
			}
			
			var item = document.getElementById("download_icon_template").cloneNode( true );
			item.removeAttribute( "id" );
			item.setAttribute("item", media.id);			
			
			var img =  fbc("info_img");
			img.src = media.url;
			img.title = media.title;

			img.addEventListener( "click", function( event ){

							chrome.tabs.create({
												url: media.url,
												active: false
											});
								
					}, false );
					
			img.addEventListener( "contextmenu", function( event ){

							Item_contextMenu( this.src, media.id );
			
						}, false );
					
			// -- select
			var e4 =  fbc("item_sel");
			if ( self.isYoutubeUrl(media.url) && (mode == "video") )		{
				return null;
			}
			else	{
				if ( media.vubor == 1) 	e4.checked = true;
								  else  e4.checked = false;
								  
				e4.addEventListener( "click", function( event ){
						var x = this.checked;
						var id = parseInt( this.getAttribute("item") );
						if (x)	{
							setCheck_ListMedia( id, 1);
						}	
						else 	{
							setCheck_ListMedia( id, 0);
							clear_Flag_SelectAll(  );  // убрать метку select all
						}
								
					}, false );
			}					  
			e4.title = media.source;
			e4.setAttribute("item", media.id);			
				
			// -- size
			var elem_size =  fbc("info_size");
			elem_size.parentNode.removeAttribute("hidden");
			elem_size.textContent = "";	
				
			if (media.size)	{
				elem_size.textContent = str_download_size(media.size);
			}
			else	{
				elem_size.setAttribute( "loading", 1 );
			
				GetThemAll.Utils.getSizeByUrl( media.url, function( size ){
					
								elem_size.removeAttribute( "loading" );
								if( size )
								{
									GetThemAll.Utils.getActiveTab( function( tab ){		GetThemAll.Media.Storage.setData_Attribute( tab.id, media.id, "size", size );		});
														
									elem_size.textContent = str_download_size( size );
								}
					
							} );				
			}
					
			
		
			return item;
		}	
		// ----------------------------------------------------   
		function str_download_size( size ) {

			if (size<1024)    	 		 return size + "b";
			else if (size<1048576)    	 return GetThemAll.Utils.bytesToKb(size) + "Kb";
			else if (size<1073741824)    return GetThemAll.Utils.bytesToMb(size) + "Mb";
							else 	     return GetThemAll.Utils.bytesToGb(size) + "Gb";
		
		}
		
		
		// ----------------------------------------------------   заполним строку
		function buildThreadCount( counts ){
		
			GetThemAll.Utils.getActiveTab( function( tab ){

				if ( tab && tab.url.indexOf("youtube.com") != -1 && GetThemAll.noYoutube) self.is_youtube = true;
			
				if (!GetThemAll.Media.isDownload) show_buildThreadCount( counts );	
				
			});
		}
		
		// -------------
		function show_buildThreadCount( counts ){
			
			if (counts.vlink > 0) {
				document.getElementById("vubor_links").textContent  = counts.vlink.toString();
				document.getElementById("vubor_links").style.display = 'inline-block';
			}
			else {
				document.getElementById("vubor_links").textContent  = '';
				document.getElementById("vubor_links").style.display = 'none';
			}	
			if (counts.link > 0) {
				document.getElementById("count_links").innerHTML  = '<span class="count">' + counts.link.toString() + '</span> '+
																	'<span class="label">' + _("popup_tab_detected") + '</span>';
			}
			else {
				document.getElementById("count_links").textContent  = _("popup_tab_not_detected");
			}	

			if (counts.vimage > 0) {
				document.getElementById("vubor_images").textContent  = counts.vimage.toString();
				document.getElementById("vubor_images").style.display = 'inline-block';
			}
			else {
				document.getElementById("vubor_images").textContent  = '';
				document.getElementById("vubor_images").style.display = 'none';
			}	
			if (counts.image > 0) {
				document.getElementById("count_images").innerHTML  = '<span class="count">' + counts.image.toString() + '</span> '+
																	 '<span class="label">' + _("popup_tab_detected") + '</span>';
			}
			else {
				document.getElementById("count_images").textContent  = _("popup_tab_not_detected");
			}	

			if (counts.vfile > 0) {
				document.getElementById("vubor_docs").textContent  = counts.vfile.toString();
				document.getElementById("vubor_docs").style.display = 'inline-block';
			}
			else {
				document.getElementById("vubor_docs").textContent  = '';
				document.getElementById("vubor_docs").style.display = 'none';
			}	
			if (counts.file > 0) {
				document.getElementById("count_docs").innerHTML  = '<span class="count">' + counts.file.toString() + '</span> '+
																   '<span class="label">' + _("popup_tab_detected") + '</span>';
			}
			else {
				document.getElementById("count_docs").textContent  = _("popup_tab_not_detected");
			}	

			if ( self.is_youtube )	{
				document.getElementById("count_videos").textContent = _("popup_tab_not_detected");
				document.getElementById("vubor_videos").textContent  = '';
				document.getElementById("vubor_videos").style.display = 'none';
			}
			else {
				if (counts.vvideo > 0) {
					document.getElementById("vubor_videos").textContent  = counts.vvideo.toString();
					document.getElementById("vubor_videos").style.display = 'inline-block';
				}
				else {
					document.getElementById("vubor_videos").textContent  = '';
					document.getElementById("vubor_videos").style.display = 'none';
				}	
				if (counts.video > 0) {
					document.getElementById("count_videos").innerHTML  = '<span class="count">' + counts.video.toString() + '</span> '+
																		 '<span class="label">' + _("popup_tab_detected") + '</span>';
				}
				else {
					document.getElementById("count_videos").textContent  = _("popup_tab_not_detected");
				}	
			}
			var itog = counts.vlink + counts.vimage + counts.vfile + counts.vvideo;
			document.getElementById("total_count").textContent = "(" + itog.toString() + ")";
			if (itog>0) {
				document.getElementById("downButton").removeAttribute("disabled");
			}	
			else {
				document.getElementById("downButton").setAttribute("disabled", true);
			}	
			if (itog>1) {
				document.querySelector(".gta_downloader_zip").style.display = 'block';
				document.getElementById("savelinkButton").style.display = 'none';
			}	
			else {
				document.querySelector(".gta_downloader_zip").style.display = 'none';
				if (_b(GetThemAll.Prefs.get( "gta.show_save_text" ))) {
					document.getElementById("savelinkButton").style.display = 'block';
				}
				else {
					document.getElementById("savelinkButton").style.display = 'none';
				}	
			}	
		}

		// -------------
		function set_item_download( id, status ){

			var item = document.getElementById("masterMain").querySelector('[item="'+id+'"]');
			item.setAttribute("zip", status);	
		
		}
		
		// -------------
		function clear_item_download( ){

			var items = document.getElementById("masterMain").querySelectorAll('[zip]');
			items.forEach(function( item ){
				item.removeAttribute("zip");	
			});	
		
		}
		
		// -------------
		function set_item_download_stream( id, status, size ){
			
			var item = document.getElementById("masterMain").querySelector('[item="'+id+'"]');
			if (!item) return;
			if (status) {
				item.setAttribute("stream", status);
				if (status != 'start') item.querySelector('.gta_downloader_text_count').textContent = status+'%';				
			}
			else {	
				item.removeAttribute("stream");	
			}
			
			if (size && size>0) {
				var e5 =  item.querySelector(".item_size");
				e5.textContent = str_download_size(size);
			}
			
		}
		
		// -------------
		function set_item_download_record( id, status, size ){
			
			var item = document.getElementById("masterMain").querySelector('[item="'+id+'"]');
			if ( !item ) return;
			
			if (status) {
			}
			else {	
			}
			
			if (size && size>0) {
				var e5 =  item.querySelector(".item_size");
				e5.textContent = str_download_size(size);
			}
		}
		
		// -------------
		function set_button_download( flag, count, size ){

			if (flag == 1) {
				document.getElementById("total_count").textContent = "(0/"+GetThemAll.Media.totalDownload+")";
				document.getElementById("downButton").querySelector('.title_button').textContent = ButtonDownload_stop;
			}
			else if (flag == 2) {
				document.getElementById("total_count").textContent = "(0)";
				document.getElementById("downButton").setAttribute("disabled", true);
				document.getElementById("downButton").querySelector('.title_button').textContent = ButtonDownload_start;
			}
			else if (flag == 3) {		// restore
				document.getElementById("downButton").querySelector('.title_button').textContent = ButtonDownload_stop;
				document.getElementById("total_count").textContent = "(" + GetThemAll.Media.countDownload + "/" +GetThemAll.Media.totalDownload+ ")";
				document.getElementById("downButton").removeAttribute("disabled");
			}
			else {
				document.getElementById("total_count").textContent = "(" + count + "/" +GetThemAll.Media.totalDownload + ")";
			}	
		}	
		
		// ----------------------------------------------------   
		function set_Flag_SelectAll(  ){

			// флаг SelectAll на страницу	
			var e = document.getElementById("head_all_sel");
			if ( document.getElementById("tab_links").getAttribute("checked") == "true"  && self.tabSelectAll_links == "1" )
			{
				e.setAttribute("check", "1");
			}	
			else if ( document.getElementById("tab_images").getAttribute("checked") == "true"  && self.tabSelectAll_images == "1" ) 
			{
				e.setAttribute("check", "1");
			}	
			else if ( document.getElementById("tab_docs").getAttribute("checked") == "true"    && self.tabSelectAll_docs == "1"  ) 
			{
				e.setAttribute("check", "1");
			}	
			else if ( document.getElementById("tab_videos").getAttribute("checked") == "true"  && self.tabSelectAll_videos == "1" ) 
			{
				e.setAttribute("check", "1");
			}	
			else
			{
				e.setAttribute("check", "0");
			}	
		}

		// ----------------------------------------------------   
		function clear_Flag_SelectAll(  ){

			var e = document.getElementById("head_all_sel");
			if (e)	{
				var x = e.getAttribute("check");
				if ( x == "1")	{
					e.setAttribute("check", "0");
					if (document.getElementById("tab_links").getAttribute("checked") == "true") self.tabSelectAll_links = 0;
					else if (document.getElementById("tab_images").getAttribute("checked") == "true") self.tabSelectAll_images = 0;
					else if (document.getElementById("tab_docs").getAttribute("checked") == "true") self.tabSelectAll_docs = 0;
					else if (document.getElementById("tab_videos").getAttribute("checked") == "true") self.tabSelectAll_videos = 0;
				}
			}
		}

		// ---------------------------------------------------- 
		this.repaintThreadsList = function( noClear ){
			
			if ( typeof noClear == 'undefined' )  noClear = false; 
			
			var mode = GetThemAll.Prefs.get( "gta.links_mode" );
			if (["video", "link", "image", "file"].indexOf(mode) == -1) mode = "link";  		

			var sorting = GetThemAll.Prefs.get( "gta.links_sorting" );
			var view = _b(GetThemAll.Prefs.get( "gta.flag_image_preview" ));
			var container = container = document.getElementById("download_item_container");

			set_Flag_SelectAll( );
			
			threadsOfActiveMode( mode, sorting, function( threads ){
						if( threads )	{
							
							if (!noClear) {			
								while( container.firstChild )	{
									container.removeChild( container.firstChild );
								}
							}	

							threads.forEach(function( thread ){
										try		{
										
											var item = null;
											if (view && mode == "image")	{
												item = buildThreadItemAlternative( thread, mode );	
												
												if (item) container.appendChild( item );				
											}	
											else	{
												item = buildThreadItem( thread, mode );	
												
												if (item) container.appendChild( item );				
											}	
								
										}
										catch( ex )		{
											console.log( ex );				
										}
									});
						}
						
						GetThemAll.Popup.box_Youtube();
					});
					
			// количественные данные
			if ( self.ListMedia != null )	{
 				buildThreadCount( { link: self.ListMedia.k_link, vlink: self.ListMedia.v_link,
									image: self.ListMedia.k_image, vimage: self.ListMedia.v_image,
									file: self.ListMedia.k_file, vfile: self.ListMedia.v_file,
									video: self.ListMedia.k_video, vvideo: self.ListMedia.v_video  } );	 
			}
			
            Ps.update(document.getElementById('gta_downloader_list'));
			
		}
		
		// ---------------------------------------------------- 
		this.rebuildThreadsList = function(noClear){
			
			if ( typeof noClear == 'undefined' )  noClear = false; 
			
			GetThemAll.Utils.getActiveTab( function( tab ) {
			
							if( !tab )	{
								self.ListMedia = null;	
							}
							else	{
								self.ListMedia = GetThemAll.Media.Storage.getLink( tab.id );
							}

							clear_Flag_SelectAll(  );
							
							self.repaintThreadsList(noClear);
							
							GetThemAll.Popup.box_Youtube();
							
							set_button_save_link(self.ListMedia);
						});	
						
		}	
		
		function set_button_save_link(list) {
			
			if (list) {
				document.getElementById("savelinkButton").removeAttribute( "disabled" )	
			}
			else {
				document.getElementById("savelinkButton").setAttribute( "disabled", "true" )	
			}	
			
		}	

		// ----------------------------------------------
		this.box_Youtube = function() {
			
			var mode = GetThemAll.Prefs.get( "gta.links_mode" );
			var x1 = document.getElementById("masterMain");
			var x2 = document.getElementById("messageBox");
			var x3 = document.getElementById("messageBoxReload");
			if (x3) x3.setAttribute( "style", "display: none" );
			
			GetThemAll.Utils.getActiveTab(function( tab ){
								
								if (tab) {	
									if ( GetThemAll.noYoutube && mode == "video" )	{
										if (self.isYoutubeUrl(tab.url)) 	{
											self.is_youtube = true;
											return;
										}
									}
									
									if (x2) x2.setAttribute( "style", "display: none" );
									
									if (self.ListMedia) {
										if (x1) {
											var xx = x1.setAttribute("data-message", '1');
											if (xx != '1')	x1.removeAttribute( "style" );
										}	
									}
									else {
										if (x1) x1.setAttribute( "style", "display: none" );
										if (x3) x3.setAttribute( "style", "display: block" );
									}	
									
									if (self.isYoutubeUrl(tab.url)) 	self.is_youtube = true;
									else						self.is_youtube = false;
								}	
			});
									
		}

		// ----------------------------------------------
		function  buildPopupFilter()  {
			
			var block_link = document.getElementById("filter_links").querySelector('.gta_downloader_filter_set_content');			
			for (var i=0; i<FILTER_LINK.length; i++) {
				var item = document.createElement('div');
				item.setAttribute('class', 'gta_downloader_filter_item');
				item.innerHTML = '<label class="gta_downloader_check">'+
								 '	<input type="checkbox" id="filter_'+FILTER_LINK[i].id+'" class="gta_downloader_check_element">'+
								 '	  <span class="gta_downloader_check_block"><i></i></span>'+
								 FILTER_LINK[i].title+ 
								 '</label>';
				block_link.appendChild(item);				
			}	
			
			var block_link = document.getElementById("filter_images").querySelector('.gta_downloader_filter_set_content');			
			for (var i=0; i<FILTER_IMAGES.length; i++) {
				var item = document.createElement('div');
				item.setAttribute('class', 'gta_downloader_filter_item');
				item.innerHTML = '<label class="gta_downloader_check">'+
								 '	<input type="checkbox" id="filter_'+FILTER_IMAGES[i].id+'" class="gta_downloader_check_element">'+
								 '	  <span class="gta_downloader_check_block"><i></i></span>'+
								 FILTER_IMAGES[i].title+ 
								 '</label>';
				block_link.appendChild(item);				
			}	
			
			var block_link = document.getElementById("filter_docs").querySelector('.gta_downloader_filter_set_content');			
			for (var i=0; i<FILTER_FILE.length; i++) {
				var item = document.createElement('div');
				item.setAttribute('class', 'gta_downloader_filter_item');
				item.innerHTML = '<label class="gta_downloader_check">'+
								 '	<input type="checkbox" id="filter_'+FILTER_FILE[i].id+'" class="gta_downloader_check_element">'+
								 '	  <span class="gta_downloader_check_block"><i></i></span>'+
								 FILTER_FILE[i].title+ 
								 '</label>';
				block_link.appendChild(item);				
			}	
			
			var block_link = document.getElementById("filter_videos").querySelector('.gta_downloader_filter_set_content');			
			for (var i=0; i<FILTER_VIDEO.length; i++) {
				var item = document.createElement('div');
				item.setAttribute('class', 'gta_downloader_filter_item');
				item.innerHTML = '<label class="gta_downloader_check">'+
								 '	<input type="checkbox" id="filter_'+FILTER_VIDEO[i].id+'" class="gta_downloader_check_element">'+
								 '	  <span class="gta_downloader_check_block"><i></i></span>'+
								 FILTER_VIDEO[i].title+ 
								 '</label>';
				block_link.appendChild(item);				
			}	
			
		}	
		
		const SCALE = [ {scale: 0.7,  width: 560, height: 420, left: -170, top: -130 },
						{scale: 0.8,  width: 640, height: 480, left: -100, top: -80  },
 						{scale: 0.9,  width: 720, height: 540, left: -40,  top: -30  },
						{scale: 1,    width: 800, height: 600, left: 0,    top: 0    },
					  ];
		
		// ----------------------------------
		function selScale( x ) {

			var y = [];
			for (var i in SCALE) {
				y.push( {x: Math.abs( SCALE[i].scale - x), y: SCALE[i].scale});
			}	
			
			y.sort( function( item1, item2 ) {	  
							return item1['x'] < item2['x'] ? -1 : 1;	
					} );

			for (var i in SCALE) {			
			
				if (SCALE[i].scale == y[0].y)   return SCALE[i];
			
			}
			
			return SCALE[2];
		}	
		
		// ----------------------------------------------
		this.init = function(){		
		
			if(GetThemAll.Media.scaleChange != GetThemAll.Media.scaleZoom) {
			}
		
			var scale = GetThemAll.Prefs.get( "gta.display_scale" );
			var w = null, h = null;
		
			if (scale == 'auto') {
				scaleZoom = Math.round((1/GetThemAll.Media.scaleZoom) *100)/100;
				var y = Math.round(290*(1-GetThemAll.Media.scaleZoom));
				var x = Math.round(400*(1-GetThemAll.Media.scaleZoom));
				document.body.setAttribute('style', 'transform: scale('+scaleZoom+') translate('+x+'px,'+y+'px)');
			}	
			else {
				var fl_scale = true;		
				if (scale==1 && GetThemAll.Media.scaleZoom==1) {
					if (GetThemAll.Media.widthWin && GetThemAll.Media.widthWin<800) {
						scale = 0.8;	
					}	 
					else {
						fl_scale = false;	
					}	
				}
				
				if (fl_scale) {	
					scale = Math.round((scale/GetThemAll.Media.scaleZoom) *100)/100;
					var p = selScale( scale );					
	 
					document.body.setAttribute('style', 'transform: scale('+p.scale+') translate('+p.left+'px,'+p.top+'px)'); 
					scaleZoom = p.scale;
					
					var hh = document.getElementsByTagName('html');
					hh[0].style.width = ""+p.width;
					hh[0].style.height = ""+p.height;
				}	
			}	

		
			Ps.initialize( document.getElementById('gta_downloader_list'), 
						  { suppressScrollX: true,   } );
			
			buildPopupFilter();
	
			this.tabSelectAll_links = "0";
			this.tabSelectAll_images = "0";
			this.tabSelectAll_docs = "0";
			this.tabSelectAll_videos = "0";

			self.rebuildThreadsList();

			var now = new Date().getTime();

			chrome.extension.onMessage.addListener( function( request ) {
				
								if( request.subject == "mediaForTabUpdate" )	{
									GetThemAll.Utils.getActiveTab( function( tab ){
												if( tab && tab.id == request.data )	{
													self.rebuildThreadsList(true);  // не перерисовывать
												}
											});
								}
								else if( request.subject == "start_download" ) {
									set_button_download( 1, request.count );
								}	
								else if( request.subject == "finish_download" ) {
									set_button_download( 2, 0 );
									clear_item_download( );
								}	
								else if( request.subject == "status_download" ) {
									set_button_download( 0, request.count, request.size );
									set_item_download( request.id, 2 );
								}	
								else if( request.subject == "load_zip_download" ) {
									set_item_download( request.id, 1 );
								}	
								else if( request.subject == "start_download_streams" ) {
									set_item_download_stream( request.id, 'start' );
								}	
								else if( request.subject == "load_download_streams" ) {
									set_item_download_stream( request.id, request.progress, request.size );
								}	
								else if( request.subject == "finish_download_streams" ) {
									set_item_download_stream( request.id, null );
								}	
								else if( request.subject == "save_download_streams" ) {
									var item = document.querySelector('[item="'+request.id+'"');
									var e =  item.querySelector(".js-download-button");
									e.parentNode.removeAttribute( "loading");
									e.textContent='Stop';
								}	
								else if( request.subject == "load_download_record" ) {
									set_item_download_record( request.id, request.count, request.size );
								}	
								else if( request.subject == "mediaDownloadState" )  {
									download_set( request );
								}	
							} );

			self.init_Format();

			// --- Rate
			var now = new Date().getTime();
			var elem = document.getElementById("help_link_rate");
			if (elem)	{
				if( now - GetThemAll.Prefs.get( "install_time" ) < INTERVAL_TO_DISPLAY_WRITE_REVIEW )		{
					elem.parentNode.style.display = "none";
				}
				if( !_b(GetThemAll.Prefs.get( "popup.display_rate" )) )	{
					elem.parentNode.style.display = "none";
				}
				if ( !GetThemAll.noYoutube )  {
					elem.parentNode.style.display = "none";
				}
				
				menu = document.createElement( "div" );
				menu.setAttribute( "id", "help_link_rate_review" );
				menu.style.display = "none";
				elem.appendChild(menu);
				
				span = document.createElement( "span" );
				span.setAttribute( "class", "help_link_rate_title" );
				span.textContent = "What do you think?";
				menu.appendChild(span);

				var buttonContent2 = '<span style="margin-right:5px;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI2Q0ExOUU2Q0U5MzExRTJCRUI5QTUwMkI5OEY0M0ZFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI2Q0ExOUU3Q0U5MzExRTJCRUI5QTUwMkI5OEY0M0ZFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QjZDQTE5RTRDRTkzMTFFMkJFQjlBNTAyQjk4RjQzRkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QjZDQTE5RTVDRTkzMTFFMkJFQjlBNTAyQjk4RjQzRkUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5y/i71AAACYklEQVR42qRUS2sTURT+7kzM5NFJ0pQk0or2kYRAi1I34qpoFy5UBEFxJxR/QcGdIoiudFHBhQuFIG5LEZetLoJpfZWWFmkxpY4So/ZhzWsmk8nc60mjRTvueuBwX+d85zvfvTNMCIG9mIQ9mmtndo21RhtJtOMB1NhRWBurqNhzqCIDBVmksYLTFNNOflPsAmiaQCdUjKP77ACiXgLjg7ClQejlEazNfsLw2nMCGgPHopNBa3UV8VMD2FwGZGKkBGmvDVADQPjMISRqI8hlLqCQf0jRo/9qIHAQ0dA5FEuAvwZ4VNqjY94A6mXA+AIwDhw+ryKEi04RZeqdH+gBikAgRInUI2vqwloja4LVCYjO63jlbEGQNJH9VJkC5XVaU5Ik/a4htivATawMC9Cx5GQg4TVWp55tB/uSwL5mCzSX3bTuJI9RIjHQsiYsTDsZSPhMyJfwZvIK+lK30HNEhV2hqhGgQKIXZnMwMIEGnsKHmf+10GSpU8ubCEb8cBFlTuovpN//mMdtbVoel07YdYtIlLaAYQeAsQ0SQhe7gVhSAjeBuSfa/ax6+dH3noV5OeBKvPXLuW8fbeQ/QOzW4PjMEN5tIIVIKgEf3f/iRPX6VPjuaK7f9bOqHEspegLY6urwszZFcTOHiDbd+Vi+X6svL00ic6+cfoE7j7/2ad2K1ethvF0IppL7O7w+bzwe38ljf77Gk0NDeCl7WK++EQialei6pDafkUouuQQzG4xXdcMob9ZqZVPTTM658ymrshArlrcY1HnR5WfhkCR03ipjNQTM0vqaYXm8jb9/Ab8EGAAOWeW36rTgEQAAAABJRU5ErkJggg==" align="left"></span>Bad';
				var button2 = document.createElement("button");
				button2.setAttribute("class", "help_link_rate_button");
				button2.setAttribute("type", "button");
				button2.setAttribute("id", "help_link_rate_bad");
				button2.innerHTML = buttonContent2;
				menu.appendChild(button2);
				button2.addEventListener( "click", function(){
								self.set_no_rating();
								var m = document.getElementById("help_link_rate_review");
								setTimeout( function() {   m.style.display = "none";		}, 500);
							}, false );
				
				var buttonContent1 = '<span style="margin-right:5px;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjdCRkM1QTIyQ0U5MzExRTJCNDlEOTdEQjg5QkY1MzVEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjdCRkM1QTIzQ0U5MzExRTJCNDlEOTdEQjg5QkY1MzVEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6N0JGQzVBMjBDRTkzMTFFMkI0OUQ5N0RCODlCRjUzNUQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6N0JGQzVBMjFDRTkzMTFFMkI0OUQ5N0RCODlCRjUzNUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5nMHf4AAACmUlEQVR42qRSTU8TURQ9M1PaOqVFSmkhgJgmQCoYCEElxpiImpi4MXHpkq1xReLKxJWJ7mTtj9AYNFEXLDGoNIALgVCpWApi25nOTGfa+fC0hUBcyMJ5ufPeu+/d88499wqe5+F/Pl/j/1AA6jgSutCK+xAQh4XX0Gj79CdoYZpGE2kumvefeY1tc+M2VjGExFFEIlcRwAh9Ik4geBxA5MsJdIymkLw2hK6Bu/Tc5Enrv0DEY2uX4xfMnSxkGeg7P45ucYb+YTiEPpFBC01ABkv5OWQ3MgiHBQzeuIKR2BOE8AA6gWqQ/wbzHcwCh0S4foKdhmlKqBkULhLEuYkpFLJJFNcuw7C/UNxVmEiTbZFxhtAo44wQZfggIphG1/gtxBO98FcBpwLIcfJsBWyqrO7XkFvcQL44S6CPeOot+Q6yTyGI64gP3UMi5keLzgCaFwQqCstrAafaWaOeeqIp6O8myZToWGpqEGBm/oYWfqiqhIreFEbgseeQCQFsmsj3omeA9v5h9sWFIxGDFE9iXsb6J+hmFSaDHWol8VgiiwC7yM9ZYFouGcEKMbLtSEQTu3wwzTw/sOoDLEm0rit8ZCyQmiTXAT2ov3X8XC8in19ElfcPAZ6v98BwxO247LydblmZQmxsErGzrAyZVExAyQK5vZ2VzcL7+W/2m0sRLAyFUWo7BNi2ZLgeXLXsLs+mO2cnSqWdvvhaqua4mla2iht5Zyu9J6aXCx2fF3LO1xdjinax/VgfhCQbEhkbDrS5XORVtVbKRr8ryfm9tqphueUtzbe9WQn+KNSgQK14L7NB7Ooma84M633w+E4SIgEsCp7RJNzuVZDRw+Kj1W4/RNffGYQUcHS7rJQstVSy4TguBAFuuYw/AgwAs58ROceXw74AAAAASUVORK5CYII=" align="left"></span>Good';
				var button1 = document.createElement("button");
				button1.setAttribute("class", "help_link_rate_button");
				button1.setAttribute("type", "button");
				button1.setAttribute("id", "help_link_rate_good");
				button1.innerHTML = buttonContent1;
				menu.appendChild(button1);
				button1.addEventListener( "click", function(){
								self.set_no_rating();
								self.give_us_rating();
							}, false );
			
				elem.addEventListener( "click", function(){
								self.clickMenu = true;
								var m = document.getElementById("help_link_rate_review");
								if (m.style.display == "none")  m.style.display = "block";
													else m.style.display = "none";
							}, false );
				
				document.addEventListener( "click", function(){
								if (self.clickMenu == true)		{
									self.clickMenu = false;
								}
								else		{	
									var m = document.getElementById("help_link_rate_review");
									m.style.display = "none";
								};
							}, false );
			}
			
			var showMessageRate = GetThemAll.Prefs.get( "gta.rate_message.show" );
			var elem = document.getElementById("GtaSuggestionMessage");
			if (elem) {
				if (showMessageRate == 1) {
					elem.removeAttribute("hidden");	
				}	
				elem.addEventListener( "click", function(){
										GetThemAll.Prefs.set( "gta.rate_message.show", 2 );
										self.navigate_url(URL_RATE_REVIEW);
									}, false );
			}						
			
			GetThemAll.AD.rotateOnPage();
			
			if (GetThemAll.Media.isDownload) {
				set_button_download( 3, 0 );
			}	
			
		}
		
		// ----------------------------------------------
		function download_set( request ){	

			var item = document.querySelector( '[item="'+request.id+'"]' );			
			if (!item) return;
			
			var btn =	item.querySelector(".js-download-button");
			var e_siz =	item.querySelector(".item_size");

			if (request.status == 'start') {
				item.setAttribute( "status", 'start' );
				btn.textContent = 'Cancel';
				btn.parentNode.style['background'] = '-webkit-linear-gradient(90deg, #FC2B53, #F9869C)';
			}
			else if (request.status == 'stop') {
				item.setAttribute( "status", 'stop' );
				btn.textContent = 'Download';
				btn.parentNode.style['background'] = '-webkit-linear-gradient(90deg, #4da5d8, #58d2fd)';
			}
			else if (request.status == 'progress') {
				if( request.size && request.size>0 )	{
					e_siz.textContent = str_download_size( request.size );
				}
			}
			
		}
		
		// ----------------------------------------------
		this.give_us_rating = function(){

			var url = URL_RATE_REVIEW;

			chrome.tabs.create( {	active: true,
									url: url
								}, function( tab ){ }
							);
		}
		// ----------------------------------------------
		this.set_no_rating = function(){
			GetThemAll.Prefs.set( "popup.display_rate", false );
		}
		
		// ---------------------------------------------------- 
		this.init_Format = function(){
		
			var mode = GetThemAll.Prefs.get( "gta.links_mode" );
		
			// ---- форматы
			var filters = document.getElementById("filter_block");
			var elems = filters.querySelectorAll( ".gta_downloader_check_element" );
			for (var i=0; i<elems.length; i++)	{
				if ( elems[i].type=="checkbox" && elems[i].id.indexOf("filter_") != -1 )	{
					var id = elems[i].getAttribute("id");
					var x = GetThemAll.Prefs.get( "gta."+id );
				
					if (x && x=="true") elems[i].setAttribute("checked","true");
				
					elems[i].addEventListener( "change", function(event){
								self.change_Format( this );		
							}, false );				
				}			
				if ( elems[i].type=="checkbox" && elems[i].id == "flag_image_preview" )	{
					document.getElementById("flag_image_preview").checked  = _b(GetThemAll.Prefs.get( "gta.flag_image_preview" ));
				}
				if ( elems[i].type=="text" && elems[i].id == "filter_image_size" )	{
					document.getElementById("filter_image_size").value  = GetThemAll.Prefs.get( "gta.filter_image_size" );
				}
			}
			
			var elem_size = document.getElementById("filter_image_size");
			const arrKey = [48,49,50,51,52,53,54,55,56,57,190,96,97,98,99,100,101,102,103,104,105,110,8,37,39,46];
			if (elem_size)	{
				elem_size.addEventListener( "keydown", function(event){
				
								if (arrKey.indexOf(event.keyCode) == -1)	{
									// отменить дальнейшую обработку
									event.returnValue = false;
									event.stopPropagation();
									event.preventDefault();
									return false;								
								}
				
							}, false );
				elem_size.addEventListener( "keyup", function(event){
									GetThemAll.Prefs.set( "gta.filter_image_size", this.value )
									self.repaintThreadsList();			
							}, false );
			}

			var elem_view = document.getElementById("flag_image_preview");
			if (elem_view)	{
				elem_view.addEventListener( "change", function(event){
				
								var v = document.getElementById("flag_image_preview").checked;
								if (v)	GetThemAll.Prefs.set( "gta.flag_image_preview", "true" );
								else	GetThemAll.Prefs.set( "gta.flag_image_preview", "false" );

								self.repaintThreadsList();			
							}, false );
			}
			
			
			var srtn = GetThemAll.Prefs.get( "gta.links_sorting" );
			if (mode == "link" && (srtn == "asc_size" || srtn == "desc_size") ) srtn == "none";
			var e1 = document.getElementById("sort_url");
			var e2 = document.getElementById("sort_descr");
			var e3 = document.getElementById("sort_size");
			if (srtn == "asc_url")	{
				e1.setAttribute("sort", "asc");
				e2.setAttribute("sort", "none");
				e3.setAttribute("sort", "none");
			}
			else if (srtn == "desc_url")  {
				e1.setAttribute("sort", "desc");
				e2.setAttribute("sort", "none");
				e3.setAttribute("sort", "none");
			}
			else if (srtn == "asc_title")	{
				e2.setAttribute("sort", "asc");
				e1.setAttribute("sort", "none");
				e3.setAttribute("sort", "none");
			}
			else if (srtn == "desc_title")	{
				e2.setAttribute("sort", "desc");
				e1.setAttribute("sort", "none");
				e3.setAttribute("sort", "none");
			}
			else if (srtn == "asc_size")  {
				e3.setAttribute("sort", "asc");
				e2.setAttribute("sort", "none");
				e1.setAttribute("sort", "none");
			}
			else if (srtn == "desc_size")  {
				e3.setAttribute("sort", "desc");
				e2.setAttribute("sort", "none");
				e1.setAttribute("sort", "none");
			}
			else  {
				e1.setAttribute("sort", "none");
				e2.setAttribute("sort", "none");
				e3.setAttribute("sort", "none");
			}
		}	

		// ----------------------------------------------------   
		function clear_format( tip ){

			var filters = document.getElementById("filter_block");
			var elems = filters.querySelectorAll( "input" );
		
			for (var i=0; i<elems.length; i++)
			{
				var id = elems[i].getAttribute("id");
				if ( id.indexOf("filter_"+tip+"_all") != -1) continue; 
				if ( id.indexOf("filter_image_preview") != -1) continue; 
				if ( id.indexOf("filter_image_size") != -1) continue; 
				if ( id.indexOf("filter_"+tip) != -1)
				{
					elems[i].checked = false;
					GetThemAll.Prefs.set( "gta."+id , "false" );
				}	
			}
		
		}
		// ----------------------------------------------------   
		function set_one_format( tip ){

			var filters = document.getElementById("filter_block");
			var elems = filters.querySelectorAll( "input" );
		
			for (var i=0; i<elems.length; i++)
			{
				var id = elems[i].getAttribute("id");
				if ( id.indexOf("filter_"+tip+"_all") != -1) continue; 
				if ( id.indexOf("filter_image_size") != -1) continue; 
				if ( id.indexOf("filter_"+tip) != -1) 
				{
					if ( elems[i].checked )   return;   
				}	
			}

			for (var i=0; i<elems.length; i++)
			{
				var id = elems[i].getAttribute("id");
				if ( id.indexOf("filter_"+tip+"_all") != -1) continue; 
				if ( id.indexOf("filter_image_size") != -1) continue; 
				if ( id.indexOf("filter_"+tip) != -1) 
				{
					elems[i].checked = true;
					GetThemAll.Prefs.set( "gta."+id , "true" );
					return;   
				}	
			}
		}
		
		
		// ---------------------------------------------------- 
		this.change_Format = function( elem ){

			var id = elem.getAttribute("id");
			var x = elem.checked;
			if (x)	GetThemAll.Prefs.set( "gta."+id , "true" );
			else GetThemAll.Prefs.set( "gta."+id , "false" );
			
			if ( id == "filter_link_all" )
			{
				if ( x )		clear_format( "link" );
				else			set_one_format( "link" );
			}	
			else if ( id == "filter_image_all" )
			{
				if ( x )		clear_format( "image" );
				else			set_one_format( "image" );
			}	
			else if ( id == "filter_file_all" )
			{
				if ( x )		clear_format( "file" );
				else			set_one_format( "file" );
			}	
			else if ( id == "filter_video_all" )
			{
				if ( x )		clear_format( "video" );
				else			set_one_format( "video" );
			}
			else
			{
				if ( id.indexOf("link") != -1)
				{
					document.getElementById("filter_link_all").checked = false;
					GetThemAll.Prefs.set( "gta.filter_link_all" , "false" );
				}
				else if ( id.indexOf("image") != -1)
				{
					document.getElementById("filter_image_all").checked = false;
					GetThemAll.Prefs.set( "gta.filter_image_all" , "false" );
				}
				else if ( id.indexOf("file") != -1)
				{
					document.getElementById("filter_file_all").checked = false;
					GetThemAll.Prefs.set( "gta.filter_file_all" , "false" );
				}
				else if ( id.indexOf("video") != -1)
				{
					document.getElementById("filter_video_all").checked = false;
					GetThemAll.Prefs.set( "gta.filter_video_all" , "false" );
				}
			}	
			
			this.repaintThreadsList();			
			
		}
		// ---------------------------------------------------- 
		this.DownloadOne = function(id){
			
			var media = null;

			self.ListMedia.link.forEach( function( item )  {
						if ( item.id == id)	{
							media = item;		
						}	
			} ); 
			self.ListMedia.image.forEach( function( item )  {
						if ( item.id == id)	{
							media = item;		
						}	
			} ); 
			self.ListMedia.file.forEach( function( item )  {
						if ( item.id == id)	{
							media = item;		
						}	
			} ); 
			self.ListMedia.video.forEach( function( item )  {
						if ( item.id == id)	{
							media = item;		
						}	
			} ); 
			
			if (media) {
				GetThemAll.Utils.getActiveTab( function( tab )  {		
					GetThemAll.Media.clickOneDownload( media, tab );
				});	 
			}
			
		}
		
		// ---------------------------------------------------- 
		this.DownloadList = function(){

			if (GetThemAll.Media.isDownload) {		
				GetThemAll.Media.isDownload = false;
				GetThemAll.Media.stopListDownload( );
			}
			else {
		
				var list = [];
				if (self.ListMedia.k_link>0) 	{
					self.ListMedia.link.forEach( function( item )  {
								if ( item.vubor == 1)	{
									item.vubor == 0;		
									GetThemAll.Utils.getActiveTab( function( tab ){		GetThemAll.Media.Storage.setData_Status( tab.id, item.id, 0 );		});
									list.push( item );
								}	
							} ); 
				}			
				
				if (self.ListMedia.k_image>0) 	{
					self.ListMedia.image.forEach( function( item )  {
								if ( item.vubor == 1)	{
									item.vubor == 0;		
									GetThemAll.Utils.getActiveTab( function( tab ){		GetThemAll.Media.Storage.setData_Status( tab.id, item.id, 0 );		});
									list.push( item );
								}	
							} ); 
				}			
				
				if (self.ListMedia.k_file>0) {
					self.ListMedia.file.forEach( function( item )  {
								if ( item.vubor == 1)	{
									item.vubor == 0;		
									GetThemAll.Utils.getActiveTab( function( tab ){		GetThemAll.Media.Storage.setData_Status( tab.id, item.id, 0 );		});
									list.push( item );
								}	
							} ); 
				}			
				
				if (self.ListMedia.k_video>0) 	{
					self.ListMedia.video.forEach( function( item )  {
								if ( item.vubor == 1)	{
									item.vubor == 0;		
									GetThemAll.Utils.getActiveTab( function( tab ){		GetThemAll.Media.Storage.setData_Status( tab.id, item.id, 0 );		});
									list.push( item );
								}	
							} ); 
				}			
				
				if (list.length>0) {
					GetThemAll.Utils.getActiveTab( function( tab )  {		
						GetThemAll.Media.startListDownload( list, tab.title );
					});	
					
				}	
				
				var container = document.getElementById("download_item_container");
				var elems = container.querySelectorAll( ".item_sel" );
				for (var i=0; i<elems.length; i++)	{
					elems[i].checked = false;
				}	
				
			}	
			
		}
		
		// ---------------------------------------------------- 
		this.SelectAll = function(){
		
			var view = _b(GetThemAll.Prefs.get( "gta.flag_image_preview" ));
		
			var cl = 'div.item_sel';
			var container = document.getElementById("download_item_container");
			
			var e = document.getElementById("head_all_sel");
			
			if (e)	{
				var x = e.getAttribute("check");
				if ( x == "1")	{		// unselect
					e.setAttribute("check", "0");
					GetThemAll.Utils.getActiveTab( function( tab ){
								var elems = container.querySelectorAll( '.js-item' );
								
								for (var i=0; i<elems.length; i++)	{
									var id = parseInt( elems[i].getAttribute("item") );
									var e = elems[i].querySelector(".item_sel");
									e.checked = false;
								    setCheck_ListMedia( id, 0);
								}
							});
					x = "0";
				}
				else	{				// select
					e.setAttribute("check", "1");
					GetThemAll.Utils.getActiveTab( function( tab ){
								var elems = container.querySelectorAll( '.js-item' );
								for (var i=0; i<elems.length; i++)	{
									var id = parseInt( elems[i].getAttribute("item") );
									var e = elems[i].querySelector(".item_sel");
									var d = e.getAttribute('disabled');
									if (d) continue;
								
									e.checked = true;
								    setCheck_ListMedia( id, 1);
								}
							});
					x = "1";
				}
				
			}

		}
		// ---------------------------------------------------- 
		this.SortMedia = function( tip ){
		
			if ( tip == "url" )
			{
				var e = document.getElementById("sort_url");
				var x = e.getAttribute("sort");
	
				if ( x == "none")
				{
					e.setAttribute("sort", "asc");
					GetThemAll.Prefs.set( "gta.links_sorting" ,  "asc_url" );
				}
				else if ( x == "asc")
				{
					e.setAttribute("sort", "desc");
					GetThemAll.Prefs.set( "gta.links_sorting" ,  "desc_url" );
				}
				else
				{
					e.setAttribute("sort", "none");
					GetThemAll.Prefs.set( "gta.links_sorting" ,  "none" );
				}
				var e1 = document.getElementById("sort_descr");
				e1.setAttribute("sort", "none");
				var e2 = document.getElementById("sort_size");
				e2.setAttribute("sort", "none");
			}
			else if ( tip == "descr" )
			{
				var e = document.getElementById("sort_descr");
				var x = e.getAttribute("sort");
				if ( x == "none")
				{
					e.setAttribute("sort", "asc");
					GetThemAll.Prefs.set( "gta.links_sorting" ,  "asc_title" );
				}
				else if ( x == "asc")
				{
					e.setAttribute("sort", "desc");
					GetThemAll.Prefs.set( "gta.links_sorting" ,  "desc_title" );
				}
				else
				{
					e.setAttribute("sort", "none");
					GetThemAll.Prefs.set( "gta.links_sorting" ,  "none" );
				}
				var e1 = document.getElementById("sort_url");
				e1.setAttribute("sort", "none");
				var e2 = document.getElementById("sort_size");
				e2.setAttribute("sort", "none");
			}
			else if ( tip == "size" )
			{
				var e = document.getElementById("sort_size");
				var x = e.getAttribute("sort");
				if ( x == "none")
				{
					e.setAttribute("sort", "asc");
					GetThemAll.Prefs.set( "gta.links_sorting" ,  "asc_size" );
				}
				else if ( x == "asc")
				{
					e.setAttribute("sort", "desc");
					GetThemAll.Prefs.set( "gta.links_sorting" ,  "desc_size" );
				}
				else
				{
					e.setAttribute("sort", "none");
					GetThemAll.Prefs.set( "gta.links_sorting" ,  "none" );
				}
				var e1 = document.getElementById("sort_url");
				e1.setAttribute("sort", "none");
				var e2 = document.getElementById("sort_descr");
				e2.setAttribute("sort", "none");
			}
			self.repaintThreadsList();
			
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
		// ----------------------------------------------
		this.navigate_url = function( url ){
			chrome.tabs.query( 	{
							url:  url 
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
																url: url
															}, function( tab ){ }
														);
									}
					} );
		}
		
		// ----------------------------------------------------- 
		this.show_rate_message = function(){

			var showMessageRate = GetThemAll.Prefs.get( "gta.rate_message.show" );

			if (showMessageRate == 0) {
				var now = new Date().getTime();

				if( now - GetThemAll.Prefs.get( "install_time" ) > INTERVAL_TO_DISPLAY_RATE )		{

					GetThemAll.Prefs.set( "gta.rate_message.show", 1 );
					showMessageRate = 1;
				}	
			}	

			if (showMessageRate == 1) {
				var elem = document.getElementById("GtaSuggestionMessage");
				if (elem) elem.removeAttribute("hidden");	
			}	

		}
		
		// ----------------------------------------------------- 
		this.ShowFilter = function(){

			var elem = document.getElementById("filter_block");
			var v = elem.style.display;
			if (v == 'block') {
				elem.style.display = 'none';
			}
			else {
				elem.style.display = 'block';
			}	

		}
		this.CloseFilter = function(){

			var elem = document.getElementById("filter_block");
			elem.style.display = 'none';

		}
		// -----------------------------------------------	
		this.filtering_mask = function(){

			var text = document.getElementById("filter_mask_text").value;
			if (text.length == 0) return;
			
			var container = document.getElementById("download_item_container");
			var elems = container.querySelectorAll( '.js-item' );
								
			for (var i=0; i<elems.length; i++)	{
				var id = parseInt( elems[i].getAttribute("item") );
				var e = elems[i].querySelector(".item_sel");
				if (check_mask(id, text)) {
					e.checked = true;
					setCheck_ListMedia( id, 1);
				}	
				else {
					e.checked = false;
					setCheck_ListMedia( id, 0);
				}	
			}

		}
		function check_mask(id, text) {
			
			var f = false;
			if (self.ListMedia.k_link>0) {
				self.ListMedia.link.forEach( function( item ){
							if ( item.id == id)	{
								if ( item.url.indexOf(text) != -1 ) f = true;
							}	
						});
				if (f) return true;		
			}			
			if (self.ListMedia.k_image>0) {
				self.ListMedia.image.forEach( function( item ){
							if ( item.id == id)		{
								if ( item.url.indexOf(text) != -1 ) f = true;
							}	
						} );
				if (f) return true;		
			}			
			if (self.ListMedia.k_file>0) {
				self.ListMedia.file.forEach( function( item ){
							if ( item.id == id)		{
								if ( item.url.indexOf(text) != -1 ) f = true;
							}	
						} );
				if (f) return true;		
			}			
			if (self.ListMedia.k_video>0) {
				self.ListMedia.video.forEach( function( item ){
							if ( item.id == id)		{
								if ( item.url.indexOf(text) != -1 ) f = true;
							}	
						} );
				if (f) return true;		
			}			
			
			return false;
		}	
		
		// ----------------------------------------------------- 
		this.SaveLink = function(){

			if (self.ListMedia) {
				GetThemAll.Utils.getActiveTab( function( tab ){
					GetThemAll.Media.SaveLink( self.ListMedia, tab.title );
				});	
			}
		
		}
		
		// ----------------------------------------------------- 
		this.ClearAllMedia = function(){

			var mode = GetThemAll.Prefs.get( "gta.links_mode" );
		
			GetThemAll.Utils.getActiveTab( function( tab ){
				GetThemAll.Media.Storage.removeTabDataMode( tab.id, mode );
				
				self.rebuildThreadsList();
		
			});
		
		}
		
		// -----------------------------------------------	
		
	}
	
	this.Popup = new Popup();
	
}).apply( GetThemAll );
