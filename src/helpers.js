var utils = require('./utils'),
    forEach = utils.forEach;

/**
 * Internal utility functions
 */

var Helpers = function(client){
  this.settings = client.settings;
  this.accessTokenInactiveTimer = null;
  this.accessTokenCreationTimer = null;
};

/**
 * Prepend server onto path if path does not start with https?://
 * @param {string} server
 * @param {string} path
 * @returns {string} server + path
 */
Helpers.prototype.getAbsoluteUrl = function(server, path) {
  if (!this.isAbsoluteUrl(path)) {
    return server + (path.charAt(0) !== '/' ? '/' : '') + path;
  }
  else {
    return path;
  }
};

/**
 * Return true if this url is for the OAuth server
 * @param url
 * @returns {boolean}
 */
Helpers.prototype.isOAuthServerUrl = function(url) {
  return url.indexOf(this.settings.oauthServer[this.settings.environment]) === 0;
};

/**
 * Prepend api server to path if path doesn't start with https?://
 * @param path
 * @returns {string} server + path
 */
Helpers.prototype.getAPIServerUrl = function(path) {
  return this.getAbsoluteUrl(this.settings.apiServer[this.settings.environment], path);
};

/**
 * Prepend authorities server to path if path doesn't start with https?://
 * @param path
 * @returns {string} server + path
 */
Helpers.prototype.getAuthoritiesServerUrl = function(path) {
  return this.getAbsoluteUrl(this.settings.authoritiesServer[this.settings.environment], path);
};

/**
 * Append the access token to the url
 * @param {string} url url
 * @returns {string} url with access token
 */
Helpers.prototype.appendAccessToken = function(url) {
  if (url) {
    var params = this.decodeQueryString(url);
    url = this.removeQueryString(url);
    params['access_token'] = this.settings.accessToken;
    url = this.appendQueryParameters(url, params);
  }
  return url;
};

/**
 * log to console only if debugging is turned on
 */
Helpers.prototype.log = function() {
  if (this.settings.debug) {
    console.log.apply(null, arguments);
  }
};

/**
 * Call the callback on the next tick
 * @param {function()} cb Function to call
 */
Helpers.prototype.nextTick = function(cb) {
  this.settings.setTimeout(function() {
    cb();
  },0);
};

/**
 * borrowed from AngularJS's implementation of $q
 * If passed a promise returns the promise; otherwise returns a pseudo-promise returning the value
 * @param {*} value Promise or value
 * @returns {Object} Promise
 */
Helpers.prototype.refPromise = function(value) {
  if (value && utils.isFunction(value.then)) {
    return value;
  }
  var self = this;
  return {
    then: function(callback) {
      var d = self.settings.deferredWrapper();
      self.nextTick(function() {
        d.resolve(callback(value));
      });
      return d.promise;
    }
  };
};

/**
 * borrowed from AngularJS's implementation of $q
 * @param {Array|Object} promises Array or object of promises
 * @returns {Object} Promise that is resolved when all promises resolve
 */
Helpers.prototype.promiseAll = function(promises) {
  var d = this.settings.deferredWrapper(),
    counter = 0,
    results = utils.isArray(promises) ? [] : {},
    self = this;

  forEach(promises, function(promise, key) {
    counter++;
    self.refPromise(promise).then(
      function(value) {
        if (results.hasOwnProperty(key)) {
          return;
        }
        results[key] = value;
        if (!(--counter)) {
          d.resolve(results);
        }
      },
      function() {
        if (results.hasOwnProperty(key)) {
          return;
        }
        d.reject.apply(d, arguments);
      });
  });

  if (counter === 0) {
    d.resolve(results);
  }

  return d.promise;
};

/**
 * Set a timer, optionally clearing the old timer first
 * @param {Function} fn Function to call
 * @param {number} delay
 * @param {number=} oldTimer Old timer to clear
 * @returns {number} timer
 */
Helpers.prototype.setTimer = function(fn, delay, oldTimer) {
  if (oldTimer) {
    this.settings.clearTimeout(oldTimer);
  }
  return this.settings.setTimeout(function() {
    fn();
  }, delay);
};

Helpers.prototype.setAccessTokenInactiveTimer = function(delay) {
  this.accessTokenInactiveTimer = this.setTimer(this.settings.eraseAccessToken, delay, this.accessTokenInactiveTimer);
};

Helpers.prototype.setAccessTokenCreationTimer = function(delay) {
  this.accessTokenCreationTimer = this.setTimer(this.settings.eraseAccessToken, delay, this.accessTokenCreationTimer);
};

Helpers.prototype.clearAccessTokenTimers = function() {
  this.settings.clearTimeout(this.accessTokenInactiveTimer);
  this.accessTokenInactiveTimer = null;
  this.settings.clearTimeout(this.accessTokenCreationTimer);
  this.accessTokenCreationTimer = null;
};

/**
 * Read the access token from the cookie and start the expiry timers
 */
Helpers.prototype.readAccessToken = function() {
  if (typeof module === 'object' && typeof module.exports !== 'undefined') {
    return;
  }
  var now = (new Date()).getTime(),
      self = this;
  var cookie = this.readCookie(this.settings.accessTokenCookie);
  if (cookie) {
    var parts = cookie.split('|', 3);
    if (parts.length === 3) {
      var inactiveMillis = now - parseInt(parts[0],10);
      var creationMillis = now - parseInt(parts[1],10);
      if (inactiveMillis < this.settings.maxAccessTokenInactivityTime && creationMillis < this.settings.maxAccessTokenCreationTime) {
        this.settings.accessToken = parts[2];
        if (this.settings.autoExpire) {
          self.setAccessTokenInactiveTimer(this.settings.maxAccessTokenInactivityTime - inactiveMillis);
          self.setAccessTokenCreationTimer(this.settings.maxAccessTokenCreationTime - creationMillis);
        }
      }
    }
  }
};

/**
 * Set the access token, start the expiry timers, and write the cookie
 */
Helpers.prototype.setAccessToken = function(accessToken) {
  this.settings.accessToken = accessToken;
  if (typeof module === 'object' && typeof module.exports !== 'undefined') {
    return;
  }
  if (this.settings.autoExpire) {
    this.setAccessTokenInactiveTimer(this.settings.maxAccessTokenInactivityTime);
    this.setAccessTokenCreationTimer(this.settings.maxAccessTokenCreationTime);
  }
  if (this.settings.saveAccessToken) {
    var now = (new Date()).getTime();
    var cookie = now+'|'+now+'|'+accessToken;
    this.createCookie(this.settings.accessTokenCookie, cookie, 0);
  }
};

/**
 * Refresh the access token by updating the inactive timer
 */
Helpers.prototype.refreshAccessToken = function() {
  var now = (new Date()).getTime();
  if (this.settings.autoExpire) {
    this.setAccessTokenInactiveTimer(this.settings.maxAccessTokenInactivityTime);
  }
  if (this.settings.saveAccessToken) {
    var cookie = this.readCookie(this.settings.accessTokenCookie);
    if (cookie) {
      var parts = cookie.split('|', 3);
      if (parts.length === 3) {
        cookie = now+'|'+parts[1]+'|'+parts[2];
        this.createCookie(this.settings.accessTokenCookie, cookie, 0);
      }
    }
  }
};

/**
 * Erase access token, clear the expiry timers, and erase the cookie
 */
Helpers.prototype.eraseAccessToken = function(omitCallback) {
  this.settings.accessToken = null;
  if (typeof module === 'object' && typeof module.exports !== 'undefined') {
    return;
  }
  if (this.settings.autoExpire) {
    this.clearAccessTokenTimers();
  }
  if (this.settings.saveAccessToken) {
    this.eraseCookie(this.settings.accessTokenCookie);
  }
  if (!!this.settings.expireCallback && !omitCallback) {
    this.settings.expireCallback();
  }
};

/**
 * The following functions are more like utility functions that
 * don't need access to any instance data
 */



/**
 * Extend the destPromise with functions from the sourcePromise
 * @param {Object} destPromise Destination promise
 * @param {Object} sourcePromise Source promise
 * @returns {Object} Destination promise with functions from source promise
 */
Helpers.prototype.extendHttpPromise = function(destPromise, sourcePromise) {
  return utils.wrapFunctions(destPromise, sourcePromise, ['getResponseHeader', 'getAllResponseHeaders', 'getStatusCode', 'getRequest']);
};

/**
 * Chain multiple http promises so the http functions (e.g., getResponseHeader) from the last promise are available in the returned promise
 * Pass an initial promise and one or more http-promise-generating functions to chain
 * @returns {Object} promise with http functions
 */
Helpers.prototype.chainHttpPromises = function() {
  var promise = arguments[0];
  var bridge = {}; // bridge object is needed because the "then" function is executed immediately in unit tests
  var self = this;
  forEach(Array.prototype.slice.call(arguments, 1), function(fn) {
    promise = promise.then(function() {
     var result = fn.apply(null, arguments);
      if (result && result.then) {
        // the bridge object is extended with the functions from each promise-generating function,
        // but the final functions will be those from the last promise-generating function
        self.extendHttpPromise(bridge, result);
      }
      return result;
    });
  });
  // the returned promise will call into the bridge object for the http functions
  self.extendHttpPromise(promise, bridge);
  return promise;
};

/**
 * Get the last segment of a URL
 * @param url
 * @returns {string}
 */
Helpers.prototype.getLastUrlSegment = function(url) {
  if (url) {
    url = url.replace(/^.*\//, '').replace(/\?.*$/, '');
  }
  return url;
};

/**
 * Response mapper that returns the X-ENTITY-ID header
 * @param data ignored
 * @param promise http promise
 * @returns {string} the X-ENTITY-ID response header
 */
Helpers.prototype.getResponseEntityId = function(data, promise) {
  return promise.getResponseHeader('X-ENTITY-ID');
};

/**
 * Response mapper that returns the location header
 * @param data ignored
 * @param promise http promise
 * @returns {string} the location response header
 */
Helpers.prototype.getResponseLocation = function(data, promise) {
  return this.removeAccessToken(promise.getResponseHeader('Location'));
};

/**
 * Return true if url starts with https?://
 * @param {string} url
 * @returns {boolean} true if url starts with https?://
 */
Helpers.prototype.isAbsoluteUrl = function(url) {
  return (/^https?:\/\//).test(url);
};

/**
 * Return true if this url is for the Authorities server
 * @param url
 * @returns {boolean}
 */
Helpers.prototype.isAuthoritiesServerUrl = function(url) {
  return url.indexOf('/authorities/v1/') !== -1;
};

/**
 * Create a URL-encoded query string from an object
 * @param {Object} params Parameters
 * @returns {string} URL-encoded string
 */
Helpers.prototype.encodeQueryString = function(params) {
  var arr = [];
  forEach(params, function(value, key) {
    key = encodeURIComponent(key);
    var param;
    if (utils.isArray(value)) {
      param = utils.map(value, function(elm) {
        //noinspection JSValidateTypes
        return key + '=' + encodeURIComponent(elm);
      }).join('&');
    }
    else if (value != null) { // catches null and undefined
      param = key + '=' + encodeURIComponent(value);
    }
    else {
      param = key;
    }
    arr.push(param);
  });
  return arr.join('&');
};

/**
 * Append query parameters object to a url
 * @param {string} url
 * @param {Object} params
 * @returns {String} url + query string
 */
Helpers.prototype.appendQueryParameters = function(url, params) {
  var queryString = this.encodeQueryString(params);
  if (queryString.length === 0) {
    return url;
  }
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + queryString;
};

/**
 * Decode query string part of a url into an object
 * @param {string} url url
 * @returns {Object} parameters object
 */
Helpers.prototype.decodeQueryString = function(url) {
  var obj = {};
  if (url) {
    var pos = url.indexOf('?');
    if (pos !== -1) {
      var segments = url.substring(pos+1).split('&');
      forEach(segments, function(segment) {
        var kv = segment.split('=', 2);
        if (kv && kv[0]) {
          var key = decodeURIComponent(kv[0]);
          var value = (kv[1] != null ? decodeURIComponent(kv[1]) : kv[1]); // catches null and undefined
          if (obj[key] != null && !utils.isArray(obj[key])) {
            obj[key] = [ obj[key] ];
          }
          if (obj[key] != null) {
            obj[key].push(value);
          }
          else {
            obj[key] = value;
          }
        }
      });
    }
  }
  return obj;
};

/**
 * Remove the query string from the url
 * @param {string} url url
 * @returns {string} url without query string
 */
Helpers.prototype.removeQueryString = function(url) {
  if (url) {
    var pos = url.indexOf('?');
    if (pos !== -1) {
      url = url.substring(0, pos);
    }
  }
  return url;
};

/**
 * Remove the access token from the url
 * @param {string} url url
 * @returns {string} url without access token
 */
Helpers.prototype.removeAccessToken = function(url) {
  if (url) {
    var params = this.decodeQueryString(url);
    url = this.removeQueryString(url);
    delete params['access_token'];
    url = this.appendQueryParameters(url, params);
  }
  return url;
};

/**
 * Populate template with uri-encoded parameters
 * @param {string} template template with {param}'s to replace; e.g., /platform/tree/persons/{pid}/source-references/{srid}
 * @param {Object} params parameters; e.g., {pid: 'X', srid: 'Y'}
 * @returns {string} populated template
 */
Helpers.prototype.populateUriTemplate = function(template, params) {
  var segments = template.split(/[{}]/);
  var inQuery = false;
  for (var i = 0, len = segments.length; i < len; i++) {
    if (i % 2 === 1) {
      var param = params[segments[i]];
      segments[i] = inQuery ? encodeURIComponent(param) : encodeURI(param);
    }
    else if (segments[i].indexOf('?') !== -1) {
      inQuery = true;
    }
  }
  return segments.join('');
};

/**
 * get a URL from the provided discoveryResource by combining resourceName with params
 * @param discoveryResource discovery resource
 * @param resourceName resource name
 * @param params object of params to populate in template
 * @returns {string} url
 */
Helpers.prototype.getUrlFromDiscoveryResource = function(discoveryResource, resourceName, params) {
  var url = '';
  var resource = discoveryResource.links[resourceName];
  if (resource['href']) {
    url = this.removeAccessToken(resource['href']);
  }
  else if (resource['template']) {
    var template = resource['template'].replace(/{\?[^}]*}/,''); // we will add query parameters later
    url = this.populateUriTemplate(template, params || {});
  }
  return url;
};

/**
 * return true if no attribution or attribution without a change message or an existing attribution
 * @param {Object} conclusion name or fact or gender - anything with an attribution
 * @returns {boolean}
 */
Helpers.prototype.attributionNeeded = function(conclusion) {
  return !!(!conclusion.attribution || !conclusion.attribution.changeMessage || conclusion.attribution.contributor);
};

/**
 * borrowed from http://www.quirksmode.org/js/cookies.html
 * Create a cookie
 * @param {string} name Cookie name
 * @param {string} value Cookie value
 * @param {number} days Number of days to expiration; set to 0 for a session cookie
 */
Helpers.prototype.createCookie = function(name, value, days) {
  var expires = '';
  var isSecure = document.location.protocol === 'https' && document.location.hostname !== 'localhost'; // can't set secure cookies on localhost in chrome
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*86400));
    expires = '; expires='+date.toUTCString();
  }
  //noinspection JSValidateTypes
  document.cookie = name + '=' + value + expires + '; path=/' + (isSecure ? '; secure' : '');
};

/**
 * borrowed from http://www.quirksmode.org/js/cookies.html
 * Read a cookie
 * @param {string} name Cookie name
 * @returns {string} Cookie value
 */
Helpers.prototype.readCookie = function(name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0) ===' ') {
      c = c.substring(1,c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length,c.length);
    }
  }
  return null;
};

/**
 * borrowed from http://www.quirksmode.org/js/cookies.html
 * Erase a cookie
 * @param {string} name Cookie name
 */
Helpers.prototype.eraseCookie = function(name) {
  this.createCookie(name,'',-1);
};

module.exports = Helpers;