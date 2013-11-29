/**
 * @preserve FamilySearch JavaScript SDK
 * (c) 2013, Dallan Quass & Dovy Paukstys
 * License: MIT
 */
;(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(); // CommonJS e.g., node.js
  } else if (typeof define === 'function' && define.amd) {
    define(factory); // AMD e.g., RequireJS
  } else {
    global.FamilySearch = factory(); // browser global
  }
}(this, function() {

  // Rather than use the RequireJS almond loader, this is less code for our simple use case
  var modules = {}, requireCache = {};
  function define(name, deps, fn) {
    modules[name] = {
      deps: arguments.length === 3 ? deps : [],
      fn: arguments.length === 3 ? fn : deps
    };
  }
  function require(name) {
    var mod = modules[name],
      depResults = [],
      result = mod.fn;
    if (typeof result === 'function') {
      for (var i = 0, len = mod.deps.length; i < len; i++) {
        var depName = mod.deps[i];
        var depResult = requireCache[depName];
        if (depResult === void 0) {
          depResult = require(depName);
          requireCache[depName] = depResult;
        }
        depResults.push(depResult);
      }
      result = mod.fn.apply(this, depResults);
    }
    return result;
  }

define('globals',{
  appKey: null,
  environment: null,
  httpWrapper: null,
  deferredWrapper: null,
  authCallbackUri: null,
  autoSignin: false,
  accessToken: null,
  saveAccessToken: false,
  logging: false,
  // constants for now, but could become options in the future
  accessTokenCookie: 'FS_ACCESS_TOKEN',
  authCodePollDelay: 50,
  defaultThrottleRetryAfter: 500,
  maxHttpRequestRetries: 5,
  server: {
    'sandbox'   : 'https://sandbox.familysearch.org',
    'staging'   : 'https://stage.familysearch.org',
    'production': 'https://familysearch.org'
  },
  oauthServer: {
    'sandbox'   : 'https://sandbox.familysearch.org/cis-web/oauth2/v3',
    'staging'   : 'https://identbeta.familysearch.org/cis-web/oauth2/v3',
    'production': 'https://ident.familysearch.org/cis-web/oauth2/v3'
  }
});

define('helpers',[
  'globals'
], function(globals) {
  var helpers = {};

  // borrowed from underscore.js
  helpers.isArray = function(value) {
    /*jshint eqeqeq:false */
    return Array.isArray ? Array.isArray(value) : Object.prototype.toString.call(value) == '[object Array]';
  };

  // borrowed from underscore.js
  helpers.isNumber = function(value) {
    /*jshint eqeqeq:false */
    return Object.prototype.toString.call(value) == '[object Number]';
  };

  // borrowed from underscore.js
  helpers.isString = function(value) {
    /*jshint eqeqeq:false */
    return Object.prototype.toString.call(value) == '[object String]';
  };

  // borrowed from underscore.js
  helpers.isFunction = function(value) {
    /*jshint eqeqeq:false */
    return (typeof /./ !== 'function') ? (typeof value === 'function') : Object.prototype.toString.call(value) == '[object Function]';
  };

  // borrowed from underscore.js
  helpers.isObject = function(value) {
    return value === Object(value);
  };

  helpers.isUndefined = function(value) {
    return value === void 0;
  };

  // borrowed from underscore.js
  helpers.forEach = function(obj, iterator, context) {
    if (obj == null) { // also catches undefined
      return;
    }
    if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === {}) {
          return;
        }
      }
    } else {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (iterator.call(context, obj[key], key, obj) === {}) {
            return;
          }
        }
      }
    }
  };

  // simplified version of underscore's filter
  helpers.filter = function(arr, fn) {
    var result = [];
    helpers.forEach(arr, function(e) {
      if (fn(e)) {
        result.push(e);
      }
    });
    return result;
  };

  // simplified version of underscore's map
  helpers.map = function(arr, fn, context) {
    var result = [];
    helpers.forEach(arr, function(value, index, list) {
      result.push(fn.call(context, value, index, list));
    });
    return result;
  };

  // return only unique elements of an array preserving order
  helpers.uniq = function(arr) {
    var u = {}, result = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      var e = arr[i];
      if (!u.hasOwnProperty(e)) {
        result.push(e);
        u[e] = 1;
      }
    }
    return result;
  };

  // simplified version of underscore's find
  // also, returns an empty object if the no matching elements found
  helpers.findOrEmpty = function(arr, objOrFn) {
    var result = {};
    var isFn = helpers.isFunction(objOrFn);
    if (arr) {
      for (var i = 0, len = arr.length; i < len; i++) {
        var elm = arr[i];
        var matches;
        if (isFn) {
          matches = objOrFn.call(null, elm);
        }
        else {
          matches = true;
          for (var key in objOrFn) {
            if (objOrFn.hasOwnProperty(key) && elm[key] !== objOrFn[key]) {
              matches = false;
              break;
            }
          }
        }
        if (matches) {
          result = elm;
          break;
        }
      }
    }
    return result;
  };

  // returns the first element of the array or an empty object
  helpers.firstOrEmpty = function(arr) {
    return (arr && arr.length > 0 ? arr[0] : {});
  };

  helpers.extend = function(dest) {
    dest = dest || {};
    helpers.forEach(Array.prototype.slice.call(arguments, 1), function(source) {
      if (source) {
        helpers.forEach(source, function(value, key) {
          dest[key] = value;
        });
      }
    });
    return dest;
  };

  // create a new function which is the specified function with the right-most arguments pre-filled
  helpers.partialRight = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
      return fn.apply(this, Array.prototype.slice.call(arguments, 0).concat(args));
    };
  };

  // return a function that will extend an object with the specified extensions
  // optionally applying them at points returned by extensionPointGetter
  helpers.objectExtender = function(extensions, extensionPointGetter) {
    if (extensionPointGetter) {
      return function(obj) {
        if (obj) {
          helpers.forEach(extensionPointGetter(obj), function(extensionPoint) {
            helpers.extend(extensionPoint, extensions);
          });
        }
        return obj;
      };
    }
    else {
      return helpers.partialRight(helpers.extend, extensions);
    }
  };

  /**
   * Compose functions from right to left
   * @param {...Function} functions to compose; each argument may be a function or an array of functions
   * @returns {Function} composed function
   */
  /*jshint unused:false */
  helpers.compose = function(functions) {
    var args = arguments;
    return function(obj) {
      for (var i = args.length-1; i >= 0; i--) {
        var arg = args[i];
        if (helpers.isArray(arg)) {
          for (var j = arg.length-1; j >= 0; j--) {
            obj = arg[j](obj);
          }
        }
        else {
          obj = arg(obj);
        }
      }
      return obj;
    };
  };

  // copy functions from source to dest, binding them to source
  helpers.wrapFunctions = function(dest, source, fns) {
    helpers.forEach(fns, function(fn) {
      dest[fn] = function() {
        return source[fn].apply(source, arguments);
      };
    });
    return dest;
  };

  // extend the destPromise with functions from the sourcePromise
  helpers.extendHttpPromise = function(destPromise, sourcePromise) {
    return helpers.wrapFunctions(destPromise, sourcePromise, ['getResponseHeader', 'getAllResponseHeaders', 'getStatusCode']);
  };

  // "empty" properties are undefined, null, or the empty string
  helpers.removeEmptyProperties = function(obj) {
    helpers.forEach(obj, function(value, key) {
      if (value == null || value === '') {  // == null also catches undefined
        delete obj[key];
      }
    });
    return obj;
  };

  // prepend server to url if url doesn't start with http(s)
  helpers.getAbsoluteUrl = function(server, path) {
    if (!path.match(/^https?:\/\//)) {
      return server + (path.charAt(0) !== '/' ? '/' : '') + path;
    }
    else {
      return path;
    }
  };

  // Create a URL-encoded query string from an object
  helpers.encodeQueryString = function(params) {
    var arr = [];
    helpers.forEach(params, function(value, key) {
      arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });
    return arr.join('&');
  };

  // append query parameters
  helpers.appendQueryParameters = function(url, params) {
    var queryString = helpers.encodeQueryString(params);
    if (queryString.length === 0) {
      return url;
    }
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + queryString;
  };

  // decode query string into an object
  helpers.decodeQueryString = function(qs) {
    var obj = {}, segments = qs.substring(qs.indexOf('?')+1).split('&');
    helpers.forEach(segments, function(segment) {
      var kv = segment.split('=', 2);
      if (kv && kv[0]) {
        obj[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
      }
    });
    return obj;
  };

  // call the callback on the next tick
  helpers.nextTick = function(cb) {
    setTimeout(function() {
      cb();
    },0);
  };

  // borrowed from AngularJS's implementation of $q
  // if passed a promise returns the promise; otherwise returns a pseudo-promise returning the value
  helpers.refPromise = function(value) {
    if (value && helpers.isFunction(value.then)) {
      return value;
    }
    return {
      then: function(callback) {
        var d = globals.deferredWrapper();
        helpers.nextTick(function() {
          d.resolve(callback(value));
        });
        return d.promise;
      }
    };
  };

  // borrowed from AngularJS's implementation of $q
  helpers.promiseAll = function(promises) {
    var d = globals.deferredWrapper(),
      counter = 0,
      results = helpers.isArray(promises) ? [] : {};

    helpers.forEach(promises, function(promise, key) {
      counter++;
      helpers.refPromise(promise).then(
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

  // cookie functions borrowed from http://www.quirksmode.org/js/cookies.html
  helpers.createCookie = function(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*86400));
      expires = '; expires='+date.toUTCString();
    }
    document.cookie = name+'='+value+expires+'; path=/';
  };

  helpers.readCookie = function(name) {
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

  helpers.eraseCookie = function(name) {
    helpers.createCookie(name,'',-1);
  };

  // erase access token
  helpers.eraseAccessToken = function() {
    globals.accessToken = null;
    if (globals.saveAccessToken) {
      helpers.eraseCookie(globals.accessTokenCookie);
    }
  };

  return helpers;
});

define('jquery-wrappers',[
  'globals',
  'helpers'
], function(globals, helpers) {
  var exports = {};

  exports.httpWrapper = function(ajax) {
    return function(method, url, headers, data, opts) {
      // set up the options
      opts = helpers.extend({
        url: url,
        type: method,
        dataType: 'json',
        data: data
      }, opts);
      opts.headers = helpers.extend({}, headers, opts.headers);

      // make the call
      var jqXHR = ajax(opts);

      // process the response
      var d = globals.deferredWrapper();
      var returnedPromise = d.promise;
      var statusCode = null;
      jqXHR.then(
        function(data, textStatus, jqXHR) {
          statusCode = jqXHR.status;
          d.resolve(data);
        },
        function(jqXHR, textStatus, errorThrown) {
          statusCode = jqXHR.status;
          d.reject(jqXHR, textStatus, errorThrown);
        });

      // add http-specific functions to the returned promise
      helpers.wrapFunctions(returnedPromise, jqXHR, ['getResponseHeader', 'getAllResponseHeaders']);
      returnedPromise.getStatusCode = function() {
        return statusCode;
      };
      return returnedPromise;
    };
  };

  exports.deferredWrapper = function(deferred) {
    return function() {
      var d = deferred();
      return {
        promise: d.promise(),
        resolve: d.resolve,
        reject: d.reject
      };
    };
  };

  return exports;
});

define('init',[
  'globals',
  'jquery-wrappers',
  'helpers'
], function(globals, jQueryWrappers, helpers) {
  /**
   * @ngdoc overview
   * @name init
   * @description
   * Call the init function once to initialize the FamilySearch object before calling any other functions.
   */

  var exports = {};

  /**
   * @ngdoc function
   * @name init.functions:init
   * @function
   *
   * @description
   * Initialize the FamilySearch object
   *
   * **Options**
   *
   * - `app_key` - the developer key you received from FamilySearch
   * - `environment` - sandbox, staging, or production
   * - `http_function` - a function for issuing http requests: jQuery.ajax, and eventually angular's $http, or node.js's ...
   * - `deferred_function` - a function for creating deferred's: jQuery.Deferred, and eventually angular's $q or Q
   * - `auth_callback` - the OAuth2 redirect uri you registered with FamilySearch.  Does not need to exist, but must have the same host and port as the server running your script
   * - `auto_signin` - set to true if you want the user to be prompted to sign in when a call returns 401 unauthorized (must be false for node.js, and may require the user to enable popups in their browser)
   * - `access_token` - pass this in if you already have an access token
   * - `save_access_token` - set to true if you want the access token to be saved and re-read in future init calls (uses a session cookie)
   * - `logging` - not currently used
   *
   * @param {Object} opts opts
   */
  exports.init = function(opts) {
    opts = opts || {};

    if(!opts['app_key']) {
      throw 'app_key must be set';
    }
    //noinspection JSUndeclaredVariable
    globals.appKey = opts['app_key'];

    if(!opts['environment']) {
      throw 'environment must be set';
    }
    //noinspection JSUndeclaredVariable
    globals.environment = opts['environment'];

    if(!opts['http_function']) {
      throw 'http must be set; e.g., jQuery.ajax';
    }
    globals.httpWrapper = jQueryWrappers.httpWrapper(opts['http_function']);

    if(!opts['deferred_function']) {
      throw 'deferred_function must be set; e.g., jQuery.Deferred';
    }
    globals.deferredWrapper = jQueryWrappers.deferredWrapper(opts['deferred_function']);

    if(opts['auth_callback']) {
      globals.authCallbackUri = opts['auth_callback'];
    }

    if(opts['auto_signin']) {
      globals.autoSignin = opts['auto_signin'];
    }

    if (opts['save_access_token']) {
      globals.saveAccessToken = true;
      globals.accessToken = helpers.readCookie(globals.accessTokenCookie);
    }

    if(opts['access_token']) {
      globals.accessToken = opts['access_token'];
    }

    globals.logging = opts['logging'];
  };

  return exports;
});

define('plumbing',[
  'globals',
  'helpers'
], function(globals, helpers) {
  /**
   * @ngdoc overview
   * @name plumbing
   * @description
   * These are the low-level "plumbing" functions. You don't normally need to use these functions.
   */

  var totalProcessingTime = 0;
  var exports = {};

  /**
   * @ngdoc function
   * @name plumbing.functions:getTotalProcessingTime
   * @function
   * @description
   * Return the total "processing time" spent in FamilySearch REST endpoints
   *
   * @return {Number} time in milliseconds
   */
  exports.getTotalProcessingTime = function() {
    return totalProcessingTime;
  };

  /**
   * @ngdoc function
   * @name plumbing.functions:setTotalProcessingTime
   * @function
   * @description
   * Set the "processing time" spent in FamilySearch REST endpoints.
   * You could use this to reset the processing time counter to zero if you wanted.
   *
   * @param {Number} time in milliseconds
   */
  exports.setTotalProcessingTime = function(time) {
    totalProcessingTime = time;
  };

  /**
   * @ngdoc function
   * @name plumbing.functions:get
   * @function
   *
   * @description
   * Low-level call to get a specific REST endpoint from FamilySearch
   *
   * @param {String} url may be relative; e.g., /platform/users/current
   * @param {Object=} params query parameters
   * @param {Object=} headers options headers
   * @param {Object=} opts options to pass to the http function specified during init
   * @param {Function=} responseMapper function to map response data to something else
   * @return {Object} a promise that behaves like promises returned by the http function specified during init
   */
  exports.get = function(url, params, headers, opts, responseMapper) {
    return exports.http('GET', helpers.appendQueryParameters(url, params), helpers.extend({'Accept': 'application/x-gedcomx-v1+json'}, headers), {}, opts, responseMapper);
  };

  /**
   * @ngdoc function
   * @name plumbing.functions:post
   * @function
   *
   * @description
   * Low-level call to post to a specific REST endpoint from FamilySearch
   *
   * @param {String} url may be relative
   * @param {Object=} data post data
   * @param {Object=} headers options headers
   * @param {Object=} opts options to pass to the http function specified during init
   * @param {Function=} responseMapper function to map response data to something else
   * @return {Object} a promise that behaves like promises returned by the http function specified during init
   */
  exports.post = function(url, data, headers, opts, responseMapper) {
    return exports.http('POST', url, helpers.extend({'Content-type': 'application/x-www-form-urlencoded'},headers), data, opts, responseMapper);
  };

  /**
   * @ngdoc function
   * @name plumbing.functions:put
   * @function
   *
   * @description
   * Low-level call to put to a specific REST endpoint from FamilySearch
   *
   * @param {String} url may be relative
   * @param {Object=} data post data
   * @param {Object=} headers options headers
   * @param {Object=} opts options to pass to the http function specified during init
   * @param {Function=} responseMapper function to map response data to something else
   * @return {Object} a promise that behaves like promises returned by the http function specified during init
   */
  exports.put = function(url, data, headers, opts, responseMapper) {
    return exports.http('PUT', url, helpers.extend({'Content-type': 'application/x-www-form-urlencoded'},headers), data, opts, responseMapper);
  };

  /**
   * @ngdoc function
   * @name plumbing.functions:del
   * @function
   *
   * @description
   * Low-level call to delete to a specific REST endpoint from FamilySearch
   *
   * @param {String} url may be relative
   * @param {Object=} opts options to pass to the http function specified during init
   * @param {Object=} headers options headers
   * @param {Function=} responseMapper function to map response data to something else
   * @return {Object} a promise that behaves like promises returned by the http function specified during init
   */
  exports.del = function(url, headers, opts, responseMapper) {
    return exports.http('DELETE', url, headers, {}, opts, responseMapper);
  };

  /**
   * @ngdoc function
   * @name plumbing.functions:http
   * @function
   *
   * @description
   * Low-level call to issue an http request to a specific REST endpoint from FamilySearch
   *
   * @param {String} method GET, POST, PUT, or DELETE
   * @param {String} url may be relative
   * @param {Object=} headers headers object
   * @param {Object=} data post data
   * @param {Object=} opts options to pass to the http function specified during init
   * @param {Function=} responseMapper function to map response data into the data to return
   * @param {Number=} retries number of times to retry
   * @return {Object} a promise that behaves like promises returned by the http function specified during init
   */
  exports.http = function(method, url, headers, data, opts, responseMapper, retries) {
    // prepend the server
    var absoluteUrl = helpers.getAbsoluteUrl(globals.server[globals.environment], url);

    // append the access token as a query parameter to avoid cors pre-flight
    // this is detrimental to browser caching across sessions, which seems less bad than cors pre-flight requests
    // TODO investigate this further
    if (globals.accessToken) {
      absoluteUrl = helpers.appendQueryParameters(absoluteUrl, {'access_token': globals.accessToken});
    }

    // default retries
    if (retries == null) { // also catches undefined
      retries = globals.maxHttpRequestRetries;
    }

    // call the http wrapper
    var promise = globals.httpWrapper(method, absoluteUrl, headers || {}, data || {}, opts || {});

    // process the response
    var d = globals.deferredWrapper();
    var returnedPromise = helpers.extendHttpPromise(d.promise, promise);
    promise.then(
      function(data) {
        var processingTime = promise.getResponseHeader('X-PROCESSING-TIME');
        if (processingTime) {
          totalProcessingTime += parseInt(processingTime,10);
        }
        if (responseMapper) {
          data = responseMapper(data);
        }
        d.resolve(data);
      },
      function() {
        var statusCode = promise.getStatusCode();
        console.log('http failure', statusCode, retries, promise.getAllResponseHeaders());
        if (statusCode === 401) {
          helpers.eraseAccessToken();
        }
        if (retries > 0 && (statusCode === 429 || (statusCode === 401 && globals.autoSignin))) {
          var retryAfter = 0;
          if (statusCode === 429) {
            var retryAfterHeader = promise.getResponseHeader('Retry-After');
            console.log('retryAfter',retryAfterHeader, promise.getAllResponseHeaders());
            if (retryAfterHeader) {
              retryAfter = parseInt(retryAfterHeader,10);
            }
            else {
              retryAfter = globals.defaultThrottleRetryAfter;
            }
          }
          // circular dependency on authentication.getAccessToken has been copied into globals
          globals.getAccessToken().then(
            function() { // promise will resolve right away if access code exists
              setTimeout(function() {
                promise = exports.http(method, url, headers, data, opts, responseMapper, retries-1);
                helpers.extendHttpPromise(returnedPromise, promise);
                promise.then(
                  function(data) {
                    d.resolve(data);
                  },
                  function() {
                    d.reject.apply(d, arguments);
                  });
              }, retryAfter);
            });
        }
        else {
          d.reject.apply(d, arguments);
        }
      });
    return returnedPromise;
  };

  return exports;
});

define('authentication',[
  'globals',
  'helpers',
  'plumbing'
], function(globals, helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name authentication
   * @description
   * These are the authentication functions. `getAccessToken` is the main function.
   * If you do not pass in an authorization code to `getAccessToken`, it will call the `getAuthCode` function to get one.
   *
   * {@link https://familysearch.org/developers/docs/api/resources#authentication FamilySearch API docs}
   */

  var exports = {};

  /**
   * @ngdoc function
   * @name authentication.functions:getAuthCode
   * @function
   *
   * @description
   * Open a popup window to allow the user to authenticate and authorize this application.
   * You do not have to call this function. If you call `getAccessToken` without passing in an authorization code,
   * that function will call this function to get one.
   *
   * @link https://familysearch.org/developers/docs/api/authentication/Authorization_resource FamilySearch API docs}
   *
   * @return {Object} a promise of the (string) auth code
   */
  exports.getAuthCode = function() {
    var popup = openPopup(helpers.getAbsoluteUrl(globals.oauthServer[globals.environment], 'authorization'), {
      'response_type' : 'code',
      'client_id'     : globals.appKey,
      'redirect_uri'  : globals.authCallbackUri
    });
    return pollForAuthCode(popup);
  };

  /**
   * @ngdoc function
   * @name authentication.functions:getAccessToken
   * @function
   *
   * @description
   * Get the access token for the user.
   * Call this function before making any requests that require authentication.
   *
   * You don't need to store the access token returned by this function; you just need to ensure that the promise
   * returned by this function resolves before making calls that require authentication.
   *
   * {@link https://familysearch.org/developers/docs/api/authentication/Access_Token_resource FamilySearch API docs}
   *
   * {@link http://jsfiddle.net/DallanQ/MpUg7/ editable example}
   *
   * @param {String=} authCode auth code from getAuthCode; if not passed in, this function will call getAuthCode
   * @return {Object} a promise of the (string) access token.
   */
  // plumbing.http may call getAccessToken if there was an error; copy into globals to avoid circular dependency
  globals.getAccessToken = exports.getAccessToken = function(authCode) {
    var accessTokenDeferred = globals.deferredWrapper();
    if (globals.accessToken) {
      helpers.nextTick(function() {
        accessTokenDeferred.resolve(globals.accessToken);
      });
    }
    else {
      // get auth code if not passed in
      var authCodePromise;
      if (authCode) {
        authCodePromise = helpers.refPromise(authCode);
      }
      else {
        authCodePromise = exports.getAuthCode();
      }
      authCodePromise.then(
        function(authCode) {
          // get the access token given the auth code
          var promise = plumbing.post(helpers.getAbsoluteUrl(globals.oauthServer[globals.environment], 'token'), {
            'grant_type' : 'authorization_code',
            'code'       : authCode,
            'client_id'  : globals.appKey
          });
          promise.then(
            function(data) {
              globals.accessToken = data['access_token'];
              if (globals.accessToken) {
                accessTokenDeferred.resolve(globals.accessToken);
                if (globals.saveAccessToken) {
                  helpers.createCookie(globals.accessTokenCookie, globals.accessToken, 0);
                }
              }
              else {
                accessTokenDeferred.reject(data['error']);
              }
            },
            function() {
              accessTokenDeferred.reject.apply(accessTokenDeferred, arguments);
            });
        },
        function() {
          accessTokenDeferred.reject.apply(accessTokenDeferred, arguments);
        });
    }
    return accessTokenDeferred.promise;
  };

  /**
   * @ngdoc function
   * @name authentication.functions:hasAccessToken
   * @function
   *
   * @description
   * Return whether the access token exists.
   * The access token may exist but be expired.
   * An access token is discovered to be expired and is erased if an API call returns a 401 unauthorized status
   *
   * @return {boolean} true if the access token exists
   */
  exports.hasAccessToken = function() {
    return !!globals.accessToken;
  };

  /**
   * @ngdoc function
   * @name authentication.functions:invalidateAccessToken
   * @function
   *
   * @description
   * Invalidate the current access token
   *
   * @return {Object} promise that is resolved once the access token has been invalidated
   */
  exports.invalidateAccessToken = function() {
    helpers.eraseAccessToken();
    return plumbing.del(helpers.getAbsoluteUrl(globals.oauthServer[globals.environment], 'token'));
  };

  /**
   * Open a popup window for user to authenticate and authorize this app
   *
   * @private
   * @param {String} url window url
   * @param {Object} params query parameters to append to the window url
   * @return {window} reference to the popup window
   */
  function openPopup(url, params) {
    // figure out where the center is
    var
      screenX     = helpers.isUndefined(window.screenX) ? window.screenLeft : window.screenX,
      screenY     = helpers.isUndefined(window.screenY) ? window.screenTop : window.screenY,
      outerWidth  = helpers.isUndefined(window.outerWidth) ? document.documentElement.clientWidth : window.outerWidth,
      outerHeight = helpers.isUndefined(window.outerHeight) ? (document.documentElement.clientHeight - 22) : window.outerHeight,
      width       = params.width|| 780,
      height      = params.height || 500,
      left        = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top         = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features    = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;
    return window.open(helpers.appendQueryParameters(url, params),'',features);
  }

  /**
   * Polls the popup window location for the auth code
   *
   * @private
   * @param {window} popup window to poll
   * @return a promise of the auth code
   */
  function pollForAuthCode(popup) {
    var d = globals.deferredWrapper();
    if (popup) {
      var i = setInterval(function() {
        try {
          if (popup.location.hostname === window.location.hostname) {
            var params = helpers.decodeQueryString(popup.location.href);
            clearInterval(i);
            popup.close();
            if (params['code']) {
              d.resolve(params['code']);
            }
            else {
              d.reject(params['error']);
            }
          }
        }
        catch(err) {}
      }, globals.authCodePollDelay);
    }
    else {
      d.reject('Popup blocked');
    }
    return d.promise;
  }

  return exports;
});

define('user',[
  'globals',
  'helpers',
  'plumbing'
], function(globals, helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name user
   * @description
   * Functions related to users
   *
   * {@link https://familysearch.org/developers/docs/api/resources#user FamilySearch API Docs}
   */

  var exports = {};

  /**
   * @ngdoc function
   * @name user.functions:getCurrentUser
   * @function
   *
   * @description
   * Get the current user with the following convenience functions
   *
   * - `getContactName()`
   * - `getFullName()`
   * - `getEmail()`
   * - `getId()`
   * - `getTreeUserId()`
   *
   * {@link https://familysearch.org/developers/docs/api/users/Current_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/3NJFM/ editable example}
   *
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} a promise for the current user
   */
  exports.getCurrentUser = function(opts) {
    return plumbing.get('/platform/users/current', {}, {}, opts, helpers.objectExtender(currentUserConvenienceFunctions));
  };

  var currentUserConvenienceFunctions = {
    getContactName: function() { return this.users[0].contactName; },
    getFullName:    function() { return this.users[0].fullName; },
    getEmail:       function() { return this.users[0].email; },
    getId:          function() { return this.users[0].id; },
    getTreeUserId:  function() { return this.users[0].treeUserId; }
  };

  /**
   * @ngdoc function
   * @name user.functions:getCurrentUserPerson
   * @function
   *
   * @description
   * Get the id of the current user person in the tree
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Current_User_Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/c4puF/ editable example}
   *
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the (string) id of the current user person
   */
  exports.getCurrentUserPerson = function(opts) {
    var promise = plumbing.get('/platform/tree/current-person', {}, {}, opts);
    var d = globals.deferredWrapper();
    var returnedPromise = helpers.extendHttpPromise(d.promise, promise);
    promise.then(
      function() {
        handleCurrentUserPersonResponse(d, promise);
      },
      function() {
        // in Chrome, the current person response is expected to fail because it involves a redirect and chrome doesn't
        // re-send the Accept header on a CORS redirect, so the response comes back as XML and jQuery can't parse it.
        // That's ok, because we'll pick up the ID from the Content-Location header
        handleCurrentUserPersonResponse(d, promise);
      });

    return returnedPromise;
  };

  // common code for current user person promise fulfillment and failure
  function handleCurrentUserPersonResponse(d, promise) {
    var id = null;
    // this is the expected result for Node.js because it doesn't follow redirects
    var location = promise.getResponseHeader('Location');
    if (!location) {
      // this is the expected result for browsers because they follow redirects
      // NOTE: Chrome doesn't re-send the accept header on CORS redirect requests, so the request fails because we can't
      // parse the returned XML into JSON. We still get a Content-Location header though.
      location = promise.getResponseHeader('Content-Location');
    }

    if (location) {
      var matchResult = location.match(/\/persons\/([^?]*)/);
      if (matchResult) {
        id = matchResult[1];
      }
    }

    if (id) {
      d.resolve(id);
    }
    else {
      d.reject('not found');
    }
  }

  return exports;
});

define('person',[
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name person
   * @description
   * Functions related to persons
   *
   * {@link https://familysearch.org/developers/docs/api/resources#person FamilySearch API Docs}
   */

  var exports = {};

  /**
   * @ngdoc function
   * @name person.functions:getPerson
   * @function
   *
   * @description
   * Get the specified person
   * The response includes the following convenience function
   *
   * - `getPerson()` - get the person object from the response, which has been extended with the *person convenience functions* listed below
   *
   * ###Person Convenience Functions
   *
   * - `getId()`
   * - `getBirthDate()`
   * - `getBirthPlace()`
   * - `getDeathDate()`
   * - `getDeathPlace()`
   * - `getGender()`
   * - `getLifeSpan()`
   * - `getName()`
   * - `isLiving()`
   * - `getGivenName()`
   * - `getSurname()`
   * - `getDisplayAttrs()` - returns an object with birthDate, birthPlace, deathDate, deathPlace, gender, lifespan, and name
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/cST4L/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPerson = function(id, params, opts) {
    params = params || {};
    return plumbing.get('/platform/tree/persons/'+encodeURI(id), params, {}, opts,
      helpers.compose(helpers.objectExtender({getPerson: function() { return this.persons[0]; }}), exports.personExtender));
  };

  exports.personExtensionPointGetter = function(response) {
    return response.persons;
  };

  var personConvenienceFunctions = {
    getId:         function() { return this.id; },
    getBirthDate:  function() { return this.display.birthDate; },
    getBirthPlace: function() { return this.display.birthPlace; },
    getDeathDate:  function() { return this.display.deathDate; },
    getDeathPlace: function() { return this.display.deathPlace; },
    getGender:     function() { return this.display.gender; },
    getLifeSpan:   function() { return this.display.lifespan; },
    getName:       function() { return this.display.name; },
    isLiving:      function() { return this.living; },
    getGivenName:  function() { return helpers.findOrEmpty(helpers.firstOrEmpty(helpers.findOrEmpty(this.names, {preferred: true}).nameForms).parts,
      {type: 'http://gedcomx.org/Given'}).value; },
    getSurname:    function() { return helpers.findOrEmpty(helpers.firstOrEmpty(helpers.findOrEmpty(this.names, {preferred: true}).nameForms).parts,
      {type: 'http://gedcomx.org/Surname'}).value; },
    getDisplayAttrs: function() { return this.display; }
  };

  exports.personExtender = helpers.objectExtender(personConvenienceFunctions, exports.personExtensionPointGetter);

  /**
   * @ngdoc function
   * @name person.functions:getPersonNotes
   * @function
   *
   * @description
   * Get the notes for a person
   * The response includes the following convenience function
   *
   * - `getNotes()` - get the array of notes from the response; each note has an `id` and a `subject`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/3enGw/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonNotes = function(id, params, opts) {
    params = params || {};
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/notes', params, {}, opts,
      helpers.objectExtender({getNotes: function() { return this && this.persons ? this.persons[0].notes : []; }}));
  };

  /**
   * @ngdoc function
   * @name person.functions:getMultiPerson
   * @function
   *
   * @description
   * Get multiple people at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/TF6Lg/ editable example}
   *
   * @param {Array} ids of the people to read
   * @param {Object=} params to pass to getPerson currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the people have been read, returning a map of person id to response
   */
  exports.getMultiPerson = function(ids, params, opts) {
    var promises = {};
    helpers.forEach(ids, function(id) {
      promises[id] = exports.getPerson(id, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name person.functions:getPersonWithRelationships
   * @function
   *
   * @description
   * Get a person and their children, spouses, and parents with the following convenience functions
   *
   * - `getPrimaryId()` - id of the person requested
   * - `getFatherIds()` - array of ids
   * - `getMotherIds()` - array of ids
   * - `getParentsIds()` - array of [fatherId, motherId]
   * - `getSpouseIds()` - array of ids
   * - `getChildIds(spouseId)` - array of ids; if spouseId is specified, returns only ids of children with spouse as the other parent
   *
   * The following functions return person objects decorated with *person convenience functions* {@link exports.functions:getPerson as described in getPerson}
   *
   * - `getPrimaryPerson()`
   * - `getPerson(id)` - works only for the primary person unless persons is set to true in params
   *
   *   In addition, the following functions are available if persons is set to true in params
   * - `getFathers()` - array of father persons
   * - `getMothers()` - array of mother persons
   * - `getParents()` - array of [father person, mother person]
   * - `getSpouses()` - array of spouse persons
   * - `getChildren(spouseId)` - array of child persons; if spouseId is specified returns only children with spouse as the other parent
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_With_Relationships_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/5Npsh/ editable example}
   *
   * @param {String} id person to read
   * @param {Object=} params set `persons` to true to retrieve full person objects for each relative
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person with relationships
   */
  exports.getPersonWithRelationships = function(id, params, opts) {
    params = params || {};
    return plumbing.get('/platform/tree/persons-with-relationships', helpers.removeEmptyProperties(helpers.extend({'person': id}, params)),
      {}, opts,
      helpers.compose(helpers.objectExtender(personWithRelationshipsConvenienceFunctions), exports.personExtender));
  };

  // TODO how identify preferred parents?
  var personWithRelationshipsConvenienceFunctions = {
    getPerson:     function(id) { return helpers.findOrEmpty(this.persons, {id: id}); },
    getPrimaryId:  function() { return helpers.findOrEmpty(this.persons, function(p) { return p.display.ascendancyNumber === '1';}).id; },
    getPrimaryPerson: function() { //noinspection JSValidateTypes
      return this.getPerson(this.getPrimaryId());
    },
    getFatherIds:  function() {
      var primaryId = this.getPrimaryId();
      return helpers.uniq(helpers.map(helpers.filter(this.childAndParentsRelationships,
        function(r) { return r.child.resourceId === primaryId && r.father; }),
        function(r) { return r.father.resourceId; }));
    },
    getFathers:    function() { return helpers.map(this.getFatherIds(), this.getPerson, this); },
    getMotherIds:  function() {
      var primaryId = this.getPrimaryId();
      return helpers.uniq(helpers.map(helpers.filter(this.childAndParentsRelationships,
        function(r) { return r.child.resourceId === primaryId && r.mother; }),
        function(r) { return r.mother.resourceId; }));
    },
    getMothers:    function() { return helpers.map(this.getMotherIds(), this.getPerson, this); },
    getParentsIds: function() {
      var primaryId = this.getPrimaryId();
      return helpers.map(helpers.filter(this.childAndParentsRelationships,
        function(r) { return r.child.resourceId === primaryId && (r.father || r.mother); }),
        function(r) { return [ r.father ? r.father.resourceId : '', r.mother ? r.mother.resourceId : '']; });
    },
    getParents:    function() {
      return helpers.map(this.getParentsIds(), function(parentIds) {
        return [this.getPerson(parentIds[0]), this.getPerson(parentIds[1])];
      }, this);
    },
    getSpouseIds:  function() {
      var primaryId = this.getPrimaryId();
      return helpers.uniq(helpers.map(helpers.filter(this.relationships, function(r) {
        return r.type === 'http://gedcomx.org/Couple' &&
          (r.person1.resourceId === primaryId || r.person2.resourceId === primaryId);
      }),
        function(r) { return r.person1.resourceId === primaryId ? r.person2.resourceId : r.person1.resourceId; }));
    },
    getSpouses:    function() { return helpers.map(this.getSpouseIds(), this.getPerson, this); },
    getChildIds:   function(spouseId) {
      var primaryId = this.getPrimaryId();
      return helpers.uniq(helpers.map(helpers.filter(this.childAndParentsRelationships, function(r) {
        return childParentRelationshipHasParent(r, primaryId) &&
          (!spouseId || childParentRelationshipHasParent(r, spouseId));
      }),
        function(r) { return r.child.resourceId; }));
    },
    getChildren:   function(spouseId) { return helpers.map(this.getChildIds(spouseId), this.getPerson, this); }
  };

  function childParentRelationshipHasParent(r, parentId) {
    return (r.father && r.father.resourceId === parentId) || (r.mother && r.mother.resourceId === parentId);
  }

  return exports;
});
define('pedigree',[
  'helpers',
  'person',
  'plumbing'
], function(helpers, person, plumbing) {
  /**
   * @ngdoc overview
   * @name pedigree
   * @description
   * Get someone's ancestry or descendancy
   *
   * {@link https://familysearch.org/developers/docs/api/resources#pedigree FamilySearch API Docs}
   */

  var exports = {};

  /**
   * @ngdoc function
   * @name pedigree.functions:getAncestry
   * @function
   *
   * @description
   * Get the ancestors of a specified person and optionally a specified spouse with the following convenience functions
   *
   * - `exists(ascendancyNumber)` - return true if a person with ascendancy number exists
   *
   * The following functions return person objects decorated with *person convenience functions* {@link person.functions:getPerson as described in getPerson}
   * as well as a `getAscendancyNumber()` function that returns the person's ascendancy number
   *
   * - `getPersons()` - returns an array of all persons
   * - `getPerson(ascendancyNumber)`
   *
   * **NOTE:** the `getBirthDate()`, `getBirthPlace()`, `getDeathDate()`, and `getDeathPlace()` person convenience functions
   * are available only if `params` includes `personDetails`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Ancestry_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/gt726/ editable example}
   *
   * @param {String} id of the person
   * @param {Object=} params includes `generations` to retrieve max 8, `spouse` id to get ancestry of person and spouse, `personDetails` set to true to retrieve full person objects for each ancestor
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the ancestry
   */
  exports.getAncestry = function(id, params, opts) {
    params = params || {};
    return plumbing.get('/platform/tree/ancestry', helpers.removeEmptyProperties(helpers.extend({'person': id}, params)),
      {}, opts,
      helpers.compose(
        helpers.objectExtender(pedigreeConvenienceFunctionGenerator('ascendancyNumber')),
        person.personExtender,
        helpers.objectExtender({getAscendancyNumber: function() { return this.display.ascendancyNumber; }}, person.personExtensionPointGetter)
      ));
  };

  function pedigreeConvenienceFunctionGenerator(numberLabel) {
    return {
      getPersons:    function()    { return this.persons; },
      exists:        function(num) { return !!helpers.findOrEmpty(this.persons, matchPersonNum(numberLabel, num)).id; },
      getPerson:     function(num) { return helpers.findOrEmpty(this.persons, matchPersonNum(numberLabel, num)); }
    };
  }

  function matchPersonNum(numberLabel, num) {
    return function(p) {
      /*jshint eqeqeq:false */
      return p.display[numberLabel] == num; // == so users can pass in either numbers or strings for ascendancy numbers
    };
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * @ngdoc function
   * @name pedigree.functions:getDescendancy
   * @function
   *
   * @description
   * Get the descendants of a specified person and optionally a specified spouse with the following convenience functions
   * (similar convenience functions as getAncestry)
   *
   * - `exists(descendancyNumber)` - return true if a person with descendancy number exists
   *
   * The following functions return person objects decorated with *person convenience functions* {@link person.functions:getPerson as described in getPerson}
   * as well as a `getDescendancyNumber()` function that returns the person's descendancy number
   *
   * - `getPersons()` - returns all persons
   * - `getPerson(descendancyNumber)`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Descendancy_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/eBNGk/ editable example}
   *
   * @param {String} id of the person
   * @param {Object=} params includes `generations` to retrieve max 2, `spouse` id to get descendency of person and spouse
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the descendancy
   */
  exports.getDescendancy = function(id, params, opts) {
    params = params || {};
    return plumbing.get('/platform/tree/descendancy', helpers.removeEmptyProperties(helpers.extend({'person': id}, params)),
      {}, opts,
      helpers.compose(
        helpers.objectExtender(pedigreeConvenienceFunctionGenerator('descendancyNumber')),
        person.personExtender,
        helpers.objectExtender({getDescendancyNumber: function() { return this.display.descendancyNumber; }}, person.personExtensionPointGetter)
      ));
  };

  return exports;
});
define('FamilySearch',[
  'init',
  'authentication',
  'user',
  'person',
  'pedigree',
  'plumbing'
], function(init, authentication, user, person, pedigree, plumbing) {
  return {
    init: init.init,

    getAuthCode: authentication.getAuthCode,
    getAccessToken: authentication.getAccessToken,
    hasAccessToken: authentication.hasAccessToken,
    invalidateAccessToken: authentication.invalidateAccessToken,

    getCurrentUser: user.getCurrentUser,
    getCurrentUserPerson: user.getCurrentUserPerson,

    getPerson: person.getPerson,
    getPersonNotes: person.getPersonNotes,
    getMultiPerson: person.getMultiPerson,
    getPersonWithRelationships: person.getPersonWithRelationships,

    getAncestry: pedigree.getAncestry,
    getDescendancy: pedigree.getDescendancy,

    get: plumbing.get,
    post: plumbing.post,
    put: plumbing.put,
    del: plumbing.del,
    http: plumbing.http,
    getTotalProcessingTime: plumbing.getTotalProcessingTime,
    setTotalProcessingTime: plumbing.setTotalProcessingTime
  };
});  // Ask almond to synchronously require the
  // module value here and return it as the
  // value to use for the public API for the built file.
  return require('FamilySearch');
}));
