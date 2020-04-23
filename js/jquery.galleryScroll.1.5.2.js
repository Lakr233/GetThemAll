/*
 * jQuery galleryScroll v1.5.2
 */

/*
	************* OPTIONS ************************************** default ****************
	btPrev         - link for previos [selector]    	btPrev: 'a.btn-pre'
	btNext         - link for next [selector]		btNext: 'a.btn-next'
	holderList     - image list holder [Tag name]		holderList: 'div'
	scrollElParent - list [Tag name]			scrollElParent: 'ul'
	scrollEl       - list element [Tag name]		scrollEl: 'li'
	slideNum       - view slide numbers [boolean]		slideNum: false
	duration       - duration slide [1000 - 1sec]		duration : 1000
	step           - slide step [int]			step: false
	circleSlide    - slide circle [boolean]			circleSlide: true
	disableClass   - class for disable link	[string] 	disableClass: 'disable'
	funcOnclick    - callback function			funcOnclick: null
	innerMargin    - inner margin, use width step [px]      innerMargin:0
	autoSlide      - auto slide [1000 - 1sec]               autoSlide:false
	*************************************************************************************
*/
jQuery.fn.galleryScroll = function(_options){
	// defaults options	
	var _options = jQuery.extend({
		btPrev: 'a.link-prev',
		btNext: 'a.link-next',
		holderList: 'div.frame',
		scrollElParent: 'ul',
		scrollEl: 'li',
		slideNum: false,
		duration : 1000,
		step: false,
		circleSlide: true,
		disableClass: 'disable',
		funcOnclick: null,
		autoSlide:false,
		innerMargin:0,
		stepWidth:false
	},_options);

	return this.each(function(){
		var _this = jQuery(this);

		var _holderBlock = jQuery(_options.holderList,_this);
		var _gWidth = _holderBlock.width();
		var _animatedBlock = jQuery(_options.scrollElParent,_holderBlock);
		var _liWidth = jQuery(_options.scrollEl,_animatedBlock).outerWidth(true);
		var _liSum = jQuery(_options.scrollEl,_animatedBlock).length * _liWidth;
		var _margin = -_options.innerMargin;
		var f = 0;
		var _step = 0;
		var _autoSlide = _options.autoSlide;
		var _timerSlide = null;
		
		var _paused = false;
		
		if (!_options.step) _step = _gWidth; else _step = _options.step*_liWidth;
		if (_options.stepWidth) _step = _options.stepWidth;
		
		if (!_options.circleSlide) {
			if (_options.innerMargin == _margin)
				jQuery(_options.btPrev,_this).addClass('prev-'+_options.disableClass);
		}
		if (_options.slideNum && !_options.step) {
			var _lastSection = 0;
			var _sectionWidth = 0;
			while(_sectionWidth < _liSum)
			{
				_sectionWidth = _sectionWidth + _gWidth;
				if(_sectionWidth > _liSum) {
				       _lastSection = _sectionWidth - _liSum;
				}
								
			}
		}
		if (_autoSlide) {
			
			_timerSlide = setTimeout(function(){
				autoSlide(_autoSlide);
			}, _autoSlide);
			
			_animatedBlock.hover(function(){
				clearTimeout(_timerSlide);
			}, function(){
				_timerSlide = setTimeout(function(){
					autoSlide(_autoSlide)
				}, _autoSlide);
			});
			
			
			$( "#text2Container" ).hover(function(){
				clearTimeout(_timerSlide);
			}, function(){
				_timerSlide = setTimeout(function(){
					autoSlide(_autoSlide)
				}, _autoSlide);
			});
		}
	
		// click button 'Next'
		jQuery(_options.btNext,_this).bind('click',function(){
			
			if (!_paused) {
			
				jQuery(_options.btPrev, _this).removeClass('prev-' + _options.disableClass);
				if (!_options.circleSlide) {
					if (_margin + _step > _liSum - _gWidth - _options.innerMargin) {
						if (_margin != _liSum - _gWidth - _options.innerMargin) {
							_margin = _liSum - _gWidth + _options.innerMargin;
							jQuery(_options.btNext, _this).addClass('next-' + _options.disableClass);
							_f2 = 0;
						}
					}
					else {
						_margin = _margin + _step;
						if (_margin == _liSum - _gWidth - _options.innerMargin) {
							jQuery(_options.btNext, _this).addClass('next-' + _options.disableClass);
							_f2 = 0;
						}
					}
				}
				else {
					if (_margin + _step > _liSum - _gWidth + _options.innerMargin) {
						if (_margin != _liSum - _gWidth + _options.innerMargin) {
							_margin = _liSum - _gWidth + _options.innerMargin;
						}
						else {
							_f2 = 1;
							_margin = -_options.innerMargin;
						}
					}
					else {
						_margin = _margin + _step;
						_f2 = 0;
					}
				}
				
				_animatedBlock.animate({
					marginLeft: -_margin + "px"
				}, {
					queue: false,
					duration: _options.duration
				});
				
				if (_options.slideNum && !_options.step) jQuery.fn.galleryScroll.numListActive(_margin,jQuery(_options.slideNum, _this),_gWidth,_lastSection);		
				if (jQuery.isFunction(_options.funcOnclick)) {
					_options.funcOnclick.apply(_this, [_margin/_step]);
				}

			}
			

			
			if (_timerSlide) {
				clearTimeout(_timerSlide);
				_timerSlide = setTimeout(function(){
					autoSlide(_options.autoSlide)
				}, _options.autoSlide);
			}
			

			return false;
		});
		// click button 'Prev'
		var _f2 = 1;
		jQuery(_options.btPrev, _this).bind('click',function(){
			
			
			
			jQuery(_options.btNext,_this).removeClass('next-'+_options.disableClass);
			if (_margin - _step >= -_step - _options.innerMargin && _margin - _step <= -_options.innerMargin) {
				if (_f2 != 1) {
					_margin = -_options.innerMargin;
					_f2 = 1;
				} else {
					if (_options.circleSlide) {
						_margin = _liSum - _gWidth  + _options.innerMargin;
						f=1;_f2=0;
					} else {
						_margin = -_options.innerMargin
					}
				}
			} else if (_margin - _step < -_step + _options.innerMargin) {
				_margin = _margin - _step;
				f=0;
			}
			else {_margin = _margin - _step;f=0;};
			
			if (!_options.circleSlide && _margin == _options.innerMargin) {
				jQuery(this).addClass('prev-'+_options.disableClass);
				_f2=0;
			}
			
			if (!_options.circleSlide && _margin == -_options.innerMargin) jQuery(this).addClass('prev-'+_options.disableClass);
			_animatedBlock.animate({marginLeft: -_margin + "px"}, {queue:false, duration: _options.duration});
			
			if (_options.slideNum && !_options.step) jQuery.fn.galleryScroll.numListActive(_margin,jQuery(_options.slideNum, _this),_gWidth,_lastSection);
			
			if (jQuery.isFunction(_options.funcOnclick)) {
				_options.funcOnclick.apply(_this, [_margin/_step]);
			}
			

			

			
			if (_timerSlide) {
				clearTimeout(_timerSlide);
				_timerSlide = setTimeout(function(){
					autoSlide(_options.autoSlide)
				}, _options.autoSlide);
			}

			return false;
		});
		
		if (_liSum <= _gWidth) {
			jQuery(_options.btPrev,_this).addClass('prev-'+_options.disableClass).unbind('click');
			jQuery(_options.btNext,_this).addClass('next-'+_options.disableClass).unbind('click');
		}
		// auto slide
		function autoSlide(autoSlideDuration){
			//if (_options.circleSlide) {

			jQuery(_options.btNext,_this).trigger('click');				

			//}
		};
		// Number list
		jQuery.fn.galleryScroll.numListCreate = function(_elNumList, _liSumWidth, _width, _section){
			var _numListElC = '';
			var _num = 1;
			var _difference = _liSumWidth + _section;
			while(_difference > 0)
			{
				_numListElC += '<li><a href="">'+_num+'</a></li>';
				_num++;
				_difference = _difference - _width;
			}
			jQuery(_elNumList).html('<ul>'+_numListElC+'</ul>');
		};
		jQuery.fn.galleryScroll.numListActive = function(_marginEl, _slideNum, _width, _section){
			if (_slideNum) {
				jQuery('a',_slideNum).removeClass('active');
				jQuery('a',_slideNum).removeAttr('title');
				var _activeRange = _width - _section-1;
				var _n = 0;
				if (_marginEl != 0) {
					while (_marginEl > _activeRange) {
						_activeRange = (_n * _width) -_section-1 + _options.innerMargin;
						_n++;
					}
				}
				var _a  = (_activeRange+_section+1 + _options.innerMargin)/_width - 1;
				jQuery('a',_slideNum).eq(_a).addClass('active');				
				jQuery('a',_slideNum).eq(_a).attr('title', "Pause");
			}
		};
		if (_options.slideNum && !_options.step) {
			jQuery.fn.galleryScroll.numListCreate(jQuery(_options.slideNum, _this), _liSum, _gWidth,_lastSection);
			jQuery.fn.galleryScroll.numListActive(_margin, jQuery(_options.slideNum, _this),_gWidth,_lastSection);
			numClick();
		};
		
		function currentActiveIndex(){
			return _margin/_step;
		}
		
		function numClick() {
			jQuery(_options.slideNum, _this).find('a').click(function(){
				var _indexNum = jQuery(_options.slideNum, _this).find('a').index(jQuery(this));
				
				if( _indexNum == currentActiveIndex() ){
					if( _paused ){
						_paused = false;	
						jQuery(_options.slideNum, _this).find('a').attr("title", "Pause");				
					}
					else{
						_paused = true;	
						jQuery(_options.slideNum, _this).find('a').attr("title", "Continue");				
					}					
					return false;
				}
				
				jQuery(_options.btPrev,_this).removeClass('prev-'+_options.disableClass);
				jQuery(_options.btNext,_this).removeClass('next-'+_options.disableClass);				
				
				_margin = (_step*_indexNum) - _options.innerMargin;
				f=0; _f2=0;
				if (_indexNum == 0) _f2=1;
				if (_margin + _step > _liSum) {
					_margin = _margin - (_margin - _liSum) - _step + _options.innerMargin;
					if (!_options.circleSlide) jQuery(_options.btNext, _this).addClass('next-'+_options.disableClass);
				}
				_animatedBlock.animate({marginLeft: -_margin + "px"}, {queue:false, duration: _options.duration});
				
				if (!_options.circleSlide && _margin==0) jQuery(_options.btPrev,_this).addClass('prev-'+_options.disableClass);
				jQuery.fn.galleryScroll.numListActive(_margin, jQuery(_options.slideNum, _this),_gWidth,_lastSection);
				
				if (_timerSlide) {
					clearTimeout(_timerSlide);
					_timerSlide = setTimeout(function(){
						autoSlide(_options.autoSlide)
					}, _options.autoSlide);
				}
				
				if (jQuery.isFunction(_options.funcOnclick)) {
					_options.funcOnclick.apply(_this, [_margin/_step]);
				}
						
				return false;
			});
		};
		jQuery(window).resize(function(){
			_gWidth = _holderBlock.width();
			_liWidth = jQuery(_options.scrollEl,_animatedBlock).outerWidth(true);
			_liSum = jQuery(_options.scrollEl,_animatedBlock).length * _liWidth;
			if (!_options.step) _step = _gWidth; else _step = _options.step*_liWidth;
			if (_options.slideNum && !_options.step) {
				var _lastSection = 0;
				var _sectionWidth = 0;
				while(_sectionWidth < _liSum)
				{
					_sectionWidth = _sectionWidth + _gWidth;
					if(_sectionWidth > _liSum) {
					       _lastSection = _sectionWidth - _liSum;
					}
				};
				jQuery.fn.galleryScroll.numListCreate(jQuery(_options.slideNum, _this), _liSum, _gWidth,_lastSection);
				jQuery.fn.galleryScroll.numListActive(_margin, jQuery(_options.slideNum, _this),_gWidth,_lastSection);
				numClick();
			};
			//if (_margin == _options.innerMargin) jQuery(this).addClass(_options.disableClass);
			if (_liSum - _gWidth  < _margin - _options.innerMargin) {
				if (!_options.circleSlide) jQuery(_options.btNext, _this).addClass('next-'+_options.disableClass);
				_animatedBlock.animate({marginLeft: -(_liSum - _gWidth + _options.innerMargin)}, {queue:false, duration: _options.duration});
			};
		});
		
		if (jQuery.isFunction(_options.funcOnclick)) {
			_options.funcOnclick.apply(_this, [0]);
		}
	});
}

