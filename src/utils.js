/**
 * Collection of utility functions. Only put functions in here that aren't
 * specific to the FamilySearch API (those go in helpers.js)
 */

var exports = module.exports;

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
 * simplified version of underscore's findIndex
 * returns -1 if nothing found
 * @param {Array} arr Array to search
 * @param {Object|function(elm)} objOrFn If object, look for matching object; otherwise look for function to return true
 * @param {Object=} context Object for this
 * @returns {*} Thing found
 */
exports.findIndex = function(arr, objOrFn, context) {
  var result = -1;
  var isFn = exports.isFunction(objOrFn);
  if (arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
      var elm = arr[i];
      if (isFn ? objOrFn.call(context, elm) : templateMatches(objOrFn, elm)) {
        result = i;
        break;
      }
    }
  }
  return result;
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
 *@param {Array|Object} arr Array or object to iterate over
 * @param {function(elm)} fn Function to call
 * @param {Object=} context Object for this
 * @returns {Array} Flattened array
 */
exports.flatMap = function(arr, fn, context){
  return exports.flatten(exports.map(arr, fn, context));
};

/**
 * Return found match or first if none found
 * @param {Array} arr Array to search
 * @param {Object|function(elm)} objOrFn If object, look for matching object; otherwise look for function to return true
 * @returns {*} Thing found or first element of array
 */
exports.findOrFirst = function(arr, objOrFn) {
  if (!exports.isUndefined(arr)) {
    var result = exports.find(arr, objOrFn);
    return exports.isUndefined(result) ? arr[0] : result;
  }
  return void 0;
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
 * Return an empty object if passed in a null or undefined, similar to the maybe monad
 * @param {*} value Value to test
 * @returns {*} Original value or empty object
 */
exports.maybe = function(value) {
  return value != null ? value : {}; // != null also covers undefined
};

/**
 * Search utilities
 */

var nonQueryParams = {start: true, count: true, context: true};

function quoteSearchParam(value) {
  if(!exports.isString(value)){
    return value;
  }
  value = value.replace(/[:"]/g, '').trim();
  return value.indexOf(' ') >= 0 ? '"' + value + '"' : value;
}

/**
 * Given an map of parameters, filter out non-search parameters.
 * This allows us to accept all search params in one object instead
 * of asking the user to nest the actual search query in the `q` attribute.
 */
exports.searchParamsFilter = function(params) {
  return exports.map(exports.filter(exports.keys(params), function(key) { return !nonQueryParams[key]; }),
    function(key) { return key+':'+quoteSearchParam(params[key]); }).join(' ');
};