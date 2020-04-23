function _( msg ){
	
	return chrome.i18n.getMessage( msg );
	
}

(function(){
	
	var Locale = function(){
		
	}
	Locale.prototype = {
		localizeCurrentPage: function(){
			var elements = document.querySelectorAll( "*[msg]" );
			for( var i = 0, len = elements.length; i != len; i++ ){
				var element = elements[i];
				
				if( element.hasAttribute("msg_target") ){
					element.setAttribute( element.getAttribute("msg_target"), _( element.getAttribute("msg") ) );	
				}
				else{
					element.textContent = _( element.getAttribute("msg") );									
				}
				element.removeAttribute( "msg" );		
								
		
			}
		}
	}
	
	this.Locale = new Locale();
	
}).apply( GetThemAll );
