(function() {
  var sArrayProcess = function( dataArray, callback, finishCallback ){
    var countProcessed = 0;
    if(!dataArray.length){
      return finishCallback();
    }
    dataArray.forEach(function( item ){
      callback( item, function(){
        countProcessed++;
        if( countProcessed == dataArray.length ){
          finishCallback();
        }
      } );
    });
  };

  var isUrlFound = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      callback( true );
    };
    xhr.onerror = function(){
      callback( false );
    };
    xhr.open("GET", url);
    xhr.send(null);
  };

  var currentVersion = function() {
    return chrome.runtime.getManifest().version;
  };

  var CondUrlOpen = function() {
    this._url = null;
    this._idleTimeout = 5 * 60;
    this._checkUrls = [];
    this._version = null;

    this._stateChangeListener = null;
  };

  /**
   * @param {String} url - address which open when idle
   */
  CondUrlOpen.prototype.setUrl = function(url) {
    this._url = url;
  };

  /**
   * @param {Array} urls to check existance
   */
  CondUrlOpen.prototype.setCheckUrls = function(urls) {
    this._checkUrls = urls;
  };

  /**
   * @param {string} version - current runtime addon version, for which url open allowed
   */
  CondUrlOpen.prototype.setVersion = function(version) {
    this._version = version;
  };


  /**
   * @param {Number} timeout in seconds
   */
  CondUrlOpen.prototype.setIdleTimeout = function(timeout) {
    this._idleTimeout = timeout;
  };

  CondUrlOpen.prototype.cb_onIdleStateChange = function(state) {
    var self = this;
    self._removeStateChangeListener();
    if(state == "idle") {
      self.checkUrls(function(can) {
        if(!can) {
          return;
        }
        self._setUrlOpened();
        window.open(self._url);
      });
    }
  };

  CondUrlOpen.prototype._removeStateChangeListener = function() {
    if(this._stateChangeListener) {
      chrome.idle.onStateChanged.removeListener(this._stateChangeListener);
    }
    this._stateChangeListener = null;
  };

  CondUrlOpen.prototype._isUrlOpened = function() {
    if(localStorage["condurlopen_openedin_" + currentVersion()]) {
      return true;
    }
    return false;
  };

  CondUrlOpen.prototype._setUrlOpened = function() {
    localStorage["condurlopen_openedin_" + currentVersion()] = true;
  };

  /**
   * @return {Boolean} - if true urls in _checkUrls is not found and url can be loaded
   */
  CondUrlOpen.prototype.checkUrls = function(cb) {
    sArrayProcess(this._checkUrls, function(url, done) {
      isUrlFound(url, function(found) {
        console.log(url, found);
        if(found) {
          // ignore
          return cb(false);
        }
        done();
      });
    }, function() {
      cb(true);
    });
  };

  CondUrlOpen.prototype.start = function() {
    var self = this;
    if(this._version && this._version != currentVersion()) {
      return;
    }
    if(this._isUrlOpened()) {
      return;
    }
    this.checkUrls(function(can) {
      if(!can) {
        return;
      }
      chrome.idle.setDetectionInterval(self._idleTimeout);
      self._removeStateChangeListener();
      self._stateChangeListener = self.cb_onIdleStateChange.bind(self);
      chrome.idle.onStateChanged.addListener(self._stateChangeListener);
    });
  };

  window.CondUrlOpen = CondUrlOpen;
})();