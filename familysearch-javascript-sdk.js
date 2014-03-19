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
  },
  authoritiesServer: {
    'sandbox'   : 'https://sandbox.familysearch.org',
    'staging'   : 'https://stage.familysearch.org',
    'production': 'https://api.familysearch.org'
  },
  discoveryUrl: '/.well-known/app-meta'
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

  // Object.getPrototypeOf polyfill
  // copied from http://ejohn.org/blog/objectgetprototypeof/
  if (typeof Object.getPrototypeOf !== 'function') {
    /* jshint camelcase:false,proto:true */
    Object.getPrototypeOf = (typeof ''.__proto__ === 'object') ?
      function(object) { return object.__proto__; } :
      // May break if the constructor has been tampered with
      function(object) { return object.constructor.prototype; };
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
   * borrowed from http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
   * @param {*} value to test
   * @returns {boolean}
   */
  exports.isNumeric = function(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
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

  // return true if all corresponding object properties match
  function templateMatches(template, obj) {
    for (var key in template) {
      if (template.hasOwnProperty(key) && obj[key] !== template[key]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Simplified version of underscore's filter
   * @param {Array|Object} arr Array or object to iterate over
   * @param {Object|function(elm)} objOrFn if object, return matching objects; otherwise return objects where function(obj) returns true
   * @param {Object=} context Object for this
   * @returns {Array} Filtered array
   */
  exports.filter = function(arr, objOrFn, context) {
    var result = [];
    var isFn = exports.isFunction(objOrFn);
    forEach(arr, function(elm) {
      if (isFn ? objOrFn.call(context, elm) : templateMatches(objOrFn, elm)) {
        result.push(elm);
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
   * simplified version of underscore's indexOf
   * @param {Array} arr array to search
   * @param {*} item item to find
   * @returns {number} position of item in array or -1 if not found
   */
  exports.indexOf = function(arr, item) {
    if (Array.prototype.indexOf === arr.indexOf) {
      return arr.indexOf(item);
    }
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i] === item) {
        return i;
      }
    }
    return -1;
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
        if (isFn ? objOrFn.call(context, elm) : templateMatches(objOrFn, elm)) {
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
   * remove all properties of an object
   * @param {Object} obj object to delete properties from
   */
  exports.deleteProperties = function(obj) {
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        delete obj[attr];
      }
    }
  };

  /**
   * clone with a filter function to limit which fields are cloned
   * borowed from http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
   * doesn't handle cyclic objects, functions, may not handle regex's
   * @param {Object} obj Object to clone
   * @param {Function=} filter Function(key) returns true to clone the field; all fields are cloned if omitted
   * @returns {Object} cloned object
   */
  exports.clonePartial = function(obj, filter) {
    var copy;
    // Handle the 3 simple types, and null or undefined
    if (null == obj || 'object' !== typeof(obj)) {
      return obj;
    }

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        if (!filter || filter(i)) {
          copy.push(exports.clonePartial(obj[i], filter));
        }
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      // set the constructor on the cloned object
      copy = Object.create(Object.getPrototypeOf(obj));
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr) && (!filter || filter(attr))) {
          copy[attr] = exports.clonePartial(obj[attr], filter);
        }
      }
      return copy;
    }

    throw new Error('Unable to copy obj');
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
   * @param {Object|function(Object)} extensions object or a function that takes the object and extension point and returns an extensions object
   * @param {function(Object)=} extensionPointGetter Optional function that returns (sub)objects to extend
   * @return {function(Object)} The extender function
   */
  exports.objectExtender = function(extensions, extensionPointGetter) {
    return function(obj) {
      if (obj) {
        if (extensionPointGetter) {
          forEach(extensionPointGetter(obj), function(extensionPoint) {
            exports.extend(extensionPoint, exports.isFunction(extensions) ? extensions(obj, extensionPoint) : extensions);
          });
        }
        else {
          exports.extend(obj, exports.isFunction(extensions) ? extensions(obj, obj) : extensions);
        }
      }
      return obj;
    };
  };

  /**
   * Return a function that takes an object and returns an object with the same properties but with the constructor function's prototype
   * @param {function()} constructorFunction Create new objects with this constructor
   * @param {string=} attr if passed in, the constructor function will be applied to (each) element of object[attr] instead of the object itself
   * @param {function(Object)=} subObjectGenerator Function that takes an object and returns a set of sub-objects (or a single sub-object);
   * if passed in, the constructor function will be applied to sub-object[attr] for each sub-object returned by subObjectGenerator
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
   * Chain multiple http promises so the http functions (e.g., getResponseHeader) from the last promise are available in the returned promise
   * Pass an initial promise and one or more http-promise-generating functions to chain
   * @returns {Object} promise with http functions
   */
  exports.chainHttpPromises = function() {
    var promise = arguments[0];
    var bridge = {}; // bridge object is needed because the "then" function is executed immediately in unit tests
    forEach(Array.prototype.slice.call(arguments, 1), function(fn) {
      promise = promise.then(function() {
        var result = fn.apply(null, arguments);
        if (result && result.then) {
          // the bridge object is extended with the functions from each promise-generating function,
          // but the final functions will be those from the last promise-generating function
          exports.extendHttpPromise(bridge, result);
        }
        return result;
      });
    });
    // the returned promise will call into the bridge object for the http functions
    exports.extendHttpPromise(promise, bridge);
    return promise;
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
  exports.getResponseEntityId = function(data, promise) {
    return promise.getResponseHeader('X-ENTITY-ID');
  };

  /**
   * Response mapper that returns the location header
   * @param data ignored
   * @param promise http promise
   * @returns {string} the location response header
   */
  exports.getResponseLocation = function(data, promise) {
    return exports.removeAccessToken(promise.getResponseHeader('Location'));
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
   * Return true if url starts with https?://
   * @param {string} url
   * @returns {boolean} true if url starts with https?://
   */
  exports.isAbsoluteUrl = function(url) {
    return (/^https?:\/\//).test(url);
  };

  /**
   * Prepend server onto path if path does not start with https?://
   * @param {string} server
   * @param {string} path
   * @returns {string} server + path
   */
  function getAbsoluteUrl(server, path) {
    if (!exports.isAbsoluteUrl(path)) {
      return server + (path.charAt(0) !== '/' ? '/' : '') + path;
    }
    else {
      return path;
    }
  }

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
   * Return true if this url is for the Authorities server
   * @param url
   * @returns {boolean}
   */
  exports.isAuthoritiesServerUrl = function(url) {
    return url.indexOf('/authorities/v1/') !== -1;
  };

  /**
   * Prepend authorities server to path if path doesn't start with https?://
   * @param path
   * @returns {string} server + path
   */
  exports.getAuthoritiesServerUrl = function(path) {
    return getAbsoluteUrl(globals.authoritiesServer[globals.environment], path);
  };

  /**
   * Create a URL-encoded query string from an object
   * @param {Object} params Parameters
   * @returns {string} URL-encoded string
   */
  exports.encodeQueryString = function(params) {
    var arr = [];
    forEach(params, function(value, key) {
      var param = encodeURIComponent(key);
      if (value != null) { // catches null and undefined
        param += '=' + encodeURIComponent(value);
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
  exports.appendQueryParameters = function(url, params) {
    var queryString = exports.encodeQueryString(params);
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
  exports.decodeQueryString = function(url) {
    var obj = {};
    if (url) {
      var pos = url.indexOf('?');
      if (pos !== -1) {
        var segments = url.substring(pos+1).split('&');
        forEach(segments, function(segment) {
          var kv = segment.split('=', 2);
          if (kv && kv[0]) {
            obj[decodeURIComponent(kv[0])] = (kv[1] != null ? decodeURIComponent(kv[1]) : kv[1]); // catches null and undefined
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
  exports.removeQueryString = function(url) {
    if (url) {
      var pos = url.indexOf('?');
      if (pos !== -1) {
        url = url.substring(0, pos);
      }
    }
    return url;
  };

  /**
   * Append the access token to the url
   * @param {string} url url
   * @returns {string} url with access token
   */
  exports.appendAccessToken = function(url) {
    if (url) {
      var params = exports.decodeQueryString(url);
      url = exports.removeQueryString(url);
      params['access_token'] = globals.accessToken;
      url = exports.appendQueryParameters(url, params);
    }
    return url;
  };

  /**
   * Remove the access token from the url
   * @param {string} url url
   * @returns {string} url without access token
   */
  exports.removeAccessToken = function(url) {
    if (url) {
      var params = exports.decodeQueryString(url);
      url = exports.removeQueryString(url);
      delete params['access_token'];
      url = exports.appendQueryParameters(url, params);
    }
    return url;
  };

  /**
   * Populate template with uri-encoded parameters
   * @param {string} template template with {param}'s to replace; e.g., /platform/tree/persons/{pid}/source-references/{srid}
   * @param {Object} params parameters; e.g., {pid: 'X', srid: 'Y'}
   * @returns {string} populated template
   */
  exports.populateUriTemplate = function(template, params) {
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
  exports.getUrlFromDiscoveryResource = function(discoveryResource, resourceName, params) {
    var url = '';
    var resource = discoveryResource.links[resourceName];
    if (resource['href']) {
      url = exports.removeAccessToken(resource['href']);
    }
    else if (resource['template']) {
      var template = resource['template'].replace(/{\?[^}]*}/,''); // we will add query parameters later
      url = exports.populateUriTemplate(template, params || {});
    }
    return url;
  };

  /**
   * return true if no attribution or attribution without a change message or an existing attribution
   * @param {Object} conclusion name or fact or gender - anything with an attribution
   * @returns {boolean}
   */
  exports.attributionNeeded = function(conclusion) {
    return !!(!conclusion.attribution || !conclusion.attribution.changeMessage || conclusion.attribution.contributor);
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
      if (config.headers['Content-Type'] === 'multipart/form-data') {
        config.headers['Content-Type'] = void 0;
      }

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
      if (opts.headers['Content-Type'] === 'multipart/form-data') {
        opts.contentType = false;
        delete opts.headers['Content-Type'];
      }

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
   * @name plumbing.functions:getUrl
   * @function
   *
   * @description
   * Low-level call to get a  URL from the discovery resource given a resource name, an possible-url, and a set of parameters
   *
   * @param {string} resourceName resource name
   * @param {string=} possibleUrl possible url - return this if it is an absolute url
   * @param {Object=} params parameters
   * @return {Object} promise for the url
   */
  exports.getUrl = function(resourceName, possibleUrl, params) {
    return globals.discoveryPromise.then(function(discoveryResource) {
      var url = '';

      if (helpers.isAbsoluteUrl(possibleUrl)) {
        url = possibleUrl;
      }
      else {
        url = helpers.getUrlFromDiscoveryResource(discoveryResource, resourceName, params);
      }
      return url;
    });
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
      helpers.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers),
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
      helpers.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers),
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
    return exports.http('DELETE',
      url,
      helpers.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers),
      null,
      opts,
      responseMapper);
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
    if (!globals.accessToken &&
        globals.autoSignin &&
        !helpers.isOAuthServerUrl(absoluteUrl) &&
        url !== globals.discoveryUrl) {
      accessTokenPromise = globals.getAccessToken();
    }
    else {
      accessTokenPromise = helpers.refPromise(globals.accessToken);
    }
    accessTokenPromise.then(function() {
      // append the access token as a query parameter to avoid cors pre-flight
      // this is detrimental to browser caching across sessions, which seems less bad than cors pre-flight requests
      var accessTokenName = helpers.isAuthoritiesServerUrl(absoluteUrl) ? 'sessionId' : 'access_token';
      if (globals.accessToken && absoluteUrl.indexOf(accessTokenName+'=') === -1) {
        var accessTokenParam = {};
        accessTokenParam[accessTokenName] = globals.accessToken;
        absoluteUrl = helpers.appendQueryParameters(absoluteUrl, accessTokenParam);
      }

      // default retries
      if (retries == null) { // also catches undefined
        retries = globals.maxHttpRequestRetries;
      }

      // remove $... and _... attrs from data
      if (data) {
        data = helpers.clonePartial(data, function(key) {
          return (!(helpers.isString(key) && (key.charAt(0) === '$' || key.charAt(0) === '_')));
        });
      }

      // call the http wrapper
      var promise = globals.httpWrapper(method,
        absoluteUrl,
        headers,
        transformData(data, headers['Content-Type']),
        opts || {});

      // process the response
      helpers.extendHttpPromise(returnedPromise, promise);
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

define('init',[
  'angularjs-wrappers',
  'globals',
  'helpers',
  'jquery-wrappers',
  'plumbing'
], function(angularjsWrappers, globals, helpers, jQueryWrappers, plumbing) {
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

    // request the discovery resource
    globals.discoveryPromise = plumbing.get(globals.discoveryUrl);
    globals.discoveryPromise.then(function(discoveryResource) {
      globals.discoveryResource = discoveryResource;
    });
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
    return plumbing.getUrl('http://oauth.net/core/2.0/endpoint/authorize').then(function(url) {
      var popup = openPopup(url, {
        'response_type' : 'code',
        'client_id'     : globals.appKey,
        'redirect_uri'  : globals.authCallbackUri
      });
      return pollForAuthCode(popup);
    });
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
          plumbing.getUrl('http://oauth.net/core/2.0/endpoint/token').then(function(url) {
            var promise = plumbing.post(url, {
                'grant_type' : 'authorization_code',
                'code'       : authCode,
                'client_id'  : globals.appKey
              },
              {'Content-Type': 'application/x-www-form-urlencoded'}); // access token endpoint says it accepts json but it doesn't
            handleAccessTokenResponse(promise, accessTokenDeferred);
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
    plumbing.getUrl('http://oauth.net/core/2.0/endpoint/token').then(function(url) {
      var promise = plumbing.post(url, {
          'grant_type': 'password',
          'client_id' : globals.appKey,
          'username'  : userName,
          'password'  : password
        },
        {'Content-Type': 'application/x-www-form-urlencoded'}); // access token endpoint says it accepts json but it doesn't
      handleAccessTokenResponse(promise, accessTokenDeferred);
    });
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
    return helpers.chainHttpPromises(
      plumbing.getUrl('http://oauth.net/core/2.0/endpoint/token'),
      function(url) {
        return plumbing.del(url);
      });
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

define('authorities',[
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name authorities
   * @description
   * Functions related to authorities
   *
   * {@link https://familysearch.org/developers/docs/guides/authorities FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date
   * @description
   *
   * Standardized date
   */
  var Date = exports.Date = function() {

  };

  // construct formal date from [about|after|before] [[day] month] year [BC]
  // export for unit testing
  var constructFormalDate = exports.constructFormalDate = function(fields, ignoreModifiers) {
    var prefix = '', suffix = '', day = '', month = '', year, sign = '+';
    var pos = 0;
    // handle modifier
    if (fields[pos] === 'about') {
      if (!ignoreModifiers) {
        prefix = 'A';
      }
      pos++;
    }
    else if (fields[pos] === 'before') {
      if (!ignoreModifiers) {
        prefix = 'A/';
      }
      pos++;
    }
    else if (fields[pos] === 'after') {
      if (!ignoreModifiers) {
        prefix = 'A';
        suffix = '/';
      }
      pos++;
    }
    // handle day (no month names are <= 2 characters)
    if (fields[pos].length <= 2) {
      day = (fields[pos].length === 1 ? '0' : '') + fields[pos];
      pos++;
    }
    // handle month
    var monthNum = ['january','february','march','april','may','june','july','august','september','october','november','december']
      .indexOf(fields[pos]) + 1;
    if (monthNum > 0) {
      month = (monthNum < 10 ? '0' : '') + monthNum.toString();
      pos++;
    }
    // handle year (required)
    year = fields[pos];
    pos++;
    // handle bc
    if (pos < fields.length && fields[pos] === 'bc') {
      sign = '-';
    }
    // construct formal date
    return prefix+sign+year+(month ? '-' : '')+month+(day ? '-' : '')+day+suffix;
  };

  exports.Date.prototype = {
    constructor: Date,

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#normalized
     * @propertyOf authorities.types:constructor.Date
     * @return {string} normalized date
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#earliest
     * @propertyOf authorities.types:constructor.Date
     * @return {Object} information (normalized, numeric, astro) about earliest date in a range
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#latest
     * @propertyOf authorities.types:constructor.Date
     * @return {Object} information (normalized, numeric, astro) about latest date in a range
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#requested
     * @propertyOf authorities.types:constructor.Date
     * @return {string} requested date to standardize
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#original
     * @propertyOf authorities.types:constructor.Date
     * @return {string} original date to standardize
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#ambiguous
     * @propertyOf authorities.types:constructor.Date
     * @return {boolean} true if ambiguous
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#valid
     * @propertyOf authorities.types:constructor.Date
     * @return {boolean} true if valid
     */

    /**
     * @ngdoc function
     * @name authorities.types:constructor.Date#$getFormalDate
     * @methodOf authorities.types:constructor.Date
     * @function
     * @return {string} GEDCOM-X formal date format
     */
    $getFormalDate: function() {
      // as far as I can tell, normalized date appears in one of three formats:
      // [about|after|before] [[day] month] year [BC]
      // from [[day] month] year [BC] to [[day] month] year [BC]
      // [[day] month] year [BC] (/ [[day] month] year [BC])+
      var formalDate = '';
      if (this.normalized) {
        // split into fields
        var fields = this.normalized.trim().toLowerCase().split(' ');
        // GEDCOM-X formal date doesn't allow the third format, so keep just the first date
        var pos = fields.indexOf('/');
        if (pos >= 0) {
          fields = fields.slice(0, pos);
        }
        // handle from <date> to <date>
        if (fields[0] === 'from') {
          pos = fields.indexOf('to');
          // date normalization has a bug where "before 20 Mar 2006 - after 16 dec 2007"
          // is normalized to "from after 20 March 2006 to 16 December 2007"
          // to get around this bug, ignore date modifiers when parsing date-range dates so we return simply "+2006-03-20/+2007-12-16"
          formalDate = constructFormalDate(fields.slice(1,pos), true)+'/'+constructFormalDate(fields.slice(pos+1), true);
        }
        else {
          // handle <date>
          formalDate = constructFormalDate(fields, false);
        }
      }
      return formalDate;
    }
  };

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Place
   * @description
   *
   * Standardized place
   */
  var Place = exports.Place = function() {

  };

  exports.Place.prototype = {
    constructor: Place,

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#official
     * @propertyOf authorities.types:constructor.Place
     * @return {string} normalized place name; e.g., Minnesota
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#normalized
     * @propertyOf authorities.types:constructor.Place
     * @return {string[]} array of fully-normalized place names; e.g., ["Minnesota, United States"]
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#original
     * @propertyOf authorities.types:constructor.Place
     * @return {string} original place to standardize
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#id
     * @propertyOf authorities.types:constructor.Place
     * @return {string} place id
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#requestedId
     * @propertyOf authorities.types:constructor.Place
     * @return {string} no idea
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#type
     * @propertyOf authorities.types:constructor.Place
     * @return {string} type of the place; e.g., First-Order Administrative Division
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#culture
     * @propertyOf authorities.types:constructor.Place
     * @return {string} id of the culture
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#iso
     * @propertyOf authorities.types:constructor.Place
     * @return {string} ISO place id; e.g., US-MN
     */

    /**
     * @ngdoc function
     * @name authorities.types:constructor.Date#$getNormalizedPlace
     * @methodOf authorities.types:constructor.Place
     * @function
     * @return {string} convenience function to return the first element of the normalized array
     */
    $getNormalizedPlace: function() {
      return maybe(this.normalized)[0];
    }
  };

  /**
   * @ngdoc function
   * @name authorities.functions:getDate
   * @function
   *
   * @description
   * Get the standardized date
   *
   * - `getDate()` - get the {@link authorities.types:constructor.Date Date} from the response
   *
   * {@link https://familysearch.org/developers/docs/guides/authorities/date-authority FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/4ab5M/ editable example}
   *
   * @param {String} date text to standardize
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getDate = function(date, opts) {
    var params = {
      date: date,
      dataFormat: 'application/json'
    };
    return plumbing.get(helpers.getAuthoritiesServerUrl('/authorities/v1/date'), params, {'Accept': 'application/json'}, opts,
      helpers.compose(
        helpers.objectExtender({getDate: function() { return maybe(maybe(this.dates).date)[0]; }}),
        helpers.constructorSetter(Date, 'date', function(response) {
          return response.dates;
        })
      ));
  };

  /**
   * @ngdoc function
   * @name authorities.functions:getPlace
   * @function
   *
   * @description
   * Get the standardized place
   *
   * - `getPlaces()` - get the array of {@link authorities.types:constructor.Place Places} from the response
   *
   * {@link https://familysearch.org/developers/docs/guides/authorities/place-authority FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/xrsAQ/ editable example}
   *
   * @param {String} place text to standardize
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPlace = function(place, opts) {
    var params = {
      place: place,
      view: 'simple',
      dataFormat: 'application/json'
    };
    return plumbing.get(helpers.getAuthoritiesServerUrl('/authorities/v1/place'), params, {'Accept': 'application/json'}, opts,
      helpers.compose(
        helpers.objectExtender({getPlaces: function() { return maybe(this.places).place; }}),
        helpers.constructorSetter(Place, 'place', function(response) {
          return response.places;
        })
      ));
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
   * @name user.types:constructor.User
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
     * @name user.types:constructor.User#id
     * @propertyOf user.types:constructor.User
     * @return {String} Id of the user
     */

    /**
     * @ngdoc property
     * @name user.types:constructor.User#contactName
     * @propertyOf user.types:constructor.User
     * @return {String} contact name of the user
     */

    /**
     * @ngdoc property
     * @name user.types:constructor.User#fullName
     * @propertyOf user.types:constructor.User
     * @return {String} full name of the user
     */

    /**
     * @ngdoc property
     * @name user.types:constructor.User#email
     * @propertyOf user.types:constructor.User
     * @return {String} email of the user
     */

    /**
     * @ngdoc property
     * @name user.types:constructor.User#treeUserId
     * @propertyOf user.types:constructor.User
     * @return {String} agent (contributor) id of the user
     */
  };

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent
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
     * @name user.types:constructor.Agent#id
     * @propertyOf user.types:constructor.Agent
     * @return {String} Id of the agent
     */

    /**
     * @ngdoc function
     * @name user.types:constructor.Agent#$getName
     * @methodOf user.types:constructor.Agent
     * @function
     * @return {String} name of the agent
     */
    $getName:        function() { return maybe(maybe(this.names)[0]).value; },

    /**
     * @ngdoc function
     * @name user.types:constructor.Agent#$getAccountName
     * @methodOf user.types:constructor.Agent
     * @function
     * @return {String} account / contact name of the agent
     */
    $getAccountName: function() { return maybe(maybe(this.accounts)[0]).accountName; },

    /**
     * @ngdoc function
     * @name user.types:constructor.Agent#$getEmail
     * @methodOf user.types:constructor.Agent
     * @function
     * @return {String} email of the agent
     */
    $getEmail:       function() {
      var email = maybe(maybe(this.emails)[0]).resource;
      return email ? email.replace(/^mailto:/,'') : email;
    }
  };

  /**
   * @ngdoc function
   * @name user.functions:getCurrentUser
   * @function
   *
   * @description
   * Get the current user with the following convenience function
   *
   * - `getUser()` - get the {@link user.types:constructor.User User} from the response
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
    return helpers.chainHttpPromises(
      plumbing.getUrl('current-user'),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getUser: function() { return maybe(this.users)[0]; }}),
            helpers.constructorSetter(User, 'users')
          ));
      });
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
    return plumbing.getUrl('current-user-person').then(function(url) {
      // pass in .json suffix to force the the accept-header-less redirect to return a json response that we can parse
      // however, since .json this isn't a _versioned_ accept header, don't trust it too much
      // just get the id field and hand it back
      return plumbing.get(url+'.json', params, {}, opts).then(function(response) {
        return maybe(maybe(maybe(response).persons)[0]).id;
      });
    });
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
   * - `getAgent()` - get the {@link user.types:constructor.Agent Agent} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/BpT8c/ editable example}
   *
   * @param {String} aid id or full URL of the agent (contributor)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   */
  exports.getAgent = function(aid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('agent-template', aid, {uid: aid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getAgent: function() { return maybe(this.agents)[0]; }}),
            helpers.constructorSetter(Agent, 'agents')
          ));
      });
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
   * @param {Array} aids Ids or full URLs of the agents (contributors) to read
   * @param {Object=} params pass to getAgent currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the agents have been read,
   * returning a map of agent id to {@link user.functions:getAgent getAgent} response
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

define('changeHistory',[
  'helpers',
  'plumbing',
  'user'
], function(helpers, plumbing, user) {
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
   * @name changeHistory.types:constructor.Change
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
     * @name changeHistory.types:constructor.Change#id
     * @propertyOf changeHistory.types:constructor.Change
     * @return {String} Id of the change
     */

    /**
     * @ngdoc property
     * @name changeHistory.types:constructor.Change#title
     * @propertyOf changeHistory.types:constructor.Change
     * @return {String} title of the change
     */

    /**
     * @ngdoc property
     * @name changeHistory.types:constructor.Change#updated
     * @propertyOf changeHistory.types:constructor.Change
     * @return {Number} timestamp
     */

    /**
     * @ngdoc function
     * @name changeHistory.types:constructor.Change#$getAgentName
     * @methodOf changeHistory.types:constructor.Change
     * @function
     * @return {String} agent (contributor) name
     */
    $getAgentName: function() { return maybe(maybe(this.contributors)[0]).name; },

    /**
     * @ngdoc function
     * @name changeHistory.types:constructor.Change#$getChangeReason
     * @methodOf changeHistory.types:constructor.Change
     * @function
     * @return {String} reason for the change
     */
    $getChangeReason: function() { return maybe(maybe(this.changeInfo)[0]).reason; },

    // TODO check for agent id

    /**
     * @ngdoc function
     * @name changeHistory.types:constructor.Change#$getAgentUrl
     * @methodOf changeHistory.types:constructor.Change
     * @function
     * @return {String} URL of the agent - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentUrl: function() { return helpers.removeAccessToken(this.links.agent.href); },

    /**
     * @ngdoc function
     * @name changeHistory.types:constructor.Change#$getAgent
     * @methodOf changeHistory.types:constructor.Change
     * @function
     * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
     */
    $getAgent: function() { return user.getAgent(this.$getAgentUrl()); }
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
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/6SqTH/ editable example}
   *
   * @param {String} pid id of the person or full URL of the person changes endpoint
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonChanges = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-changes-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          changeHistoryResponseMapper);
      });
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
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/Uk6HA/ editable example}
   *
   * @param {String} caprid id of the child and parents relationship or full URL of the child and parents relationship changes endpoint
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsChanges = function(caprid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-changes-template', caprid, {caprid: caprid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          changeHistoryResponseMapper);
      });
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
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/csG9t/ editable example}
   *
   * @param {String} crid id of the couple relationship to read or full URL of the couple relationship changes endpoint
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleChanges = function(crid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-changes-template', crid, {crid: crid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          changeHistoryResponseMapper);
      });
  };

  return exports;
});

define('discussions',[
  'helpers',
  'plumbing',
  'user'
], function(helpers, plumbing, user) {
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

  /**********************************/
  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion
   * @description
   *
   * Discussion
   **********************************/

  var Discussion = exports.Discussion = function() {

  };

  exports.Discussion.prototype = {
    constructor: Discussion,
    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#id
     * @propertyOf discussions.types:constructor.Discussion
     * @return {String} Id of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#title
     * @propertyOf discussions.types:constructor.Discussion
     * @return {String} title of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#details
     * @propertyOf discussions.types:constructor.Discussion
     * @return {String} description / text of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#created
     * @propertyOf discussions.types:constructor.Discussion
     * @return {Number} timestamp
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#modified
     * @propertyOf discussions.types:constructor.Discussion
     * @return {Number} timestamp
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#numberOfComments
     * @propertyOf discussions.types:constructor.Discussion
     * @return {Number} number of comments
     */

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getCommentsUrl
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {String} URL of the comments endpoint - pass into {@link discussions.functions:getComments getComments} for details
     */
    $getCommentsUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).comments).href); },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getComments
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {Object} promise for the {@link discussions.functions:getComments getComments} response
     */
    $getComments: function() { return exports.getComments(this.$getCommentsUrl()); },

    // TODO check for familysearch fixing the resource and resourceId fields to be the agent id, not the user id

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getAgentId
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {String}  __BROKEN__ id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentId: function() { return maybe(this.contributor).resourceId; },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getAgentUrl
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {String} __BROKEN__ URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentUrl: function() { return helpers.removeAccessToken(maybe(this.contributor).resource); },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getAgent
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {Object} __BROKEN__ promise for the {@link user.functions:getAgent getAgent} response
     */
    $getAgent: function() { return user.getAgent(this.$getAgentUrl()); }
  };

  /**********************************/
  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef
   * @description
   *
   * Reference to a discussion on a person
   **********************************/

  var DiscussionRef = exports.DiscussionRef = function() {

  };

  exports.DiscussionRef.prototype = {
    constructor: DiscussionRef,
    // TODO look for resourceId property if it becomes available - this is the discussion id

    /**
     * @ngdoc property
     * @name discussions.types:constructor.DiscussionRef#$personId
     * @propertyOf discussions.types:constructor.DiscussionRef
     * @return {String} Id of the person to whom this discussion is attached
     */

    /**
     * @ngdoc function
     * @name discussions.types:constructor.DiscussionRef#$getDiscussionUrl
     * @methodOf discussions.types:constructor.DiscussionRef
     * @function
     * @return {string} URL of the discussion - pass into {@link discussions.functions:getDiscussion getDiscussion} for details
     */
    $getDiscussionUrl: function() {
      return helpers.removeAccessToken(this.resource);
    },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.DiscussionRef#$getDiscussion
     * @methodOf discussions.types:constructor.DiscussionRef
     * @function
     * @return {Object} promise for the {@link discussions.functions:getDiscussion getDiscussion} response
     */
    $getDiscussion: function() {
      return exports.getDiscussion(this.$getDiscussionUrl());
    }
  };

  /**********************************/
  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment
   * @description
   *
   * Comment on a discussion
   **********************************/

  var Comment = exports.Comment = function() {

  };

  exports.Comment.prototype = {
    constructor: Comment,
    /**
     * @ngdoc property
     * @name discussions.types:constructor.Comment#id
     * @propertyOf discussions.types:constructor.Comment
     * @return {String} Id of the comment
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Comment#text
     * @propertyOf discussions.types:constructor.Comment
     * @return {String} text of the comment
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Comment#created
     * @propertyOf discussions.types:constructor.Comment
     * @return {Number} timestamp
     */

    // TODO check for familysearch fixing the resource and resourceId fields to be the agent id, not the user id

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Comment#$discussionId
     * @propertyOf discussions.types:constructor.Comment
     * @return {String} Id of the discussion if this is a discussion comment
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Comment#$memoryId
     * @propertyOf discussions.types:constructor.Comment
     * @return {String} Id of the memory if this is a memory comment
     */

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$getAgentId
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @return {String}  __BROKEN__ id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentId: function() { return maybe(this.contributor).resourceId; },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$getAgentUrl
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @return {String} __BROKEN__ URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentUrl: function() { return helpers.removeAccessToken(maybe(this.contributor).resource); },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$getAgent
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @return {Object} __BROKEN__ promise for the {@link user.functions:getAgent getAgent} response
     */
    $getAgent: function() { return user.getAgent(this.$getAgentUrl()); }
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
   * - `getDiscussion()` - get the {@link discussions.types:constructor.Discussion Discussion} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/FzWSu/ editable example}
   *
   * @param {String} did id or full URL of the discussion to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getDiscussion = function(did, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('discussion-template', did, {did: did}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getDiscussion: function() {
              return maybe(maybe(this).discussions)[0];
            }}),
            helpers.constructorSetter(Discussion, 'discussions')
          ));
      });
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
   * @param {string[]|DiscussionRef[]} dids id's, full URLs, or {@link discussions.types:constructor.DiscussionRef DiscussionRefs} of the discussions
   * @param {Object=} params pass to getDiscussion currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the discussions have been read,
   * returning a map of discussion id or URL to {@link discussions.functions:getDiscussion getDiscussion} response
   */
  exports.getMultiDiscussion = function(dids, params, opts) {
    var promises = {};
    helpers.forEach(dids, function(did) {
      var key, url;
      if (did instanceof DiscussionRef) {
        url = did.$getDiscussionUrl();
        // TODO use resourceId when it becomes available
        key = url;
      }
      else {
        url = did;
        key = did;
      }
      promises[key] = exports.getDiscussion(url, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name discussions.functions:getPersonDiscussionRefs
   * @function
   *
   * @description
   * Get references to discussions for a person
   * The response includes the following convenience function
   *
   * - `getDiscussionRefs()` - get an array of {@link discussions.types:constructor.DiscussionRef DiscussionRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/kd39K/ editable example}
   *
   * @param {String} pid id of the person to read or full URL of the person-discussion-references endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonDiscussionRefs = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-discussion-references-template', pid, {pid: pid}),
      function(url) {
        // TODO remove discussion-reference-json-fix header when it becomes standard
        return plumbing.get(url, params,
          {'Accept': 'application/x-fs-v1+json', 'X-FS-Feature-Tag': 'discussion-reference-json-fix'}, opts,
          helpers.compose(
            helpers.objectExtender({getDiscussionRefs: function() {
              return maybe(maybe(maybe(this).persons)[0])['discussion-references'] || [];
            }}),
            helpers.constructorSetter(DiscussionRef, 'discussion-references', function(response) {
              return maybe(maybe(response).persons)[0];
            }),
            helpers.objectExtender(function(response) {
              return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).persons)[0])['discussion-references'];
            })
          ));
      });
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
   * - `getComments()` - get an array of {@link discussions.types:constructor.Comment Comments} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Comments_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/b56hz/ editable example}
   *
   * @param {String} did of the discussion or full URL of the discussion-comments endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getComments = function(did, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('discussion-comments-template', did, {did: did}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getComments: function() {
              return maybe(maybe(maybe(this).discussions)[0]).comments || [];
            }}),
            helpers.constructorSetter(Comment, 'comments', function(response) {
              return maybe(maybe(response).discussions)[0];
            }),
            helpers.objectExtender(function(response) {
              return { $discussionId: maybe(maybe(maybe(response).discussions)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).discussions)[0])['comments'];
            })
          ));
      });
  };

  return exports;
});

define('attribution',[
  'helpers',
  'plumbing',
  'user'
], function(helpers, plumbing, user) {
  /**
   * @ngdoc overview
   * @name attribution
   * @description
   * Functions related to an attribution object
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution
   * @description
   *
   * Attribution
   * @param {String=} changeMessage change message
   */
  var Attribution = exports.Attribution = function(changeMessage) {
    if (changeMessage) {
      this.changeMessage = changeMessage;
    }
  };

  exports.Attribution.prototype = {
    constructor: Attribution,
    /**
     * @ngdoc property
     * @name attribution.types:constructor.Attribution#modified
     * @propertyOf attribution.types:constructor.Attribution
     * @return {number} timestamp
     */

    /**
     * @ngdoc property
     * @name attribution.types:constructor.Attribution#changeMessage
     * @propertyOf attribution.types:constructor.Attribution
     * @return {string} change message
     */

    /**
     * @ngdoc function
     * @name attribution.types:constructor.Attribution#$getAgentId
     * @methodOf attribution.types:constructor.Attribution
     * @function
     * @return {String} id of the agent (contributor) - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentId: function() { return maybe(this.contributor).resourceId; },

    /**
     * @ngdoc function
     * @name attribution.types:constructor.Attribution#$getAgentUrl
     * @methodOf attribution.types:constructor.Attribution
     * @function
     * @return {String} URL of the agent (contributor) - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentUrl: function() { return helpers.removeAccessToken(maybe(this.contributor).resource); },

    /**
     * @ngdoc function
     * @name attribution.types:constructor.Attribution#$getAgent
     * @methodOf attribution.types:constructor.Attribution
     * @function
     * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
     */
    $getAgent: function() { return user.getAgent(this.$getAgentUrl()); }
  };

  return exports;
});

define('fact',[
  'attribution',
  'authorities',
  'helpers'
], function(attribution, authorities, helpers) {
  /**
   * @ngdoc overview
   * @name fact
   * @description
   * Fact
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**********************************/
  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact
   * @description
   *
   * Fact
   * @param {Object=} value with optional attributes
   * {type, date, formalDate, place, normalizedPlace, changeMessage}
   **********************************/

  var Fact = exports.Fact = function(value) {
    if (value) {
      if (value.type) {
        //noinspection JSUnresolvedFunction
        this.$setType(value.type);
      }
      if (value.date) {
        //noinspection JSUnresolvedFunction
        this.$setDate(value.date);
      }
      if (value.formalDate) {
        //noinspection JSUnresolvedFunction
        this.$setFormalDate(value.formalDate);
      }
      if (value.place) {
        //noinspection JSUnresolvedFunction
        this.$setPlace(value.place);
      }
      if (value.normalizedPlace) {
        //noinspection JSUnresolvedFunction
        this.$setNormalizedPlace(value.normalizedPlace);
      }
      if (value.changeMessage) {
        //noinspection JSUnresolvedFunction
        this.$setChangeMessage(value.changeMessage);
      }
    }
  };

  exports.Fact.prototype = {
    constructor: Fact,
    /**
     * @ngdoc property
     * @name fact.types:constructor.Fact#id
     * @propertyOf fact.types:constructor.Fact
     * @return {String} Id of the name
     */

    /**
     * @ngdoc property
     * @name fact.types:constructor.Fact#type
     * @propertyOf fact.types:constructor.Fact
     * @return {String} http://gedcomx.org/Birth, etc.
     */

    /**
     * @ngdoc property
     * @name fact.types:constructor.Fact#attribution
     * @propertyOf fact.types:constructor.Fact
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$getDate
     * @methodOf fact.types:constructor.Fact
     * @function
     * @return {String} original date
     */
    $getDate: function() { return maybe(this.date).original; },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$getFormalDate
     * @methodOf fact.types:constructor.Fact
     * @function
     * @return {String} date in gedcomx format; e.g., +1836-04-13
     */
    $getFormalDate: function() { return maybe(this.date).formal; },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$getPlace
     * @methodOf fact.types:constructor.Fact
     * @function
     * @return {String} event place
     */
    $getPlace: function() { return maybe(this.place).original; },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$getNormalizedPlace
     * @methodOf fact.types:constructor.Fact
     * @function
     * @return {String} normalized place text
     */
    $getNormalizedPlace: function() { return maybe(maybe(maybe(this.place).normalized)[0]).value; },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$getNormalizedPlaceId
     * @methodOf fact.types:constructor.Fact
     * @function
     * @return {String} normalized place id
     */
    $getNormalizedPlaceId: function() {
      var desc = maybe(this.place).description;
      return (desc && desc.charAt(0) === '#') ? desc.substr(1) : '';
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setType
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the fact type
     * @param {String} type e.g., http://gedcomx.org/Birth
     * @return {Fact} this fact
     */
    $setType: function(type) {
      this.$changed = true;
      this.type = type;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setDate
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the fact date
     * @param {String|Object|Date} date either a date string as written by the user, or {date, formalDate},
     * or a {@link authorities.types:constructor.Date Date} object
     * @return {Fact} this fact
     */
    $setDate: function(date) {
      this.$changed = true;
      if (!this.date) {
        this.date = {};
      }
      if (helpers.isString(date)) {
        this.date.original = date;
      }
      else if (date instanceof authorities.Date) {
        this.date.original = date.original;
        //noinspection JSUnresolvedFunction
        this.$setFormalDate(date.$getFormalDate());
      }
      else if (helpers.isObject(date)) {
        this.date.original = date.date;
        this.$setFormalDate(date.formalDate);
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setFormalDate
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the formal date
     * @param {String} formalDate from the date authority; e.g., +1836-04-06
     * @return {Fact} this fact
     */
    $setFormalDate: function(formalDate) {
      this.$changed = true;
      if (!this.date) {
        this.date = {};
      }
      this.date.formal = formalDate;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setPlace
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the place
     * @param {String|Object|Date} place either a place string as written by the user, or {place, normalizedPlace},
     * or a {@link authorities.types:constructor.Place Place} object
     * @return {Fact} this fact
     */
    $setPlace: function(place) {
      this.$changed = true;
      if (!this.place) {
        this.place = {};
      }
      if (helpers.isString(place)) {
        this.place.original = place;
      }
      else if (place instanceof authorities.Place) {
        this.place.original = place.original;
        //noinspection JSUnresolvedFunction
        this.$setNormalizedPlace(place.$getNormalizedPlace());
      }
      else if (helpers.isObject(place)) {
        this.place.original = place.place;
        this.$setNormalizedPlace(place.normalizedPlace);
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setNormalizedPlace
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the standard place text
     * @param {String} normalizedPlace from the place authority
     * @return {Fact} this fact
     */
    $setNormalizedPlace: function(normalizedPlace) {
      this.$changed = true;
      if (!this.place) {
        this.place = {};
      }
      this.place.normalized = [{ value: normalizedPlace }];
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setChangeMessage
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the changeMessage used to update the fact
     * @param {String} changeMessage change message
     * @return {Fact} this fact
     */
    $setChangeMessage: function(changeMessage) {
      this.attribution = new attribution.Attribution(changeMessage);
      //noinspection JSValidateTypes
      return this;
    }
  };

  return exports;
});

define('name',[
  'attribution',
  'helpers'
], function(attribution, helpers) {
  /**
   * @ngdoc overview
   * @name name
   * @description
   * Name
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**********************************/
  /**
   * @ngdoc function
   * @name name.types:constructor.Name
   * @description
   *
   * Name
   *
   * @param {Object|String=} value either a fullText string or an object with optional attributes
   * {type, givenName, surname, prefix, suffix, fullText, preferred, changeMessage}
   **********************************/

  var Name = exports.Name = function(value) {
    if (value) {
      if (helpers.isString(value)) {
        //noinspection JSUnresolvedFunction
        this.$setFullText(value);
      }
      else {
        if (value.type) {
          //noinspection JSUnresolvedFunction
          this.$setType(value.type);
        }
        if (value.givenName) {
          //noinspection JSUnresolvedFunction
          this.$setGivenName(value.givenName);
        }
        if (value.surname) {
          //noinspection JSUnresolvedFunction
          this.$setSurname(value.surname);
        }
        if (value.prefix) {
          //noinspection JSUnresolvedFunction
          this.$setPrefix(value.prefix);
        }
        if (value.suffix) {
          //noinspection JSUnresolvedFunction
          this.$setSuffix(value.suffix);
        }
        if (value.fullText) {
          //noinspection JSUnresolvedFunction
          this.$setFullText(value.fullText);
        }
        //noinspection JSUnresolvedFunction
        this.$setPreferred(!!value.preferred);
        if (value.changeMessage) {
          //noinspection JSUnresolvedFunction
          this.$setChangeMessage(value.changeMessage);
        }
      }
    }
  };

  // return the i'th name form; add it if it doesn't exist
  function ensureNameForm(name, i) {
    var pos = i || 0; // just to be clear
    if (!helpers.isArray(name.nameForms)) {
      name.nameForms = [];
    }
    while (pos >= name.nameForms.length) {
      name.nameForms.push({});
    }
    return name.nameForms[pos];
  }

  exports.Name.prototype = {
    constructor: Name,
    /**
     * @ngdoc property
     * @name name.types:constructor.Name#id
     * @propertyOf name.types:constructor.Name
     * @return {String} Id of the name
     */

    /**
     * @ngdoc property
     * @name name.types:constructor.Name#type
     * @propertyOf name.types:constructor.Name
     * @return {String} http://gedcomx.org/BirthName, etc.
     */

    /**
     * @ngdoc property
     * @name name.types:constructor.Name#preferred
     * @propertyOf name.types:constructor.Name
     * @return {Boolean} true if this name is preferred
     */

    /**
     * @ngdoc property
     * @name name.types:constructor.Name#attribution
     * @propertyOf name.types:constructor.Name
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$getNameFormsCount
     * @methodOf name.types:constructor.Name
     * @function
     * @return {Number} get the number of name forms
     */
    $getNameFormsCount: function() { return this.nameForms ? this.nameForms.length : 0; },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$getFullText
     * @methodOf name.types:constructor.Name
     * @function
     * @param {Number=} i name form to read; defaults to 0
     * @return {String} get the full text of the `i`'th name form
     */
    $getFullText: function(i) { return maybe(maybe(this.nameForms)[i || 0]).fullText; },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$getNamePart
     * @methodOf name.types:constructor.Name
     * @function
     * @description you can call $getGivenName, $getSurname, $getPrefix, or $getSuffix instead of this function
     * @param {String} type http://gedcomx.org/Given or http://gedcomx.org/Surname
     * @param {Number=} i name form to read; defaults to 0
     * @return {String} get the specified part of the `i`'th name form
     */
    $getNamePart: function(type, i) {
      return maybe(helpers.find(maybe(maybe(this.nameForms)[i || 0]).parts, {type: type})).value;
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$getGivenName
     * @methodOf name.types:constructor.Name
     * @function
     * @param {Number=} i name form to read; defaults to 0
     * @return {String} get the given part of the `i`'th name form
     */
    $getGivenName: function(i) {
      return this.$getNamePart('http://gedcomx.org/Given', i);
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$getSurname
     * @methodOf name.types:constructor.Name
     * @function
     * @param {Number=} i name form to read; defaults to 0
     * @return {String} get the surname part of the `i`'th name form
     */
    $getSurname: function(i) {
      return this.$getNamePart('http://gedcomx.org/Surname', i);
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$getPrefix
     * @methodOf name.types:constructor.Name
     * @function
     * @param {Number=} i name form to read; defaults to 0
     * @return {String} get the prefix part of the `i`'th name form
     */
    $getPrefix: function(i) {
      return this.$getNamePart('http://gedcomx.org/Prefix', i);
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$getSuffix
     * @methodOf name.types:constructor.Name
     * @function
     * @param {Number=} i name form to read; defaults to 0
     * @return {String} get the suffix part of the `i`'th name form
     */
    $getSuffix: function(i) {
      return this.$getNamePart('http://gedcomx.org/Suffix', i);
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$setType
     * @methodOf name.types:constructor.Name
     * @function
     * @description sets the $changed flag as well as the value
     * @param {String} type e.g., http://gedcomx.org/BirthName
     * @return {Name} this name
     */
    $setType: function(type) {
      this.$changed = true;
      this.type = type;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$setPreferred
     * @methodOf name.types:constructor.Name
     * @function
     * @description sets the $changed flag as well as the value
     *
     * __NOTE__: the preferred name flag can be set only when the person is initially created; after that it is read-only
     * @param {boolean} isPreferred true if preferred
     * @return {Name} this name
     */
    $setPreferred: function(isPreferred) {
      this.$changed = true;
      this.preferred = isPreferred;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$setFullText
     * @methodOf name.types:constructor.Name
     * @function
     * @description sets the $changed flag as well as the value
     * @param {String} fullText value
     * @param {Number=} i name form to set; defaults to 0
     * @return {Name} this name
     */
    $setFullText: function(fullText, i) {
      this.$changed = true;
      var nameForm = ensureNameForm(this, i);
      nameForm.fullText = fullText;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$setNamePart
     * @methodOf name.types:constructor.Name
     * @function
     * @description sets the $changed flag as well as the value;
     * you can call $setGivenName, $setSurname, $setPrefix, and $setSuffix instead of this function
     * @param {String} name value
     * @param {String} type http://gedcomx.org/Given or http://gedcomx.org/Surname
     * @param {Number=} i name form to set; defaults to 0
     * @return {Name} this name
     */
    $setNamePart: function(name, type, i) {
      this.$changed = true;
      var nameForm = ensureNameForm(this, i);
      if (!helpers.isArray(nameForm.parts)) {
        nameForm.parts = [];
      }
      var part = helpers.find(nameForm.parts, {type: type});
      if (!part) {
        part = {type: type};
        nameForm.parts.push(part);
      }
      part.value = name;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$setGivenName
     * @methodOf name.types:constructor.Name
     * @function
     * @description sets the $changed flag as well as the value
     * @param {String} givenName value
     * @param {Number=} i name form to set; defaults to 0
     * @return {Name} this name
     */
    $setGivenName: function(givenName, i) {
      return this.$setNamePart(givenName, 'http://gedcomx.org/Given', i);
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$setSurname
     * @methodOf name.types:constructor.Name
     * @function
     * @description sets the $changed flag as well as the value
     * @param {String} surname value
     * @param {Number=} i name form to set; defaults to 0
     * @return {Name} this name
     */
    $setSurname: function(surname, i) {
      return this.$setNamePart(surname, 'http://gedcomx.org/Surname', i);
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$setPrefix
     * @methodOf name.types:constructor.Name
     * @function
     * @description sets the $changed flag as well as the value
     * @param {String} prefix value
     * @param {Number=} i name form to set; defaults to 0
     * @return {Name} this name
     */
    $setPrefix: function(prefix, i) {
      return this.$setNamePart(prefix, 'http://gedcomx.org/Prefix', i);
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$setSuffix
     * @methodOf name.types:constructor.Name
     * @function
     * @description sets the $changed flag as well as the value
     * @param {String} suffix value
     * @param {Number=} i name form to set; defaults to 0
     * @return {Name} this name
     */
    $setSuffix: function(suffix, i) {
      return this.$setNamePart(suffix, 'http://gedcomx.org/Suffix', i);
    },

    /**
     * @ngdoc function
     * @name name.types:constructor.Name#$setChangeMessage
     * @methodOf name.types:constructor.Name
     * @function
     * @description sets the changeMessage used to update the name
     * @param {String} changeMessage change message
     * @return {Name} this name
     */
    $setChangeMessage: function(changeMessage) {
      this.attribution = new attribution.Attribution(changeMessage);
      //noinspection JSValidateTypes
      return this;
    }
  };

  return exports;
});

define('memories',[
  'attribution',
  'discussions',
  'globals',
  'helpers',
  'name',
  'plumbing'
], function(attribution, discussions, globals, helpers, name, plumbing) {
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

  /******************************************/
  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory
   * @description
   *
   * Memory
   ******************************************/

  var Memory = exports.Memory = function() {

  };

  exports.Memory.prototype = {
    constructor: Memory,
    /**
     * @ngdoc property
     * @name memories.types:constructor.Memory#id
     * @propertyOf memories.types:constructor.Memory
     * @return {String} Id of the Memory
     */

    /**
     * @ngdoc property
     * @name memories.types:constructor.Memory#mediaType
     * @propertyOf memories.types:constructor.Memory
     * @return {String} media type; e.g., image/jpeg
     */

    /**
     * @ngdoc property
     * @name memories.types:constructor.Memory#resourceType
     * @propertyOf memories.types:constructor.Memory
     * @return {String} resource type; e.g., http://gedcomx.org/DigitalArtifact
     */

    /**
     * @ngdoc property
     * @name memories.types:constructor.Memory#about
     * @propertyOf memories.types:constructor.Memory
     * @return {String} memory artifact URL
     */

    /**
     * @ngdoc property
     * @name memories.types:constructor.Memory#artifactMetadata
     * @propertyOf memories.types:constructor.Memory
     * @return {Object[]} array of { `artifactType`, `filename` }
     */

    /**
     * @ngdoc property
     * @name memories.types:constructor.Memory#attribution
     * @propertyOf memories.types:constructor.Memory
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$getTitle
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} title
     */
    $getTitle: function() { return maybe(maybe(this.titles)[0]).value; },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$getDescription
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} description
     */
    $getDescription: function() { return maybe(maybe(this.description)[0]).value; },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$getIconUrl
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} URL of the icon with access token
     */
    $getIconUrl: function() { return helpers.appendAccessToken(maybe(maybe(this.links)['image-icon']).href); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$getThumbnailUrl
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} URL of the thumbnail with access token
     */
    $getThumbnailUrl: function() { return helpers.appendAccessToken(maybe(maybe(this.links)['image-thumbnail']).href); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$getImageUrl
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} URL of the full image with access token
     */
    $getImageUrl: function() { return helpers.appendAccessToken(maybe(maybe(this.links)['image']).href); },

    // TODO add a link to read comments when memories read from any endpoint include comments links

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$addMemoryPersona
     * @methodOf memories.types:constructor.Memory
     * @function
     * @param {MemoryPersona} memoryPersona people are attached to {@link memories.types:constructor.MemoryPersona MemoryPersonas}
     * @param {Object=} params currently unused
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRef}
     */
    $addMemoryPersona: function(memoryPersona, params, opts) {
      return exports.addMemoryPersona(this.id, memoryPersona, params, opts);
    }
};

  /**********************************/
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona
   * @description
   *
   * Memory Persona (not a true persona; can only contain a name and a media artifact reference)
   *
   * @param {Name|string=} name name to add
   * @param {string|MemoryArtifactRef=} mar URL of the memory artifact or the memory artifact ref to add
   *********************************/

  var MemoryPersona = exports.MemoryPersona = function(name, mar) {
    this.names = [];
    this.media = [];
    if (name) {
      //noinspection JSUnresolvedFunction
      this.$addName(name);
    }
    if (mar) {
      //noinspection JSUnresolvedFunction
      this.$addMemoryArtifactRef(mar);
    }
  };

  exports.MemoryPersona.prototype = {
    constructor: MemoryPersona,
    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryPersona#id
     * @propertyOf memories.types:constructor.MemoryPersona
     * @return {String} Id of the Memory Persona
     */

    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryPersona#extracted
     * @propertyOf memories.types:constructor.MemoryPersona
     * @return {String} not sure what this means
     */

    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryPersona#$memoryId
     * @propertyOf memories.types:constructor.MemoryPersona
     * @return {String} Id of the memory to which this persona is attached
     */

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$getMemoryArtifactRef
     * @methodOf memories.types:constructor.MemoryPersona
     * @return {MemoryArtifactRef} {@link memories.types:constructor.MemoryArtifactRef MemoryArtifactRef}
     */
    $getMemoryArtifactRef: function() { return maybe(this.media)[0]; },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$getNames
     * @methodOf memories.types:constructor.MemoryPersona
     * @return {Name[]} an array of {@link name.types:constructor.Name Names}
     */
    $getNames: function() { return this.names || []; },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$getDisplayName
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @return {string} display name
     */
    $getDisplayName: function() { return maybe(this.display).name; },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$getPreferredName
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @return {string} preferred {@link name.types:constructor.Name Name}
     */
    $getPreferredName: function() { return helpers.findOrFirst(this.names, {preferred: true}); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$getGivenName
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @return {String} preferred given name
     */
    $getGivenName: function() {
      var name = this.$getPreferredName();
      if (name) {
        name = name.$getGivenName();
      }
      return name;
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$getSurname
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @return {String} preferred surname
     */
    $getSurname: function() {
      var name = this.$getPreferredName();
      if (name) {
        name = name.$getSurname();
      }
      return name;
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$addName
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @param {Name|string} value name to add
     */
    $addName: function(value) {
      if (!(value instanceof name.Name)) {
        //noinspection JSValidateTypes
        value = new name.Name(value);
      }
      this.names.push(value);
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$addMemoryArtifactRef
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @param {string|MemoryArtifactRef} mar URL of the memory artifact or the memory artifact ref to add
     */
    $addMemoryArtifactRef: function(mar) {
      if (!(mar instanceof MemoryArtifactRef)) {
        mar = new MemoryArtifactRef(mar);
      }
      this.media.push(mar);
    }
  };

  /**********************************/
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef
   * @description
   *
   * A reference to a {@link memories.types:constructor.MemoryPersona MemoryPersona} and a
   * {@link memories.types:constructor.Memory Memory}
   *
   * @param {string=} url URL of the Memory Persona
   *********************************/

  var MemoryPersonaRef = exports.MemoryPersonaRef = function(url) {
    // we must remove the access token in order to pass this into addMemoryPersonaRef
    this.resource = helpers.removeAccessToken(url);
    this.resourceId = helpers.getLastUrlSegment(this.resource);
  };

  exports.MemoryPersonaRef.prototype = {
    constructor: MemoryPersonaRef,
    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryPersonaRef#resourceId
     * @propertyOf memories.types:constructor.MemoryPersonaRef
     * @return {String} Id of the Memory Persona
     */

    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryPersonaRef#resource
     * @propertyOf memories.types:constructor.MemoryPersonaRef
     * @return {String} URL of the Memory Persona
     */

    // TODO when we can read a memory persona, add a function to read it

    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryPersonaRef#$personId
     * @propertyOf memories.types:constructor.MemoryPersonaRef
     * @return {String} Id of the person to which this persona is attached
     */

    // TODO stop hacking into the resource when we have a separate link to the memory
    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersonaRef#$getMemoryId
     * @methodOf memories.types:constructor.MemoryPersonaRef
     * @function
     * @return {String} Id of the memory; pass into {@link memories.functions:getMemory getMemory} for details
     */
    $getMemoryId:  function() {
      return this.resource ? this.resource.replace(/^.*\/memories\/([^\/]*)\/personas\/.*$/, '$1') : this.resource;
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersonaRef#$getMemoryUrl
     * @methodOf memories.types:constructor.MemoryPersonaRef
     * @function
     * @return {String} URL of the memory; pass into {@link memories.functions:getMemory getMemory} for details
     */
    $getMemoryUrl:  function() {
      return this.resource ? helpers.removeAccessToken(this.resource.replace(/(^.*\/memories\/[^\/]*)\/personas\/.*$/, '$1')) : this.resource;
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersonaRef#$getMemory
     * @methodOf memories.types:constructor.MemoryPersonaRef
     * @function
     * @return {Object} promise for the {@link memories.functions:getMemory getMemory} response
     */
    $getMemory:  function() {
      return exports.getMemory(this.$getMemoryUrl());
    }
  };

  /**********************************/
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef
   * @description
   *
   * Memory Artifact Reference
   * @param {string=} url memory artifact url
   *********************************/

  var MemoryArtifactRef = exports.MemoryArtifactRef = function(url) {
    this.description = url;
  };

  exports.MemoryArtifactRef.prototype = {
    constructor: MemoryArtifactRef,
    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryArtifactRef#id
     * @propertyOf memories.types:constructor.MemoryArtifactRef
     * @return {String} Id of the Memory Artifact
     */

    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryArtifactRef#qualifiers
     * @propertyOf memories.types:constructor.MemoryArtifactRef
     * @return {Object[]} array of objects with `value` attributes that are comma-separated lists of four numbers, possibly identifying a rectangle in the image?
     */

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryArtifactRef#$getMemoryArtifactUrl
     * @methodOf memories.types:constructor.MemoryArtifactRef
     * @function
     * @return {String} URL of the memory artifact with access token
     */
    $getMemoryArtifactUrl: function() { return helpers.appendAccessToken(this.description); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryArtifactRef#$setMemoryArtifactUrl
     * @methodOf memories.types:constructor.MemoryArtifactRef
     * @function
     * @param {string} url URL of the memory artifact
     */
    $setMemoryArtifactUrl: function(url) { this.description = url; }
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
   * - `getMemories()` - get the array of {@link memories.types:constructor.Memory Memories} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Query_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/XaD23/ editable example}
   *
   * @param {string} pid id of the person or full URL of the person-memories-query endpoint
   * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0, `type` type of artifacts to return - possible values are photo and story - defaults to both
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMemoriesQuery = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-memories-query', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
            helpers.constructorSetter(Memory, 'sourceDescriptions'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.sourceDescriptions;
            })
          ));
      });
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
   * - `getMemories()` - get the array of {@link memories.types:constructor.Memory Memories} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/memories/User_Memories_Query_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/V8pfd/ editable example}
   *
   * @param {string} uid id or full URL of the user - note this is a _user_, not an _agent_
   * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getUserMemoriesQuery = function(uid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-memories-query', uid, {cisUserId: uid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
            helpers.constructorSetter(Memory, 'sourceDescriptions'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.sourceDescriptions;
            })
          ));
      });
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
   * - `getMemory()` - get the {@link memories.types:constructor.Memory Memory} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/9J4zn/ editable example}
   *
   * @param {String} mid id or full URL of the memory
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemory = function(mid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-template', mid, {mid: mid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getMemory: function() { return maybe(this.sourceDescriptions)[0]; }}),
            helpers.constructorSetter(Memory, 'sourceDescriptions'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.sourceDescriptions;
            })
          ));
      });
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
   * - `getComments()` - get the array of {@link discussions.types:constructor.Comment Comments} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comments_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/aJ77f/ editable example}
   *
   * @param {String} mid of the memory or full URL of the memory-comments endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryComments = function(mid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-comments-template', mid, {mid: mid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getComments: function() {
              return maybe(maybe(this.discussions)[0]).comments || [];
            }}),
            helpers.constructorSetter(discussions.Comment, 'comments', function(response) {
              return maybe(maybe(response).discussions)[0];
            }),
            helpers.objectExtender(function(response, comment) {
              var href = maybe(maybe(maybe(comment).links).comment).href;
              return { $memoryId: href ? helpers.removeAccessToken(href.replace(/^.*\/memories\/([^\/]*)\/comments\/.*$/, '$1')) : href };
            }, function(response) {
              return maybe(maybe(maybe(response).discussions)[0])['comments'];
            })
          ));
      });
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
   * - `getMemoryPersonas()` - get the array of {@link memories.types:constructor.MemoryPersona MemoryPersonas} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/zD5V7/ editable example}
   *
   * @param {string} mid of the memory or full URL of the memory-personas endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryPersonas = function(mid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-personas-template', mid, {mid: mid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getMemoryPersonas: function() {
              return this && this.persons ? this.persons : [];
            }}),
            helpers.constructorSetter(MemoryPersona, 'persons'),
            helpers.constructorSetter(name.Name, 'names', function(response) {
              return maybe(response).persons;
            }),
            helpers.constructorSetter(MemoryArtifactRef, 'media', function(response) {
              return maybe(response).persons;
            }),
            helpers.objectExtender(function(response, persona) {
              var href = maybe(maybe(maybe(persona).links).persona).href;
              return { $memoryId: href ? helpers.removeAccessToken(href.replace(/^.*\/memories\/([^\/]*)\/personas\/.*$/, '$1')) : href };
            }, function(response) {
              return maybe(response).persons;
            })
          ));
      });
  };

  /**
   * @ngdoc function
   * @name memories.functions:getMemoryPersonaRefs
   * @function
   *
   * @description
   * Get references to memories for a person
   * The response includes the following convenience function
   *
   * - `getMemoryPersonaRefs()` - get an array of {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/vt79D/ editable example}
   *
   * @param {String} pid id of the person or full URL of the person-memory-references endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryPersonaRefs = function(pid, params, opts) {
    // TODO check if memory-references endpoint template has been added to the discovery resource
    var url = helpers.isAbsoluteUrl(pid) ? pid : '/platform/tree/persons/'+encodeURI(pid)+'/memory-references';
    return plumbing.get(url, params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemoryPersonaRefs: function() {
          return maybe(maybe(this.persons)[0]).evidence || [];
        }}),
        helpers.constructorSetter(MemoryPersonaRef, 'evidence', function(response) {
          return maybe(maybe(response).persons)[0];
        }),
        helpers.objectExtender(function(response) {
          return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
        }, function(response) {
          return maybe(maybe(maybe(response).persons)[0]).evidence;
        })
      ));
  };

  /**
   * @ngdoc function
   * @name memories.functions:getPersonPortraitUrl
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
  exports.getPersonPortraitUrl = function(pid, params, opts) {
    return plumbing.getUrl('person-portrait-template', pid, {pid: pid}).then(function(url) {
      if (params && params.followRedirect) {
        params = helpers.extend({}, params);
        delete params.followRedirect;
        var d = globals.deferredWrapper();
        var promise = plumbing.get(url, params, {}, opts);
        var handler = function() {
          // We don't expect the image content-type. We try to parse it as json and fail, so rely upon the status code
          d.resolve(promise.getStatusCode() === 200 ? helpers.appendAccessToken(promise.getResponseHeader('Content-Location')) : '');
        };
        promise.then(handler, handler);
        return helpers.extendHttpPromise(d.promise, promise);
      }
      else {
        return helpers.appendAccessToken(url);
      }
    });
  };

  // TODO wrap call to read all portrait urls

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
   * @param {String|FormData} data string or a FormData object - if FormData, the field name of the file _must_ be `artifact`
   * @param {Object=} params `description`, `title`, `filename`, and `type` (default artifact type: Image, Document, Story, etc.)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory URL
   */
  exports.createMemory = function(data, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memories'),
      function(url) {
        return plumbing.post(helpers.appendQueryParameters(url, params),
          data, { 'Content-Type': helpers.isString(data) ? 'text/plain' : 'multipart/form-data' }, opts,
          helpers.getResponseLocation);
      });
  };

  /**
   * @ngdoc function
   * @name memories.functions:addMemoryPersona
   * @function
   *
   * @description
   * Create a memory (story or photo)
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/dLfA8/ editable example}
   *
   * @param {string|Memory} mid id or full URL of a memory
   * @param {MemoryPersona} memoryPersona people are attached to {@link memories.types:constructor.MemoryPersona MemoryPersonas}
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRef}
   */
  exports.addMemoryPersona = function(mid, memoryPersona, params, opts) {
    var data = {
      persons: [ memoryPersona ]
    };
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-personas-template', mid, {mid: mid}),
      function(url) {
        return plumbing.post(url, data, {}, opts, function(data, promise) {
          var location = promise.getResponseHeader('Location');
          return location ? new MemoryPersonaRef(location) : location;
        });
      });
  };

  /**
   * @ngdoc function
   * @name memories.functions:addMemoryPersonaRef
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
   * @param {MemoryPersonaRef} memoryPersonaRef {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRef}
   * @param {Object=} params `changeMessage` change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the persona URL
   */
  exports.addMemoryPersonaRef = function(pid, memoryPersonaRef, params, opts) {
    var attrib = new attribution.Attribution();
    if (params && params.changeMessage) {
      attrib.changeMessage = params.changeMessage;
    }
    var data = {
      persons: [{
        evidence: [ memoryPersonaRef ],
        attribution: attrib
      }]
    };
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-memory-persona-references-template', pid, {pid: pid}),
      function(url) {
        return plumbing.post(url, data, {}, opts,
          helpers.getResponseLocation);
      });
  };

  return exports;
});

define('notes',[
  'attribution',
  'helpers',
  'plumbing'
], function(attribution, helpers, plumbing) {
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

  /**********************************/
  /**
   * @ngdoc function
   * @name notes.types:constructor.Note
   * @description
   *
   * Note
   **********************************/

  var Note = exports.Note = function() {

  };

  exports.Note.prototype = {
    constructor: Note
    /**
     * @ngdoc property
     * @name notes.types:constructor.Note#id
     * @propertyOf notes.types:constructor.Note
     * @return {String} Id of the note
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.Note#subject
     * @propertyOf notes.types:constructor.Note
     * @return {String} subject / title of the note
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.Note#text
     * @propertyOf notes.types:constructor.Note
     * @return {String} text of the note
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.Note#attribution
     * @propertyOf notes.types:constructor.Note
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */
  };

  /**********************************/
  /**
   * @ngdoc function
   * @name notes.types:constructor.NoteRef
   * @description
   *
   * Reference to a note on a person
   **********************************/

  var NoteRef = exports.NoteRef = function() {

  };

  exports.NoteRef.prototype = {
    constructor: NoteRef,
    /**
     * @ngdoc property
     * @name notes.types:constructor.NoteRef#id
     * @propertyOf notes.types:constructor.NoteRef
     * @return {String} Id of the note - pass into {@link notes.functions:getPersonNote getPersonNote},
     * {@link notes.functions:getCoupleNote getCoupleNote}, or {@link notes.functions:getChildAndParentsNote getChildAndParentsNote}
     * for details
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.NoteRef#subject
     * @propertyOf notes.types:constructor.NoteRef
     * @return {String} subject of the note
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.NoteRef#$personId
     * @propertyOf notes.types:constructor.NoteRef
     * @return {String} Id of the person to which this note is attached if it is a person note
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.NoteRef#$childAndParentsId
     * @propertyOf notes.types:constructor.NoteRef
     * @return {String} Id of the child and parents relationship to which this note is attached if it is a child and parents note
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.NoteRef#$coupleId
     * @propertyOf notes.types:constructor.NoteRef
     * @return {String} Id of the couple relationship to which this note is attached if it is a couple note
     */

    /**
     * @ngdoc function
     * @name notes.types:constructor.NoteRef#$getNoteUrl
     * @methodOf notes.types:constructor.NoteRef
     * @function
     * @return {string} URL of the note - pass into {@link notes.functions:getPersonNote getPersonNote},
     * {@link notes.functions:getCoupleNote getCoupleNote}, or
     * {@link notes.functions:getChildAndParentsNote getChildAndParentsNote} for details
     */
    $getNoteUrl: function() {
      var url = helpers.removeAccessToken(this.links.note.href);
      // TODO remove this when person note.href contains note id like it should
      if (url.indexOf(this.id) === -1) {
        url += '/' + this.id;
      }
      return url;
    },

    /**
     * @ngdoc function
     * @name notes.types:constructor.NoteRef#$getNote
     * @methodOf notes.types:constructor.NoteRef
     * @function
     * @return {Object} promise for the {@link sources.functions:getPersonNote getPersonNote},
     * {@link sources.functions:getCoupleNote getCoupleNote}, or
     * {@link sources.functions:getChildAndParentsNote getChildAndParentsNote} response
     */
    $getNote: function() {
      return getNote(this.$getNoteUrl());
    }
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
   * - `getNoteRefs()` - get an array of {@link notes.types:constructor.NoteRef NoteRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/3enGw/ editable example}
   *
   * @param {String} pid id of the person or full URL of the person-notes endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonNoteRefs = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-notes-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getNoteRefs: function() {
              return maybe(maybe(maybe(this).persons)[0]).notes || [];
            }}),
            helpers.constructorSetter(NoteRef, 'notes', function(response) {
              return maybe(maybe(response).persons)[0];
            }),
            helpers.objectExtender(function(response) {
              return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).persons)[0]).notes;
            })
          ));
      });
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
   * - `getNoteRefs()` - get an array of {@link notes.types:constructor.NoteRef NoteRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/qe2dc/ editable example}
   *
   * @param {String} crid id of the couple relationship or full URL of the couple-relationship-notes endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleNoteRefs = function(crid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-notes-template', crid, {crid: crid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getNoteRefs: function() {
              return maybe(maybe(this.relationships)[0]).notes || [];
            }}),
            helpers.constructorSetter(NoteRef, 'notes', function(response) {
              return maybe(maybe(response).relationships)[0];
            }),
            helpers.objectExtender(function(response) {
              return { $coupleId: maybe(maybe(maybe(response).relationships)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).relationships)[0]).notes;
            })
          ));
      });
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
   * - `getNoteRefs()` - get an array of {@link notes.types:constructor.NoteRef NoteRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/SV8Hs/ editable example}
   *
   * @param {String} caprid id of the child and parents relationship or full URL of the child-and-parents-relationship-notes endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsNoteRefs = function(caprid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-notes-template', caprid, {caprid: caprid}),
      function(url) {
        return plumbing.get(url, params,
          {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getNoteRefs: function() {
              return maybe(maybe(this.childAndParentsRelationships)[0]).notes || [];
            }}),
            helpers.constructorSetter(NoteRef, 'notes', function(response) {
              return maybe(maybe(response).childAndParentsRelationships)[0];
            }),
            helpers.objectExtender(function(response) {
              return { $childAndParentsId: maybe(maybe(maybe(response).childAndParentsRelationships)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).childAndParentsRelationships)[0]).notes;
            })
          ));
      });
  };

  function getRoot(obj) {
    if (obj) {
      if (obj.persons) {
        return obj.persons;
      }
      else if (obj.childAndParentsRelationships) {
        return obj.childAndParentsRelationships;
      }
      else if (obj.relationships) {
        return obj.relationships;
      }
    }
    return {};
  }

  function getNote(url, params, opts) {
    return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts, // child and parents note requires x-fs-v1; others allow fs or gedcomx
      helpers.compose(
        helpers.objectExtender({getNote: function() {
          return maybe(maybe(getRoot(this)[0]).notes)[0];
        }}),
        helpers.constructorSetter(Note, 'notes', function(response) {
          return getRoot(response)[0];
        }),
        helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
          return maybe(getRoot(response)[0]).notes;
        })
      ));
  }

  function getMultiNote(id, nids, params, opts, getNoteFn) {
    var promises = {};
    if (helpers.isArray(id)) {
      helpers.forEach(id, function(e) {
        var key, url;
        if (e instanceof NoteRef) {
          key = e.id;
          url = e.$getNoteUrl();
        }
        else {
          key = e;
          url = e;
        }
        promises[key] = getNoteFn(url, null, params, opts);
      });
    }
    else {
      helpers.forEach(nids, function(nid) {
        promises[nid] = getNoteFn(id, nid, params, opts);
      });
    }
    return promises;
  }

  /**
   * @ngdoc function
   * @name notes.functions:getPersonNote
   * @function
   *
   * @description
   * Get information about a note
   * The response includes the following convenience function
   *
   * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/96EkL/ editable example}
   *
   * @param {string|NoteRef} pid id of the person or full URL or {@link notes.types:constructor.NoteRef NoteRef} of the note
   * @param {string=} nid id of the note (required if pid is the id of the person)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonNote = function(pid, nid, params, opts) {
    if (pid instanceof NoteRef) {
      //noinspection JSUnresolvedFunction
      pid = pid.$getNoteUrl();
    }
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-note-template', pid, {pid: pid, nid: nid}),
      function(url) {
        return getNote(url, params, opts);
      });
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
   * @param {string|string[]|NoteRef[]} pid id of the person, or full URLs or {@link notes.types:constructor.NoteRef NoteRefs} of the notes
   * @param {string[]=} nids ids of the notes (required if pid is the id of the person)
   * @param {Object=} params pass to getPersonNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id or URL to {@link notes.functions:getPersonNote getPersonNote} response
   */
  exports.getMultiPersonNote = function(pid, nids, params, opts) {
    var promises = getMultiNote(pid, nids, params, opts, exports.getPersonNote);
    return helpers.promiseAll(promises);
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
   * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/T7xj2/ editable example}
   *
   * @param {string|NoteRef} crid id of the couple relationship or full URL or {@link notes.types:constructor.NoteRef NoteRef} of the note
   * @param {string=} nid id of the note (required if crid is the id of the couple relationship)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleNote = function(crid, nid, params, opts) {
    if (crid instanceof NoteRef) {
      //noinspection JSUnresolvedFunction
      crid = crid.$getNoteUrl();
    }
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-note-template', crid, {crid: crid, nid: nid}),
      function(url) {
        return getNote(url, params, opts);
      });
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
   * {@link http://jsfiddle.net/DallanQ/TsFky/ editable example}
   *
   * @param {string|string[]||NoteRef[]} crid id of the couple relationship, or full URLs or {@link notes.types:constructor.NoteRef NoteRefs} of the notes
   * @param {string[]=} nids ids of the notes (required if crid is the id of the couple relationship)
   * @param {Object=} params pass to getCoupleNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id to {@link notes.functions:getCoupleNote getCoupleNote} response
   */
  exports.getMultiCoupleNote = function(crid, nids, params, opts) {
    var promises = getMultiNote(crid, nids, params, opts, exports.getCoupleNote);
    return helpers.promiseAll(promises);
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
   * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/dV9uQ/ editable example}
   *
   * @param {string} caprid id of the child and parents relationship or full URL or {@link notes.types:constructor.NoteRef NoteRef} of the note
   * @param {string=} nid id of the note (required if caprid is the id of the child and parents relationship)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsNote = function(caprid, nid, params, opts) {
    if (caprid instanceof NoteRef) {
      //noinspection JSUnresolvedFunction
      caprid = caprid.$getNoteUrl();
    }
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-note-template', caprid, {caprid: caprid, nid: nid}),
      function(url) {
        return getNote(url, params, opts);
      });
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
   * @param {string|string[]||NoteRef[]} caprid id of the child and parents relationship, or full URLs or {@link notes.types:constructor.NoteRef NoteRefs} of the notes
   * @param {string[]=} nids ids of the notes (required if caprid is the id of the child and parents relationship)
   * @param {Object=} params pass to getChildAndParentsNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id to {@link notes.functions:getChildAndParentsNote getChildAndParentsNote} response
   */
  exports.getMultiChildAndParentsNote = function(caprid, nids, params, opts) {
    var promises = getMultiNote(caprid, nids, params, opts, exports.getChildAndParentsNote);
    return helpers.promiseAll(promises);
  };

  return exports;
});

define('sources',[
  'attribution',
  'helpers',
  'plumbing'
], function(attribution, helpers, plumbing) {
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

  /**********************************/
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription
   * @description
   *
   * Description of a source
   **********************************/

  var SourceDescription = exports.SourceDescription = function() {

  };

  exports.SourceDescription.prototype = {
    constructor: SourceDescription,
    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceDescription#id
     * @propertyOf sources.types:constructor.SourceDescription
     * @return {String} Id of the source description
     */

    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceDescription#about
     * @propertyOf sources.types:constructor.SourceDescription
     * @return {String} URL (link to the record)
     */

    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceDescription#attribution
     * @propertyOf sources.types:constructor.SourceDescription
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    // TODO check for collection id and url

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$getCitation
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {String} source citation
     */
    $getCitation: function() { return maybe(maybe(this.citations)[0]).value; },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$getTitle
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {String} title of the source description
     */
    $getTitle: function() { return maybe(maybe(this.titles)[0]).value; },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$getText
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {String} Text / Description of the source
     */
    $getText: function() { return maybe(maybe(this.notes)[0]).text; },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$getSourceRefsQuery
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {Object} promise for the {@link sources.functions:getSourceRefsQuery getSourceRefsQuery} response
     */
    // TODO verify this is available also from getCollectionSourceDescriptions(forUser)
    $getSourceRefsQuery: function() {
      return exports.getSourceRefsQuery(helpers.removeAccessToken(this.links['source-references-query'].href));
    }
  };

  /**********************************/
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef
   * @description
   *
   * Reference from a person or relationship to a source
   **********************************/

  var SourceRef = exports.SourceRef = function() {

  };

  exports.SourceRef.prototype = {
    constructor: SourceRef,
    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceRef#id
     * @propertyOf sources.types:constructor.SourceRef
     * @return {string} Id of the source reference
     */

    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceRef#attribution
     * @propertyOf sources.types:constructor.SourceRef
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceRef#$personId
     * @propertyOf sources.types:constructor.SourceRef
     * @return {String} Id of the person to which this source is attached if it is attached to a person
     */

    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceRef#$childAndParentsId
     * @propertyOf sources.types:constructor.SourceRef
     * @return {String} Id of the child and parents relationship to which this source is attached if it is attached to child and parents
     */

    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceRef#$coupleId
     * @propertyOf sources.types:constructor.SourceRef
     * @return {String} Id of the couple relationship to which this source is attached if it is attached to a couple
     */

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$getSourceDescriptionUrl
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {string} URL of the source description - pass into {@link sources.functions:getSourceDescription getSourceDescription} for details
     */
    $getSourceDescriptionUrl: function() {
      return helpers.removeAccessToken(this.description);
    },

    // TODO check for source description id

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$getSourceDescription
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {Object} promise for the {@link sources.functions:getSourceDescription getSourceDescription} response
     */
    $getSourceDescription: function() {
      return exports.getSourceDescription(this.$getSourceDescriptionUrl());
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$getTagNames
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {string[]} an array of tag names; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
     */
    $getTagNames: function() { return helpers.map(this.tags, function(tag) {
      return tag.resource;
    }); }
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
   * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/BkydV/ editable example}
   *
   * @param {String} pid of the person or full URL of the person-source-references endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonSourceRefs = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-source-references-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getSourceRefs: function() {
              return maybe(maybe(this.persons)[0]).sources || [];
            }}),
            helpers.constructorSetter(SourceRef, 'sources', function(response) {
              return maybe(maybe(response).persons)[0];
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return maybe(maybe(maybe(response).persons)[0]).sources;
            }),
            helpers.objectExtender(function(response) {
              return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).persons)[0]).sources;
            })
          ));
      });
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
   * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ahu29/ editable example}
   *
   * @param {String} crid or full URL of the couple relationship
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleSourceRefs = function(crid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-source-references-template', crid, {crid: crid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getSourceRefs: function() {
              return maybe(maybe(this.relationships)[0]).sources || [];
            }}),
            helpers.constructorSetter(SourceRef, 'sources', function(response) {
              return maybe(maybe(response).relationships)[0];
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return maybe(maybe(maybe(response).relationships)[0]).sources;
            }),
            helpers.objectExtender(function(response) {
              return { $coupleId: maybe(maybe(maybe(response).relationships)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).relationships)[0]).sources;
            })
          ));
      });
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
   * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ZKLVT/ editable example}
   *
   * @param {String} caprid id or full URL of the child and parents relationship
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsSourceRefs = function(caprid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-source-references-template', caprid, {caprid: caprid}),
      function(url) {
        return plumbing.get(url, params,
          {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getSourceRefs: function() {
              return maybe(maybe(this.childAndParentsRelationships)[0]).sources || [];
            }}),
            helpers.constructorSetter(SourceRef, 'sources', function(response) {
              return maybe(maybe(response).childAndParentsRelationships)[0];
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return maybe(maybe(maybe(response).childAndParentsRelationships)[0]).sources;
            }),
            helpers.objectExtender(function(response) {
              return { $childAndParentsId: maybe(maybe(maybe(response).childAndParentsRelationships)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).childAndParentsRelationships)[0]).sources;
            })
          ));
      });
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
   * - `getSourceDescription()` - get the {@link sources.types:constructor.SourceDescription SourceDescription} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/eECJx/ editable example}
   *
   * @param {String|SourceRef} sdid id or full URL or {@link sources.types:constructor.SourceRef SourceRef} of the source description
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceDescription = function(sdid, params, opts) {
    if (sdid instanceof SourceRef) {
      //noinspection JSUnresolvedFunction
      sdid = sdid.$getSourceDescriptionUrl();
    }
    return helpers.chainHttpPromises(
      plumbing.getUrl('source-description-template', sdid, {sdid: sdid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getSourceDescription: function() { return maybe(this.sourceDescriptions)[0]; }}),
            helpers.constructorSetter(SourceDescription, 'sourceDescriptions'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.sourceDescriptions;
            })
          ));
      });
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
   * @param {string[]|SourceRef[]} sdids ids or full URLs or {@link sources.types:constructor.SourceRef SourceRefs} of the source descriptions
   * @param {Object=} params pass to getSourceDescription currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the source descriptions have been read,
   * returning a map of source description id or URL to {@link sources.functions:getSourceDescription getSourceDescription} response
   */
  exports.getMultiSourceDescription = function(sdids, params, opts) {
    var promises = {};
    helpers.forEach(sdids, function(sdid) {
      var id, url;
      if (sdid instanceof SourceRef) {
        // TODO use source description id here when it is available
        id = sdid.$getSourceDescriptionUrl();
        url = sdid.$getSourceDescriptionUrl();
      }
      else {
        id = sdid;
        url = sdid;
      }
      promises[id] = exports.getSourceDescription(url, params, opts);
    });
    return helpers.promiseAll(promises);
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
   * - `getPersonSourceRefs()` - get an array of person {@link sources.types:constructor.SourceRef SourceRefs} from the response
   * - `getCoupleSourceRefs()` - get an array of couple relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
   * - `getChildAndParentsSourceRefs()` - get an array of child and parent relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Source_References_Query_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/E866s/ editable example}
   *
   * @param {String} sdid of the source description or full URL of the source-references-query endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceRefsQuery = function(sdid, params, opts) {
    // TODO add discovery resource lookup when it's working - and be careful how to substitute sdid in the query parameters part
    var url = helpers.isAbsoluteUrl(sdid) ? sdid : helpers.appendQueryParameters('/platform/tree/source-references', {source: sdid});
    return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getPersonSourceRefs: function() {
          return helpers.flatMap(maybe(this.persons), function(person) {
            return person.sources;
          });
        }}),
        helpers.objectExtender({getCoupleSourceRefs: function() {
          return helpers.flatMap(maybe(this.relationships), function(couple) {
            return couple.sources;
          });
        }}),
        helpers.objectExtender({getChildAndParentsSourceRefs: function() {
          return helpers.flatMap(maybe(this.childAndParentsRelationships), function(childAndParents) {
            return childAndParents.sources;
          });
        }}),
        helpers.constructorSetter(SourceRef, 'sources', function(response) {
          return helpers.union(maybe(response).persons, maybe(response).relationships, maybe(response).childAndParentsRelationships);
        }),
        helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
          var personsRelationships = helpers.union(maybe(response).persons, maybe(response).relationships, maybe(response).childAndParentsRelationships);
          return helpers.flatMap(personsRelationships, function(personRelationship) {
            return personRelationship.sources;
          });
        }),
        helpers.objectExtender(function(response, sourceRef) {
          // get the person that contains this source ref
          var person = helpers.find(maybe(response).persons, function(person) {
            return !!helpers.find(maybe(person).sources, {id: sourceRef.id});
          });
          return { $personId: person.id };
        }, function(response) {
          return helpers.flatMap(maybe(response).persons, function(person) {
            return person.sources;
          });
        }),
        helpers.objectExtender(function(response, sourceRef) {
          // get the couple that contains this source ref
          var couple = helpers.find(maybe(response).relationships, function(couple) {
            return !!helpers.find(maybe(couple).sources, {id: sourceRef.id});
          });
          return { $coupleId: couple.id };
        }, function(response) {
          return helpers.flatMap(maybe(response).relationships, function(couple) {
            return couple.sources;
          });
        }),
        helpers.objectExtender(function(response, sourceRef) {
          // get the child-and-parents that contains this source ref
          var childAndParents = helpers.find(maybe(response).childAndParentsRelationships, function(childAndParents) {
            return !!helpers.find(maybe(childAndParents).sources, {id: sourceRef.id});
          });
          return { $childAndParentsId: childAndParents.id };
        }, function(response) {
          return helpers.flatMap(maybe(response).childAndParentsRelationships, function(childAndParents) {
            return childAndParents.sources;
          });
        })
      ));
  };

  return exports;
});

define('parentsAndChildren',[
  'attribution',
  'changeHistory',
  'fact',
  'globals',
  'helpers',
  'notes',
  'plumbing',
  'sources'
], function(attribution, changeHistory, fact, globals, helpers, notes, plumbing, sources) {
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
   * @name parentsAndChildren.types:constructor.ChildAndParents
   * @description
   *
   * Child and parents relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
   *
   * Two methods to note below are _$save_ and _$delete_. _$save_ saves the various adds, deletes, and updates
   * made to the relationship; _$delete_ removes the relationship.
   */
  var ChildAndParents = exports.ChildAndParents = function() {

  };

  // helper functions - called with this set to the relationship
  // export so we can use them in spouses.js

  // person may be a Person, a URL, or an ID
  exports.setMember = function(role, person) {
    if (!this[role]) {
      this[role] = {};
    }
    if (person instanceof globals.Person) {
      this[role].resource = person.$getUrl();
    }
    else if (helpers.isAbsoluteUrl(person)) {
      this[role].resource = person;
    }
    else {
      this[role].resource = helpers.getUrlFromDiscoveryResource(globals.discoveryResource, 'person-template', {pid: person});
    }
    delete this[role].resourceId;
  };

  exports.deleteMember = function(role, changeMessage) {
    if (!this.$deletedMembers) {
      this.$deletedMembers = {};
    }
    this.$deletedMembers[role] = changeMessage;
    delete this[role];
  };

  exports.addFact = function(prop, value) {
    if (!helpers.isArray(this[prop])) {
      this[prop] = [];
    }
    if (!(value instanceof fact.Fact)) {
      value = new fact.Fact(value);
    }
    this[prop].push(value);
  };

  exports.deleteFact = function(prop, value, changeMessage) {
    if (!(value instanceof fact.Fact)) {
      value = helpers.find(this[prop], { id: value });
    }
    var pos = helpers.indexOf(this[prop], value);
    if (pos >= 0) {
      // add fact to $deletedFacts map; key is the href to delete
      var key = helpers.removeAccessToken(maybe(maybe(maybe(value).links).conclusion).href);
      if (key) {
        if (!this.$deletedFacts) {
          this.$deletedFacts = {};
        }
        this.$deletedFacts[key] = changeMessage;
      }
      // remove fact from array
      this[prop].splice(pos,1);
    }
  };

  exports.ChildAndParents.prototype = {
    constructor: ChildAndParents,
    /**
     * @ngdoc property
     * @name parentsAndChildren.types:constructor.ChildAndParents#id
     * @propertyOf parentsAndChildren.types:constructor.ChildAndParents
     * @return {String} Id of the relationship
     */

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherFacts
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., parent-relationship type
     */
    $getFatherFacts: function() { return this.fatherFacts || []; },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherFacts
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., parent-relationship type
     */
    $getMotherFacts: function() { return this.motherFacts || []; },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherId
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} Id of the father
     */
    $getFatherId: function() { return maybe(this.father).resourceId; },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherUrl
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} URL of the father
     */
    $getFatherUrl: function() { return helpers.removeAccessToken(maybe(this.father).resource); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getFather
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
     */
    $getFather: function() { return globals.getPerson(this.$getFatherUrl()); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherId
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} Id of the mother
     */
    $getMotherId: function() { return maybe(this.mother).resourceId; },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherUrl
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} URL of the mother
     */
    $getMotherUrl: function() { return helpers.removeAccessToken(maybe(this.mother).resource); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getMother
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
     */
    $getMother: function() { return globals.getPerson(this.$getMotherUrl()); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getChildId
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} Id of the child
     */
    $getChildId: function() { return maybe(this.child).resourceId; },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getChildUrl
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} URL of the child
     */
    $getChildUrl: function() { return helpers.removeAccessToken(maybe(this.child).resource); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getChild
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
     */
    $getChild: function() { return globals.getPerson(this.$getChildUrl()); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getNoteRefs
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link notes.functions:getChildAndParentsNoteRefs getChildAndParentsNoteRefs} response
     */
    $getNoteRefs: function() { return notes.getChildAndParentsNoteRefs(helpers.removeAccessToken(this.links.notes.href)); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getSourceRefs
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link sources.functions:getChildAndParentsSourceRefs getChildAndParentsSourceRefs} response
     */
    $getSourceRefs: function() { return sources.getChildAndParentsSourceRefs(helpers.removeAccessToken(maybe(this.links['source-references']).href)); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getChanges
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} __BROKEN__ promise for the {@link sources.functions:getChildAndParentsChanges getChildAndParentsChanges} response
     */
    $getChanges: function() { return changeHistory.getChildAndParentsChanges(helpers.removeAccessToken(maybe(this.links['change-history']).href)); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$setFather
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
     * @param {Person|string} father person or URL or id
     * @return {ChildAndParents} this relationship
     */
    $setFather: function(father) {
      exports.setMember.call(this, 'father', father);
      this.$fatherChanged = true;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$setMother
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
     * @param {Person|string} mother person or URL or id
     * @return {ChildAndParents} this relationship
     */
    $setMother: function(mother) {
      exports.setMember.call(this, 'mother', mother);
      this.$motherChanged = true;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$setChild
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
     * Also note: Once the relationship has been saved, the child can no longer be changed
     * @param {Person|string} child person or URL or id
     * @return {ChildAndParents} this relationship
     */
    $setChild: function(child) {
      exports.setMember.call(this, 'child', child);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteFather
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @description remove father from the relationship
     * @param {String=} changeMessage change message
     * @return {ChildAndParents} this relationship
     */
    $deleteFather: function(changeMessage) {
      exports.deleteMember.call(this, 'father', changeMessage);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteMother
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @description remove mother from the relationship
     * @param {String=} changeMessage change message
     * @return {ChildAndParents} this relationship
     */
    $deleteMother: function(changeMessage) {
      exports.deleteMember.call(this, 'mother', changeMessage);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$addFatherFact
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
     * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
     * @return {ChildAndParents} this relationship
     */
    $addFatherFact: function(value) {
      exports.addFact.call(this, 'fatherFacts', value);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$addMotherFact
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
     * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
     * @return {ChildAndParents} this relationship
     */
    $addMotherFact: function(value) {
      exports.addFact.call(this, 'motherFacts', value);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteFatherFact
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @param {Fact|string} value fact or fact id to remove
     * @param {String=} changeMessage change message
     * @return {ChildAndParents} this relationship
     */
    $deleteFatherFact: function(value, changeMessage) {
      exports.deleteFact.call(this, 'fatherFacts', value, changeMessage);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteMotherFact
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @param {Fact|string} value fact or fact id to remove
     * @param {String=} changeMessage change message
     * @return {ChildAndParents} this relationship
     */
    $deleteMotherFact: function(value, changeMessage) {
      exports.deleteFact.call(this, 'motherFacts', value, changeMessage);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$save
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @description
     * Create a new relationship if this relationship does not have an id, or update the existing relationship
     *
     * {@link http://jsfiddle.net/DallanQ/PXN34/ editable example}
     *
     * @param {String=} changeMessage default change message to use when fact/deletion-specific changeMessage was not specified
     * @param {boolean=} refresh true to read the relationship after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the relationship id, which is fulfilled after the relationship has been updated,
     * and if refresh is true, after the relationship has been read
     */
    $save: function(changeMessage, refresh, opts) {
      var postData = new ChildAndParents();
      var isChanged = false;
      var caprid = this.id;

      // TODO don't "push down" attribution to individual conclusions once the global attribution bug has been fixed
      // support attribution at the top-level

      // send father if new or changed
      if (!this.id || this.$fatherChanged) {
        postData.father = this.father;
        isChanged = true;
      }

      // send mother if new or changed
      if (!this.id || this.$motherChanged) {
        postData.mother = this.mother;
        isChanged = true;
      }

      // send child if new (can't change child)
      if (!this.id) {
        postData.child = this.child;
        isChanged = true;
      }

      // send facts if new or changed
      helpers.forEach(['fatherFacts', 'motherFacts'], function(prop) {
        helpers.forEach(this[prop], function(fact) {
          if (!caprid || !fact.id || fact.$changed) {
            // set change message if none set
            if (changeMessage && helpers.attributionNeeded(fact)) {
              fact.$setChangeMessage(changeMessage);
            }
            exports.addFact.call(postData, prop, fact);
            isChanged = true;
          }
        });
      }, this);

      var promises = [];

      // post update
      if (isChanged) {
        promises.push(helpers.chainHttpPromises(
          caprid ? plumbing.getUrl('child-and-parents-relationship-template', null, {caprid: caprid}) :
                   plumbing.getUrl('relationships'),
          function(url) {
            return plumbing.post(url,
              { childAndParentsRelationships: [ postData ] },
              {'Content-Type': 'application/x-fs-v1+json'},
              opts,
              helpers.getResponseEntityId);
          }));
      }

      // post deleted members that haven't been re-set to something else
      helpers.forEach(['father', 'mother'], function(role) {
        if (this.id && this.$deletedMembers && this.$deletedMembers.hasOwnProperty(role) && !this[role]) {
          var msg = this.$deletedMembers[role] || changeMessage; // default to global change message
          promises.push(helpers.chainHttpPromises(
            plumbing.getUrl('child-and-parents-relationship-parent-template', null, {caprid: caprid, role: role}),
            function(url) {
              var headers = {'Content-Type': 'application/x-fs-v1+json'};
              if (msg) {
                headers['X-Reason'] = msg;
              }
              return plumbing.del(url, headers, opts);
            }
          ));
        }
      }, this);

      // post deleted facts
      if (caprid && this.$deletedFacts) {
        helpers.forEach(this.$deletedFacts, function(value, key) {
          value = value || changeMessage; // default to global change message
          var headers = {'Content-Type': 'application/x-fs-v1+json'};
          if (value) {
            headers['X-Reason'] = value;
          }
          promises.push(plumbing.del(key, headers, opts));
        });
      }

      var relationship = this;
      // wait for all promises to be fulfilled
      var promise = helpers.promiseAll(promises).then(function(results) {
        var id = caprid ? caprid : results[0]; // if we're adding a new relationship, get id from the first (only) promise
        helpers.extendHttpPromise(promise, promises[0]); // extend the first promise into the returned promise

        if (refresh) {
          // re-read the relationship and set this object's properties from response
          return exports.getChildAndParents(id, {}, opts).then(function(response) {
            helpers.deleteProperties(relationship);
            helpers.extend(relationship, response.getRelationship());
            return id;
          });
        }
        else {
          return id;
        }
      });
      return promise;
    },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$delete
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @description delete this relationship
     * @param {string} changeMessage change message
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the relationship URL
     */
    $delete: function(changeMessage, opts) {
      return exports.deleteChildAndParents(helpers.removeAccessToken(maybe(maybe(this.links).relationship).href) || this.id, changeMessage, opts);
    }
  };

  /**
   * @ngdoc function
   * @name parentsAndChildren.functions:getChildAndParents
   * @function
   *
   * @description
   * Get information about a child and parents relationship.
   * The response includes the following convenience functions
   *
   * - `getRelationship()` - a {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:constructor.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/C437t/ editable example}
   *
   * @param {String} caprid id or full URL of the child-and-parents relationship
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParents = function(caprid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-template', caprid, {caprid: caprid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.constructorSetter(ChildAndParents, 'childAndParentsRelationships'),
            helpers.objectExtender(childAndParentsConvenienceFunctions),
            helpers.constructorSetter(fact.Fact, 'motherFacts', function(response) {
              return maybe(response).childAndParentsRelationships;
            }),
            helpers.constructorSetter(fact.Fact, 'fatherFacts', function(response) {
              return maybe(response).childAndParentsRelationships;
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return helpers.flatMap(response.childAndParentsRelationships, function(relationship) {
                return helpers.union(relationship.motherFacts, relationship.fatherFacts);
              });
            }),
            globals.personMapper()
          ));
      });
  };

  var childAndParentsConvenienceFunctions = {
    getRelationship: function() { return maybe(this.childAndParentsRelationships)[0]; },
    getPerson:       function(id) { return helpers.find(this.persons, {id: id}); }
  };

  /**
   * @ngdoc function
   * @name parentsAndChildren.functions:deleteChildAndParents
   * @function
   *
   * @description
   * Delete the specified relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/LvUtM/ editable example}
   *
   * @param {string} caprid id or full URL of the child-and-parents relationship
   * @param {string} changeMessage reason for the deletion
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the relationship id/URL
   */
  exports.deleteChildAndParents = function(caprid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-template', caprid, {caprid: caprid}),
      function(url) {
        var headers = {'Content-Type': 'application/x-fs-v1+json'};
        if (changeMessage) {
          headers['X-Reason'] = changeMessage;
        }
        return plumbing.del(url, headers, opts, function() {
          return caprid;
        });
      }
    );
  };

  return exports;
});

define('pedigree',[
  'globals',
  'helpers',
  'plumbing'
], function(globals, helpers, plumbing) {
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
   * @name pedigree.functions:getAncestry
   * @function
   *
   * @description
   * Get the ancestors of a specified person and optionally a specified spouse with the following convenience functions
   *
   * - `getPersons()` - return an array of {@link person.types:constructor.Person Persons}
   * - `getPerson(ascendancyNumber)` - return a {@link person.types:constructor.Person Person}
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
   * @param {string} pid id of the person
   * @param {Object=} params includes `generations` to retrieve max 8, `spouse` id to get ancestry of person and spouse,
   * `personDetails` set to true to retrieve full person objects for each ancestor
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the ancestry
   */
  exports.getAncestry = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('ancestry-query'),
      function(url) {
        return plumbing.get(url, helpers.extend({'person': pid}, params), {}, opts,
          helpers.compose(
            helpers.objectExtender(pedigreeConvenienceFunctionGenerator('ascendancyNumber')),
            globals.personMapper(),
            helpers.objectExtender({getAscendancyNumber: function() { return this.display.ascendancyNumber; }}, function(response) {
              return maybe(response).persons;
            })
          ));
      });
  };

  // TODO add marriageDetails query parameter and convenience functions

  /**
   * @ngdoc function
   * @name pedigree.functions:getDescendancy
   * @function
   *
   * @description
   * Get the descendants of a specified person and optionally a specified spouse with the following convenience functions
   * (similar convenience functions as getAncestry)
   *
   * - `getPersons()` - return an array of {@link person.types:constructor.Person Persons}
   * - `getPerson(descendancyNumber)` - return a {@link person.types:constructor.Person Person}
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
   * @param {string} pid id of the person
   * @param {Object=} params includes `generations` to retrieve max 2, `spouse` id to get descendency of person and spouse
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the descendancy
   */
  exports.getDescendancy = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('descendancy-query'),
      function(url) {
        return plumbing.get(url, helpers.extend({'person': pid}, params), {}, opts,
          helpers.compose(
            helpers.objectExtender(pedigreeConvenienceFunctionGenerator('descendancyNumber')),
            globals.personMapper(),
            helpers.objectExtender({getDescendancyNumber: function() { return this.display.descendancyNumber; }}, function(response) {
              return maybe(response).persons;
            })
          ));
      });
  };

  return exports;
});
define('spouses',[
  'attribution',
  'changeHistory',
  'fact',
  'globals',
  'helpers',
  'parentsAndChildren',
  'plumbing',
  'notes',
  'sources'
], function(attribution, changeHistory, fact, globals, helpers, parentsAndChildren, plumbing, notes, sources) {
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
   * @name spouses.types:constructor.Couple
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
     * @name spouses.types:constructor.Couple#id
     * @propertyOf spouses.types:constructor.Couple
     * @return {String} Id of the relationship
     */

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getFacts
     * @methodOf spouses.types:constructor.Couple
     * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., marriage
     */
    $getFacts: function() { return this.facts || []; },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getMarriageFact
     * @methodOf spouses.types:constructor.Couple
     * @return {Fact} {@link fact.types:constructor.Fact Fact} of type http://gedcomx.org/Marriage (first one if multiple)
     */
    $getMarriageFact: function() { return helpers.find(this.facts, {type: 'http://gedcomx.org/Marriage'}); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getHusbandId
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} Id of the husband
     */
    $getHusbandId: function() { return maybe(this.person1).resourceId; },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getHusbandUrl
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} URL of the husband
     */
    $getHusbandUrl: function() { return helpers.removeAccessToken(maybe(this.person1).resource); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getHusband
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
     */
    $getHusband: function() { return globals.getPerson(this.$getHusbandUrl()); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getWifeId
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} Id of the wife
     */
    $getWifeId: function() { return maybe(this.person2).resourceId; },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getWifeUrl
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} URL of the wife
     */
    $getWifeUrl: function() { return helpers.removeAccessToken(maybe(this.person2).resource); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getWife
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
     */
    $getWife: function() { return globals.getPerson(this.$getWifeUrl()); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getNoteRefs
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link notes.functions:getCoupleNoteRefs getCoupleNoteRefs} response
     */
    $getNoteRefs: function() { return notes.getCoupleNoteRefs(helpers.removeAccessToken(this.links.notes.href)); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getSourceRefs
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link sources.functions:getCoupleSourceRefs getCoupleSourceRefs} response
     */
    $getSourceRefs: function() { return sources.getCoupleSourceRefs(helpers.removeAccessToken(this.links['source-references'].href)); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getChanges
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link sources.functions:getCoupleChanges getCoupleChanges} response
     */
    $getChanges: function() { return changeHistory.getCoupleChanges(helpers.removeAccessToken(maybe(this.links['change-history']).href)); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$setHusband
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
     * @param {Person|string} husband person or URL or id
     * @return {Couple} this relationship
     */
    $setHusband: function(husband) {
      parentsAndChildren.setMember.call(this, 'person1', husband);
      this.$husbandChanged = true;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$setWife
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
     * @param {Person|string} wife person or URL or id
     * @return {Couple} this relationship
     */
    $setWife: function(wife) {
      parentsAndChildren.setMember.call(this, 'person2', wife);
      this.$wifeChanged = true;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$addFact
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
     * @return {Couple} this relationship
     */
    $addFact: function(value) {
      parentsAndChildren.addFact.call(this, 'facts', value);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$deleteFact
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @param {Fact|string} value fact or fact id to remove
     * @param {String=} changeMessage change message
     * @return {Couple} this relationship
     */
    $deleteFact: function(value, changeMessage) {
      parentsAndChildren.deleteFact.call(this, 'facts', value, changeMessage);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$save
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @description
     * Create a new relationship if this relationship does not have an id, or update the existing relationship
     *
     * {@link http://jsfiddle.net/DallanQ/vgS9Q/ editable example}
     *
     * @param {String=} changeMessage default change message to use when fact/deletion-specific changeMessage was not specified
     * @param {boolean=} refresh true to read the relationship after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the relationship id, which is fulfilled after the relationship has been updated,
     * and if refresh is true, after the relationship has been read
     */
    $save: function(changeMessage, refresh, opts) {
      var postData = new Couple();
      var isChanged = false;
      var crid = this.id;

      // TODO don't "push down" attribution to individual conclusions once the global attribution bug has been fixed
      // support attribution at the top-level

      // send husband and wife if new or either has changed
      if (!this.id || this.$husbandChanged || this.$wifeChanged) {
        postData.person1 = this.person1;
        postData.person2 = this.person2;
        isChanged = true;
      }

      helpers.forEach(this.facts, function(fact) {
        if (!crid || !fact.id || fact.$changed) {
          // set change message if none set
          if (changeMessage && helpers.attributionNeeded(fact)) {
            fact.$setChangeMessage(changeMessage);
          }
          parentsAndChildren.addFact.call(postData, 'facts', fact);
          isChanged = true;
        }
      });

      var promises = [];

      // post update
      if (isChanged) {
        promises.push(helpers.chainHttpPromises(
          crid ? plumbing.getUrl('couple-relationship-template', null, {crid: crid}) :
            plumbing.getUrl('relationships'),
          function(url) {
            return plumbing.post(url,
              { relationships: [ postData ] },
              {},
              opts,
              helpers.getResponseEntityId);
          }));
      }

      // post deleted facts
      if (crid && this.$deletedFacts) {
        helpers.forEach(this.$deletedFacts, function(value, key) {
          value = value || changeMessage; // default to global change message
          promises.push(plumbing.del(key, value ? {'X-Reason' : value} : {}, opts));
        });
      }

      var relationship = this;
      // wait for all promises to be fulfilled
      var promise = helpers.promiseAll(promises).then(function(results) {
        var id = crid ? crid : results[0]; // if we're adding a new relationship, get id from the first (only) promise
        helpers.extendHttpPromise(promise, promises[0]); // extend the first promise into the returned promise

        if (refresh) {
          // re-read the relationship and set this object's properties from response
          return exports.getCouple(id, {}, opts).then(function(response) {
            helpers.deleteProperties(relationship);
            helpers.extend(relationship, response.getRelationship());
            return id;
          });
        }
        else {
          return id;
        }
      });
      return promise;
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$delete
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @description delete this relationship
     * @param {string} changeMessage change message
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the relationship URL
     */
    $delete: function(changeMessage, opts) {
      return exports.deleteCouple(helpers.removeAccessToken(maybe(maybe(this.links).relationship).href) || this.id, changeMessage, opts);
    }
  };

  /**
   * @ngdoc function
   * @name spouses.functions:getCouple
   * @function
   *
   * @description
   * Get information about a couple relationship
   * The response includes the following convenience functions
   *
   * - `getRelationship()` - a {@link spouses.types:constructor.Couple Couple} relationship
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:constructor.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/a2vUg/ editable example}
   *
   * @param {String} crid id or full URL of the couple relationship
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCouple = function(crid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-template', crid, {crid: crid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.constructorSetter(Couple, 'relationships'),
            helpers.objectExtender(coupleConvenienceFunctions),
            helpers.constructorSetter(fact.Fact, 'facts', function(response) {
              return maybe(response).relationships;
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return helpers.flatMap(response.relationships, function(relationship) {
                return relationship.facts;
              });
            }),
            globals.personMapper()
          ));
      });
  };

  var coupleConvenienceFunctions = {
    getRelationship: function() { return maybe(this.relationships)[0]; },
    getPerson:       function(id) { return helpers.find(this.persons, {id: id}); }
  };

  /**
   * @ngdoc function
   * @name parentsAndChildren.functions:deleteCouple
   * @function
   *
   * @description
   * Delete the specified relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ypHgL/ editable example}
   *
   * @param {string} crid id or full URL of the couple relationship
   * @param {string} changeMessage reason for the deletion
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the relationship id/URL
   */
  exports.deleteCouple = function(crid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-template', crid, {crid: crid}),
      function(url) {
        return plumbing.del(url, changeMessage ? {'X-Reason' : changeMessage} : {}, opts, function() {
          return crid;
        });
      }
    );
  };

  return exports;
});

define('person',[
  'attribution',
  'changeHistory',
  'discussions',
  'fact',
  'globals',
  'helpers',
  'memories',
  'name',
  'notes',
  'parentsAndChildren',
  'plumbing',
  'sources',
  'spouses'
], function(attribution, changeHistory, discussions, fact, globals, helpers, memories, name, notes, parentsAndChildren, plumbing, sources, spouses) {
  /**
   * @ngdoc overview
   * @name person
   * @description
   * Functions related to persons
   *
   * {@link https://familysearch.org/developers/docs/api/resources#person FamilySearch API Docs}
   */

  //
  // NOTE I've had to make a few things global in this file: Person, getPerson, and personMapper
  // This is so parentsAndChildren and spouses and memories can access them; otherwise we'd have circular dependencies
  //

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  // TODO see if upgrading to grunt-ngdocs 0.2.1 will allow links to _methods_ like $save and $delete

  /**********************************/
  /**
   * @ngdoc function
   * @name person.types:constructor.Person
   * @description
   *
   * Person
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
   *
   * Two methods to note below are _$save_ and _$delete_. _$save_ saves the various adds, deletes, and updates
   * made to names, facts, and gender; _$delete_ removes the person.
   **********************************/

  var Person = globals.Person = exports.Person = function() {
  };

  function spacePrefix(namePiece) {
    return namePiece ? ' ' + namePiece : '';
  }

  exports.Person.prototype = {
    constructor: Person,
    /**
     * @ngdoc property
     * @name person.types:constructor.Person#id
     * @propertyOf person.types:constructor.Person
     * @return {String} Id of the person
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Person#living
     * @propertyOf person.types:constructor.Person
     * @return {Boolean} true or false
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Person#display
     * @propertyOf person.types:constructor.Person
     * @return {Object} includes `birthDate`, `birthPlace`, `deathDate`, `deathPlace`, `gender`, `lifespan`, and `name` attributes
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Person#identifers
     * @propertyOf person.types:constructor.Person
     * @return {Object} map of identifers to arrays of values
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Person#gender
     * @propertyOf person.types:constructor.Person
     * @return {Object} gender conclusion with id, type (value), and attribution
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Person#attribution
     * @propertyOf person.types:constructor.Person
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getFacts
     * @methodOf person.types:constructor.Person
     * @function
     * @param {string=} type if present, return only facts with this type
     * @return {Fact[]} an array of {@link fact.types:constructor.Fact Facts}
     */
    $getFacts: function(type) {
      return (type ? helpers.filter(this.facts, {type: type}) : this.facts) || [];
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getFact
     * @methodOf person.types:constructor.Person
     * @function
     * @param {string} type fact type; e.g., http://gedcomx.org/Birth
     * @return {Fact} return first {@link fact.types:constructor.Fact Fact} having specified type
     */
    $getFact: function(type) {
      return helpers.find(this.facts, {type: type});
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBirth
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Fact} Birth {@link fact.types:constructor.Fact Fact}
     */
    $getBirth: function() {
      return this.$getFact('http://gedcomx.org/Birth');
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBirthDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Birth date
     */
    $getBirthDate: function() {
      var fact = this.$getBirth();
      return fact ? fact.$getDate() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBirthPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Birth place
     */
    $getBirthPlace: function() {
      var fact = this.$getBirth();
      return fact ? fact.$getPlace() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getChristening
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Fact} Christening {@link fact.types:constructor.Fact Fact}
     */
    $getChristening: function() {
      return this.$getFact('http://gedcomx.org/Christening');
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getChristeningDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Christening date
     */
    $getChristeningDate: function() {
      var fact = this.$getChristening();
      return fact ? fact.$getDate() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getChristeningPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Christning place
     */
    $getChristeningPlace: function() {
      var fact = this.$getChristening();
      return fact ? fact.$getPlace() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDeath
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Fact} Death {@link fact.types:constructor.Fact Fact}
     */
    $getDeath: function() {
      return this.$getFact('http://gedcomx.org/Death');
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDeathDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Death date
     */
    $getDeathDate: function() {
      var fact = this.$getDeath();
      return fact ? fact.$getDate() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDeathPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Death place
     */
    $getDeathPlace: function() {
      var fact = this.$getDeath();
      return fact ? fact.$getPlace() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBurial
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Fact} Burial {@link fact.types:constructor.Fact Fact}
     */
    $getBurial: function() {
      return this.$getFact('http://gedcomx.org/Burial');
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBurialDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Burial date
     */
    $getBurialDate: function() {
      var fact = this.$getBurial();
      return fact ? fact.$getDate() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBurialPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Birth place
     */
    $getBurialPlace: function() {
      var fact = this.$getBurial();
      return fact ? fact.$getPlace() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayBirthDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} birth date
     */
    $getDisplayBirthDate: function() { return maybe(this.display).birthDate; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayBirthPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} birth place
     */
    $getDisplayBirthPlace: function() { return maybe(this.display).birthPlace; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayDeathDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} death date
     */
    $getDisplayDeathDate: function() { return maybe(this.display).deathDate; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayDeathPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} death place
     */
    $getDisplayDeathPlace: function() { return maybe(this.display).deathPlace; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayGender
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} gender - Male or Female
     */
    $getDisplayGender: function() { return maybe(this.display).gender; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayLifeSpan
     * @methodOf person.types:constructor.Person
     * @function
     * @returns {string} birth year - death year
     */
    $getDisplayLifeSpan: function() { return maybe(this.display).lifespan; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayName
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} display name
     */
    $getDisplayName: function() { return maybe(this.display).name; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getNames
     * @methodOf person.types:constructor.Person
     * @function
     * @param {string=} type if present, return only names with this type
     * @return {Name[]} an array of {@link name.types:constructor.Name Names}
     */
    $getNames: function(type) {
      return (type ? helpers.filter(this.names, {type: type}) : this.names) || [];
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getPreferredName
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} preferred {@link name.types:constructor.Name Name}
     */
    $getPreferredName: function() { return helpers.findOrFirst(this.names, {preferred: true}); },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getGivenName
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} preferred given name
     */
    $getGivenName: function() {
      var name = this.$getPreferredName();
      if (name) {
        name = name.$getGivenName();
      }
      return name;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getSurname
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} preferred surname
     */
    $getSurname: function() {
      var name = this.$getPreferredName();
      if (name) {
        name = name.$getSurname();
      }
      return name;
    },

    // TODO add unit tests for the following functions

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getPersistentIdentifier
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} persistent identifier
     */
    $getPersistentIdentifier: function() { return maybe(maybe(this.identifiers)['http://gedcomx.org/Persistent'])[0]; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getUrl
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} Url of the person
     */
    $getUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).person).href); },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getChanges
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Object=} params `count` is the number of change entries to return, `from` to return changes following this id
     * @return {Object} promise for the {@link changeHistory.functions:getPersonChanges getPersonChanges} response
     */
    $getChanges: function(params) {
      return changeHistory.getPersonChanges(helpers.removeAccessToken(this.links['change-history'].href), params);
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDiscussionRefs
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link discussions.functions:getPersonDiscussionRefs getPersonDiscussionRefs} response
     */
    $getDiscussionRefs: function() {
      return discussions.getPersonDiscussionRefs(helpers.removeAccessToken(this.links['discussion-references'].href));
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getMemoryPersonaRefs
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link memories.functions:getMemoryPersonaRefs getMemoryPersonaRefs} response
     */
    $getMemoryPersonaRefs: function() {
      return memories.getMemoryPersonaRefs(helpers.removeAccessToken(this.links['evidence-references'].href));
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getNoteRefs
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link notes.functions:getPersonNoteRefs getPersonNoteRefs} response
     */
    $getNoteRefs: function() {
      return notes.getPersonNoteRefs(helpers.removeAccessToken(this.links['notes'].href));
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getSourceRefs
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link sources.functions:getPersonSourceRefs getPersonSourceRefs} response
     */
    $getPersonSourceRefs: function() {
      return sources.getPersonSourceRefs(helpers.removeAccessToken(this.links['source-references'].href));
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getSpouses
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link person.functions:getSpouses getSpouses} response
     */
    $getSpouses: function() {
      return exports.getSpouses(this.id);
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getParents
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link person.functions:getParents getParents} response
     */
    $getParents: function() {
      return exports.getParents(this.id);
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getChildren
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link person.functions:getChildren getChildren} response
     */
    $getChildren: function() {
      return exports.getChildren(this.id);
    },

    // TODO add links to ancestry, descendancy, person-with-relationships, matches, portrait

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$addName
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Name|Object|string} value name to add; if value is not a Name, it is passed into the Name constructor
     * @return {Person} this person
     */
    $addName: function(value) {
      if (!helpers.isArray(this.names)) {
        this.names = [];
      }
      if (!(value instanceof name.Name)) {
        value = new name.Name(value);
      }
      this.names.push(value);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$deleteName
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Name|string} value name or name id to remove
     * @param {String=} changeMessage change message
     * @return {Person} this person
     */
    $deleteName: function(value, changeMessage) {
      if (!(value instanceof name.Name)) {
        value = helpers.find(this.names, { id: value });
      }
      var pos = helpers.indexOf(this.names, value);
      if (pos >= 0) {
        // add name to $deleted map
        if (!this.$deletedConclusions) {
          this.$deletedConclusions = {};
        }
        this.$deletedConclusions[value.id] = changeMessage;
        // remove name from array
        this.names.splice(pos,1);
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$addFact
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
     * @return {Person} this person
     */
    $addFact: function(value) {
      if (!helpers.isArray(this.facts)) {
        this.facts = [];
      }
      if (!(value instanceof fact.Fact)) {
        value = new fact.Fact(value);
      }
      this.facts.push(value);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$deleteFact
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Fact|string} value fact or fact id to remove
     * @param {String=} changeMessage change message
     * @return {Person} this person
     */
    $deleteFact: function(value, changeMessage) {
      if (!(value instanceof fact.Fact)) {
        value = helpers.find(this.facts, { id: value });
      }
      var pos = helpers.indexOf(this.facts, value);
      if (pos >= 0) {
        // add fact to $deleted map
        if (!this.$deletedConclusions) {
          this.$deletedConclusions = {};
        }
        this.$deletedConclusions[value.id] = changeMessage;
        // remove fact from array
        this.facts.splice(pos,1);
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$setGender
     * @methodOf person.types:constructor.Person
     * @function
     * @param {String} gender e.g., http://gedcomx.org/Female
     * @param {String=} changeMessage change message
     * @return {Person} this person
     */
    $setGender: function(gender, changeMessage) {
      if (!this.gender) {
        this.gender = {};
      }
      this.gender.$changed = true;
      this.gender.type = gender;
      if (changeMessage) {
        this.gender.attribution = new attribution.Attribution(changeMessage);
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$save
     * @methodOf person.types:constructor.Person
     * @function
     * @description
     * Create a new person (if this person does not have an id) or update the existing person
     *
     * {@link http://jsfiddle.net/DallanQ/CM3Lz/ editable example}
     *
     * @param {String=} changeMessage default change message to use when name/fact/gender-specific changeMessage is not specified
     * @param {boolean=} refresh true to read the person after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the person id, which is fulfilled after person has been updated,
     * and if refresh is true, after the person has been read
     */
    $save: function(changeMessage, refresh, opts) {
      var postData = new Person();
      var isChanged = false;
      if (this.id) {
        postData.id = this.id; // updating existing person
      }

      // TODO don't "push down" attribution to individual conclusions once the global attribution bug has been fixed

      // if person is new, default a few things
      if (!this.id) {
        // default gender to unknown
        if (!this.gender) {
          this.$setGender('http://gedcomx.org/Unknown');
        }
        // default name to Unknown if no names
        if (!helpers.isArray(this.names) || this.names.length === 0) {
          this.$addName({fullText: 'Unknown', givenName: 'Unknown'});
        }
        // default first name to preferred if no names are preferred
        if (!helpers.find(this.names, {preferred: true})) {
          this.names[0].$setPreferred(true);
        }
        // default name type to birth name if there is only one name
        if (this.names.length === 1 && !this.names[0].type) {
          this.names[0].$setType('http://gedcomx.org/BirthName');
        }
      }

      // send gender if gender is new or changed
      if (this.gender && (!this.gender.id || this.gender.$changed)) {
        // set change message if none set
        if (changeMessage && helpers.attributionNeeded(this.gender)) {
          this.gender.attribution = new attribution.Attribution(changeMessage);
        }
        postData.gender = this.gender;
        isChanged = true;
      }

      // send names that are new or updated
      helpers.forEach(this.names, function(name) {
        if (!name.id || name.$changed) {
          // default full text if not set
          if (!name.$getFullText()) {
            name.$setFullText((spacePrefix(name.$getPrefix()) + spacePrefix(name.$getGivenName()) +
                               spacePrefix(name.$getSurname()) + spacePrefix(name.$getSuffix())).trim());
          }
          // set change message if none set
          if (changeMessage && helpers.attributionNeeded(name)) {
            name.$setChangeMessage(changeMessage);
          }
          postData.$addName(name);
          isChanged = true;
        }
      });

      // send facts that are new or updated
      helpers.forEach(this.facts, function(fact) {
        if (!fact.id || fact.$changed) {
          // set change message if none set
          if (changeMessage && helpers.attributionNeeded(fact)) {
            fact.$setChangeMessage(changeMessage);
          }
          postData.$addFact(fact);
          isChanged = true;
        }
      });

      var promises = [];

      // post update
      if (isChanged) {
        promises.push(helpers.chainHttpPromises(
          postData.id ? plumbing.getUrl('person-template', null, {pid: postData.id}) : plumbing.getUrl('persons'),
          function(url) {
            return plumbing.post(url, { persons: [ postData ] }, {}, opts, helpers.getResponseEntityId);
          }));
      }

      // post deletions
      if (this.id && this.$deletedConclusions) {
        helpers.forEach(this.$deletedConclusions, function(value, key) {
          value = value || changeMessage; // default to global change message
          promises.push(helpers.chainHttpPromises(
            plumbing.getUrl('person-conclusion-template', null, {pid: postData.id, cid: key}),
            function(url) {
              return plumbing.del(url, value ? {'X-Reason': value} : {}, opts);
            }
          ));
        });
      }

      var person = this;
      // wait for all promises to be fulfilled
      var promise = helpers.promiseAll(promises).then(function(results) {
        var id = postData.id ? postData.id : results[0]; // if we're adding a new person, get id from the first (only) promise
        helpers.extendHttpPromise(promise, promises[0]); // extend the first promise into the returned promise

        if (refresh) {
          // re-read the person and set this object's properties from response
          return exports.getPerson(id, {}, opts).then(function(response) {
            helpers.deleteProperties(person);
            helpers.extend(person, response.getPerson());
            return id;
          });
        }
        else {
          return id;
        }
      });
      return promise;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$delete
     * @methodOf person.types:constructor.Person
     * @function
     * @description delete this person
     * @param {string} changeMessage change message
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the person URL
     */
    $delete: function(changeMessage, opts) {
      return exports.deletePerson(helpers.removeAccessToken(maybe(maybe(this.links).person).href) || this.id, changeMessage, opts);
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$addMemoryPersonaRef
     * @methodOf person.types:constructor.Person
     * @function
     * @param {MemoryPersonaRef} memoryPersonaRef reference to the memory persona
     * @param {Object=} params `changeMessage` change message
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the persona URL
     */
    $addMemoryPersonaRef: function(memoryPersonaRef, params, opts) {
      return memories.addMemoryPersonaRef(this.id, memoryPersonaRef, params, opts);
    }
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
   * - `getPerson()` - get the {@link person.types:constructor.Person Person} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/cST4L/ editable example}
   *
   * @param {String} pid id or full URL of the person
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  globals.getPerson = exports.getPerson = function(pid, params, opts) { // put on globals so parentsAndChildren and spouses
                                                                        // and searchAndMatch can access it
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getPerson: function() { return this.persons[0]; }}),
            exports.personMapper()
          ));
      });
  };

  /**
   * Return a function that maps a response into a response with Person, Name, and Fact objects
   * @param {Function=} subObjectGenerator generate sub-objects corresponding to parents of persons; used by search/match functions
   * @returns {Function}
   */
  globals.personMapper = exports.personMapper = function(subObjectGenerator) { // put on globals so parentsAndChildren and spouses
                                                                               // and searchAndMatch and pedigree can access it
    var personsGenerator = function(response) {
      return helpers.flatMap(subObjectGenerator ? subObjectGenerator(response) : [response], function(root) {
        return root.persons;
      });
    };
    return helpers.compose(
      helpers.constructorSetter(Person, 'persons', subObjectGenerator),
      helpers.constructorSetter(name.Name, 'names', personsGenerator),
      helpers.constructorSetter(fact.Fact, 'facts', personsGenerator),
      helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
        return helpers.flatMap(personsGenerator(response), function(person) {
          return helpers.union(
            [person],
            person.names,
            person.facts,
            person.gender ? [person.gender] : []
          );
        });
      })
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
   * @return {Object} promise that is fulfilled when all of the people have been read,
   * returning a map of person id to {@link person.functions:getPerson getPerson} response
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
   * - `getParentRelationships()` - array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship objects
   * - `getSpouseRelationships()` - array of {@link spouses.types:constructor.Couple Couple} relationship objects
   * - `getSpouseRelationship(spouseId)` - {@link spouses.types:constructor.Couple Couple} relationship with the specified spouse
   * - `getChildRelationships()` - array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship objects
   * - `getChildRelationshipsOf(spouseId)` - array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship objects
   * if `spouseId` is null/undefined, return ids of child relationships without the other parent
   * - `getPrimaryPerson()` - {@link person.types:constructor.Person Person} object for the primary person
   *
   * In addition, the following functions are available if persons is set to true in params
   *
   * - `getPerson(id)` - {@link person.types:constructor.Person Person} object for the person with `id`
   * - `getFathers()` - array of father {@link person.types:constructor.Person Persons}
   * - `getMothers()` - array of mother {@link person.types:constructor.Person Persons}
   * - `getSpouses()` - array of spouse {@link person.types:constructor.Person Persons}
   * - `getChildren()` - array of all child {@link person.types:constructor.Person Persons};
   * - `getChildrenOf(spouseId)` - array of child {@link person.types:constructor.Person Persons};
   * if `spouseId` is null/undefined, return children without the other parent
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_With_Relationships_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/5Npsh/ editable example}
   *
   * @param {String} pid id of the person
   * @param {Object=} params set `persons` to true to retrieve full person objects for each relative
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person with relationships
   */
  exports.getPersonWithRelationships = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-with-relationships-query'),
      function(url) {
        return plumbing.get(url, helpers.extend({'person': pid}, params), {}, opts,
          helpers.compose(
            helpers.objectExtender({getPrimaryId: function() { return pid; }}), // make id available
            helpers.constructorSetter(fact.Fact, 'fatherFacts', function(response) {
              return response.childAndParentsRelationships;
            }),
            helpers.constructorSetter(fact.Fact, 'motherFacts', function(response) {
              return response.childAndParentsRelationships;
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return helpers.flatMap(response.childAndParentsRelationships, function(rel) {
                return helpers.union(rel.fatherFacts, rel.motherFacts);
              });
            }),
            helpers.constructorSetter(fact.Fact, 'facts', function(response) {
              return response.relationships;
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return helpers.flatMap(response.relationships, function(rel) {
                return rel.facts;
              });
            }),
            helpers.constructorSetter(parentsAndChildren.ChildAndParents, 'childAndParentsRelationships'),
            helpers.constructorSetter(spouses.Couple, 'relationships'), // some of the relationships are ParentChild relationships, but
            // we don't have a way to change the constructor on only some elements of the array
            helpers.objectExtender(personWithRelationshipsConvenienceFunctions),
            exports.personMapper()
          ));
      });
  };

  // Functions to extract various pieces of the response
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
          (primaryId === r.$getHusbandId() ? r.$getWifeId() : r.$getHusbandId()) === spouseId;
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
          return !!r.$getFatherId();
        }),
        function(r) {
          return r.$getFatherId();
        }, this));
    },
    getFathers:    function() { return helpers.map(this.getFatherIds(), this.getPerson, this); },
    getMotherIds:  function() {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getParentRelationships(), function(r) {
          return !!r.$getMotherId();
        }),
        function(r) {
          return r.$getMotherId();
        }, this));
    },
    getMothers:    function() { return helpers.map(this.getMotherIds(), this.getPerson, this); },
    getSpouseIds:  function() {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getSpouseRelationships(), function(r) {
          return r.$getHusbandId() && r.$getWifeId(); // only consider couple relationships with both spouses
        }),
        function(r) {
          return this.getPrimaryId() === r.$getHusbandId() ? r.$getWifeId() : r.$getHusbandId();
        }, this));
    },
    getSpouses:    function() { return helpers.map(this.getSpouseIds(), this.getPerson, this); },
    getChildIds:   function() {
      return helpers.uniq(helpers.map(this.getChildRelationships(),
        function(r) {
          return r.$getChildId();
        }, this));
    },
    getChildren:   function() { return helpers.map(this.getChildIds(), this.getPerson, this); },
    getChildIdsOf:   function(spouseId) {
      return helpers.uniq(helpers.map(this.getChildRelationshipsOf(spouseId),
        function(r) {
          return r.$getChildId();
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
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * **NOTE The sandbox REST endpoint for this function is broken. Do not use.**
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_Summary_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ga37h/ editable example}
   *
   * @param {String} pid id of the person or full URL of the person-change-summary endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  // TODO check if this has been fixed, and check if the entries really contain changeInfo and contributors attributes
  exports.getPersonChangeSummary = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-change-summary-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getChanges: function() { return this.entries || []; }}),
            helpers.constructorSetter(changeHistory.Change, 'entries')));
      });
  };

  var relationshipsResponseMapper = helpers.compose(
    helpers.constructorSetter(spouses.Couple, 'relationships'),
    helpers.constructorSetter(parentsAndChildren.ChildAndParents, 'childAndParentsRelationships'),
    helpers.objectExtender({
      getCoupleRelationships: function() { return helpers.filter(this.relationships, {type: 'http://gedcomx.org/Couple'}) || []; },
      getChildAndParentsRelationships: function() { return this.childAndParentsRelationships || []; },
      getPerson:    function(id) { return helpers.find(this.persons, {id: id}); }
    }),
    helpers.constructorSetter(fact.Fact, 'facts', function(response) {
      return response.relationships;
    }),
    helpers.constructorSetter(fact.Fact, 'fatherFacts', function(response) {
      return response.childAndParentsRelationships;
    }),
    helpers.constructorSetter(fact.Fact, 'motherFacts', function(response) {
      return response.childAndParentsRelationships;
    }),
    helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
      return helpers.union(
        helpers.flatMap(response.relationships, function(rel) {
          return rel.facts;
        }),
        helpers.flatMap(response.childAndParentsRelationships, function(rel) {
          return helpers.union(rel.fatherFacts, rel.motherFacts);
        }));
    }),
    exports.personMapper()
  );

  /**
   * @ngdoc function
   * @name person.functions:getSpouses
   * @function
   *
   * @description
   * Get the relationships to a person's spouses.
   * The response includes the following convenience functions
   *
   * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents}
   * relationships for children of the couples
   * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship except children
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Spouses_of_a_Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/7zLEJ/ editable example}
   *
   * @param {String} pid id of the person or full URL of the spouses endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSpouses = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('spouses-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts, relationshipsResponseMapper);
      });
  };

  /**
   * @ngdoc function
   * @name person.functions:getParents
   * @function
   *
   * @description
   * Get the relationships to a person's parents.
   * The response includes the following convenience functions
   *
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
   * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships for parents
   * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Parents_of_a_person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/L3U3j/ editable example}
   *
   * @param {String} pid id of the person or full URL of the parents endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getParents = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('parents-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts, relationshipsResponseMapper);
      });
  };

  /**
   * @ngdoc function
   * @name person.functions:getChildren
   * @function
   *
   * @description
   * Get the relationships to a person's children
   * The response includes the following convenience functions
   *
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
   * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Children_of_a_person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/F8wVM/ editable example}
   *
   * @param {String} pid id of the person or full URL of the children endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildren = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('children-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts, relationshipsResponseMapper);
      });
  };

  /**
   * @ngdoc function
   * @name person.functions:deletePerson
   * @function
   *
   * @description
   * Delete the specified person
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/N9kzf/ editable example}
   *
   * @param {string} pid id or full URL of the person
   * @param {string} changeMessage reason for the deletion
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person id/URL
   */
  exports.deletePerson = function(pid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-template', pid, {pid: pid}),
      function(url) {
        return plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
          return pid;
        });
      }
    );
  };

  // TODO getPersonMerge
  // TODO getPersonNotAMatch
  // TODO getPreferredSpouse
  // TODO getPreferredParent

  return exports;
});

define('searchAndMatch',[
  'globals',
  'helpers',
  'plumbing'
], function(globals, helpers, plumbing) {
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
   * @name searchAndMatch.types:constructor.SearchResult
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
     * @name searchAndMatch.types:constructor.SearchResult#id
     * @propertyOf searchAndMatch.types:constructor.SearchResult
     * @return {String} Id of the person for this search result
     */

    /**
     * @ngdoc property
     * @name searchAndMatch.types:constructor.SearchResult#title
     * @propertyOf searchAndMatch.types:constructor.SearchResult
     * @return {String} Id and name
     */

    /**
     * @ngdoc property
     * @name searchAndMatch.types:constructor.SearchResult#score
     * @propertyOf searchAndMatch.types:constructor.SearchResult
     * @return {Number} higher is better
     */

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getPerson
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @description
     *
     * **Note: Be aware that the `Person` objects returned from SearchResults do not have as much information
     * as `Person` objects returned from the various person and pedigree functions.**
     *
     * @param {string} pid id of the person
     * @return {Person} the {@link person.types:constructor.Person Person} for this Id in this search result
     */
    $getPerson: function(pid) {
      return helpers.find(maybe(maybe(this.content).gedcomx).persons, {id: pid});
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getPrimaryPerson
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Person} the primary {@link person.types:constructor.Person Person} for this search result
     */
    $getPrimaryPerson: function() {
      return this.$getPerson(this.id);
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getFullPrimaryPerson
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
     */
    $getFullPrimaryPerson: function() { return globals.getPerson(this.id); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getFatherIds
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {String[]} array of father Id's for this search result
     */
    $getFatherIds: function() {
      var primaryId = this.id, self = this;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/ParentChild' &&
            r.person2.resourceId === primaryId &&
            r.person1 &&
            maybe(self.$getPerson(r.person1.resourceId).gender).type === 'http://gedcomx.org/Male';
        }),
        function(r) { return r.person1.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getFathers
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Person[]} array of father {@link person.types:constructor.Person Persons} for this search result
     */
    $getFathers: function() { return helpers.map(this.$getFatherIds(), this.$getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getMotherIds
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {String[]} array of mother Id's for this search result
     */
    $getMotherIds: function() {
      var primaryId = this.id, self = this;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/ParentChild' &&
            r.person2.resourceId === primaryId &&
            r.person1 &&
            maybe(self.$getPerson(r.person1.resourceId).gender).type !== 'http://gedcomx.org/Male';
        }),
        function(r) { return r.person1.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getMothers
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Person[]} array of mother {@link person.types:constructor.Person Persons} for this search result
     */
    $getMothers: function() { return helpers.map(this.$getMotherIds(), this.$getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getSpouseIds
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {String[]} array of spouse Id's for this search result
     */
    $getSpouseIds:  function() {
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
     * @name searchAndMatch.types:constructor.SearchResult#$getSpouses
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Person[]} array of spouse {@link person.types:constructor.Person Persons} for this search result
     */
    $getSpouses: function() { return helpers.map(this.$getSpouseIds(), this.$getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getChildIds
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {String[]} array of child Id's for this search result
     */
    $getChildIds:  function() {
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
     * @name searchAndMatch.types:constructor.SearchResult#$getChildren
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Person[]} array of spouse {@link person.types:constructor.Person Persons} for this search result
     */
    $getChildren: function() { return helpers.map(this.$getChildIds(), this.$getPerson, this); }
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

  function getSearchMatchResponseMapper() {
    return helpers.compose(
      helpers.objectExtender(searchMatchResponseConvenienceFunctions),
      helpers.constructorSetter(SearchResult, 'entries'),
      globals.personMapper(function(response) {
        return helpers.map(maybe(response).entries, function(entry) {
          return maybe(entry.content).gedcomx;
        });
      }));
  }

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
   * - `getSearchResults()` - get the array of {@link searchAndMatch.types:constructor.SearchResult SearchResults} from the response
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
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-search'),
      function(url) {
        return plumbing.get(url, helpers.removeEmptyProperties({
            q: getQuery(params),
            start: params.start,
            count: params.count,
            context: params.context
          }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          helpers.compose(
            getSearchMatchResponseMapper(),
            function(obj, promise) {
              obj.getContext = function() {
                return promise.getResponseHeader('X-FS-Page-Context');
              };
              return obj;
            }
          )
        );
      });
  };

  /**
   * @ngdoc function
   * @name searchAndMatch.functions:getPersonMatches
   * @function
   *
   * @description
   * Get the matches (possible duplicates) for a person
   * The response includes the following convenience function
   *
   * - `getSearchResults()` - get the array of {@link searchAndMatch.types:constructor.SearchResult SearchResults} from the response
   * - `getResultsCount()` - get the total number of search results
   * - `getIndex()` - get the starting index of the results array
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Matches_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/5uwyf/ editable example}
   *
   * @param {String} pid id of the person or full URL of the person-matches endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMatches = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-matches-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          getSearchMatchResponseMapper());
      });
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
   * - `getSearchResults()` - get the array of {@link searchAndMatch.types:constructor.SearchResult SearchResults} from the response
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
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-matches-query'),
      function(url) {
        return plumbing.get(url, helpers.removeEmptyProperties({
            q: getQuery(params),
            start: params.start,
            count: params.count
          }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          getSearchMatchResponseMapper());
      });
  };

  return exports;
});

define('sourceBox',[
  'attribution',
  'helpers',
  'plumbing',
  'sources'
], function(attribution, helpers, plumbing, sources) {
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
   * @name sourceBox.types:constructor.Collection
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
     * @name sourceBox.types:constructor.Collection#id
     * @propertyOf sourceBox.types:constructor.Collection
     * @return {String} Id of the collection
     */

    /**
     * @ngdoc property
     * @name sourceBox.types:constructor.Collection#title
     * @propertyOf sourceBox.types:constructor.Collection
     * @return {String} title of the collection folder
     */

    /**
     * @ngdoc property
     * @name sourceBox.types:constructor.Collection#size
     * @propertyOf sourceBox.types:constructor.Collection
     * @return {Number} number of sources in the collection
     */

    /**
     * @ngdoc property
     * @name sourceBox.types:constructor.Collection#attribution
     * @propertyOf sourceBox.types:constructor.Collection
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name sourceBox.types:constructor.Collection#$getSourceDescriptions
     * @methodOf sourceBox.types:constructor.Collection
     * @function
     * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
     * @return {Object} promise for the {@link sourceBox.functions:getCollectionSourceDescriptions getCollectionSourceDescriptions} response
     */
    $getSourceDescriptions: function(params) {
      return exports.getCollectionSourceDescriptions(helpers.removeAccessToken(this.links['source-descriptions'].href), params);
    }
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
   * - `getCollections()` - get an array of {@link sourceBox.types:constructor.Collection Collections} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_for_a_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/et88N/ editable example}
   *
   * @param {String} uid of the user or full URL of the collections-for-user endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionsForUser = function(uid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-collections-for-user-template', uid, {uid: uid}),
      function(url) {
        return plumbing.get(url, {}, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getCollections: function() { return this.collections || []; }}),
            helpers.constructorSetter(Collection, 'collections'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.collections;
            })
          ));
      });
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
   * - `getCollection()` - get a {@link sourceBox.types:constructor.Collection Collection} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/h5wCt/ editable example}
   *
   * @param {String} udcid id or full URL of the collection
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollection = function(udcid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-collection-template', udcid, {udcid: udcid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getCollection: function() { return maybe(this.collections)[0]; }}),
            helpers.constructorSetter(Collection, 'collections'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.collections;
            })
          ));
      });
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
   * - `getSourceDescriptions()` - get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_Source_Descriptions_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/7yDmE/ editable example}
   *
   * @param {String} udcid id of the collection or full URL of the collection-source-descriptions endpoint
   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionSourceDescriptions = function(udcid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-collection-source-descriptions-template', udcid, {udcid: udcid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getSourceDescriptions: function() { return this.sourceDescriptions || []; }}),
            helpers.constructorSetter(sources.SourceDescription, 'sourceDescriptions'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.sourceDescriptions;
            })
          ));
      });
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
   * - `getSourceDescriptions()` - get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_Source_Descriptions_for_a_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/4TSxJ/ editable example}
   *
   * @param {String} uid of the user or full URL of the collection-source-descriptions-for-user endpoint
   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionSourceDescriptionsForUser = function(uid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-collections-source-descriptions-for-user-template', uid, {uid: uid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getSourceDescriptions: function() { return this.sourceDescriptions || []; }}),
            helpers.constructorSetter(sources.SourceDescription, 'sourceDescriptions'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.sourceDescriptions;
            })
          ));
      });
  };

  return exports;
});

define('FamilySearch',[
  'init',
  'authentication',
  'authorities',
  'changeHistory',
  'discussions',
  'fact',
  'memories',
  'name',
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
], function(init, authentication, authorities, changeHistory, discussions, fact, memories, name, notes, parentsAndChildren, pedigree, person,
            searchAndMatch, sourceBox, sources, spouses, user, plumbing) {
  return {
    init: init.init,

    // authentication
    getAuthCode: authentication.getAuthCode,
    getAccessToken: authentication.getAccessToken,
    getAccessTokenForMobile: authentication.getAccessTokenForMobile,
    hasAccessToken: authentication.hasAccessToken,
    invalidateAccessToken: authentication.invalidateAccessToken,

    // authorities
    Date: authorities.Date,
    Place: authorities.Place,
    getDate: authorities.getDate,
    getPlace: authorities.getPlace,

    // changeHistory
    Change: changeHistory.Change,
    getPersonChanges: changeHistory.getPersonChanges,
    getChildAndParentsChanges: changeHistory.getChildAndParentsChanges,
    getCoupleChanges: changeHistory.getCoupleChanges,

    // TODO discovery

    // discussions
    Discussion: discussions.Discussion,
    DiscussionRef: discussions.DiscussionRef,
    Comment: discussions.Comment,
    getPersonDiscussionRefs: discussions.getPersonDiscussionRefs,
    getDiscussion: discussions.getDiscussion,
    getMultiDiscussion: discussions.getMultiDiscussion,
    getComments: discussions.getComments,

    // fact
    Fact: fact.Fact,

    // memories
    Memory: memories.Memory,
    MemoryPersonaRef: memories.MemoryPersonaRef,
    MemoryPersona: memories.MemoryPersona,
    getMemoryPersonaRefs: memories.getMemoryPersonaRefs,
    getMemory: memories.getMemory,
    getMemoryComments: memories.getMemoryComments,
    getMemoryPersonas: memories.getMemoryPersonas,
    getPersonPortraitUrl: memories.getPersonPortraitUrl,
    getPersonMemoriesQuery: memories.getPersonMemoriesQuery,
    getUserMemoriesQuery: memories.getUserMemoriesQuery,
    createMemory: memories.createMemory,
    addMemoryPersona: memories.addMemoryPersona,
    addMemoryPersonaRef: memories.addMemoryPersonaRef,

    // name
    Name: name.Name,

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
    ChildAndParents: parentsAndChildren.ChildAndParents,
    deleteChildAndParents: parentsAndChildren.deleteChildAndParents,
    getChildAndParents: parentsAndChildren.getChildAndParents,

    // pedigree
    getAncestry: pedigree.getAncestry,
    getDescendancy: pedigree.getDescendancy,

    // person
    Person: person.Person,
    deletePerson: person.deletePerson,
    getPerson: person.getPerson,
    getMultiPerson: person.getMultiPerson,
    getPersonWithRelationships: person.getPersonWithRelationships,
    getPersonChangeSummary: person.getPersonChangeSummary,
    getSpouses: person.getSpouses,
    getParents: person.getParents,
    getChildren: person.getChildren,

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
    getPersonSourceRefs: sources.getPersonSourceRefs,
    getSourceDescription: sources.getSourceDescription,
    getMultiSourceDescription: sources.getMultiSourceDescription,
    getCoupleSourceRefs: sources.getCoupleSourceRefs,
    getChildAndParentsSourceRefs: sources.getChildAndParentsSourceRefs,
    getSourceRefsQuery: sources.getSourceRefsQuery,

    // spouses
    Couple: spouses.Couple,
    deleteCouple: spouses.deleteCouple,
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
});
  // Ask almond to synchronously require the
  // module value here and return it as the
  // value to use for the public API for the built file.
  return require('FamilySearch');
}));
