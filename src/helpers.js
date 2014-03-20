define([
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
   * Sometimes FamilySearch returns a 303, which the browser follows automatically.
   * Unfortunately, chrome doesn't include the Accept header on the redirect request
   * (the spec doesn't address the point of whether the browser should include headers on redirects)
   * so data is returned in some other format, which we don't expect.
   * We try to parse the response as json and fail, so rely upon the status code
   *
   * @param {Object} promise promise for the response
   * @param {Function} resultGenerator function to generate a result
   * @returns {Object} promise for the final result
   */
  exports.handleRedirect = function(promise, resultGenerator) {
    var d = globals.deferredWrapper();
    var handler = function() {
      if (promise.getStatusCode() === 200 || promise.getStatusCode() === 204) {
        d.resolve(resultGenerator(promise));
      }
      else {
        d.reject(arguments);
      }
    };
    promise.then(handler, handler);
    return exports.extendHttpPromise(d.promise, promise);
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
