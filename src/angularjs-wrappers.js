var utils = require('./utils'),
    exports = {};

/**
 * httpWrapper function based upon Angular's $http function
 * @param http Angular's $http function
 * @returns {Function} http function that exposes a standard interface
 */
exports.httpWrapper = function(http, client) {
  return function(method, url, headers, data, opts) {
    // set up the options
    var config = utils.extend({
      method: method,
      url: url,
      responseType: 'json',
      data: data,
      transformRequest: function(obj) {
        return obj;
      }
    }, opts);
    config.headers = utils.extend({}, headers, opts.headers);
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      config.headers['Content-Type'] = void 0;
    }

    // make the call
    var promise = http(config);

    // process the response
    var d = client.settings.deferredWrapper();
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

module.exports = exports;