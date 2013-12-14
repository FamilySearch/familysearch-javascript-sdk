/**
 * @preserve FamilySearch JavaScript SDK
 * (c) 2013 Dallan Quass and other contributors
 * Released under the MIT license
 * http://github.com/rootsdev/familysearch-javascript-sdk
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
  var exports = {};

  // borrowed from underscore.js
  exports.isArray = function(value) {
    /*jshint eqeqeq:false */
    return Array.isArray ? Array.isArray(value) : Object.prototype.toString.call(value) == '[object Array]';
  };

  // borrowed from underscore.js
  exports.isNumber = function(value) {
    /*jshint eqeqeq:false */
    return Object.prototype.toString.call(value) == '[object Number]';
  };

  // borrowed from underscore.js
  exports.isString = function(value) {
    /*jshint eqeqeq:false */
    return Object.prototype.toString.call(value) == '[object String]';
  };

  // borrowed from underscore.js
  exports.isFunction = function(value) {
    /*jshint eqeqeq:false */
    return (typeof /./ !== 'function') ? (typeof value === 'function') : Object.prototype.toString.call(value) == '[object Function]';
  };

  // borrowed from underscore.js
  exports.isObject = function(value) {
    return value === Object(value);
  };

  exports.isUndefined = function(value) {
    return value === void 0;
  };

  // borrowed from underscore.js
  var forEach = exports.forEach = function(obj, iterator, context) {
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

  // borrowed from underscore.js
  exports.keys = Object.keys || function(obj) {
    if (obj !== Object(obj)) {
      throw new TypeError('Invalid object');
    }
    var keys = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  };

  // simplified version of underscore's filter
  exports.filter = function(arr, fn, context) {
    var result = [];
    forEach(arr, function(e) {
      if (fn.call(context, e)) {
        result.push(e);
      }
    });
    return result;
  };

  // simplified version of underscore's map
  exports.map = function(arr, fn, context) {
    var result = [];
    forEach(arr, function(value, index, list) {
      result.push(fn.call(context, value, index, list));
    });
    return result;
  };

  // borrowed from underscore
  exports.contains = function(obj, target) {
    if (obj == null) { // covers undefined as well
      return false;
    }
    if (obj.indexOf && obj.indexOf === Array.prototype.indexOf) {
      return obj.indexOf(target) !== -1;
    }
    var result = false;
    forEach(obj, function(value) {
      if (value === target) {
        result = true;
      }
    });
    return result;
  };

  // simplified version of underscore's uniq
  exports.uniq = function(arr) {
    var results = [];
    forEach(arr, function(value) {
      if (!exports.contains(results, value)) {
        results.push(value);
      }
    });
    return results;
  };

  // simplified version of underscore's find
  // returns undefined if nothing found
  exports.find = function(arr, objOrFn, context) {
    var result;
    var isFn = exports.isFunction(objOrFn);
    if (arr) {
      for (var i = 0, len = arr.length; i < len; i++) {
        var elm = arr[i];
        var matches;
        if (isFn) {
          matches = objOrFn.call(context, elm);
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

  // Compose functions from right to left, with each function consuming the return value of the function that follows
  // borrowed from underscore
  exports.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // simplified version of underscore's flatten that only does shallow flattening
  exports.flatten = function(arr) {
    var result = [];
    forEach(arr, function(value) {
      if (exports.isArray(value)) {
        Array.prototype.push.apply(result, value);
      }
    });
    return result;
  };

  exports.flatMap = exports.compose(exports.flatten, exports.map);

  // union arrays
  // borrowed from underscore
  exports.union = function() {
    return exports.uniq(exports.flatten(arguments));
  };

  // returns find match or first if none found
  exports.findOrFirst = function(arr, objOrFn) {
    var result = exports.find(arr, objOrFn);
    return exports.isUndefined(result) ? arr[0] : result;
  };

  exports.extend = function(dest) {
    dest = dest || {};
    forEach(Array.prototype.slice.call(arguments, 1), function(source) {
      if (source) {
        forEach(source, function(value, key) {
          dest[key] = value;
        });
      }
    });
    return dest;
  };

  // create a new function which is the specified function with the right-most arguments pre-filled
  exports.partialRight = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
      return fn.apply(this, Array.prototype.slice.call(arguments, 0).concat(args));
    };
  };

  // return an empty object if passed in a null or undefined, similar to the maybe monad
  exports.maybe = function(value) {
    return value != null ? value : {}; // != null also covers undefined
  };

  // return a function that will extend an object with the specified extensions
  // optionally applying them at points returned by extensionPointGetter
  exports.objectExtender = function(extensions, extensionPointGetter) {
    if (extensionPointGetter) {
      return function(obj) {
        if (obj) {
          forEach(extensionPointGetter(obj), function(extensionPoint) {
            exports.extend(extensionPoint, extensions);
          });
        }
        return obj;
      };
    }
    else {
      return exports.partialRight(exports.extend, extensions);
    }
  };

  // copy functions from source to dest, binding them to source
  exports.wrapFunctions = function(dest, source, fns) {
    forEach(fns, function(fn) {
      dest[fn] = function() {
        return source[fn].apply(source, arguments);
      };
    });
    return dest;
  };

  // extend the destPromise with functions from the sourcePromise
  exports.extendHttpPromise = function(destPromise, sourcePromise) {
    return exports.wrapFunctions(destPromise, sourcePromise, ['getResponseHeader', 'getAllResponseHeaders', 'getStatusCode']);
  };

  // "empty" properties are undefined, null, or the empty string
  exports.removeEmptyProperties = function(obj) {
    forEach(obj, function(value, key) {
      if (value == null || value === '') {  // == null also catches undefined
        delete obj[key];
      }
    });
    return obj;
  };

  function getAbsoluteUrl(server, path) {
    if (!path.match(/^https?:\/\//)) {
      return server + (path.charAt(0) !== '/' ? '/' : '') + path;
    }
    else {
      return path;
    }
  }

  // prepend oauth server to url if url doesn't start with http(s)
  exports.getOAuthServerUrl = function(path) {
    return getAbsoluteUrl(globals.oauthServer[globals.environment], path);
  };

  // prepend server to url if url doesn't start with http(s)
  exports.getServerUrl = function(path) {
    return getAbsoluteUrl(globals.server[globals.environment], path);
  };

  // Create a URL-encoded query string from an object
  exports.encodeQueryString = function(params) {
    var arr = [];
    forEach(params, function(value, key) {
      arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });
    return arr.join('&');
  };

  // append query parameters
  exports.appendQueryParameters = function(url, params) {
    var queryString = exports.encodeQueryString(params);
    if (queryString.length === 0) {
      return url;
    }
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + queryString;
  };

  // decode query string into an object
  exports.decodeQueryString = function(qs) {
    var obj = {}, segments = qs.substring(qs.indexOf('?')+1).split('&');
    forEach(segments, function(segment) {
      var kv = segment.split('=', 2);
      if (kv && kv[0]) {
        obj[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
      }
    });
    return obj;
  };

  // call the callback on the next tick
  exports.nextTick = function(cb) {
    setTimeout(function() {
      cb();
    },0);
  };

  // borrowed from AngularJS's implementation of $q
  // if passed a promise returns the promise; otherwise returns a pseudo-promise returning the value
  exports.refPromise = function(value) {
    if (value && exports.isFunction(value.then)) {
      return value;
    }
    return {
      then: function(callback) {
        var d = globals.deferredWrapper();
        exports.nextTick(function() {
          d.resolve(callback(value));
        });
        return d.promise;
      }
    };
  };

  // borrowed from AngularJS's implementation of $q
  exports.promiseAll = function(promises) {
    var d = globals.deferredWrapper(),
      counter = 0,
      results = exports.isArray(promises) ? [] : {};

    forEach(promises, function(promise, key) {
      counter++;
      exports.refPromise(promise).then(
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
  exports.createCookie = function(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*86400));
      expires = '; expires='+date.toUTCString();
    }
    document.cookie = name+'='+value+expires+'; path=/';
  };

  exports.readCookie = function(name) {
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

  exports.eraseCookie = function(name) {
    exports.createCookie(name,'',-1);
  };

  // erase access token
  exports.eraseAccessToken = function() {
    globals.accessToken = null;
    if (globals.saveAccessToken) {
      exports.eraseCookie(globals.accessTokenCookie);
    }
  };

  return exports;
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
    var absoluteUrl = helpers.getServerUrl(url);

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
          data = responseMapper(data, promise);
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
    var popup = openPopup(helpers.getOAuthServerUrl('authorization'), {
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
          var promise = plumbing.post(helpers.getOAuthServerUrl('token'), {
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
    return plumbing.del(helpers.getOAuthServerUrl('token'));
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

define('changeHistory',[
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name changeHistory
   * @description
   * Functions related to change histories
   *
   * {@link https://familysearch.org/developers/docs/api/resources#change-history FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name changeHistory.functions:getPersonChangeHistory
   * @function
   *
   * @description
   * Get change history for a person
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of changes from the response; each change has the following convenience functions
   *
   * ###Change convenience Functions
   *
   * - `getId()` - id of the change
   * - `getContributorNames()` array of contributor name strings
   * - `getTitle()` - title string
   * - `getUpdatedTimestamp()` - timestamp
   * - `getChangeReason()` - string reason for change
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/6SqTH/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonChangeHistory = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/changes', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getChanges: function() {
          return this.entries || [];
        }}),
        helpers.objectExtender(changeHistoryConvenienceFunctions, function(response) {
          return response.entries;
        })
      ));
  };

  var changeHistoryConvenienceFunctions = {
    getId:               function() { return this.id; },
    getContributorNames: function() { return helpers.map(this.contributors, function(contributor) {
        return contributor.name;
      }); },
    getTitle:            function() { return this.title; },
    getUpdatedTimestamp: function() { return this.updated; },
    getChangeReason:     function() { return maybe(maybe(this.changeInfo)[0]).reason; }
  };

  // TODO getChildAndParentsRelationshipChangeHistory
  // TODO getCoupleRelationshipChangeHistory

  return exports;
});

define('discussions',[
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name discussions
   * @description
   * Functions related to discussions
   *
   * {@link https://familysearch.org/developers/docs/api/resources#discussions FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name discussions.functions:getPersonDiscussionReferences
   * @function
   *
   * @description
   * Get references to discussions for a person
   * The response includes the following convenience function
   *
   * - `getDiscussionIds()` - get an array of discussion ids from the response; pass the id into `getDiscussion` for more information
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/kd39K/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonDiscussionReferences = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/discussion-references', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      // TODO consider returning a URL
      helpers.objectExtender({getDiscussionIds: function() {
        return helpers.map(maybe(maybe(this.persons)[0])['discussion-references'], function(uri) {
          return uri.replace(/^.*\//, '').replace(/\?.*$/, '');
        });
      }}));
  };

  /**
   * @ngdoc function
   * @name discussions.functions:getDiscussion
   * @function
   *
   * @description
   * Get information about a discussion
   * The response includes the following convenience functions
   *
   * - `getId()` - discussion id
   * - `getTitle()` - title string
   * - `getDetails()` - details string
   * - `getNumberOfComments()` - number of comments
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/FzWSu/ editable example}
   *
   * @param {String} id of the discussion to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getDiscussion = function(id, params, opts) {
    return plumbing.get('/platform/discussions/discussions/'+encodeURI(id), params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.objectExtender(discussionConvenienceFunctions));
  };

  var discussionConvenienceFunctions = {
    getId:               function() { return maybe(maybe(this.discussions)[0]).id; },
    getTitle:            function() { return maybe(maybe(this.discussions)[0]).title; },
    getDetails:          function() { return maybe(maybe(this.discussions)[0]).details; },
    getNumberOfComments: function() { return maybe(maybe(this.discussions)[0]).numberOfComments; }
  };

  /**
   * @ngdoc function
   * @name discussions.functions:getComments
   * @function
   *
   * @description
   * Get comments for a discussion
   * The response includes the following convenience function
   *
   * - `getComments()` - get the array of comments from the response; each comment has an `id` and `text`
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Comments_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/b56hz/ editable example}
   *
   * @param {String} id of the discussion to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getComments = function(id, params, opts) {
    return plumbing.get('/platform/discussions/discussions/'+encodeURI(id)+'/comments', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.objectExtender({getComments: function() { return maybe(maybe(this.discussions)[0]).comments || []; }}));
  };

  return exports;
});

define('memories',[
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name memories
   * @description
   * Functions related to memories
   *
   * {@link https://familysearch.org/developers/docs/api/resources#memories FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name memories.functions:getPersonMemoryReferences
   * @function
   *
   * @description
   * Get references to memories for a person
   * The response includes the following convenience function
   *
   * - `getMemories()` - get the array of memory references from the response; each reference has the following convenience functions
   *
   * ###Memory reference convenience Functions
   *
   * - `getMemoryId()` - id of the memory (use `getMemory` to find out more)
   * - `getPersonaId()` - id of the persona in the memory that is attached to this person
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/vt79D/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMemoryReferences = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/memory-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemories: function() {
          return maybe(maybe(this.persons)[0]).evidence || [];
        }}),
        helpers.objectExtender(personMemoryReferenceConvenienceFunctions, function(response) {
          return maybe(maybe(response.persons)[0]).evidence;
        })
      ));
  };

  var personMemoryReferenceConvenienceFunctions = {
    // TODO hack
    getMemoryId:  function() { return this.resource ? this.resource.replace(/^.*\/memories\/(\d+)\/.*$/, '$1') : this.resource; },
    getPersonaId: function() { return this.resourceId; }
  };

  /**
   * @ngdoc function
   * @name memories.functions:getPersonMemories
   * @function
   *
   * @description
   * Get a paged list of memories for a person
   * The response includes the following convenience function
   *
   * - `getMemories()` - get the array of memories from the response; each memory has the following convenience functions
   *
   * ###Memory convenience Functions
   *
   * - `getId()` - id of the memory (use `getMemory` to find out more)
   * - `getArtifactURL()` - URL of the media object
   * - `getTitles()` - an array of title strings
   * - `getTitle()` - first title in the array
   * - `getDescriptions()` - an array of description strings
   * - `getDescription()` - first description in the array
   * - `getArtifactFilenames()` - array of filename strings
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Query_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/XaD23/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0, `type` type of artifacts to return - possible values are photo and story - defaults to both
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMemories = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/memories', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemories: function() {
          return this.sourceDescriptions || [];
        }}),
        helpers.objectExtender(memoriesConvenienceFunctions, function(response) {
          return response.sourceDescriptions;
        })
      ));
  };

  var memoriesConvenienceFunctions = {
    getId:           function() { return this.id; },
    getArtifactURL:  function() { return this.about; },
    getTitle:        function() { return maybe(maybe(this.titles)[0]).value; },
    getTitles:       function() { return helpers.map(this.titles, function(title) {
      return title.value;
    }); },
    getDescription:  function() { return maybe(maybe(this.description)[0]).value; },
    getDescriptions: function() { return helpers.map(this.description, function(description) {
      return description.value;
    }); },
    getArtifactFilenames: function() { return helpers.map(this.artifactMetadata, function(am) {
      return am.filename;
    }); }
  };

  /**
   * @ngdoc function
   * @name memories.functions:getUserMemories
   * @function
   *
   * @description
   * Get a paged list of memories for a user
   * The response includes the following convenience function
   *
   * - `getMemories()` - get the array of memories from the response; each memory has the following convenience functions
   *
   * ###Memory convenience Functions
   *
   * - `getId()` - id of the memory (use `getMemory` to find out more)
   * - `getArtifactURL()` - URL of the media object
   * - `getTitles()` - an array of title strings
   * - `getTitle()` - first title in the array
   * - `getDescriptions()` - an array of description strings
   * - `getDescription()` - first description in the array
   * - `getArtifactFilenames()` - array of filename strings
   *
   * {@link https://familysearch.org/developers/docs/api/memories/User_Memories_Query_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/V8pfd/ editable example}
   *
   * @param {String} id of the user
   * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getUserMemories = function(id, params, opts) {
    // TODO verify the convenience functions are really the same as for getPersonMemories
    return plumbing.get('/platform/memories/users/'+encodeURI(id)+'/memories', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemories: function() {
          return this.sourceDescriptions || [];
        }}),
        helpers.objectExtender(memoriesConvenienceFunctions, function(response) {
          return response.sourceDescriptions;
        })
      ));
  };

  /**
   * @ngdoc function
   * @name memories.functions:getMemory
   * @function
   *
   * @description
   * Get information about a source
   * The response includes the following convenience functions
   *
   * - `getId()` - id of the memory
   * - `getMediaType()` - media type
   * - `getArtifactURL()` - URL of the media object
   * - `getIconURL()` - URL of an icon for the media object
   * - `getThumbnailURL()` - URL of a thumbnail for the media object
   * - `getTitles()` - an array of title strings
   * - `getTitle()` - first title in the array
   * - `getDescriptions()` - an array of description strings
   * - `getDescription()` - first description in the array
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/9J4zn/ editable example}
   *
   * @param {String} id of the memory to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemory = function(id, params, opts) {
    return plumbing.get('/platform/memories/memories/'+encodeURI(id), params, {}, opts,
      helpers.objectExtender(memoryConvenienceFunctions));
  };

  var memoryConvenienceFunctions = {
    getId:           function() { return maybe(maybe(this.sourceDescriptions)[0]).id; },
    getMediaType:    function() { return maybe(maybe(this.sourceDescriptions)[0]).mediaType; },
    getArtifactURL:  function() { return maybe(maybe(this.sourceDescriptions)[0]).about; },
    getIconURL:      function() { return maybe(maybe(maybe(maybe(this.sourceDescriptions)[0]).links)['image-icon']).href; },
    getThumbnailURL: function() { return maybe(maybe(maybe(maybe(this.sourceDescriptions)[0]).links)['image-thumbnail']).href; },
    getTitle:        function() { return maybe(maybe(maybe(maybe(this.sourceDescriptions)[0]).titles)[0]).value; },
    getTitles:       function() { return helpers.map(maybe(maybe(this.sourceDescriptions)[0]).titles, function(title) {
      return title.value;
    }); },
    getDescription:  function() { return maybe(maybe(maybe(maybe(this.sourceDescriptions)[0]).description)[0]).value; },
    getDescriptions: function() { return helpers.map(maybe(maybe(this.sourceDescriptions)[0]).description, function(description) {
      return description.value;
    }); }
  };

  /**
   * @ngdoc function
   * @name memories.functions:getMemoryComments
   * @function
   *
   * @description
   * Get comments for a memory
   * The response includes the following convenience function
   *
   * - `getComments()` - get the array of comments from the response; each comment has an `id` and `text`
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comments_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/aJ77f/ editable example}
   *
   * @param {String} id of the memory to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryComments = function(id, params, opts) {
    return plumbing.get('/platform/memories/memories/'+encodeURI(id)+'/comments', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.objectExtender({getComments: function() { return maybe(maybe(this.discussions)[0]).comments || []; }}));
  };

  /**
   * @ngdoc function
   * @name memories.functions:getMemoryPersonas
   * @function
   *
   * @description
   * Get personas for a memory
   * The response includes the following convenience function
   *
   * - `getPersonas()` - get the array of personas from the response; each persona has `id`, `extracted`, `display.name`, and several other fields
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/zD5V7/ editable example}
   *
   * @param {String} id of the memory to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryPersonas = function(id, params, opts) {
    return plumbing.get('/platform/memories/memories/'+encodeURI(id)+'/personas', params, {}, opts,
      helpers.objectExtender({getPersonas: function() { return this.persons || []; }}));
  };

  /**
   * @ngdoc function
   * @name memories.functions:getPersonPortraitURL
   * @function
   *
   * @description
   * Get a URL that will redirect to the portrait of a person
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Portrait_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/f8DU3/ editable example}
   *
   * @param {String} id of the person
   * @return {String} URL that will redirect to the portrait of a person
   */
  // TODO add the default parameter
  exports.getPersonPortraitURL = function(id) {
    return helpers.getServerUrl('/platform/tree/persons/'+encodeURI(id)+'/portrait');
  };

  // TODO think about a way to test whether a person has a portrait: default to / and see if it redirects there

  return exports;
});

define('notes',[
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name notes
   * @description
   * Functions related to notes
   *
   * {@link https://familysearch.org/developers/docs/api/resources#notes FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name notes.functions:getPersonNotes
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
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/notes', params, {}, opts,
      helpers.objectExtender({getNotes: function() { return maybe(maybe(this.persons)[0]).notes || []; }}));
  };


  /**
   * @ngdoc function
   * @name notes.functions:getPersonNote
   * @function
   *
   * @description
   * Get information about a note
   * The response includes the following convenience functions
   *
   * - `getPersonId()`
   * - `getNoteId()`
   * - `getSubject()`
   * - `getText()`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/96EkL/ editable example}
   *
   * @param {String} pid of the person
   * @param {String} nid of the note
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonNote = function(pid, nid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/notes/'+encodeURI(nid), params, {}, opts,
      helpers.objectExtender(personNoteConvenienceFunctions));
  };

  var personNoteConvenienceFunctions = {
    getPersonId: function() { return maybe(maybe(this.persons)[0]).id; },
    getNoteId:   function() { return maybe(maybe(maybe(maybe(this.persons)[0]).notes)[0]).id; },
    getSubject:  function() { return maybe(maybe(maybe(maybe(this.persons)[0]).notes)[0]).subject; },
    getText:     function() { return maybe(maybe(maybe(maybe(this.persons)[0]).notes)[0]).text; }
  };

  // TODO getCoupleRelationshipNotes
  // TODO getCoupleRelationshipNote
  // TODO getChildAndParentsRelationshipNotes
  // TODO getChildAndParentsRelationshipNote

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

  var maybe = helpers.maybe; // shorthand

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
   * - `isLiving()`
   * - `getName()` - display name
   * - `getGivenName()` - preferred
   * - `getSurname()` - preferred
   * - `getNames()` - array of name objects decorated with *name convenience functions* described below
   * - `getFacts()` - array of fact objects decorated with *fact convenience functions* described below
   * - `getDisplayAttrs()` - returns an object with birthDate, birthPlace, deathDate, deathPlace, gender, lifespan, and name
   *
   * ###Name Convenience Functions
   * - `getId()` - name id
   * - `getContributor()` - id of the contributor
   * - `getType()` - http://gedcomx.org/BirthName, etc.
   * - `getNameFormsCount()` - get the number of name forms
   * - `getFullText(i)` - get the full text of the `i`'th name form; if `i` is omitted; get the first
   * - `getGivenName(i)` - get the given part of the `i`'th name form; if `i` is omitted; get the first
   * - `getSurname(i)` - get the surname part of the `i`'th name form; if `i` is omitted; get the first
   * - `isPreferred()` - true if this name is preferred
   *
   * ###Fact Convenience Functions
   * - `getId()` - fact id
   * - `getContributor()` - id of the contributor
   * - `getType()` - http://gedcomx.org/Birth, etc.
   * - `getDate()` - original string
   * - `getFormalDate()` - standard form; e.g., +1836-04-13
   * - `getPlace()` - original string
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
    return plumbing.get('/platform/tree/persons/'+encodeURI(id), params, {}, opts,
      helpers.compose(helpers.objectExtender({getPerson: function() { return this.persons[0]; }}), exports.personExtender));
  };

  exports.personExtensionPointGetter = function(response) {
    return response.persons;
  };

  exports.personConvenienceFunctions = {
    getId:         function() { return this.id; },
    getBirthDate:  function() { return this.display.birthDate; },
    getBirthPlace: function() { return this.display.birthPlace; },
    getDeathDate:  function() { return this.display.deathDate; },
    getDeathPlace: function() { return this.display.deathPlace; },
    getGender:     function() { return this.display.gender; },
    getLifeSpan:   function() { return this.display.lifespan; },
    isLiving:      function() { return this.living; },
    getName:       function() { return this.display.name; },
    getGivenName:  function() { return maybe(helpers.find(
      maybe(maybe(maybe(helpers.findOrFirst(this.names, {preferred: true})).nameForms)[0]).parts,
      {type: 'http://gedcomx.org/Given'}
    )).value; },
    getSurname:    function() { return maybe(helpers.find(
      maybe(maybe(maybe(helpers.findOrFirst(this.names, {preferred: true})).nameForms)[0]).parts,
      {type: 'http://gedcomx.org/Surname'}
    )).value; },
    getNames:      function() { return this.names; },
    getFacts:      function() { return this.facts; },
    getDisplayAttrs: function() { return this.display; }
  };

  var nameConvenienceFunctions = {
    getId:             function() { return this.id; },
    getContributor:    function() { return maybe(maybe(this.attribution).contributor).resourceId; },
    getType:           function() { return this.type; },
    getNameFormsCount: function() { return this.nameForms ? this.nameForms.length : 0; },
    getFullText:       function(i) { return maybe(maybe(this.nameForms)[i || 0]).fullText; },
    getGivenName:      function(i) { return maybe(helpers.find(
      maybe(maybe(this.nameForms)[i || 0]).parts,
      {type: 'http://gedcomx.org/Given'}
    )).value; },
    getSurname:        function(i) { return maybe(helpers.find(
      maybe(maybe(this.nameForms)[i || 0]).parts,
      {type: 'http://gedcomx.org/Surname'}
    )).value; },
    isPreferred:       function() { return this.preferred; }
  };

  exports.factConvenienceFunctions = {
    getId:             function() { return this.id; },
    getContributor:    function() { return maybe(maybe(this.attribution).contributor).resourceId; },
    getType:           function() { return this.type; },
    getDate:           function() { return maybe(this.date).original; },
    getFormalDate:     function() { return maybe(this.date).formal; },
    getPlace:          function() { return maybe(this.place).original; }
  };

  exports.personExtender = helpers.compose(
    helpers.objectExtender(exports.personConvenienceFunctions, exports.personExtensionPointGetter),
    helpers.objectExtender(nameConvenienceFunctions, function(response) {
      return helpers.flatMap(response.persons, function(person) { return person.names; });
    }),
    helpers.objectExtender(exports.factConvenienceFunctions, function(response) {
      return helpers.flatMap(response.persons, function(person) { return person.facts; });
    })
  );

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
   * - `getSpouseIds()` - array of ids
   * - `getChildIds(spouseId)` - array of ids; if spouseId is specified, returns only ids of children with spouse as the other parent
   * - `getParentRelationships()` - array of objects decorated with *child and parents relationship convenience functions* described below
   * - `getSpouseRelationships()` - array of object decorated with *spouse relationship convenience functions* described below
   * - `getChildRelationships()` - array of object decorated with *child and parents relationship convenience functions* described below
   *
   * The following functions return person objects decorated with *person convenience functions* as described for {@link person.functions:getPerson getPerson}
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
   * ###Child and Parents Relationship Convenience Functions
   *
   * - `getId()` - relationship id
   * - `getFatherId()`
   * - `getMotherId()`
   * - `getChildId()`
   * - `getFatherFacts()` - an array of facts (e.g., parent-relationship type) decorated with *fact convenience functions*
   * as described for {@link person.functions:getPerson getPerson}
   * - `getMotherFacts()` - similar to father facts
   *
   * ###Spouse Relationship Convenience Functions
   *
   * - `getId()` - relationship id
   * - `getHusbandId()`
   * - `getWifeId()`
   * - `getPrimaryId()` - id of the person requested
   * - `getSpouseId()` - id of the spouse of the person requested
   * - `getFacts()` - an array of facts (e.g., marriage) decorated with *fact convenience functions*
   * as described for {@link person.functions:getPerson getPerson}
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
    return plumbing.get('/platform/tree/persons-with-relationships', helpers.removeEmptyProperties(helpers.extend({'person': id}, params)),
      {}, opts,
      helpers.compose(
        helpers.objectExtender({getPrimaryId: function() { return id; }}), // make id available
        helpers.objectExtender(exports.factConvenienceFunctions, function(response) {
          return helpers.union(
            helpers.flatMap(response.childAndParentsRelationships, function(r) {
              return helpers.union(r.fatherFacts, r.motherFacts);
            }),
            helpers.flatMap(response.getSpouseRelationships(), function(r) {
              return r.facts;
            })
          );
        }),
        helpers.objectExtender({getPrimaryId: function() { return id; }}, function(response) { // make id available to spouse relationship convenience functions
          return response.getSpouseRelationships();
        }),
        helpers.objectExtender(spouseRelationshipConvenienceFunctions, function(response) {
          return response.getSpouseRelationships();
        }),
        helpers.objectExtender(childAndParentsRelationshipConvenienceFunctions, function(response) {
          return response.childAndParentsRelationships;
        }),
        helpers.objectExtender(personWithRelationshipsConvenienceFunctions),
        exports.personExtender
      ));
  };

  // TODO how identify preferred parents?
  var personWithRelationshipsConvenienceFunctions = {
    getPerson:     function(id) { return helpers.find(this.persons, {id: id}); },
    getPrimaryPerson: function() { return this.getPerson(this.getPrimaryId()); },
    getParentRelationships: function() {
      var primaryId = this.getPrimaryId();
      return helpers.filter(this.childAndParentsRelationships, function(r) {
        return maybe(r.child).resourceId === primaryId;
      });
    },
    getSpouseRelationships:  function() {
      return helpers.filter(this.relationships, function(r) {
        return r.type === 'http://gedcomx.org/Couple';
      });
    },
    getChildRelationships: function() {
      var primaryId = this.getPrimaryId();
      return helpers.filter(this.childAndParentsRelationships, function(r) {
        return maybe(r.father).resourceId === primaryId || maybe(r.mother).resourceId === primaryId;
      });
    },
    getFatherIds:  function() {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getParentRelationships(), function(r) {
          return !!r.getFatherId();
        }),
        function(r) {
          return r.getFatherId();
        }, this));
    },
    getFathers:    function() { return helpers.map(this.getFatherIds(), this.getPerson, this); },
    getMotherIds:  function() {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getParentRelationships(), function(r) {
          return !!r.getMotherId();
        }),
        function(r) {
          return r.getMotherId();
        }, this));
    },
    getMothers:    function() { return helpers.map(this.getMotherIds(), this.getPerson, this); },
    getSpouseIds:  function() {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getSpouseRelationships(), function(r) {
          return !!r.getSpouseId();
        }),
        function(r) {
          return r.getSpouseId();
        }, this));
    },
    getSpouses:    function() { return helpers.map(this.getSpouseIds(), this.getPerson, this); },
    getChildIds:   function(spouseId) {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getChildRelationships(), function(r) {
          return !!r.getChildId() &&
            (!spouseId || r.getFatherId() === spouseId || r.getMotherId() === spouseId);
        }),
        function(r) {
          return r.getChildId();
        }, this));
    },
    getChildren:   function(spouseId) { return helpers.map(this.getChildIds(spouseId), this.getPerson, this); }
  };

  var spouseRelationshipConvenienceFunctions = {
    getId:        function() { return this.id; },
    getHusbandId: function() { return maybe(this.person1).resourceId; },
    getWifeId:    function() { return maybe(this.person2).resourceId; },
    getSpouseId:  function() { return this.getHusbandId() === this.getPrimaryId() ? this.getWifeId() : this.getHusbandId(); },
    getFacts:     function() { return this.facts || []; }
  };

  var childAndParentsRelationshipConvenienceFunctions = {
    getId:          function() { return this.id; },
    getFatherId:    function() { return maybe(this.father).resourceId; },
    getMotherId:    function() { return maybe(this.mother).resourceId; },
    getChildId:     function() { return maybe(this.child).resourceId; },
    getFatherFacts: function() { return this.fatherFacts || []; },
    getMotherFacts: function() { return this.motherFacts || []; }
  };

  /**
   * @ngdoc function
   * @name person.functions:getPersonChangeSummary
   * @function
   *
   * @description
   * Get the change summary for a person. For detailed change information see functions in the changeHistory module
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of changes from the response; each change has an `id`, `published` timestamp, `title`, and `updated` timestamp
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_Summary_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ga37h/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonChangeSummary = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/change-summary', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      helpers.objectExtender({getChanges: function() { return this.entries || []; }}));
  };

  /**
   * @ngdoc function
   * @name person.functions:getRelationshipsToSpouses
   * @function
   *
   * @description
   * Get the relationships to a person's spouses.
   * The response includes the following convenience functions
   *
   * - `getSpouseIds()` - an array of string ids
   * - `getRelationships()` - an array of relationships; each has the following convenience functions
   *
   * ###Relationship convenience functions
   *
   * - `getId()` - id of the relationship
   * - `getHusbandId()`
   * - `getWifeId()`
   * - `getFacts()` - array of facts decorated with *fact convenience functions* as described for {@link person.functions:getPerson getPerson}
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Relationships_to_Spouses_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/7zLEJ/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationships,
   * which you can access using a `getPerson(id)` convenience function. The person object id decorated with convenience functions
   * as described for {@link person.functions:getPerson getPerson} but possibly without facts
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getRelationshipsToSpouses = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/spouse-relationships', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getPrimaryId: function() { return id; }}), // make id available
        helpers.objectExtender(relationshipsToSpousesConvenienceFunctions),
        helpers.objectExtender(spouseRelationshipConvenienceFunctions, function(response) {
          return response.relationships;
        }),
        helpers.objectExtender(exports.factConvenienceFunctions, function(response) {
          return helpers.flatMap(response.relationships, function(relationship) { return relationship.facts; });
        }),
        exports.personExtender
      ));
  };

  var relationshipsToSpousesConvenienceFunctions = {
    getRelationships: function() { return this.relationships || []; },
    getSpouseIds:  function() {
      var primaryId = this.getPrimaryId();
      return helpers.uniq(helpers.map(this.getRelationships(), function(r) {
        return r.getHusbandId() === primaryId ? r.getWifeId() : r.getHusbandId();
      }, this));
    },
    getPerson:    function(id) { return helpers.find(this.persons, {id: id}); }
  };

  /**
   * @ngdoc function
   * @name person.functions:getRelationshipsToParents
   * @function
   *
   * @description
   * Get the relationships to a person's parents.
   * The response includes the following convenience function
   *
   * - `getRelationships()` - an array of { `id` - relationship id, `fatherId`, `motherId` }
   *
   * Pass the relationship id into {@link parentsAndChildren.functions:getChildAndParents getChildAndParents} for more information
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Relationships_to_Parents_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ajxpq/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationships,
   * which you can access using a `getPerson(id)` convenience function. The person object id decorated with convenience functions
   * as described for {@link person.functions:getPerson getPerson} but possibly without facts
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getRelationshipsToParents = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/parent-relationships', params, {}, opts,
      helpers.compose(
        // TODO consider adding convenience functions to expose the couple relationship for the parents
        helpers.objectExtender(relationshipsToParentsConvenienceFunctions),
        exports.personExtender
      ));
  };

  var CHILD_AND_PARENTS_RELATIONSHIP = 'http://familysearch.org/v1/ChildAndParentsRelationship';

  var relationshipsToParentsConvenienceFunctions = {
    getRelationships: function() {
      return helpers.map( // map them to the { id, fatherId, motherId } result objects
        helpers.uniq( // remove duplicates
          helpers.map( // map them to the relationship identifier
            helpers.filter(this.relationships, function(relationship) { // get only the parent-child relationships
              return relationship.type === 'http://gedcomx.org/ParentChild' &&
                !!maybe(relationship.identifiers)[CHILD_AND_PARENTS_RELATIONSHIP];
            }),
            function(relationship) {
              return relationship.identifiers[CHILD_AND_PARENTS_RELATIONSHIP];
            }, this)
        ),
        function(relIdent) {
          return {
            id: relIdent.replace(/^.*\//, '').replace(/\?.*$/, ''), // TODO how else to get the relationship id?
            fatherId: maybe(maybe(helpers.find(this.relationships, function(relationship) { // find this relationship with father link
              return maybe(relationship.identifiers)[CHILD_AND_PARENTS_RELATIONSHIP] === relIdent &&
                !!maybe(relationship.links).father;
            })).person1).resourceId, // and return person1's resource id
            motherId: maybe(maybe(helpers.find(this.relationships, function(relationship) { // find this relationship with mother link
              return maybe(relationship.identifiers)[CHILD_AND_PARENTS_RELATIONSHIP] === relIdent &&
                !!maybe(relationship.links).mother;
            })).person1).resourceId // and return person1's resource id
          };
        }, this);
    },
    getPerson: function(id) { return helpers.find(this.persons, {id: id}); }
  };

  /**
   * @ngdoc function
   * @name person.functions:getRelationshipsToChildren
   * @function
   *
   * @description
   * Get the relationships to a person's children.
   * The response includes the following convenience functions
   *
   * - `getChildIds()` - an array of string ids
   * - `getRelationships()` - an array of relationships; each has the following convenience functions
   *
   * ###Relationship convenience functions
   *
   * - `getId()` - id of the relationship; pass into {@link parentsAndChildren.functions:getChildAndParents getChildAndParents} for more information
   * - `getChildId()`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Relationships_to_Children_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/mUUEK/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationships,
   * which you can access using a `getPerson(id)` convenience function. The person object id decorated with convenience functions
   * as described for {@link person.functions:getPerson getPerson} but possibly without facts
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getRelationshipsToChildren = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/child-relationships', params, {}, opts,
      helpers.compose(
        helpers.objectExtender(relationshipsToChildrenConvenienceFunctions),
        helpers.objectExtender(childRelationshipConvenienceFunctions, function(response) {
          return response.relationships;
        }),
        exports.personExtender
      ));
  };

  var relationshipsToChildrenConvenienceFunctions = {
    getRelationships: function() { return this.relationships || []; },
    getChildIds:  function() {
      return helpers.uniq(helpers.map(this.getRelationships(), function(r) {
        return r.getChildId();
      }, this));
    },
    getPerson:    function(id) { return helpers.find(this.persons, {id: id}); }
  };

  var childRelationshipConvenienceFunctions = {
    getId:      function() { return this.id; },
    getChildId: function() { return maybe(this.person2).resourceId; }
  };

  // TODO getPersonMerge
  // TODO getPersonNotAMatch
  // TODO getRelationshipsToChildren

  return exports;
});

define('parentsAndChildren',[
  'helpers',
  'person',
  'plumbing'
], function(helpers, person, plumbing) {
  /**
   * @ngdoc overview
   * @name parentsAndChildren
   * @description
   * Functions related to parents and children relationships
   *
   * {@link https://familysearch.org/developers/docs/api/resources#parents-and-children FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name parentsAndChildren.functions:getChildAndParents
   * @function
   *
   * @description
   * Get information about a child and parents relationship; to get more
   * The response includes the following convenience functions
   *
   * - `getId()` - id of the relationship
   * - `getFatherId()` - person id
   * - `getMotherId()` - mother id
   * - `getChildId()` - child id
   * - `getFatherFacts()` - an array of facts decorated with *fact convenience functions* as described for {@link person.functions:getPerson getPerson}
   * - `getMotherFacts()` - similar to father facts
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/C437t/ editable example}
   *
   * @param {String} id of the relationship to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function. The person object id decorated with convenience functions
   * as described for {@link person.functions:getPerson getPerson} but possibly without facts
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParents = function(id, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(id), params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender(childAndParentsConvenienceFunctions),
        helpers.objectExtender(person.factConvenienceFunctions, function(response) {
          return helpers.union(
            maybe(maybe(response.childAndParentsRelationships)[0]).fatherFacts,
            maybe(maybe(response.childAndParentsRelationships)[0]).motherFacts
          );
        }),
        person.personExtender
      ));
  };

  var childAndParentsConvenienceFunctions = {
    getId:          function() { return maybe(maybe(this.childAndParentsRelationships)[0]).id; },
    getFatherId:    function() { return maybe(maybe(maybe(this.childAndParentsRelationships)[0]).father).resourceId; },
    getMotherId:    function() { return maybe(maybe(maybe(this.childAndParentsRelationships)[0]).mother).resourceId; },
    getChildId:     function() { return maybe(maybe(maybe(this.childAndParentsRelationships)[0]).child).resourceId; },
    getFatherFacts: function() { return maybe(maybe(this.childAndParentsRelationships)[0]).fatherFacts; },
    getMotherFacts: function() { return maybe(maybe(this.childAndParentsRelationships)[0]).motherFacts; },
    getPerson:      function(id) { return helpers.find(this.persons, {id: id}); }
  };

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
  var maybe = helpers.maybe; // shorthand

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
   * The following functions return person objects decorated with *person convenience functions* as described for {@link person.functions:getPerson getPerson}
   * (with the exception that `getGivenName()` and `getSurname()` functions do not work because the name pieces aren't there)
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
      exists:        function(num) { return !!maybe(helpers.find(this.persons, matchPersonNum(numberLabel, num))).id; },
      getPerson:     function(num) { return helpers.find(this.persons, matchPersonNum(numberLabel, num)); }
    };
  }

  function matchPersonNum(numberLabel, num) {
    return function(p) {
      /*jshint eqeqeq:false */
      return p.display[numberLabel] == num; // == so users can pass in either numbers or strings for ascendancy numbers
    };
  }

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
   * (with the exception that `getGivenName()` and `getSurname()` functions do not work because the name pieces aren't there)
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
define('searchAndMatch',[
  'helpers',
  'person',
  'plumbing'
], function(helpers, person, plumbing) {
  /**
   * @ngdoc overview
   * @name searchAndMatch
   * @description
   * Functions related to search and match
   *
   * {@link https://familysearch.org/developers/docs/api/resources#search-and-match FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name searchAndMatch.functions:getPersonSearch
   * @function
   *
   * @description
   * Search people
   * The response includes the following convenience functions
   *
   * - `getContext()` - get the search context to pass into subsequent requests for additional results
   * - `getResults()` - get the array of search results from the response; each result has the following convenience functions
   *
   * ###Search result convenience Functions
   *
   * - `getId()` - person id
   * - `getTitle()` - title string
   * - `getScore()` - real number
   * - `getConfidence()` - appears to be an integer
   * - `getPrimaryPerson()` - person object decorated with the *person convenience functions* as described for {@link person.functions:getPerson getPerson}
   * - `getFathers()` - array of person objects similarly decorated
   * - `getMothers()` - array of person objects similarly decorated
   * - `getSpouses()` - array of person objects similarly decorated
   * - `getChildren()` - array of person objects similarly decorated
   *
   * ###Search parameters
   * In the list below, {relation} can be father, mother, or spouse.
   * For non-exact matches, append a tilde (~) to the end of the parameter value.
   * (The tilde works for name parameters; does it work for dates and places as well?)
   *
   * - `start` - index of first result
   * - `count` - number of results
   * - `context` - the search context token, which is returned from search requests and allows requests for subsequent pages
   * - `name` - full name
   * - `givenName`
   * - `surname`
   * - `gender` - male or female
   * - `birthDate`
   * - `birthPlace`
   * - `deathDate`
   * - `deathPlace`
   * - `marriageDate`
   * - `marriagePlace`
   * - {relation}`Name`
   * - {relation}`GivenName`
   * - {relation}`Surname`
   * - {relation}`BirthDate`
   * - {relation}`BirthPlace`
   * - {relation}`DeathDate`
   * - {relation}`DeathPlace`
   * - {relation}`MarriageDate`
   * - {relation}`MarriagePlace`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Search_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/2abrY/ editable example}
   *
   * @param {Object} params described above
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonSearch = function(params, opts) {
    return plumbing.get('/platform/tree/search', helpers.removeEmptyProperties({
      q: getQuery(params),
      start: params.start,
      count: params.count,
      context: params.context
    }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      helpers.compose(
        searchMatchResultExtender,
        function(obj, promise) {
          obj.getContext = function() {
            return promise.getResponseHeader('X-fs-page-context');
          };
          return obj;
        }
      )
    );
  };

  var nonQueryParams = {start: true, count: true, context: true};

  function quote(value) {
    value = value.replace(/[:"]/g, '').trim();
    return value.indexOf(' ') >= 0 ? '"' + value + '"' : value;
  }

  function getQuery(params) {
    return helpers.map(helpers.filter(helpers.keys(params), function(key) { return !nonQueryParams[key]; }),
                       function(key) { return key+':'+quote(params[key]); }).join(' ');
  }

  // TODO refactor this to reuse personWithRelationshipsConvenienceFunctions?
  // The person with relationships json has a childAndParentsRelationships object with .father and .mother,
  // which may be more accurate than our gender checking, which lists parents without a gender as mothers.
  // Another issue is these functions need to start navigating from two levels higher - at content.gedcomx.
  var searchResultConvenienceFunctions = {
    getId:         function() { return this.id; },
    getTitle:      function() { return this.title; },
    getScore:      function() { return this.score; },
    getConfidence: function() { return this.confidence; },
    getPerson:     function(id) { return helpers.find(maybe(maybe(this.content).gedcomx).persons, {id: id}); },
    getPrimaryPerson: function() {
      return this.getPerson(this.getId());
    },
    getFatherIds:  function() {
      var primaryId = this.getId(), self = this;
      return helpers.uniq(helpers.map(helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
               r.person2.resourceId === primaryId &&
               r.person1 &&
               maybe(self.getPerson(r.person1.resourceId).gender).type === 'http://gedcomx.org/Male';
      }),
        function(r) { return r.person1.resourceId; }));
    },
    getFathers:    function() { return helpers.map(this.getFatherIds(), this.getPerson, this); },
    getMotherIds:  function() {
      var primaryId = this.getId(), self = this;
      return helpers.uniq(helpers.map(helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person2.resourceId === primaryId &&
          r.person1 &&
          maybe(self.getPerson(r.person1.resourceId).gender).type !== 'http://gedcomx.org/Male';
      }),
        function(r) { return r.person1.resourceId; }));
    },
    getMothers:    function() { return helpers.map(this.getMotherIds(), this.getPerson, this); },
    getSpouseIds:  function() {
      var primaryId = this.getId();
      return helpers.uniq(helpers.map(helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/Couple' &&
          (r.person1.resourceId === primaryId || r.person2.resourceId === primaryId);
      }),
        function(r) { return r.person1.resourceId === primaryId ? r.person2.resourceId : r.person1.resourceId; }));
    },
    getSpouses:    function() { return helpers.map(this.getSpouseIds(), this.getPerson, this); },
    getChildIds:  function() {
      var primaryId = this.getId();
      return helpers.uniq(helpers.map(helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person1.resourceId === primaryId &&
          r.person2;
      }),
        function(r) { return r.person2.resourceId; }));
    },
    getChildren:   function() { return helpers.map(this.getChildIds(), this.getPerson, this); }
  };

  var searchMatchResultExtender = helpers.compose(
    helpers.objectExtender({getResults: function() {
      return this.entries || [];
    }}),
    helpers.objectExtender(searchResultConvenienceFunctions, function(response) {
      return response.entries;
    }),
    helpers.objectExtender(person.personConvenienceFunctions, function(response) {
      return helpers.flatMap(response.entries, function(entry) {
        return maybe(maybe(entry.content).gedcomx).persons;
      });
    })
  );

  /**
   * @ngdoc function
   * @name searchAndMatch.functions:getPersonMatches
   * @function
   *
   * @description
   * Get the matches (possible duplicates) for a person
   * The response includes the following convenience function
   *
   * - `getResults()` - get the array of match results from the response; each result has the following convenience functions
   * as described for {@link searchAndMatch.functions:getPersonSearch getPersonSearch}
   *
   * ###Match result convenience Functions
   *
   * - `getId()` - person id
   * - `getTitle()` - title string
   * - `getScore()` - real number
   * - `getConfidence()` - appears to be an integer
   * - `getPrimaryPerson()` - person object decorated with the *person convenience functions* as described for {@link person.functions:getPerson getPerson}
   * - `getFathers()` - array of person objects similarly decorated
   * - `getMothers()` - array of person objects similarly decorated
   * - `getSpouses()` - array of person objects similarly decorated
   * - `getChildren()` - array of person objects similarly decorated
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Matches_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/5uwyf/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMatches = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/matches', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      searchMatchResultExtender);
  };


  /**
   * @ngdoc function
   * @name searchAndMatch.functions:getPersonMatchesQuery
   * @function
   *
   * @description
   * Get matches for someone not in the tree
   * The response includes the following convenience function
   *
   * - `getResults()` - get the array of match results from the response; each result has the following convenience functions
   * as described for {@link searchAndMatch.functions:getPersonSearch getPersonSearch}
   *
   * ###Match result convenience Functions
   *
   * - `getId()` - person id
   * - `getTitle()` - title string
   * - `getScore()` - real number
   * - `getConfidence()` - appears to be an integer
   * - `getPrimaryPerson()` - person object decorated with the *person convenience functions* as described for {@link person.functions:getPerson getPerson}
   * - `getFathers()` - array of person objects similarly decorated
   * - `getMothers()` - array of person objects similarly decorated
   * - `getSpouses()` - array of person objects similarly decorated
   * - `getChildren()` - array of person objects similarly decorated
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Search_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/hhcLP/ editable example}
   *
   * @param {Object} params same parameters as described for {@link searchAndMatch.functions:getPersonSearch getPersonSearch},
   * with the exception that `context` is not a valid parameter for match, and `candidateId` restricts matches to the person with that Id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMatchesQuery = function(params, opts) {
    return plumbing.get('/platform/tree/matches', helpers.removeEmptyProperties({
      q: getQuery(params),
      start: params.start,
      count: params.count
    }), {'Accept': 'application/x-gedcomx-atom+json'}, opts, searchMatchResultExtender);
  };

  return exports;
});

define('sourceBox',[
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name sourceBox
   * @description
   * Functions related to a user's source box
   *
   * {@link https://familysearch.org/developers/docs/api/resources#source-box FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name sourceBox.functions:getCollectionsForUser
   * @function
   *
   * @description
   * Search people
   * The response includes the following convenience functions
   *
   * - `getCollectionIds()` - get the array of collection id's from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_for_a_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/et88N/ editable example}
   *
   * @param {String} id of the user who owns the source box
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionsForUser = function(id, params, opts) {
    return plumbing.get('/platform/sources/'+encodeURI(id)+'/collections', {}, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.objectExtender({getCollectionIds: function() {
        return helpers.map(this.collections, function(collection) {
          return collection.id;
        });
      }}));
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:getCollection
   * @function
   *
   * @description
   * Get information about a user-defined collection
   * The response includes the following convenience functions
   *
   * - `getId()` - collection id
   * - `getTitle()` - title string
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/h5wCt/ editable example}
   *
   * @param {String} id of the collection to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollection = function(id, params, opts) {
    return plumbing.get('/platform/sources/collections/'+encodeURI(id), params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.objectExtender(userDefinedCollectionConvenienceFunctions));
  };

  var userDefinedCollectionConvenienceFunctions = {
    getId:               function() { return maybe(maybe(this.collections)[0]).id; },
    getTitle:            function() { return maybe(maybe(this.collections)[0]).title; }
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:getCollectionSourceDescriptions
   * @function
   *
   * @description
   * Get a paged list of source descriptions in a user-defined collection
   * The response includes the following convenience function
   *
   * - `getSourceDescriptions()` - get the array of source descriptions from the response; each has the following convenience functions
   *
   * ###Source description convenience functions
   *
   * - `getId()` - id of the source description
   * - `getTitles()` - array of title strings
   * - `getTitle()` - the first title string
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_Source_Descriptions_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/7yDmE/ editable example}
   *
   * @param {String} id of the collection to read
   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionSourceDescriptions = function(id, params, opts) {
    return plumbing.get('/platform/sources/collections/'+encodeURI(id)+'/descriptions', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceDescriptions: function() {
          return this.sourceDescriptions || [];
        }}),
        helpers.objectExtender(sourceDescriptionConvenienceFunctions, function(response) {
          return response.sourceDescriptions;
        })
      ));
  };

  var sourceDescriptionConvenienceFunctions = {
    getId: function() { return this.id; },
    getTitle: function() { return maybe(maybe(this.titles)[0]).value; },
    getTitles: function() { return helpers.map(this.titles, function(title) {
      return title.value;
    }); }
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:getCollectionSourceDescriptionsForUser
   * @function
   *
   * @description
   * Get a paged list of source descriptions in all user-defined collections defined by a user
   * The response includes the following convenience function
   *
   * - `getSourceDescriptions()` - get the array of source descriptions from the response; each has the same convenience functions
   * as for {@link sourceBox.functions:getCollectionSourceDescriptions getCollectionSourceDescriptions}
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_Source_Descriptions_for_a_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/4TSxJ/ editable example}
   *
   * @param {String} id of the user to read
   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionSourceDescriptionsForUser = function(id, params, opts) {
    return plumbing.get('/platform/sources/'+encodeURI(id)+'/collections/descriptions', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceDescriptions: function() {
          return this.sourceDescriptions || [];
        }}),
        helpers.objectExtender(sourceDescriptionConvenienceFunctions, function(response) {
          return response.sourceDescriptions;
        })
      ));
  };

  return exports;
});

define('sources',[
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name sources
   * @description
   * Functions related to sources
   *
   * {@link https://familysearch.org/developers/docs/api/resources#sources FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name sources.functions:getPersonSourceReferences
   * @function
   *
   * @description
   * Get references to sources for a person
   * The response includes the following convenience function
   *
   * - `getSources()` - get the array of source references from the response; each reference has the following convenience functions
   *
   * ###Source reference convenience Functions
   *
   * - `getSourceId()` - id of the source ( use `getSourceDescription` to find out more)
   * - `getTags()` - array of tags; each tag is an object with a `resource` property identifying an assertion type
   * - `getContributorId()` - id of the contributor (use `getAgent` to find out more)
   * - `getModifiedTimestamp()`
   * - `getChangeMessage()`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/BkydV/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonSourceReferences = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/source-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getSources: function() {
          return maybe(maybe(this.persons)[0]).sources || [];
        }}),
        helpers.objectExtender(sourceReferenceConvenienceFunctions, function(response) {
          return maybe(maybe(response.persons)[0]).sources;
        })
      ));
  };

  var sourceReferenceConvenienceFunctions = {
    // TODO consider returning the URL
    getSourceId:          function() { return this.description ? this.description.replace(/.*\//, '').replace(/\?.*$/, '') : this.description; },
    getTags:              function() { return this.tags || []; },
    getContributorId:     function() { return maybe(maybe(this.attribution).contributor).resourceId; },
    getModifiedTimestamp: function() { return maybe(this.attribution).modified; },
    getChangeMessage:     function() { return maybe(this.attribution).changeMessage; }
  };

  /**
   * @ngdoc function
   * @name sources.functions:getSourceDescription
   * @function
   *
   * @description
   * Get information about a source
   * The response includes the following convenience functions
   *
   * - `getId()` - id of the source description
   * - `getTitles()` - array of title strings
   * - `getTitle()` - the first title string
   * - `getCitations()` - array of citation strings
   * - `getNotes()` - array of note strings
   * - `getAbout()` - URI to the resource being described
   *
   * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/eECJx/ editable example}
   *
   * @param {String} id of the source description to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceDescription = function(id, params, opts) {
    return plumbing.get('/platform/sources/descriptions/'+encodeURI(id), params, {}, opts,
      helpers.objectExtender(sourceDescriptionConvenienceFunctions));
  };

  var sourceDescriptionConvenienceFunctions = {
    getId: function() { return maybe(maybe(this.sourceDescriptions)[0]).id; },
    getTitle: function() { return maybe(maybe(maybe(maybe(this.sourceDescriptions)[0]).titles)[0]).value; },
    getTitles: function() { return helpers.map(maybe(maybe(this.sourceDescriptions)[0]).titles, function(title) {
        return title.value;
      }); },
    getCitations: function() { return helpers.map(maybe(maybe(this.sourceDescriptions)[0]).citations, function(citation) {
        return citation.value;
      }); },
    getNotes: function() { return helpers.map(maybe(maybe(this.sourceDescriptions)[0]).notes, function(note) {
        return note.text;
      }); },
    getAbout: function() { return maybe(maybe(this.sourceDescriptions)[0]).about; }
  };

  // TODO getCoupleRelationshipSourceReferences
  // TODO getChildAndParentsRelationshipSourceReferences
  // TODO getSourcesReferencesQuery

  return exports;
});

define('spouses',[
  'helpers',
  'person',
  'plumbing'
], function(helpers, person, plumbing) {
  /**
   * @ngdoc overview
   * @name spouses
   * @description
   * Functions related to spouse relationships
   *
   * {@link https://familysearch.org/developers/docs/api/resources#spouses FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name spouses.functions:getCouple
   * @function
   *
   * @description
   * Get information about a couple relationship
   * The response includes the following convenience functions
   *
   * - `getId()` - id of the relationship
   * - `getHusbandId()`
   * - `getWifeId()`
   * - `getFacts()` - array of facts decorated with *fact convenience functions* as described for {@link person.functions:getPerson getPerson}
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/a2vUg/ editable example}
   *
   * @param {String} id of the relationship to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function. The person object id decorated with convenience functions
   * as described for {@link person.functions:getPerson getPerson} but possibly without facts
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCouple = function(id, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(id), params, {}, opts,
      helpers.compose(
        helpers.objectExtender(coupleConvenienceFunctions),
        helpers.objectExtender(person.factConvenienceFunctions, function(response) {
          return maybe(maybe(response.relationships)[0]).facts;
        }),
        person.personExtender
      ));
  };

  var coupleConvenienceFunctions = {
    getId:        function() { return maybe(maybe(this.relationships)[0]).id; },
    getHusbandId: function() { return maybe(maybe(maybe(this.relationships)[0]).person1).resourceId; },
    getWifeId:    function() { return maybe(maybe(maybe(this.relationships)[0]).person2).resourceId; },
    getFacts:     function() { return maybe(maybe(this.relationships)[0]).facts || []; },
    getPerson:    function(id) { return helpers.find(this.persons, {id: id}); }
  };

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

  var maybe = helpers.maybe; // shorthand

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
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} a promise for the current user
   */
  exports.getCurrentUser = function(params, opts) {
    return plumbing.get('/platform/users/current', params, {}, opts, helpers.objectExtender(currentUserConvenienceFunctions));
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
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the (string) id of the current user person
   */
  exports.getCurrentUserPerson = function(params, opts) {
    var promise = plumbing.get('/platform/tree/current-person', params, {}, opts);
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

  /**
   * @ngdoc function
   * @name user.functions:getAgent
   * @function
   *
   * @description
   * Get information about the specified agent (contributor)
   * The response includes the following convenience functions
   *
   * - `getId()`
   * - `getName()`
   * - `getAccountName()`
   * - `getEmail()`
   *
   * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/BpT8c/ editable example}
   *
   * @param {String} id of the contributor; e.g., tree user id
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   */
  exports.getAgent = function(id, params, opts) {
    return plumbing.get('/platform/users/agents/'+encodeURI(id), params, {}, opts, helpers.objectExtender(agentConvenienceFunctions));
  };

  var agentConvenienceFunctions = {
    getId:          function() { return maybe(maybe(this.agents)[0]).id; },
    getName:        function() { return maybe(maybe(maybe(maybe(this.agents)[0]).names)[0]).value; },
    getAccountName: function() { return maybe(maybe(maybe(maybe(this.agents)[0]).accounts)[0]).accountName; },
    getEmail:       function() {
      var email = maybe(maybe(maybe(maybe(this.agents)[0]).emails)[0]).resource;
      return email ? email.replace(/^mailto:/,'') : email;
    }
  };

  return exports;
});

define('FamilySearch',[
  'init',
  'authentication',
  'changeHistory',
  'discussions',
  'memories',
  'notes',
  'parentsAndChildren',
  'pedigree',
  'person',
  'searchAndMatch',
  'sourceBox',
  'sources',
  'spouses',
  'user',
  'plumbing'
], function(init, authentication, changeHistory, discussions, memories, notes, parentsAndChildren, pedigree, person,
            searchAndMatch, sourceBox, sources, spouses, user, plumbing) {
  return {
    init: init.init,

    // authentication
    getAuthCode: authentication.getAuthCode,
    getAccessToken: authentication.getAccessToken,
    hasAccessToken: authentication.hasAccessToken,
    invalidateAccessToken: authentication.invalidateAccessToken,

    // changeHistory
    getPersonChangeHistory: changeHistory.getPersonChangeHistory,

    // discussions
    getPersonDiscussionReferences: discussions.getPersonDiscussionReferences,
    getDiscussion: discussions.getDiscussion,
    getComments: discussions.getComments,

    // memories
    getPersonMemoryReferences: memories.getPersonMemoryReferences,
    getMemory: memories.getMemory,
    getMemoryComments: memories.getMemoryComments,
    getMemoryPersonas: memories.getMemoryPersonas,
    getPersonPortraitURL: memories.getPersonPortraitURL,
    getPersonMemories: memories.getPersonMemories,
    getUserMemories: memories.getUserMemories,

    // notes
    getPersonNotes: notes.getPersonNotes,
    getPersonNote: notes.getPersonNote,

    // parents and children
    getChildAndParents: parentsAndChildren.getChildAndParents,

    // pedigree
    getAncestry: pedigree.getAncestry,
    getDescendancy: pedigree.getDescendancy,

    // person
    getPerson: person.getPerson,
    getMultiPerson: person.getMultiPerson,
    getPersonWithRelationships: person.getPersonWithRelationships,
    getPersonChangeSummary: person.getPersonChangeSummary,
    getRelationshipsToSpouses: person.getRelationshipsToSpouses,
    getRelationshipsToParents: person.getRelationshipsToParents,
    getRelationshipsToChildren: person.getRelationshipsToChildren,

    // search and match
    getPersonSearch: searchAndMatch.getPersonSearch,
    getPersonMatches: searchAndMatch.getPersonMatches,
    getPersonMatchesQuery: searchAndMatch.getPersonMatchesQuery,

    // sourceBox
    getCollectionsForUser: sourceBox.getCollectionsForUser,
    getCollection: sourceBox.getCollection,
    getCollectionSourceDescriptions: sourceBox.getCollectionSourceDescriptions,
    getCollectionSourceDescriptionsForUser: sourceBox.getCollectionSourceDescriptionsForUser,

    // sources
    getPersonSourceReferences: sources.getPersonSourceReferences,
    getSourceDescription: sources.getSourceDescription,

    // spouses
    getCouple: spouses.getCouple,

    // user
    getCurrentUser: user.getCurrentUser,
    getCurrentUserPerson: user.getCurrentUserPerson,
    getAgent: user.getAgent,

    // plumbing
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
