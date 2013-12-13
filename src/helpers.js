define([
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

  // borrowed from underscore.js
  helpers.keys = Object.keys || function(obj) {
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
  // returns undefined if nothing found
  helpers.find = function(arr, objOrFn) {
    var result;
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

  // Compose functions from right to left, with each function consuming the return value of the function that follows
  // borrowed from underscore
  helpers.compose = function() {
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
  helpers.flatten = function(arr) {
    var result = [];
    helpers.forEach(arr, function(value) {
      if (helpers.isArray(value)) {
        Array.prototype.push.apply(result, value);
      }
    });
    return result;
  };

  helpers.flatMap = helpers.compose(helpers.flatten, helpers.map);

  // returns find match or first if none found
  helpers.findOrFirst = function(arr, objOrFn) {
    var result = helpers.find(arr, objOrFn);
    return helpers.isUndefined(result) ? arr[0] : result;
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

  // return an empty object if passed in a null or undefined, similar to the maybe monad
  helpers.maybe = function(value) {
    return value != null ? value : {}; // != null also covers undefined
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

  function getAbsoluteUrl(server, path) {
    if (!path.match(/^https?:\/\//)) {
      return server + (path.charAt(0) !== '/' ? '/' : '') + path;
    }
    else {
      return path;
    }
  }

  // prepend oauth server to url if url doesn't start with http(s)
  helpers.getOAuthServerUrl = function(path) {
    return getAbsoluteUrl(globals.oauthServer[globals.environment], path);
  };

  // prepend server to url if url doesn't start with http(s)
  helpers.getServerUrl = function(path) {
    return getAbsoluteUrl(globals.server[globals.environment], path);
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
