var utils = require('./utils'),
    exports = {};

/**
 * httpWrapper function based upon request
 * https://github.com/request/request
 * @param request request library
 * @returns {Function} http function that exposes a standard interface
 */
exports.httpWrapper = function(http, client) {
  return function(method, url, headers, data, opts) {
    
    // set up the options
    opts = utils.extend({
      url: url,
      method: method,
      json: true,
      body: data
    }, opts);
    opts.headers = utils.extend({}, headers, opts.headers);

    if (opts.headers['Content-Type'] === 'multipart/form-data') {
      opts.formData = opts.body;
      delete opts.body;
      delete opts.headers['Content-Type'];
      delete opts.json;
    }
    
    // process the response
    var d = client.settings.deferredWrapper();
    var returnedPromise = d.promise;
    var statusCode = null;
    var responseHeaders = {};

    // make the call
    http(opts, function(error, response, body){
      if(response){
        if(response.headers){
          responseHeaders = response.headers;
        }
        statusCode = response.statusCode;
      }
      if(error){
        d.reject(error);
      } else if(statusCode >= 400) {
        if(body.errors){
          error = body.errors[0];
        } else {
          error = new Error('server responded with a ' + statusCode);
        }
        d.reject(error);
      } else {
        d.resolve(body);
      }
    });

    // add http-specific functions to the returned promise
    returnedPromise.getStatusCode = function() {
      return statusCode;
    };
    returnedPromise.getResponseHeader = function(header) {
      return responseHeaders[header];
    };
    returnedPromise.getAllResponseHeaders = function() {
      return responseHeaders;
    };
    returnedPromise.getRequest = function() {
      return opts;
    };
    return returnedPromise;
    
  };
};

/**
 * deferredWrapper function based upon Q's defer function
 * @param deferred Q's defer function
 * @returns {Function} deferred function that exposes a standard interface
 */
exports.deferredWrapper = function(defer) {
  return function() {
    var d = defer();
    return {
      promise: d.promise,
      resolve: d.resolve,
      reject: d.reject
    };
  };
};

module.exports = exports;