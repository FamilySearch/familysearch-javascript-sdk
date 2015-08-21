var utils = require('./utils'),
    forEach = utils.forEach;

/**
 * Internal utility functions. This differs from utils.js in that it contains
 * functions which are specific to FamilySearch or need access to a client instance.
 */

var Helpers = function(client){
  this.settings = client.settings;
  this.client = client;
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
  setTimeout(function() {
    cb();
  },0);
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
    clearTimeout(oldTimer);
  }
  setTimeout(function() {
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
  clearTimeout(this.accessTokenInactiveTimer);
  this.accessTokenInactiveTimer = null;
  clearTimeout(this.accessTokenCreationTimer);
  this.accessTokenCreationTimer = null;
};

/**
 * Return the name of the cookie that stores the access token
 */
Helpers.prototype.getAccessTokenCookieName = function(){
  return this.settings.accessTokenCookie + '_' + this.settings.instanceId;
};

/**
 * Read the access token from the cookie and start the expiry timers
 */
Helpers.prototype.readAccessToken = function() {
  if (typeof window === 'undefined') {
    return;
  }
  var now = (new Date()).getTime(),
      self = this;
  var cookie = this.readCookie(this.getAccessTokenCookieName());
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
  if (typeof window === 'undefined') {
    return;
  }
  if (this.settings.autoExpire) {
    this.setAccessTokenInactiveTimer(this.settings.maxAccessTokenInactivityTime);
    this.setAccessTokenCreationTimer(this.settings.maxAccessTokenCreationTime);
  }
  if (this.settings.saveAccessToken) {
    var now = (new Date()).getTime();
    var cookie = now+'|'+now+'|'+accessToken;
    this.createCookie(this.getAccessTokenCookieName(), cookie, 0);
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
    var cookie = this.readCookie(this.getAccessTokenCookieName());
    if (cookie) {
      var parts = cookie.split('|', 3);
      if (parts.length === 3) {
        cookie = now+'|'+parts[1]+'|'+parts[2];
        this.createCookie(this.getAccessTokenCookieName(), cookie, 0);
      }
    }
  }
};

/**
 * Erase access token, clear the expiry timers, and erase the cookie
 */
Helpers.prototype.eraseAccessToken = function(omitCallback) {
  this.settings.accessToken = null;
  if (typeof window === 'undefined') {
    return;
  }
  if (this.settings.autoExpire) {
    this.clearAccessTokenTimers();
  }
  if (this.settings.saveAccessToken) {
    this.eraseCookie(this.getAccessTokenCookieName());
  }
  if (!!this.settings.expireCallback && !omitCallback) {
    this.settings.expireCallback(this.client);
  }
};

/**
 * The following functions are more like utility functions that
 * don't need access to any instance data
 */

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
 * Turn the Link header into a json object of links. The header may either
 * be an array of link values or an array with one value that is a concatenated
 * list of header values. The header format for a link is `<href>; rel="relname"`
 * 
 * @param {array} headers array of link header values
 * @returns {object} json object of links
 */
Helpers.prototype.parseLinkHeaders = function(headers){
  var links = {};
  if(utils.isArray(headers)){
    utils.forEach(headers, function(header){
      var values = header.split(', ');
      utils.forEach(values, function(value){
        var pieces = value.split('; '),
            href = pieces[0].slice(1, -1), // remove leading and trailing <>
            rel = pieces[1].slice(5, -1);
        links[rel] = { href: href };
      });
    });
  }
  return links;
};

/**
 * get a URL from the provided collection by combining resourceName with params
 * 
 * @param collection collection
 * @param resourceName resource name
 * @param params object of params to populate in template
 * @returns {string} url
 */
Helpers.prototype.getUrlFromCollection = function(collection, resourceName, params) {
  var url = '';
  var resource = collection.links[resourceName];
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
 * Return the entity type for a given url. For example, /platform/tree/child-and-parents-relationships/DDD/notes
 * will return childAndParentsRelationships. This is used by notes and sources to
 * determine where in a gedcomx document the data should go.
 * 
 * @param {string} url
 * @returns {string} entity type: persons, relationships, or childAndParentsRelationships
 */
Helpers.prototype.getEntityType = function(url){
  if(utils.isString(url)){
    var matches = url.match(/platform\/tree\/([^\/]+)/);
    if(matches && matches[1]){
      if (matches[1] === 'persons') {
        return 'persons';
      }
      else if (matches[1] === 'couple-relationships') {
        return 'relationships';
      }
      else if (matches[1] === 'child-and-parents-relationships') {
        return 'childAndParentsRelationships';
      }
    }
  }
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