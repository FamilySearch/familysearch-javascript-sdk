var utils = require('./utils');

/**
 * @ngdoc overview
 * @name plumbing
 * @description
 * These are the low-level "plumbing" functions. You don't normally need to use these functions.
 */

var Plumbing = function(client){
  this.client = client;
  this.helpers = client.helpers;
  this.settings = client.settings;
  this.totalProcessingTime = 0;
};

/**
 * @ngdoc function
 * @name plumbing.functions:getTotalProcessingTime
 * @function
 * @description
 * Return the total "processing time" spent in FamilySearch REST endpoints
 *
 * @return {Number} time in milliseconds
 */
Plumbing.prototype.getTotalProcessingTime = function() {
  return this.totalProcessingTime;
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
Plumbing.prototype.setTotalProcessingTime = function(time) {
  this.totalProcessingTime = time;
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
Plumbing.prototype.getUrl = function(resourceName, possibleUrl, params) {
  var self = this;
  return this.settings.discoveryPromise.then(function(discoveryResource) {
    var url = '';

    if (self.helpers.isAbsoluteUrl(possibleUrl)) {
      url = possibleUrl;
    }
    else {
      url = self.helpers.getUrlFromDiscoveryResource(discoveryResource, resourceName, params);
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
Plumbing.prototype.get = function(url, params, headers, opts, responseMapper) {
  return this.http('GET',
    this.helpers.appendQueryParameters(url, params),
    utils.extend({'Accept': 'application/x-gedcomx-v1+json'}, headers),
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
Plumbing.prototype.post = function(url, data, headers, opts, responseMapper) {
  return this.http('POST',
    url,
    utils.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers),
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
Plumbing.prototype.put = function(url, data, headers, opts, responseMapper) {
  return this.http('PUT',
    url,
    utils.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers),
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
Plumbing.prototype.del = function(url, headers, opts, responseMapper) {
  return this.http('DELETE',
    url,
    utils.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers),
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
Plumbing.prototype.transformData = function(data, contentType) {
  if (data && utils.isObject(data) && String(data) !== '[object FormData]') {
    // remove $... and _... attrs from data
    data = utils.clonePartial(data, function(key) {
      return (!(utils.isString(key) && (key.charAt(0) === '$' || key.charAt(0) === '_')));
    });
    if (contentType === 'application/x-www-form-urlencoded') {
      return formEncode(data);
    }
    else if (contentType && contentType.indexOf('json') !== -1) {
      return JSON.stringify(data);
    }
  }
  return data;
};

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
Plumbing.prototype.http = function(method, url, headers, data, opts, responseMapper, retries) {
  var d = this.settings.deferredWrapper();
  var returnedPromise = d.promise;
  var self = this;
  // prepend the server
  var absoluteUrl = this.helpers.getAPIServerUrl(url);
  headers = headers || {};
    
  // do we need to request an access token?
  var accessTokenPromise;
  if (!this.settings.accessToken &&
      this.settings.autoSignin &&
      !this.helpers.isOAuthServerUrl(absoluteUrl) &&
      url !== this.settings.discoveryUrl) {
    accessTokenPromise = this.client.getAccessToken();
  }
  else {
    accessTokenPromise = this.helpers.refPromise(this.settings.accessToken);
  }
  accessTokenPromise.then(function() {
    // append the access token as a query parameter to avoid cors pre-flight
    // this is detrimental to browser caching across sessions, which seems less bad than cors pre-flight requests
    var accessTokenName = self.helpers.isAuthoritiesServerUrl(absoluteUrl) ? 'sessionId' : 'access_token';
    if (self.settings.accessToken && absoluteUrl.indexOf(accessTokenName+'=') === -1) {
      var accessTokenParam = {};
      accessTokenParam[accessTokenName] = self.settings.accessToken;
      absoluteUrl = self.helpers.appendQueryParameters(absoluteUrl, accessTokenParam);
    }

    // default retries
    if (retries == null) { // also catches undefined
      retries = self.settings.maxHttpRequestRetries;
    }

    // call the http wrapper
    var promise = self.settings.httpWrapper(method,
      absoluteUrl,
      headers,
      self.transformData(data, headers['Content-Type']),
      opts || {});

    // process the response
    self.helpers.extendHttpPromise(returnedPromise, promise);
    promise.then(
      function(data) {
        if (method === 'GET' && promise.getStatusCode() === 204) {
          data = {}; // an empty GET response should become an empty json object
        }
        self.helpers.refreshAccessToken();
        var processingTime = promise.getResponseHeader('X-PROCESSING-TIME');
        if (processingTime) {
          self.totalProcessingTime += parseInt(processingTime,10);
        }
        if (responseMapper) {
          data = responseMapper(data, promise);
        }
        d.resolve(data);
      },
      function() {
        var statusCode = promise.getStatusCode();
        self.helpers.log('http failure', statusCode, retries, promise.getAllResponseHeaders());
        if (statusCode === 401) {
          self.helpers.eraseAccessToken();
        }
        if ((method === 'GET' && statusCode >= 500 && retries > 0) || statusCode === 429) {
          var retryAfterHeader = promise.getResponseHeader('Retry-After');
          var retryAfter = retryAfterHeader ? parseInt(retryAfterHeader,10) : self.settings.defaultThrottleRetryAfter;
          self.settings.setTimeout(function() {
            promise = self.http(method, url, headers, data, opts, responseMapper, retries-1);
            self.helpers.extendHttpPromise(returnedPromise, promise);
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

module.exports = Plumbing;
