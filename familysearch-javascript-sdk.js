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
  setTimeout: null,
  clearTimeout: null,
  authCallbackUri: null,
  autoSignin: false,
  autoExpire: false,
  accessToken: null,
  saveAccessToken: false,
  logging: false,
  // constants for now, but could become options in the future
  accessTokenCookie: 'FS_ACCESS_TOKEN',
  authCodePollDelay: 50,
  defaultThrottleRetryAfter: 500,
  maxHttpRequestRetries: 2,
  maxAccessTokenInactivityTime: 3540000, // 59 minutes to be safe
  maxAccessTokenCreationTime:  86340000, // 23 hours 59 minutes to be safe
  apiServer: {
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

  // Object.create polyfill
  if (!Object.create) {
    Object.create = (function(){
      function F() {}

      return function(o) {
        if (arguments.length !== 1) {
          throw new Error('Object.create implementation only accepts one parameter.');
        }
        F.prototype = o;
        return new F();
      };
    })();
  }

  /**
   * borrowed from underscore.js
   * @param {*} value to test
   * @returns {boolean}
   */
  exports.isArray = function(value) {
    /*jshint eqeqeq:false */
    return Array.isArray ? Array.isArray(value) : Object.prototype.toString.call(value) == '[object Array]';
  };

  /**
   * borrowed from underscore.js
   * @param {*} value to test
   * @returns {boolean}
   */
  exports.isNumber = function(value) {
    /*jshint eqeqeq:false */
    return Object.prototype.toString.call(value) == '[object Number]';
  };

  /**
   * borrowed from underscore.js
   * @param {*} value to test
   * @returns {boolean}
   */
  exports.isString = function(value) {
    /*jshint eqeqeq:false */
    return Object.prototype.toString.call(value) == '[object String]';
  };

  /**
   * borrowed from underscore.js
   * @param {*} value to test
   * @returns {boolean}
   */
  exports.isFunction = function(value) {
    /*jshint eqeqeq:false */
    return (typeof /./ !== 'function') ? (typeof value === 'function') : Object.prototype.toString.call(value) == '[object Function]';
  };

  /**
   * borrowed from underscore.js
   * @param {*} value to test
   * @returns {boolean}
   */
  exports.isObject = function(value) {
    return value === Object(value);
  };

  /**
   * borrowed from underscore.js
   * @param value to test
   * @returns {boolean}
   */
  exports.isUndefined = function(value) {
    return value === void 0;
  };

  /**
   * borrowed from underscore.js
   * @param {Array|Object} obj Object or array to iterate over
   * @param {function(elm)} iterator Function to call
   * @param {Object=} context Object for this
   */
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

  /**
   * borrowed from underscore.js
   * @param {Object} obj Object to get keys from
   * @returns {Array.<string>} keys
   */
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

  /**
   * Simplified version of underscore's filter
   * @param {Array|Object} arr Array or object to iterate over
   * @param {function(elm)} fn Function returns true to keep element
   * @param {Object=} context Object for this
   * @returns {Array} Filtered array
   */
  exports.filter = function(arr, fn, context) {
    var result = [];
    forEach(arr, function(e) {
      if (fn.call(context, e)) {
        result.push(e);
      }
    });
    return result;
  };

  /**
   * simplified version of underscore's map
   * @param {Array|Object} arr Array or object to iterate over
   * @param {function(elm)} fn Function to call
   * @param {Object=} context Object for this
   * @returns {Array} Mapped array
   */
  exports.map = function(arr, fn, context) {
    var result = [];
    forEach(arr, function(value, index, list) {
      result.push(fn.call(context, value, index, list));
    });
    return result;
  };

  /**
   * borrowed from underscore
   * @param {Array|Object} obj Object or array to check
   * @param {*} target Thing to look for
   * @returns {boolean} Return true if found
   */
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

  /**
   * simplified version of underscore's uniq
   * @param {Array} arr Array to extract unique elements from
   * @returns {Array} Contains only one instance of each element
   */
  exports.uniq = function(arr) {
    var results = [];
    forEach(arr, function(value) {
      if (!exports.contains(results, value)) {
        results.push(value);
      }
    });
    return results;
  };

  /**
   * simplified version of underscore's find
   * returns undefined if nothing found
   * @param {Array} arr Array to search
   * @param {Object|function(elm)} objOrFn If object, look for matching object; otherwise look for function to return true
   * @param {Object=} context Object for this
   * @returns {*} Thing found
   */
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

  /**
   * borrowed from underscore.js
   * Compose functions from right to left, with each function consuming the return value of the function that follows
   * @returns {Function} Composed function
   */
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

  /**
   * simplified version of underscore's flatten that only does shallow flattening
   * @param {Array} arr Array of arrays to flatten
   * @returns {Array} Flattened array
   */
  exports.flatten = function(arr) {
    var result = [];
    forEach(arr, function(value) {
      if (exports.isArray(value)) {
        Array.prototype.push.apply(result, value);
      }
    });
    return result;
  };

  /**
   * Composition of map and flatten
   * Flattens the output of map into a single array
   * @returns {Array} Flattened array
   */
  exports.flatMap = exports.compose(exports.flatten, exports.map);

  /**
   * borrowed from underscore
   * Union arrays, removing duplicates
   * @returns {Array} Unioned array
   */
  exports.union = function() {
    return exports.uniq(exports.flatten(arguments));
  };

  /**
   * Return found match or first if none found
   * @param {Array} arr Array to search
   * @param {Object|function(elm)} objOrFn If object, look for matching object; otherwise look for function to return true
   * @returns {*} Thing found or first element of array
   */
  exports.findOrFirst = function(arr, objOrFn) {
    var result = exports.find(arr, objOrFn);
    return exports.isUndefined(result) ? arr[0] : result;
  };

  /**
   * borrowed from underscore
   * @param {Object} dest Object to extend
   * @returns {Object} Extended object
   */
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

  /**
   * Create a new function which is the specified function with the right-most arguments pre-filled with arguments from this call
   * @param {function()} fn Function to wrap
   * @returns {Function} Wrapped function
   */
  exports.partialRight = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
      return fn.apply(this, Array.prototype.slice.call(arguments).concat(args));
    };
  };

  /**
   * Create a new function which is the specified function with the left-most arguments pre-filled with arguments from this call
   * @param {function()} fn Function to wrap
   * @returns {Function} Wrapped function
   */
  exports.partial = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
      return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
    };
  };

  /**
   * Return an empty object if passed in a null or undefined, similar to the maybe monad
   * @param {*} value Value to test
   * @returns {*} Original value or empty object
   */
  exports.maybe = function(value) {
    return value != null ? value : {}; // != null also covers undefined
  };

  /**
   * Return a function that takes an object and extends it with the specified extensions
   * @param {Object} extensions
   * @param {function(Object)=} extensionPointGetter Optional function that returns (sub)objects to extend
   * @return {function(Object)} The extender function
   */
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

  /**
   * Return a function that takes an object and returns an object with the same properties but with the constructor function's prototype
   * @param {function()} constructorFunction Create new objects with this constructor
   * @param {string=} attr if passed in, the constructor function will be applied to (each) element of object[attr] instead of the object itself
   * @param {function(Object)=} subObjectGenerator Function that takes an object and returns a set of sub-objects;
   * if passed in, the constructor function will be applied to sub-object[attr], where the sub-objects are returned by subObjectGenerator
   * @return {function(Object)} The constructor setter function
   */
  exports.constructorSetter = function(constructorFunction, attr, subObjectGenerator) {
    var setConstructor;
    if (subObjectGenerator) {
      setConstructor = exports.constructorSetter(constructorFunction, attr);
      return function(obj) {
        if (exports.isObject(obj)) {
          var subObjs = subObjectGenerator(obj);
          if (exports.isArray(subObjs)) {
            exports.forEach(subObjs, function(subObj) {
              setConstructor(subObj);
            });
          }
          else if (exports.isObject(subObjs)) {
            setConstructor(subObjs);
          }
        }
        return obj;
      };
    }
    else if (attr) {
      setConstructor = exports.constructorSetter(constructorFunction);
      return function(obj) {
        if (exports.isObject(obj)) {
          if (exports.isArray(obj[attr])) {
            obj[attr] = exports.map(obj[attr], function(o) {
              return setConstructor(o);
            });
          }
          else if (exports.isObject(obj[attr])) {
            obj[attr] = setConstructor(obj[attr]);
          }
        }
        return obj;
      };
    }
    else {
      return function(obj) {
        var result = Object.create(constructorFunction.prototype);
        exports.extend(result, obj);
        return result;
      };
    }
  };

  /**
   * Copy functions from source to dest, binding them to source
   * @param {Object} dest Destination object
   * @param {Object} source Source object
   * @param {Array<string>} fns Names of functions to copy
   * @returns {Object} Destination object with functions
   */
  exports.wrapFunctions = function(dest, source, fns) {
    forEach(fns, function(fn) {
      dest[fn] = function() {
        return source[fn].apply(source, arguments);
      };
    });
    return dest;
  };

  /**
   * Extend the destPromise with functions from the sourcePromise
   * @param {Object} destPromise Destination promise
   * @param {Object} sourcePromise Source promise
   * @returns {Object} Destination promise with functions from source promise
   */
  exports.extendHttpPromise = function(destPromise, sourcePromise) {
    return exports.wrapFunctions(destPromise, sourcePromise, ['getResponseHeader', 'getAllResponseHeaders', 'getStatusCode', 'getRequest']);
  };

  /**
   * "empty" properties are undefined, null, or the empty string
   * @param {Object} obj Object to remove properties from
   * @returns {Object} Object with empty properties removed
   */
  exports.removeEmptyProperties = function(obj) {
    forEach(obj, function(value, key) {
      if (value == null || value === '') {  // == null also catches undefined
        delete obj[key];
      }
    });
    return obj;
  };

  /**
   * Get the last segment of a URL
   * @param url
   * @returns {string}
   */
  exports.getLastUrlSegment = function(url) {
    return url ? url.replace(/^.*\//, '').replace(/\?.*$/, '') : url;
  };

  /**
   * Response mapper that returns the last segment of the location header
   * @param data ignored
   * @param promise http promise
   * @returns {string} last segment of the location response header
   */
  exports.getLastResponseLocationSegment = function(data, promise) {
    return exports.getLastUrlSegment(promise.getResponseHeader('Location'));
  };

  /**
   * Prepend server onto path if path does not start with https?://
   * @param {string} server
   * @param {string} path
   * @returns {string} server + path
   */
  function getAbsoluteUrl(server, path) {
    if (!path.match(/^https?:\/\//)) {
      return server + (path.charAt(0) !== '/' ? '/' : '') + path;
    }
    else {
      return path;
    }
  }

  /**
   * Prepend oauth server to path if path doesn't start with https?://
   * @param {string} path
   * @returns {string} server + path
   */
  exports.getOAuthServerUrl = function(path) {
    return getAbsoluteUrl(globals.oauthServer[globals.environment], path);
  };

  /**
   * Return true if this url is for the OAuth server
   * @param url
   * @returns {boolean}
   */
  exports.isOAuthServerUrl = function(url) {
    return url.indexOf(globals.oauthServer[globals.environment]) === 0;
  };

  /**
   * Prepend api server to path if path doesn't start with https?://
   * @param path
   * @returns {string} server + path
   */
  exports.getAPIServerUrl = function(path) {
    return getAbsoluteUrl(globals.apiServer[globals.environment], path);
  };

  /**
   * Create a URL-encoded query string from an object
   * @param {Object} params Parameters
   * @returns {string} URL-encoded string
   */
  exports.encodeQueryString = function(params) {
    var arr = [];
    forEach(params, function(value, key) {
      arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });
    return arr.join('&');
  };

  /**
   * Append query parameters object to a url
   * @param {string} url
   * @param {Object} params
   * @returns {String} url + query string
   */
  exports.appendQueryParameters = function(url, params) {
    var queryString = exports.encodeQueryString(params);
    if (queryString.length === 0) {
      return url;
    }
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + queryString;
  };

  /**
   * Decode query string into an object
   * @param {string} qs query string
   * @returns {Object} parameters object
   */
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

  /**
   * Call the callback on the next tick
   * @param {function()} cb Function to call
   */
  exports.nextTick = function(cb) {
    globals.setTimeout(function() {
      cb();
    },0);
  };

  /**
   * borrowed from AngularJS's implementation of $q
   * If passed a promise returns the promise; otherwise returns a pseudo-promise returning the value
   * @param {*} value Promise or value
   * @returns {Object} Promise
   */
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

  //
  /**
   * borrowed from AngularJS's implementation of $q
   * @param {Array|Object} promises Array or object of promises
   * @returns {Object} Promise that is resolved when all promises resolve
   */
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

  /**
   * borrowed from http://www.quirksmode.org/js/cookies.html
   * Create a cookie
   * @param {string} name Cookie name
   * @param {string} value Cookie value
   * @param {number} days Number of days to expiration; set to 0 for a session cookie
   */
  exports.createCookie = function(name, value, days) {
    var expires = '';
    var isSecure = document.location.hostname !== 'localhost'; // can't set secure cookies on localhost in chrome
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

  /**
   * borrowed from http://www.quirksmode.org/js/cookies.html
   * Erase a cookie
   * @param {string} name Cookie name
   */
  exports.eraseCookie = function(name) {
    exports.createCookie(name,'',-1);
  };

  var accessTokenInactiveTimer = null;
  var accessTokenCreationTimer = null;

  /**
   * Set a timer, optionally clearing the old timer first
   * @param {Function} fn Function to call
   * @param {number} delay
   * @param {number=} oldTimer Old timer to clear
   * @returns {number} timer
   */
  function setTimer(fn, delay, oldTimer) {
    if (oldTimer) {
      globals.clearTimeout(oldTimer);
    }
    return globals.setTimeout(function() {
      fn();
    }, delay);
  }

  function setAccessTokenInactiveTimer(delay) {
    accessTokenInactiveTimer = setTimer(exports.eraseAccessToken, delay, accessTokenInactiveTimer);
  }

  function setAccessTokenCreationTimer(delay) {
    accessTokenCreationTimer = setTimer(exports.eraseAccessToken, delay, accessTokenCreationTimer);
  }

  function clearAccessTokenTimers() {
    globals.clearTimeout(accessTokenInactiveTimer);
    accessTokenInactiveTimer = null;
    globals.clearTimeout(accessTokenCreationTimer);
    accessTokenCreationTimer = null;
  }

  /**
   * Read the access token from the cookie and start the expiry timers
   */
  exports.readAccessToken = function() {
    var now = (new Date()).getTime();
    var cookie = exports.readCookie(globals.accessTokenCookie);
    if (cookie) {
      var parts = cookie.split('|', 3);
      if (parts.length === 3) {
        var inactiveMillis = now - parseInt(parts[0],10);
        var creationMillis = now - parseInt(parts[1],10);
        if (inactiveMillis < globals.maxAccessTokenInactivityTime && creationMillis < globals.maxAccessTokenCreationTime) {
          globals.accessToken = parts[2];
          if (globals.autoExpire) {
            setAccessTokenInactiveTimer(globals.maxAccessTokenInactivityTime - inactiveMillis);
            setAccessTokenCreationTimer(globals.maxAccessTokenCreationTime - creationMillis);
          }
        }
      }
    }
  };

  /**
   * Set the access token, start the expiry timers, and write the cookie
   */
  exports.setAccessToken = function(accessToken) {
    globals.accessToken = accessToken;
    if (globals.autoExpire) {
      setAccessTokenInactiveTimer(globals.maxAccessTokenInactivityTime);
      setAccessTokenCreationTimer(globals.maxAccessTokenCreationTime);
    }
    if (globals.saveAccessToken) {
      var now = (new Date()).getTime();
      var cookie = now+'|'+now+'|'+accessToken;
      exports.createCookie(globals.accessTokenCookie, cookie, 0);
    }
  };

  /**
   * Refresh the access token by updating the inactive timer
   */
  exports.refreshAccessToken = function() {
    var now = (new Date()).getTime();
    if (globals.autoExpire) {
      setAccessTokenInactiveTimer(globals.maxAccessTokenInactivityTime);
    }
    if (globals.saveAccessToken) {
      var cookie = exports.readCookie(globals.accessTokenCookie);
      if (cookie) {
        var parts = cookie.split('|', 3);
        if (parts.length === 3) {
          cookie = now+'|'+parts[1]+'|'+parts[2];
          exports.createCookie(globals.accessTokenCookie, cookie, 0);
        }
      }
    }
  };

  /**
   * Erase access token, clear the expiry timers, and erase the cookie
   */
  exports.eraseAccessToken = function() {
    globals.accessToken = null;
    if (globals.autoExpire) {
      clearAccessTokenTimers();
    }
    if (globals.saveAccessToken) {
      exports.eraseCookie(globals.accessTokenCookie);
    }
  };

  return exports;
});

define('angularjs-wrappers',[
  'globals',
  'helpers'
], function(globals, helpers) {
  var exports = {};

  /**
   * httpWrapper function based upon Angular's $http function
   * @param http Angular's $http function
   * @returns {Function} http function that exposes a standard interface
   */
  exports.httpWrapper = function(http) {
    return function(method, url, headers, data, opts) {
      // set up the options
      var config = helpers.extend({
        method: method,
        url: url,
        responseType: 'json',
        data: data,
        transformRequest: function(obj) {
          return obj;
        }
      }, opts);
      config.headers = helpers.extend({}, headers, opts.headers);

      // make the call
      var promise = http(config);

      // process the response
      var d = globals.deferredWrapper();
      var returnedPromise = d.promise;
      var statusCode = null;
      var headerGetter = null;
      promise.then(
        function(response) {
          statusCode = response.status;
          headerGetter = response.headers;
          d.resolve(response.data);
        },
        function(response) {
          statusCode = response.status;
          headerGetter = response.headers;
          d.reject(response);
        });

      // add http-specific functions to the returned promise
      returnedPromise.getStatusCode = function() {
        return statusCode;
      };
      returnedPromise.getResponseHeader = function(header) {
        return headerGetter(header);
      };
      returnedPromise.getAllResponseHeaders = function() {
        return headerGetter();
      };
      returnedPromise.getRequest = function() {
        return config;
      };

      return returnedPromise;
    };
  };

  /**
   * deferredWrapper function based upon Angular's $q.defer function
   * @param deferred Angular's $q.defer function
   * @returns {Function} deferred function that exposes a standard interface
   */
  exports.deferredWrapper = function(deferred) {
    return function() {
      var d = deferred();
      return {
        promise: d.promise,
        resolve: d.resolve,
        reject: d.reject
      };
    };
  };

  return exports;
});

define('jquery-wrappers',[
  'globals',
  'helpers'
], function(globals, helpers) {
  var exports = {};

  /**
   * httpWrapper function based upon jQuery's $.ajax function
   * @param ajax jQuery's $.ajax function
   * @returns {Function} http function that exposes a standard interface
   */
  exports.httpWrapper = function(ajax) {
    return function(method, url, headers, data, opts) {
      // set up the options
      opts = helpers.extend({
        url: url,
        type: method,
        dataType: 'json',
        data: data,
        processData: false
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
          if (!jqXHR.responseText) {
            // FamilySearch sometimes returns no content in the response even though we have requested json
            // No content is not valid json, so we get an error parsing it
            // Treat it as valid but empty content
            d.resolve(null);
          }
          else {
            d.reject(jqXHR, textStatus, errorThrown);
          }
        });

      // add http-specific functions to the returned promise
      helpers.wrapFunctions(returnedPromise, jqXHR, ['getResponseHeader', 'getAllResponseHeaders']);
      returnedPromise.getStatusCode = function() {
        return statusCode;
      };
      returnedPromise.getRequest = function() {
        return opts;
      };
      return returnedPromise;
    };
  };

  /**
   * deferredWrapper function based upon jQuery's $.Deferred function
   * @param deferred jQuery's $.Deferred function
   * @returns {Function} deferred function that exposes a standard interface
   */
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
  'angularjs-wrappers',
  'globals',
  'jquery-wrappers',
  'helpers'
], function(angularjsWrappers, globals, jQueryWrappers, helpers) {
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
   * - `http_function` - a function for issuing http requests: `jQuery.ajax` or angular's `$http`, or eventually node.js's ...
   * - `deferred_function` - a function for creating deferred's: `jQuery.Deferred` or angular's `$q.defer` or eventually `Q`
   * - `timeout_function` - optional timeout function: angular users should pass `$timeout`; otherwise the global `setTimeout` is used
   * - `auth_callback` - the OAuth2 redirect uri you registered with FamilySearch.  Does not need to exist,
   * but must have the same host and port as the server running your script
   * - `auto_expire` - set to true if you want to the system to clear the access token when it has expired
   * (after one hour of inactivity or 24 hours, whichever comes first; should probably be false for node.js)
   * - `auto_signin` - set to true if you want the user to be prompted to sign in whenever you call an API function
   * without an access token (must be false for node.js, and may result in a blocked pop-up if the API call is
   * not in direct response to a user-initiated action)
   * - `save_access_token` - set to true if you want the access token to be saved and re-read in future init calls
   * (uses a session cookie, must be false for node.js) - *setting `save_access_token` along with `auto_signin` and
   * `auto_expire` is very convenient*
   * - `access_token` - pass this in if you already have an access token
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
    var httpFunction = opts['http_function'];
    if (httpFunction.defaults) {
      globals.httpWrapper = angularjsWrappers.httpWrapper(httpFunction);
    }
    else {
      globals.httpWrapper = jQueryWrappers.httpWrapper(httpFunction);
    }

    if(!opts['deferred_function']) {
      throw 'deferred_function must be set; e.g., jQuery.Deferred';
    }
    var deferredFunction = opts['deferred_function'];
    var d = deferredFunction();
    d.resolve(); // required for unit tests
    if (!helpers.isFunction(d.promise)) {
      globals.deferredWrapper = angularjsWrappers.deferredWrapper(deferredFunction);
    }
    else {
      globals.deferredWrapper = jQueryWrappers.deferredWrapper(deferredFunction);
    }

    var timeout = opts['timeout_function'];
    if (timeout) {
      globals.setTimeout = function(fn, delay) {
        return timeout(fn, delay);
      };
      globals.clearTimeout = function(timer) {
        timeout.cancel(timer);
      };
    }
    else {
      // not sure why I can't just set globals.setTimeout = setTimeout, but it doesn't seem to work; anyone know why?
      globals.setTimeout = function(fn, delay) {
        return setTimeout(fn, delay);
      };
      globals.clearTimeout = function(timer) {
        clearTimeout(timer);
      };
    }

    globals.authCallbackUri = opts['auth_callback'];

    globals.autoSignin = opts['auto_signin'];

    globals.autoExpire = opts['auto_expire'];

    if (opts['save_access_token']) {
      globals.saveAccessToken = true;
      helpers.readAccessToken();
    }

    if (opts['access_token']) {
      globals.accessToken = opts['access_token'];
    }
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
    return exports.http('GET',
      helpers.appendQueryParameters(url, params),
      helpers.extend({'Accept': 'application/x-gedcomx-v1+json'}, headers),
      null,
      opts,
      responseMapper);
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
    return exports.http('POST',
      url,
      helpers.extend({'Content-Type': 'application/x-gedcomx-v1+json'},headers),
      data,
      opts,
      responseMapper);
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
    return exports.http('PUT',
      url,
      helpers.extend({'Content-Type': 'application/x-gedcomx-v1+json'},headers),
      data,
      opts,
      responseMapper);
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
   * Converts an object to x-www-form-urlencoded serialization.
   * borrowed from http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
   * @param {Object} obj
   * @return {String}
   */
  function formEncode(obj)
  {
    var query = '';
    var name, value, fullSubName, subName, subValue, innerObj, i;

    for(name in obj) {
      if (obj.hasOwnProperty(name)) {
        value = obj[name];

        if(value instanceof Array) {
          for(i=0; i<value.length; ++i) {
            subValue = value[i];
            fullSubName = name + '[' + i + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += formEncode(innerObj) + '&';
          }
        }
        else if(value instanceof Object) {
          for(subName in value) {
            if (value.hasOwnProperty(subName)) {
              subValue = value[subName];
              fullSubName = name + '[' + subName + ']';
              innerObj = {};
              innerObj[fullSubName] = subValue;
              query += formEncode(innerObj) + '&';
            }
          }
        }
        else if(value !== undefined && value !== null) {
          query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
      }
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  }

  /**
   * Transform data according to the content type header
   * @param {*} data to transform
   * @param {String} contentType header
   * @returns {*}
   */
  function transformData(data, contentType) {
    if (data && helpers.isObject(data) && String(data) !== '[object FormData]') {
      if (contentType === 'application/x-www-form-urlencoded') {
        return formEncode(data);
      }
      else if (contentType && contentType.indexOf('json') !== -1) {
        return JSON.stringify(data);
      }
    }
    return data;
  }

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
    var d = globals.deferredWrapper();
    var returnedPromise = d.promise;
    // prepend the server
    var absoluteUrl = helpers.getAPIServerUrl(url);
    headers = headers || {};

    // do we need to request an access token?
    var accessTokenPromise;
    if (!globals.accessToken && globals.autoSignin && !helpers.isOAuthServerUrl(absoluteUrl)) {
      accessTokenPromise = globals.getAccessToken();
    }
    else {
      accessTokenPromise = helpers.refPromise(globals.accessToken);
    }
    accessTokenPromise.then(function() {
      // append the access token as a query parameter to avoid cors pre-flight
      // this is detrimental to browser caching across sessions, which seems less bad than cors pre-flight requests
      if (globals.accessToken) {
        absoluteUrl = helpers.appendQueryParameters(absoluteUrl, {'access_token': globals.accessToken});
      }

      // default retries
      if (retries == null) { // also catches undefined
        retries = globals.maxHttpRequestRetries;
      }

      // call the http wrapper
      var promise = globals.httpWrapper(method,
        absoluteUrl,
        headers,
        transformData(data, headers['Content-Type']),
        opts || {});

      // process the response
      returnedPromise = helpers.extendHttpPromise(returnedPromise, promise);
      promise.then(
        function(data) {
          helpers.refreshAccessToken();
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
          if ((method === 'GET' && statusCode >= 500 && retries > 0) || statusCode === 429) {
            var retryAfterHeader = promise.getResponseHeader('Retry-After');
            var retryAfter = retryAfterHeader ? parseInt(retryAfterHeader,10) : globals.defaultThrottleRetryAfter;
            globals.setTimeout(function() {
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
          }
          else {
            d.reject.apply(d, arguments);
          }
        });
    },
    function() {
      d.reject.apply(d, arguments);
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
   * Process the response from the access token endpoint
   *
   * @param {Object} promise promise from the access token endpoint
   * @param {Object} accessTokenDeferred deferred that needs to be resolved or rejected
   */
  function handleAccessTokenResponse(promise, accessTokenDeferred) {
    promise.then(
      function(data) {
        var accessToken = data['access_token'];
        if (accessToken) {
          helpers.setAccessToken(accessToken);
          accessTokenDeferred.resolve(accessToken);
        }
        else {
          accessTokenDeferred.reject(data['error']);
        }
      },
      function() {
        accessTokenDeferred.reject.apply(accessTokenDeferred, arguments);
      });
  }

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
            },
            {'Content-Type': 'application/x-www-form-urlencoded'}); // access token endpoint says it accepts json but it doesn't
          handleAccessTokenResponse(promise, accessTokenDeferred);
        },
        function() {
          accessTokenDeferred.reject.apply(accessTokenDeferred, arguments);
        });
    }
    return accessTokenDeferred.promise;
  };

  /**
   * @ngdoc function
   * @name authentication.functions:getAccessTokenForMobile
   * @function
   *
   * @description
   * Get the access token for the user, passing in their user name and password
   * Call this only for mobile apps; otherwise call {@link authentication.functions:getAccessToken getAccessToken}
   *
   * You don't need to store the access token returned by this function; you just need to ensure that the promise
   * returned by this function resolves before making calls that require authentication.
   *
   * {@link https://familysearch.org/developers/docs/api/authentication/Access_Token_resource FamilySearch API docs}
   *
   * @param {String} userName name of the user
   * @param {String} password of the user
   * @return {Object} a promise of the (string) access token.
   */
  exports.getAccessTokenForMobile = function(userName, password) {
    var accessTokenDeferred = globals.deferredWrapper();
    var promise = plumbing.post(helpers.getOAuthServerUrl('token'), {
        'grant_type': 'password',
        'client_id' : globals.appKey,
        'username'  : userName,
        'password'  : password
      },
      {'Content-Type': 'application/x-www-form-urlencoded'}); // access token endpoint says it accepts json but it doesn't
    handleAccessTokenResponse(promise, accessTokenDeferred);
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
   * @name changeHistory.types:type.Change
   * @description
   *
   * Change made to a person or relationship
   */
  var Change = exports.Change = function() {

  };

  exports.Change.prototype = {
    constructor: Change,
    /**
     * @ngdoc property
     * @name changeHistory.types:type.Change#id
     * @propertyOf changeHistory.types:type.Change
     * @return {String} Id of the change
     */

    /**
     * @ngdoc property
     * @name changeHistory.types:type.Change#title
     * @propertyOf changeHistory.types:type.Change
     * @return {String} title of the change
     */

    /**
     * @ngdoc property
     * @name changeHistory.types:type.Change#updated
     * @propertyOf changeHistory.types:type.Change
     * @return {Number} timestamp
     */

    /**
     * @ngdoc function
     * @name changeHistory.types:type.Change#getContributorName
     * @methodOf changeHistory.types:type.Change
     * @function
     * @return {String} contributor name
     */
    getContributorName: function() { return maybe(maybe(this.contributors)[0]).name; },

    /**
     * @ngdoc function
     * @name changeHistory.types:type.Change#getChangeReason
     * @methodOf changeHistory.types:type.Change
     * @function
     * @return {String} reason for the change
     */
    getChangeReason: function() { return maybe(maybe(this.changeInfo)[0]).reason; }
  };

  var changeHistoryResponseMapper = helpers.compose(
      helpers.objectExtender({getChanges: function() { return this.entries || []; }}),
      helpers.constructorSetter(Change, 'entries')
    );

  /**
   * @ngdoc function
   * @name changeHistory.functions:getPersonChanges
   * @function
   *
   * @description
   * Get change history for a person
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:type.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/6SqTH/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonChanges = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/changes', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      changeHistoryResponseMapper);
  };

  /**
   * @ngdoc function
   * @name changeHistory.functions:getChildAndParentsChanges
   * @function
   *
   * @description
   * Get change history for a child and parents relationship
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:type.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/Uk6HA/ editable example}
   *
   * @param {String} caprid of the child and parents relationship to read
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsChanges = function(caprid, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(caprid)+'/changes', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      changeHistoryResponseMapper);
  };

  /**
   * @ngdoc function
   * @name changeHistory.functions:getCoupleChanges
   * @function
   *
   * @description
   * Get change history for a couple relationship
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:type.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/csG9t/ editable example}
   *
   * @param {String} crid of the couple relationship to read
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleChanges = function(crid, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(crid)+'/changes', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      changeHistoryResponseMapper);
  };

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
   * @name discussions.functions:getPersonDiscussionRefs
   * @function
   *
   * @description
   * Get references to discussions for a person
   * The response includes the following convenience function
   *
   * - `getDiscussionIds()` - get an array of discussion ids from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/kd39K/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonDiscussionRefs = function(pid, params, opts) {
    // TODO add discussion-reference-json-fix
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/discussion-references', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.objectExtender({getDiscussionIds: function() {
        return helpers.map(maybe(maybe(this.persons)[0])['discussion-references'], function(url) {
          return helpers.getLastUrlSegment(url);
        });
      }}));
  };

  /**
   * @ngdoc function
   * @name discussions.types:type.Discussion
   * @description
   *
   * Discussion
   */
  var Discussion = exports.Discussion = function() {

  };

  exports.Discussion.prototype = {
    constructor: Discussion,
    /**
     * @ngdoc property
     * @name discussions.types:type.Discussion#id
     * @propertyOf discussions.types:type.Discussion
     * @return {String} Id of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Discussion#title
     * @propertyOf discussions.types:type.Discussion
     * @return {String} title of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Discussion#details
     * @propertyOf discussions.types:type.Discussion
     * @return {String} description / text of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Discussion#created
     * @propertyOf discussions.types:type.Discussion
     * @return {Number} timestamp
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Discussion#modified
     * @propertyOf discussions.types:type.Discussion
     * @return {Number} timestamp
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Discussion#numberOfComments
     * @propertyOf discussions.types:type.Discussion
     * @return {Number} number of comments
     */

    /**
     * @ngdoc function
     * @name discussions.types:type.Discussion#getContributorId
     * @methodOf discussions.types:type.Discussion
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(this.contributor).resourceId; }
  };

  /**
   * @ngdoc function
   * @name discussions.functions:getDiscussion
   * @function
   *
   * @description
   * Get information about a discussion
   * The response includes the following convenience function
   *
   * - `getDiscussion()` - get the {@link discussions.types:type.Discussion Discussion} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/FzWSu/ editable example}
   *
   * @param {String} did of the discussion to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getDiscussion = function(did, params, opts) {
    return plumbing.get('/platform/discussions/discussions/'+encodeURI(did), params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getDiscussion: function() { return maybe(this.discussions)[0]; }}),
        helpers.constructorSetter(Discussion, 'discussions')
      ));
  };

  /**
   * @ngdoc function
   * @name discussions.functions:getMultiDiscussion
   * @function
   *
   * @description
   * Get multiple discussions at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/7GMBT/ editable example}
   *
   * @param {Array} dids Ids of the discussions to read
   * @param {Object=} params pass to getDiscussion currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the discussions have been read,
   * returning a map of discussion id to response
   */
  exports.getMultiDiscussion = function(dids, params, opts) {
    var promises = {};
    helpers.forEach(dids, function(did) {
      promises[did] = exports.getDiscussion(did, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name discussions.types:type.Comment
   * @description
   *
   * Comment on a discussion
   */
  var Comment = exports.Comment = function() {

  };

  exports.Comment.prototype = {
    constructor: Comment,
    /**
     * @ngdoc property
     * @name discussions.types:type.Comment#id
     * @propertyOf discussions.types:type.Comment
     * @return {String} Id of the comment
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Comment#text
     * @propertyOf discussions.types:type.Comment
     * @return {String} text of the comment
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Comment#created
     * @propertyOf discussions.types:type.Comment
     * @return {Number} timestamp
     */

    /**
     * @ngdoc function
     * @name discussions.types:type.Comment#getContributorId
     * @methodOf discussions.types:type.Comment
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(this.contributor).resourceId; }
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
   * - `getComments()` - get an array of {@link discussions.types:type.Comment Comments} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Comments_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/b56hz/ editable example}
   *
   * @param {String} did of the discussion to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getComments = function(did, params, opts) {
    return plumbing.get('/platform/discussions/discussions/'+encodeURI(did)+'/comments', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getComments: function() { return maybe(maybe(this.discussions)[0]).comments || []; }}),
        helpers.constructorSetter(Comment, 'comments', function(response) {
          return maybe(maybe(response).discussions)[0];
        })
      ));
  };

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
   * @name person.types:type.Person
   * @description
   *
   * Person
   */
  var Person = exports.Person = function() {
    this.names = [];
  };

  exports.Person.prototype = {
    constructor: Person,
    /**
     * @ngdoc property
     * @name person.types:type.Person#id
     * @propertyOf person.types:type.Person
     * @return {String} Id of the person
     */

    /**
     * @ngdoc property
     * @name person.types:type.Person#living
     * @propertyOf person.types:type.Person
     * @return {Boolean} true or false
     */

    /**
     * @ngdoc property
     * @name person.types:type.Person#display
     * @propertyOf person.types:type.Person
     * @return {Object} includes `birthDate`, `birthPlace`, `deathDate`, `deathPlace`, `gender`, `lifespan`, and `name` attributes
     */

    /**
     * @ngdoc function
     * @name person.types:type.Person#getNames
     * @methodOf person.types:type.Person
     * @return {Name[]} an array of {@link person.types:type.Name Names}
     */
    getNames: function() { return this.names || []; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getFacts
     * @methodOf person.types:type.Person
     * @return {Fact[]} an array of {@link person.types:type.Fact Facts}
     */
    getFacts: function() { return this.facts || []; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getBirthDate
     * @methodOf person.types:type.Person
     * @function
     * @return {String} birth date
     */
    getBirthDate: function() { return maybe(this.display).birthDate; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getBirthPlace
     * @methodOf person.types:type.Person
     * @function
     * @return {String} birth place
     */
    getBirthPlace: function() { return maybe(this.display).birthPlace; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getDeathDate
     * @methodOf person.types:type.Person
     * @function
     * @return {String} death date
     */
    getDeathDate: function() { return maybe(this.display).deathDate; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getDeathPlace
     * @methodOf person.types:type.Person
     * @function
     * @return {String} death place
     */
    getDeathPlace: function() { return maybe(this.display).deathPlace; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getGender
     * @methodOf person.types:type.Person
     * @function
     * @return {String} gender - Male or Female
     */
    getGender: function() { return maybe(this.display).gender; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getLifeSpan
     * @methodOf person.types:type.Person
     * @function
     * @return {String} birth year - death year
     */
    getLifeSpan: function() { return maybe(this.display).lifespan; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getName
     * @methodOf person.types:type.Person
     * @function
     * @return {String} display name
     */
    getName: function() { return maybe(this.display).name; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getGivenName
     * @methodOf person.types:type.Person
     * @function
     * @return {String} preferred given name
     */
    getGivenName: function() { return maybe(helpers.find(
      maybe(maybe(maybe(helpers.findOrFirst(this.names, {preferred: true})).nameForms)[0]).parts,
      {type: 'http://gedcomx.org/Given'}
    )).value; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getSurname
     * @methodOf person.types:type.Person
     * @function
     * @return {String} preferred surname
     */
    getSurname: function() { return maybe(helpers.find(
      maybe(maybe(maybe(helpers.findOrFirst(this.names, {preferred: true})).nameForms)[0]).parts,
      {type: 'http://gedcomx.org/Surname'}
    )).value; },

    /**
     * @ngdoc function
     * @name name person.types:type.Person#addName
     * @methodOf person.types:type.Person
     * @function
     * @param {Name|String} name to add
     */
    addName: function(name) {
      if (!(name instanceof Name)) {
        name = new Name(name);
      }
      this.names.push(name);
    }
  };

  /**
   * @ngdoc function
   * @name person.types:type.Name
   * @description
   *
   * Name
   */
  var Name = exports.Name = function(name) {
    this.nameForms = [];
    if (name) {
      this.nameForms.push({
        fullText: name
      });
    }
  };

  exports.Name.prototype = {
    constructor: Name,
    /**
     * @ngdoc property
     * @name person.types:type.Name#id
     * @propertyOf person.types:type.Name
     * @return {String} Id of the name
     */

    /**
     * @ngdoc property
     * @name person.types:type.Name#type
     * @propertyOf person.types:type.Name
     * @return {String} http://gedcomx.org/BirthName, etc.
     */

    /**
     * @ngdoc property
     * @name person.types:type.Name#preferred
     * @propertyOf person.types:type.Name
     * @return {Boolean} true if this name is preferred
     */

    /**
     * @ngdoc function
     * @name person.types:type.Name#getContributorId
     * @methodOf person.types:type.Name
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(maybe(this.attribution).contributor).resourceId; },

    /**
     * @ngdoc function
     * @name person.types:type.Name#getModified
     * @methodOf person.types:type.Name
     * @function
     * @return {Number} last modified timestamp
     */
    getModified: function() { return maybe(this.attribution).modified; },

    /**
     * @ngdoc function
     * @name person.types:type.Name#getNameFormsCount
     * @methodOf person.types:type.Name
     * @function
     * @return {Number} get the number of name forms
     */
    getNameFormsCount: function() { return this.nameForms ? this.nameForms.length : 0; },

    /**
     * @ngdoc function
     * @name person.types:type.Name#getFullText
     * @methodOf person.types:type.Name
     * @function
     * @param {Number=} i i'th name form to read
     * @return {String} get the full text of the `i`'th name form; if `i` is omitted; get the first
     */
    getFullText: function(i) { return maybe(maybe(this.nameForms)[i || 0]).fullText; },

    /**
     * @ngdoc function
     * @name person.types:type.Name#getGivenName
     * @methodOf person.types:type.Name
     * @function
     * @param {Number=} i i'th name form to read
     * @return {String} get the given part of the `i`'th name form; if `i` is omitted; get the first
     */
    getGivenName: function(i) { return maybe(helpers.find(
      maybe(maybe(this.nameForms)[i || 0]).parts,
      {type: 'http://gedcomx.org/Given'}
    )).value; },

    /**
     * @ngdoc function
     * @name person.types:type.Name#getSurname
     * @methodOf person.types:type.Name
     * @function
     * @param {Number=} i i'th name form to read
     * @return {String} get the surname part of the `i`'th name form; if `i` is omitted; get the first
     */
    getSurname:        function(i) { return maybe(helpers.find(
      maybe(maybe(this.nameForms)[i || 0]).parts,
      {type: 'http://gedcomx.org/Surname'}
    )).value; }
  };

  /**
   * @ngdoc function
   * @name person.types:type.Fact
   * @description
   *
   * Fact
   */
  var Fact = exports.Fact = function() {

  };

  exports.Fact.prototype = {
    constructor: Fact,
    /**
     * @ngdoc property
     * @name person.types:type.Fact#id
     * @propertyOf person.types:type.Fact
     * @return {String} Id of the name
     */

    /**
     * @ngdoc property
     * @name person.types:type.Fact#type
     * @propertyOf person.types:type.Fact
     * @return {String} http://gedcomx.org/Birth, etc.
     */

    /**
     * @ngdoc function
     * @name person.types:type.Fact#getContributorId
     * @methodOf person.types:type.Fact
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(maybe(this.attribution).contributor).resourceId; },

    /**
     * @ngdoc function
     * @name person.types:type.Fact#getModified
     * @methodOf person.types:type.Fact
     * @function
     * @return {Number} last modified timestamp
     */
    getModified: function() { return maybe(this.attribution).modified; },

    /**
     * @ngdoc function
     * @name person.types:type.Fact#getDate
     * @methodOf person.types:type.Fact
     * @function
     * @return {String} original date
     */
    getDate: function() { return maybe(this.date).original; },

    /**
     * @ngdoc function
     * @name person.types:type.Fact#getFormalDate
     * @methodOf person.types:type.Fact
     * @function
     * @return {String} standard form; e.g., +1836-04-13
     */
    getFormalDate: function() { return maybe(this.date).formal; },

    /**
     * @ngdoc function
     * @name person.types:type.Fact#getPlace
     * @methodOf person.types:type.Fact
     * @function
     * @return {String} event place
     */
    getPlace: function() { return maybe(this.place).original; }
  };

  /**
   * @ngdoc function
   * @name person.functions:getPerson
   * @function
   *
   * @description
   * Get the specified person
   * The response includes the following convenience function
   *
   * - `getPerson()` - get the {@link person.types:type.Person Person} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/cST4L/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPerson = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid), params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getPerson: function() { return this.persons[0]; }}),
        exports.personMapper()
      ));
  };

  /**
   * Return a function that maps a response into a response with Person, Name, and Fact objects
   * @param {Function=} subObjectGenerator generate sub-objects corresponding to parents of persons; used by search/match functions
   * @returns {Function}
   */
  exports.personMapper = function(subObjectGenerator) {
    var personsGenerator = function(response) {
      return helpers.flatMap(subObjectGenerator ? subObjectGenerator(response) : [response], function(root) {
        return root.persons;
      });
    };
    return helpers.compose(
      helpers.constructorSetter(Person, 'persons', subObjectGenerator),
      helpers.constructorSetter(Name, 'names', personsGenerator),
      helpers.constructorSetter(Fact, 'facts', personsGenerator)
    );
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
   * @param {Array} pids of the people to read
   * @param {Object=} params to pass to getPerson currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the people have been read, returning a map of person id to response
   */
  exports.getMultiPerson = function(pids, params, opts) {
    var promises = {};
    helpers.forEach(pids, function(pid) {
      promises[pid] = exports.getPerson(pid, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name person.types:type.ChildAndParents
   * @description
   *
   * Child and parents relationship *(not to be confused with the ParentChild relationship; in general, ChildAndParents is more useful)*
   */
  var ChildAndParents = exports.ChildAndParents = function() {

  };

  exports.ChildAndParents.prototype = {
    constructor: ChildAndParents,
    /**
     * @ngdoc property
     * @name person.types:type.ChildAndParents#id
     * @propertyOf person.types:type.ChildAndParents
     * @return {String} Id of the relationship
     */

    /**
     * @ngdoc function
     * @name person.types:type.ChildAndParents#getFatherFacts
     * @methodOf person.types:type.ChildAndParents
     * @return {Fact[]} array of {@link person.types:type.Fact Facts}; e.g., parent-relationship type
     */
    getFatherFacts: function() { return this.fatherFacts || []; },

    /**
     * @ngdoc function
     * @name person.types:type.ChildAndParents#getMotherFacts
     * @methodOf person.types:type.ChildAndParents
     * @return {Fact[]} array of {@link person.types:type.Fact Facts}; e.g., parent-relationship type
     */
    getMotherFacts: function() { return this.motherFacts || []; },

    /**
     * @ngdoc function
     * @name person.types:type.ChildAndParents#getFatherId
     * @methodOf person.types:type.ChildAndParents
     * @function
     * @return {String} Id of the father
     */
    getFatherId: function() { return maybe(this.father).resourceId; },

    /**
     * @ngdoc function
     * @name person.types:type.ChildAndParents#getMotherId
     * @methodOf person.types:type.ChildAndParents
     * @function
     * @return {String} Id of the mother
     */
    getMotherId: function() { return maybe(this.mother).resourceId; },

    /**
     * @ngdoc function
     * @name person.types:type.ChildAndParents#getChildId
     * @methodOf person.types:type.ChildAndParents
     * @function
     * @return {String} Id of the child
     */
    getChildId: function() { return maybe(this.child).resourceId; }
  };

  /**
   * @ngdoc function
   * @name person.types:type.Couple
   * @description
   *
   * Couple relationship
   */
  var Couple = exports.Couple = function() {

  };

  exports.Couple.prototype = {
    constructor: Couple,
    /**
     * @ngdoc property
     * @name person.types:type.Couple#id
     * @propertyOf person.types:type.Couple
     * @return {String} Id of the relationship
     */

    /**
     * @ngdoc function
     * @name person.types:type.Couple#getFacts
     * @methodOf person.types:type.Couple
     * @return {Fact[]} array of {@link person.types:type.Fact Facts}; e.g., marriage
     */
    getFacts: function() { return this.facts || []; },

    /**
     * @ngdoc function
     * @name person.types:type.Couple#getMarriageFact
     * @methodOf person.types:type.Couple
     * @return {Fact} {@link person.types:type.Fact Fact} of type http://gedcomx.org/Marriage (first one if multiple)
     */
    getMarriageFact: function() { return helpers.find(this.facts, {type: 'http://gedcomx.org/Marriage'}); },

    /**
     * @ngdoc function
     * @name person.types:type.Couple#getHusbandId
     * @methodOf person.types:type.Couple
     * @function
     * @return {String} Id of the husband
     */
    getHusbandId: function() { return maybe(this.person1).resourceId; },

    /**
     * @ngdoc function
     * @name person.types:type.Couple#getWifeId
     * @methodOf person.types:type.Couple
     * @function
     * @return {String} Id of the wife
     */
    getWifeId: function() { return maybe(this.person2).resourceId; }
  };

  /**
   * @ngdoc function
   * @name person.functions:getPersonWithRelationships
   * @function
   *
   * @description
   * Get a person and their children, spouses, and parents.
   * The response has the following convenience functions
   *
   * - `getPrimaryId()` - id of the person requested
   * - `getFatherIds()` - array of ids
   * - `getMotherIds()` - array of ids
   * - `getSpouseIds()` - array of ids
   * - `getChildIds()` - array of ids of all children
   * - `getChildIdsOf(spouseId)` - array of ids; if `spouseId` is null/undefined, return ids of children without the other parent
   * - `getParentRelationships()` - array of {@link person.types:type.ChildAndParents ChildAndParents} relationship objects
   * - `getSpouseRelationships()` - array of {@link person.types:type.Couple Couple} relationship objects
   * - `getSpouseRelationship(spouseId)` - {@link person.types:type.Couple Couple} relationship with the specified spouse
   * - `getChildRelationships()` - array of {@link person.types:type.ChildAndParents ChildAndParents} relationship objects
   * - `getChildRelationshipsOf(spouseId)` - array of {@link person.types:type.ChildAndParents ChildAndParents} relationship objects
   * if `spouseId` is null/undefined, return ids of child relationships without the other parent
   * - `getPrimaryPerson()` - {@link person.types:type.Person Person} object for the primary person
   *
   * In addition, the following functions are available if persons is set to true in params
   *
   * - `getPerson(id)` - {@link person.types:type.Person Person} object for the person with `id`
   * - `getFathers()` - array of father {@link person.types:type.Person Persons}
   * - `getMothers()` - array of mother {@link person.types:type.Person Persons}
   * - `getSpouses()` - array of spouse {@link person.types:type.Person Persons}
   * - `getChildren()` - array of all child {@link person.types:type.Person Persons};
   * - `getChildrenOf(spouseId)` - array of child {@link person.types:type.Person Persons};
   * if `spouseId` is null/undefined, return children without the other parent
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_With_Relationships_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/5Npsh/ editable example}
   *
   * @param {String} pid person to read
   * @param {Object=} params set `persons` to true to retrieve full person objects for each relative
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person with relationships
   */
  exports.getPersonWithRelationships = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons-with-relationships', helpers.extend({'person': pid}, params), {}, opts,
      helpers.compose(
        helpers.objectExtender({getPrimaryId: function() { return pid; }}), // make id available
        helpers.constructorSetter(Fact, 'fatherFacts', function(response) {
          return maybe(response).childAndParentsRelationships;
        }),
        helpers.constructorSetter(Fact, 'motherFacts', function(response) {
          return maybe(response).childAndParentsRelationships;
        }),
        helpers.constructorSetter(Fact, 'facts', function(response) {
          return maybe(response).relationships;
        }),
        helpers.constructorSetter(ChildAndParents, 'childAndParentsRelationships'),
        helpers.constructorSetter(Couple, 'relationships'), // some of the relationships are ParentChild relationships, but
                                                            // we don't have a way to change the constructor on only some elements of the array
        helpers.objectExtender(personWithRelationshipsConvenienceFunctions),
        exports.personMapper()
      ));
  };

  // Functions to extract various pieces of the response
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
    getSpouseRelationship:  function(spouseId) {
      var primaryId = this.getPrimaryId();
      return helpers.find(this.relationships, function(r) {
        return r.type === 'http://gedcomx.org/Couple' &&
          (primaryId === r.getHusbandId() ? r.getWifeId() : r.getHusbandId()) === spouseId;
      });
    },
    getChildRelationships: function() {
      var primaryId = this.getPrimaryId();
      return helpers.filter(this.childAndParentsRelationships, function(r) {
        return maybe(r.father).resourceId === primaryId || maybe(r.mother).resourceId === primaryId;
      });
    },
    getChildRelationshipsOf: function(spouseId) {
      var primaryId = this.getPrimaryId();
      return helpers.filter(this.childAndParentsRelationships, function(r) {
        /*jshint eqeqeq:false */
        return (maybe(r.father).resourceId === primaryId || maybe(r.mother).resourceId === primaryId) &&
          (maybe(r.father).resourceId == spouseId || maybe(r.mother).resourceId == spouseId); // allow spouseId to be null or undefined
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
          return r.getHusbandId() && r.getWifeId(); // only consider couple relationships with both spouses
        }),
        function(r) {
          return this.getPrimaryId() === r.getHusbandId() ? r.getWifeId() : r.getHusbandId();
        }, this));
    },
    getSpouses:    function() { return helpers.map(this.getSpouseIds(), this.getPerson, this); },
    getChildIds:   function() {
      return helpers.uniq(helpers.map(this.getChildRelationships(),
        function(r) {
          return r.getChildId();
        }, this));
    },
    getChildren:   function() { return helpers.map(this.getChildIds(), this.getPerson, this); },
    getChildIdsOf:   function(spouseId) {
      return helpers.uniq(helpers.map(this.getChildRelationshipsOf(spouseId),
        function(r) {
          return r.getChildId();
        }, this));
    },
    getChildrenOf:   function(spouseId) { return helpers.map(this.getChildIdsOf(spouseId), this.getPerson, this); }
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
   * **NOTE The sandbox REST endpoint for this function is broken so I have been unable to test it. Do not use.**
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_Summary_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ga37h/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonChangeSummary = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/change-summary', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
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
   * - `getRelationships()` - an array of {@link person.types:type.Couple Couple} relationships
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:type.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Relationships_to_Spouses_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/7zLEJ/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationships,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getRelationshipsToSpouses = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/spouse-relationships', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getPrimaryId: function() { return pid; }}), // make id available to convenience functions
        helpers.constructorSetter(Couple, 'relationships'),
        helpers.objectExtender(relationshipsToSpousesConvenienceFunctions),
        helpers.constructorSetter(Fact, 'facts', function(response) {
          return maybe(response).relationships;
        }),
        exports.personMapper()
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
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:type.Person Person} for a person id in the relationship
   *
   * Pass the relationship id into {@link parentsAndChildren.functions:getChildAndParents getChildAndParents} for more information
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Relationships_to_Parents_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ajxpq/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationships,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getRelationshipsToParents = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/parent-relationships', params, {}, opts,
      helpers.compose(
        // TODO consider adding convenience functions to expose the couple relationship for the parents
        helpers.objectExtender(relationshipsToParentsConvenienceFunctions),
        exports.personMapper()
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
            id: helpers.getLastUrlSegment(relIdent),
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
   * @name person.types:type.ParentChild
   * @description
   *
   * ParentChild relationship *(not to be confused with the ChildAndParents relationship; in general, ChildAndParents is more useful)*
   */
  var ParentChild = exports.ParentChild = function() {

  };

  exports.ParentChild.prototype = {
    constructor: ParentChild,
    /**
     * @ngdoc property
     * @name person.types:type.ParentChild#id
     * @propertyOf person.types:type.ParentChild
     * @return {String} Id of the parent-child relationship
     */

    /**
     * @ngdoc function
     * @name person.types:type.ParentChild#getChildAndParentsId
     * @methodOf person.types:type.ParentChild
     * @function
     * @return {String} Id of the child and parents relationship
     */
    getChildAndParentsId: function() {
      return helpers.getLastUrlSegment(maybe(this.identifiers)[CHILD_AND_PARENTS_RELATIONSHIP]);
    },

    /**
     * @ngdoc function
     * @name person.types:type.ParentChild#getChildId
     * @methodOf person.types:type.ParentChild
     * @function
     * @return {String} Id of the child
     */
    getChildId: function() { return maybe(this.person2).resourceId; }
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
   * - `getRelationships()` - an array of {@link person.types:type.ParentChild ParentChild} relationships
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:type.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Relationships_to_Children_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/mUUEK/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationships,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getRelationshipsToChildren = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/child-relationships', params, {}, opts,
      helpers.compose(
        helpers.objectExtender(relationshipsToChildrenConvenienceFunctions),
        helpers.constructorSetter(ParentChild, 'relationships'),
        exports.personMapper()
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

  // TODO getPersonMerge
  // TODO getPersonNotAMatch
  // TODO getPreferredSpouse
  // TODO getPreferredParent
  // TODO new Parents endpoint (and drop getRelationshipsToParents?)
  // TODO new Children endpoint (and drop getRelationshipsToChildren?)
  // TODO new Spouses endpoint
  // TODO use X-FS-Feature-Tag: parent-child-relationship-resources-consolidation on parents and children endpoints

  return exports;
});

define('memories',[
  'discussions',
  'globals',
  'helpers',
  'person',
  'plumbing'
], function(discussions, globals, helpers, person, plumbing) {
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
   * @name memories.types:type.MemoryRef
   * @description
   *
   * A {@link memories.types:type.Memory Memory} id and a Memory Persona Id.
   * See {@link memories.functions:getMemoryPersonas getMemoryPersonas} for more information about Memory Personas.
   */
  var MemoryRef = exports.MemoryRef = function(location, personaId) {
    if (personaId) {
      // MemoryRef(memoryId, personaId)
      this.resource = helpers.getAPIServerUrl('/platform/memories/memories/' + location + '/personas/' + personaId);
      this.resourceId = personaId;
    }
    else {
      // MemoryRef(location)
      // we must remove the access token in order to pass this into addPersonMemoryRef
      this.resource = location.replace(/\?.*$/, '');
      this.resourceId = helpers.getLastUrlSegment(location);
    }
  };

  exports.MemoryRef.prototype = {
    constructor: MemoryRef,
    /**
     * @ngdoc property
     * @name memories.types:type.MemoryRef#resourceId
     * @propertyOf memories.types:type.MemoryRef
     * @return {String} Id of the Memory Persona to which this person is connected
     */

    /**
     * @ngdoc function
     * @name memories.types:type.MemoryRef#getMemoryId
     * @methodOf memories.types:type.MemoryRef
     * @function
     * @return {String} Id of the memory; pass into {@link memories.functions:getMemory getMemory} for details
     */
    getMemoryId:  function() {
      return this.resource ? this.resource.replace(/^.*\/memories\/([^\/]*)\/personas\/.*$/, '$1') : this.resource; }
  };

  /**
   * @ngdoc function
   * @name memories.functions:getPersonMemoryRefs
   * @function
   *
   * @description
   * Get references to memories for a person
   * The response includes the following convenience function
   *
   * - `getMemoryRefs()` - get an array of {@link memories.types:type.MemoryRef MemoryRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/vt79D/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMemoryRefs = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/memory-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemoryRefs: function() { return maybe(maybe(this.persons)[0]).evidence || []; }}),
        helpers.constructorSetter(MemoryRef, 'evidence', function(response) {
          return maybe(maybe(response).persons)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name memories.types:type.Memory
   * @description
   *
   * Memory
   */
  var Memory = exports.Memory = function() {

  };

  exports.Memory.prototype = {
    constructor: Memory,
    /**
     * @ngdoc property
     * @name memories.types:type.Memory#id
     * @propertyOf memories.types:type.Memory
     * @return {String} Id of the Memory
     */

    /**
     * @ngdoc property
     * @name memories.types:type.Memory#mediaType
     * @propertyOf memories.types:type.Memory
     * @return {String} media type; e.g., image/jpeg
     */

    /**
     * @ngdoc property
     * @name memories.types:type.Memory#resourceType
     * @propertyOf memories.types:type.Memory
     * @return {String} resource type; e.g., http://gedcomx.org/DigitalArtifact
     */

    /**
     * @ngdoc property
     * @name memories.types:type.Memory#about
     * @propertyOf memories.types:type.Memory
     * @return {String} URL of the media object
     */

    /**
     * @ngdoc function
     * @name memories.types:type.Memory#getTitle
     * @methodOf memories.types:type.Memory
     * @function
     * @return {String} title
     */
    getTitle: function() { return maybe(maybe(this.titles)[0]).value; },

    /**
     * @ngdoc function
     * @name memories.types:type.Memory#getDescription
     * @methodOf memories.types:type.Memory
     * @function
     * @return {String} description
     */
    getDescription: function() { return maybe(maybe(this.description)[0]).value; },

    /**
     * @ngdoc function
     * @name memories.types:type.Memory#getArtifactFilenames
     * @methodOf memories.types:type.Memory
     * @function
     * @return {String[]} array of filenames
     */
    getArtifactFilenames: function() {
      return helpers.map(this.artifactMetadata, function(am) {
        return am.filename;
      });
    },

    /**
     * @ngdoc function
     * @name memories.types:type.Memory#getIconURL
     * @methodOf memories.types:type.Memory
     * @function
     * @return {String} URL of the icon
     */
    getIconURL: function() { return maybe(maybe(this.links)['image-icon']).href; },

    /**
     * @ngdoc function
     * @name memories.types:type.Memory#getThumbnailURL
     * @methodOf memories.types:type.Memory
     * @function
     * @return {String} URL of the thumbnail
     */
    getThumbnailURL: function() { return maybe(maybe(this.links)['image-thumbnail']).href; },

    /**
     * @ngdoc function
     * @name memories.types:type.Memory#getModified
     * @methodOf memories.types:type.Memory
     * @function
     * @return {Number} timestamp
     */
    getModified: function() { return maybe(this.attribution).modified; }
  };

  /**
   * @ngdoc function
   * @name memories.functions:getPersonMemoriesQuery
   * @function
   *
   * @description
   * Get a paged list of memories for a person
   * The response includes the following convenience function
   *
   * - `getMemories()` - get the array of {@link memories.types:type.Memory Memories} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Query_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/XaD23/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0, `type` type of artifacts to return - possible values are photo and story - defaults to both
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMemoriesQuery = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/memories', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
        helpers.constructorSetter(Memory, 'sourceDescriptions')
      ));
  };

  /**
   * @ngdoc function
   * @name memories.functions:getUserMemoriesQuery
   * @function
   *
   * @description
   * Get a paged list of memories for a user
   * The response includes the following convenience function
   *
   * - `getMemories()` - get the array of {@link memories.types:type.Memory Memories} from the response
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
  exports.getUserMemoriesQuery = function(id, params, opts) {
    return plumbing.get('/platform/memories/users/'+encodeURI(id)+'/memories', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
        helpers.constructorSetter(Memory, 'sourceDescriptions')
      ));
  };

  /**
   * @ngdoc function
   * @name memories.functions:getMemory
   * @function
   *
   * @description
   * Get information about a memory
   * The response includes the following convenience function
   *
   * - `getMemory()` - get the {@link memories.types:type.Memory Memory} from the response
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
      helpers.compose(
        helpers.objectExtender({getMemory: function() { return maybe(this.sourceDescriptions)[0]; }}),
        helpers.constructorSetter(Memory, 'sourceDescriptions')
      ));
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
   * - `getComments()` - get the array of {@link discussions.types:type.Comment Comments} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comments_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/aJ77f/ editable example}
   *
   * @param {String} mid of the memory to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryComments = function(mid, params, opts) {
    return plumbing.get('/platform/memories/memories/'+encodeURI(mid)+'/comments', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getComments: function() { return maybe(maybe(this.discussions)[0]).comments || []; }}),
        helpers.constructorSetter(discussions.Comment, 'comments', function(response) {
          return maybe(maybe(response).discussions)[0];
        })
      ));
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
   * - `getPersonas()` - get the array of *Personas* from the response; a *Persona* appears to be a scaled-down
   * {@link person.types:type.Person Person} whose id is a *Persona Id* instead of a *Person Id*
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/zD5V7/ editable example}
   *
   * @param {String} mid of the memory to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryPersonas = function(mid, params, opts) {
    return plumbing.get('/platform/memories/memories/'+encodeURI(mid)+'/personas', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getPersonas: function() { return this && this.persons ? this.persons : []; }}),
        helpers.constructorSetter(person.Person, 'persons')
      ));
  };

  /**
   * @ngdoc function
   * @name memories.functions:getPersonPortraitURL
   * @function
   *
   * @description
   * Get the URL of the portrait of a person
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Portrait_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/f8DU3/ editable example}
   *
   * @param {String} pid of the person
   * @param {Object=} params `default` URL to redirect to if portrait doesn't exist;
   * `followRedirect` if true, follow the redirect and return the final URL
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the URL
   */
  exports.getPersonPortraitURL = function(pid, params, opts) {
    var result;
    var path = '/platform/tree/persons/'+encodeURI(pid)+'/portrait';
    if (params && params.followRedirect) {
      params = helpers.extend({}, params);
      delete params.followRedirect;
      var d = globals.deferredWrapper();
      var promise = plumbing.get(path, params, {}, opts);
      result = helpers.extendHttpPromise(d.promise, promise);
      promise.then(function() {
        d.resolve(promise.getStatusCode() === 200 ? promise.getResponseHeader('Content-Location') : '');
      }, function() {
        // We don't expect the image content-type, try to parse it as json, and fail, so rely upon the status code
        d.resolve(promise.getStatusCode() === 200 ? promise.getResponseHeader('Content-Location') : '');
      });
    }
    else {
      result = helpers.getAPIServerUrl(path);
    }
    return helpers.refPromise(result);
  };

  /**
   * @ngdoc function
   * @name memories.functions:createMemory
   * @function
   *
   * @description
   * Create a memory (story or photo)
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memories_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/2ghkh/ editable example}
   *
   * @param {String|FormData} data string or a FormData object
   * @param {Object=} params `description`, `title`, `filename`, and `type` - artifact type
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory id
   */
  exports.createMemory = function(data, params, opts) {
    return plumbing.post(helpers.appendQueryParameters('/platform/memories/memories', params),
      data, helpers.isString(data) ? { 'Content-Type': 'text/plain' } : {}, opts,
      helpers.getLastResponseLocationSegment);
  };

  /**
   * @ngdoc function
   * @name memories.functions:createMemoryPersona
   * @function
   *
   * @description
   * Create a memory (story or photo)
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/dLfA8/ editable example}
   *
   * @param {String} mid memory id
   * @param {Person} persona persona is a mini-Person object attached to the memory; people are attached to specific personas
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the MemoryRef (memory id and persona id)
   */
  exports.createMemoryPersona = function(mid, persona, params, opts) {
    var data = {
      persons: [ helpers.extend({
        media : [ {
          description : 'https://familysearch.org/platform/memories/artifacts/' + mid + '/description'
        } ]
      }, persona)
      ]
    };
    return plumbing.post('/platform/memories/memories/'+mid+'/personas', data, {}, opts,
      function(data, promise) {
        var location = promise.getResponseHeader('Location');
        return location ? new MemoryRef(location) : location;
      });
  };

  /**
   * @ngdoc function
   * @name memories.functions:addPersonMemoryRef
   * @function
   *
   * @description
   * Create a memory (story or photo)
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/wrNj2/ editable example}
   *
   * @param {String} pid person id
   * @param {MemoryRef} memoryRef reference to the memory and persona
   * @param {Object=} params `changeMessage` change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the persona id
   */
  exports.addPersonMemoryRef = function(pid, memoryRef, params, opts) {
    var data = {
      persons: [{
        evidence: [ memoryRef ]
      }]
    };
    if (params && params.changeMessage) {
      data.persons[0].attribution = {
        changeMessage: params.changeMessage
      };
    }
    return plumbing.post('/platform/tree/persons/'+pid+'/memory-references', data, {}, opts,
      helpers.getLastResponseLocationSegment);
  };

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
   * @name notes.types:type.NoteRef
   * @description
   *
   * Reference to a note on a person
   */
  var NoteRef = exports.NoteRef = function() {

  };

  exports.NoteRef.prototype = {
    constructor: NoteRef
    /**
     * @ngdoc property
     * @name notes.types:type.NoteRef#id
     * @propertyOf notes.types:type.NoteRef
     * @return {String} Id of the note - pass into {@link notes.functions.getPersonNote getPersonNote},
     * {@link notes.functions.getCoupleNote getCoupleNote}, or {@link notes.functions.getChildAndParentsNote getChildAndParentsNote}
     * for details
     */

    /**
     * @ngdoc property
     * @name notes.types:type.NoteRef#subject
     * @propertyOf notes.types:type.NoteRef
     * @return {String} subject of the note
     */
  };

  /**
   * @ngdoc function
   * @name notes.functions:getPersonNoteRefs
   * @function
   *
   * @description
   * Get note references for a person
   * The response includes the following convenience function
   *
   * - `getNoteRefs()` - get an array of {@link notes.types:type.NoteRef NoteRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/3enGw/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonNoteRefs = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/notes', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getNoteRefs: function() { return maybe(maybe(this.persons)[0]).notes || []; }}),
        helpers.constructorSetter(NoteRef, 'notes', function(response) {
          return maybe(maybe(response).persons)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name notes.types:type.Note
   * @description
   *
   * Note
   */
  var Note = exports.Note = function() {

  };

  exports.Note.prototype = {
    constructor: Note,
    /**
     * @ngdoc property
     * @name notes.types:type.Note#id
     * @propertyOf notes.types:type.Note
     * @return {String} Id of the note
     */

    /**
     * @ngdoc property
     * @name notes.types:type.Note#subject
     * @propertyOf notes.types:type.Note
     * @return {String} subject / title of the note
     */

    /**
     * @ngdoc property
     * @name notes.types:type.Note#text
     * @propertyOf notes.types:type.Note
     * @return {String} text of the note
     */

    /**
     * @ngdoc function
     * @name notes.types:type.Note#getContributorId
     * @methodOf notes.types:type.Note
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(maybe(this.attribution).contributor).resourceId; },

    /**
     * @ngdoc function
     * @name notes.types:type.Note#getModified
     * @methodOf notes.types:type.Note
     * @function
     * @return {Number} timestamp
     */
    getModified: function() { return maybe(this.attribution).modified; }
  };

  /**
   * @ngdoc function
   * @name notes.functions:getPersonNote
   * @function
   *
   * @description
   * Get information about a note
   * The response includes the following convenience function
   *
   * - `getNote()` - get the {@link notes.types:type.Note Note} from the response
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
      helpers.compose(
        helpers.objectExtender({getNote: function() { return maybe(maybe(maybe(this.persons)[0]).notes)[0]; }}),
        helpers.constructorSetter(Note, 'notes', function(response) {
            return maybe(maybe(response).persons)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name notes.functions:getMultiPersonNote
   * @function
   *
   * @description
   * Get multiple notes at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/5dLd4/ editable example}
   *
   * @param {String} pid of the person
   * @param {Array} nids Ids or {@link notes.types:type.NoteRef NoteRefs} of the notes to read
   * @param {Object=} params pass to getPersonNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id to response
   */
  exports.getMultiPersonNote = function(pid, nids, params, opts) {
    var promises = {};
    helpers.forEach(nids, function(nid) {
      var id = (nid instanceof NoteRef) ? nid.id : nid;
      promises[id] = exports.getPersonNote(pid, id, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name notes.functions:getCoupleNoteRefs
   * @function
   *
   * @description
   * Get the note references for a couple relationship
   * The response includes the following convenience function
   *
   * - `getNoteRefs()` - get an array of {@link notes.types:type.NoteRef NoteRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/qe2dc/ editable example}
   *
   * @param {String} crid of the couple relationship to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleNoteRefs = function(crid, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(crid)+'/notes', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getNoteRefs: function() { return maybe(maybe(this.relationships)[0]).notes || []; }}),
        helpers.constructorSetter(NoteRef, 'notes', function(response) {
          return maybe(maybe(response).relationships)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name notes.functions:getCoupleNote
   * @function
   *
   * @description
   * Get information about a couple relationship note
   * The response includes the following convenience function
   *
   * - `getNote()` - get the {@link notes.types:type.Note Note} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/T7xj2/ editable example}
   *
   * @param {String} crid of the couple relationship
   * @param {String} nid of the note
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleNote = function(crid, nid, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(crid)+'/notes/'+encodeURI(nid), params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getNote: function() { return maybe(maybe(maybe(this.relationships)[0]).notes)[0]; }}),
        helpers.constructorSetter(Note, 'notes', function(response) {
          return maybe(maybe(response).relationships)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name notes.functions:getMultiCoupleNote
   * @function
   *
   * @description
   * Get multiple notes at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/fn8NU/ editable example}
   *
   * @param {String} crid of the couple relationship
   * @param {Array} nids Ids or {@link notes.types:type.NoteRef NoteRefs} of the notes to read
   * @param {Object=} params pass to getCoupleNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id to response
   */
  exports.getMultiCoupleNote = function(crid, nids, params, opts) {
    var promises = {};
    helpers.forEach(nids, function(nid) {
      var id = (nid instanceof NoteRef) ? nid.id : nid;
      promises[id] = exports.getCoupleNote(crid, id, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name notes.functions:getChildAndParentsNoteRefs
   * @function
   *
   * @description
   * Get the note references for a child and parents relationship
   * The response includes the following convenience function
   *
   * - `getNoteRefs()` - get an array of {@link notes.types:type.NoteRef NoteRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/SV8Hs/ editable example}
   *
   * @param {String} caprid of the child and parents relationship to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsNoteRefs = function(caprid, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(caprid)+'/notes', params,
      {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getNoteRefs: function() { return maybe(maybe(this.childAndParentsRelationships)[0]).notes || []; }}),
        helpers.constructorSetter(NoteRef, 'notes', function(response) {
          return maybe(maybe(response).childAndParentsRelationships)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name notes.functions:getChildAndParentsNote
   * @function
   *
   * @description
   * Get information about a child and parents relationship note
   * The response includes the following convenience function
   *
   * - `getNote()` - get the {@link notes.types:type.Note Note} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/dV9uQ/ editable example}
   *
   * @param {String} caprid of the child and parents relationship
   * @param {String} nid of the note
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsNote = function(caprid, nid, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(caprid)+'/notes/'+encodeURI(nid), params,
      {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getNote: function() { return maybe(maybe(maybe(this.childAndParentsRelationships)[0]).notes)[0]; }}),
        helpers.constructorSetter(Note, 'notes', function(response) {
          return maybe(maybe(response).childAndParentsRelationships)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name notes.functions:getMultiChildAndParentsNote
   * @function
   *
   * @description
   * Get multiple notes at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/fn8NU/ editable example}
   *
   * @param {String} caprid of the child and parents relationship
   * @param {Array} nids Ids or {@link notes.types:type.NoteRef NoteRefs} of the notes to read
   * @param {Object=} params pass to getChildAndParentsNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id to response
   */
  exports.getMultiChildAndParentsNote = function(caprid, nids, params, opts) {
    var promises = {};
    helpers.forEach(nids, function(nid) {
      var id = (nid instanceof NoteRef) ? nid.id : nid;
      promises[id] = exports.getChildAndParentsNote(caprid, id, params, opts);
    });
    return helpers.promiseAll(promises);
  };

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
   * Get information about a child and parents relationship.
   * The response includes the following convenience functions
   *
   * - `getRelationship()` - a {@link person.types:type.ChildAndParents ChildAndParents} relationship
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:type.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/C437t/ editable example}
   *
   * @param {String} caprid of the relationship to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParents = function(caprid, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(caprid), params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.constructorSetter(person.ChildAndParents, 'childAndParentsRelationships'),
        helpers.objectExtender(childAndParentsConvenienceFunctions),
        helpers.constructorSetter(person.Fact, 'motherFacts', function(response) {
          return maybe(response).childAndParentsRelationships;
        }),
        helpers.constructorSetter(person.Fact, 'fatherFacts', function(response) {
          return maybe(response).childAndParentsRelationships;
        }),
        person.personMapper()
      ));
  };

  var childAndParentsConvenienceFunctions = {
    getRelationship: function() { return maybe(this.childAndParentsRelationships)[0]; },
    getPerson:       function(id) { return helpers.find(this.persons, {id: id}); }
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
   * - `getPersons()` - return an array of {@link person.types:type.Person Persons}
   * - `getPerson(ascendancyNumber)` - return a {@link person.types:type.Person Person}
   * - `exists(ascendancyNumber)` - return true if a person with ascendancy number exists
   *
   * ### Notes
   *
   * * Each Person object has an additional `getAscendancyNumber()` function that returns the person's ascendancy number.
   * * Some information on the Person objects is available only if `params` includes `personDetails`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Ancestry_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/gt726/ editable example}
   *
   * @param {String} id of the person
   * @param {Object=} params includes `generations` to retrieve max 8, `spouse` id to get ancestry of person and spouse,
   * `personDetails` set to true to retrieve full person objects for each ancestor
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the ancestry
   */
  exports.getAncestry = function(id, params, opts) {
    return plumbing.get('/platform/tree/ancestry', helpers.extend({'person': id}, params), {}, opts,
      helpers.compose(
        helpers.objectExtender(pedigreeConvenienceFunctionGenerator('ascendancyNumber')),
        person.personMapper(),
        helpers.objectExtender({getAscendancyNumber: function() { return this.display.ascendancyNumber; }}, function(response) {
          return maybe(response).persons;
        })
      ));
  };

  // TODO add marriageDetails query parameter and convenience functions

  /**
   * Generate ancestry or descendancy convenience functions
   *
   * @param numberLabel ascendancyNumber or descendancyNumber
   * @returns {{getPersons: Function, exists: Function, getPerson: Function}}
   */
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
   * - `getPersons()` - return an array of {@link person.types:type.Person Persons}
   * - `getPerson(descendancyNumber)` - return a {@link person.types:type.Person Person}
   * - `exists(descendancyNumber)` - return true if a person with ascendancy number exists
   *
   * ### Notes
   *
   * * Each Person object has an additional `getDescendancyNumber()` function that returns the person's descendancy number.
   * * Some information on the Person objects is unavailable; e.g., separate given name and surname name parts.
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
    return plumbing.get('/platform/tree/descendancy', helpers.extend({'person': id}, params), {}, opts,
      helpers.compose(
        helpers.objectExtender(pedigreeConvenienceFunctionGenerator('descendancyNumber')),
        person.personMapper(),
        helpers.objectExtender({getDescendancyNumber: function() { return this.display.descendancyNumber; }}, function(response) {
          return maybe(response).persons;
        })
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
   * @name searchAndMatch.types:type.SearchResult
   * @description
   *
   * Reference from a person or relationship to a source
   */
  var SearchResult = exports.SearchResult = function() {

  };

  exports.SearchResult.prototype = {
    constructor: SearchResult,
    /**
     * @ngdoc property
     * @name searchAndMatch.types:type.SearchResult#id
     * @propertyOf searchAndMatch.types:type.SearchResult
     * @return {String} Id of the person for this search result
     */

    /**
     * @ngdoc property
     * @name searchAndMatch.types:type.SearchResult#title
     * @propertyOf searchAndMatch.types:type.SearchResult
     * @return {String} Id and Name
     */

    /**
     * @ngdoc property
     * @name searchAndMatch.types:type.SearchResult#score
     * @propertyOf searchAndMatch.types:type.SearchResult
     * @return {Number} higher is better
     */

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getPerson
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @description
     *
     * **Note: Be aware that the `Person` objects returned from SearchResults do not have as much information
     * as `Person` objects returned from the various person and pedigree functions.**
     *
     * @return {Person} the {@link person.types:type.Person Person} for this Id in this search result
     */
    getPerson: function(id) {
      return helpers.find(maybe(maybe(this.content).gedcomx).persons, {id: id});
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getPrimaryPerson
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {Person} the primary {@link person.types:type.Person Person} for this search result
     */
    getPrimaryPerson: function() {
      return this.getPerson(this.id);
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getFatherIds
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {String[]} array of father Id's for this search result
     */
    getFatherIds: function() {
      var primaryId = this.id, self = this;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/ParentChild' &&
            r.person2.resourceId === primaryId &&
            r.person1 &&
            maybe(self.getPerson(r.person1.resourceId).gender).type === 'http://gedcomx.org/Male';
        }),
        function(r) { return r.person1.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getFathers
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {Person[]} array of father {@link person.types:type.Person Persons} for this search result
     */
    getFathers: function() { return helpers.map(this.getFatherIds(), this.getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getMotherIds
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {String[]} array of mother Id's for this search result
     */
    getMotherIds: function() {
      var primaryId = this.id, self = this;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/ParentChild' &&
            r.person2.resourceId === primaryId &&
            r.person1 &&
            maybe(self.getPerson(r.person1.resourceId).gender).type !== 'http://gedcomx.org/Male';
        }),
        function(r) { return r.person1.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getMothers
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {Person[]} array of mother {@link person.types:type.Person Persons} for this search result
     */
    getMothers: function() { return helpers.map(this.getMotherIds(), this.getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getSpouseIds
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {String[]} array of spouse Id's for this search result
     */
    getSpouseIds:  function() {
      var primaryId = this.id;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/Couple' &&
            (r.person1.resourceId === primaryId || r.person2.resourceId === primaryId);
        }),
        function(r) { return r.person1.resourceId === primaryId ? r.person2.resourceId : r.person1.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getSpouses
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {Person[]} array of spouse {@link person.types:type.Person Persons} for this search result
     */
    getSpouses: function() { return helpers.map(this.getSpouseIds(), this.getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getChildIds
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {String[]} array of child Id's for this search result
     */
    getChildIds:  function() {
      var primaryId = this.id;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/ParentChild' &&
            r.person1.resourceId === primaryId &&
            r.person2;
        }),
        function(r) { return r.person2.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getChildren
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {Person[]} array of spouse {@link person.types:type.Person Persons} for this search result
     */
    getChildren: function() { return helpers.map(this.getChildIds(), this.getPerson, this); }
  };

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
   * - `getSearchResults()` - get the array of {@link searchAndMatch.types:type.SearchResult SearchResults} from the response
   * - `getResultsCount()` - get the total number of search results
   * - `getIndex()` - get the starting index of the results array
   *
   * ### Search parameters
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
        searchMatchResponseMapper,
        function(obj, promise) {
          obj.getContext = function() {
            return promise.getResponseHeader('X-FS-Page-Context');
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

  var searchMatchResponseConvenienceFunctions = {
    getSearchResults: function() { return this.entries || []; },
    getResultsCount: function() { return this.results; },
    getIndex: function() { return this.index; }
  };

  var searchMatchResponseMapper = helpers.compose(
    helpers.objectExtender(searchMatchResponseConvenienceFunctions),
    helpers.constructorSetter(SearchResult, 'entries'),
    person.personMapper(function(response) {
      return helpers.map(maybe(response).entries, function(entry) {
        return maybe(entry.content).gedcomx;
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
   * - `getSearchResults()` - get the array of {@link searchAndMatch.types:type.SearchResult SearchResults} from the response
   * - `getResultsCount()` - get the total number of search results
   * - `getIndex()` - get the starting index of the results array
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
      searchMatchResponseMapper);
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
   * - `getSearchResults()` - get the array of {@link searchAndMatch.types:type.SearchResult SearchResults} from the response
   * - `getResultsCount()` - get the total number of search results
   * - `getIndex()` - get the starting index of the results array
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
    }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      searchMatchResponseMapper);
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
   * @name sources.types:type.SourceRef
   * @description
   *
   * Reference from a person or relationship to a source
   */
  var SourceRef = exports.SourceRef = function() {

  };

  exports.SourceRef.prototype = {
    constructor: SourceRef,
    /**
     * @ngdoc property
     * @name sources.types:type.SourceRef#id
     * @propertyOf sources.types:type.SourceRef
     * @return {String} Id of the source reference
     */

    /**
     * @ngdoc function
     * @name sources.types:type.SourceRef#getSourceDescriptionId
     * @methodOf sources.types:type.SourceRef
     * @function
     * @return {String} Id of the source description - pass into {@link sources.functions:getSourceDescription getSourceDescription} for details
     */
    getSourceDescriptionId: function() {
      return helpers.getLastUrlSegment(this.description);
    },

    /**
     * @ngdoc function
     * @name sources.types:type.SourceRef#getTagNames
     * @methodOf sources.types:type.SourceRef
     * @function
     * @return {String[]} an array of tag names; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
     */
    getTagNames: function() { return helpers.map(this.tags, function(tag) {
      return tag.resource;
    }); },

    /**
     * @ngdoc function
     * @name sources.types:type.SourceRef#getContributorId
     * @methodOf sources.types:type.SourceRef
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(maybe(this.attribution).contributor).resourceId; },

    /**
     * @ngdoc function
     * @name sources.types:type.SourceRef#getModified
     * @methodOf sources.types:type.SourceRef
     * @function
     * @return {Number} last modified timestamp
     */
    getModified: function() { return maybe(this.attribution).modified; },

    /**
     * @ngdoc function
     * @name sources.types:type.SourceRef#getChangeMessage
     * @methodOf sources.types:type.SourceRef
     * @function
     * @return {String} Reason for the change
     */
    getChangeMessage: function() { return maybe(this.attribution).changeMessage; }
  };

  /**
   * @ngdoc function
   * @name sources.functions:getPersonSourceRefs
   * @function
   *
   * @description
   * Get references to sources for a person
   * The response includes the following convenience function
   *
   * - `getSourceRefs()` - get an array of {@link sources.types:type.SourceRef SourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/BkydV/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonSourceRefs = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/source-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceRefs: function() { return maybe(maybe(this.persons)[0]).sources || []; }}),
        helpers.constructorSetter(SourceRef, 'sources', function(response) {
          return maybe(maybe(response).persons)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name sources.types:type.SourceDescription
   * @description
   *
   * Description of a source
   */
  var SourceDescription = exports.SourceDescription = function() {

  };

  exports.SourceDescription.prototype = {
    constructor: SourceDescription,
    /**
     * @ngdoc property
     * @name sources.types:type.SourceDescription#id
     * @propertyOf sources.types:type.SourceDescription
     * @return {String} Id of the source description
     */

    /**
     * @ngdoc property
     * @name sources.types:type.SourceDescription#about
     * @propertyOf sources.types:type.SourceDescription
     * @return {String} URL (link to the record)
     */

    /**
     * @ngdoc function
     * @name sources.types:type.SourceDescription#getCitation
     * @methodOf sources.types:type.SourceDescription
     * @function
     * @return {String} source citation
     */
    getCitation: function() { return maybe(maybe(this.citations)[0]).value; },

    /**
     * @ngdoc function
     * @name sources.types:type.SourceDescription#getTitle
     * @methodOf sources.types:type.SourceDescription
     * @function
     * @return {String} title of the source description
     */
    getTitle: function() { return maybe(maybe(this.titles)[0]).value; },

    /**
     * @ngdoc function
     * @name sources.types:type.SourceDescription#getText
     * @methodOf sources.types:type.SourceDescription
     * @function
     * @return {String} Text / Description of the source
     */
    getText: function() { return maybe(maybe(this.notes)[0]).text; },

    /**
     * @ngdoc function
     * @name sources.types:type.SourceDescription#getContributorId
     * @methodOf sources.types:type.SourceDescription
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(maybe(this.attribution).contributor).resourceId; },

    /**
     * @ngdoc function
     * @name sources.types:type.SourceDescription#getModified
     * @methodOf sources.types:type.SourceDescription
     * @function
     * @return {Number} last modified timestamp
     */
    getModified: function() { return maybe(this.attribution).modified; }
  };

  /**
   * @ngdoc function
   * @name sources.functions:getSourceDescription
   * @function
   *
   * @description
   * Get information about a source
   * The response includes the following convenience function
   *
   * - `getSourceDescription()` - get the {@link sources.types:type.SourceDescription SourceDescription} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/eECJx/ editable example}
   *
   * @param {String} sdid of the source description to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceDescription = function(sdid, params, opts) {
    return plumbing.get('/platform/sources/descriptions/'+encodeURI(sdid), params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceDescription: function() { return maybe(this.sourceDescriptions)[0]; }}),
        helpers.constructorSetter(SourceDescription, 'sourceDescriptions')
      ));
  };

  /**
   * @ngdoc function
   * @name sources.functions:getMultiSourceDescription
   * @function
   *
   * @description
   * Get multiple source descriptions at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/chQ64/ editable example}
   *
   * @param {Array} sdids Ids or {@link sources.types:type.SourceRef SourceRefs} of the source descriptions to read
   * @param {Object=} params pass to getSourceDescription currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the source descriptions have been read,
   * returning a map of source description id to response
   */
  exports.getMultiSourceDescription = function(sdids, params, opts) {
    var promises = {};
    helpers.forEach(sdids, function(sdid) {
      var id = (sdid instanceof SourceRef) ? sdid.getSourceDescriptionId() : sdid;
      promises[id] = exports.getSourceDescription(id, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name sources.functions:getCoupleSourceRefs
   * @function
   *
   * @description
   * Get the source references for a couple relationship
   * The response includes the following convenience function
   *
   * - `getSourceRefs()` - get an array of {@link sources.types:type.SourceRef SourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ahu29/ editable example}
   *
   * @param {String} crid of the couple relationship to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleSourceRefs = function(crid, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(crid)+'/source-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceRefs: function() { return maybe(maybe(this.relationships)[0]).sources || []; }}),
        helpers.constructorSetter(SourceRef, 'sources', function(response) {
          return maybe(maybe(response).relationships)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name sources.functions:getChildAndParentsSourceRefs
   * @function
   *
   * @description
   * Get the source references for a child and parents relationship
   * The response includes the following convenience function
   *
   * - `getSourceRefs()` - get an array of {@link sources.types:type.SourceRef SourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ZKLVT/ editable example}
   *
   * @param {String} id of the child and parents relationship to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsSourceRefs = function(id, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(id)+'/source-references', params,
      {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceRefs: function() { return maybe(maybe(this.childAndParentsRelationships)[0]).sources || []; }}),
        helpers.constructorSetter(SourceRef, 'sources', function(response) {
          return maybe(maybe(response).childAndParentsRelationships)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name sources.types:type.IdSourceRef
   * @description
   *
   * A person or relationship id and a {@link sources.types:type.SourceRef SourceRef}
   */
  var IdSourceRef = exports.IdSourceRef = function() {

  };

  exports.IdSourceRef.prototype = {
    constructor: IdSourceRef,
    /**
     * @ngdoc property
     * @name sources.types:type.IdSourceRef#id
     * @propertyOf sources.types:type.IdSourceRef
     * @return {String} Id of the person or relationship
     */

    /**
     * @ngdoc function
     * @name sources.types:type.IdSourceRef#getSourceRef
     * @methodOf sources.types:type.IdSourceRef
     * @function
     * @return {SourceRef} {@link sources.types:type.SourceRef SourceRef}
     */
    getSourceRef: function() { return maybe(this.sources)[0]; }
  };

  /**
   * @ngdoc function
   * @name sources.functions:getSourceRefsQuery
   * @function
   *
   * @description
   * Get the people, couples, and child-and-parents relationships referencing a source
   * The response includes the following convenience functions
   *
   * - `getPersonIdSourceRefs()` - get an array of {@link sources.types:type.IdSourceRef IdSourceRefs} from the response
   * - `getCoupleIdSourceRefs()` - get an array of {@link sources.types:type.IdSourceRef IdSourceRefs} from the response
   * - `getChildAndParentsIdSourceRefs()` - get an array of {@link sources.types:type.IdSourceRef IdSourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Source_References_Query_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/E866s/ editable example}
   *
   * @param {String} sdid of the source description
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceRefsQuery = function(sdid, params, opts) {
    return plumbing.get('/platform/tree/source-references', helpers.extend({'source': sdid}, params), {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getPersonIdSourceRefs: function() { return this.persons || []; }}),
        helpers.constructorSetter(IdSourceRef, 'persons'),
        helpers.objectExtender({getCoupleIdSourceRefs: function() { return this.relationships || []; }}),
        helpers.constructorSetter(IdSourceRef, 'relationships'),
        helpers.objectExtender({getChildAndParentsIdSourceRefs: function() { return this.childAndParentsRelationships || []; }}),
        helpers.constructorSetter(IdSourceRef, 'childAndParentsRelationships'),
        helpers.constructorSetter(SourceRef, 'sources', function(response) {
          return helpers.union(maybe(response).persons, maybe(response).relationships, maybe(response).childAndParentsRelationships);
        })
      ));
  };

  return exports;
});

define('sourceBox',[
  'helpers',
  'plumbing',
  'sources'
], function(helpers, plumbing, sources) {
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
   * @name sourceBox.types:type.Collection
   * @description
   *
   * Collection
   */
  var Collection = exports.Collection = function() {

  };

  exports.Collection.prototype = {
    constructor: Collection,
    /**
     * @ngdoc property
     * @name sourceBox.types:type.Collection#id
     * @propertyOf sourceBox.types:type.Collection
     * @return {String} Id of the collection
     */

    /**
     * @ngdoc property
     * @name sourceBox.types:type.Collection#title
     * @propertyOf sourceBox.types:type.Collection
     * @return {String} title / folder of the collection
     */

    /**
     * @ngdoc property
     * @name sourceBox.types:type.Collection#size
     * @propertyOf sourceBox.types:type.Collection
     * @return {Number} number of sources in the collection
     */

    /**
     * @ngdoc function
     * @name sourceBox.types:type.Collection#getContributorId
     * @methodOf sourceBox.types:type.Collection
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(maybe(this.attribution).contributor).resourceId; }
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:getCollectionsForUser
   * @function
   *
   * @description
   * Search people
   * The response includes the following convenience function
   *
   * - `getCollections()` - get an array of {@link sourceBox.types:type.Collection Collections} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_for_a_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/et88N/ editable example}
   *
   * @param {String} uid of the user who owns the source box
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionsForUser = function(uid, params, opts) {
    return plumbing.get('/platform/sources/'+encodeURI(uid)+'/collections', {}, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getCollections: function() { return this.collections || []; }}),
        helpers.constructorSetter(Collection, 'collections')
      ));
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:getCollection
   * @function
   *
   * @description
   * Get information about a user-defined collection
   * The response includes the following convenience function
   *
   * - `getCollection()` - get a {@link sourceBox.types:type.Collection Collection} from the response
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
      helpers.compose(
        helpers.objectExtender({getCollection: function() { return maybe(this.collections)[0]; }}),
        helpers.constructorSetter(Collection, 'collections')
      ));
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
   * - `getSourceDescriptions()` - get an array of {@link sources.types:type.SourceDescription SourceDescriptions} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_Source_Descriptions_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/7yDmE/ editable example}
   *
   * @param {String} cid of the collection to read
   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionSourceDescriptions = function(cid, params, opts) {
    return plumbing.get('/platform/sources/collections/'+encodeURI(cid)+'/descriptions', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceDescriptions: function() { return this.sourceDescriptions || []; }}),
        helpers.constructorSetter(sources.SourceDescription, 'sourceDescriptions')
      ));
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
   * - `getSourceDescriptions()` - get an array of {@link sources.types:type.SourceDescription SourceDescriptions} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_Source_Descriptions_for_a_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/4TSxJ/ editable example}
   *
   * @param {String} uid of the user to read
   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionSourceDescriptionsForUser = function(uid, params, opts) {
    return plumbing.get('/platform/sources/'+encodeURI(uid)+'/collections/descriptions', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceDescriptions: function() { return this.sourceDescriptions || []; }}),
        helpers.constructorSetter(sources.SourceDescription, 'sourceDescriptions')
      ));
  };

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
   * - `getRelationship()` - a {@link person.types:type.Couple Couple} relationship
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:type.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/a2vUg/ editable example}
   *
   * @param {String} crid of the couple relationship to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCouple = function(crid, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(crid), params, {}, opts,
      helpers.compose(
        helpers.constructorSetter(person.Couple, 'relationships'),
        helpers.objectExtender(coupleConvenienceFunctions),
        helpers.constructorSetter(person.Fact, 'facts', function(response) {
          return maybe(response).relationships;
        }),
        person.personMapper()
      ));
  };

  var coupleConvenienceFunctions = {
    getRelationship: function() { return maybe(this.relationships)[0]; },
    getPerson:       function(id) { return helpers.find(this.persons, {id: id}); }
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
   * @name user.types:type.User
   * @description
   *
   * User - a user is returned from {@link user.functions:getCurrentUser getCurrentUser};
   * Contributor Ids are agent ids, not user ids.
   */
  var User = exports.User = function() {

  };

  exports.User.prototype = {
    constructor: User
    /**
     * @ngdoc property
     * @name user.types:type.User#id
     * @propertyOf user.types:type.User
     * @return {String} Id of the user
     */

    /**
     * @ngdoc property
     * @name user.types:type.User#contactName
     * @propertyOf user.types:type.User
     * @return {String} contact name of the user
     */

    /**
     * @ngdoc property
     * @name user.types:type.User#fullName
     * @propertyOf user.types:type.User
     * @return {String} full name of the user
     */

    /**
     * @ngdoc property
     * @name user.types:type.User#email
     * @propertyOf user.types:type.User
     * @return {String} email of the user
     */

    /**
     * @ngdoc property
     * @name user.types:type.User#treeUserId
     * @propertyOf user.types:type.User
     * @return {String} agent / contributor id of the user
     */
  };

  /**
   * @ngdoc function
   * @name user.functions:getCurrentUser
   * @function
   *
   * @description
   * Get the current user with the following convenience function
   *
   * - `getUser()` - get the {@link user.types:type.User User} from the response
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
    return plumbing.get('/platform/users/current', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getUser: function() { return maybe(this.users)[0]; }}),
        helpers.constructorSetter(User, 'users')
      ));
  };

  /**
   * @ngdoc function
   * @name user.functions:getCurrentUserPersonId
   * @function
   *
   * @description
   * Get the id of the current user person in the tree; pass into {@link person.functions:getPerson getPerson} for details
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Current_User_Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/c4puF/ editable example}
   *
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the (string) id of the current user person
   */
  exports.getCurrentUserPersonId = function(params, opts) {
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

  /**
   * Common code for current user person promise fulfillment and failure
   * @param {Object} d deferred
   * @param {Object} promise promise from get
   */
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
   * @name user.types:type.Agent
   * @description
   *
   * An agent is returned from {@link user.functions:getAgent getAgent}.
   * Contributor Ids are agent ids, not user ids.
   */
  var Agent = exports.Agent = function() {

  };

  exports.Agent.prototype = {
    constructor: Agent,
    /**
     * @ngdoc property
     * @name user.types:type.Agent#id
     * @propertyOf user.types:type.Agent
     * @return {String} Id of the agent
     */

    /**
     * @ngdoc function
     * @name user.types:type.Agent#getName
     * @methodOf user.types:type.Agent
     * @function
     * @return {String} name of the agent
     */
    getName:        function() { return maybe(maybe(this.names)[0]).value; },

    /**
     * @ngdoc function
     * @name user.types:type.Agent#getAccountName
     * @methodOf user.types:type.Agent
     * @function
     * @return {String} account / contact name of the agent
     */
    getAccountName: function() { return maybe(maybe(this.accounts)[0]).accountName; },

    /**
     * @ngdoc function
     * @name user.types:type.Agent#getEmail
     * @methodOf user.types:type.Agent
     * @function
     * @return {String} email of the agent
     */
    getEmail:       function() {
      var email = maybe(maybe(this.emails)[0]).resource;
      return email ? email.replace(/^mailto:/,'') : email;
    }
  };

  /**
   * @ngdoc function
   * @name user.functions:getAgent
   * @function
   *
   * @description
   * Get information about the specified agent (contributor)
   * The response includes the following convenience function
   *
   * - `getAgent()` - get the {@link user.types:type.Agent Agent} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/BpT8c/ editable example}
   *
   * @param {String} aid of the agent / contributor
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   */
  exports.getAgent = function(aid, params, opts) {
    return plumbing.get('/platform/users/agents/'+encodeURI(aid), params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getAgent: function() { return maybe(this.agents)[0]; }}),
        helpers.constructorSetter(Agent, 'agents')
      ));
  };

  /**
   * @ngdoc function
   * @name user.functions:getMultiAgent
   * @function
   *
   * @description
   * Get multiple agents at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/hMhas/ editable example}
   *
   * @param {Array} aids Ids of the agents to read
   * @param {Object=} params pass to getAgent currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the agents have been read,
   * returning a map of agent id to response
   */
  exports.getMultiAgent = function(aids, params, opts) {
    var promises = {};
    helpers.forEach(aids, function(aid) {
      promises[aid] = exports.getAgent(aid, params, opts);
    });
    return helpers.promiseAll(promises);
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
    getAccessTokenForMobile: authentication.getAccessTokenForMobile,
    hasAccessToken: authentication.hasAccessToken,
    invalidateAccessToken: authentication.invalidateAccessToken,

    // TODO authorities

    // changeHistory
    Change: changeHistory.Change,
    getPersonChanges: changeHistory.getPersonChanges,
    getChildAndParentsChanges: changeHistory.getChildAndParentsChanges,
    getCoupleChanges: changeHistory.getCoupleChanges,

    // TODO discovery

    // discussions
    Discussion: discussions.Discussion,
    Comment: discussions.Comment,
    getPersonDiscussionRefs: discussions.getPersonDiscussionRefs,
    getDiscussion: discussions.getDiscussion,
    getMultiDiscussion: discussions.getMultiDiscussion,
    getComments: discussions.getComments,

    // memories
    Memory: memories.Memory,
    MemoryRef: memories.MemoryRef,
    getPersonMemoryRefs: memories.getPersonMemoryRefs,
    getMemory: memories.getMemory,
    getMemoryComments: memories.getMemoryComments,
    getMemoryPersonas: memories.getMemoryPersonas,
    getPersonPortraitURL: memories.getPersonPortraitURL,
    getPersonMemoriesQuery: memories.getPersonMemoriesQuery,
    getUserMemoriesQuery: memories.getUserMemoriesQuery,
    createMemory: memories.createMemory,
    createMemoryPersona: memories.createMemoryPersona,
    addPersonMemoryRef: memories.addPersonMemoryRef,

    // notes
    Note: notes.Note,
    NoteRef: notes.NoteRef,
    getPersonNoteRefs: notes.getPersonNoteRefs,
    getPersonNote: notes.getPersonNote,
    getMultiPersonNote: notes.getMultiPersonNote,
    getCoupleNoteRefs: notes.getCoupleNoteRefs,
    getCoupleNote: notes.getCoupleNote,
    getMultiCoupleNote: notes.getMultiCoupleNote,
    getChildAndParentsNoteRefs: notes.getChildAndParentsNoteRefs,
    getChildAndParentsNote: notes.getChildAndParentsNote,
    getMultiChildAndParentsNote: notes.getMultiChildAndParentsNote,

    // TODO ordinances

    // parents and children
    getChildAndParents: parentsAndChildren.getChildAndParents,

    // pedigree
    getAncestry: pedigree.getAncestry,
    getDescendancy: pedigree.getDescendancy,

    // person
    Person: person.Person,
    Name: person.Name,
    Fact: person.Fact,
    ChildAndParents: person.ChildAndParents,
    Couple: person.Couple,
    ParentChild: person.ParentChild,
    getPerson: person.getPerson,
    getMultiPerson: person.getMultiPerson,
    getPersonWithRelationships: person.getPersonWithRelationships,
    getPersonChangeSummary: person.getPersonChangeSummary,
    getRelationshipsToSpouses: person.getRelationshipsToSpouses,
    getRelationshipsToParents: person.getRelationshipsToParents,
    getRelationshipsToChildren: person.getRelationshipsToChildren,

    // search and match
    SearchResult: searchAndMatch.SearchResult,
    getPersonSearch: searchAndMatch.getPersonSearch,
    getPersonMatches: searchAndMatch.getPersonMatches,
    getPersonMatchesQuery: searchAndMatch.getPersonMatchesQuery,

    // sourceBox
    Collection: sourceBox.Collection,
    getCollectionsForUser: sourceBox.getCollectionsForUser,
    getCollection: sourceBox.getCollection,
    getCollectionSourceDescriptions: sourceBox.getCollectionSourceDescriptions,
    getCollectionSourceDescriptionsForUser: sourceBox.getCollectionSourceDescriptionsForUser,

    // sources
    SourceDescription: sources.SourceDescription,
    SourceRef: sources.SourceRef,
    IdSourceRef: sources.IdSourceRef,
    getPersonSourceRefs: sources.getPersonSourceRefs,
    getSourceDescription: sources.getSourceDescription,
    getMultiSourceDescription: sources.getMultiSourceDescription,
    getCoupleSourceRefs: sources.getCoupleSourceRefs,
    getChildAndParentsSourceRefs: sources.getChildAndParentsSourceRefs,
    getSourceRefsQuery: sources.getSourceRefsQuery,

    // spouses
    getCouple: spouses.getCouple,

    // user
    Agent: user.Agent,
    User: user.User,
    getCurrentUser: user.getCurrentUser,
    getCurrentUserPersonId: user.getCurrentUserPersonId,
    getAgent: user.getAgent,
    getMultiAgent: user.getMultiAgent,

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
