if (typeof define !== 'function') { var define = require('amdefine')(module); }

if (typeof module === 'object' && typeof module.exports === 'object') {
  
  // Include dependencies dynamically to prevent requirejs from trying
  // to load Q.js and request.js during the build
  var deps = [
    './globals',
    './helpers',
    'q',
    'request'
  ];
  
  define(deps, function(globals, helpers, Q, http) {
    
    var exports = {};

    /**
     * httpWrapper function based upon request
     * https://github.com/request/request
     * @param request request library
     * @returns {Function} http function that exposes a standard interface
     */
    exports.httpWrapper = function() {
      return function(method, url, headers, data, opts) {
        
        // set up the options
        opts = helpers.extend({
          url: url,
          method: method,
          json: true,
          body: data
        }, opts);
        opts.headers = helpers.extend({}, headers, opts.headers);

        if (opts.headers['Content-Type'] === 'multipart/form-data') {
          opts.formData = opts.body;
          delete opts.body;
          delete opts.headers['Content-Type'];
          delete opts.json;
        }
        
        // process the response
        var d = globals.deferredWrapper();
        var returnedPromise = d.promise;
        var statusCode = null;
        var responseHeaders = {};

        // make the call
        http(opts, function(error, response, body){
          if(response && response.headers){
            responseHeaders = response.headers;
          }
          if(error){
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
    exports.deferredWrapper = function() {
      return function() {
        var d = Q.defer();
        return {
          promise: d.promise,
          resolve: d.resolve,
          reject: d.reject
        };
      };
    };

    return exports;
  });
}