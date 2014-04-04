define([
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
          if (statusCode >= 200 && statusCode <= 299 && !jqXHR.responseText) {
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
