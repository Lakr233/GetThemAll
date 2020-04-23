// singletone


if (window == chrome.extension.getBackgroundPage()) 
{

	(function(){
		Prefs = function(){
		
		}
		
		Prefs.prototype = {
			_prefsPrefix: "prefs.",
			_changeListeners: [],
			
			// default values
			_defaults: {
				
				"install_time": 0,
				"snif_ad_signs": "",
				"last_ad_signs_download_time": "",
				"last_run_version": "",
				"is_first_run": true,
				"gta.filter_link_all": "true",
				"gta.filter_image_all": "true",
				"gta.filter_file_all": "true",
				"gta.filter_video_all": "true",
				"gta.flag_image_preview": "false",
				
				"gta.show_in_context_menu": true,				
				"gta.links_sorting": "none",
				"gta.links_mode": "link",
				"gta.download_warning": true,
				"gta.download_zip": true,

				"popup.display_rate": true,		
				"gta.show_save_text": true,		
				"gta.rate_message.show": 0,
				
				"gta.original_filename": false,
				"gta.display_vk_button": true,
				"gta.display_facebook_button": true,
				"gta.display_scale": 'auto',
				
			},
			
			dump: function( callback ){
				
				var result = {};
				for( var k in this._defaults ){
					result[k] = this.get(k);
				}
				
				callback(result);
				
			},
			
			toggle: function( name ){
				var newVal = !_b( this.get( name ) );
				this.set( name, newVal );
			},
			
			defaultValue: function( settingName ){
				if (typeof this._defaults[settingName] != "undefined") {
					return this._defaults[settingName];
				}
				else {
					return null;
				}
			},
			
			restore: function( settingName ){
				if (typeof this._defaults[settingName] != "undefined") {
					this.set( settingName, this._defaults[settingName] );
				}
				else {
		
				}
			},
			
			get: function(name, defaultValue){
			
				if (typeof defaultValue == "undefined") {
					if (typeof this._defaults[name] != "undefined") {
						defaultValue = this._defaults[name];
					}
					else {
						defaultValue = null;
					}
				}
				
				var name = this._name(name);
				if (typeof localStorage[name] == "undefined") {
					return defaultValue;
				}
				
				return localStorage[name];
			},
			
			set: function(name, value){
			
				var oldValue = this.get(name);
				
				var badListeners = [];
				
				if ( _r(oldValue) != _r(value) ) {
					localStorage[this._name(name)] = value;
					// call change listeners					
					for (var i = 0; i != this._changeListeners.length; i++) {
						var listener = this._changeListeners[i];
						// try catch exception because listener exception cannot breaks running listeners chain
						try{
							listener(name, value);
						}
						catch( ex ){
							badListeners.push( listener );
						}
												
					}
				}
				
				for( var i = 0; i != badListeners.length; i++ ){
					this.removeChangeListener( badListeners[i] );
				}
				
			},
			
			addChangeListener: function(listener){
				if (this._changeListeners.indexOf(listener) != -1) {
					return;
				}
				this._changeListeners.push(listener);
			},
			
			removeChangeListener: function(listener){
				var index = this._changeListeners.indexOf(listener);
				if (index != -1) {
					this._changeListeners.splice(index, 1);
				}
			},
			
			_name: function(name){
				return this._prefsPrefix + name;
			}
		}
		
		this.Prefs = new Prefs();
	}).apply( GetThemAll );
	
}
else
{
	GetThemAll.Prefs = chrome.extension.getBackgroundPage().GetThemAll.Prefs;
}
