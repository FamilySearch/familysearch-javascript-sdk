/*!
 * FamilySearch JavaScript SDK
 * Copyright 2012, Dallan Quass & Dovy Paukstys
 * For all api documentation:
 * https://familysearch.org/developers/
 */

;(function() {
  var appKey
    , environment
    , httpWrapper
    , deferredWrapper
    , authCallback
    , accessToken
    , logging
    , server = {
      'sandbox' 	: 'https://sandbox.familysearch.org',
      'staging'		: 'https://stage.familysearch.org',
      'production': 'https://familysearch.org'
    }
    , oauthServer = {
      'sandbox' 	: 'https://sandbox.familysearch.org/cis-web/oauth2/v3',
      'staging' 	: 'https://identbeta.familysearch.org/cis-web/oauth2/v3',
      'production': 'https://ident.familysearch.org/cis-web/oauth2/v3'
    }
    , pollDelay = 50
  ;

  function extend(dest) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        //noinspection JSUnfilteredForInLoop
        dest[prop] = source[prop];
      }
    }
    return dest;
  }

  function getAbsoluteUrl(server, path) {
    if (!path.match(/^https?:\/\//)) {
      return server + (path.charAt(0) !== '/' ? '/' : '') + path;
    }
    else {
      return path;
    }
  }

  // Create a URL-encoded query string from an object
  function encodeQueryString(params) {
    var arr = [];
    for(var param in params) {
      if (params.hasOwnProperty(param)) {
        arr.push(encodeURIComponent(param) + "=" + encodeURIComponent(params[param]));
      }
    }
    return arr.join("&");
  }

  function appendQueryParameters(url, params) {
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + encodeQueryString(params);
  }

  function decodeQueryString(qs) {
    var obj = {}
      , segments = qs.substring(qs.indexOf('?')+1).split('&')
    ;
    for (var i=0; i < segments.length; i++) {
      var kv = segments[i].split('=', 2);
      if (kv && kv[0]) {
        obj[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
      }
    }
    return obj;
  }

  function jqueryHttpWrapper(ajax) {
    return function(method, url, headers, data, opts) {
      if (typeof opts !== 'object') {
        opts = {};
      }
      opts = extend({
        url: url,
        type: method,
        data: data,
        dataType: 'json'
      }, opts);
      opts.headers = (opts.headers ? extend({}, headers, opts.headers) : headers);
      return ajax(opts);
    }
  }

  function jqueryDeferredWrapper(deferred) {
    return function() {
      var d = deferred();
      return {
        promise: d.promise(),
        resolve: d.resolve,
        reject: d.reject
      }
    }
  }

  function qDeferredWrapper(deferred) {
    return function() {
      var d = deferred();
      return {
        promise: d.promise,
        resolve: d.resolve,
        reject: d.reject
      }
    }
  }

  /**
   * Initialize the FamilySearch object
   *
   * Options
   * * app_key -- the developer key you received from FamilySearch
   * * environment -- sandbox, staging, or production
   * * http_function -- a function for issuing http requests: jQuery.ajax, and eventually angular's $http, or node.js's ...
   * * deferred_function -- a function for creating deferred's: jQuery.Deferred, and eventually angular's $q or Q
   * * auth_callback -- the OAuth2 redirect uri you registered with FamilySearch.  Does not need to exist, but must have the same host and port as the server of this file
   * * access_token -- pass this in if you already have an access token
   * * logging -- not currently used
   *
   * @param {Object} opts options (see description)
   * @returns this for chaining
   */
  function init(opts) {
    opts = opts || {};

    if(!opts['app_key']) {
      throw 'app_key must be set';
    }
    appKey = opts['app_key'];

    if(!opts['environment']) {
      throw 'environment must be set';
    }
    environment = opts['environment'];

    if(!opts['http_function']) {
      throw 'http must be set; e.g., jQuery.ajax';
    }
    httpWrapper = jqueryHttpWrapper(opts['http_function']);

    if(!opts['deferred_function']) {
      throw 'deferred_function must be set; e.g., jQuery.Deferred';
    }
    deferredWrapper = jqueryDeferredWrapper(opts['deferred_function']);

    if(opts['auth_callback']) {
      authCallback = opts['auth_callback'];
    }

    if(opts['access_token']) {
      console.log('access token in init');
      accessToken = opts['access_token'];
    }

    logging = opts['logging'];

    return this;
  }

  /**
   * Open a popup window for user to authenticate and authorize this app
   *
   * @private
   * @param {String} url window url
   * @param {Object} params query parameters to append to the window url
   * @returns {window} reference to the popup window
   */
  function openPopup(url, params) {
    // figure out where the center is
    var
      screenX    	= typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
      screenY    	= typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
      outerWidth 	= typeof window.outerWidth != 'undefined' ? window.outerWidth : document.documentElement.clientWidth,
      outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.documentElement.clientHeight - 22),
      width    		= params.width 	|| 780,
      height   		= params.height || 500,
      left     		= parseInt(screenX + ((outerWidth - width) / 2), 10),
      top      		= parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features = (
        'width=' + width +
          ',height=' + height +
          ',left=' + left +
          ',top=' + top
        );
    return window.open(appendQueryParameters(url, params),'',features);
  }

  /**
   * Polls the popup window location for the auth code
   *
   * @private
   * @param {window} popup window to poll
   * @returns a promise of the auth code
   */
  function pollForAuthCode(popup) {
    var d = deferredWrapper();
    var i = setInterval(function() {
      try {
        if (popup.location.hostname === window.location.hostname) {
          console.log(popup.location.href);
          var params = decodeQueryString(popup.location.href);
          if (params['code']) {
            d.resolve(params['code']);
          }
          else {
            d.reject(params['error']);
          }
          clearInterval(i);
          popup.close();
        }
      }
      catch(err) {}
    }, pollDelay);
    return d.promise;
  }

  /**
   * Open a popup window to allow the user to authenticate and authorize this application
   *
   * @returns a promise of the auth code
   */
  function getAuthCode() {
    var popup = openPopup(getAbsoluteUrl(oauthServer[environment], 'authorization'), {
      'response_type' : 'code',
      'client_id'     : appKey,
      'redirect_uri'  : authCallback
    });
    return pollForAuthCode(popup);
  }

  /**
   * Get the access token for the user.
   *
   * Call this function before making any calls that require authentication.
   * The SDK caches the access token returned so you can ignore it; you just need to ensure that the promise that is
   * returned by this function resolves before making calls that require authentication
   *
   * @param {String} authCode optional auth code from getAuthCode; if not passed in, this function will call getAuthCode first
   * @returns a promise of the access token.
   */
  function getAccessToken(authCode) {
    // get auth code if not passed in
    var authCodeDeferred;
    if (authCode) {
      authCodeDeferred = deferredWrapper();
      authCodeDeferred.resolve(authCode);
    }
    else {
      authCodeDeferred = getAuthCode();
    }
    var accessTokenDeferred = deferredWrapper();
    authCodeDeferred.then(function(authCode) {
      // get the access token given the auth code
      accessToken = null; // clear the current access token if there is one
      post(getAbsoluteUrl(oauthServer[environment], 'token'), {
        'grant_type' : 'authorization_code',
        'code'       : authCode,
        'client_id'  : appKey
      }).then(function(response) {
        console.log('accessToken=',response);
        accessToken = response['access_token'];
        if (accessToken) {
          accessTokenDeferred.resolve(accessToken);
        }
        else {
          accessTokenDeferred.reject(response['error']);
        }
      }, function(error) {
        accessTokenDeferred.reject(error);
      });
    }, function(error) {
      accessTokenDeferred.reject(error);
    });
    return accessTokenDeferred.promise;
  }

  /**
   * Invalidate the current access token
   *
   * @returns a promise that is resolved once the access token has been invalidated
   */
  function invalidateAccessToken() {
    accessToken = null;
    return del(getAbsoluteUrl(oauthServer[environment], 'token'));
  }

  /**
   * Low-level call to get a specific REST endpoint from FamilySearch
   *
   * @param {String} url may be relative; e.g., /platform/users/current
   * @param {Object} params optional query parameters
   * @param {Object} opts optional options to pass to the http function specified during init
   * @returns a promise, which is the promise returned by the http function specified during init
   */
  function get(url, params, opts) {
    return http('GET', appendQueryParameters(url, params), {}, {}, opts);
  }

  /**
   * Low-level call to post to a specific REST endpoint from FamilySearch
   *
   * @param {String} url may be relative
   * @param {Object} data optional post data
   * @param {Object} opts optional options to pass to the http function specified during init
   * @returns a promise, which is the promise returned by the http function specified during init
   */
  function post(url, data, opts) {
    return http('POST', url, {'Content-type': 'application/x-www-form-urlencoded'}, data, opts);
  }

  /**
   * Low-level call to put to a specific REST endpoint from FamilySearch
   *
   * @param {String} url may be relative
   * @param {Object} data optional post data
   * @param {Object} opts optional options to pass to the http function specified during init
   * @returns a promise, which is the promise returned by the http function specified during init
   */
  function put(url, data, opts) {
    return http('PUT', url, {'Content-type': 'application/x-www-form-urlencoded'}, data, opts);
  }

  /**
   * Low-level call to delete to a specific REST endpoint from FamilySearch
   *
   * @param {String} url may be relative
   * @param {Object} opts optional options to pass to the http function specified during init
   * @returns a promise, which is the promise returned by the http function specified during init
   */
  function del(url, opts) {
    return http('DELETE', url, {}, {}, opts);
  }

  /**
   * Low-level call to issue an http request to a specific REST endpoint from FamilySearch
   *
   * @param {String} method GET, POST, PUT, or DELETE
   * @param {String} url may be relative
   * @param {Object} headers optional headers object
   * @param {Object} data optional post data
   * @param {Object} opts optional options to pass to the http function specified during init
   * @returns a promise, which is the promise returned by the http function specified during init
   */
  function http(method, url, headers, data, opts) {
    // prepend the server
    url = getAbsoluteUrl(server[environment], url);

    // append the access token as a query parameter to avoid cors pre-flight
    // this is detrimental to browser caching across sessions, which seems less bad than cors pre-flight requests
    // TODO investigate this further
    if (accessToken) {
      url = appendQueryParameters(url, {'access_token': accessToken});
    }

    // add headers
    headers = extend({
      'Accept': 'application/x-gedcomx-v1+json'
    }, headers);

    // call the http wrapper
    return httpWrapper(method, url, headers, data, opts);
  }

  /**
   * Public API
   */
  window.FamilySearch = {
    init: init,
    getAuthCode: getAuthCode,
    getAccessToken: getAccessToken,
    invalidateAccessToken: invalidateAccessToken,
    get: get,
    post: post,
    put: put,
    del: del,
    http: http
  };
})();
