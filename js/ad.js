(function(){
	
	function AD(){
	
		var self = this;
	
		this.filePath = function(){
			var os = GetThemAll.Utils.getOS();
			
			var fileName = "ad_" + os + ".txt";
			var fullPath = chrome.extension.getURL("data/" + fileName);
			
			return fullPath;
		}
	
		this.getRotationItem = function( callback ){
		
			GetThemAll.Utils.rotateText( self.filePath(), function( line ){
				
				if( !line ){
					callback( null );
					return;
				}
				
				var data = line.split("|");
				
				if( data.length < 2 ){
					callback( null );
					return;
				}
				
				callback({
					url: data[0],
					title: data[1]
				});
				
			} );
			
		}
		
		this.incrementRotateCounter = function(){
			GetThemAll.Utils.incrementRotateCounter( self.filePath() );
		}
		
		this.rotateOnPage = function(){
		
			self.getRotationItem( function( item ){
		
				if( !item )		return;
	
				var elems = document.querySelectorAll( "[rotatead]" );
				
				for( var i = 0; i != elems.length; i++ )
				{
					var elem = elems[i];
					elem.setAttribute( "href", item.url );
					elem.textContent = item.title;

					elem.addEventListener( "click", function(){

						self.incrementRotateCounter();
						self.rotateOnPage();
						
					}, false );
				}
				
			} );
			
		}
		
	}		
	
	this.AD = new AD();
		
}).apply( GetThemAll );
