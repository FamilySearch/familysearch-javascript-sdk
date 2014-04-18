define([
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
      // remove $... and _... attrs from data
      data = helpers.clonePartial(data, function(key) {
        return (!(helpers.isString(key) && (key.charAt(0) === '$' || key.charAt(0) === '_')));
      });
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
          helpers.log('http failure', statusCode, retries, promise.getAllResponseHeaders());
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
