define([
  'globals',
  'helpers'
], function(globals, helpers) {
  var exports = {};

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
        responseType: method === 'POST' ? 'text' : 'json',
        data: data,
        transformRequest: function(obj) {
          return helpers.isObject(obj) && String(obj) !== '[object FormData]' ? formEncode(obj) : obj;
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
